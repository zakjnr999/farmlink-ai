import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
    },
    testTimeout: 20000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.types.ts', 'src/types/**', 'src/**/*.routes.ts'],
    },
  },
});
