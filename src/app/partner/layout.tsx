"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PartnerHeader from "@/components/PartnerHeader";
import PartnerSidebar from "@/components/PartnerSidebar";

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

  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        const res = await apiFetch("/api/users/profile");
        if (res?.success && res.data?.profile) {
          const isPartnerFlagged = !!res.data.profile.is_partner;
          setIsPartner(isPartnerFlagged);

          // If user is flagged as partner but doesn't have a partner record yet, create it
          if (isPartnerFlagged) {
            try {
              const partnerRes = await apiFetch("/api/partner/profile");
              // If partner record doesn't exist (404 or error), create it
              if (!partnerRes?.success) {
                await apiFetch("/api/partner/profile", {
                  method: "POST",
                  body: JSON.stringify({}),
                });
              }
            } catch (partnerErr) {
              // Try to create partner record if it doesn't exist
              try {
                await apiFetch("/api/partner/profile", {
                  method: "POST",
                  body: JSON.stringify({}),
                });
              } catch (createErr) {
                console.error("Failed to create partner record:", createErr);
              }
            }
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Unable to verify your account. Please log in again.");
      } finally {
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
