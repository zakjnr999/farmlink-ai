'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { buyerOffersApi, marketplaceApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import type { Offer, OfferStatus } from '@/types/offer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRelativeDate } from '@/lib/formatting/dates';
import { formatOfferStatus } from '@/lib/formatting/status';
import { formatGhs } from '@/lib/formatting/currency';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All offers' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

function mapBadgeStatus(status: OfferStatus): 'pending' | 'accepted' | 'declined' | 'countered' | 'expired' | 'withdrawn' {
  if (status === 'rejected') return 'declined';
  if (status === 'cancelled' || status === 'withdrawn') return 'withdrawn';
  if (status === 'completed') return 'accepted';
  return status as 'pending' | 'accepted' | 'countered' | 'expired';
}

function BuyerOfferRow({
  offer,
  listingTitle,
}: {
  offer: Offer;
  listingTitle?: string;
}) {
  const highlight = offer.status === 'pending';

  return (
    <Link
      href={BUYER_ROUTES.offerDetail(offer.id)}
      className={cn(
        'block border-b border-soft-border py-4 transition-colors',
        highlight ? 'bg-harvest-gold/5 hover:bg-harvest-gold/10' : 'hover:bg-produce-cream/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-semibold text-exchange-ink dark:text-produce-cream">
            {listingTitle ?? `Listing ${offer.listingId.slice(0, 8)}…`}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <QuantityDisplay amount={offer.quantity} unit={offer.unit} />
            <PriceDisplay amount={offer.pricePerUnit} currency={offer.currency} perUnit={offer.unit} />
          </div>
          <p className="mt-2 text-sm font-semibold tabular-nums text-market-green">
            Total {formatGhs(offer.totalAmount, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-ledger-grey">
            Sent {formatRelativeDate(offer.createdAt)} · {formatOfferStatus(offer.status)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OfferStatusBadge status={mapBadgeStatus(offer.status)} />
          <ChevronRight className="size-4 text-ledger-grey" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

export function BuyerOffersPageContent() {
  const [statusFilter, setStatusFilter] = useState('all');

  const offersQuery = useQuery({
    queryKey: queryKeys.buyer.offers({ status: statusFilter }),
    queryFn: () => buyerOffersApi.getBuyerOffers(),
  });

  const listingIds = useMemo(
    () => [...new Set((offersQuery.data ?? []).map((o) => o.listingId))],
    [offersQuery.data],
  );

  const listingsQuery = useQuery({
    queryKey: queryKeys.buyer.marketplace({ ids: listingIds.join(',') }),
    queryFn: async () => {
      const titles: Record<string, string> = {};
      await Promise.all(
        listingIds.map(async (id) => {
          try {
            const listing = await marketplaceApi.getMarketplaceListing(id);
            titles[id] = listing.title;
          } catch {
            titles[id] = '';
          }
        }),
      );
      return titles;
    },
    enabled: listingIds.length > 0,
  });

  const filteredOffers = useMemo(() => {
    let rows = offersQuery.data ?? [];
    if (statusFilter !== 'all') {
      rows = rows.filter((o) => o.status === statusFilter);
    }
    return [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [offersQuery.data, statusFilter]);

  if (offersQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (offersQuery.isError) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Could not load offers" onRetry={() => offersQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Your offers"
        subtitle="Offers you've sent to farmers"
      />

      <section className="supply-band max-w-xs border-soft-border bg-produce-cream/50 p-4 dark:bg-deep-grove/20">
        <Label htmlFor="offer-status-filter">Filter by status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="offer-status-filter" className="mt-1.5 bg-warm-paper">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {filteredOffers.length === 0 ? (
        <EmptyState
          title="No offers yet"
          description="When you send offers from marketplace listings or recommendations, they will appear here."
          actionLabel="Browse marketplace"
          actionHref={BUYER_ROUTES.marketplace}
        />
      ) : (
        <div className="divide-y divide-soft-border">
          {filteredOffers.map((offer) => (
            <BuyerOfferRow
              key={offer.id}
              offer={offer}
              listingTitle={listingsQuery.data?.[offer.listingId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
