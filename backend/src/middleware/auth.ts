import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends express.Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest, 
  res: express.Response, 
  next: express.NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      req.user = null;
      return next();
    }

    // 清理token中的空格和特殊字符
    const cleanToken = token.trim();
    
    // 检查token格式是否正确（JWT通常由三部分组成，用点分隔）
    if (!cleanToken.includes('.') || cleanToken.split('.').length !== 3) {
      console.error('Token格式错误，token:', cleanToken.substring(0, 50) + '...');
      req.user = null;
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as any;
    
    // 对于需要密码验证的路由，我们需要包含密码字段
    // 这里我们检查请求路径，如果是密码修改相关路由，就包含密码字段
    const needsPassword = req.path.includes('/change-password');
    const user = await User.findById(decoded.userId).select(needsPassword ? '' : '-password');
    
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token验证错误:', error);
    req.user = null;
    next();
  }
};

export const requireAuth = (
  req: AuthRequest, 
  res: express.Response, 
  next: express.NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: '需要登录' });
    return;
  }
  next();
};

export const requireAdmin = (
  req: AuthRequest, 
  res: express.Response, 
  next: express.NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: '需要登录' });
    return;
  }
  
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: '需要管理员权限' });
    return;
  }
  
  next();
};

// 组合中间件
export const authMiddleware = [authenticateToken, requireAuth];
export const adminMiddleware = [authenticateToken, requireAuth, requireAdmin];