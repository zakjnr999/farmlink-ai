'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { StickyActionBar } from '@/components/layout/StickyActionBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useListingDraftContext } from '@/providers/ListingDraftProvider';
import { listingExtractionApi } from '@/lib/api';
import { saveDraft } from '@/lib/offline/draft-storage';
import { toast } from 'sonner';
import { useState } from 'react';

const suggestionChips = ['Produce', 'Quantity', 'Location', 'Harvest date', 'Price'];
const exampleText =
  'I have 60 crates of tomatoes ready next Monday at Agogo.';

export function TextListingInput() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const { rawText, setRawText, setExtractionResult, setLocalDraftId } =
    useListingDraftContext();
  const [text, setText] = useState(rawText);
  const [showExample, setShowExample] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Tell us what produce you have available.');
      return;
    }

    if (!isOnline) {
      setError(
        'You are offline. Save a draft on this device and extract details when you reconnect.',
      );
      return;
    }

    setError(null);
    setIsExtracting(true);
    setRawText(text);

    try {
      const result = await listingExtractionApi.extractListingFields({
        text: text.trim(),
        referenceDate: new Date().toISOString().split('T')[0],
      } as { text: string; referenceDate?: string });
      setExtractionResult(result);
      router.push('/farmer/list-produce/review');
    } catch {
      setError('FarmLink could not extract details right now. Try again or fill the form manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveDraft = async () => {
    const stored = await saveDraft({
      description: text,
      synced: false,
    });
    setLocalDraftId(stored.localId);
    toast.success('Draft saved on this device');
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-5 pb-32">
        <PageHeader
          title="Type your produce"
          subtitle="Tell us what produce you have, the quantity, where it is located and when it will be ready."
        />

        <div className="mt-6 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Example: I have 60 crates of tomatoes ready next Monday at Agogo."
            className="min-h-[10rem] text-base"
            aria-describedby="text-listing-help"
          />
          <p id="text-listing-help" className="text-sm text-muted-text">
            Include produce type, quantity, location and ready date if you can.
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-morning-mist bg-warm-paper px-3 py-1.5 text-sm text-muted-text"
                onClick={() => setText((prev) => (prev ? `${prev} ${chip}: ` : `${chip}: `))}
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-farm-green"
            onClick={() => {
              setShowExample((v) => !v);
              if (!showExample) setText(exampleText);
            }}
          >
            {showExample ? 'Clear example' : 'Show example'}
          </button>

          {error && (
            <p role="alert" className="rounded-xl bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red">
              {error}
            </p>
          )}
        </div>
      </div>

      <StickyActionBar>
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button className="flex-1" onClick={handleExtract} disabled={isExtracting}>
            {isExtracting ? 'Extracting…' : 'Continue'}
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-text">
          Prefer manual entry?{' '}
          <Link href="/farmer/list-produce/form" className="font-semibold text-farm-green">
            Fill the form
          </Link>
        </p>
      </StickyActionBar>
    </>
  );
}
