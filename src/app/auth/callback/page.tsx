"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/partner";

        if (code) {
          const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Verify session is active
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session) {
          router.push(next);
        } else {
             // If no code and no session, maybe we just landed here?
             // But usually this page is hit with a code.
             // If implicit flow (hash), supabaseBrowser might have handled it already?
             if (!code) {
                 // Check if we have a session anyway
                 const { data: { user } } = await supabaseBrowser.auth.getUser();
                 if (user) {
                     router.push(next);
                     return;
                 }
             }
             // If really nothing...
             // Don't error immediately, wait a tick? 
             // But for now, let's assume if code exchange failed or no code, we might vary.
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Failed to verify account");
        // Redirect to login after a delay
        setTimeout(() => router.push("/login?error=Verification failed"), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <Card className="p-6 max-w-sm mx-auto mt-20 text-center border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold text-red-700">Verification Failed</h2>
        <p className="text-sm text-red-600 mt-2">{error}</p>
        <p className="text-xs text-gray-500 mt-4">Redirecting to login...</p>
      </Card>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="p-8 space-y-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Verifying your account...</p>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
