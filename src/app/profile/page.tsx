"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Settings } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
     return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / User Info */}
        <Card className="md:col-span-1 h-fit">
           <CardHeader className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-3xl">
                 {user.email?.[0].toUpperCase()}
              </div>
              <CardTitle>{user.email?.split('@')[0]}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {}}>
                 <Settings className="h-4 w-4" /> Settings
              </Button>
               <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
                 <LogOut className="h-4 w-4" /> Logout
              </Button>
           </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
           <Card>
              <CardHeader>
                 <CardTitle>Account Details</CardTitle>
                 <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Your display name" />
                 </div>
                 <Button>Save Changes</Button>
              </CardContent>
           </Card>

            <Card>
              <CardHeader>
                 <CardTitle>Preferences</CardTitle>
                 <CardDescription>Customize your explorer experience</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-gray-500">Language and notification settings coming soon.</p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
