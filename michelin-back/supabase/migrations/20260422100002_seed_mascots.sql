-- Seed mascots
insert into mascots (id, name, base_species, description) values
  ('11111111-0000-0000-0000-000000000001', 'Mitch',   'dog',  'Chien aventurier et gourmand'),
  ('11111111-0000-0000-0000-000000000002', 'Akissi',  'cat',  'Chatte curieuse et raffinée'),
  ('11111111-0000-0000-0000-000000000003', 'Hoshi',   'fox',  'Renard mystérieux aux papilles aiguisées'),
  ('11111111-0000-0000-0000-000000000004', 'Franco',  'bear', 'Ours costaud amateur de bonne chère'),
  ('11111111-0000-0000-0000-000000000005', 'Pierre',  'rabbit', 'Lapin fin gourmet et globe-trotter')
on conflict (id) do nothing;

-- Seed outfits (preview_url = buddy + tenue combinés, pour affichage direct)
insert into outfits (id, mascot_id, name, description, rarity, unlock_condition, preview_url) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Tenue Japonaise', 'Kimono traditionnel japonais',    'rare',      'restaurant_visit', '/Buddy_skins/Mitch_jap.png'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Tenue Française', 'Béret et tablier de chef français', 'common',    'restaurant_visit', '/Buddy_skins/Mitch_fr.png'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Tenue Italienne', 'Costume de trattoria italienne',   'common',    'restaurant_visit', '/Buddy_skins/Mitch_it.png'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Tenue Japonaise', 'Yukata élégant pour Akissi',       'rare',      'restaurant_visit', '/Buddy_skins/Akissi_jap.png'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'Tenue Française', 'Veste de sommelier pour Hoshi',    'legendary', 'achievement',      '/Buddy_skins/Hoshi_fr.png')
on conflict (id) do nothing;
