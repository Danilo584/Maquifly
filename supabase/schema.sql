-- ===========================================================================
-- MAQUIFLY — ESQUEMA DE BASE DE DATOS (PostgreSQL / Supabase)
-- ---------------------------------------------------------------------------
-- Refleja exactamente los tipos de src/lib/types.ts. Ejecutar en el editor
-- SQL de Supabase.
--
-- Decisiones importantes:
--   * `rating` y `review_count` NO se escriben a mano: los recalcula un
--     trigger a partir de las reseñas reales. Así es imposible inflar la
--     reputación desde la aplicación.
--   * La seguridad vive en la base de datos (RLS), no solo en el frontend.
--   * La búsqueda de texto usa `tsvector` en español con índice GIN, para que
--     el buscador siga siendo rápido con miles de publicaciones.
-- ===========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- --------------------------------------------------------------------------
-- Tipos
-- --------------------------------------------------------------------------
create type user_role           as enum ('client', 'owner', 'admin');
create type verification_status as enum ('registered', 'verified', 'documented');
create type listing_status      as enum ('draft', 'pending_review', 'published', 'paused', 'rejected', 'archived');
create type availability_status as enum ('available', 'limited', 'unavailable');
create type pricing_unit        as enum ('hour', 'day', 'week', 'month', 'trip', 'on_request');
create type fuel_responsibility as enum ('owner', 'client', 'negotiable');
create type machine_family      as enum ('heavy', 'light', 'agricultural', 'support');
create type report_reason       as enum ('false_info', 'wrong_price', 'not_available', 'inappropriate', 'possible_scam', 'other');
create type report_status       as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- --------------------------------------------------------------------------
-- Catálogos
-- --------------------------------------------------------------------------
create table locations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  region      text not null,
  districts   text[] not null default '{}',
  active      boolean not null default false,
  lat         double precision,
  lng         double precision
);

create table categories (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  singular          text not null,
  slug              text not null unique,
  family            machine_family not null,
  short_description text not null default '',
  long_description  text not null default '',
  common_uses       text[] not null default '{}',
  icon              text not null default 'other',
  sort_order        integer not null default 0
);

-- --------------------------------------------------------------------------
-- Usuarios y propietarios
-- --------------------------------------------------------------------------
-- `profiles.id` referencia a auth.users: Supabase Auth gestiona credenciales.
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null,
  email               text,
  phone               text,
  role                user_role not null default 'client',
  location_id         uuid references locations(id),
  verification_status verification_status not null default 'registered',
  created_at          timestamptz not null default now()
);

create table owner_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  slug                text not null unique,
  business_name       text not null,
  description         text not null default '',
  location_id         uuid not null references locations(id),
  area                text,
  logo_url            text,
  whatsapp            text not null,
  phone               text,
  -- Calculados por trigger a partir de reseñas reales. Nunca se escriben desde la app.
  rating              numeric(2,1),
  review_count        integer not null default 0,
  machine_count       integer not null default 0,
  verification_status verification_status not null default 'registered',
  member_since        timestamptz not null default now(),
  constraint owner_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

create index owner_profiles_user_idx on owner_profiles(user_id);
create index owner_profiles_location_idx on owner_profiles(location_id);

