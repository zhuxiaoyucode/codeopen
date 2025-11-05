// 直接修复用户角色字段
const { MongoClient } = require('mongodb');

async function fixUserRole() {
  const uri = 'mongodb://admin:password123@localhost:27017/codepen?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 成功连接到MongoDB');

    const database = client.db('codepen');
    const users = database.collection('users');

    // 查找目标用户
    const targetEmail = '2911872658@qq.com';
    const user = await users.findOne({ email: targetEmail });

    if (user) {
      console.log('✅ 找到用户:', targetEmail);
      console.log('当前用户数据:', JSON.stringify(user, null, 2));

      // 更新用户角色
      const result = await users.updateOne(
        { email: targetEmail },
        { $set: { role: 'admin' } }
      );

      console.log('✅ 更新结果:', result);

      // 验证更新
      const updatedUser = await users.findOne({ email: targetEmail });
      console.log('✅ 更新后用户数据:', JSON.stringify(updatedUser, null, 2));
    } else {
      console.log('❌ 找不到用户:', targetEmail);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('✅ 数据库连接已关闭');
  }
}

fixUserRole();