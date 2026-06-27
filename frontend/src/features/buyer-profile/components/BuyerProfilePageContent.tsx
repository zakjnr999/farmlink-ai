'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { BUYER_TYPE_OPTIONS, DEMAND_FREQUENCY_OPTIONS } from '@/constants/buyer-types';
import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import { PRODUCE_UNITS } from '@/constants/units';
import { buyerProfileApi, isApiError } from '@/lib/api';
import { formatBuyerType } from '@/lib/formatting/buyer';
import { queryKeys } from '@/lib/query/keys';
import { z } from 'zod';
import type { BuyerType, DemandFrequency } from '@/types/buyer';

const identitySchema = z.object({
  businessName: z.string().trim().min(2, 'Business name is required.'),
  buyerType: z.string().min(1),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z
    .string()
    .trim()
    .regex(/^(\+233|0)[235]\d{8}$/, 'Enter a valid Ghana phone number.'),
});

const locationSchema = z.object({
  region: z.string().min(1),
  district: z.string().trim().min(2),
  town: z.string().trim().min(2),
  maxTravelDistanceKm: z.coerce.number().positive().optional().or(z.literal('')),
});

const preferencesSchema = z.object({
  preferredProduce: z.array(z.string()).min(1),
  commonUnits: z.array(z.string()).min(1),
  typicalQuantityMin: z.coerce.number().positive().optional().or(z.literal('')),
  typicalQuantityMax: z.coerce.number().positive().optional().or(z.literal('')),
  purchaseFrequency: z.string().optional(),
});

