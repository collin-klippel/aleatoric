import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'docs',
  plugins: [react()],
  build: {
    // Docs bundle React, CodeMirror, and library code; a single chunk > 500 kB is expected.
    chunkSizeWarningLimit: 1024,
  },
  resolve: {
    alias: {
      'aleatoric-web': path.resolve(__dirname, 'src'),
      aleatoric: path.resolve(__dirname, '../aleatoric/src'),
    },
  },
});
