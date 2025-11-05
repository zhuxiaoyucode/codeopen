// 详细检查用户数据
print("=== 详细检查用户数据 ===");

// 切换到codepen数据库
db = db.getSiblingDB('codepen');

// 检查所有集合
print("📋 数据库中的所有集合:");
const collections = db.getCollectionNames();
collections.forEach(coll => {
    print("   - " + coll);
});

// 检查users集合是否存在
if (collections.includes('users')) {
    print("\n🔍 检查users集合中的用户数据:");
    
    // 查找昵称为"123"的用户
    const userByUsername = db.users.findOne({ username: "123" });
    if (userByUsername) {
        print("✅ 找到昵称为'123'的用户:");
        print("   用户名: " + userByUsername.username);
        print("   邮箱: " + userByUsername.email);
        print("   角色: " + userByUsername.role);
        print("   是否激活: " + userByUsername.isActive);
        print("   创建时间: " + userByUsername.createdAt);
    } else {
        print("❌ 找不到昵称为'123'的用户");
    }
    
    // 查找邮箱为2911872658@qq.com的用户
    const userByEmail = db.users.findOne({ email: "2911872658@qq.com" });
    if (userByEmail) {
        print("\n✅ 找到邮箱为'2911872658@qq.com'的用户:");
        print("   用户名: " + userByEmail.username);
        print("   邮箱: " + userByEmail.email);
        print("   角色: " + userByEmail.role);
        print("   是否激活: " + userByEmail.isActive);
        print("   创建时间: " + userByEmail.createdAt);
    } else {
        print("\n❌ 找不到邮箱为'2911872658@qq.com'的用户");
    }
    
    // 显示所有用户
    print("\n📋 users集合中的所有用户:");
    const allUsers = db.users.find().toArray();
    if (allUsers.length > 0) {
        allUsers.forEach((user, index) => {
            print("   " + (index + 1) + ". " + user.username + " (" + user.email + ") - 角色: " + user.role);
        });
    } else {
        print("   users集合为空");
    }
    
    // 检查users集合的文档数量
    const userCount = db.users.countDocuments();
    print("\n📊 users集合中的文档数量: " + userCount);
    
} else {
    print("❌ users集合不存在");
}

// 检查数据库统计信息
print("\n📊 数据库统计信息:");
const stats = db.stats();
print("   数据库名称: " + stats.db);
print("   集合数量: " + stats.collections);
print("   文档总数: " + stats.objects);
print("   数据大小: " + stats.dataSize + " bytes");