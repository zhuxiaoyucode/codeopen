// MongoDB查询脚本
print("=== 检查用户邮箱: 2911872658@qq.com ===");

// 切换到codepen数据库
db = db.getSiblingDB('codepen');

// 查找特定邮箱的用户
const targetUser = db.users.findOne({ email: "2911872658@qq.com" });

if (targetUser) {
    print("✅ 找到用户:");
    print("   用户名: " + targetUser.username);
    print("   邮箱: " + targetUser.email);
    print("   当前角色: " + targetUser.role);
    print("   是否激活: " + targetUser.isActive);
    
    // 如果是普通用户，更新为管理员
    if (targetUser.role === "user") {
        print("\n🔄 正在将用户设置为管理员...");
        const result = db.users.updateOne(
            { email: "2911872658@qq.com" },
            { $set: { role: "admin" } }
        );
        
        if (result.modifiedCount > 0) {
            print("✅ 成功将用户设置为管理员！");
        } else {
            print("⚠️ 用户角色更新失败");
        }
    } else {
        print("✅ 用户已经是管理员");
    }
} else {
    print("❌ 找不到邮箱为 2911872658@qq.com 的用户");
    print("\n📋 当前数据库中的所有用户:");
    
    const allUsers = db.users.find({}, { email: 1, username: 1, role: 1 }).toArray();
    if (allUsers.length > 0) {
        allUsers.forEach(user => {
            print("   - " + user.email + " (" + user.username + ") - 角色: " + user.role);
        });
    } else {
        print("   数据库中没有用户记录");
    }
}