# FarmLink Farmer PWA Guide

## Manifest

Defined in `src/app/manifest.ts`:

- **Name:** FarmLink Farmer
- **Start URL:** `/farmer`
- **Display:** standalone
- **Theme / background:** `#356B45` / `#F4EEDD`
- Icons in `public/icons/` (192, 512, maskable SVG)

## Service worker

Serwist configuration:

- Source: `src/sw.ts`
- Output: `public/sw.js` (generated at build)
- Disabled in development; active in production builds

## Installation

`PWAInstallPrompt` listens for `beforeinstallprompt` and shows guidance once (dismissal persisted). Settings page also offers install when available.

## Updates

`PWAUpdatePrompt` detects waiting service worker and offers reload via `SKIP_WAITING`.

## Offline fallback

- Next route: `/~offline`
- Static fallback: `public/offline/index.html`

## Caching strategy

Conservative defaults via Serwist `defaultCache`:

- Immutable assets: cache-first
- API mutations: network-only (no stale commercial success)
- Sensitive auth responses: not broadly cached

## Testing installation

1. `npm run build && npm start`
2. Open Chrome DevTools → Application → Manifest / Service Workers
3. Use Lighthouse PWA audit or install from browser menu

## Platform limitations

iOS Safari has limited install prompt APIs; use **Add to Home Screen** manually. Web Speech API availability varies by browser.
