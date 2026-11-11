import Link from "next/link";
import { Logo } from "./Logo";
import { logout } from "@/app/actions";
import type { Profile } from "@/lib/types";
import { NavLinks } from "./NavLinks";
import { RoleSwitch } from "./RoleSwitch";
import { LogOut } from "lucide-react";

export function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="bg-navy text-ice">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs font-medium sm:px-6 sm:text-[13px]">
          <span>Live demo · data resets every night · no AI inside the app</span>
          <Link href="/about?src=app" className="font-semibold text-white underline-offset-4 hover:underline">How Shipped works →</Link>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="Shipped home"><Logo /></Link>
          <NavLinks variant="desktop" />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <RoleSwitch user={user} />
            <form action={logout}>
              <button className="btn btn-ghost !px-2.5 !py-1.5 text-sm" aria-label="Log out" title="Log out">
                <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
        <NavLinks variant="mobile" />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
