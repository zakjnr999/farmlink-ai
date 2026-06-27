'use client';

import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import {

  Bar,

  BarChart,

  CartesianGrid,

  Cell,

  Pie,

  PieChart,

  ResponsiveContainer,

  Tooltip,

  XAxis,

  YAxis,

} from 'recharts';

import { PageHeader } from '@/components/layout/PageHeader';

import { EmptyState } from '@/components/feedback/EmptyState';

import { ErrorState } from '@/components/feedback/ErrorState';

import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

import { BUYER_ROUTES } from '@/constants/routes';

import {

  buyerOffersApi,

  buyerTransactionsApi,

  demandsApi,

} from '@/lib/api';

import { formatCurrency } from '@/lib/formatting/currency';

import { queryKeys } from '@/lib/query/keys';

import type { BuyerInsights } from '@/types/buyer';



const CHART_COLORS = ['#2F6B45', '#66A36F', '#D4A13B', '#B96B3F', '#68726C'];



function buildInsights(

  transactions: Awaited<ReturnType<typeof buyerTransactionsApi.getBuyerTransactions>>,

  offers: Awaited<ReturnType<typeof buyerOffersApi.getBuyerOffers>>,

  demands: Awaited<ReturnType<typeof demandsApi.getDemands>>,

): BuyerInsights {

  const completed = transactions.filter((t) => t.status === 'completed');

  const acceptedOffers = offers.filter((o) => o.status === 'accepted');

  const totalOffers = offers.length;

  const activeDemands = demands.filter((d) => d.status !== 'inactive');



  const produceMap = new Map<string, { quantity: number; unit: string }>();

  for (const txn of completed) {

    const key = txn.produceType ?? txn.listingTitle ?? 'Other';

    const existing = produceMap.get(key) ?? { quantity: 0, unit: txn.unit };

    existing.quantity += txn.quantity;

    produceMap.set(key, existing);

  }



  const regionMap = new Map<string, number>();

  for (const txn of transactions) {

    if (!txn.region) continue;

    regionMap.set(txn.region, (regionMap.get(txn.region) ?? 0) + 1);

  }



  const demandCoverage = activeDemands.map((d) => ({

    produce: d.produceCategory,

    percent:

      d.status === 'matched'

        ? 100

        : d.status === 'partially_matched'

          ? 75

          : d.matchingListingsCount

            ? Math.min(100, d.matchingListingsCount * 25)

            : 0,

  }));



  const totalValue = transactions

    .filter((t) => !['cancelled', 'disputed'].includes(t.status))

    .reduce((sum, t) => sum + t.totalAmount, 0);



  return {

    offersCreated: totalOffers,

    offerAcceptanceRate: totalOffers > 0 ? acceptedOffers.length / totalOffers : 0,

    transactionsCompleted: completed.length,

    totalTransactionValue: totalValue,

    averageTransactionSize:

      completed.length > 0

        ? completed.reduce((s, t) => s + t.totalAmount, 0) / completed.length

        : 0,

    produceByCategory: Array.from(produceMap.entries()).map(([category, data]) => ({

      category,

      quantity: data.quantity,

      unit: data.unit,

    })),

    topRegions: Array.from(regionMap.entries())

      .map(([region, count]) => ({ region, count }))

      .sort((a, b) => b.count - a.count)

      .slice(0, 5),

    demandCoverage,

    avgRecommendationScore: 0,

    recommendationsConverted: 0,

    priceObservations: [],

  };

}



