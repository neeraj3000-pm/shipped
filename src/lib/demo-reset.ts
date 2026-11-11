import "server-only";
import { admin } from "./supabase/admin";
import data from "./demo-data.json";

/**
 * Restores the public demo to a known state. Keeps the demo clients (and their portal
 * links) stable, removes anything visitors added, and re-creates the release history.
 */
export async function resetDemo() {
  const db = admin();
  const slugs = data.clients.map((c) => c.slug);

  // Remove visitor-created clients (cascades to their releases + activity).
  const { error: e1 } = await db.from("clients").delete().not("slug", "in", `(${slugs.join(",")})`);
  if (e1) throw new Error(e1.message);

  // Upsert demo clients by slug, so portal_token stays the same.
  const ids: Record<string, string> = {};
  for (const c of data.clients) {
    const { data: ex } = await db.from("clients").select("id").eq("slug", c.slug).maybeSingle();
    if (ex) {
      await db.from("clients").update({ name: c.name, contact_email: c.contact_email }).eq("id", ex.id);
      ids[c.slug] = ex.id;
    } else {
      const { data: row, error } = await db.from("clients").insert(c).select("id").single();
      if (error) throw new Error(error.message);
      ids[c.slug] = row.id;
    }
  }

  const { error: e2 } = await db.from("releases").delete().in("client_id", Object.values(ids));
  if (e2) throw new Error(e2.message);

  const day = 86400000;
  const at = (d: number | null) => (d === null ? null : new Date(Date.now() - d * day).toISOString());
  for (const r of data.releases) {
    const { data: row, error } = await db
      .from("releases")
      .insert({
        client_id: ids[r.client],
        version: r.version,
        title: r.title,
        summary: r.summary,
        status: r.status,
        items: r.items,
        created_by: r.created_by,
        approved_by: r.approved_by,
        approved_at: at(r.approved),
        sent_at: at(r.sent),
        created_at: at(r.created),
        updated_at: at(r.sent ?? r.approved ?? r.created),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await db.from("activity").insert(
      r.log.map(([d, actor, action]) => ({ release_id: row.id, actor, action, created_at: at(d as number) })),
    );
  }
  return { clients: data.clients.length, releases: data.releases.length };
}
