import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="animate-page max-w-md text-center">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <p className="mt-10 font-mono text-sm font-semibold text-sky">404</p>
        <h1 className="headline mt-2 text-4xl text-fg">This page didn&apos;t ship.</h1>
        <p className="mt-3 text-muted">The link may be old, or the release was removed. Client portal links are private and must be copied exactly.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go to releases</Link>
          <Link href="/about" className="btn btn-ghost">About Shipped</Link>
        </div>
      </div>
    </div>
  );
}
