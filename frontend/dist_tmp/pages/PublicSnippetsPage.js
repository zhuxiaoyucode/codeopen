import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message } from 'antd';
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { snippetsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;
const PublicSnippetsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const fetchData = async (p = page, ps = pageSize) => {
        try {
            setLoading(true);
            const res = await snippetsAPI.getPublicSnippets({ page: p, pageSize: ps });
            const payload = res.data;
            setData(payload.snippets || []);
            setPage(payload.page);
            setPageSize(payload.pageSize);
            setTotal(payload.total);
        }
        catch (err) {
            message.error(err?.response?.data?.error || '加载公开片段失败');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData(1, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const formatDate = (dateString) => {
        if (!dateString)
            return '无';
        const d = new Date(dateString);
        if (isNaN(d.getTime()))
            return '无';
        return d.toLocaleString('zh-CN');
    };
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
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (title) => _jsx(Text, { strong: true, children: title || '未命名片段' }),
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            render: (language) => _jsx(Tag, { color: "blue", children: language }),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: '预览',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            render: (content) => _jsx(Text, { children: content }),
        },
        {
            title: '操作',
            key: 'action',
            render: (record) => (_jsxs(Space, { size: "small", children: [_jsx(Button, { type: "link", icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => navigate(`/s/${record.id}`), children: "\u67E5\u770B" }), _jsx(Button, { type: "link", icon: _jsx(CopyOutlined, {}), size: "small", onClick: () => handleCopyLink(record), children: "\u590D\u5236\u94FE\u63A5" })] })),
        },
    ];
    return (_jsx("div", { style: { maxWidth: 1200, margin: '0 auto', padding: '24px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "large", children: [_jsx(Card, { children: _jsx(Space, { style: { width: '100%', justifyContent: 'space-between' }, children: _jsxs("div", { children: [_jsx(Title, { level: 2, style: { margin: 0 }, children: "\u516C\u5F00\u4EE3\u7801\u7247\u6BB5" }), _jsx(Text, { type: "secondary", children: "\u6D4F\u89C8\u6240\u6709\u7528\u6237\u516C\u5F00\u5206\u4EAB\u7684\u4EE3\u7801\u7247\u6BB5" })] }) }) }), _jsx(Card, { children: _jsx(Table, { columns: columns, dataSource: data, rowKey: "id", loading: loading, pagination: {
                            current: page,
                            pageSize,
                            total,
                            onChange: (p, ps) => {
                                setPage(p);
                                setPageSize(ps);
                                fetchData(p, ps);
                            },
                            showSizeChanger: true,
                            showQuickJumper: true,
                        } }) })] }) }));
};
export default PublicSnippetsPage;
