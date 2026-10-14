-- ==========================================================================
-- MAQUIFLY — CUENTAS DE PROPIETARIOS
-- (ejecutar una vez, después de schema.sql y 02-estadisticas.sql)
-- ==========================================================================
-- Lo que agrega:
--   1. Cierra huecos de seguridad antes de abrir el registro público:
--      nadie puede darse rol de admin, ni inflar su reputación, ni publicar
--      una máquina sin revisión, ni regalarse un Destacado.
--   2. Cada propietario sube fotos solo a su propia carpeta.
--   3. Estadísticas por propietario: vistas, clics en WhatsApp y visitas a
--      su perfil. Las visitas del propio dueño y del admin no cuentan.
--   4. Funciones que el panel /cuenta usa para leer SOLO los datos propios.
--
-- Regla general de los triggers de este archivo: las restricciones se
-- aplican a las peticiones que llegan desde la web (roles «anon» y
-- «authenticated»). El editor SQL de Supabase y las funciones internas
-- (que corren como «postgres») no se bloquean, así siguen funcionando
-- los contadores automáticos y la aprobación de pagos.
--
-- Se puede ejecutar más de una vez sin romper nada.
-- ==========================================================================

create or replace function is_web_request() returns boolean
language sql stable as $$
  select current_user in ('anon', 'authenticated')
$$;

-- --------------------------------------------------------------------------
-- 1a. Perfiles: el rol y la verificación solo los cambia la administración
-- --------------------------------------------------------------------------
create or replace function protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if not is_web_request() or is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
  or new.verification_status is distinct from old.verification_status
  or new.id is distinct from old.id then
    raise exception 'Solo la administración puede cambiar el rol o la verificación de una cuenta';
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect on profiles;
create trigger profiles_protect before update on profiles
  for each row execute function protect_profile_fields();

-- --------------------------------------------------------------------------
-- 1b. Perfiles de propietario: reputación y contadores no se tocan a mano
-- --------------------------------------------------------------------------
-- Una cuenta = un perfil de propietario.
create unique index if not exists owner_profiles_one_per_user
  on owner_profiles(user_id) where user_id is not null;

create or replace function protect_owner_computed_fields() returns trigger
language plpgsql as $$
begin
  if not is_web_request() or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.rating := null;
    new.review_count := 0;
    new.machine_count := 0;
    new.member_since := now();
    return new;
  end if;

  if new.rating        is distinct from old.rating
  or new.review_count  is distinct from old.review_count
  or new.machine_count is distinct from old.machine_count
  or new.member_since  is distinct from old.member_since
  or new.slug          is distinct from old.slug
  or new.user_id       is distinct from old.user_id then
    raise exception 'Ese dato lo calcula MaquiFly y no se puede editar';
  end if;
  return new;
end $$;

drop trigger if exists owner_profiles_protect_computed on owner_profiles;
create trigger owner_profiles_protect_computed
  before insert or update on owner_profiles
  for each row execute function protect_owner_computed_fields();

-- --------------------------------------------------------------------------
-- 1c. Máquinas: la primera publicación pasa por revisión
-- --------------------------------------------------------------------------
-- Desde su cuenta, un propietario puede:
--   · crear una máquina como borrador o enviarla a revisión;
--   · pausar y reactivar una máquina que la administración ya aprobó;
--   · archivarla.
-- Publicar por primera vez (o tras un rechazo) lo hace la administración.
create or replace function protect_machine_owner_fields() returns trigger
language plpgsql as $$
begin
  if not is_web_request() or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending_review') then
      new.status := 'pending_review';
    end if;
    new.rating := null;
    new.review_count := 0;
    new.featured_until := null;
    new.reference := next_machine_reference();
    return new;
  end if;

  if new.rating       is distinct from old.rating
  or new.review_count is distinct from old.review_count
  or new.reference    is distinct from old.reference
  or new.slug         is distinct from old.slug then
    raise exception 'Ese dato lo calcula MaquiFly y no se puede editar';
  end if;

  if new.status is distinct from old.status and not (
       (old.status = 'draft'          and new.status in ('pending_review', 'archived'))
    or (old.status = 'pending_review' and new.status in ('draft', 'archived'))
    or (old.status = 'rejected'       and new.status in ('pending_review', 'draft', 'archived'))
    or (old.status = 'published'      and new.status in ('paused', 'archived'))
    or (old.status = 'paused'         and new.status in ('published', 'archived'))
    or (old.status = 'archived'       and new.status = 'draft')
  ) then
    raise exception 'La primera publicación de una máquina la aprueba MaquiFly. Envíala a revisión.';
  end if;
  return new;
end $$;

drop trigger if exists machines_protect_owner on machines;
create trigger machines_protect_owner before insert or update on machines
  for each row execute function protect_machine_owner_fields();

