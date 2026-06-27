'use client';

import Link from 'next/link';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { PickupSummary } from '@/features/pickups/components/PickupSummary';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isFuture, isPast, isThisWeek, parseISO } from 'date-fns';

export function PickupsPageContent() {
  const { transactions, isLoading } = useTransactions();
  const withPickup = transactions.filter((t) => t.deliveryDate);

  const upcoming = withPickup.filter((t) => {
    try {
      return isFuture(parseISO(t.deliveryDate!));
    } catch {
      return false;
    }
  });

  const thisWeek = withPickup.filter((t) => {
    try {
      return isThisWeek(parseISO(t.deliveryDate!));
    } catch {
      return false;
    }
  });

  const past = withPickup.filter((t) => {
    try {
      return isPast(parseISO(t.deliveryDate!));
    } catch {
      return false;
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  const renderList = (items: typeof withPickup) =>
    items.length === 0 ? (
      <EmptyState title="No pickups in this view" description="Confirmed pickups from accepted offers appear here." />
    ) : (
      <div className="space-y-3">
        {items.map((txn) => (
          <PickupSummary key={txn.id} transaction={txn} />
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="Pickups" subtitle="Plan your produce handovers" />

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {renderList(upcoming)}
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          {renderList(thisWeek)}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {renderList(past)}
        </TabsContent>
      </Tabs>

      <Link
        href="/farmer/transport-suggestions"
        className="mt-8 block rounded-2xl border border-morning-mist bg-field-cream px-4 py-4 text-sm font-semibold text-farm-green"
      >
        View transport pooling suggestions →
      </Link>
    </div>
  );
}
