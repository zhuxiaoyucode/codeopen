const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 管理员账号配置
const ADMIN_CONFIG = {
  username: 'admin',
  email: 'admin@codepen.com',
  password: 'admin123456',
  role: 'admin'
};

async function createAdminUser() {
  try {
    // 连接数据库
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codepen';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 导入用户模型
    const { User } = require('../src/models/User');

    // 检查是否已存在管理员账号
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在，跳过创建');
      console.log(`   用户名: ${existingAdmin.username}`);
      console.log(`   邮箱: ${existingAdmin.email}`);
      await mongoose.disconnect();
      return;
    }

    // 检查是否已存在相同用户名或邮箱
    const existingUser = await User.findOne({
      $or: [
        { username: ADMIN_CONFIG.username },
        { email: ADMIN_CONFIG.email }
      ]
    });

    if (existingUser) {
      console.log('⚠️  用户名或邮箱已存在，将更新为管理员角色');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ 用户角色已更新为管理员');
    } else {
      // 创建新管理员账号
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
      
      const adminUser = new User({
        username: ADMIN_CONFIG.username,
        email: ADMIN_CONFIG.email,
        password: hashedPassword,
        role: ADMIN_CONFIG.role,
        isActive: true
      });

      await adminUser.save();
      console.log('✅ 管理员账号创建成功');
    }

    console.log('\n📋 管理员账号信息:');
    console.log(`   用户名: ${ADMIN_CONFIG.username}`);
    console.log(`   邮箱: ${ADMIN_CONFIG.email}`);
    console.log(`   密码: ${ADMIN_CONFIG.password}`);
    console.log('\n⚠️  请及时修改默认密码！');

    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');

  } catch (error) {
    console.error('❌ 创建管理员账号失败:', error);
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };