import { NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

// POST: run cleanup of expired pending deletes
export async function POST(req: Request) {
  try {
    const userId = req.headers.get("user-id");
    if (!userId)
      return NextResponse.json(createErrorResponse("Unauthorized"), {
        status: 401,
      });

    const supabase = createSupabaseServiceRole();

    // check admin flag on profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,is_admin")
      .eq("auth_uid", userId)
      .single();
    if (!profile || !profile.is_admin)
      return NextResponse.json(createErrorResponse("Forbidden"), {
        status: 403,
      });

    // TTL in seconds (env) default to 300 (5 minutes)
    const envTtl = process.env.PENDING_DELETE_TTL_SECONDS;
    const ttl = Number(envTtl || 300);

    // Find spots pending deletion older than TTL
    const { data: expired } = await supabase
      .from("spots")
      .select("id,cover_path")
      .lt(
        "pending_deleted_at",
        new Date(Date.now() - ttl * 1000).toISOString()
      );

    let deletedCount = 0;
    if (expired && expired.length) {
      for (const row of expired) {
        try {
          if (row.cover_path) {
            await supabase.storage.from("spots").remove([row.cover_path]);
          }
        } catch (err) {
          console.error("error removing storage object", err);
        }
        const { error } = await supabase
          .from("spots")
          .delete()
          .eq("id", row.id);
        if (!error) deletedCount++;
      }
    }

    return NextResponse.json(createSuccessResponse({ deleted: deletedCount }));
  } catch (err: any) {
    console.error("cleanup pending deletes error", err);
    return NextResponse.json(createErrorResponse(err.message || "internal"), {
      status: 500,
    });
  }
}
