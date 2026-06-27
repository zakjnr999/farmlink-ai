'use client';

import Link from 'next/link';
import { FarmerPortalMark } from '@/components/brand/FarmerPortalMark';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { AUTH_ROUTES, FARMER_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';

export default function FarmerSignupPage() {
  const router = useRouter();

  return (
    <div className="field-rows min-h-dvh bg-field-cream">
      <DemoModeIndicator />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between px-5 py-8 sm:px-8 lg:px-12">
          <FarmerPortalMark />
          <div className="my-10 space-y-5">
            <h1 className="font-heading max-w-lg text-3xl font-bold leading-tight text-field-ink sm:text-4xl">
              Start listing your produce on FarmLink.
            </h1>
            <p className="max-w-lg text-lg text-muted-text">
              Create a free farmer account, complete your farm profile and connect with buyers
              before your harvest goes to waste.
            </p>
          </div>
          <p className="text-sm text-muted-text">
            <Link href={AUTH_ROUTES.signup} className="font-medium text-farm-green hover:underline">
              ← Choose a different account type
            </Link>
          </p>
        </section>

        <section className="flex items-center bg-warm-paper px-5 py-10 sm:px-8 lg:border-l lg:border-morning-mist">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-field-ink">
                Create your farmer account
              </h2>
            <p className="mt-2 text-muted-text">
              One FarmLink account can include both farmer and buyer access — list your harvest and
              still buy from other farmers. You will set up your farm details after signing up.
            </p>
            </div>
            <SignupForm
              role="farmer"
              onSuccess={() => router.replace(FARMER_ROUTES.onboarding)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
