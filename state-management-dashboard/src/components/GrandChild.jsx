import React from 'react';

function GrandChild({ username }) {
  return (
    <div className="component-box" style={{ borderColor: '#e83e8c' }}>
      <div className="component-title" style={{ color: '#e83e8c' }}>GrandChild Component</div>
      <div>Finally uses the prop!</div>
      <div className="greeting">Hello, {username}!</div>
    </div>
  );
}

export default GrandChild;
