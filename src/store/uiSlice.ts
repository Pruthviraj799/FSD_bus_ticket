import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State interface for UI
export interface UIState {
  loading: boolean;
  error: string | null;
}

const initialState: UIState = {
  loading: false,
  error: null,
};

// The uiSlice follows Functional Programming principles by ensuring that all reducers
// are pure functions. They take the current state and an action as arguments, and return
// a new state without mutating the original one. Redux Toolkit's Immer library allows us
// to write "mutating" syntax while ensuring immutability under the hood.
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError } = uiSlice.actions;
export default uiSlice.reducer;
