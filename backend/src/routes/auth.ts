import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
        email: user.email,
        avatar: user.avatar
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
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
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
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

// 邮箱验证码存储（生产环境应该使用Redis）
const emailVerificationCodes = new Map();

// 发送邮箱验证码
router.post('/send-verification-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }

    // 检查邮箱是否已注册
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: '该邮箱未注册' });
    }

    // 生成6位数字验证码（确保为字符串并去除空格）
    const code = Math.floor(100000 + Math.random() * 900000).toString().trim();
    
    // 存储验证码，有效期10分钟
    emailVerificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10分钟
    });
    console.log('生成的验证码:', code);

    // 导入邮件服务
    const { sendVerificationCodeEmail } = await import('../services/emailService');
    
    // 发送验证码邮件
    const emailSent = await sendVerificationCodeEmail(email, code);
    
    if (emailSent) {
      res.json({
        message: '验证码已发送到您的邮箱',
        code: process.env.NODE_ENV === 'development' ? code : undefined // 开发环境返回验证码用于测试
      });
    } else {
      res.status(500).json({ error: '发送验证码失败，请稍后重试' });
    }
  } catch (error) {
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// 验证邮箱验证码
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '请填写邮箱和验证码' });
    }

    // 验证验证码
    const verificationData = emailVerificationCodes.get(email);
    if (!verificationData) {
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    if (verificationData.expiresAt < Date.now()) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({ error: '验证码已过期' });
    }

    const userInputCode = String(code).trim();
    console.log('[验证码验证] 邮箱:', email, {
      存储的验证码: verificationData.code,
      用户输入的验证码: userInputCode,
      是否匹配: verificationData.code === userInputCode,
      当前时间: new Date().toISOString(),
      过期时间: new Date(verificationData.expiresAt).toISOString()
    });
    
    if (verificationData.code !== userInputCode) {
      return res.status(400).json({ error: '验证码错误' });
    }

    res.json({ message: '验证码验证成功', verified: true });
  } catch (error) {
    console.error('验证码验证错误:', error);
    res.status(500).json({ error: '验证码验证失败' });
  }
});

// 验证邮箱验证码并修改密码
router.post('/reset-password-with-code', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    // 验证验证码
    const verificationData = emailVerificationCodes.get(email);
    if (!verificationData) {
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    if (verificationData.expiresAt < Date.now()) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({ error: '验证码已过期' });
    }

    const userInputCode = String(code).trim();
    console.log('[验证码验证] 邮箱:', email, {
      存储的验证码: verificationData.code,
      用户输入的验证码: userInputCode,
      是否匹配: verificationData.code === userInputCode,
      当前时间: new Date().toISOString(),
      过期时间: new Date(verificationData.expiresAt).toISOString()
    });
    if (verificationData.code !== userInputCode) {
      return res.status(400).json({ error: '验证码错误' });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 删除已使用的验证码
    emailVerificationCodes.delete(email);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 修改当前用户信息（需要登录）
router.put('/update-profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { username } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: '用户名长度至少3位' });
    }

    if (username.trim().length > 30) {
      return res.status(400).json({ error: '用户名长度不能超过30位' });
    }

    const trimmedUsername = username.trim();

    // 检查用户名是否已被其他用户使用
    const existingUser = await User.findOne({ 
      username: trimmedUsername, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名已被使用' });
    }

    // 更新用户名
    req.user.username = trimmedUsername;
    await req.user.save();

    res.json({ 
      message: '用户名修改成功',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error: any) {
    console.error('修改用户名错误:', error);
    
    // 处理唯一约束冲突
    if (error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000))) {
      return res.status(400).json({ error: '用户名已被使用' });
    }
    
    res.status(500).json({ error: '修改用户名失败' });
  }
});

// 修改当前用户密码（需要登录）
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: '请输入当前密码' });
    }

    if (!req.user) {
      console.error('用户未登录或认证失败');
      return res.status(401).json({ error: '未登录' });
    }

    // 验证当前密码
    const isValidPassword = await req.user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: '当前密码错误，请检查输入或联系管理员' });
    }

    // 如果没有提供新密码或新密码为空，说明只是验证当前密码
    if (!newPassword || newPassword.trim() === '') {
      return res.json({ message: '密码验证成功', verified: true });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度至少6位' });
    }

    // 更新密码
    req.user.password = newPassword;
    try {
      await req.user.save();
      res.json({ message: '密码修改成功' });
    } catch (saveError: any) {
      res.status(500).json({ error: '数据库保存失败，请检查密码加密逻辑' });
    }
  } catch (error: any) {
    res.status(500).json({ error: '修改密码失败，服务器内部错误' });
  }
});

export default router;