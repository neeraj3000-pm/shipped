import "server-only";
import { admin } from "./supabase/admin";
import { slugify } from "./format";
import type { Activity, Client, Item, Release, Status } from "./types";

const db = () => admin();

export async function listClients(): Promise<Client[]> {
  const { data, error } = await db().from("clients").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Client[];
}

export async function addClient(name: string, contact_email?: string | null): Promise<Client> {
  const base = slugify(name);
  let slug = base;
  for (let n = 2; ; n++) {
    const { data } = await db().from("clients").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${n}`;
  }
  const { data, error } = await db()
    .from("clients")
    .insert({ name: name.trim(), slug, contact_email: contact_email || null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Accepts id, slug or name (case-insensitive). Creates the client if missing and create=true. */
export async function resolveClient(ref: string, create = false): Promise<{ client: Client | null; created: boolean }> {
  const r = ref.trim();
  if (UUID.test(r)) {
    const { data } = await db().from("clients").select("*").eq("id", r).maybeSingle();
    if (data) return { client: data as Client, created: false };
  }
  const all = await listClients();
  const hit =
    all.find((c) => c.name.toLowerCase() === r.toLowerCase()) ||
    all.find((c) => c.slug === slugify(r));
  if (hit) return { client: hit, created: false };
  if (!create) return { client: null, created: false };
  return { client: await addClient(r), created: true };
}

export async function logActivity(release_id: string, actor: string, action: string) {
  await db().from("activity").insert({ release_id, actor, action });
}

export function cleanItems(items: Item[]): Item[] {
  return items
    .map((i) => ({
      section: (["new", "improved", "fixed", "known_issue"].includes(i.section) ? i.section : "improved") as Item["section"],
      text: (i.text || "").trim(),
      ticket_id: i.ticket_id ? String(i.ticket_id).trim() || null : null,
    }))
    .filter((i) => i.text);
}

export async function createRelease(input: {
  client_id: string;
  version: string;
  title: string;
  summary: string;
  items: Item[];
  actor: string;
}): Promise<Release> {
  const { data, error } = await db()
    .from("releases")
    .insert({
      client_id: input.client_id,
      version: input.version.trim(),
      title: input.title.trim(),
      summary: input.summary.trim(),
      items: cleanItems(input.items),
      status: "draft",
      created_by: input.actor,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await logActivity(data.id, input.actor, "Created draft");
  return data as Release;
}

const SELECT = "*, clients(id,name,slug,contact_email,portal_token)";

export async function listReleases(f: { client_id?: string; status?: Status; limit?: number } = {}): Promise<Release[]> {
  let q = db().from("releases").select(SELECT).order("updated_at", { ascending: false }).limit(f.limit ?? 200);
  if (f.client_id) q = q.eq("client_id", f.client_id);
  if (f.status) q = q.eq("status", f.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as Release[];
}

export async function getRelease(id: string): Promise<Release | null> {
  if (!UUID.test(id)) return null;
  const { data } = await db().from("releases").select(SELECT).eq("id", id).maybeSingle();
  return (data as Release) ?? null;
}

export async function getActivity(release_id: string): Promise<Activity[]> {
  const { data } = await db().from("activity").select("*").eq("release_id", release_id).order("created_at", { ascending: false });
  return (data as Activity[]) ?? [];
}

/**
 * Content edit. Approved releases go back to in_review (protects approval).
 * Sent releases are locked.
 */
export async function updateContent(
  id: string,
  fields: Partial<Pick<Release, "title" | "summary" | "version" | "items">>,
  actor: string,
): Promise<{ release: Release; reopened: boolean }> {
  const cur = await getRelease(id);
  if (!cur) throw new Error("Release not found");
  if (cur.status === "sent") throw new Error("This release was already sent to the client and is locked.");
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.title !== undefined) patch.title = fields.title.trim();
  if (fields.summary !== undefined) patch.summary = fields.summary.trim();
  if (fields.version !== undefined) patch.version = fields.version.trim();
  if (fields.items !== undefined) patch.items = cleanItems(fields.items);
  const reopened = cur.status === "approved";
  if (reopened) Object.assign(patch, { status: "in_review", approved_by: null, approved_at: null });
  const { data, error } = await db().from("releases").update(patch).eq("id", id).select(SELECT).single();
  if (error) throw new Error(error.message);
  await logActivity(id, actor, reopened ? "Edited after approval – sent back to review" : "Edited");
  return { release: data as Release, reopened };
}

export async function setStatus(id: string, status: Status, actor: string, extra: Record<string, unknown> = {}) {
  const { error } = await db()
    .from("releases")
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function portalData(token: string) {
  const { data: client } = await db().from("clients").select("*").eq("portal_token", token).maybeSingle();
  if (!client) return null;
  const { data: releases } = await db()
    .from("releases")
    .select("*")
    .eq("client_id", client.id)
    .in("status", ["approved", "sent"])
    .order("created_at", { ascending: false });
  return { client: client as Client, releases: (releases as Release[]) ?? [] };
}
