import { createSlice } from '@reduxjs/toolkit';

// Create a Redux slice for counter
export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    count: 0
  },
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers.
      // It doesn't actually mutate the state because it uses the Immer library.
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
    reset: (state) => {
      state.count = 0;
    }
  }
});

// Export the generated actions
export const { increment, decrement, reset } = counterSlice.actions;

// Export the reducer to add it to the store
export default counterSlice.reducer;
