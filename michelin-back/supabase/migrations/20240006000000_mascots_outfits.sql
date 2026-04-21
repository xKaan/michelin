create table mascots (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  base_species varchar not null,
  description text,
  released_at date
);

create table user_mascots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mascot_id uuid not null references mascots(id),
  is_active boolean not null default false,
  nickname varchar,
  xp int not null default 0,
  level int not null default 1,
  unlocked_at timestamp with time zone default now(),
  unique (user_id, mascot_id)
);

create unique index one_active_mascot_per_user
  on user_mascots (user_id)
  where is_active = true;

create table outfits (
  id uuid primary key default gen_random_uuid(),
  mascot_id uuid not null references mascots(id),
  name varchar not null,
  description text,
  rarity varchar not null default 'common'
    check (rarity in ('common', 'rare', 'legendary')),
  unlock_condition varchar not null
    check (unlock_condition in ('restaurant_visit', 'season', 'achievement')),
  restaurant_id uuid references restaurants(id),
  preview_url varchar,
  released_at date
);

create table user_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  outfit_id uuid not null references outfits(id),
  user_mascot_id uuid not null references user_mascots(id),
  is_equipped boolean not null default false,
  unlocked_via varchar not null
    check (unlocked_via in ('checkin', 'season', 'achievement')),
  unlocked_at timestamp with time zone default now(),
  unique (user_id, outfit_id)
);

create unique index one_equipped_outfit_per_mascot
  on user_outfits (user_mascot_id)
  where is_equipped = true;
