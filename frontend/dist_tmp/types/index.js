export const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', prismLang: 'javascript' },
    { value: 'typescript', label: 'TypeScript', prismLang: 'typescript' },
    { value: 'python', label: 'Python', prismLang: 'python' },
    { value: 'java', label: 'Java', prismLang: 'java' },
    { value: 'go', label: 'Go', prismLang: 'go' },
    { value: 'cpp', label: 'C++', prismLang: 'cpp' },
    { value: 'csharp', label: 'C#', prismLang: 'csharp' },
    { value: 'php', label: 'PHP', prismLang: 'php' },
    { value: 'ruby', label: 'Ruby', prismLang: 'ruby' },
    { value: 'swift', label: 'Swift', prismLang: 'swift' },
    { value: 'html', label: 'HTML', prismLang: 'html' },
    { value: 'css', label: 'CSS', prismLang: 'css' },
    { value: 'sql', label: 'SQL', prismLang: 'sql' },
    { value: 'json', label: 'JSON', prismLang: 'json' },
    { value: 'markdown', label: 'Markdown', prismLang: 'markdown' },
    { value: 'plaintext', label: '纯文本', prismLang: 'plaintext' }
];
// 过期时间选项
export const EXPIRATION_OPTIONS = [
    { value: 1, label: '1天后' },
    { value: 7, label: '1周后' },
    { value: 30, label: '1个月后' },
    { value: null, label: '永久有效' }
];
