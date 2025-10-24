import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Alert, Spin, Tag } from 'antd';
import { CopyOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getSnippet } from '../store/slices/snippetsSlice';
import CodeHighlighter from '../components/CodeHighlighter';
const { Title, Paragraph } = Typography;
const ViewSnippetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentSnippet, isLoading, error } = useAppSelector((state) => state.snippets);
    const { user } = useAppSelector((state) => state.auth);
    const [isCopied, setIsCopied] = useState(false);
    useEffect(() => {
        if (id) {
            dispatch(getSnippet(id));
        }
    }, [id, dispatch]);
    const copyToClipboard = async () => {
        if (!currentSnippet)
            return;
        try {
            await navigator.clipboard.writeText(currentSnippet.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
        catch (error) {
            console.error('复制失败:', error);
        }
    };
    const isValidDate = (input) => {
        if (!input)
            return false;
        const d = new Date(input);
        return !isNaN(d.getTime());
    };
    const formatDate = (dateString) => {
        if (!isValidDate(dateString))
            return '无';
        return new Date(dateString).toLocaleString('zh-CN');
    };
    if (isLoading) {
        return (_jsx("div", { style: { textAlign: 'center', padding: 100 }, children: _jsx(Spin, { size: "large" }) }));
    }
    if (error) {
        return (_jsx("div", { style: { maxWidth: 800, margin: '0 auto', padding: 24 }, children: _jsx(Alert, { message: "\u9519\u8BEF", description: error, type: "error", showIcon: true, action: _jsx(Button, { size: "small", onClick: () => navigate('/'), children: "\u8FD4\u56DE\u9996\u9875" }) }) }));
    }
    if (!currentSnippet) {
        return (_jsx("div", { style: { maxWidth: 800, margin: '0 auto', padding: 24 }, children: _jsx(Alert, { message: "\u4EE3\u7801\u7247\u6BB5\u4E0D\u5B58\u5728", description: "\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u6B63\u786E", type: "warning", showIcon: true }) }));
    }
    const isOwner = user && currentSnippet.creatorId === user.id;
    const isExpired = typeof currentSnippet.isExpired === 'boolean'
        ? currentSnippet.isExpired
        : (isValidDate(currentSnippet.expiresAt)
            ? new Date(currentSnippet.expiresAt).getTime() < Date.now()
            : false);
    return (_jsx("div", { style: { maxWidth: 1000, margin: '0 auto', padding: '24px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "large", children: [_jsx(Card, { children: _jsxs(Space, { style: { width: '100%', justifyContent: 'space-between' }, children: [_jsx(Button, { icon: _jsx(ArrowLeftOutlined, {}), onClick: () => navigate('/'), children: "\u8FD4\u56DE" }), _jsxs(Space, { children: [_jsx(Button, { icon: _jsx(CopyOutlined, {}), onClick: copyToClipboard, disabled: isExpired, children: isCopied ? '已复制' : '复制代码' }), isOwner && (_jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => navigate(`/dashboard?edit=${currentSnippet.id}`), children: "\u7F16\u8F91" }))] })] }) }), _jsx(Card, { children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "middle", children: [_jsxs("div", { children: [_jsx(Title, { level: 3, style: { margin: 0 }, children: currentSnippet.title || '未命名片段' }), _jsxs(Space, { style: { marginTop: 8 }, children: [_jsx(Tag, { color: "blue", children: currentSnippet.language }), _jsx(Tag, { color: currentSnippet.isPrivate ? 'red' : 'green', children: currentSnippet.isPrivate ? '私密' : '公开' }), isExpired && _jsx(Tag, { color: "orange", children: "\u5DF2\u8FC7\u671F" }), isValidDate(currentSnippet.expiresAt) && (_jsxs(Tag, { color: isExpired ? 'red' : 'cyan', children: ["\u8FC7\u671F\u65F6\u95F4: ", formatDate(currentSnippet.expiresAt)] }))] })] }), _jsxs(Paragraph, { type: "secondary", children: ["\u521B\u5EFA\u65F6\u95F4: ", formatDate(currentSnippet.createdAt), currentSnippet.creatorId && ' • 由用户创建'] }), isExpired && (_jsx(Alert, { message: "\u6B64\u4EE3\u7801\u7247\u6BB5\u5DF2\u8FC7\u671F", description: "\u7247\u6BB5\u5185\u5BB9\u5DF2\u65E0\u6CD5\u8BBF\u95EE", type: "warning", showIcon: true }))] }) }), !isExpired && (_jsx(Card, { title: "\u4EE3\u7801\u5185\u5BB9", children: _jsx(CodeHighlighter, { code: currentSnippet.content, language: currentSnippet.language }) }))] }) }));
};
export default ViewSnippetPage;
