import React from 'react';
import GrandChild from './GrandChild';

function Child({ username }) {
  return (
    <>
      <div className="component-box">
        <div className="component-title">Child Component</div>
        <div>Receives prop, passes it down <span className="badge">No use here</span></div>
      </div>
      
      <div className="arrow">↓ props</div>
      
      {/* Pass username prop to GrandChild */}
      <GrandChild username={username} />
    </>
  );
}

export default Child;
