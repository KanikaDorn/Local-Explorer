"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, createUserProfile } from "@/lib/auth";
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
      // Step 1: Create user account
      const result: any = await signUp(email, password);
      const user = result?.user || result?.data?.user || null;
      
      if (!user) {
        throw new Error("Failed to create user account");
      }

      // Step 2: Create profile with partner role
      try {
        await createUserProfile(user.id, email, fullName || "", UserRole.PARTNER);
      } catch (profileErr) {
        console.error("Error creating profile after signup:", profileErr);
        throw new Error("Failed to create partner profile");
      }

      // Step 3: Create partner record
      // We need to get the auth token to make authenticated requests
      // For now, redirect to login and let them join via the partner layout
      // Or we could try to sign them in automatically
      
      // Redirect to login with a message
      router.push("/login?message=Account created! Please sign in to complete partner setup");
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

