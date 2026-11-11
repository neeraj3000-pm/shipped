import Link from "next/link";
import { listClients, listReleases } from "@/lib/store";
import { requireUser } from "@/lib/session";
import { CreatedBy, StatusBadge } from "@/components/StatusBadge";
import { relTime } from "@/lib/format";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { ArrowRight, CheckCircle2, Clock, FileText, Send, Sparkles } from "lucide-react";

const STATUSES: Status[] = ["draft", "in_review", "approved", "sent"];

const TILES: Record<Status, { label: string; hint: { manager: string; member: string }; Icon: typeof Clock; tone: string }> = {
  draft: { label: "Drafts", hint: { manager: "Waiting on the team", member: "Review and submit" }, Icon: FileText, tone: "text-muted bg-surface-2" },
  in_review: { label: "In review", hint: { manager: "Needs your approval", member: "With a manager" }, Icon: Clock, tone: "text-amber-300 bg-amber-400/10" },
  approved: { label: "Ready to send", hint: { manager: "Copy the email, mark sent", member: "Approved" }, Icon: CheckCircle2, tone: "text-emerald-300 bg-emerald-400/10" },
  sent: { label: "Sent", hint: { manager: "On client portals", member: "On client portals" }, Icon: Send, tone: "text-sky bg-ice-50" },
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
          <h1 className="display-xl text-4xl text-fg sm:text-5xl">Releases</h1>
          <p className="mt-2 text-muted">Drafts written by Claude, reviewed by your team, delivered to each client.</p>
        </div>
        <Link href="/settings/connect" className="btn btn-ghost"><Sparkles size={16} className="text-sky" /> Draft with Claude</Link>
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
              className={`animate-in lift card relative flex flex-col gap-3 !rounded-[24px] p-5 ${active ? "!border-sky ring-2 ring-sky/20" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${t.tone}`}><t.Icon size={18} /></span>
                {highlight && <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">Your turn</span>}
              </div>
              <div>
                <div className="display-xl text-4xl text-fg">{counts[s]}</div>
                <div className="text-sm font-semibold text-soft">{t.label}</div>
                <div className="text-xs text-muted">{t.hint[user.role]}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-muted">Client</span>
        <FilterPill href={href({ client: undefined })} active={!sp.client}>All</FilterPill>
        {clients.map((c) => (
          <FilterPill key={c.id} href={href({ client: c.id })} active={sp.client === c.id}>{c.name}</FilterPill>
        ))}
        {status && (
          <Link href={href({ status: undefined })} className="ml-auto text-sm font-semibold text-sky hover:underline">
            Showing {STATUS_LABEL[status].toLowerCase()} · clear
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        {releases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ice-50 text-sky"><Sparkles size={22} /></div>
            <p className="mt-4 text-lg font-bold text-fg">{all.length === 0 ? "No releases yet." : "Nothing here."}</p>
            <p className="mt-1 text-muted">
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
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wider text-faint">
                  <th className="px-5 py-3">Release</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created by</th>
                  <th className="px-5 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r, i) => (
                  <tr key={r.id} style={{ ["--i" as string]: i }} className="animate-in group relative border-b border-line transition-colors last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <Link href={`/releases/${r.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <span className="tag">v{r.version}</span>
                        <span className="font-semibold text-fg group-hover:text-sky">{r.title}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-soft">{r.clients?.name}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4"><CreatedBy by={r.created_by} /></td>
                    <td className="px-5 py-4 text-right text-sm text-muted">
                      <span className="group-hover:hidden">{relTime(r.updated_at)}</span>
                      <span className="hidden items-center justify-end gap-1 font-semibold text-sky group-hover:flex">Open <ArrowRight size={14} /></span>
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
                      <span className="text-sm font-semibold text-muted">{r.clients?.name} · v{r.version}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 font-semibold text-fg">{r.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
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
      className={`chip ${active ? "chip-active" : ""}`}>
      {children}
    </Link>
  );
}
