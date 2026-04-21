insert into establishments
  (name, establishment_type, coordinates, address, city, country, michelin_status, cuisines, opening_hours)
values

-- ═══ 3 ÉTOILES ═══════════════════════════════════════════════════════════════

(
  'Auberge du Pont de Collonges – Paul Bocuse',
  'restaurant',
  st_setsrid(st_makepoint(4.8582, 45.8219), 4326)::geography,
  '40 rue de la Plage', 'Collonges-au-Mont-d''Or', 'FR',
  'three',
  ARRAY['Française', 'Lyonnaise', 'Classique'],
  '{"lundi": "12h-14h / 19h30-22h", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "12h-14h / 19h30-22h", "dimanche": "12h-14h / 19h30-22h"}'::jsonb
),

-- ═══ 2 ÉTOILES ═══════════════════════════════════════════════════════════════

(
  'La Mère Brazier',
  'restaurant',
  st_setsrid(st_makepoint(4.8342, 45.7697), 4326)::geography,
  '12 rue Royale', 'Lyon', 'FR',
  'two',
  ARRAY['Française', 'Lyonnaise', 'Gastronomique'],
  '{"lundi": "fermé", "mardi": "12h-13h30 / 19h30-21h30", "mercredi": "12h-13h30 / 19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "19h30-21h30", "dimanche": "fermé"}'::jsonb
),
(
  'Takao Takano',
  'restaurant',
  st_setsrid(st_makepoint(4.8497, 45.7702), 4326)::geography,
  '33 rue Malesherbes', 'Lyon', 'FR',
  'two',
  ARRAY['Française', 'Japonaise', 'Créative'],
  '{"lundi": "fermé", "mardi": "12h-13h30 / 19h30-21h30", "mercredi": "12h-13h30 / 19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "19h30-21h30", "dimanche": "fermé"}'::jsonb
),

-- ═══ 1 ÉTOILE ════════════════════════════════════════════════════════════════

(
  'Prairial',
  'restaurant',
  st_setsrid(st_makepoint(4.8347, 45.7655), 4326)::geography,
  '11 passage Thiaffait', 'Lyon', 'FR',
  'one',
  ARRAY['Végétale', 'Créative', 'Française'],
  '{"lundi": "fermé", "mardi": "12h-13h30 / 19h30-21h", "mercredi": "12h-13h30 / 19h30-21h", "jeudi": "12h-13h30 / 19h30-21h", "vendredi": "12h-13h30 / 19h30-21h", "samedi": "19h30-21h", "dimanche": "fermé"}'::jsonb
),
(
  'Les Apothicaires',
  'restaurant',
  st_setsrid(st_makepoint(4.8488, 45.7687), 4326)::geography,
  '23 rue de Sèze', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Créative', 'Moderne'],
  '{"lundi": "fermé", "mardi": "fermé", "mercredi": "12h-13h30 / 19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "19h30-21h30", "dimanche": "fermé"}'::jsonb
),
(
  'Le Gourmet de Sèze',
  'restaurant',
  st_setsrid(st_makepoint(4.8495, 45.7699), 4326)::geography,
  '129 rue de Sèze', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Classique', 'Gastronomique'],
  '{"lundi": "fermé", "mardi": "12h-13h30 / 19h30-21h30", "mercredi": "12h-13h30 / 19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "19h30-21h30", "dimanche": "fermé"}'::jsonb
),
(
  'Têtedoie',
  'restaurant',
  st_setsrid(st_makepoint(4.8231, 45.7618), 4326)::geography,
  '54 rue Barthélémy Buyer', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Créative', 'Vue panoramique'],
  '{"lundi": "fermé", "mardi": "19h30-21h30", "mercredi": "12h-13h30 / 19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "12h-13h30 / 19h30-21h30", "dimanche": "12h-13h30"}'::jsonb
),
(
  'Substrat',
  'restaurant',
  st_setsrid(st_makepoint(4.8344, 45.7667), 4326)::geography,
  '7 rue Pleney', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Créative', 'Naturelle'],
  '{"lundi": "fermé", "mardi": "fermé", "mercredi": "19h30-21h30", "jeudi": "19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "12h-13h30 / 19h30-21h30", "dimanche": "fermé"}'::jsonb
),
(
  'Café Sillon',
  'restaurant',
  st_setsrid(st_makepoint(4.8305, 45.7508), 4326)::geography,
  '38 rue de la Charité', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Bistronomique', 'Moderne'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "12h-14h / 19h30-22h", "dimanche": "fermé"}'::jsonb
),
(
  'Aromatic',
  'restaurant',
  st_setsrid(st_makepoint(4.8263, 45.7624), 4326)::geography,
  '12 rue du Bœuf', 'Lyon', 'FR',
  'one',
  ARRAY['Française', 'Créative', 'Saisonnière'],
  '{"lundi": "fermé", "mardi": "fermé", "mercredi": "19h30-21h30", "jeudi": "12h-13h30 / 19h30-21h30", "vendredi": "12h-13h30 / 19h30-21h30", "samedi": "12h-13h30 / 19h30-21h30", "dimanche": "fermé"}'::jsonb
),

