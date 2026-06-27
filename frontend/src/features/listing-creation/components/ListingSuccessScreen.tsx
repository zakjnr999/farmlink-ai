'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function ListingSuccessScreen() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
      <CheckCircle2 className="size-16 text-farm-green" aria-hidden />
      <PageHeader
        className="mt-6"
        title="Your produce is now listed"
        subtitle="FarmLink is checking for suitable buyers."
      />
      <div className="mt-8 flex w-full flex-col gap-3">
        {listingId && (
          <>
            <Button asChild className="w-full">
              <Link href={`/farmer/listings/${listingId}`}>View listing</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/farmer/listings/${listingId}/matches`}>View matches</Link>
            </Button>
          </>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/farmer/list-produce">List more produce</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/farmer">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
