import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import platformsReducer from './platformsSlice';
import uiReducer from './uiSlice';

// 1. Store and Slice Setup (Assignment 1)
// Configuring the centralized Redux store using Redux Toolkit.
// Separating data state (posts, platforms) from UI state (loading, error).
export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
