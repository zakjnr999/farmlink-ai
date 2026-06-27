'use client';

import { useAuth } from '@/hooks/use-auth';
import { userHasPortalRole } from '@/lib/auth/roles';
import { FARMER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  signupPath?: string;
}

export function RoleGuard({
  children,
  fallbackPath = FARMER_ROUTES.login,
  signupPath = FARMER_ROUTES.signup,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(fallbackPath);
      return;
    }
    if (!userHasPortalRole(user, 'farmer')) {
      router.replace(signupPath);
    }
  }, [user, loading, router, fallbackPath, signupPath]);

  if (loading) {
    return null;
  }

  if (!user || !userHasPortalRole(user, 'farmer')) {
    return null;
  }

  return <>{children}</>;
}
