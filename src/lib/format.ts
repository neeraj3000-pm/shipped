import { SECTIONS, type Release } from "./types";

export function fmtDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });
}

export function relTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(iso);
}

export function emailFor(r: Pick<Release, "version" | "title" | "summary" | "items">, clientName: string, portalUrl?: string) {
  const subject = `${clientName}: Release ${r.version} – ${r.title}`;
  const lines: string[] = [`Hi ${clientName} team,`, "", r.summary.trim(), ""];
  for (const s of SECTIONS) {
    const items = r.items.filter((i) => i.section === s.key);
    if (!items.length) continue;
    lines.push(s.label.toUpperCase());
    for (const i of items) lines.push(`• ${i.text}${i.ticket_id ? ` (${i.ticket_id})` : ""}`);
    lines.push("");
  }
  if (portalUrl) lines.push(`Your full release history: ${portalUrl}`, "");
  lines.push("Best regards,");
  const body = lines.join("\n");
  return { subject, body, full: `Subject: ${subject}\n\n${body}` };
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "client";
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
