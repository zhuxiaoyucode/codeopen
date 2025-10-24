import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { registerUser, getCurrentUser } from '../store/slices/authSlice';
const { Title, Text } = Typography;
const RegisterPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const onFinish = async (values) => {
        try {
            await dispatch(registerUser({
                username: values.username,
                email: values.email,
                password: values.password
            })).unwrap();
            await dispatch(getCurrentUser());
            navigate('/dashboard');
        }
        catch (error) {
            // 错误处理在slice中已完成
        }
    };
    return (_jsx("div", { style: {
            maxWidth: 400,
            margin: '50px auto',
            padding: '0 24px'
        }, children: _jsxs(Card, { children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 32 }, children: [_jsx(Title, { level: 2, children: "\u6CE8\u518C" }), _jsx(Text, { type: "secondary", children: "\u521B\u5EFA\u60A8\u7684 CodeShare \u8D26\u53F7" })] }), _jsxs(Form, { name: "register", onFinish: onFinish, layout: "vertical", requiredMark: false, children: [_jsx(Form.Item, { name: "username", rules: [
                                { required: true, message: '请输入用户名' },
                                { min: 3, message: '用户名至少3个字符' },
                                { max: 30, message: '用户名最多30个字符' }
                            ], children: _jsx(Input, { prefix: _jsx(UserOutlined, {}), placeholder: "\u7528\u6237\u540D", size: "large" }) }), _jsx(Form.Item, { name: "email", rules: [
                                { required: true, message: '请输入邮箱地址' },
                                { type: 'email', message: '请输入有效的邮箱地址' }
                            ], children: _jsx(Input, { prefix: _jsx(MailOutlined, {}), placeholder: "\u90AE\u7BB1\u5730\u5740", size: "large" }) }), _jsx(Form.Item, { name: "password", rules: [
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' }
                            ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, {}), placeholder: "\u5BC6\u7801", size: "large" }) }), _jsx(Form.Item, { name: "confirmPassword", dependencies: ['password'], rules: [
                                { required: true, message: '请确认密码' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次输入的密码不一致'));
                                    },
                                }),
                            ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, {}), placeholder: "\u786E\u8BA4\u5BC6\u7801", size: "large" }) }), error && (_jsx("div", { style: { color: '#ff4d4f', textAlign: 'center', marginBottom: 16 }, children: error })), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", loading: isLoading, size: "large", block: true, children: "\u6CE8\u518C" }) })] }), _jsx(Divider, { children: "\u6216" }), _jsxs(Space, { direction: "vertical", style: { width: '100%', textAlign: 'center' }, children: [_jsx(Text, { type: "secondary", children: "\u5DF2\u6709\u8D26\u53F7\uFF1F" }), _jsx(Link, { to: "/login", children: _jsx(Button, { type: "link", size: "large", children: "\u7ACB\u5373\u767B\u5F55" }) })] })] }) }));
};
export default RegisterPage;