export function SupplyInsightsPageContent() {

  const results = useQueries({

    queries: [

      {

        queryKey: queryKeys.buyer.transactions({ context: 'insights' }),

        queryFn: buyerTransactionsApi.getBuyerTransactions,

      },

      {

        queryKey: queryKeys.buyer.offers({ context: 'insights' }),

        queryFn: buyerOffersApi.getBuyerOffers,

      },

      {

        queryKey: queryKeys.buyer.demands({ context: 'insights' }),

        queryFn: demandsApi.getDemands,

      },

    ],

  });



  const [txnsQ, offersQ, demandsQ] = results;

  const isLoading = results.some((r) => r.isLoading);

  const isError = results.some((r) => r.isError);



  const insights = useMemo(() => {

    if (!txnsQ.data || !offersQ.data || !demandsQ.data) return null;

    return buildInsights(txnsQ.data, offersQ.data, demandsQ.data);

  }, [txnsQ.data, offersQ.data, demandsQ.data]);



  if (isLoading) {

    return (

      <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8">

        <LoadingSkeleton variant="card" count={3} />

      </div>

    );

  }



  if (isError || !insights) {

    return (

      <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8">

        <ErrorState

          title="Could not load supply insights"

          onRetry={() => results.forEach((r) => r.refetch())}

        />

      </div>

    );

  }



  const hasData =

    insights.transactionsCompleted > 0 ||

    insights.offersCreated > 0 ||

    insights.demandCoverage.length > 0;



  if (!hasData) {

    return (

      <div className="mx-auto max-w-5xl px-4 py-5 lg:px-8">

        <PageHeader

          title="Supply insights"

          subtitle="Procurement analytics from your FarmLink activity"

        />

        <EmptyState

          className="mt-8"

          title="Not enough data yet"

          description="Create demands, send offers and complete transactions to unlock supply analytics."

          actionLabel="Create a demand"
          actionHref={BUYER_ROUTES.demandNew}

        />

      </div>

    );

  }



  return (

    <div className="mx-auto max-w-5xl space-y-8 px-4 py-5 pb-8 lg:px-8">

      <PageHeader

        title="Supply insights"

        subtitle="Procurement analytics from your FarmLink activity"

      />



      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[

          {

            label: 'Offers sent',

            value: insights.offersCreated.toString(),

          },

          {

            label: 'Acceptance rate',

            value: `${Math.round(insights.offerAcceptanceRate * 100)}%`,

          },

          {

            label: 'Completed transactions',

            value: insights.transactionsCompleted.toString(),

          },

          {

            label: 'Total procurement value',

            value: formatCurrency(insights.totalTransactionValue, 'GHS'),

          },

        ].map((stat) => (

          <div

            key={stat.label}

            className="rounded-2xl border border-soft-border bg-warm-paper p-4 dark:bg-deep-grove/20"

          >

            <p className="exchange-label">{stat.label}</p>

            <p className="font-heading mt-2 text-2xl font-bold tabular-nums">{stat.value}</p>

          </div>

        ))}

      </div>



      <div className="grid gap-6 lg:grid-cols-2">

        <InsightChartCard title="Procurement by produce" description="Completed transaction volume">

          {insights.produceByCategory.length === 0 ? (

            <p className="py-8 text-center text-sm text-ledger-grey">No completed procurements yet.</p>

          ) : (

            <div className="h-64 w-full">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={insights.produceByCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>

                  <CartesianGrid strokeDasharray="3 3" stroke="var(--soft-border)" />

                  <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="var(--ledger-grey)" />

                  <YAxis tick={{ fontSize: 11 }} stroke="var(--ledger-grey)" allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="quantity" name="Quantity" fill="#2F6B45" radius={[4, 4, 0, 0]} />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </InsightChartCard>



        <InsightChartCard title="Demand coverage" description="Match progress across active demands">

          {insights.demandCoverage.length === 0 ? (

            <p className="py-8 text-center text-sm text-ledger-grey">No active demands.</p>

          ) : (

            <div className="h-64 w-full">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie

                    data={insights.demandCoverage}

                    dataKey="percent"

                    nameKey="produce"

                    cx="50%"

                    cy="50%"

                    outerRadius={80}

                    label={({ name, percent }) =>
                      `${name ?? ''} ${Math.round((percent ?? 0) * 100)}%`
                    }

                  >

                    {insights.demandCoverage.map((_, index) => (

                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </InsightChartCard>

      </div>



      {insights.topRegions.length > 0 && (

        <InsightChartCard title="Top sourcing regions" description="Transactions by farmer region">

          <div className="h-56 w-full">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart

                data={insights.topRegions}

                layout="vertical"

                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}

              >

                <CartesianGrid strokeDasharray="3 3" stroke="var(--soft-border)" />

                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--ledger-grey)" allowDecimals={false} />

                <YAxis

                  type="category"

                  dataKey="region"

                  tick={{ fontSize: 11 }}

                  stroke="var(--ledger-grey)"

                  width={90}

                />

                <Tooltip />

                <Bar dataKey="count" name="Transactions" fill="#D4A13B" radius={[0, 4, 4, 0]} />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </InsightChartCard>

      )}



      {insights.averageTransactionSize > 0 && (

        <p className="text-sm text-ledger-grey">

          Average completed transaction size:{' '}

          <strong className="tabular-nums text-exchange-ink dark:text-produce-cream">

            {formatCurrency(insights.averageTransactionSize, 'GHS')}

          </strong>

        </p>

      )}

    </div>

  );

}



function InsightChartCard({

  title,

  description,

  children,

}: {

  title: string;

  description: string;

  children: React.ReactNode;

}) {

  return (

    <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">

      <p className="exchange-label">{description}</p>

      <h2 className="font-heading mt-1 text-lg font-semibold">{title}</h2>

      <div className="mt-4">{children}</div>

    </section>

  );

}


