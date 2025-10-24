import axios from 'axios';
import { Snippet, SnippetFormData, User } from '../types';

const API_BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL ?? '/api';

const API_TIMEOUT_MS: number = Number((import.meta as any)?.env?.VITE_API_TIMEOUT_MS ?? 60000);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 不在全局拦截器里做跳转或清空，交由各自的 slice 精细化处理
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// 代码片段相关API
export const snippetsAPI = {
  createSnippet: (snippetData: SnippetFormData) =>
    api.post('/snippets', snippetData),
  
  getSnippet: (id: string) => api.get(`/snippets/${id}`),
  
  getUserSnippets: (userId: string) => api.get(`/snippets/user/${userId}`),

  getPublicSnippets: (params?: { page?: number; pageSize?: number }) =>
    api.get('/snippets/public', { params }),
  
  updateSnippet: (id: string, snippetData: Partial<SnippetFormData>) =>
    api.put(`/snippets/${id}`, snippetData),
  
  deleteSnippet: (id: string) => api.delete(`/snippets/${id}`),

  runSandbox: (payload: { language: string; code: string }) =>
    api.post('/sandbox/run', payload),
  warmupSandbox: (languages?: string[]) =>
    api.post('/sandbox/warmup', { languages: languages ?? [] }),
};

export default api;