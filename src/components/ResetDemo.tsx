"use client";
import { useState, useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { resetDemoAction } from "@/app/actions";

export function ResetDemo() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {confirm ? (
        <>
          <span className="text-sm text-muted">Restore the original demo releases? Anything added will be removed.</span>
          <button className="btn btn-primary !py-1.5 text-sm" disabled={pending}
            onClick={() => start(async () => { const r = await resetDemoAction(); setConfirm(false); setMsg(r.ok ? r.message ?? "Done." : r.error); })}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Yes, reset
          </button>
          <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => setConfirm(false)} disabled={pending}>Cancel</button>
        </>
      ) : (
        <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => { setMsg(null); setConfirm(true); }}>
          <RotateCcw size={14} /> Reset demo data
        </button>
      )}
      {msg && <span className="text-sm font-medium text-emerald-300">{msg}</span>}
    </div>
  );
}
