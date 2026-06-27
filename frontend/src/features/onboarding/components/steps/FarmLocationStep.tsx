'use client';

import type { FarmLocationStepValues } from '@/features/onboarding/schemas/onboarding.schema';
import { GHANA_REGIONS } from '@/constants/ghana-regions';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

interface FarmLocationStepProps {
  form: UseFormReturn<FarmLocationStepValues>;
}

export function FarmLocationStep({ form }: FarmLocationStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const region = watch('region');
  const {
    coordinates,
    error: geoError,
    permission,
    isLoading: geoLoading,
    requestLocation,
  } = useGeolocation();

  const applyCoordinates = async () => {
    const result = coordinates ?? (await requestLocation());
    if (!result) return;
    setValue('latitude', result.latitude, { shouldDirty: true });
    setValue('longitude', result.longitude, { shouldDirty: true });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-field-ink">
          Farm location
        </h2>
        <p className="mt-1 text-sm text-muted-text">
          Buyers use your location to estimate distance and plan pickup. You can
          enter your town manually if you prefer not to share GPS.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select
          value={region ?? ''}
          onValueChange={(value) =>
            setValue('region', value, { shouldValidate: true, shouldDirty: true })
          }
        >
          <SelectTrigger id="region" aria-invalid={Boolean(errors.region)}>
            <SelectValue placeholder="Select your region" />
          </SelectTrigger>
          <SelectContent>
            {GHANA_REGIONS.map((item) => (
              <SelectItem key={item.code} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.region.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        <Input
          id="district"
          placeholder="Asante Akim North"
          aria-invalid={Boolean(errors.district)}
          {...register('district')}
        />
        {errors.district && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.district.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="village">Town or village</Label>
        <Input
          id="village"
          placeholder="Agogo"
          aria-invalid={Boolean(errors.village)}
          {...register('village')}
        />
        {errors.village && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.village.message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-warm-paper p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-field-ink">Use my phone location</p>
            <p className="mt-1 text-sm text-muted-text">
              Optional. Helps buyers estimate distance. You can skip this and
              continue with your town name.
            </p>
          </div>
          <MapPin className="size-5 shrink-0 text-farm-green" aria-hidden />
        </div>

        {permission === 'denied' && (
          <p className="mt-3 text-sm text-clay-orange" role="status">
            Location access was denied. Enter your town above to continue.
          </p>
        )}

        {geoError && permission !== 'denied' && (
          <p className="mt-3 text-sm text-muted-text" role="status">
            {geoError}
          </p>
        )}

        {(watch('latitude') || coordinates) && (
          <p className="mt-3 text-sm text-farm-green" role="status">
            {coordinates || watch('latitude')
              ? `Location saved (${Number(watch('latitude') ?? coordinates?.latitude).toFixed(4)}, ${Number(watch('longitude') ?? coordinates?.longitude).toFixed(4)})`
              : null}
          </p>
        )}

        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => void applyCoordinates()}
          disabled={geoLoading || permission === 'denied'}
        >
          {geoLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Finding location…
            </>
          ) : (
            'Use current location'
          )}
        </Button>
      </div>
    </div>
  );
}
