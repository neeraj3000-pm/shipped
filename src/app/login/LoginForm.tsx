"use client";
import { useActionState } from "react";
import { login } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-5 space-y-3">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Email</span>
        <input name="email" type="email" required className="field mt-1" defaultValue="manager@shipped.demo" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <input name="password" type="password" required className="field mt-1" />
      </label>
      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      <button className="btn btn-primary w-full justify-center !py-2.5" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button>
    </form>
  );
}
