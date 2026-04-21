create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  coordinates geography(point, 4326) not null,
  address text,
  city varchar,
  country varchar default 'FR',
  michelin_status varchar not null default 'none'
    check (michelin_status in ('none', 'bib', 'one', 'two', 'three')),
  cuisines varchar[],
  opening_hours jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index on restaurants using gist(coordinates);

create table user_qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token varchar unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  qr_code_id uuid references user_qr_codes(id),
  gps_at_scan geography(point, 4326),
  checked_in_at timestamp with time zone default now()
);

create index on checkins (user_id, restaurant_id, checked_in_at);
