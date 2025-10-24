import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
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
import SandboxRunnerPage from './pages/SandboxRunnerPage';
import './App.css';
const { Content, Footer } = Layout;
const App = () => {
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
        return _jsx("div", { children: "\u52A0\u8F7D\u4E2D..." });
    }
    return (_jsxs(Layout, { className: "app-layout", children: [_jsx(Header, {}), _jsx(Content, { className: "app-content", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/create", element: _jsx(CreateSnippetPage, {}) }), _jsx(Route, { path: "/s/:id", element: _jsx(ViewSnippetPage, {}) }), _jsx(Route, { path: "/explore", element: _jsx(PublicSnippetsPage, {}) }), _jsx(Route, { path: "/sandbox", element: _jsx(SandboxRunnerPage, {}) }), _jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: isAuthenticated ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }), _jsx(Footer, { className: "app-footer", children: "CodeShare \u00A92023 - \u5728\u7EBF\u4EE3\u7801\u7247\u6BB5\u5171\u4EAB\u5E73\u53F0" })] }));
};
export default App;
