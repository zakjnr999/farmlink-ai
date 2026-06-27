'use client';



import Link from 'next/link';

import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { CalendarDays, List, MapPin, Route } from 'lucide-react';

import { isFuture, isPast, isThisWeek, parseISO, startOfWeek, format } from 'date-fns';

import { PageHeader } from '@/components/layout/PageHeader';

import { EmptyState } from '@/components/feedback/EmptyState';

import { ErrorState } from '@/components/feedback/ErrorState';

import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BUYER_ROUTES } from '@/constants/routes';

import { buyerTransactionsApi } from '@/lib/api';

import { formatDate } from '@/lib/formatting/dates';

import { queryKeys } from '@/lib/query/keys';

import { cn } from '@/lib/utils';

import type { Transaction } from '@/types/transaction';



type ViewMode = 'timeline' | 'weekly' | 'list';



function hasPickupDate(txn: Transaction): txn is Transaction & { deliveryDate: string } {

  return Boolean(txn.deliveryDate);

}



function groupByWeek(transactions: Transaction[]) {

  const groups = new Map<string, Transaction[]>();

  for (const txn of transactions) {

    if (!txn.deliveryDate) continue;

    try {

      const weekStart = format(startOfWeek(parseISO(txn.deliveryDate)), 'd MMM yyyy');

      const existing = groups.get(weekStart) ?? [];

      existing.push(txn);

      groups.set(weekStart, existing);

    } catch {

      // skip invalid dates

    }

  }

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

}



export function BuyerPickupsPageContent() {

  const [view, setView] = useState<ViewMode>('timeline');



  const query = useQuery({

    queryKey: queryKeys.buyer.transactions({ context: 'pickups' }),

    queryFn: buyerTransactionsApi.getBuyerTransactions,

  });



  const withPickup = useMemo(

    () => (query.data ?? []).filter(hasPickupDate),

    [query.data],

  );



  const upcoming = useMemo(

    () =>

      withPickup.filter((t) => {

        try {

          return isFuture(parseISO(t.deliveryDate));

        } catch {

          return false;

        }

      }),

    [withPickup],

  );



  const thisWeek = useMemo(

    () =>

      withPickup.filter((t) => {

        try {

          return isThisWeek(parseISO(t.deliveryDate));

        } catch {

          return false;

        }

      }),

    [withPickup],

  );



  const past = useMemo(

    () =>

      withPickup.filter((t) => {

        try {

          return isPast(parseISO(t.deliveryDate));

        } catch {

          return false;

        }

      }),

    [withPickup],

  );



  const weeklyGroups = useMemo(() => groupByWeek(withPickup), [withPickup]);



  if (query.isLoading) {

    return (

      <div className="mx-auto max-w-4xl px-4 py-5 lg:px-8">

        <LoadingSkeleton variant="list" />

      </div>

    );

  }



  if (query.isError) {

    return (

      <div className="mx-auto max-w-4xl px-4 py-5 lg:px-8">

        <ErrorState title="Could not load pickup schedule" onRetry={() => query.refetch()} />

      </div>

    );

  }



  const renderCards = (items: Transaction[], emptyTitle: string) =>

    items.length === 0 ? (

      <EmptyState

        title={emptyTitle}

        description="Accepted offers with confirmed pickup dates appear here."

        actionLabel="View transactions"
        actionHref={BUYER_ROUTES.transactions}

      />

    ) : (

      <div className="space-y-3">

        {items.map((txn) => (

          <PickupCard key={txn.id} transaction={txn} />

        ))}

      </div>

    );



  return (

    <div className="mx-auto max-w-4xl px-4 py-5 pb-8 lg:px-8">

      <PageHeader

        title="Pickup schedule"

        subtitle="Plan collection from confirmed transactions"

      />



      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)} className="mt-6">

        <TabsList>

          <TabsTrigger value="timeline" className="gap-1.5">

            <Route className="size-4" aria-hidden />

            Timeline

          </TabsTrigger>

          <TabsTrigger value="weekly" className="gap-1.5">

            <CalendarDays className="size-4" aria-hidden />

            Weekly

          </TabsTrigger>

          <TabsTrigger value="list" className="gap-1.5">

            <List className="size-4" aria-hidden />

            List

          </TabsTrigger>

        </TabsList>



        <TabsContent value="timeline" className="mt-6 space-y-8">

          <section aria-labelledby="upcoming-pickups-heading">

            <h2 id="upcoming-pickups-heading" className="exchange-label">

              Upcoming

            </h2>

            <div className="mt-3">{renderCards(upcoming, 'No upcoming pickups')}</div>

          </section>

          <section aria-labelledby="past-pickups-heading" className="procurement-rule pt-8">

            <h2 id="past-pickups-heading" className="exchange-label">

              Past

            </h2>

            <div className="mt-3">{renderCards(past, 'No past pickups')}</div>

          </section>

        </TabsContent>



        <TabsContent value="weekly" className="mt-6">

          {weeklyGroups.length === 0 ? (

            <EmptyState

              title="No pickups scheduled this period"

              description="Weekly groupings appear once pickup dates are confirmed."

            />

          ) : (

            <div className="space-y-8">

              {weeklyGroups.map(([weekLabel, items]) => (

                <section key={weekLabel}>

                  <h2 className="font-heading text-base font-semibold">Week of {weekLabel}</h2>

                  <div className="mt-3 space-y-3">

                    {items.map((txn) => (

                      <PickupCard key={txn.id} transaction={txn} compact />

                    ))}

                  </div>

                </section>

              ))}

            </div>

          )}

        </TabsContent>



        <TabsContent value="list" className="mt-6">

          <Tabs defaultValue="upcoming" className="w-full">

            <TabsList className="mb-4">

              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>

              <TabsTrigger value="week">This week ({thisWeek.length})</TabsTrigger>

              <TabsTrigger value="all">All ({withPickup.length})</TabsTrigger>

            </TabsList>

            <TabsContent value="upcoming">{renderCards(upcoming, 'No upcoming pickups')}</TabsContent>

            <TabsContent value="week">{renderCards(thisWeek, 'No pickups this week')}</TabsContent>

            <TabsContent value="all">{renderCards(withPickup, 'No scheduled pickups')}</TabsContent>

          </Tabs>

        </TabsContent>

      </Tabs>

    </div>

  );

}



