# Prompt Claude Code — Michelin App

## Contexte
Tu vas générer la base d'une application web React + Supabase pour une refonte du Guide Michelin ciblant les 25-30 ans. L'app est **web responsive uniquement** (pas de React Native).

Stack :
- Frontend : React + TypeScript + TanStack Query + TailwindCSS
- Backend : Supabase (Postgres + PostGIS + Auth + Storage + Edge Functions)
- Cache : Upstash Redis (streaks, leaderboard)

---

## 1. Structure du projet

Génère la structure suivante à la racine du repo :

```
docker-compose.yml
.env.example
michelin-back/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── functions/
│       ├── validate-checkin/
│       │   └── index.ts
│       └── unlock-outfit/
│           └── index.ts
michelin-front/
├── Dockerfile
├── nginx.conf            ← utilisé uniquement en prod (build statique)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── lib/
    └── types/
```

---

## 2. Docker Compose (racine)

Le `docker-compose.yml` orchestre le stack local complet. Il comprend :

### Services

| Service | Image | Rôle |
|---|---|---|
| `db` | `supabase/postgres:15.6.1.143` | PostgreSQL + PostGIS |
| `auth` | `supabase/gotrue:v2.151.0` | Authentification (GoTrue) |
| `rest` | `postgrest/postgrest:v12.2.0` | REST API auto-générée |
| `functions` | `supabase/edge-runtime:v1.65.4` | Edge Functions Deno |
| `gateway` | `nginx:1.25-alpine` | Reverse proxy unifié |
| `front` | build `./michelin-front` | Dev server Vite |

### Rôle du gateway (nginx)

Le client Supabase JS attend **une seule URL de base**. Le gateway nginx route :
- `/auth/v1/*` → `http://auth:9999/`
- `/rest/v1/*` → `http://rest:3000/`
- `/functions/v1/*` → `http://functions:8081/`

Le frontend pointe sur `http://localhost:8000` (le gateway).

### Contraintes d'implémentation

- Chaque service dépend de `db` via `healthcheck` (`pg_isready`)
- Les variables sensibles (`JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`) viennent du `.env` à la racine
- Le service `front` monte `./michelin-front/src` en volume pour le hot-reload
- Le service `functions` monte `./michelin-back/supabase/functions` en lecture seule
- Les migrations sont appliquées au démarrage de `db` via le volume `/docker-entrypoint-initdb.d`

### Dockerfile pour `michelin-front`

Multi-stage :
- Stage `dev` : `node:20-alpine`, `npm install`, `CMD ["npm", "run", "dev", "--", "--host"]`
- Stage `build` : compile le bundle Vite
- Stage `prod` : `nginx:1.25-alpine` + `nginx.conf` + le bundle

Le `docker-compose.yml` cible le stage `dev`.

---

## 3. Migrations Supabase

Crée les migrations SQL dans `michelin-back/supabase/migrations/` dans cet ordre.

### Migration 001 — Extensions
```sql
create extension if not exists "uuid-ossp";
create extension if not exists postgis;
```

### Migration 002 — Utilisateurs
```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar unique not null,
  phone varchar unique,
  display_name varchar not null,
  tier varchar not null default 'explorer'
    check (tier in ('explorer', 'member', 'gourmet', 'expert')),
  xp_total int not null default 0,
  last_location geography(point, 4326),
  created_at timestamp with time zone default now()
);

create table user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  method varchar not null check (method in ('qr_scan', 'manual', 'oauth')),
  proof_ref varchar,
  verified_at timestamp with time zone default now()
);

create table follows (
  follower_id uuid not null references users(id) on delete cascade,
  followed_id uuid not null references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, followed_id),
  check (follower_id != followed_id)
);
```

### Migration 003 — Restaurants & Checkins
```sql
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  coordinates geography(point, 4326) not null,
  address text,
  city varchar,
  country varchar default 'FR',
  michelin_status varchar not null default 'none'
    check (michelin_status in ('none', 'bib', 'one', 'two', 'three')),
  cuisines varchar[],
  opening_hours jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index on restaurants using gist(coordinates);

-- QR codes appartiennent au USER (scanné par le staff du restaurant)
create table user_qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token varchar unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  qr_code_id uuid references user_qr_codes(id),
  gps_at_scan geography(point, 4326),
  checked_in_at timestamp with time zone default now(),
  index (user_id, restaurant_id, checked_in_at)
);
```

