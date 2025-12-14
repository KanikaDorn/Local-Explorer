import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { purchaseWithToken, PayWayItem, createTransId } from "@/lib/payway";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // PayWay CoF Callback Params
  // They likely send payment_token, ctid, or we can use the return_param to link it back
  // User snippet says: "details of the token... will be sent via this URL"
  const paymentToken = searchParams.get("payment_token");
  const returnParamRaw = searchParams.get("return_param");
  const ctid = searchParams.get("ctid"); // confirm token id?
  
  // Note: If PayWay sends POST to return_url, we need a separate POST handler. 
  // But typically for browser redirects (continue_add_card_success_url) it's GET.
  // The snippet says "return_url" gets token info, "continue_add_card_success_url" redirects user.
  // We used SAME URL for both. So we might get GET or POST. 
  // Let's assume GET for now or check method.
  
  // Need to handle missing params if the user just clicked "Done" without success?
  if (!returnParamRaw) {
      // Typically an error or manual navigation
      return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=missing_params`);
  }
  
  try {
      let returnData: any = {};
      try {
          // PayWay might not URL encode? or might?
          returnData = JSON.parse(returnParamRaw);
      } catch (e) {
          console.error("Failed to parse return_param:", returnParamRaw);
      }
      
      const { subscriptionId, partnerId } = returnData;
      
      if (!subscriptionId) {
           return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=invalid_ref`);
      }
      
      const supabase = createSupabaseServiceRole();
      
      // 1. Fetch Subscription to charge
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*, profiles(email, full_name, phone)") // get user details for charge
        .eq("id", subscriptionId)
        .single();
        
      if (!subscription) {
          return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=sub_not_found`);
      }

      // 2. Validate Token
      // If we don't have a token, maybe the linking failed?
      if (!paymentToken) {
           console.warn("No payment_token received. User might have cancelled or failed.");
           return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=no_token`);
      }
      
      // 3. Perform Initial Charge
      const price = subscription.metadata?.amount || 29.00; // Fallback or fetch from tier
      // Re-calculate price based on tier to be safe
      const PRICES: any = { starter: 29.00, growth: 79.00, professional: 199.00 };
      const actualPrice = PRICES[subscription.tier] || 29.00;
      
      const tranId = createTransId();
      
      const items: PayWayItem[] = [
          { name: `${subscription.tier} Subscription (Initial)`, quantity: 1, price: actualPrice }
      ];
      
      const userDetails = {
          email: subscription.profiles?.email || "",
          phone: subscription.profiles?.phone || "",
          firstName: subscription.profiles?.full_name?.split(" ")[0] || "Partner",
          lastName: subscription.profiles?.full_name?.split(" ").slice(1).join(" ") || ""
      };
      
      console.log(`Charging CoF Token for Sub ${subscriptionId}: ${actualPrice} USD`);
      
      const chargeResult = await purchaseWithToken(
          tranId,
          actualPrice,
          items,
          paymentToken,
          userDetails
      );
      
      if (chargeResult?.status?.code === "00") {
          // Success!
          // 4. Update Subscription
          await supabase
            .from("subscriptions")
            .update({
                status: "active",
                started_at: new Date().toISOString(),
                // Store token for recurring
                payment_token_id: paymentToken, 
                metadata: {
                    ...subscription.metadata,
                    last_charge_status: "success",
                    payment_token: paymentToken // backup in metadata
                }
            })
            .eq("id", subscriptionId);
            
          // 5. Record Payment
          // Write to 'transactions' (User's table) 
          await supabase.from("transactions").insert({
               user_id: subscription.profiles?.auth_uid || subscription.profile_id, // assuming transactions uses user_id (text/uuid)
               tran_id: tranId, // Use the new tran_id for the charge
               amount: actualPrice,
               currency: "USD",
               plan: subscription.tier,
               status: 'completed',
               payment_status: 'APPROVED',
               payment_date: new Date().toISOString(),
               metadata: { 
                   source: "payway_cof", 
                   subscription_id: subscriptionId 
               }
          });

          // Write to 'payments' (New schema) - Optional backup
          await supabase.from("payments").insert({
              profile_id: subscription.profile_id,
              subscription_id: subscription.id,
              provider: "payway_cof",
              provider_ref: tranId,
              amount: actualPrice,
              currency: "USD",
              status: "completed",
              raw_response: chargeResult
          });
          
          return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?success=active&plan=${subscription.tier}`);
          
      } else {
          console.error("Charge Failed:", chargeResult);
           // 4b. Update Subscription to failed/pending
          await supabase
            .from("subscriptions")
            .update({
                status: "payment_failed",
                 metadata: {
                    ...subscription.metadata,
                    last_charge_status: "failed",
                    last_error: chargeResult?.status?.message
                }
            })
            .eq("id", subscriptionId);
            
          return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=charge_failed`);
      }

  } catch (err) {
      console.error("Callback Error:", err);
      return NextResponse.redirect(`${req.nextUrl.origin}/partner/subscriptions?error=server_error`);
  }
}

// Handle POST too if PayWay sends POST (often happens for webhooks)
export async function POST(req: NextRequest) {
    // Should parse form body if POST
    // For now we assume GET redirect as per success_url flow
    return GET(req);
}
