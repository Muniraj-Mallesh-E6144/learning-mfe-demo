import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Entry point for standalone development mode
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// LEARNING NOTE:
// This file is used when running `pnpm dev` for standalone development.
// When integrated with Ember, bootstrap-rc.tsx is used instead.
// Module Federation loads bootstrap-rc.tsx via remoteEntry.js.

