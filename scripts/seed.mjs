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
  const { error } = await sb.from("profiles").upsert({ id: user.id, name: u.name, role: u.role });
  if (error) throw error;
  console.log("user", u.email);
}

const CLIENTS = [
  { name: "StreamCo", slug: "streamco", contact_email: "product@streamco.example" },
  { name: "Nova TV", slug: "nova-tv", contact_email: "ops@novatv.example" },
  { name: "Atlas Sports", slug: "atlas-sports", contact_email: "digital@atlassports.example" },
];

async function main() {
  for (const u of USERS) await ensureUser(u);
  const ids = {};
  for (const c of CLIENTS) {
    const { data: ex } = await sb.from("clients").select("id").eq("slug", c.slug).maybeSingle();
    if (ex) ids[c.slug] = ex.id;
    else {
      const { data, error } = await sb.from("clients").insert(c).select("id").single();
      if (error) throw error;
      ids[c.slug] = data.id;
    }
  }
  await sb.from("releases").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const day = 86400000;
  const at = (d) => new Date(Date.now() - d * day).toISOString();

  const releases = [
    {
      client_id: ids["streamco"], version: "2.13", title: "Faster publishing and clearer QC", status: "sent",
      summary: "This release speeds up how your team publishes large catalogues and makes quality-check results easier to act on.",
      items: [
        { section: "new", text: "You can now schedule a batch of titles to publish at a set date and time, so premieres go live without anyone on standby.", ticket_id: "PLAT-388" },
        { section: "improved", text: "Large catalogue uploads now finish up to 40% faster.", ticket_id: "PLAT-392" },
        { section: "improved", text: "Quality-check reports now explain each failure in plain words and suggest the fix.", ticket_id: "PLAT-395" },
        { section: "fixed", text: "Thumbnails no longer appear blank for some titles after re-publishing.", ticket_id: "PLAT-401" },
      ],
      created_by: "Claude (MCP)", approved_by: "Priya (Manager)", approved_at: at(13), sent_at: at(12), created_at: at(14), updated_at: at(12),
      log: [[14, "Claude (MCP)", "Created draft"], [13.8, "Arjun (Team)", "Edited"], [13.7, "Arjun (Team)", "Submitted for review"], [13, "Priya (Manager)", "Approved"], [12, "Priya (Manager)", "Marked as sent to client"]],
    },
    {
      client_id: ids["streamco"], version: "2.12", title: "Smarter rights windows", status: "sent",
      summary: "Content now follows your licensing windows automatically, with fewer manual checks.",
      items: [
        { section: "new", text: "Titles are automatically hidden when their licence window ends, and shown again when it reopens.", ticket_id: "PLAT-351" },
        { section: "fixed", text: "Episode order is now correct in exported season feeds.", ticket_id: "PLAT-360" },
      ],
      created_by: "Arjun (Team)", approved_by: "Priya (Manager)", approved_at: at(27), sent_at: at(27), created_at: at(28), updated_at: at(27),
      log: [[28, "Arjun (Team)", "Created draft"], [27.5, "Arjun (Team)", "Submitted for review"], [27.2, "Priya (Manager)", "Approved"], [27, "Priya (Manager)", "Marked as sent to client"]],
    },
    {
      client_id: ids["nova-tv"], version: "2.13", title: "Better regional scheduling", status: "approved",
      summary: "Your regional channels now get more reliable schedules and quicker turnaround on metadata fixes.",
      items: [
        { section: "improved", text: "Regional programme schedules now update within 5 minutes of a change, down from 30.", ticket_id: "PLAT-390" },
        { section: "fixed", text: "Programme descriptions with special characters now display correctly on connected TVs.", ticket_id: "PLAT-398" },
        { section: "known_issue", text: "Very large schedule imports (over 2,000 rows) can take a few minutes; splitting the file speeds it up.", ticket_id: "PLAT-404" },
      ],
      created_by: "Claude (MCP)", approved_by: "Priya (Manager)", approved_at: at(11), sent_at: null, created_at: at(13), updated_at: at(11),
      log: [[13, "Claude (MCP)", "Created draft"], [12, "Arjun (Team)", "Submitted for review"], [11, "Priya (Manager)", "Approved"]],
    },
  ];

  for (const { log, ...r } of releases) {
    const { data, error } = await sb.from("releases").insert(r).select("id").single();
    if (error) throw error;
    await sb.from("activity").insert(log.map(([d, actor, action]) => ({ release_id: data.id, actor, action, created_at: at(d) })));
    console.log("release", r.version, r.status);
  }
  console.log("done");
}
main().catch((e) => { console.error(e); process.exit(1); });
