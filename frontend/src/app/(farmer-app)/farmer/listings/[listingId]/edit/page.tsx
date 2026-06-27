'use client';

import { ManualListingForm } from '@/features/listing-creation/components/ManualListingForm';
import { use } from 'react';

export default function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = use(params);
  return <ManualListingForm listingId={listingId} mode="edit" />;
}
