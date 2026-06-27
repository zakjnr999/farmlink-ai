import type { ListingDraft } from '@/types/listing';
import { offlineDb, type StoredListingDraft } from './db';

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveDraft(
  draft: Partial<ListingDraft> & { localId?: string },
): Promise<StoredListingDraft> {
  const localId = draft.localId ?? generateLocalId();
  const now = new Date().toISOString();
  const existing = await offlineDb.listingDrafts.get(localId);

  const stored: StoredListingDraft = {
    localId,
    synced: draft.synced ?? existing?.synced ?? false,
    lastModified: now,
    title: draft.title ?? existing?.title,
    categoryId: draft.categoryId ?? existing?.categoryId,
    produceType: draft.produceType ?? existing?.produceType,
    quantity: draft.quantity ?? existing?.quantity,
    unit: draft.unit ?? existing?.unit,
    pricePerUnit: draft.pricePerUnit ?? existing?.pricePerUnit,
    description: draft.description ?? existing?.description,
    images: draft.images ?? existing?.images,
    harvestDate: draft.harvestDate ?? existing?.harvestDate,
    availableFrom: draft.availableFrom ?? existing?.availableFrom,
    availableUntil: draft.availableUntil ?? existing?.availableUntil,
    region: draft.region ?? existing?.region,
    district: draft.district ?? existing?.district,
    id: draft.id ?? existing?.id,
  };

  await offlineDb.listingDrafts.put(stored);
  return stored;
}

export async function loadDraft(localId: string): Promise<StoredListingDraft | undefined> {
  return offlineDb.listingDrafts.get(localId);
}

export async function loadAllDrafts(): Promise<StoredListingDraft[]> {
  return offlineDb.listingDrafts.orderBy('lastModified').reverse().toArray();
}

export async function loadUnsyncedDrafts(): Promise<StoredListingDraft[]> {
  return offlineDb.listingDrafts.filter((draft) => !draft.synced).toArray();
}

export async function markDraftSynced(localId: string, serverId: string): Promise<void> {
  const draft = await offlineDb.listingDrafts.get(localId);
  if (!draft) return;
  await offlineDb.listingDrafts.put({
    ...draft,
    id: serverId,
    synced: true,
    lastModified: new Date().toISOString(),
  });
}

export async function deleteDraft(localId: string): Promise<void> {
  await offlineDb.listingDrafts.delete(localId);
}

export async function clearAllDrafts(): Promise<void> {
  await offlineDb.listingDrafts.clear();
}
