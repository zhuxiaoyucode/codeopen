import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';


import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import snippetRoutes from './routes/snippets';
import chatRoutes from './routes/chat';
import avatarRoutes from './routes/avatar';

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

// 速率限制 - 沙盒API特殊处理
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 增加限制到1000个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 沙盒API使用更宽松的限制
const sandboxLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30 // 每分钟最多30个沙盒请求
});

app.use(generalLimiter);
// 沙盒路由使用特殊限制
app.use('/api/sandbox', sandboxLimiter);

// 头像API使用更宽松的限制
const avatarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 20 // 每分钟最多20个头像相关请求
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

// 静态文件服务 - 提供头像文件访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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

    app.listen(PORT, () => {
      // 服务器启动成功
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();