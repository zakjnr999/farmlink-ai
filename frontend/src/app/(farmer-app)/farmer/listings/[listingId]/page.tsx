'use client';

import { ListingDetailView } from '@/features/listings/components/ListingDetailView';
import { use } from 'react';

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = use(params);
  return <ListingDetailView listingId={listingId} />;
}
