'use client';

import { OfferDetailView } from '@/features/offers/components/OfferDetailView';
import { use } from 'react';

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = use(params);
  return <OfferDetailView offerId={offerId} />;
}
