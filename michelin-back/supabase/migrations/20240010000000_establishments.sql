alter table restaurants rename to establishments;

alter table establishments
  add column establishment_type varchar not null default 'restaurant'
  check (establishment_type in ('restaurant', 'hotel'));

alter index restaurants_coordinates_idx rename to establishments_coordinates_idx;

alter table checkins rename column restaurant_id to establishment_id;
alter table reviews rename column restaurant_id to establishment_id;
alter table outfits rename column restaurant_id to establishment_id;
alter table list_items rename column restaurant_id to establishment_id;

alter index checkins_user_id_restaurant_id_checked_in_at_idx
  rename to checkins_user_id_establishment_id_checked_in_at_idx;

alter table reviews drop constraint reviews_user_id_restaurant_id_key;
alter table reviews add constraint reviews_user_id_establishment_id_key unique (user_id, establishment_id);

alter table list_items drop constraint list_items_list_id_restaurant_id_key;
alter table list_items add constraint list_items_list_id_establishment_id_key unique (list_id, establishment_id);

drop policy "restaurants_select" on establishments;
create policy "establishments_select" on establishments for select using (true);

drop function if exists restaurants_nearby(double precision, double precision, int);
create or replace function establishments_nearby(
  lat double precision,
  lng double precision,
  radius_m int default 5000
)
returns setof establishments
language sql stable as $$
  select *
  from establishments
  where st_dwithin(
    coordinates::geography,
    st_makepoint(lng, lat)::geography,
    radius_m
  )
  order by st_distance(
    coordinates::geography,
    st_makepoint(lng, lat)::geography
  );
$$;

drop function if exists get_restaurant_coords(uuid);
create or replace function get_establishment_coords(establishment_id uuid)
returns table(lat double precision, lng double precision)
language sql stable as $$
  select
    st_y(coordinates::geometry) as lat,
    st_x(coordinates::geometry) as lng
  from establishments
  where id = establishment_id;
$$;