### Migration 004 — Contenu & Reviews
```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  checkin_id uuid not null references checkins(id),
  rating int not null check (rating between 1 and 5),
  content text,
  status varchar not null default 'pending'
    check (status in ('pending', 'published', 'flagged')),
  likes_count int not null default 0,
  flags_count int not null default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique (user_id, restaurant_id)
);

create table media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  url varchar not null,
  type varchar not null check (type in ('photo', 'video')),
  uploaded_at timestamp with time zone default now()
);

create table reactions (
  user_id uuid not null references users(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  type varchar not null check (type in ('like', 'flag')),
  created_at timestamp with time zone default now(),
  primary key (user_id, review_id)
);
```

### Migration 005 — Gamification
```sql
create table xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  action varchar not null check (action in (
    'checkin', 'review', 'photo', 'like', 'streak_bonus'
  )),
  xp_gained int not null,
  ref_id uuid,
  created_at timestamp with time zone default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  badge_type varchar not null,
  season varchar,
  earned_at timestamp with time zone default now()
);

create table streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  current_count int not null default 0,
  best_count int not null default 0,
  last_activity_date date
);
```

### Migration 006 — Familiers & Tenues
```sql
create table mascots (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  base_species varchar not null,
  description text,
  released_at date
);

create table user_mascots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mascot_id uuid not null references mascots(id),
  is_active boolean not null default false,
  nickname varchar,
  xp int not null default 0,
  level int not null default 1,
  unlocked_at timestamp with time zone default now(),
  unique (user_id, mascot_id)
);

-- Index partiel : un seul familier actif par user
create unique index one_active_mascot_per_user
  on user_mascots (user_id)
  where is_active = true;

create table outfits (
  id uuid primary key default gen_random_uuid(),
  mascot_id uuid not null references mascots(id),
  name varchar not null,
  description text,
  rarity varchar not null default 'common'
    check (rarity in ('common', 'rare', 'legendary')),
  unlock_condition varchar not null
    check (unlock_condition in ('restaurant_visit', 'season', 'achievement')),
  restaurant_id uuid references restaurants(id),
  preview_url varchar,
  released_at date
);

create table user_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  outfit_id uuid not null references outfits(id),
  user_mascot_id uuid not null references user_mascots(id),
  is_equipped boolean not null default false,
  unlocked_via varchar not null
    check (unlocked_via in ('checkin', 'season', 'achievement')),
  unlocked_at timestamp with time zone default now(),
  unique (user_id, outfit_id)
);

-- Index partiel : une seule tenue équipée par familier
create unique index one_equipped_outfit_per_mascot
  on user_outfits (user_mascot_id)
  where is_equipped = true;
```

### Migration 007 — Social
```sql
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar not null,
  is_public boolean not null default false,
  updated_at timestamp with time zone default now()
);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  added_at timestamp with time zone default now(),
  unique (list_id, restaurant_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type varchar not null check (type in (
    'wishlist_nearby', 'friend_checkin', 'streak_reminder', 'outfit_unlocked'
  )),
  payload jsonb,
  read boolean not null default false,
  sent_at timestamp with time zone default now()
);
```

### Migration 008 — Row Level Security
```sql
-- Users : chacun voit son propre profil, les profils publics sont lisibles
alter table users enable row level security;
create policy "users_select" on users for select using (true);
create policy "users_update" on users for update using (auth.uid() = id);

-- Reviews : publiées = lisibles par tous, brouillons = propriétaire seul
alter table reviews enable row level security;
create policy "reviews_select_published" on reviews for select
  using (status = 'published' or auth.uid() = user_id);
create policy "reviews_insert" on reviews for insert
  with check (auth.uid() = user_id);

-- Checkins : visibles par le propriétaire uniquement
alter table checkins enable row level security;
create policy "checkins_owner" on checkins for all
  using (auth.uid() = user_id);

-- User mascots & outfits : propriétaire uniquement
alter table user_mascots enable row level security;
create policy "user_mascots_owner" on user_mascots for all
  using (auth.uid() = user_id);

alter table user_outfits enable row level security;
create policy "user_outfits_owner" on user_outfits for all
  using (auth.uid() = user_id);

-- Lists : publiques = lisibles, privées = propriétaire seul
alter table lists enable row level security;
create policy "lists_select" on lists for select
  using (is_public = true or auth.uid() = user_id);
create policy "lists_insert" on lists for insert
  with check (auth.uid() = user_id);
```

