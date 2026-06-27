'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { recommendationsApi, demandsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { OfferComposer } from '@/features/offers/components/OfferComposer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/formatting/dates';
import { formatDistanceKm } from '@/lib/formatting/distances';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatGhs } from '@/lib/formatting/currency';
import { cn } from '@/lib/utils';

interface RecommendationDetailViewProps {
  recommendationId: string;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  produce: 'Produce fit',
  quantity: 'Quantity fit',
  distance: 'Distance',
  date: 'Timing',
  price: 'Price fit',
};

export function RecommendationDetailView({ recommendationId }: RecommendationDetailViewProps) {
  const [offerOpen, setOfferOpen] = useState(false);

  const recQuery = useQuery({
    queryKey: queryKeys.buyer.recommendationDetail(recommendationId),
    queryFn: () => recommendationsApi.getRecommendation(recommendationId),
  });

  const demandQuery = useQuery({
    queryKey: queryKeys.buyer.demandDetail(recQuery.data?.demandId ?? ''),
    queryFn: () => demandsApi.getDemand(recQuery.data!.demandId!),
    enabled: Boolean(recQuery.data?.demandId),
  });

  if (recQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (recQuery.isError || !recQuery.data) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Recommendation not found" onRetry={() => recQuery.refetch()} />
      </div>
    );
  }

  const rec = recQuery.data;
  const demand = demandQuery.data;
  const breakdown = rec.scoreBreakdown;

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <PageHeader
        title={rec.listingTitle}
        subtitle={`${rec.scoreLabel} · ${rec.score}% alignment`}
        backButton={
          <Button asChild variant="ghost" size="icon">
            <Link href={BUYER_ROUTES.recommendations} aria-label="Back to recommendations">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
      />

      <MatchScoreStrip score={rec.score} label={rec.scoreLabel} className="max-w-lg" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Supply panel */}
        <section className="supply-band border-soft-border bg-produce-cream/60 p-5 dark:bg-deep-grove/30">
          <p className="exchange-label">Farmer supply</p>
          <h2 className="font-heading mt-1 text-lg font-semibold text-exchange-ink dark:text-produce-cream">
            {rec.listingTitle}
          </h2>
          <p className="mt-1 text-sm text-ledger-grey">
            {rec.farmerName}
            {rec.farmName && ` · ${rec.farmName}`}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ledger-grey">Produce</dt>
              <dd className="font-medium">{rec.produceType}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ledger-grey">Quantity</dt>
              <dd>
                <QuantityDisplay amount={rec.quantity} unit={rec.unit} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ledger-grey">Price</dt>
              <dd>
                <PriceDisplay
                  amount={rec.pricePerUnit}
                  currency={rec.currency}
                  perUnit={rec.unit}
                />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ledger-grey">Location</dt>
              <dd className="text-right">
                {[rec.town, rec.district, rec.region].filter(Boolean).join(', ')}
                <br />
                <span className="text-market-green">{formatDistanceKm(rec.distanceKm)} away</span>
              </dd>
            </div>
            {rec.harvestDate && (
              <div className="flex justify-between gap-4">
                <dt className="text-ledger-grey">Harvest</dt>
                <dd>{formatDate(rec.harvestDate)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-ledger-grey">Available</dt>
              <dd>
                {formatDate(rec.availableFrom)}
                {rec.availableUntil && ` – ${formatDate(rec.availableUntil)}`}
              </dd>
            </div>
          </dl>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={BUYER_ROUTES.marketplaceDetail(rec.listingId)}>
              View full listing <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </section>

        {/* Demand panel */}
        <section className="supply-band border-soft-border p-5">
          <p className="exchange-label">Your demand</p>
          {demandQuery.isLoading && (
            <p className="mt-2 text-sm text-ledger-grey">Loading demand details…</p>
          )}
          {!rec.demandId && (
            <p className="mt-2 text-sm text-ledger-grey">
              This recommendation was generated from your buyer profile preferences.
            </p>
          )}
          {demand && (
            <>
              <h2 className="font-heading mt-1 text-lg font-semibold text-exchange-ink dark:text-produce-cream">
                {demand.produceCategory}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ledger-grey">Quantity needed</dt>
                  <dd className="font-medium">
                    {formatQuantity(demand.quantityMin, demand.unit)} –{' '}
                    {formatQuantity(demand.quantityMax, demand.unit)}
                  </dd>
                </div>
                {demand.preferredMaxPrice != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ledger-grey">Max price</dt>
                    <dd>{formatGhs(demand.preferredMaxPrice)} / {demand.unit}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-ledger-grey">Required from</dt>
                  <dd>{formatDate(demand.requiredFrom)}</dd>
                </div>
                {demand.requiredUntil && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ledger-grey">Required until</dt>
                    <dd>{formatDate(demand.requiredUntil)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-ledger-grey">Preferred regions</dt>
                  <dd className="text-right">{demand.preferredRegions.join(', ')}</dd>
                </div>
              </dl>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={BUYER_ROUTES.demandDetail(demand.id)}>View demand</Link>
              </Button>
            </>
          )}
        </section>
      </div>

      {/* Score breakdown */}
      <section className="supply-band border-soft-border p-5">
        <p className="exchange-label">Score breakdown</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(BREAKDOWN_LABELS) as Array<keyof typeof BREAKDOWN_LABELS>).map((key) => {
            const value = breakdown[key as keyof typeof breakdown];
            if (typeof value !== 'number' || key === 'total') return null;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-ledger-grey">{BREAKDOWN_LABELS[key]}</span>
                  <span className="font-semibold tabular-nums text-market-green">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-exchange-ink dark:text-produce-cream/90">
          {rec.explanation}
        </p>
        <div
          className={cn(
            'mt-4 flex gap-2 rounded-lg border border-soft-border bg-warm-paper/80 p-3 text-xs text-ledger-grey dark:bg-deep-grove/20',
          )}
        >
          <Info className="size-4 shrink-0 text-market-green" aria-hidden />
          <p>
            Match scores are guidance only. FarmLink does not guarantee supply quality, delivery,
            or farmer availability. Always verify listing details and arrange pickup directly with
            the farmer before committing.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 bg-market-green hover:bg-market-green/90"
          onClick={() => setOfferOpen(true)}
          disabled={rec.status === 'expired'}
        >
          Send offer to farmer
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={BUYER_ROUTES.marketplaceDetail(rec.listingId)}>
            View listing details
          </Link>
        </Button>
      </div>

      <OfferComposer
        listing={{
          id: rec.listingId,
          farmerId: rec.farmerId,
          farmerName: rec.farmerName,
          farmName: rec.farmName,
          farmerVerified: rec.farmerVerified,
          title: rec.listingTitle,
          categoryId: '',
          produceType: rec.produceType,
          quantity: rec.quantity,
          unit: rec.unit,
          pricePerUnit: rec.pricePerUnit,
          currency: rec.currency,
          availableFrom: rec.availableFrom,
          availableUntil: rec.availableUntil,
          region: rec.region,
          district: rec.district,
          town: rec.town,
          status: 'active',
          createdAt: rec.createdAt,
          updatedAt: rec.createdAt,
        }}
        open={offerOpen}
        onOpenChange={setOfferOpen}
        recommendationId={rec.id}
        demandId={rec.demandId}
        defaultQuantity={Math.min(rec.quantity, demand?.quantityMax ?? rec.quantity)}
        defaultPrice={rec.pricePerUnit}
      />
    </div>
  );
}
