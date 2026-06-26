# Ferry — Distribution Playbook

Installs are the whole game. Revenue ≈ installs × conversion × fare (≈$3–$15), so this file is where the money actually comes from. Everything below is ready to post. Be a real participant in each community first; disclose you're the maker.

---

## A. Product Hunt (the launch spike)

**Name:** Ferry
**Tagline (60 char max):** Carry your ChatGPT & Claude chats to your knowledge base
**Topics:** Productivity, Developer Tools, Artificial Intelligence, Chrome Extensions

**Description:**
> Ferry exports your ChatGPT and Claude conversations to clean, re-importable Markdown — code blocks with the right language, tables, math and artifacts all intact. Every code block can be saved as a real file, and you can send a chat straight to Obsidian, Notion or GitHub. It runs entirely in your browser: no account, no servers, your conversations never leave your device. Free for single-chat export; from $2.99/mo (or $14.99/yr) for migration, bulk, artifacts and integrations.

**Maker's first comment:**
> Hey PH 👋 I'm the maker. I kept wanting to keep the *good* AI conversations — the ones with working code, a clean explanation, a table I'd want later — and every option was bad: copy-paste flattened my code blocks, ChatGPT's account export is an unreadable JSON dump, and web exporters wanted me to paste private chats into their server.
>
> So Ferry does the conversion locally and obsesses over fidelity: a `python` block stays a `python` block, tables stay tables, artifacts come out as real files. It reads both ChatGPT and Claude.
>
> Free tier is unlimited single-chat export. Pro (from $2.99, or $14.99/yr) adds one-click full-history migration, bulk → ZIP, artifact extraction, and Notion/GitHub sync. Would love feedback on what platform to add next — I'm torn between Gemini and Perplexity.

**Gallery (5 shots):** 1) hero/popup over a chat · 2) exported .md in Obsidian · 3) the artifacts/ folder of real files · 4) bulk queue · 5) the "local-first, no servers" settings line.

**Launch timing:** 12:01am PT, Tue–Thu. Line up 5–10 people to try it and comment honestly in the first 2 hrs.

---

## B. Show HN

**Title:** `Show HN: Ferry – export ChatGPT/Claude chats to Markdown, locally`

**Body:**
> I wanted to save individual AI conversations as clean Markdown and couldn't find anything that did it well without uploading the chat somewhere. Copy-paste destroys code fences and tables; ChatGPT's export is a whole-account JSON blob; the browser exporters I tried POST your conversation to their backend.
>
> Ferry is a browser extension (MV3) that converts the conversation in the current tab to Markdown entirely client-side. The interesting part was fidelity: detecting code-block languages from the rendered DOM (including reading the header label ChatGPT/Claude render above each block), reconstructing GFM tables, turning KaTeX back into `$…$`, and pulling artifacts/canvases out as separate correctly-typed files. It reads both ChatGPT and Claude, which have quite different DOMs (and which change often — calibrating selectors against the live DOM was most of the work).
>
> No account, no servers, no analytics; the only network calls are optional, user-initiated sends to Obsidian/Notion/GitHub with your own keys. Free for single-chat export; there's an inexpensive paid tier (from $2.99) for full-history migration and bulk, but the core is free.
>
> Happy to talk about the DOM-scraping and Markdown-conversion details — it was a fun rabbit hole.

*(HN hates marketing. Keep it technical and humble, reply to every comment, never call it "the best".)*

---

## C. Reddit (one sub at a time, spaced out, value-first)

Read each sub's self-promo rule first. Post as the maker, be honest, lead with the problem.

### r/ObsidianMD
**Title:** I built a free tool to get ChatGPT/Claude chats into Obsidian without wrecking the formatting
> Pasting AI chats into my vault kept flattening code blocks and tables, so I made a browser extension that exports a conversation as clean Markdown and drops it straight into the vault via `obsidian://` — with frontmatter (title/source/url) so it works with Dataview. Code fences keep their language, tables stay tables. Runs locally, nothing gets uploaded. Free for single chats. Curious what metadata you'd want in the frontmatter — happy to add fields people actually use.

### r/ClaudeAI
**Title:** Claude has no export — so I made one that keeps code, tables and artifacts
> Claude doesn't let you export a conversation, and copy-paste loses the structure. I built a free extension that turns a Claude chat into clean Markdown (or PDF, or straight to Obsidian/Notion). It captures the full back-and-forth and saves code blocks as real files. It's local — your conversation never leaves the browser. Would love bug reports; Claude's page structure changes a lot and I want to keep it solid.

### r/ChatGPT
**Title:** Export a single ChatGPT conversation to clean Markdown (free, local, keeps code + tables)
> ChatGPT's built-in export is a whole-account JSON dump. I wanted *one* conversation as a readable .md, so I made a free extension that does it client-side — code fences with language, tables, math all intact, plus copy-to-clipboard and PDF. Nothing gets sent to a server. Tell me which other site you'd want supported next.

*(Also good, later: r/Notion, r/PKM, r/datacurator, r/csMajors. Never blast them all the same day.)*

---

## D. The viral loop already in the product
Every free export ends with a footer: *"Exported with Ferry — your AI chats, in your knowledge base."* When people share exported notes/gists, that line markets us for free. Pro removes it (a fair reason to upgrade *and* a growth flywheel on the free tier). Keep the footer ON for free users.

## E. Programmatic SEO (compounding, free)
Live pages targeting real queries (in `site/`): `export-claude-to-obsidian`, `export-chatgpt-to-markdown`, `chatgpt-claude-to-notion`. Each is a genuine how-to (not thin), so it can rank and convert for months. Add more pairs as install data shows what people search.

## F. Launch sequence
1. Site + SEO pages live; extension approved on Edge + Firefox.
2. Soft-post r/ClaudeAI (most receptive) → fix anything that breaks.
3. A week later: Show HN (weekday morning ET).
4. Then Product Hunt (Tue–Thu) with the gallery + GIF.
5. Space out the other subreddits over following weeks.
6. Watch which SEO pages get impressions (Search Console) → write more of those.

## Honest expectation
Most extensions earn ~$0; this is a real grind, not a switch. The point of this playbook is to give the modest pie its best shot and to learn which channel actually moves installs — that learning is worth more than the first month's revenue.
