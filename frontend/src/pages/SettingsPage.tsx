import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Modal, Space, Typography, Divider, Avatar, Image } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined, EditOutlined, SaveOutlined, UserOutlined, CameraOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import PasswordChangeModal from '../components/PasswordChangeModal';
import AvatarUploadModal from '../components/AvatarUploadModal';
import { authAPI } from '../services/api';
import { updateUserProfile, getCurrentUser } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);
  const [form] = Form.useForm();

  const handlePasswordChange = () => {
    setPasswordModalVisible(true);
  };

  const handleAvatarChange = () => {
    setAvatarModalVisible(true);
  };

  const handleAvatarPreview = () => {
    setAvatarPreviewVisible(true);
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl || avatarUrl === '') return '';
    
    // 检查当前是否通过端口3000直接访问
    const isDirectAccess = window.location.port === '3000';
    
    if (avatarUrl.startsWith('/uploads/')) {
      if (isDirectAccess) {
        // 端口3000直接访问时，需要拼接后端URL
        const backendUrl = (import.meta as any)?.env?.VITE_BACKEND_URL || 
                          (import.meta as any)?.env?.VITE_API_BASE_URL?.replace('/api', '') || 
                          'http://localhost:3001';
        return `${backendUrl}${avatarUrl}`;
      } else {
        // 通过Nginx代理时，使用相对路径
        return avatarUrl;
      }
    }
    
    return avatarUrl;
  };

  // 获取用户头像URL，如果avatar字段不存在或为空，返回空字符串
  const getUserAvatar = () => {
    if (!user) return '';
    // 检查avatar字段是否存在且不为空
    const avatar = user.avatar;
    if (avatar === undefined || avatar === null || avatar === '') {
      return '';
    }
    return getAvatarUrl(avatar);
  };

  const handleUsernameEdit = () => {
    setEditingUsername(true);
    form.setFieldValue('username', user?.username || '');
  };

  // 设置表单初始值
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username
      });
    }
  }, [user]);

  const handleUsernameSave = async () => {
    try {
      setUsernameLoading(true);
      const values = await form.validateFields();
      
      await dispatch(updateUserProfile({ username: values.username })).unwrap();
      
      message.success('用户名修改成功');
      setEditingUsername(false);
    } catch (error: any) {
      if (error) {
        message.error(error);
      } else {
        message.error('修改用户名失败');
      }
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUsernameCancel = () => {
    setEditingUsername(false);
    form.resetFields();
  };

  // 组件挂载时获取最新用户信息
  React.useEffect(() => {
    if (user && !user.avatar) {
      // 如果用户数据中没有avatar字段，重新获取用户信息
      dispatch(getCurrentUser());
    }
  }, [user, dispatch]);



  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 头像管理 - 强制显示用于调试 */}
        <Card>
          <Title level={3}>头像管理</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar 
              size={80} 
              src={getUserAvatar()} 
              icon={<UserOutlined />}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
                {user?.username || '用户'}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                当前头像: {user?.avatar !== undefined && user.avatar !== '' ? user.avatar : '未设置'}
              </div>
            </div>
            <Space>
              <Button 
                icon={<EyeOutlined />}
                onClick={handleAvatarPreview}
              >
                查看头像
              </Button>
              <Button 
                type="primary" 
                icon={<CameraOutlined />}
                onClick={handleAvatarChange}
              >
                更换头像
              </Button>
            </Space>
          </div>
        </Card>

        {/* 个人信息 */}
        <Card>
          <Title level={3}>个人信息</Title>
          <Form form={form} layout="vertical">
            <Form.Item 
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名长度至少3位' },
                { max: 30, message: '用户名长度不能超过30位' }
              ]}
            >
              {editingUsername ? (
                <Input 
                  suffix={
                    <Space>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<SaveOutlined />} 
                        loading={usernameLoading}
                        onClick={handleUsernameSave}
                      >
                        保存
                      </Button>
                      <Button 
                        type="text" 
                        size="small" 
                        onClick={handleUsernameCancel}
                      >
                        取消
                      </Button>
                    </Space>
                  }
                />
              ) : (
                <Input 
                  disabled
                  suffix={
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<EditOutlined />} 
                      onClick={handleUsernameEdit}
                    >
                      编辑
                    </Button>
                  }
                />
              )}
            </Form.Item>
            <Form.Item label="邮箱">
              <Input value={user?.email} disabled />
            </Form.Item>
          </Form>
        </Card>

        {/* 密码安全 */}
        <Card>
          <Title level={3}>密码安全</Title>
          <Text type="secondary">定期修改密码可以保护您的账户安全</Text>
          
          <Divider />
          
          <div>
            <Text strong>修改密码</Text>
            <br />
            <Text type="secondary">通过邮箱验证码来修改您的密码</Text>
            <br />
            <Button 
              type="primary" 
              icon={<MailOutlined />}
              onClick={handlePasswordChange}
              style={{ marginTop: 8 }}
            >
              修改密码
            </Button>
          </div>
        </Card>
      </Space>

      {/* 密码修改模态框 */}
      <PasswordChangeModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        userEmail={user?.email || ''}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      {/* 头像上传模态框 */}
      <AvatarUploadModal
        visible={avatarModalVisible}
        onClose={() => setAvatarModalVisible(false)}
      />

      {/* 头像预览模态框 */}
      <Modal
        title="查看头像"
        open={avatarPreviewVisible}
        onCancel={() => setAvatarPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAvatarPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Image
            width={200}
            height={200}
            src={getUserAvatar()}
            style={{ 
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZDlkOWQ5Ii8+CjxwYXRoIGQ9Ik01MCA1MEM1MCA1MCA0NSA2NSA1MCA2NUM1NSA2NSA1MCA1MCA1MCA1MFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTM1IDM1QzM1IDM1IDM1IDQwIDM1IDQwQzM1IDQwIDQwIDQwIDQwIDQwQzQwIDQwIDQwIDM1IDQwIDM1QzQwIDM1IDM1IDM1IDM1IDM1WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNNjAgMzVDNjAgMzUgNjAgNDAgNjAgNDBDNjAgNDAgNjUgNDAgNjUgNDBDNjUgNDAgNjUgMzUgNjUgMzVDNjUgMzUgNjAgMzUgNjAgMzVaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo="
          />
          <div style={{ marginTop: 16, fontSize: '14px', color: '#666' }}>
            {user?.username || '用户'} 的头像
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;