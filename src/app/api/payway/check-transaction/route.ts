import { NextRequest, NextResponse } from "next/server";
import { getTransactionsByRef } from "@/lib/payway";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const { tran_id } = await req.json();

        if (!tran_id) {
            return NextResponse.json(createErrorResponse("Transaction ID (tran_id) is required"), { status: 400 });
        }

        // Call PayWay API to check status
        const paywayResponse = await getTransactionsByRef(tran_id);

        if (paywayResponse.status.code !== "00") {
             // 00 is Success for this endpoint as per examples
             console.error("PayWay Check Transaction Error:", paywayResponse);
             // It might be legal error (e.g. no transactions found yet), let's just return what we have
             return NextResponse.json(createSuccessResponse({ 
                 status: "PENDING", 
                 details: paywayResponse.status.message 
             }));
        }

        const transactions = paywayResponse.data || [];
        // Look for an APPROVED transaction
        const approvedTx = transactions.find(tx => tx.payment_status === "APPROVED");

        if (approvedTx) {
            // Update Supabase if needed
            const supabase = createSupabaseServiceRole();
            // Assuming we have a way to match tran_id to a subscription/user record
            // For now, we just return Success to the frontend
            
            return NextResponse.json(createSuccessResponse({
                status: "APPROVED",
                data: approvedTx
            }));
        }

        return NextResponse.json(createSuccessResponse({
            status: "PENDING",
            message: "No approved transaction found yet."
        }));

    } catch (error: any) {
        console.error("Check Transaction Error:", error);
        return NextResponse.json(createErrorResponse(error.message || "Internal Server Error"), { status: 500 });
    }
}
