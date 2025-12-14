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

    // Get invoices for partner/profile
    const { data: invoices, error: invErr } = await supabase
      .from("payments")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get raw transactions for history/refunds
    const { data: transactions, error: txErr } = await supabase
      .from("transactions") // or "payments" if they are the same? Assuming distinct for now based on context
      .select("*")
      // .eq("user_id", userId) // transactions use auth_uid usually? or joined via partner?
      // Check create call: user_id: userId
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (invErr) {
      console.error("Billing API Error:", invErr);
      return NextResponse.json(createErrorResponse(`Database Error: ${invErr.message} (${invErr.code})`), {
        status: 400,
      });
    }

    const total_revenue =
      invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return NextResponse.json(
      createSuccessResponse({
        invoices: invoices || [],
        transactions: transactions || [],
        total_revenue,
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}
