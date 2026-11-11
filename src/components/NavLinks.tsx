"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Releases" },
  { href: "/clients", label: "Clients" },
  { href: "/settings/connect", label: "Connect Claude" },
  { href: "/about?src=app", label: "About" },
];

export function NavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" || path.startsWith("/releases") : path.startsWith(href.split("?")[0]);
  if (variant === "mobile")
    return (
      <nav className="flex gap-1 overflow-x-auto border-t border-white/[0.06] px-3 py-2 md:hidden" aria-label="Main">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${isActive(l.href) ? "bg-fg text-pill" : "text-muted"}`}>
            {l.label}
          </Link>
        ))}
      </nav>
    );
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href}
          className={`rounded-full px-3.5 py-1.5 text-[15px] font-medium transition-colors ${isActive(l.href) ? "text-sky" : "text-soft hover:text-fg"}`}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
