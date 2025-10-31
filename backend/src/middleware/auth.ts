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

    const JWT_SECRET = process.env.JWT_SECRET || 'dev-default-jwt-secret';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
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