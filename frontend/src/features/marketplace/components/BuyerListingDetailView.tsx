'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  Sprout,
  User,
} from 'lucide-react';
import { marketplaceApi, recommendationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { AvailabilityWindow } from '@/components/listings/AvailabilityWindow';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { OfferComposer } from '@/features/offers/components/OfferComposer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatting/dates';
import { formatDistanceKm } from '@/lib/formatting/distances';
import { formatQuantity } from '@/lib/formatting/quantities';
import { useComparison } from '@/providers/ComparisonProvider';
import { toast } from 'sonner';

interface BuyerListingDetailViewProps {
  listingId: string;
  recommendationId?: string;
}

export function BuyerListingDetailView({
  listingId,
  recommendationId,
}: BuyerListingDetailViewProps) {
  const [offerOpen, setOfferOpen] = useState(false);
  const { addItem, isInComparison, isFull } = useComparison();

  const listingQuery = useQuery({
    queryKey: queryKeys.buyer.marketplaceDetail(listingId),
    queryFn: () => marketplaceApi.getMarketplaceListing(listingId),
  });

  const recommendationQuery = useQuery({
    queryKey: queryKeys.buyer.recommendationDetail(recommendationId ?? ''),
    queryFn: () => recommendationsApi.getRecommendation(recommendationId!),
    enabled: Boolean(recommendationId),
  });

  const relatedQuery = useQuery({
    queryKey: queryKeys.buyer.marketplace({
      category: listingQuery.data?.categoryId,
      region: listingQuery.data?.region,
      limit: 4,
    }),
    queryFn: () =>
      marketplaceApi.getMarketplaceListings({
        category: listingQuery.data?.categoryId,
        region: listingQuery.data?.region,
        limit: 4,
      }),
    enabled: Boolean(listingQuery.data),
  });

  const relatedListings = useMemo(
    () => (relatedQuery.data ?? []).filter((l) => l.id !== listingId).slice(0, 3),
    [relatedQuery.data, listingId],
  );

  if (listingQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Listing not found" onRetry={() => listingQuery.refetch()} />
      </div>
    );
  }

  const listing = listingQuery.data;
  const recommendation = recommendationQuery.data;
  const matchScore = recommendation?.score ?? listing.matchScore;
  const matchExplanation = recommendation?.explanation;

  const handleCompare = () => {
    if (isInComparison(listing.id)) return;
    if (isFull) {
      toast.error('Compare list is full (max 3 listings).');
      return;
    }
    addItem(listing);
    toast.success('Added to compare');
  };

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <PageHeader
        title={listing.title}
        subtitle={listing.produceType}
        backButton={
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={BUYER_ROUTES.marketplace} aria-label="Back to marketplace">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {listing.farmerVerified && (
              <Badge variant="leaf" className="gap-1">
                <ShieldCheck className="size-3" aria-hidden />
                Verified farmer
              </Badge>
            )}
          </div>
        }
      />

      {matchScore != null && (
        <section className="supply-band border-soft-border bg-produce-cream/60 p-4 dark:bg-deep-grove/30">
          <p className="exchange-label">Match alignment</p>
          <MatchScoreStrip
            score={matchScore}
            label={recommendation?.scoreLabel}
            className="mt-2 max-w-md"
          />
          {matchExplanation && (
            <p className="mt-3 text-sm text-ledger-grey">{matchExplanation}</p>
          )}
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6">
          <div className="supply-band border-soft-border p-5">
            <p className="exchange-label">Supply terms</p>
            <div className="mt-4 space-y-3">
              <QuantityDisplay
                amount={listing.availableQuantity ?? listing.quantity}
                unit={listing.unit}
                size="lg"
              />
              <PriceDisplay
                amount={listing.pricePerUnit}
                currency={listing.currency}
                perUnit={listing.unit}
                size="lg"
              />
              {listing.minimumOrder != null && listing.minimumOrder > 0 && (
                <p className="text-sm text-ledger-grey">
                  Minimum order: {formatQuantity(listing.minimumOrder, listing.unit)}
                </p>
              )}
              {listing.description && (
                <p className="text-sm leading-relaxed text-exchange-ink dark:text-produce-cream/90">
                  {listing.description}
                </p>
              )}
            </div>
          </div>

          <div className="supply-band border-soft-border p-5">
            <p className="exchange-label">Harvest timeline</p>
            <ul className="mt-4 space-y-3 text-sm">
              {listing.harvestDate && (
                <li className="flex items-start gap-2">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-market-green" aria-hidden />
                  <span>
                    <strong className="text-exchange-ink dark:text-produce-cream">Harvest date</strong>
                    <br />
                    {formatDate(listing.harvestDate)}
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 shrink-0 text-market-green" aria-hidden />
                <span>
                  <strong className="text-exchange-ink dark:text-produce-cream">Availability window</strong>
                  <br />
                  <AvailabilityWindow
                    startDate={listing.availableFrom}
                    endDate={listing.availableUntil ?? listing.availableFrom}
                    className="mt-1 bg-transparent p-0"
                  />
                </span>
              </li>
              {(listing.qualityGrade || listing.farmingMethod) && (
                <li className="flex items-start gap-2">
                  <Sprout className="mt-0.5 size-4 shrink-0 text-market-green" aria-hidden />
                  <span>
                    {[listing.qualityGrade, listing.farmingMethod].filter(Boolean).join(' · ')}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="supply-band border-soft-border p-5">
            <p className="exchange-label">Farmer</p>
            <div className="mt-3 space-y-2">
              <p className="flex items-center gap-2 font-heading font-semibold text-exchange-ink dark:text-produce-cream">
                <User className="size-4 text-market-green" aria-hidden />
                {listing.farmerName}
              </p>
              {listing.farmName && (
                <p className="text-sm text-ledger-grey">{listing.farmName}</p>
              )}
              <p className="flex items-start gap-2 text-sm text-ledger-grey">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {[listing.town, listing.district, listing.region].filter(Boolean).join(', ')}
                {listing.distanceKm != null && (
                  <span className="block text-market-green">
                    {formatDistanceKm(listing.distanceKm)} from you
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-market-green hover:bg-market-green/90"
              onClick={() => setOfferOpen(true)}
            >
              Send offer
            </Button>
            <Button type="button" variant="outline" onClick={handleCompare}>
              Add to compare
            </Button>
          </div>
        </aside>
      </div>

      {relatedListings.length > 0 && (
        <section className="procurement-rule border-t border-soft-border pt-8">
          <p className="exchange-label">Related supply</p>
          <h2 className="font-heading text-lg font-semibold text-exchange-ink dark:text-produce-cream">
            Similar listings nearby
          </h2>
          <ul className="mt-4 divide-y divide-soft-border">
            {relatedListings.map((related) => (
              <li key={related.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href={BUYER_ROUTES.marketplaceDetail(related.id)}
                    className="font-medium hover:text-market-green"
                  >
                    {related.title}
                  </Link>
                  <p className="mt-1 text-sm text-ledger-grey">
                    {formatQuantity(related.quantity, related.unit)} ·{' '}
                    {related.district}
                    {related.distanceKm != null && ` · ${formatDistanceKm(related.distanceKm)}`}
                  </p>
                </div>
                <PriceDisplay
                  amount={related.pricePerUnit}
                  currency={related.currency}
                  perUnit={related.unit}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <OfferComposer
        listing={listing}
        open={offerOpen}
        onOpenChange={setOfferOpen}
        recommendationId={recommendationId}
        demandId={recommendation?.demandId}
        defaultQuantity={listing.minimumOrder ?? undefined}
        defaultPrice={listing.pricePerUnit}
      />
    </div>
  );
}
