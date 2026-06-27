'use client';

import Link from 'next/link';
import { ListingStatusBadge } from '@/components/listings/ListingStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { ProduceMarker } from '@/components/marketplace/ProduceMarker';
import type { Listing } from '@/types/listing';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  className?: string;
}

export function ListingCard({ listing, compact, className }: ListingCardProps) {
  return (
    <Link
      href={`/farmer/listings/${listing.id}`}
      className={cn(
        'block rounded-2xl border border-morning-mist bg-warm-paper p-4 transition-colors hover:border-farm-green/30 hover:bg-field-cream',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <ProduceMarker label={listing.produceType} category="vegetable" />
          <div className="min-w-0">
            <h3 className="truncate font-heading font-semibold text-field-ink">
              {listing.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <QuantityDisplay amount={listing.quantity} unit={listing.unit} />
              <PriceDisplay amount={listing.pricePerUnit} currency="GHS" perUnit={listing.unit} />
            </div>
            {!compact && listing.district && (
              <p className="mt-1 text-sm text-muted-text">
                {listing.district}, {listing.region}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ListingStatusBadge status={listing.status as 'active' | 'draft' | 'expired'} />
          <ChevronRight className="size-4 text-muted-text" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
