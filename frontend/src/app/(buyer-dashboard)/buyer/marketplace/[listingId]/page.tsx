import { BuyerListingDetailView } from '@/features/marketplace/components/BuyerListingDetailView';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default async function BuyerMarketplaceDetailPage({ params }: PageProps) {
  const { listingId } = await params;
  return <BuyerListingDetailView listingId={listingId} />;
}
