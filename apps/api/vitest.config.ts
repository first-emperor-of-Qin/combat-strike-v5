import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // The suite runs entirely against the in-memory database layer.
    globals: false,
  },
});
