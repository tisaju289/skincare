ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS announcement_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS announcement_link text,
  ADD COLUMN IF NOT EXISTS announcement_bg text NOT NULL DEFAULT '#e6007e',
  ADD COLUMN IF NOT EXISTS announcement_text_color text NOT NULL DEFAULT '#ffffff';