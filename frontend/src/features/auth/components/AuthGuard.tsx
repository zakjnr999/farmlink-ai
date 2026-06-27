'use client';

import { useAuth } from '@/hooks/use-auth';
import { FARMER_ROUTES } from '@/constants/routes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  loginPath?: string;
}

export function AuthGuard({
  children,
  loginPath = FARMER_ROUTES.login,
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`${loginPath}?redirect=${redirect}`);
    }
  }, [isAuthenticated, loading, loginPath, pathname, router]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
