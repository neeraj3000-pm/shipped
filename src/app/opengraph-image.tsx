import { ImageResponse } from "next/og";

export const alt = "Shipped: Claude writes the release notes. Shipped gets them approved.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const badge = (label: string, bg: string, fg: string) => (
    <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: bg, color: fg, fontSize: 24, fontWeight: 700 }}>{label}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, backgroundColor: "#060c17", backgroundImage: "radial-gradient(circle at 85% 0%, rgba(0,90,156,0.55), transparent 55%), radial-gradient(circle at 0% 100%, rgba(27,54,93,0.9), transparent 55%)", color: "#eef6fa", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundImage: "linear-gradient(135deg, #A0E0EF, #60C1E5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(96,193,229,0.6)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#1B365D" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>shipped</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Claude writes the release notes.</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#60C1E5" }}>Shipped gets them approved.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {badge("Draft", "#142036", "#c9d6e3")}
          {badge("In review", "#3a2e10", "#fcd34d")}
          {badge("Approved", "#0f3b2e", "#6ee7b7")}
          {badge("Sent", "#eef6fa", "#03070e")}
        </div>
      </div>
    ),
    size,
  );
}
