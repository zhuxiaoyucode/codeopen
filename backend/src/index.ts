import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import snippetRoutes from './routes/snippets';
import chatRoutes from './routes/chat';
import avatarRoutes from './routes/avatar';
import adminRoutes from './routes/admin';
import proxyRoutes from './routes/proxy';
import { setupSocketServer } from './services/socket';
import { userAutoEnableService } from './services/userAutoEnableService';

import path from 'path';

// 显式加载 .env 文件
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Authorization','Content-Type']
}));

// 速率限制 - 开发环境放宽限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5000, // 开发环境放宽到5000个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 沙盒API使用更宽松的限制
const sandboxLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100 // 开发环境放宽到100个沙盒请求
});

app.use(generalLimiter);
// 沙盒路由使用特殊限制
app.use('/api/sandbox', sandboxLimiter);

// 头像API使用更宽松的限制
const avatarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 50 // 开发环境放宽到50个头像相关请求
});
app.use('/api/avatar', avatarLimiter);

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proxy', proxyRoutes);

// 静态文件服务 - 提供头像文件访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// 额外的头像静态文件服务，确保avatars子目录也能访问
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));
import sandboxRoutes from './routes/sandbox';
app.use('/api/sandbox', sandboxRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message 
  });
});

// 启动服务器
const startServer = async () => {
  try {
    await connectDatabase();

    // 创建HTTP服务器并设置Socket.IO
    const httpServer = createServer(app);
    setupSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 服务器启动成功，端口: ${PORT}`);
      console.log(`📡 Socket.IO 服务已启动`);
      
      // 启动用户自动解禁服务
      userAutoEnableService.start();
      console.log(`🔧 用户自动解禁服务已启动`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();