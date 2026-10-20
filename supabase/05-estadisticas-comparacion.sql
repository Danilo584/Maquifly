-- ==========================================================================
-- ESTADÍSTICAS: COMPARACIÓN CON EL PERIODO ANTERIOR
-- ==========================================================================
-- Totales del periodo anterior del mismo largo (p. ej. los 30 días previos a
-- los últimos 30), para mostrar «▲ 18 % vs. 30 días anteriores» en
-- Mi cuenta → Estadísticas. Es parte del reporte de Fly Plus y Fly Pro, así
-- que en Fly Start no devuelve nada.
--
-- Cómo aplicarlo: supabase.com → tu proyecto → SQL Editor → New query →
-- pegar todo este archivo → Run. Se puede ejecutar más de una vez.

create or replace function my_stats_previous(p_days integer default 30)
returns table (views bigint, whatsapp bigint, profile_views bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'view'
        and e.created_at >  now() - make_interval(days => p_days * 2)
        and e.created_at <= now() - make_interval(days => p_days)),
    (select count(*) from machine_events e join machines m on m.id = e.machine_id
      where m.owner_id = my_owner_id() and e.kind = 'whatsapp'
        and e.created_at >  now() - make_interval(days => p_days * 2)
        and e.created_at <= now() - make_interval(days => p_days)),
    (select count(*) from owner_events v
      where v.owner_id = my_owner_id()
        and v.created_at >  now() - make_interval(days => p_days * 2)
        and v.created_at <= now() - make_interval(days => p_days))
  where my_owner_id() is not null
    and my_plan_has_detail()
$$;

revoke all on function my_stats_previous(integer) from public;
grant execute on function my_stats_previous(integer) to authenticated;
