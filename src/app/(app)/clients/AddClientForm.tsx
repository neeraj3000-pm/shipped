"use client";
import { useActionState, useEffect, useRef } from "react";
import { createClientAction } from "@/app/actions";

export function AddClientForm() {
  const [state, action, pending] = useActionState(createClientAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state && "ok" in state) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card mt-6 flex flex-wrap items-end gap-3 p-4">
      <label className="min-w-[180px] flex-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Client name</span>
        <input name="name" required className="field mt-1" placeholder="e.g. Atlas Sports" />
      </label>
      <label className="min-w-[220px] flex-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Contact email</span>
        <input name="contact_email" type="email" className="field mt-1" placeholder="product@client.com" />
      </label>
      <button className="btn btn-primary" disabled={pending}>Add client</button>
      {state && "error" in state && <p className="w-full text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
