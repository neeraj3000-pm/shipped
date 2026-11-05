export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-8 w-8" : "h-7 w-7";
  const text = size === "lg" ? "text-xl" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${box} grid place-items-center rounded-lg bg-navy`}>
        <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="#A0E0EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className={`${text} font-extrabold tracking-tight text-navy`}>Shipped</span>
    </span>
  );
}
