import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = req.headers.get("user-id");
    if (!userId)
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });

    const body = await req.json();
    const spotId = id;
    const supabase = createSupabaseServiceRole();

    // find partner id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();
    
    if (!profile) return NextResponse.json(createErrorResponse("Profile not found"), { status: 404 });

    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (!partner)
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });

    // ensure spot belongs to partner and fetch existing metadata
    const { data: existing } = await supabase
      .from("spots")
      .select("partner_id, cover_path")
      .eq("id", spotId)
      .single();
    if (!existing || existing.partner_id !== partner.id)
      return NextResponse.json(createErrorResponse("Forbidden"), {
        status: 403,
      });

    // If frontend sent explicit null for cover_path, remove the stored object server-side
    if (
      Object.prototype.hasOwnProperty.call(body, "cover_path") &&
      body.cover_path === null
    ) {
      try {
        if (existing?.cover_path) {
          await supabase.storage.from("spots").remove([existing.cover_path]);
        }
      } catch (err) {
        console.error("failed to remove old cover during update", err);
      }
      // ensure DB fields cleared
      body.cover_url = null;
      body.cover_path = null;
    }

    // If frontend provided a new cover_path (replacement), remove previous stored object
    if (
      Object.prototype.hasOwnProperty.call(body, "cover_path") &&
      body.cover_path
    ) {
      try {
        if (existing?.cover_path && existing.cover_path !== body.cover_path) {
          await supabase.storage.from("spots").remove([existing.cover_path]);
        }
      } catch (err) {
        console.error("failed to remove old cover during replace", err);
      }
    }

    const { data, error } = await supabase
      .from("spots")
      .update(body)
      .eq("id", spotId)
      .select()
      .single();
    if (error)
      return NextResponse.json(createErrorResponse(error.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(data));
  } catch (err: any) {
    console.error("partner spots update error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = _req.headers.get("user-id");
    if (!userId)
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });

    const spotId = id;
    const supabase = createSupabaseServiceRole();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();

    if (!profile) return NextResponse.json(createErrorResponse("Profile not found"), { status: 404 });

    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (!partner)
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });

    const { data: existingSpot } = await supabase
      .from("spots")
      .select("partner_id, cover_path")
      .eq("id", spotId)
      .single();
    if (!existingSpot || existingSpot.partner_id !== partner.id)
      return NextResponse.json(createErrorResponse("Forbidden"), {
        status: 403,
      });

    // Mark as pending deletion so deletion survives reloads (undoable)
    const { data: updated, error: updErr } = await supabase
      .from("spots")
      .update({ pending_deleted_at: new Date().toISOString() })
      .eq("id", spotId)
      .select()
      .single();

    if (updErr)
      return NextResponse.json(createErrorResponse(updErr.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(updated));
  } catch (err: any) {
    console.error("partner spots delete error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
