import fetch from "node-fetch";

const PROJECT_ID = process.env.VERTEX_PROJECT_ID || "";
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const API_KEY = process.env.VERTEX_API_KEY || "";
const EMBEDDING_MODEL =
  process.env.VERTEX_EMBEDDING_MODEL || "textembedding-gecko";
const GEN_MODEL = process.env.VERTEX_GEN_MODEL || "gemini-1.5";

if (!PROJECT_ID) {
  // not throwing here to keep dev machine flexibility; functions will check keys
}

function makeUrl(model: string) {
  // Vertex AI predict endpoint (publisher models)
  // NOTE: This URL pattern may need adjusting per Google/Vertex API changes.
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:predict?key=${API_KEY}`;
}

export async function embedText(text: string) {
  if (!API_KEY) throw new Error("Missing VERTEX_API_KEY");
  const url = makeUrl(EMBEDDING_MODEL);
  const body = {
    instances: [{ content: text }],
    parameters: { embedding: true },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vertex embed error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  // The response shape can vary; try to be resilient
  const emb =
    json?.predictions?.[0]?.embedding ||
    json?.predictions?.[0]?.output?.embeddings ||
    json?.predictions?.[0];
  if (!emb) throw new Error("No embedding in Vertex response");
  // Ensure the embedding is a float array
  if (Array.isArray(emb)) return emb;
  if (Array.isArray(emb?.embedding)) return emb.embedding;
  return emb;
}

export async function generateText(prompt: string, options: any = {}) {
  if (!API_KEY) throw new Error("Missing VERTEX_API_KEY");
  const url = makeUrl(GEN_MODEL);
  const body = {
    instances: [{ content: prompt }],
    parameters: {
      maxOutputTokens: options.maxOutputTokens || 512,
      temperature: options.temperature || 0.2,
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vertex generate error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  const out = json?.predictions?.[0]?.content || json?.predictions?.[0];
  return typeof out === "string" ? out : JSON.stringify(out);
}
