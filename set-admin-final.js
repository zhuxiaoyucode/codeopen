// 设置用户为管理员
print("=== 设置用户为管理员 ===");

// 切换到正确的数据库
db = db.getSiblingDB('codeshare');

// 查找目标用户
const targetUser = db.users.findOne({ username: "123", email: "2911872658@qq.com" });

if (targetUser) {
    print("✅ 找到目标用户:");
    print("   用户名: " + targetUser.username);
    print("   邮箱: " + targetUser.email);
    print("   当前角色: " + (targetUser.role || "未设置"));
    
    // 更新为管理员角色
    const result = db.users.updateOne(
        { username: "123", email: "2911872658@qq.com" },
        { $set: { role: "admin" } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ 成功将用户设置为管理员！");
        
        // 验证更新结果
        const updatedUser = db.users.findOne({ username: "123" });
        print("\n📋 更新后的用户信息:");
        print("   用户名: " + updatedUser.username);
        print("   邮箱: " + updatedUser.email);
        print("   角色: " + updatedUser.role);
        
        print("\n🎉 恭喜！你的账号现在已经是管理员了！");
        print("💡 你可以使用该账号登录并访问管理后台功能");
    } else {
        print("⚠️ 用户角色更新失败");
    }
} else {
    print("❌ 找不到目标用户");
}