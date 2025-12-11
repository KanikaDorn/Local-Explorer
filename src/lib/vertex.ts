// Vertex AI and Gemini integration
const PROJECT_ID = process.env.VERTEX_AI_PROJECT_ID || "";
const LOCATION = process.env.VERTEX_AI_LOCATION || "us-central1";
const GEMINI_API_KEY = process.env.GEMINI_AI_API_KEY || "";

// Using Gemini API directly instead of Vertex for simplicity
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export async function embedText(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_AI_API_KEY");
  }

  // Using Gemini's embedding model
  const url = `${GEMINI_API_URL}/embedding-001:embedContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini embedding error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data?.embedding?.values || [];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

export async function generateText(
  prompt: string,
  options: {
    maxOutputTokens?: number;
    temperature?: number;
    model?: string;
  } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_AI_API_KEY");
  }

  const model = options.model || "gemini-1.5-flash";
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens || 1024,
          temperature: options.temperature || 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini generation error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return textContent;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

export async function generateItineraryFromPreferences(
  preferences: Record<string, any>
): Promise<any> {
  const prompt = `
    Create a weekend itinerary in Phnom Penh with the following preferences:
    - Theme: ${preferences.theme || "Local Exploration"}
    - Party Size: ${preferences.party || "Solo"}
    - Budget: ${preferences.budget || "Medium ($30-50/day)"}
    - Interests: ${
      Array.isArray(preferences.interests)
        ? preferences.interests.join(", ")
        : "General"
    }
    
    Please provide a structured itinerary with:
    1. Title
    2. Overview
    3. Day-by-day schedule with specific times
    4. Restaurant recommendations
    5. Transportation tips
    6. Budget breakdown
    
    Format as JSON with clear structure.
  `;

  try {
    const result = await generateText(prompt, {
      maxOutputTokens: 1500,
      temperature: 0.8,
    });

    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(result);
    } catch {
      return { text: result };
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}
