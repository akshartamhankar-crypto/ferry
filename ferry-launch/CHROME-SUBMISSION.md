# Ferry — Chrome Web Store Submission Pack

Chrome is the one paid store: **$5 one-time** developer registration (chrome.google.com/webstore/devconsole). Same `ferry-extension-v0.7.0.zip` uploads as-is — **no code change**. The work is the dashboard's **Privacy Practices** tab, which Edge/Firefox don't enforce as hard. Paste the answers below verbatim; they're written to match the actual manifest and to pre-empt the one thing a reviewer may question (the migration feature reading history).

## Listing basics
- **Name:** Ferry — Export ChatGPT & Claude to Markdown, Obsidian & Notion
- **Summary (≤132):** Export ChatGPT & Claude chats to clean Markdown, Obsidian, Notion & PDF. Migrate your whole history. Local-first.
- **Category:** Productivity
- **Language:** English
- **Description / keywords:** use `STORE-LISTING.md`.

## Single purpose (required, keep it narrow)
> Ferry exports and migrates a user's own ChatGPT and Claude conversations into clean Markdown files — and, at the user's choice, into their own Obsidian, Notion, or GitHub. All conversation content is processed locally in the browser and is never sent to the developer.

## Permission justifications (one per item — paste each)
- **storage** — "Stores the user's own preferences (export format, Obsidian vault name, optional Notion/GitHub tokens the user enters) and an anonymous license-check ID, locally on the device. No browsing data is stored."
- **Host: chatgpt.com, chat.openai.com, claude.ai** — "Ferry's core function reads the conversation in the user's current tab on these sites to convert it to Markdown. With Pro, it also reads the user's own conversation history via each site's existing logged-in session to export it. All reading and conversion happen locally in the browser; conversation content is never transmitted to the developer."
- **Host: ferry-api.techcesories.workers.dev** — "Our licensing endpoint. The extension sends only an anonymous, randomly generated install ID to check whether the user has active paid access. No conversation content or personal data is sent."
- **Host: api.notion.com, api.github.com** — "Used only when the user explicitly chooses to send a specific conversation to their own Notion or GitHub account, authenticated with a token the user provides and stores locally. Not contacted otherwise."

## Data usage disclosures (the checkboxes)
For "What user data does this item collect?" — Chrome defines *collect* as transmitting data off the device to you. Ferry transmits **no** user data to the developer, so:
- Personally identifiable information — **No**
- Health information — **No**
- Financial and payment information — **No** (payment is handled on Stripe's hosted checkout; the extension never sees card data)
- Authentication information — **No** (any Notion/GitHub token the user enters stays on the device and is sent only to that user's chosen service, never to us)
- Personal communications — **No** (conversations are processed locally and never sent to the developer)
- Location / Web history / User activity / Website content — **No**

Then check all three certifications (all true for Ferry):
- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ☑ I do not use or transfer user data for purposes unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

- **Privacy policy URL:** https://ferry.techcesories.com/privacy  (must be live before submitting)

## Assets (upload)
- **Icon:** 128×128 (in the package).
- **Screenshots:** 1–5 at **1280×800** (or 640×400). Use the shot list in `STORE-LISTING.md`; make shot #1 the migration panel mid-run ("Exporting 12/47…") — that's the differentiator.
- **Small promo tile (optional but recommended):** 440×280.
- Honest screenshots only — no claimed features that aren't in the build.

## Review-risk note (expect, don't fear)
The migration feature reads the user's full history, which a reviewer could misread as "collecting personal communications." It isn't — it's the user exporting **their own** data, processed locally, never sent to us. The single-purpose statement and host justifications above say this explicitly, which is what defuses it. If review sends a clarification request, reply with exactly that: user-initiated, local-only, no developer transmission. Plan for a few days to ~2 weeks and possibly one back-and-forth; Edge/Firefox (free, faster) will already be live and seeding reviews by then.
