-- Migration 010 — Récompenses restaurants

-- Récompenses définies par l'admin (ou le staff du restaurant)
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  name varchar not null,                    -- ex: "Cocktail de bienvenue"
  description text,
  reward_type varchar not null
    check (reward_type in ('drink', 'food', 'discount', 'other')),
  min_tier varchar not null default 'member'
    check (min_tier in ('explorer', 'member', 'gourmet', 'expert')),
  min_xp int not null default 0,            -- seuil XP alternatif
  is_active boolean not null default true,
  valid_from date,
  valid_until date,
  created_at timestamp with time zone default now()
);

-- Récompenses débloquées par un utilisateur après checkin éligible
create table if not exists user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  reward_id uuid not null references rewards(id),
  checkin_id uuid references checkins(id),
  status varchar not null default 'available'
    check (status in ('available', 'claimed', 'expired')),
  unlocked_at timestamp with time zone default now(),
  claimed_at timestamp with time zone,
  expires_at timestamp with time zone,
  unique (user_id, reward_id)               -- une seule attribution par reward
);

-- Index pour recherche rapide des récompenses disponibles d'un user
create index if not exists user_rewards_user_status_idx
  on user_rewards (user_id, status);

-- Vue : récompenses disponibles pour un user avec détails
create or replace view user_available_rewards as
select
  ur.id,
  ur.user_id,
  ur.reward_id,
  ur.checkin_id,
  ur.status,
  ur.unlocked_at,
  ur.claimed_at,
  ur.expires_at,
  r.name,
  r.description,
  r.reward_type,
  r.min_tier,
  r.establishment_id,
  e.name as establishment_name,
  e.city as establishment_city
from user_rewards ur
join rewards r on r.id = ur.reward_id
join establishments e on e.id = r.establishment_id
where ur.status = 'available'
  and (ur.expires_at is null or ur.expires_at > now());

-- RLS
alter table rewards enable row level security;
create policy "rewards_select" on rewards for select using (is_active = true);

alter table user_rewards enable row level security;
create policy "user_rewards_owner" on user_rewards for all
  using (auth.uid() = user_id);
