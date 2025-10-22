import React from 'react';
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CodeOutlined, 
  PlusOutlined, 
  UserOutlined, 
  LoginOutlined, 
  LogoutOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

const { Header: AntHeader } = Layout;

const AppHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '我的片段',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <AntHeader style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1,
      padding: '0 24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <CodeOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
          <span style={{ 
            fontSize: 20, 
            fontWeight: 'bold',
            color: '#1890ff'
          }}>
            CodeShare
          </span>
        </Link>

        {/* 导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ border: 'none', flex: 1, justifyContent: 'center' }}
          items={[
            {
              key: '/',
              label: <Link to="/">首页</Link>
            },
            {
              key: '/create',
              label: <Link to="/create">创建片段</Link>
            }
          ]}
        />

        {/* 用户操作区域 */}
        <Space size="middle">
          {user ? (
            <>
              <Link to="/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  新建片段
                </Button>
              </Link>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>你好，{user.username}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')}>
                <LoginOutlined /> 登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </AntHeader>
  );
};

export default AppHeader;