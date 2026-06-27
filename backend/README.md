# FarmLink AI — Backend

FarmLink AI is a Ghana-focused agricultural marketplace and produce-matching platform that connects
farmers who have produce available (or approaching harvest) with buyers such as restaurants, hotels,
schools, supermarkets, market traders, processors, wholesalers and bulk individuals.

A farmer can describe their produce in plain language — for example:

> "I have 60 crates of tomatoes ready next Monday at Agogo."

The backend extracts structured fields from that sentence, lets the farmer confirm and publish a
listing, finds suitable buyers using a transparent weighted matching engine, supports offers and
transactions, and can suggest shared transport with another nearby farmer.

This repository contains the **backend** (a modular monolith). The farmer experience will eventually
be a mobile-first PWA; buyers and admins will use responsive web dashboards.

---

## 1. Core features

- Phone/email + password authentication with JWT access tokens and role-based authorization
  (FARMER, BUYER, ADMIN) plus account-status checks.
- Farmer and buyer profiles with Ghanaian location and geo-coordinates.
- Produce categories and produce listings with a full draft → publish lifecycle.
- **AI produce extraction** from natural-language / voice-transcribed text — works fully offline with
  a deterministic local provider and is pluggable with an external LLM.
- **Matching engine** with a transparent weighted scoring algorithm and human-readable explanations.
- Buyer demands, recommendations, offers, and safe transactional offer acceptance.
- Lightweight **transport pooling** suggestions for nearby farmers.
- In-app notifications and an audit log.
- Admin dashboard metrics and management endpoints.
- OpenAPI/Swagger documentation, structured logging, rate limiting, Helmet, CORS, Docker support and
  tests.

## 2. Architecture

```mermaid
flowchart LR
    Farmer[Farmer Mobile PWA] --> API[FarmLink Backend API]
    Buyer[Buyer Web Dashboard] --> API
    Admin[Admin Dashboard] --> API
    API --> Auth[Authentication Module]
    API --> Listings[Produce Listings Module]
    API --> AI[AI Extraction Service]
    API --> Matching[Matching Engine]
    API --> Offers[Offer Service]
    API --> Notifications[Notification Service]
    Auth --> DB[(PostgreSQL)]
    Listings --> DB
    Matching --> DB
    Offers --> DB
    Notifications --> DB
```

The application is a modular monolith: thin controllers, business logic in services, Prisma for data
access, Zod for validation at every boundary, and centralized error handling. Multi-step database
updates (e.g. offer acceptance) run inside Prisma transactions with defensive status checks.

## 3. Technology stack

Node.js 20+ · TypeScript (strict) · Express 5 · PostgreSQL · Prisma 6 · Zod 4 · JWT · bcryptjs ·
Pino + pino-http · Helmet · CORS · express-rate-limit · Vitest + Supertest · Swagger UI · ESLint ·
Prettier · dotenv · tsx.

> The app uses a standard `DATABASE_URL`, so it works with local PostgreSQL, Supabase, Neon, or any
> compatible hosted PostgreSQL.

## 4. Directory structure

```text
.
├── prisma/
│   ├── schema.prisma          # Data model (12 entities + enums)
│   ├── seed.ts                # Realistic demo seed data
│   └── migrations/0_init/     # Initial SQL migration
├── src/
│   ├── app.ts                 # Express app wiring
│   ├── server.ts              # Bootstrap + graceful shutdown
│   ├── config/                # env, database, logger, swagger
│   ├── constants/             # roles, produce, pagination, matching
│   ├── middlewares/           # auth, role, validate, error, not-found, rate-limit, request-id
│   ├── modules/               # auth, users, farmers, buyers, listings, offers,
│   │                          # transactions, categories, notifications, admin, health
│   ├── services/              # ai-extraction, matching-engine, transport,
│   │                          # notification, geolocation, audit
│   ├── routes/index.ts        # /api/v1 aggregator
│   ├── types/                 # express augmentation, api types
│   └── utils/                 # api-error, api-response, async-handler, jwt,
│                              # pagination, distance, decimal, http, common.schema
├── tests/                     # unit/ + integration/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

A feature module typically contains `*.controller.ts`, `*.service.ts`, `*.routes.ts`,
`*.schema.ts` (and a serializer where Decimal/sensitive fields need shaping).

## 5. Prerequisites

- Node.js 20 or newer
- npm 9+
- A PostgreSQL database (local, Docker, Supabase, or Neon)
- Optional: Docker + Docker Compose for local PostgreSQL

## 6. Environment setup

```bash
cp .env.example .env
# edit .env and set a strong JWT_ACCESS_SECRET and your DATABASE_URL
npm install
npm run prisma:generate
```

All environment variables are validated at startup (see `src/config/env.ts`). The server refuses to
start with a clear message if anything required is missing or invalid.

Key variables:

| Variable                  | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string                 |
| `JWT_ACCESS_SECRET`       | Secret for signing access tokens (≥16 chars) |
| `JWT_ACCESS_EXPIRES_IN`   | Token lifetime (e.g. `1d`)                   |
| `CORS_ORIGINS`            | Comma-separated allowed origins              |
| `AI_PROVIDER`             | `local` (default) or `openai`                |
| `AI_API_KEY` / `AI_MODEL` | Optional external LLM config                 |
| `ADMIN_*`                 | Seeded admin account (development only)      |

## 7. Local PostgreSQL setup

Use any local PostgreSQL and point `DATABASE_URL` at it, e.g.:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmlink?schema=public
```

