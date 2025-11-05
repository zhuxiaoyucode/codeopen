import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme as antdTheme } from 'antd';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getCurrentUser } from './store/slices/authSlice';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import CreateSnippetPage from './pages/CreateSnippetPage';
import ViewSnippetPage from './pages/ViewSnippetPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicSnippetsPage from './pages/PublicSnippetsPage';
import SandboxRunnerPage from './pages/SandboxRunnerPage';
import GlobalChatPage from './pages/GlobalChatPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PrivateSnippetsPage from './pages/PrivateSnippetsPage';
import { ThemeProvider, useThemeMode } from './theme/ThemeContext';
import './App.css';

const { Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user && !!localStorage.getItem('token');
  const { mode } = useThemeMode();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  // 等待用户数据加载完成
  if (isLoading && !user) {
    return <div>加载中...</div>;
  }

  // 管理员权限检查函数
  const isAdmin = () => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin';
  };

  return (
    <ConfigProvider theme={{ algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <Layout className={`app-layout ${mode}`}>
        <Header />
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateSnippetPage />} />
            <Route path="/s/:id" element={<ViewSnippetPage />} />
            <Route path="/explore" element={<PublicSnippetsPage />} />
            <Route path="/sandbox" element={<SandboxRunnerPage />} />
            <Route path="/chat" element={<GlobalChatPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={isAuthenticated && isAdmin() ? <AdminDashboardPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/admin/private-snippets" element={isAuthenticated && isAdmin() ? <PrivateSnippetsPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
        <Footer className="app-footer">
          CodeShare ©2023 - 在线代码片段共享平台
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
