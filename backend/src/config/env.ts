import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),

  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  AI_PROVIDER: z.enum(['local', 'openai']).default('local'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  ADMIN_FULL_NAME: z.string().default('FarmLink Administrator'),
  ADMIN_PHONE_NUMBER: z.string().default('+233200000000'),
  ADMIN_EMAIL: z.string().email().default('admin@farmlink.local'),
  ADMIN_PASSWORD: z.string().min(8).default('AdminPassword123!'),
});

export type AppEnv = z.infer<typeof envSchema> & {
  corsOrigins: string[];
  isProduction: boolean;
  isTest: boolean;
};

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\nInvalid environment configuration:\n${issues}\n`);
    throw new Error('Environment validation failed. See messages above.');
  }

  const data = parsed.data;

  return {
    ...data,
    corsOrigins: data.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    isProduction: data.NODE_ENV === 'production',
    isTest: data.NODE_ENV === 'test',
  };
}

export const env = loadEnv();
