import { Button, Card } from "@/components/ui";
import Link from "next/link";
import {
  MapPin,
  Search,
  Sparkles,
  BarChart,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-linear-to-br from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      <Card className="w-full max-w-2xl p-8 rounded-xl shadow-lg bg-white dark:bg-zinc-950">
        <h1 className="text-4xl font-bold text-center mb-4 text-primary">
          LocalExplore
        </h1>
        <p className="text-lg text-center text-zinc-600 dark:text-zinc-300 mb-6">
          AI-Powered Phnom Penh Experiences Hub
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link href="/explore">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <Search className="w-5 h-5" /> Explore
            </Button>
          </Link>
          <Link href="/map">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <MapPin className="w-5 h-5" /> Map
            </Button>
          </Link>
          <Link href="/plans">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <Sparkles className="w-5 h-5" /> Plans
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <BarChart className="w-5 h-5" /> Dashboard
            </Button>
          </Link>
          <Link href="/partner">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <Building2 className="w-5 h-5" /> Partner
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              className="w-full flex gap-2 justify-center"
              variant="outline"
            >
              <ShieldCheck className="w-5 h-5" /> Admin
            </Button>
          </Link>
        </div>
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} LocalExplore. All rights reserved.
        </div>
      </Card>
    </section>
  );
}
