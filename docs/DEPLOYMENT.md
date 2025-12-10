# Deployment Plan — LocalExplore

Frontend (Vercel)

- Build: Next.js 14 App Router
- Environment variables (on Vercel):

  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (only for serverless functions; keep secret)
  - `OPENAI_API_KEY` or other LLM provider keys
  - `MAPBOX_TOKEN` (if using Mapbox)
  - `BAKONG_API_KEY` and secrets for payments callback

  If using Gemini (Vertex AI) set:

  - `VERTEX_PROJECT_ID`
  - `VERTEX_LOCATION` (e.g., `us-central1`)
  - `VERTEX_API_KEY` (or configure service account-based auth)
  - `VERTEX_EMBEDDING_MODEL` (optional)
  - `VERTEX_GEN_MODEL` (optional)

Backend (Supabase)

- Database: restore SQL schema (`supabase_schema.sql`) to project DB
- Storage: configure buckets (public `spots`, private `partners`)
- Auth: configure providers and email templates

CI/CD

- Vercel automatically deploys on push to `main`.
- Set environment variables in Vercel & Supabase.

Secrets & Security

- Do not expose service role key to the browser. Use server route handlers that run with the service role key.
- Use Supabase Row Level Security for fine-grained data access.

Testing & Rollout

- Start with staging Supabase project and Vercel preview deployment.
- Run end-to-end tests for auth, spot CRUD, payments webhook.
