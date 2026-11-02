import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from '../redux/counterSlice';

function Counter() {
  // Get count from Redux store
  const count = useSelector((state) => state.counter.count);
  
  // Use dispatch to send actions to Redux
  const dispatch = useDispatch();

  return (
    <div className="card">
      <h2>Redux Toolkit Counter</h2>
      
      <div className="demo-section">
        <div className="counter-display">
          Count: {count}
        </div>
        
        <div className="btn-group">
          <button 
            className="btn btn-inc" 
            onClick={() => dispatch(increment())}
          >
            + Increment
          </button>
          
          <button 
            className="btn btn-dec" 
            onClick={() => dispatch(decrement())}
          >
            - Decrement
          </button>
          
          <button 
            className="btn btn-reset" 
            onClick={() => dispatch(reset())}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="visual-flow">
        <h3 style={{ marginBottom: '1rem', color: '#666' }}>Redux Flow Visualization</h3>
        
        <div className="flow-step">User clicks button</div>
        <div className="arrow">↓</div>
        <div className="flow-step">Action (e.g., increment)</div>
        <div className="arrow">↓</div>
        <div className="flow-step">Reducer</div>
        <div className="arrow">↓</div>
        <div className="flow-step">State Changes</div>
        <div className="arrow">↓</div>
        <div className="flow-step">Store Updates</div>
        <div className="arrow">↓</div>
        <div className="flow-step">React Component Re-renders</div>
      </div>
    </div>
  );
}

export default Counter;
