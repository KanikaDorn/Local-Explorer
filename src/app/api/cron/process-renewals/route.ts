import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { purchaseWithToken, createTransId } from "@/lib/payway";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

// This route should be protected by a secret query param or header
// e.g. /api/cron/process-renewals?secret=MY_CRON_SECRET
const CRON_SECRET = process.env.CRON_SECRET || "local_dev_secret";

const SUBSCRIPTION_PRICES: Record<string, number> = {
  starter: 29.00,
  growth: 79.00,
  professional: 199.00,
};

export async function GET(req: NextRequest) {
    // 1. Auth Check - simplistic strict check
    const authHeader = req.headers.get("Authorization");
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(createErrorResponse("Unauthorized Cron"), { status: 401 });
    }

    const supabase = createSupabaseServiceRole();
    const now = new Date();

    try {
        // 2. Query subscriptions due for renewal
        const { data: subscriptions, error: subError } = await supabase
            .from("subscriptions")
            .select("*, profiles(email, full_name, phone)")
            .eq("status", "active")
            .eq("auto_renew", true)
            .lte("renewal_date", now.toISOString()); // Due now or in past

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json(createSuccessResponse({ message: "No subscriptions due", processed: 0 }));
        }

        const results = [];

        // 3. Process each
        for (const sub of subscriptions) {
            try {
                // Check if we have a payment token (CoF) for this subscription or profile?
                // Assuming payment_token is stored on subscription or a separate 'payment_methods' table
                // For simplicity, let's assume it's on the subscription record or we fetch the default method.
                
                // Let's look for the default payment method
                 const { data: paymentMethod } = await supabase
                    .from("payment_methods")
                    .select("token, type")
                    .eq("profile_id", sub.profile_id)
                    .eq("is_default", true)
                    .single();

                if (!paymentMethod || !paymentMethod.token) {
                    console.error(`Subscription ${sub.id} has no default payment method.`);
                    results.push({ id: sub.id, status: "failed", reason: "no_payment_method" });
                    
                    // Update subscription status to 'past_due'
                    await supabase.from("subscriptions").update({ status: 'past_due' }).eq("id", sub.id);
                    continue;
                }

                const price = SUBSCRIPTION_PRICES[sub.tier] || 0;
                if (price <= 0) {
                     // Free tier? just renew
                     // ... logic
                     continue;
                }

                // Charge
                const tranId = createTransId();
                const profile = sub.profiles; // single object due to join? check supabase types. Usually it's an array unless mapped?
                // Assuming profiles is an object here
                const user = {
                     email: (profile as any)?.email || "n/a",
                     phone: (profile as any)?.phone || "n/a",
                     firstName: ((profile as any)?.full_name || "").split(" ")[0] || "Partner",
                     lastName: ((profile as any)?.full_name || "").split(" ").slice(1).join(" ") || "User"
                };

                const chargeRes = await purchaseWithToken(
                    tranId, 
                    price, 
                    [{ name: `${sub.tier} Renewal`, price, quantity: 1 }], 
                    paymentMethod.token, 
                    user
                );

                if (chargeRes && (chargeRes.status === 0 || chargeRes.status?.code === "00")) {
                     // Success
                     const nextRenewal = new Date(now);
                     nextRenewal.setMonth(nextRenewal.getMonth() + 1); // Only monthly for now

                     await supabase.from("subscriptions").update({
                         renewal_date: nextRenewal.toISOString(),
                         updated_at: new Date().toISOString()
                     }).eq("id", sub.id);
                     
                     // Record Transaction
                     await supabase.from("transactions").insert({
                         tranId,
                         user_id: sub.user_id, // ensure user_id is on sub
                         amount: price,
                         status: 'completed',
                         payment_status: 'renewal_success',
                         updated_at: new Date().toISOString()
                     });

                     results.push({ id: sub.id, status: "success", tranId });
                } else {
                     // Failed
                     results.push({ id: sub.id, status: "failed", reason: chargeRes?.status?.message || "Charge failed" });
                     await supabase.from("subscriptions").update({ status: 'past_due' }).eq("id", sub.id);
                }

            } catch (err: any) {
                console.error(`Error processing sub ${sub.id}:`, err);
                results.push({ id: sub.id, status: "error", error: err.message });
            }
        }

        return NextResponse.json(createSuccessResponse({ processed: results.length, results }));

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json(createErrorResponse(error.message), { status: 500 });
    }
}
