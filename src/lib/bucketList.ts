import { supabaseBrowser } from "./supabaseClient";
import { BucketListItem, Spot } from "./types";

export async function getBucketList(profileId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("bucket_list")
      .select(
        `
        id,
        profile_id,
        spot_id,
        created_at,
        spots (*)
      `
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bucket list: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching bucket list:", error);
    throw error;
  }
}

export async function addToBucketList(profileId: string, spotId: string) {
  try {
    // Check if already in bucket list
    const { data: existing, error: checkError } = await supabaseBrowser
      .from("bucket_list")
      .select("id")
      .eq("profile_id", profileId)
      .eq("spot_id", spotId)
      .single();

    if (existing) {
      // Already in bucket list
      return existing as BucketListItem;
    }

    const { data, error } = await supabaseBrowser
      .from("bucket_list")
      .insert({
        profile_id: profileId,
        spot_id: spotId,
      })
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is fine for this case
      throw new Error(`Failed to add to bucket list: ${error.message}`);
    }

    return data as BucketListItem;
  } catch (error) {
    console.error("Error adding to bucket list:", error);
    throw error;
  }
}

export async function removeFromBucketList(profileId: string, spotId: string) {
  try {
    const { error } = await supabaseBrowser
      .from("bucket_list")
      .delete()
      .eq("profile_id", profileId)
      .eq("spot_id", spotId);

    if (error) {
      throw new Error(`Failed to remove from bucket list: ${error.message}`);
    }
  } catch (error) {
    console.error("Error removing from bucket list:", error);
    throw error;
  }
}

export async function isInBucketList(
  profileId: string,
  spotId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseBrowser
      .from("bucket_list")
      .select("id")
      .eq("profile_id", profileId)
      .eq("spot_id", spotId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking bucket list:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking bucket list:", error);
    return false;
  }
}

export async function clearBucketList(profileId: string) {
  try {
    const { error } = await supabaseBrowser
      .from("bucket_list")
      .delete()
      .eq("profile_id", profileId);

    if (error) {
      throw new Error(`Failed to clear bucket list: ${error.message}`);
    }
  } catch (error) {
    console.error("Error clearing bucket list:", error);
    throw error;
  }
}

export async function exportBucketList(
  profileId: string,
  format: "json" | "csv" = "json"
) {
  try {
    const bucketList = await getBucketList(profileId);

    if (format === "csv") {
      const csv = [
        ["Title", "Category", "Address", "Price Level", "URL"].join(","),
        ...bucketList.map((item: any) =>
          [
            item.spots?.title || "",
            item.spots?.category || "",
            item.spots?.address || "",
            item.spots?.price_level || "",
            `${process.env.NEXT_PUBLIC_APP_URL}/explore/${item.spot_id}`,
          ].join(",")
        ),
      ].join("\n");

      return csv;
    }

    return JSON.stringify(bucketList, null, 2);
  } catch (error) {
    console.error("Error exporting bucket list:", error);
    throw error;
  }
}
