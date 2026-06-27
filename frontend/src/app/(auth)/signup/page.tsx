'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBasket, Sprout } from 'lucide-react';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { BrandMark } from '@/components/brand/BrandMark';
import { BUYER_ROUTES, FARMER_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const options = [
  {
    role: 'farmer' as const,
    title: 'Farmer / Supplier',
    description:
      'List your harvest, receive buyer offers and manage pickups from your field journal.',
    href: FARMER_ROUTES.signup,
    icon: Sprout,
    accent: 'border-farm-green/30 bg-farm-green/5 hover:border-farm-green',
    label: 'Sell produce',
  },
  {
    role: 'buyer' as const,
    title: 'Buyer / Business',
    description:
      'Discover verified supply, send offers and plan procurement for your restaurant, hotel or business.',
    href: BUYER_ROUTES.signup,
    icon: ShoppingBasket,
    accent: 'border-market-green/30 bg-market-green/5 hover:border-market-green',
    label: 'Source produce',
  },
];

export default function SignupPage() {
  return (
    <div className="min-h-dvh bg-field-cream dark:bg-exchange-ink">
      <DemoModeIndicator />
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-5 py-10 sm:px-8">
        <BrandMark />
        <div className="my-10 flex-1 space-y-8">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-bold text-field-ink dark:text-produce-cream">
              Join FarmLink AI
            </h1>
            <p className="max-w-xl text-muted-text">
              Choose how you use FarmLink — as a farmer supplying produce, or as a buyer sourcing
              it for your business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.role}
                  href={option.href}
                  className={cn(
                    'group flex flex-col border p-6 transition-colors',
                    option.accent,
                  )}
                >
                  <span className="exchange-label">{option.label}</span>
                  <Icon className="mt-4 size-8 text-farm-green" aria-hidden />
                  <h2 className="font-heading mt-3 text-xl font-semibold text-field-ink dark:text-produce-cream">
                    {option.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-text">{option.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Sign up <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-muted-text">
          Already registered?{' '}
          <Link href={FARMER_ROUTES.login} className="font-medium text-primary hover:underline">
            Farmer sign in
          </Link>
          {' · '}
          <Link href={BUYER_ROUTES.login} className="font-medium text-primary hover:underline">
            Buyer sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
