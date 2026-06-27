import { describe, expect, it } from 'vitest';
import { signupSchema } from '@/features/auth/schemas/signup.schema';

describe('Signup validation', () => {
  const validBase = {
    fullName: 'Ama Darko',
    email: 'ama@example.com',
    phone: '0244123456',
    password: 'secret123',
    confirmPassword: 'secret123',
    agreeTerms: true,
  };

  it('accepts valid farmer/buyer signup', () => {
    expect(signupSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      ...validBase,
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('requires terms agreement', () => {
    const result = signupSchema.safeParse({ ...validBase, agreeTerms: false });
    expect(result.success).toBe(false);
  });
});
