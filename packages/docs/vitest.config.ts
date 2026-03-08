import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@docs-shared': path.resolve(__dirname, 'src/shared'),
      aleatoric: path.resolve(__dirname, '../aleatoric/src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/apps/aleatoric/lib/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
