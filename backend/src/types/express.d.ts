import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      role: UserRole;
    }

    interface Request {
      id: string;
      user?: AuthenticatedUser;
    }
  }
}

export {};
