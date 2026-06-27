'use client';

import { useMyListings } from '@/features/listings/hooks/use-my-listings';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
];

export function ListingsPageContent() {
  const { listings, isLoading, isError, refetch, filter, setFilter } = useMyListings();

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
        <ErrorState title="Could not load listings" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="My listings" subtitle="Your produce on FarmLink" />

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
            {listings.length === 0 ? (
              <EmptyState
                title="No produce listed yet"
                description="Tell FarmLink what you have available and we will help you find suitable buyers."
                actionLabel="List produce"
                actionHref="/farmer/list-produce"
              />
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
