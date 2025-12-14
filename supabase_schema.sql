-- Supabase / Postgres schema for LocalExplore
-- Enable required extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Users table (mirrors Supabase Auth users but we keep profile data here)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid not null unique,
  email text,
  full_name text,
  display_name text,
  locale text default 'en', -- 'en' or 'km'
  avatar_url text,
  bio text,
  is_partner boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Partners and admins can also have records in profiles (is_partner/is_admin)

-- Partners table for partner-specific metadata
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  company_name text,
  vat_number text,
  contact_phone text,
  contact_email text,
  accepted boolean default false,
  created_at timestamptz default now()
);

-- Admins table (lightweight)
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Spots (cafés, events, workshops, attractions)
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  category text,
  tags text[],
  address text,
  location geography(Point,4326),
  city text default 'Phnom Penh',
  price_level int,
  currency text default 'KHR',
  cover_url text,
  extra jsonb,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_spots_location on spots using gist (location);
create index if not exists idx_spots_category on spots (category);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tier text not null,
  billing_cycle text default 'monthly', -- 'monthly' or 'yearly'
  payment_token_id text, -- PayWay CoF token
  started_at timestamptz default now(),
  expires_at timestamptz,
  status text default 'created', -- created, active, past_due, canceled
  metadata jsonb
);

-- Payments (Bakong QR and other providers)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  provider text,
  provider_ref text,
  amount numeric(12,2),
  currency text,
  status text,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- Analytics: views, clicks, saves
create table if not exists analytics_events (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete set null,
  spot_id uuid references spots(id) on delete cascade,
  event_type text not null,
  event_props jsonb,
  created_at timestamptz default now()
);

-- Materialized or aggregated tables can be built from analytics_events

-- Itinerary history (RAG outputs and user selections)
create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  title text,
  description text,
  itinerary jsonb, -- structured list of stops, durations, notes
  embedding vector(1536), -- if using pgvector extension replace type accordingly
  model text,
  source_docs jsonb,
  created_at timestamptz default now()
);

-- Weekend popularity logs
create table if not exists weekend_popularity (
  id bigserial primary key,
  spot_id uuid references spots(id) on delete cascade,
  date date not null,
  popularity_score numeric(5,2),
  sample_count int,
  created_at timestamptz default now()
);

-- Feedback system
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  spot_id uuid references spots(id) on delete set null,
  itinerary_id uuid references itineraries(id) on delete set null,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  meta jsonb,
  created_at timestamptz default now()
);

-- Audit triggers for updated_at
create function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger trg_spots_updated_at before update on spots for each row execute procedure update_updated_at_column();

-- Example view: popular spots last 7 days
create or replace view popular_spots_7d as
select spot_id, count(*) as view_count
from analytics_events
where event_type = 'view' and created_at >= now() - interval '7 days'
group by spot_id
order by view_count desc;
