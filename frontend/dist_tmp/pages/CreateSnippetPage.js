import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Radio, message, Space, Typography } from 'antd';
import { SaveOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createSnippet, getSnippet, updateSnippet } from '../store/slices/snippetsSlice';
import { SUPPORTED_LANGUAGES, EXPIRATION_OPTIONS } from '../types';
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;
const CreateSnippetPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { isLoading, currentSnippet } = useAppSelector((state) => state.snippets);
    const [form] = Form.useForm();
    const [generatedLink, setGeneratedLink] = useState('');
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
    const onFinish = async (values) => {
        try {
            if (editId) {
                await dispatch(updateSnippet({ id: editId, snippetData: values })).unwrap();
                message.success('代码片段更新成功！');
                navigate(`/s/${editId}`);
            }
            else {
                const result = await dispatch(createSnippet(values)).unwrap();
                const appBase = import.meta?.env?.VITE_PUBLIC_BASE_URL || window.location.origin;
                const shareBase = import.meta?.env?.VITE_PUBLIC_SHARE_BASE_URL || import.meta?.env?.VITE_API_BASE_URL || '';
                const appLink = `${appBase}/s/${result.snippet.id}`;
                const shareLink = shareBase ? `${shareBase}/snippets/share/${result.snippet.id}` : appLink;
                setGeneratedLink(shareLink);
                message.success('代码片段创建成功！');
            }
        }
        catch (error) {
            message.error(error || '保存失败');
        }
    };
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            message.success('链接已复制到剪贴板');
        }
        catch (error) {
            message.error('复制失败');
        }
    };
    return (_jsxs("div", { style: { maxWidth: 800, margin: '0 auto', padding: '24px' }, children: [_jsx(Title, { level: 2, children: editId ? '编辑代码片段' : '创建代码片段' }), _jsxs(Card, { children: [_jsxs(Form, { form: form, layout: "vertical", onFinish: onFinish, initialValues: {
                            language: 'plaintext',
                            isPrivate: false,
                            expiresIn: null
                        }, children: [_jsx(Form.Item, { name: "title", label: "\u7247\u6BB5\u6807\u9898\uFF08\u53EF\u9009\uFF09", children: _jsx(Input, { placeholder: "\u8F93\u5165\u7247\u6BB5\u6807\u9898\uFF0C\u5982\uFF1A\u6392\u5E8F\u7B97\u6CD5\u5B9E\u73B0" }) }), _jsx(Form.Item, { name: "content", label: "\u4EE3\u7801\u5185\u5BB9", rules: [{ required: true, message: '请输入代码内容' }], children: _jsx(TextArea, { rows: 15, placeholder: "\u5728\u6B64\u8F93\u5165\u60A8\u7684\u4EE3\u7801...", style: { fontFamily: 'Monaco, Consolas, monospace', fontSize: 14 } }) }), _jsx(Form.Item, { name: "language", label: "\u7F16\u7A0B\u8BED\u8A00", rules: [{ required: true, message: '请选择编程语言' }], children: _jsx(Select, { style: { width: 200 }, children: SUPPORTED_LANGUAGES.map(lang => (_jsx(Option, { value: lang.value, children: lang.label }, lang.value))) }) }), _jsx(Form.Item, { name: "expiresIn", label: "\u8FC7\u671F\u65F6\u95F4", children: _jsx(Select, { style: { width: 200 }, children: EXPIRATION_OPTIONS.map(option => (_jsx(Option, { value: option.value, children: option.label }, option.value || 'never'))) }) }), _jsx(Form.Item, { name: "isPrivate", label: "\u8BBF\u95EE\u6743\u9650", children: _jsxs(Radio.Group, { children: [_jsx(Radio, { value: false, children: "\u516C\u5F00\uFF08\u4EFB\u4F55\u4EBA\u53EF\u901A\u8FC7\u94FE\u63A5\u8BBF\u95EE\uFF09" }), _jsx(Radio, { value: true, children: "\u79C1\u5BC6\uFF08\u4EC5\u81EA\u5DF1\u53EF\u8BBF\u95EE\uFF09" })] }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", icon: _jsx(SaveOutlined, {}), loading: isLoading, size: "large", children: editId ? '保存修改' : '创建片段' }) })] }), !editId && generatedLink && (_jsx(Card, { title: "\u5206\u4EAB\u94FE\u63A5\uFF08\u53EF\u516C\u5F00\u8BBF\u95EE\uFF09", style: { marginTop: 24 }, extra: _jsx(Button, { icon: _jsx(CopyOutlined, {}), onClick: copyToClipboard, children: "\u590D\u5236\u94FE\u63A5" }), children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Input, { value: generatedLink, readOnly: true }), _jsx(Button, { type: "link", onClick: () => window.open(generatedLink, '_blank'), children: "\u6253\u5F00\u5206\u4EAB\u9875" })] }) }))] })] }));
};
export default CreateSnippetPage;
