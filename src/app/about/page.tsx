import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileText, Link2, ListChecks, MessageSquareText, ShieldCheck, Sparkles, X, Check, History, Wallet } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { HeroDemo } from "./HeroDemo";
import { PortfolioBack } from "@/components/PortfolioBack";
import { admin } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/format";
import { DEMO_PROMPT, SAMPLE_TICKETS } from "@/lib/demo";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: { absolute: "Shipped · The build story" },
  description: "Client-ready release notes for B2B teams. Claude writes them, your team approves them, each client gets a private history. A product by Neeraj P.",
};

async function demoPortal() {
  try {
    const { data } = await admin().from("clients").select("portal_token").eq("slug", "streamco").maybeSingle();
    return data ? `/portal/${data.portal_token}` : null;
  } catch {
    return null;
  }
}

const STEPS = [
  { Icon: MessageSquareText, t: "Paste", d: "Drop the sprint's tickets into Claude and name the clients." },
  { Icon: Sparkles, t: "Draft", d: "Claude filters per client, rewrites in plain language and saves one draft each to Shipped." },
  { Icon: ShieldCheck, t: "Approve", d: "A teammate polishes the wording; a manager approves. Nothing skips review." },
  { Icon: Link2, t: "Share", d: "Copy a ready email, mark it sent, and it appears on the client's private page." },
];

const DECISIONS = [
  { Icon: ShieldCheck, t: "Claude can draft, never approve", d: "The MCP tools can create and edit drafts, but approval and sending only exist as buttons for humans. The AI is fast; the sign-off stays accountable." },
  { Icon: History, t: "Editing after approval re-opens review", d: "If anyone changes an approved release, the approval is cleared and it goes back to the manager. An approval always matches what the client sees." },
  { Icon: ListChecks, t: "Every line keeps its ticket ID", d: "Clients read plain language; your team can still trace each sentence to a Jira ticket when someone asks 'what exactly changed?'" },
  { Icon: FileText, t: "One draft per client, not one for all", d: "Relevance beats volume. Each client only hears about what affects them, so the notes actually get read." },
  { Icon: Link2, t: "A private link instead of a login", d: "Clients get an unguessable read-only link with approved releases only. No accounts to manage, no drafts leaking out." },
  { Icon: Wallet, t: "No AI inside the app", d: "The customer's own Claude does the writing, so Shipped never pays for tokens. Costs stay at hosting and a database, and margins stay above 90%." },
];

const COMPARE = [
  ["Writes clear, client-friendly notes", true, true],
  ["Remembers what each client was told", false, true],
  ["Manager approval before anything is sent", false, true],
  ["Every line traced back to its ticket", false, true],
  ["One private history page per client", false, true],
] as const;

const STACK = ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS", "Supabase (Postgres + Auth)", "MCP · Streamable HTTP", "Vercel"];

