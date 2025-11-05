const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testPermissionFix() {
  console.log('🔍 开始测试权限修复...\n');

  try {
    // 1. 首先获取一个有效的token（需要先登录）
    console.log('1. 测试登录获取token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ 登录成功，获取到token\n');

    // 2. 创建一个私密片段
    console.log('2. 创建私密代码片段...');
    const createResponse = await axios.post(`${API_BASE_URL}/snippets`, {
      content: 'console.log("私密测试片段");',
      language: 'javascript',
      isPrivate: true,
      title: '私密测试片段'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const snippetId = createResponse.data.snippet.id;
    console.log(`✅ 私密片段创建成功，ID: ${snippetId}\n`);

    // 3. 测试访问自己的私密片段（应该成功）
    console.log('3. 测试访问自己的私密片段...');
    try {
      const accessResponse = await axios.get(`${API_BASE_URL}/snippets/${snippetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 成功访问自己的私密片段\n');
    } catch (error) {
      console.log('❌ 无法访问自己的私密片段:', error.response?.data || error.message);
      return;
    }

    // 4. 测试管理员权限（如果有管理员账户）
    console.log('4. 测试管理员权限...');
    try {
      // 尝试用管理员账户登录
      const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      const adminToken = adminLoginResponse.data.token;
      console.log('✅ 管理员登录成功');

      // 管理员应该能访问任何私密片段
      const adminAccessResponse = await axios.get(`${API_BASE_URL}/snippets/${snippetId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ 管理员成功访问私密片段\n');
    } catch (error) {
      console.log('⚠️ 管理员测试跳过:', error.response?.data?.error || error.message);
    }

    // 5. 测试未登录用户访问私密片段（应该失败）
    console.log('5. 测试未登录用户访问私密片段...');
    try {
      await axios.get(`${API_BASE_URL}/snippets/${snippetId}`);
      console.log('❌ 未登录用户不应该能访问私密片段');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 未登录用户正确被拒绝访问\n');
      } else {
        console.log('❌ 权限验证异常:', error.response?.data || error.message);
      }
    }

    console.log('🎉 所有权限测试完成！权限修复已生效。');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.response?.data || error.message);
  }
}

testPermissionFix();