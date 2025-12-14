import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    
    // Default Plans
    const plans = [
      {
        id: "starter",
        name: "Starter",
        price: 29,
        currency: "USD",
        period: "month",
        description: "Perfect for new businesses",
        features: ["Up to 5 locations", "Basic analytics", "Email support"],
      },
      {
        id: "growth",
        name: "Growth",
        price: 79,
        currency: "USD",
        period: "month",
        description: "For growing businesses",
        features: ["Up to 20 locations", "Advanced analytics", "Priority support"],
        recommended: true,
      },
      {
        id: "professional",
        name: "Professional",
        price: 199,
        currency: "USD",
        period: "month",
        description: "For established enterprises",
        features: ["Unlimited locations", "Full analytics", "Dedicated support"],
      },
    ];

    let current = null;

    if (userId) {
        const supabase = createSupabaseServiceRole();
        
        // 1. Get Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_uid", userId)
          .single();

        if (profile) {
            // 2. Get Partner Subscription
            const { data: partner } = await supabase
              .from("partners")
              .select("subscription_tier") // Add expiration/status columns if they exist
              .eq("profile_id", profile.id)
              .single();
            
            if (partner) {
                // Map DB tier to plan structure
                current = {
                    planId: partner.subscription_tier || "starter", // Default to starter if just created
                    planName: plans.find(p => p.id === partner.subscription_tier)?.name || "Starter",
                    startDate: new Date().toISOString(), // Mocks for now if DB columns don't exist
                    renewalDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
                    status: "active",
                    autoRenew: true
                };
            }
        }
    }

    return NextResponse.json(createSuccessResponse({
        plans,
        current
    }));

  } catch (error: any) {
    console.error("GET Subscriptions Error:", error);
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
