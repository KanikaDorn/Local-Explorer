"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-600">
          LocalExplore
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Explore
          </Link>
          {user && (
            <>
              <Link
                href="/plans"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                My Plans
              </Link>
              <Link
                href="/bucket-list"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bucket List
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {user.email}
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
