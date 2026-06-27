import Link from 'next/link';
import type { Transaction } from '@/types/transaction';
import { formatDate } from '@/lib/formatting/dates';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface PickupSummaryProps {
  transaction: Transaction;
  className?: string;
}

export function PickupSummary({ transaction, className }: PickupSummaryProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-morning-mist bg-warm-paper p-4',
        className,
      )}
    >
      <p className="text-sm font-semibold text-farm-green">Upcoming pickup</p>
      <h3 className="mt-1 font-heading text-lg font-semibold text-field-ink">
        {transaction.listingTitle}
      </h3>
      <p className="mt-1 text-sm text-muted-text">{transaction.buyerName}</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <MapPin className="size-4 text-farm-green" aria-hidden />
        {transaction.deliveryDate ? (
          <time dateTime={transaction.deliveryDate}>
            Pickup {formatDate(transaction.deliveryDate)}
          </time>
        ) : (
          <span>Pickup date to be confirmed</span>
        )}
      </div>
      <Link
        href={`/farmer/transactions/${transaction.id}`}
        className="mt-3 inline-block text-sm font-semibold text-farm-green"
      >
        View transaction
      </Link>
    </article>
  );
}
