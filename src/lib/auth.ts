import { supabaseBrowser } from "./supabaseClient";
import { UserRole } from "./types";

const IS_SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Lightweight local fallback for dev when Supabase env is not configured.
function readLocalUser() {
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("localexplore_user")
        : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalUser(user: any | null) {
  try {
    if (typeof window === "undefined") return;
    if (!user) return localStorage.removeItem("localexplore_user");
    localStorage.setItem("localexplore_user", JSON.stringify(user));
  } catch {
    // ignore
  }
}

export async function getCurrentUser() {
  if (!IS_SUPABASE_CONFIGURED) {
    return readLocalUser();
  }

  try {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("profiles")
      .select("*")
      .eq("auth_uid", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

export async function signUp(email: string, password: string, metaData: Record<string, any> = {}) {
  if (!IS_SUPABASE_CONFIGURED) {
    // Simple local signup for developer convenience
    const user = { id: `local_${Date.now()}`, email, ...metaData };
    writeLocalUser(user);
    return { user };
  }

  try {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metaData,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  if (!IS_SUPABASE_CONFIGURED) {
    // Local sign-in: accept any password for the demo user stored in localStorage
    const user = readLocalUser();
    if (user && user.email === email) {
      writeLocalUser(user);
      return { user };
    }
    const err: any = new Error("Invalid credentials (dev fallback)");
    err.status = 401;
    throw err;
  }

  try {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.warn("Error signing in:", error);
    throw error;
  }
}

export async function signOut() {
  if (!IS_SUPABASE_CONFIGURED) {
    writeLocalUser(null);
    return;
  }

  try {
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  role: UserRole = UserRole.EXPLORER
) {
  try {
    if (!IS_SUPABASE_CONFIGURED) {
      // Local fallback: store profile in localStorage
      const key = "localexplore_profiles";
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      const profiles = raw ? JSON.parse(raw) : [];
      const profile = {
        id: `local_profile_${Date.now()}`,
        auth_uid: userId,
        email,
        full_name: fullName,
        display_name: (fullName || "").split(" ")[0] || email.split("@")[0],
        is_partner: role === UserRole.PARTNER,
        is_admin: role === UserRole.ADMIN,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(profile);
      if (typeof window !== "undefined")
        localStorage.setItem(key, JSON.stringify(profiles));
      return profile;
    }

    const { data, error } = await supabaseBrowser
      .from("profiles")
      .insert({
        auth_uid: userId,
        email,
        full_name: fullName,
        display_name: fullName.split(" ")[0],
        is_partner: role === UserRole.PARTNER,
        is_admin: role === UserRole.ADMIN,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
}

export async function updateUserProfile(
  profileId: string,
  updates: Record<string, any>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}


export async function createPartnerProfile(
  profileId: string,
  companyName: string,
  contactPhone: string,
  contactEmail: string
) {
  try {
    if (!IS_SUPABASE_CONFIGURED) {
      // Local fallback
      return {
        id: `local_partner_${Date.now()}`,
        profile_id: profileId,
        company_name: companyName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        accepted: false,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabaseBrowser
      .from("partners")
      .insert({
        profile_id: profileId,
        company_name: companyName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        accepted: false, // Default to pending approval
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating partner profile:", error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  if (!IS_SUPABASE_CONFIGURED) {
    // No-op fallback: invoke callback immediately with local user and return an unsubscribe stub
    const user = readLocalUser();
    setTimeout(() => callback(user), 0);
    return {
      data: null,
      subscription: null,
      unsubscribe() {
        return true;
      },
    };
  }

  return supabaseBrowser.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}

