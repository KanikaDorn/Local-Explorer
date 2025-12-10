# LocalExplore — System Architecture

Overview

- Frontend: Next.js 14 (App Router) + Tailwind + shadcn/ui
- Backend: Supabase (Postgres + PostGIS + Storage + Auth)
- Maps: MapLibre or Mapbox (frontend)
- AI: RAG using embeddings and Supabase/docstore
- Payments: Bakong KH QR integration via provider gateway

Components

- Web Client (Next.js App)

  - Public pages: Explore, Map, Plans
  - Authenticated: Dashboard, Plans, Bookings
  - Partner portal: Partner CRUD for spots, analytics view
  - Admin portal: moderation, payments, user management

- API (Next.js route handlers under `/app/api`)

  - Proxy to Supabase for secured server operations (service-role key)
  - Endpoints for analytics, subscription management, itinerary generation

- Supabase
  - Auth: user registration/login
  - Database: core entities (profiles, partners, spots, analytics, itineraries)
  - Storage: images and media for spots
  - Edge Functions (optional) for webhooks and payment callbacks

Data flows

- Spot listing: frontend calls public API -> reads from `spots` view
- Analytics: frontend emits events to API -> stored in `analytics_events`
- Itinerary generation: frontend sends request -> server performs RAG using embeddings + retrieved docs -> stores itinerary in `itineraries`

AI flow (high-level)

- Indexing: ingest partner content, spot descriptions, event pages into embedding store
- Retrieval: find relevant docs for a user prompt (filters: city, time, preferences)
- Generation: LLM composes itinerary, optionally augmented with map routing
- Storage: final itinerary saved with embedding for later search
