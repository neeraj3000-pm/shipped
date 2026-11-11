"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-sm"
      onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {done ? "Copied" : label}
    </button>
  );
}
