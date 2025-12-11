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

    // Get bucket list with spots
    const { data, error } = await supabase
      .from("bucket_list")
      .select(
        `
        id,
        profile_id,
        spot_id,
        created_at,
        spots (*)
      `
      )
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error("Error fetching bucket list:", error);
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

    // Add to bucket list
    const { data, error } = await supabase
      .from("bucket_list")
      .insert({
        profile_id: profile.id,
        spot_id: body.spot_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse(data, "Added to bucket list"),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to bucket list:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const spotId = url.searchParams.get("spot_id");

    if (!spotId) {
      return NextResponse.json(createErrorResponse("spot_id is required"), {
        status: 400,
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

    // Remove from bucket list
    const { error } = await supabase
      .from("bucket_list")
      .delete()
      .eq("profile_id", profile.id)
      .eq("spot_id", spotId);

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse(null, "Removed from bucket list")
    );
  } catch (error) {
    console.error("Error removing from bucket list:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
