@echo off
echo 正在更新用户角色...

REM 使用echo命令创建MongoDB脚本文件
echo db.auth('root', '123456'); > temp.js
echo db.getSiblingDB('codeshare').users.updateOne({email: '2911872658@qq.com'}, {$set: {role: 'admin'}}); >> temp.js
echo db.getSiblingDB('codeshare').users.findOne({email: '2911872658@qq.com'}, {role: 1, username: 1, email: 1}); >> temp.js

REM 执行MongoDB脚本
docker exec codeshare-mongodb mongosh < temp.js

REM 清理临时文件
del temp.js

echo 用户角色更新完成！