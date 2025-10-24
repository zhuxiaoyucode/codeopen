import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, getCurrentUser } from '../store/slices/authSlice';
const { Title, Text } = Typography;
const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const onFinish = async (values) => {
        try {
            await dispatch(loginUser(values)).unwrap();
            await dispatch(getCurrentUser());
            navigate('/dashboard');
        }
        catch (error) {
            // 错误处理在slice中已完成
        }
    };
    return (_jsx("div", { style: {
            maxWidth: 400,
            margin: '100px auto',
            padding: '0 24px'
        }, children: _jsxs(Card, { children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 32 }, children: [_jsx(Title, { level: 2, children: "\u767B\u5F55" }), _jsx(Text, { type: "secondary", children: "\u6B22\u8FCE\u56DE\u5230 CodeShare" })] }), _jsxs(Form, { name: "login", onFinish: onFinish, layout: "vertical", requiredMark: false, children: [_jsx(Form.Item, { name: "email", rules: [
                                { required: true, message: '请输入邮箱地址' },
                                { type: 'email', message: '请输入有效的邮箱地址' }
                            ], children: _jsx(Input, { prefix: _jsx(MailOutlined, {}), placeholder: "\u90AE\u7BB1\u5730\u5740", size: "large" }) }), _jsx(Form.Item, { name: "password", rules: [{ required: true, message: '请输入密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, {}), placeholder: "\u5BC6\u7801", size: "large" }) }), error && (_jsx("div", { style: { color: '#ff4d4f', textAlign: 'center', marginBottom: 16 }, children: error })), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", loading: isLoading, size: "large", block: true, children: "\u767B\u5F55" }) })] }), _jsx(Divider, { children: "\u6216" }), _jsxs(Space, { direction: "vertical", style: { width: '100%', textAlign: 'center' }, children: [_jsx(Text, { type: "secondary", children: "\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F" }), _jsx(Link, { to: "/register", children: _jsx(Button, { type: "link", size: "large", children: "\u7ACB\u5373\u6CE8\u518C" }) })] })] }) }));
};
export default LoginPage;