function PickupCard({

  transaction,

  compact = false,

}: {

  transaction: Transaction;

  compact?: boolean;

}) {

  const isPastPickup = (() => {

    try {

      return transaction.deliveryDate ? isPast(parseISO(transaction.deliveryDate)) : false;

    } catch {

      return false;

    }

  })();



  return (

    <article

      className={cn(

        'rounded-2xl border border-soft-border bg-warm-paper p-4 dark:bg-deep-grove/20',

        isPastPickup && 'opacity-80',

      )}

    >

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="exchange-label">{isPastPickup ? 'Completed pickup' : 'Scheduled pickup'}</p>

          <h3 className="font-heading mt-1 text-lg font-semibold">

            {transaction.listingTitle ?? transaction.produceType}

          </h3>

          {!compact && (

            <p className="mt-1 text-sm text-ledger-grey">{transaction.farmerName}</p>

          )}

        </div>

        {transaction.deliveryDate && (

          <time

            dateTime={transaction.deliveryDate}

            className="inline-flex items-center gap-1.5 rounded-full bg-market-green/10 px-3 py-1 text-sm font-medium text-market-green"

          >

            <CalendarDays className="size-3.5" aria-hidden />

            {formatDate(transaction.deliveryDate)}

          </time>

        )}

      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ledger-grey">

        <QuantityDisplay amount={transaction.quantity} unit={transaction.unit} />

        {(transaction.pickupLocation || transaction.region) && (

          <span className="inline-flex items-center gap-1">

            <MapPin className="size-3.5 text-market-green" aria-hidden />

            {transaction.pickupLocation ?? transaction.region}

          </span>

        )}

      </div>

      <Link

        href={BUYER_ROUTES.transactionDetail(transaction.id)}

        className="mt-3 inline-block text-sm font-semibold text-market-green"

      >

        View transaction →

      </Link>

    </article>

  );

}


