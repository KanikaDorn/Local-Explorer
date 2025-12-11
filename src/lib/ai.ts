import { createSupabaseServiceRole } from "./supabaseClient";

// RAG-based itinerary generation using Vertex AI
export async function generateItinerary({
  profile_id,
  preferences,
  date_range,
  spots_to_include,
}: {
  profile_id: string;
  preferences: Record<string, any>;
  date_range?: { start: Date; end: Date };
  spots_to_include?: string[];
}) {
  const supabase = createSupabaseServiceRole();

  try {
    // Build user query for semantic search
    const userQuery = `
      Theme: ${preferences?.theme || "local"}
      Party: ${preferences?.party || "solo traveler"}
      Budget: ${preferences?.budget || "medium"}
      Interests: ${
        Array.isArray(preferences?.interests)
          ? preferences.interests.join(", ")
          : "various"
      }
    `;

    // TODO: Implement embeddings search when embedding endpoints are ready
    // For now, fetch random spots with filters
    const { data: spots, error } = await supabase
      .from("spots")
      .select("*")
      .eq("published", true)
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch spots: ${error.message}`);
    }

    // Build itinerary structure
    const itinerary = {
      title: `${
        preferences?.theme || "Weekend"
      } Plan - ${new Date().toLocaleDateString()}`,
      description: `AI-generated itinerary for ${
        preferences?.party || "explorer"
      }`,
      theme: preferences?.theme || "local",
      budget: preferences?.budget || "medium",
      stops: (spots || []).map((spot: any, index: number) => ({
        order: index + 1,
        spot_id: spot.id,
        title: spot.title,
        description: spot.description,
        start_time: `${9 + Math.floor(index * 2)}:00`,
        duration_minutes: 90,
        address: spot.address,
        category: spot.category,
      })),
      created_at: new Date().toISOString(),
    };

    // Save itinerary to database
    const { data: savedItinerary, error: saveError } = await supabase
      .from("itineraries")
      .insert({
        profile_id,
        title: itinerary.title,
        description: itinerary.description,
        itinerary,
        model: "localexplore-v1",
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save itinerary: ${saveError.message}`);
    }

    return savedItinerary;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}

// Get spot recommendations based on user preferences
export async function getSpotRecommendations(
  preferences: Record<string, any>,
  limit: number = 10
) {
  const supabase = createSupabaseServiceRole();

  try {
    let query = supabase
      .from("spots")
      .select("*")
      .eq("published", true)
      .limit(limit);

    // Apply filters if provided
    if (preferences.category) {
      query = query.eq("category", preferences.category);
    }

    if (preferences.price_level) {
      query = query.lte("price_level", preferences.price_level);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

// Log user interactions for analytics
export async function logAnalyticsEvent(
  profile_id: string,
  event_type: string,
  spot_id?: string,
  event_props?: Record<string, any>
) {
  const supabase = createSupabaseServiceRole();

  try {
    const { error } = await supabase.from("analytics_events").insert({
      profile_id,
      spot_id: spot_id || null,
      event_type,
      event_props: event_props || {},
    });

    if (error) {
      console.error("Error logging analytics:", error);
    }
  } catch (error) {
    console.error("Error in logAnalyticsEvent:", error);
  }
}
