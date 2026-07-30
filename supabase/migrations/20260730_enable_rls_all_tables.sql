-- Security fix: enable Row Level Security on every table that was missing
-- it. Prior to this migration, only `group_tier_lists` had RLS enabled
-- (see 20240131_add_group_tier_list_relations.sql). `profiles`, `tier_lists`,
-- `tiers`, `items`, `groups`, `diagrams`, and `diagram_stats` had NO row
-- level security at all.
--
-- The app talks to Postgres exclusively through the Supabase anon key
-- (see utils/supabase/client.ts / utils/supabase/server.ts — there is no
-- service_role usage in application code), so RLS is the *only* access
-- control boundary for these tables. Application-level `.eq("user_id", ...)`
-- filters (see utils/supabase/server.ts: deleteTierList, deleteGroup,
-- updateGroupPosition, updateTierListPosition, etc.) are not a security
-- control by themselves — any authenticated user could call the Supabase
-- client directly (browser devtools, curl with their own session cookie)
-- with a different id and read/modify/delete other users' rows. This
-- migration closes that gap.
--
-- Ownership model:
--   profiles.id           == auth.uid()            (row is the user)
--   tier_lists.user_id     == auth.uid()            (direct owner)
--   groups.user_id         == auth.uid()            (direct owner)
--   tiers.tier_list_id     -> tier_lists.user_id     (owned via tier list)
--   items.tier_id          -> tiers.tier_list_id -> tier_lists.user_id
--   diagrams.tier_list_id  -> tier_lists.user_id     (owned via tier list)
--   diagram_stats.diagram_id -> diagrams.tier_list_id -> tier_lists.user_id
--
-- `diagrams`/`diagram_stats` are not referenced by any current application
-- code (the app queries `poly_lists`/`poly_list_stats` instead, which are
-- not yet defined in this repo's committed schema — see the follow-up
-- migration 20260730_add_poly_lists_tables.sql). They are locked down here
-- anyway as defense in depth in case they are still live in the database.
-- `tiers`/`items` are similarly unreferenced by current application code
-- but are locked down for the same reason.

-- profiles ------------------------------------------------------------
alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (id = auth.uid());

create policy "Users can insert their own profile" on profiles
  for insert with check (id = auth.uid());

create policy "Users can update their own profile" on profiles
  for update using (id = auth.uid());

-- tier_lists ------------------------------------------------------------
alter table tier_lists enable row level security;

create policy "Users can view their own tier lists" on tier_lists
  for select using (user_id = auth.uid());

create policy "Users can insert their own tier lists" on tier_lists
  for insert with check (user_id = auth.uid());

create policy "Users can update their own tier lists" on tier_lists
  for update using (user_id = auth.uid());

create policy "Users can delete their own tier lists" on tier_lists
  for delete using (user_id = auth.uid());

-- groups ------------------------------------------------------------
alter table groups enable row level security;

create policy "Users can view their own groups" on groups
  for select using (user_id = auth.uid());

create policy "Users can insert their own groups" on groups
  for insert with check (user_id = auth.uid());

create policy "Users can update their own groups" on groups
  for update using (user_id = auth.uid());

create policy "Users can delete their own groups" on groups
  for delete using (user_id = auth.uid());

-- tiers (owned via tier_lists) ----------------------------------------
alter table tiers enable row level security;

create policy "Users can view their own tiers" on tiers
  for select using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can insert their own tiers" on tiers
  for insert with check (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can update their own tiers" on tiers
  for update using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can delete their own tiers" on tiers
  for delete using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

-- items (owned via tiers -> tier_lists) --------------------------------
alter table items enable row level security;

create policy "Users can view their own items" on items
  for select using (
    tier_id in (
      select t.id from tiers t
      join tier_lists tl on tl.id = t.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can insert their own items" on items
  for insert with check (
    tier_id in (
      select t.id from tiers t
      join tier_lists tl on tl.id = t.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can update their own items" on items
  for update using (
    tier_id in (
      select t.id from tiers t
      join tier_lists tl on tl.id = t.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can delete their own items" on items
  for delete using (
    tier_id in (
      select t.id from tiers t
      join tier_lists tl on tl.id = t.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

-- diagrams (owned via tier_lists) ---------------------------------------
alter table diagrams enable row level security;

create policy "Users can view their own diagrams" on diagrams
  for select using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can insert their own diagrams" on diagrams
  for insert with check (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can update their own diagrams" on diagrams
  for update using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

create policy "Users can delete their own diagrams" on diagrams
  for delete using (
    tier_list_id in (select id from tier_lists where user_id = auth.uid())
  );

-- diagram_stats (owned via diagrams -> tier_lists) -----------------------
alter table diagram_stats enable row level security;

create policy "Users can view their own diagram stats" on diagram_stats
  for select using (
    diagram_id in (
      select d.id from diagrams d
      join tier_lists tl on tl.id = d.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can insert their own diagram stats" on diagram_stats
  for insert with check (
    diagram_id in (
      select d.id from diagrams d
      join tier_lists tl on tl.id = d.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can update their own diagram stats" on diagram_stats
  for update using (
    diagram_id in (
      select d.id from diagrams d
      join tier_lists tl on tl.id = d.tier_list_id
      where tl.user_id = auth.uid()
    )
  );

create policy "Users can delete their own diagram stats" on diagram_stats
  for delete using (
    diagram_id in (
      select d.id from diagrams d
      join tier_lists tl on tl.id = d.tier_list_id
      where tl.user_id = auth.uid()
    )
  );
