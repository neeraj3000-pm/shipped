import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { appUrl } from "@/lib/format";
import { CLAUDE_ACTOR, type Release } from "@/lib/types";
import { addClient, createRelease, getRelease, listClients, listReleases, resolveClient, updateContent } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ItemSchema = z.object({
  section: z.enum(["new", "improved", "fixed", "known_issue"]).describe("new = brand-new capability; improved = existing feature got better; fixed = bug fix; known_issue = a problem the client should know about, ideally with a workaround"),
  text: z.string().min(1).describe("One plain-language sentence for a non-technical client. Describe the business benefit, not the implementation."),
  ticket_id: z.string().optional().describe("The source ticket ID, e.g. PLAT-412. Always keep it so every line traces back to a ticket."),
});

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const json = (o: unknown) => text(JSON.stringify(o, null, 2));
const link = (id: string) => `${appUrl()}/releases/${id}`;

function brief(r: Release) {
  return { id: r.id, client: r.clients?.name, version: r.version, title: r.title, status: r.status, created_by: r.created_by, updated_at: r.updated_at, url: link(r.id) };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_clients",
      {
        title: "List clients",
        description: "List the clients in this Shipped workspace (id, name, slug). Call this first when drafting release notes so you use the exact client names.",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
      },
      async () => {
        const cs = await listClients();
        return json(cs.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
      },
    );

    server.registerTool(
      "add_client",
      {
        title: "Add client",
        description: "Create a new client in Shipped. Only needed for a client that list_clients does not return. create_release_draft also creates missing clients automatically.",
        inputSchema: z.object({ name: z.string().min(1), contact_email: z.string().optional() }),
      },
      async ({ name, contact_email }) => {
        const existing = await resolveClient(name);
        if (existing.client) return text(`Client "${existing.client.name}" already exists (id ${existing.client.id}).`);
        const c = await addClient(name, contact_email);
        return json({ id: c.id, name: c.name, slug: c.slug });
      },
    );

    server.registerTool(
      "create_release_draft",
      {
        title: "Create release notes draft",
        description: [
          "Save client-facing release notes to Shipped as a DRAFT for human review.",
          "Use this after drafting release notes from sprint tickets. Create ONE draft per client: call this tool once for each client.",
          "For each client, include only the tickets that affect that client (tickets marked 'all clients' go to every client); leave out internal-only work such as refactors, infra upgrades and anything marked 'no client impact'.",
          "Write in plain business language for a non-technical client: say what changed and why it matters to them, with no jargon or internal system names.",
          "Group items into new, improved, fixed and known_issue (known issues should include the workaround). Keep the ticket ID on every item.",
          "The draft cannot be approved or sent by you. A person on the team reviews and approves it in the Shipped app.",
          "Returns the draft's link. Tell the user 'Draft created: <link>' for each client.",
        ].join(" "),
        inputSchema: z.object({
          client: z.string().min(1).describe("Client name (case-insensitive) or client id. A new client is created if no match exists."),
          version: z.string().min(1).describe("Release version, e.g. 2.14"),
          title: z.string().min(1).describe("Short client-friendly headline for this release, e.g. 'Sharper video and smoother subtitles'"),
          summary: z.string().describe("One or two sentences summarising what this release means for this client"),
          items: z.array(ItemSchema).min(1),
        }),
      },
      async ({ client, version, title, summary, items }) => {
        const { client: c, created } = await resolveClient(client, true);
        if (!c) throw new Error("Could not resolve client");
        const r = await createRelease({ client_id: c.id, version: version.replace(/^v/i, ""), title, summary, items, actor: CLAUDE_ACTOR });
        return text(
          `Draft created for ${c.name}${created ? " (new client added)" : ""}: ${link(r.id)}\n` +
            `Status: draft, ${r.items.length} items. A team member must review and a manager must approve it in Shipped before it reaches ${c.name}.`,
        );
      },
    );

    server.registerTool(
      "list_releases",
      {
        title: "List releases",
        description: "List recent releases in Shipped, newest first. Optionally filter by client (name or id) and status (draft, in_review, approved, sent). Use it to see what a client has already been told.",
        inputSchema: z.object({
          client: z.string().optional(),
          status: z.enum(["draft", "in_review", "approved", "sent"]).optional(),
        }),
        annotations: { readOnlyHint: true },
      },
      async ({ client, status }) => {
        let client_id: string | undefined;
        if (client) {
          const { client: c } = await resolveClient(client);
          if (!c) return text(`No client named "${client}".`);
          client_id = c.id;
        }
        const rs = await listReleases({ client_id, status, limit: 50 });
        return json(rs.map(brief));
      },
    );

    server.registerTool(
      "get_release",
      {
        title: "Get release",
        description: "Get the full content of one release (title, summary, items with sections and ticket IDs, status, approval info).",
        inputSchema: z.object({ id: z.string() }),
        annotations: { readOnlyHint: true },
      },
      async ({ id }) => {
        const r = await getRelease(id);
        if (!r) return text("Release not found.");
        return json({ ...brief(r), summary: r.summary, items: r.items, approved_by: r.approved_by, approved_at: r.approved_at, sent_at: r.sent_at });
      },
    );

    server.registerTool(
      "update_release",
      {
        title: "Update release",
        description:
          "Revise an existing release's version, title, summary or items (items replaces the whole list). This tool CANNOT approve, submit or send a release: approval is always a human action in the Shipped app. Editing an approved release clears its approval and sends it back to review. Releases already sent to the client are locked.",
        inputSchema: z.object({
          id: z.string(),
          version: z.string().optional(),
          title: z.string().optional(),
          summary: z.string().optional(),
          items: z.array(ItemSchema).optional(),
        }),
      },
      async ({ id, ...fields }) => {
        try {
          const { release, reopened } = await updateContent(id, fields, CLAUDE_ACTOR);
          return text(`Updated: ${link(release.id)}${reopened ? "\nIt was approved, so it has been sent back to review." : ""}`);
        } catch (e) {
          return { ...text((e as Error).message), isError: true };
        }
      },
    );
  },
  { serverInfo: { name: "shipped", version: "1.0.0" } },
);

async function guarded(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const expected = process.env.MCP_WORKSPACE_TOKEN;
  if (!expected || token !== expected) {
    return new Response(JSON.stringify({ error: "Invalid connector link" }), { status: 404, headers: { "content-type": "application/json" } });
  }
  return handler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
