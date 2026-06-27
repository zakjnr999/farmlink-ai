import { z } from 'zod';
import { VerificationStatus } from '@prisma/client';
import { latitudeSchema, longitudeSchema } from '../../utils/common.schema';

export const createFarmerProfileSchema = z
  .object({
    farmName: z.string().trim().min(2).max(150),
    description: z.string().trim().max(2000).optional(),
    region: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    town: z.string().trim().min(2).max(100),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    primaryCrops: z.array(z.string().trim().min(1)).max(50).default([]),
    farmSizeAcres: z.coerce.number().positive().max(100000).optional(),
  })
  .strict();

export const updateFarmerProfileSchema = createFarmerProfileSchema.partial();

// Admin-only verification update is handled in the admin module; farmers may not
// set their own verification status.
export const farmerVerificationSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus),
});

export type CreateFarmerProfileInput = z.infer<typeof createFarmerProfileSchema>;
export type UpdateFarmerProfileInput = z.infer<typeof updateFarmerProfileSchema>;
