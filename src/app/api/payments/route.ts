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

    // Get payment history
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    console.error("Error fetching payment history:", error);
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

    // Create payment record
    const { data, error } = await supabase
      .from("payments")
      .insert({
        profile_id: profile.id,
        amount: body.amount,
        currency: body.currency || "KHR",
        provider: body.provider || "bakong",
        status: "pending",
        provider_ref: `PAY_${Date.now()}`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(createErrorResponse(error.message), {
        status: 400,
      });
    }

    return NextResponse.json(createSuccessResponse(data, "Payment initiated"), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
