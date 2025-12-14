import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
    const email = "dornkaknika26@gmail.com"; 
    const supabase = createSupabaseServiceRole();
    
    try {
        // 1. Get Auth User
        // We need to list users or find by email? Admin `listUsers`? or `users` table check?
        // `getUserById` needs ID. `listUsers` is available.
        // We can search profiles first?
        
        // Let's try to find auth user by email from `auth.users` via RPC or verify via profile?
        // Service role can list users.
        const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) throw listErr;
        
        const user = users.find(u => u.email === email);
        if (!user) {
            return NextResponse.json(createErrorResponse("Auth User not found for " + email), { status: 404 });
        }
        
        // 2. Fix Profile
        let { data: profile } = await supabase.from("profiles").select("*").eq("auth_uid", user.id).single();
        if (!profile) {
            const { data: newProfile, error: pErr } = await supabase.from("profiles").insert({
                auth_uid: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || "Dorn Kaknika",
                display_name: "Dorn",
                is_partner: true,
                updated_at: new Date().toISOString()
            }).select().single();
            if (pErr) throw pErr;
            profile = newProfile;
        } else {
             // Ensure is_partner is true
             await supabase.from("profiles").update({ is_partner: true }).eq("id", profile.id);
        }
        
        // 3. Fix Partner
        let { data: partner } = await supabase.from("partners").select("*").eq("profile_id", profile.id).single();
        if (!partner) {
            const { data: newPartner, error: ptErr } = await supabase.from("partners").insert({
                profile_id: profile.id,
                company_name: "Local Explore Partner",
                contact_email: email,
                accepted: true
            }).select().single();
            if (ptErr) throw ptErr;
            partner = newPartner;
        }
        
        return NextResponse.json(createSuccessResponse({ user, profile, partner, message: "Fixed!" }));
        
    } catch (err: any) {
        console.error("Fix Partner Error:", err);
        return NextResponse.json(createErrorResponse(`Fix failed: ${err.message}`), { status: 500 });
    }
}
