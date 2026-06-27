import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNIT_IDS } from '@/constants/units';
import type { AIConfidence } from '@/types/listing';
import { z } from 'zod';

const confidenceValues = ['high', 'medium', 'low', 'unknown'] as const satisfies readonly AIConfidence[];

export const extractionReviewSchema = z.object({
  title: z.string().trim().min(3, 'Give your listing a short, clear title.'),
  produceType: z.string().trim().min(2, 'Enter the type of produce.'),
  categoryId: z.string().min(1, 'Select a produce category.'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter how much produce you have.' })
    .positive('Enter a quantity greater than zero.'),
  unit: z.enum(PRODUCE_UNIT_IDS as [string, ...string[]], {
    errorMap: () => ({ message: 'Select how the produce is measured.' }),
  }),
  pricePerUnit: z.coerce
    .number({ invalid_type_error: 'Enter your price per unit.' })
    .nonnegative('Price cannot be negative.')
    .optional(),
  minimumOrderQuantity: z.coerce
    .number({ invalid_type_error: 'Enter the smallest order you will accept.' })
    .positive('Minimum order must be greater than zero.')
    .optional(),
  harvestDate: z.string().min(1, 'Select the harvest or ready date.'),
  availableFrom: z.string().min(1, 'Select when the produce will be ready.'),
  availableUntil: z.string().optional(),
  region: z
    .string()
    .refine((value) => GHANA_REGION_NAMES.includes(value), {
      message: 'Select your region.',
    }),
  district: z.string().trim().min(2, 'Enter your district.'),
  village: z.string().trim().min(2, 'Enter your town or village.'),
  description: z.string().trim().optional(),
  confidence: z.enum(confidenceValues),
  missingFields: z.array(z.string()),
  clarificationAnswers: z.record(z.string(), z.string()),
  rawText: z.string().optional(),
});

export type ExtractionReviewFormValues = z.infer<typeof extractionReviewSchema>;

export const extractionClarificationSchema = z.object({
  answers: z.record(
    z.string(),
    z.string().trim().min(1, 'Please answer this question before continuing.'),
  ),
});

export type ExtractionClarificationFormValues = z.infer<
  typeof extractionClarificationSchema
>;