-- --------------------------------------------------------------------------
-- Maquinaria
-- --------------------------------------------------------------------------
create table machines (
  id                          uuid primary key default uuid_generate_v4(),
  reference                   text not null unique,
  slug                        text not null unique,
  owner_id                    uuid not null references owner_profiles(id) on delete cascade,
  category_id                 uuid not null references categories(id),

  name                        text not null,
  brand                       text not null,
  model                       text not null,
  year                        integer,
  description                 text not null default '',

  location_id                 uuid not null references locations(id),
  area                        text not null,
  area_reference              text,

  price                       numeric(12,2),
  currency                    text not null default 'PEN',
  pricing_unit                pricing_unit not null default 'hour',
  minimum_rental              text,

  operator_available          boolean not null default false,
  operator_included_in_price  boolean not null default false,
  transport_available         boolean not null default false,
  transport_included_in_price boolean not null default false,
  fuel                        fuel_responsibility not null default 'client',

  availability                availability_status not null default 'available',
  availability_note           text,

  specs                       jsonb not null default '[]'::jsonb,
  work_hours                  integer,
  images                      jsonb not null default '[]'::jsonb,

  status                      listing_status not null default 'pending_review',
  rating                      numeric(2,1),
  review_count                integer not null default 0,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint machine_price_positive check (price is null or price > 0),
  constraint machine_year_range check (year is null or (year between 1970 and extract(year from now())::int + 1)),
  constraint machine_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

create index machines_owner_idx        on machines(owner_id);
create index machines_category_idx     on machines(category_id);
create index machines_location_idx     on machines(location_id);
create index machines_status_idx       on machines(status);
create index machines_availability_idx on machines(availability);
create index machines_created_idx      on machines(created_at desc);

-- Búsqueda de texto completo en español: sustituye al scoring en memoria
-- que usa el MVP (src/lib/repository/demo-repository.ts).
alter table machines add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(model, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(brand, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(name, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(area, '')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'D')
  ) stored;

create index machines_search_idx on machines using gin(search_vector);
create index machines_name_trgm_idx on machines using gin(name gin_trgm_ops);

-- --------------------------------------------------------------------------
-- Reseñas y reportes
-- --------------------------------------------------------------------------
create table reviews (
  id              uuid primary key default uuid_generate_v4(),
  machine_id      uuid references machines(id) on delete cascade,
  owner_id        uuid not null references owner_profiles(id) on delete cascade,
  reviewer_id     uuid not null references profiles(id) on delete cascade,
  rating          integer not null check (rating between 1 and 5),
  comment         text not null,
  criteria        jsonb not null default '{}'::jsonb,
  -- Solo lo pone el sistema cuando existe un alquiler registrado.
  verified_rental boolean not null default false,
  owner_reply     jsonb,
  created_at      timestamptz not null default now(),
  -- Una reseña por persona y máquina: evita el spam de reputación.
  unique (machine_id, reviewer_id)
);

create index reviews_machine_idx on reviews(machine_id);
create index reviews_owner_idx   on reviews(owner_id);

create table reports (
  id                uuid primary key default uuid_generate_v4(),
  machine_id        uuid not null references machines(id) on delete cascade,
  reason            report_reason not null,
  comment           text not null default '',
  reporter_contact  text,
  reporter_id       uuid references profiles(id) on delete set null,
  status            report_status not null default 'open',
  created_at        timestamptz not null default now()
);

create index reports_machine_idx on reports(machine_id);
create index reports_status_idx  on reports(status);

create table contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  machine_id  uuid references machines(id) on delete set null,
  name        text not null,
  contact     text not null,
  topic       text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Triggers: la reputación se calcula, no se declara
-- --------------------------------------------------------------------------
create or replace function refresh_ratings() returns trigger
language plpgsql security definer as $$
declare
  target_machine uuid := coalesce(new.machine_id, old.machine_id);
  target_owner   uuid := coalesce(new.owner_id, old.owner_id);
begin
  if target_machine is not null then
    update machines m
       set rating = sub.avg_rating,
           review_count = sub.total
      from (
        select round(avg(rating)::numeric, 1) as avg_rating, count(*) as total
          from reviews where machine_id = target_machine
      ) sub
     where m.id = target_machine;
  end if;

  if target_owner is not null then
    update owner_profiles o
       set rating = sub.avg_rating,
           review_count = sub.total
      from (
        select round(avg(rating)::numeric, 1) as avg_rating, count(*) as total
          from reviews where owner_id = target_owner
      ) sub
     where o.id = target_owner;
  end if;

  return null;
end;
$$;

create trigger reviews_refresh_ratings
after insert or update or delete on reviews
for each row execute function refresh_ratings();

create or replace function refresh_machine_count() returns trigger
language plpgsql security definer as $$
declare
  target_owner uuid := coalesce(new.owner_id, old.owner_id);
begin
  update owner_profiles o
     set machine_count = (
       select count(*) from machines
        where owner_id = target_owner and status = 'published'
     )
   where o.id = target_owner;
  return null;
end;
$$;

create trigger machines_refresh_count
after insert or update or delete on machines
for each row execute function refresh_machine_count();

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger machines_touch_updated_at
before update on machines
for each row execute function touch_updated_at();

-- --------------------------------------------------------------------------
-- Seguridad a nivel de fila (RLS)
-- --------------------------------------------------------------------------
alter table profiles          enable row level security;
alter table owner_profiles    enable row level security;
alter table machines          enable row level security;
alter table reviews           enable row level security;
alter table reports           enable row level security;
alter table contact_messages  enable row level security;
alter table categories        enable row level security;
alter table locations         enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Catálogos: lectura pública, escritura solo admin.
create policy "categorias visibles" on categories for select using (true);
create policy "ubicaciones visibles" on locations for select using (true);
create policy "categorias admin"  on categories for all using (is_admin()) with check (is_admin());
create policy "ubicaciones admin" on locations  for all using (is_admin()) with check (is_admin());

-- Perfiles: cada quien ve y edita el suyo; el admin, todos.
create policy "perfil propio visible" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "perfil propio editable" on profiles
  for update using (id = auth.uid() or is_admin());

-- Perfiles de propietario: públicos en lectura.
create policy "propietarios visibles" on owner_profiles for select using (true);
create policy "propietario edita lo suyo" on owner_profiles
  for all using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Publicaciones: solo las publicadas son públicas.
create policy "publicaciones publicas" on machines
  for select using (
    status = 'published'
    or is_admin()
    or owner_id in (select id from owner_profiles where user_id = auth.uid())
  );

create policy "propietario gestiona sus maquinas" on machines
  for all using (
    owner_id in (select id from owner_profiles where user_id = auth.uid()) or is_admin()
  )
  with check (
    owner_id in (select id from owner_profiles where user_id = auth.uid()) or is_admin()
  );

-- Reseñas: lectura pública; escribe el autor autenticado; nadie puede
-- marcarse a sí mismo un "alquiler verificado".
create policy "resenas publicas" on reviews for select using (true);
create policy "usuario escribe su resena" on reviews
  for insert with check (reviewer_id = auth.uid() and verified_rental = false);
create policy "usuario edita su resena" on reviews
  for update using (reviewer_id = auth.uid() or is_admin())
  with check (reviewer_id = auth.uid() or is_admin());
create policy "usuario borra su resena" on reviews
  for delete using (reviewer_id = auth.uid() or is_admin());

-- Reportes y mensajes: cualquiera puede crear, solo el admin puede leer.
create policy "cualquiera reporta" on reports for insert with check (true);
create policy "admin lee reportes" on reports for select using (is_admin());
create policy "admin gestiona reportes" on reports for update using (is_admin());

create policy "cualquiera escribe" on contact_messages for insert with check (true);
create policy "admin lee mensajes" on contact_messages for select using (is_admin());

-- --------------------------------------------------------------------------
-- Almacenamiento de fotografías
-- --------------------------------------------------------------------------
-- En el panel de Supabase: crear el bucket público `machine-photos` y
-- restringir la subida a usuarios autenticados, con límite de 5 MB por
-- archivo y tipos image/jpeg, image/png, image/webp, image/avif.
