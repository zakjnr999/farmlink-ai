# Backend Integration Gaps

Honest list of capabilities **not yet fully integrated** or missing from the current backend/demo layer.

## Farmer PWA

| Gap | Frontend behaviour |
|-----|-------------------|
| Audio upload / speech-to-text endpoint | Voice stays local; text sent to `/listings/extract` only |
| `GET /listings/my` | Uses `GET /listings` in client; demo mirrors farmer listings |
| `GET /farmers/offers` | Client uses `/offers`; path alias may differ in production API |
| `GET /farmers/transactions` | Client uses `/transactions` |
| `GET /farmers/transport-suggestions` | Client uses `/transport/suggestions` |
| Transaction detail by ID | Implemented in demo; production endpoint may differ |
| Dedicated pickup endpoint | Pickups aggregated from transactions client-side |
| Transport suggestion detail | List only; no detail route |
| Farmer verification submission | Read-only message in profile |
| Notification preferences API | Settings shows "Backend integration required" |
| Language preference persistence | Placeholder only |
| Image upload for listings/profile | Not implemented |
| Push notification subscription | Not implemented |
| Idempotency keys for draft sync | Local IDs only; manual retry |
| Farmer dashboard aggregation | Home screen composes multiple queries |
| `POST /listings/:id/publish` | Uses patch with `status: active` |
| `POST /listings/:id/cancel` | Uses patch with `status: archived` |
| Offer reject reason field | Reject without reason unless API adds support |
| Real MoMo / payment status | Explicit MVP exclusion |

## Buyer Harvest Exchange Dashboard

| Gap | Frontend behaviour |
|-----|-------------------|
| `GET /buyers/dashboard` | `useBuyerDashboard()` aggregates recommendations, demands, offers, transactions, notifications client-side |
| Recommendation detail endpoint | Uses `GET /buyers/recommendations/:id` in demo; production may use list item only |
| `GET /buyers/transactions/:id` | Demo supported; verify production path |
| Dedicated pickup schedule endpoint | Pickups aggregated from buyer transactions client-side |
| Saved listing comparison | Client-only via `ComparisonProvider`; not persisted |
| Buyer notification preferences | Settings stored locally with "Stored on this device" badge |
| Buyer settings persistence (filters, units, distance) | Local storage only where noted |
| Global search API | Command palette searches pages + marketplace API; no unified backend search |
| Farmer public profile endpoint | Listing detail shows fields returned on marketplace listing only |
| Demand coverage metrics | Coverage inferred from demand status / match counts in demo |
| Offer expiration configuration | Demo uses 7-day default; no admin config endpoint |
| Buyer verification submission | Read-only in profile |
| Route optimization / multi-pickup optimization | Planning observations only; labelled as client-side grouping |
| National market pricing | Price observations labelled "Based on your FarmLink activity" |
| Real-time WebSocket notifications | Polling via TanStack Query only |

Update this file as backend endpoints land.
