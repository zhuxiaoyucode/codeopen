import axios from 'axios';

// 扣子智能体配置
const COZE_AGENT_CONFIG = {
  // 你的智能体URL
  agentUrl: 'https://www.coze.cn/space/7506429993858138164/bot/7568377950488657970',
  // 个人访问令牌
  accessToken: 'pat_EsYoYH6wpdNJEhevmdd8t6bbSbS2LaNuMHsQVH3czddhv2bUtEFmbgpFH8GiSrqU',
  // API基础URL - 通过nginx代理到后端
  apiBaseUrl: '/api/proxy/coze'
};

// 使用代理模式，通过nginx访问后端代理服务
const proxyConfig = {
  apiBaseUrl: COZE_AGENT_CONFIG.apiBaseUrl,
  useProxy: true
};

// 智能体API服务
export const cozeAgentAPI = {
  // 发送消息到智能体
  sendMessage: async (message: string, conversationId?: string) => {
    try {
      const requestData = {
        // 代理模式下，将认证信息放在请求体中
        message: message,
        conversationId: conversationId,
        accessToken: COZE_AGENT_CONFIG.accessToken
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        `${proxyConfig.apiBaseUrl}/chat/completions`,
        requestData,
        {
          headers: headers,
          timeout: 30000
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('智能体API调用失败:', error);
      throw new Error('智能体服务暂时不可用，请稍后重试');
    }
  },

  // 流式对话（如果需要实时响应）
  sendMessageStream: async (message: string, conversationId?: string, onMessage?: (chunk: string) => void) => {
    try {
      const response = await fetch(`${COZE_AGENT_CONFIG.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversationId: conversationId,
          accessToken: COZE_AGENT_CONFIG.accessToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                onMessage?.(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('智能体流式API调用失败:', error);
      throw new Error('智能体服务暂时不可用，请稍后重试');
    }
  },

  // 获取智能体信息
  getAgentInfo: async () => {
    try {
      const response = await axios.get(
        `${COZE_AGENT_CONFIG.apiBaseUrl}/agents/info`,
        {
          headers: {
            'Authorization': `Bearer ${COZE_AGENT_CONFIG.accessToken}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('获取智能体信息失败:', error);
      return null;
    }
  }
};

// 本地存储对话历史
export const conversationStorage = {
  getConversationHistory: (conversationId: string) => {
    try {
      const history = localStorage.getItem(`coze_conversation_${conversationId}`);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  },

  saveConversationHistory: (conversationId: string, messages: any[]) => {
    try {
      localStorage.setItem(`coze_conversation_${conversationId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('保存对话历史失败:', error);
    }
  },

  generateConversationId: () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};