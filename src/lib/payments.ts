import { supabaseBrowser } from "./supabaseClient";
import { Payment, Subscription, SubscriptionTier } from "./types";

export async function createPayment(
  profileId: string,
  amount: number,
  currency: "KHR" | "USD",
  provider: "bakong" | "stripe" | "paypal",
  subscriptionId?: string
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("payments")
      .insert({
        profile_id: profileId,
        subscription_id: subscriptionId || null,
        provider,
        provider_ref: generatePaymentRef(),
        amount,
        currency,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return data as Payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "completed" | "failed" | "refunded",
  rawResponse?: Record<string, any>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("payments")
      .update({
        status,
        raw_response: rawResponse,
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    return data as Payment;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

export async function getPaymentHistory(profileId: string, limit: number = 20) {
  try {
    const { data, error } = await supabaseBrowser
      .from("payments")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch payment history: ${error.message}`);
    }

    return data as Payment[];
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
}

export async function createSubscription(
  profileId: string,
  tier: SubscriptionTier,
  expiresAt?: Date
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("subscriptions")
      .insert({
        profile_id: profileId,
        tier,
        started_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString() || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

export async function getSubscription(profileId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profileId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return (data as Subscription) || null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Subscription>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("subscriptions")
      .update(updates)
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("subscriptions")
      .update({
        status: "cancelled",
        expires_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

export async function hasActiveSubscription(
  profileId: string
): Promise<boolean> {
  try {
    const subscription = await getSubscription(profileId);
    if (!subscription) return false;

    // Check if not expired
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      return expiresAt > new Date();
    }

    return subscription.status === "active";
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
}

// Bakong integration
export async function initiateBakongPayment(
  paymentId: string,
  amount: number,
  currency: "KHR" | "USD",
  description: string
) {
  try {
    // This would call the Bakong API to initiate payment
    // For now, return mock response
    const response = {
      status: "pending",
      payment_id: paymentId,
      amount,
      currency,
      qr_code: `https://api.bakong.dev/qr?id=${paymentId}`,
    };

    return response;
  } catch (error) {
    console.error("Error initiating Bakong payment:", error);
    throw error;
  }
}

function generatePaymentRef(): string {
  return `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
