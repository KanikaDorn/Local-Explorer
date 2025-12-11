import { supabaseBrowser } from "./supabaseClient";
import { Feedback } from "./types";

export async function submitFeedback(
  profileId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  comment?: string,
  spotId?: string,
  itineraryId?: string,
  meta?: Record<string, any>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("feedback")
      .insert({
        profile_id: profileId,
        rating,
        comment: comment || null,
        spot_id: spotId || null,
        itinerary_id: itineraryId || null,
        meta: meta || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }

    return data as Feedback;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

export async function getSpotFeedback(spotId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("feedback")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data as Feedback[];
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
}

export async function getAverageRating(spotId: string): Promise<number> {
  try {
    const { data, error } = await supabaseBrowser
      .from("feedback")
      .select("rating")
      .eq("spot_id", spotId);

    if (error) {
      throw new Error(`Failed to fetch ratings: ${error.message}`);
    }

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, f) => acc + f.rating, 0);
    return sum / data.length;
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return 0;
  }
}

export async function getRatingDistribution(spotId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("feedback")
      .select("rating")
      .eq("spot_id", spotId);

    if (error) {
      throw new Error(`Failed to fetch ratings: ${error.message}`);
    }

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    (data || []).forEach((f: any) => {
      distribution[f.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return distribution;
  } catch (error) {
    console.error("Error fetching rating distribution:", error);
    throw error;
  }
}

export async function updateFeedback(
  feedbackId: string,
  updates: Partial<Feedback>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("feedback")
      .update(updates)
      .eq("id", feedbackId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }

    return data as Feedback;
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
}

export async function deleteFeedback(feedbackId: string) {
  try {
    const { error } = await supabaseBrowser
      .from("feedback")
      .delete()
      .eq("id", feedbackId);

    if (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
}
