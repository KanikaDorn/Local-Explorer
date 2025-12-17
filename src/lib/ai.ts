import { createSupabaseServiceRole } from "./supabaseClient";
import { generateText } from "./vertex";

// RAG-based itinerary generation using Gemini AI
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
    const theme = preferences?.theme || "cultural";
    const budget = preferences?.budget || "medium";
    const duration = preferences?.duration || 2;
    const interests = Array.isArray(preferences?.interests) 
      ? preferences.interests.join(", ") 
      : "general exploration";
    const party = preferences?.party_size || "solo";

    // Create AI prompt for Gemini
    const prompt = `You are a Cambodia travel expert. Create a detailed ${duration}-day travel itinerary for Phnom Penh, Cambodia.

User Preferences:
- Travel Style: ${theme} (${getThemeDescription(theme)})
- Budget Level: ${budget} (${getBudgetDescription(budget)})
- Duration: ${duration} day(s)
- Party Size: ${party}
- Interests: ${interests}

Create a structured JSON response with this EXACT format (pure JSON only, no markdown):
{
  "title": "A catchy title for this ${theme} adventure",
  "description": "A 2-3 sentence overview of what makes this trip special",
  "stops": [
    {
      "order": 1,
      "spot_id": "unique_id_1",
      "title": "Activity or Place Name",
      "description": "What to do here and why it's great for ${theme} travelers",
      "start_time": "08:00",
      "duration_minutes": 90,
      "category": "${theme}",
      "address": "Specific address in Phnom Penh",
      "day": 1,
      "estimated_cost": "$10-20"
    }
  ]
}

Requirements:
- Generate ${Math.min(duration * 4, 12)} stops total spread across ${duration} day(s)
- Each day should have 3-5 activities from morning (8am) to evening (9pm)
- Include REAL places in Phnom Penh like: Royal Palace, Silver Pagoda, Wat Phnom, National Museum, Russian Market (Tuol Tom Poung), Central Market, Sisowath Quay (Riverside), Independence Monument, Killing Fields, S21 (for cultural/history), plus local cafes and restaurants
- For ${theme} style, focus on ${getThemeDescription(theme)}
- Budget ${budget} means ${getBudgetDescription(budget)}
- Include breakfast, lunch, and dinner spots each day
- Make times realistic with travel time between locations
- Spot IDs should be lowercase with underscores (e.g., "royal_palace_tour")

Return ONLY valid JSON, no markdown code blocks or additional text.`;

    let itinerary;
    
    try {
      // Call Gemini AI for generation
      const result = await generateText(prompt, {
        maxOutputTokens: 2500,
        temperature: 0.8,
        model: "gemini-1.5-flash"
      });

      // Clean and parse the JSON response
      let cleanedResult = result.trim();
      // Remove markdown code blocks if present
      if (cleanedResult.startsWith("```json")) {
        cleanedResult = cleanedResult.slice(7);
      } else if (cleanedResult.startsWith("```")) {
        cleanedResult = cleanedResult.slice(3);
      }
      if (cleanedResult.endsWith("```")) {
        cleanedResult = cleanedResult.slice(0, -3);
      }
      cleanedResult = cleanedResult.trim();
      
      itinerary = JSON.parse(cleanedResult);
      itinerary.theme = theme;
      itinerary.budget = budget;
      itinerary.ai_generated = true;
      itinerary.created_at = new Date().toISOString();
      
    } catch (aiError) {
      console.error("AI generation failed, falling back to template:", aiError);
      
      // Fallback to template-based generation if AI fails
      itinerary = generateFallbackItinerary(theme, budget, duration, party);
    }

    // Save itinerary to database
    const { data: savedItinerary, error: saveError } = await supabase
      .from("itineraries")
      .insert({
        profile_id,
        title: itinerary.title,
        description: itinerary.description,
        itinerary,
        model: itinerary.ai_generated ? "gemini-1.5-flash" : "template-v1",
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

function getThemeDescription(theme: string): string {
  const descriptions: Record<string, string> = {
    relaxed: "spa, yoga, quiet cafes, peaceful walks, meditation",
    adventure: "cycling, kayaking, outdoor activities, tuk-tuk tours, exploration",
    cultural: "temples, museums, traditional arts, history, Khmer heritage",
    party: "nightlife, rooftop bars, clubs, social scenes, live music",
    foodie: "street food tours, local restaurants, cooking classes, markets",
    romantic: "sunset views, couples activities, fine dining, intimate spots"
  };
  return descriptions[theme] || "local exploration and discovery";
}

function getBudgetDescription(budget: string): string {
  const descriptions: Record<string, string> = {
    low: "$20-30/day - street food, free attractions, local transport",
    medium: "$40-60/day - mix of local and upscale, some paid attractions",
    high: "$80+/day - fine dining, private tours, premium experiences"
  };
  return descriptions[budget] || "$40-60/day";
}

function generateFallbackItinerary(theme: string, budget: string, duration: number, party: string) {
  const themeActivities: Record<string, { titles: string[]; descriptions: string[] }> = {
    relaxed: {
      titles: ["Morning Yoga by Riverside", "Spa at Sofitel", "Café Brunch at Brown Coffee", "Sunset River Cruise", "Evening at Wat Phnom"],
      descriptions: ["Start with peaceful riverside yoga", "Pamper yourself at a luxury spa", "Enjoy slow-paced brunch", "Watch sunset from the water", "Evening meditation at the temple"]
    },
    adventure: {
      titles: ["Cycling Tour of Hidden Streets", "Kayaking on Tonle Sap", "Motorbike City Explorer", "Russian Market Hunt", "Rooftop Sunset"],
      descriptions: ["Discover local neighborhoods by bike", "Paddle through the river", "Feel the city breeze on two wheels", "Get lost in the famous market", "End with panoramic views"]
    },
    cultural: {
      titles: ["Royal Palace Grand Tour", "National Museum Visit", "Apsara Dance Show", "Khmer Cooking Class", "Wat Phnom Temple"],
      descriptions: ["Explore royal residence and Silver Pagoda", "Discover ancient Khmer artifacts", "Watch classical Cambodian dance", "Learn to cook amok and lok lak", "Visit the founding temple of Phnom Penh"]
    },
    party: {
      titles: ["Rooftop Bar at Eclipse", "Live Music at Pontoon", "Riverside Night Market", "Pub Street Experience", "DJ Night at Epic Club"],
      descriptions: ["Cocktails with skyline views", "Dance to live bands", "Street food and drinks by the river", "Bar hopping along the strip", "Party till late"]
    },
    foodie: {
      titles: ["Street Food Walking Tour", "Russian Market Food Hunt", "Fish Amok Cooking Class", "Fine Dining at Malis", "Night Market Feast"],
      descriptions: ["Taste authentic street food", "Discover hidden food gems", "Master Cambodia's signature dish", "Experience haute Cambodian cuisine", "Sample dozens of local delicacies"]
    },
    romantic: {
      titles: ["Sunset Champagne Cruise", "Couples Spa", "Candlelit Dinner at Foreign Correspondents Club", "Private Temple Tour", "Rooftop Stargazing"],
      descriptions: ["Float down Mekong at sunset", "Relax together with traditional treatments", "Dine with riverside views", "Explore temples privately", "Enjoy the night sky together"]
    }
  };

  const activities = themeActivities[theme] || themeActivities.cultural;
  const stops = [];
  
  for (let i = 0; i < Math.min(duration * 4, activities.titles.length); i++) {
    const day = Math.floor(i / 4) + 1;
    const hour = 8 + (i % 4) * 3;
    
    stops.push({
      order: i + 1,
      spot_id: `${theme}_spot_${i}`,
      title: activities.titles[i % activities.titles.length],
      description: activities.descriptions[i % activities.descriptions.length],
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      duration_minutes: 90,
      category: theme,
      address: "Phnom Penh City Center",
      day,
      estimated_cost: budget === "high" ? "$50+" : budget === "low" ? "$5-15" : "$20-40"
    });
  }

  return {
    title: `My ${theme.charAt(0).toUpperCase() + theme.slice(1)} Cambodia Adventure`,
    description: `A ${duration}-day ${theme} itinerary perfect for ${party} with a ${budget} budget in beautiful Phnom Penh.`,
    theme,
    budget,
    stops,
    ai_generated: false,
    created_at: new Date().toISOString()
  };
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
