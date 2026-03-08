import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const base = process.env.GITHUB_PAGES === 'true' ? '/aleatoric/' : '/';

export default defineConfig({
  base,
  envDir: path.resolve(__dirname, '../..'),
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        playground: path.resolve(__dirname, 'playground.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@docs-shared': path.resolve(__dirname, 'src/shared'),
      '@playground': path.resolve(__dirname, '../playground/src'),
      aleatoric: path.resolve(__dirname, '../aleatoric/src'),
    },
  },
});
