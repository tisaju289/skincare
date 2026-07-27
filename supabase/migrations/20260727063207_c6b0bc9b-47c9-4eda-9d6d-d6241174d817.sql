ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flash_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new_arrival boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS products_flags_idx ON public.products (is_trending, is_best_seller, is_flash_sale, is_new_arrival);