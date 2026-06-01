# mensa-frontend

Frontend for Mensa Period Products. One Vite app, three surfaces:

| Surface | Hostname | Port (dev) |
|---|---|---|
| Platform — customer storefront | `mensaproducts.com` | `3000` |
| Admin — staff dashboard | `admin.mensaproducts.com` | `3002` |
| App — reserved, not mounted at MVP | `app.mensaproducts.com` | `3001` |

`lib/network/helpers/getModule.ts` inspects `window.location.hostname` (or the dev port) and `App.tsx` mounts the matching `<Surface>Routes`. One build, three apps.

## Stack

- **React 19** + **Vite 7** + TypeScript
- **Tailwind v4** with `@theme` tokens (Mensa brand palette in `src/index.css`)
- **shadcn-style primitives** on Radix UI (`src/components/ui/`)
- **React Router 7** for client-side routing
- **TanStack Query 5** for server state + cache
- **Zustand** for client state (cart, auth, currency, cart drawer)
- **react-hook-form + Zod** for forms
- **axios** wrapped in a typed `api.{get,post,put,patch,delete}` client
- **Vitest + Testing Library + jsdom** for tests

## Layout

```
src/
  modules/
    platform/                    customer surface (shop, journal, account, partner portal)
      pages/                     route components
      components/                surface-specific shared bits
      routes/                    react-router definitions
      layouts/                   PlatformLayout, AuthLayout
    admin/                       admin surface (dashboard, products, orders, …)
      pages/
      components/
      routes/
      layouts/
  components/
    ui/                          generic primitives (button, dialog, sheet, dropdown-menu, form)
    chrome/                      header, footer, megamenu, mobile drawer, utility strip, currency picker, search overlay
    shop/                        ShopCard, Photo, Gallery, SizeGuideDialog, OptionPicker
    editorial/                   SectionEyebrow, BigNumber, Markdown, TrustStrip
    cart/                        CartDrawer
    auth/                        AuthGuard, RoleGuard, PublicOnlyGuard
  lib/
    network/                     api/, types/, stores/, helpers/, axios.ts
    currency.ts                  formatter + useFormatPrice() hook (NGN/USD/GBP/EUR)
    tracking.ts                  ETA + status helpers used by FulfilmentTimeline + orders list
    referral.ts                  partner-referral attribution (?ref=… in URL → localStorage)
    seo.ts                       useSeo() hook — per-page document.title + meta tags
    utils.ts                     cn, formatNaira (admin contexts), etc.
  test/
    setup.ts                     vitest global setup
  index.css                      Tailwind v4 entry + @theme tokens + named @utilities
```

## Surfaces

### Platform (`/`)

Public storefront + customer account + partner portal.

- Hero pages: `/`, `/about`, `/partnerships`, `/journal`, `/education`, `/returns`, `/contact`, `/privacy`, `/terms`
- Shop: `/shop`, `/shop/:slug`, `/checkout`, `/checkout/confirmation/:orderNumber`, `/orders/track`
- Account (auth): `/account`, `/account/orders`, `/account/orders/:id`, `/account/addresses`
- Partner: `/partner/onboarding?token=…` (token-gated public), `/partner` (auth + role=partner)
- Catch-all: `<NotFoundPage>` mounted at `*`

### Admin (`/`, served on admin host/port)

Auth-only, admin role.

- Dashboard with KPIs + recent orders + low-stock
- Orders list + detail (status transitions, internal notes, tracking)
- Products CRUD + image upload
- Customers list + detail (lifetime value, order history)
- Discounts CRUD
- Content CMS (journal + education posts)
- Newsletter subscribers (list, filter, CSV export, delete)
- Partnerships — three tabs: Organisations (B2BOrg verify), Individuals (partner programme), Payouts (mark paid)
- Catch-all NotFoundPage

## Environment

```
VITE_API_URL=http://localhost:5000/api/v1     # backend base URL
```

That's it on the frontend — auth + everything else flows through the API. The currency picker, referral attribution, and search overlay all key off the hostname / `window.location` directly.

## Scripts

```
npm run dev         # platform surface on :3000
npm run dev:admin   # admin surface on :3002
npm run build       # tsc -b && vite build
npm run preview     # serve the built bundle
npm run lint        # eslint
npm run type-check  # tsc --noEmit
npm run test        # vitest
npm run test:coverage
```

`dev:app` is wired for the future app surface but not mounted.

## Conventions (load-bearing)

These are the rules the codebase reflects today. Drift from them at your peril.

### Tailwind v4

