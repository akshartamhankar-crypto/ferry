# Ferry — Turn On Payments (direct Stripe via Cloudflare Worker)

Access is **time-based**: three prepaid terms (no auto-renew) + one auto-renewing annual. Money goes straight to the LLC's Stripe — only Stripe's ~2.9% + 30¢, no platform fee. The extension never holds a secret key; a free Cloudflare Worker does. ~30–40 min.

## 0. Stripe (start first — verification lags)
1. At **stripe.com**, sign in to the **Techcesories LLC** account (business/company type — the LLC is the merchant; this sidesteps the personal-age issue).
2. Complete business verification (EIN + payout bank). Build everything below in **test mode** while it clears.

## 1. Create four Prices in Stripe
Dashboard → **Products** → one product "Ferry Pro" with four prices:

| Fare | Type | Amount | Copy ID into |
|---|---|---|---|
| 1 month | **One-time** | $2.99 | `PRICE_1MO` |
| 3 months | **One-time** | $6.99 | `PRICE_3MO` |
| 6 months | **One-time** | $11.99 | `PRICE_6MO` |
| Annual | **Recurring · yearly** | $14.99 | `PRICE_ANNUAL` |

The three one-time prices are prepaid terms (the Worker grants access for that many months from purchase). Only the annual is a real Stripe subscription. Copy each `price_…` ID.

## 2. Deploy the Worker (free Cloudflare account)
In `workers/`:
1. `npm i -g wrangler` then `wrangler login`.
2. Edit `wrangler.toml` → paste the four `price_…` IDs; confirm `SITE_URL`.
3. Set the secret key (never in any file): `wrangler secret put STRIPE_SECRET` → paste `sk_test_…` (later `sk_live_…`).
4. `wrangler deploy` → prints your Worker URL, e.g. `https://ferry-api.techcesories.workers.dev`.

## 3. Point the extension at your Worker
1. In `src/background.js`, set `API_BASE` to your Worker URL.
2. In `manifest.json` → `host_permissions`, make the `…workers.dev/*` entry match it.
   *(Send me the URL and I'll set both + ship the production build, or edit the two spots yourself.)*

## 4. Test the loop (Stripe test mode)
1. Reload the extension → popup → pick a fare → Stripe Checkout opens.
2. Pay with test card **4242 4242 4242 4242**, any future date/CVC.
3. Reopen the popup within ~a minute → Pro unlocks; the badge shows "Access until …" (prepaid) or "Renews …" (annual). (Keep the dev toggle OFF while testing.)

## 5. Go live
1. Swap to live `sk_live_…` once Stripe verification clears; flip the dashboard to live.
2. Turn OFF the "Enable Pro for testing" toggle before publishing.

## How it works (no database, time-based)
- The extension makes an anonymous **installId** (random UUID, no PII), stored locally.
- Checkout writes that installId into Stripe metadata (+ the term length for prepaid).
- `/status` asks Stripe live for the newest valid purchase and returns an **expiry**. Prepaid → purchase date + N months; annual → the subscription's period end. **Stripe is the only source of truth**; we store nothing server-side.
- The Stripe **secret key lives only in the Worker**.

## Fees & why this shape
Direct Stripe: ~2.9% + 30¢ per charge, nothing else. Short prepaid terms are priced to nudge buyers toward the annual ($1.25/mo equivalent), where long-term revenue lives. Every fare sits well under the $9.99/mo organizers — that's the undercut.
