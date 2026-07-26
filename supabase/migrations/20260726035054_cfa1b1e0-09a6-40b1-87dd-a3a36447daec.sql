-- ============ SEED CATEGORIES ============
insert into public.categories (slug, name, color, image, sort_order) values
('makeup','Makeup','from-pink-400 to-rose-500','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',1),
('skin','Skin','from-fuchsia-400 to-pink-500','https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',2),
('hair','Hair','from-purple-400 to-fuchsia-500','https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=600&q=80',3),
('personal-care','Personal care','from-rose-400 to-pink-500','https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80',4),
('mom-baby','Mom & Baby','from-pink-300 to-rose-400','https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',5),
('fragrance','Fragrance','from-violet-400 to-purple-500','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',6)
on conflict do nothing;

-- ============ SEED BRANDS ============
insert into public.brands (slug, name) values
('lakme','Lakme'),('maybelline','Maybelline'),('loreal','L''Oreal'),('ponds','Ponds'),
('nivea','Nivea'),('garnier','Garnier'),('the-ordinary','The Ordinary'),('ombre','Ombre'),
('vaseline','Vaseline'),('dove','Dove'),('sunsilk','Sunsilk'),('senora','Senora')
on conflict do nothing;

-- ============ SEED PRODUCTS ============
insert into public.products (slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status)
select v.slug, v.name,
       (select id from public.brands b where b.slug = v.brand_slug),
       (select id from public.categories c where c.slug = v.cat_slug),
       v.price, v.old_price, v.tag, v.rating, v.reviews_count, v.image, v.description, v.color, v.stock, v.status::product_status
