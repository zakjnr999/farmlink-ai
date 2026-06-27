# FarmLink Harvest Exchange — Design System

The **Buyer Web Dashboard** uses **The Harvest Exchange** visual system — a procurement desk aesthetic distinct from the farmer **Field Journal**.

## Concept

Combines agricultural commodity boards, produce-market price tags, procurement ledgers, harvest timelines, supply routes, and intelligent recommendation signals. The experience should feel reliable, commercial, warm, efficient, and locally relevant — not like a consumer grocery store or generic SaaS admin template.

## Colour palette

| Token | Hex | Usage |
|-------|-----|--------|
| Exchange Ink | `#18201C` | Primary text, dark theme background |
| Deep Grove | `#21362B` | Dark surfaces |
| Market Green | `#2F6B45` | Primary actions, strong supply alignment |
| Fresh Leaf | `#66A36F` | Positive accents, dark-mode primary |
| Harvest Gold | `#D4A13B` | Pending activity, timing warnings |
| Basket Clay | `#B96B3F` | Expiring produce, pickup urgency |
| Tomato Accent | `#C4513E` | Rejected, cancelled, errors |
| Produce Cream | `#F4EFE4` | Primary light background |
| Warm Paper | `#FCFAF5` | Content surfaces |
| Cool Mist | `#E7EAE6` | Dividers, subtle fills |
| Ledger Grey | `#68726C` | Secondary text, labels |
| Soft Border | `#D9DDD7` | Rules and borders |

Tailwind classes: `text-exchange-ink`, `bg-market-green`, `text-ledger-grey`, `border-soft-border`, etc. (see `src/app/globals.css`).

## Typography

- **Headings:** Manrope (`font-heading`)
- **Body / UI:** Inter (`font-body`)
- **Numbers:** `tabular-nums` for quantities, currency, scores
- **Section markers:** `.exchange-label` — small uppercase labels for procurement sections only

## Layout patterns

- **Supply band:** `.supply-band` — left green rule for dominant metrics (Supply Desk)
- **Procurement rule:** `.procurement-rule` — horizontal section dividers instead of card stacks
- **Harvest Exchange surface:** `.harvest-exchange-surface` — sticky header background

Avoid putting every section inside identical rounded cards. Use spacing, rules, and background layers.

## Status presentation

Status is never communicated by colour alone — always include text labels.

- **Offers:** Pending, Accepted, Rejected, Cancelled, Expired (see `OfferStatusBadge`)
- **Transactions (buyer copy):** Confirmed, Awaiting pickup, In transit, Delivered, Completed, Cancelled, Disputed
- **Match scores:** Horizontal strip with numeric score + label (Excellent / Strong / Moderate / Review carefully)

## Produce markers

Reuse `ProduceMarker`, `QuantityDisplay`, `PriceDisplay`, `DistanceDisplay` from `src/components/marketplace/` and commerce components in `src/components/commerce/`.

## Charts

Buyer charts use the Harvest Exchange palette consistently. Each chart includes a screen-reader text summary. Avoid 3D charts and decorative pie charts without labels.

## Responsive behaviour

- **Desktop:** Collapsible sidebar (240–260px expanded, ~84px collapsed)
- **Mobile:** Bottom navigation, stacked supply records, bottom-sheet filters where implemented
- Tables convert to procurement record cards below `md` breakpoint

## Accessibility

- Visible `:focus-visible` outlines (never removed without replacement)
- Icon buttons require `aria-label`
- Dialogs use Radix focus management
- `prefers-reduced-motion` respected in `globals.css`

## Relationship to Field Journal

The farmer PWA retains Field Journal tokens (`field-cream`, `farm-green`). Buyer routes use Harvest Exchange tokens. Shared shadcn/ui primitives live in `src/components/ui/`.
