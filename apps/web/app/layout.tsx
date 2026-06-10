import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cube Trainer — Learn Rubik's Cube Algorithms in 3D",
  description:
    "Interactive 3D Rubik's cube algorithm trainer for Beginner, F2L, OLL and PLL. Animate, step through and master every algorithm.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            🧊 Cube Trainer
          </Link>
          <nav className="site-nav">
            <Link href="/learn">Learn</Link>
            <Link href="/account">Account</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <span>Local-first · Works offline · Optional cloud sync</span>
        </footer>
      </body>
    </html>
  );
}
