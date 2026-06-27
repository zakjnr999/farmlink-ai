'use client';

import Link from 'next/link';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { formatRelativeDate } from '@/lib/formatting/dates';
import type { Offer } from '@/types/offer';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  highlight?: boolean;
  className?: string;
}

export function OfferCard({ offer, highlight, className }: OfferCardProps) {
  return (
    <Link
      href={`/farmer/offers/${offer.id}`}
      className={cn(
        'block rounded-2xl border p-4 transition-colors',
        highlight
          ? 'border-harvest-gold/40 bg-harvest-gold/10 hover:bg-harvest-gold/15'
          : 'border-morning-mist bg-warm-paper hover:bg-field-cream',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading font-semibold text-field-ink">
            {offer.buyerName ?? 'Buyer'}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <QuantityDisplay amount={offer.quantity} unit={offer.unit} />
            <PriceDisplay amount={offer.pricePerUnit} currency="GHS" perUnit={offer.unit} />
          </div>
          <p className="mt-2 text-sm font-semibold tabular-nums text-field-ink">
            Total: {offer.currency} {offer.totalAmount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-text">
            Received {formatRelativeDate(offer.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OfferStatusBadge status={(offer.status === 'rejected' ? 'declined' : offer.status) as 'pending'} />
          <ChevronRight className="size-4 text-muted-text" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
