import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PortfolioRefTracker } from "@/components/PortfolioBack";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

const url = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "Shipped · Client-ready release notes", template: "%s · Shipped" },
  description: "Claude writes your release notes. Your team approves them. Each client gets a private release history. No AI inside the app.",
  openGraph: { title: "Shipped", description: "Claude writes the release notes. Shipped gets them approved.", url, siteName: "Shipped", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport = { themeColor: "#1B365D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans min-h-screen">
        <PortfolioRefTracker />
        {children}
      </body>
    </html>
  );
}
