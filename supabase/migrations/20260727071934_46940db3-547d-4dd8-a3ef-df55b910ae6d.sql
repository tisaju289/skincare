ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS product_badges jsonb NOT NULL DEFAULT '[]'::jsonb;