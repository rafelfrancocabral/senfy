-- Senfy - Hardening de segurança (executar no SQL Editor do Supabase)
-- IMPORTANTE: revise antes de executar. Faça backup/tenha rollback.
-- Este script assume o modelo multi-tenant já aplicado (stores, vendas_fidelidade, store_id nas tabelas MVP).
-- Ajuste nomes de colunas/policies se seu schema diferir.

begin;

-- ---------------------------------------------------------------------------
-- 1) REMOVER POLÍTICAS ABERTAS DO MVP (customers, sales, rules, prizes, settings)
-- ---------------------------------------------------------------------------
-- Essas políticas permitem leitura/escrita anon irrestrita. Remova antes de produção.

drop policy if exists "anon read customers" on public.customers;
drop policy if exists "anon insert customers" on public.customers;
drop policy if exists "anon update customers" on public.customers;
drop policy if exists "anon delete customers" on public.customers;

drop policy if exists "anon read sales" on public.sales;
drop policy if exists "anon insert sales" on public.sales;
drop policy if exists "anon update sales" on public.sales;
drop policy if exists "anon delete sales" on public.sales;

drop policy if exists "anon read rules" on public.rules;
drop policy if exists "anon insert rules" on public.rules;
drop policy if exists "anon update rules" on public.rules;
drop policy if exists "anon delete rules" on public.rules;

drop policy if exists "anon read prizes" on public.prizes;
drop policy if exists "anon insert prizes" on public.prizes;
drop policy if exists "anon update prizes" on public.prizes;
drop policy if exists "anon delete prizes" on public.prizes;

drop policy if exists "anon read settings" on public.settings;
drop policy if exists "anon insert settings" on public.settings;
drop policy if exists "anon update settings" on public.settings;
drop policy if exists "anon delete settings" on public.settings;

-- ---------------------------------------------------------------------------
-- 2) GARANTIR RLS ATIVO
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.rules enable row level security;
alter table public.prizes enable row level security;
alter table public.settings enable row level security;

-- Tabelas multi-tenant (ajuste se nomes diferirem)
alter table if exists public.stores enable row level security;
alter table if exists public.vendas_fidelidade enable row level security;

-- ---------------------------------------------------------------------------
-- 3) HELPER: loja pertence ao usuário autenticado
-- ---------------------------------------------------------------------------
create or replace function public.is_store_owner(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stores s
    where s.id = p_store_id
      and s.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_store_owner(uuid) from public;
grant execute on function public.is_store_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) POLÍTICAS OWNER-ONLY PARA TABELAS MVP
--    Requer coluna store_id nas tabelas MVP.
-- ---------------------------------------------------------------------------

-- CUSTOMERS
drop policy if exists "owner select customers" on public.customers;
drop policy if exists "owner insert customers" on public.customers;
drop policy if exists "owner update customers" on public.customers;
drop policy if exists "owner delete customers" on public.customers;
create policy "owner select customers" on public.customers
  for select to authenticated
  using (public.is_store_owner(store_id));
create policy "owner insert customers" on public.customers
  for insert to authenticated
  with check (public.is_store_owner(store_id));
create policy "owner update customers" on public.customers
  for update to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));
create policy "owner delete customers" on public.customers
  for delete to authenticated
  using (public.is_store_owner(store_id));

-- SALES
drop policy if exists "owner select sales" on public.sales;
drop policy if exists "owner insert sales" on public.sales;
drop policy if exists "owner update sales" on public.sales;
drop policy if exists "owner delete sales" on public.sales;
create policy "owner select sales" on public.sales
  for select to authenticated
  using (public.is_store_owner(store_id));
create policy "owner insert sales" on public.sales
  for insert to authenticated
  with check (public.is_store_owner(store_id));
create policy "owner update sales" on public.sales
  for update to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));
create policy "owner delete sales" on public.sales
  for delete to authenticated
  using (public.is_store_owner(store_id));

-- RULES
drop policy if exists "owner select rules" on public.rules;
drop policy if exists "owner insert rules" on public.rules;
drop policy if exists "owner update rules" on public.rules;
drop policy if exists "owner delete rules" on public.rules;
create policy "owner select rules" on public.rules
  for select to authenticated
  using (public.is_store_owner(store_id));
create policy "owner insert rules" on public.rules
  for insert to authenticated
  with check (public.is_store_owner(store_id));
create policy "owner update rules" on public.rules
  for update to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));
create policy "owner delete rules" on public.rules
  for delete to authenticated
  using (public.is_store_owner(store_id));

-- PRIZES
drop policy if exists "owner select prizes" on public.prizes;
drop policy if exists "owner insert prizes" on public.prizes;
drop policy if exists "owner update prizes" on public.prizes;
drop policy if exists "owner delete prizes" on public.prizes;
create policy "owner select prizes" on public.prizes
  for select to authenticated
  using (public.is_store_owner(store_id));
