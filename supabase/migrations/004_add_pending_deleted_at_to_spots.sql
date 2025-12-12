-- Add pending_deleted_at column to spots to support undoable deletes
alter table if exists spots
add column if not exists pending_deleted_at timestamptz;

create index if not exists idx_spots_pending_deleted_at on spots (pending_deleted_at);
