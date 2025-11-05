import { Router } from 'express';
import axios from 'axios';

const router = Router();

// 扣子智能体代理路由
router.post('/coze/chat/completions', async (req, res) => {
  try {
    const { message, conversationId, accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: '缺少访问令牌' });
    }

    if (!message) {
      return res.status(400).json({ error: '缺少消息内容' });
    }

    // 扣子API v2 的正确格式 - 根据官方文档
    const requestBody = {
      bot_id: '7568377950488657970',
      user: 'codeshare_user',
      query: message,
      conversation_id: conversationId || `conv_${Date.now()}`,
      stream: false
    };

    // 尝试扣子API的不同端点和版本
    const apiEndpoints = [
      'https://api.coze.cn/open_api/v2/chat',
      'https://api.coze.com/open_api/v2/chat',
      'https://api.coze.cn/open_api/v1/chat',
      'https://api.coze.com/open_api/v1/chat'
    ];

    let lastError;
    
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`尝试调用扣子API端点: ${endpoint}`);
        
        const response = await axios.post(
          endpoint,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        console.log('扣子API调用成功:', {
          status: response.status,
          data: response.data
        });

        // 如果请求成功，返回响应
        return res.json(response.data);
      } catch (error: any) {
        lastError = error;
        console.log(`端点 ${endpoint} 调用失败:`, error instanceof Error ? error.message : String(error));
        
        // 如果是400错误，尝试其他请求格式
        if (error && typeof error === 'object' && 'response' in error && error.response?.status === 400) {
          console.log('尝试备用请求格式...');
          
          // 尝试不同的请求格式
          const altFormats = [
            {
              bot_id: '7568377950488657970',
              conversation_id: conversationId || `conv_${Date.now()}`,
              user: 'codeshare_user',
              query: message,
              stream: false
            },
            {
              bot_id: '7568377950488657970',
              user_id: 'codeshare_user',
              query: message,
              conversation_id: conversationId || `conv_${Date.now()}`,
              stream: false
            }
          ];
          
          for (const altRequestBody of altFormats) {
            try {
              const altResponse = await axios.post(
                endpoint,
                altRequestBody,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  timeout: 30000
                }
              );
              
              console.log('备用格式调用成功');
              return res.json(altResponse.data);
            } catch (altError) {
              console.log('备用格式也失败:', altError);
            }
          }
        }
      }
    }

    // 所有端点都失败，抛出最后一个错误
    throw lastError;
  } catch (error: any) {
    console.error('智能体代理服务错误:', error);
    
    if (error.response) {
      // 扣子API返回的错误
      console.error('扣子API错误详情:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // 返回更详细的错误信息给前端
      return res.status(error.response.status).json({ 
        error: '智能体服务调用失败',
        details: error.response.data,
        statusCode: error.response.status
      });
    } else if (error.request) {
      // 网络连接错误
      return res.status(500).json({ 
        error: '无法连接到智能体服务，请检查网络连接',
        details: '网络连接失败'
      });
    } else {
      // 其他错误
      return res.status(500).json({ 
        error: '智能体服务暂时不可用，请稍后重试',
        details: error.message
      });
    }
  }
});

// 获取智能体信息代理
router.get('/coze/info', async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: '缺少访问令牌' });
    }

    // 获取智能体信息
    const response = await axios.get(
      'https://api.coze.com/v1/bot/7568377950488657970',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('获取智能体信息错误:', error);
    res.status(500).json({ error: '获取智能体信息失败' });
  }
});

export default router;