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

    if (invErr) {
      return NextResponse.json(createErrorResponse(invErr.message), {
        status: 400,
      });
    }

    const total_revenue =
      invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return NextResponse.json(
      createSuccessResponse({
        invoices: invoices || [],
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
