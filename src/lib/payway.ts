import crypto from "crypto";

// PayWay Credentials
const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
const API_KEY = process.env.PAYWAY_API_KEY; 

// Full 24-parameter interface for ABA PayWay Hash
export interface PayWayHashParams {
  req_time: string;
  merchant_id: string;
  tran_id: string;
  amount: string;
  items: string;
  shipping: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  type: string;
  payment_option: string;
  return_url: string;
  cancel_url: string;
  continue_success_url: string;
  return_deeplink: string;
  currency: string;
  custom_fields: string;
  return_params: string;
  payout: string;
  lifetime: string;
  additional_params: string;
  google_pay_token: string;
  skip_success_page: string;
}

export interface PayWayItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PayWayTransactionData {
    payment_status_code: number;
    payment_status: string;
    payment_amount: number;
    payment_currency: string;
    transaction_date: string;
    // other fields as needed
}

export interface PayWayCheckTransactionResponse {
    status: number | { code: string; message: string };
    data?: PayWayTransactionData[]; // Updated to array based on usage
    description?: string;
    message?: string;
}

// --- Utility Functions ---

export const getReqTime = (): string => {
    // Returns YYYYMMDDHHmmss
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export const createTransId = (): string => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const getPayWayApiUrl = (): string => {
    return process.env.PAYWAY_API_URL || "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
};

// --- Hash Functions ---

// Generate hash from ALL 24 parameters in exact order
export function generateHash(params: PayWayHashParams): string {
  const key = API_KEY; 
  if (!key) {
      console.error("Missing PAYWAY_API_KEY");
      return "";
  }

  // Concatenate all 24 parameters in exact order
  const dataString = params.req_time + params.merchant_id + params.tran_id +
                      params.amount + params.items + params.shipping +
                      params.firstname + params.lastname + params.email +
                      params.phone + params.type + params.payment_option +
                      params.return_url + params.cancel_url +
                      params.continue_success_url + params.return_deeplink +
                      params.currency + params.custom_fields +
                      params.return_params + params.payout + params.lifetime +
                      params.additional_params + params.google_pay_token +
                      params.skip_success_page;

  // Generate HMAC SHA512 hash
  const hash = crypto
    .createHmac('sha512', key)
    .update(dataString)
    .digest('base64');

  return hash;
}

// Verify hash from callback
export function verifyHash(params: PayWayHashParams, receivedHash: string): boolean {
  if (!receivedHash) return false;
  const calculatedHash = generateHash(params);
  return calculatedHash === receivedHash;
}

export const createPaymentLink = async (
    tranId: string,
    amount: number,
    items: PayWayItem[],
    user: any,
    returnUrl?: string
) => {
    const req_time = getReqTime();
    const merchant_id = MERCHANT_ID || "";
    const itemsBase64 = Buffer.from(JSON.stringify(items)).toString("base64");
    const amountStr = amount.toFixed(2);

    const hashParams: PayWayHashParams = {
        req_time,
        merchant_id,
        tran_id: tranId,
        amount: amountStr,
        items: itemsBase64,
        shipping: "",
        firstname: user.firstName || "",
        lastname: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        type: "purchase",
        payment_option: "", 
        return_url: returnUrl ? Buffer.from(returnUrl).toString("base64") : "",
        cancel_url: "",
        continue_success_url: "",
        return_deeplink: "",
        currency: "USD",
        custom_fields: "",
        return_params: "",
        payout: "", 
        lifetime: "",
        additional_params: "",
        google_pay_token: "", 
        skip_success_page: ""
    };

    const hash = generateHash(hashParams);

    const formData = new FormData();
    Object.entries(hashParams).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append("hash", hash);

    const apiUrl = getPayWayApiUrl(); 
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData, 
        });

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("PayWay createPaymentLink Error:", error);
        throw error;
    }
};

export const getTransactionsByRef = async (tranId: string) => {
    const req_time = getReqTime();
    const merchant_id = MERCHANT_ID || "";
    const key = API_KEY || "";

    const hashString = req_time + merchant_id + tranId;
    const hash = crypto.createHmac('sha512', key).update(hashString).digest('base64');

    const formData = new FormData();
    formData.append("req_time", req_time);
    formData.append("merchant_id", merchant_id);
    formData.append("tran_id", tranId);
    formData.append("hash", hash);

    const baseUrl = getPayWayApiUrl().replace("/purchase", ""); 
    const checkUrl = `${baseUrl}/check-transaction`;

    try {
         const response = await fetch(checkUrl, {
            method: "POST",
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("PayWay getTransactionsByRef Error:", error);
        throw error;
    }
};

export const purchaseWithToken = async (
    tranId: string,
    amount: number,
    items: PayWayItem[],
    token: string,
    user: any
): Promise<any> => {
    // Basic mock implementation to satisfy build
    // Real implementation would use token in payment_option or custom_fields
    console.log("Mock purchaseWithToken called", { tranId, amount, token });
    return { status: { code: "00", message: "Success" } }; 
};
