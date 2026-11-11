"use client";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Status } from "@/lib/types";

// Stage timeline for the looping hero animation.
// 0 prompt · 1 claude thinking · 2 drafts appear · 3 in review · 4 approved · 5 sent
const STEPS = [1400, 1300, 1700, 1300, 1300, 2600];
const STATUS_AT: Status[] = ["draft", "draft", "draft", "in_review", "approved", "sent"];

const TICKETS = [
  { id: "PLAT-412", t: "4K HDR delivery profile (StreamCo)", skip: false },
  { id: "PLAT-418", t: "Subtitle sync drift fixed (all)", skip: false },
  { id: "PLAT-425", t: "Kannada & Tamil in XML feed (Nova TV)", skip: false },
  { id: "PLAT-427", t: "Refactored S3 upload retries (internal)", skip: true },
  { id: "PLAT-436", t: "Upgraded Postgres (internal)", skip: true },
];

const DRAFTS = [
  { client: "StreamCo", title: "4K HDR delivery and smoother subtitles", ids: ["PLAT-412", "PLAT-418", "PLAT-421", "PLAT-430"] },
  { client: "Nova TV", title: "Regional languages in your feed", ids: ["PLAT-425", "PLAT-418", "PLAT-421", "PLAT-430"] },
];

export function HeroDemo() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage(5); return; }
    const t = setTimeout(() => setStage((s) => (s + 1) % STEPS.length), STEPS[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const status = STATUS_AT[stage];
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-label="Animated example: Claude drafts release notes, Shipped routes them to approval" role="img">
      {/* Claude window */}
      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgb(27_54_93/0.45)]">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-[#F3E9E2] text-[11px] font-bold text-[#C15F3C]">✳</span>
          Claude · Shipped connector on
        </div>
        <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-sm bg-canvas p-3 text-[12.5px] leading-relaxed text-slate-700">
          <p className="font-semibold text-navy">Draft v2.14 notes for StreamCo and Nova TV. Only what affects each client.</p>
          <ul className="mt-2 space-y-0.5 font-mono text-[11px]">
            {TICKETS.map((k) => (
              <li key={k.id} className={`transition-all duration-500 ${stage >= 1 && k.skip ? "text-slate-400 line-through" : ""}`}>
                {k.id} {k.t}
              </li>
            ))}
          </ul>
        </div>
        <div className={`mt-3 text-[12.5px] text-slate-600 transition-opacity duration-500 ${stage >= 1 ? "opacity-100" : "opacity-0"}`}>
          {stage === 1 ? (
            <span className="inline-flex items-center gap-2">
              <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C15F3C]" style={{ animationDelay: `${i * 120}ms` }} />)}</span>
              Skipping 2 internal tickets · calling <code className="text-brand">create_release_draft</code>
            </span>
          ) : (
            <span>Done. <b className="text-navy">2 drafts created</b> in Shipped, one per client.</span>
          )}
        </div>
      </div>

      {/* Shipped drafts */}
      <div className="relative -mt-2 ml-6 space-y-2.5 sm:ml-10">
        {DRAFTS.map((d, i) => (
          <div
            key={d.client}
            className={`rounded-xl border border-line bg-white p-3 shadow-lg transition-all duration-500 ${stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: stage === 2 ? `${i * 160}ms` : "0ms" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{d.client} · v2.14</span>
              <span key={status} className="animate-pop inline-flex"><StatusBadge status={status} /></span>
            </div>
            <p className="mt-1 text-sm font-bold text-ink">{d.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {d.ids.map((id) => <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{id}</span>)}
            </div>
          </div>
        ))}
        <div className={`absolute -right-2 -top-4 rounded-full bg-navy px-3 py-1.5 text-[11px] font-semibold text-ice shadow-lg transition-all duration-500 sm:-right-6 ${stage >= 4 ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
          {stage === 5 ? "Live on each client's portal" : "Approved by Priya (Manager)"}
        </div>
      </div>
    </div>
  );
}
