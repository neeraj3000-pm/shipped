-- Shipped schema. Run once in Supabase SQL editor (or psql).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('manager','member'))
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text,
  portal_token text not null unique default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
  created_at timestamptz not null default now()
);

create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  version text not null,
  title text not null,
  summary text not null default '',
  status text not null default 'draft' check (status in ('draft','in_review','approved','sent')),
  items jsonb not null default '[]'::jsonb,
  created_by text not null,
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists releases_client_idx on releases(client_id, created_at desc);

create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references releases(id) on delete cascade,
  actor text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_release_idx on activity(release_id, created_at);

-- Lock everything down: the app reads/writes server-side with the service role
-- after checking the logged-in user. No anon/authenticated policies = no direct access.
alter table profiles enable row level security;
alter table clients enable row level security;
alter table releases enable row level security;
alter table activity enable row level security;
