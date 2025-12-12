import { supabaseBrowser } from "./supabaseClient";
import { Itinerary } from "./types";

const IS_SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getItineraries(profileId: string, limit: number = 20) {
  if (!IS_SUPABASE_CONFIGURED) {
     const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
     const all: Itinerary[] = raw ? JSON.parse(raw) : [];
     return all.filter(i => i.profile_id === profileId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  }

  try {
    const { data, error } = await supabaseBrowser
      .from("itineraries")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch itineraries: ${error.message}`);
    }

    return data as Itinerary[];
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    // Fallback to local if error (e.g. connection issue)
    const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
    return raw ? JSON.parse(raw).filter((i: any) => i.profile_id === profileId) : [];
  }
}

export async function getItineraryById(itineraryId: string) {
  if (!IS_SUPABASE_CONFIGURED) {
    const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
    const all: Itinerary[] = raw ? JSON.parse(raw) : [];
    return all.find(i => i.id === itineraryId) as Itinerary;
  }

  try {
    const { data, error } = await supabaseBrowser
      .from("itineraries")
      .select("*")
      .eq("id", itineraryId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch itinerary: ${error.message}`);
    }

    return data as Itinerary;
  } catch (error) {
     const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
     const all: Itinerary[] = raw ? JSON.parse(raw) : [];
     return all.find(i => i.id === itineraryId) as Itinerary;
  }
}

export async function createItinerary(
  profileId: string,
  title: string,
  description: string,
  itineraryData: any,
  model: string = "localexplore-v1"
) {
  const newItinerary: Partial<Itinerary> = {
      id: `local_plan_${Date.now()}`,
      profile_id: profileId,
      title,
      description,
      itinerary: itineraryData,
      model,
      created_at: new Date().toISOString(),
  };

  if (!IS_SUPABASE_CONFIGURED) {
      const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
      const all = raw ? JSON.parse(raw) : [];
      all.push(newItinerary);
      if (typeof window !== "undefined") localStorage.setItem("localexplore_itineraries", JSON.stringify(all));
      return newItinerary as Itinerary;
  }

  try {
    const { data, error } = await supabaseBrowser
      .from("itineraries")
      .insert({
        profile_id: profileId,
        title,
        description,
        itinerary: itineraryData,
        model,
      })
      .select()
      .single();

    if (error) {
       // Fallback to local on error
       console.warn("Supabase insert failed, falling back to local");
       const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
       const all = raw ? JSON.parse(raw) : [];
       all.push(newItinerary);
       if (typeof window !== "undefined") localStorage.setItem("localexplore_itineraries", JSON.stringify(all));
       return newItinerary as Itinerary;
    }

    return data as Itinerary;
  } catch (error) {
    console.error("Error creating itinerary:", error);
    // Fallback
    const raw = typeof window !== "undefined" ? localStorage.getItem("localexplore_itineraries") : null;
     const all = raw ? JSON.parse(raw) : [];
     all.push(newItinerary);
     if (typeof window !== "undefined") localStorage.setItem("localexplore_itineraries", JSON.stringify(all));
     return newItinerary as Itinerary;
  }
}

export async function updateItinerary(
  itineraryId: string,
  updates: Partial<Itinerary>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("itineraries")
      .update(updates)
      .eq("id", itineraryId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update itinerary: ${error.message}`);
    }

    return data as Itinerary;
  } catch (error) {
    console.error("Error updating itinerary:", error);
    throw error;
  }
}

export async function deleteItinerary(itineraryId: string) {
  try {
    const { error } = await supabaseBrowser
      .from("itineraries")
      .delete()
      .eq("id", itineraryId);

    if (error) {
      throw new Error(`Failed to delete itinerary: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    throw error;
  }
}

export async function shareItinerary(itineraryId: string, shareToken?: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("itineraries")
      .update({ extra: { share_token: shareToken || generateShareToken() } })
      .eq("id", itineraryId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to share itinerary: ${error.message}`);
    }

    return data as Itinerary;
  } catch (error) {
    console.error("Error sharing itinerary:", error);
    throw error;
  }
}

export async function duplicateItinerary(
  itineraryId: string,
  profileId: string
) {
  try {
    const original = await getItineraryById(itineraryId);
    if (!original) {
      throw new Error("Original itinerary not found");
    }

    return await createItinerary(
      profileId,
      `${original.title} (Copy)`,
      original.description || "",
      original.itinerary,
      original.model
    );
  } catch (error) {
    console.error("Error duplicating itinerary:", error);
    throw error;
  }
}

function generateShareToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
