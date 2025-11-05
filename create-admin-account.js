// 创建管理员账号脚本
print("=== 创建管理员账号 2911872658@qq.com ===");

// 切换到codeshare数据库
db = db.getSiblingDB('codeshare');

// 检查用户是否已存在
const existingUser = db.users.findOne({ email: "2911872658@qq.com" });

if (existingUser) {
    print("✅ 用户已存在:");
    print("   用户名: " + existingUser.username);
    print("   邮箱: " + existingUser.email);
    print("   当前角色: " + existingUser.role);
    
    // 如果还不是管理员，更新为管理员
    if (existingUser.role !== "admin") {
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
    print("\n🔄 创建新的管理员账号...");
    
    // 创建新用户
    const newUser = {
        username: "admin",
        email: "2911872658@qq.com",
        password: "$2b$10$exampleHash", // 密码将在后端注册时设置
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = db.users.insertOne(newUser);
    
    if (result.insertedId) {
        print("✅ 成功创建管理员账号！");
        print("   用户ID: " + result.insertedId);
        print("   用户名: " + newUser.username);
        print("   邮箱: " + newUser.email);
        print("   角色: " + newUser.role);
    } else {
        print("❌ 创建管理员账号失败");
    }
}

// 显示所有用户
print("\n📋 当前数据库中的所有用户:");
const allUsers = db.users.find({}, { email: 1, username: 1, role: 1, isActive: 1 }).toArray();
if (allUsers.length > 0) {
    allUsers.forEach((user, index) => {
        print("   " + (index + 1) + ". " + user.username + " (" + user.email + ") - 角色: " + user.role + " - 激活: " + user.isActive);
    });
} else {
    print("   数据库中没有用户记录");
}