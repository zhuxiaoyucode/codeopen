const mongoose = require('mongoose');

// 数据库连接配置
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/codepen?authSource=admin';

async function setUserAsAdmin() {
  try {
    console.log('🔗 正在连接数据库...');
    
    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 导入用户模型
    const { User } = require('./backend/src/models/User');

    // 目标邮箱
    const TARGET_EMAIL = '2911872658@qq.com';

    console.log(`🔍 正在查找用户: ${TARGET_EMAIL}`);
    
    // 查找目标用户
    const targetUser = await User.findOne({ email: TARGET_EMAIL });
    
    if (!targetUser) {
      console.log(`❌ 找不到邮箱为 ${TARGET_EMAIL} 的用户`);
      console.log('💡 请先确保该邮箱已注册账号');
      
      // 显示当前所有用户
      const allUsers = await User.find({}, { email: 1, username: 1, role: 1 });
      console.log('📋 当前所有用户列表:');
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.username}) - 角色: ${user.role}`);
      });
      
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 找到用户信息:`);
    console.log(`   用户名: ${targetUser.username}`);
    console.log(`   邮箱: ${targetUser.email}`);
    console.log(`   当前角色: ${targetUser.role}`);

    // 检查是否已经是管理员
    if (targetUser.role === 'admin') {
      console.log('✅ 该用户已经是管理员，无需修改');
      await mongoose.disconnect();
      return;
    }

    // 更新为管理员角色
    targetUser.role = 'admin';
    await targetUser.save();

    console.log('✅ 用户角色已成功更新为管理员');
    console.log(`\n🎉 账号 ${TARGET_EMAIL} 现在已经是管理员了！`);
    console.log('💡 你可以使用该账号登录并访问管理后台');

    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');

  } catch (error) {
    console.error('❌ 设置管理员失败:', error);
    process.exit(1);
  }
}

setUserAsAdmin();