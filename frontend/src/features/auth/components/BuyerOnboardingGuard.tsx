'use client';

import { useAuth } from '@/hooks/use-auth';
import { BUYER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface BuyerOnboardingGuardProps {
  children: ReactNode;
  onboardingPath?: string;
}

export function BuyerOnboardingGuard({
  children,
  onboardingPath = BUYER_ROUTES.onboarding,
}: BuyerOnboardingGuardProps) {
  const { isBuyerProfileComplete, loading, isBuyer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !isBuyer) return;
    if (!isBuyerProfileComplete) {
      router.replace(onboardingPath);
    }
  }, [isBuyerProfileComplete, loading, isBuyer, onboardingPath, router]);

  if (loading || !isBuyer) {
    return null;
  }

  if (!isBuyerProfileComplete) {
    return null;
  }

  return <>{children}</>;
}
