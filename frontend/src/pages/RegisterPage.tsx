import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { registerUser, getCurrentUser } from '../store/slices/authSlice';

const { Title, Text } = Typography;

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: RegisterForm) => {
    try {
      await dispatch(registerUser({
        username: values.username,
        email: values.email,
        password: values.password
      })).unwrap();
      await dispatch(getCurrentUser());
      navigate('/dashboard');
    } catch (error) {
      // 错误处理在slice中已完成
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '50px auto', 
      padding: '0 24px' 
    }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>注册</Title>
          <Text type="secondary">创建您的 CodeShare 账号</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 30, message: '用户名最多30个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <Text type="secondary">已有账号？</Text>
          <Link to="/login">
            <Button type="link" size="large">
              立即登录
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;