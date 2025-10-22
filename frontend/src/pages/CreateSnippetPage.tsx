import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Radio, message, Space, Typography } from 'antd';
import { SaveOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createSnippet, getSnippet, updateSnippet } from '../store/slices/snippetsSlice';
import { SnippetFormData, SUPPORTED_LANGUAGES, EXPIRATION_OPTIONS } from '../types';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const CreateSnippetPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, currentSnippet } = useAppSelector((state) => state.snippets);
  
  const [form] = Form.useForm();
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  React.useEffect(() => {
    if (editId) {
      dispatch(getSnippet(editId));
    }
  }, [editId, dispatch]);

  React.useEffect(() => {
    if (editId && currentSnippet) {
      form.setFieldsValue({
        title: currentSnippet.title,
        content: currentSnippet.content,
        language: currentSnippet.language,
        isPrivate: currentSnippet.isPrivate,
        // expiresIn: 保持为空，用户可自行重新设置
      });
    }
  }, [editId, currentSnippet, form]);

  const onFinish = async (values: SnippetFormData) => {
    try {
      if (editId) {
        await dispatch(updateSnippet({ id: editId, snippetData: values })).unwrap();
        message.success('代码片段更新成功！');
        navigate(`/s/${editId}`);
      } else {
        const result = await dispatch(createSnippet(values)).unwrap();
        const appBase = (import.meta as any)?.env?.VITE_PUBLIC_BASE_URL || window.location.origin;
        const shareBase = (import.meta as any)?.env?.VITE_PUBLIC_SHARE_BASE_URL || (import.meta as any)?.env?.VITE_API_BASE_URL || '';
        const appLink = `${appBase}/s/${result.snippet.id}`;
        const shareLink = shareBase ? `${shareBase}/snippets/share/${result.snippet.id}` : appLink;
        setGeneratedLink(shareLink);
        message.success('代码片段创建成功！');
      }
    } catch (error: any) {
      message.error(error || '保存失败');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>{editId ? '编辑代码片段' : '创建代码片段'}</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            language: 'plaintext',
            isPrivate: false,
            expiresIn: null
          }}
        >
          <Form.Item
            name="title"
            label="片段标题（可选）"
          >
            <Input placeholder="输入片段标题，如：排序算法实现" />
          </Form.Item>

          <Form.Item
            name="content"
            label="代码内容"
            rules={[{ required: true, message: '请输入代码内容' }]}
          >
            <TextArea
              rows={15}
              placeholder="在此输入您的代码..."
              style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: 14 }}
            />
          </Form.Item>

          <Form.Item
            name="language"
            label="编程语言"
            rules={[{ required: true, message: '请选择编程语言' }]}
          >
            <Select style={{ width: 200 }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <Option key={lang.value} value={lang.value}>
                  {lang.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expiresIn"
            label="过期时间"
          >
            <Select style={{ width: 200 }}>
              {EXPIRATION_OPTIONS.map(option => (
                <Option key={option.value || 'never'} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isPrivate"
            label="访问权限"
          >
            <Radio.Group>
              <Radio value={false}>公开（任何人可通过链接访问）</Radio>
              <Radio value={true}>私密（仅自己可访问）</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={isLoading}
              size="large"
            >
              {editId ? '保存修改' : '创建片段'}
            </Button>
          </Form.Item>
        </Form>

        {!editId && generatedLink && (
          <Card 
            title="分享链接（可公开访问）" 
            style={{ marginTop: 24 }}
            extra={
              <Button 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
              >
                复制链接
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input value={generatedLink} readOnly />
              <Button type="link" onClick={() => window.open(generatedLink, '_blank')}>
                打开分享页
              </Button>
            </Space>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default CreateSnippetPage;