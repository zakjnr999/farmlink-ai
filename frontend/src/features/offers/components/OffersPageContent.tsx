'use client';

import { useOffers } from '@/features/offers/hooks/use-offers';
import { OfferCard } from '@/features/offers/components/OfferCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'New' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export function OffersPageContent() {
  const { offers, isLoading, isError, refetch, filter, setFilter } = useOffers();

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
        <ErrorState title="Could not load offers" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="Offers" subtitle="Buyer offers for your produce" />

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
            {offers.length === 0 ? (
              <EmptyState
                title="No offers yet"
                description="Buyer offers for your published listings will appear here."
              />
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    highlight={offer.status === 'pending'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
