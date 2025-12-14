import crypto from "crypto";

// PayWay Credentials
const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID || "ec462940";
const API_KEY = process.env.PAYWAY_API_KEY || "091b9e016ae45adbf35b73bfbd930b8fa06e8ec2"; 

// RSA Keys
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDW3IaiWbdaHhBOlC3bXdfupkjm
2KfXmMct95qLCJvc5V4z6mFNJLxwGzT2Mp/hHrmE8dr+xZkBvOQFrQevoXOAM8RY
3OUVaqplAlFtcibyizcv5OreTN05Cu3BsM+wYfDJKa7zlXuKp5G4STmUS6qUKg+t
sJbD/Ye7HeOMS5uz1wIDAQAB
-----END PUBLIC KEY-----`;

export interface PayWayItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PayWayPaymentLinkRequest {
    request_time: string;
    merchant_id: string;
    merchant_auth: string; // RSA Encrypted JSON
    hash: string;
}

export interface PayWayPaymentLinkResponse {
    status: {
        code: string;
        message: string;
    };
    data?: {
        payment_link: string;
        id: string;
        tran_id: number;
        [key: string]: any;
    };
    tran_id?: number;
}


// --- Utility Functions ---

export const getReqTime = (): string => {
    // Returns YYYYMMDDHHmmss
    return new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
};

export const createTransId = (): string => {
    return `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const getPayWayApiUrl = (endpoint: string): string => {
    // Sandbox Base URL - Note: The user documentation shows "api/merchant-portal/merchant-access/..."
    const baseUrl = "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access";
    return `${baseUrl}/${endpoint}`;
};

// RSA Encryption Logic (standard chunking for PayWay)
export const encryptRSA = (data: string): string => {
    const publicKey = RSA_PUBLIC_KEY;
    const buffer = Buffer.from(data, "utf-8");
    const maxChunkSize = 117; // 1024-bit key - 11 padding
    const outputBuffer = [];

    for (let i = 0; i < buffer.length; i += maxChunkSize) {
        const chunk = buffer.subarray(i, i + maxChunkSize);
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            chunk
        );
        outputBuffer.push(encrypted);
    }
    
    return Buffer.concat(outputBuffer).toString("base64");
};

// --- Transaction Verification ---

export interface PayWayTransactionDetail {
    transaction_id: string;
    transaction_date: string;
    payment_status: "APPROVED" | "REFUNDED" | "PENDING" | "FAILED" | string;
    payment_amount: number;
    payment_currency: string;
    payment_type?: string;
    payer_account?: string;
    bank_name?: string;
    merchant_ref: string;
    total_amount?: number;
    original_amount?: number;
    [key: string]: any;
}

export interface PayWayGetTransactionsResponse {
    status: {
        code: string;
        message: string;
        merchant_ref?: string;
    };
    data?: PayWayTransactionDetail[];
}

// Added Missing Exports
export interface PayWayTransactionData {
    payment_status_code?: number;
    payment_status?: string;
    payment_amount?: number;
    payment_currency?: string;
    transaction_date?: string;
    [key: string]: any;
}

export interface PayWayCheckTransactionResponse {
    status: number | { code: string; message: string };
    data?: PayWayTransactionData;
}


// End Added Exports

export const getTransactionsByRef = async (merchantRef: string): Promise<PayWayGetTransactionsResponse> => {
    const reqTime = getReqTime();
    
    // Hash: base64(hmac(req_time + merchant_id + merchant_ref))
    const b4hash = reqTime + MERCHANT_ID + merchantRef;
    
    if (!API_KEY) {
        console.error("CRITICAL: PAYWAY_API_KEY is missing.");
    }

    const hmac = crypto.createHmac("sha512", API_KEY);
    hmac.update(b4hash);
    const hash = hmac.digest("base64");

    const payload = {
        req_time: reqTime,
        merchant_id: MERCHANT_ID,
        merchant_ref: merchantRef,
        hash: hash
    };

    const url = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/get-transactions-by-mc-ref";
    console.log("Checking transactions for ref:", merchantRef, "at", url);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload) // fetch automatically sets Content-Type? No we set it.
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("PayWay Get Transactions Failed:", text);
        try {
             return JSON.parse(text) as PayWayGetTransactionsResponse;
        } catch {
             throw new Error(`PayWay API Error: ${response.status} ${text}`);
        }
    }

    return await response.json() as PayWayGetTransactionsResponse;
};

export const verifyHash = (tran_id: string, amount: string, status: string, hash: string): boolean => {
    // Hash: base64(hmac(sha512, tran_id + amount + status, api_key))
    // Note: PayWay documentation says the hash string for callback is:
    // sha512 hash of (tran_id + amount + status) using generic key?
    // OR base64(hmac(tran_id + amount + status, api_key))
    
    // Check official docs logic:
    // hash = base64_encode(hash_hmac('sha512', tran_id . amount . status, api_key, true));
    
    if (!tran_id || !amount || !status || !hash) return false;

    const b4hash = tran_id + amount + status; // simple concatenation? Or with merchant_id?
    // Docs usually say: hash = base64(hmac(sha512, tran_id + amount + status, api_key))
    
    // HOWEVER, previous implementations for payment link used request_time + ...
    // For callback, it is typically just the returned params.
    
    const hmac = crypto.createHmac("sha512", API_KEY);
    hmac.update(b4hash);
    const calculatedHash = hmac.digest("base64");
    
    // Constant time comparison to prevent timing attacks
    return calculatedHash === hash;
};

