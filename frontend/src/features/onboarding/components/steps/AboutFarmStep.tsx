'use client';

import type { AboutFarmStepValues } from '@/features/onboarding/schemas/onboarding.schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { UseFormReturn } from 'react-hook-form';

interface AboutFarmStepProps {
  form: UseFormReturn<AboutFarmStepValues>;
}

export function AboutFarmStep({ form }: AboutFarmStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const crops = watch('primaryCrops') ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-field-ink">
          About your farm
        </h2>
        <p className="mt-1 text-sm text-muted-text">
          Tell buyers what you grow and a little about your operation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmName">Farm name</Label>
        <Input
          id="farmName"
          placeholder="Green Valley Farms"
          aria-invalid={Boolean(errors.farmName)}
          {...register('farmName')}
        />
        {errors.farmName && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.farmName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryCrops">Primary crops</Label>
        <Input
          id="primaryCrops"
          placeholder="Tomatoes, maize, pepper"
          defaultValue={crops.join(', ')}
          aria-invalid={Boolean(errors.primaryCrops)}
          onChange={(event) => {
            const parsed = event.target.value
              .split(',')
              .map((crop) => crop.trim())
              .filter(Boolean);
            setValue('primaryCrops', parsed, { shouldValidate: true, shouldDirty: true });
          }}
        />
        <p className="text-xs text-muted-text">Separate crops with commas.</p>
        {errors.primaryCrops && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.primaryCrops.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="farmSizeAcres">
          Farm size in acres <span className="text-muted-text">(optional)</span>
        </Label>
        <Input
          id="farmSizeAcres"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          placeholder="5"
          aria-invalid={Boolean(errors.farmSizeAcres)}
          {...register('farmSizeAcres')}
        />
        {errors.farmSizeAcres && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.farmSizeAcres.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          Farm description <span className="text-muted-text">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="A few words about your farm and what you grow best."
          aria-invalid={Boolean(errors.bio)}
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>
    </div>
  );
}
