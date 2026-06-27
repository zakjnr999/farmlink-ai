import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import type { CreateFarmerProfileInput, UpdateFarmerProfileInput } from './farmer.schema';

export const farmerService = {
  async getProfileByUserId(userId: string) {
    const profile = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw ApiError.notFound('Farmer profile not found. Create one first.');
    }
    return profile;
  },

  /** Returns the farmer profile id for a user, or throws if none exists. */
  async requireProfileId(userId: string): Promise<string> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw ApiError.forbidden('You must create a farmer profile first');
    }
    return profile.id;
  },

  async createProfile(userId: string, input: CreateFarmerProfileInput) {
    const existing = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw ApiError.conflict('Farmer profile already exists; use update instead');
    }
    return prisma.farmerProfile.create({
      data: {
        userId,
        farmName: input.farmName,
        description: input.description ?? null,
        region: input.region,
        district: input.district,
        town: input.town,
        latitude: input.latitude,
        longitude: input.longitude,
        primaryCrops: input.primaryCrops ?? [],
        farmSizeAcres: input.farmSizeAcres ?? null,
      },
    });
  },

  async updateProfile(userId: string, input: UpdateFarmerProfileInput) {
    await this.getProfileByUserId(userId);
    return prisma.farmerProfile.update({
      where: { userId },
      data: {
        ...(input.farmName !== undefined ? { farmName: input.farmName } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.region !== undefined ? { region: input.region } : {}),
        ...(input.district !== undefined ? { district: input.district } : {}),
        ...(input.town !== undefined ? { town: input.town } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.primaryCrops !== undefined ? { primaryCrops: input.primaryCrops } : {}),
        ...(input.farmSizeAcres !== undefined ? { farmSizeAcres: input.farmSizeAcres } : {}),
      },
    });
  },
};
