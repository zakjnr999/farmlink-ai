export type UserRole = 'farmer' | 'buyer' | 'admin' | 'transporter';

export type PortalRole = Extract<UserRole, 'farmer' | 'buyer'>;

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  /** Active portal role for the current session. */
  role: UserRole;
  /** All portal roles this account can access (farmer and/or buyer). */
  roles?: PortalRole[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
  /** Which portal the user is signing into. */
  portalRole?: PortalRole;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}
