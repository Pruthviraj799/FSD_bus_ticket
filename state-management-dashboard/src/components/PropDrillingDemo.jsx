import React from 'react';
import Parent from './Parent';

function PropDrillingDemo() {
  const username = "Nikhil";

  return (
    <div className="card">
      <h2>Prop Drilling Demonstration</h2>
      
      <p className="description">
        Prop Drilling means passing data through multiple components
        using props, even when intermediate components do not need
        the data themselves.
      </p>

      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <div className="component-box">
          <div className="component-title">App Component</div>
          <div>Data: username = "{username}"</div>
        </div>
        
        <div className="arrow">↓ props</div>
        
        {/* Pass username prop to Parent */}
        <Parent username={username} />
      </div>
    </div>
  );
}

export default PropDrillingDemo;
