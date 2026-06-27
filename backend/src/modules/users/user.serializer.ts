import { Prisma, type User } from '@prisma/client';

/** Prisma select that never exposes the password hash. */
export const safeUserSelect = {
  id: true,
  fullName: true,
  phoneNumber: true,
  email: true,
  role: true,
  accountStatus: true,
  phoneVerified: true,
  profileImageUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Omit<User, 'passwordHash'>;

/** Strip the password hash from a full user record. */
export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}
