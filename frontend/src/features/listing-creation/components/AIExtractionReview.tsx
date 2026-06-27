'use client';

import { MissingFieldsPanel } from '@/features/listing-creation/components/MissingFieldsPanel';
import { PublishConfirmationDialog } from '@/features/listing-creation/components/PublishConfirmationDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { StickyActionBar } from '@/components/layout/StickyActionBar';
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
import { useListingDraftContext } from '@/providers/ListingDraftProvider';
import {
  extractionReviewSchema,
  type ExtractionReviewFormValues,
} from '@/features/listing-creation/schemas/extraction-review.schema';
import { formatConfidence } from '@/lib/formatting/status';
import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNITS } from '@/constants/units';
import { listingsApi } from '@/lib/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function AIExtractionReview() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const {
    extractionResult,
    rawText,
    reviewValues,
    updateReviewValues,
    setBackendListingId,
  } = useListingDraftContext();
  const [showPublish, setShowPublish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ExtractionReviewFormValues>({
    resolver: zodResolver(extractionReviewSchema),
    defaultValues: {
      title: '',
      produceType: '',
      categoryId: '',
      quantity: 0,
      unit: 'crate',
      region: 'Ashanti',
      district: '',
      village: '',
      harvestDate: '',
      availableFrom: '',
      confidence: 'unknown',
      missingFields: [],
      clarificationAnswers: {},
      rawText: '',
      ...reviewValues,
    },
  });

  useEffect(() => {
    if (!extractionResult && !reviewValues.title) {
      router.replace('/farmer/list-produce');
      return;
    }

    if (extractionResult) {
      form.reset({
        title: extractionResult.title ?? '',
        produceType: extractionResult.produceType ?? '',
        categoryId: extractionResult.categoryId ?? '',
        quantity: extractionResult.quantity ?? 0,
        unit: (extractionResult.unit as ExtractionReviewFormValues['unit']) ?? 'crate',
        pricePerUnit: extractionResult.pricePerUnit,
        harvestDate: extractionResult.harvestDate?.split('T')[0] ?? '',
        availableFrom: extractionResult.harvestDate?.split('T')[0] ?? '',
        confidence: extractionResult.confidence,
        rawText: rawText || extractionResult.rawText,
        region: reviewValues.region ?? 'Ashanti',
        district: reviewValues.district ?? '',
        village: reviewValues.village ?? '',
        missingFields: [],
        clarificationAnswers: {},
      });
    }
  }, [extractionResult, form, rawText, reviewValues, router]);

  const confidence = form.watch('confidence');
  const missingFields = form.watch('missingFields') ?? [];

  const saveListing = async (publishAfter = false) => {
    if (!isOnline) {
      toast.error('Unable to publish while offline');
      return;
    }

    const valid = await form.trigger();
    if (!valid) return;

    setIsSaving(true);
    const values = form.getValues();
    updateReviewValues(values);

    try {
      const listing = await listingsApi.createListing({
        title: values.title,
        categoryId: values.categoryId,
        produceType: values.produceType,
        quantity: values.quantity,
        unit: values.unit,
        pricePerUnit: values.pricePerUnit ?? 0,
        description: values.description,
        harvestDate: values.harvestDate,
        availableFrom: values.availableFrom,
        availableUntil: values.availableUntil,
        region: values.region,
        district: values.district,
      });

      setBackendListingId(listing.id);

      if (publishAfter) {
        await listingsApi.patchListing(listing.id, { status: 'active' });
        router.push(`/farmer/list-produce/success?id=${listing.id}`);
      } else {
        toast.success('Listing saved as draft');
        router.push(`/farmer/listings/${listing.id}`);
      }
    } catch {
      toast.error('Could not save listing. Check your details and try again.');
    } finally {
      setIsSaving(false);
      setShowPublish(false);
    }
  };

  if (!extractionResult && !reviewValues.title) {
    return null;
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-5 pb-32">
        <PageHeader
          title="Check your listing"
          subtitle="FarmLink has suggested these details from your description. Please check them before continuing."
        />

        <p className="mt-4 rounded-xl bg-morning-mist px-4 py-3 text-sm text-deep-soil">
          Confidence: <strong>{formatConfidence(confidence)}</strong>
        </p>

        {rawText && (
          <blockquote className="mt-4 border-l-4 border-dry-grass pl-4 text-sm italic text-muted-text">
            “{rawText}”
          </blockquote>
        )}

        <MissingFieldsPanel fields={missingFields} className="mt-6" />

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          {(
            [
              ['title', 'Listing title'],
              ['produceType', 'Produce type'],
              ['district', 'District'],
              ['village', 'Town / village'],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} className="mt-1.5" {...form.register(name)} />
              {form.formState.errors[name] && (
                <p className="mt-1 text-sm text-tomato-red">
                  {form.formState.errors[name]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                inputMode="decimal"
                className="mt-1.5"
                {...form.register('quantity')}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={form.watch('unit')}
                onValueChange={(v) => form.setValue('unit', v as ExtractionReviewFormValues['unit'])}
              >
                <SelectTrigger id="unit" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_UNITS.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="pricePerUnit">Price per unit (GHS)</Label>
            <Input
              id="pricePerUnit"
              type="number"
              inputMode="decimal"
              className="mt-1.5"
              {...form.register('pricePerUnit')}
            />
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Select
              value={form.watch('region')}
              onValueChange={(v) => form.setValue('region', v)}
            >
              <SelectTrigger id="region" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GHANA_REGION_NAMES.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="harvestDate">Harvest / ready date</Label>
              <Input id="harvestDate" type="date" className="mt-1.5" {...form.register('harvestDate')} />
            </div>
            <div>
              <Label htmlFor="availableFrom">Available from</Label>
              <Input id="availableFrom" type="date" className="mt-1.5" {...form.register('availableFrom')} />
            </div>
          </div>
        </form>
      </div>

      <StickyActionBar>
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isSaving}
            onClick={() => saveListing(false)}
          >
            Save draft
          </Button>
          <Button className="flex-1" disabled={isSaving} onClick={() => setShowPublish(true)}>
            Publish listing
          </Button>
        </div>
      </StickyActionBar>

      <PublishConfirmationDialog
        open={showPublish}
        onOpenChange={setShowPublish}
        onConfirm={() => saveListing(true)}
        loading={isSaving}
      />
    </>
  );
}
