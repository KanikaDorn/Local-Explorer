-- Migration: create itinerary_shares table for public share tokens
create table if not exists itinerary_shares (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid references itineraries(id) on delete cascade,
  token text not null unique,
  created_by uuid references profiles(id) on delete set null,
  expires_at timestamptz not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_itinerary_shares_token on itinerary_shares (token);
create index if not exists idx_itinerary_shares_expires_at on itinerary_shares (expires_at);
