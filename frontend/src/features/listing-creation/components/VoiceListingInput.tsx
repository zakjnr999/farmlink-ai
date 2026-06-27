'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { StickyActionBar } from '@/components/layout/StickyActionBar';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TranscriptEditor } from '@/components/voice/TranscriptEditor';
import { useListingDraftContext } from '@/providers/ListingDraftProvider';
import { listingExtractionApi } from '@/lib/api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useState } from 'react';
import Link from 'next/link';

export function VoiceListingInput() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const {
    transcript,
    setTranscript,
    setExtractionResult,
    setRawText,
  } = useListingDraftContext();
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const text = transcript.trim();
    if (!text) {
      setError('Add or confirm what you said before continuing.');
      return;
    }

    if (!isOnline) {
      setError('Connect to the internet to extract listing details from your description.');
      return;
    }

    setError(null);
    setIsExtracting(true);
    setRawText(text);

    try {
      const result = await listingExtractionApi.extractListingFields({ text });
      setExtractionResult(result);
      router.push('/farmer/list-produce/review');
    } catch {
      setError('Could not extract details. Check your connection or use the form instead.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-5 pb-32">
        <PageHeader
          title="Speak your produce"
          subtitle="Describe your harvest. FarmLink will suggest listing details for you to check."
        />

        <div className="mt-8 space-y-6">
          <VoiceRecorder onTranscript={setTranscript} />
          <TranscriptEditor value={transcript} onChange={setTranscript} />

          {!isOnline && (
            <p className="rounded-xl bg-clay-orange/10 px-4 py-3 text-sm text-deep-soil">
              You are offline. Your recording stays on this device until you can extract details online.
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red">
              {error}
            </p>
          )}
        </div>
      </div>

      <StickyActionBar>
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/farmer/list-produce">Back</Link>
          </Button>
          <Button className="flex-1" onClick={handleContinue} disabled={isExtracting}>
            {isExtracting ? 'Extracting…' : 'Continue'}
          </Button>
        </div>
      </StickyActionBar>
    </>
  );
}
