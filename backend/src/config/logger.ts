import pino from 'pino';
import { env } from './env';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'passwordHash',
  'token',
  'accessToken',
  '*.password',
  '*.passwordHash',
  'AI_API_KEY',
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  transport:
    env.isProduction || env.isTest
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
});
