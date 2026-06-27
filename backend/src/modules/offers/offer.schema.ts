import { z } from 'zod';
import { OfferStatus, ProduceUnit } from '@prisma/client';
import {
  moneySchema,
  paginationQuerySchema,
  positiveQuantitySchema,
} from '../../utils/common.schema';

export const createOfferSchema = z
  .object({
    listingId: z.string().uuid(),
    offeredQuantity: positiveQuantitySchema,
    unit: z.nativeEnum(ProduceUnit),
    offeredPricePerUnit: moneySchema.refine(
      (v) => v > 0,
      'offeredPricePerUnit must be greater than 0',
    ),
    message: z.string().trim().max(1000).optional(),
    proposedPickupDate: z.coerce.date(),
    expiresAt: z.coerce.date().optional(),
  })
  .strict();

export const listOffersQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(OfferStatus).optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;
