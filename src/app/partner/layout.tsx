"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PartnerHeader from "@/components/PartnerHeader";
import PartnerSidebar from "@/components/PartnerSidebar";
import supabaseBrowser from "@/lib/supabaseClient";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPartner, setIsPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Allow signup page to bypass all protection
  if (pathname === "/partner/signup") {
    return <>{children}</>;
  }

  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        // 1. Check local session first (faster & reliable after login)
        const { data: { user } } = await supabaseBrowser.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        // 2. Check if user is partner from metadata (no API call needed if metadata is fresh)
        // If metadata is stale, we might need the API, but let's try metadata first.
        const isPartnerFlagged = user.user_metadata?.is_partner === true;
        
        if (isPartnerFlagged) {
           setIsPartner(true);
           setLoading(false); // fast path!

           // Background verification / ensure partner record exists
           apiFetch("/api/partner/profile").then(async (res) => {
             if (!res?.success) {
               console.log("Creating missing partner record...");
               await apiFetch("/api/partner/profile", { method: "POST", body: JSON.stringify({}) });
             }
           });
           
        } else {
           // Fallback: Check API if metadata says false (maybe updated recently?)
           try {
             const res = await apiFetch("/api/users/profile");
             // If the API confirms they are a partner, update local state
             if (res?.success && res.data?.profile?.is_partner) {
                setIsPartner(true);
             } else {
                // Definitely not a partner
             }
           } catch (apiErr) {
             console.error("Profile check failed", apiErr);
           }
           setLoading(false);
        }

      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Unable to verify your account. Please log in again.");
        setLoading(false);
      }
    };

    checkPartnerStatus();
  }, [router]);

  const handleJoin = async () => {
    setJoinLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/partner/profile", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (res?.success) {
        setIsPartner(true);
        router.refresh();
      } else {
        setError(res?.error || "Could not join partner program.");
      }
    } catch (err) {
      console.error("Join partner error:", err);
      setError("Something went wrong while joining.");
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );

  if (!isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-xl w-full p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Partner with us</h1>
            <p className="text-gray-600">
              Create a partner account to manage your business profile,
              locations, analytics, subscriptions, and billing in one place.
            </p>
          </div>
          {error ? (
            <div className="p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <Button
            onClick={handleJoin}
            disabled={joinLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {joinLoading ? "Creating partner account..." : "Join as Partner"}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Need help? Email us at support@localexplore.com
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PartnerHeader />
      <div className="flex h-screen bg-gray-50">
        <PartnerSidebar />
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </>
  );
}
