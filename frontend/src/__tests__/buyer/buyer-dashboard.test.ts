import { describe, expect, it } from 'vitest';
import { loginSchema } from '@/features/auth/schemas/login.schema';
import { demandSchema } from '@/features/demands/schemas/demand.schema';
import { businessIdentityStepSchema } from '@/features/onboarding/schemas/buyer-onboarding.schema';
import { formatMatchScoreLabel } from '@/lib/formatting/buyer';

describe('Buyer login validation', () => {
  it('accepts demo buyer email', () => {
    const result = loginSchema.safeParse({
      identifier: 'orders@goldenspoon.gh',
      password: 'demo123',
      remember: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('Buyer onboarding schema', () => {
  it('requires business name and buyer type', () => {
    const result = businessIdentityStepSchema.safeParse({
      businessName: '',
      buyerType: 'restaurant',
      contactPhone: '0244555667',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid business identity', () => {
    const result = businessIdentityStepSchema.safeParse({
      businessName: 'Golden Spoon Restaurant',
      buyerType: 'restaurant',
      contactPhone: '0244555667',
      contactEmail: 'orders@goldenspoon.gh',
    });
    expect(result.success).toBe(true);
  });
});

describe('Buyer demand schema', () => {
  it('rejects when max quantity is below min', () => {
    const result = demandSchema.safeParse({
      produceCategory: 'Tomatoes',
      quantityMin: 50,
      quantityMax: 20,
      unit: 'crate',
      preferredMaxPrice: '',
      requiredFrom: '2026-06-27',
      requiredUntil: '',
      preferredRegions: ['Ashanti'],
      isRecurring: false,
      frequency: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid demand', () => {
    const result = demandSchema.safeParse({
      produceCategory: 'Tomatoes',
      quantityMin: 40,
      quantityMax: 80,
      unit: 'crate',
      preferredMaxPrice: 90,
      requiredFrom: '2026-06-27',
      requiredUntil: '2026-07-27',
      preferredRegions: ['Ashanti'],
      isRecurring: true,
      frequency: 'weekly',
    });
    expect(result.success).toBe(true);
  });
});

describe('Match score labels', () => {
  it('returns excellent alignment for high scores', () => {
    expect(formatMatchScoreLabel(94)).toBe('Excellent alignment');
  });

  it('warns on low scores', () => {
    expect(formatMatchScoreLabel(55)).toBe('Review carefully');
  });
});

describe('Buyer demo mode routing', () => {
  it('identifies buyer login in demo handlers', async () => {
    const { setDemoCurrentUserFromLogin } = await import('@/lib/demo/demo-user-registry');
    const user = setDemoCurrentUserFromLogin({
      email: 'orders@goldenspoon.gh',
      password: 'demo123',
      portalRole: 'buyer',
    });
    expect(user.role).toBe('buyer');
    expect(user.roles).toContain('buyer');
  });

  it('adds buyer role to an existing farmer account', async () => {
    const {
      resetDemoUserRegistry,
      setDemoCurrentUserFromRegister,
      getDemoCurrentUser,
    } = await import('@/lib/demo/demo-user-registry');

    resetDemoUserRegistry();

    setDemoCurrentUserFromRegister({
      email: 'ama@example.com',
      password: 'secret123',
      fullName: 'Ama Plantain',
      phone: '0244999888',
      role: 'farmer',
    });

    setDemoCurrentUserFromRegister({
      email: 'ama@example.com',
      password: 'secret123',
      fullName: 'Ama Plantain',
      phone: '0244999888',
      role: 'buyer',
    });

    const user = getDemoCurrentUser();
    expect(user.roles).toEqual(expect.arrayContaining(['farmer', 'buyer']));
    expect(user.role).toBe('buyer');
  });
});
