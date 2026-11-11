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
    { role: "manager" as Role, title: "Continue as Manager", desc: "Priya · reviews, approves and sends", Icon: ShieldCheck, tint: "bg-navy text-ice" },
    { role: "member" as Role, title: "Continue as Team member", desc: "Arjun · edits drafts and submits for review", Icon: PencilLine, tint: "bg-ice-50 text-brand" },
  ];
  return (
    <div className="mt-6 space-y-3">
      {opts.map(({ role, title, desc, Icon, tint }) => (
        <button
          key={role}
          onClick={() => go(role)}
          disabled={pending}
          className="lift group flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left disabled:opacity-60"
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tint}`}>
            {pending && which === role ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-navy">{title}</span>
            <span className="block text-sm text-slate-500">{desc}</span>
          </span>
          <ArrowRight size={18} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
        </button>
      ))}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <p className="text-xs text-slate-400">You can switch roles any time from the top-right menu.</p>
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Email</span>
        <input name="email" type="email" required autoComplete="username" className="field mt-1" placeholder="manager@shipped.demo" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="field mt-1" placeholder="Shipped@2026" />
      </label>
      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      <button className="btn btn-primary w-full justify-center !py-2.5" disabled={pending}>
        {pending && <Loader2 size={16} className="animate-spin" />} {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-xs text-slate-400">Demo: manager@shipped.demo or member@shipped.demo · Shipped@2026</p>
    </form>
  );
}
