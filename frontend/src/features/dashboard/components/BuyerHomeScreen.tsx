'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, MapPin, Package } from 'lucide-react';
import { BUYER_ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/formatting/currency';
import { formatQuantity } from '@/lib/formatting/quantities';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { DemandCoverageIndicator } from '@/components/commerce/DemandCoverageIndicator';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useBuyerDashboard } from '@/features/dashboard/hooks/use-buyer-dashboard';
import { Button } from '@/components/ui/button';

const ActivityChart = dynamic(
  () => import('@/components/charts/BuyerActivityChart').then((m) => m.BuyerActivityChart),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded bg-cool-mist/50" /> },
);

export function BuyerHomeScreen() {
  const { data, isLoading, isError, refetch } = useBuyerDashboard();

  if (isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Could not load your supply desk" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <section aria-labelledby="supply-desk-heading">
        <p className="exchange-label">Supply Desk</p>
        <h2 id="supply-desk-heading" className="font-heading mt-1 text-lg font-semibold text-exchange-ink dark:text-produce-cream">
          {data.greeting}, {data.businessName.split(' ')[0]}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ledger-grey">{data.summaryLine}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="supply-band space-y-4 bg-warm-paper/80 py-5 pl-5 pr-4 dark:bg-deep-grove/30">
            <div>
              <p className="exchange-label">Committed procurement value</p>
              <p className="font-heading mt-1 text-4xl font-bold tabular-nums text-market-green">
                {formatCurrency(data.committedValue, data.currency)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Recommendations', value: data.activeRecommendations },
                { label: 'Open demands', value: data.openDemands },
                { label: 'Pending offers', value: data.pendingOffers },
                { label: 'Upcoming pickups', value: data.upcomingPickups },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-ledger-grey">{item.label}</p>
                  <p className="font-heading text-2xl font-semibold tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
            <ActivityChart data={data.activityByWeek} />
          </div>

          <div className="space-y-4">
            <p className="exchange-label">Demand coverage</p>
            {data.demandCoverage.length === 0 ? (
              <EmptyState
                title="No active demands"
                description="Create a produce demand so FarmLink can find suitable farmer listings."
                actionLabel="Create demand"
                actionHref={BUYER_ROUTES.demandNew}
              />
            ) : (
              data.demandCoverage.map((d) => (
                <DemandCoverageIndicator
                  key={d.produce}
                  produce={d.produce}
                  percent={d.coveragePercent}
                  status={d.status}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="recommended-heading" className="procurement-rule pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="exchange-label">Recommended supply</p>
            <h2 id="recommended-heading" className="font-heading text-lg font-semibold">
              Highest-ranked listings
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={BUYER_ROUTES.recommendations}>
              View all <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        {data.topRecommendations.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No recommended supply yet"
              description="Create a produce demand so FarmLink can find suitable farmer listings for your business."
              actionLabel="Create demand"
              actionHref={BUYER_ROUTES.demandNew}
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-soft-border dark:divide-soft-border/30">
            {data.topRecommendations.map((rec) => (
              <li key={rec.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{rec.listingTitle}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ledger-grey">
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3.5" aria-hidden />
                      {formatQuantity(rec.quantity, rec.unit)}
                    </span>
                    <PriceDisplay amount={rec.pricePerUnit} currency={rec.currency} perUnit={rec.unit} />
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {rec.distanceKm} km · {rec.town ?? rec.district}
                    </span>
                  </p>
                  <MatchScoreStrip score={rec.score} label={rec.scoreLabel} className="max-w-xs" />
                </div>
                <Button asChild size="sm" className="shrink-0 bg-market-green hover:bg-market-green/90">
                  <Link href={BUYER_ROUTES.recommendationDetail(rec.id)}>Review match</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="offers-heading" className="procurement-rule pt-8 lg:pt-0 lg:procurement-rule-0">
          <p className="exchange-label">Offer activity</p>
          <h2 id="offers-heading" className="font-heading text-lg font-semibold">
            Pending offers
          </h2>
          {data.pendingOffersList.length === 0 ? (
            <p className="mt-3 text-sm text-ledger-grey">No pending offers. Offers you send to farmers will appear here.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.pendingOffersList.map((o) => (
                <li key={o.id}>
                  <Link href={BUYER_ROUTES.offerDetail(o.id)} className="block py-2 text-sm hover:text-market-green">
                    {formatQuantity(o.quantity, o.unit)} · {formatCurrency(o.totalAmount, o.currency)} · Pending
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="pickups-heading" className="procurement-rule pt-8 lg:border-t-0 lg:pt-0">
          <p className="exchange-label">Upcoming pickups</p>
          <h2 id="pickups-heading" className="font-heading text-lg font-semibold">
            Planned collection
          </h2>
          {data.upcomingPickupsList.length === 0 ? (
            <p className="mt-3 text-sm text-ledger-grey">Accepted offers with pickup dates will appear here.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.upcomingPickupsList.map((t) => (
                <li key={t.id}>
                  <Link href={BUYER_ROUTES.transactionDetail(t.id)} className="block py-2 text-sm hover:text-market-green">
                    {t.produceType ?? t.listingTitle} · {t.pickupLocation ?? t.region}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
