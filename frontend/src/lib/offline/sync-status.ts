export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncStatus {
  state: SyncState;
  pendingCount: number;
  lastSyncedAt?: string;
  lastError?: string;
}

export interface SyncEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  pendingCount?: number;
  message?: string;
  timestamp: string;
}

export function createInitialSyncStatus(): SyncStatus {
  return {
    state: 'idle',
    pendingCount: 0,
  };
}

export function isSyncInProgress(status: SyncStatus): boolean {
  return status.state === 'syncing';
}

export function canSync(status: SyncStatus): boolean {
  return status.state !== 'syncing' && status.pendingCount > 0;
}
