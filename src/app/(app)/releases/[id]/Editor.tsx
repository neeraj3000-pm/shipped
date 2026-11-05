"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, Copy, ExternalLink, Lock, Plus, Send, Trash2, Undo2, AlertTriangle, ShieldCheck } from "lucide-react";
import { saveRelease, transition } from "@/app/actions";
import { CreatedBy, StatusBadge } from "@/components/StatusBadge";
import { emailFor, fmtDate } from "@/lib/format";
import { SECTIONS, type Activity, type Item, type Release, type Role, type Section } from "@/lib/types";

const SECTION_TINT: Record<Section, string> = {
  new: "bg-ice-50 text-brand",
  improved: "bg-sky-50 text-sky-800",
  fixed: "bg-emerald-50 text-emerald-800",
  known_issue: "bg-amber-50 text-amber-800",
};

const NEXT_STEP: Record<Release["status"], { member: string; manager: string }> = {
  draft: { member: "Review the wording, then submit it for manager review.", manager: "Review the wording, then submit it for review." },
  in_review: { member: "Waiting for a manager to approve.", manager: "Read it through, then approve or request changes." },
  approved: { member: "Approved. A manager can copy the email and mark it sent.", manager: "Copy the email, send it to the client, then mark it as sent." },
  sent: { member: "Sent to the client. Visible on their portal.", manager: "Sent to the client. Visible on their portal." },
};

