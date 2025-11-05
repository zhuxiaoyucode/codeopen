import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Snippet, SnippetFormData, SnippetsState } from '../../types';
import { snippetsAPI } from '../../services/api';

const initialState: SnippetsState = {
  snippets: [],
  userSnippets: [], // 新增用户代码片段列表
  currentSnippet: null,
  isLoading: false,
  error: null,
};

// 异步thunks
export const createSnippet = createAsyncThunk(
  'snippets/create',
  async (snippetData: SnippetFormData, { rejectWithValue }) => {
    try {
      const response = await snippetsAPI.createSnippet(snippetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '创建代码片段失败');
    }
  }
);

export const getSnippet = createAsyncThunk(
  'snippets/get',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await snippetsAPI.getSnippet(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取代码片段失败');
    }
  }
);

export const getUserSnippets = createAsyncThunk(
  'snippets/getUserSnippets',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await snippetsAPI.getUserSnippets(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '获取用户片段列表失败');
    }
  }
);

export const updateSnippet = createAsyncThunk(
  'snippets/update',
  async ({ id, snippetData }: { id: string; snippetData: Partial<SnippetFormData> }, { rejectWithValue }) => {
    try {
      const response = await snippetsAPI.updateSnippet(id, snippetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '更新代码片段失败');
    }
  }
);

export const deleteSnippet = createAsyncThunk(
  'snippets/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await snippetsAPI.deleteSnippet(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || '删除代码片段失败');
    }
  }
);

const snippetsSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {
    clearCurrentSnippet: (state) => {
      state.currentSnippet = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 创建片段
      .addCase(createSnippet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSnippet.fulfilled, (state, action: PayloadAction<{ snippet: Snippet }>) => {
        state.isLoading = false;
        state.snippets.unshift(action.payload.snippet);
      })
      .addCase(createSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 获取片段详情
      .addCase(getSnippet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSnippet.fulfilled, (state, action: PayloadAction<{ snippet: Snippet }>) => {
        state.isLoading = false;
        state.currentSnippet = action.payload.snippet;
      })
      .addCase(getSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 获取用户片段列表
      .addCase(getUserSnippets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserSnippets.fulfilled, (state, action: PayloadAction<{ snippets: Snippet[] }>) => {
        state.isLoading = false;
        state.userSnippets = action.payload.snippets;
      })
      .addCase(getUserSnippets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 更新片段
      .addCase(updateSnippet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSnippet.fulfilled, (state, action: PayloadAction<{ snippet: Snippet }>) => {
        state.isLoading = false;
        const index = state.snippets.findIndex(s => s.id === action.payload.snippet.id);
        if (index !== -1) {
          state.snippets[index] = action.payload.snippet;
        }
        if (state.currentSnippet?.id === action.payload.snippet.id) {
          state.currentSnippet = action.payload.snippet;
        }
      })
      .addCase(updateSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 删除片段
      .addCase(deleteSnippet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSnippet.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.snippets = state.snippets.filter(s => s.id !== action.payload);
        state.userSnippets = state.userSnippets.filter(s => s.id !== action.payload);
        if (state.currentSnippet?.id === action.payload) {
          state.currentSnippet = null;
        }
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSnippet, clearError } = snippetsSlice.actions;
export default snippetsSlice.reducer;