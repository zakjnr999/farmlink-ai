import { RecommendationDetailView } from '@/features/recommendations/components/RecommendationDetailView';

interface PageProps {
  params: Promise<{ recommendationId: string }>;
}

export default async function BuyerRecommendationDetailPage({ params }: PageProps) {
  const { recommendationId } = await params;
  return <RecommendationDetailView recommendationId={recommendationId} />;
}
