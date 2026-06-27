import { describe, expect, it } from 'vitest';
import { aboutYouStepSchema } from '@/features/onboarding/schemas/onboarding.schema';

describe('Onboarding step one', () => {
  it('requires full name', () => {
    const result = aboutYouStepSchema.safeParse({
      fullName: '',
      phone: '0244123456',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid farmer details', () => {
    const result = aboutYouStepSchema.safeParse({
      fullName: 'Kwame Mensah',
      phone: '0244123456',
      email: 'kwame@example.com',
    });
    expect(result.success).toBe(true);
  });
});
