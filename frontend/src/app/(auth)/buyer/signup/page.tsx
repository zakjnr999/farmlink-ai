'use client';

import Link from 'next/link';
import { BuyerPortalMark } from '@/components/brand/BuyerPortalMark';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { AUTH_ROUTES, BUYER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';

export default function BuyerSignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-produce-cream dark:bg-exchange-ink">
      <DemoModeIndicator />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between px-5 py-8 sm:px-10 lg:px-12">
          <BuyerPortalMark />
          <div className="my-10 space-y-5">
            <h1 className="font-heading max-w-lg text-3xl font-bold leading-tight text-exchange-ink dark:text-produce-cream sm:text-4xl">
              Join Harvest Exchange as a buyer.
            </h1>
            <p className="max-w-lg text-lg text-ledger-grey dark:text-muted-foreground">
              Create a business account to discover farmer supply, send offers and manage
              procurement in one workspace.
            </p>
          </div>
          <p className="text-sm text-ledger-grey">
            <Link href={AUTH_ROUTES.signup} className="font-medium text-market-green hover:underline">
              ← Choose a different account type
            </Link>
          </p>
        </section>

        <section className="flex items-center border-t border-soft-border bg-warm-paper px-5 py-10 sm:px-8 lg:border-l lg:border-t-0 dark:bg-deep-grove/20">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-exchange-ink dark:text-produce-cream">
                Create your buyer account
              </h2>
            <p className="mt-2 text-muted-text">
              One FarmLink account can include both farmer and buyer access — sell plantain and
              still source tomatoes. You will add business details after signing up.
            </p>
            </div>
            <SignupForm
              role="buyer"
              onSuccess={() => router.replace(BUYER_ROUTES.onboarding)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
