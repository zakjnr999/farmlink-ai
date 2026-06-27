import { BuyerOfferDetailView } from '@/features/offers/components/BuyerOfferDetailView';

interface PageProps {
  params: Promise<{ offerId: string }>;
}

export default async function BuyerOfferDetailPage({ params }: PageProps) {
  const { offerId } = await params;
  return <BuyerOfferDetailView offerId={offerId} />;
}
