import { z } from 'zod';
import { ProduceUnit } from '@prisma/client';

/**
 * Strict schema for AI extraction output. Raw provider output (including from an
 * external LLM) is ALWAYS validated against this before being trusted.
 */
export const extractionLocationSchema = z.object({
  town: z.string().min(1).nullable(),
  district: z.string().min(1).nullable(),
  region: z.string().min(1).nullable(),
});

export const extractionResultSchema = z.object({
  produceName: z.string().min(1).nullable(),
  produceSlug: z.string().min(1).nullable(),
  quantity: z.number().positive().nullable(),
  unit: z.nativeEnum(ProduceUnit).nullable(),
  location: extractionLocationSchema,
  harvestDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  availableFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  pricePerUnit: z.number().nonnegative().nullable(),
  minimumOrderQuantity: z.number().positive().nullable(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
