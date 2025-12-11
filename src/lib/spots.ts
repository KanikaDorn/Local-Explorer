import { supabaseBrowser } from "./supabaseClient";
import { Spot, SpotWithDistance } from "./types";
import { calculateDistance } from "./utils";
import { DUMMY_SPOTS } from "@/data/dummySpots";

export async function getSpots(
  limit: number = 20,
  offset: number = 0,
  filters?: {
    category?: string;
    tags?: string[];
    city?: string;
  }
) {
  try {
    let query = supabaseBrowser
      .from("spots")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.city) {
      query = query.eq("city", filters.city);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "DB error fetching spots, falling back to dummy data:",
        error
      );
      return DUMMY_SPOTS.slice(offset, offset + limit) as Spot[];
    }

    // If DB returns empty array, return dummy spots so UI shows content
    if (!data || (Array.isArray(data) && (data as Spot[]).length === 0)) {
      return DUMMY_SPOTS.slice(offset, offset + limit) as Spot[];
    }

    return data as Spot[];
  } catch (error) {
    console.error("Error fetching spots:", error);
    throw error;
  }
}

export async function getSpotById(spotId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .eq("id", spotId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch spot: ${error.message}`);
    }

    return data as Spot;
  } catch (error) {
    console.error("Error fetching spot:", error);
    throw error;
  }
}

export async function searchSpots(
  query: string,
  limit: number = 10
): Promise<Spot[]> {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .eq("published", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search spots: ${error.message}`);
    }

    return data as Spot[];
  } catch (error) {
    console.error("Error searching spots:", error);
    throw error;
  }
}

export async function getSpotsByCategory(category: string, limit: number = 20) {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .eq("published", true)
      .eq("category", category)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch spots: ${error.message}`);
    }

    return data as Spot[];
  } catch (error) {
    console.error("Error fetching spots by category:", error);
    throw error;
  }
}

export async function getNearbySpots(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  limit: number = 10
): Promise<SpotWithDistance[]> {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .eq("published", true)
      .limit(100); // Fetch all and filter client-side for now

    if (error) {
      throw new Error(`Failed to fetch nearby spots: ${error.message}`);
    }

    const spotsWithDistance = (data as Spot[])
      .map((spot) => ({
        ...spot,
        distance: calculateDistance(
          latitude,
          longitude,
          spot.location.coordinates[1],
          spot.location.coordinates[0]
        ),
      }))
      .filter((spot) => spot.distance <= radiusKm)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);

    return spotsWithDistance;
  } catch (error) {
    console.error("Error fetching nearby spots:", error);
    throw error;
  }
}

export async function getSpotsByIds(spotIds: string[]) {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .in("id", spotIds);

    if (error) {
      throw new Error(`Failed to fetch spots: ${error.message}`);
    }

    return data as Spot[];
  } catch (error) {
    console.error("Error fetching spots by IDs:", error);
    throw error;
  }
}

export async function createSpot(profileId: string, spotData: Partial<Spot>) {
  try {
    // First get the partner record
    const { data: partnerData, error: partnerError } = await supabaseBrowser
      .from("partners")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    if (partnerError) {
      throw new Error("Partner profile not found");
    }

    const { data, error } = await supabaseBrowser
      .from("spots")
      .insert({
        ...spotData,
        partner_id: partnerData.id,
        published: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create spot: ${error.message}`);
    }

    return data as Spot;
  } catch (error) {
    console.error("Error creating spot:", error);
    throw error;
  }
}

export async function updateSpot(spotId: string, updates: Partial<Spot>) {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .update(updates)
      .eq("id", spotId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update spot: ${error.message}`);
    }

    return data as Spot;
  } catch (error) {
    console.error("Error updating spot:", error);
    throw error;
  }
}

export async function deleteSpot(spotId: string) {
  try {
    const { error } = await supabaseBrowser
      .from("spots")
      .delete()
      .eq("id", spotId);

    if (error) {
      throw new Error(`Failed to delete spot: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting spot:", error);
    throw error;
  }
}

export async function getFeaturedSpots(limit: number = 6) {
  try {
    const { data, error } = await supabaseBrowser
      .from("spots")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured spots: ${error.message}`);
    }

    return data as Spot[];
  } catch (error) {
    console.error("Error fetching featured spots:", error);
    throw error;
  }
}
