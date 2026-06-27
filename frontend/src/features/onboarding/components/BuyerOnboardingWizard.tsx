'use client';



import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Progress } from '@/components/ui/progress';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';

import { BUYER_TYPE_OPTIONS, DEMAND_FREQUENCY_OPTIONS } from '@/constants/buyer-types';

import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';

import { PRODUCE_UNITS } from '@/constants/units';

import { BUYER_ROUTES } from '@/constants/routes';

import {

  businessIdentityStepSchema,

  buyerLocationStepSchema,

  BUYER_ONBOARDING_PROGRESS_KEY,

  BUYER_ONBOARDING_STEPS,

  firstDemandStepSchema,

  producePreferencesStepSchema,

  type BuyerOnboardingFormValues,

  type BuyerOnboardingProgress,

  type BuyerOnboardingStep,

} from '@/features/onboarding/schemas/buyer-onboarding.schema';

import { useAuth } from '@/hooks/use-auth';

import { buyerProfileApi, demandsApi, isApiError } from '@/lib/api';

import { queryKeys } from '@/lib/query/keys';

import { zodResolver } from '@hookform/resolvers/zod';

import { useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';

import { useCallback, useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { toast } from 'sonner';



function readStoredProgress(): BuyerOnboardingProgress | null {

  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(BUYER_ONBOARDING_PROGRESS_KEY);

  if (!raw) return null;

  try {

    return JSON.parse(raw) as BuyerOnboardingProgress;

  } catch {

    return null;

  }

}



function writeStoredProgress(progress: BuyerOnboardingProgress) {

  if (typeof window === 'undefined') return;

  window.localStorage.setItem(BUYER_ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));

}



function clearStoredProgress() {

  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(BUYER_ONBOARDING_PROGRESS_KEY);

}



const STEP_LABELS: Record<BuyerOnboardingStep, string> = {

  'business-identity': 'Business identity',

  location: 'Location',

  'produce-preferences': 'Produce preferences',

  'first-demand': 'First demand',

};



export function BuyerOnboardingWizard() {

  const { user, buyerProfile, refreshSession } = useAuth();

  const router = useRouter();

  const queryClient = useQueryClient();

  const stored = readStoredProgress();



  const [step, setStep] = useState<BuyerOnboardingStep>(

    stored?.step ?? 'business-identity',

  );

  const [formData, setFormData] = useState<Partial<BuyerOnboardingFormValues>>(

    stored?.data ?? {},

  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);



  const currentIndex = BUYER_ONBOARDING_STEPS.indexOf(step);

  const progressValue = ((currentIndex + 1) / BUYER_ONBOARDING_STEPS.length) * 100;



  const identityForm = useForm({

    resolver: zodResolver(businessIdentityStepSchema),

    defaultValues: {

      businessName: formData.businessName ?? buyerProfile?.businessName ?? '',

      buyerType: formData.buyerType ?? buyerProfile?.buyerType ?? 'restaurant',

      description: formData.description ?? buyerProfile?.description ?? '',

      contactEmail: formData.contactEmail ?? buyerProfile?.contactEmail ?? user?.email ?? '',

      contactPhone: formData.contactPhone ?? buyerProfile?.contactPhone ?? user?.phone ?? '',

    },

  });



  const locationForm = useForm({

    resolver: zodResolver(buyerLocationStepSchema),

    defaultValues: {

      region: formData.region ?? buyerProfile?.region ?? '',

      district: formData.district ?? buyerProfile?.district ?? '',

      town: formData.town ?? buyerProfile?.town ?? '',

      latitude: formData.latitude ?? '',

      longitude: formData.longitude ?? '',

      maxTravelDistanceKm: formData.maxTravelDistanceKm ?? '',

    },

  });



  const preferencesForm = useForm({

    resolver: zodResolver(producePreferencesStepSchema),

    defaultValues: {

      preferredProduce: formData.preferredProduce ?? buyerProfile?.preferredProduce ?? [],

      commonUnits: formData.commonUnits ?? buyerProfile?.commonUnits ?? [],

      typicalQuantityMin: formData.typicalQuantityMin ?? '',

      typicalQuantityMax: formData.typicalQuantityMax ?? '',

      purchaseFrequency: formData.purchaseFrequency ?? buyerProfile?.purchaseFrequency,

    },

  });



  const demandForm = useForm({

    resolver: zodResolver(firstDemandStepSchema),

    defaultValues: {

      skipFirstDemand: formData.skipFirstDemand ?? false,

      produceCategory: formData.produceCategory ?? '',

      quantityMin: formData.quantityMin ?? '',

      quantityMax: formData.quantityMax ?? '',

      unit: formData.unit,

      requiredFrom: formData.requiredFrom ?? new Date().toISOString().slice(0, 10),

      preferredRegions: formData.preferredRegions ?? [],

      isRecurring: formData.isRecurring ?? false,

      frequency: formData.frequency,

    },

  });



  const persistProgress = useCallback(

    (nextStep: BuyerOnboardingStep, data: Partial<BuyerOnboardingFormValues>) => {

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



  const goNext = async () => {

    setSubmitError(null);



    if (step === 'business-identity') {

      const valid = await identityForm.trigger();

      if (!valid) return;

      const values = identityForm.getValues();

      const nextData = { ...formData, ...values };

      setFormData(nextData);

      setStep('location');

      persistProgress('location', nextData);

      return;

    }



    if (step === 'location') {

      const valid = await locationForm.trigger();

      if (!valid) return;

      const values = locationForm.getValues();

      const latitude =

        values.latitude === '' || values.latitude === undefined

          ? undefined

          : Number(values.latitude);

      const longitude =

        values.longitude === '' || values.longitude === undefined

          ? undefined

          : Number(values.longitude);

      const maxTravelDistanceKm =

        values.maxTravelDistanceKm === '' || values.maxTravelDistanceKm === undefined

          ? undefined

          : Number(values.maxTravelDistanceKm);

      const nextData = { ...formData, ...values, latitude, longitude, maxTravelDistanceKm };

      setFormData(nextData);

      setStep('produce-preferences');

      persistProgress('produce-preferences', nextData);

      return;

    }



    if (step === 'produce-preferences') {

      const valid = await preferencesForm.trigger();

      if (!valid) return;

      const values = preferencesForm.getValues();

      const typicalQuantityMin =

        values.typicalQuantityMin === '' || values.typicalQuantityMin === undefined

          ? undefined

          : Number(values.typicalQuantityMin);

      const typicalQuantityMax =

        values.typicalQuantityMax === '' || values.typicalQuantityMax === undefined

          ? undefined

          : Number(values.typicalQuantityMax);

      const nextData = {

        ...formData,

        ...values,

        typicalQuantityMin,

        typicalQuantityMax,

      };

      setFormData(nextData);

      setStep('first-demand');

      persistProgress('first-demand', nextData);

    }

  };



  const goBack = () => {

    const previous = BUYER_ONBOARDING_STEPS[currentIndex - 1];

    if (previous) setStep(previous);

  };



  const submitOnboarding = async (redirectToDemand = false) => {

    setSubmitError(null);



    if (step === 'first-demand') {

      const valid = await demandForm.trigger();

      if (!valid) return;

      const demandValues = demandForm.getValues();

      setFormData((prev) => ({ ...prev, ...demandValues }));

    }



    setIsSubmitting(true);



    try {

      const merged: Partial<BuyerOnboardingFormValues> = {
        ...formData,
        ...(step === 'first-demand' ? demandForm.getValues() : {}),
      };



      const payload = {

        businessName: merged.businessName!,

        buyerType: merged.buyerType!,

        description: merged.description || undefined,

        contactEmail: merged.contactEmail || undefined,

        contactPhone: merged.contactPhone,

        region: merged.region!,

        district: merged.district!,

        town: merged.town!,

        preferredProduce: merged.preferredProduce ?? [],

        commonUnits: merged.commonUnits ?? [],

        gpsCoordinates:

          typeof merged.latitude === 'number' && typeof merged.longitude === 'number'

            ? { lat: merged.latitude, lng: merged.longitude }

            : undefined,

        maxTravelDistanceKm:

          typeof merged.maxTravelDistanceKm === 'number'

            ? merged.maxTravelDistanceKm

            : undefined,

        typicalQuantityMin:

          typeof merged.typicalQuantityMin === 'number'

            ? merged.typicalQuantityMin

            : undefined,

        typicalQuantityMax:

          typeof merged.typicalQuantityMax === 'number'

            ? merged.typicalQuantityMax

            : undefined,

        purchaseFrequency: merged.purchaseFrequency,

      };



      await buyerProfileApi.completeBuyerOnboarding(payload);



      if (!merged.skipFirstDemand && merged.produceCategory && merged.unit) {

        await demandsApi.createDemand({

          produceCategory: merged.produceCategory,

          quantityMin: Number(merged.quantityMin),

          quantityMax: Number(merged.quantityMax),

          unit: merged.unit,

          requiredFrom: merged.requiredFrom!,

          preferredRegions: merged.preferredRegions ?? [merged.region!],

          isRecurring: merged.isRecurring ?? false,

          frequency: merged.frequency,

        });

      }



      clearStoredProgress();

      await queryClient.invalidateQueries({ queryKey: queryKeys.buyer.profile() });

      await queryClient.invalidateQueries({ queryKey: queryKeys.buyer.demands() });

      await refreshSession();

      toast.success('Your business profile is ready.');



      router.push(

        redirectToDemand && !merged.skipFirstDemand

          ? BUYER_ROUTES.demands

          : BUYER_ROUTES.home,

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



  const skipDemand = demandForm.watch('skipFirstDemand');

  const preferredProduceInput = preferencesForm.watch('preferredProduce');



  return (

    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">

      <div className="space-y-2">

        <p className="exchange-label">Harvest Exchange onboarding</p>

        <div className="flex items-center justify-between text-sm text-ledger-grey">

          <span>

            Step {currentIndex + 1} of {BUYER_ONBOARDING_STEPS.length}

          </span>

          <span>{STEP_LABELS[step]}</span>

        </div>

        <Progress value={progressValue} aria-label="Buyer onboarding progress" />

      </div>



      {step === 'business-identity' && (

        <div className="space-y-5">

          <div>

            <h2 className="font-heading text-xl font-semibold text-exchange-ink dark:text-produce-cream">

              Business identity

            </h2>

            <p className="mt-1 text-sm text-ledger-grey">

              Tell farmers who you are and how to reach your procurement team.

            </p>

          </div>

          <div className="space-y-2">

            <Label htmlFor="businessName">Business name</Label>

            <Input id="businessName" {...identityForm.register('businessName')} />

            {identityForm.formState.errors.businessName && (

              <p className="text-sm text-tomato-accent" role="alert">

                {identityForm.formState.errors.businessName.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label htmlFor="buyerType">Buyer type</Label>

            <Controller

              control={identityForm.control}

              name="buyerType"

              render={({ field }) => (

                <Select value={field.value} onValueChange={field.onChange}>

                  <SelectTrigger id="buyerType">

                    <SelectValue placeholder="Select buyer type" />

                  </SelectTrigger>

                  <SelectContent>

                    {BUYER_TYPE_OPTIONS.map((option) => (

                      <SelectItem key={option.value} value={option.value}>

                        {option.label}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              )}

            />

            {identityForm.formState.errors.buyerType && (

              <p className="text-sm text-tomato-accent" role="alert">

                {identityForm.formState.errors.buyerType.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label htmlFor="description">

              About your business <span className="text-ledger-grey">(optional)</span>

            </Label>

            <Textarea id="description" {...identityForm.register('description')} />

          </div>

          <div className="space-y-2">

            <Label htmlFor="contactPhone">Contact phone</Label>

            <Input id="contactPhone" type="tel" {...identityForm.register('contactPhone')} />

            {identityForm.formState.errors.contactPhone && (

              <p className="text-sm text-tomato-accent" role="alert">

                {identityForm.formState.errors.contactPhone.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label htmlFor="contactEmail">

              Contact email <span className="text-ledger-grey">(optional)</span>

            </Label>

            <Input id="contactEmail" type="email" {...identityForm.register('contactEmail')} />

            {identityForm.formState.errors.contactEmail && (

              <p className="text-sm text-tomato-accent" role="alert">

                {identityForm.formState.errors.contactEmail.message}

              </p>

            )}

          </div>

        </div>

      )}



      {step === 'location' && (

        <div className="space-y-5">

          <div>

            <h2 className="font-heading text-xl font-semibold text-exchange-ink dark:text-produce-cream">

              Location

            </h2>

            <p className="mt-1 text-sm text-ledger-grey">

              Where you collect produce and how far you are willing to travel.

            </p>

          </div>

          <div className="space-y-2">

            <Label htmlFor="region">Region</Label>

            <Controller

              control={locationForm.control}

              name="region"

              render={({ field }) => (

                <Select value={field.value} onValueChange={field.onChange}>

                  <SelectTrigger id="region">

                    <SelectValue placeholder="Select region" />

                  </SelectTrigger>

                  <SelectContent>

                    {GHANA_REGION_NAMES.map((region) => (

                      <SelectItem key={region} value={region}>

                        {region}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              )}

            />

            {locationForm.formState.errors.region && (

              <p className="text-sm text-tomato-accent" role="alert">

                {locationForm.formState.errors.region.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label htmlFor="district">District</Label>

            <Input id="district" {...locationForm.register('district')} />

            {locationForm.formState.errors.district && (

              <p className="text-sm text-tomato-accent" role="alert">

                {locationForm.formState.errors.district.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label htmlFor="town">Town or city</Label>

            <Input id="town" {...locationForm.register('town')} />

            {locationForm.formState.errors.town && (

              <p className="text-sm text-tomato-accent" role="alert">

                {locationForm.formState.errors.town.message}

              </p>

            )}

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="space-y-2">

              <Label htmlFor="latitude">Latitude (optional)</Label>

              <Input id="latitude" inputMode="decimal" {...locationForm.register('latitude')} />

            </div>

            <div className="space-y-2">

              <Label htmlFor="longitude">Longitude (optional)</Label>

              <Input id="longitude" inputMode="decimal" {...locationForm.register('longitude')} />

            </div>

          </div>

          <div className="space-y-2">

            <Label htmlFor="maxTravelDistanceKm">Max travel distance (km, optional)</Label>

            <Input

              id="maxTravelDistanceKm"

              inputMode="numeric"

              {...locationForm.register('maxTravelDistanceKm')}

            />

          </div>

        </div>

      )}



      {step === 'produce-preferences' && (

        <div className="space-y-5">

          <div>

            <h2 className="font-heading text-xl font-semibold text-exchange-ink dark:text-produce-cream">

              Produce preferences

            </h2>

            <p className="mt-1 text-sm text-ledger-grey">

              Help FarmLink match you with suitable farmer listings.

            </p>

          </div>

          <div className="space-y-2">

            <Label htmlFor="preferredProduce">Preferred produce (comma-separated)</Label>

            <Input

              id="preferredProduce"

              placeholder="Tomatoes, Plantain, Pepper"

              defaultValue={preferredProduceInput?.join(', ')}

              onChange={(e) =>

                preferencesForm.setValue(

                  'preferredProduce',

                  e.target.value

                    .split(',')

                    .map((item) => item.trim())

                    .filter(Boolean),

                  { shouldValidate: true },

                )

              }

            />

            {preferencesForm.formState.errors.preferredProduce && (

              <p className="text-sm text-tomato-accent" role="alert">

                {preferencesForm.formState.errors.preferredProduce.message}

              </p>

            )}

          </div>

          <div className="space-y-2">

            <Label>Common units</Label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

              {PRODUCE_UNITS.map((unit) => {

                const selected = preferencesForm.watch('commonUnits')?.includes(unit.id);

                return (

                  <label

                    key={unit.id}

                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-soft-border px-3 py-2 text-sm"

                  >

                    <Checkbox

                      checked={selected}

                      onCheckedChange={(checked) => {

                        const current = preferencesForm.getValues('commonUnits') ?? [];

                        preferencesForm.setValue(

                          'commonUnits',

                          checked

                            ? [...current, unit.id]

                            : current.filter((id) => id !== unit.id),

                          { shouldValidate: true },

                        );

                      }}

                    />

                    {unit.label}

                  </label>

                );

              })}

            </div>

            {preferencesForm.formState.errors.commonUnits && (

              <p className="text-sm text-tomato-accent" role="alert">

                {preferencesForm.formState.errors.commonUnits.message}

              </p>

            )}

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="space-y-2">

              <Label htmlFor="typicalQuantityMin">Typical min (optional)</Label>

              <Input

                id="typicalQuantityMin"

                inputMode="numeric"

                {...preferencesForm.register('typicalQuantityMin')}

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="typicalQuantityMax">Typical max (optional)</Label>

              <Input

                id="typicalQuantityMax"

                inputMode="numeric"

                {...preferencesForm.register('typicalQuantityMax')}

              />

            </div>

          </div>

          <div className="space-y-2">

            <Label htmlFor="purchaseFrequency">Purchase frequency (optional)</Label>

            <Controller

              control={preferencesForm.control}

              name="purchaseFrequency"

              render={({ field }) => (

                <Select value={field.value ?? ''} onValueChange={field.onChange}>

                  <SelectTrigger id="purchaseFrequency">

                    <SelectValue placeholder="How often you buy" />

                  </SelectTrigger>

                  <SelectContent>

                    {DEMAND_FREQUENCY_OPTIONS.map((option) => (

                      <SelectItem key={option.value} value={option.value}>

                        {option.label}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              )}

            />

          </div>

        </div>

      )}



      {step === 'first-demand' && (

        <div className="space-y-5">

          <div>

            <h2 className="font-heading text-xl font-semibold text-exchange-ink dark:text-produce-cream">

              Optional first demand

            </h2>

            <p className="mt-1 text-sm text-ledger-grey">

              Post your first produce need now, or skip and add demands later.

            </p>

          </div>

          <label className="flex items-center gap-3 rounded-xl border border-soft-border bg-produce-cream/40 px-4 py-3 dark:bg-deep-grove/20">

            <Controller

              control={demandForm.control}

              name="skipFirstDemand"

              render={({ field }) => (

                <Checkbox checked={field.value} onCheckedChange={field.onChange} />

              )}

            />

            <span className="text-sm">Skip for now — I will add demands later</span>

          </label>



          {!skipDemand && (

            <>

              <div className="space-y-2">

                <Label htmlFor="produceCategory">Produce needed</Label>

                <Input id="produceCategory" {...demandForm.register('produceCategory')} />

                {demandForm.formState.errors.produceCategory && (

                  <p className="text-sm text-tomato-accent" role="alert">

                    {demandForm.formState.errors.produceCategory.message}

                  </p>

                )}

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="space-y-2">

                  <Label htmlFor="quantityMin">Minimum quantity</Label>

                  <Input id="quantityMin" inputMode="numeric" {...demandForm.register('quantityMin')} />

                  {demandForm.formState.errors.quantityMin && (

                    <p className="text-sm text-tomato-accent" role="alert">

                      {demandForm.formState.errors.quantityMin.message}

                    </p>

                  )}

                </div>

                <div className="space-y-2">

                  <Label htmlFor="quantityMax">Maximum quantity</Label>

                  <Input id="quantityMax" inputMode="numeric" {...demandForm.register('quantityMax')} />

                  {demandForm.formState.errors.quantityMax && (

                    <p className="text-sm text-tomato-accent" role="alert">

                      {demandForm.formState.errors.quantityMax.message}

                    </p>

                  )}

                </div>

              </div>

              <div className="space-y-2">

                <Label htmlFor="unit">Unit</Label>

                <Controller

                  control={demandForm.control}

                  name="unit"

                  render={({ field }) => (

                    <Select value={field.value ?? ''} onValueChange={field.onChange}>

                      <SelectTrigger id="unit">

                        <SelectValue placeholder="Select unit" />

                      </SelectTrigger>

                      <SelectContent>

                        {PRODUCE_UNITS.map((unit) => (

                          <SelectItem key={unit.id} value={unit.id}>

                            {unit.label}

                          </SelectItem>

                        ))}

                      </SelectContent>

                    </Select>

                  )}

                />

                {demandForm.formState.errors.unit && (

                  <p className="text-sm text-tomato-accent" role="alert">

                    {demandForm.formState.errors.unit.message}

                  </p>

                )}

              </div>

              <div className="space-y-2">

                <Label htmlFor="requiredFrom">Needed from</Label>

                <Input id="requiredFrom" type="date" {...demandForm.register('requiredFrom')} />

                {demandForm.formState.errors.requiredFrom && (

                  <p className="text-sm text-tomato-accent" role="alert">

                    {demandForm.formState.errors.requiredFrom.message}

                  </p>

                )}

              </div>

              <div className="space-y-2">

                <Label>Preferred regions</Label>

                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-soft-border p-3">

                  {GHANA_REGION_NAMES.map((region) => {

                    const selected = demandForm.watch('preferredRegions')?.includes(region);

                    return (

                      <label key={region} className="flex items-center gap-2 text-sm">

                        <Checkbox

                          checked={selected}

                          onCheckedChange={(checked) => {

                            const current = demandForm.getValues('preferredRegions') ?? [];

                            demandForm.setValue(

                              'preferredRegions',

                              checked

                                ? [...current, region]

                                : current.filter((r) => r !== region),

                              { shouldValidate: true },

                            );

                          }}

                        />

                        {region}

                      </label>

                    );

                  })}

                </div>

                {demandForm.formState.errors.preferredRegions && (

                  <p className="text-sm text-tomato-accent" role="alert">

                    {demandForm.formState.errors.preferredRegions.message}

                  </p>

                )}

              </div>

              <label className="flex items-center gap-3 text-sm">

                <Controller

                  control={demandForm.control}

                  name="isRecurring"

                  render={({ field }) => (

                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />

                  )}

                />

                This is a recurring demand

              </label>

              {demandForm.watch('isRecurring') && (

                <div className="space-y-2">

                  <Label htmlFor="frequency">Frequency</Label>

                  <Controller

                    control={demandForm.control}

                    name="frequency"

                    render={({ field }) => (

                      <Select value={field.value ?? ''} onValueChange={field.onChange}>

                        <SelectTrigger id="frequency">

                          <SelectValue placeholder="Select frequency" />

                        </SelectTrigger>

                        <SelectContent>

                          {DEMAND_FREQUENCY_OPTIONS.map((option) => (

                            <SelectItem key={option.value} value={option.value}>

                              {option.label}

                            </SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    )}

                  />

                  {demandForm.formState.errors.frequency && (

                    <p className="text-sm text-tomato-accent" role="alert">

                      {demandForm.formState.errors.frequency.message}

                    </p>

                  )}

                </div>

              )}

            </>

          )}

        </div>

      )}



      {submitError && (

        <p

          className="rounded-lg border border-tomato-accent/30 bg-tomato-accent/10 px-4 py-3 text-sm text-tomato-accent"

          role="alert"

        >

          {submitError}

        </p>

      )}



      <div className="flex gap-3 pt-2">

        {currentIndex > 0 && (

          <Button type="button" variant="secondary" onClick={goBack} disabled={isSubmitting}>

            Back

          </Button>

        )}

        {step !== 'first-demand' ? (

          <Button type="button" className="flex-1 bg-market-green hover:bg-market-green/90" onClick={() => void goNext()}>

            Continue

          </Button>

        ) : (

          <Button

            type="button"

            className="flex-1 bg-market-green hover:bg-market-green/90"

            disabled={isSubmitting}

            onClick={() => void submitOnboarding(!skipDemand)}

          >

            {isSubmitting ? 'Saving…' : skipDemand ? 'Finish setup' : 'Finish & view demands'}

          </Button>

        )}

      </div>

    </div>

  );

}


