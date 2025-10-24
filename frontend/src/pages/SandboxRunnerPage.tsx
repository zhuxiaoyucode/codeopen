import React, { useMemo, useState } from 'react';
import { Card, Select, Button, Typography, Space } from 'antd';
import { snippetsAPI } from '../services/api';
import Editor from '@monaco-editor/react';
import CodeHighlighter from '../components/CodeHighlighter';
import { initializeMonaco } from '../utils/monacoSetup';
import { SUPPORTED_LANGUAGES } from '../types';
import { useThemeMode } from '../theme/ThemeContext';

const { Option } = Select as any;
const { Text } = Typography;

const languages = SUPPORTED_LANGUAGES.map(l => ({ label: l.label, value: l.value }));

export default function SandboxRunnerPage() {
  const { mode } = useThemeMode();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>("console.log('hello sandbox')\n");
  const [loading, setLoading] = useState(false);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [durationMs, setDurationMs] = useState<number>(0);
  const [exitCode, setExitCode] = useState<number|null>(null);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  const monacoLanguage = useMemo(() => {
    const found = SUPPORTED_LANGUAGES.find(l => l.value === language);
    return found?.prismLang === 'plaintext' ? 'plaintext' : found?.value || 'plaintext';
  }, [language]);

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
    } catch (err: any) {
      setStderr(err?.response?.data?.error || err?.message || '运行失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
      <Card title="在线运行沙盒" bordered>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Select value={language} onChange={setLanguage} style={{ width: 260 }}>
            {languages.map(l => (
              <Option key={l.value} value={l.value}>{l.label}</Option>
            ))}
          </Select>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <Editor
              height="420px"
              language={monacoLanguage}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme={mode === 'dark' ? 'vs-dark' : 'vs-light'}
              onMount={(editor, monaco) => { initializeMonaco(monaco); }}
              options={{
                fontFamily: 'Monaco, Consolas, Menlo, monospace',
                fontSize: 14,
                lineHeight: 22,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                renderWhitespace: 'boundary',
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                snippetSuggestions: 'inline',
                minimap: { enabled: false },
                scrollbar: { vertical: 'auto' },
                automaticLayout: true,
              }}
            />
          </div>

          <Space>
            <Button type="primary" onClick={run} loading={loading}>运行（≤5秒，部分语言仅回显）</Button>
            <Button onClick={async ()=>{ setLoading(true); try { await snippetsAPI.warmupSandbox([language]); } finally { setLoading(false); } }}>预热当前语言镜像</Button>
          </Space>

          <Card size="small" title="预览（语法高亮）">
            <CodeHighlighter code={code} language={language} showLineNumbers />
          </Card>

          <Card size="small" title="标准输出">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{stdout || '(无输出)'}</pre>
          </Card>
          <Card size="small" title="错误输出">
            <pre style={{ whiteSpace: 'pre-wrap', color: '#b71c1c' }}>{stderr || '(无错误)'}</pre>
          </Card>
          <Text type="secondary">耗时：{durationMs} ms · 退出码：{exitCode === null ? 'null' : exitCode} · 超时：{timedOut ? '是' : '否'}</Text>
        </Space>
      </Card>
    </div>
  );
}
