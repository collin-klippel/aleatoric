import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const base =
  process.env.GITHUB_PAGES === 'true' ? '/aleatoric/playground/' : '/';

export default defineConfig({
  base,
  server: {
    port: 5174,
    strictPort: true,
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['aleatoric'],
  },
});
