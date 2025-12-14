"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function PartnerPage() {
  const router = useRouter();

  useEffect(() => {
    // If we land here, the Layout has already determined if we are a partner or not.
    // If we ARE a partner (layout rendered children), we should go to dashboard.
    // If we are NOT a partner (layout showed join screen), we theoretically wouldn't see this 
    // unless the layout didn't block rendering. 
    // But importantly, having this page prevents the 404.
    
    // Let's just redirect to dashboard. The layout handles the "not logged in" state 
    // by not rendering children (and thus not rendering this page), OR by showing the join screen.
    // However, if the layout *does* render children (because we are logged in), 
    // we want to go to the dashboard, not sit on an empty page.
    
    router.replace("/partner/dashboard");
  }, [router]);

  return null; 
}
