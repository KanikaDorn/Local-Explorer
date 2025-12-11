import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const supabase = createSupabaseServiceRole();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();

    if (profileError) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    // Get active subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(createSuccessResponse(data || null));
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_uid", userId)
      .single();

    if (profileError) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    // Create subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: profile.id,
        tier: body.tier || "basic",
        started_at: new Date().toISOString(),
        expires_at: body.expires_at || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse(data, "Subscription created"),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
