'use client';

import type { OnboardingFormValues } from '@/features/onboarding/schemas/onboarding.schema';
import { FARMER_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ReadyToListStepProps {
  data: Partial<OnboardingFormValues>;
  isSubmitting?: boolean;
  onListFirst: () => void;
  onGoToDashboard: () => void;
}

export function ReadyToListStep({
  data,
  isSubmitting,
  onListFirst,
  onGoToDashboard,
}: ReadyToListStepProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-field-ink">
          Ready to list
        </h2>
        <p className="mt-1 text-sm text-muted-text">
          Review your farm details. You can update them later from your profile.
        </p>
      </div>

      <dl className="divide-y divide-border rounded-lg border border-border bg-warm-paper">
        <div className="px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-text">You</dt>
          <dd className="mt-1 text-field-ink">{data.fullName}</dd>
          <dd className="text-sm text-muted-text">{data.phone}</dd>
          {data.email ? (
            <dd className="text-sm text-muted-text">{data.email}</dd>
          ) : null}
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-text">Farm</dt>
          <dd className="mt-1 font-medium text-field-ink">{data.farmName}</dd>
          {data.primaryCrops?.length ? (
            <dd className="text-sm text-muted-text">
              {data.primaryCrops.join(', ')}
            </dd>
          ) : null}
          {data.farmSizeAcres ? (
            <dd className="text-sm text-muted-text">{data.farmSizeAcres} acres</dd>
          ) : null}
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-text">Location</dt>
          <dd className="mt-1 text-field-ink">
            {[data.village, data.district, data.region].filter(Boolean).join(', ')}
          </dd>
        </div>
      </dl>

      <div className="space-y-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onListFirst}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving your profile…' : 'List my first produce'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onGoToDashboard}
          disabled={isSubmitting}
        >
          Go to dashboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => router.push(FARMER_ROUTES.home)}
          disabled={isSubmitting}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
