import { z } from 'zod';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+233|0)[235]\d{8}$/;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .email('Enter a valid email address.'),
    phone: z
      .string()
      .trim()
      .min(1, 'Enter your phone number.')
      .refine((value) => phonePattern.test(value.replace(/\s/g, '')), {
        message: 'Enter a valid Ghana phone number (e.g. 0244123456).',
      }),
    password: z
      .string()
      .min(6, 'Your password must be at least 6 characters.')
      .max(72, 'Password is too long.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to continue.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}
