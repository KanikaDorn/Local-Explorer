import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get dashboard metrics
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: totalSpots } = await supabase
      .from("spots")
      .select("*", { count: "exact", head: true });

    const { count: pendingReviews } = await supabase
      .from("spot_moderation")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: activeSubscriptions } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_partner", true);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, status");

    const totalRevenue =
      transactions
        ?.filter((t) => t.status === 'approved' || t.status === 'paid' || t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        total_users: totalUsers || 0,
        total_spots: totalSpots || 0,
        pending_reviews: pendingReviews || 0,
        total_revenue: totalRevenue,
        active_subscriptions: activeSubscriptions || 0,
        system_health: "Healthy",
        alerts: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
