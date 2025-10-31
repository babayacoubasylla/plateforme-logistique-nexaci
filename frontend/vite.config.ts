// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true, // ← permet l'accès depuis d'autres appareils sur le réseau
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', {
              url: req.url,
              method: req.method,
              headers: proxyReq.getHeaders()
            });
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response:', {
              url: req.url,
              method: req.method,
              status: proxyRes.statusCode
            });
          });
        }
      },
    },
  },
  preview: {
    port: 10000,
    host: '0.0.0.0',
    strictPort: true,
    // Autoriser l'accès depuis le domaine Render en mode preview
    allowedHosts: ['nexaci-frontend.onrender.com'],
  },
});