'use client';



import Link from 'next/link';

import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ChevronRight } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';

import { EmptyState } from '@/components/feedback/EmptyState';

import { ErrorState } from '@/components/feedback/ErrorState';

import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';

import { TransactionStatusBadge } from '@/components/marketplace/TransactionStatusBadge';

import { Input } from '@/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BUYER_ROUTES } from '@/constants/routes';

import { buyerTransactionsApi } from '@/lib/api';

import { formatDate } from '@/lib/formatting/dates';

import { formatBuyerTransactionStatus } from '@/lib/formatting/buyer';

import { formatCurrency } from '@/lib/formatting/currency';

import { queryKeys } from '@/lib/query/keys';

import type { Transaction, TransactionStatus } from '@/types/transaction';



const statusTabs = [

  { value: 'all', label: 'All' },

  { value: 'payment_confirmed', label: 'Awaiting pickup' },

  { value: 'in_transit', label: 'In transit' },

  { value: 'completed', label: 'Completed' },

  { value: 'cancelled', label: 'Cancelled' },

] as const;



function mapTxnStatus(status: TransactionStatus) {

  if (status === 'payment_confirmed') return 'confirmed' as const;

  if (status === 'pending_payment') return 'pending' as const;

  return status as 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

}



export function BuyerTransactionsPageContent() {

  const [filter, setFilter] = useState<string>('all');

  const [search, setSearch] = useState('');



  const query = useQuery({

    queryKey: queryKeys.buyer.transactions({ filter }),

    queryFn: buyerTransactionsApi.getBuyerTransactions,

  });



  const filtered = useMemo(() => {

    const items = query.data ?? [];

    const byStatus =

      filter === 'all' ? items : items.filter((txn) => txn.status === filter);

    if (!search.trim()) return byStatus;

    const term = search.toLowerCase();

    return byStatus.filter(

      (txn) =>

        txn.listingTitle?.toLowerCase().includes(term) ||

        txn.produceType?.toLowerCase().includes(term) ||

        txn.farmerName?.toLowerCase().includes(term) ||

        txn.id.toLowerCase().includes(term),

    );

  }, [query.data, filter, search]);



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

        <ErrorState title="Could not load transactions" onRetry={() => query.refetch()} />

      </div>

    );

  }



  return (

    <div className="mx-auto max-w-4xl px-4 py-5 pb-8 lg:px-8">

      <PageHeader

        title="Transactions"

        subtitle="Confirmed purchases and pickup commitments"

      />



      <p className="mt-4 rounded-xl border border-soft-border bg-produce-cream/60 px-4 py-3 text-sm text-ledger-grey dark:bg-deep-grove/30">

        Payment settlement is handled outside FarmLink in the current MVP. FarmLink tracks

        agreed terms and pickup status only.

      </p>



      <div className="mt-6">

        <Input

          type="search"

          placeholder="Search by produce, farmer or reference…"

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          aria-label="Search transactions"

          className="max-w-md bg-warm-paper"

        />

      </div>



      <Tabs value={filter} onValueChange={setFilter} className="mt-6">

        <TabsList className="w-full flex-wrap justify-start">

          {statusTabs.map((tab) => (

            <TabsTrigger key={tab.value} value={tab.value}>

              {tab.label}

            </TabsTrigger>

          ))}

        </TabsList>



        {statusTabs.map((tab) => (

          <TabsContent key={tab.value} value={tab.value} className="mt-4">

            {filtered.length === 0 ? (

              <EmptyState

                title="No transactions in this view"

                description="Accepted offers will appear here as confirmed procurement transactions."

                actionLabel="Browse marketplace"
                actionHref={BUYER_ROUTES.marketplace}

              />

            ) : (

              <div className="overflow-hidden rounded-2xl border border-soft-border bg-warm-paper dark:bg-deep-grove/20">

                <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-4 border-b border-soft-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ledger-grey md:grid">

                  <span>Produce</span>

                  <span>Farmer</span>

                  <span>Value</span>

                  <span>Status</span>

                </div>

                <ul className="divide-y divide-soft-border">

                  {filtered.map((txn) => (

                    <TransactionRow key={txn.id} transaction={txn} />

                  ))}

                </ul>

              </div>

            )}

          </TabsContent>

        ))}

      </Tabs>

    </div>

  );

}



function TransactionRow({ transaction: txn }: { transaction: Transaction }) {

  return (

    <li>

      <Link

        href={BUYER_ROUTES.transactionDetail(txn.id)}

        className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-produce-cream/50 dark:hover:bg-deep-grove/30 md:grid md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-4"

      >

        <div>

          <p className="font-heading font-semibold text-exchange-ink dark:text-produce-cream">

            {txn.listingTitle ?? txn.produceType ?? 'Transaction'}

          </p>

          <div className="mt-1 flex flex-wrap gap-3 text-sm text-ledger-grey">

            <QuantityDisplay amount={txn.quantity} unit={txn.unit} />

            {txn.deliveryDate && (

              <span>Pickup {formatDate(txn.deliveryDate)}</span>

            )}

          </div>

        </div>

        <p className="text-sm text-ledger-grey">{txn.farmerName ?? 'Farmer'}</p>

        <p className="text-sm font-semibold tabular-nums">

          {formatCurrency(txn.totalAmount, txn.currency)}

        </p>

        <div className="flex items-center justify-between gap-2 md:justify-end">

          <TransactionStatusBadge status={mapTxnStatus(txn.status)} />

          <span className="sr-only">{formatBuyerTransactionStatus(txn.status)}</span>

          <ChevronRight className="size-4 text-ledger-grey" aria-hidden />

        </div>

      </Link>

    </li>

  );

}


