alter table public.store_settings
  add column if not exists home_sections jsonb not null default '[]'::jsonb,
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;