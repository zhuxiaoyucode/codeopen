import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message, Modal, Select, Input, List, Typography } from 'antd';
import { 
  UserOutlined, 
  CodeOutlined, 
  EyeOutlined, 
  LockOutlined,
  BarChartOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { adminAPI } from '../services/api';
import { getDashboardStats, getUsers, getSnippets, updateUserRole, updateUserStatus, deleteSnippet } from '../store/slices/adminSlice';

const { Option } = Select;
const { Search } = Input;

interface DashboardStats {
  totalUsers: number;
  totalSnippets: number;
  publicSnippets: number;
  privateSnippets: number;
  recentUsers: number;
  languageStats: Array<{ _id: string; count: number }>;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
}

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

const AdminDashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { stats, users, snippets, isLoading, pagination } = useAppSelector((state) => state.admin);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRecentUsers, setShowRecentUsers] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [snippetSearch, setSnippetSearch] = useState('');

  // 检查用户是否为管理员
  useEffect(() => {
    if (!user) {
      message.error('请先登录');
      window.location.href = '/login';
      return;
    }
    
    if (user?.role !== 'admin') {
      message.error('需要管理员权限');
      // 使用setTimeout给用户看到错误提示的时间
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      return;
    }
    
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(getDashboardStats()).unwrap(),
        dispatch(getUsers({ page: 1, limit: 10 })).unwrap(),
        dispatch(getSnippets({ page: 1, limit: 10 })).unwrap()
      ]);
    } catch (error) {
      message.error('加载数据失败');
    }
  };

  const handleSearchUsers = async (searchValue: string) => {
    try {
      setUserSearch(searchValue);
      await dispatch(getUsers({ 
        page: 1, 
        limit: 10, 
        search: searchValue 
      })).unwrap();
    } catch (error) {
      message.error('搜索失败');
    }
  };

  const handleSearchSnippets = async (searchValue: string) => {
    try {
      setSnippetSearch(searchValue);
      await dispatch(getSnippets({ 
        page: 1, 
        limit: 10, 
        search: searchValue 
      })).unwrap();
    } catch (error) {
      message.error('搜索失败');
    }
  };

  // 处理用户列表分页
  const handleUserPageChange = async (page: number, pageSize?: number) => {
    try {
      await dispatch(getUsers({ 
        page, 
        limit: pageSize || 10, 
        search: userSearch 
      })).unwrap();
    } catch (error) {
      message.error('加载用户列表失败');
    }
  };

  // 处理代码片段列表分页
  const handleSnippetPageChange = async (page: number, pageSize?: number) => {
    try {
      await dispatch(getSnippets({ 
        page, 
        limit: pageSize || 10, 
        search: snippetSearch,
        language: selectedLanguage || undefined
      })).unwrap();
    } catch (error) {
      message.error('加载代码片段列表失败');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      message.success('用户角色更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      let disableDays: number | undefined;
      
      if (!isActive) {
        // 如果是禁用操作，弹出对话框让管理员选择禁用天数
        const result = await new Promise<number | null>((resolve) => {
          Modal.confirm({
            title: '设置禁用时间',
            content: (
              <div>
                <p>请选择禁用天数：</p>
                <Select 
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="选择禁用天数"
                  defaultValue={7} // 默认选择7天
                  onChange={(value) => resolve(value)}
                >
                  <Option value={1}>1天</Option>
                  <Option value={3}>3天</Option>
                  <Option value={7}>7天</Option>
                  <Option value={30}>30天</Option>
                  <Option value={0}>永久禁用</Option>
                </Select>
              </div>
            ),
            onOk: () => resolve(null),
            onCancel: () => resolve(null),
          });
        });
        
        if (result === null) {
          return; // 用户取消了操作
        }
        
        disableDays = result === 0 ? undefined : result;
      }
      
      await dispatch(updateUserStatus({ userId, isActive, disableDays })).unwrap();
      
      if (isActive) {
        message.success('用户已启用');
      } else {
        if (disableDays) {
          message.success(`用户已禁用，将在 ${disableDays} 天后自动解禁`);
        } else {
          message.success('用户已永久禁用');
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个代码片段吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await dispatch(deleteSnippet(snippetId)).unwrap();
          message.success('代码片段删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 处理统计卡片点击事件
  const handleStatisticClick = (type: string) => {
    switch (type) {
      case 'totalUsers':
        setActiveTab('users');
        break;
      case 'totalSnippets':
        setActiveTab('snippets');
        break;
      case 'publicSnippets':
        // 跳转到公开片段页面
        navigate('/explore');
        break;
      case 'privateSnippets':
        // 跳转到私有片段页面
        navigate('/admin/private-snippets');
        break;
      default:
        break;
    }
  };

  // 处理语言点击事件
  const handleLanguageClick = (language: string) => {
    setSelectedLanguage(language);
    setActiveTab('snippets');
    // 清除搜索条件，确保只按语言筛选
    setSnippetSearch('');
    // 调用API获取特定语言的代码片段
    dispatch(getSnippets({ 
      page: 1, 
      limit: 10, 
      language: language 
    })).unwrap().then(() => {
      message.success(`已筛选 ${language} 语言的代码片段`);
    }).catch(error => {
      console.error('获取语言片段失败:', error);
      message.error('获取代码片段失败');
    });
  };

  // 处理最近7天注册用户点击事件
  const handleRecentUsersClick = () => {
    setShowRecentUsers(!showRecentUsers);
    if (!showRecentUsers) {
      // 获取最近7天的用户
      dispatch(getUsers({ 
        page: 1, 
        limit: 20 
      }));
    }
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: User) => (
        <Select
          value={role as 'user' | 'admin'}
          style={{ width: 120 }}
          onChange={(value: 'user' | 'admin') => handleUpdateUserRole(record._id, value)}
        >
          <Option value="user">普通用户</Option>
          <Option value="admin">管理员</Option>
        </Select>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleUpdateUserStatus(record._id, !record.isActive)}
          >
            {record.isActive ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  const snippetColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => <Tag>{language}</Tag>,
    },
    {
      title: '作者',
      dataIndex: 'creatorId',
      key: 'creatorId',
      render: (creatorId: any) => creatorId?.username || '匿名用户',
    },
    {
      title: '可见性',
      dataIndex: 'isPrivate',
      key: 'isPrivate',
      render: (isPrivate: boolean) => (
        <Tag color={!isPrivate ? 'blue' : 'orange'}>
          {!isPrivate ? '公开' : '私有'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
            <BarChartOutlined />
            管理员控制台
          </Space>
        }
        extra={
          <Space>
            <Button 
              type={activeTab === 'dashboard' ? 'primary' : 'default'}
              onClick={() => setActiveTab('dashboard')}
            >
              仪表板
            </Button>
            <Button 
              type={activeTab === 'users' ? 'primary' : 'default'}
              onClick={() => setActiveTab('users')}
            >
              用户管理
            </Button>
            <Button 
              type={activeTab === 'snippets' ? 'primary' : 'default'}
              onClick={() => setActiveTab('snippets')}
            >
              内容管理
            </Button>
          </Space>
        }
      >
        {activeTab === 'dashboard' && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card 
                  hoverable 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatisticClick('totalUsers')}
                >
                  <Statistic
                    title="总用户数"
                    value={stats?.totalUsers || 0}
                    prefix={<UserOutlined />}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    点击查看用户管理
                  </Typography.Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card 
                  hoverable 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatisticClick('totalSnippets')}
                >
                  <Statistic
                    title="总代码片段"
                    value={stats?.totalSnippets || 0}
                    prefix={<CodeOutlined />}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    点击查看内容管理
                  </Typography.Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card 
                  hoverable 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatisticClick('publicSnippets')}
                >
                  <Statistic
                    title="公开片段"
                    value={stats?.publicSnippets || 0}
                    prefix={<EyeOutlined />}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    点击查看公开片段
                  </Typography.Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card 
                  hoverable 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatisticClick('privateSnippets')}
                >
                  <Statistic
                    title="私有片段"
                    value={stats?.privateSnippets || 0}
                    prefix={<LockOutlined />}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    点击查看私有片段
                  </Typography.Text>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card title="热门编程语言" style={{ height: 400 }}>
                  <div style={{ 
                    maxHeight: 320, 
                    overflowY: 'auto', 
                    paddingRight: 8,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d9d9d9 transparent'
                  }}>
                    {stats?.languageStats?.map((lang) => (
                      <div 
                        key={lang._id} 
                        style={{ 
                          marginBottom: 8, 
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          minHeight: '40px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => handleLanguageClick(lang._id)}
                      >
                        <span style={{ fontWeight: 'bold', flex: 1 }}>{lang._id}</span>
                        <Space>
                          <Tag color="blue">{lang.count}</Tag>
                          {selectedLanguage === lang._id && (
                            <Tag color="green">已选中</Tag>
                          )}
                        </Space>
                      </div>
                    ))}
                  </div>
                  {selectedLanguage && (
                    <div style={{ marginTop: 16, padding: '8px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                      <Typography.Text type="secondary">
                        当前筛选语言: <strong>{selectedLanguage}</strong>
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setSelectedLanguage(null)}
                          style={{ marginLeft: 8 }}
                        >
                          清除筛选
                        </Button>
                      </Typography.Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title="最近7天注册用户" 
                  style={{ height: 400 }}
                  extra={
                    <Button 
                      type="link" 
                      icon={<CalendarOutlined />}
                      onClick={handleRecentUsersClick}
                    >
                      {showRecentUsers ? '隐藏列表' : '查看列表'}
                    </Button>
                  }
                >
                  {!showRecentUsers ? (
                    <div style={{ textAlign: 'center', marginTop: 100 }}>
                      <Statistic
                        value={stats?.recentUsers || 0}
                        prefix={<UserOutlined />}
                      />
                      <Typography.Text type="secondary">
                        点击上方按钮查看用户列表
                      </Typography.Text>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <List
                        dataSource={users}
                        renderItem={(user: User) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<UserOutlined />}
                              title={user.username}
                              description={
                                <Space>
                                  <span>{user.email}</span>
                                  <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                                    {user.role === 'admin' ? '管理员' : '普通用户'}
                                  </Tag>
                                  <Tag color={user.isActive ? 'green' : 'red'}>
                                    {user.isActive ? '启用' : '禁用'}
                                  </Tag>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="搜索用户名或邮箱"
                onSearch={handleSearchUsers}
                style={{ width: 300 }}
              />
            </div>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                current: pagination.users.current,
                pageSize: pagination.users.pageSize,
                total: pagination.users.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: handleUserPageChange,
                onShowSizeChange: handleUserPageChange
              }}
            />
          </div>
        )}

        {activeTab === 'snippets' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Search
                placeholder="搜索代码片段"
                onSearch={handleSearchSnippets}
                style={{ width: 300 }}
              />
              {selectedLanguage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Typography.Text type="secondary">
                    当前筛选语言: 
                  </Typography.Text>
                  <Tag color="blue">{selectedLanguage}</Tag>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => {
                      setSelectedLanguage(null);
                      dispatch(getSnippets({ page: 1, limit: 10 }));
                    }}
                  >
                    清除筛选
                  </Button>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              {selectedLanguage && (
                <Typography.Text strong style={{ fontSize: '16px' }}>
                  显示 {selectedLanguage} 语言的代码片段（共 {pagination.snippets.total || 0} 个）
                </Typography.Text>
              )}
            </div>
            <Table
              columns={snippetColumns}
              dataSource={snippets}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                current: pagination.snippets.current,
                pageSize: pagination.snippets.pageSize,
                total: pagination.snippets.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: handleSnippetPageChange,
                onShowSizeChange: handleSnippetPageChange
              }}
              locale={{
                emptyText: selectedLanguage ? 
                  `没有找到 ${selectedLanguage} 语言的代码片段` : 
                  '暂无代码片段'
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboardPage;