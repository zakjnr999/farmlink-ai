'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { TransactionStatusBadge } from '@/components/marketplace/TransactionStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { formatDate } from '@/lib/formatting/dates';

function mapTxnStatus(
  status: string,
): 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed' {
  if (status === 'payment_confirmed') return 'confirmed';
  if (status === 'pending_payment') return 'pending';
  return status as 'completed';
}

interface TransactionDetailViewProps {
  transactionId: string;
}

export function TransactionDetailView({ transactionId }: TransactionDetailViewProps) {
  const query = useQuery({
    queryKey: [...queryKeys.transactions.list(), transactionId],
    queryFn: () => transactionsApi.getTransaction(transactionId),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState title="Transaction not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const txn = query.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader
        title={txn.listingTitle ?? 'Transaction'}
        subtitle={`Reference ${txn.id}`}
        actions={<TransactionStatusBadge status={mapTxnStatus(txn.status)} />}
      />

      <section className="mt-6 space-y-4 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <p className="text-sm text-muted-text">Buyer: {txn.buyerName}</p>
        <QuantityDisplay amount={txn.quantity} unit={txn.unit} size="lg" />
        <PriceDisplay amount={txn.pricePerUnit} currency="GHS" perUnit={txn.unit} size="lg" />
        <p className="text-lg font-semibold tabular-nums">
          Total: {txn.currency} {txn.totalAmount.toLocaleString()}
        </p>
        {txn.deliveryDate && (
          <p className="text-sm">
            Pickup date: <strong>{formatDate(txn.deliveryDate)}</strong>
          </p>
        )}
      </section>

      <p className="mt-6 rounded-xl bg-morning-mist px-4 py-3 text-sm text-muted-text">
        Payment settlement is handled outside FarmLink in the current MVP.
      </p>

      <Link
        href={`/farmer/listings/${txn.listingId}`}
        className="mt-4 inline-block text-sm font-semibold text-farm-green"
      >
        View related listing
      </Link>
    </div>
  );
}
