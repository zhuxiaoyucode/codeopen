import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Steps, Alert } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

const { Text } = Typography;
const { Step } = Steps;

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  visible,
  onClose,
  userEmail,
  currentStep: externalCurrentStep = 0,
  onStepChange
}) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [internalCurrentStep, setInternalCurrentStep] = useState(externalCurrentStep);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // 使用外部步骤或内部步骤
  const currentStep = onStepChange ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = onStepChange ? onStepChange : setInternalCurrentStep;

  // 重置表单和状态
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setCurrentStep(0);
      setCountdown(0);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [visible, form]);

  // 自动清除消息
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 倒计时处理
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    try {
      setSendingCode(true);
      const email = form.getFieldValue('email') || userEmail;
      
      if (!email) {
        setErrorMessage('请输入邮箱地址');
        return;
      }

      await authAPI.sendVerificationCode(email);
      setSuccessMessage('验证码已发送到您的邮箱');
      setCountdown(60); // 60秒倒计时
      setCurrentStep(1);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || '发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };



  // 提交密码修改
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 通过邮箱验证码修改
      await authAPI.resetPasswordWithCode({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword
      });
      setSuccessMessage('密码重置成功');

      onClose();
      form.resetFields();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码是否正确
  const handleVerifyCode = async () => {
    try {
      const email = form.getFieldValue('email') || userEmail;
      const code = form.getFieldValue('code');

      if (!email || !code) {
        setErrorMessage('请输入邮箱和验证码');
        return false;
      }

      const response = await authAPI.verifyCode(email, code);
      if (response.data.verified) {
        setSuccessMessage('验证码验证成功');
        return true;
      } else {
        setErrorMessage('验证码错误或已过期');
        return false;
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || '验证码验证失败');
      return false;
    }
  };

  const steps = [
    {
      title: '验证邮箱',
      content: (
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="请输入您的邮箱地址" 
            disabled={currentStep > 0}
          />
        </Form.Item>
      )
    },
    {
      title: '输入验证码',
      content: (
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
            style={{ flex: 1 }}
          >
            <Input 
              prefix={<SafetyOutlined />} 
              placeholder="请输入6位验证码" 
              maxLength={6}
            />
          </Form.Item>
          <Button
            onClick={handleSendCode}
            disabled={sendingCode || countdown > 0}
            loading={sendingCode}
          >
            {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
          </Button>
        </Space.Compact>
      )
    },
    {
      title: '设置新密码',
      content: (
        <>
          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入新密码（至少6位）" 
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<CheckCircleOutlined />} 
              placeholder="请确认新密码" 
            />
          </Form.Item>
        </>
      )
    }
  ];

  const modalTitle = '通过邮箱重置密码';

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnHidden
    >
      {visible && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          <Step title="验证邮箱" />
          <Step title="输入验证码" />
          <Step title="设置新密码" />
        </Steps>

        {/* 显示错误信息 */}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setErrorMessage('')}
          />
        )}

        {/* 显示成功信息 */}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* 动态显示步骤内容 */}
        {steps.map((step, index) => (
          <div key={index} style={{ display: currentStep === index ? 'block' : 'none' }}>
            {step.content}
          </div>
        ))}



        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            {currentStep < 2 ? (
              <Button 
                type="primary" 
                onClick={async () => {
                  if (currentStep === 1) {
                    const isValid = await handleVerifyCode();
                    if (!isValid) return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                disabled={currentStep === 1 && !form.getFieldValue('code')}
              >
                下一步
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                确认修改
              </Button>
            )}
          </Space>
        </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default PasswordChangeModal;