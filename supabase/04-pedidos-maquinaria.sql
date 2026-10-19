-- ==========================================================================
-- PEDIDOS «TE CONSEGUIMOS LA MÁQUINA»
-- ==========================================================================
-- Un cliente que no encuentra el equipo publicado deja qué necesita, dónde y
-- cuándo. MaquiFly lo busca entre los propietarios de la zona y le responde
-- por WhatsApp. Los datos del cliente solo los ve el admin.
--
-- Cómo aplicarlo: supabase.com → tu proyecto → SQL Editor → New query →
-- pegar todo este archivo → Run. Se puede ejecutar más de una vez.

create table if not exists machine_requests (
  id            uuid primary key default uuid_generate_v4(),
  category_slug text,                 -- null = «otra máquina»
  machine_label text not null,        -- lo que pidió, en texto (p. ej. «Minicargador»)
  zone          text not null,        -- distrito o ciudad
  start_date    date,
  duration      text not null,        -- «1 día», «1–3 semanas»…
  operator      text not null check (operator in ('con', 'sin', 'indiferente')),
  name          text not null,
  whatsapp      text not null,
  status        text not null default 'new'
                check (status in ('new', 'searching', 'found', 'not_found')),
  admin_note    text,
  created_at    timestamptz not null default now(),
  constraint machine_request_lengths check (
    length(machine_label) <= 80 and length(zone) <= 120 and length(duration) <= 40
    and length(name) <= 120 and length(whatsapp) <= 40
    and length(coalesce(admin_note, '')) <= 2000
  )
);

create index if not exists machine_requests_status_idx on machine_requests (status, created_at desc);

alter table machine_requests enable row level security;

-- Cualquiera puede enviar un pedido (solo como «nuevo»); nadie más lo lee.
drop policy if exists "cualquiera pide maquina" on machine_requests;
create policy "cualquiera pide maquina" on machine_requests
  for insert with check (status = 'new' and admin_note is null);

-- El admin lee, cambia el estado y borra.
drop policy if exists "admin gestiona pedidos" on machine_requests;
create policy "admin gestiona pedidos" on machine_requests
  for all using (is_admin()) with check (is_admin());