## 8. Docker setup

Start PostgreSQL only:

```bash
docker compose up -d postgres
```

Run the whole stack (API + DB) using the optional `app` profile (the API image runs migrations on
boot):

```bash
docker compose --profile app up --build
```

## 9. Prisma migrations

```bash
# Apply the committed migration to your database
npm run prisma:deploy

# Or, during development, create/apply new migrations
npm run prisma:migrate
```

## 10. Seed data

```bash
npm run prisma:seed
```

This seeds produce categories, an admin, 6 farmers, 7 buyers (with profiles), 11 published listings,
buyer demands, generated match recommendations, transport suggestions, several offers and 2 accepted
transactions, plus notifications and audit logs. Locations use real Ghanaian coordinates (Agogo,
Kumasi, Accra, Cape Coast, Koforidua, Techiman, Tamale, Ho, Kasoa) so distance-based matching is
demonstrable.

## 11. Development commands

```bash
npm run dev          # start with tsx watch
npm run build        # compile to dist/
npm start            # run compiled server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
```

## 12. Testing

```bash
npm test             # unit tests (no DB required)
npm run test:watch
npm run test:coverage
```

Unit tests cover the AI extraction service, the matching scoring algorithm, and the distance utility.

Integration tests (full auth → listing → match → offer → transaction flow with Supertest) require a
running, migrated PostgreSQL and are **skipped by default**. To run them:

```bash
RUN_DB_TESTS=1 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmlink_test npm test
```

## 13. API documentation

Swagger UI: `http://localhost:4000/api/docs` · Raw spec: `http://localhost:4000/api/docs.json`

Use the **Authorize** button with a bearer token obtained from `/api/v1/auth/login`.

## 14. Demo credentials (development only)

| Role   | Email                   | Password             |
| ------ | ----------------------- | -------------------- |
| Admin  | `admin@farmlink.local`  | `AdminPassword123!`  |
| Farmer | `farmer@farmlink.local` | `FarmerPassword123!` |
| Buyer  | `buyer@farmlink.local`  | `BuyerPassword123!`  |

> These are seeded for demonstrations only. Never use them in production.

## 15. Main API routes

Base path: `/api/v1`

```text
# Auth
POST   /auth/register
POST   /auth/login
GET    /auth/me

# Categories / health
GET    /categories
GET    /categories/:categoryId
GET    /health           (also GET /health at the root)

# Farmer
POST   /farmers/profile      GET /farmers/profile      PATCH /farmers/profile
GET    /farmers/offers       GET /farmers/offers/:offerId
POST   /farmers/offers/:offerId/accept
POST   /farmers/offers/:offerId/reject
GET    /farmers/transactions
GET    /farmers/transport-suggestions

# Listings (farmer)
POST   /listings/extract
POST   /listings
GET    /listings/my
GET    /listings/:listingId   PATCH /listings/:listingId
POST   /listings/:listingId/publish
POST   /listings/:listingId/cancel
GET    /listings/:listingId/matches

# Buyer
POST   /buyers/profile       GET /buyers/profile       PATCH /buyers/profile
POST   /buyers/demands       GET /buyers/demands
PATCH  /buyers/demands/:demandId   DELETE /buyers/demands/:demandId
GET    /buyers/recommendations
GET    /buyers/offers        GET /buyers/offers/:offerId
POST   /buyers/offers/:offerId/cancel
GET    /buyers/transactions

# Marketplace (public)
GET    /marketplace/listings
GET    /marketplace/listings/:listingId

# Offers
POST   /offers

# Notifications
GET    /notifications        GET /notifications/unread-count
PATCH  /notifications/:notificationId/read
PATCH  /notifications/read-all

# Admin
GET    /admin/dashboard
GET    /admin/users          GET /admin/users/:userId
PATCH  /admin/users/:userId/status
GET    /admin/listings       GET /admin/listings/:listingId
PATCH  /admin/listings/:listingId/status
POST   /admin/listings/:listingId/regenerate-matches
GET    /admin/offers         GET /admin/transactions      GET /admin/matches
GET    /admin/audit-logs
```

