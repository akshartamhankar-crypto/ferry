# Ferry — Privacy Policy

**Last updated: June 24, 2026** · Set this to your actual publish date before going live.
**Publisher:** Techcesories LLC (Georgia, USA) · **Product:** Ferry browser extension
**Contact:** privacy@techcesories.com

Ferry is a browser extension that exports your ChatGPT and Claude conversations to Markdown files you save yourself. This policy explains exactly what Ferry does and does not do with data. We wrote it to be true, not reassuring — under Georgia's Fair Business Practices Act and the FTC Act, a privacy claim that isn't accurate is itself a violation.

## The short version

- Ferry runs on your device. Your conversations are processed locally and **never touch our servers**.
- When you click **Export**, Ferry reads the conversation open in the current tab, converts it to Markdown, and hands the result to you (download, clipboard, or your Obsidian vault). **That content is never sent to us.**
- **Pro licensing:** to check whether you have an active subscription, Ferry sends an **anonymous install ID** (a random identifier — no name, no email) to our licensing service, which verifies it against Stripe. No conversation content is ever involved. Payment details go only to Stripe.
- **Bulk migration (Pro):** when you start a migration, Ferry uses your existing logged-in session to read your conversation list and conversations from ChatGPT's or Claude's own API, **in your browser**, converts them to Markdown locally, and packages them into a ZIP you download. This data is processed on your device and **never sent to us**. You choose which conversations to include.
- **Optional integrations:** if *you* configure Notion or GitHub with your own access token, Ferry sends the conversation you choose **directly from your browser to that service, using your credentials**, at your request. We never receive or relay it.
- We do **not** collect analytics, track your browsing, build profiles, serve ads, or sell data. We never will.

## What data Ferry handles, and why

Using Google's data-category vocabulary:

| Category | What | Where it goes | Why |
|---|---|---|---|
| **Website content / personal communications** | The text of the conversation you choose to export | Processed in memory on your device, only when you click Export. Written only to the destination you pick. **Not transmitted to us.** | To produce the Markdown export — the extension's single purpose |
| **User content stored locally** (Pro: bulk queue / auto-sync) | Conversations you queue or auto-archive | Stored on your device only, **encrypted at rest (AES-GCM-256)**. Not transmitted to us. | To let you batch-export or auto-archive |
| **Pro license status** | An anonymous install ID (random, no PII) | Sent to our licensing service (a Cloudflare Worker), which checks it against Stripe. No conversation content. | To unlock Pro features for paying users |
| **Payment** (Pro only) | Your payment details | Handled solely by **Stripe** (PCI-DSS) on Stripe's hosted checkout. We never see or store card data. | To take payment for Pro |
| **Settings** | Obsidian vault name, default format, footer preference, and any Notion/GitHub tokens you enter | Stored locally on your device. Tokens are used only to call those services at your request. | To remember your preferences and run integrations |

That is the complete list. Ferry requests only the permissions these features need: reading conversations on chatgpt.com / chat.openai.com / claude.ai, local storage, and contacting our licensing Worker (with an anonymous ID) for Pro status.

## Who we share with

Only **Stripe**, our payment processor, and only for Pro: Stripe handles checkout and holds payment data (we never see card details). Our own licensing service (a Cloudflare Worker) receives only the anonymous install ID to verify your status with Stripe — it stores nothing and never sees your conversations.

If you enable an integration, the conversation you choose is sent **by your browser, directly to the service you picked** — **Notion** (api.notion.com) or **GitHub** (api.github.com) — authenticated with a token *you* create and store locally in Ferry. This is a transfer you initiate, to your own account; we are not in the path and never receive the content or your tokens. We do not sell or "share" personal data for cross-context behavioral advertising.

## Security

Conversation content is processed locally and not transmitted to us, which removes the largest risk entirely — there is no central store of your chats to breach. Any conversation content Ferry persists locally (Pro queue/auto-sync) is encrypted at rest with AES-GCM-256. Communication with our payment processors occurs over HTTPS. The extension loads no remote code and includes a strict Content Security Policy. No system is perfectly secure, and we don't claim otherwise; see SECURITY.md for our threat model and how to report a vulnerability.

## Data retention and your choices

- Exported files live wherever you saved them — under your control, not ours.
- Locally stored Pro data stays until you clear it. You can delete all locally stored content at any time from the extension, or by removing the extension.
- For payment records, contact privacy@techcesories.com to access or delete data held by us as the seller (subject to records we must retain by law).

## Your rights (US state privacy laws)

We are a small business below the applicability thresholds of comprehensive state privacy statutes, including the **Georgia Consumer Privacy Protection Act** (effective July 1, 2026) and the California CCPA/CPRA. Even so, we honor the core rights those laws describe — to access, correct, delete, and opt out of any sale of personal data. Because we don't sell data and hold almost none, most requests resolve immediately. Email privacy@techcesories.com and we'll respond within 45 days.

## Children

Ferry is not directed to children under 13 and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will delete it.

## Limited Use disclosure (Chrome Web Store)

Ferry's use of information received from Chrome APIs adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use), including the Limited Use requirements. We use the data Ferry accesses only to provide the user-facing export feature; we do not transfer it except to provide that feature or as required by law, and we do not use it for advertising, profiling, or any purpose unrelated to the export feature.

## Changes

We'll update this page and its "last updated" date for any material change, and describe what changed.

---
*This document is a carefully researched, compliance-by-design draft prepared for Techcesories LLC. It is not legal advice. Have counsel review it before launch and whenever features change.*
