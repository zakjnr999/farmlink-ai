import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { z } from 'zod';

export const aboutYouStepSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name as it appears on your farm records.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number.')
    .regex(
      /^(\+233|0)[235]\d{8}$/,
      'Enter a valid Ghana phone number (e.g. 0244123456).',
    ),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
});

export const aboutFarmStepSchema = z.object({
  farmName: z
    .string()
    .trim()
    .min(2, 'Enter the name of your farm or operation.'),
  bio: z.string().trim().max(500, 'Keep your farm description under 500 characters.').optional(),
  primaryCrops: z
    .array(z.string().trim().min(1))
    .min(1, 'Add at least one crop you grow regularly.'),
  farmSizeAcres: z
    .union([
      z.literal(''),
      z.coerce
        .number({ invalid_type_error: 'Enter your farm size in acres.' })
        .positive('Farm size must be greater than zero.'),
    ])
    .optional(),
});

export const farmLocationStepSchema = z.object({
  region: z
    .string()
    .refine((value) => GHANA_REGION_NAMES.includes(value), {
      message: 'Select your region.',
    }),
  district: z.string().trim().min(2, 'Enter your district.'),
  village: z.string().trim().min(2, 'Enter your town or village.'),
  latitude: z
    .union([
      z.literal(''),
      z.coerce
        .number({ invalid_type_error: 'Enter a valid latitude.' })
        .min(-90)
        .max(90),
    ])
    .optional(),
  longitude: z
    .union([
      z.literal(''),
      z.coerce
        .number({ invalid_type_error: 'Enter a valid longitude.' })
        .min(-180)
        .max(180),
    ])
    .optional(),
});

export const onboardingSchema = aboutYouStepSchema
  .merge(aboutFarmStepSchema)
  .merge(farmLocationStepSchema);

export type AboutYouStepValues = z.infer<typeof aboutYouStepSchema>;
export type AboutFarmStepValues = z.infer<typeof aboutFarmStepSchema>;
export type FarmLocationStepValues = z.infer<typeof farmLocationStepSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const ONBOARDING_STEPS = [
  'about-you',
  'about-farm',
  'farm-location',
  'ready',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingProgress {
  step: OnboardingStep;
  data: Partial<OnboardingFormValues>;
  updatedAt: string;
}

export const ONBOARDING_PROGRESS_KEY = 'farmlink-onboarding-progress';
