-- Schema-drift reconciliation: the application code (see
-- components/tier-list/hooks/useTierListData.ts) exclusively queries
-- `poly_lists` and `poly_list_stats` tables. Neither table is defined
-- anywhere in this repo's committed schema (supabase/schema.sql only has
-- `diagrams` / `diagram_stats`, which no application code references).
--
-- This almost certainly means the tables were created or renamed directly
-- against the live database (e.g. via Supabase Studio) without a matching
-- migration ever being committed here. That leaves them with WHATEVER
-- access control (or lack thereof) was set at creation time, invisible to
-- this repo and to code review.
--
-- IMPORTANT: Before applying this migration, verify against the live
-- database whether `poly_lists` / `poly_list_stats` already exist:
--   - If they already exist with a different column set than assumed
--     below, this migration's `create table if not exists` will silently
--     no-op (no error, no columns added) and you must instead write an
--     `alter table` migration to add RLS to the real schema.
--   - If they already exist with the same shape but WITHOUT RLS, run only
--     the `alter table ... enable row level security` + `create policy`
--     statements below against them directly.
--   - If they don't exist yet, this migration creates them with a shape
--     inferred from the application code's actual query shape (see
--     useTierListData.ts: `.select("id, name, thumbnail, position")` on
--     poly_lists, `.select("name, value")` on poly_list_stats, joined by
--     poly_list_id) and enables RLS matching the existing tier_lists /
--     diagrams ownership pattern.

create table if not exists poly_lists (
  id uuid default uuid_generate_v4() primary key,
  tier_list_id uuid references tier_lists on delete cascade,
  name text not null,
  thumbnail text,
  position integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists poly_list_stats (
  id uuid default uuid_generate_v4() primary key,
  poly_list_id uuid references poly_lists on delete cascade,
  name text not null,
  value numeric not null default 5.0,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_poly_lists_tier_list_id on poly_lists(tier_list_id);
create index if not exists idx_poly_list_stats_poly_list_id on poly_list_stats(poly_list_id);

alter table poly_lists enable row level security;

create policy "Users can view their own poly lists" on poly_lists
  for select using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can insert their own poly lists" on poly_lists
  for insert with check (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can update their own poly lists" on poly_lists
  for update using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can delete their own poly lists" on poly_lists
  for delete using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

alter table poly_list_stats enable row level security;

create policy "Users can view their own poly list stats" on poly_list_stats
  for select using (
    poly_list_id in (
      select p.id from poly_lists p
      join tier_lists tl on tl.id = p.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can insert their own poly list stats" on poly_list_stats
  for insert with check (
    poly_list_id in (
      select p.id from poly_lists p
      join tier_lists tl on tl.id = p.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can update their own poly list stats" on poly_list_stats
  for update using (
    poly_list_id in (
      select p.id from poly_lists p
      join tier_lists tl on tl.id = p.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can delete their own poly list stats" on poly_list_stats
  for delete using (
    poly_list_id in (
      select p.id from poly_lists p
      join tier_lists tl on tl.id = p.tier_list_id
      where tl.user_id = auth.uid()
    )
  );
