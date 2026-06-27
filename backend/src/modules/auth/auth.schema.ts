import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { emailSchema, phoneNumberSchema } from '../../utils/common.schema';

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    phoneNumber: phoneNumberSchema,
    email: emailSchema.optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    role: z.nativeEnum(UserRole, { error: 'role must be FARMER or BUYER' }),
  })
  .strict()
  .refine((data) => data.role !== UserRole.ADMIN, {
    message: 'Public registration as ADMIN is not allowed',
    path: ['role'],
  });

export const loginSchema = z
  .object({
    // Login accepts either email or phone number as the identifier.
    identifier: z.string().trim().min(3),
    password: z.string().min(1),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
