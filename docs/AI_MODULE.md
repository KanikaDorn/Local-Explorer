# AI Module — RAG & Itinerary Generation

Design Goals

- Fast, relevant itinerary generation using Retrieval-Augmented Generation (RAG)
- Store embeddings for spots and documents to allow semantic search
- Keep a record of generated itineraries for personalization and analytics

Indexing / Embeddings

- Supabase with `pgvector` extension (preferred for simplicity)
- External vector DB (Pinecone/Weaviate) if scale warrants

Indexing / Embeddings

- Source docs: spot descriptions, partner pages, event details, curated guides
- Embeddings: recommended vector size 1536
- Storage: options
  - Supabase with `pgvector` extension (preferred for simplicity) — sample migration `supabase_embeddings.sql` included
  - External vector DB (Pinecone/Weaviate) if scale warrants

Embedding schema

- `itineraries.embedding` (vector) — stored for recommendations
- `spot_embeddings` table: (spot_id, embedding vector, metadata jsonb, created_at)

Gemini (Vertex AI) details

- This project includes a small Vertex AI adapter (`src/lib/vertex.ts`) to call Gemini/Vertex via REST using an API key.
- Environment variables used:
  - `VERTEX_PROJECT_ID` — your Google Cloud project id
  - `VERTEX_LOCATION` — region (default `us-central1`)
  - `VERTEX_API_KEY` — API key for Vertex (or use service account workflows and adapt the adapter)
  - `VERTEX_EMBEDDING_MODEL` — model identifier for embeddings (default `textembedding-gecko`)
  - `VERTEX_GEN_MODEL` — generation model identifier (default `gemini-1.5`)

RAG Workflow (updated)

1. User submits prompt (preferences, time, mobility, language)
2. System creates an embedding for the prompt using Gemini embedding model
3. Run semantic search via Postgres `spot_embeddings` using `pgvector` (RPC `search_spots_by_embedding`)
4. Retrieve top-K spot docs and construct a prompt including source snippets
5. Call Gemini (Vertex) to generate the itinerary JSON
6. Store itinerary in `itineraries` with the prompt embedding and source doc references

Prompt templates

- System: "You are a helpful local guide for Phnom Penh. Use the sources…"
- User instruction: include preferences, budget, time, language
- Example: Provide morning/evening options, safety tips, and transportation modes (tuk-tuk, walk).

Safety & Filtering

- Sanitize external data; avoid hallucinations by including source snippets and asking model to cite sources.

Evaluation

- Capture feedback and rating to re-rank or fine-tune future itineraries.

Embedding schema

- `itineraries.embedding` (vector) — stored for recommendations
- `spot_embeddings` table: (spot_id, embedding vector, metadata jsonb, last_indexed)

RAG Workflow

1. User submits prompt (preferences, time, mobility, language)
2. System runs a filtered retrieval: spatial filter (nearby Phnom Penh), time filter (open hours), semantic filter (preferences)
3. Retrieve top-N docs/spot embeddings
4. Build prompt with templates + source snippets
5. Call LLM to generate itinerary (with step-by-step stops, durations, map coords)
6. Save itinerary JSON and embedding (for caching and later personalization)

Prompt templates

- System: "You are a helpful local guide for Phnom Penh. Use the sources…"
- User instruction: include preferences, budget, time, language
- Example: Provide morning/evening options, safety tips, and transportation modes (tuk-tuk, walk).

Safety & Filtering

- Sanitize external data; avoid hallucinations by including source snippets and asking model to cite sources.

Evaluation

- Capture feedback and rating to re-rank or fine-tune future itineraries.
