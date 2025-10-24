import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 创建用户
    const user = new User({ username, email, password });
    await user.save();

    // 生成JWT令牌
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('注册错误:', error);
    // 处理唯一约束冲突（用户名或邮箱已存在）
    if (error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000))) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    return res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  console.log('--- 收到登录请求 /api/auth/login ---');
  try {
    const { email, password } = req.body;
    console.log(`[1/5] 请求体解析: email=${email}`);

    if (!email || !password) {
      console.error('[错误] 缺少邮箱或密码');
      return res.status(400).json({ error: '请填写邮箱和密码' });
    }

    // 查找用户
    console.log('[2/5] 正在数据库中查找用户...');
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`[错误] 用户未找到: email=${email}`);
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    console.log('[3/5] 用户查找成功: ' + user.username);

    // 验证密码
    console.log('[4/5] 正在验证密码...');
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.error('[错误] 密码验证失败');
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    console.log('[5/5] 密码验证成功');

    // 生成JWT令牌
    console.log('[+] 准备生成JWT...');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    if (!process.env.JWT_SECRET) {
      console.warn('警告: 未在.env中找到JWT_SECRET, 使用默认值');
    }
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    console.log('[+] JWT生成成功');

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('--- 登录逻辑发生严重错误 ---');
    console.error('错误名称:', error.name);
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('--- 错误详情结束 ---');
    res.status(500).json({ error: '登录失败，服务器内部错误' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

export default router;