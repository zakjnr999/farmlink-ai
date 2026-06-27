'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { demandsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNITS } from '@/constants/units';
import type { BuyerDemand } from '@/types/buyer';
import {
  demandSchema,
  demandFrequencyValues,
  type DemandFormValues,
} from '@/features/demands/schemas/demand.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DemandFormProps {
  mode: 'create' | 'edit';
  demand?: BuyerDemand;
}

function toDateInputValue(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function defaultValuesFromDemand(demand?: BuyerDemand): DemandFormValues {
  if (!demand) {
    return {
      produceCategory: '',
      quantityMin: 1,
      quantityMax: 10,
      unit: 'crate',
      preferredMaxPrice: '',
      requiredFrom: '',
      requiredUntil: '',
      preferredRegions: [],
      isRecurring: false,
      frequency: undefined,
    };
  }
  return {
    produceCategory: demand.produceCategory,
    produceCategoryId: demand.produceCategoryId,
    quantityMin: demand.quantityMin,
    quantityMax: demand.quantityMax,
    unit: demand.unit,
    preferredMaxPrice: demand.preferredMaxPrice ?? '',
    requiredFrom: toDateInputValue(demand.requiredFrom),
    requiredUntil: toDateInputValue(demand.requiredUntil),
    preferredRegions: demand.preferredRegions,
    isRecurring: demand.isRecurring,
    frequency: demand.frequency,
    status: demand.status === 'inactive' ? 'inactive' : 'active',
  };
}

export function DemandForm({ mode, demand }: DemandFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: defaultValuesFromDemand(demand),
  });

  const isRecurring = form.watch('isRecurring');
  const selectedRegions = form.watch('preferredRegions');

  const toggleRegion = (region: string) => {
    const current = form.getValues('preferredRegions');
    if (current.includes(region)) {
      form.setValue(
        'preferredRegions',
        current.filter((r) => r !== region),
        { shouldValidate: true },
      );
    } else {
      form.setValue('preferredRegions', [...current, region], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: DemandFormValues) => {
    const payload = {
      produceCategory: values.produceCategory,
      produceCategoryId: values.produceCategoryId,
      quantityMin: values.quantityMin,
      quantityMax: values.quantityMax,
      unit: values.unit,
      preferredMaxPrice:
        values.preferredMaxPrice === '' ? undefined : Number(values.preferredMaxPrice),
      requiredFrom: new Date(values.requiredFrom).toISOString(),
      requiredUntil: values.requiredUntil
        ? new Date(values.requiredUntil).toISOString()
        : undefined,
      preferredRegions: values.preferredRegions,
      isRecurring: values.isRecurring,
      frequency: values.isRecurring ? values.frequency : undefined,
      status: values.status,
    };

    try {
      if (mode === 'create') {
        const created = await demandsApi.createDemand(payload);
        queryClient.invalidateQueries({ queryKey: queryKeys.buyer.demands() });
        queryClient.invalidateQueries({ queryKey: queryKeys.buyer.dashboard() });
        toast.success('Demand created');
        router.push(BUYER_ROUTES.demandDetail(created.id));
      } else if (demand) {
        await demandsApi.updateDemand(demand.id, payload);
        queryClient.invalidateQueries({ queryKey: queryKeys.buyer.demands() });
        queryClient.invalidateQueries({ queryKey: queryKeys.buyer.demandDetail(demand.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.buyer.recommendations() });
        toast.success('Demand updated');
        router.push(BUYER_ROUTES.demandDetail(demand.id));
      }
    } catch {
      toast.error(mode === 'create' ? 'Could not create demand' : 'Could not update demand');
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="supply-band space-y-6 border-soft-border bg-produce-cream/40 p-5 dark:bg-deep-grove/20"
    >
      <p className="exchange-label">
        {mode === 'create' ? 'New procurement demand' : 'Edit demand'}
      </p>

      <div>
        <Label htmlFor="produceCategory">Produce category</Label>
        <Input
          id="produceCategory"
          className="mt-1.5 bg-warm-paper"
          placeholder="e.g. Tomatoes, Plantain, Cabbage"
          {...form.register('produceCategory')}
        />
        {form.formState.errors.produceCategory && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.produceCategory.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="quantityMin">Min quantity</Label>
          <Input
            id="quantityMin"
            type="number"
            min={1}
            className="mt-1.5 bg-warm-paper"
            {...form.register('quantityMin')}
          />
          {form.formState.errors.quantityMin && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.quantityMin.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="quantityMax">Max quantity</Label>
          <Input
            id="quantityMax"
            type="number"
            min={1}
            className="mt-1.5 bg-warm-paper"
            {...form.register('quantityMax')}
          />
          {form.formState.errors.quantityMax && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.quantityMax.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Controller
            control={form.control}
            name="unit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="unit" className="mt-1.5 bg-warm-paper">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.unit && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.unit.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="preferredMaxPrice">Preferred max price (optional)</Label>
        <Input
          id="preferredMaxPrice"
          type="number"
          min={0}
          step="0.01"
          className="mt-1.5 bg-warm-paper"
          placeholder="GHS per unit"
          {...form.register('preferredMaxPrice')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="requiredFrom">Required from</Label>
          <Input
            id="requiredFrom"
            type="date"
            className="mt-1.5 bg-warm-paper"
            {...form.register('requiredFrom')}
          />
          {form.formState.errors.requiredFrom && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.requiredFrom.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="requiredUntil">Required until (optional)</Label>
          <Input
            id="requiredUntil"
            type="date"
            className="mt-1.5 bg-warm-paper"
            {...form.register('requiredUntil')}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Preferred regions</legend>
        <p className="mt-1 text-xs text-ledger-grey">
          Select regions where you prefer to source supply.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {GHANA_REGION_NAMES.map((region) => (
            <label
              key={region}
              className="flex min-h-[var(--touch-target)] cursor-pointer items-center gap-2 rounded-md border border-soft-border px-2 py-1.5 text-sm has-[:checked]:border-market-green has-[:checked]:bg-market-green/5"
            >
              <Checkbox
                checked={selectedRegions.includes(region)}
                onCheckedChange={() => toggleRegion(region)}
              />
              {region}
            </label>
          ))}
        </div>
        {form.formState.errors.preferredRegions && (
          <p className="mt-2 text-sm text-destructive">
            {form.formState.errors.preferredRegions.message}
          </p>
        )}
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-soft-border bg-warm-paper/80 p-4">
        <div>
          <Label htmlFor="isRecurring">Recurring demand</Label>
          <p className="text-xs text-ledger-grey">Need this produce on a regular schedule</p>
        </div>
        <Controller
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <Switch id="isRecurring" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      {isRecurring && (
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Controller
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger id="frequency" className="mt-1.5 bg-warm-paper">
                  <SelectValue placeholder="How often?" />
                </SelectTrigger>
                <SelectContent>
                  {demandFrequencyValues.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.frequency && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.frequency.message}
            </p>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value ?? 'active'} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="mt-1.5 bg-warm-paper">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="bg-market-green hover:bg-market-green/90"
        >
          {mode === 'create' ? 'Create demand' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={form.formState.isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