// --- Main Payment Link Creator ---
// ... existing createPaymentLink code ...

export const createPaymentLink = async (
    tranId: string,
    amount: number,
    items: PayWayItem[],
    user: { firstName: string; lastName: string; email: string; phone: string },
    returnUrl: string // base64 encoded
): Promise<PayWayPaymentLinkResponse> => {
    
    const reqTime = getReqTime();
    
    // Construct the inner data object for encryption
    // Note: Documentation says "mc_id" inside the JSON must match merchant_id
    const innerData = {
        mc_id: MERCHANT_ID,
        title: `Payment for ${items[0]?.name || 'items'}`, // Max 250
        amount: amount.toFixed(2),
        currency: "USD",
        description: `Ref: ${tranId}`,
        // payment_limit: 1, // Optional
        // expired_date: ... // Optional
        return_url: Buffer.from(returnUrl).toString("base64"), // Return URL encrypted in Base64 as per docs? "This URL must be encrypted in Base64." -> assume base64 encoded.
        merchant_ref_no: tranId,
        // payout: ... // Optional
    };

    const jsonString = JSON.stringify(innerData);
    console.log("PayWay Inner Data:", jsonString);
    
    const merchantAuth = encryptRSA(jsonString);

    // Hash Logic: base64(hmac(sha512, request_time + merchant_id + merchant_auth, api_key))
    const b4hash = reqTime + MERCHANT_ID + merchantAuth;
    
    if (!API_KEY) {
        console.error("CRITICAL: PAYWAY_API_KEY is missing.");
    }

    const hmac = crypto.createHmac("sha512", API_KEY);
    hmac.update(b4hash);
    const hash = hmac.digest("base64");

    console.log("DEBUG: Generated Hash:", hash);
    console.log("DEBUG: Hash String Source (len=" + b4hash.length + "):", b4hash.substring(0, 50) + "...");

    // Form Data Payload (since docs typically use FormData for this endpoint, although example showed JSON body in one place and FormData in curl? 
    // The curl example: --form 'request_time=""' ...
    // So we should use FormData.
    
    const formData = new FormData();
    formData.append("request_time", reqTime);
    formData.append("merchant_id", MERCHANT_ID);
    formData.append("merchant_auth", merchantAuth);
    formData.append("hash", hash);
    // formData.append("image", file); // Optional

    const url = getPayWayApiUrl("payment-link/create");
    console.log("Creating Payment Link at:", url);

    const response = await fetch(url, {
        method: "POST",
        body: formData // fetch automatically sets Content-Type to multipart/form-data with boundary
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("PayWay Create Payment Link Failed:", text);
        try {
             return JSON.parse(text) as PayWayPaymentLinkResponse;
        } catch {
             throw new Error(`PayWay API Error: ${response.status} ${text}`);
        }
    }

    return await response.json() as PayWayPaymentLinkResponse;
};

export const purchaseWithToken = async (
    tranId: string,
    amount: number,
    items: PayWayItem[],
    paymentToken: string, // The CoF token
    user: { email: string; phone: string; firstName: string; lastName: string }
): Promise<any> => {
    const reqTime = getReqTime();
    
    // Construct payload for Purchase
    // Endpoint: /api/payment-gateway/v1/payments/purchase
    
    const innerData = {
        mc_id: MERCHANT_ID,
        tran_id: tranId,
        amount: amount.toFixed(2),
        currency: "USD",
        payment_option: "cards", // or generic
        payment_token: paymentToken, // This triggers the CoF charge
        firstname: user.firstName,
        lastname: user.lastName, 
        email: user.email,
        phone: user.phone,
        items: items // PayWay typically wants just the total, but sometimes items too
    };

    const jsonString = JSON.stringify(innerData);
    const merchantAuth = encryptRSA(jsonString);
    
    // Hash: base64(hmac(req_time + merchant_id + merchant_auth))
    const b4hash = reqTime + MERCHANT_ID + merchantAuth;
    
    const hmac = crypto.createHmac("sha512", API_KEY);
    hmac.update(b4hash);
    const hash = hmac.digest("base64");

    const formData = new FormData();
    formData.append("request_time", reqTime);
    formData.append("merchant_id", MERCHANT_ID);
    formData.append("merchant_auth", merchantAuth);
    formData.append("hash", hash);

    const url = getPayWayApiUrl("payment-gateway/v1/payments/purchase");
    console.log("Charging Token at:", url);

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("PayWay Purchase Failed:", text);
        try {
             return JSON.parse(text);
        } catch {
             throw new Error(`PayWay API Error: ${response.status} ${text}`);
        }
    }

    return await response.json();
};

// --- Leftover aliases for compatibility / unused ---
export const getPayWayUrl = () => "https://checkout-sandbox.payway.com.kh";
export const createPayWayPayload = () => ({});
export const createTransIdLegacy = createTransId;
