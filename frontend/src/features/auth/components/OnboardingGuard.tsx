'use client';

import { useAuth } from '@/hooks/use-auth';
import { FARMER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface OnboardingGuardProps {
  children: ReactNode;
  onboardingPath?: string;
}

export function OnboardingGuard({
  children,
  onboardingPath = FARMER_ROUTES.onboarding,
}: OnboardingGuardProps) {
  const { isProfileComplete, loading, isFarmer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !isFarmer) return;

    if (!isProfileComplete) {
      router.replace(onboardingPath);
    }
  }, [isProfileComplete, loading, isFarmer, onboardingPath, router]);

  if (loading) {
    return null;
  }

  if (!isProfileComplete) {
    return null;
  }

  return <>{children}</>;
}
