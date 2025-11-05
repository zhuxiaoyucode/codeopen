// 检查所有数据库
print("=== 检查所有数据库和集合 ===");

// 获取所有数据库列表
const databases = db.adminCommand('listDatabases');
print("📋 所有数据库列表:");
databases.databases.forEach(dbInfo => {
    print("   - " + dbInfo.name + " (大小: " + dbInfo.sizeOnDisk + " bytes)");
});

// 检查每个数据库中的集合
print("\n🔍 检查每个数据库的集合:");
databases.databases.forEach(dbInfo => {
    const dbName = dbInfo.name;
    if (dbName !== 'admin' && dbName !== 'local' && dbName !== 'config') {
        print("\n📊 数据库: " + dbName);
        const currentDB = db.getSiblingDB(dbName);
        const collections = currentDB.getCollectionNames();
        
        if (collections.length > 0) {
            collections.forEach(coll => {
                print("   - 集合: " + coll);
                
                // 如果是users集合，检查内容
                if (coll === 'users') {
                    const userCount = currentDB[coll].countDocuments();
                    print("     文档数量: " + userCount);
                    
                    // 查找昵称为"123"的用户
                    const user123 = currentDB[coll].findOne({ username: "123" });
                    if (user123) {
                        print("     ✅ 找到昵称为'123'的用户");
                        print("        邮箱: " + user123.email);
                        print("        角色: " + user123.role);
                    }
                    
                    // 查找邮箱为2911872658@qq.com的用户
                    const userEmail = currentDB[coll].findOne({ email: "2911872658@qq.com" });
                    if (userEmail) {
                        print("     ✅ 找到邮箱为'2911872658@qq.com'的用户");
                        print("        用户名: " + userEmail.username);
                        print("        角色: " + userEmail.role);
                    }
                    
                    // 显示前5个用户
                    const users = currentDB[coll].find().limit(5).toArray();
                    if (users.length > 0) {
                        print("     前5个用户:");
                        users.forEach((user, index) => {
                            print("        " + (index + 1) + ". " + user.username + " (" + user.email + ") - 角色: " + user.role);
                        });
                    }
                }
            });
        } else {
            print("   该数据库没有集合");
        }
    }
});