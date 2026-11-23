-- Senfy - schema inicial para Supabase
-- Execute no SQL Editor do projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text not null,
  points integer not null default 0 check (points >= 0),
  redemptions integer not null default 0 check (redemptions >= 0),
  purchases integer not null default 0 check (purchases >= 0),
  avg_days integer,
  last_days integer,
  preferred_days text[] not null default '{}',
  preferred_period text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  value numeric(12,2) not null check (value >= 0),
  points integer not null default 0 check (points >= 0),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  max_value numeric(12,2) not null check (max_value >= 0),
  points integer not null default 0 check (points >= 0),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prizes (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  comment text not null default '',
  points integer not null default 0 check (points >= 0),
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists sales_purchased_at_idx on public.sales (purchased_at desc);
create index if not exists sales_customer_id_idx on public.sales (customer_id);
create index if not exists customers_phone_idx on public.customers (phone);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists rules_set_updated_at on public.rules;
create trigger rules_set_updated_at before update on public.rules
for each row execute function public.set_updated_at();

drop trigger if exists prizes_set_updated_at on public.prizes;
create trigger prizes_set_updated_at before update on public.prizes
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at before update on public.settings
for each row execute function public.set_updated_at();

-- RLS simples para MVP. Ajuste antes de produção.
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.rules enable row level security;
alter table public.prizes enable row level security;
alter table public.settings enable row level security;

-- ATENÇÃO: políticas abertas para anon (MVP). Restrinja com auth em produção.
create policy "anon read customers" on public.customers for select to anon using (true);
create policy "anon insert customers" on public.customers for insert to anon with check (true);
create policy "anon update customers" on public.customers for update to anon using (true) with check (true);

create policy "anon read sales" on public.sales for select to anon using (true);
create policy "anon insert sales" on public.sales for insert to anon with check (true);
create policy "anon update sales" on public.sales for update to anon using (true) with check (true);
create policy "anon delete sales" on public.sales for delete to anon using (true);

create policy "anon read rules" on public.rules for select to anon using (true);
create policy "anon insert rules" on public.rules for insert to anon with check (true);
create policy "anon update rules" on public.rules for update to anon using (true) with check (true);
create policy "anon delete rules" on public.rules for delete to anon using (true);

create policy "anon read prizes" on public.prizes for select to anon using (true);
create policy "anon insert prizes" on public.prizes for insert to anon with check (true);
create policy "anon update prizes" on public.prizes for update to anon using (true) with check (true);
create policy "anon delete prizes" on public.prizes for delete to anon using (true);

create policy "anon read settings" on public.settings for select to anon using (true);
create policy "anon insert settings" on public.settings for insert to anon with check (true);
create policy "anon update settings" on public.settings for update to anon using (true) with check (true);
