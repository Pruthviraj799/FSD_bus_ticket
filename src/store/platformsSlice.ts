import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Platform {
  id: string;
  name: string;
}

export interface PlatformsState {
  list: Platform[];
}

const initialState: PlatformsState = {
  list: [
    { id: '1', name: 'Twitter' },
    { id: '2', name: 'Facebook' },
    { id: '3', name: 'LinkedIn' },
  ],
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    addPlatform(state, action: PayloadAction<Platform>) {
      state.list.push(action.payload);
    },
  },
});

export const { addPlatform } = platformsSlice.actions;
export default platformsSlice.reducer;
