import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Space, 
  Avatar, 
  Typography, 
  Spin,
  message,
  Tooltip
} from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  CloseOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { cozeAgentAPI, conversationStorage } from '../../services/cozeAgent';

const { Text } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CozeAgentChatProps {
  visible: boolean;
  onClose: () => void;
}

const CozeAgentChat: React.FC<CozeAgentChatProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化对话
  useEffect(() => {
    if (visible) {
      const newConversationId = conversationStorage.generateConversationId();
      setConversationId(newConversationId);
      
      // 加载历史对话（如果有）
      const history = conversationStorage.getConversationHistory(newConversationId);
      if (history.length > 0) {
        setMessages(history);
      } else {
        // 添加欢迎消息
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是CodeShare智能助手，有什么可以帮助你的吗？',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [visible]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 发送消息到智能体
      const response = await cozeAgentAPI.sendMessage(inputValue.trim(), conversationId);
      
      // 根据扣子API的正确响应格式处理
      let assistantContent = '抱歉，我暂时无法回答这个问题。';
      
      // 调试日志：打印完整的响应结构
      console.log('智能体API响应:', JSON.stringify(response, null, 2));
      
      // 扣子API v2 响应格式 - 优先处理
      if (response.conversation_id && response.messages && response.messages.length > 0) {
        // 扣子API v2 格式 - 显示最后一个助手消息
        const assistantMessages = response.messages.filter((msg: any) => 
          msg.type === 'answer' || msg.role === 'assistant' || msg.type === 'assistant'
        );
        if (assistantMessages.length > 0) {
          const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
          assistantContent = lastAssistantMessage.content || lastAssistantMessage.message || 
                           lastAssistantMessage.text || assistantContent;
        }
      } else if (response.code === 0 && response.data && response.data.response) {
        // 扣子API成功响应格式
        assistantContent = response.data.response;
      } else if (response.messages && response.messages.length > 0) {
        // 扣子API旧格式 - 显示第一个助手消息
        const assistantMessage = response.messages.find((msg: any) => 
          msg.role === 'assistant' || msg.type === 'assistant'
        );
        if (assistantMessage && (assistantMessage.content || assistantMessage.message || assistantMessage.text)) {
          assistantContent = assistantMessage.content || assistantMessage.message || assistantMessage.text;
        }
      } else if (response.choices?.[0]?.message?.content) {
        // OpenAI兼容格式
        assistantContent = response.choices[0].message.content;
      } else if (response.message) {
        // 其他可能的响应格式
        assistantContent = response.message;
      } else if (response.content) {
        // 直接内容格式
        assistantContent = response.content;
      } else if (response.data && response.data.messages && response.data.messages.length > 0) {
        // 嵌套的messages格式
        const assistantMessage = response.data.messages.find((msg: any) => 
          msg.role === 'assistant' || msg.type === 'assistant'
        );
        if (assistantMessage && (assistantMessage.content || assistantMessage.message || assistantMessage.text)) {
          assistantContent = assistantMessage.content || assistantMessage.message || assistantMessage.text;
        }
      }
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 保存对话历史
      conversationStorage.saveConversationHistory(conversationId, [...messages, userMessage, assistantMessage]);
      
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败，请稍后重试');
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后重试。',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 清空对话
  const handleClearConversation = () => {
    setMessages([]);
    const newConversationId = conversationStorage.generateConversationId();
    setConversationId(newConversationId);
    
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是CodeShare智能助手，有什么可以帮助你的吗？',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    message.success('对话已清空');
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>智能助手</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 20 }}
      styles={{
        body: {
          padding: '16px 0',
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* 消息区域 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0 16px',
        marginBottom: '16px'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              marginBottom: '16px',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Space 
              align="start" 
              size="small"
              direction="horizontal"
              style={{ 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Avatar
                size="small"
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                style={{
                  backgroundColor: msg.role === 'user' ? '#87d068' : '#1890ff'
                }}
              />
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                  color: msg.role === 'user' ? '#fff' : '#000'
                }}
              >
                <Text style={{ 
                  color: msg.role === 'user' ? '#fff' : '#000',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </Text>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.7, 
                  marginTop: '4px',
                  textAlign: msg.role === 'user' ? 'right' : 'left'
                }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </Space>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <Space align="start" size="small">
              <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
                <Spin size="small" />
                <Text style={{ marginLeft: '8px', opacity: 0.7 }}>正在思考...</Text>
              </div>
            </Space>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{ padding: '0 16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            loading={loading}
          >
            发送
          </Button>
        </Space.Compact>
        
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title="清空对话">
            <Button 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={handleClearConversation}
              disabled={messages.length <= 1}
            >
              清空
            </Button>
          </Tooltip>
          
          <Text type="secondary" style={{ fontSize: '12px' }}>
            按 Enter 发送，Shift+Enter 换行
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default CozeAgentChat;