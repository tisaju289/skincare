-- =====================================================================
-- STORE BOOTSTRAP — run this ONCE on a brand new Supabase project
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Creates: all tables, enums, functions, RLS policies, media storage
-- bucket + policies, and default store settings.
-- =====================================================================

-- ---------- 20260725051024_494ea058-825d-46f5-9bdd-41c3ff63f039.sql ----------

-- =========================================
-- ROLES (admin-only login system)
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Reusable updated_at trigger
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- PROFILES (admin user profiles)
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- CATEGORIES
-- =========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT,
  image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- BRANDS
-- =========================================
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view brands" ON public.brands
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage brands" ON public.brands
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- PRODUCTS
-- =========================================
CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'out_of_stock', 'low_stock');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price NUMERIC(10,2),
  tag TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  image TEXT,
  description TEXT,
  color TEXT,
  stock INT NOT NULL DEFAULT 0,
  status product_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT TO anon, authenticated USING (status <> 'draft');
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- PRODUCT IMAGES
-- =========================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view product images" ON public.product_images
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- CUSTOMERS
-- =========================================
CREATE TYPE public.customer_tier AS ENUM ('vip', 'regular', 'new');

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  tier customer_tier NOT NULL DEFAULT 'new',
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- ORDERS
-- =========================================
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('bkash', 'nagad', 'card', 'cod');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL DEFAULT 'cod',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- PROMOTIONS
-- =========================================
CREATE TYPE public.promo_type AS ENUM ('percentage', 'fixed', 'shipping');
CREATE TYPE public.promo_status AS ENUM ('active', 'scheduled', 'expired', 'disabled');

CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type promo_type NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  usage_count INT NOT NULL DEFAULT 0,
  usage_limit INT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status promo_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage promotions" ON public.promotions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_promotions_updated BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- REVIEWS
-- =========================================
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  status review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- STORE SETTINGS (single row)
-- =========================================
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Shajgoj',
  support_email TEXT,
  phone TEXT,
  business_address TEXT,
  currency TEXT NOT NULL DEFAULT 'BDT',
  timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON public.store_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_store_settings_updated BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.store_settings (store_name, support_email, phone, business_address)
VALUES ('Shajgoj', 'support@shajgoj.com', '+880 1700 000 000', 'House 42, Road 11, Banani, Dhaka 1213');


-- ---------- 20260725051116_27995f54-f66d-42c7-8303-e7a55574c264.sql ----------

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;


-- ---------- 20260726035054_cfa1b1e0-09a6-40b1-87dd-a3a36447daec.sql ----------
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

-- ---------- 20260726042458_005a0a81-7eaa-41a7-a230-ef5a1bb3422e.sql ----------
CREATE OR REPLACE FUNCTION public.place_order(p_name text, p_email text, p_phone text, p_address text, p_items jsonb, p_payment_method payment_method DEFAULT 'cod'::payment_method, p_promo_code text DEFAULT NULL::text, p_notes text DEFAULT NULL::text)
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
      tier = (case when total_spent + v_subtotal >= 25000 then 'vip'
                   when orders_count + 1 >= 2 then 'regular'
                   else 'new' end)::customer_tier
  where id = v_customer_id;

  return v_order_number;
end;
$function$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, payment_method, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, payment_method, text, text) TO anon, authenticated, service_role;

-- ---------- 20260727050426_4edeb447-6624-44fa-9b2e-bebc03b62e22.sql ----------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS og_image_url text,
  ADD COLUMN IF NOT EXISTS announcement_text text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text,
  ADD COLUMN IF NOT EXISTS theme_pink text NOT NULL DEFAULT '#e6007e',
  ADD COLUMN IF NOT EXISTS theme_magenta text NOT NULL DEFAULT '#c2185b',
  ADD COLUMN IF NOT EXISTS theme_purple text NOT NULL DEFAULT '#7b3fa0',
  ADD COLUMN IF NOT EXISTS theme_teal text NOT NULL DEFAULT '#00897b',
  ADD COLUMN IF NOT EXISTS theme_green text NOT NULL DEFAULT '#43a047',
  ADD COLUMN IF NOT EXISTS pay_bkash boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pay_nagad boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pay_card boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pay_cod boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_flat_rate numeric NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric NOT NULL DEFAULT 999,
  ADD COLUMN IF NOT EXISTS delivery_partner text,
  ADD COLUMN IF NOT EXISTS notify_order_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_order_sms boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_low_stock_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10;

