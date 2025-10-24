import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
// 从localStorage恢复认证状态
const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        }
        catch (error) {
            console.error('无法解析本地缓存的用户信息，将自动清理。', error);
            localStorage.removeItem('user');
        }
    }
    return {
        user,
        token,
        isLoading: false,
        error: null,
    };
};
// 异步thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await authAPI.login(credentials);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.error || '登录失败');
    }
});
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await authAPI.register(userData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.error || '注册失败');
    }
});
export const getCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const response = await authAPI.getCurrentUser();
        return response.data;
    }
    catch (error) {
        const status = error?.response?.status;
        return rejectWithValue(status ?? 500);
    }
});
const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuthState(),
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 登录
            .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        })
            .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // 注册
            .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        })
            .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // 获取当前用户
            .addCase(getCurrentUser.pending, (state) => {
            state.isLoading = true;
        })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        })
            .addCase(getCurrentUser.rejected, (state, action) => {
            state.isLoading = false;
            // 仅在明确 401（无效/过期 token）时清空登录态，其余错误保留 token 以便后续重试
            if (action.payload === 401) {
                state.user = null;
                state.token = null;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        });
    },
});
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
