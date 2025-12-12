"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await apiFetch("/api/users/profile");
        if (res?.success && res.data?.is_admin) {
          setIsAdmin(true);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );

  if (!isAdmin)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Access denied. Administrators only.</p>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Admin Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Platform management</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              📊 Dashboard
            </button>
          </Link>
          <Link href="/admin/users">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              👥 User Management
            </button>
          </Link>
          <Link href="/admin/moderation">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              🔍 Content Moderation
            </button>
          </Link>
          <Link href="/admin/analytics">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              📈 Analytics
            </button>
          </Link>
          <Link href="/admin/payments">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              💳 Payments
            </button>
          </Link>
          <Link href="/admin/system">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              ⚙️ System Settings
            </button>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <Link href="/">
            <button className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
              ← Back to Explorer
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
