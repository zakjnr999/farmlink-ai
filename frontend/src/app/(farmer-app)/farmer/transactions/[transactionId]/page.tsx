'use client';

import { TransactionDetailView } from '@/features/transactions/components/TransactionDetailView';
import { use } from 'react';

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = use(params);
  return <TransactionDetailView transactionId={transactionId} />;
}
