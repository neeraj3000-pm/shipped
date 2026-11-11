import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, X, ShieldCheck, History, ListChecks, FileText, Link2, Wallet, MessageSquareText, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { PortfolioBack } from "@/components/PortfolioBack";
import { HeroDemo } from "./HeroDemo";
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

const CHAPTERS = [
  ["problem", "The problem"],
  ["flow", "How it works"],
  ["why", "Why not just Claude"],
  ["decisions", "Product decisions"],
  ["story", "Why I built it"],
  ["stack", "Under the hood"],
  ["try", "Try it"],
  ["next", "What's next"],
] as const;

const STEPS = [
  { Icon: MessageSquareText, t: "Paste", d: "Drop the sprint's tickets into Claude and name the clients." },
  { Icon: Sparkles, t: "Draft", d: "Claude filters per client, rewrites in plain language and saves one draft each to Shipped." },
  { Icon: ShieldCheck, t: "Approve", d: "A teammate polishes the wording; a manager approves. Nothing skips review." },
  { Icon: Link2, t: "Share", d: "Copy a ready email, mark it sent, and it appears on the client's private page." },
];

const DECISIONS = [
  { tag: "Trust", Icon: ShieldCheck, t: "Claude can draft, never approve", d: "The MCP tools can create and edit drafts, but approval and sending only exist as buttons for humans. The AI is fast; the sign-off stays accountable." },
  { tag: "Integrity", Icon: History, t: "Editing after approval re-opens review", d: "If anyone changes an approved release, the approval is cleared and it goes back to the manager. An approval always matches what the client sees." },
  { tag: "Traceability", Icon: ListChecks, t: "Every line keeps its ticket ID", d: "Clients read plain language; your team can still trace each sentence to a Jira ticket when someone asks what exactly changed." },
  { tag: "Relevance", Icon: FileText, t: "One draft per client, not one for all", d: "Each client only hears about what affects them, so the notes actually get read." },
  { tag: "Access", Icon: Link2, t: "A private link instead of a login", d: "Clients get an unguessable read-only link with approved releases only. No accounts to manage, no drafts leaking out." },
  { tag: "Business", Icon: Wallet, t: "No AI inside the app", d: "The customer's own Claude does the writing, so Shipped never pays for tokens. Running costs stay at hosting and a database." },
];

const COMPARE = [
  ["Writes clear, client-friendly notes", true],
  ["Remembers what each client was told", false],
  ["Manager approval before anything is sent", false],
  ["Every line traced back to its ticket", false],
  ["One private history page per client", false],
] as const;

const STACK = ["Next.js 15", "TypeScript", "Tailwind CSS", "Supabase · Postgres + Auth", "MCP · Streamable HTTP", "Vercel"];

