'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryFarmAction } from '@/components/navigation/PrimaryFarmAction';
import { Plus } from 'lucide-react';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { OfferCard } from '@/features/offers/components/OfferCard';
import { BuyerMatchSummary } from '@/components/offers/BuyerMatchSummary';
import { PickupSummary } from '@/features/pickups/components/PickupSummary';
import { SyncStatus } from '@/components/pwa/SyncStatus';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { formatRelativeDate } from '@/lib/formatting/dates';
import { Bell, ChevronRight, Sparkles } from 'lucide-react';
import { FARMER_ROUTES } from '@/constants/routes';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { DEMO_LISTING_ID } from '@/lib/demo/demo-data';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function FarmerHomeScreen() {
  const { user, profile } = useAuth();
  const {
    isLoading,
    isError,
    activeListings,
    pendingOffers,
    upcomingPickups,
    notifications,
    refetch,
  } = useDashboardData();

  const matchesQuery = useQuery({
    queryKey: queryKeys.listings.matches(DEMO_LISTING_ID),
    queryFn: () => matchesApi.getListingMatches(DEMO_LISTING_ID),
    enabled: activeListings.length > 0,
  });

  const firstName = user?.fullName?.split(' ')[0] ?? 'Farmer';
  const farmName = profile?.farmName;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="list" count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState
          title="Could not load your field journal"
          message="Check your connection and try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  const attentionItems = [
    pendingOffers.length > 0 && `${pendingOffers.length} offer${pendingOffers.length > 1 ? 's' : ''} waiting for your review`,
    activeListings.length === 0 && 'List your first produce to find buyers',
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        subtitle={
          farmName
            ? `${farmName} · ${profile?.region ?? 'Ghana'}`
            : 'Your farmer field journal'
        }
        actions={
          <Link
            href="/farmer/notifications"
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-morning-mist bg-warm-paper"
            aria-label="Notifications"
          >
            <Bell className="size-5 text-field-ink" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-tomato-red" />
            )}
          </Link>
        }
      />

      <div className="mt-4">
        <SyncStatus />
      </div>

      <div className="mt-6">
        <PrimaryFarmAction
          href="/farmer/list-produce"
          label="List Produce"
          icon={Plus}
        />
        <p className="mt-2 text-center text-sm text-muted-text">
          Speak or type what you have available.
        </p>
      </div>

      <Link
        href={FARMER_ROUTES.advisory}
        className="mt-6 flex items-start gap-4 rounded-2xl border border-leaf-green/30 bg-gradient-to-br from-farm-green/10 to-leaf-green/5 p-4 transition-colors hover:border-farm-green/50"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-farm-green/15 text-farm-green">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-field-ink">Farm Advisor</p>
          <p className="mt-1 text-sm text-muted-text">
            Ask why plantain leaves turn black, diagnose pests, or get crop advice — with
            follow-up questions to understand your field.
          </p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-text" aria-hidden />
      </Link>

      <section aria-label="Harvest status" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Active listings', value: activeListings.length },
          { label: 'New matches', value: matchesQuery.data?.length ?? 0 },
          { label: 'Pending offers', value: pendingOffers.length },
          { label: 'Upcoming pickups', value: upcomingPickups.length },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-morning-mist bg-warm-paper px-4 py-3"
          >
            <p className="text-sm text-muted-text">{item.label}</p>
            <p className="font-heading mt-1 text-2xl font-bold tabular-nums text-field-ink">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {attentionItems.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Needs your attention" />
          <ul className="mt-3 space-y-2">
            {attentionItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-xl border border-harvest-gold/30 bg-harvest-gold/10 px-4 py-3 text-sm font-medium text-deep-soil"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <SectionHeader
          title="Active listings"
          action={
            <Link href="/farmer/listings" className="text-sm font-semibold text-farm-green">
              View all
            </Link>
          }
        />
        {activeListings.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No produce listed yet"
            description="Tell FarmLink what you have available and we will help you find suitable buyers."
            actionLabel="List produce"
            actionHref="/farmer/list-produce"
          />
        ) : (
          <div className="mt-4 space-y-3">
            {activeListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact />
            ))}
          </div>
        )}
      </section>

      {matchesQuery.data && matchesQuery.data.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Buyer matches" />
          <div className="mt-4 space-y-3">
            {matchesQuery.data.slice(0, 2).map((match) => (
              <BuyerMatchSummary
                key={match.id}
                buyerName={match.buyerName}
                location={match.region}
                matchScore={match.score}
                highlights={match.notes ? [match.notes] : []}
              />
            ))}
          </div>
        </section>
      )}

      {pendingOffers.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="New offers"
            action={
              <Link href="/farmer/offers" className="text-sm font-semibold text-farm-green">
                View all
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            {pendingOffers.slice(0, 2).map((offer) => (
              <OfferCard key={offer.id} offer={offer} highlight />
            ))}
          </div>
        </section>
      )}

      {upcomingPickups.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Next pickup" />
          <PickupSummary transaction={upcomingPickups[0]} className="mt-4" />
        </section>
      )}

      {notifications.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Recent updates" />
          <ul className="mt-4 divide-y divide-morning-mist rounded-2xl border border-morning-mist bg-warm-paper">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={notification.actionUrl ?? '/farmer/notifications'}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-field-cream"
                >
                  <div>
                    <p className="font-medium text-field-ink">{notification.title}</p>
                    <p className="text-sm text-muted-text">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-text" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
