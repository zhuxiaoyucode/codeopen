const mongoose = require('mongoose');

async function createAdminUser() {
  try {
    // 连接到MongoDB
    await mongoose.connect('mongodb://admin:password123@localhost:27017/codepen?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ 成功连接到MongoDB');
    
    // 导入User模型
    const User = require('./backend/src/models/User').User;
    
    // 检查是否已存在管理员用户
    const existingAdmin = await User.findOne({ email: '2911872658@qq.com' });
    
    if (existingAdmin) {
      console.log('✅ 管理员用户已存在，更新为管理员角色');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    } else {
      // 创建新的管理员用户
      const adminUser = new User({
        username: 'admin',
        email: '2911872658@qq.com',
        password: 'admin123456', // 这个会被bcrypt加密
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ 成功创建管理员用户');
    }
    
    // 验证用户创建
    const adminUsers = await User.find({ role: 'admin' });
    console.log('📋 管理员用户列表:');
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - 角色: ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

createAdminUser();