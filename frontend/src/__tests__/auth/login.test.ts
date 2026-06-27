import { describe, expect, it } from 'vitest';
import { loginSchema } from '@/features/auth/schemas/login.schema';

describe('Farmer login validation', () => {
  it('rejects empty credentials', () => {
    const result = loginSchema.safeParse({
      identifier: '',
      password: '',
      remember: false,
    });
    expect(result.success).toBe(false);
  });

  it('accepts phone identifier', () => {
    const result = loginSchema.safeParse({
      identifier: '0244123456',
      password: 'secret123',
      remember: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts email identifier', () => {
    const result = loginSchema.safeParse({
      identifier: 'kwame@example.com',
      password: 'secret123',
      remember: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('Demo mode config', () => {
  it('activates only when env is exactly true', async () => {
    const original = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE;
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = 'true';
    const { config } = await import('@/lib/config');
    expect(config.isDemoMode).toBe(true);
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = original;
  });
});
