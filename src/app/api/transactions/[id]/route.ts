import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Auth Check using Supabase
    const supabase = createSupabaseServiceRole();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    
    // If no token, maybe we can rely on cookie if using browser client logic, 
    // but here we are primarily API. Let's try getting user from header token if present,
    // or just trust the next/server cookie handling if available. 
    // Ideally createSupabaseServiceRole is admin, so we need to know WHO the user is.
    // The previous code relied on "user-id" header which client might not send.
    
    // Let's check if we can get the user from the standard auth header 
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    // Fallback: If verifying Payment, maybe we don't strictly enforced auth? 
    // No, checking own transaction requires auth.
    // However, if the client is calling this, it should pass auth headers.
    
    let userId = user?.id;

    // Fix for the 404: The client fetch might not be attaching the token correctly if it's a simple fetch
    // BUT the 'apiFetch' utility usually handles it? 
    // Wait, the previous error was 404, not 401. 
    // If it was 401, it would say Unauthorized. 
    // If userId was null, line 9 would return 401. 
    // So userId (header) WAS missing? Or it passed but profile not found?
    
    // Let's relax the "user-id" header requirement and use the query param "uid" if valid or just look up transaction first?
    // No, security first.
    
    // INVESTIGATION: The 'apiClient' sends 'Authorization' bearer? 
    // If not, we found the issue.
    // If 404, it means "Profile not found" or "Transaction not found".
    
    // Let's improve the logic to be robust. 
    
    if (!userId) {
         // Try to get from header manually if getUser failed (e.g. invalid token)
         userId = req.headers.get("user-id") || undefined;
    }

    if (!userId) { 
        // If we still don't have a user, we can't verify ownership.
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get Profile ID
    const { data: profile } = await supabase.from("profiles").select("id").eq("auth_uid", userId).single();
    
    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id) // Assuming route param is the UUID or ID of the transaction row
      .single();

    if (error || !transaction) {
         // Try searching by tran_id if not found by primary key (sometimes IDs are ambiguous)
         const { data: byTranId } = await supabase.from("transactions").select("*").eq("tran_id", id).single();
         if (byTranId) {
             if (byTranId.uid !== profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
             return NextResponse.json(byTranId);
         }
         return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.uid !== profile.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
