import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { embedText } from "@/lib/vertex";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createSupabaseServiceRole();

    // Optionally accept a list of spot ids to ingest, or ingest all published spots.
    const spotIds: string[] | undefined = body?.spot_ids;

    let q = supabase
      .from("spots")
      .select("id,title,description")
      .eq("published", true)
      .limit(1000);
    if (spotIds && spotIds.length)
      q = supabase
        .from("spots")
        .select("id,title,description")
        .in("id", spotIds);

    const { data: spots, error: selErr } = await q;
    if (selErr)
      return NextResponse.json({ error: selErr.message }, { status: 500 });

    const results: any[] = [];
    for (const s of spots || []) {
      const text = `${s.title}\n\n${s.description || ""}`;
      const embedding = await embedText(text);
      // Insert into spot_embeddings
      const { data, error } = await supabase
        .from("spot_embeddings")
        .upsert({ spot_id: s.id, embedding, metadata: { title: s.title } })
        .select("*")
        .single();
      if (error) {
        console.error("embedding insert error", error);
        results.push({ spot_id: s.id, error: error.message });
        continue;
      }
      results.push({ spot_id: s.id, embedding_id: data.id });
    }

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "ingest failed" },
      { status: 500 }
    );
  }
}
