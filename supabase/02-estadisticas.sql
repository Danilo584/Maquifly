-- ==========================================================================
-- MAQUIFLY — ESTADÍSTICAS POR MÁQUINA (ejecutar una vez, después de schema.sql)
-- ==========================================================================
-- Registra vistas de cada ficha y clics en WhatsApp. Sirve para el panel y
-- para el «reporte mensual de visitas y contactos» del plan Fly Plus.
-- Sin datos personales: solo qué máquina, qué evento y cuándo.

create table if not exists machine_events (
  id          bigint generated always as identity primary key,
  machine_id  uuid not null references machines(id) on delete cascade,
  kind        text not null check (kind in ('view', 'whatsapp')),
  created_at  timestamptz not null default now()
);

create index if not exists machine_events_machine_idx on machine_events(machine_id, created_at desc);
create index if not exists machine_events_created_idx on machine_events(created_at desc);

alter table machine_events enable row level security;

-- Cualquier visitante puede registrar un evento de una máquina publicada.
drop policy if exists "registrar evento" on machine_events;
create policy "registrar evento" on machine_events
  for insert with check (
    exists (select 1 from machines m where m.id = machine_id and m.status = 'published')
  );

-- Solo el admin lee las estadísticas.
drop policy if exists "admin lee eventos" on machine_events;
create policy "admin lee eventos" on machine_events for select using (is_admin());

-- Resumen por máquina en un rango de días (para el panel).
create or replace function machine_stats(days integer default 30)
returns table (machine_id uuid, views bigint, whatsapp bigint)
language sql stable security definer set search_path = public as $$
  select e.machine_id,
         count(*) filter (where e.kind = 'view')     as views,
         count(*) filter (where e.kind = 'whatsapp') as whatsapp
  from machine_events e
  where is_admin() and e.created_at > now() - make_interval(days => days)
  group by e.machine_id
$$;

-- Serie semanal (últimas N semanas) de vistas, clics, mensajes y publicaciones recibidas.
create or replace function weekly_activity(weeks integer default 8)
returns table (week date, views bigint, whatsapp bigint, messages bigint, submissions bigint)
language sql stable security definer set search_path = public as $$
  with w as (
    select generate_series(
      date_trunc('week', now()) - make_interval(weeks => weeks - 1),
      date_trunc('week', now()),
      interval '1 week'
    )::date as week
  )
  select w.week,
    (select count(*) from machine_events e where e.kind = 'view' and date_trunc('week', e.created_at)::date = w.week),
    (select count(*) from machine_events e where e.kind = 'whatsapp' and date_trunc('week', e.created_at)::date = w.week),
    (select count(*) from contact_messages c where date_trunc('week', c.created_at)::date = w.week),
    (select count(*) from listing_submissions s where date_trunc('week', s.created_at)::date = w.week)
  from w
  where is_admin()
  order by w.week
$$;

revoke all on function machine_stats(integer) from public;
revoke all on function weekly_activity(integer) from public;
grant execute on function machine_stats(integer) to authenticated;
grant execute on function weekly_activity(integer) to authenticated;