export function Editor({ release, activity, role, portalUrl }: { release: Release; activity: Activity[]; role: Role; portalUrl: string }) {
  const [title, setTitle] = useState(release.title);
  const [version, setVersion] = useState(release.version);
  const [summary, setSummary] = useState(release.summary);
  const [items, setItems] = useState<Item[]>(release.items);
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const locked = release.status === "sent";
  const manager = role === "manager";
  const clientName = release.clients?.name ?? "Client";

  const dirty = useMemo(
    () =>
      title !== release.title ||
      version !== release.version ||
      summary !== release.summary ||
      JSON.stringify(items) !== JSON.stringify(release.items),
    [title, version, summary, items, release],
  );

  const show = (kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 3500);
  };

  const save = () =>
    start(async () => {
      const r = await saveRelease(release.id, { title, version, summary, items });
      if (r.ok) show("ok", r.message ?? "Saved.");
      else show("err", r.error);
    });

  const act = (a: Parameters<typeof transition>[1]) =>
    start(async () => {
      const r = await transition(release.id, a);
      if (!r.ok) show("err", r.error);
    });

  const copyEmail = async () => {
    const { full } = emailFor({ version, title, summary, items }, clientName, portalUrl);
    await navigator.clipboard.writeText(full);
    show("ok", "Email copied to clipboard, subject line included.");
  };

  const update = (i: number, patch: Partial<Item>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const c = [...xs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const remove = (i: number) => setItems((xs) => xs.filter((_, j) => j !== i));
  const add = (section: Section) => setItems((xs) => [...xs, { section, text: "", ticket_id: "" }]);

  // Primary actions by status + role
  const actions: React.ReactNode[] = [];
  if (dirty && !locked) {
    actions.push(
      <button key="save" className="btn btn-primary" onClick={save} disabled={pending}>
        <Check size={16} /> Save changes
      </button>,
    );
  } else {
    if (release.status === "draft")
      actions.push(
        <button key="submit" className="btn btn-primary" onClick={() => act("submit")} disabled={pending}>
          <Send size={16} /> Submit for review
        </button>,
      );
    if (release.status === "in_review" && manager) {
      actions.push(
        <button key="rc" className="btn btn-ghost" onClick={() => act("request_changes")} disabled={pending}>
          <Undo2 size={16} /> Request changes
        </button>,
        <button key="approve" className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => act("approve")} disabled={pending}>
          <ShieldCheck size={16} /> Approve
        </button>,
      );
    }
    if (release.status === "in_review" && !manager)
      actions.push(
        <span key="wait" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          <Lock size={14} /> Only a manager can approve
        </span>,
      );
    if (release.status === "approved" || release.status === "sent")
      actions.push(
        <button key="copy" className="btn btn-outline" onClick={copyEmail}>
          <Copy size={16} /> Copy as email
        </button>,
      );
    if (release.status === "approved" && manager)
      actions.push(
        <button key="sent" className="btn btn-brand" onClick={() => act("mark_sent")} disabled={pending}>
          <Send size={16} /> Mark as sent
        </button>,
      );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 font-medium text-navy hover:underline">
            <ChevronLeft size={15} /> Releases
          </Link>
          <span>›</span>
          <span className="font-medium text-navy">{clientName}</span>
          <span>›</span>
          <span className="font-semibold text-navy underline underline-offset-4">v{version || "—"}</span>
        </nav>

        {/* Status bar */}
        <div className="card mb-8 flex flex-wrap items-center gap-3 p-3 pl-4">
          <StatusBadge status={release.status} large />
          <p className="min-w-0 flex-1 text-sm text-slate-600">{dirty && !locked ? "You have unsaved changes." : NEXT_STEP[release.status][role]}</p>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>

        {flash && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${flash.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {flash.text}
          </div>
        )}

        {release.status === "approved" && !dirty && (
          <p className="mb-6 text-sm text-slate-500">Editing an approved release clears the approval and sends it back to review.</p>
        )}

        {/* Headline */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={locked}
          rows={1}
          placeholder="Release title"
          className="headline block w-full resize-none bg-transparent text-4xl text-ink outline-none placeholder:text-slate-300 focus:bg-white/60 sm:text-5xl [field-sizing:content]"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-stretch overflow-hidden rounded-md border border-ice bg-ice-50 text-sm font-bold text-brand">
            <span className="border-r border-ice px-2 py-1">v</span>
            <input value={version} onChange={(e) => setVersion(e.target.value)} disabled={locked}
              className="w-20 bg-transparent px-2 py-1 outline-none" aria-label="Version" />
          </label>
          <span className="text-sm font-semibold text-brand">for {clientName}</span>
        </div>

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={locked}
          rows={2}
          placeholder="A one or two sentence summary for the client…"
          className="mt-6 block w-full resize-none rounded-lg bg-transparent text-lg font-semibold leading-relaxed text-ink outline-none placeholder:text-slate-300 focus:bg-white [field-sizing:content]"
        />

        {/* Sections */}
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => {
            const rows = items.map((it, i) => ({ it, i })).filter((x) => x.it.section === s.key);
            const isKnown = s.key === "known_issue";
            return (
              <section key={s.key} className={isKnown && rows.length ? "rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-4 sm:p-5" : ""}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isKnown ? "text-amber-700" : "text-navy"}`}>
                    {isKnown && <AlertTriangle size={15} />} {s.label}
                    <span className="font-semibold text-slate-400">{rows.length}</span>
                  </h2>
                  {!locked && (
                    <button onClick={() => add(s.key)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                      <Plus size={15} /> Add
                    </button>
                  )}
                </div>
                {rows.length === 0 ? (
                  <p className="border-t border-line py-3 text-sm text-slate-400">Nothing in {s.label.toLowerCase()}.</p>
                ) : (
                  <ul>
                    {rows.map(({ it, i }) => (
                      <li key={i} className="group flex items-start gap-3 border-t border-line py-3 first:border-t-0 sm:first:border-t">
                        <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${isKnown ? "bg-amber-500" : "bg-navy"}`} />
                        <div className="min-w-0 flex-1">
                          <textarea
                            value={it.text}
                            onChange={(e) => update(i, { text: e.target.value })}
                            disabled={locked}
                            rows={1}
                            placeholder="Describe the change in plain language…"
                            className="block w-full resize-none rounded-md bg-transparent px-1 py-0.5 text-[15px] leading-relaxed text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-ice [field-sizing:content]"
                          />
                          <div className="mt-1 flex flex-wrap items-center gap-2 px-1">
                            <input
                              value={it.ticket_id ?? ""}
                              onChange={(e) => update(i, { ticket_id: e.target.value })}
                              disabled={locked}
                              placeholder="Ticket ID"
                              className="w-28 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 outline-none focus:ring-2 focus:ring-ice"
                            />
                            {!locked && (
                              <select
                                value={it.section}
                                onChange={(e) => update(i, { section: e.target.value as Section })}
                                className={`rounded px-1.5 py-0.5 text-xs font-semibold outline-none ${SECTION_TINT[it.section]}`}
                              >
                                {SECTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                              </select>
                            )}
                          </div>
                        </div>
                        {!locked && (
                          <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition group-hover:opacity-100">
                            <IconBtn label="Move up" onClick={() => move(i, -1)}><ArrowUp size={15} /></IconBtn>
                            <IconBtn label="Move down" onClick={() => move(i, 1)}><ArrowDown size={15} /></IconBtn>
                            <IconBtn label="Delete" onClick={() => remove(i)} danger><Trash2 size={15} /></IconBtn>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {dirty && !locked && (
          <div className="sticky bottom-4 mt-8 flex justify-end">
            <div className="card flex items-center gap-3 p-2 pl-4 shadow-lg">
              <span className="text-sm text-slate-600">Unsaved changes</span>
              <button className="btn btn-primary" onClick={save} disabled={pending}><Check size={16} /> Save</button>
            </div>
          </div>
        )}

        {/* Author bar */}
        <div className="mt-10 flex items-center justify-between rounded-full border border-line bg-white py-2 pl-2 pr-5">
          <CreatedBy by={release.created_by} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{fmtDate(release.created_at)}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:pt-12">
        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Client</h3>
          <p className="mt-1 text-lg font-bold text-navy">{clientName}</p>
          {release.clients?.contact_email && <p className="text-sm text-slate-500">{release.clients.contact_email}</p>}
          <a href={portalUrl} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            Open client portal <ExternalLink size={13} />
          </a>
          <p className="mt-1 text-xs text-slate-400">Shows approved and sent releases only.</p>
        </div>

        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity</h3>
          {activity.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ol className="relative mt-4 space-y-4 border-l border-line pl-4">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotFor(a.action)}`} />
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold text-navy">{a.actor.startsWith("Claude") ? "Claude via MCP" : a.actor}</span>{" "}
                    <span className="lowercase">{a.action}</span>
                  </p>
                  <p className="text-xs text-slate-400">{fmtDate(a.created_at, true)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}

function dotFor(action: string) {
  const a = action.toLowerCase();
  if (a.startsWith("approved")) return "bg-emerald-500";
  if (a.includes("sent to client")) return "bg-brand";
  if (a.startsWith("submitted")) return "bg-amber-500";
  if (a.startsWith("created")) return "bg-sky";
  return "bg-slate-300";
}

function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 ${danger ? "hover:text-red-600" : "hover:text-navy"}`}>
      {children}
    </button>
  );
}
