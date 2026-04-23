-- Seed: gourmet reviews on Les Apothicaires (for map bubble testing)
-- Restaurant: db628d53-e995-4e36-8ed0-0be28b95c66b

DO $$
DECLARE
  est_id  uuid := 'db628d53-e995-4e36-8ed0-0be28b95c66b';
  u1      uuid := 'afa0c31e-e89e-42d5-a5ef-550b682ee2af'; -- Ines Bernard (gourmet)
  u2      uuid := '33333333-0000-0000-0000-000000000001'; -- Marie Pacotte (gourmet)
  c1      uuid;
  c2      uuid;
BEGIN
  INSERT INTO checkins (user_id, establishment_id)
  VALUES (u1, est_id)
  RETURNING id INTO c1;

  INSERT INTO reviews (user_id, establishment_id, checkin_id, rating, content, status, published_at)
  VALUES (
    u1, est_id, c1, 5,
    'Une experience absolument remarquable. Le chef sublime les produits du terroir lyonnais avec une precision chirurgicale. Chaque assiette est une oeuvre.',
    'published', now()
  );

  INSERT INTO checkins (user_id, establishment_id)
  VALUES (u2, est_id)
  RETURNING id INTO c2;

  INSERT INTO reviews (user_id, establishment_id, checkin_id, rating, content, status, published_at)
  VALUES (
    u2, est_id, c2, 4,
    'Service impeccable et cuisine inventive. Les associations de saveurs surprennent sans jamais perdre le fil du produit. Un incontournable lyonnais.',
    'published', now()
  );
END $$;
