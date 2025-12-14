import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServiceRole();
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ spot: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createSupabaseServiceRole();
    const { data, error } = await supabase
      .from("spots")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ spot: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServiceRole();
    const { error } = await supabase.from("spots").delete().eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
