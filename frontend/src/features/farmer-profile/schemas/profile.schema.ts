import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.'),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+233|0)[235]\d{8}$/,
      'Enter a valid Ghana phone number (e.g. 0244123456).',
    )
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
  farmName: z
    .string()
    .trim()
    .min(2, 'Enter the name of your farm or operation.'),
  bio: z.string().trim().max(500, 'Keep your farm description under 500 characters.').optional(),
  primaryCrops: z
    .array(z.string().trim().min(1))
    .min(1, 'Add at least one crop you grow regularly.'),
  farmSizeAcres: z.coerce
    .number({ invalid_type_error: 'Enter your farm size in acres.' })
    .positive('Farm size must be greater than zero.')
    .optional(),
  region: z
    .string()
    .refine((value) => GHANA_REGION_NAMES.includes(value), {
      message: 'Select your region.',
    }),
  district: z.string().trim().min(2, 'Enter your district.'),
  village: z.string().trim().min(2, 'Enter your town or village.'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const profileUpdateSchema = profileSchema.partial();

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
