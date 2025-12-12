import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const supabase = createSupabaseServiceRole();

    // Find share record and validate expiry
    const { data: share, error: shareError } = await supabase
      .from("itinerary_shares")
      .select("itinerary_id, expires_at")
      .eq("token", token)
      .single();

    if (shareError || !share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    const now = new Date();
    if (new Date(share.expires_at) < now) {
      return NextResponse.json({ error: "Share expired" }, { status: 410 });
    }

    // Fetch itinerary (sanitized) and return
    const { data: itinerary, error: itinError } = await supabase
      .from("itineraries")
      .select("id, title, description, itinerary, created_at")
      .eq("id", share.itinerary_id)
      .single();

    if (itinError || !itinerary) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

    // Optionally sanitize the itinerary payload before returning
    const sanitized = {
      id: itinerary.id,
      title: itinerary.title,
      description: itinerary.description,
      itinerary: itinerary.itinerary,
      created_at: itinerary.created_at,
    };

    return NextResponse.json({ itinerary: sanitized });
  } catch (err: any) {
    console.error("public itinerary fetch error", err);
    return NextResponse.json(
      { error: err.message || "failed" },
      { status: 500 }
    );
  }
}
