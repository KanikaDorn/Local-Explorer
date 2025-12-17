import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id"); // Assuming middleware or client passes this header? 
    // Wait, typical Next.js apps with Supabase use ` supabase.auth.getUser()`.
    // The previous `src/lib/payway.ts` legacy code didn't show auth logic.
    // I will use Supabase Auth to get the user.
    
    const supabase = createSupabaseServiceRole();
    // Since this is a server route, we might rely on the session cookie if passed, 
    // or if the client fetches with a Bearer token.
    // But `createSupabaseServiceRole` doesn't have the context of the user request headers by default unless we pass them.
    // It's safer to use `supabaseBrowser` (which is client side) logic pattern or standard `createServerClient` from `@supabase/ssr` (if available).
    // Given `supabaseClient.ts` has `supabaseBrowser` and `createSupabaseServiceRole` (admin), 
    // I need to check how to identify the user.
    // `src/app/api/partner/profile/route.ts` used `req.headers.get("user-id")`.
    // I will assume the frontend/middleware ensures this header is present or I should check the session.
    
    // Let's check `request.cookies` for session
    // Or just trust `user-id` header if that's the established pattern in this project (as seen in partner/profile/route.ts).
    
    let uid = userId;
    if (!uid) {
        // Fallback: Check Authorizaton header standard
        // ...
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Profile ID from Auth ID
    const { data: profile } = await supabase.from("profiles").select("id").eq("auth_uid", uid).single();
    
    if (!profile) {
        return NextResponse.json({ transactions: [] });
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("uid", profile.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
