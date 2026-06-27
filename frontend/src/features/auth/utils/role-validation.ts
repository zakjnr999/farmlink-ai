import type { PortalRole } from '@/types/auth';

export function getMissingPortalRoleMessage(missingRole: PortalRole): string {
  if (missingRole === 'buyer') {
    return 'Your account does not have buyer access yet. Add a buyer profile to source produce — for example, buy tomatoes while you sell plantain.';
  }
  return 'Your account does not have farmer access yet. Add a farmer profile to list your harvest for sale.';
}

export function getPortalRoleSignupPath(missingRole: PortalRole): string {
  return missingRole === 'buyer' ? '/buyer/signup' : '/farmer/signup';
}
