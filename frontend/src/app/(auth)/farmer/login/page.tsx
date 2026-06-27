'use client';

import Link from 'next/link';
import { FarmerPortalMark } from '@/components/brand/FarmerPortalMark';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { FarmerLoginForm } from '@/features/auth/components/FarmerLoginForm';
import { AUTH_ROUTES, FARMER_ROUTES } from '@/constants/routes';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const benefits = [
  'List produce by speaking or typing',
  'Receive buyer offers before harvest spoils',
  'Plan pickups and share transport where possible',
];

export default function FarmerLoginPage() {
  const router = useRouter();

  return (
    <div className="field-rows min-h-dvh bg-field-cream">
      <DemoModeIndicator />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between px-5 py-8 sm:px-8 lg:px-12">
          <FarmerPortalMark />
          <div className="my-10 space-y-5">
            <h1 className="font-heading max-w-lg text-3xl font-bold leading-tight text-field-ink sm:text-4xl">
              Turn your next harvest into a confirmed opportunity.
            </h1>
            <p className="max-w-lg text-lg text-muted-text">
              List your produce, receive suitable buyer offers and manage upcoming
              pickups from one simple workspace.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-base">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-farm-green"
                    aria-hidden
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-text">
            Built for Ghanaian farmers · Works on mobile data
          </p>
        </section>

        <section className="flex items-center bg-warm-paper px-5 py-10 sm:px-8 lg:border-l lg:border-morning-mist">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-field-ink">
                Sign in to your field journal
              </h2>
              <p className="mt-2 text-muted-text">
                Use your phone number or email and password.
              </p>
            </div>
            <FarmerLoginForm onSuccess={() => router.replace('/farmer')} />
            <p className="text-center text-sm text-muted-text">
              New to FarmLink?{' '}
              <Link href={FARMER_ROUTES.signup} className="font-medium text-farm-green hover:underline">
                Create a farmer account
              </Link>
              {' · '}
              <Link href={AUTH_ROUTES.signup} className="font-medium text-farm-green hover:underline">
                Sign up as buyer
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
