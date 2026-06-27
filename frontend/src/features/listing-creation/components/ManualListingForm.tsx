'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StickyActionBar } from '@/components/layout/StickyActionBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listingSchema, type ListingFormValues } from '@/features/listing-creation/schemas/listing.schema';
import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNITS } from '@/constants/units';
import { categoriesApi, listingsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const steps = ['Produce', 'Quantity & price', 'Harvest', 'Location', 'Review'] as const;

interface ManualListingFormProps {
  listingId?: string;
  mode?: 'create' | 'edit';
}

export function ManualListingForm({ listingId, mode = 'create' }: ManualListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getCategories,
  });

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      currency: 'GHS',
      sourceType: 'manual',
      unit: 'crate',
      region: 'Ashanti',
    },
  });

  const onSubmit = async (values: ListingFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
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
      };

      const listing =
        mode === 'edit' && listingId
          ? await listingsApi.patchListing(listingId, payload)
          : await listingsApi.createListing(payload);

      toast.success(mode === 'edit' ? 'Listing updated' : 'Listing saved');
      router.push(`/farmer/listings/${listing.id}`);
    } catch {
      toast.error('Could not save listing. Check your details.');
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    await form.handleSubmit(onSubmit)();
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-5 pb-32">
        <PageHeader
          title={mode === 'edit' ? 'Edit listing' : 'Fill listing form'}
          subtitle={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        />

        <form className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="title">Listing title</Label>
                <Input id="title" className="mt-1.5" {...form.register('title')} />
              </div>
              <div>
                <Label htmlFor="produceType">Produce type</Label>
                <Input id="produceType" className="mt-1.5" {...form.register('produceType')} />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={form.watch('categoryId')}
                  onValueChange={(v) => form.setValue('categoryId', v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesQuery.data ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" className="mt-1.5" {...form.register('description')} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" className="mt-1.5" {...form.register('quantity')} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={form.watch('unit')}
                    onValueChange={(v) => form.setValue('unit', v as ListingFormValues['unit'])}
                  >
                    <SelectTrigger className="mt-1.5">
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
                <Input id="pricePerUnit" type="number" className="mt-1.5" {...form.register('pricePerUnit')} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="harvestDate">Harvest date</Label>
                <Input id="harvestDate" type="date" className="mt-1.5" {...form.register('harvestDate')} />
              </div>
              <div>
                <Label htmlFor="availableFrom">Available from</Label>
                <Input id="availableFrom" type="date" className="mt-1.5" {...form.register('availableFrom')} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Region</Label>
                <Select value={form.watch('region')} onValueChange={(v) => form.setValue('region', v)}>
                  <SelectTrigger className="mt-1.5">
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
              <div>
                <Label htmlFor="district">District</Label>
                <Input id="district" className="mt-1.5" {...form.register('district')} />
              </div>
              <div>
                <Label htmlFor="village">Town / village</Label>
                <Input id="village" className="mt-1.5" {...form.register('village')} />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-2 rounded-2xl border border-morning-mist bg-warm-paper p-4 text-sm">
              <p><strong>Title:</strong> {form.watch('title')}</p>
              <p><strong>Produce:</strong> {form.watch('produceType')}</p>
              <p><strong>Quantity:</strong> {form.watch('quantity')} {form.watch('unit')}</p>
              <p><strong>Location:</strong> {form.watch('village')}, {form.watch('district')}</p>
            </div>
          )}
        </form>
      </div>

      <StickyActionBar>
        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={nextStep} disabled={isSaving}>
            {step === steps.length - 1 ? (isSaving ? 'Saving…' : 'Save listing') : 'Continue'}
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-text">
          <Link href="/farmer/list-produce" className="font-semibold text-farm-green">
            Choose another input method
          </Link>
        </p>
      </StickyActionBar>
    </>
  );
}
