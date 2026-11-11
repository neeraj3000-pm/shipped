import Link from "next/link";
import { listClients, listReleases } from "@/lib/store";
import { requireUser } from "@/lib/session";
import { CreatedBy, StatusBadge } from "@/components/StatusBadge";
import { relTime } from "@/lib/format";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { ArrowRight, CheckCircle2, Clock, FileText, Send, Sparkles } from "lucide-react";

const STATUSES: Status[] = ["draft", "in_review", "approved", "sent"];

const TILES: Record<Status, { label: string; hint: { manager: string; member: string }; Icon: typeof Clock; tone: string }> = {
  draft: { label: "Drafts", hint: { manager: "Waiting on the team", member: "Review and submit" }, Icon: FileText, tone: "text-slate-600 bg-slate-100" },
  in_review: { label: "In review", hint: { manager: "Needs your approval", member: "With a manager" }, Icon: Clock, tone: "text-amber-700 bg-amber-50" },
  approved: { label: "Ready to send", hint: { manager: "Copy the email, mark sent", member: "Approved" }, Icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
  sent: { label: "Sent", hint: { manager: "On client portals", member: "On client portals" }, Icon: Send, tone: "text-brand bg-ice-50" },
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ client?: string; status?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : undefined;
  const [user, clients, all] = await Promise.all([requireUser(), listClients(), listReleases()]);
  const scoped = all.filter((r) => !sp.client || r.client_id === sp.client);
  const releases = scoped.filter((r) => !status || r.status === status);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, scoped.filter((r) => r.status === s).length])) as Record<Status, number>;
  const focus: Status = user.role === "manager" ? "in_review" : "draft";

  const href = (p: { client?: string; status?: string }) => {
    const q = new URLSearchParams();
    const c = "client" in p ? p.client : sp.client;
    const s = "status" in p ? p.status : status;
    if (c) q.set("client", c);
    if (s) q.set("status", s);
    const qs = q.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="headline text-3xl text-ink sm:text-4xl">Releases</h1>
          <p className="mt-2 text-slate-600">Drafts written by Claude, reviewed by your team, delivered to each client.</p>
        </div>
        <Link href="/settings/connect" className="btn btn-ghost"><Sparkles size={16} className="text-brand" /> Draft with Claude</Link>
      </div>

      {/* Summary tiles double as status filters */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUSES.map((s, i) => {
          const t = TILES[s];
          const active = status === s;
          const highlight = s === focus && counts[s] > 0;
          return (
            <Link
              key={s}
              href={href({ status: active ? undefined : s })}
              style={{ ["--i" as string]: i }}
              className={`animate-in lift card relative flex flex-col gap-3 p-4 ${active ? "!border-brand ring-2 ring-brand/15" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${t.tone}`}><t.Icon size={18} /></span>
                {highlight && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Your turn</span>}
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-navy">{counts[s]}</div>
                <div className="text-sm font-semibold text-slate-700">{t.label}</div>
                <div className="text-xs text-slate-500">{t.hint[user.role]}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-slate-500">Client</span>
        <FilterPill href={href({ client: undefined })} active={!sp.client}>All</FilterPill>
        {clients.map((c) => (
          <FilterPill key={c.id} href={href({ client: c.id })} active={sp.client === c.id}>{c.name}</FilterPill>
        ))}
        {status && (
          <Link href={href({ status: undefined })} className="ml-auto text-sm font-semibold text-brand hover:underline">
            Showing {STATUS_LABEL[status].toLowerCase()} · clear
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        {releases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ice-50 text-brand"><Sparkles size={22} /></div>
            <p className="mt-4 text-lg font-bold text-navy">{all.length === 0 ? "No releases yet." : "Nothing here."}</p>
            <p className="mt-1 text-slate-500">
              {all.length === 0 ? "Ask Claude to draft one. Paste your sprint tickets and say which clients they're for." : "No releases match these filters."}
            </p>
            <Link href={all.length === 0 ? "/settings/connect" : "/"} className="btn btn-primary mt-5">
              {all.length === 0 ? "How to connect Claude" : "Clear filters"}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Release</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created by</th>
                  <th className="px-5 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r, i) => (
                  <tr key={r.id} style={{ ["--i" as string]: i }} className="animate-in group relative border-b border-line transition-colors last:border-0 hover:bg-ice-50/60">
                    <td className="px-5 py-4">
                      <Link href={`/releases/${r.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <span className="rounded-md border border-ice bg-ice-50 px-2 py-0.5 text-sm font-bold text-brand">v{r.version}</span>
                        <span className="font-semibold text-ink group-hover:text-brand">{r.title}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{r.clients?.name}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4"><CreatedBy by={r.created_by} /></td>
                    <td className="px-5 py-4 text-right text-sm text-slate-500">
                      <span className="group-hover:hidden">{relTime(r.updated_at)}</span>
                      <span className="hidden items-center justify-end gap-1 font-semibold text-brand group-hover:flex">Open <ArrowRight size={14} /></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-line md:hidden">
              {releases.map((r, i) => (
                <li key={r.id} style={{ ["--i" as string]: i }} className="animate-in">
                  <Link href={`/releases/${r.id}`} className="block px-4 py-4 active:bg-ice-50">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-600">{r.clients?.name} · v{r.version}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 font-semibold text-ink">{r.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <CreatedBy by={r.created_by} />
                      <span>{relTime(r.updated_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${active ? "bg-navy text-white" : "border border-line bg-white text-slate-600 hover:border-slate-300 hover:text-navy"}`}>
      {children}
    </Link>
  );
}
