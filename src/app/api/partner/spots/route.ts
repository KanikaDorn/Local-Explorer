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

    // find partner id
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();
    if (profileErr)
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });

    const { data: partner, error: partnerErr } = await supabase
      .from("partners")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (partnerErr || !partner)
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });

    const { data: spots, error: spotsErr } = await supabase
      .from("spots")
      .select("*")
      .eq("partner_id", partner.id)
      .is("pending_deleted_at", null)
      .order("created_at", { ascending: false });

    if (spotsErr)
      return NextResponse.json(createErrorResponse(spotsErr.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(spots));
  } catch (err: any) {
    console.error("partner spots list error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId)
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });

    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // find partner id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();
    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (!partner)
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });

    const insert = {
      title: body.title,
      slug: body.slug || null,
      description: body.description || null,
      category: body.category || null,
      tags: body.tags || [],
      address: body.address || null,
      location: body.location || null,
      price_level: body.price_level || null,
      cover_url: body.cover_url || null,
      cover_path: body.cover_path || null,
      partner_id: partner.id,
      published: body.published || false,
    };

    const { data, error } = await supabase
      .from("spots")
      .insert(insert)
      .select("*")
      .single();
    if (error)
      return NextResponse.json(createErrorResponse(error.message), {
        status: 500,
      });

    return NextResponse.json(createSuccessResponse(data), { status: 201 });
  } catch (err: any) {
    console.error("partner spots create error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
