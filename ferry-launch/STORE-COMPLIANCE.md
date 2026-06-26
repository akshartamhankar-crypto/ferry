# Ferry — Store Submission & Compliance Cheat Sheet

Reviewers cross-check three things against each other: the **manifest permissions**, the **Developer Dashboard data disclosures**, and the **privacy policy**. They must agree. This sheet keeps them aligned.

## Privacy policy URL
Host `PRIVACY.md` (rendered) at: **https://ferry.techcesories.com/privacy**
Must be public, no login, persistent. Paste this exact URL in each store's privacy field.

## Chrome Web Store — "Data collected" disclosures (check only what's true)

- ✅ **Website content** — *Yes, handled.* Used only to produce the export. **Not sold. Not transferred** except to provide the feature. Not used for purposes unrelated to the single purpose.
- ✅ **Personal communications** — same as above (AI conversations).
- ✅ **Authentication information** — *Pro only*: an anonymous install ID checked against Stripe via our Worker. Payment handled by Stripe. Not sold.
- ❌ Location, ❌ Web history, ❌ Personally identifiable info beyond payment email, ❌ Health, ❌ Financial info (card data never reaches us — Stripe holds it).

Certify: **not sold to third parties**; **not used for purposes unrelated to the single purpose**; **not used for creditworthiness/lending**. All true.

## Single purpose (state verbatim in listing)
> Ferry exports your ChatGPT and Claude conversations to clean Markdown files that you save to your device, clipboard, or Obsidian vault.

## Permission justifications (paste into the dashboard prompts)

- **host: chatgpt.com, chat.openai.com, claude.ai** — to read the conversation you choose to export, on those sites only. This is the core feature.
- **host: ferry-api.techcesories.workers.dev** — to check Pro subscription status (anonymous ID → Stripe). **host: api.notion.com / api.github.com** — only when you use those integrations.
- **storage** — to save your settings, and (Pro) to hold queued conversations locally, encrypted.
- **(no downloads permission needed — files save via standard browser download of an in-memory blob)**
- *(No `tabs`, `<all_urls>`, `webRequest`, or browsing-history permissions are requested.)*

## Limited Use statement (already in PRIVACY.md, must stay one click from homepage)
> Ferry's use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Seller / payments disclosure (Chrome requires)
- Clearly identify **Techcesories LLC**, not Google/Microsoft/Mozilla, as the seller.
- Post the refund policy (see TERMS.md): 30-day, no-questions-asked.
- State on the listing that core (single-chat) export is **free**; Pro features are paid.

## Edge Add-ons & Firefox AMO
Same privacy-policy URL and disclosures. Firefox AMO additionally reviews source; our code is unminified and unobfuscated (only vendored libraries are pre-built, which is permitted) — include this note and links to the upstream library versions if asked.

## Pre-submit checklist
- [ ] Privacy policy live at the URL above; dates accurate.
- [ ] Dashboard disclosures match the table above and the policy.
- [ ] `API_BASE` set in `src/background.js` + matching host_permission; Worker deployed; Stripe prices created; LLC Stripe connected.
- [ ] Screenshots + demo GIF; listing copy matches actual behavior (no keyword spam).
- [ ] 30-day refund policy posted; LLC named as seller.
- [ ] 2FA enabled on all publishing/payment/domain/email accounts.

---
*Prepared for Techcesories LLC. Not legal advice — have counsel confirm before launch.*
