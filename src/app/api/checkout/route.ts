import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { generateHash, getReqTime, createTransId, getPayWayApiUrl, PayWayHashParams } from "@/lib/payway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "USD",
      firstname,
      lastname,
      email,
      phone,
      items = [],
      payment_option = "cards", // This might need to be 'abapay_khqr' or 'abapay800' depending on what PayWay expects for QR.
      // But based on screenshot 165, 'cards' returned 'qrImage'.
      return_params
    } = body;

    // Validate required fields
    if (!amount || !firstname || !lastname || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: amount, firstname, lastname, email, phone" },
        { status: 400 }
      );
    }

    const merchantId = process.env.PAYWAY_MERCHANT_ID!;
    const apiKey = process.env.PAYWAY_API_KEY!;
    const apiUrl = getPayWayApiUrl(); // This is the API endpoint

    if (!merchantId || !apiKey) {
        return NextResponse.json({ error: "Server configuration error: Merchant ID or API Key missing" }, { status: 500 });
    }

    const tranId = createTransId();
    const reqTime = getReqTime();
    const formattedAmount = parseFloat(amount).toFixed(2);
    const itemsEncoded = items.length > 0
      ? Buffer.from(JSON.stringify(items)).toString('base64')
      : '';
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`; 

    const hashParams: PayWayHashParams = {
      req_time: reqTime,
      merchant_id: merchantId,
      tran_id: tranId,
      amount: formattedAmount,
      items: itemsEncoded,
      shipping: '',
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone,
      type: 'purchase',
      payment_option: payment_option,
      return_url: callbackUrl,
      cancel_url: '',
      continue_success_url: callbackUrl, 
      return_deeplink: '',
      currency: currency,
      custom_fields: '',
      return_params: return_params || '',
      payout: '',
      lifetime: '',
      additional_params: '',
      google_pay_token: '',
      skip_success_page: ''
    };

    const hash = generateHash(hashParams);

    // Construct FormData for the API Call
    const formData = new FormData();
    formData.append("req_time", hashParams.req_time);
    formData.append("merchant_id", hashParams.merchant_id);
    formData.append("tran_id", hashParams.tran_id);
    formData.append("amount", hashParams.amount);
    formData.append("items", hashParams.items);
    formData.append("hash", hash);
    formData.append("firstname", hashParams.firstname);
    formData.append("lastname", hashParams.lastname);
    formData.append("email", hashParams.email);
    formData.append("phone", hashParams.phone);
    formData.append("type", hashParams.type);
    formData.append("payment_option", hashParams.payment_option);
    formData.append("currency", hashParams.currency);
    formData.append("return_url", hashParams.return_url);
    formData.append("continue_success_url", hashParams.continue_success_url);
    if (hashParams.return_params) formData.append("return_params", hashParams.return_params);
    // Add other fields if necessary, but these are the main ones signed.
    
    // Server-Side Fetch to PayWay
    console.log("Sending request to PayWay API:", apiUrl);
    const paywayRes = await fetch(apiUrl, {
        method: "POST",
        body: formData, // fetch handles multipart/form-data boundary automatically
    });

    const paywayData = await paywayRes.json();
    console.log("PayWay API Response:", paywayData);

    // Check PayWay response status
    if (paywayData.status?.code !== "00") {
         return NextResponse.json({ 
             success: false, 
             error: paywayData.description || paywayData.status?.message || "PayWay API Error",
             details: paywayData
         });
    }

    // Save PENDING transaction to Supabase
    // We do this AFTER a successful API call ensures the transaction is valid at PayWay
    const supabase = createSupabaseServiceRole();
    let userId = null;
    if (return_params) {
        try {
            const parsed = typeof return_params === 'string' ? JSON.parse(return_params) : return_params;
            userId = parsed.userUuid; 
        } catch (e) {}
    }

    if (userId) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("auth_uid", userId).single();
        if (profile) {
            await supabase.from("transactions").insert({
                uid: profile.id,
                tran_id: tranId,
                amount: formattedAmount,
                currency: currency,
                status: "pending",
                payment_option: payment_option,
                description: "Premium Subscription",
                created_at: new Date().toISOString(),
                raw_response: paywayData // Store initials details
            });
        }
    }

    // Return the PayWay data (containing qrImage, deeplink, etc) to Frontend
    return NextResponse.json({
        success: true,
        transactionId: tranId,
        ...paywayData 
    });

  } catch (error: any) {
    console.error("Checkout System Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
