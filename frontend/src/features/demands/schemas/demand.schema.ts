import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNIT_IDS } from '@/constants/units';
import { z } from 'zod';

const demandFrequencyValues = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'seasonal',
  'custom',
] as const;

export const demandSchema = z
  .object({
    produceCategory: z.string().trim().min(1, 'Enter the produce you need.'),
    produceCategoryId: z.string().optional(),
    quantityMin: z.coerce
      .number({ invalid_type_error: 'Enter a minimum quantity.' })
      .positive('Minimum quantity must be greater than zero.'),
    quantityMax: z.coerce
      .number({ invalid_type_error: 'Enter a maximum quantity.' })
      .positive('Maximum quantity must be greater than zero.'),
    unit: z.enum(PRODUCE_UNIT_IDS as [string, ...string[]], {
      errorMap: () => ({ message: 'Select a unit.' }),
    }),
    preferredMaxPrice: z.coerce
      .number({ invalid_type_error: 'Enter a valid price.' })
      .positive('Price must be greater than zero.')
      .optional()
      .or(z.literal('')),
    requiredFrom: z.string().min(1, 'Select when you need supply from.'),
    requiredUntil: z.string().optional().or(z.literal('')),
    preferredRegions: z
      .array(z.string())
      .min(1, 'Select at least one preferred region.'),
    isRecurring: z.boolean(),
    frequency: z.enum(demandFrequencyValues).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.quantityMax < data.quantityMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum quantity must be at least the minimum.',
        path: ['quantityMax'],
      });
    }
    if (data.isRecurring && !data.frequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select how often you need this produce.',
        path: ['frequency'],
      });
    }
    const invalidRegions = data.preferredRegions.filter(
      (r) => !GHANA_REGION_NAMES.includes(r),
    );
    if (invalidRegions.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select valid Ghana regions.',
        path: ['preferredRegions'],
      });
    }
  });

export type DemandFormValues = z.infer<typeof demandSchema>;

export { demandFrequencyValues };
