# Shipped

**Client-ready release notes for B2B teams.** Claude writes them; Shipped routes them through approval, keeps a history per client, and gives every client a private release-notes page.

> **Shipped contains no AI.** All writing is done by the customer's own Claude via MCP. There are no AI SDKs or AI keys in this app.

## How it works
1. In Claude, paste sprint tickets and ask for release notes for specific clients.
2. Claude filters tickets per client, rewrites them in plain language, and calls `create_release_draft` once per client.
3. Drafts appear in Shipped as **Draft** → a team member edits and **submits for review** → a manager **approves** (only managers can).
4. The approved release is **copied as an email**, **marked as sent**, and shown on the client's private **portal** link.

Status flow: `draft → in_review → approved → sent`. Editing an approved release clears the approval and sends it back to review. Sent releases are locked.

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Manager (can approve) | manager@shipped.demo | Shipped@2026 |
| Team member (can't approve) | member@shipped.demo | Shipped@2026 |

## Connect Claude (MCP)
Connector URL: `https://<app>/api/mcp/<MCP_WORKSPACE_TOKEN>` (shown on **Connect Claude** in the app).

1. claude.ai → Settings → Connectors → **Add custom connector**
2. Name it "Shipped", paste the connector URL
3. In a new chat, enable Shipped in the tools menu
4. Paste the prompt and tickets below

### MCP tools
| Tool | What it does |
|---|---|
| `list_clients()` | id, name, slug of each client |
| `add_client(name, contact_email?)` | create a client |
| `create_release_draft(client, version, title, summary, items[])` | new **draft** (client matched by name case-insensitively, created if missing); returns the app link |
| `list_releases(client?, status?)` | recent releases |
| `get_release(id)` | full release |
| `update_release(id, …)` | edit title/summary/version/items. **Cannot approve or send.** |

## Demo prompt
> Here are this sprint's tickets. Draft client-facing release notes v2.14 for StreamCo and Nova TV in Shipped. Only include what affects each client, skip internal-only tickets, and write for a non-technical client audience.

```
PLAT-412  Added 4K HDR (Dolby Vision) delivery profile for StreamCo publishing workflow
PLAT-418  Fixed subtitle sync drift >200ms on long-form assets (all clients)
PLAT-421  QC dashboard now flags assets stuck >2h in compliance review (all clients)
PLAT-425  Nova TV: regional language metadata (Kannada, Tamil) now exported in XML feed
PLAT-427  Refactored S3 multipart upload retry logic (internal, no client impact)
PLAT-430  Known issue: bulk publish >500 assets may time out; workaround = batches of 200
PLAT-433  Atlas Sports: live-to-VOD clip turnaround reduced from 30 to 12 minutes
PLAT-436  Upgraded Postgres minor version (internal)
```
Expected: StreamCo gets 412, 418, 421, 430; Nova TV gets 418, 421, 425, 430; 427 and 436 are skipped.

## Stack
Next.js 15 (App Router, TypeScript, Tailwind) on Vercel · Supabase (Postgres + Auth) · `mcp-handler` (Streamable HTTP).

All data access is server-side with the service role after checking the logged-in user; RLS is enabled with no public policies. Role checks (manager vs member) are enforced in server actions, not just hidden in the UI.

## Setup
1. Create a Supabase project, run `supabase/schema.sql` in the SQL editor.
2. Copy env vars into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MCP_WORKSPACE_TOKEN` (random string), `NEXT_PUBLIC_APP_URL`.
3. `npm install && node --env-file=.env.local scripts/seed.mjs && npm run dev`

## Roadmap (not in v1)
Jira/Linear sync · automatic email delivery · multiple workspaces & sign-up · OAuth for the connector · themes · in-app "what's new" widget.
