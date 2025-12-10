-- Add pgvector and spot_embeddings for semantic search
create extension if not exists pgvector;

create table if not exists spot_embeddings (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Index for faster nearest-neighbor (adjust lists depending on dataset size)
create index if not exists idx_spot_embeddings_embedding on spot_embeddings using ivfflat (embedding) with (lists = 100);

-- Function to search nearest spots by embedding
create or replace function search_spots_by_embedding(query_embedding vector, limit integer default 10)
returns table(spot_id uuid, score double precision) as $$
  select spot_id, (embedding <-> query_embedding) as score
  from spot_embeddings
  order by embedding <-> query_embedding
  limit limit;
$$ language sql stable;