export function BuyerProfilePageContent() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'identity' | 'location' | 'preferences' | null>(null);

  const query = useQuery({
    queryKey: queryKeys.buyer.profile(),
    queryFn: buyerProfileApi.getBuyerProfile,
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <ErrorState title="Could not load business profile" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const profile = query.data;

  const saveProfile = async (update: Parameters<typeof buyerProfileApi.updateBuyerProfile>[0]) => {
    try {
      await buyerProfileApi.updateBuyerProfile(update);
      await queryClient.invalidateQueries({ queryKey: queryKeys.buyer.profile() });
      setActiveSection(null);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(isApiError(error) ? error.message : 'Could not update profile');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-5 pb-8 lg:px-8">
      <PageHeader
        title="Business profile"
        subtitle="Your procurement identity on Harvest Exchange"
        actions={
          profile.verificationStatus === 'verified' ? (
            <Badge variant="leaf">Verified</Badge>
          ) : (
            <Badge variant="harvest">Pending verification</Badge>
          )
        }
      />

      <ProfileSection
        title="Business identity"
        description="Name, type and contact details"
        isEditing={activeSection === 'identity'}
        onEdit={() => setActiveSection('identity')}
        onCancel={() => setActiveSection(null)}
      >
        {activeSection === 'identity' ? (
          <IdentityForm
            profile={profile}
            onSave={(values) =>
              void saveProfile({
                businessName: values.businessName,
                buyerType: values.buyerType as BuyerType,
                description: values.description || undefined,
                contactEmail: values.contactEmail || undefined,
                contactPhone: values.contactPhone,
              })
            }
          />
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ledger-grey">Business name</dt>
              <dd className="font-medium">{profile.businessName}</dd>
            </div>
            <div>
              <dt className="text-ledger-grey">Buyer type</dt>
              <dd className="font-medium">{formatBuyerType(profile.buyerType)}</dd>
            </div>
            {profile.description && (
              <div>
                <dt className="text-ledger-grey">About</dt>
                <dd>{profile.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-ledger-grey">Contact</dt>
              <dd>
                {profile.contactPhone}
                {profile.contactEmail ? ` · ${profile.contactEmail}` : ''}
              </dd>
            </div>
          </dl>
        )}
      </ProfileSection>

      <ProfileSection
        title="Location"
        description="Where you collect produce"
        isEditing={activeSection === 'location'}
        onEdit={() => setActiveSection('location')}
        onCancel={() => setActiveSection(null)}
      >
        {activeSection === 'location' ? (
          <LocationForm
            profile={profile}
            onSave={(values) =>
              void saveProfile({
                region: values.region,
                district: values.district,
                town: values.town,
                maxTravelDistanceKm:
                  values.maxTravelDistanceKm === '' ? undefined : Number(values.maxTravelDistanceKm),
              })
            }
          />
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ledger-grey">Region</dt>
              <dd className="font-medium">{profile.region}</dd>
            </div>
            <div>
              <dt className="text-ledger-grey">District</dt>
              <dd>{profile.district}</dd>
            </div>
            <div>
              <dt className="text-ledger-grey">Town</dt>
              <dd>{profile.town}</dd>
            </div>
            {profile.maxTravelDistanceKm && (
              <div>
                <dt className="text-ledger-grey">Max travel distance</dt>
                <dd>{profile.maxTravelDistanceKm} km</dd>
              </div>
            )}
          </dl>
        )}
      </ProfileSection>

      <ProfileSection
        title="Produce preferences"
        description="What you buy and typical order sizes"
        isEditing={activeSection === 'preferences'}
        onEdit={() => setActiveSection('preferences')}
        onCancel={() => setActiveSection(null)}
      >
        {activeSection === 'preferences' ? (
          <PreferencesForm
            profile={profile}
            onSave={(values) =>
              void saveProfile({
                preferredProduce: values.preferredProduce,
                commonUnits: values.commonUnits,
                typicalQuantityMin:
                  values.typicalQuantityMin === '' ? undefined : Number(values.typicalQuantityMin),
                typicalQuantityMax:
                  values.typicalQuantityMax === '' ? undefined : Number(values.typicalQuantityMax),
                purchaseFrequency: values.purchaseFrequency as DemandFrequency | undefined,
              })
            }
          />
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ledger-grey">Preferred produce</dt>
              <dd className="flex flex-wrap gap-2">
                {profile.preferredProduce.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-ledger-grey">Common units</dt>
              <dd>{profile.commonUnits.join(', ')}</dd>
            </div>
            {(profile.typicalQuantityMin || profile.typicalQuantityMax) && (
              <div>
                <dt className="text-ledger-grey">Typical order size</dt>
                <dd>
                  {profile.typicalQuantityMin ?? '—'} – {profile.typicalQuantityMax ?? '—'}
                </dd>
              </div>
            )}
            {profile.purchaseFrequency && (
              <div>
                <dt className="text-ledger-grey">Purchase frequency</dt>
                <dd className="capitalize">{profile.purchaseFrequency.replace('_', ' ')}</dd>
              </div>
            )}
          </dl>
        )}
      </ProfileSection>
    </div>
  );
}

function ProfileSection({
  title,
  description,
  isEditing,
  onEdit,
  onCancel,
  children,
}: {
  title: string;
  description: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="exchange-label">{description}</p>
          <h2 className="font-heading mt-1 text-lg font-semibold">{title}</h2>
        </div>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        {isEditing && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function IdentityForm({
  profile,
  onSave,
}: {
  profile: Awaited<ReturnType<typeof buyerProfileApi.getBuyerProfile>>;
  onSave: (values: z.infer<typeof identitySchema>) => void;
}) {
  const form = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      businessName: profile.businessName,
      buyerType: profile.buyerType,
      description: profile.description ?? '',
      contactEmail: profile.contactEmail ?? '',
      contactPhone: profile.contactPhone ?? '',
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSave)}>
      <div className="space-y-2">
        <Label htmlFor="edit-businessName">Business name</Label>
        <Input id="edit-businessName" {...form.register('businessName')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-buyerType">Buyer type</Label>
        <Controller
          control={form.control}
          name="buyerType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="edit-buyerType">
                <SelectValue />
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">About</Label>
        <Textarea id="edit-description" {...form.register('description')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-contactPhone">Contact phone</Label>
        <Input id="edit-contactPhone" {...form.register('contactPhone')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-contactEmail">Contact email</Label>
        <Input id="edit-contactEmail" type="email" {...form.register('contactEmail')} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting} className="bg-market-green hover:bg-market-green/90">
        Save changes
      </Button>
    </form>
  );
}

function LocationForm({
  profile,
  onSave,
}: {
  profile: Awaited<ReturnType<typeof buyerProfileApi.getBuyerProfile>>;
  onSave: (values: z.infer<typeof locationSchema>) => void;
}) {
  const form = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      region: profile.region,
      district: profile.district,
      town: profile.town,
      maxTravelDistanceKm: profile.maxTravelDistanceKm ?? '',
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSave)}>
      <div className="space-y-2">
        <Label htmlFor="edit-region">Region</Label>
        <Controller
          control={form.control}
          name="region"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="edit-region">
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
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-district">District</Label>
        <Input id="edit-district" {...form.register('district')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-town">Town</Label>
        <Input id="edit-town" {...form.register('town')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-maxTravel">Max travel distance (km)</Label>
        <Input id="edit-maxTravel" inputMode="numeric" {...form.register('maxTravelDistanceKm')} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting} className="bg-market-green hover:bg-market-green/90">
        Save changes
      </Button>
    </form>
  );
}

function PreferencesForm({
  profile,
  onSave,
}: {
  profile: Awaited<ReturnType<typeof buyerProfileApi.getBuyerProfile>>;
  onSave: (values: z.infer<typeof preferencesSchema>) => void;
}) {
  const form = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredProduce: profile.preferredProduce,
      commonUnits: profile.commonUnits,
      typicalQuantityMin: profile.typicalQuantityMin ?? '',
      typicalQuantityMax: profile.typicalQuantityMax ?? '',
      purchaseFrequency: profile.purchaseFrequency ?? '',
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSave)}>
      <div className="space-y-2">
        <Label htmlFor="edit-produce">Preferred produce (comma-separated)</Label>
        <Input
          id="edit-produce"
          defaultValue={profile.preferredProduce.join(', ')}
          onChange={(e) =>
            form.setValue(
              'preferredProduce',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              { shouldValidate: true },
            )
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-units">Common units (comma-separated ids)</Label>
        <Input
          id="edit-units"
          defaultValue={profile.commonUnits.join(', ')}
          onChange={(e) =>
            form.setValue(
              'commonUnits',
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              { shouldValidate: true },
            )
          }
        />
        <p className="text-xs text-ledger-grey">
          Available: {PRODUCE_UNITS.map((u) => u.id).join(', ')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-qty-min">Typical min</Label>
          <Input id="edit-qty-min" inputMode="numeric" {...form.register('typicalQuantityMin')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-qty-max">Typical max</Label>
          <Input id="edit-qty-max" inputMode="numeric" {...form.register('typicalQuantityMax')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-frequency">Purchase frequency</Label>
        <Controller
          control={form.control}
          name="purchaseFrequency"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger id="edit-frequency">
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
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting} className="bg-market-green hover:bg-market-green/90">
        Save changes
      </Button>
    </form>
  );
}
