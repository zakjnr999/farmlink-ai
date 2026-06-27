import { beforeAll } from 'vitest';

// Ensure a test environment and sane defaults before the app config loads.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'silent';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-only-secret-value-at-least-32-characters';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/farmlink_test?schema=public';

beforeAll(() => {
  // Placeholder for future global test setup.
});
