'use client';

import { MatchesListView } from '@/features/matches/components/MatchesListView';
import { use } from 'react';

export default function ListingMatchesPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = use(params);
  return <MatchesListView listingId={listingId} />;
}
