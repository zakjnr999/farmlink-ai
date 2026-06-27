# FarmLink AI — Frontend

This folder is the home for the FarmLink AI frontend(s): a mobile-first PWA for farmers and
responsive web dashboards for buyers and administrators. The backend is a separate service in
[`../backend`](../backend) and exposes a versioned REST API.

> Pick any stack you like (Vite + React, Next.js, Vue, SvelteKit…). Scaffold it **inside this
> folder** (e.g. `npm create vite@latest .`). A ready-to-use, framework-agnostic API client and the
> connection details you need are provided below.

## Connecting to the backend

### 1. Base URL

All endpoints live under the versioned base path `/api/v1`.

| Environment | Base URL |
| --- | --- |
| Local | `http://localhost:4000/api/v1` |
| Render | `https://<your-service>.onrender.com/api/v1` |

Set it via an environment variable (see [`.env.example`](./.env.example)). Use your bundler's public
prefix — `VITE_API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, or `REACT_APP_API_BASE_URL`.

### 2. Use the provided client

A typed client lives in [`src/api/`](./src/api). Copy it into your app and use it directly:

```ts
import { FarmLinkClient } from './api/client';

const api = new FarmLinkClient(import.meta.env.VITE_API_BASE_URL);

// Auth (token is stored automatically and attached to later requests)
await api.login({ identifier: 'farmer@farmlink.local', password: 'FarmerPassword123!' });

// AI extraction → confirm → publish
const extracted = await api.extractProduce('I have 60 crates of tomatoes ready next Monday at Agogo');
const listing = await api.createListing({
  categoryId: extracted.suggestedCategoryId,
  title: 'Fresh tomatoes in Agogo',
  description: 'Fresh tomatoes for wholesale.',
  quantity: extracted.quantity,
  unit: extracted.unit,
  harvestDate: extracted.harvestDate,
  availableFrom: extracted.availableFrom,
  region: 'Ashanti', district: 'Asante Akim North', town: 'Agogo',
  latitude: 6.8001, longitude: -1.0819,
  sourceType: 'VOICE_TRANSCRIPTION',
});
await api.publishListing(listing.id);
const matches = await api.getListingMatches(listing.id);
```

### 3. Authentication

- `POST /auth/register` and `POST /auth/login` return `{ user, accessToken }`.
- Send the token as a header on protected routes: `Authorization: Bearer <accessToken>`.
- `GET /auth/me` returns the current user.
- Roles: `FARMER`, `BUYER`, `ADMIN`. Public registration only allows `FARMER`/`BUYER`.

### 4. Response envelope

Every response uses a consistent shape:

```jsonc
// success
{ "success": true, "message": "...", "data": { /* ... */ }, "meta": null }
// paginated
{ "success": true, "message": "...", "data": { "listings": [] },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5, "hasNextPage": true, "hasPreviousPage": false } }
// error
{ "success": false, "message": "Validation failed",
  "error": { "code": "VALIDATION_ERROR", "details": [] }, "requestId": "..." }
```

The client throws `FarmLinkApiError` (with `status`, `code`, `message`, `details`, `requestId`) on any
non-success response.

### 5. CORS

The backend only allows origins listed in its `CORS_ORIGINS` env var. Add your frontend dev and
production URLs there (e.g. `http://localhost:5173,https://your-frontend.onrender.com`).

### 6. Interactive API reference

- Swagger UI: `<base host>/api/docs`
- OpenAPI JSON: `<base host>/api/docs.json` — generate a typed SDK from this if you prefer.

## Key flows by role

- **Farmer**: profile → `/listings/extract` → `/listings` → `/listings/:id/publish` →
  `/listings/:id/matches`, manage offers via `/farmers/offers/...`.
- **Buyer**: profile → `/buyers/demands` → `/buyers/recommendations` and `/marketplace/listings` →
  `POST /offers` → `/buyers/offers`, `/buyers/transactions`.
- **Admin**: `/admin/dashboard`, `/admin/users`, `/admin/listings`, `/admin/audit-logs`.

## Demo credentials (development only)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@farmlink.local` | `AdminPassword123!` |
| Farmer | `farmer@farmlink.local` | `FarmerPassword123!` |
| Buyer | `buyer@farmlink.local` | `BuyerPassword123!` |
