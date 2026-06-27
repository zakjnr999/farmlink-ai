'use client';

import { useAuth } from '@/hooks/use-auth';
import { userHasPortalRole } from '@/lib/auth/roles';
import { BUYER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface BuyerRoleGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  signupPath?: string;
}

export function BuyerRoleGuard({
  children,
  fallbackPath = BUYER_ROUTES.login,
  signupPath = BUYER_ROUTES.signup,
}: BuyerRoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(fallbackPath);
      return;
    }
    if (!userHasPortalRole(user, 'buyer')) {
      router.replace(signupPath);
    }
  }, [user, loading, router, fallbackPath, signupPath]);

  if (loading || !user || !userHasPortalRole(user, 'buyer')) {
    return null;
  }

  return <>{children}</>;
}
