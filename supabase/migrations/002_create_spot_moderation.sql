-- Migration: create spot_moderation table for admin moderation
create table if not exists spot_moderation (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  flagged_by uuid references profiles(id) on delete set null,
  reason text,
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger if not exists trg_spot_moderation_updated_at before update on spot_moderation
  for each row execute procedure update_updated_at_column();
