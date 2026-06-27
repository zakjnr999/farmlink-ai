'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { BuyerRoleGuard } from '@/features/auth/components/BuyerRoleGuard';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { BuyerPortalMark } from '@/components/brand/BuyerPortalMark';
import { BUYER_ROUTES } from '@/constants/routes';

export default function BuyerOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard loginPath={BUYER_ROUTES.login}>
      <BuyerRoleGuard>
        <div className="min-h-dvh bg-produce-cream dark:bg-exchange-ink">
          <DemoModeIndicator />
          <div className="mx-auto max-w-2xl px-4 py-8">
            <BuyerPortalMark className="mb-8" />
            {children}
          </div>
        </div>
      </BuyerRoleGuard>
    </AuthGuard>
  );
}