create policy "owner insert prizes" on public.prizes
  for insert to authenticated
  with check (public.is_store_owner(store_id));
create policy "owner update prizes" on public.prizes
  for update to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));
create policy "owner delete prizes" on public.prizes
  for delete to authenticated
  using (public.is_store_owner(store_id));

-- SETTINGS (se usar store_id; caso contrário, restrinja por key/owner separadamente)
drop policy if exists "owner select settings" on public.settings;
drop policy if exists "owner insert settings" on public.settings;
drop policy if exists "owner update settings" on public.settings;
drop policy if exists "owner delete settings" on public.settings;
-- Se settings tiver store_id, descomente:
-- create policy "owner select settings" on public.settings for select to authenticated using (public.is_store_owner(store_id));
-- create policy "owner insert settings" on public.settings for insert to authenticated with check (public.is_store_owner(store_id));
-- create policy "owner update settings" on public.settings for update to authenticated using (public.is_store_owner(store_id)) with check (public.is_store_owner(store_id));
-- create policy "owner delete settings" on public.settings for delete to authenticated using (public.is_store_owner(store_id));

-- ---------------------------------------------------------------------------
-- 5) STORES: dono gerencia; público só lê dados mínimos da loja ativa via VIEW/RPC
-- ---------------------------------------------------------------------------
drop policy if exists "owner select stores" on public.stores;
drop policy if exists "owner insert stores" on public.stores;
drop policy if exists "owner update stores" on public.stores;
drop policy if exists "owner delete stores" on public.stores;
create policy "owner select stores" on public.stores
  for select to authenticated
  using (owner_id = auth.uid());
create policy "owner insert stores" on public.stores
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy "owner update stores" on public.stores
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- View pública segura (sem owner_id/email/etc)
create or replace view public.public_store_checkout as
select id, nome_loja, cor_primaria, logo_url, tipo_programa, ativo
from public.stores
where ativo = true;

grant select on public.public_store_checkout to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6) CHECKOUT SEGURO VIA RPC (SECURITY DEFINER)
--    Evita expor escrita anon direta nas tabelas.
-- ---------------------------------------------------------------------------

-- Retorna configuração pública da loja para checkout
create or replace function public.get_checkout_store(p_store_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store record;
  v_rules jsonb;
  v_prizes jsonb;
begin
  select id, nome_loja, cor_primaria, logo_url, tipo_programa, ativo
    into v_store
  from public.stores
  where id = p_store_id and ativo = true;

  if not found then
    return jsonb_build_object('error', 'store_not_found');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'max_value', r.max_value,
    'points', r.points,
    'description', coalesce(r.description, ''),
    'active', r.active
  ) order by r.max_value), '[]'::jsonb)
  into v_rules
  from public.rules r
  where r.store_id = p_store_id and r.active = true;

  select coalesce(jsonb_agg(jsonb_build_object(
    'description', p.description,
    'points', p.points,
    'comment', coalesce(p.comment, ''),
    'active', p.active
  ) order by p.points), '[]'::jsonb)
  into v_prizes
  from public.prizes p
  where p.store_id = p_store_id and p.active = true;

  return jsonb_build_object(
    'store', jsonb_build_object(
      'id', v_store.id,
      'nome_loja', v_store.nome_loja,
      'cor_primaria', v_store.cor_primaria,
      'logo_url', v_store.logo_url,
      'tipo_programa', v_store.tipo_programa
    ),
    'rules', v_rules,
    'prizes', v_prizes
  );
end;
$$;

grant execute on function public.get_checkout_store(uuid) to anon, authenticated;

