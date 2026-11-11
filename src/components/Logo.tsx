export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const text = size === "lg" ? "text-xl" : "text-[1.05rem]";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${box} grid place-items-center rounded-[10px] bg-gradient-to-br from-ice to-sky shadow-[0_0_20px_rgb(96_193_229/0.45)]`}>
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="#0B1A30" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className={`${text} font-display font-semibold tracking-tight text-fg`}>shipped</span>
    </span>
  );
}
