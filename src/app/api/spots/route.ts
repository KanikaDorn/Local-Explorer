import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "24", 10);

    const supabase = createSupabaseServiceRole();
    let query = supabase
      .from("spots")
      .select("id,title,slug,category,address,cover_url,city")
      .limit(limit);

    if (q) {
      // simple text search on title or description
      query = query.ilike("title", `%${q}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ spots: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // minimal validation
    if (!body.title)
      return NextResponse.json({ error: "title required" }, { status: 400 });

    const insert = {
      title: body.title,
      slug: body.slug || null,
      description: body.description || null,
      category: body.category || null,
      tags: body.tags || [],
      address: body.address || null,
      location: body.location || null, // expect GeoJSON or WKT depending on client
      price_level: body.price_level || null,
      cover_url: body.cover_url || null,
      partner_id: body.partner_id || null,
      published: body.published || false,
    };

    const { data, error } = await supabase
      .from("spots")
      .insert(insert)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ spot: data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
