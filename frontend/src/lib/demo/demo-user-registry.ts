import {
  getUserRoles,
  mergePortalRoles,
  normalizeUser,
  userHasPortalRole,
  withActivePortal,
  type PortalRole,
} from '@/lib/auth/roles';
import type { LoginCredentials, RegisterPayload, User } from '@/types/auth';
import type { BuyerProfile } from '@/types/buyer';
import type { FarmerProfile } from '@/types/farmer';
import { demoBuyerProfile, demoBuyerUser } from './buyer-demo-data';
import { demoFarmerProfile, demoUser } from './demo-data';

function normalizeIdentifier(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s/g, '');
}

let demoCurrentUser: User = normalizeUser({
  ...demoUser,
  roles: ['farmer'],
});

const usersById = new Map<string, User>();
const identifierIndex = new Map<string, string>();
const farmerProfilesByUserId = new Map<string, FarmerProfile>();
const buyerProfilesByUserId = new Map<string, BuyerProfile>();

function indexUser(user: User) {
  const normalized = normalizeUser(user);
  usersById.set(normalized.id, normalized);
  identifierIndex.set(normalized.email.toLowerCase(), normalized.id);
  if (normalized.phone) {
    identifierIndex.set(normalized.phone.replace(/\s/g, ''), normalized.id);
  }
}

function seedUser(
  user: User,
  farmerProfile: FarmerProfile | null,
  buyerProfile: BuyerProfile | null,
) {
  const normalized = normalizeUser(user);
  indexUser(normalized);
  if (farmerProfile) {
    farmerProfilesByUserId.set(normalized.id, { ...farmerProfile });
  }
  if (buyerProfile) {
    buyerProfilesByUserId.set(normalized.id, { ...buyerProfile });
  }
}

seedUser({ ...demoUser, roles: ['farmer'] }, demoFarmerProfile, null);
seedUser({ ...demoBuyerUser, roles: ['buyer'] }, null, demoBuyerProfile);

export function getDemoCurrentUser(): User {
  return demoCurrentUser;
}

export function setDemoCurrentUser(user: User): void {
  demoCurrentUser = normalizeUser(user);
  indexUser(demoCurrentUser);
}

function findUserByIdentifier(identifier: string): User | undefined {
  const userId = identifierIndex.get(normalizeIdentifier(identifier));
  if (!userId) return undefined;
  return usersById.get(userId);
}

function inferPortalFromIdentifier(identifier: string): PortalRole {
  const key = normalizeIdentifier(identifier);
  const isBuyerHint =
    key.includes('golden') ||
    key.includes('goldenspoon') ||
    key.includes('buyer') ||
    key.includes('orders@');
  return isBuyerHint ? 'buyer' : 'farmer';
}

function createEphemeralUser(identifier: string, portal: PortalRole): User {
  const now = new Date().toISOString();
  const isEmail = identifier.includes('@');
  const user: User = normalizeUser({
    id: `user-${Date.now()}`,
    email: isEmail ? identifier : `${identifier}@farmlink.demo`,
    phone: isEmail ? undefined : identifier,
    fullName: isEmail ? identifier.split('@')[0] : 'FarmLink User',
    role: portal,
    roles: [portal],
    createdAt: now,
    updatedAt: now,
  });
  indexUser(user);
  return user;
}

