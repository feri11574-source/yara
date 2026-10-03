-- این فایل را در Supabase > SQL Editor اجرا کنید.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('زنانه','مردانه','بچگانه')),
  description text,
  price bigint not null default 0,
  old_price bigint,
  image_url text,
  image_color text default '#9c806d',
  sale boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount bigint not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (is_active=true or public.is_admin());

drop policy if exists "admin products insert" on public.products;
create policy "admin products insert" on public.products for insert with check (public.is_admin());
drop policy if exists "admin products update" on public.products;
create policy "admin products update" on public.products for update using (public.is_admin());
drop policy if exists "admin products delete" on public.products;
create policy "admin products delete" on public.products for delete using (public.is_admin());

drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (auth.uid()=user_id or public.is_admin());
drop policy if exists "orders own insert" on public.orders;
create policy "orders own insert" on public.orders for insert with check (auth.uid()=user_id);
drop policy if exists "admin orders update" on public.orders;
create policy "admin orders update" on public.orders for update using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- بعد از اینکه حساب خودتان را در سایت ثبت‌نام کردید، UUID آن حساب را پیدا کرده و این دستور را اجرا کنید:
-- update public.profiles set role='admin' where id='UUID-USER-HERE';
