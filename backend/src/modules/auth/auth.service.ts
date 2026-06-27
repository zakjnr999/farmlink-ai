import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { signAccessToken } from '../../utils/jwt';
import { auditService } from '../../services/audit.service';
import { safeUserSelect, type SafeUser } from '../users/user.serializer';
import type { LoginInput, RegisterInput } from './auth.schema';

const BCRYPT_ROUNDS = 10;

interface AuthContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const authService = {
  async register(
    input: RegisterInput,
    ctx: AuthContext = {},
  ): Promise<{ user: SafeUser; accessToken: string }> {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ phoneNumber: input.phoneNumber }, ...(input.email ? [{ email: input.email }] : [])],
      },
      select: { id: true },
    });
    if (existing) {
      throw ApiError.conflict('An account with this phone number or email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        email: input.email ?? null,
        passwordHash,
        role: input.role,
      },
      select: safeUserSelect,
    });

    await auditService.record({
      actorUserId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    logger.info({ userId: user.id, role: user.role }, 'User registered');

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return { user, accessToken };
  },

  async login(
    input: LoginInput,
    ctx: AuthContext = {},
  ): Promise<{ user: SafeUser; accessToken: string }> {
    const identifier = input.identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneNumber: input.identifier.trim() }],
      },
    });

    // Use a uniform error to avoid leaking which accounts exist.
    if (!user) {
      logger.warn({ identifier }, 'Login failed: unknown identifier');
      throw ApiError.unauthorized('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      logger.warn({ userId: user.id }, 'Login failed: invalid password');
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw ApiError.forbidden(`Account is ${user.accountStatus.toLowerCase()}`);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: safeUserSelect,
    });

    await auditService.record({
      actorUserId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return { user: updated, accessToken };
  },

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  },

  isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  },
};
