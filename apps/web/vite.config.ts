import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  /**
   * Public base path. Single-domain deployments use '/' (the default);
   * a GitHub Pages project site sets VITE_BASE_PATH=/<repo-name>/.
   */
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN ?? 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
