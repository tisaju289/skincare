-- 1. Product variants
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Shade',
  value text NOT NULL,
  price numeric,
  stock integer NOT NULL DEFAULT 0,
  sku text,
  image text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_variants_product_id_idx ON public.product_variants(product_id);

GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product variants" ON public.product_variants
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage product variants" ON public.product_variants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. WhatsApp settings
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS whatsapp_label text;

-- 3. place_order: support variants
CREATE OR REPLACE FUNCTION public.place_order(p_name text, p_email text, p_phone text, p_address text, p_items jsonb, p_payment_method payment_method DEFAULT 'cod'::payment_method, p_promo_code text DEFAULT NULL::text, p_notes text DEFAULT NULL::text, p_delivery_zone text DEFAULT 'inside'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_discount numeric := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_variant_id uuid;
  v_line_price numeric;
  v_line_name text;
  v_qty int;
  v_promo public.promotions%rowtype;
  v_settings public.store_settings%rowtype;
  v_zone text := lower(coalesce(nullif(trim(p_delivery_zone), ''), 'inside'));
begin
  if p_name is null or length(trim(p_name)) < 2 then raise exception 'Name is required'; end if;
  if p_phone is null or length(trim(p_phone)) < 6 then raise exception 'Phone is required'; end if;
  if p_address is null or length(trim(p_address)) < 5 then raise exception 'Address is required'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items'; end if;

  select * into v_settings from public.store_settings limit 1;

  if v_settings.id is not null then
    if (p_payment_method = 'bkash' and not v_settings.pay_bkash)
       or (p_payment_method = 'nagad' and not v_settings.pay_nagad)
       or (p_payment_method = 'card' and not v_settings.pay_card)
       or (p_payment_method = 'cod' and not v_settings.pay_cod) then
      raise exception 'Payment method not available';
    end if;
  end if;

  select * into v_customer_id from (
    select id from public.customers
    where (nullif(trim(coalesce(p_email,'')),'') is not null and lower(email) = lower(trim(p_email))) or phone = trim(p_phone)
    limit 1
  ) s;

  if v_customer_id is null then
    insert into public.customers (name, email, phone, address, tier)
    values (trim(p_name), nullif(trim(coalesce(p_email,'')), ''), trim(p_phone), trim(p_address), 'new'::customer_tier)
    returning id into v_customer_id;
  end if;

  v_order_number := 'SHJ-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 9999) + 1)::int::text, 4, '0');

  insert into public.orders (order_number, customer_id, status, payment_method, shipping_address, notes)
  values (v_order_number, v_customer_id, 'pending', coalesce(p_payment_method, 'cod'::payment_method), trim(p_address), nullif(trim(coalesce(p_notes,'')),''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(20, coalesce((v_item->>'quantity')::int, 1)));
    select * into v_product from public.products where slug = v_item->>'slug' and status <> 'draft';
    if not found then raise exception 'Product not available: %', v_item->>'slug'; end if;

    v_variant_id := nullif(v_item->>'variantId', '')::uuid;
    v_line_price := v_product.price;
    v_line_name := v_product.name;

    if v_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_variant_id and product_id = v_product.id;
      if not found then raise exception 'Option not available for %', v_product.name; end if;
      if v_variant.stock < v_qty then raise exception 'Not enough stock for % (%)', v_product.name, v_variant.value; end if;
      v_line_price := coalesce(v_variant.price, v_product.price);
      v_line_name := v_product.name || ' — ' || v_variant.value;
      update public.product_variants set stock = stock - v_qty where id = v_variant.id;
    else
      if v_product.stock < v_qty then raise exception 'Not enough stock for %', v_product.name; end if;
    end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.id, v_line_name, v_qty, v_line_price);

    update public.products set stock = greatest(0, stock - v_qty) where id = v_product.id;
    v_subtotal := v_subtotal + (v_line_price * v_qty);
  end loop;

  v_shipping := case
    when v_zone = 'outside' then coalesce(v_settings.shipping_outside_dhaka, 120)
    else coalesce(v_settings.shipping_inside_dhaka, 60) end;

  if p_promo_code is not null and length(trim(p_promo_code)) > 0 then
    select * into v_promo from public.promotions
    where upper(code) = upper(trim(p_promo_code))
      and status = 'active'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (usage_limit is null or usage_count < usage_limit);
    if found then
      if v_promo.type = 'percentage' then v_discount := round(v_subtotal * v_promo.value / 100, 2);
      elsif v_promo.type = 'fixed' then v_discount := least(v_promo.value, v_subtotal);
      else v_shipping := 0;
      end if;
      update public.promotions set usage_count = usage_count + 1 where id = v_promo.id;
    end if;
  end if;

  update public.orders
  set subtotal = v_subtotal, shipping = v_shipping, discount = v_discount,
      total = v_subtotal + v_shipping - v_discount
  where id = v_order_id;

  update public.customers
  set orders_count = orders_count + 1,
      total_spent = total_spent + (v_subtotal + v_shipping - v_discount),
      address = coalesce(nullif(trim(p_address), ''), address),
      tier = (case when total_spent + v_subtotal >= 25000 then 'vip'
                   when orders_count + 1 >= 2 then 'regular'
                   else 'new' end)::customer_tier
  where id = v_customer_id;

  return v_order_number;
end;
$function$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, payment_method, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, payment_method, text, text, text) TO anon, authenticated;