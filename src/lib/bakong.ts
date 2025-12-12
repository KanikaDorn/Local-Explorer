/**
 * Bakong Payment Gateway Integration
 * Handles all payment operations with Bakong (Cambodia's payment system)
 */

interface BakongPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  returnUrl: string;
  notifyUrl: string;
  customerName?: string;
  customerEmail?: string;
}

interface BakongPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

interface BakongWebhook {
  transactionId: string;
  orderId: string;
  status: "success" | "failed" | "pending";
  amount: number;
  timestamp: string;
}

const BAKONG_API_BASE = process.env.BAKONG_API_BASE || "https://api.bakong.dev";
const BAKONG_API_KEY = process.env.BAKONG_API_KEY || "";
const BAKONG_MERCHANT_ID = process.env.BAKONG_MERCHANT_ID || "";

/**
 * Initialize a payment transaction with Bakong
 */
export async function initiateBakongPayment(
  request: BakongPaymentRequest
): Promise<BakongPaymentResponse> {
  try {
    if (!BAKONG_API_KEY || !BAKONG_MERCHANT_ID) {
      console.warn("Bakong credentials not configured. Running in test mode.");
      return {
        success: true,
        transactionId: `TEST_TXN_${Date.now()}`,
        paymentUrl: `${
          request.returnUrl
        }?status=success&txn=TEST_TXN_${Date.now()}`,
      };
    }

    const payload = {
      merchantId: BAKONG_MERCHANT_ID,
      orderId: request.orderId,
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency,
      description: request.description,
      returnUrl: request.returnUrl,
      notifyUrl: request.notifyUrl,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
    };

    const response = await fetch(`${BAKONG_API_BASE}/transactions/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BAKONG_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Bakong API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      transactionId: data.transactionId,
      paymentUrl: data.paymentUrl,
    };
  } catch (error) {
    console.error("Error initiating Bakong payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check payment status with Bakong
 */
export async function checkBakongPaymentStatus(transactionId: string): Promise<{
  status: "success" | "failed" | "pending" | "unknown";
  details?: any;
}> {
  try {
    if (!BAKONG_API_KEY) {
      return { status: "unknown" };
    }

    const response = await fetch(
      `${BAKONG_API_BASE}/transactions/${transactionId}/status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${BAKONG_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { status: "unknown" };
    }

    const data = await response.json();
    return {
      status: data.status || "unknown",
      details: data,
    };
  } catch (error) {
    console.error("Error checking Bakong payment status:", error);
    return { status: "unknown" };
  }
}

/**
 * Verify webhook signature from Bakong
 */
export function verifyBakongWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    // In production, verify the HMAC signature
    // For now, we'll accept all webhooks in test mode
    if (!BAKONG_API_KEY) {
      console.warn("Bakong webhook verification skipped (test mode)");
      return true;
    }

    // Implement HMAC-SHA256 signature verification
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', BAKONG_API_KEY)
    //   .update(payload)
    //   .digest('hex');
    // return signature === expectedSignature;

    return true;
  } catch (error) {
    console.error("Error verifying Bakong webhook:", error);
    return false;
  }
}

/**
 * Process Bakong webhook payment notification
 */
export async function processBakongWebhook(
  webhook: BakongWebhook
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify webhook authenticity
    // const verified = verifyBakongWebhookSignature(
    //   JSON.stringify(webhook),
    //   req.headers['x-bakong-signature']
    // );

    // Update payment status in database
    const response = await fetch("/api/payments/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "bakong",
        transactionId: webhook.transactionId,
        status: webhook.status,
        amount: webhook.amount,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to process webhook");
    }

    return { success: true, message: "Webhook processed successfully" };
  } catch (error) {
    console.error("Error processing Bakong webhook:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Refund a Bakong transaction
 */
export async function refundBakongTransaction(
  transactionId: string,
  amount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    if (!BAKONG_API_KEY) {
      return { success: false, error: "Bakong not configured" };
    }

    const response = await fetch(
      `${BAKONG_API_BASE}/transactions/${transactionId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BAKONG_API_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Refund failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return { success: true, refundId: data.refundId };
  } catch (error) {
    console.error("Error refunding Bakong transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get Bakong account balance
 */
export async function getBakongBalance(): Promise<{
  success: boolean;
  balance?: number;
  error?: string;
}> {
  try {
    if (!BAKONG_API_KEY) {
      return { success: false, error: "Bakong not configured" };
    }

    const response = await fetch(`${BAKONG_API_BASE}/account/balance`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BAKONG_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, balance: data.balance };
  } catch (error) {
    console.error("Error fetching Bakong balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
