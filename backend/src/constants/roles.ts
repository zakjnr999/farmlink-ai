import { UserRole } from '@prisma/client';

export const ROLES = {
  FARMER: UserRole.FARMER,
  BUYER: UserRole.BUYER,
  ADMIN: UserRole.ADMIN,
} as const;

export const PUBLIC_REGISTRATION_ROLES: UserRole[] = [UserRole.FARMER, UserRole.BUYER];
