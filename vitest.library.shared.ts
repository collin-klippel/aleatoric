import { defineConfig } from 'vitest/config';

/** Shared Vitest options for library packages. */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts', '**/random/types.ts'],
    },
  },
});
