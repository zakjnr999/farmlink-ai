'use client';

import Link from 'next/link';
import { BuyerPortalMark } from '@/components/brand/BuyerPortalMark';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { BuyerLoginForm } from '@/features/auth/components/BuyerLoginForm';
import { Package, MapPin, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { AUTH_ROUTES, BUYER_ROUTES } from '@/constants/routes';

const supplyStats = [
  { label: 'Active listings', value: '248', icon: Package },
  { label: 'Regions', value: '12', icon: MapPin },
  { label: 'Weekly volume', value: '4.2k crates', icon: TrendingUp },
];

const categories = ['Tomatoes', 'Maize', 'Plantain', 'Pepper', 'Cassava', 'Yam'];

export default function BuyerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isBuyer, isBuyerProfileComplete, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated || !isBuyer) return;
    router.replace(isBuyerProfileComplete ? BUYER_ROUTES.home : BUYER_ROUTES.onboarding);
  }, [loading, isAuthenticated, isBuyer, isBuyerProfileComplete, router]);

  return (
    <div className="min-h-dvh bg-produce-cream dark:bg-exchange-ink">
      <DemoModeIndicator />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative flex flex-col justify-between overflow-hidden px-5 py-8 sm:px-10 lg:px-12">
          <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12]">
            <svg className="h-full w-full" aria-hidden="true">
              <defs>
                <pattern id="supply-route" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M0 24h48M24 0v48" stroke="currentColor" strokeWidth="0.5" className="text-market-green" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#supply-route)" />
            </svg>
          </div>
          <BuyerPortalMark className="relative" />
          <div className="relative my-10 space-y-6">
            <h1 className="font-heading max-w-lg text-3xl font-bold leading-tight text-exchange-ink dark:text-produce-cream sm:text-4xl">
              Source the right produce at the right time.
            </h1>
            <p className="max-w-lg text-lg text-ledger-grey dark:text-muted-foreground">
              Discover verified agricultural supply, compare availability and negotiate directly with
              farmers through one procurement workspace.
            </p>
            <ul className="flex flex-wrap gap-3">
              {supplyStats.map(({ label, value, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 border border-soft-border bg-warm-paper/80 px-3 py-2 text-sm dark:bg-deep-grove/40"
                >
                  <Icon className="size-4 text-market-green" aria-hidden />
                  <span className="font-semibold tabular-nums">{value}</span>
                  <span className="text-ledger-grey">{label}</span>
                </li>
              ))}
            </ul>
            <div>
              <p className="exchange-label mb-2">Current produce categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-sm border border-market-green/30 bg-market-green/5 px-2.5 py-1 text-sm font-medium text-deep-grove dark:text-fresh-leaf"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="relative text-sm text-ledger-grey">
            Built for Ghanaian businesses · Harvest Exchange procurement desk
          </p>
        </section>

        <section className="flex items-center border-t border-soft-border bg-warm-paper px-5 py-10 sm:px-8 lg:border-l lg:border-t-0 dark:bg-deep-grove/20">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-exchange-ink dark:text-produce-cream">
                Sign in to Harvest Exchange
              </h2>
              <p className="mt-2 text-muted-text">
                Use your phone number or email and password.
              </p>
            </div>
            <BuyerLoginForm onSuccess={() => router.replace(BUYER_ROUTES.home)} />
            <p className="text-center text-sm text-ledger-grey">
              New to FarmLink?{' '}
              <Link href={BUYER_ROUTES.signup} className="font-medium text-market-green hover:underline">
                Create a buyer account
              </Link>
              {' · '}
              <Link href={AUTH_ROUTES.signup} className="font-medium text-market-green hover:underline">
                Sign up as farmer
              </Link>
            </p>
            <p className="text-xs text-ledger-grey">
              Your session is secured. FarmLink never stores your password in plain text.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
