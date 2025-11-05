import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Modal, Input, Typography } from 'antd';
import { EyeOutlined, DeleteOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { adminAPI } from '../services/api';
import { getSnippets, deleteSnippet } from '../store/slices/adminSlice';

const { Search } = Input;

interface Snippet {
  _id: string;
  title: string;
  language: string;
  isPrivate: boolean;
  creatorId: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

const PrivateSnippetsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { snippets, isLoading } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();

  // 检查用户是否为管理员
  useEffect(() => {
    if (!user) {
      message.error('请先登录');
      window.location.href = '/login';
      return;
    }
    
    if (user?.role !== 'admin') {
      message.error('需要管理员权限');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      return;
    }
    
    // 加载私有片段
    loadPrivateSnippets();
  }, [user]);

  const loadPrivateSnippets = async () => {
    try {
      await dispatch(getSnippets({ 
        page: 1, 
        limit: 20, 
        status: 'private' 
      })).unwrap();
    } catch (error) {
      message.error('加载私有片段失败');
    }
  };

  const handleSearch = async (searchValue: string) => {
    try {
      await dispatch(getSnippets({ 
        page: 1, 
        limit: 20, 
        status: 'private',
        search: searchValue 
      })).unwrap();
    } catch (error) {
      message.error('搜索失败');
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个私有代码片段吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await dispatch(deleteSnippet(snippetId)).unwrap();
          message.success('代码片段删除成功');
          loadPrivateSnippets();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const snippetColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Snippet) => (
        <Space>
          <LockOutlined style={{ color: '#ffa940' }} />
          <span>{title}</span>
        </Space>
      ),
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => <Tag color="blue">{language}</Tag>,
    },
    {
      title: '作者',
      dataIndex: 'creatorId',
      key: 'creatorId',
      render: (creatorId: any) => creatorId?.username || '匿名用户',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Snippet) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/s/${record._id}`, '_blank')}
          >
            查看
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSnippet(record._id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <LockOutlined />
            私有代码片段管理
            <Tag color="orange">管理员专用</Tag>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            onClick={() => window.history.back()}
          >
            返回管理员控制台
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Paragraph type="secondary">
            此页面显示所有用户的私有代码片段。作为管理员，您可以查看和删除这些私有片段。
          </Typography.Paragraph>
          <Search
            placeholder="搜索私有代码片段"
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </div>
        
        <Table
          columns={snippetColumns}
          dataSource={snippets}
          rowKey="_id"
          loading={isLoading}
          pagination={{ 
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      </Card>
    </div>
  );
};

export default PrivateSnippetsPage;