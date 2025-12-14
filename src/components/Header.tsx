"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Compass, 
  Layout, 
  Heart, 
  Sparkles, 
  Menu, 
  X,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null); // Should define proper type later
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Determine role
  const isPartner = user?.user_metadata?.is_partner === true;

  const navItems = [
    { name: "Home", href: "/", icon: Layout, show: true },
    { name: "Destinations", href: "/explore", icon: MapPin, show: true },
    { name: "AI Planner", href: "/generate-plan", icon: Sparkles, show: !isPartner },
    { name: "Bucket List", href: "/bucket-list", icon: Heart, show: !isPartner },
    { name: "Partner Dashboard", href: "/partner", icon: Layout, show: isPartner },
  ];

  if (pathname?.startsWith("/partner")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Explorer Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
          <div className="space-y-1 px-4 py-4">
            {navItems.filter(item => item.show).map((item) => {
               const Icon = item.icon;
               const isActive = pathname === item.href;
               return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                     isActive 
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
               {!isLoading && (
                <>
                  {user ? (
                    <div className="space-y-2">
                      <Link 
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                         <User className="h-5 w-5" />
                         Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                     <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
