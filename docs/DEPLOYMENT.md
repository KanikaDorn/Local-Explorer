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

  For pending-delete cleanup:

  - `PENDING_DELETE_TTL_SECONDS` (optional, default 300 / 5 minutes): time in seconds before a marked-pending spot is permanently deleted and storage objects are removed

Backend (Supabase)

- Database: restore SQL schema (`supabase_schema.sql`) and run all migrations in `supabase/migrations/` to project DB
  - Run migrations via Supabase Dashboard → SQL Editor, or via `psql` / Supabase CLI
  - Migrations add: `itinerary_shares`, `spot_moderation`, `cover_path`, `pending_deleted_at` columns/tables
- Storage: configure buckets (public `spots` for partner-uploaded images)
- Auth: configure providers and email templates
- Pending-delete cleanup: schedule a periodic job (e.g., every 5–15 minutes) to call `/api/admin/cleanup/pending-deletes` (POST) with an admin `user-id` header. This permanently removes rows older than `PENDING_DELETE_TTL_SECONDS` and cleans up associated storage objects.

CI/CD

- Vercel automatically deploys on push to `main`.
- Set environment variables in Vercel & Supabase.

Secrets & Security

- Do not expose service role key to the browser. Use server route handlers that run with the service role key.
- Use Supabase Row Level Security for fine-grained data access.

Scheduled Jobs

- **Pending-delete cleanup**: Set up a scheduled task (Vercel Cron, AWS Lambda, Google Cloud Scheduler, etc.) to call POST `/api/admin/cleanup/pending-deletes`.
  - Example (Vercel `vercel.json`): add a cron job that fires every 5 minutes and calls the cleanup endpoint with an admin `user-id` header.
  - Example (manual cron): `curl -X POST https://<app-url>/api/admin/cleanup/pending-deletes -H "user-id: <ADMIN_AUTH_UID>"`.
  - The job will permanently delete rows with `pending_deleted_at` older than `PENDING_DELETE_TTL_SECONDS` and remove their Supabase storage objects.
  - **Security**: For production, use a dedicated admin service account or a server-side script (do not embed admin UID in public scheduler config).

Testing & Rollout

- Start with staging Supabase project and Vercel preview deployment.
- Run end-to-end tests for auth, spot CRUD, payments webhook, and pending-delete undo flow.
- Verify the cleanup job: delete a spot, confirm it's marked pending, undo within the TTL, and verify it's permanently removed after TTL expires.
