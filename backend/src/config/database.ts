import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI 未配置，生产环境禁止使用内存数据库');
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