import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { verifyHash, PayWayHashParams } from "@/lib/payway";

// Shared Logic for processing payment data
interface PaymentProcessResult {
    success: boolean;
    message: string;
    status: number;
    isSuccess?: boolean;
}

// Shared Logic for processing payment data
async function processPaymentData(params: any): Promise<PaymentProcessResult> {
    const {
      tran_id,
      status,
      hash,
      return_params
    } = params;

    if (!tran_id) {
       return { success: false, message: "Transaction ID missing", status: 400 };
    }

    const hashParams: PayWayHashParams = {
        req_time: params.req_time || '',
        merchant_id: params.merchant_id || process.env.PAYWAY_MERCHANT_ID!,
        tran_id: tran_id,
        amount: params.amount || '',
        items: params.items || '',
        shipping: params.shipping || '',
        firstname: params.firstname || '',
        lastname: params.lastname || '',
        email: params.email || '',
        phone: params.phone || '',
        type: params.type || '',
        payment_option: params.payment_option || '',
        return_url: params.return_url || '',
        cancel_url: params.cancel_url || '',
        continue_success_url: params.continue_success_url || '',
        return_deeplink: params.return_deeplink || '',
        currency: params.currency || '',
        custom_fields: params.custom_fields || '',
        return_params: return_params || '',
        payout: params.payout || '',
        lifetime: params.lifetime || '',
        additional_params: params.additional_params || '',
        google_pay_token: params.google_pay_token || '',
        skip_success_page: params.skip_success_page || ''
    };

    // Verify Hash
    const isValid = verifyHash(hashParams, hash);
    if (!isValid) {
        console.error("Callback Hash Mismatch for ID:", tran_id);
        return { success: false, message: "Invalid Signature", status: 400 };
    }

    const isSuccess = status === '0' || status === '00' || status === 'success';

    // Update Supabase
    const supabase = createSupabaseServiceRole();
    
    // Update Transaction
    const { error } = await supabase.from("transactions").update({
        status: isSuccess ? "completed" : "failed",
        payment_status: isSuccess ? "APPROVED" : "FAILED",
        raw_response: params
    }).eq("tran_id", tran_id);

    if (error) {
        console.error("Error updating transaction:", error);
        return { success: false, message: "DB Error", status: 500 };
    }

    // Update User Role if Success
    if (isSuccess && return_params) {
        try {
            const parsed = typeof return_params === 'string' ? JSON.parse(return_params) : return_params;
            const userUuid = parsed.userUuid; 
            const planId = parsed.planId || "premium";

            if (userUuid) {
               console.log(`Upgrading user ${userUuid} to ${planId}`);
               const { data: profile } = await supabase.from("profiles").select("id").eq("auth_uid", userUuid).single();
               
               if (profile) {
                   const { data: partner } = await supabase.from("partners").select("id").eq("profile_id", profile.id).single();
                   
                   if (partner) {
                       await supabase.from("partners").update({
                           subscription_plan_id: planId,
                           subscription_status: 'active',
                           subscription_start_date: new Date().toISOString(),
                           subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                       }).eq("id", partner.id);
                   }
               }
            }
        } catch (e) {
            console.error("Failed to parse return_params or update user:", e);
        }
    }
    
    return { success: true, message: "Updated", status: 200, isSuccess };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = await processPaymentData(params);

    if (!result.success && result.status !== 200) {
        return new NextResponse(result.message, { status: result.status || 400 });
    }

    const isSuccess = result.isSuccess;
    const tran_id = params.tran_id;

    // Return HTML page
    return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment ${isSuccess ? 'Successful' : 'Failed'}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .icon { font-size: 48px; margin-bottom: 20px; }
              .success { color: green; }
              .error { color: red; }
              .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="icon ${isSuccess ? 'success' : 'error'}">
              ${isSuccess ? '✓' : '✗'}
            </div>
            <h1>Payment ${isSuccess ? 'Successful' : 'Failed'}</h1>
            <p>Transaction ID: ${tran_id}</p>
            <p>${isSuccess ? 'Your subscription has been updated.' : 'Please try again.'}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/partner/subscriptions" class="btn">Return to Dashboard</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (err: any) {
    console.error("Callback GET Error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        let body: any;
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            body = await req.json();
        } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            body = {};
            formData.forEach((value, key) => {
                body[key] = value.toString();
            });
        } else {
             return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
        }

        console.log("PayWay Webhook received:", body);
        
        const result = await processPaymentData(body);

        return NextResponse.json(
            { 
               status: result.success ? "success" : "failed", 
               message: result.message 
            }, 
            { status: result.status || 200 }
        );

    } catch (e: any) {
        console.error("Callback POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
