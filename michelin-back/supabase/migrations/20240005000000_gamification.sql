create table xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  action varchar not null check (action in (
    'checkin', 'review', 'photo', 'like', 'streak_bonus'
  )),
  xp_gained int not null,
  ref_id uuid,
  created_at timestamp with time zone default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  badge_type varchar not null,
  season varchar,
  earned_at timestamp with time zone default now()
);

create table streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  current_count int not null default 0,
  best_count int not null default 0,
  last_activity_date date
);
