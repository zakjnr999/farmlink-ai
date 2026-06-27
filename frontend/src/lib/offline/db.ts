import Dexie, { type EntityTable } from 'dexie';
import type { ListingDraft } from '@/types/listing';

export interface StoredListingDraft extends ListingDraft {
  localId: string;
  synced: boolean;
  lastModified: string;
}

export interface SyncQueueItem {
  id?: number;
  localId: string;
  action: 'create' | 'update' | 'delete';
  payload?: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

class FarmLinkOfflineDB extends Dexie {
  listingDrafts!: EntityTable<StoredListingDraft, 'localId'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('farmlink-offline');
    this.version(1).stores({
      listingDrafts: 'localId, synced, lastModified',
      syncQueue: '++id, localId, createdAt',
    });
  }
}

export const offlineDb = new FarmLinkOfflineDB();
