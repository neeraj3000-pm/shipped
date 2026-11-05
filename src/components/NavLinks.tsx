"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Releases" },
  { href: "/clients", label: "Clients" },
  { href: "/settings/connect", label: "Connect Claude" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" || path.startsWith("/releases") : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-ice-50 text-brand" : "text-slate-600 hover:text-navy"}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
