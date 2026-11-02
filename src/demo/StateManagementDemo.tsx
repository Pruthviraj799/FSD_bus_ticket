import React, { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPosts, addPost, removePost, Post } from '../store/postsSlice';
import { selectPostsWithPlatforms, selectPostsStatus, selectPostsError } from '../store/selectors';

// 5. Performance Optimization (Assignment 5)
// We wrap our presentation component in React.memo to prevent unnecessary re-renders.
// It will only re-render if its props (post or onRemove) change.
const PostItem = React.memo(({ post, onRemove }: { post: Post & { platformName: string }; onRemove: (id: string) => void }) => {
  return (
    <div className="border border-slate-700 p-4 mb-2 rounded bg-slate-800">
      <h3 className="font-bold text-lg text-cyan-400">{post.title}</h3>
      <p className="text-slate-300 text-sm mb-2">{post.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">Platform: {post.platformName}</span>
        <button 
          onClick={() => onRemove(post.id)}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-1 rounded text-sm transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
});

export const StateManagementDemo: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 1. Store and Slice Setup (Assignment 1)
  // Connect the Redux store to the React components using the useSelector hook
  // 4. Derived State and Selectors (Assignment 4)
  // Utilize memoized selectors to dynamically compute derived state and prevent redundant recomputations
  const posts = useAppSelector(selectPostsWithPlatforms);
  const status = useAppSelector(selectPostsStatus);
  const error = useAppSelector(selectPostsError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  // 5. Performance Optimization (Assignment 5)
  // useCallback caches the function definition between renders.
  // This ensures that the 'onRemove' prop passed to the memoized PostItem remains stable,
  // preventing unnecessary re-renders of the child components.
  const handleRemovePost = useCallback((id: string) => {
    dispatch(removePost(id));
  }, [dispatch]);

  const handleAddPost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: 'New Post ' + Date.now().toString().slice(-4),
      content: 'Dynamically generated post content',
      platformId: '3', // LinkedIn by default based on our mock
    };
    dispatch(addPost(newPost));
  };

  // useMemo can be used to optimize expensive computations based on state
  // Here we use it to calculate some derived statistics without recalculating on every render
  const postStats = useMemo(() => {
    return {
      totalPosts: posts.length,
      platformsRepresented: new Set(posts.map(p => p.platformName)).size
    };
  }, [posts]);

  return (
    <div className="p-6 text-slate-200">
      <h2 className="text-2xl font-bold mb-4 text-white">State Management Dashboard</h2>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleAddPost}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded shadow transition-colors"
        >
          Add New Post
        </button>
      </div>

      <div className="mb-4 text-sm text-slate-400">
        Stats: {postStats.totalPosts} posts across {postStats.platformsRepresented} platforms
      </div>

      {status === 'pending' && <div className="text-cyan-400 animate-pulse">Loading posts...</div>}
      
      {status === 'rejected' && <div className="text-red-400">Error: {error}</div>}

      <div className="flex flex-col gap-2">
        {posts.map(post => (
          <PostItem 
            key={post.id} 
            post={post} 
            onRemove={handleRemovePost} 
          />
        ))}
      </div>
    </div>
  );
};
