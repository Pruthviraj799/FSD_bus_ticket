import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';

// Post interface
export interface Post {
  id: string;
  title: string;
  content: string;
  platformId: string;
}

// 3. Asynchronous Data Handling (Assignment 2)
// Using a finite state machine approach to handle asynchronous logic, 
// the states transition between pending, fulfilled, and rejected cleanly.
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  // Simulate an API network request
  return new Promise<Post[]>((resolve) =>
    setTimeout(() => {
      resolve([
        { id: '1', title: 'First Post', content: 'Hello World', platformId: '1' },
        { id: '2', title: 'Second Post', content: 'Testing Redux Toolkit', platformId: '2' },
      ]);
    }, 1000)
  );
});

// 2. State Normalization (Assignment 3)
// We use createEntityAdapter to normalize the state structure.
// This implements Third Normal Form (3NF) principles by flattening nested data structures
// into lookup dictionaries ({ ids: [], entities: {} }). This prevents data duplication,
// avoids complex deep updates, and enables efficient O(1) lookups.
const postsAdapter = createEntityAdapter<Post>({
  // Keep the list sorted by ID or however you prefer
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

const initialState = postsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'pending' | 'fulfilled' | 'rejected'
  error: null as string | null,
});

// 1. Store and Slice Setup (Assignment 1)
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Standard CRUD reducers using pure functions (Functional Programming principles)
    addPost: postsAdapter.addOne,
    updatePost: postsAdapter.updateOne,
    removePost: postsAdapter.removeOne,
    upsertPost: postsAdapter.upsertOne,
  },
  extraReducers: (builder) => {
    // Handling async lifecycle states as a Finite State Machine
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = 'fulfilled';
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message || 'Failed to fetch posts';
      });
  },
});

export const { addPost, updatePost, removePost, upsertPost } = postsSlice.actions;

// Exporting adapter selectors to be used in createSelector later
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors();

export default postsSlice.reducer;