export default async function About() {
  const portal = await demoPortal();
  const mcpUrl = `${appUrl()}/api/mcp/${process.env.MCP_WORKSPACE_TOKEN}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/about" aria-label="Shipped"><Logo /></Link>
          <div className="flex items-center gap-2">
            <PortfolioBack />
            <Link href="/login" className="btn btn-primary !px-3 !py-1.5 text-sm">Try it <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ice-50 via-white to-white">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-page">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">Live product · PRD to production</p>
            <h1 className="headline mt-4 text-[2.6rem] text-ink sm:text-6xl">
              Claude writes the release notes.<br /><span className="text-brand">Shipped</span> gets them approved.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Client-ready release notes for B2B teams: one version per client, reviewed by a manager, and kept in a private history each client can open any time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary !px-5 !py-3 text-base">Try the live demo <ArrowRight size={17} /></Link>
              <a href="#story" className="btn btn-ghost !px-5 !py-3 text-base">Read the build story</a>
            </div>
            <p className="mt-4 text-sm text-slate-500">One click to sign in as a manager or team member. No sign-up.</p>
          </div>
          <div className="animate-float"><HeroDemo /></div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-line bg-canvas p-5 font-mono text-[12.5px] leading-7 text-slate-700">
              <p className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-slate-400">Sprint 14 · 8 tickets · 3 clients</p>
              {SAMPLE_TICKETS.split("\n").map((l) => (
                <p key={l} className={`truncate ${/internal/.test(l) ? "text-slate-400 line-through" : ""}`}>{l}</p>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="w-fit rounded-xl rounded-bl-sm bg-canvas px-4 py-2 text-slate-700">did we tell StreamCo about the subtitle fix?</p>
              <p className="ml-auto w-fit rounded-xl rounded-br-sm bg-navy px-4 py-2 text-white">not sure… let me check the email thread 😅</p>
            </div>
          </Reveal>
          <Reveal i={1}>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">The problem</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">Every sprint, the same copy-paste.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Teams that serve several enterprise clients rewrite the same tickets for each one: only what&apos;s relevant, in plain language, checked by a manager before it goes out.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              It lives across Jira, docs and email, and nobody can answer the simplest question: <b className="text-navy">what did we tell this client, and when?</b>
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">How it works</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">Paste → Draft → Approve → Share</h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.t} i={i} className="lift card relative p-6">
                <span className="absolute right-5 top-5 font-mono text-sm font-bold text-slate-300">0{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-ice"><s.Icon size={20} /></span>
                <p className="mt-5 text-lg font-bold text-navy">{s.t}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Why not just Claude */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">Why not just use Claude?</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">Claude writes great notes. Then forgets them.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Shipped is the system of record around the writing: it keeps every release, routes it through approval, and gives each client one place to see their history. Claude does the thinking; Shipped makes it safe to send and easy to find.
            </p>
          </Reveal>
          <Reveal i={1} className="card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-line bg-canvas px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span />
              <span className="w-20 text-center">Claude</span>
              <span className="w-24 text-center text-brand">+ Shipped</span>
            </div>
            {COMPARE.map(([label, a, b]) => (
              <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-line px-5 py-3.5 last:border-0">
                <span className="text-[15px] text-slate-700">{label}</span>
                <span className="flex w-20 justify-center">{a ? <Check size={18} className="text-emerald-600" /> : <X size={18} className="text-slate-300" />}</span>
                <span className="flex w-24 justify-center">{b && <Check size={18} className="text-emerald-600" />}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Product decisions */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-sky">Product decisions</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl">The calls that shaped it</h2>
            <p className="mt-4 max-w-2xl text-lg text-ice/80">Small rules, each one there to make release notes something a client can trust.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.t} i={i % 3} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]">
                <d.Icon size={22} className="text-sky" />
                <p className="mt-4 text-lg font-bold">{d.t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ice/80">{d.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">Why I built this</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">The tool I wished I had</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-700">
              <p>
                I&apos;m a product manager on a media platform used by large broadcasters. Every sprint, I turn Jira tickets into release notes for each client, and my manager reviews them before the email goes out. It&apos;s the same rewrite, client by client, sprint after sprint, with the history scattered across inboxes.
              </p>
              <p>
                I built Shipped under one deliberate constraint: <b className="text-navy">no AI inside the app</b>. The customer connects their own Claude through MCP; Claude does the thinking and writing, and Shipped does everything a model shouldn&apos;t: storing, routing for approval, and keeping the record straight.
              </p>
              <p>
                I wrote the PRD, designed the approval rules and the MCP tool contract, and built it end to end with Claude Code. Next up: syncing tickets straight from Jira and Linear, sending the email automatically after approval, and an in-app &quot;what&apos;s new&quot; widget for our customers&apos; own users.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-14 sm:px-6 lg:grid-cols-4">
          {[
            ["6", "MCP tools Claude can call"],
            ["0", "AI SDKs or keys in the app"],
            ["1", "approval gate before any client sees it"],
            ["1", "private link per client, full history"],
          ].map(([n, l], i) => (
            <Reveal key={l} i={i} className="text-center">
              <p className="headline text-4xl text-navy sm:text-5xl">{n}</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Under the hood */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">What&apos;s under the hood</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">Simple on purpose</h2>
          </Reveal>
          <Reveal i={1} className="mt-10">
            <div className="grid items-stretch gap-3 text-center text-sm md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <Box title="Your Claude" sub="claude.ai with the Shipped connector" />
              <Arrow label="MCP · 6 tools" />
              <Box title="Shipped" sub="Next.js on Vercel · role checks · approval rules" strong />
              <Arrow label="server-side only" />
              <Box title="Supabase" sub="Postgres + Auth · row-level security on" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <span className="hidden md:block" /><span className="hidden md:block" />
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <span className="h-6 w-px bg-line" />
                <Box title="Client portal" sub="Read-only, approved & sent only" />
              </div>
            </div>
          </Reveal>
          <Reveal i={2} className="mt-10 flex flex-wrap justify-center gap-2">
            {STACK.map((s) => <span key={s} className="rounded-lg border border-line px-3 py-1.5 font-mono text-[13px] text-slate-700">{s}</span>)}
          </Reveal>
        </div>
      </section>

      {/* Try it */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">Try it yourself</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">Three ways in, from 10 seconds to 5 minutes</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Reveal i={0} className="card flex flex-col p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">10 seconds</p>
              <p className="mt-2 text-xl font-bold text-navy">Click through the app</p>
              <p className="mt-2 flex-1 text-[15px] text-slate-600">Sign in as Arjun to submit Claude&apos;s Atlas Sports draft, then switch to Priya to approve it. Roles switch from the top-right menu.</p>
              <Link href="/login" className="btn btn-primary mt-5 w-fit">Open the demo <ArrowRight size={16} /></Link>
            </Reveal>
            <Reveal i={1} className="card flex flex-col p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">30 seconds</p>
              <p className="mt-2 text-xl font-bold text-navy">See what a client sees</p>
              <p className="mt-2 flex-1 text-[15px] text-slate-600">StreamCo&apos;s private release history: approved releases only, newest first, no login.</p>
              {portal && <a href={portal} className="btn btn-ghost mt-5 w-fit">Open StreamCo&apos;s portal <ArrowRight size={16} /></a>}
            </Reveal>
            <Reveal i={2} className="card flex flex-col p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">5 minutes</p>
              <p className="mt-2 text-xl font-bold text-navy">Connect your own Claude</p>
              <ol className="mt-2 flex-1 list-decimal space-y-1 pl-5 text-[15px] text-slate-600">
                <li>claude.ai → Settings → Connectors → Add custom connector</li>
                <li>Paste the link below, name it Shipped</li>
                <li>In a new chat, paste the sample prompt</li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={mcpUrl} label="Copy connector link" />
                <CopyButton text={`${DEMO_PROMPT}\n\n${SAMPLE_TICKETS}`} label="Copy sample prompt" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">What&apos;s next</p>
            <h2 className="headline mt-3 text-3xl sm:text-4xl text-ink">From release notes to the record of every change</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Jira & Linear sync", "Pull the sprint's tickets in directly, no copy-paste."],
              ["Automatic delivery", "Send the approved email to each client's contacts in one click."],
              ["“What's new” widget", "Show approved notes inside our customers' own products."],
              ["Teams & sign-in", "Multiple workspaces, invites and OAuth for the connector."],
            ].map(([t, d], i) => (
              <Reveal key={t} i={i} className="rounded-2xl border border-dashed border-slate-300 p-6">
                <CheckCircle2 size={20} className="text-slate-300" />
                <p className="mt-3 font-bold text-navy">{t}</p>
                <p className="mt-1 text-[15px] text-slate-600">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="headline text-3xl text-white sm:text-4xl">See it work in under a minute.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn !bg-white !px-5 !py-3 text-base !text-navy hover:!bg-ice-50">Try the live demo <ArrowRight size={17} /></Link>
            <PortfolioBack variant="footer" />
          </div>
          <p className="text-sm text-ice/70">Built by Neeraj P. · No AI inside: all writing is done by the customer&apos;s own Claude.</p>
        </div>
      </section>
    </div>
  );
}

function Box({ title, sub, strong }: { title: string; sub: string; strong?: boolean }) {
  return (
    <div className={`flex w-full flex-col justify-center rounded-2xl border p-5 ${strong ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
      <p className={`font-bold ${strong ? "text-white" : "text-navy"}`}>{title}</p>
      <p className={`mt-1 text-xs ${strong ? "text-ice/80" : "text-slate-500"}`}>{sub}</p>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:py-0">
      <span className="hidden md:block">{label}</span>
      <ArrowRight size={18} className="rotate-90 text-brand md:rotate-0" />
      <span className="md:hidden">{label}</span>
    </div>
  );
}
