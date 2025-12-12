import Link from "next/link";
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Settings, 
  BarChart, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            Explorer Hub
          </Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Partner Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
           <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
             <LayoutDashboard className="h-5 w-5" /> Overview
           </Link>
           <Link href="/dashboard/listings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
             <Map className="h-5 w-5" /> Listings
           </Link>
           <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
             <BarChart className="h-5 w-5" /> Analytics
           </Link>
           <Link href="/dashboard/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
             <Users className="h-5 w-5" /> Customers
           </Link>
           <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
             <Settings className="h-5 w-5" /> Settings
           </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
             <LogOut className="h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