function ensureFarmerProfile(userId: string): FarmerProfile {
  const existing = farmerProfilesByUserId.get(userId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const profile: FarmerProfile = {
    id: `farmer-${Date.now()}`,
    userId,
    farmName: '',
    region: '',
    district: '',
    village: '',
    primaryCrops: [],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };
  farmerProfilesByUserId.set(userId, profile);
  return profile;
}

function ensureBuyerProfile(userId: string): BuyerProfile {
  const existing = buyerProfilesByUserId.get(userId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const profile: BuyerProfile = {
    id: `buyer-${Date.now()}`,
    userId,
    businessName: '',
    buyerType: 'other',
    region: '',
    district: '',
    town: '',
    preferredProduce: [],
    commonUnits: [],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };
  buyerProfilesByUserId.set(userId, profile);
  return profile;
}

export function getFarmerProfileForCurrentUser(): FarmerProfile | null {
  if (!userHasPortalRole(demoCurrentUser, 'farmer')) return null;
  return farmerProfilesByUserId.get(demoCurrentUser.id) ?? null;
}

export function updateFarmerProfileForCurrentUser(
  update: Partial<FarmerProfile>,
): FarmerProfile {
  const profile = ensureFarmerProfile(demoCurrentUser.id);
  const next = {
    ...profile,
    ...update,
    updatedAt: new Date().toISOString(),
  };
  farmerProfilesByUserId.set(demoCurrentUser.id, next);
  return next;
}

export function getBuyerProfileForCurrentUser(): BuyerProfile | null {
  if (!userHasPortalRole(demoCurrentUser, 'buyer')) return null;
  return buyerProfilesByUserId.get(demoCurrentUser.id) ?? null;
}

export function updateBuyerProfileForCurrentUser(
  update: Partial<BuyerProfile>,
): BuyerProfile {
  const profile = ensureBuyerProfile(demoCurrentUser.id);
  const next = {
    ...profile,
    ...update,
    updatedAt: new Date().toISOString(),
  };
  buyerProfilesByUserId.set(demoCurrentUser.id, next);
  return next;
}

export function setDemoCurrentUserFromLogin(credentials: LoginCredentials): User {
  const identifier = credentials.email;
  const portal = credentials.portalRole ?? inferPortalFromIdentifier(identifier);

  let user = findUserByIdentifier(identifier);
  if (!user) {
    user = createEphemeralUser(identifier, portal);
    if (portal === 'farmer') ensureFarmerProfile(user.id);
    else ensureBuyerProfile(user.id);
  }

  if (!userHasPortalRole(user, portal)) {
    throw {
      message:
        portal === 'buyer'
          ? 'This account does not have buyer access yet. Add a buyer profile to source produce while you sell your own harvest.'
          : 'This account does not have farmer access yet. Add a farmer profile to list your harvest.',
      code: 'PORTAL_ROLE_MISSING',
      status: 403,
    };
  }

  demoCurrentUser = withActivePortal(user, portal);
  indexUser(demoCurrentUser);
  return demoCurrentUser;
}

export function setDemoCurrentUserFromRegister(payload: RegisterPayload): User {
  const role: PortalRole = payload.role === 'buyer' ? 'buyer' : 'farmer';
  const existing = findUserByIdentifier(payload.email) ?? findUserByIdentifier(payload.phone ?? '');

  if (existing) {
    if (userHasPortalRole(existing, role)) {
      throw {
        message: `You already have ${role} access on this account. Sign in instead.`,
        code: 'ROLE_ALREADY_REGISTERED',
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const roles = mergePortalRoles(getUserRoles(existing), role);
    const updated = withActivePortal(
      {
        ...existing,
        fullName: payload.fullName || existing.fullName,
        phone: payload.phone ?? existing.phone,
        updatedAt: now,
        roles,
      },
      role,
    );

    demoCurrentUser = updated;
    indexUser(updated);

    if (role === 'farmer') ensureFarmerProfile(updated.id);
    else ensureBuyerProfile(updated.id);

    return demoCurrentUser;
  }

  const now = new Date().toISOString();
  const user = normalizeUser({
    id: `user-${Date.now()}`,
    email: payload.email,
    phone: payload.phone,
    fullName: payload.fullName,
    role,
    roles: [role],
    createdAt: now,
    updatedAt: now,
  });

  demoCurrentUser = user;
  indexUser(user);

  if (role === 'farmer') ensureFarmerProfile(user.id);
  else ensureBuyerProfile(user.id);

  return user;
}

export function addPortalRoleToCurrentUser(role: PortalRole): User {
  if (userHasPortalRole(demoCurrentUser, role)) {
    throw {
      message: `You already have ${role} access.`,
      code: 'ROLE_ALREADY_REGISTERED',
      status: 409,
    };
  }

  const updated = withActivePortal(
    {
      ...demoCurrentUser,
      roles: mergePortalRoles(getUserRoles(demoCurrentUser), role),
      updatedAt: new Date().toISOString(),
    },
    role,
  );

  demoCurrentUser = updated;
  indexUser(updated);

  if (role === 'farmer') ensureFarmerProfile(updated.id);
  else ensureBuyerProfile(updated.id);

  return demoCurrentUser;
}

export function switchDemoPortal(portal: PortalRole): User {
  if (!userHasPortalRole(demoCurrentUser, portal)) {
    throw {
      message: `Your account does not have ${portal} access yet.`,
      code: 'PORTAL_ROLE_MISSING',
      status: 403,
    };
  }

  demoCurrentUser = withActivePortal(demoCurrentUser, portal);
  indexUser(demoCurrentUser);
  return demoCurrentUser;
}

export function resetDemoUserRegistry(): void {
  usersById.clear();
  identifierIndex.clear();
  farmerProfilesByUserId.clear();
  buyerProfilesByUserId.clear();
  demoCurrentUser = normalizeUser({ ...demoUser, roles: ['farmer'] });
  seedUser({ ...demoUser, roles: ['farmer'] }, demoFarmerProfile, null);
  seedUser({ ...demoBuyerUser, roles: ['buyer'] }, null, demoBuyerProfile);
}
