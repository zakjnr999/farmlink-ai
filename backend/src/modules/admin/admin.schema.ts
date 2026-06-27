import { z } from 'zod';
import { AccountStatus, ListingStatus, OfferStatus, UserRole } from '@prisma/client';
import { paginationQuerySchema } from '../../utils/common.schema';

export const adminUsersQuerySchema = paginationQuerySchema.extend({
  role: z.nativeEnum(UserRole).optional(),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  search: z.string().trim().max(100).optional(),
});

export const updateUserStatusSchema = z
  .object({
    accountStatus: z.nativeEnum(AccountStatus),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const adminListingsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ListingStatus).optional(),
  region: z.string().trim().optional(),
});

export const updateListingStatusSchema = z
  .object({
    status: z.nativeEnum(ListingStatus),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const adminOffersQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(OfferStatus).optional(),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AdminListingsQuery = z.infer<typeof adminListingsQuerySchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
export type AdminOffersQuery = z.infer<typeof adminOffersQuerySchema>;
