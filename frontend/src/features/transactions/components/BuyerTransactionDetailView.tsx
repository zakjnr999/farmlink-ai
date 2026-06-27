'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Package,
  Truck,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { TransactionStatusBadge } from '@/components/marketplace/TransactionStatusBadge';
import { BUYER_ROUTES } from '@/constants/routes';
import { buyerTransactionsApi } from '@/lib/api';
import { formatDate, formatRelativeDate } from '@/lib/formatting/dates';
import { formatCurrency } from '@/lib/formatting/currency';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/transaction';

function mapTxnStatus(status: TransactionStatus) {
  if (status === 'payment_confirmed') return 'confirmed' as const;
  if (status === 'pending_payment') return 'pending' as const;
  return status as 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
}

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  date?: string;
  icon: typeof Circle;
  active: boolean;
  complete: boolean;
}

function buildTimeline(status: TransactionStatus, createdAt: string, deliveryDate?: string): TimelineStep[] {
  const order: TransactionStatus[] = [
    'pending_payment',
    'payment_confirmed',
    'in_transit',
    'delivered',
    'completed',
  ];
  const cancelled = status === 'cancelled' || status === 'disputed';
  const currentIndex = cancelled ? -1 : order.indexOf(status);

  const steps: Omit<TimelineStep, 'active' | 'complete'>[] = [
    {
      id: 'created',
      label: 'Offer accepted',
      description: 'Transaction created from accepted offer',
      date: createdAt,
      icon: CheckCircle2,
    },
    {
      id: 'confirmed',
      label: 'Terms confirmed',
      description: 'Quantity, price and pickup agreed',
      icon: Wallet,
    },
    {
      id: 'pickup',
      label: 'Pickup scheduled',
      description: deliveryDate ? `Collection on ${formatDate(deliveryDate)}` : 'Pickup date to be confirmed',
      date: deliveryDate,
      icon: CalendarDays,
    },
    {
      id: 'transit',
      label: 'In transit / collection',
      description: 'Produce collected or en route',
      icon: Truck,
    },
    {
      id: 'completed',
      label: 'Completed',
      description: 'Procurement transaction closed',
      icon: Package,
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    active: !cancelled && index === Math.max(currentIndex, 0),
    complete: !cancelled && index <= currentIndex,
  }));
}

interface BuyerTransactionDetailViewProps {
  transactionId: string;
}

export function BuyerTransactionDetailView({ transactionId }: BuyerTransactionDetailViewProps) {
  const query = useQuery({
    queryKey: queryKeys.buyer.transactionDetail(transactionId),
    queryFn: () => buyerTransactionsApi.getBuyerTransaction(transactionId),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <ErrorState title="Transaction not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const txn = query.data;
  const timeline = buildTimeline(txn.status, txn.createdAt, txn.deliveryDate);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8 lg:px-8">
      <PageHeader
        title={txn.listingTitle ?? txn.produceType ?? 'Transaction'}
        subtitle={`Reference ${txn.id}`}
        actions={<TransactionStatusBadge status={mapTxnStatus(txn.status)} />}
      />

      <section className="supply-band mt-6 space-y-4 rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
        <p className="exchange-label">Procurement summary</p>
        <p className="text-sm text-ledger-grey">
          Farmer: <strong className="text-exchange-ink dark:text-produce-cream">{txn.farmerName ?? '—'}</strong>
        </p>
        <QuantityDisplay amount={txn.quantity} unit={txn.unit} size="lg" />
        <PriceDisplay amount={txn.pricePerUnit} currency={txn.currency} perUnit={txn.unit} size="lg" />
        <p className="text-lg font-semibold tabular-nums">
          Total: {formatCurrency(txn.totalAmount, txn.currency)}
        </p>
        {txn.pickupLocation && (
          <p className="text-sm text-ledger-grey">
            Pickup location: <strong>{txn.pickupLocation}</strong>
            {txn.region ? ` · ${txn.region}` : ''}
          </p>
        )}
        {txn.deliveryDate && (
          <p className="text-sm">
            Pickup date: <strong>{formatDate(txn.deliveryDate)}</strong>
          </p>
        )}
        <p className="text-xs text-ledger-grey">
          Updated {formatRelativeDate(txn.updatedAt)}
        </p>
      </section>

      <section className="mt-8" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="font-heading text-lg font-semibold">
          Transaction timeline
        </h2>
        <ol className="relative mt-4 space-y-0" aria-label="Transaction progress">
          {timeline.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timeline.length - 1;
            return (
              <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 bg-soft-border"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                    step.complete
                      ? 'border-market-green bg-market-green/10 text-market-green'
                      : step.active
                        ? 'border-harvest-gold bg-harvest-gold/15 text-harvest-gold'
                        : 'border-soft-border bg-muted text-ledger-grey',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-ledger-grey">{step.description}</p>
                  {step.date && (
                    <time dateTime={step.date} className="text-xs text-ledger-grey">
                      {formatDate(step.date)}
                    </time>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {(txn.status === 'cancelled' || txn.status === 'disputed') && (
          <p className="mt-4 rounded-lg border border-tomato-accent/30 bg-tomato-accent/10 px-4 py-3 text-sm text-tomato-accent">
            This transaction was {txn.status === 'cancelled' ? 'cancelled' : 'marked as disputed'}.
          </p>
        )}
      </section>

      <p className="mt-6 rounded-xl border border-soft-border bg-produce-cream/60 px-4 py-3 text-sm text-ledger-grey dark:bg-deep-grove/30">
        Payment settlement is handled outside FarmLink in the current MVP.
      </p>

      {txn.listingId && (
        <Link
          href={BUYER_ROUTES.marketplaceDetail(txn.listingId)}
          className="mt-4 inline-block text-sm font-semibold text-market-green"
        >
          View related listing →
        </Link>
      )}
    </div>
  );
}
