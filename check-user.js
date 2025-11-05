// 简单的MongoDB连接脚本
const { MongoClient } = require('mongodb');

async function checkUser() {
  const uri = 'mongodb://admin:password123@localhost:27017/codepen?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 成功连接到MongoDB');

    const database = client.db('codepen');
    const users = database.collection('users');

    // 检查目标邮箱
    const targetEmail = '2911872658@qq.com';
    const user = await users.findOne({ email: targetEmail });

    if (user) {
      console.log(`✅ 找到用户: ${targetEmail}`);
      console.log('用户信息:', {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });

      // 如果是普通用户，更新为管理员
      if (user.role === 'user') {
        const result = await users.updateOne(
          { email: targetEmail },
          { $set: { role: 'admin' } }
        );
        
        if (result.modifiedCount > 0) {
          console.log('✅ 成功将用户设置为管理员');
        } else {
          console.log('⚠️ 用户角色更新失败');
        }
      } else {
        console.log('✅ 用户已经是管理员');
      }
    } else {
      console.log(`❌ 找不到邮箱为 ${targetEmail} 的用户`);
      
      // 显示所有用户
      const allUsers = await users.find({}, { projection: { email: 1, username: 1, role: 1 } }).toArray();
      console.log('📋 当前数据库中的所有用户:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.username}) - 角色: ${u.role}`);
      });
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('✅ 数据库连接已关闭');
  }
}

checkUser();