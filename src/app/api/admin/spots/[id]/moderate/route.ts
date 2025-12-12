import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin, id")
      .eq("auth_uid", userId)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return NextResponse.json(createErrorResponse("Forbidden"), {
        status: 403,
      });
    }

    const body = await req.json();
    const action = body.action; // 'approve' | 'reject'
    const notes = body.notes || null;
    const spotId = params.id;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(createErrorResponse("Invalid action"), {
        status: 400,
      });
    }

    // Insert a moderation record
    const { data: mod, error: modErr } = await supabase
      .from("spot_moderation")
      .insert({
        spot_id: spotId,
        flagged_by: adminProfile.id,
        reason:
          notes ||
          (action === "approve" ? "approved by admin" : "rejected by admin"),
        status: action === "approve" ? "approved" : "rejected",
        notes: notes,
      })
      .select()
      .single();

    if (modErr) {
      console.error("moderation insert error", modErr);
      return NextResponse.json(createErrorResponse(modErr.message), {
        status: 500,
      });
    }

    // If approved, set spot as published
    if (action === "approve") {
      await supabase.from("spots").update({ published: true }).eq("id", spotId);
    }

    return NextResponse.json(createSuccessResponse(mod, "Moderation updated"));
  } catch (err: any) {
    console.error("moderation action error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
