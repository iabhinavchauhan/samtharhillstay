import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'client/dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  }
});
