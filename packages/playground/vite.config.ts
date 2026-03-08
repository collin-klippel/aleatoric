import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/aleatoric/playground/',
  plugins: [react()],
  optimizeDeps: {
    include: ['aleatoric'],
  },
});
