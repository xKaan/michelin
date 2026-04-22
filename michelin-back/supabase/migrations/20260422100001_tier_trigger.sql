-- Migration 011 — Triggers tier + badges + QR auto

-- ─── Paliers XP ──────────────────────────────────────────────────────────────
-- explorer :    0 XP
-- member   :  500 XP
-- gourmet  : 2000 XP
-- expert   : 5000 XP

create or replace function compute_tier(xp int)
returns varchar
language sql
immutable
as $$
  select case
    when xp >= 5000 then 'expert'
    when xp >= 2000 then 'gourmet'
    when xp >= 500  then 'member'
    else 'explorer'
  end;
$$;

-- ─── Trigger : upgrade de tier + attribution du badge de tier ─────────────────
create or replace function on_xp_event_tier_check()
returns trigger as $$
declare
  current_tier varchar;
  new_tier varchar;
begin
  select tier into current_tier from users where id = new.user_id;
  new_tier := compute_tier((select xp_total from users where id = new.user_id));

  if new_tier != current_tier then
    -- Mettre à jour le tier
    update users set tier = new_tier where id = new.user_id;

    -- Créer un badge de franchissement de palier
    insert into badges (user_id, badge_type)
    values (new.user_id, 'tier_' || new_tier)
    on conflict do nothing;

    -- Notification de montée de tier
    insert into notifications (user_id, type, payload)
    values (
      new.user_id,
      'tier_upgrade',
      jsonb_build_object('old_tier', current_tier, 'new_tier', new_tier)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_tier_check
  after insert on xp_events
  for each row execute function on_xp_event_tier_check();

-- ─── Trigger : débloquer les récompenses après checkin ───────────────────────
create or replace function on_checkin_unlock_rewards()
returns trigger as $$
declare
  user_tier varchar;
  user_xp int;
begin
  select tier, xp_total into user_tier, user_xp
  from users where id = new.user_id;

  -- Insérer les récompenses éligibles non encore attribuées
  insert into user_rewards (user_id, reward_id, checkin_id, expires_at)
  select
    new.user_id,
    r.id,
    new.id,
    now() + interval '30 days'
  from rewards r
  where r.establishment_id = new.establishment_id
    and r.is_active = true
    and (r.valid_from is null or r.valid_from <= current_date)
    and (r.valid_until is null or r.valid_until >= current_date)
    and (
      -- Condition tier (ordre hiérarchique)
      case r.min_tier
        when 'explorer' then true
        when 'member'   then user_tier in ('member', 'gourmet', 'expert')
        when 'gourmet'  then user_tier in ('gourmet', 'expert')
        when 'expert'   then user_tier = 'expert'
      end
      or user_xp >= r.min_xp
    )
  on conflict (user_id, reward_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_checkin_unlock_rewards
  after insert on checkins
  for each row execute function on_checkin_unlock_rewards();

-- ─── Notification tier_upgrade (ajout du type manquant) ──────────────────────
alter table notifications
  drop constraint if exists notifications_type_check;

alter table notifications
  add constraint notifications_type_check
  check (type in (
    'wishlist_nearby', 'friend_checkin', 'streak_reminder',
    'outfit_unlocked', 'tier_upgrade', 'reward_unlocked'
  ));

-- ─── QR code auto-généré à l'inscription ─────────────────────────────────────
create or replace function on_user_created_generate_qr()
returns trigger as $$
begin
  insert into user_qr_codes (user_id, token, expires_at)
  values (
    new.id,
    gen_random_uuid()::text,
    now() + interval '15 minutes'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_user_created_qr
  after insert on users
  for each row execute function on_user_created_generate_qr();

-- ─── Expiration automatique des QR codes dépassés ────────────────────────────
-- (appelable manuellement ou via pg_cron si disponible)
create or replace function expire_old_qr_codes()
returns void
language sql
as $$
  update user_rewards
  set status = 'expired'
  where status = 'available'
    and expires_at < now();
$$;
