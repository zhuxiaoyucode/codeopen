import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import snippetsSlice from './slices/snippetsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    snippets: snippetsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // 启用Redux DevTools
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;