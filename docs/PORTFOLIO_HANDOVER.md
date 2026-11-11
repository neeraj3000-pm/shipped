# Handover: add Shipped to Neeraj's portfolio

**For:** the Claude Code session that maintains and deploys Neeraj's portfolio (https://neeraj-portfolio-orcin.vercel.app/).
**Goal:** add **Shipped** as a second side project in the **Projects** section, next to **SyncUp**, using the same card layout and the same two buttons ("Try …" and "Read the build story").

Shipped is already live and ready for recruiters. Nothing in the Shipped repo needs to change for this. You only edit the portfolio repo.

---

## 1. What Shipped is (context for you)

Shipped turns a sprint's tickets into client-ready release notes, one version per client. The customer's own Claude writes them through an MCP connector. The team edits and approves them in the web app, and each client gets a private, read-only page with their release history. **There's no AI inside the app.**

Neeraj built it himself: he wrote the PRD, designed the approval rules and the MCP tool contract, and built it with Claude Code. The stack is Next.js 15, TypeScript, Tailwind, Supabase (Postgres + Auth), MCP over Streamable HTTP, and Vercel.

| What | URL |
|---|---|
| Live app (one-click demo login) | https://shipped-release-notes.vercel.app/login |
| Build story (the recruiter-facing page, like SyncUp's `/about`) | https://shipped-release-notes.vercel.app/about |
| Code | https://github.com/neeraj3000-pm/shipped |

How a recruiter uses it:
- On `/login`, they click **Continue as Manager** or **Continue as Team member**. No sign-up or password needed.
- They can switch roles from the top-right menu.
- Demo data resets every night.

For visitors who came from the portfolio, the `/about` page shows a "← Portfolio" button that links to `https://neeraj-portfolio-orcin.vercel.app/#projects`. **If the projects anchor isn't `#projects`, tell Neeraj** so the Shipped side can be updated (it's `PORTFOLIO_URL` in `src/lib/demo.ts` of the Shipped repo).

---

## 2. What to build

1. **Find the existing SyncUp project card** in the portfolio source (search for "SyncUp", "Try SyncUp" or "Read the build story"). Reuse the same component or markup for Shipped. Don't invent a new layout.
2. **Add a Shipped card directly after SyncUp**, in the same Projects / "Side Projects" section.
3. The heading currently says "Something I shipped, not just scoped." (singular). With two projects it still reads fine; optionally change it to **"Things I shipped, not just scoped."**. Ask Neeraj if unsure.
4. If the projects section has a nav or anchor count, or any "1 project" wording, update it.
5. Match the SyncUp card exactly for spacing, tags, stat chips, stack chips and the two buttons. Both links open the Shipped site (same tab or new tab, whichever SyncUp does).

### Card content (use exactly, in SyncUp's structure)

**Banner image:** download it and commit it into the portfolio repo next to SyncUp's banner. Don't hotlink.
- Main banner (dark, matches the site), 2880×1120 at 2x: https://shipped-release-notes.vercel.app/portfolio/shipped-banner.png
- Alternatives if the layout needs another crop:
  - https://shipped-release-notes.vercel.app/portfolio/shipped-portal.png (client portal, the most distinctive screen, 2x)
  - https://shipped-release-notes.vercel.app/portfolio/shipped-dashboard.png (app dashboard, 2x)
  - https://shipped-release-notes.vercel.app/portfolio/shipped-og.png (1200×630, simple branded card)
- **Alt text:** "Shipped: Claude drafts release notes for each client; Shipped routes them through approval."
- **Visual note:** Shipped now uses a dark, atmospheric style (deep navy-black, sky-blue glow `#60C1E5`, wide Unbounded display type). If SyncUp's card banner sits on a dark background, Shipped's will match naturally. Keep the card body itself in the portfolio's own style, as for SyncUp.

**Eyebrow tag:** `LIVE PRODUCT · PRD TO PRODUCTION, SOLO`

**Title:** `Shipped`

**Description:**
> Every sprint I turn Jira tickets into release notes for each of our broadcast clients, and my manager reviews them before they go out. Shipped is the tool I wished I had: your own Claude drafts one version per client through an MCP connector, your team edits and approves it, and every client gets a private link with their full release history. There's no AI inside the app. The customer's Claude does the writing, and Shipped makes it safe to send.

**Bullets (4):**
- Authored the PRD and directed AI-paired engineering (Claude Code) solo, end to end
- Designed a 6-tool MCP contract where Claude can draft and revise but never approve; sign-off stays a human action
- Built a role-based approval flow (Draft → In review → Approved → Sent) where any edit after approval re-opens review
- Chose a "no AI inside" model: the customer's own Claude pays for the writing, so running costs are just hosting and a database

**Stat chips** (SyncUp style, the number highlighted):
- `6` MCP tools for Claude
- `0` AI SDKs inside
- `1` private link per client

**Stack chips:** `Next.js` · `TypeScript` · `Supabase` · `MCP` · `Tailwind` · `Vercel`

**Buttons:**
- Primary: **Try Shipped →** https://shipped-release-notes.vercel.app/login?ref=portfolio
- Secondary: **Read the build story** https://shipped-release-notes.vercel.app/about?ref=portfolio

**Keep `?ref=portfolio` on both links.** Shipped only shows its "← Portfolio" buttons to visitors who arrive from the portfolio (it also checks the referrer, but the tag is the reliable signal). Everyone else sees no portfolio button.

---

## 3. Optional extras (ask Neeraj first)

- **Achievements section:** a possible new entry, e.g. "🧾 Shipped (2026): built a Claude-powered release-notes product with an MCP connector and a human approval flow". Only add it if Neeraj wants it.
- **Hero copy:** the intro mentions "AI-driven products"; it fits as-is.

## 4. Things not to do

- Don't claim user numbers, revenue or customers for Shipped. It's a live demo product, not a company with customers.
- Don't mention any company the app was built for or as an assignment.
- Don't hotlink Shipped images into the portfolio; commit copies.
- Don't change anything in the Shipped repo from the portfolio session.

## 5. Done when

- [ ] The Shipped card appears after SyncUp, and on desktop and mobile it looks consistent with the SyncUp card.
- [ ] "Try Shipped" opens `/login` with the two one-click demo buttons.
- [ ] "Read the build story" opens `/about?ref=portfolio`, a "← Portfolio" button appears, and it comes back to the projects section. Opening `/about` directly in a private window shows no portfolio button.
- [ ] No horizontal scroll at 390px width. Images have alt text.
- [ ] The portfolio is deployed, and Neeraj has checked it in a private window.
