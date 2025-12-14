"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, createUserProfile, createPartnerProfile } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PartnerSignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the new API for robust signup
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          companyName,
          phone: contactPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // If we got a session back (auto-confirm enabled), we can sign in client-side or just redirect
      // Note: The API created the user, but the CLIENT needs the session cookie.
      // If the API returns a session, we can set it via supabase.auth.setSession? 
      // Or simply login with the password again to establish the client session.
      
      const session = data.data?.session;
      
      if (session) {
         // We have a session, let's establish it client-side
         // But setSession is for existing sessions. 
         // Easiest is to sign in via password now that account exists.
         const { error: signInError } = await import("@/lib/supabaseClient").then(m => m.supabaseBrowser.auth.signInWithPassword({ email, password }));
         if (signInError) {
             console.error("Auto-login failed:", signInError);
             // Fallback to login page
              router.push("/login?message=Account created! Please log in.");
              return;
         }
         window.location.href = "/partner"; 
      } else {
         // No session (email confirmation required)
         router.push("/login?message=Account created! Please check your email to verify your account.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Partner Sign Up</CardTitle>
          <CardDescription>
            Create a partner account to manage your business locations and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Company Name (Optional)</label>
              <Input
                type="text"
                placeholder="Your Business Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Contact Phone (Optional)</label>
              <Input
                type="tel"
                placeholder="+855 12 345 678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating partner account..." : "Sign Up as Partner"}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>

            <p className="text-sm text-center text-gray-600">
              Want to explore instead?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up as Explorer
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

