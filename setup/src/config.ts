export const API_URL = window.location.pathname.startsWith('/setup') 
  ? '/api/setup'  // When running under /setup
  : 'http://localhost:3013/api/setup';  // When running directly 