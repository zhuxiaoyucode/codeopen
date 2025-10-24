import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Alert, Spin, Tag } from 'antd';
import { CopyOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getSnippet } from '../store/slices/snippetsSlice';
import CodeHighlighter from '../components/CodeHighlighter';
import SnippetChat from '../components/chat/SnippetChat';

const { Title, Paragraph } = Typography;

const ViewSnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentSnippet, isLoading, error } = useAppSelector((state) => state.snippets);
  const { user } = useAppSelector((state) => state.auth);
  
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getSnippet(id));
    }
  }, [id, dispatch]);

  const copyToClipboard = async () => {
    if (!currentSnippet) return;
    
    try {
      await navigator.clipboard.writeText(currentSnippet.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const isValidDate = (input?: string | null) => {
    if (!input) return false;
    const d = new Date(input);
    return !isNaN(d.getTime());
  };

  const formatDate = (dateString?: string | null) => {
    if (!isValidDate(dateString)) return '无';
    return new Date(dateString as string).toLocaleString('zh-CN');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/')}>返回首页</Button>
          }
        />
      </div>
    );
  }

  if (!currentSnippet) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Alert
          message="代码片段不存在"
          description="请检查链接是否正确"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const isOwner = user && currentSnippet.creator?._id === user.id;
  const isExpired =
    typeof currentSnippet.isExpired === 'boolean'
      ? currentSnippet.isExpired
      : (isValidDate(currentSnippet.expiresAt)
          ? new Date(currentSnippet.expiresAt as string).getTime() < Date.now()
          : false);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 头部操作栏 */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
            
            <Space>
              <Button icon={<CopyOutlined />} onClick={copyToClipboard} disabled={isExpired}>
                {isCopied ? '已复制' : '复制代码'}
              </Button>
              
              {isOwner && (
                <Button icon={<EditOutlined />} onClick={() => navigate(`/dashboard?edit=${currentSnippet.id}`)}>
                  编辑
                </Button>
              )}
            </Space>
          </Space>
        </Card>

        {/* 片段信息 */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {currentSnippet.title || '未命名片段'}
              </Title>
              
              <Space style={{ marginTop: 8 }}>
                <Tag color="blue">{currentSnippet.language}</Tag>
                <Tag color={currentSnippet.isPrivate ? 'red' : 'green'}>
                  {currentSnippet.isPrivate ? '私密' : '公开'}
                </Tag>
                {isExpired && <Tag color="orange">已过期</Tag>}
                {isValidDate(currentSnippet.expiresAt) && (
                  <Tag color={isExpired ? 'red' : 'cyan'}>
                    过期时间: {formatDate(currentSnippet.expiresAt)}
                  </Tag>
                )}
              </Space>
            </div>

            <Paragraph type="secondary">
              创建时间: {formatDate(currentSnippet.createdAt)}
              {currentSnippet.creator && (
                <span style={{ marginLeft: 8 }}>
                  • {isOwner ? '我的创建' : `由用户 ${currentSnippet.creator.username} 创建`}
                </span>
              )}
            </Paragraph>

            {isExpired && (
              <Alert
                message="此代码片段已过期"
                description="片段内容已无法访问"
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* 代码显示区域 */}
        {!isExpired && (
          <Card title="代码内容">
            <CodeHighlighter
              code={currentSnippet.content}
              language={currentSnippet.language}
            />
          </Card>
        )}

        {/* 讨论区 */}
        <SnippetChat snippetId={currentSnippet.id} />
      </Space>
    </div>
  );
};

export default ViewSnippetPage;