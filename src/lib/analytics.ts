import { supabaseBrowser } from "./supabaseClient";
import { AnalyticsEvent, AnalyticsEventType } from "./types";

export async function logEvent(
  profileId: string,
  eventType: AnalyticsEventType,
  spotId?: string,
  eventProps?: Record<string, any>
) {
  try {
    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .insert({
        profile_id: profileId,
        spot_id: spotId || null,
        event_type: eventType,
        event_props: eventProps || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error logging event:", error);
      return null;
    }

    return data as AnalyticsEvent;
  } catch (error) {
    console.error("Error in logEvent:", error);
    return null;
  }
}

export async function getSpotAnalytics(spotId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .select("event_type, id")
      .eq("spot_id", spotId);

    if (error) {
      throw new Error(`Failed to fetch spot analytics: ${error.message}`);
    }

    const analytics = {
      views: (data || []).filter((e: any) => e.event_type === "view").length,
      saves: (data || []).filter((e: any) => e.event_type === "save").length,
      clicks: (data || []).filter((e: any) => e.event_type === "click").length,
      shares: (data || []).filter((e: any) => e.event_type === "share").length,
    };

    return analytics;
  } catch (error) {
    console.error("Error fetching spot analytics:", error);
    throw error;
  }
}

export async function getPopularSpots(limit: number = 10) {
  try {
    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .select("spot_id, event_type")
      .eq("event_type", "view")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch popular spots: ${error.message}`);
    }

    // Count occurrences
    const spotCounts = (data || []).reduce(
      (acc: Record<string, number>, event: any) => {
        acc[event.spot_id] = (acc[event.spot_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const sorted = Object.entries(spotCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([spotId]) => spotId);

    return sorted;
  } catch (error) {
    console.error("Error fetching popular spots:", error);
    throw error;
  }
}

export async function getUserAnalytics(profileId: string) {
  try {
    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .select("event_type, id")
      .eq("profile_id", profileId);

    if (error) {
      throw new Error(`Failed to fetch user analytics: ${error.message}`);
    }

    const analytics = {
      total_events: (data || []).length,
      views: (data || []).filter((e: any) => e.event_type === "view").length,
      saves: (data || []).filter((e: any) => e.event_type === "save").length,
      clicks: (data || []).filter((e: any) => e.event_type === "click").length,
      shares: (data || []).filter((e: any) => e.event_type === "share").length,
    };

    return analytics;
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
}

export async function getDailyActiveUsers(days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .select("profile_id, created_at")
      .gte("created_at", startDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch daily active users: ${error.message}`);
    }

    // Group by date and count unique users
    const usersByDate: Record<string, Set<string>> = {};
    (data || []).forEach((event: any) => {
      const date = event.created_at.split("T")[0];
      if (!usersByDate[date]) {
        usersByDate[date] = new Set();
      }
      usersByDate[date].add(event.profile_id);
    });

    return Object.entries(usersByDate).map(([date, users]) => ({
      date,
      active_users: users.size,
    }));
  } catch (error) {
    console.error("Error fetching daily active users:", error);
    throw error;
  }
}

export async function getRevenueAnalytics(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseBrowser
      .from("payments")
      .select("amount, currency, created_at, status")
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch revenue analytics: ${error.message}`);
    }

    // Sum revenue by date
    const revenueByDate: Record<string, number> = {};
    (data || []).forEach((payment: any) => {
      const date = payment.created_at.split("T")[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + payment.amount;
    });

    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw error;
  }
}

export async function getEventTimeSeries(
  eventType: AnalyticsEventType,
  days: number = 7
) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseBrowser
      .from("analytics_events")
      .select("created_at, id")
      .eq("event_type", eventType)
      .gte("created_at", startDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch event time series: ${error.message}`);
    }

    // Group by date
    const eventsByDate: Record<string, number> = {};
    (data || []).forEach((event: any) => {
      const date = event.created_at.split("T")[0];
      eventsByDate[date] = (eventsByDate[date] || 0) + 1;
    });

    return Object.entries(eventsByDate)
      .map(([date, count]) => ({ date, [eventType]: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching event time series:", error);
    throw error;
  }
}
