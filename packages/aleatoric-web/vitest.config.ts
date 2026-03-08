import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'aleatoric-web': path.resolve(__dirname, 'src'),
      aleatoric: path.resolve(__dirname, '../aleatoric/src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'docs/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts'],
    },
  },
});
