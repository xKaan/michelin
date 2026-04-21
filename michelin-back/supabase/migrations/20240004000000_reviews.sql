create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  checkin_id uuid not null references checkins(id),
  rating int not null check (rating between 1 and 5),
  content text,
  status varchar not null default 'pending'
    check (status in ('pending', 'published', 'flagged')),
  likes_count int not null default 0,
  flags_count int not null default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique (user_id, restaurant_id)
);

create table media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  url varchar not null,
  type varchar not null check (type in ('photo', 'video')),
  uploaded_at timestamp with time zone default now()
);

create table reactions (
  user_id uuid not null references users(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  type varchar not null check (type in ('like', 'flag')),
  created_at timestamp with time zone default now(),
  primary key (user_id, review_id)
);
