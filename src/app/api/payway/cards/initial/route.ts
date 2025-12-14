import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import crypto from "crypto";
import { createTransId } from "@/lib/payway";

const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID || "ec462940";
const API_KEY = process.env.PAYWAY_API_KEY || "091b9e016ae45adbf35b73bfbd930b8fa06e8ec2";
// PayWay uses SECRET_KEY for HMAC hash generation (different from API_KEY)
const SECRET_KEY = process.env.PAYWAY_SECRET_KEY || API_KEY; // Fallback to API_KEY if no SECRET_KEY

// Diagnostic logging
console.log("🔑 Key Diagnostics:");
console.log("API_KEY length:", API_KEY?.length);
console.log("SECRET_KEY length:", SECRET_KEY?.length);
console.log("Using same key for both:", API_KEY === SECRET_KEY); 

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }
    
    // We expect subscriptionId in body to link this card to
    const { subscriptionId } = await req.json();

    const supabase = createSupabaseServiceRole();
    
    // Get User Details for pre-fill
    // Ideally we fetch from profiles/partners
    const { data: profile } = await supabase
       .from("profiles")
       .select("email, full_name, id")
       .eq("auth_uid", userId)
       .single();

    const { data: partner } = await supabase
       .from("partners")
       .select("contact_phone, id")
       .eq("profile_id", profile?.id)
       .single();

    const firstName = profile?.full_name?.split(" ")[0] || "Partner";
    const lastName = profile?.full_name?.split(" ").slice(1).join(" ") || "User";
    const email = profile?.email || "email@example.com";
    const phone = partner?.contact_phone || "0123456789";

    // CTID: Card Transaction ID - Must be unique for each attempt
    // Must be alphanumeric and unique for every request
    const ctid = `txn${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Return Param: Pass subscriptionId and partnerId for callback processing
    // CRITICAL: PayWay requires Base64 encoding for both hash generation AND form field
    const returnParamObj = { 
      subscriptionId, 
      partnerId: partner?.id 
    };
    
    // Convert to JSON string first, then Base64 encode
    const returnParamJson = JSON.stringify(returnParamObj);
    const returnParamBase64 = Buffer.from(returnParamJson).toString("base64");
    
    // Validate Base64 encoding (should NOT contain {, }, ", :)
    if (returnParamBase64.includes("{") || returnParamBase64.includes("}")) {
      console.error("❌ CRITICAL: returnParam is NOT Base64 encoded!");
      console.error("Raw JSON:", returnParamJson);
      console.error("Invalid Base64:", returnParamBase64);
      throw new Error("Base64 encoding failed");
    }

    // Amount & Currency: REQUIRED for PayWay CoF Initial
    // Even though this is card linking, PayWay treats it as a zero-amount transaction
    const amount = "0.00";
    const currency = "USD";

    // Hash Construction for CoF Initial
    // Official docs show: merchant_id + ctid + return_param
    // But trying with amount + currency added (like other PayWay endpoints)
    const hashSource = [
      MERCHANT_ID,
      ctid,
      amount,
      currency,
      returnParamBase64
    ].join("");
    
    console.log("--- PayWay CoF Initial Debug ---");
    console.log("MerchantID:", MERCHANT_ID);
    console.log("MerchantID Length:", MERCHANT_ID.length);
    console.log("CTID:", ctid);
    console.log("CTID Length:", ctid.length);
    console.log("Amount:", amount);
    console.log("Amount Length:", amount.length);
    console.log("Currency:", currency);
    console.log("Currency Length:", currency.length);
    console.log("ReturnParam (JSON):", returnParamJson);
    console.log("ReturnParam (Base64):", returnParamBase64);
    console.log("ReturnParam (Base64) Length:", returnParamBase64.length);
    console.log("Hash Source:", hashSource);
    console.log("Hash Source Length:", hashSource.length);
    console.log("Expected Length:", 
      MERCHANT_ID.length + 
      ctid.length + 
      amount.length + 
      currency.length + 
      returnParamBase64.length
    );
    
    // Validate no trailing whitespace
    if (hashSource !== hashSource.trim()) {
      console.error("❌ CRITICAL: Hash source contains whitespace!");
      console.error("Original length:", hashSource.length);
      console.error("Trimmed length:", hashSource.trim().length);
      throw new Error("Hash source contains trailing whitespace");
    }
    
    // Generate HMAC-SHA512 hash with explicit UTF-8 encoding
    // CRITICAL: Use SECRET_KEY for hash generation, NOT API_KEY
    const hash = crypto
      .createHmac("sha512", SECRET_KEY)
      .update(hashSource, "utf8")
      .digest("base64");
    
    console.log("Hash generated with SECRET_KEY length:", SECRET_KEY.length);
    
    console.log("Generated Hash:", hash);
    console.log("✅ Hash generated successfully");
    console.log("--------------------------------");
    
    // Success URL (Callback)
    // This is where PayWay redirects the user AFTER they click "Done"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/payway/cards/callback`; 

    // PayWay API URL
    const paywayUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial";

    // Return the payload for the frontend form
    return NextResponse.json(createSuccessResponse({
        actionUrl: paywayUrl,
        fields: {
            merchant_id: MERCHANT_ID,
            ctid: ctid,
            amount: amount,
            currency: currency,
            return_param: returnParamBase64,
            firstname: firstName,
            lastname: lastName,
            email: email,
            phone: phone,
            continue_add_card_success_url: callbackUrl,
            hash: hash
        }
    }));

  } catch (error: any) {
    console.error("CoF Initial Error:", error);
    return NextResponse.json(createErrorResponse("Failed to initialize card linking"), { status: 500 });
  }
}
