import type { User, UserRole } from '@/types/auth';

export type PortalRole = Extract<UserRole, 'farmer' | 'buyer'>;

export function getUserRoles(user: User | null | undefined): PortalRole[] {
  if (!user) return [];

  const fromArray = (user.roles ?? []).filter(
    (role): role is PortalRole => role === 'farmer' || role === 'buyer',
  );
  if (fromArray.length > 0) {
    return [...new Set(fromArray)];
  }

  if (user.role === 'farmer' || user.role === 'buyer') {
    return [user.role];
  }

  return [];
}

export function userHasPortalRole(
  user: User | null | undefined,
  portal: PortalRole,
): boolean {
  return getUserRoles(user).includes(portal);
}

export function mergePortalRoles(
  existing: PortalRole[],
  added: PortalRole,
): PortalRole[] {
  return existing.includes(added) ? existing : [...existing, added];
}

export function withActivePortal(user: User, portal: PortalRole): User {
  const roles = mergePortalRoles(getUserRoles(user), portal);
  return normalizeUser({ ...user, role: portal, roles });
}

export function normalizeUser(user: User): User {
  const roles = getUserRoles(user);
  const activeRole: PortalRole =
    user.role === 'farmer' || user.role === 'buyer'
      ? user.role
      : (roles[0] ?? 'farmer');

  return { ...user, role: activeRole, roles };
}
