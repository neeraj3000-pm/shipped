import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { portalData } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { SECTIONS, type Release } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Release notes", robots: { index: false, follow: false } };

export default async function Portal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await portalData(token);
  if (!data) notFound();
  const { client, releases } = data;
  const [latest, ...older] = releases;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <span className="rounded-lg border-[1.5px] border-brand px-3 py-1 text-sm font-semibold text-brand">{client.name}</span>
        </div>
      </header>

      <main className="animate-page mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-navy">
          <span>{client.name}</span><span className="text-slate-400">›</span><span className="underline underline-offset-4">Release notes</span>
        </nav>

        {!latest ? (
          <div className="rounded-2xl border border-line p-12 text-center">
            <h1 className="headline text-4xl text-ink">No releases yet</h1>
            <p className="mt-3 text-slate-500">Approved release notes for {client.name} will appear here.</p>
          </div>
        ) : (
          <>
            <Hero r={latest} />
            {older.length > 0 && (
              <section className="mt-20">
                <h2 className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-500">Earlier releases</h2>
                <div className="space-y-4">
                  {older.map((r, i) => <Reveal key={r.id} i={i}><OlderCard r={r} /></Reveal>)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-line py-8 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
        Private release history for {client.name} ·{" "}
        <Link href="/about" className="text-brand hover:underline">Sent with Shipped</Link>
      </footer>
    </div>
  );
}

function Hero({ r }: { r: Release }) {
  const known = r.items.filter((i) => i.section === "known_issue");
  return (
    <article>
      <h1 className="headline text-[2.5rem] text-ink sm:text-6xl">{r.title}</h1>
      <div className="mt-5 inline-flex overflow-hidden rounded-md border border-ice bg-ice-50 text-sm font-bold text-brand">
        <span className="border-r border-ice px-2 py-1">{r.version}</span>
        <span className="px-2 py-1">Latest release</span>
      </div>
      {r.summary && <p className="mt-6 text-lg font-semibold leading-relaxed text-ink">{r.summary}</p>}

      {known.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
          {known.map((k, i) => (
            <p key={i} className="flex items-start gap-3 text-[15px] font-medium text-amber-700">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" /> <span>{k.text} <Ticket id={k.ticket_id} /></span>
            </p>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-8">
        {SECTIONS.filter((s) => s.key !== "known_issue").map((s) => {
          const items = r.items.filter((i) => i.section === s.key);
          if (!items.length) return null;
          return (
            <section key={s.key}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy">{s.label}</h2>
              <ul className="mt-2">
                {items.map((i, n) => (
                  <li key={n} className="flex gap-4 border-b border-line py-4 text-[15px] leading-relaxed text-slate-800 last:border-0">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    <span>{i.text} <Ticket id={i.ticket_id} /></span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-full border border-line bg-gradient-to-r from-canvas to-white py-2.5 pl-3 pr-5">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
          <CheckCircle2 size={16} className="text-emerald-600" /> Reviewed &amp; approved{r.approved_by ? ` by ${r.approved_by}` : ""}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{fmtDate(r.sent_at ?? r.approved_at ?? r.created_at)}</span>
      </div>
    </article>
  );
}

function OlderCard({ r }: { r: Release }) {
  return (
    <details className="lift group rounded-2xl border border-line bg-gradient-to-b from-canvas to-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-t-2xl border-b border-transparent px-5 py-4 group-open:border-line">
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">{r.version}<span className="ml-3 font-semibold text-slate-600">{r.title}</span></p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand group-open:hidden">Show</span>
        <span className="hidden shrink-0 text-xs font-semibold text-brand group-open:inline">Hide</span>
      </summary>
      <div className="px-5 pb-4 pt-3">
        {r.summary && <p className="text-sm text-slate-600">{r.summary}</p>}
        <ul className="mt-3 space-y-2">
          {r.items.map((i, n) => (
            <li key={n} className="flex items-start gap-2 text-sm text-slate-700">
              {i.section === "known_issue"
                ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                : <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand" />}
              <span>{i.text} <Ticket id={i.ticket_id} /></span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">{fmtDate(r.sent_at ?? r.approved_at ?? r.created_at)}</p>
      </div>
    </details>
  );
}

function Ticket({ id }: { id?: string | null }) {
  if (!id) return null;
  return <span className="ml-1 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 align-middle font-mono text-[11px] text-slate-500">{id}</span>;
}
