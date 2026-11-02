import React from 'react';
import Child from './Child';

function Parent({ username }) {
  return (
    <>
      <div className="component-box">
        <div className="component-title">Parent Component</div>
        <div>Receives prop, passes it down <span className="badge">No use here</span></div>
      </div>
      
      <div className="arrow">↓ props</div>
      
      {/* Pass username prop to Child */}
      <Child username={username} />
    </>
  );
}

export default Parent;
