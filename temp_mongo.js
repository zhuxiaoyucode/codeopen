db.auth('root', '123456');
db.getSiblingDB('codeshare').users.updateOne({email: '2911872658@qq.com'}, {$set: {role: 'admin'}});
db.getSiblingDB('codeshare').users.findOne({email: '2911872658@qq.com'}, {role: 1, username: 1, email: 1});