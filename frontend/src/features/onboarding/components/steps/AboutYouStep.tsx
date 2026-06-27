'use client';

import type { AboutYouStepValues } from '@/features/onboarding/schemas/onboarding.schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormReturn } from 'react-hook-form';

interface AboutYouStepProps {
  form: UseFormReturn<AboutYouStepValues>;
}

export function AboutYouStep({ form }: AboutYouStepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-field-ink">
          About you
        </h2>
        <p className="mt-1 text-sm text-muted-text">
          Confirm your contact details so buyers and FarmLink can reach you.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          aria-invalid={Boolean(errors.fullName)}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0244123456"
          aria-invalid={Boolean(errors.phone)}
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-muted-text">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
    </div>
  );
}
