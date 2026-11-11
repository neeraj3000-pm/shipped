"use client";
import { useActionState, useTransition, useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, PencilLine } from "lucide-react";
import { login, loginAs } from "@/app/actions";
import type { Role } from "@/lib/types";

export function DemoButtons() {
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const go = (role: Role) => {
    setWhich(role);
    setError(null);
    start(async () => {
      const r = await loginAs(role);
      if (r?.error) { setError(r.error); setWhich(null); }
    });
  };
  const opts = [
    { role: "manager" as Role, title: "Continue as Manager", desc: "Priya · reviews, approves and sends", Icon: ShieldCheck, tint: "bg-sky text-pill shadow-[0_0_24px_rgb(96_193_229/0.5)]" },
    { role: "member" as Role, title: "Continue as Team member", desc: "Arjun · edits drafts and submits for review", Icon: PencilLine, tint: "bg-ice-50 text-sky" },
  ];
  return (
    <div className="mt-10 grid w-full gap-3 text-left sm:grid-cols-2">
      {opts.map(({ role, title, desc, Icon, tint }) => (
        <button
          key={role}
          onClick={() => go(role)}
          disabled={pending}
          className="lift group flex w-full items-center gap-4 rounded-[24px] border border-white/[0.06] bg-pill p-5 text-left disabled:opacity-60"
        >
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tint}`}>
            {pending && which === role ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-fg">{title}</span>
            <span className="block text-sm text-muted">{desc}</span>
          </span>
          <ArrowRight size={18} className="text-faint transition-transform group-hover:translate-x-1 group-hover:text-sky" />
        </button>
      ))}
      {error && <p className="text-sm font-medium text-red-400 sm:col-span-2">{error}</p>}
      <p className="text-center text-xs text-faint sm:col-span-2">Switch roles any time from the menu at the top right.</p>
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="sr-only">Email</span>
        <input name="email" type="email" required autoComplete="username" className="field" placeholder="manager@shipped.demo" />
      </label>
      <label className="block">
        <span className="sr-only">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="field" placeholder="Shipped@2026" />
      </label>
      {state?.error && <p className="text-sm font-medium text-red-400">{state.error}</p>}
      <button className="btn btn-primary w-full justify-center !py-3" disabled={pending}>
        {pending && <Loader2 size={16} className="animate-spin" />} {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-xs text-faint">Demo: manager@shipped.demo or member@shipped.demo · Shipped@2026</p>
    </form>
  );
}