-- --------------------------------------------------------------------------
-- 2. Fotos: cada propietario sube a owners/<su id de usuario>/…
-- --------------------------------------------------------------------------
do $do$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    execute 'drop policy if exists "propietario sube sus fotos" on storage.objects';
    execute $p$create policy "propietario sube sus fotos" on storage.objects
      for insert to authenticated with check (
        bucket_id = 'machine-photos'
        and (storage.foldername(name))[1] = 'owners'
        and (storage.foldername(name))[2] = auth.uid()::text
      )$p$;
  end if;
end $do$;

-- --------------------------------------------------------------------------
-- 3. Estadísticas
-- --------------------------------------------------------------------------
-- ¿Este visitante cuenta? No cuentan el propio dueño ni el admin.
create or replace function can_track_machine(p_machine uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from machines m
      join owner_profiles o on o.id = m.owner_id
     where m.id = p_machine
       and m.status = 'published'
       and (auth.uid() is null or o.user_id is null or o.user_id <> auth.uid())
  ) and not is_admin()
$$;

create or replace function can_track_owner(p_owner uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from owner_profiles o
     where o.id = p_owner
       and (auth.uid() is null or o.user_id is null or o.user_id <> auth.uid())
  ) and not is_admin()
$$;

grant execute on function can_track_machine(uuid) to anon, authenticated;
grant execute on function can_track_owner(uuid) to anon, authenticated;

drop policy if exists "registrar evento" on machine_events;
create policy "registrar evento" on machine_events
  for insert with check (can_track_machine(machine_id));

-- Visitas al perfil público de un propietario.
create table if not exists owner_events (
  id          bigint generated always as identity primary key,
  owner_id    uuid not null references owner_profiles(id) on delete cascade,
  kind        text not null default 'profile_view' check (kind in ('profile_view')),
  created_at  timestamptz not null default now()
);

create index if not exists owner_events_owner_idx on owner_events(owner_id, created_at desc);

alter table owner_events enable row level security;

drop policy if exists "registrar visita de perfil" on owner_events;
create policy "registrar visita de perfil" on owner_events
  for insert with check (can_track_owner(owner_id));

drop policy if exists "admin lee visitas de perfil" on owner_events;
create policy "admin lee visitas de perfil" on owner_events for select using (is_admin());

-- --------------------------------------------------------------------------
-- 4. Funciones del panel del propietario (solo devuelven datos propios)
-- --------------------------------------------------------------------------
create or replace function my_owner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from owner_profiles where user_id = auth.uid() limit 1
$$;

-- El detalle por máquina y por semana es parte de Fly Plus y Fly Pro
-- («reporte de visitas y contactos»). El total lo ve cualquier plan.
create or replace function my_plan_has_detail() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select effective_plan(plan, plan_expires_at) in ('plus', 'pro')
      from owner_profiles where user_id = auth.uid() limit 1
  ), false)
$$;

create or replace function my_stats_totals(p_days integer default 30)
returns table (views bigint, whatsapp bigint, profile_views bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'view'
        and e.created_at > now() - make_interval(days => p_days)),
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'whatsapp'
        and e.created_at > now() - make_interval(days => p_days)),
    (select count(*) from owner_events v
      where v.owner_id = my_owner_id()
        and v.created_at > now() - make_interval(days => p_days))
  where my_owner_id() is not null
$$;

create or replace function my_machine_stats(p_days integer default 30)
returns table (machine_id uuid, views bigint, whatsapp bigint)
language sql stable security definer set search_path = public as $$
  select m.id,
         count(e.id) filter (where e.kind = 'view'),
         count(e.id) filter (where e.kind = 'whatsapp')
    from machines m
    left join machine_events e
      on e.machine_id = m.id
     and e.created_at > now() - make_interval(days => p_days)
   where m.owner_id = my_owner_id()
     and my_plan_has_detail()
   group by m.id
$$;

create or replace function my_weekly_stats(p_weeks integer default 8)
returns table (week date, views bigint, whatsapp bigint, profile_views bigint)
language sql stable security definer set search_path = public as $$
  with w as (
    select generate_series(
      date_trunc('week', now()) - make_interval(weeks => p_weeks - 1),
      date_trunc('week', now()),
      interval '1 week'
    )::date as week
  )
  select w.week,
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'view'
        and date_trunc('week', e.created_at)::date = w.week),
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'whatsapp'
        and date_trunc('week', e.created_at)::date = w.week),
    (select count(*) from owner_events v
      where v.owner_id = my_owner_id()
        and date_trunc('week', v.created_at)::date = w.week)
  from w
  where my_plan_has_detail()
  order by w.week
$$;

revoke all on function my_owner_id() from public;
revoke all on function my_plan_has_detail() from public;
revoke all on function my_stats_totals(integer) from public;
revoke all on function my_machine_stats(integer) from public;
revoke all on function my_weekly_stats(integer) from public;
grant execute on function my_owner_id() to authenticated;
grant execute on function my_plan_has_detail() to authenticated;
grant execute on function my_stats_totals(integer) to authenticated;
grant execute on function my_machine_stats(integer) to authenticated;
grant execute on function my_weekly_stats(integer) to authenticated;
