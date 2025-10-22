import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      // 开发兜底：使用内存 MongoDB，避免本地未安装 Mongo 导致“拒绝连接”
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri('codeshare');
      await mongoose.connect(memUri);
      console.log('✅ 已使用 mongodb-memory-server 启动内存数据库');
    } else {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB连接成功');
    }
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
};

export default mongoose;