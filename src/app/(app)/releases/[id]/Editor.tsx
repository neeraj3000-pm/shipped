"use client";

import Link from "next/link";
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, Copy, ExternalLink, Lock, Plus, Send, Trash2, Undo2, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { saveRelease, transition } from "@/app/actions";
import { CreatedBy, StatusBadge } from "@/components/StatusBadge";
import { emailFor, fmtDate } from "@/lib/format";
import { AutoTextarea } from "@/components/AutoTextarea";
import { SECTIONS, type Activity, type Item, type Release, type Role, type Section } from "@/lib/types";

const SECTION_TINT: Record<Section, string> = {
  new: "bg-sky/15 text-sky",
  improved: "bg-ice/10 text-ice",
  fixed: "bg-emerald-400/10 text-emerald-300",
  known_issue: "bg-amber-400/10 text-amber-300",
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
  const [busy, setBusy] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  // Status flips instantly; reverts automatically if the server rejects it.
  const [status, setOptimisticStatus] = useOptimistic(release.status);

  // When the server copy changes (after a save or status change), adopt it without remounting,
  // so confirmation messages survive.
  useEffect(() => {
    setTitle(release.title);
    setVersion(release.version);
    setSummary(release.summary);
    setItems(release.items);
  }, [release.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  const locked = status === "sent";
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

  const save = () => {
    setBusy("save");
    start(async () => {
      const r = await saveRelease(release.id, { title, version, summary, items });
      setBusy(null);
      if (r.ok) show("ok", r.message ?? "Saved.");
      else show("err", r.error);
    });
  };

  const TARGET = { submit: "in_review", approve: "approved", request_changes: "draft", mark_sent: "sent" } as const;
  const act = (a: keyof typeof TARGET) => {
    setBusy(a);
    start(async () => {
      setOptimisticStatus(TARGET[a]);
      const r = await transition(release.id, a);
      setBusy(null);
      if (!r.ok) show("err", r.error);
    });
  };
  const spin = (key: string, icon: React.ReactNode) => (busy === key ? <Loader2 size={16} className="animate-spin" /> : icon);

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
  const add = (section: Section) => {
    setFocusIdx(items.length);
    setItems((xs) => [...xs, { section, text: "", ticket_id: "" }]);
  };

  // Primary actions by status + role
  const actions: React.ReactNode[] = [];
  if (dirty && !locked) {
    actions.push(
      <button key="save" className="btn btn-primary" onClick={save} disabled={pending}>
        {spin("save", <Check size={16} />)} {busy === "save" ? "Saving…" : "Save changes"}
      </button>,
    );
  } else {
    if (status === "draft")
      actions.push(
        <button key="submit" className="btn btn-primary" onClick={() => act("submit")} disabled={pending}>
          {spin("submit", <Send size={16} />)} Submit for review
        </button>,
      );
    if (status === "in_review" && manager) {
      actions.push(
        <button key="rc" className="btn btn-ghost" onClick={() => act("request_changes")} disabled={pending}>
          {spin("request_changes", <Undo2 size={16} />)} Request changes
        </button>,
        <button key="approve" className="btn btn-success" onClick={() => act("approve")} disabled={pending}>
          {spin("approve", <ShieldCheck size={16} />)} Approve
        </button>,
      );
    }
    if (status === "in_review" && !manager)
      actions.push(
        <span key="wait" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-300">
          <Lock size={14} /> Only a manager can approve
        </span>,
      );
    if (status === "approved" || status === "sent")
      actions.push(
        <button key="copy" className="btn btn-outline" onClick={copyEmail}>
          <Copy size={16} /> Copy as email
        </button>,
      );
    if (status === "approved" && manager)
      actions.push(
        <button key="sent" className="btn btn-brand" onClick={() => act("mark_sent")} disabled={pending}>
          {spin("mark_sent", <Send size={16} />)} Mark as sent
        </button>,
      );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="inline-flex items-center gap-1 font-medium text-fg hover:underline">
            <ChevronLeft size={15} /> Releases
          </Link>
          <span>›</span>
          <span className="font-medium text-fg">{clientName}</span>
          <span>›</span>
          <span className="font-semibold text-fg underline underline-offset-4">v{version || "—"}</span>
        </nav>

        {/* Status bar */}
        <div className="card z-20 mb-8 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:pl-4 lg:sticky lg:top-20 lg:shadow-[0_8px_24px_-16px_rgb(27_54_93/0.35)]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span key={status} className="animate-pop inline-flex shrink-0"><StatusBadge status={status} large /></span>
            <p className="min-w-0 text-sm text-muted">{dirty && !locked ? "You have unsaved changes." : NEXT_STEP[status][role]}</p>
          </div>
          <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none [&>button]:justify-center">{actions}</div>
        </div>

        {flash && (
          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
            <div role="status" aria-live="polite"
              className={`animate-toast flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-2xl ${flash.kind === "ok" ? "bg-fg text-pill" : "bg-red-500 text-white"}`}>
              {flash.kind === "ok" ? <Check size={16} className="text-emerald-600" /> : <AlertTriangle size={16} />} {flash.text}
            </div>
          </div>
        )}

        {status === "approved" && !dirty && (
          <p className="mb-6 text-sm text-muted">Editing an approved release clears the approval and sends it back to review.</p>
        )}

        {/* Headline */}
        <AutoTextarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={locked}
          placeholder="Release title"
          className="headline block w-full resize-none rounded-2xl bg-transparent text-[1.75rem] text-fg outline-none placeholder:text-faint focus:bg-white/[0.03] sm:text-4xl"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-stretch overflow-hidden rounded-full bg-fg text-sm font-bold text-pill">
            <span className="py-1 pl-3">v</span>
            <input value={version} onChange={(e) => setVersion(e.target.value)} disabled={locked}
              className="w-16 bg-transparent py-1 pl-0.5 pr-3 outline-none" aria-label="Version" />
          </label>
          <span className="text-sm font-semibold text-sky">for {clientName}</span>
        </div>

        <AutoTextarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={locked}
          placeholder="A one or two sentence summary for the client…"
          className="mt-6 block w-full resize-none rounded-xl bg-transparent text-base font-medium leading-relaxed text-soft outline-none placeholder:text-faint focus:bg-white/[0.03] sm:text-lg"
        />

        {/* Sections */}
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => {
            const rows = items.map((it, i) => ({ it, i })).filter((x) => x.it.section === s.key);
            const isKnown = s.key === "known_issue";
            return (
              <section key={s.key} className={isKnown && rows.length ? "rounded-[24px] border border-amber-400/25 bg-amber-400/[0.06] p-4 sm:p-5" : ""}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isKnown ? "text-amber-300" : "text-fg"}`}>
                    {isKnown && <AlertTriangle size={15} />} {s.label}
                    <span className="font-semibold text-faint">{rows.length}</span>
                  </h2>
                  {!locked && (
                    <button onClick={() => add(s.key)} className="inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline">
                      <Plus size={15} /> Add
                    </button>
                  )}
                </div>
                {rows.length === 0 ? (
                  <p className="border-t border-line py-3 text-sm text-faint">Nothing in {s.label.toLowerCase()}.</p>
                ) : (
                  <ul>
                    {rows.map(({ it, i }) => (
                      <li key={i} className="animate-in group flex items-start gap-3 border-t border-line py-3 first:border-t-0 sm:first:border-t">
                        <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${isKnown ? "bg-amber-400" : "bg-sky"}`} />
                        <div className="min-w-0 flex-1">
                          <AutoTextarea
                            value={it.text}
                            onChange={(e) => update(i, { text: e.target.value })}
                            autoFocus={i === focusIdx}
                            disabled={locked}
                            placeholder="Describe the change in plain language…"
                            className="block w-full resize-none rounded-md bg-transparent px-1 py-0.5 text-[15px] leading-relaxed text-soft outline-none focus:bg-white/[0.04] focus:ring-2 focus:ring-sky/30"
                          />
                          <div className="mt-1 flex flex-wrap items-center gap-2 px-1">
                            <input
                              value={it.ticket_id ?? ""}
                              onChange={(e) => update(i, { ticket_id: e.target.value })}
                              disabled={locked}
                              placeholder="Ticket ID"
                              className="w-28 rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-muted outline-none focus:ring-2 focus:ring-sky/30"
                            />
                            {!locked && (
                              <select
                                value={it.section}
                                onChange={(e) => update(i, { section: e.target.value as Section })}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold outline-none ${SECTION_TINT[it.section]}`}
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
              <span className="text-sm text-muted">Unsaved changes</span>
              <button className="btn btn-primary" onClick={save} disabled={pending}>{spin("save", <Check size={16} />)} {busy === "save" ? "Saving…" : "Save"}</button>
            </div>
          </div>
        )}

        {/* Author bar */}
        <div className="mt-10 flex items-center justify-between rounded-full bg-pill py-2.5 pl-3 pr-5">
          <CreatedBy by={release.created_by} />
          <span className="text-xs font-bold uppercase tracking-wider text-muted">{fmtDate(release.created_at)}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:pt-12">
        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Client</h3>
          <p className="mt-1 text-lg font-bold text-fg">{clientName}</p>
          {release.clients?.contact_email && <p className="text-sm text-muted">{release.clients.contact_email}</p>}
          <a href={portalUrl} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline">
            Open client portal <ExternalLink size={13} />
          </a>
          <p className="mt-1 text-xs text-faint">Shows approved and sent releases only.</p>
        </div>

        <div className="card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Activity</h3>
          {activity.length === 0 ? (
            <p className="mt-2 text-sm text-faint">No activity yet.</p>
          ) : (
            <ol className="relative mt-4 space-y-4 border-l border-line pl-4">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${dotFor(a.action)}`} />
                  <p className="text-sm text-soft">
                    <span className="font-semibold text-fg">{a.actor.startsWith("Claude") ? "Claude via MCP" : a.actor}</span>{" "}
                    <span className="lowercase">{a.action}</span>
                  </p>
                  <p className="text-xs text-faint">{fmtDate(a.created_at, true)}</p>
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
  return "bg-faint";
}

function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-2 ${danger ? "hover:text-red-400" : "hover:text-fg"}`}>
      {children}
    </button>
  );
}
