import { STATUS_LABEL, type Status } from "@/lib/types";

const STYLE: Record<Status, string> = {
  draft: "bg-white/[0.06] text-soft ring-white/10",
  in_review: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  approved: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  sent: "bg-sky/10 text-sky ring-sky/30",
};
const DOT: Record<Status, string> = {
  draft: "bg-muted",
  in_review: "bg-amber-400 shadow-[0_0_8px_rgb(251_191_36/0.8)]",
  approved: "bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.8)]",
  sent: "bg-sky shadow-[0_0_8px_rgb(96_193_229/0.9)]",
};

export function StatusBadge({ status, large }: { status: Status; large?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-semibold ${STYLE[status]} ${large ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function CreatedBy({ by }: { by: string }) {
  const claude = by.toLowerCase().startsWith("claude");
  return claude ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-soft">
      <span className="grid h-5 w-5 place-items-center rounded-md bg-[#C15F3C]/20 text-[11px] font-bold text-[#E8956F]">✳</span>
      Claude via MCP
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-soft">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-sky/15 text-[11px] font-bold text-sky">{by[0]?.toUpperCase()}</span>
      {by}
    </span>
  );
}
