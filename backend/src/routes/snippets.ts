import express from 'express';
const escapeHtml = require('escape-html') as (input: string) => string;
import { Snippet } from '../models/Snippet';
import { authenticateToken, AuthRequest, requireAuth } from '../middleware/auth';

const router = express.Router();

// 创建代码片段
router.post('/', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content, language, expiresIn, isPrivate, title } = req.body;

    // 验证必填字段
    if (!content) {
      return res.status(400).json({ error: '代码内容不能为空' });
    }

    // 计算过期时间
    let expiresAt: Date | null = null;
    if (expiresIn) {
      const expiresInMs = parseInt(expiresIn) * 24 * 60 * 60 * 1000; // 转换为毫秒
      expiresAt = new Date(Date.now() + expiresInMs);
    }

    // 创建片段
    const snippet = new Snippet({
      content,
      language: language || 'plaintext',
      expiresAt,
      isPrivate: isPrivate || false,
      creatorId: req.user?._id || null,
      title: title || `代码片段_${Date.now()}`
    });

    await snippet.save();

    res.status(201).json({
      message: '代码片段创建成功',
      snippet: {
        id: snippet._id,
        content: snippet.content,
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt
      }
    });
  } catch (error) {
    console.error('创建片段错误:', error);
    res.status(500).json({ error: '创建代码片段失败' });
  }
});

/**
 * 分享页（纯HTML，无需登录）
 * 仅公开且未过期的片段可查看
 */
