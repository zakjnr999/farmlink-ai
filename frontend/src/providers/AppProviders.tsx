'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { ComparisonProvider } from '@/providers/ComparisonProvider';
import { ListingDraftProvider } from '@/providers/ListingDraftProvider';
import { NetworkProvider } from '@/providers/NetworkProvider';
import { PWAProvider } from '@/providers/PWAProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NetworkProvider>
          <PWAProvider>
            <AuthProvider>
              <ComparisonProvider>
                <ListingDraftProvider>{children}</ListingDraftProvider>
              </ComparisonProvider>
            </AuthProvider>
          </PWAProvider>
        </NetworkProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
