# Ferry — Launch Sequence (free + Pro)

Ordered so nothing blocks on something later. **[you]** = needs your accounts; **[me]** = I produce it.

## Phase 1 — Host the site (unblocks store submission + payments verification lag)
1. **[you]** Deploy the `site/` folder to **GitHub Pages** (public repo named `ferry`, contents at repo root) so these resolve on the subdomain:
   - `ferry.techcesories.com/` → landing
   - `ferry.techcesories.com/privacy` → privacy page
   - `ferry.techcesories.com/terms` → terms page
   - `ferry.techcesories.com/thanks` → Stripe success page
   The `CNAME` file + folder-per-page structure are already set for clean URLs. Then add the Squarespace CNAME: Host `ferry` → `<username>.github.io`, and tick Enforce HTTPS once the cert provisions.
2. **[you]** Start **Stripe** business verification for Techcesories LLC now (it lags — see SETUP-PAYMENTS.md step 0).

## Phase 2 — Turn on payments
3. **[you]** Follow **SETUP-PAYMENTS.md**: create the four Stripe Prices (1mo $2.99, 3mo $6.99, 6mo $11.99 one-time + annual $14.99/yr), deploy the Cloudflare Worker, and set the Stripe secret on it.
4. **[you→me]** Send me the deployed **Worker URL** → I set `API_BASE` + the matching host_permission and ship the production build. (Or edit those two spots yourself.)
5. **[both]** Test the full pay loop in Stripe test mode (card 4242 4242 4242 4242) → Pro unlocks.

## Phase 3 — Production build
6. **[me]** Produce the **production zip**: `EXT_ID` set, the "Enable Pro for testing" dev toggle removed, version bumped. (Say the word once payments test green.)

## Phase 4 — Store submission (free + Pro in one listing)
7. **[me]** Already done: icons, `STORE-LISTING.md` copy, `STORE-COMPLIANCE.md` disclosures, `CHROME-SUBMISSION.md` (Chrome's per-permission justifications + Privacy Practices answers).
8. **[you]** Capture the 5 screenshots + the demo GIF (shot list in STORE-LISTING.md). Make shot #1 the migration panel mid-run — it's the differentiator. I can give exact framing if useful.
9. **[you]** Register **Chrome Web Store** ($5 one-time) now, and submit to all three at once: **Chrome**, **Edge Add-ons**, and **Firefox AMO**. Same `ferry-extension-v0.7.0.zip` for each.
   - Edge/Firefox (free, faster review): paste listing copy + privacy URL + the disclosures from `STORE-COMPLIANCE.md`.
   - Chrome (paid, slower, stricter Privacy Practices tab): follow `CHROME-SUBMISSION.md` exactly — the single-purpose statement + host justifications there are written to pre-empt a reviewer misreading the migration feature.
10. **[you]** Expect Edge/Firefox to approve first and start seeding reviews; Chrome may take days–2wks and possibly one clarification request (answer ready in CHROME-SUBMISSION.md).

## Phase 5 — Distribution (the actual game)
11. **[me]** Programmatic SEO pages on the site ("export claude to obsidian", "chatgpt canvas to files", etc.).
12. **[you + me]** Seed where you're credible: r/ObsidianMD, r/ClaudeAI, r/ChatGPT, r/Notion, r/csMajors, a "Show HN". Value-first, respect each sub's self-promo rules. I'll draft the posts.
13. **[you]** Product Hunt launch with the demo GIF.

## Critical path to "monetized version is live"
Phase 1 (host site) → Phase 2 (payments) → Phase 3 (prod build) → Phase 4 step 9 (submit to all three; Edge/Firefox go live first). Everything else is parallel or fast-follow.

## Pre-publish checklist
- [ ] site/ live; privacy + terms reachable at the URLs above
- [ ] Worker deployed; API_BASE + host_permission set; 4 Stripe Prices created; Stripe live
- [ ] pay loop tested green; dev-unlock removed from prod build
- [ ] screenshots + demo GIF ready
- [ ] listing copy + data disclosures pasted; privacy URL entered
- [ ] 2FA on Stripe, Cloudflare, store-dev, registrar, and email accounts
