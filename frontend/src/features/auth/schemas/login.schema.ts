import { z } from 'zod';

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Enter your phone number or email address.');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+233|0)[235]\d{8}$/;

export const loginSchema = z.object({
  identifier: identifierSchema.refine(
    (value) => emailPattern.test(value) || phonePattern.test(value.replace(/\s/g, '')),
    {
      message: 'Enter a valid Ghana phone number (e.g. 0244123456) or email address.',
    },
  ),
  password: z
    .string()
    .min(1, 'Enter your password.')
    .min(6, 'Your password must be at least 6 characters.'),
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function isEmailIdentifier(identifier: string): boolean {
  return emailPattern.test(identifier.trim());
}
