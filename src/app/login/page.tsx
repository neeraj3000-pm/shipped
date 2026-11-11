import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LoginForm, DemoButtons } from "./LoginForm";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto mt-3 w-full max-w-6xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between rounded-[28px] bg-pill/90 pl-5 pr-2.5 ring-1 ring-white/[0.06] sm:pl-7">
          <Link href="/about"><Logo /></Link>
          <Link href="/about" className="btn btn-ghost !py-2 text-sm">How it works <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main className="animate-page mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-14 text-center">
        <p className="rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold text-sky ring-1 ring-sky/25">Live demo · no sign-up</p>
        <h1 className="display-xl mt-6 text-5xl text-fg sm:text-7xl">Try Shipped</h1>
        <p className="mt-5 max-w-md text-lg text-muted">
          Release notes written by Claude, approved by people. Pick a role to step in.
        </p>
        <DemoButtons />
        <details className="group mt-10 w-full max-w-md text-left">
          <summary className="mx-auto w-fit cursor-pointer list-none text-sm font-semibold text-muted hover:text-fg">
            Sign in with email instead <span className="inline-block transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-5"><LoginForm /></div>
        </details>
      </main>
    </div>
  );
}
