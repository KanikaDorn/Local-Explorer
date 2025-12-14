import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabaseClient";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, companyName, phone } = body;

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(createErrorResponse("Missing required fields"), { status: 400 });
    }

    const supabase = createSupabaseServiceRole();

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: UserRole.PARTNER,
          is_partner: true,
          company_name: companyName,
          phone: phone,
        },
      },
    });

    if (authError) {
      // If user already exists, we might still want to ensure profile/partner exists?
      // But typically we throw here.
      throw authError;
    }

    const user = authData.user;
    if (!user) {
        throw new Error("Failed to create user");
    }

    // 2. Create Profile (if not exists)
    // Upsert acts as "create if not exists, update if exists"
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        auth_uid: user.id,
        email: email,
        full_name: fullName,
        display_name: fullName.split(" ")[0],
        is_partner: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "auth_uid" })
      .select()
      .single();

    if (profileError) {
        // If trigger already created it, this might fail or succeed depending on RLS/policies if we weren't using Service Role.
        // But we ARE using Service Role, so it should succeed.
        console.error("Profile creation error:", profileError);
        // Continue? If profile fails, partner insert will fail.
        throw profileError;
    }

    // 3. Create Partner Record
    // Check if exists first to avoid duplicate if user retries
    const { data: existingPartner } = await supabase
        .from("partners")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    let partner = existingPartner;

    if (!existingPartner) {
        const { data: newPartner, error: partnerError } = await supabase
        .from("partners")
        .insert({
            profile_id: profile.id,
            company_name: companyName,
            contact_phone: phone,
            contact_email: email,
            accepted: false // Pending approval
        })
        .select()
        .single();

        if (partnerError) {
            console.error("Partner creation error:", partnerError);
            throw partnerError;
        }
        partner = newPartner;
    }

    return NextResponse.json(createSuccessResponse({
        user,
        profile,
        partner,
        session: authData.session // Pass session back if auto-confirm is on
    }));

  } catch (error: any) {
    console.error("Partner Signup API Error:", error);
    return NextResponse.json(createErrorResponse(error.message || "Signup failed"), { status: 400 });
  }
}
