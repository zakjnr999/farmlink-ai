'use client';

import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { RoleGuard } from '@/features/auth/components/RoleGuard';

export default function FarmerOnboardingPage() {
  return (
    <AuthGuard>
      <RoleGuard>
        <OnboardingWizard />
      </RoleGuard>
    </AuthGuard>
  );
}