-- ═══ BIB GOURMAND ════════════════════════════════════════════════════════════

(
  'Daniel et Denise Créqui',
  'restaurant',
  st_setsrid(st_makepoint(4.8456, 45.7573), 4326)::geography,
  '156 rue de Créqui', 'Lyon', 'FR',
  'bib',
  ARRAY['Lyonnaise', 'Bouchon', 'Traditionnelle'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "12h-14h / 19h30-22h", "dimanche": "fermé"}'::jsonb
),
(
  'Daniel et Denise Saint-Jean',
  'restaurant',
  st_setsrid(st_makepoint(4.8277, 45.7588), 4326)::geography,
  '36 rue Tramassac', 'Lyon', 'FR',
  'bib',
  ARRAY['Lyonnaise', 'Bouchon', 'Traditionnelle'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "12h-14h / 19h30-22h", "dimanche": "fermé"}'::jsonb
),
(
  'Brasserie Georges',
  'restaurant',
  st_setsrid(st_makepoint(4.8273, 45.7490), 4326)::geography,
  '30 cours de Verdun Perrache', 'Lyon', 'FR',
  'bib',
  ARRAY['Brasserie', 'Française', 'Traditionnelle'],
  '{"lundi": "12h-23h", "mardi": "12h-23h", "mercredi": "12h-23h", "jeudi": "12h-23h", "vendredi": "12h-23h30", "samedi": "12h-23h30", "dimanche": "12h-23h"}'::jsonb
),
(
  'Le Bouchon des Filles',
  'restaurant',
  st_setsrid(st_makepoint(4.8269, 45.7672), 4326)::geography,
  '20 rue Sergent Blandan', 'Lyon', 'FR',
  'bib',
  ARRAY['Lyonnaise', 'Bouchon', 'Traditionnelle'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h-22h", "mercredi": "12h-14h / 19h-22h", "jeudi": "12h-14h / 19h-22h", "vendredi": "12h-14h / 19h-22h", "samedi": "12h-14h / 19h-22h", "dimanche": "fermé"}'::jsonb
),
(
  'Thomas',
  'restaurant',
  st_setsrid(st_makepoint(4.8335, 45.7641), 4326)::geography,
  '6 rue Laurencin', 'Lyon', 'FR',
  'bib',
  ARRAY['Française', 'Bistronomique', 'Moderne'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "19h30-22h", "dimanche": "fermé"}'::jsonb
),
(
  'Balthaz''art',
  'restaurant',
  st_setsrid(st_makepoint(4.8387, 45.7723), 4326)::geography,
  '7 place Joannès Ambre', 'Lyon', 'FR',
  'bib',
  ARRAY['Française', 'Créative', 'Bistronomique'],
  '{"lundi": "fermé", "mardi": "12h-14h / 19h30-22h", "mercredi": "12h-14h / 19h30-22h", "jeudi": "12h-14h / 19h30-22h", "vendredi": "12h-14h / 19h30-22h", "samedi": "12h-14h / 19h30-22h", "dimanche": "fermé"}'::jsonb
);
