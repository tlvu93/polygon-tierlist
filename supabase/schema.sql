-- Users table (handled by Supabase Auth)
-- profiles
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- tier_lists
create table tier_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  description text,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- tiers
create table tiers (
  id uuid default uuid_generate_v4() primary key,
  tier_list_id uuid references tier_lists on delete cascade,
  name text not null,
  color text not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- items
create table items (
  id uuid default uuid_generate_v4() primary key,
  tier_id uuid references tiers on delete cascade,
  name text not null,
  image_url text,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- groups
create table groups (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  parent_group_id uuid references groups on delete cascade,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- group_tier_lists
create table group_tier_lists (
  group_id uuid references groups on delete cascade,
  tier_list_id uuid references tier_lists on delete cascade,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (group_id, tier_list_id)
);

-- diagrams
create table diagrams (
  id uuid default uuid_generate_v4() primary key,
  tier_list_id uuid references tier_lists on delete cascade,
  name text not null,
  thumbnail text,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- diagram_properties
create table diagram_properties (
  id uuid default uuid_generate_v4() primary key,
  diagram_id uuid references diagrams on delete cascade,
  name text not null,
  value integer not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
