import { BuyerTransactionDetailView } from '@/features/transactions/components/BuyerTransactionDetailView';

interface PageProps {
  params: Promise<{ transactionId: string }>;
}

export default async function BuyerTransactionDetailPage({ params }: PageProps) {
  const { transactionId } = await params;
  return <BuyerTransactionDetailView transactionId={transactionId} />;
}
