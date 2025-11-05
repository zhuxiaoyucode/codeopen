import express from 'express';
import { User } from '../models/User';
import { Snippet } from '../models/Snippet';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// 获取管理员仪表板统计数据
router.get('/dashboard/stats', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSnippets = await Snippet.countDocuments();
    const publicSnippets = await Snippet.countDocuments({ isPrivate: false });
    const privateSnippets = await Snippet.countDocuments({ isPrivate: true });
    
    // 获取最近7天的用户注册统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // 获取热门编程语言统计
    const languageStats = await Snippet.aggregate([
      { $match: { language: { $ne: null } } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalSnippets,
        publicSnippets,
        privateSnippets,
        recentUsers,
        languageStats
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// 获取用户列表
router.get('/users', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 更新用户状态
router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { isActive, disableDays } = req.body;
    
    let updateData: any = { isActive };
    
    // 如果禁用用户，设置禁用时间
    if (!isActive && disableDays && disableDays > 0) {
      const disableUntil = new Date();
      disableUntil.setDate(disableUntil.getDate() + disableDays);
      updateData.disabledUntil = disableUntil;
    } else if (isActive) {
      // 如果启用用户，清除禁用时间
      updateData.disabledUntil = null;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    let message = `用户已${isActive ? '启用' : '禁用'}`;
    if (!isActive && disableDays && disableDays > 0) {
      message += `，将在 ${disableDays} 天后自动解禁`;
    }
    
    res.json({
      success: true,
      data: user,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 更新用户角色
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: `用户角色已更新为${role === 'admin' ? '管理员' : '普通用户'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
});

// 创建管理员账号（仅限超级管理员使用）
router.post('/users/create-admin', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 创建管理员用户
    const adminUser = new User({ 
      username, 
      email, 
      password,
      role: 'admin' 
    });
    await adminUser.save();

    res.status(201).json({
      success: true,
      message: '管理员账号创建成功',
      data: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error: any) {
    console.error('创建管理员账号错误:', error);
    
    // 处理唯一约束冲突
    if (error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000))) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '创建管理员账号失败'
    });
  }
});

// 获取代码片段列表（管理员视图）
router.get('/snippets', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', language = '' } = req.query;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'public') {
      query.isPrivate = false;
    } else if (status === 'private') {
      query.isPrivate = true;
    }
    
    if (language) {
      query.language = language;
    }
    
    const snippets = await Snippet.find(query)
      .populate('creatorId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Snippet.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        snippets,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取代码片段列表失败'
    });
  }
});

// 删除代码片段（管理员权限）
router.delete('/snippets/:id', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: '代码片段不存在'
      });
    }
    
    res.json({
      success: true,
      message: '代码片段已删除'
    });
  } catch (error) {
    console.error('删除代码片段错误:', error);
    res.status(500).json({
      success: false,
      message: '删除代码片段失败'
    });
  }
});

// 手动触发用户自动解禁检查
router.post('/users/auto-enable-check', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { userAutoEnableService } = await import('../services/userAutoEnableService');
    const enabledCount = await userAutoEnableService.manualCheck();
    
    res.json({
      success: true,
      message: `已检查并自动解禁 ${enabledCount} 个用户`,
      data: { enabledCount }
    });
  } catch (error) {
    console.error('手动触发用户解禁检查错误:', error);
    res.status(500).json({
      success: false,
      message: '手动检查失败'
    });
  }
});

// 手动触发用户自动解禁检查
router.post('/users/auto-enable-check', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { userAutoEnableService } = await import('../services/userAutoEnableService');
    const enabledCount = await userAutoEnableService.manualCheck();
    
    res.json({
      success: true,
      message: `已检查并自动解禁 ${enabledCount} 个用户`,
      data: { enabledCount }
    });
  } catch (error) {
    console.error('手动触发用户解禁检查错误:', error);
    res.status(500).json({
      success: false,
      message: '手动检查失败'
    });
  }
});

// 获取系统日志（简化版）
router.get('/logs', authMiddleware, adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    // 这里可以集成真实的日志系统
    // 目前返回模拟数据
    const logs = [
      {
        id: 1,
        level: 'info',
        message: '系统启动成功',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        level: 'info',
        message: '新用户注册：testuser',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取系统日志失败'
    });
  }
});

export default router;