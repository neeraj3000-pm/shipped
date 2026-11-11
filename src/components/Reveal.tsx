"use client";
import { useEffect, useRef } from "react";

/** Fades children in when they scroll into view. */
export function Reveal({ children, className = "", i = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; i?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    // @ts-expect-error polymorphic ref
    <Tag ref={ref} className={`reveal min-w-0 ${className}`} style={{ ["--i" as string]: i }}>
      {children}
    </Tag>
  );
}
