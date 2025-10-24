import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Avatar } from 'antd';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../../hooks/redux';

const { Text } = Typography;

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface Props {
  snippetId: string;
}

const SnippetChat: React.FC<Props> = ({ snippetId }) => {
  const { user, token } = useAppSelector((s) => s.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = useMemo(() => {
    return (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:3001';
  }, []);

  useEffect(() => {
    let cancelled = false;
    // 先加载历史
    fetch(`${backendUrl}/api/chat/history?room=snippet:${snippetId}&limit=200`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.messages)) {
          setMessages(data.messages.map((m: any) => ({
            userId: m.userId || 'guest',
            username: m.username || '用户',
            text: m.text,
            timestamp: new Date(m.createdAt).getTime(),
          })));
        }
      })
      .catch(() => {});

    const socket = io(backendUrl, {
      path: '/socket.io',
      transports: ['websocket','polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: token ? { token, username: user?.username } : {},
      query: { room: `snippet:${snippetId}` },
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('chat:presence', (payload: { onlineCount: number }) => {
      setOnlineCount(payload.onlineCount);
    });
    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
    socket.on('chat:error', (e: { error: string }) => {
      // 可选：展示错误提示
    });

    return () => {
      cancelled = true;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl, snippetId, token, user?.username]);

  const send = () => {
    if (!socketRef.current) return;
    const text = input.trim();
    if (!text) return;
    if (user && token) {
      setMessages((prev) => [...prev, { userId: (user as any).id || 'me', username: user.username || '我', text, timestamp: Date.now() }]);
    }
    socketRef.current.emit('chat:message', { text });
    setInput('');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <Card title={`片段讨论（在线：${onlineCount}）`} style={{ marginTop: 16 }}>
      {!isAuthenticated && (
        <Alert type="info" message="你当前为离线状态（未登录），可查看消息但不可发言" showIcon style={{ marginBottom: 12 }} />
      )}
      <div ref={listRef} style={{ maxHeight: 480, overflow: 'auto', border: '1px solid #eee', borderRadius: 10, padding: 8, background: 'rgba(0,0,0,0.02)' }}>
        {messages.length === 0 ? (
          <Text type="secondary">暂无消息，开始第一条讨论吧</Text>
        ) : (
          messages.map((m, idx) => {
            const mine = !!user && m.userId && (m.userId as any) !== 'guest' && (user as any).id ? String(m.userId) === String((user as any).id) : false;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                {!mine && <Avatar style={{ marginRight: 8 }}>{(m.username || '用').slice(0,1)}</Avatar>}
                <div style={{
                  maxWidth: '48%',
                  background: mine ? '#1677ff' : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#303030' : '#f5f5f5'),
                  color: mine ? '#fff' : 'inherit',
                  padding: '6px 10px',
                  borderRadius: 10,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 13,
                  lineHeight: 19
                }}>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong style={{ color: mine ? '#fff' : undefined }}>{m.username} 说：</Text>
                    <Text type="secondary" style={{ marginLeft: 8, color: mine ? 'rgba(255,255,255,0.8)' : undefined }}>
                      {new Date(m.timestamp).toLocaleString()}
                    </Text>
                  </div>
                  <div>{m.text}</div>
                </div>
                {mine && <Avatar style={{ marginLeft: 8 }}>{(m.username || '用').slice(0,1)}</Avatar>}
              </div>
            );
          })
        )}
      </div>

      <Space style={{ marginTop: 12 }}>
        <Input
          placeholder={isAuthenticated ? '输入消息内容...' : '请登录后发言'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isAuthenticated}
          onPressEnter={send}
          style={{ width: 500 }}
        />
        <Button type="primary" onClick={send} disabled={!isAuthenticated}>发送</Button>
      </Space>
    </Card>
  );
};

export default SnippetChat;
