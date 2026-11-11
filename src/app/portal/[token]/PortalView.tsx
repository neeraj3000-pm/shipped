"use client";
import { useMemo, useState } from "react";
import { Check, Link2, Search, ShieldCheck } from "lucide-react";
import { SECTIONS, type Item, type Section } from "@/lib/types";

type R = { id: string; version: string; title: string; summary: string; items: Item[]; date: string; approved_by: string | null };

const LABEL: Record<Section, { text: string; color: string }> = {
  new: { text: "New", color: "text-sky" },
  improved: { text: "Improved", color: "text-ice" },
  fixed: { text: "Fixed", color: "text-emerald-300" },
  known_issue: { text: "Known issue", color: "text-amber-300" },
};

const monthKey = (iso: string) => new Date(iso).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" }).replace(/\//g, ".");
const anchor = (v: string) => `v${v.replace(/[^a-z0-9]+/gi, "-")}`;

export function PortalView({ releases, clientName }: { releases: R[]; clientName: string }) {
  const [filter, setFilter] = useState<Section | "all">("all");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return releases
      .map((r) => ({
        ...r,
        items: r.items.filter(
          (i) =>
            (filter === "all" || i.section === filter) &&
            (!needle || i.text.toLowerCase().includes(needle) || (i.ticket_id ?? "").toLowerCase().includes(needle) || r.title.toLowerCase().includes(needle)),
        ),
      }))
      .filter((r) => r.items.length > 0);
  }, [releases, filter, q]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof visible>();
    for (const r of visible) { const k = monthKey(r.date); m.set(k, [...(m.get(k) ?? []), r]); }
    return [...m.entries()];
  }, [visible]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const r of releases) for (const i of r.items) { c[i.section] = (c[i.section] ?? 0) + 1; c.all++; }
    return c;
  }, [releases]);

  const copy = async (r: R) => {
    const url = `${window.location.origin}${window.location.pathname}#${anchor(r.version)}`;
    await navigator.clipboard.writeText(url);
    setCopied(r.id);
    setTimeout(() => setCopied(null), 1600);
  };

  if (releases.length === 0)
    return (
      <div className="card mx-auto mt-14 max-w-xl p-12 text-center">
        <p className="headline text-2xl text-fg">Nothing published yet</p>
        <p className="mt-2 text-muted">Approved release notes for {clientName} will appear here.</p>
      </div>
    );

  return (
    <>
      {/* Search + filters */}
      <div className="mx-auto mt-12 max-w-4xl">
        <label className="relative block">
          <span className="sr-only">Search release notes</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search updates or ticket IDs" className="field !rounded-[28px] !py-5 !pl-6 !pr-14 text-lg" />
          <Search size={20} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-muted" />
        </label>
        <div className="mt-5 flex flex-wrap justify-center gap-2" role="toolbar" aria-label="Filter by type">
          {(["all", ...SECTIONS.map((s) => s.key).filter((k) => counts[k])] as const).map((k) => {
            const active = filter === k;
            const label = k === "all" ? "All changes" : LABEL[k].text === "Known issue" ? "Known issues" : LABEL[k].text;
            return (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={active} className={`chip ${active ? "chip-active" : ""}`}>
                {label}
                {active ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-pill/80 text-fg"><Check size={12} strokeWidth={3} /></span>
                ) : (
                  <span className="text-xs text-faint">{counts[k] ?? 0}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-16 space-y-16">
        {groups.length === 0 && <p className="text-center text-muted">No updates match that search.</p>}
        {groups.map(([month, rs]) => (
          <section key={month} className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="accent-bar headline text-2xl text-fg sm:text-3xl">
                {month.split(" ")[0]}<br className="hidden lg:block" /> <span className="text-muted">{month.split(" ")[1]}</span>
              </h2>
            </div>
            <div className="space-y-4">
              {rs.map((r, idx) => (
                <article key={r.id} id={anchor(r.version)} style={{ ["--i" as string]: idx }}
                  className="animate-in scroll-mt-28 rounded-[32px] bg-surface p-6 ring-1 ring-white/[0.05] sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="tag">v{r.version}</span>
                    <span className="text-sm text-muted">{day(r.date)}</span>
                    <button onClick={() => copy(r)} aria-label="Copy link to this release" title="Copy link"
                      className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-soft transition-colors hover:bg-elev hover:text-fg">
                      {copied === r.id ? <Check size={16} className="text-emerald-300" /> : <Link2 size={16} />}
                    </button>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-fg sm:text-[1.7rem]">{r.title}</h3>
                  {r.summary && filter === "all" && !q && <p className="mt-2 leading-relaxed text-muted">{r.summary}</p>}
                  <div className="mt-6 space-y-5">
                    {SECTIONS.map((s) => {
                      const items = r.items.filter((i) => i.section === s.key);
                      if (!items.length) return null;
                      return (
                        <div key={s.key} className="grid gap-2 sm:grid-cols-[110px_1fr] sm:gap-4">
                          <p className={`pt-0.5 text-sm font-semibold ${LABEL[s.key].color}`}>{LABEL[s.key].text}</p>
                          <ul className="space-y-2.5">
                            {items.map((i, n) => (
                              <li key={n} className="flex gap-3 leading-relaxed text-soft">
                                <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-faint" />
                                <span>
                                  {i.text}
                                  {i.ticket_id && <span className="ml-2 whitespace-nowrap rounded-full bg-surface-2 px-2 py-0.5 align-middle font-mono text-[11px] text-muted">{i.ticket_id}</span>}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  {r.approved_by && (
                    <p className="mt-7 flex items-center gap-2 border-t border-line pt-5 text-xs font-semibold uppercase tracking-wider text-faint">
                      <ShieldCheck size={15} className="text-emerald-300" /> Reviewed &amp; approved by {r.approved_by}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
