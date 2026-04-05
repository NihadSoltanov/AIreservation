-- Migration 002: Add columns needed by WhatsApp webhook

-- Add contact_phone to conversations
alter table conversations
  add column if not exists contact_phone text,
  add column if not exists contact_name  text;

-- Add organization_id and external_id to messages
alter table messages
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists external_id     text;

-- Add dedicated WhatsApp phone number ID to organizations
alter table organizations
  add column if not exists whatsapp_phone_number_id text;

-- Index for fast lookup by phone + channel + status  
create index if not exists idx_conversations_phone_channel
  on conversations (contact_phone, channel, status);

-- Index for org lookup by WhatsApp phone number ID
create index if not exists idx_organizations_wa_phone_number_id
  on organizations (whatsapp_phone_number_id);
