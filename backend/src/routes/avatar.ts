import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 上传新头像
router.post('/upload', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的头像文件' });
    }

    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    // 生成头像URL（相对路径，前端需要拼接完整URL）
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 将当前头像添加到历史记录（如果存在）
    if (user.avatar) {
      // 避免重复添加相同的头像
      if (!user.avatarHistory.includes(user.avatar)) {
        user.avatarHistory.push(user.avatar);
        // 限制历史记录数量（最多10个）
        if (user.avatarHistory.length > 10) {
          user.avatarHistory = user.avatarHistory.slice(-10);
        }
      }
    }

    // 更新当前头像
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: '头像上传成功',
      avatar: avatarUrl,
      avatarHistory: user.avatarHistory
    });
  } catch (error: any) {
    console.error('头像上传错误:', error);
    
    // 如果是multer错误
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小不能超过5MB' });
    }
    
    res.status(500).json({ error: '头像上传失败' });
  }
});

// 获取用户头像历史记录
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      currentAvatar: user.avatar,
      avatarHistory: user.avatarHistory
    });
  } catch (error) {
    console.error('获取头像历史记录错误:', error);
    res.status(500).json({ error: '获取头像历史记录失败' });
  }
});

// 选择历史头像作为当前头像
router.post('/select', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: '请选择头像' });
    }

    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证头像URL是否在历史记录中
    if (!user.avatarHistory.includes(avatarUrl) && user.avatar !== avatarUrl) {
      return res.status(400).json({ error: '无效的头像选择' });
    }

    // 更新当前头像
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: '头像切换成功',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('切换头像错误:', error);
    res.status(500).json({ error: '切换头像失败' });
  }
});

// 删除历史头像
router.delete('/history/:avatarUrl', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { avatarUrl } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除当前正在使用的头像
    if (user.avatar === avatarUrl) {
      return res.status(400).json({ error: '不能删除当前正在使用的头像' });
    }

    // 从历史记录中移除
    user.avatarHistory = user.avatarHistory.filter(url => url !== avatarUrl);
    await user.save();

    // 删除物理文件
    const filename = path.basename(avatarUrl);
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: '头像删除成功',
      avatarHistory: user.avatarHistory
    });
  } catch (error) {
    console.error('删除头像错误:', error);
    res.status(500).json({ error: '删除头像失败' });
  }
});

export default router;