import { describe, expect, it } from 'vitest';
import {
  getUserRoles,
  mergePortalRoles,
  normalizeUser,
  userHasPortalRole,
  withActivePortal,
} from '@/lib/auth/roles';
import type { User } from '@/types/auth';

describe('Portal roles', () => {
  const legacyFarmer: User = {
    id: '1',
    email: 'farmer@example.com',
    fullName: 'Farmer',
    role: 'farmer',
    createdAt: '',
    updatedAt: '',
  };

  it('derives roles from legacy single-role users', () => {
    expect(getUserRoles(legacyFarmer)).toEqual(['farmer']);
    expect(userHasPortalRole(legacyFarmer, 'farmer')).toBe(true);
    expect(userHasPortalRole(legacyFarmer, 'buyer')).toBe(false);
  });

  it('supports multiple portal roles on one account', () => {
    const dual = normalizeUser({
      ...legacyFarmer,
      roles: ['farmer', 'buyer'],
      role: 'farmer',
    });

    expect(getUserRoles(dual)).toEqual(['farmer', 'buyer']);
    expect(userHasPortalRole(dual, 'buyer')).toBe(true);
  });

  it('sets the active portal without dropping other roles', () => {
    const switched = withActivePortal(
      normalizeUser({ ...legacyFarmer, roles: ['farmer', 'buyer'] }),
      'buyer',
    );

    expect(switched.role).toBe('buyer');
    expect(getUserRoles(switched)).toEqual(['farmer', 'buyer']);
    expect(mergePortalRoles(['farmer'], 'buyer')).toEqual(['farmer', 'buyer']);
  });
});
