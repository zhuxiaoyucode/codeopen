import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Select, Input, Button, Typography, Space } from 'antd';
import { snippetsAPI } from '../services/api';
const { Option } = Select;
const { Text } = Typography;
import { SUPPORTED_LANGUAGES } from '../types';
const languages = SUPPORTED_LANGUAGES.map(l => ({ label: l.label, value: l.value }));
export default function SandboxRunnerPage() {
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState("console.log('hello sandbox')");
    const [loading, setLoading] = useState(false);
    const [stdout, setStdout] = useState('');
    const [stderr, setStderr] = useState('');
    const [durationMs, setDurationMs] = useState(0);
    const [exitCode, setExitCode] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const run = async () => {
        setLoading(true);
        setStdout('');
        setStderr('');
        setDurationMs(0);
        setExitCode(null);
        setTimedOut(false);
        try {
            const resp = await snippetsAPI.runSandbox({ language, code });
            const data = resp.data;
            setStdout(data.stdout || '');
            setStderr(data.stderr || '');
            setDurationMs(data.durationMs || 0);
            setExitCode(data.exitCode ?? null);
            setTimedOut(!!data.timedOut);
        }
        catch (err) {
            setStderr(err?.response?.data?.error || err?.message || '运行失败');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: { maxWidth: 1000, margin: '24px auto', padding: '0 16px' }, children: _jsx(Card, { title: "\u5728\u7EBF\u8FD0\u884C\u6C99\u76D2", bordered: true, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "middle", children: [_jsx(Select, { value: language, onChange: setLanguage, style: { width: 260 }, children: languages.map(l => (_jsx(Option, { value: l.value, children: l.label }, l.value))) }), _jsx(Input.TextArea, { rows: 10, value: code, onChange: (e) => setCode(e.target.value), placeholder: "\u5728\u6B64\u8F93\u5165\u4EE3\u7801" }), _jsxs(Space, { children: [_jsx(Button, { type: "primary", onClick: run, loading: loading, children: "\u8FD0\u884C\uFF08\u22645\u79D2\uFF0C\u90E8\u5206\u8BED\u8A00\u4EC5\u56DE\u663E\uFF09" }), _jsx(Button, { onClick: async () => { setLoading(true); try {
                                    await snippetsAPI.warmupSandbox([language]);
                                }
                                finally {
                                    setLoading(false);
                                } }, children: "\u9884\u70ED\u5F53\u524D\u8BED\u8A00\u955C\u50CF" })] }), _jsx(Card, { size: "small", title: "\u6807\u51C6\u8F93\u51FA", children: _jsx("pre", { style: { whiteSpace: 'pre-wrap' }, children: stdout || '(无输出)' }) }), _jsx(Card, { size: "small", title: "\u9519\u8BEF\u8F93\u51FA", children: _jsx("pre", { style: { whiteSpace: 'pre-wrap', color: '#b71c1c' }, children: stderr || '(无错误)' }) }), _jsxs(Text, { type: "secondary", children: ["\u8017\u65F6\uFF1A", durationMs, " ms \u00B7 \u9000\u51FA\u7801\uFF1A", exitCode === null ? 'null' : exitCode, " \u00B7 \u8D85\u65F6\uFF1A", timedOut ? '是' : '否'] })] }) }) }));
}
