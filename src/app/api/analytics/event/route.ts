import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // expected: { profile_id?, spot_id, event_type, event_props }
    const record = {
      profile_id: body.profile_id || null,
      spot_id: body.spot_id || null,
      event_type: body.event_type || "unknown",
      event_props: body.event_props || {},
    };

    const { data, error } = await supabase
      .from("analytics_events")
      .insert(record)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
