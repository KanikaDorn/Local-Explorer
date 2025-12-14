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

    // Get profile + partner
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

    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });
    }

    // Get dashboard metrics
    // Query ALL spots for totals
    const { data: allSpots } = await supabase
      .from("spots")
      .select("views, saves, status")
      .eq("partner_id", partner.id);

    const { count: totalSpots } = await supabase
      .from("spots")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partner.id);

    const { data: recentSpots } = await supabase
      .from("spots")
      .select("id, title, views, saves, status")
      .eq("partner_id", partner.id)
      .limit(5)
      .order("created_at", { ascending: false });

    return NextResponse.json(
      createSuccessResponse({
        total_spots: totalSpots || 0,
        total_views: (allSpots || []).reduce((sum, s) => sum + (s.views || 0), 0),
        total_saves: (allSpots || []).reduce((sum, s) => sum + (s.saves || 0), 0),
        pending_reviews: (allSpots || []).filter((s) => s.status === "pending")
          .length,
        revenue_this_month: 0,
        active_subscription: partner.subscription_plan_id || "starter",
        recent_spots:
          recentSpots?.map((s) => ({
            id: s.id,
            title: s.title,
            views: s.views || 0,
            saves: s.saves || 0,
            status: s.status,
          })) || [],
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}
