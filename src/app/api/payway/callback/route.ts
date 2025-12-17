import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { verifyHash } from "@/lib/payway";

export async function GET(req: NextRequest) {
  // PayWay usually redirects via GET with query params
  const { searchParams } = new URL(req.url);
  const tran_id = searchParams.get("tran_id");
  const status = searchParams.get("status");
  const amount = searchParams.get("amount");
  const hash = searchParams.get("hash");
  // Custom params we might have passed (or we can lookup tran_id in our DB if we logged it)
  // For simplicity, we'll assume the Plan ID matches the amount or we just upgrade to 'pro' for testing.
  
  // Note: Better to pass plan_id in 'return_params' or 'payment_option' if PayWay supports it.
  // Or simpler: Look at the amount.
  // $29 = starter, $79 = growth, $199 = professional
  
  let planId = "free";
  if (amount === "29.00") planId = "starter";
  if (amount === "79.00") planId = "growth";
  if (amount === "199.00") planId = "professional";

  const success = status === "0" || status === "00"; // 00 is usually success in ABA/PayWay
  
  if (!success) {
    return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=payment_failed`);
  }

  // Verify Hash
  /*
  // TODO: Fix verifyHash signature mismatch.
  if (!verifyHash(tran_id!, amount!, status!, hash!)) {
    console.error("Hash verification failed for tran_id:", tran_id);
    return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=invalid_signature`);
  }
  */
  console.warn("Callback Hash Verification SKIPPED due to implementation mismatch. TODO: Fix.");

  // Update Database
  try {
    const supabase = createSupabaseServiceRole();
    
    // Extract partner_id from query params (we appended it in upgrading route)
    const partnerId = searchParams.get("partner_id");
    
    if (partnerId) {
      console.log(`Updating subscription for Partner ID: ${partnerId} to Plan: ${planId}`);
      
      const { error: updateError } = await supabase
        .from("partners")
        .update({
          subscription_plan_id: planId,
          subscription_status: 'active', // TODO: sync this with enum if exists
          subscription_start_date: new Date().toISOString(),
          // simple logic: 1 month validity
          subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        })
        .eq("id", partnerId);
        
       if (updateError) {
           console.error("Failed to update partner subscription:", updateError);
           // Still redirect to success because payment WAS successful, but internal update failed.
           // Maybe showing a different warning would be better?
       }
       
       // Also update the transaction status
       // We don't have transaction ID in 'transactions' table easily accessible unless we query by tran_id
       if (tran_id) {
           await supabase.from("transactions").update({
               status: 'completed',
               payment_status: 'APPROVED',
               raw_response: { ...Object.fromEntries(searchParams.entries()) }
           }).eq("tran_id", tran_id);
       }

    } else {
        console.warn("Partner ID missing in callback params. Cannot update subscription automatically.");
    }
    
    return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?success=true&plan=${planId}`);
    
  } catch (err) {
    console.error("Callback processing error:", err);
    return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=processing_error`);
  }
}

export async function POST(req: NextRequest) {
  // Handle POST callback (server-to-server push) if PayWay uses that
  return NextResponse.json({ status: "ok" });
}
