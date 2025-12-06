import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Application Entry Point
 * * This file bridges the gap between React logic and the browser's DOM.
 * * It locates the 'root' div in index.html and injects the React application.
 */

// 1. Create the React Root
// Uses the new React 18 Concurrent Mode API (createRoot) for better performance.
const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. Render the Application Tree
root.render(
  // React.StrictMode acts as a wrapper to highlight potential problems in the app.
  // It activates additional checks and warnings (e.g., detecting side effects).
  <React.StrictMode>
    <App />
  </React.StrictMode>
);