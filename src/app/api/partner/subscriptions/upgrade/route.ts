import { NextRequest, NextResponse } from "next/server"; // trigger rebuild
import { createTransId, PayWayItem, createPaymentLink } from "@/lib/payway";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

// Subscriptions configuration
const SUBSCRIPTION_PRICES: Record<string, number> = {
  starter: 29.00,
  growth: 79.00,
  professional: 199.00,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, user } = body; 

    if (!planId || !SUBSCRIPTION_PRICES[planId]) {
      return NextResponse.json(createErrorResponse("Invalid plan ID"), { status: 400 });
    }

    const price = SUBSCRIPTION_PRICES[planId];
    const tranId = createTransId();
    
    // Items
    const items: PayWayItem[] = [
      { name: `${planId} Subscription`, quantity: 1, price: price }
    ];

    // User details 
    const userDetails = user || {
      firstName: "Partner",
      lastName: "User",
      email: "partner@example.com",
      phone: "012345678"
    };

    // DB Insert
    const supabase = createSupabaseServiceRole();
    
    
    // Priority 1: Search by User ID (auth_uid) - This is the most reliable method
    let userId = null;
    if (userDetails.id) {
        const { data: profileById } = await supabase.from("profiles").select("auth_uid").eq("auth_uid", userDetails.id).single();
        if (profileById) {
            userId = profileById.auth_uid;
        }
    }

    // Priority 2: Fallback to email search if ID lookup failed
    if (!userId) {
        const { data: profileByEmail } = await supabase.from("profiles").select("id, auth_uid").eq("email", userDetails.email).single();
        userId = profileByEmail?.auth_uid || null;
    }

    // specific fix for missing profiles: duplicate the logic to create if not found
    if (!userId && userDetails.id) {
        console.log("Profile not found, auto-creating for:", userDetails.email);
        const { data: newProfile, error: createError } = await supabase.from("profiles").insert({
            auth_uid: userDetails.id,
            email: userDetails.email,
            full_name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
            display_name: userDetails.firstName,
            is_partner: true // Assuming they are becoming a partner if they are upgrading
        }).select("auth_uid").single();

        if (newProfile) {
            userId = newProfile.auth_uid;
        } else {
            console.error("Failed to auto-create profile:", createError);
        }
    }

    if (userId) {
       const { error: insertError } = await supabase.from("transactions").insert({
           user_id: userId,
           tran_id: tranId,
           amount: price,
           currency: "USD",
           plan: planId,
           status: "pending",
           payment_amount: price,
           metadata: { user_details: userDetails }
       });
       
       if (insertError) {
           console.error("Failed to create transaction record:", insertError);
           // We might strip return here or just log. Failing to record the transaction is bad practice though.
           return NextResponse.json(createErrorResponse("Failed to initialize transaction"), { status: 500 });
       }
    } else {
        console.warn("Could not link transaction to a user profile (email not found & creation failed):", userDetails.email);
        // creating without user_id might fail if column is not null. 
        // Assuming we need a user.
        return NextResponse.json(createErrorResponse("User profile not found. Please contact support."), { status: 404 });
    }

    // We use the return route which eventually might handle status updates, 
    // or we can use the callback route.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/payway/callback`; 

    let paymentResponse;
    try {
        paymentResponse = await createPaymentLink(
            tranId,
            price,
            items,
            userDetails,
            callbackUrl
        );
    } catch (apiError: any) {
        console.error("Failed to create payment link:", apiError);
        return NextResponse.json(createErrorResponse("Failed to create payment link"), { status: 500 });
    }

    if (!paymentResponse || !paymentResponse.status || paymentResponse.status.code !== "00") {
         console.error("PayWay Payment Link Error:", paymentResponse);
         return NextResponse.json(createErrorResponse(paymentResponse?.status?.message || "Payment Gateway Error"), { status: 500 });
    }

    // Success - we have a link
    // Frontend expects: { data: { ... }, url: string } maybe? Or we just adhere to our SuccessResponse structure
    return NextResponse.json(createSuccessResponse({
        url: paymentResponse.data?.payment_link,
        full_response: paymentResponse
    }));

  } catch (error: any) {
    console.error("PayWay Init Error:", error);
    return NextResponse.json(createErrorResponse("Internal Server Error"), { status: 500 });
  }
}
