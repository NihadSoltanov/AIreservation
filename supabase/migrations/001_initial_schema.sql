-- AutoReserv — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Organizations (Tenants) ──────────────────────────────────────────────
create table if not exists organizations (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,
  vertical        text not null default 'custom',
  logo_url        text,
  phone           text,
  whatsapp_number text,
  address         text,
  website         text,
  timezone        text not null default 'UTC',
  language        text not null default 'en',
  accent_color    text not null default '#7c3aed',
  owner_id        uuid references auth.users(id) on delete cascade,
  plan            text not null default 'free',
  plan_status     text not null default 'trialing',
  stripe_customer_id text,
  config          jsonb not null default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Profiles ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  avatar_url      text,
  organization_id uuid references organizations(id) on delete set null,
  role            text not null default 'member',
  created_at      timestamptz default now()
);

-- ─── Entities (Vertical-agnostic catalog items) ────────────────────────────
create table if not exists entities (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title           text not null,
  status          text not null default 'active',
  fields          jsonb not null default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Leads ────────────────────────────────────────────────────────────────
create table if not exists leads (
  id                      uuid primary key default uuid_generate_v4(),
  organization_id         uuid not null references organizations(id) on delete cascade,
  name                    text not null,
  email                   text,
  phone                   text,
  source                  text not null default 'manual',
  status                  text not null default 'new',
  qualification_score     integer,
  qualification_summary   text,
  notes                   text,
  assigned_to             uuid references profiles(id) on delete set null,
  entity_id               uuid references entities(id) on delete set null,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ─── Conversations ────────────────────────────────────────────────────────
create table if not exists conversations (
  id                    uuid primary key default uuid_generate_v4(),
  organization_id       uuid not null references organizations(id) on delete cascade,
  lead_id               uuid references leads(id) on delete set null,
  status                text not null default 'open',
  channel               text not null default 'web',
  summary               text,
  handoff_requested_at  timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─── Messages ─────────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null, -- 'user' | 'assistant' | 'system'
  content         text not null,
  created_at      timestamptz default now()
);

-- ─── Knowledge Base ───────────────────────────────────────────────────────
create table if not exists knowledge_items (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type            text not null default 'faq',
  question        text,
  answer          text,
  content         text,
  file_name       text,
  created_at      timestamptz default now()
);

-- ─── Assistant Config ─────────────────────────────────────────────────────
create table if not exists assistant_configs (
  organization_id         uuid primary key references organizations(id) on delete cascade,
  name                    text not null default 'AI Assistant',
  tone                    text not null default 'professional',
  language                text not null default 'en',
  welcome_message         text,
  system_prompt           text,
  handoff_enabled         boolean not null default true,
  handoff_message         text,
  qualification_fields    text[] not null default '{}',
  lead_score_enabled      boolean not null default true,
  updated_at              timestamptz default now()
);

-- ─── Subscriptions ────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                        uuid primary key default uuid_generate_v4(),
  organization_id           uuid unique references organizations(id) on delete cascade,
  plan                      text not null default 'free',
  status                    text not null default 'trialing',
  stripe_subscription_id    text,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  usage_conversations       integer not null default 0,
  usage_leads               integer not null default 0,
  limit_conversations       integer not null default 200,
  limit_leads               integer not null default 50
);

-- ─── Row Level Security ───────────────────────────────────────────────────
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table entities enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table knowledge_items enable row level security;
alter table assistant_configs enable row level security;
alter table subscriptions enable row level security;

-- Users can only see their own organization's data
create policy "org_members_only" on organizations
  for all using (
    id in (select organization_id from profiles where id = auth.uid())
    or owner_id = auth.uid()
  );

create policy "own_profile" on profiles
  for all using (id = auth.uid());

create policy "org_entities" on entities
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

create policy "org_leads" on leads
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

create policy "org_conversations" on conversations
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

create policy "org_messages" on messages
  for all using (
    conversation_id in (
      select id from conversations where
        organization_id in (select organization_id from profiles where id = auth.uid())
    )
  );

create policy "org_knowledge" on knowledge_items
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

create policy "org_assistant_config" on assistant_configs
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

create policy "org_subscriptions" on subscriptions
  for all using (
    organization_id in (select organization_id from profiles where id = auth.uid())
  );

-- ─── Auto-update updated_at ───────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_organizations_updated_at before update on organizations
  for each row execute function update_updated_at();
create trigger update_entities_updated_at before update on entities
  for each row execute function update_updated_at();
create trigger update_leads_updated_at before update on leads
  for each row execute function update_updated_at();
create trigger update_conversations_updated_at before update on conversations
  for each row execute function update_updated_at();