from (values
('lakme-absolute-skin-gloss-foundation','Lakme Absolute Skin Gloss Foundation','lakme','makeup',1650,1950,'-15%',4.6,320,'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=600&q=80','A luminous liquid foundation for a natural glow finish with buildable coverage.','bg-rose-50',48,'active'),
('ponds-bright-beauty-serum-cream','Ponds Bright Beauty Serum Cream 50g','ponds','skin',545,620,'-12%',4.4,189,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80','Hydrating brightening cream infused with 30x vitamins for radiant skin.','bg-pink-50',120,'active'),
('maybelline-fit-me-matte-foundation','Maybelline Fit Me Matte + Poreless Foundation','maybelline','makeup',1290,1490,'-13%',4.7,512,'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=600&q=80','Natural matte finish that refines pores for normal-to-oily skin.','bg-amber-50',75,'active'),
('the-ordinary-niacinamide-serum','The Ordinary Niacinamide 10% + Zinc 1%','the-ordinary','skin',990,1200,'-17%',4.8,890,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80','High-strength vitamin & mineral blemish formula to balance sebum.','bg-emerald-50',8,'low_stock'),
('loreal-revitalift-hyaluronic-serum','L''Oreal Paris Revitalift Hyaluronic Acid Serum','loreal','skin',1890,2200,'-14%',4.5,245,'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80','1.5% pure hyaluronic acid serum that plumps and hydrates for youthful skin.','bg-fuchsia-50',34,'active'),
('nivea-soft-light-moisturizer','Nivea Soft Light Moisturizer 100ml','nivea','skin',420,490,'-14%',4.3,156,'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80','Light, fresh moisturizer with jojoba oil and vitamin E.','bg-sky-50',200,'active'),
('garnier-micellar-water-pink','Garnier Micellar Cleansing Water Pink','garnier','skin',720,850,'-15%',4.6,402,'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80','All-in-one cleanser that removes makeup, cleanses & soothes.','bg-rose-50',60,'active'),
('lakme-9to5-matte-lipstick','Lakme 9 to 5 Primer + Matte Lipstick','lakme','makeup',640,750,'-14%',4.5,278,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80','Rich matte finish with a built-in primer for long-lasting color.','bg-pink-50',95,'active'),
('ombre-iris-flare-perfume','Ombre Perfume for Her — Iris Flare 100ml','ombre','fragrance',850,1050,'-19%',4.4,98,'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80','Floral iris eau de parfum with warm musk base notes.','bg-amber-50',0,'out_of_stock'),
('senora-feather-light-pads','Senora Feather Light 08 Pads','senora','personal-care',149,199,'-25%',4.7,634,'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80','Ultra-thin sanitary pads with feather-light comfort.','bg-violet-50',300,'active'),
('dove-intense-repair-shampoo','Dove Intense Repair Shampoo 340ml','dove','hair',480,550,'-13%',4.5,221,'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80','Nourishing shampoo that repairs damaged hair from within.','bg-sky-50',82,'active'),
('sunsilk-black-shine-conditioner','Sunsilk Black Shine Conditioner 320ml','sunsilk','hair',390,450,'-13%',4.3,145,'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=600&q=80','Amla-infused conditioner for deep black shine.','bg-purple-50',110,'active'),
('vaseline-healthy-bright-lotion','Vaseline Healthy Bright Body Lotion 400ml','vaseline','personal-care',690,820,'-16%',4.6,377,'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80','Triple sunscreen body lotion for even-toned, glowing skin.','bg-amber-50',54,'active'),
('johnsons-baby-shampoo','Johnson''s Baby Shampoo 200ml','dove','mom-baby',350,410,'-15%',4.8,512,'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80','No more tears formula, gentle enough for everyday use on babies.','bg-pink-50',140,'active')
) as v(slug,name,brand_slug,cat_slug,price,old_price,tag,rating,reviews_count,image,description,color,stock,status)
on conflict do nothing;

-- gallery images
insert into public.product_images (product_id, url, sort_order)
select p.id, p.image, 0 from public.products p
union all
select p.id, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1 from public.products p
union all
select p.id, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2 from public.products p;

-- ============ SEED PROMOTIONS ============
insert into public.promotions (code, description, type, value, usage_count, usage_limit, starts_at, ends_at, status) values
('SHAJGOJ10','10% off your first order','percentage',10,42,1000, now() - interval '10 days', now() + interval '60 days','active'),
('FLAT100','৳100 off orders over ৳1000','fixed',100,113,null, now() - interval '30 days', now() + interval '30 days','active'),
('FREESHIP','Free delivery, any order','shipping',0,208,null, now() - interval '5 days', now() + interval '90 days','active'),
('EIDSALE25','25% Eid mega sale','percentage',25,0,500, now() + interval '20 days', now() + interval '35 days','scheduled')
on conflict do nothing;

-- ============ SEED CUSTOMERS ============
insert into public.customers (name, email, phone, tier, total_spent, orders_count, address) values
('Nusrat Jahan','nusrat@example.com','+8801711000001','vip',48250,14,'House 12, Road 5, Dhanmondi, Dhaka'),
('Tanvir Ahmed','tanvir@example.com','+8801711000002','regular',12400,5,'Flat 3B, Bashundhara R/A, Dhaka'),
('Sadia Islam','sadia@example.com','+8801711000003','new',1650,1,'Zindabazar, Sylhet'),
('Rifat Hossain','rifat@example.com','+8801711000004','regular',8900,4,'Agrabad, Chattogram'),
('Mim Akter','mim@example.com','+8801711000005','vip',36700,11,'Uttara Sector 7, Dhaka')
on conflict do nothing;

-- ============ SEED ORDERS ============
with c as (select id, name, address, row_number() over (order by name) rn from public.customers),
ins as (
  insert into public.orders (order_number, customer_id, status, payment_method, subtotal, shipping, discount, total, shipping_address, created_at)
  select 'SHJ-' || to_char(now() - (v.days || ' days')::interval, 'YYMMDD') || '-' || lpad(v.n::text, 4, '0'),
         (select id from c where c.rn = v.crn), v.status::order_status, v.pm::payment_method,
         v.subtotal, v.shipping, v.discount, v.subtotal + v.shipping - v.discount,
         (select address from c where c.rn = v.crn), now() - (v.days || ' days')::interval
  from (values
    (1,1,'delivered','bkash',3240,0,324,1),
    (2,2,'shipped','cod',1290,60,0,3),
    (3,3,'processing','nagad',1650,60,0,5),
    (4,4,'pending','card',2410,0,100,7),
    (5,5,'delivered','bkash',5880,0,588,12),
    (6,1,'cancelled','cod',990,60,0,18),
    (7,5,'delivered','bkash',1470,0,0,25)
  ) as v(n,crn,status,pm,subtotal,shipping,discount,days)
  returning id, order_number
)
insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
select i.id, p.id, p.name, 1 + (row_number() over (partition by i.id order by p.name))::int % 2, p.price
from ins i
cross join lateral (
  select * from public.products order by md5(id::text || i.order_number) limit 2
) p;

-- ============ SEED REVIEWS ============
insert into public.reviews (product_id, user_name, rating, comment, status)
select p.id, v.user_name, v.rating, v.comment, v.status::review_status
from public.products p
join lateral (values
  ('Nusrat J.',5,'Absolutely loved it, authentic product and fast delivery!','approved'),
  ('Tanvir A.',4,'Good quality for the price. Packaging could be better.','approved'),
  ('Sadia I.',3,'It is okay, did not work as well for my skin type.','pending')
) as v(user_name,rating,comment,status) on true;

-- ============ AUTO STOCK STATUS ============
create or replace function public.sync_product_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status <> 'draft' then
    if new.stock <= 0 then new.status := 'out_of_stock';
    elsif new.stock <= 10 then new.status := 'low_stock';
    else new.status := 'active';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_product_status() from public, anon, authenticated;

drop trigger if exists trg_sync_product_status on public.products;
create trigger trg_sync_product_status
before insert or update of stock on public.products
for each row execute function public.sync_product_status();

-- updated_at triggers (idempotent)
do $$
declare t text;
begin
  foreach t in array array['categories','brands','products','customers','orders','promotions','reviews','store_settings','profiles'] loop
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format('create trigger trg_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;

-- ============ PUBLIC CHECKOUT ============
create or replace function public.place_order(
  p_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_items jsonb,
  p_payment_method payment_method default 'cod',
  p_promo_code text default null,
  p_notes text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_discount numeric := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_promo public.promotions%rowtype;
begin
  if p_name is null or length(trim(p_name)) < 2 then raise exception 'Name is required'; end if;
  if p_phone is null or length(trim(p_phone)) < 6 then raise exception 'Phone is required'; end if;
  if p_address is null or length(trim(p_address)) < 5 then raise exception 'Address is required'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items'; end if;

  select * into v_customer_id from (
    select id from public.customers
    where (p_email is not null and lower(email) = lower(p_email)) or phone = p_phone
    limit 1
  ) s;

  if v_customer_id is null then
    insert into public.customers (name, email, phone, address, tier)
    values (trim(p_name), nullif(trim(p_email), ''), trim(p_phone), trim(p_address), 'new')
    returning id into v_customer_id;
  end if;

  v_order_number := 'SHJ-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 9999) + 1)::int::text, 4, '0');

  insert into public.orders (order_number, customer_id, status, payment_method, shipping_address, notes)
  values (v_order_number, v_customer_id, 'pending', coalesce(p_payment_method, 'cod'), trim(p_address), p_notes)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(20, coalesce((v_item->>'quantity')::int, 1)));
    select * into v_product from public.products where slug = v_item->>'slug' and status <> 'draft';
    if not found then raise exception 'Product not available: %', v_item->>'slug'; end if;
    if v_product.stock < v_qty then raise exception 'Not enough stock for %', v_product.name; end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  v_shipping := case when v_subtotal >= 999 then 0 else 60 end;

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
      tier = case when total_spent + v_subtotal >= 25000 then 'vip'
                  when orders_count + 1 >= 2 then 'regular' else 'new' end
  where id = v_customer_id;

  return v_order_number;
end;
$$;

revoke all on function public.place_order(text,text,text,text,jsonb,payment_method,text,text) from public;
grant execute on function public.place_order(text,text,text,text,jsonb,payment_method,text,text) to anon, authenticated;

-- ============ PUBLIC REVIEW SUBMISSION ============
create or replace function public.submit_review(p_product_slug text, p_user_name text, p_rating int, p_comment text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_product_id uuid;
begin
  if p_rating < 1 or p_rating > 5 then raise exception 'Rating must be 1-5'; end if;
  if p_user_name is null or length(trim(p_user_name)) < 2 then raise exception 'Name is required'; end if;
  select id into v_product_id from public.products where slug = p_product_slug and status <> 'draft';
  if v_product_id is null then raise exception 'Product not found'; end if;
  insert into public.reviews (product_id, user_name, rating, comment, status)
  values (v_product_id, trim(p_user_name), p_rating, nullif(trim(coalesce(p_comment,'')), ''), 'pending');
end;
$$;

revoke all on function public.submit_review(text,text,int,text) from public;
grant execute on function public.submit_review(text,text,int,text) to anon, authenticated;

-- ============ NEWSLETTER ============
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Admins manage subscribers" on public.newsletter_subscribers;
create policy "Admins manage subscribers" on public.newsletter_subscribers
  for all to authenticated
  using (has_role(auth.uid(), 'admin')) with check (has_role(auth.uid(), 'admin'));

create or replace function public.subscribe_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Invalid email'; end if;
  insert into public.newsletter_subscribers (email) values (lower(trim(p_email)))
  on conflict (email) do nothing;
end;
$$;
revoke all on function public.subscribe_newsletter(text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;

-- store settings default row
insert into public.store_settings (store_name, support_email, phone, business_address)
select 'Shajgoj', 'support@shajgoj.com', '+8809610000000', 'Gulshan Avenue, Dhaka 1212, Bangladesh'
where not exists (select 1 from public.store_settings);