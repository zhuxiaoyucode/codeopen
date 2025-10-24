import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message } from 'antd';
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { snippetsAPI } from '../services/api';
import { Snippet } from '../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface PublicListResponse {
  page: number;
  pageSize: number;
  total: number;
  snippets: Snippet[];
}

const PublicSnippetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Snippet[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (p = page, ps = pageSize) => {
    try {
      setLoading(true);
      const res = await snippetsAPI.getPublicSnippets({ page: p, pageSize: ps });
      const payload = res.data as PublicListResponse;
      setData(payload.snippets || []);
      setPage(payload.page);
      setPageSize(payload.pageSize);
      setTotal(payload.total);
    } catch (err: any) {
      message.error(err?.response?.data?.error || '加载公开片段失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '无';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '无';
    return d.toLocaleString('zh-CN');
  };

  const handleCopyLink = async (snippet: Snippet) => {
    const link = `${window.location.origin}/s/${snippet.id}`;
    try {
      await navigator.clipboard.writeText(link);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title || '未命名片段'}</Text>,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => <Tag color="blue">{language}</Tag>,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator?: { username: string }) => (
        <Tag color="purple">{creator?.username || '匿名用户'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '预览',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => <Text>{content}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Snippet) => (
        <Space size="small"> 
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/s/${record.id}`)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<CopyOutlined />} 
            size="small"
            onClick={() => handleCopyLink(record)}
          >
            复制链接
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large"> 
        <Card>
          <Space style={{ width: '100%' }} justifyContent="space-between">
            <div>
              <Title level={2} style={{ margin: 0 }}>公开代码片段</Title>
              <Text type="secondary">浏览所有用户公开分享的代码片段</Text>
            </div>
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
                fetchData(p, ps);
              },
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PublicSnippetsPage;
