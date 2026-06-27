import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNIT_IDS } from '@/constants/units';
import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().trim().min(3, 'Give your listing a short, clear title.'),
  categoryId: z.string().min(1, 'Select a produce category.'),
  produceType: z.string().trim().min(2, 'Enter the type of produce you are listing.'),
  description: z
    .string()
    .trim()
    .max(1000, 'Keep your description under 1,000 characters.')
    .optional(),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter how much produce you have available.' })
    .positive('Enter a quantity greater than zero.'),
  unit: z.enum(PRODUCE_UNIT_IDS as [string, ...string[]], {
    errorMap: () => ({ message: 'Select how the produce is measured.' }),
  }),
  minimumOrderQuantity: z.coerce
    .number({ invalid_type_error: 'Enter the smallest order you will accept.' })
    .positive('Minimum order must be greater than zero.')
    .optional(),
  pricePerUnit: z.coerce
    .number({ invalid_type_error: 'Enter your price per unit.' })
    .nonnegative('Price cannot be negative.')
    .optional(),
  currency: z.literal('GHS'),
  harvestDate: z.string().min(1, 'Select when the produce will be harvested or was harvested.'),
  availableFrom: z.string().min(1, 'Select when the produce will be ready for buyers.'),
  availableUntil: z.string().optional(),
  qualityGrade: z.string().trim().optional(),
  farmingMethod: z.string().trim().optional(),
  region: z
    .string()
    .refine((value) => GHANA_REGION_NAMES.includes(value), {
      message: 'Select your region.',
    }),
  district: z.string().trim().min(2, 'Enter your district.'),
  village: z.string().trim().min(2, 'Enter your town or village.'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  sourceType: z.enum(['manual', 'voice', 'text', 'extraction']),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

export const listingDraftSchema = listingSchema.partial().extend({
  localId: z.string().optional(),
  rawText: z.string().optional(),
  synced: z.boolean().optional(),
});

export type ListingDraftFormValues = z.infer<typeof listingDraftSchema>;
