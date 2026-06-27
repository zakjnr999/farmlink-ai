'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { OnboardingGuard } from '@/features/auth/components/OnboardingGuard';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { FarmerBottomNavigation } from '@/components/navigation/FarmerBottomNavigation';
import { FarmerSidebar } from '@/components/navigation/FarmerSidebar';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';

export default function FarmerAppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard>
        <OnboardingGuard>
          <div className="min-h-dvh bg-field-cream">
            <DemoModeIndicator />
            <OfflineBanner />
            <div className="lg:flex">
              <FarmerSidebar />
              <div className="flex min-h-dvh flex-1 flex-col lg:min-h-0">
                <main className="flex-1 pb-24 lg:pb-6">{children}</main>
                <FarmerBottomNavigation />
              </div>
            </div>
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
          </div>
        </OnboardingGuard>
      </RoleGuard>
    </AuthGuard>
  );
}
