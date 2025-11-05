// 使用后端现有的MongoDB连接来更新用户角色
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function fixUserRole() {
  try {
    // 使用后端现有的数据库连接
    const MONGODB_URI = 'mongodb://root:123456@localhost:27017/codeshare?authSource=admin';
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 更新用户角色
    const result = await User.updateOne(
      { email: '2911872658@qq.com' },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ 用户角色更新成功！');
      
      // 验证更新
      const user = await User.findOne({ email: '2911872658@qq.com' });
      console.log('📊 更新后的用户信息:', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('ℹ️ 用户角色已是最新状态，无需更新');
    }

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 断开MongoDB连接');
  }
}

fixUserRole();