"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result: any = await signIn(email, password);
      const user = result?.user || result?.data?.user;

      // Check if user is a partner
      const isPartner = user?.user_metadata?.is_partner === true;
      
      if (isPartner) {
        router.push("/partner");
      } else {
        router.push("/explore");
      }
    } catch (err: any) {
      console.warn("Login warn:", err);
      // Handle "Email not confirmed" specifically if Supabase returns that string
      if (err.message?.includes("Email not confirmed")) {
        setError("Please verify your email address before logging in.");
      } else if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Welcome back! Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>

           <div className="relative my-4">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-white px-2 text-gray-500">Business</span>
             </div>
          </div>

          <p className="text-sm text-center text-gray-600">
            <a href="/partner/signup" className="text-orange-600 hover:underline font-medium">
              Create a Partner Account
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
