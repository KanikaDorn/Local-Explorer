import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();

    // Find partner record associated with profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();
    if (profileErr) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    const { data: partner, error: partnerErr } = await supabase
      .from("partners")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (partnerErr || !partner) {
      return NextResponse.json(
        createErrorResponse("Partner profile not found"),
        { status: 404 }
      );
    }

    // Get partner's spots
    const { data: spots, error: spotsErr } = await supabase
      .from("spots")
      .select("id,title")
      .eq("partner_id", partner.id);

    if (spotsErr) {
      return NextResponse.json(createErrorResponse(spotsErr.message), {
        status: 500,
      });
    }

    const spotIds = (spots || []).map((s: any) => s.id);

    // If no spots, return empty analytics
    if (!spotIds.length) {
      return NextResponse.json(
        createSuccessResponse({ views: 0, saves: 0, clicks: 0, spots: [] })
      );
    }

    // Fetch analytics events for these spots
    const { data: events, error: eventsErr } = await supabase
      .from("analytics_events")
      .select("event_type, spot_id")
      .in("spot_id", spotIds);

    if (eventsErr) {
      return NextResponse.json(createErrorResponse(eventsErr.message), {
        status: 500,
      });
    }

    const summary = { views: 0, saves: 0, clicks: 0 } as any;
    const perSpot: Record<string, any> = {};
    for (const e of events || []) {
      const t = e.event_type;
      if (t === "view") summary.views++;
      if (t === "save") summary.saves++;
      if (t === "click") summary.clicks++;

      perSpot[e.spot_id] = perSpot[e.spot_id] || {
        views: 0,
        saves: 0,
        clicks: 0,
      };
      if (t === "view") perSpot[e.spot_id].views++;
      if (t === "save") perSpot[e.spot_id].saves++;
      if (t === "click") perSpot[e.spot_id].clicks++;
    }

    // Attach spot titles
    const spotsWithStats = (spots || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      stats: perSpot[s.id] || { views: 0, saves: 0, clicks: 0 },
    }));

    return NextResponse.json(
      createSuccessResponse({ ...summary, spots: spotsWithStats })
    );
  } catch (err: any) {
    console.error("partner analytics error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
