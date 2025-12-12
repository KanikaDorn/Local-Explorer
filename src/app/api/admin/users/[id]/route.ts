import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const updates = await req.json();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();
    if (error)
      return NextResponse.json(createErrorResponse(error.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(data));
  } catch (err: any) {
    console.error("admin users update error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = _req.headers.get("user-id");
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

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", params.id);
    if (error)
      return NextResponse.json(createErrorResponse(error.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (err: any) {
    console.error("admin users delete error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
