-- Migration: Loyalty rewards — fidélité basée sur le nombre de visites

-- 1. Ajouter min_checkins à la table rewards
alter table rewards
  add column if not exists min_checkins int not null default 0;

-- 2. Mettre à jour la vue pour exposer min_checkins
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
  e.name  as establishment_name,
  e.city  as establishment_city,
  r.min_checkins
from user_rewards ur
join rewards      r on r.id = ur.reward_id
join establishments e on e.id = r.establishment_id
where ur.status = 'available'
  and (ur.expires_at is null or ur.expires_at > now());

-- 3. Seed des 4 paliers de fidélité pour chaque établissement
-- 2ème visite → cocktail offert
insert into rewards
  (establishment_id, name, description, reward_type, min_tier, min_xp, min_checkins, is_active)
select
  id,
  'Cocktail de bienvenue',
  'Un cocktail offert par la maison pour votre fidélité',
  'drink', 'explorer', 0, 2, true
from establishments
where not exists (
  select 1 from rewards r
  where r.establishment_id = establishments.id and r.min_checkins = 2
);

-- 3ème visite → −5 % sur l'addition
insert into rewards
  (establishment_id, name, description, reward_type, min_tier, min_xp, min_checkins, is_active)
select
  id,
  '−5 % sur l''addition',
  'Réduction de 5 % sur votre note finale',
  'discount', 'explorer', 0, 3, true
from establishments
where not exists (
  select 1 from rewards r
  where r.establishment_id = establishments.id and r.min_checkins = 3
);

-- 5ème visite → dessert offert
insert into rewards
  (establishment_id, name, description, reward_type, min_tier, min_xp, min_checkins, is_active)
select
  id,
  'Dessert maison offert',
  'Un dessert au choix offert par le chef',
  'food', 'explorer', 0, 5, true
from establishments
where not exists (
  select 1 from rewards r
  where r.establishment_id = establishments.id and r.min_checkins = 5
);

-- 8ème visite → −10 % sur l'addition
insert into rewards
  (establishment_id, name, description, reward_type, min_tier, min_xp, min_checkins, is_active)
select
  id,
  '−10 % sur l''addition',
  'Réduction de 10 % sur votre note finale',
  'discount', 'explorer', 0, 8, true
from establishments
where not exists (
  select 1 from rewards r
  where r.establishment_id = establishments.id and r.min_checkins = 8
);

-- 4. Fonction qui débloque les rewards fidélité après chaque checkin
create or replace function unlock_loyalty_rewards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checkin_count int;
  v_reward_id     uuid;
begin
  select count(*) into v_checkin_count
  from checkins
  where user_id         = new.user_id
    and establishment_id = new.establishment_id;

  for v_reward_id in
    select r.id
    from rewards r
    where r.establishment_id = new.establishment_id
      and r.is_active         = true
      and r.min_checkins      > 0
      and r.min_checkins     <= v_checkin_count
      and not exists (
        select 1 from user_rewards ur
        where ur.user_id   = new.user_id
          and ur.reward_id = r.id
      )
  loop
    insert into user_rewards (user_id, reward_id, checkin_id, status, unlocked_at)
    values (new.user_id, v_reward_id, new.id, 'available', now())
    on conflict (user_id, reward_id) do nothing;
  end loop;

  return new;
end;
$$;

-- 5. Trigger sur les checkins
drop trigger if exists after_checkin_unlock_loyalty on checkins;
create trigger after_checkin_unlock_loyalty
  after insert on checkins
  for each row
  execute function unlock_loyalty_rewards();
