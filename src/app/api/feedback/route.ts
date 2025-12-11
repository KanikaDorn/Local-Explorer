import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const spotId = url.searchParams.get("spot_id");

    if (!spotId) {
      return NextResponse.json(createErrorResponse("spot_id is required"), {
        status: 400,
      });
    }

    const supabase = createSupabaseServiceRole();

    // Get feedback for spot
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    // Calculate statistics
    const ratings = (data || []).map((f: any) => f.rating);
    const avgRating =
      ratings.length > 0
        ? (
            ratings.reduce((a: number, b: number) => a + b) / ratings.length
          ).toFixed(1)
        : 0;

    return NextResponse.json(
      createSuccessResponse({
        feedback: data,
        stats: {
          average_rating: avgRating,
          total_reviews: data?.length || 0,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
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

    // Create feedback
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        profile_id: profile.id,
        spot_id: body.spot_id || null,
        itinerary_id: body.itinerary_id || null,
        rating: body.rating,
        comment: body.comment || null,
        meta: body.meta || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(
      createSuccessResponse(data, "Feedback submitted"),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
