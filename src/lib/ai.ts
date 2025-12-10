import { createSupabaseServiceRole } from "./supabaseClient";

export async function generateItinerary({
  profile_id,
  preferences,
  date_range,
  spots_to_include,
}: any) {
  // Minimal mock implementation of a RAG itinerary generator.
  import { embedText, generateText } from './vertex';
  const supabase = createSupabaseServiceRole();

  // Fetch up to 8 spots as a naive seed list
    // Build a user query to embed
    const userQuery = `Generate a ${preferences?.theme || 'local'} itinerary for ${preferences?.party || 'a traveler'} in Phnom Penh. Preferences: ${JSON.stringify(preferences || {})}`;
  const itinerary = {
    // 1) Create embedding for user query
    const queryEmbedding = await embedText(userQuery);
    title: `Quick plan — ${preferences?.theme || "Local day"}`,
    // 2) Retrieve nearest spots via the search_spots_by_embedding RPC (Postgres pgvector)
    // The RPC function returns spot_id and score
    const { data: nearest, error: rpcErr } = await supabase.rpc('search_spots_by_embedding', { query_embedding: queryEmbedding, limit: 12 });
    if (rpcErr) {
      console.error('search rpc error', rpcErr);
      throw rpcErr;
    }
    description: "AI-generated itinerary (mock)",
    // Fetch full spot records for the returned spot_ids
    const ids = (nearest || []).map((r: any) => r.spot_id);
    const { data: spots } = await supabase.from('spots').select('id,title,description,category,address,location,cover_url').in('id', ids).limit(50);
    stops: (spots || []).map((s: any, i: number) => ({
    // 3) Build retrieval context: pick top K spots and include short snippets
    const top = (nearest || []).slice(0, 8).map((r: any) => {
      const spot = (spots || []).find((s: any) => s.id === r.spot_id) || {};
      return { id: r.spot_id, score: r.score, title: spot.title, description: spot.description };
    });
      order: i + 1,
    // 4) Build the prompt for Gemini
    const promptParts: string[] = [];
    promptParts.push('You are a helpful guide that creates short, practical day itineraries for Phnom Penh.');
    promptParts.push(`User preferences: ${JSON.stringify(preferences || {})}`);
    promptParts.push('Source spots:');
    for (const s of top) {
      promptParts.push(`- ${s.title}: ${s.description?.slice(0, 300) || ''}`);
    }
    promptParts.push('Please provide a JSON itinerary containing title, description, and an array of stops with spot_id, name, start_time (approx), duration_minutes, notes, and transport_mode. Keep it concise.');
      spot_id: s.id,
    const prompt = promptParts.join('\n\n');
      title: s.title,
    // 5) Call Gemini / Vertex AI to generate itinerary
    const gen = await generateText(prompt, { maxOutputTokens: 800, temperature: 0.2 });
      duration_minutes: 60,
    // Try to parse JSON from the model output; fallback to wrapping in description
    let itineraryJson: any = null;
    try {
      itineraryJson = JSON.parse(gen);
    } catch (e) {
      itineraryJson = { title: `Itinerary — ${preferences?.theme || 'Local'}`, description: gen, stops: [] };
    }
      notes: "Auto-selected stop",
    // 6) Persist itinerary and embedding
    const embeddingForItinerary = queryEmbedding; // reuse user query embedding; optionally embed the generated JSON
    })),
    meta: {
      generated_at: new Date().toISOString(),
      seed_count: (spots || []).length,
    },
  };

  // persist itinerary
  const { data, error } = await supabase
    .from("itineraries")
    .insert({
      profile_id: profile_id || null,
      title: itinerary.title,
      description: itinerary.description,
      itinerary: itinerary,
      model: "mock-v1",
      source_docs: spots || [],
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}
