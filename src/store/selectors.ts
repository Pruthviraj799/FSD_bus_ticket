import { createSelector } from 'reselect';
import { RootState } from './index';
import { selectAllPosts } from './postsSlice';

// 4. Derived State and Selectors (Assignment 4)
// Basic selectors acting as an abstraction layer to access raw state slices
const selectPostsState = (state: RootState) => state.posts;
const selectPlatformsState = (state: RootState) => state.platforms;
export const selectUIState = (state: RootState) => state.ui;

export const selectPostsStatus = createSelector(
  selectPostsState,
  (posts) => posts.status
);

export const selectPostsError = createSelector(
  selectPostsState,
  (posts) => posts.error
);

// Memoized selectors using createSelector from Reselect to compute derived state dynamically.
// These memoized selectors prevent redundant recomputations. They update only when their
// input data changes, providing significant performance optimization.
export const selectPostsWithPlatforms = createSelector(
  [(state: RootState) => selectAllPosts(state.posts), selectPlatformsState],
  (posts, platformsState) => {
    return posts.map(post => {
      const platform = platformsState.list.find(p => p.id === post.platformId);
      return {
        ...post,
        platformName: platform ? platform.name : 'Unknown Platform',
      };
    });
  }
);
