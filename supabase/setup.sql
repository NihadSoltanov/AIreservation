-- AutoReserv: One-time setup SQL
-- Paste this entire block in Supabase SQL Editor and click "Run"
-- URL: https://supabase.com/dashboard/project/rcxfipevoomyfpkxblqn/sql/new

-- ── Migration 002: WhatsApp webhook columns ──────────────────────────────

alter table conversations
  add column if not exists contact_phone text,
  add column if not exists contact_name  text;

alter table messages
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists external_id     text;

alter table organizations
  add column if not exists whatsapp_phone_number_id text;

create index if not exists idx_conversations_phone_channel
  on conversations (contact_phone, channel, status);

create index if not exists idx_organizations_wa_phone_number_id
  on organizations (whatsapp_phone_number_id);

-- ── Seed test organization ──────────────────────────────────────────────
-- Creates a default org for testing WhatsApp without needing to sign up

insert into organizations (
  name,
  slug,
  vertical,
  whatsapp_number,
  whatsapp_phone_number_id,
  plan,
  plan_status,
  config
)
values (
  'AutoReserv Test',
  'autoreserv-test',
  'hospitality',
  '+994504258988',
  '1050059124863181',
  'pro',
  'active',
  '{}'
)
on conflict (slug) do update
  set whatsapp_phone_number_id = excluded.whatsapp_phone_number_id;

-- ── Seed default assistant config ────────────────────────────────────────

insert into assistant_configs (
  organization_id,
  name,
  tone,
  language,
  welcome_message,
  system_prompt,
  handoff_enabled
)
select
  id,
  'AutoReserv Assistant',
  'professional',
  'en',
  'Hello! How can I help you today?',
  'You are a helpful AI assistant for AutoReserv, a smart reservation and booking management system. Help customers with reservations, availability inquiries, and general questions. Be concise and friendly.',
  true
from organizations
where slug = 'autoreserv-test'
on conflict (organization_id) do nothing;

-- Verify setup
select 
  o.name,
  o.whatsapp_phone_number_id,
  a.name as assistant_name
from organizations o
left join assistant_configs a on a.organization_id = o.id
where o.slug = 'autoreserv-test';
