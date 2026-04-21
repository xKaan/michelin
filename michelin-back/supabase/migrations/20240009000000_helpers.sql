create or replace function restaurants_nearby(
  lat double precision,
  lng double precision,
  radius_m int default 5000
)
returns setof restaurants
language sql stable as $$
  select *
  from restaurants
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

create or replace function get_restaurant_coords(restaurant_id uuid)
returns table(lat double precision, lng double precision)
language sql stable as $$
  select
    st_y(coordinates::geometry) as lat,
    st_x(coordinates::geometry) as lng
  from restaurants
  where id = restaurant_id;
$$;

create or replace function increment_user_xp(uid uuid, amount int)
returns void language sql as $$
  update users
  set
    xp_total = xp_total + amount,
    tier = case
      when xp_total + amount >= 5000 then 'expert'
      when xp_total + amount >= 2000 then 'gourmet'
      when xp_total + amount >= 500  then 'member'
      else 'explorer'
    end
  where id = uid;
$$;
