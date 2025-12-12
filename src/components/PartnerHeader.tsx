"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Settings, LogOut } from "lucide-react";

export default function PartnerHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/partner" className="font-bold text-xl text-blue-600">
          LocalExplore Partners
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/partner/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/partner/locations"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Locations
          </Link>
          <Link
            href="/partner/analytics"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Analytics
          </Link>
          <Link
            href="/partner/profile"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && user && (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">Partner</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                  >
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1">
                      <Link
                        href="/partner/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
