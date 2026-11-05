import Link from "next/link";
import { listClients, listReleases } from "@/lib/store";
import { CreatedBy, StatusBadge } from "@/components/StatusBadge";
import { relTime } from "@/lib/format";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { Sparkles } from "lucide-react";

const STATUSES: Status[] = ["draft", "in_review", "approved", "sent"];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ client?: string; status?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : undefined;
  const [clients, all] = await Promise.all([listClients(), listReleases()]);
  const releases = all.filter((r) => (!sp.client || r.client_id === sp.client) && (!status || r.status === status));
  const counts = Object.fromEntries(STATUSES.map((s) => [s, all.filter((r) => r.status === s && (!sp.client || r.client_id === sp.client)).length]));

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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="headline text-4xl text-ink">Releases</h1>
          <p className="mt-2 text-slate-600">Drafts written by Claude, reviewed by your team, delivered to each client.</p>
        </div>
        <Link href="/settings/connect" className="btn btn-ghost"><Sparkles size={16} className="text-brand" /> Draft with Claude</Link>
      </div>

      {/* Status filter as tabs with counts */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill href={href({ status: undefined })} active={!status}>All <Count n={Object.values(counts).reduce((a, b) => a + b, 0)} /></FilterPill>
        {STATUSES.map((s) => (
          <FilterPill key={s} href={href({ status: s })} active={status === s}>
            {STATUS_LABEL[s]} <Count n={counts[s]} />
          </FilterPill>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Client</span>
          <FilterPill href={href({ client: undefined })} active={!sp.client}>All</FilterPill>
          {clients.map((c) => (
            <FilterPill key={c.id} href={href({ client: c.id })} active={sp.client === c.id}>{c.name}</FilterPill>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {releases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-bold text-navy">No releases yet.</p>
            <p className="mt-1 text-slate-500">Ask Claude to draft one. Paste your sprint tickets and say which clients they&apos;re for.</p>
            <Link href="/settings/connect" className="btn btn-primary mt-5">How to connect Claude</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
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
                {releases.map((r) => (
                  <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-ice-50/50">
                    <td className="px-5 py-4">
                      <Link href={`/releases/${r.id}`} className="flex items-center gap-3">
                        <span className="rounded-md border border-ice bg-ice-50 px-2 py-0.5 text-sm font-bold text-brand">v{r.version}</span>
                        <span className="font-semibold text-ink group-hover:text-brand">{r.title}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{r.clients?.name}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4"><CreatedBy by={r.created_by} /></td>
                    <td className="px-5 py-4 text-right text-sm text-slate-500">{relTime(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-navy text-white" : "border border-line bg-white text-slate-600 hover:text-navy"}`}>
      {children}
    </Link>
  );
}
function Count({ n }: { n: number }) {
  return <span className="text-xs opacity-60">{n}</span>;
}
