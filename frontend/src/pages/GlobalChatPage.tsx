import React from 'react';
import { Typography } from 'antd';
import GlobalChat from '../components/chat/GlobalChat';

const { Title, Paragraph } = Typography;

export default function GlobalChatPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '24px auto' }}>
      <Title level={3}>全站讨论</Title>
      <Paragraph type="secondary">欢迎在这里提出问题、交流想法，不局限于某个代码片段。</Paragraph>
      <GlobalChat />
    </div>
  );
}