All responses use a consistent envelope:

```json
{ "success": true, "message": "...", "data": {}, "meta": null }
```

```json
{
  "success": false,
  "message": "Validation failed",
  "error": { "code": "VALIDATION_ERROR", "details": [] },
  "requestId": "..."
}
```

## 16. AI extraction architecture

`AIExtractionService` accepts natural-language text plus an optional reference date and returns
strictly-validated structured produce data (Zod schema in `src/services/ai/extraction.schema.ts`).

- **Provider interface** (`AIExtractionProvider`) lets any external LLM be plugged in later.
- A **deterministic local provider** parses common phrases: produce name + aliases, quantity + unit,
  Ghanaian town/region lookup, relative dates ("next Monday", "tomorrow", "in 3 days"), and price.
- An **optional external provider** (`openai`) is selected via `AI_PROVIDER`/`AI_API_KEY`. Its raw
  output is always validated; on any failure or invalid output, the service **falls back** to the
  local provider. The app is therefore fully demonstrable without any paid AI API.
- Extraction never auto-publishes — it returns `missingFields` and `clarificationQuestions` for the
  farmer to confirm or edit.

Example response:

```json
{
  "produceName": "Tomatoes",
  "quantity": 60,
  "unit": "CRATE",
  "location": { "town": "Agogo", "district": "Asante Akim North", "region": "Ashanti" },
  "harvestDate": "2026-06-29",
  "availableFrom": "2026-06-29",
  "pricePerUnit": null,
  "minimumOrderQuantity": null,
  "confidence": 0.96,
  "missingFields": ["pricePerUnit"],
  "clarificationQuestions": ["What price are you asking per unit?"]
}
```

## 17. Matching algorithm

A transparent weighted score (0–100) combines five dimensions:

```text
Total = produce×35% + quantity×20% + distance×20% + date×15% + price×10%
```

- **Produce**: exact active buyer demand = 100, listed preference = 70, otherwise 10.
- **Quantity**: compares listing quantity to the buyer's demand range / minimum order.
- **Distance**: Haversine distance with configurable bands (≤20 km → 100, ≤50 → 85, ≤100 → 65,
  ≤200 → 40, beyond the buyer's travel limit → 0).
- **Date**: overlap of listing availability with the buyer's required window.
- **Price**: listing price vs the buyer's preferred maximum (neutral when no price data).

Each recommendation includes a human-readable explanation and is upserted on the unique
`(listing, buyer)` pair, so re-running matching never creates duplicates and preserves terminal
states (e.g. `CONVERTED`). Matching runs automatically on publish, and admins can regenerate it.

## 18. Hackathon demo flow

1. Register / log in as a farmer (`farmer@farmlink.local`).
2. Create a farmer profile.
3. `POST /listings/extract` with "I have 60 crates of tomatoes ready next Monday at Agogo".
4. Confirm and `POST /listings`, then `POST /listings/:id/publish` (triggers matching).
5. `GET /listings/:id/matches` to see ranked buyers and explanations.
6. As a buyer, `GET /buyers/recommendations`, then `POST /offers`.
7. As the farmer, `POST /farmers/offers/:id/accept` → a transaction is recorded, quantity reserved,
   notifications and audit logs created.
8. Inspect `GET /farmers/transport-suggestions` for shared-transport opportunities.
9. As the admin, `GET /admin/dashboard` for live platform metrics.

## 19. Known MVP limitations

- The external LLM provider is a stub; production extraction uses the local provider by default.
- Marketplace distance filtering is computed in-memory (fine for hackathon data volumes).
- Transport pooling is an approximate recommendation, not a logistics/routing system.
- No real payments, SMS, USSD, or delivery tracking.
- Listing expiry is computed at read time (no background scheduler).

## 20. Planned future improvements

- Phone OTP authentication (the auth service is structured to add it).
- Pluggable SMS / push notification adapters (the notification service is already channel-agnostic).
- Real LLM extraction with prompt + JSON-schema enforcement.
- Background jobs for expiry, match refresh, and digest notifications.
- Geospatial queries (PostGIS) for efficient distance filtering at scale.

## 21. Verification

The following were run successfully in this environment:

```bash
npm install
npm run prisma:generate
npm run typecheck   # passes
npm run lint        # passes (0 errors, 0 warnings)
npm test            # 13 unit tests pass (integration suite skipped without a DB)
npm run build       # passes
```

Database-dependent steps (`npm run prisma:deploy`, `npm run prisma:seed`, and the `RUN_DB_TESTS`
integration suite) require a running PostgreSQL instance.
