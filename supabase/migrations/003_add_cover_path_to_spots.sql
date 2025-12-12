-- Add cover_path to spots for robust storage operations
alter table if exists spots
add column if not exists cover_path text;

-- Optional index for faster lookup
create index if not exists idx_spots_cover_path on spots (cover_path);
