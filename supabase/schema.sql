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