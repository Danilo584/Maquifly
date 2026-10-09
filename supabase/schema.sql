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
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  region      text not null,
  districts   text[] not null default '{}',
  active      boolean not null default false,
  lat         double precision,
  lng         double precision
);

create table categories (
  id                text primary key,
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
  location_id         text references locations(id),
  verification_status verification_status not null default 'registered',
  created_at          timestamptz not null default now()
);

create table owner_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  -- null = propietario gestionado por la administración (aún sin cuenta).
  user_id             uuid references profiles(id) on delete set null,
  slug                text not null unique,
  business_name       text not null,
  description         text not null default '',
  location_id         text not null references locations(id),
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
create sequence machine_reference_seq;
create or replace function next_machine_reference() returns text
language sql volatile as $$
  select 'MF-PIU-' || lpad(nextval('machine_reference_seq')::text, 4, '0')
$$;

create table machines (
  id                          uuid primary key default uuid_generate_v4(),
  reference                   text not null unique default next_machine_reference(),
  slug                        text not null unique,
  owner_id                    uuid not null references owner_profiles(id) on delete cascade,
  category_id                 text not null references categories(id),

  name                        text not null,
  brand                       text not null,
  model                       text not null,
  year                        integer,
  description                 text not null default '',

  location_id                 text not null references locations(id),
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
  -- contact = formulario de contacto · info_request = «Solicitar información» de una máquina
  kind        text not null default 'contact' check (kind in ('contact', 'info_request')),
  status      text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at  timestamptz not null default now(),
  constraint contact_lengths check (length(name) <= 120 and length(contact) <= 160 and length(message) <= 4000)
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

-- ==========================================================================
-- PLANES, SOCIO FUNDADOR, DESTACADOS EXPRESS Y PAGOS MANUALES
-- ==========================================================================
-- Reglas comerciales (fuente: src/lib/plans.ts):
--   · Fly Start (gratis): 2 máquinas, contacto vía MaquiFly.
--   · Fly Plus:          5 máquinas, WhatsApp directo, prioridad, «Destacado».
--   · Fly Pro:           ilimitadas, WhatsApp directo, perfil de empresa, portada.
--   · Socio Fundador:    los 10 primeros con un pago de plan APROBADO.
--   · Destacado Express: una máquina, 7 días arriba en el buscador.
-- El cobro es manual: el admin aprueba el pago y la función approve_payment
-- activa el plan. Nadie más puede tocar plan, vencimiento, fundador ni
-- destacados (trigger protect_commercial_fields).

create type plan_id        as enum ('start', 'plus', 'pro');
create type payment_status as enum ('pending', 'approved', 'rejected');
create type payment_method as enum ('yape', 'plin', 'transfer');

alter table owner_profiles
  add column plan            plan_id not null default 'start',
  add column plan_expires_at timestamptz,
  add column founder_number  smallint unique
    constraint founder_number_range check (founder_number between 1 and 10),
  add column ruc             text
    constraint ruc_format check (ruc is null or ruc ~ '^(10|15|17|20)[0-9]{9}$');

alter table machines add column featured_until timestamptz;

-- Plan efectivo: un plan pagado vencido vuelve a comportarse como Fly Start.
create or replace function effective_plan(p plan_id, expires timestamptz)
returns plan_id language sql stable as $$
  select case when p <> 'start' and expires is not null and expires > now() then p
              else 'start'::plan_id end
$$;

create or replace function plan_machine_limit(p plan_id) returns integer
language sql immutable as $$
  select case p when 'start' then 2 when 'plus' then 5 else null end
$$;

-- --------------------------------------------------------------------------
-- Pagos
-- --------------------------------------------------------------------------
create table payments (
  id                uuid primary key default uuid_generate_v4(),
  owner_id          uuid not null references owner_profiles(id) on delete cascade,
  product           text not null
    constraint payment_product check (product in ('fly-plus', 'fly-pro', 'destacado-7')),
  machine_id        uuid references machines(id) on delete set null,
  amount_pen        numeric(8,2) not null check (amount_pen > 0),
  method            payment_method not null,
  operation_number  text,
  proof_url         text,
  founder_requested boolean not null default false,
  status            payment_status not null default 'pending',
  note              text,
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid references profiles(id),
  constraint boost_needs_machine check (product <> 'destacado-7' or machine_id is not null)
);

create index payments_owner_idx  on payments(owner_id);
create index payments_status_idx on payments(status);

alter table payments enable row level security;
create policy "propietario ve sus pagos" on payments
  for select using (
    is_admin() or owner_id in (select id from owner_profiles where user_id = auth.uid())
  );
create policy "propietario registra su pago" on payments
  for insert with check (
    status = 'pending'
    and owner_id in (select id from owner_profiles where user_id = auth.uid())
  );
create policy "admin gestiona pagos" on payments
  for all using (is_admin()) with check (is_admin());

-- --------------------------------------------------------------------------
-- Campos comerciales protegidos
-- --------------------------------------------------------------------------
create or replace function protect_owner_commercial_fields() returns trigger
language plpgsql as $$
begin
  if is_admin() or current_setting('maquifly.approving', true) = 'on' then
    return new;
  end if;
  if new.plan                is distinct from old.plan
  or new.plan_expires_at     is distinct from old.plan_expires_at
  or new.founder_number      is distinct from old.founder_number
  or new.verification_status is distinct from old.verification_status then
    raise exception 'Solo la administración puede cambiar el plan, el fundador o la verificación';
  end if;
  return new;
end $$;

create or replace function protect_machine_commercial_fields() returns trigger
language plpgsql as $$
begin
  if is_admin() or current_setting('maquifly.approving', true) = 'on' then
    return new;
  end if;
  if new.featured_until is distinct from old.featured_until then
    raise exception 'Solo la administración puede activar un Destacado Express';
  end if;
  return new;
end $$;

create trigger owner_profiles_protect before update on owner_profiles
  for each row execute function protect_owner_commercial_fields();
create trigger machines_protect before update on machines
  for each row execute function protect_machine_commercial_fields();

-- Un propietario nuevo no puede nacer con plan pagado ni como fundador.
create or replace function protect_owner_insert() returns trigger
language plpgsql as $$
begin
  if not is_admin() then
    new.plan := 'start';
    new.plan_expires_at := null;
    new.founder_number := null;
    new.verification_status := 'registered';
  end if;
  return new;
end $$;

create trigger owner_profiles_protect_insert before insert on owner_profiles
  for each row execute function protect_owner_insert();

-- --------------------------------------------------------------------------
-- Límite de máquinas publicadas según el plan
-- --------------------------------------------------------------------------
create or replace function enforce_plan_machine_limit() returns trigger
language plpgsql as $$
declare
  lim integer;
  used integer;
begin
  if new.status <> 'published' or (tg_op = 'UPDATE' and old.status = 'published') then
    return new;
  end if;

  select plan_machine_limit(effective_plan(plan, plan_expires_at)) into lim
    from owner_profiles where id = new.owner_id;
  if lim is null then return new; end if;

  select count(*) into used from machines
    where owner_id = new.owner_id and status = 'published' and id <> new.id;

  if used >= lim then
    raise exception 'Tu plan permite % máquinas publicadas. Mejora tu plan para publicar más.', lim;
  end if;
  return new;
end $$;

create trigger machines_plan_limit before insert or update of status on machines
  for each row execute function enforce_plan_machine_limit();

-- --------------------------------------------------------------------------
-- Aprobación de pagos (solo admin)
-- --------------------------------------------------------------------------
-- Activa el plan por 1 mes (acumulable si ya estaba activo) o el destacado
-- por 7 días, y asigna el siguiente número de Socio Fundador si quedan cupos
-- y es el primer pago de plan aprobado de ese propietario.
create or replace function approve_payment(p_payment_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  pay payments%rowtype;
  next_founder smallint;
begin
  if not is_admin() then
    raise exception 'Solo la administración aprueba pagos';
  end if;

  select * into pay from payments where id = p_payment_id for update;
  if not found or pay.status <> 'pending' then
    raise exception 'Pago inexistente o ya revisado';
  end if;

  perform set_config('maquifly.approving', 'on', true);

  if pay.product in ('fly-plus', 'fly-pro') then
    update owner_profiles set
      plan = case pay.product when 'fly-plus' then 'plus'::plan_id else 'pro'::plan_id end,
      plan_expires_at = greatest(now(), coalesce(plan_expires_at, now())) + interval '1 month'
    where id = pay.owner_id;

    -- Socio Fundador: orden de aprobación, máximo 10, permanente.
    perform pg_advisory_xact_lock(hashtext('maquifly_founders'));
    if (select founder_number from owner_profiles where id = pay.owner_id) is null then
      select coalesce(max(founder_number), 0) + 1 into next_founder from owner_profiles;
      if next_founder <= 10 then
        update owner_profiles set founder_number = next_founder where id = pay.owner_id;
      end if;
    end if;
  else
    update machines set
      featured_until = greatest(now(), coalesce(featured_until, now())) + interval '7 days'
    where id = pay.machine_id and owner_id = pay.owner_id;
  end if;

  update payments set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = p_payment_id;
end $$;

revoke all on function approve_payment(uuid) from public;
grant execute on function approve_payment(uuid) to authenticated;

-- --------------------------------------------------------------------------
-- Vistas públicas (lo que lee la web)
-- --------------------------------------------------------------------------
-- El WhatsApp del propietario solo es público con Fly Plus/Pro vigente; en
-- Fly Start el contacto pasa por MaquiFly. El RUC solo se ve en Fly Pro.
create view owners_public as
select
  o.id, o.user_id, o.slug, o.business_name, o.description, o.location_id,
  o.area, o.logo_url, o.rating, o.review_count, o.machine_count,
  o.verification_status, o.member_since, o.founder_number, o.plan_expires_at,
  effective_plan(o.plan, o.plan_expires_at) as plan,
  case when effective_plan(o.plan, o.plan_expires_at) in ('plus', 'pro')
       then o.whatsapp end as whatsapp,
  null::text as phone,
  case when effective_plan(o.plan, o.plan_expires_at) = 'pro'
       then o.ruc end as ruc
from owner_profiles o;

create view machines_public as
select
  m.*,
  effective_plan(o.plan, o.plan_expires_at) as owner_plan,
  (o.founder_number is not null) as owner_is_founder,
  (case when m.featured_until > now() then 10 else 0 end)
  + (case effective_plan(o.plan, o.plan_expires_at) when 'pro' then 2 when 'plus' then 1 else 0 end)
    as visibility_rank
from machines m
join owner_profiles o on o.id = m.owner_id
where m.status = 'published';

grant select on owners_public, machines_public to anon, authenticated;

-- La tabla de propietarios deja de ser legible directamente por visitantes:
-- así nadie lee el WhatsApp de un perfil Fly Start consultando la API.
drop policy "propietarios visibles" on owner_profiles;
create policy "propietario ve lo suyo" on owner_profiles
  for select using (user_id = auth.uid() or is_admin());


-- ==========================================================================
-- PANEL DE ADMINISTRACIÓN
-- ==========================================================================

-- Catálogos (mismos ids que src/lib/data/categories.ts y locations.ts)
insert into categories (id, name, singular, slug, family) values
  ('cat-minicargadores', 'Minicargadores', 'Minicargador', 'minicargadores', 'heavy'),
  ('cat-excavadoras', 'Excavadoras', 'Excavadora', 'excavadoras', 'heavy'),
  ('cat-retroexcavadoras', 'Retroexcavadoras', 'Retroexcavadora', 'retroexcavadoras', 'heavy'),
  ('cat-cargadores-frontales', 'Cargadores frontales', 'Cargador frontal', 'cargadores-frontales', 'heavy'),
  ('cat-volquetes', 'Volquetes', 'Volquete', 'volquetes', 'heavy'),
  ('cat-rodillos', 'Rodillos compactadores', 'Rodillo compactador', 'rodillos', 'heavy'),
  ('cat-motoniveladoras', 'Motoniveladoras', 'Motoniveladora', 'motoniveladoras', 'heavy'),
  ('cat-tractores-oruga', 'Tractores sobre oruga', 'Tractor sobre oruga', 'tractores-oruga', 'heavy'),
  ('cat-gruas', 'Grúas', 'Grúa', 'gruas', 'heavy'),
  ('cat-plataformas-elevadoras', 'Plataformas elevadoras', 'Plataforma elevadora', 'plataformas-elevadoras', 'support'),
  ('cat-manipuladores-telescopicos', 'Manipuladores telescópicos', 'Manipulador telescópico', 'manipuladores-telescopicos', 'support'),
  ('cat-generadores', 'Generadores eléctricos', 'Generador eléctrico', 'generadores', 'support'),
  ('cat-mezcladoras', 'Mezcladoras y equipos de concreto', 'Mezcladora', 'mezcladoras', 'light'),
  ('cat-compactadoras', 'Compactadoras ligeras', 'Compactadora', 'compactadoras', 'light'),
  ('cat-equipos-agricolas', 'Equipos agrícolas', 'Equipo agrícola', 'equipos-agricolas', 'agricultural'),
  ('cat-herramientas', 'Herramientas y equipos menores', 'Herramienta', 'herramientas', 'light')
on conflict (id) do nothing;

insert into locations (id, name, slug, region, active) values
  ('loc-piura', 'Piura', 'piura', 'Piura', true),
  ('loc-chiclayo', 'Chiclayo', 'chiclayo', 'Lambayeque', false),
  ('loc-trujillo', 'Trujillo', 'trujillo', 'La Libertad', false),
  ('loc-tumbes', 'Tumbes', 'tumbes', 'Tumbes', false),
  ('loc-cajamarca', 'Cajamarca', 'cajamarca', 'Cajamarca', false),
  ('loc-lima', 'Lima', 'lima', 'Lima', false)
on conflict (id) do nothing;

-- Cada usuario nuevo de Supabase Auth recibe su perfil (rol cliente).
-- El admin se nombra a mano: update profiles set role = 'admin' where email = '…';
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Solicitudes de publicación enviadas desde /publicar (sin cuenta).
-- El admin las revisa y crea el propietario y la máquina desde el panel.
create table listing_submissions (
  id          uuid primary key default uuid_generate_v4(),
  contact_name text not null,
  whatsapp    text not null,
  data        jsonb not null,
  photos      text[] not null default '{}',
  status      text not null default 'new' check (status in ('new', 'approved', 'rejected')),
  admin_note  text,
  created_at  timestamptz not null default now(),
  constraint submission_size check (pg_column_size(data) < 20000 and coalesce(array_length(photos, 1), 0) <= 8)
);
alter table listing_submissions enable row level security;
create policy "cualquiera envia solicitud" on listing_submissions
  for insert with check (status = 'new');
create policy "admin gestiona solicitudes" on listing_submissions
  for all using (is_admin()) with check (is_admin());

-- Mensajes y reportes: el admin los marca como leídos o archivados.
create policy "admin gestiona mensajes" on contact_messages
  for update using (is_admin()) with check (is_admin());
create policy "admin borra mensajes" on contact_messages for delete using (is_admin());
create policy "admin lee perfiles" on profiles for select using (is_admin());

-- Fotos: bucket público de lectura. Cualquiera sube SOLO a submissions/
-- (fotos de /publicar); el resto de carpetas solo el admin.
do $do$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('machine-photos', 'machine-photos', true, 5242880,
            array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    on conflict (id) do nothing;

    execute $p$create policy "fotos visibles" on storage.objects
      for select using (bucket_id = 'machine-photos')$p$;
    execute $p$create policy "subir fotos de solicitud" on storage.objects
      for insert with check (bucket_id = 'machine-photos' and (storage.foldername(name))[1] = 'submissions')$p$;
    execute $p$create policy "admin gestiona fotos" on storage.objects
      for all using (bucket_id = 'machine-photos' and public.is_admin())
      with check (bucket_id = 'machine-photos' and public.is_admin())$p$;
  end if;
end $do$;
