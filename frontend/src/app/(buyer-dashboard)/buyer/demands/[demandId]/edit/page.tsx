import { DemandEditForm } from '@/features/demands/components/DemandEditForm';

interface PageProps {
  params: Promise<{ demandId: string }>;
}

export default async function BuyerDemandEditPage({ params }: PageProps) {
  const { demandId } = await params;
  return <DemandEditForm demandId={demandId} />;
}