router.get('/share/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).populate('creatorId', 'username');
    if (!snippet) {
      return res.status(404).send('<!doctype html><title>Not Found</title><h1>代码片段不存在</h1>');
    }
    // 过期检查
    if (snippet.isExpired()) {
      return res.status(410).send('<!doctype html><title>Gone</title><h1>代码片段已过期</h1>');
    }
    // 权限检查：仅公开片段允许分享页查看
    if (snippet.isPrivate) {
      return res.status(403).send('<!doctype html><title>Forbidden</title><h1>此片段为私密，无法公开查看</h1>');
    }

    const title = escapeHtml(snippet.title || '未命名片段');
    const lang = escapeHtml(snippet.language);
    const content = escapeHtml(snippet.content);

    const html = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - CodeShare</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', 'Microsoft Yahei', Arial, sans-serif; margin: 0; padding: 24px; background: #f7f7f7; }
  .container { max-width: 900px; margin: 0 auto; }
  .card { background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); padding: 20px; }
  h1 { margin: 0 0 8px; font-size: 22px; }
  .meta { color: #666; margin-bottom: 12px; }
  pre { background: #282c34; color: #fff; padding: 16px; border-radius: 6px; overflow: auto; line-height: 1.5; }
  code { font-family: Menlo, Monaco, Consolas, 'Courier New', monospace; font-size: 14px; }
</style>
<div class="container">
  <div class="card">
    <h1>${title}</h1>
    <div class="meta">语言：${lang} · 状态：有效 · 类型：公开</div>
    <pre><code>${content}</code></pre>
  </div>
</div>
</html>`;
    res.status(200).send(html);
  } catch (error) {
    console.error('分享页错误:', error);
    res.status(500).send('<!doctype html><title>Error</title><h1>服务器错误</h1>');
  }
});

/**
 * 获取用户代码片段列表（放在 /:id 之前，避免被通配路由吞掉）
 */
router.get('/user/:userId', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // 只能查看自己的片段
    if (!req.user || userId !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权限查看此用户的片段' });
    }

    const snippets = await Snippet.find({ creatorId: userId })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'username')
      .select('_id content language expiresAt isPrivate title createdAt creatorId');

    res.json({
      snippets: snippets.map(snippet => ({
        id: snippet._id,
        content: snippet.content.substring(0, 200) + (snippet.content.length > 200 ? '...' : ''), // 预览内容
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt,
        creator: snippet.creatorId ? { _id: (snippet.creatorId as any)._id, username: (snippet.creatorId as any).username } : null, // 替换 creatorId
        isExpired: snippet.isExpired()
      }))
    });
  } catch (error) {
    console.error('获取用户片段列表错误:', error);
    res.status(500).json({ error: '获取片段列表失败' });
  }
});

/**
 * 获取当前登录用户的代码片段列表（快捷接口）
 */
router.get('/my', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user._id.toString();
    const snippets = await Snippet.find({ creatorId: userId })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'username')
      .select('_id content language expiresAt isPrivate title createdAt creatorId');

    res.json({
      snippets: snippets.map(snippet => ({
        id: snippet._id,
        content: snippet.content.substring(0, 200) + (snippet.content.length > 200 ? '...' : ''), // 预览内容
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt,
        creator: snippet.creatorId ? { _id: (snippet.creatorId as any)._id, username: (snippet.creatorId as any).username } : null, // 替换 creatorId
        isExpired: snippet.isExpired()
      }))
    });
  } catch (error) {
    console.error('获取我的片段列表错误:', error);
    res.status(500).json({ error: '获取片段列表失败' });
  }
});

/**
 * 浏览公开片段（分页）
 * 仅返回未过期的公开片段，按创建时间倒序
 * 查询参数：page（默认1）、pageSize（默认10）
 */
router.get('/public', async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const skip = Math.max(0, (page - 1) * pageSize);
    const now = new Date();

    const query = {
      isPrivate: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    };

    const [items, total] = await Promise.all([
      Snippet.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('creatorId', 'username') // 关联查询创建者信息
        .select('_id content language expiresAt isPrivate title createdAt creatorId'),
      Snippet.countDocuments(query)
    ]);

    res.json({
      page,
      pageSize,
      total,
      snippets: items.map(snippet => ({
        id: snippet._id,
        content: snippet.content.substring(0, 200) + (snippet.content.length > 200 ? '...' : ''),
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt,
        creator: snippet.creatorId ? { _id: (snippet.creatorId as any)._id, username: (snippet.creatorId as any).username } : null, // 替换 creatorId
        isExpired: snippet.isExpired()
      }))
    });
  } catch (error) {
    console.error('获取公开片段列表错误:', error);
    res.status(500).json({ error: '获取公开片段列表失败' });
  }
});

// 获取代码片段详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).populate('creatorId', 'username');
    
    if (!snippet) {
      return res.status(404).json({ error: '代码片段不存在' });
    }

    // 检查是否过期
    if (snippet.isExpired()) {
      return res.status(410).json({ error: '代码片段已过期' });
    }

    // 检查访问权限
    if (snippet.isPrivate) {
      if (!req.user || snippet.creatorId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: '无权限访问此片段' });
      }
    }

    res.json({
      snippet: {
        id: snippet._id,
        content: snippet.content,
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt,
        creator: snippet.creatorId ? { _id: (snippet.creatorId as any)._id, username: (snippet.creatorId as any).username } : null
      }
    });
  } catch (error) {
    console.error('获取片段错误:', error);
    res.status(500).json({ error: '获取代码片段失败' });
  }
});

// 获取用户代码片段列表
router.get('/user/:userId', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    
    // 只能查看自己的片段
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权限查看此用户的片段' });
    }

    const snippets = await Snippet.find({ creatorId: userId })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'username')
      .select('_id content language expiresAt isPrivate title createdAt creatorId');

    res.json({
      snippets: snippets.map(snippet => ({
        id: snippet._id,
        content: snippet.content.substring(0, 200) + (snippet.content.length > 200 ? '...' : ''), // 预览内容
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt,
        creator: snippet.creatorId ? { _id: (snippet.creatorId as any)._id, username: (snippet.creatorId as any).username } : null, // 替换 creatorId
        isExpired: snippet.isExpired()
      }))
    });
  } catch (error) {
    console.error('获取用户片段列表错误:', error);
    res.status(500).json({ error: '获取片段列表失败' });
  }
});

// 更新代码片段
router.put('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).populate('creatorId', 'username');
    
    if (!snippet) {
      return res.status(404).json({ error: '代码片段不存在' });
    }

    // 检查权限
    console.log('权限验证调试信息:', {
      snippetCreatorId: snippet.creatorId,
      snippetCreatorIdString: snippet.creatorId?._id?.toString(),
      reqUserId: req.user._id,
      reqUserIdString: req.user._id.toString(),
      areEqual: snippet.creatorId?._id?.toString() === req.user._id.toString()
    });
    
    if (!snippet.creatorId) {
      return res.status(403).json({ error: '匿名创建的片段无法修改' });
    }
    if (snippet.creatorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权限修改此片段' });
    }

    const { content, language, expiresIn, isPrivate, title } = req.body;

    // 更新字段
    if (content !== undefined) snippet.content = content;
    if (language !== undefined) snippet.language = language;
    if (isPrivate !== undefined) snippet.isPrivate = isPrivate;
    if (title !== undefined) snippet.title = title;

    // 更新过期时间
    if (expiresIn !== undefined) {
      snippet.expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;
    }

    await snippet.save();

    res.json({
      message: '代码片段更新成功',
      snippet: {
        id: snippet._id,
        content: snippet.content,
        language: snippet.language,
        expiresAt: snippet.expiresAt,
        isPrivate: snippet.isPrivate,
        title: snippet.title,
        createdAt: snippet.createdAt
      }
    });
  } catch (error) {
    console.error('更新片段错误:', error);
    res.status(500).json({ error: '更新代码片段失败' });
  }
});

// 删除代码片段
router.delete('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).populate('creatorId', 'username');
    
    if (!snippet) {
      return res.status(404).json({ error: '代码片段不存在' });
    }

    // 检查权限
    console.log('删除权限验证调试信息:', {
      snippetCreatorId: snippet.creatorId,
      snippetCreatorIdString: snippet.creatorId?._id?.toString(),
      reqUserId: req.user._id,
      reqUserIdString: req.user._id.toString(),
      areEqual: snippet.creatorId?._id?.toString() === req.user._id.toString()
    });
    
    if (!snippet.creatorId) {
      return res.status(403).json({ error: '匿名创建的片段无法删除' });
    }
    if (snippet.creatorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权限删除此片段' });
    }

    await Snippet.findByIdAndDelete(req.params.id);

    res.json({ message: '代码片段删除成功' });
  } catch (error) {
    console.error('删除片段错误:', error);
    res.status(500).json({ error: '删除代码片段失败' });
  }
});

export default router;