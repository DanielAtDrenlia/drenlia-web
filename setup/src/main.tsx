import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SetupPage from './SetupPage';

console.log('Setup application starting...');
console.log('Current path:', window.location.pathname);
console.log('API URL:', import.meta.env.VITE_API_URL || '/api/setup');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SetupPage />
  </React.StrictMode>
); 