Reach for canonical shorthand first; arbitrary `[...]` is a last resort.

- **CSS variables in className**: `bg-(--paper)` not `bg-[var(--paper)]`. Theme-token versions exist for most (`bg-paper`, `text-ink`, `border-hairline`, etc.) — prefer those when available.
- **Tracking**: named utilities — `tracking-tight`, `tracking-wider` — instead of `tracking-[-0.025em]`.
- **Spacing**: numeric scale on `p-`, `m-`, `w-`, `h-`, `gap-`, etc. — `max-w-180` (720px), `pt-22` (88px). Tailwind v4 base unit = 4px.
- **Off-scale utilities** (`text-`, `rounded-`, `border-`, `shadow-`, `blur-`, `backdrop-blur-`) stay as their named scale or arbitrary brackets — they do NOT use the spacing scale.
- **Aspect ratios**: `aspect-4/5` not `aspect-[4/5]`.
- **Composed effects** that have no single utility (gradients, multi-part shadows, dynamic `repeat(N,1fr)`) get a named `@utility` in `src/index.css`. Existing: `bg-blush-stripe`, `bg-ng-flag`, `shadow-blush-ring`.

### Button

Valid `variant`: `primary | ink | coral | secondary | soft | ghost`. **No** `outline` — use `secondary`.

Valid `size`: `sm | md | default | lg | icon`.

Passing an unknown variant or size silently produces an unstyled button. The hover-text colour swap on `secondary` is forced with `!important` for cascade safety — do not strip the `!`.

### Money

- Admin and partner payout surfaces use `formatNaira(kobo)` from `lib/utils` — always NGN.
- Customer-facing pages use `useFormatPrice()` from `lib/currency` — respects the visitor's selected display currency. Paystack still charges in NGN at checkout (note surfaced on the checkout page).

### Auth

- `AuthGuard` redirects unauthed users to `/login?redirect=<current>`.
- `RoleGuard` then narrows by role (e.g. `<RoleGuard allowed={['partner']} />`).
- `PublicOnlyGuard` keeps signed-in users out of /login etc.
- Access token lives in Zustand only (never localStorage). Refresh happens via httpOnly cookie + axios interceptor.

### SEO

Every public page calls `useSeo({ title, description })` at the top of its component. Auth / account / checkout / partner-portal pages call `useSeo({ ..., noindex: true })`. Default OG / Twitter tags are baked into `index.html` so social link previews work without JS.

### Imports

Always top-of-file. Never `await import()` or `require()` inside function bodies. (Recovery cost is too high when the imported module needs hydration.)

### Copy

No hyphens, en-dashes, or em-dashes in user-facing strings (UI labels, email bodies, toasts, API messages). Use commas or line breaks. The brand voice doesn't use them.

## Testing

`npm run test` runs Vitest in jsdom. The current suite covers the highest-leverage pure logic:

- `lib/currency.test.ts` — kobo→NGN/USD/GBP/EUR conversion + format
- `lib/tracking.test.ts` — ETA windows, status pill mapping
- `lib/referral.test.ts` — URL capture, TTL expiry, corrupt-payload safety
- `lib/seo.test.ts` — title + meta + canonical fan-out, noindex toggle

jsdom is configured with `url: 'https://mensaproducts.com/'` so `window.location` and `history.replaceState` work in tests. `localStorage` is cleared between tests via `src/test/setup.ts`.

## Performance notes

- Images use native `loading="lazy"` + `decoding="async"` by default via the `Photo` component. Above-the-fold images (home hero, PDP main, journal/education feature card, post cover) pass `priority="eager"` which switches them to `loading="eager"` + `fetchPriority="high"`.
- Public route components are loaded eagerly today. If TTI on slow connections becomes an issue, route-level `React.lazy` is the next step — start with the admin module since that's never reached by anonymous visitors.

## Multi-currency

Display-only. Customers can browse in NGN / USD / GBP / EUR; the picker lives in the utility strip and the mobile drawer. FX rates are static in `lib/currency.ts` (`RATES`) — swap for a daily-refreshed feed when ready. Paystack only ever charges in NGN; the checkout page surfaces a note when the selected display currency isn't NGN.

## Known gaps

- Real product photography is not yet uploaded — `Photo` placeholders render in the meantime.
- Account preferences page (email/SMS notification toggles) is not built.
- Education library has only the seed posts; once the editorial team starts publishing via the admin CMS, they flow through automatically.
- Live FX feed for the currency picker.
- Privacy + Terms copy is marked as a working draft pending legal review.
