import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId)
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });

    const supabase = createSupabaseServiceRole();

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("auth_uid", userId)
      .single();
    if (adminError || !adminProfile?.is_admin)
      return NextResponse.json(createErrorResponse("Forbidden"), {
        status: 403,
      });

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, display_name, is_partner, is_admin, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error)
      return NextResponse.json(createErrorResponse(error.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(data));
  } catch (err: any) {
    console.error("admin users list error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
