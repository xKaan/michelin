create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar not null,
  is_public boolean not null default false,
  updated_at timestamp with time zone default now()
);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  added_at timestamp with time zone default now(),
  unique (list_id, restaurant_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type varchar not null check (type in (
    'wishlist_nearby', 'friend_checkin', 'streak_reminder', 'outfit_unlocked'
  )),
  payload jsonb,
  read boolean not null default false,
  sent_at timestamp with time zone default now()
);
