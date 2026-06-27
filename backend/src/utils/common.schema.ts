import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants/pagination';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const uuidParam = (key: string) =>
  z.object({
    [key]: z.string().uuid(`${key} must be a valid UUID`),
  });

/** Normalise a Ghanaian / international phone number to +<digits> form. */
export const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => {
    let digits = value.replace(/[^\d+]/g, '');
    if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
    if (!digits.startsWith('+') && digits.startsWith('0')) {
      // Default to Ghana country code for local numbers.
      digits = `+233${digits.slice(1)}`;
    }
    if (!digits.startsWith('+')) digits = `+${digits}`;
    return digits;
  })
  .refine((value) => /^\+\d{8,15}$/.test(value), {
    message: 'Invalid phone number format',
  });

export const emailSchema = z.string().trim().toLowerCase().email('Invalid email address');

export const latitudeSchema = z.coerce.number().min(-90).max(90);
export const longitudeSchema = z.coerce.number().min(-180).max(180);

export const moneySchema = z.coerce.number().nonnegative().finite();
export const positiveQuantitySchema = z.coerce.number().positive().finite();
