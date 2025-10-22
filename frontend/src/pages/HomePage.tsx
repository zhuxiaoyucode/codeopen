import React from 'react';
import { Card, Row, Col, Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { RocketOutlined, CodeOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* 英雄区域 */}
      <Row justify="center" style={{ textAlign: 'center', marginBottom: 80 }}>
        <Col span={24}>
          <Title level={1} style={{ fontSize: '3.5rem', marginBottom: 16 }}>
            CodeShare
          </Title>
          <Title level={3} type="secondary" style={{ marginBottom: 32 }}>
            快速分享代码片段，让协作更简单
          </Title>
          <Space size="large">
            <Link to="/create">
              <Button type="primary" size="large" icon={<RocketOutlined />}>
                开始创建
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="large" icon={<CodeOutlined />}>
                管理片段
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="large" icon={<ShareAltOutlined />}>
                浏览公开片段
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      {/* 特性介绍 */}
      <Row gutter={[32, 32]} style={{ marginBottom: 80 }}>
        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
            <CodeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>多语言支持</Title>
            <Paragraph>
              支持 JavaScript、Python、Java、Go 等主流编程语言，自动语法高亮
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
            <ShareAltOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>一键分享</Title>
            <Paragraph>
              生成唯一链接，轻松分享代码片段，支持公开和私密访问
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
            <RocketOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
            <Title level={4}>过期管理</Title>
            <Paragraph>
              设置过期时间，自动清理过期片段，保护代码安全
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
      <Row gutter={[32, 32]}>
        <Col span={24}>
          <Card title="如何使用" style={{ textAlign: 'center' }}>
            <Row gutter={[32, 32]} justify="center">
              <Col xs={24} sm={8}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>1</div>
                  <Title level={4}>创建片段</Title>
                  <Paragraph>编写代码，选择语言，设置权限和过期时间</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>2</div>
                  <Title level={4}>获取链接</Title>
                  <Paragraph>系统生成唯一链接，一键复制分享</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>3</div>
                  <Title level={4}>分享协作</Title>
                  <Paragraph>他人通过链接查看代码，无需登录即可访问</Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;