# Ferry — Security Overview

The strongest security control is the architecture: Ferry collects nothing centrally and transmits no conversation content off-device, so there is no server-side store of user chats to compromise. Everything below hardens around that.

## Data-flow map (what touches what)

```
ChatGPT / Claude page (your tab)
        │  read on Export only
        ▼
Ferry content script ──► conversion engine (in memory, on device)
        │
        ├──► download .md / .zip            (your disk)
        ├──► clipboard                       (your OS)
        └──► obsidian:// URI                 (your Obsidian app)

Pro queue / auto-sync ──► chrome.storage.local  [AES-GCM-256 encrypted]

License status ──► our Cloudflare Worker ──► Stripe (HTTPS)
        (anonymous install ID only; no PII, no conversation content)
```

No conversation content leaves the device. The only network egress is the anonymous license-status check to our Worker.

## Controls

- **Data minimization.** Conversation content is processed in memory and written only to the destination you choose. Nothing is collected by us.
- **Encryption at rest.** Any persisted conversation content (Pro queue/auto-sync) is encrypted with AES-GCM-256 (`src/secure-store.js`). Settings (non-sensitive) are cleartext.
- **Least privilege.** Permissions are limited to `storage` and host access to the two AI sites, our licensing Worker, and (for integrations) Notion/GitHub. No `<all_urls>`, no `tabs`, no `webRequest`, no broad browsing access.
- **No remote code.** MV3 plus an explicit CSP (`script-src 'self'; object-src 'self'; base-uri 'none'`). All libraries are vendored and pinned; nothing is fetched and executed at runtime.
- **Payment isolation.** Card data is handled solely by Stripe (PCI-DSS) on Stripe-hosted checkout. Ferry never sees it. The Stripe secret key is held only by our Worker.
- **No telemetry.** No analytics SDKs, no crash reporters, no tracking pixels.

## Supply chain

Vendored, version-pinned dependencies only: Turndown + turndown-plugin-gfm (HTML→Markdown), JSZip (local ZIP packaging), marked (Markdown→HTML for PDF). The Stripe secret key lives only in the Cloudflare Worker, never in the extension. Update procedure: review upstream changelog, diff the build, re-vendor, re-run the engine test suite, bump version. Never load these from a CDN at runtime.

## Operational security (LLC responsibilities)

- Enable 2FA on the Stripe, Cloudflare, store-developer, domain registrar, and email accounts.
- Restrict who can publish extension updates; treat the signing/publishing credentials as secrets.
- Keep `privacy@techcesories.com` and `security@techcesories.com` monitored.

## Vulnerability disclosure

Report security issues to **security@techcesories.com**. We aim to acknowledge within 72 hours and to fix verified issues promptly. Please give us a reasonable window before public disclosure.

## Breach response (Georgia O.C.G.A. § 10-1-912)

Georgia's breach-notification law applies regardless of company size. Because Ferry holds essentially no personal information centrally, exposure is minimal — but if a breach of personal information held by the business (e.g., payment records in our processor accounts) is discovered:

1. Contain and assess scope; preserve logs.
2. Determine whether "personal information" of Georgia residents was, or is reasonably believed to have been, acquired by an unauthorized person.
3. If so, notify affected individuals without unreasonable delay, consistent with O.C.G.A. § 10-1-912, and coordinate with the payment processor (Stripe is the primary holder of payment data).
4. Notify the Georgia Attorney General / consumer reporting agencies where thresholds require.
5. Document the incident and remediation.

---
*Security overview, not a warranty. No system is perfectly secure. Prepared for Techcesories LLC; not legal advice.*
