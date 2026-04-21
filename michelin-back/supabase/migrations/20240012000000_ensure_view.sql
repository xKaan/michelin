create or replace view establishments_view as
select
  id,
  name,
  establishment_type,
  address,
  city,
  country,
  michelin_status,
  cuisines,
  opening_hours,
  created_at,
  updated_at,
  st_y(coordinates::geometry) as lat,
  st_x(coordinates::geometry) as lng
from establishments;
