"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          LocalExplore
        </Link>
        <nav className="space-x-4">
          <Link href="/explore" className="text-sm">
            Explore
          </Link>
          <Link href="/plans" className="text-sm">
            Plans
          </Link>
          <Link href="/dashboard" className="text-sm">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
