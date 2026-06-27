'use client';

import { useAuth } from '@/hooks/use-auth';
import { farmerProfileApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { profileUpdateSchema, type ProfileUpdateFormValues } from '@/features/farmer-profile/schemas/profile.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function ProfileEditForm() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      farmName: profile?.farmName ?? '',
      bio: profile?.bio ?? '',
      primaryCrops: profile?.primaryCrops ?? [],
      farmSizeAcres: profile?.farmSizeAcres,
      region: profile?.region ?? '',
      district: profile?.district ?? '',
      village: profile?.village ?? '',
    },
  });

  const onSubmit = async (values: ProfileUpdateFormValues) => {
    try {
      await farmerProfileApi.updateFarmerProfile({
        farmName: values.farmName,
        bio: values.bio,
        primaryCrops: values.primaryCrops,
        farmSizeAcres: values.farmSizeAcres,
        region: values.region,
        district: values.district,
        village: values.village,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmer.profile() });
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-morning-mist bg-field-cream p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <h2 className="font-heading text-lg font-semibold">Edit farm profile</h2>
      <div>
        <Label htmlFor="farmName">Farm name</Label>
        <Input id="farmName" className="mt-1.5 bg-warm-paper" {...form.register('farmName')} />
      </div>
      <div>
        <Label htmlFor="primaryCrops">Primary crops</Label>
        <Input
          id="primaryCrops"
          className="mt-1.5 bg-warm-paper"
          defaultValue={profile?.primaryCrops?.join(', ')}
          onChange={(e) =>
            form.setValue(
              'primaryCrops',
              e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
            )
          }
        />
      </div>
      <div>
        <Label htmlFor="district">District</Label>
        <Input id="district" className="mt-1.5 bg-warm-paper" {...form.register('district')} />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Save changes
      </Button>
    </form>
  );
}
