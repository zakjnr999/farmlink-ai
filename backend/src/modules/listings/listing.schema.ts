import { z } from 'zod';
import { ListingSourceType, ProduceUnit } from '@prisma/client';
import {
  latitudeSchema,
  longitudeSchema,
  moneySchema,
  paginationQuerySchema,
  positiveQuantitySchema,
} from '../../utils/common.schema';

export const extractSchema = z
  .object({
    text: z.string().trim().min(3).max(2000),
    referenceDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'referenceDate must be yyyy-mm-dd')
      .optional(),
  })
  .strict();

export const createListingSchema = z
  .object({
    categoryId: z.string().uuid(),
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(3).max(3000),
    quantity: positiveQuantitySchema,
    unit: z.nativeEnum(ProduceUnit),
    minimumOrderQuantity: positiveQuantitySchema.default(1),
    pricePerUnit: moneySchema.optional(),
    currency: z.string().trim().length(3).default('GHS'),
    harvestDate: z.coerce.date(),
    availableFrom: z.coerce.date(),
    availableUntil: z.coerce.date().optional(),
    qualityGrade: z.string().trim().max(50).optional(),
    farmingMethod: z.string().trim().max(50).optional(),
    region: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    town: z.string().trim().min(2).max(100),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    sourceType: z.nativeEnum(ListingSourceType).default(ListingSourceType.FORM),
    rawInputText: z.string().trim().max(2000).optional(),
    aiExtractionConfidence: z.coerce.number().min(0).max(1).optional(),
    transportPoolEligible: z.boolean().default(true),
  })
  .strict()
  .refine((d) => d.minimumOrderQuantity <= d.quantity, {
    message: 'minimumOrderQuantity cannot exceed quantity',
    path: ['minimumOrderQuantity'],
  });

export const updateListingSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(3).max(3000).optional(),
    quantity: positiveQuantitySchema.optional(),
    unit: z.nativeEnum(ProduceUnit).optional(),
    minimumOrderQuantity: positiveQuantitySchema.optional(),
    pricePerUnit: moneySchema.optional(),
    harvestDate: z.coerce.date().optional(),
    availableFrom: z.coerce.date().optional(),
    availableUntil: z.coerce.date().optional(),
    qualityGrade: z.string().trim().max(50).optional(),
    farmingMethod: z.string().trim().max(50).optional(),
    region: z.string().trim().min(2).max(100).optional(),
    district: z.string().trim().min(2).max(100).optional(),
    town: z.string().trim().min(2).max(100).optional(),
    latitude: latitudeSchema.optional(),
    longitude: longitudeSchema.optional(),
    transportPoolEligible: z.boolean().optional(),
  })
  .strict();

export const myListingsQuerySchema = paginationQuerySchema.extend({
  status: z.string().trim().optional(),
});

export const marketplaceQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().optional(),
  region: z.string().trim().optional(),
  district: z.string().trim().optional(),
  town: z.string().trim().optional(),
  minQuantity: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  unit: z.nativeEnum(ProduceUnit).optional(),
  availableFrom: z.coerce.date().optional(),
  harvestDateFrom: z.coerce.date().optional(),
  harvestDateTo: z.coerce.date().optional(),
  search: z.string().trim().max(100).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  maxDistanceKm: z.coerce.number().positive().optional(),
  sortBy: z.enum(['createdAt', 'harvestDate', 'pricePerUnit', 'quantity']).default('createdAt'),
});

export type ExtractInput = z.infer<typeof extractSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type MyListingsQuery = z.infer<typeof myListingsQuerySchema>;
export type MarketplaceQuery = z.infer<typeof marketplaceQuerySchema>;
