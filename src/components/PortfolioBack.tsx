"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PORTFOLIO_URL } from "@/lib/demo";

const KEY = "shipped:from-portfolio";
const PORTFOLIO_ORIGIN = new URL(PORTFOLIO_URL).origin;

/**
 * True only for visitors who arrived from Neeraj's portfolio: either via a link tagged
 * ?ref=portfolio, or with the portfolio as the referrer. Remembered for the browser tab
 * (sessionStorage), so it survives moving between /about, /login and the app.
 */
export function useFromPortfolio() {
  const [from, setFrom] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tagged = params.get("ref") === "portfolio";
      const referred = document.referrer.startsWith(PORTFOLIO_ORIGIN);
      if (tagged || referred) sessionStorage.setItem(KEY, "1");
      setFrom(tagged || referred || sessionStorage.getItem(KEY) === "1");
    } catch {
      setFrom(false);
    }
  }, []);
  return from;
}

export function PortfolioBack({ variant = "header", className = "" }: { variant?: "header" | "footer"; className?: string }) {
  const from = useFromPortfolio();
  if (!from) return null;
  return variant === "header" ? (
    <a href={PORTFOLIO_URL} className={`btn btn-ghost !px-3 !py-1.5 text-sm ${className}`}><ArrowLeft size={15} /> Portfolio</a>
  ) : (
    <a href={PORTFOLIO_URL} className={`btn !px-5 !py-3 text-base text-white ring-1 ring-white/30 hover:bg-white/10 ${className}`}>
      <ArrowLeft size={17} /> Back to Neeraj&apos;s portfolio
    </a>
  );
}

/** Renders nothing; records a portfolio visit on whichever page the visitor lands. */
export function PortfolioRefTracker() {
  useFromPortfolio();
  return null;
}