export default async function About() {
  const portal = await demoPortal();
  const mcpUrl = `${appUrl()}/api/mcp/${process.env.MCP_WORKSPACE_TOKEN}`;

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Floating pill nav */}
      <header className="sticky top-3 z-30 mx-auto mt-3 max-w-6xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3 rounded-[28px] bg-pill/90 pl-5 pr-2.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/[0.06] backdrop-blur-xl sm:pl-7">
          <Link href="/about" aria-label="Shipped"><Logo /></Link>
          <nav className="hidden items-center gap-6 text-[15px] text-soft lg:flex">
            <a href="#flow" className="hover:text-fg">How it works</a>
            <a href="#decisions" className="hover:text-fg">Decisions</a>
            <a href="#story" className="hover:text-fg">Story</a>
            <a href="#try" className="hover:text-fg">Try it</a>
          </nav>
          <div className="flex items-center gap-2">
            <PortfolioBack />
            <Link href="/login" className="btn btn-primary !py-2 text-sm">Try it <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="animate-page">
          <p className="mx-auto w-fit rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold text-sky ring-1 ring-sky/25">Live product · PRD to production</p>
          <h1 className="display-xl mx-auto mt-6 max-w-5xl text-[2.15rem] text-fg sm:text-6xl lg:text-7xl">
            Claude writes the release notes. <span className="text-sky [text-shadow:0_0_40px_rgb(96_193_229/0.45)]">Shipped</span> gets them approved.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Client-ready release notes for B2B teams: one version per client, reviewed by a manager, kept in a private history each client can open any time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn btn-primary !px-6 !py-3.5 text-base">Try the live demo <ArrowRight size={17} /></Link>
            <a href="#story" className="btn btn-ghost !px-6 !py-3.5 text-base">Read the build story</a>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-3xl"><HeroDemo /></div>

        {/* Chapter chips */}
        <nav className="mt-16 flex flex-wrap justify-center gap-2" aria-label="Chapters">
          {CHAPTERS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="chip">{label}</a>
          ))}
        </nav>
      </section>

      {/* Changelog-style chapters */}
      <div className="mx-auto max-w-6xl space-y-24 px-4 py-24 sm:px-6 sm:space-y-32">
        <Chapter id="problem" n="01" title="The problem" label="Problem" labelColor="text-amber-300">
          <Card>
            <h3 className="text-2xl font-bold text-fg sm:text-3xl">Every sprint, the same copy-paste.</h3>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              Teams that serve several enterprise clients rewrite the same tickets for each one: only what&apos;s relevant, in plain language, checked by a manager before it goes out. It lives across Jira, docs and email, and nobody can answer the simplest question: <b className="text-fg">what did we tell this client, and when?</b>
            </p>
            <div className="mt-6 rounded-[22px] bg-pill p-5 font-mono text-[12.5px] leading-7 text-soft">
              <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wider text-faint">Sprint 14 · 8 tickets · 3 clients</p>
              {SAMPLE_TICKETS.split("\n").map((l) => (
                <p key={l} className={`truncate ${/internal/.test(l) ? "text-faint line-through" : ""}`}>{l}</p>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <p className="w-fit rounded-2xl rounded-bl-md bg-surface-2 px-4 py-2 text-soft">did we tell StreamCo about the subtitle fix?</p>
              <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-sky px-4 py-2 font-medium text-pill">not sure… let me check the email thread 😅</p>
            </div>
          </Card>
        </Chapter>

        <Chapter id="flow" n="02" title="How it works" label="Flow" labelColor="text-sky">
          <div className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} i={i} className="lift rounded-[28px] bg-surface p-6 ring-1 ring-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-sky/10 text-sky ring-1 ring-sky/25"><s.Icon size={20} /></span>
                  <span className="font-display text-sm font-semibold text-faint">0{i + 1}</span>
                </div>
                <p className="mt-5 text-xl font-bold text-fg">{s.t}</p>
                <p className="mt-1 leading-relaxed text-muted">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </Chapter>

        <Chapter id="why" n="03" title="Why not just Claude?" label="Positioning" labelColor="text-ice">
          <Card>
            <h3 className="text-2xl font-bold text-fg sm:text-3xl">Claude writes great notes. Then forgets them.</h3>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              Shipped is the system of record around the writing. Claude does the thinking; Shipped makes it safe to send and easy to find.
            </p>
            <div className="mt-6 overflow-hidden rounded-[22px] bg-pill">
              <div className="grid grid-cols-[1fr_72px_96px] items-center gap-x-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                <span /><span className="text-center">Claude</span><span className="text-center text-sky">+ Shipped</span>
              </div>
              {COMPARE.map(([label, a]) => (
                <div key={label} className="grid grid-cols-[1fr_72px_96px] items-center gap-x-2 border-t border-white/[0.05] px-5 py-3.5">
                  <span className="text-[15px] text-soft">{label}</span>
                  <span className="flex justify-center">{a ? <Check size={18} className="text-emerald-300" /> : <X size={18} className="text-faint" />}</span>
                  <span className="flex justify-center"><Check size={18} className="text-emerald-300" /></span>
                </div>
              ))}
            </div>
          </Card>
        </Chapter>

        <Chapter id="decisions" n="04" title="Product decisions" label="Decisions" labelColor="text-emerald-300">
          <div className="space-y-4">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.t} i={i % 2} className="rounded-[28px] bg-surface p-6 ring-1 ring-white/[0.05] sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="tag">{d.tag}</span>
                  <span className="font-display text-sm font-semibold text-faint">0{i + 1}</span>
                  <span className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-sky"><d.Icon size={17} /></span>
                </div>
                <p className="mt-4 text-xl font-bold text-fg">{d.t}</p>
                <p className="mt-1.5 leading-relaxed text-muted">{d.d}</p>
              </Reveal>
            ))}
          </div>
        </Chapter>

        <Chapter id="story" n="05" title="Why I built it" label="Story" labelColor="text-sky">
          <Card>
            <h3 className="text-2xl font-bold text-fg sm:text-3xl">The tool I wished I had.</h3>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-soft">
              <p>I&apos;m a product manager on a media platform used by large broadcasters. Every sprint, I turn Jira tickets into release notes for each client, and my manager reviews them before the email goes out. It&apos;s the same rewrite, client by client, sprint after sprint, with the history scattered across inboxes.</p>
              <p>I built Shipped under one deliberate constraint: <b className="text-fg">no AI inside the app</b>. The customer connects their own Claude through MCP; Claude does the thinking and writing, and Shipped does everything a model shouldn&apos;t: storing, routing for approval, and keeping the record straight.</p>
              <p>I wrote the PRD, designed the approval rules and the MCP tool contract, and built it end to end with Claude Code.</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["6", "MCP tools"], ["0", "AI SDKs inside"], ["1", "approval gate"], ["1", "private link per client"]].map(([n, l]) => (
                <div key={l} className="rounded-[20px] bg-pill p-4 text-center">
                  <p className="display-xl text-4xl text-sky">{n}</p>
                  <p className="mt-1 text-xs font-medium text-muted">{l}</p>
                </div>
              ))}
            </div>
          </Card>
        </Chapter>

        <Chapter id="stack" n="06" title="Under the hood" label="Architecture" labelColor="text-ice">
          <Card>
            <div className="grid items-stretch gap-3 text-center text-sm md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <Box title="Your Claude" sub="claude.ai with the Shipped connector" />
              <Arrow label="MCP · 6 tools" />
              <Box title="Shipped" sub="Next.js on Vercel · roles · approval rules" strong />
              <Arrow label="server-side" />
              <Box title="Supabase" sub="Postgres + Auth · RLS on" />
            </div>
            <div className="mt-3 grid md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <span className="hidden md:block" /><span className="hidden md:block" />
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <span className="h-6 w-px bg-line-strong" />
                <Box title="Client portal" sub="Read-only · approved & sent only" />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {STACK.map((s) => <span key={s} className="chip !cursor-default font-mono !text-[13px]">{s}</span>)}
            </div>
          </Card>
        </Chapter>

        <Chapter id="try" n="07" title="Try it yourself" label="Hands-on" labelColor="text-emerald-300">
          <div className="space-y-4">
            <TryCard time="10 seconds" title="Click through the app" body="Sign in as Arjun to submit Claude's Atlas Sports draft, then switch to Priya to approve it. Roles switch from the top-right menu.">
              <Link href="/login" className="btn btn-primary">Open the demo <ArrowRight size={16} /></Link>
            </TryCard>
            <TryCard time="30 seconds" title="See what a client sees" body="StreamCo's private release history: approved releases only, newest first, no login.">
              {portal && <a href={portal} className="btn btn-ghost">Open StreamCo&apos;s portal <ArrowRight size={16} /></a>}
            </TryCard>
            <TryCard time="5 minutes" title="Connect your own Claude" body="claude.ai → Settings → Connectors → Add custom connector. Paste the link, name it Shipped, then paste the sample prompt in a new chat.">
              <CopyButton text={mcpUrl} label="Copy connector link" />
              <CopyButton text={`${DEMO_PROMPT}\n\n${SAMPLE_TICKETS}`} label="Copy sample prompt" />
            </TryCard>
          </div>
        </Chapter>

        <Chapter id="next" n="08" title="What's next" label="Roadmap" labelColor="text-muted">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Jira & Linear sync", "Pull the sprint's tickets in directly, no copy-paste."],
              ["Automatic delivery", "Send the approved email to each client's contacts in one click."],
              ["“What's new” widget", "Show approved notes inside our customers' own products."],
              ["Teams & sign-in", "Multiple workspaces, invites and OAuth for the connector."],
            ].map(([t, d], i) => (
              <Reveal key={t} i={i} className="rounded-[28px] border border-dashed border-line-strong p-6">
                <span className="tag !bg-surface-2 !text-muted">Planned</span>
                <p className="mt-4 text-lg font-bold text-fg">{t}</p>
                <p className="mt-1 text-muted">{d}</p>
              </Reveal>
            ))}
          </div>
        </Chapter>
      </div>

      {/* Closing */}
      <section className="mx-auto max-w-6xl px-3 pb-10 sm:px-6">
        <div className="relative overflow-hidden rounded-[40px] bg-pill px-6 py-16 text-center ring-1 ring-white/[0.06]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand/40 blur-3xl" />
          <h2 className="display-xl relative text-3xl text-fg sm:text-5xl">See it work in under a minute.</h2>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn btn-primary !px-6 !py-3.5 text-base">Try the live demo <ArrowRight size={17} /></Link>
            <PortfolioBack variant="footer" />
          </div>
          <p className="relative mt-6 text-sm text-faint">Built by Neeraj P. · No AI inside: all writing is done by the customer&apos;s own Claude.</p>
        </div>
      </section>
    </div>
  );
}

