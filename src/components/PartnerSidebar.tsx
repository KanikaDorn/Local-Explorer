"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Briefcase,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/partner/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Locations",
    href: "/partner/locations",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    label: "Analytics",
    href: "/partner/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: "Profile",
    href: "/partner/profile",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    label: "Subscriptions",
    href: "/partner/subscriptions",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: "Billing",
    href: "/partner/billing",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-50 to-white border-r h-screen sticky top-16 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group",
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t mt-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get unlimited locations and advanced analytics
          </p>
          <Link
            href="/partner/subscriptions"
            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition text-center block"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </aside>
  );
}
