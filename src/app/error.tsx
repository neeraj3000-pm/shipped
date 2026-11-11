"use client";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="animate-page max-w-md text-center">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <h1 className="headline mt-10 text-3xl text-ink">Something went wrong.</h1>
        <p className="mt-3 text-slate-600">It&apos;s probably a hiccup talking to the database. Try again in a moment.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-ghost">Go to releases</Link>
        </div>
      </div>
    </div>
  );
}
