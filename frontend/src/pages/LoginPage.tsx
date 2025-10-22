import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, getCurrentUser } from '../store/slices/authSlice';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: LoginForm) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      await dispatch(getCurrentUser());
      navigate('/dashboard');
    } catch (error) {
      // 错误处理在slice中已完成
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '100px auto', 
      padding: '0 24px' 
    }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>登录</Title>
          <Text type="secondary">欢迎回到 CodeShare</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱地址" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          {error && (
            <div style={{ color: '#ff4d4f', textAlign: 'center', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <Text type="secondary">还没有账号？</Text>
          <Link to="/register">
            <Button type="link" size="large">
              立即注册
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;