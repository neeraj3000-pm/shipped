import Link from "next/link";
import { Logo } from "./Logo";
import { logout } from "@/app/actions";
import type { Profile } from "@/lib/types";
import { NavLinks } from "./NavLinks";

export function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
          <Link href="/"><Logo /></Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-navy leading-tight">{user.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role === "manager" ? "Manager · can approve" : "Team member"}</div>
            </div>
            <form action={logout}>
              <button className="btn btn-ghost !py-1.5 text-sm">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
