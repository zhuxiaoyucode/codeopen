import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import snippetsSlice from './slices/snippetsSlice';
export const store = configureStore({
    reducer: {
        auth: authSlice,
        snippets: snippetsSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['persist/PERSIST'],
        },
    }),
});
