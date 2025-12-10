import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Menu, Globe, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-linear-to-r from-zinc-50 to-white dark:from-black dark:to-zinc-900 shadow-sm py-4 px-6 flex items-center justify-between rounded-b-xl">
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="font-bold text-xl text-primary">LocalExplore</span>
        </Link>
        <div className="hidden md:flex gap-2 ml-6">
          <Link href="/explore">
            <Button variant="ghost">Explore</Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost">Map</Button>
          </Link>
          <Link href="/plans">
            <Button variant="ghost">Plans</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/partner">
            <Button variant="ghost">Partner</Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" aria-label="Language Switcher">
          <Globe className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Profile">
          <User className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}

// Placeholder for mobile menu (future expansion)
// TODO: Implement mobile menu drawer for navigation
