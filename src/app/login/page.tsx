import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><Logo size="lg" /></div>
        <div className="card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-navy">Log in</h1>
          <p className="mt-1 text-sm text-slate-500">Client-ready release notes, written by your Claude.</p>
          <LoginForm />
        </div>
        <div className="mt-4 rounded-xl border border-line bg-white/60 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Demo accounts</p>
          <p className="mt-1">Manager: manager@shipped.demo / Shipped@2026</p>
          <p>Team member: member@shipped.demo / Shipped@2026</p>
        </div>
      </div>
    </div>
  );
}
