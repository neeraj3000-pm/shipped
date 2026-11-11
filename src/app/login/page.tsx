import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LoginForm, DemoButtons } from "./LoginForm";
import { ArrowRight, ShieldCheck, Sparkles, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
        <Link href="/about" className="relative w-fit rounded-xl bg-white px-3 py-2"><Logo /></Link>
        <div className="relative mt-auto max-w-md">
          <h1 className="headline text-5xl">Release notes your clients can trust.</h1>
          <p className="mt-4 text-lg text-ice/90">Claude writes them. Your team approves them. Every client gets their own private history.</p>
          <ul className="mt-8 space-y-3 text-[15px] text-white/90">
            <li className="flex items-center gap-3"><Sparkles size={18} className="text-sky" /> One draft per client, written by your own Claude</li>
            <li className="flex items-center gap-3"><ShieldCheck size={18} className="text-sky" /> Nothing reaches a client without a manager&apos;s approval</li>
            <li className="flex items-center gap-3"><Link2 size={18} className="text-sky" /> One private link per client with their full history</li>
          </ul>
          <Link href="/about" className="mt-10 inline-flex items-center gap-2 font-semibold text-sky hover:text-white">
            Read how it works <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Sign-in */}
      <section className="flex items-center justify-center px-4 py-12">
        <div className="animate-page w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo size="lg" /></div>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy">Try the live demo</h2>
          <p className="mt-1 text-slate-500">Pick a role. No sign-up, no password to remember.</p>
          <DemoButtons />

          <div className="my-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-line" /> or sign in with email <span className="h-px flex-1 bg-line" />
          </div>
          <LoginForm />

          <p className="mt-8 text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/about" className="font-semibold text-brand hover:underline">See how Shipped works</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
