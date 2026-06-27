'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { BuyerOnboardingGuard } from '@/features/auth/components/BuyerOnboardingGuard';
import { BuyerRoleGuard } from '@/features/auth/components/BuyerRoleGuard';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { BuyerBottomNavigation } from '@/components/navigation/BuyerBottomNavigation';
import { BuyerCommandPalette } from '@/components/navigation/BuyerCommandPalette';
import { BuyerHeader } from '@/components/layout/BuyerHeader';
import { BuyerSidebar } from '@/components/navigation/BuyerSidebar';
import { useBuyerNavCounts } from '@/features/dashboard/hooks/use-buyer-nav-counts';
import { BUYER_ROUTES } from '@/constants/routes';

export default function BuyerAppLayout({ children }: { children: ReactNode }) {
  const counts = useBuyerNavCounts();

  return (
    <AuthGuard loginPath={BUYER_ROUTES.login}>
      <BuyerRoleGuard>
        <BuyerOnboardingGuard>
          <div className="min-h-dvh bg-produce-cream dark:bg-exchange-ink">
            <DemoModeIndicator />
            <BuyerCommandPalette />
            <div className="lg:flex">
              <BuyerSidebar counts={counts} />
              <div className="flex min-h-dvh flex-1 flex-col">
                <BuyerHeader />
                <main className="flex-1 pb-24 lg:pb-8">{children}</main>
                <BuyerBottomNavigation />
              </div>
            </div>
          </div>
        </BuyerOnboardingGuard>
      </BuyerRoleGuard>
    </AuthGuard>
  );
}
