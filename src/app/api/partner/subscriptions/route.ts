import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    // Get partner subscriptions
    const { data: partner } = await supabase
      .from("partners")
      .select("subscription_tier")
      .eq("profile_id", profile.id)
      .single();

    const subscriptions = [
      {
        tier: "starter",
        price: 29,
        billing_cycle: "month",
        status: "available",
        current_plan: partner?.subscription_tier === "starter",
      },
      {
        tier: "growth",
        price: 79,
        billing_cycle: "month",
        status: "available",
        current_plan: partner?.subscription_tier === "growth",
      },
      {
        tier: "professional",
        price: 199,
        billing_cycle: "month",
        status: "available",
        current_plan: partner?.subscription_tier === "professional",
      },
    ];

    return NextResponse.json(createSuccessResponse(subscriptions));
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();
    const body = await req.json();

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    // Update subscription tier
    const { data, error } = await supabase
      .from("partners")
      .update({ subscription_tier: body.tier })
      .eq("profile_id", profile.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse({ ...data, checkout_url: "/partner/billing" })
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}
