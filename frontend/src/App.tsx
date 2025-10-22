import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
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
import './App.css';

const { Content, Footer } = Layout;

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user || !!localStorage.getItem('token');

  useEffect(() => {
    // 检查用户登录状态
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  if (isLoading && !user) {
    return <div>加载中...</div>;
  }

  return (
    <Layout className="app-layout">
      <Header />
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateSnippetPage />} />
          <Route path="/s/:id" element={<ViewSnippetPage />} />
          <Route path="/explore" element={<PublicSnippetsPage />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
      <Footer className="app-footer">
        CodeShare ©2023 - 在线代码片段共享平台
      </Footer>
    </Layout>
  );
};

export default App;