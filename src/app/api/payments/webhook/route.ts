import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // Expected webhook shape depends on provider. We accept generic fields here.
    const payment = {
      profile_id: body.profile_id || null,
      subscription_id: body.subscription_id || null,
      provider: body.provider || body.source || "unknown",
      provider_ref: body.provider_ref || body.id || null,
      amount: body.amount || null,
      currency: body.currency || null,
      status: body.status || "unknown",
      raw_response: body,
    };

    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select("*")
      .single();
    if (error) {
      console.error("payments insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
