# Offline Strategy — FarmLink Farmer PWA

## Works offline

- Start listing creation flow
- Enter text / manual form fields
- Save local drafts (IndexedDB via Dexie)
- Edit and view local drafts
- Browse cached app shell (after prior visit)

## Requires connection

- Sign in / session refresh
- AI extraction (`POST /listings/extract`)
- Publish listing / accept or reject offers
- Fetch matches, offers, notifications
- Profile sync to backend

## Draft storage

- Database: `farmlink-offline` (Dexie)
- Store: `listingDrafts`
- Status labels: Saved on device, Waiting to sync, Syncing, Synced, Sync failed

## Sync approach

Simple manual retry — no aggressive background queue that risks duplicate submissions. Unsynced drafts labelled **Saved on this device**.

## Conflict handling

Server is source of truth after successful sync. Local drafts retain `localId` until backend confirms create.

## Clear local data

Settings → Clear local data removes IndexedDB drafts and onboarding progress from device only.

## Security

Drafts may contain farm/commercial info — cleared on explicit user action or logout where implemented. Tokens never stored in IndexedDB.
