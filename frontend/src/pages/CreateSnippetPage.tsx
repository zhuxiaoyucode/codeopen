import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Input, Select, Button, Radio, message, Space, Typography } from 'antd';
import { SaveOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createSnippet, getSnippet, updateSnippet } from '../store/slices/snippetsSlice';
import { SnippetFormData, SUPPORTED_LANGUAGES, EXPIRATION_OPTIONS } from '../types';
import Editor, { OnMount } from '@monaco-editor/react';
import CodeHighlighter from '../components/CodeHighlighter';
import { initializeMonaco } from '../utils/monacoSetup';
import { useThemeMode } from '../theme/ThemeContext';

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

  const [editorValue, setEditorValue] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('plaintext');
  const { mode } = useThemeMode();

  useEffect(() => {
    if (editId) {
      dispatch(getSnippet(editId));
    }
  }, [editId, dispatch]);

  useEffect(() => {
    if (editId && currentSnippet) {
      form.setFieldsValue({
        title: currentSnippet.title,
        content: currentSnippet.content,
        language: currentSnippet.language,
        isPrivate: currentSnippet.isPrivate,
      });
      setEditorValue(currentSnippet.content || '');
      setSelectedLanguage(currentSnippet.language || 'plaintext');
    }
  }, [editId, currentSnippet, form]);

  const onFinish = async (values: SnippetFormData) => {
    try {
      const payload: SnippetFormData = {
        ...values,
        content: editorValue,
        language: selectedLanguage,
      };

      if (editId) {
        await dispatch(updateSnippet({ id: editId, snippetData: payload })).unwrap();
        message.success('代码片段更新成功！');
        navigate(`/s/${editId}`);
      } else {
        const result = await dispatch(createSnippet(payload)).unwrap();
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

  const monacoLanguage = useMemo(() => {
    const found = SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage);
    // Monaco 的语言ID与我们列表基本一致，部分需要映射（如 cpp -> cpp, csharp -> csharp）。
    return found?.prismLang === 'plaintext' ? 'plaintext' : found?.value || 'plaintext';
  }, [selectedLanguage]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
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
          <Form.Item name="title" label="片段标题（可选）">
            <Input placeholder="输入片段标题，如：排序算法实现" />
          </Form.Item>

          <Form.Item name="language" label="编程语言" rules={[{ required: true, message: '请选择编程语言' }]}> 
            <Select style={{ width: 240 }} value={selectedLanguage} onChange={(val) => setSelectedLanguage(val)}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <Option key={lang.value} value={lang.value}>{lang.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="代码内容" required>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <Editor
                height="420px"
                language={monacoLanguage}
                value={editorValue}
                onChange={(val) => setEditorValue(val || '')}
                theme={mode === 'dark' ? 'vs-dark' : 'vs-light'}
                onMount={(editor, monaco) => { initializeMonaco(monaco); }}
                options={{
                  fontFamily: 'Monaco, Consolas, Menlo, monospace',
                  fontSize: 14,
                  lineHeight: 22,
                  wordWrap: 'on',
                  wrappingIndent: 'indent',
                  renderWhitespace: 'boundary',
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  snippetSuggestions: 'inline',
                  minimap: { enabled: false },
                  scrollbar: { vertical: 'auto' },
                  automaticLayout: true,
                }}
              />
            </div>
          </Form.Item>

          <Form.Item name="expiresIn" label="过期时间">
            <Select style={{ width: 200 }}>
              {EXPIRATION_OPTIONS.map(option => (
                <Option key={option.value || 'never'} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isPrivate" label="访问权限">
            <Radio.Group>
              <Radio value={false}>公开（任何人可通过链接访问）</Radio>
              <Radio value={true}>私密（仅自己可访问）</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} size="large">
                {editId ? '保存修改' : '创建片段'}
              </Button>
              {generatedLink && (
                <Button icon={<CopyOutlined />} onClick={copyToClipboard}>复制链接</Button>
              )}
            </Space>
          </Form.Item>
        </Form>

        {/* 实时预览（语法高亮） */}
        <Card title="预览" style={{ marginTop: 16 }}>
          <CodeHighlighter code={editorValue} language={selectedLanguage} showLineNumbers />
        </Card>
      </Card>
    </div>
  );
};

export default CreateSnippetPage;