-- Registra compra no checkout. Calcula pontos no servidor.
create or replace function public.register_checkout_purchase(
  p_store_id uuid,
  p_name text,
  p_phone text,
  p_value numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store record;
  v_rule record;
  v_customer record;
  v_points int;
  v_phone_digits text;
  v_name text;
begin
  if p_store_id is null then
    return jsonb_build_object('error', 'invalid_store');
  end if;

  select id, ativo, tipo_programa into v_store
  from public.stores
  where id = p_store_id and ativo = true;
  if not found then
    return jsonb_build_object('error', 'store_not_found');
  end if;

  v_name := btrim(coalesce(p_name, ''));
  v_phone_digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_name) < 2 or length(v_name) > 120 then
    return jsonb_build_object('error', 'invalid_name');
  end if;
  if length(v_phone_digits) < 10 or length(v_phone_digits) > 11 then
    return jsonb_build_object('error', 'invalid_phone');
  end if;
  if p_value is null or p_value <= 0 or p_value > 999999 then
    return jsonb_build_object('error', 'invalid_value');
  end if;

  select r.points, r.max_value into v_rule
  from public.rules r
  where r.store_id = p_store_id
    and r.active = true
    and p_value <= r.max_value
  order by r.max_value asc
  limit 1;

  if not found then
    return jsonb_build_object('error', 'no_rule');
  end if;

  v_points := greatest(0, coalesce(v_rule.points, 0));

  insert into public.customers (store_id, name, phone, points, purchases, redemptions)
  values (p_store_id, v_name, v_phone_digits, v_points, 1, 0)
  on conflict (store_id, phone) do update
    set name = excluded.name,
        points = public.customers.points + excluded.points,
        purchases = public.customers.purchases + 1,
        updated_at = now()
  returning * into v_customer;

  insert into public.sales (store_id, customer_id, customer_name, customer_phone, value, points, purchased_at)
  values (p_store_id, v_customer.id, v_name, v_phone_digits, p_value, v_points, now());

  -- Log opcional no modelo multi-tenant; ignore se tabela não existir/campos divergirem.
  begin
    insert into public.vendas_fidelidade (store_id, nome_cliente, telefone_cliente, valor_venda, tipo_registro, resgatado)
    values (
      p_store_id,
      v_name,
      v_phone_digits,
      p_value,
      case when v_store.tipo_programa = 'pontos' then 'ponto' else 'stamp' end,
      false
    );
  exception when undefined_table or undefined_column then
    null;
  end;

  return jsonb_build_object(
    'ok', true,
    'customer', jsonb_build_object(
      'id', v_customer.id,
      'name', v_customer.name,
      'phone', v_customer.phone,
      'points', v_customer.points,
      'purchases', v_customer.purchases,
      'redemptions', v_customer.redemptions
    ),
    'points_earned', v_points
  );
end;
$$;

grant execute on function public.register_checkout_purchase(uuid, text, text, numeric) to anon, authenticated;

-- Resgata prêmio no checkout (atualiza pontos/redemptions do cliente da loja)
create or replace function public.register_checkout_redeem(
  p_store_id uuid,
  p_phone text,
  p_prize_points int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone_digits text;
  v_customer record;
begin
  if p_store_id is null then return jsonb_build_object('error', 'invalid_store'); end if;
  v_phone_digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_phone_digits) < 10 or length(v_phone_digits) > 11 then
    return jsonb_build_object('error', 'invalid_phone');
  end if;
  if p_prize_points is null or p_prize_points <= 0 then
    return jsonb_build_object('error', 'invalid_prize');
  end if;

  if not exists (select 1 from public.stores s where s.id = p_store_id and s.ativo = true) then
    return jsonb_build_object('error', 'store_not_found');
  end if;

  select * into v_customer
  from public.customers
  where store_id = p_store_id and phone = v_phone_digits
  for update;

  if not found then
    return jsonb_build_object('error', 'customer_not_found');
  end if;
  if coalesce(v_customer.points, 0) < p_prize_points then
    return jsonb_build_object('error', 'insufficient_points');
  end if;

  update public.customers
  set points = greatest(0, coalesce(points, 0) - p_prize_points),
      redemptions = coalesce(redemptions, 0) + 1,
      updated_at = now()
  where id = v_customer.id
  returning * into v_customer;

  return jsonb_build_object(
    'ok', true,
    'customer', jsonb_build_object(
      'id', v_customer.id,
      'name', v_customer.name,
      'phone', v_customer.phone,
      'points', v_customer.points,
      'purchases', v_customer.purchases,
      'redemptions', v_customer.redemptions
    )
  );
end;
$$;

grant execute on function public.register_checkout_redeem(uuid, text, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7) ÍNDICES/CONSTRAINTS recomendados (execute se ainda não existirem)
-- ---------------------------------------------------------------------------
-- Unique por loja+telefone para upsert seguro no checkout:
-- alter table public.customers add constraint customers_store_phone_unique unique (store_id, phone);
-- create index if not exists customers_store_phone_idx on public.customers (store_id, phone);
-- create index if not exists sales_store_purchased_idx on public.sales (store_id, purchased_at desc);
-- create index if not exists rules_store_active_idx on public.rules (store_id, active, max_value);
-- create index if not exists prizes_store_active_idx on public.prizes (store_id, active, points);

commit;

-- ---------------------------------------------------------------------------
-- PÓS-EXECUÇÃO (painel Supabase)
-- ---------------------------------------------------------------------------
-- 1. Auth > Rate limits: ativar proteção de brute force/login.
-- 2. Auth > URL Configuration: allowlist apenas domínios confiáveis (prod, preview, localhost).
-- 3. Auth > Password: política forte; avaliar MFA/TOTP para donos.
-- 4. Storage store-logos: upload apenas authenticated no prefixo auth.uid(); limite de tamanho/tipos.
-- 5. Testar com 2 lojas: usuário A não deve acessar dados da loja B.
-- 6. Atualizar frontend checkout para usar RPCs get_checkout_store/register_checkout_purchase.
