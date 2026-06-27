'use client';

import { AboutFarmStep } from '@/features/onboarding/components/steps/AboutFarmStep';
import { AboutYouStep } from '@/features/onboarding/components/steps/AboutYouStep';
import { FarmLocationStep } from '@/features/onboarding/components/steps/FarmLocationStep';
import { ReadyToListStep } from '@/features/onboarding/components/steps/ReadyToListStep';
import {
  aboutFarmStepSchema,
  aboutYouStepSchema,
  farmLocationStepSchema,
  ONBOARDING_PROGRESS_KEY,
  ONBOARDING_STEPS,
  type OnboardingFormValues,
  type OnboardingProgress,
  type OnboardingStep,
} from '@/features/onboarding/schemas/onboarding.schema';
import { useAuth } from '@/hooks/use-auth';
import { farmerProfileApi, isApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { FARMER_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function readStoredProgress(): OnboardingProgress | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ONBOARDING_PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProgress;
  } catch {
    return null;
  }
}

function writeStoredProgress(progress: OnboardingProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
}

function clearStoredProgress() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
}

export function OnboardingWizard() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const stored = readStoredProgress();

  const [step, setStep] = useState<OnboardingStep>(stored?.step ?? 'about-you');
  const [formData, setFormData] = useState<Partial<OnboardingFormValues>>(
    stored?.data ?? {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentIndex = ONBOARDING_STEPS.indexOf(step);
  const progressValue = ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const aboutYouForm = useForm({
    resolver: zodResolver(aboutYouStepSchema),
    defaultValues: {
      fullName: formData.fullName ?? user?.fullName ?? '',
      phone: formData.phone ?? user?.phone ?? '',
      email: formData.email ?? user?.email ?? '',
    },
  });

  const aboutFarmForm = useForm({
    resolver: zodResolver(aboutFarmStepSchema),
    defaultValues: {
      farmName: formData.farmName ?? '',
      bio: formData.bio ?? '',
      primaryCrops: formData.primaryCrops ?? [],
      farmSizeAcres: formData.farmSizeAcres ?? '',
    },
  });

  const farmLocationForm = useForm({
    resolver: zodResolver(farmLocationStepSchema),
    defaultValues: {
      region: formData.region ?? '',
      district: formData.district ?? '',
      village: formData.village ?? '',
      latitude: formData.latitude ?? '',
      longitude: formData.longitude ?? '',
    },
  });

  const persistProgress = useCallback(
    (nextStep: OnboardingStep, data: Partial<OnboardingFormValues>) => {
      writeStoredProgress({
        step: nextStep,
        data,
        updatedAt: new Date().toISOString(),
      });
    },
    [],
  );

  useEffect(() => {
    persistProgress(step, formData);
  }, [step, formData, persistProgress]);

  const mergedData = useMemo(() => formData, [formData]);

  const goNext = async () => {
    setSubmitError(null);

    if (step === 'about-you') {
      const valid = await aboutYouForm.trigger();
      if (!valid) return;
      const values = aboutYouForm.getValues();
      const nextData = { ...formData, ...values };
      setFormData(nextData);
      setStep('about-farm');
      persistProgress('about-farm', nextData);
      return;
    }

    if (step === 'about-farm') {
      const valid = await aboutFarmForm.trigger();
      if (!valid) return;
      const values = aboutFarmForm.getValues();
      const parsedFarmSize =
        values.farmSizeAcres === '' || values.farmSizeAcres === undefined
          ? undefined
          : Number(values.farmSizeAcres);
      const nextData = {
        ...formData,
        ...values,
        farmSizeAcres: parsedFarmSize,
      };
      setFormData(nextData);
      setStep('farm-location');
      persistProgress('farm-location', nextData);
      return;
    }

    if (step === 'farm-location') {
      const valid = await farmLocationForm.trigger();
      if (!valid) return;
      const values = farmLocationForm.getValues();
      const latitude =
        values.latitude === '' || values.latitude === undefined
          ? undefined
          : Number(values.latitude);
      const longitude =
        values.longitude === '' || values.longitude === undefined
          ? undefined
          : Number(values.longitude);
      const nextData = {
        ...formData,
        ...values,
        latitude,
        longitude,
      };
      setFormData(nextData);
      setStep('ready');
      persistProgress('ready', nextData);
    }
  };

  const goBack = () => {
    const previous = ONBOARDING_STEPS[currentIndex - 1];
    if (previous) {
      setStep(previous);
    }
  };

  const submitProfile = async (redirectToListing = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        farmName: formData.farmName!,
        region: formData.region!,
        district: formData.district!,
        village: formData.village,
        primaryCrops: formData.primaryCrops ?? [],
        bio: formData.bio,
        farmSizeAcres:
          typeof formData.farmSizeAcres === 'number' ? formData.farmSizeAcres : undefined,
        gpsCoordinates:
          typeof formData.latitude === 'number' && typeof formData.longitude === 'number'
            ? { lat: formData.latitude, lng: formData.longitude }
            : undefined,
      };

      await farmerProfileApi.completeOnboarding(payload);
      clearStoredProgress();
      await queryClient.invalidateQueries({ queryKey: queryKeys.farmer.profile() });
      await refreshSession();
      toast.success('Your farm profile is ready.');

      router.push(
        redirectToListing ? FARMER_ROUTES.listProduce : FARMER_ROUTES.home,
      );
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : 'We could not save your profile. Check your connection and try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-text">
          <span>
            Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
          </span>
          <span className="capitalize">{step.replace('-', ' ')}</span>
        </div>
        <Progress value={progressValue} aria-label="Onboarding progress" />
      </div>

      {step === 'about-you' && <AboutYouStep form={aboutYouForm} />}
      {step === 'about-farm' && <AboutFarmStep form={aboutFarmForm} />}
      {step === 'farm-location' && (
        <FarmLocationStep form={farmLocationForm} />
      )}
      {step === 'ready' && (
        <ReadyToListStep
          data={mergedData}
          isSubmitting={isSubmitting}
          onListFirst={() => void submitProfile(true)}
          onGoToDashboard={() => void submitProfile(false)}
        />
      )}

      {submitError && (
        <p className="rounded-lg border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red" role="alert">
          {submitError}
        </p>
      )}

      {step !== 'ready' && (
        <div className="flex gap-3 pt-2">
          {currentIndex > 0 && (
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={() => void goNext()}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
