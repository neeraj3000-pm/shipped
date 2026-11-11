import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { portalData } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { PortalView } from "./PortalView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Release notes", robots: { index: false, follow: false } };

export default async function Portal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await portalData(token);
  if (!data) notFound();
  const { client, releases } = data;

  return (
    <div className="min-h-screen">
      <header className="sticky top-3 z-30 mx-auto mt-3 max-w-6xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between rounded-[28px] bg-pill/90 pl-5 pr-3 ring-1 ring-white/[0.06] backdrop-blur-xl sm:pl-7">
          <Logo />
          <span className="rounded-full bg-surface-2 px-4 py-1.5 text-sm font-semibold text-fg">{client.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <div className="animate-page text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky">{client.name}</p>
          <h1 className="display-xl mt-4 text-5xl text-fg sm:text-7xl lg:text-8xl">Release notes</h1>
          <p className="mx-auto mt-5 max-w-lg text-muted">
            Every update your team has approved for {client.name}, newest first.
          </p>
        </div>
        <PortalView
          clientName={client.name}
          releases={releases.map((r) => ({
            id: r.id, version: r.version, title: r.title, summary: r.summary, items: r.items,
            date: r.sent_at ?? r.approved_at ?? r.created_at, approved_by: r.approved_by,
          }))}
        />
      </main>

      <footer className="pb-10 text-center text-xs font-semibold uppercase tracking-wider text-faint">
        Private release history for {client.name} ·{" "}
        <Link href="/about" className="text-sky hover:underline">Sent with Shipped</Link>
      </footer>
    </div>
  );
}
