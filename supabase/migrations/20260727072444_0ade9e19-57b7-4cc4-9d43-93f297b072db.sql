ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS header_menus jsonb NOT NULL DEFAULT '[]'::jsonb;