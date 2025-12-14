import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

// Create a public share token for an itinerary (expires in 7 days by default)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const itineraryId = id;
    const supabase = createSupabaseServiceRole();

    const userId = req.headers.get("user-id");

    // Find profile for created_by if available
    let createdByProfileId: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_uid", userId)
        .single();
      if (profile) createdByProfileId = profile.id;
    }

    // Generate a URL-safe token (base64url)
    const crypto = await import("crypto");
    const raw = crypto.randomBytes(18);
    const token = raw.toString("base64url");

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("itinerary_shares")
      .insert({
        itinerary_id: itineraryId,
        token,
        created_by: createdByProfileId,
        expires_at: expiresAt,
        is_public: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating share token:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${base}/public/itineraries/${token}`;

    return NextResponse.json(
      { share: { token: data.token, url, expires_at: data.expires_at } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("share create error", err);
    return NextResponse.json(
      { error: err.message || "failed" },
      { status: 500 }
    );
  }
}
