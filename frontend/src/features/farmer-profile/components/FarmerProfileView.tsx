'use client';

import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileEditForm } from '@/features/farmer-profile/components/ProfileEditForm';
import { formatGhanaPhone } from '@/lib/formatting/phone';

export function FarmerProfileView() {
  const { user, profile } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader title="Farm profile" subtitle="Your personal and farm details" />

      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Personal information</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-text">Full name</dt>
            <dd className="font-medium">{user?.fullName}</dd>
          </div>
          {user?.phone && (
            <div>
              <dt className="text-muted-text">Phone</dt>
              <dd className="font-medium">{formatGhanaPhone(user.phone)}</dd>
            </div>
          )}
          {user?.email && (
            <div>
              <dt className="text-muted-text">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Farm information</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-text">Farm name</dt>
            <dd className="font-medium">{profile?.farmName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-text">Primary crops</dt>
            <dd className="font-medium">{profile?.primaryCrops?.join(', ') ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-text">Farm size</dt>
            <dd className="font-medium">
              {profile?.farmSizeAcres ? `${profile.farmSizeAcres} acres` : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Location</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-text">Region</dt>
            <dd className="font-medium">{profile?.region ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-text">District</dt>
            <dd className="font-medium">{profile?.district ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-text">Town</dt>
            <dd className="font-medium">{profile?.village ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Verification</h2>
        <p className="mt-3 text-sm text-muted-text">
          Verification submission is not yet available in this version.
        </p>
      </section>

      <div className="mt-8">
        <ProfileEditForm />
      </div>
    </div>
  );
}
