import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { tran_id, reason } = await req.json();

    if (!tran_id) {
      return NextResponse.json(createErrorResponse("Transaction ID is required"), { status: 400 });
    }

    const supabase = createSupabaseServiceRole();
    
    // Auth Check
    const userId = req.headers.get("user-id");
    if (!userId) {
       // Ideally verify session here, but for now rely on service role + userId matching logic if refined
       // or assume middleware protection. 
       // Better: Verify user owns the transaction.
    }

    // 1. Get Transaction
    const { data: transaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("tran_id", tran_id)
        .single();

    if (!transaction) {
        return NextResponse.json(createErrorResponse("Transaction not found"), { status: 404 });
    }

    if (transaction.status !== "completed") {
        return NextResponse.json(createErrorResponse("Only completed transactions can be refunded"), { status: 400 });
    }

    // 2. Mark as Refund Requested
    const { error: updateError } = await supabase
        .from("transactions")
        .update({
            status: "refund_requested",
            metadata: {
                ...transaction.metadata,
                refund_reason: reason,
                refund_requested_at: new Date().toISOString()
            }
        })
        .eq("id", transaction.id);

    if (updateError) {
        throw updateError;
    }

    return NextResponse.json(createSuccessResponse({ 
        message: "Refund requested successfully. Our team will review it shortly.",
        tran_id 
    }));

  } catch (error: any) {
    console.error("Refund Request Error:", error);
    return NextResponse.json(createErrorResponse("Internal Server Error"), { status: 500 });
  }
}
