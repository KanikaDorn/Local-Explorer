import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

// Helper to fetch profile + partner for the authenticated user-id header
async function getProfileAndPartner(userId: string) {
  const supabase = createSupabaseServiceRole();

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_uid", userId)
    .single();

  if (profileErr || !profile) {
    throw new Error("Profile not found");
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  return { profile, partner };
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const { profile, partner } = await getProfileAndPartner(userId);

    return NextResponse.json(
      createSuccessResponse({
        ...profile,
        ...(partner || {}),
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: error.message === "Profile not found" ? 404 : 500 }
    );
  }
}

// Enroll current user as partner (creates partner row + flags profile)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();
    const body = (await req.json().catch(() => ({}))) || {};

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_uid", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    // Create partner record if missing
    const { data: existingPartner } = await supabase
      .from("partners")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();

    let partner = existingPartner;
    if (!partner) {
      const { data: newPartner, error: partnerErr } = await supabase
        .from("partners")
        .insert({
          profile_id: profile.id,
          company_name: body.company_name || null,
          vat_number: body.vat_number || null,
          contact_phone: body.contact_phone || null,
          contact_email: body.contact_email || profile.email || null,
          accepted: true,
        })
        .select("*")
        .single();

      if (partnerErr) {
        return NextResponse.json(
          createErrorResponse(partnerErr.message || "Failed to create partner"),
          { status: 400 }
        );
      }
      partner = newPartner;
    }

    // Flag profile as partner
    if (!profile.is_partner) {
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ is_partner: true })
        .eq("id", profile.id);

      if (updateErr) {
        return NextResponse.json(
          createErrorResponse(
            updateErr.message || "Failed to update profile as partner"
          ),
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      createSuccessResponse({
        ...profile,
        is_partner: true,
        ...(partner || {}),
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("partner enroll error", error);
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();
    const body = await req.json();
    const { profile, partner } = await getProfileAndPartner(userId);

    if (!partner) {
      return NextResponse.json(createErrorResponse("Partner not found"), {
        status: 404,
      });
    }

    const { data, error } = await supabase
      .from("partners")
      .update(body)
      .eq("id", partner.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse({
        ...profile,
        ...data,
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || "Internal server error"),
      { status: 500 }
    );
  }
}
