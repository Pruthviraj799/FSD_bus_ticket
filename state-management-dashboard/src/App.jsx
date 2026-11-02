import React, { useState } from 'react';
import PropDrillingDemo from './components/PropDrillingDemo';
import Counter from './components/Counter';

function App() {
  const [activeTab, setActiveTab] = useState('prop-drilling');

  return (
    <div className="container">
      <header className="header">
        <h1>State Management Dashboard</h1>
        <p>Prop Drilling vs Redux Toolkit</p>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'prop-drilling' ? 'active' : ''}`}
          onClick={() => setActiveTab('prop-drilling')}
        >
          Prop Drilling
        </button>
        <button 
          className={`tab-btn ${activeTab === 'redux' ? 'active' : ''}`}
          onClick={() => setActiveTab('redux')}
        >
          Redux Toolkit
        </button>
      </div>

      <main>
        {activeTab === 'prop-drilling' ? <PropDrillingDemo /> : <Counter />}
      </main>

      <section>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Prop Drilling</th>
              <th>Redux Toolkit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data passed through props</td>
              <td>Global state</td>
            </tr>
            <tr>
              <td>Can pass through many components</td>
              <td>Components can access required state</td>
            </tr>
            <tr>
              <td>Simple for small data flow</td>
              <td>Useful for shared application state</td>
            </tr>
            <tr>
              <td>Can become difficult with deeply nested components</td>
              <td>Helps avoid unnecessary prop passing</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="concepts-grid">
        <div className="concept-card">
          <h3>State</h3>
          <p>Data that can change in an application.</p>
        </div>
        <div className="concept-card">
          <h3>Store</h3>
          <p>Central place where Redux global state is stored.</p>
        </div>
        <div className="concept-card">
          <h3>Slice</h3>
          <p>A part of the Redux store that manages a specific feature.</p>
        </div>
        <div className="concept-card">
          <h3>Action</h3>
          <p>Describes what happened or what change is requested.</p>
        </div>
        <div className="concept-card">
          <h3>Reducer</h3>
          <p>Function that updates the state based on an action.</p>
        </div>
        <div className="concept-card">
          <h3>Redux Toolkit</h3>
          <p>Tool that makes Redux state management easier.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
