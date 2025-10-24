import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Typography, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getUserSnippets, deleteSnippet } from '../store/slices/snippetsSlice';
const { Title, Text } = Typography;
const DashboardPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const { snippets, isLoading } = useAppSelector((state) => state.snippets);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [snippetToDelete, setSnippetToDelete] = useState(null);
    useEffect(() => {
        if (user) {
            dispatch(getUserSnippets(user.id));
        }
    }, [user, dispatch]);
    const handleCopyLink = async (snippet) => {
        const link = `${window.location.origin}/s/${snippet.id}`;
        try {
            await navigator.clipboard.writeText(link);
            message.success('链接已复制到剪贴板');
        }
        catch (error) {
            message.error('复制失败');
        }
    };
    const handleEdit = (snippet) => {
        navigate(`/create?edit=${snippet.id}`);
    };
    const handleDelete = (snippet) => {
        setSnippetToDelete(snippet);
        setDeleteModalVisible(true);
    };
    const confirmDelete = async () => {
        if (snippetToDelete) {
            try {
                await dispatch(deleteSnippet(snippetToDelete.id)).unwrap();
                message.success('代码片段已删除');
            }
            catch (error) {
                message.error(error || '删除失败');
            }
            setDeleteModalVisible(false);
            setSnippetToDelete(null);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-CN');
    };
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (_jsx(Text, { strong: true, children: title || '未命名片段' })),
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            render: (language) => (_jsx(Tag, { color: "blue", children: language })),
        },
        {
            title: '权限',
            dataIndex: 'isPrivate',
            key: 'isPrivate',
            render: (isPrivate) => (_jsx(Tag, { color: isPrivate ? 'red' : 'green', children: isPrivate ? '私密' : '公开' })),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: '状态',
            key: 'status',
            render: (record) => (record.isExpired ? (_jsx(Tag, { color: "orange", children: "\u5DF2\u8FC7\u671F" })) : (_jsx(Tag, { color: "green", children: "\u6709\u6548" }))),
        },
        {
            title: '操作',
            key: 'action',
            render: (record) => (_jsxs(Space, { size: "small", children: [_jsx(Button, { type: "link", icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => navigate(`/s/${record.id}`), children: "\u67E5\u770B" }), _jsx(Button, { type: "link", icon: _jsx(CopyOutlined, {}), size: "small", onClick: () => handleCopyLink(record), disabled: record.isExpired, children: "\u590D\u5236\u94FE\u63A5" }), _jsx(Button, { type: "link", icon: _jsx(EditOutlined, {}), size: "small", onClick: () => handleEdit(record), children: "\u7F16\u8F91" }), _jsx(Button, { type: "link", icon: _jsx(DeleteOutlined, {}), size: "small", danger: true, onClick: () => handleDelete(record), children: "\u5220\u9664" })] })),
        },
    ];
    return (_jsxs("div", { style: { maxWidth: 1200, margin: '0 auto', padding: '24px' }, children: [_jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "large", children: [_jsx(Card, { children: _jsxs(Space, { style: { width: '100%', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx(Title, { level: 2, style: { margin: 0 }, children: "\u6211\u7684\u4EE3\u7801\u7247\u6BB5" }), _jsx(Text, { type: "secondary", children: "\u7BA1\u7406\u60A8\u521B\u5EFA\u7684\u6240\u6709\u4EE3\u7801\u7247\u6BB5" })] }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => navigate('/create'), children: "\u65B0\u5EFA\u7247\u6BB5" })] }) }), _jsx(Card, { children: snippets.length === 0 ? (_jsx(Empty, { description: "\u60A8\u8FD8\u6CA1\u6709\u521B\u5EFA\u4EFB\u4F55\u4EE3\u7801\u7247\u6BB5", image: Empty.PRESENTED_IMAGE_SIMPLE, children: _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => navigate('/create'), children: "\u521B\u5EFA\u7B2C\u4E00\u4E2A\u7247\u6BB5" }) })) : (_jsx(Table, { columns: columns, dataSource: snippets, rowKey: "id", loading: isLoading, pagination: {
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                            } })) })] }), _jsxs(Modal, { title: "\u786E\u8BA4\u5220\u9664", open: deleteModalVisible, onOk: confirmDelete, onCancel: () => setDeleteModalVisible(false), okText: "\u786E\u8BA4\u5220\u9664", cancelText: "\u53D6\u6D88", okType: "danger", children: [_jsxs("p", { children: ["\u786E\u5B9A\u8981\u5220\u9664\u4EE3\u7801\u7247\u6BB5 \"", snippetToDelete?.title || '未命名片段', "\" \u5417\uFF1F"] }), _jsx("p", { style: { color: '#ff4d4f' }, children: "\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01" })] })] }));
};
export default DashboardPage;
