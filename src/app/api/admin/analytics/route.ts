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

    // Verify admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("auth_uid", userId)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return NextResponse.json(
        createErrorResponse("Unauthorized - Admin only"),
        { status: 403 }
      );
    }

    // Get various metrics
    const [usersResult, paymentsResult, subscriptionsResult, eventsResult] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase
          .from("payments")
          .select("amount", { count: "exact" })
          .eq("status", "completed"),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact" })
          .eq("status", "active"),
        supabase.from("analytics_events").select("id", { count: "exact" }),
      ]);

    // Calculate revenue
    let totalRevenue = 0;
    if (paymentsResult.data) {
      totalRevenue = paymentsResult.data.reduce(
        (sum, p: any) => sum + (p.amount || 0),
        0
      );
    }

    const analytics = {
      total_users: usersResult.count || 0,
      active_subscriptions: subscriptionsResult.count || 0,
      total_revenue: totalRevenue,
      total_events: eventsResult.count || 0,
    };

    return NextResponse.json(createSuccessResponse(analytics));
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
