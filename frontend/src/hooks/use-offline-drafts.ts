'use client';

import {
  deleteDraft,
  loadAllDrafts,
  loadDraft,
  loadUnsyncedDrafts,
  markDraftSynced,
  saveDraft,
} from '@/lib/offline/draft-storage';
import type { StoredListingDraft } from '@/lib/offline/db';
import type { ListingDraft } from '@/types/listing';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';

export function useOfflineDrafts() {
  const drafts = useLiveQuery(() => loadAllDrafts(), [], [] as StoredListingDraft[]);
  const unsyncedDrafts = useLiveQuery(
    () => loadUnsyncedDrafts(),
    [],
    [] as StoredListingDraft[],
  );
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async (draft: Partial<ListingDraft> & { localId?: string }) => {
    setIsSaving(true);
    try {
      return await saveDraft(draft);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(async (localId: string) => {
    await deleteDraft(localId);
  }, []);

  const getDraft = useCallback(async (localId: string) => {
    return loadDraft(localId);
  }, []);

  const markSynced = useCallback(async (localId: string, serverId: string) => {
    await markDraftSynced(localId, serverId);
  }, []);

  return {
    drafts: drafts ?? [],
    unsyncedDrafts: unsyncedDrafts ?? [],
    isSaving,
    saveDraft: save,
    deleteDraft: remove,
    getDraft,
    markDraftSynced: markSynced,
    hasUnsyncedDrafts: (unsyncedDrafts ?? []).length > 0,
  };
}