INSERT INTO public.store_settings (store_name)
SELECT 'Shajgoj'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.store_settings TO anon;
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings
FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.place_order(p_name text, p_email text, p_phone text, p_address text, p_items jsonb, p_payment_method payment_method DEFAULT 'cod'::payment_method, p_promo_code text DEFAULT NULL::text, p_notes text DEFAULT NULL::text)
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
  v_qty int;
  v_promo public.promotions%rowtype;
  v_settings public.store_settings%rowtype;
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
    if v_product.stock < v_qty then raise exception 'Not enough stock for %', v_product.name; end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  v_shipping := case
    when v_subtotal >= coalesce(v_settings.free_shipping_threshold, 999) then 0
    else coalesce(v_settings.shipping_flat_rate, 60) end;

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

-- ---------- 20260727051450_33b1d784-998f-4378-966c-b4ad67370afd.sql ----------
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- ---------- 20260727051710_b4d0b3e0-dffc-41e4-91bf-86f910295417.sql ----------
CREATE POLICY "Public can read media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

-- ---------- 20260727052104_8bee392f-37c3-4652-815c-2f503d056582.sql ----------
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);

-- ---------- 20260727062213_1f718a45-1253-415d-b78b-88c9fd48b537.sql ----------
alter table public.store_settings
  add column if not exists home_sections jsonb not null default '[]'::jsonb,
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;

-- ---------- 20260727063207_c6b0bc9b-47c9-4eda-9d6d-d6241174d817.sql ----------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flash_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new_arrival boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS products_flags_idx ON public.products (is_trending, is_best_seller, is_flash_sale, is_new_arrival);

-- ---------- 20260727065839_8f91a357-34e6-4e81-b2a3-e49e0110aa92.sql ----------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS shipping_inside_dhaka numeric NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS shipping_outside_dhaka numeric NOT NULL DEFAULT 120;

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
    if v_product.stock < v_qty then raise exception 'Not enough stock for %', v_product.name; end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  v_shipping := case
    when v_subtotal >= coalesce(v_settings.free_shipping_threshold, 999) then 0
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

-- ---------- 20260727070417_4e39deec-4fd7-4438-b1c0-85f8b6057f56.sql ----------
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
    if v_product.stock < v_qty then raise exception 'Not enough stock for %', v_product.name; end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
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

-- ---------- 20260727071339_ac27f617-ea4a-4862-a8c4-094fa7415e45.sql ----------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description text;

-- ---------- 20260727071934_46940db3-547d-4dd8-a3ef-df55b910ae6d.sql ----------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS product_badges jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ---------- 20260727072444_0ade9e19-57b7-4cc4-9d43-93f297b072db.sql ----------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS header_menus jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ---------- 20260728031850_9b33eb08-fabc-48b3-b934-f7a0ec472e2b.sql ----------
alter table public.store_settings
  add column if not exists footer_about text,
  add column if not exists footer_copyright text,
  add column if not exists footer_columns jsonb,
  add column if not exists newsletter_enabled boolean not null default true,
  add column if not exists newsletter_title text,
  add column if not exists newsletter_subtitle text,
  add column if not exists newsletter_button text;

-- ---------- 20260729154936_5d5a9707-d01b-44bc-af41-3403cd9b1df7.sql ----------
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.sync_product_status() FROM anon, authenticated, public;

DROP FUNCTION IF EXISTS public.place_order(text, text, text, text, jsonb, payment_method, text, text);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ---------- 20260729162615_9c4c9df4-ea7b-492d-be2c-6d08de71e739.sql ----------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS announcement_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS announcement_link text,
  ADD COLUMN IF NOT EXISTS announcement_bg text NOT NULL DEFAULT '#e6007e',
  ADD COLUMN IF NOT EXISTS announcement_text_color text NOT NULL DEFAULT '#ffffff';

-- ---------- 20260731161517_48a8f7e7-1915-40a0-bebc-3bfc7be65a25.sql ----------
-- Lock down internal SECURITY DEFINER helpers from the exposed API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Public storefront RPCs: only the intended roles, never blanket PUBLIC
REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, public.payment_method, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, public.payment_method, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_review(text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_review(text, text, integer, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text) TO anon, authenticated;

-- ---------- 20260803062837_d3482620-090e-4c51-aad6-7400909bffb3.sql ----------
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


-- =====================================================================
-- STORAGE BUCKET (media) — created here because a fresh project has none
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('media', 'media', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

-- =====================================================================
-- AFTER RUNNING THIS FILE
-- 1) Open your site at /auth and create an account (email + password).
--    (Supabase -> Authentication -> Providers -> keep Email enabled,
--     and turn OFF "Confirm email" for instant access.)
-- 2) Come back here and run the line below with YOUR email to become admin:
--
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
--
-- 3) Log in at /admin and start adding products.
-- =====================================================================
