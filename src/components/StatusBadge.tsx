import { STATUS_LABEL, type Status } from "@/lib/types";

const STYLE: Record<Status, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  in_review: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  sent: "bg-ice-50 text-brand ring-ice",
};
const DOT: Record<Status, string> = {
  draft: "bg-slate-400",
  in_review: "bg-amber-500",
  approved: "bg-emerald-500",
  sent: "bg-brand",
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
    <span className="inline-flex items-center gap-1.5 text-sm text-navy">
      <span className="grid h-5 w-5 place-items-center rounded-md bg-[#F3E9E2] text-[11px] font-bold text-[#C15F3C]">✳</span>
      Claude via MCP
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-ice-50 text-[11px] font-bold text-brand">{by[0]?.toUpperCase()}</span>
      {by}
    </span>
  );
}
