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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成JWT令牌
    const JWT_SECRET_LOGIN = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET_LOGIN, 
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
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