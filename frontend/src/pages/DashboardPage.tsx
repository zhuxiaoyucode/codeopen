import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Typography, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getUserSnippets, deleteSnippet } from '../store/slices/snippetsSlice';
import { Snippet } from '../types';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user } = useAppSelector((state) => state.auth);
  const { snippets, isLoading } = useAppSelector((state) => state.snippets);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(getUserSnippets(user.id));
    }
  }, [user, dispatch]);

  const handleCopyLink = async (snippet: Snippet) => {
    const link = `${window.location.origin}/s/${snippet.id}`;
    try {
      await navigator.clipboard.writeText(link);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleEdit = (snippet: Snippet) => {
    navigate(`/create?edit=${snippet.id}`);
  };

  const handleDelete = (snippet: Snippet) => {
    setSnippetToDelete(snippet);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (snippetToDelete) {
      try {
        await dispatch(deleteSnippet(snippetToDelete.id)).unwrap();
        message.success('代码片段已删除');
      } catch (error: any) {
        message.error(error || '删除失败');
      }
      setDeleteModalVisible(false);
      setSnippetToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Snippet) => (
        <Text strong>{title || '未命名片段'}</Text>
      ),
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => (
        <Tag color="blue">{language}</Tag>
      ),
    },
    {
      title: '权限',
      dataIndex: 'isPrivate',
      key: 'isPrivate',
      render: (isPrivate: boolean) => (
        <Tag color={isPrivate ? 'red' : 'green'}>
          {isPrivate ? '私密' : '公开'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Snippet) => (
        record.isExpired ? (
          <Tag color="orange">已过期</Tag>
        ) : (
          <Tag color="green">有效</Tag>
        )
      ),
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
            disabled={record.isExpired}
          >
            复制链接
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 头部 */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>我的代码片段</Title>
              <Text type="secondary">管理您创建的所有代码片段</Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/create')}
            >
              新建片段
            </Button>
          </Space>
        </Card>

        {/* 片段列表 */}
        <Card>
          {snippets.length === 0 ? (
            <Empty
              description="您还没有创建任何代码片段"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/create')}
              >
                创建第一个片段
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={snippets}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          )}
        </Card>
      </Space>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除代码片段 "{snippetToDelete?.title || '未命名片段'}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可撤销！</p>
      </Modal>
    </div>
  );
};

export default DashboardPage;