// 强制刷新管理员权限的脚本
console.log('=== 强制刷新管理员权限 ===');

// 1. 清除所有本地存储
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('✅ 已清除本地存储');

// 2. 重新登录
console.log('请手动重新登录你的账号：');
console.log('- 邮箱: 2911872658@qq.com');
console.log('- 密码: 123 (或你设置的密码)');
console.log('- 登录后检查用户菜单是否显示"管理后台"选项');

// 3. 登录后检查权限
console.log('登录后，在控制台执行以下命令检查权限：');
console.log('localStorage.getItem(\"user\")');
console.log('JSON.parse(localStorage.getItem(\"user\")).role');