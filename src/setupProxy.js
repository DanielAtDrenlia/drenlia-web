const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:3011',
      changeOrigin: true,
      secure: false,
      xfwd: true,
    })
  );
}; 