function Chapter({ id, n, title, label, labelColor, children }: { id: string; n: string; title: string; label: string; labelColor: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-28 gap-6 lg:grid-cols-[260px_120px_1fr] lg:gap-6">
      <Reveal className="lg:sticky lg:top-28 lg:self-start">
        <p className="font-display text-sm font-semibold text-faint">{n}</p>
        <h2 className="accent-bar headline mt-2 text-3xl text-fg">{title}</h2>
      </Reveal>
      <p className={`hidden pt-10 text-right text-sm font-semibold lg:block ${labelColor}`}>{label}</p>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <Reveal className="rounded-[32px] bg-surface p-6 ring-1 ring-white/[0.05] sm:p-8">{children}</Reveal>;
}

function TryCard({ time, title, body, children }: { time: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <Reveal className="rounded-[28px] bg-surface p-6 ring-1 ring-white/[0.05] sm:p-7">
      <div className="flex items-center gap-3"><span className="tag">{time}</span></div>
      <p className="mt-4 text-xl font-bold text-fg">{title}</p>
      <p className="mt-1.5 leading-relaxed text-muted">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">{children}</div>
    </Reveal>
  );
}

function Box({ title, sub, strong }: { title: string; sub: string; strong?: boolean }) {
  return (
    <div className={`flex w-full flex-col justify-center rounded-[22px] p-5 ${strong ? "bg-sky text-pill shadow-[0_0_40px_rgb(96_193_229/0.35)]" : "bg-pill"}`}>
      <p className={`font-bold ${strong ? "text-pill" : "text-fg"}`}>{title}</p>
      <p className={`mt-1 text-xs ${strong ? "text-navy" : "text-muted"}`}>{sub}</p>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-faint md:py-0">
      <span className="hidden md:block">{label}</span>
      <ArrowRight size={18} className="rotate-90 text-sky md:rotate-0" />
      <span className="md:hidden">{label}</span>
    </div>
  );
}
