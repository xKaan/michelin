create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar unique not null,
  phone varchar unique,
  display_name varchar not null,
  tier varchar not null default 'explorer'
    check (tier in ('explorer', 'member', 'gourmet', 'expert')),
  xp_total int not null default 0,
  last_location geography(point, 4326),
  created_at timestamp with time zone default now()
);

create table user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  method varchar not null check (method in ('qr_scan', 'manual', 'oauth')),
  proof_ref varchar,
  verified_at timestamp with time zone default now()
);

create table follows (
  follower_id uuid not null references users(id) on delete cascade,
  followed_id uuid not null references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, followed_id),
  check (follower_id != followed_id)
);
