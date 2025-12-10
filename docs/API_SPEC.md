# API Specification — LocalExplore

Base path: `/api` (Next.js route handlers under `/app/api`)

Auth

- `POST /api/auth/signup` — sign up (proxied to Supabase Auth)
- `POST /api/auth/signin` — sign in (proxied)
- `POST /api/auth/signout` — sign out

Spots

- `GET /api/spots` — list spots, query params: q, category, lat, lng, radius
- `GET /api/spots/:slug` — get spot details
- `POST /api/spots` — create spot (partner; protected)
- `PUT /api/spots/:id` — update spot (partner; protected)
- `DELETE /api/spots/:id` — delete spot (partner/admin)

Analytics

- `POST /api/analytics/event` — record event {profile_id, spot_id, event_type, props}
- `GET /api/analytics/popular` — aggregated popular spots (admin/partner)

Subscriptions & Payments

- `POST /api/subscriptions/checkout` — create subscription checkout (generates payment request)
- `POST /api/payments/webhook` — payment provider webhook (Bakong callback)
- `GET /api/subscriptions` — list user subscriptions

Itineraries / AI

- `POST /api/itineraries/generate` — generate itinerary using RAG; body: {profile_id, preferences, date_range, spots_to_include}
- `GET /api/itineraries/:id` — fetch itinerary
- `POST /api/itineraries/:id/feedback` — submit feedback for generated itinerary

Feedback

- `POST /api/feedback` — submit feedback for spot or itinerary

Notes

- Server routes that perform privileged DB writes should use the Supabase Service Role key on the server.
- Keep requests idempotent where possible, and validate inputs strictly.
