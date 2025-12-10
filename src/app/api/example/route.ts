import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const supabase = createSupabaseServiceRole();
    const { data, error } = await supabase
      .from("spots")
      .select("id,title,slug,category,address,cover_url")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Supabase error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ spots: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
