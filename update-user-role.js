const mongoose = require('mongoose');

// MongoDB连接配置
const MONGODB_URI = 'mongodb://root:123456@localhost:27017/codeshare?authSource=admin';

async function updateUserRole() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 获取用户模型
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

    // 更新用户角色
    const result = await User.updateOne(
      { email: '2911872658@qq.com' },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount > 0) {
      console.log('用户角色更新成功！');
      
      // 验证更新
      const user = await User.findOne({ email: '2911872658@qq.com' });
      console.log('更新后的用户信息:', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('用户角色已是最新状态，无需更新');
    }

  } catch (error) {
    console.error('更新失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateUserRole();