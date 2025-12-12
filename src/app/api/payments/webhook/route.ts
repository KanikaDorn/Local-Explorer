import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both new and existing webhook formats
    const provider = body.provider || body.source || "unknown";
    const transactionId = body.provider_ref || body.id || body.transactionId;
    const status = body.status || "unknown";
    const amount = body.amount;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    // Try to find existing payment
    let payment = await supabase
      .from("payments")
      .select("*")
      .eq("provider_ref", transactionId)
      .single()
      .then((r) => r.data)
      .catch(() => null);

    // Map webhook status to our status
    const mappedStatus =
      status === "success" || status === "completed"
        ? "completed"
        : status === "failed"
        ? "failed"
        : "pending";

    if (payment) {
      // Update existing payment
      await supabase
        .from("payments")
        .update({
          status: mappedStatus,
          raw_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // If payment is completed, update subscription status
      if (mappedStatus === "completed" && payment.subscription_id) {
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.subscription_id);
      }
    } else {
      // Create new payment record
      const newPayment = {
        profile_id: body.profile_id || null,
        subscription_id: body.subscription_id || null,
        provider,
        provider_ref: transactionId,
        amount,
        currency: body.currency || "USD",
        status: mappedStatus,
        raw_response: body,
      };

      await supabase.from("payments").insert(newPayment);
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

    // Update subscription status if provided
    if (body.subscription_id && body.status === "confirmed") {
      await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", body.subscription_id);
    }

    return NextResponse.json({ ok: true, payment: data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
