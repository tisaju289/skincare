alter table public.store_settings
  add column if not exists footer_about text,
  add column if not exists footer_copyright text,
  add column if not exists footer_columns jsonb,
  add column if not exists newsletter_enabled boolean not null default true,
  add column if not exists newsletter_title text,
  add column if not exists newsletter_subtitle text,
  add column if not exists newsletter_button text;