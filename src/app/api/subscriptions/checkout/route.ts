import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // expected: { profile_id, tier }
    if (!body.profile_id || !body.tier)
      return NextResponse.json(
        { error: "profile_id and tier required" },
        { status: 400 }
      );

    const sub = {
      profile_id: body.profile_id,
      tier: body.tier,
      started_at: new Date().toISOString(),
      status: "pending",
      metadata: body.metadata || {},
    };

    const { data, error } = await supabase
      .from("subscriptions")
      .insert(sub)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // In a real implementation, generate a payment request (Bakong QR, provider session, etc.)
    const paymentRequest = {
      checkout_id: data.id,
      amount: body.amount || 0,
      currency: body.currency || "KHR",
      provider: body.provider || "bakong",
      payment_url: null,
      instructions: "Use payments/webhook to notify when paid",
    };

    return NextResponse.json(
      { subscription: data, paymentRequest },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
