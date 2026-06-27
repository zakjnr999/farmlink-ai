import { DemandDetailView } from '@/features/demands/components/DemandDetailView';

interface PageProps {
  params: Promise<{ demandId: string }>;
}

export default async function BuyerDemandDetailPage({ params }: PageProps) {
  const { demandId } = await params;
  return <DemandDetailView demandId={demandId} />;
}
