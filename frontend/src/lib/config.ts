function readEnv(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

const demoEnv = readEnv('NEXT_PUBLIC_ENABLE_DEMO_MODE');

export const config = {
  apiUrl: readEnv('NEXT_PUBLIC_API_URL') ?? 'http://localhost:4000/api/v1',
  /** Demo handlers activate when env is exactly "true", or in development unless explicitly "false". */
  isDemoMode:
    demoEnv === 'true' ||
    (process.env.NODE_ENV === 'development' && demoEnv !== 'false'),
} as const;

export type AppConfig = typeof config;
