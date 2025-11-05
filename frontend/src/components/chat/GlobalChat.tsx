import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Avatar, Spin, message as antdMessage, Badge } from 'antd';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../../hooks/redux';
import { SendOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

const GlobalChat: React.FC = () => {
  const { user, token } = useAppSelector((s) => s.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = useMemo(() => {
    // 检查是否通过Nginx代理访问（端口80或443）
    const isNginxProxy = window.location.port === '' || window.location.port === '80' || window.location.port === '443';
    
    if (isNginxProxy) {
      // 通过Nginx代理时，使用相对路径
      return '';
    }
    
    // 本地开发环境，直接连接后端
    return (import.meta as any)?.env?.VITE_BACKEND_URL || 'http://localhost:3001';
  }, []);

  // 获取头像URL，根据当前访问端口动态处理
  const getAvatarUrl = useMemo(() => {
    return (avatarPath: string) => {
      if (!avatarPath) return '';
      
      // 检查当前是否通过端口80（Nginx代理）访问
      const isNginxProxy = window.location.port === '' || window.location.port === '80';
      
      if (avatarPath.startsWith('/uploads/')) {
        if (isNginxProxy) {
          // 通过Nginx代理时，使用相对路径
          return avatarPath;
        } else {
          // 直接访问时，需要拼接后端URL
          return `${backendUrl}${avatarPath}`;
        }
      }
      
      return avatarPath;
    };
  }, [backendUrl]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    
    // 先加载历史
    const apiUrl = backendUrl ? `${backendUrl}/api/chat/history?room=global&limit=200` : '/api/chat/history?room=global&limit=200';
    fetch(apiUrl)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data?.messages)) {
            setMessages(data.messages.map((m: any) => ({
              userId: m.userId || 'guest',
              username: m.username || '用户',
              text: m.text,
              timestamp: new Date(m.createdAt).getTime(),
            })));
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('加载历史消息失败');
          setIsLoading(false);
        }
      });

    const socket = io(backendUrl, {
      path: '/socket.io',
      transports: ['websocket','polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: token ? { token, username: user?.username } : {},
      query: { room: 'global' },
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('chat:presence', (payload: { onlineCount: number }) => {
      setOnlineCount(payload.onlineCount);
    });
    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      // 滚动到底部
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl, token, user?.username]);

  const send = () => {
    if (!socketRef.current) return;
    const text = input.trim();
    if (!text) {
      antdMessage.warning('请输入消息内容');
      return;
    }
    
    // 乐观更新：先在本地插入一条消息
    if (user && token) {
      setMessages((prev) => [...prev, { 
        userId: (user as any).id || 'me', 
        username: user.username || '我', 
        text, 
        timestamp: Date.now() 
      }]);
    }
    
    socketRef.current.emit('chat:message', { text });
    setInput('');
    
    // 滚动到底部
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const isAuthenticated = !!user && !!token;

  return (
    <Card 
      title={
        <Space>
          <span>全站讨论</span>
          <Badge count={onlineCount} showZero style={{ backgroundColor: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>在线用户</Text>
        </Space>
      }
      extra={
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          onClick={() => window.location.reload()}
          size="small"
        >
          刷新
        </Button>
      }
    >
      {!isAuthenticated && (
        <Alert type="info" message="当前为离线状态（未登录），可查看消息但不可发言" showIcon style={{ marginBottom: 12 }} />
      )}
      
      <div ref={listRef} style={{ 
        maxHeight: 480, 
        overflow: 'auto', 
        border: '1px solid #d9d9d9', 
        borderRadius: 8, 
        padding: 12, 
        background: 'rgba(0,0,0,0.02)' 
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>加载消息中...</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>暂时没有消息，开始第一条讨论吧</div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const mine = !!user && m.userId && (m.userId as any) !== 'guest' && (user as any).id ? String(m.userId) === String((user as any).id) : false;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                {!mine && (
                  <Avatar 
                    style={{ marginRight: 8 }} 
                    icon={<UserOutlined />}
                    src={m.userId !== 'guest' ? getAvatarUrl(`/uploads/avatars/${m.userId}.jpg`) : undefined}
                  >
                    {(m.username || '用').slice(0,1)}
                  </Avatar>
                )}
                <div style={{
                  maxWidth: '60%',
                  background: mine ? '#1890ff' : '#f5f5f5',
                  color: mine ? '#fff' : 'inherit',
                  padding: '8px 12px',
                  borderRadius: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ 
                      color: mine ? '#fff' : '#1890ff', 
                      fontSize: 12 
                    }}>
                      {m.username}
                    </Text>
                    <Text type="secondary" style={{ 
                      fontSize: 11, 
                      color: mine ? 'rgba(255,255,255,0.7)' : '#999' 
                    }}>
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                  <div style={{ lineHeight: 1.6 }}>{m.text}</div>
                </div>
                {mine && (
                  <Avatar 
                    style={{ marginLeft: 8 }} 
                    icon={<UserOutlined />}
                    src={user?.avatar ? getAvatarUrl(user.avatar) : undefined}
                  >
                    {(m.username || '用').slice(0,1)}
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>

      <Space style={{ marginTop: 16 }}>
        <Input
          placeholder={isAuthenticated ? '输入消息内容... (按Enter发送)' : '请登录后发言'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isAuthenticated}
          onPressEnter={send}
          style={{ width: 500 }}
          suffix={
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={send} 
              disabled={!isAuthenticated || !input.trim()}
              size="small"
            >
              发送
            </Button>
          }
        />
      </Space>
    </Card>
  );
};

export default GlobalChat;
