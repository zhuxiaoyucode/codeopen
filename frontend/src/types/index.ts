// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatarHistory?: string[];
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 代码片段相关类型
export interface Snippet {
  id: string;
  content: string;
  language: string;
  expiresAt: string | null;
  isPrivate: boolean;
  title?: string;
  createdAt: string;
  creator?: { _id: string; username: string; };
  isExpired?: boolean;
}

export interface SnippetFormData {
  content: string;
  language: string;
  expiresIn?: number; // 天数
  isPrivate: boolean;
  title?: string;
}

export interface SnippetsState {
  snippets: Snippet[];
  userSnippets: Snippet[];
  currentSnippet: Snippet | null;
  isLoading: boolean;
  error: string | null;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 语言选项
export interface LanguageOption {
  value: string;
  label: string;
  prismLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
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