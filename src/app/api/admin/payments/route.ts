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

    // Get payments (transactions)
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    const payments = transactions?.map((t: any) => ({
      id: t.tran_id,
      user_email: t.metadata?.user_details?.email || "Unknown",
      amount: t.amount,
      status: t.status,
      created_at: t.created_at,
      payment_method: "PayWay", // Default for now since we only have one
    }));

    const total_revenue =
      payments?.filter((p: any) => p.status === 'approved' || p.status === 'paid' || p.status === 'completed') // adjusting for unknown status enum
      .reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        payments: payments || [],
        total_revenue,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
