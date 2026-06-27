'use client';

import Link from 'next/link';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionStatusBadge } from '@/components/marketplace/TransactionStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/formatting/dates';
import { ChevronRight } from 'lucide-react';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'payment_confirmed', label: 'Confirmed' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function TransactionsPageContent() {
  const { transactions, isLoading, isError, refetch, filter, setFilter } =
    useTransactions();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState title="Could not load transactions" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="Transactions" subtitle="Confirmed sales and deliveries" />
      <p className="mt-3 rounded-xl bg-morning-mist px-4 py-3 text-sm text-muted-text">
        Payment settlement is handled outside FarmLink in the current MVP.
      </p>

      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList className="w-full flex-wrap justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {transactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Accepted offers will appear here as confirmed transactions."
              />
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <Link
                    key={txn.id}
                    href={`/farmer/transactions/${txn.id}`}
                    className="flex items-center justify-between rounded-2xl border border-morning-mist bg-warm-paper p-4 hover:bg-field-cream"
                  >
                    <div>
                      <p className="font-heading font-semibold">{txn.listingTitle}</p>
                      <p className="text-sm text-muted-text">{txn.buyerName}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <QuantityDisplay amount={txn.quantity} unit={txn.unit} />
                        {txn.deliveryDate && (
                          <span className="text-muted-text">
                            Pickup {formatDate(txn.deliveryDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TransactionStatusBadge
                        status={
                          txn.status === 'payment_confirmed'
                            ? 'confirmed'
                            : txn.status === 'pending_payment'
                              ? 'pending'
                              : (txn.status as 'completed')
                        }
                      />
                      <ChevronRight className="size-4 text-muted-text" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