---

## 4. Edge Functions

### `michelin-back/supabase/functions/validate-checkin/index.ts`
Cette fonction est appelée par l'app staff du restaurant quand il scanne le QR du user.

Elle doit :
1. Recevoir `{ qr_token, restaurant_id, staff_gps }` 
2. Vérifier que le token existe et n'est pas expiré
3. Vérifier que le GPS du staff est à moins de 200m du restaurant
4. Insérer le checkin
5. Déclencher `unlock-outfit` si une tenue est liée à ce restaurant
6. Ajouter un xp_event (action: 'checkin', xp: 50)
7. Mettre à jour le streak du user
8. Retourner `{ success, checkin_id, outfits_unlocked[] }`

### `michelin-back/supabase/functions/unlock-outfit/index.ts`
Appelée en interne après un checkin validé.

Elle doit :
1. Recevoir `{ user_id, restaurant_id, checkin_id }`
2. Chercher les tenues avec `unlock_condition = 'restaurant_visit'` et `restaurant_id` correspondant
3. Filtrer celles que le user ne possède pas encore
4. Insérer dans `user_outfits` pour le familier actif du user
5. Insérer une notification `outfit_unlocked` pour chaque tenue débloquée
6. Retourner la liste des tenues débloquées

---

## 5. Client Supabase et types

### `michelin-front/src/lib/supabase.ts`
Initialise le client Supabase avec les variables d'env `VITE_SUPABASE_URL` (pointe vers le gateway nginx `http://localhost:8000`) et `VITE_SUPABASE_ANON_KEY`.

### `michelin-front/src/types/database.ts`
Génère les types TypeScript complets à partir du schéma. Utilise `supabase gen types typescript` ou écris-les manuellement en suivant le schéma ci-dessus.

---

## 6. Hooks React (TanStack Query)

Génère les hooks suivants dans `michelin-front/src/hooks/` :

- `useRestaurants(coords, radius)` — restaurants autour d'un point GPS
- `useRestaurant(id)` — détail d'un restaurant avec ses reviews publiées
- `useReviews(restaurantId)` — reviews publiées d'un restaurant
- `useUserMascot(userId)` — familier actif + tenue équipée
- `useUserOutfits(userMascotId)` — toutes les tenues débloquées d'un familier
- `useUserProfile(userId)` — profil + XP + badges + streak
- `useWishlist(userId)` — listes de l'utilisateur connecté
- `useNotifications()` — notifications non lues du user connecté

---

## 7. Variables d'environnement

Crée un `.env.example` à la racine (utilisé par docker-compose) :
```
# Postgres
POSTGRES_PASSWORD=postgres

# JWT — générer avec : openssl rand -base64 32
JWT_SECRET=super-secret-jwt-key-change-in-prod

# Clés Supabase (dériver depuis JWT_SECRET avec l'outil supabase-jwt ou les générer manuellement)
ANON_KEY=eyJ...
SERVICE_ROLE_KEY=eyJ...

# Frontend (pointe vers le gateway local en dev)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=${ANON_KEY}

# Upstash Redis (optionnel pour le MVP local)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...
```

---

## Contraintes importantes

- Ne jamais exposer la `service_role` key côté client
- Toujours passer par les RLS — ne pas bypasser avec la service key dans les Edge Functions sauf pour les opérations légitimement admin (ex: valider un checkin depuis l'app staff)
- Le QR code appartient au USER, pas au restaurant. C'est le staff qui scanne le QR affiché sur le téléphone du user
- Une review ne peut être créée que si un `checkin_id` valide existe pour ce couple (user, restaurant)
- Un seul familier actif par user (`is_active = true`) — géré par l'index partiel en base
- Une seule tenue équipée par familier — géré par l'index partiel en base
