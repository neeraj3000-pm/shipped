"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { switchRole } from "@/app/actions";
import type { Profile, Role } from "@/lib/types";

const PERSONAS: { role: Role; name: string; desc: string }[] = [
  { role: "member", name: "Arjun · Team member", desc: "Edits drafts and submits them for review" },
  { role: "manager", name: "Priya · Manager", desc: "Approves, copies the email and marks it sent" },
];

/** Demo helper: see the app as either persona without logging out. */
export function RoleSwitch({ user }: { user: Profile }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-line bg-white py-1 pl-1 pr-2 text-left transition-colors hover:border-slate-300"
      >
        <span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${user.role === "manager" ? "bg-navy text-ice" : "bg-ice-50 text-brand"}`}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : user.name[0]}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-navy">{user.name.split(" (")[0]}</span>
          <span className="block text-xs text-slate-500">{user.role === "manager" ? "Manager · can approve" : "Team member"}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="animate-toast absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">View the demo as</p>
          {PERSONAS.map((p) => {
            const current = p.role === user.role;
            return (
              <button
                key={p.role}
                role="menuitem"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  if (!current) start(async () => { await switchRole(p.role, path); });
                }}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${current ? "bg-ice-50" : "hover:bg-canvas"}`}
              >
                <span className="mt-0.5 w-4 shrink-0 text-brand">{current && <Check size={16} />}</span>
                <span>
                  <span className="block text-sm font-semibold text-navy">{p.name}</span>
                  <span className="block text-xs text-slate-500">{p.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
