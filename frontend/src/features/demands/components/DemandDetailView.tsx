'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Pencil, Package } from 'lucide-react';
import { demandsApi, recommendationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import type { DemandStatus } from '@/types/buyer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { DemandCoverageIndicator } from '@/components/commerce/DemandCoverageIndicator';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatDate } from '@/lib/formatting/dates';
import { formatGhs } from '@/lib/formatting/currency';
import { formatDemandCoverageStatus } from '@/lib/formatting/buyer';

interface DemandDetailViewProps {
  demandId: string;
}

const STATUS_LABELS: Record<DemandStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  partially_matched: 'Partially matched',
  matched: 'Matched',
  unmatched: 'Unmatched',
};

function coveragePercent(
  status: DemandStatus,
  matchingCount?: number,
): number {
  if (status === 'matched') return 100;
  if (status === 'partially_matched') {
    return Math.min(90, Math.max(25, (matchingCount ?? 1) * 25));
  }
  if ((matchingCount ?? 0) > 0) {
    return Math.min(50, matchingCount! * 15);
  }
  return 0;
}

export function DemandDetailView({ demandId }: DemandDetailViewProps) {
  const demandQuery = useQuery({
    queryKey: queryKeys.buyer.demandDetail(demandId),
    queryFn: () => demandsApi.getDemand(demandId),
  });

  const recommendationsQuery = useQuery({
    queryKey: queryKeys.buyer.recommendations({ demandId }),
    queryFn: () => recommendationsApi.getRecommendations(),
    enabled: Boolean(demandQuery.data),
  });

  const matchingRecommendations = useMemo(() => {
    return (recommendationsQuery.data ?? [])
      .filter((r) => r.demandId === demandId)
      .sort((a, b) => b.score - a.score);
  }, [recommendationsQuery.data, demandId]);

  if (demandQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (demandQuery.isError || !demandQuery.data) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Demand not found" onRetry={() => demandQuery.refetch()} />
      </div>
    );
  }

  const demand = demandQuery.data;
  const percent = coveragePercent(demand.status, demand.matchingListingsCount);
  const coverageStatus = formatDemandCoverageStatus(percent);

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <PageHeader
        title={demand.produceCategory}
        subtitle="Procurement demand details"
        backButton={
          <Button asChild variant="ghost" size="icon">
            <Link href={BUYER_ROUTES.demands} aria-label="Back to demands">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={BUYER_ROUTES.demandEdit(demand.id)}>
              <Pencil className="mr-1 size-4" aria-hidden />
              Edit
            </Link>
          </Button>
        }
      />

      <section className="supply-band border-soft-border bg-produce-cream/60 p-5 dark:bg-deep-grove/30">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{STATUS_LABELS[demand.status]}</Badge>
          {demand.isRecurring && (
            <Badge variant="harvest" className="capitalize">
              {demand.frequency ?? 'Recurring'}
            </Badge>
          )}
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="exchange-label">Quantity range</dt>
            <dd className="mt-1 font-medium">
              {formatQuantity(demand.quantityMin, demand.unit)} –{' '}
              {formatQuantity(demand.quantityMax, demand.unit)}
            </dd>
          </div>
          {demand.preferredMaxPrice != null && (
            <div>
              <dt className="exchange-label">Max price</dt>
              <dd className="mt-1 font-medium">
                {formatGhs(demand.preferredMaxPrice)} / {demand.unit}
              </dd>
            </div>
          )}
          <div>
            <dt className="exchange-label">Required from</dt>
            <dd className="mt-1">{formatDate(demand.requiredFrom)}</dd>
          </div>
          {demand.requiredUntil && (
            <div>
              <dt className="exchange-label">Required until</dt>
              <dd className="mt-1">{formatDate(demand.requiredUntil)}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="exchange-label">Preferred regions</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {demand.preferredRegions.map((r) => (
                <Badge key={r} variant="outline">
                  {r}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>

        <div className="mt-6 max-w-md">
          <p className="exchange-label mb-2">Coverage status</p>
          <DemandCoverageIndicator
            produce={demand.produceCategory}
            percent={percent}
            status={coverageStatus}
          />
        </div>
      </section>

      <section className="procurement-rule border-t border-soft-border pt-8">
        <p className="exchange-label">Matching recommendations</p>
        <h2 className="font-heading text-lg font-semibold text-exchange-ink dark:text-produce-cream">
          Ranked farmer supply
        </h2>

        {recommendationsQuery.isLoading && (
          <div className="mt-4">
            <LoadingSkeleton variant="list" count={2} />
          </div>
        )}

        {!recommendationsQuery.isLoading && matchingRecommendations.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No matching supply yet"
              description="FarmLink will notify you when farmer listings align with this demand."
              actionLabel="Browse marketplace"
              actionHref={BUYER_ROUTES.marketplace}
            />
          </div>
        )}

        {matchingRecommendations.length > 0 && (
          <ul className="mt-4 divide-y divide-soft-border">
            {matchingRecommendations.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <Link
                    href={BUYER_ROUTES.recommendationDetail(rec.id)}
                    className="font-medium hover:text-market-green"
                  >
                    {rec.listingTitle}
                  </Link>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ledger-grey">
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3.5" aria-hidden />
                      {formatQuantity(rec.quantity, rec.unit)}
                    </span>
                    <PriceDisplay
                      amount={rec.pricePerUnit}
                      currency={rec.currency}
                      perUnit={rec.unit}
                      size="sm"
                    />
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {rec.distanceKm} km
                    </span>
                  </p>
                  <MatchScoreStrip score={rec.score} label={rec.scoreLabel} className="max-w-xs" />
                </div>
                <Button asChild size="sm" className="shrink-0 bg-market-green hover:bg-market-green/90">
                  <Link href={BUYER_ROUTES.recommendationDetail(rec.id)}>Review</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
