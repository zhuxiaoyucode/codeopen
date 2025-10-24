import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CodeOutlined, PlusOutlined, UserOutlined, LoginOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
const { Header: AntHeader } = Layout;
const AppHeader = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth);
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };
    const userMenuItems = [
        {
            key: 'dashboard',
            icon: _jsx(DashboardOutlined, {}),
            label: '我的片段',
            onClick: () => navigate('/dashboard')
        },
        {
            key: 'logout',
            icon: _jsx(LogoutOutlined, {}),
            label: '退出登录',
            onClick: handleLogout
        }
    ];
    return (_jsx(AntHeader, { style: {
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            padding: '0 24px'
        }, children: _jsxs("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: 1200,
                margin: '0 auto'
            }, children: [_jsxs(Link, { to: "/", style: {
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit'
                    }, children: [_jsx(CodeOutlined, { style: { fontSize: 24, color: '#1890ff', marginRight: 8 } }), _jsx("span", { style: {
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#1890ff'
                            }, children: "CodeShare" })] }), _jsx(Menu, { mode: "horizontal", selectedKeys: [location.pathname], style: { border: 'none', flex: 1, justifyContent: 'center' }, items: [
                        {
                            key: '/',
                            label: _jsx(Link, { to: "/", children: "\u9996\u9875" })
                        },
                        {
                            key: '/create',
                            label: _jsx(Link, { to: "/create", children: "\u521B\u5EFA\u7247\u6BB5" })
                        }
                    ] }), _jsx(Space, { size: "middle", children: user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/create", children: _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), children: "\u65B0\u5EFA\u7247\u6BB5" }) }), _jsx(Dropdown, { menu: { items: userMenuItems }, placement: "bottomRight", children: _jsxs(Space, { style: { cursor: 'pointer' }, children: [_jsx(Avatar, { icon: _jsx(UserOutlined, {}) }), _jsxs("span", { children: ["\u4F60\u597D\uFF0C", user.username] })] }) })] })) : (_jsxs(Space, { children: [_jsxs(Button, { onClick: () => navigate('/login'), children: [_jsx(LoginOutlined, {}), " \u767B\u5F55"] }), _jsx(Button, { type: "primary", onClick: () => navigate('/register'), children: "\u6CE8\u518C" })] })) })] }) }));
};
export default AppHeader;
