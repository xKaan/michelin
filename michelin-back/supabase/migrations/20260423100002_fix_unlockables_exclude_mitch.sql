-- Fix: exclude Mitch (default mascot) from unlockable mascots.
-- Everyone starts with Mitch — only his outfits can be unlocked, not Mitch himself.
CREATE OR REPLACE VIEW establishment_unlockables AS
  SELECT
    e.id              AS establishment_id,
    'mascot'::text    AS unlockable_type,
    m.id              AS unlockable_id,
    m.name            AS unlockable_name,
    NULL::text        AS preview_url,
    m.description
  FROM establishments e
  JOIN mascots m ON (
    (e.establishment_type::text = 'hotel' AND m.id = '11111111-1111-1111-1111-111111111002')
    OR (e.cuisines IS NOT NULL AND m.cuisine_affinity IS NOT NULL AND m.cuisine_affinity && e.cuisines::text[])
  )
  -- Mitch is the default mascot, everybody already has him
  WHERE m.id != '11111111-0000-0000-0000-000000000001'

UNION ALL

  SELECT
    e.id              AS establishment_id,
    'outfit'::text    AS unlockable_type,
    o.id              AS unlockable_id,
    o.name            AS unlockable_name,
    o.preview_url,
    o.description
  FROM establishments e
  JOIN outfits o ON (
    e.cuisines IS NOT NULL AND o.cuisine_affinity IS NOT NULL AND o.cuisine_affinity && e.cuisines::text[]
  );
