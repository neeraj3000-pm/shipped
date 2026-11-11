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
      <p className="mx-auto max-w-6xl px-4 pt-3 text-center text-xs text-faint sm:px-6">
        Live demo · data resets nightly · no AI inside the app ·{" "}
        <Link href="/about?src=app" className="font-semibold text-sky hover:underline">how Shipped works</Link>
      </p>
      {/* Floating pill navigation */}
      <header className="sticky top-3 z-30 mx-auto mt-3 max-w-6xl px-3 sm:px-6">
        <div className="rounded-[28px] bg-pill/90 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/[0.06] backdrop-blur-xl">
          <div className="flex h-16 items-center gap-6 pl-5 pr-2.5 sm:pl-7">
            <Link href="/" aria-label="Shipped home"><Logo /></Link>
            <NavLinks variant="desktop" />
            <div className="ml-auto flex items-center gap-2">
              <RoleSwitch user={user} />
              <form action={logout}>
                <button className="btn btn-ghost !px-3 !py-2 text-sm" aria-label="Log out" title="Log out">
                  <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
                </button>
              </form>
            </div>
          </div>
          <NavLinks variant="mobile" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
