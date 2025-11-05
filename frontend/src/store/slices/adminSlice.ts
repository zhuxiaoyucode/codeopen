import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalSnippets: number;
  publicSnippets: number;
  privateSnippets: number;
  recentUsers: number;
  languageStats: Array<{ _id: string; count: number }>;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
}

interface Snippet {
  _id: string;
  title: string;
  language: string;
  isPrivate: boolean;
  creatorId: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface AdminState {
  stats: DashboardStats | null;
  users: User[];
  snippets: Snippet[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    users: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    snippets: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

const initialState: AdminState = {
  stats: null,
  users: [],
  snippets: [],
  isLoading: false,
  error: null,
  pagination: {
    users: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
    snippets: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

// 异步thunks
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取统计数据失败');
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取用户列表失败');
    }
  }
);

export const getSnippets = createAsyncThunk(
  'admin/getSnippets',
  async (params: { page?: number; limit?: number; search?: string; status?: string; language?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSnippets(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取代码片段列表失败');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserRole(userId, role);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '更新用户角色失败');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive, disableDays }: { userId: string; isActive: boolean; disableDays?: number }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, isActive, disableDays);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '更新用户状态失败');
    }
  }
);

export const deleteSnippet = createAsyncThunk(
  'admin/deleteSnippet',
  async (snippetId: string, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deleteSnippet(snippetId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '删除代码片段失败');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearUsers: (state) => {
      state.users = [];
    },
    clearSnippets: (state) => {
      state.snippets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取统计数据
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action: PayloadAction<{ data: DashboardStats }>) => {
        state.isLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 获取用户列表
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<{ data: { users: User[]; total: number; page: number; totalPages: number } }>) => {
        state.isLoading = false;
        state.users = action.payload.data.users;
        state.pagination.users = {
          current: action.payload.data.page,
          pageSize: 10,
          total: action.payload.data.total,
          totalPages: action.payload.data.totalPages,
        };
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 获取代码片段列表
      .addCase(getSnippets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSnippets.fulfilled, (state, action: PayloadAction<{ data: { snippets: Snippet[]; total: number; page: number; totalPages: number } }>) => {
        state.isLoading = false;
        state.snippets = action.payload.data.snippets;
        state.pagination.snippets = {
          current: action.payload.data.page,
          pageSize: 10,
          total: action.payload.data.total,
          totalPages: action.payload.data.totalPages,
        };
      })
      .addCase(getSnippets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 更新用户角色
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<{ data: User }>) => {
        state.isLoading = false;
        // 更新本地用户列表中的角色
        const index = state.users.findIndex(user => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index].role = action.payload.data.role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 更新用户状态
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action: PayloadAction<{ data: User }>) => {
        state.isLoading = false;
        // 更新本地用户列表中的状态
        const index = state.users.findIndex(user => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index].isActive = action.payload.data.isActive;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 删除代码片段
      .addCase(deleteSnippet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        state.isLoading = false;
        // 从本地片段列表中删除
        state.snippets = state.snippets.filter(snippet => snippet._id !== action.meta.arg);
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearStats, clearUsers, clearSnippets } = adminSlice.actions;
export default adminSlice.reducer;