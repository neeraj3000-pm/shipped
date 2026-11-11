// Seed Shipped demo data. Run: node --env-file=.env.local scripts/seed.mjs
// Idempotent for users/clients; resets releases + activity.
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const PASSWORD = "Shipped@2026";
const USERS = [
  { email: "manager@shipped.demo", name: "Priya (Manager)", role: "manager" },
  { email: "member@shipped.demo", name: "Arjun (Team)", role: "member" },
];

async function ensureUser(u) {
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  let user = list.users.find((x) => x.email === u.email);
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({ email: u.email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    user = data.user;
  } else {
    await sb.auth.admin.updateUserById(user.id, { password: PASSWORD, email_confirm: true });
  }
  await sb.auth.admin.updateUserById(user.id, { app_metadata: { name: u.name, role: u.role } });
  const { error } = await sb.from("profiles").upsert({ id: user.id, name: u.name, role: u.role });
  if (error) throw error;
  console.log("user", u.email);
}

// Demo clients and releases live in src/lib/demo-data.json (shared with the in-app reset).
import { readFileSync } from "node:fs";
const DATA = JSON.parse(readFileSync(new URL("../src/lib/demo-data.json", import.meta.url), "utf8"));

async function main() {
  for (const u of USERS) await ensureUser(u);
  const slugs = DATA.clients.map((c) => c.slug);
  await sb.from("clients").delete().not("slug", "in", `(${slugs.join(",")})`);
  const ids = {};
  for (const c of DATA.clients) {
    const { data: ex } = await sb.from("clients").select("id").eq("slug", c.slug).maybeSingle();
    if (ex) ids[c.slug] = ex.id;
    else {
      const { data, error } = await sb.from("clients").insert(c).select("id").single();
      if (error) throw error;
      ids[c.slug] = data.id;
    }
  }
  await sb.from("releases").delete().in("client_id", Object.values(ids));
  const at = (d) => (d === null ? null : new Date(Date.now() - d * 86400000).toISOString());
  for (const r of DATA.releases) {
    const { data, error } = await sb.from("releases").insert({
      client_id: ids[r.client], version: r.version, title: r.title, summary: r.summary, status: r.status, items: r.items,
      created_by: r.created_by, approved_by: r.approved_by, approved_at: at(r.approved), sent_at: at(r.sent),
      created_at: at(r.created), updated_at: at(r.sent ?? r.approved ?? r.created),
    }).select("id").single();
    if (error) throw error;
    await sb.from("activity").insert(r.log.map(([d, actor, action]) => ({ release_id: data.id, actor, action, created_at: at(d) })));
    console.log("release", r.client, r.version, r.status);
  }
  console.log("done");
}
main().catch((e) => { console.error(e); process.exit(1); });
