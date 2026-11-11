import { ImageResponse } from "next/og";

export const alt = "Shipped: Claude writes the release notes. Shipped gets them approved.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const badge = (label: string, bg: string, fg: string) => (
    <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: bg, color: fg, fontSize: 24, fontWeight: 700 }}>{label}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#1B365D", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#A0E0EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#1B365D" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>Shipped</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Claude writes the release notes.</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#60C1E5" }}>Shipped gets them approved.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {badge("Draft", "#E2E8F0", "#334155")}
          {badge("In review", "#FEF3C7", "#92400E")}
          {badge("Approved", "#D1FAE5", "#065F46")}
          {badge("Sent", "#A0E0EF", "#1B365D")}
        </div>
      </div>
    ),
    size,
  );
}
