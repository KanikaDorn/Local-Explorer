import { NextResponse } from "next/server";
import {
  supabaseBrowser,
  createSupabaseServiceRole,
} from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const supabase = createSupabaseServiceRole();

    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(req.headers.get("user-id") || "");

    if (!user) {
      return NextResponse.json(createErrorResponse("User not found"), {
        status: 404,
      });
    }

    // Get profile data
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_uid", user.id)
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse("Profile not found"), {
        status: 404,
      });
    }

    return NextResponse.json(
      createSuccessResponse({
        user,
        profile,
      })
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
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

    // Update profile
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(createSuccessResponse(updated));
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
