import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Input, Select } from 'antd';
import { EyeOutlined, CopyOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { snippetsAPI } from '../services/api';
import { Snippet } from '../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface PublicListResponse {
  page: number;
  pageSize: number;
  total: number;
  snippets: Snippet[];
}

const PublicSnippetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Snippet[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const fetchData = async (p = page, ps = pageSize, search = searchText, language = selectedLanguage) => {
    try {
      setLoading(true);
      const res = await snippetsAPI.getPublicSnippets({ 
        page: p, 
        pageSize: ps,
        search: search,
        language: language
      });
      const payload = res.data as PublicListResponse;
      setData(payload.snippets || []);
      setPage(payload.page);
      setPageSize(payload.pageSize);
      setTotal(payload.total);
    } catch (err: any) {
      console.error('搜索失败:', err);
      message.error(err?.response?.data?.error || '搜索失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '无';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '无';
    return d.toLocaleString('zh-CN');
  };

  const handleCopyLink = async (snippet: Snippet) => {
    const link = `${window.location.origin}/s/${snippet.id}`;
    try {
      await navigator.clipboard.writeText(link);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  // 使用防抖优化搜索性能
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();

  // 处理搜索 - 参考管理员界面实现
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
    
    // 清除之前的定时器
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // 设置新的定时器
    debounceRef.current = setTimeout(() => {
      fetchData(1, pageSize, value, selectedLanguage);
    }, 500);
  };

  // 实时搜索处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // 清除之前的定时器
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // 如果输入框为空，立即搜索
    if (value === '') {
      setPage(1);
      fetchData(1, pageSize, '', selectedLanguage);
    } else {
      // 设置防抖搜索
      debounceRef.current = setTimeout(() => {
        setPage(1);
        fetchData(1, pageSize, value, selectedLanguage);
      }, 500);
    }
  };

  // 处理语言筛选
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setPage(1);
    fetchData(1, pageSize, searchText, value);
  };

  // 清除筛选条件
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedLanguage('');
    setPage(1);
    fetchData(1, pageSize, '', '');
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title || '未命名片段'}</Text>,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) => <Tag color="blue">{language}</Tag>,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator?: { username: string }) => (
        <Tag color="purple">{creator?.username || '匿名用户'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '预览',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => <Text>{content}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Snippet) => (
        <Space size="small"> 
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/s/${record.id}`)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<CopyOutlined />} 
            size="small"
            onClick={() => handleCopyLink(record)}
          >
            复制链接
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large"> 
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>公开代码片段</Title>
              <Text type="secondary">浏览所有用户公开分享的代码片段</Text>
            </div>
          </div>
        </Card>

        <Card>
          {/* 搜索和筛选区域 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Search
                placeholder="搜索片段标题或内容"
                onSearch={handleSearch}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
                value={searchText}
                onChange={handleInputChange}
              />
              
              <Select
                placeholder="选择编程语言"
                style={{ width: 150 }}
                value={selectedLanguage || undefined}
                onChange={handleLanguageChange}
                allowClear
              >
                <Option value="javascript">JavaScript</Option>
                <Option value="typescript">TypeScript</Option>
                <Option value="python">Python</Option>
                <Option value="java">Java</Option>
                <Option value="cpp">C++</Option>
                <Option value="csharp">C#</Option>
                <Option value="php">PHP</Option>
                <Option value="html">HTML</Option>
                <Option value="css">CSS</Option>
                <Option value="sql">SQL</Option>
                <Option value="plaintext">纯文本</Option>
              </Select>
              
              {(searchText || selectedLanguage) && (
                <Button 
                  type="link" 
                  icon={<ClearOutlined />} 
                  onClick={handleClearFilters}
                  style={{ color: '#ff4d4f' }}
                >
                  清除筛选
                </Button>
              )}
            </div>
            
            <div style={{ flex: 1, textAlign: 'right' }}>
              <Text type="secondary">
                共找到 {total} 个公开片段
                {searchText && `，搜索关键词: "${searchText}"`}
                {selectedLanguage && `，语言: ${selectedLanguage}`}
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
                fetchData(p, ps, searchText, selectedLanguage);
              },
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            locale={{
              emptyText: searchText || selectedLanguage ? 
                `没有找到符合条件的公开片段` : 
                '暂无公开代码片段'
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default PublicSnippetsPage;
