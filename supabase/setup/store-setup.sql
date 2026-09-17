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

-- Auto-create profile on signup; first ever account becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_admin boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO v_has_admin;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN v_has_admin THEN 'user' ELSE 'admin' END::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

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


======================================================================
-- DEMO CATALOG DATA — 6 categories, 12 brands, 14 products with
-- images, reviews and promo codes so the store is ready to sell
-- right after import. Safe to re-run (ON CONFLICT DO NOTHING).
======================================================================

-- Brands

INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('7d01b3df-7905-4630-a343-9ab519b090b8', 'ponds', 'Ponds', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('5dfaee66-c55a-4a0e-88b7-4be526aae882', 'the-ordinary', 'The Ordinary', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('b0e71b15-e85f-4e95-83c9-315036cb4bd9', 'ombre', 'Ombre', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('97334730-8436-465f-b9c1-2de21ed5c273', 'vaseline', 'Vaseline', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('33f7f181-95e1-4cd4-b4f0-e8b8760f5390', 'sunsilk', 'Sunsilk', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('360b6de2-0ddc-48e8-ac17-7f0123aec77d', 'senora', 'Senora', NULL, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('39344760-c162-4959-8c17-34ee28772660', 'dove', 'Dove', '/api/public/media/brands/1789479657924-is6c70.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 13:40:59.751429+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('fd893090-fbba-45b3-9336-79468c9b7825', 'garnier', 'Garnier', '/api/public/media/brands/1789483769044-v2kye2.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 14:49:30.622339+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('bf8b4802-4d5f-4d2e-8efa-a4fbc420a7f3', 'loreal', 'L''Oreal', '/api/public/media/brands/1789483818013-w9j9ag.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 14:50:19.570917+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('8c0aef0a-d531-4bfc-bc94-28c644c0e9eb', 'maybelline', 'Maybelline', '/api/public/media/brands/1789483900556-hweear.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 14:51:49.895779+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('6607797a-1b50-4717-9ba7-b851c138fdf5', 'lakme', 'Lakme', '/api/public/media/brands/1789483915996-2fl9fw.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 14:51:57.544909+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.brands (id, slug, name, logo, created_at, updated_at) VALUES ('eced554a-3dff-4e41-9463-fe3bc5ba1e97', 'nivea', 'Nivea', '/api/public/media/brands/1789483938565-w6jq8m.webp', '2026-09-15 12:47:44.298291+00', '2026-09-15 14:52:21.029331+00') ON CONFLICT (id) DO NOTHING;

-- Categories

INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('da96af1c-fe0e-49dd-8df4-0e4fba239620', 'makeup', 'Makeup', 'from-pink-400 to-rose-500', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('752efa82-37e9-4917-aaa7-0551e83cab34', 'skin', 'Skin', 'from-fuchsia-400 to-pink-500', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('c713c9b0-ba1a-4577-80f7-841676319c4f', 'hair', 'Hair', 'from-purple-400 to-fuchsia-500', 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=600&q=80', 3, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('f3b7adde-0e05-4b8c-a425-f8de2d16a9db', 'personal-care', 'Personal care', 'from-rose-400 to-pink-500', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80', 4, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('02294c4b-3d9c-4eb0-b028-ebe4a977da70', 'mom-baby', 'Mom & Baby', 'from-pink-300 to-rose-400', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', 5, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, slug, name, color, image, sort_order, created_at, updated_at, parent_id) VALUES ('ea83c6f0-f76c-4502-9efb-97fc65cddbd7', 'fragrance', 'Fragrance', 'from-violet-400 to-purple-500', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', 6, '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', NULL) ON CONFLICT (id) DO NOTHING;

-- Products

INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'lakme-absolute-skin-gloss-foundation', 'Lakme Absolute Skin Gloss Foundation', '6607797a-1b50-4717-9ba7-b851c138fdf5', 'da96af1c-fe0e-49dd-8df4-0e4fba239620', 1650.00, 1950.00, '-15%', 4.6, 320, 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=600&q=80', 'A luminous liquid foundation for a natural glow finish with buildable coverage.', 'bg-rose-50', 48, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('2d4c3b28-db0e-4410-b349-177c06c49e64', 'ponds-bright-beauty-serum-cream', 'Ponds Bright Beauty Serum Cream 50g', '7d01b3df-7905-4630-a343-9ab519b090b8', '752efa82-37e9-4917-aaa7-0551e83cab34', 545.00, 620.00, '-12%', 4.4, 189, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80', 'Hydrating brightening cream infused with 30x vitamins for radiant skin.', 'bg-pink-50', 120, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'maybelline-fit-me-matte-foundation', 'Maybelline Fit Me Matte + Poreless Foundation', '8c0aef0a-d531-4bfc-bc94-28c644c0e9eb', 'da96af1c-fe0e-49dd-8df4-0e4fba239620', 1290.00, 1490.00, '-13%', 4.7, 512, 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=600&q=80', 'Natural matte finish that refines pores for normal-to-oily skin.', 'bg-amber-50', 75, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('ae03ec59-a225-4a9f-9639-fab37713bd79', 'the-ordinary-niacinamide-serum', 'The Ordinary Niacinamide 10% + Zinc 1%', '5dfaee66-c55a-4a0e-88b7-4be526aae882', '752efa82-37e9-4917-aaa7-0551e83cab34', 990.00, 1200.00, '-17%', 4.8, 890, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80', 'High-strength vitamin & mineral blemish formula to balance sebum.', 'bg-emerald-50', 8, 'low_stock', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('125fc932-65f0-433b-8a7e-002731794d8c', 'loreal-revitalift-hyaluronic-serum', 'L''Oreal Paris Revitalift Hyaluronic Acid Serum', 'bf8b4802-4d5f-4d2e-8efa-a4fbc420a7f3', '752efa82-37e9-4917-aaa7-0551e83cab34', 1890.00, 2200.00, '-14%', 4.5, 245, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', '1.5% pure hyaluronic acid serum that plumps and hydrates for youthful skin.', 'bg-fuchsia-50', 34, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('cef28d53-60e4-4c48-a374-d14a75d0fb01', 'nivea-soft-light-moisturizer', 'Nivea Soft Light Moisturizer 100ml', 'eced554a-3dff-4e41-9463-fe3bc5ba1e97', '752efa82-37e9-4917-aaa7-0551e83cab34', 420.00, 490.00, '-14%', 4.3, 156, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', 'Light, fresh moisturizer with jojoba oil and vitamin E.', 'bg-sky-50', 200, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('ba2a248e-a4d9-4175-9048-d241dc5def6e', 'garnier-micellar-water-pink', 'Garnier Micellar Cleansing Water Pink', 'fd893090-fbba-45b3-9336-79468c9b7825', '752efa82-37e9-4917-aaa7-0551e83cab34', 720.00, 850.00, '-15%', 4.6, 402, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80', 'All-in-one cleanser that removes makeup, cleanses & soothes.', 'bg-rose-50', 60, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'lakme-9to5-matte-lipstick', 'Lakme 9 to 5 Primer + Matte Lipstick', '6607797a-1b50-4717-9ba7-b851c138fdf5', 'da96af1c-fe0e-49dd-8df4-0e4fba239620', 640.00, 750.00, '-14%', 4.5, 278, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80', 'Rich matte finish with a built-in primer for long-lasting color.', 'bg-pink-50', 95, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('83117613-7bf7-44c1-92da-65f2ec06ae1b', 'ombre-iris-flare-perfume', 'Ombre Perfume for Her — Iris Flare 100ml', 'b0e71b15-e85f-4e95-83c9-315036cb4bd9', 'ea83c6f0-f76c-4502-9efb-97fc65cddbd7', 850.00, 1050.00, '-19%', 4.4, 98, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80', 'Floral iris eau de parfum with warm musk base notes.', 'bg-amber-50', 0, 'out_of_stock', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('490d5763-5768-4fb4-a66c-9b4791ce1080', 'senora-feather-light-pads', 'Senora Feather Light 08 Pads', '360b6de2-0ddc-48e8-ac17-7f0123aec77d', 'f3b7adde-0e05-4b8c-a425-f8de2d16a9db', 149.00, 199.00, '-25%', 4.7, 634, 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80', 'Ultra-thin sanitary pads with feather-light comfort.', 'bg-violet-50', 300, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'dove-intense-repair-shampoo', 'Dove Intense Repair Shampoo 340ml', '39344760-c162-4959-8c17-34ee28772660', 'c713c9b0-ba1a-4577-80f7-841676319c4f', 480.00, 550.00, '-13%', 4.5, 221, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'Nourishing shampoo that repairs damaged hair from within.', 'bg-sky-50', 82, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'sunsilk-black-shine-conditioner', 'Sunsilk Black Shine Conditioner 320ml', '33f7f181-95e1-4cd4-b4f0-e8b8760f5390', 'c713c9b0-ba1a-4577-80f7-841676319c4f', 390.00, 450.00, '-13%', 4.3, 145, 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=600&q=80', 'Amla-infused conditioner for deep black shine.', 'bg-purple-50', 110, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'vaseline-healthy-bright-lotion', 'Vaseline Healthy Bright Body Lotion 400ml', '97334730-8436-465f-b9c1-2de21ed5c273', 'f3b7adde-0e05-4b8c-a425-f8de2d16a9db', 690.00, 820.00, '-16%', 4.6, 377, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80', 'Triple sunscreen body lotion for even-toned, glowing skin.', 'bg-amber-50', 54, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, slug, name, brand_id, category_id, price, old_price, tag, rating, reviews_count, image, description, color, stock, status, created_at, updated_at, is_trending, is_best_seller, is_flash_sale, is_new_arrival, long_description) VALUES ('4165655c-8ebc-4d98-9ce3-5898966a98f9', 'johnsons-baby-shampoo', 'Johnson''s Baby Shampoo 200ml', '39344760-c162-4959-8c17-34ee28772660', '02294c4b-3d9c-4eb0-b028-ebe4a977da70', 350.00, 410.00, '-15%', 4.8, 512, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', 'No more tears formula, gentle enough for everyday use on babies.', 'bg-pink-50', 140, 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00', false, false, false, false, NULL) ON CONFLICT (id) DO NOTHING;

-- Product images

INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('ee43e289-c5c2-4a70-b6d9-3485aaadc6e0', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('bdeee5e3-e65e-4ee7-abe0-9ec6ef4891eb', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('511487a3-eb28-435b-a08c-d0a90e0745c5', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('a39c58b0-e8d7-4df9-a398-9433c1f49483', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('c0084121-3d38-4259-977d-98d131dbcd22', '125fc932-65f0-433b-8a7e-002731794d8c', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('45adbb85-b358-428d-bc88-1be3342af76b', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('ba9c66a6-81af-4262-81df-c3141b2fa3c4', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('f5186759-c787-40ae-a599-bddaab72aebc', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('0b0077b3-0052-4ec9-970c-bc5059b6e96c', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('6661b5e5-5a4c-481d-914a-b3890b655f1b', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('a6c34098-ac7f-428e-b65f-6c46b3c4605f', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('acdd136c-b923-4dde-96fb-41aa433a8486', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('033b9a2f-cfda-404c-85f4-337f8696a8e0', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('e3aa86db-3909-4ccd-b3ab-f7c187e23b77', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', 0, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('bccdbde6-d49c-4e24-a67d-5ca464452f18', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('ac00865b-9a4e-469a-8208-87002f787f1b', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('18279463-49d0-4cd7-85a1-70d6212c664d', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('8276749f-92c3-44a2-9600-e3cf94602a66', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('fb2e87a2-e65f-4e8e-ba76-7fd074066a8b', '125fc932-65f0-433b-8a7e-002731794d8c', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('c75f8924-84e8-4114-89f6-6a3660a00ab4', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('97a74746-9c0a-4010-9456-6e887d8edd0a', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('413ba8d4-85c7-4ac2-b578-4840b7eb2cd7', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('fe9b5e77-e5ec-4adf-b460-64469f6eb8a7', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('bb16c4cd-3eca-4fe3-82a5-938a203e9984', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('b5b6fb7a-773b-416f-85ce-0cf5703d8bba', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('1ed9e6f7-f31f-476e-ba5c-f070dc1fb66b', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('aaa8e3d2-7937-420a-95a0-573e6a6956d7', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('ee715a70-9ec0-4a5e-8857-46e89c9f9add', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 1, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('b8367b7b-62d7-4c98-b237-2fb4f8ef88f0', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('341c56c0-fbbb-4bf0-bc0b-6dc768a96040', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('868509f4-a9ee-4795-b5f2-4dd848bac73b', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('e987ca8f-4c93-48a0-aa1d-f01fdf31896f', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('04d6fdf3-c10f-4821-96a7-166b80a81585', '125fc932-65f0-433b-8a7e-002731794d8c', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('97bbcb0c-6dce-4c6e-afa7-2e76eacd2737', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('155dbc19-a264-44f6-b7c8-5710c3852a4c', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('8fe78b35-4946-47ad-a0a5-640ef30d665c', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('3b6a0283-0e41-4500-9951-797ff0258774', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('45894855-745b-436a-9b71-e914b6e6f118', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('fdc5aa7d-5ea9-4f6d-a00e-b850b22afe5f', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('acf3ccfd-9483-4336-9b0c-f7ee7d232500', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('af9eecfc-04c7-44c3-aa61-e06a92fa039a', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_images (id, product_id, url, sort_order, created_at) VALUES ('49814427-b8b3-48df-a828-773ec0a0bfa2', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 2, '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;

-- Promotions

INSERT INTO public.promotions (id, code, description, type, value, usage_count, usage_limit, starts_at, ends_at, status, created_at, updated_at) VALUES ('5005b29a-f227-4597-881b-9b476d2eaa1e', 'SHAJGOJ10', '10% off your first order', 'percentage', 10.00, 42, 1000, '2026-09-05 12:47:44.298291+00', '2026-11-14 12:47:44.298291+00', 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.promotions (id, code, description, type, value, usage_count, usage_limit, starts_at, ends_at, status, created_at, updated_at) VALUES ('402a7c04-241b-4b00-84fd-07c11c5ae2c6', 'FLAT100', '৳100 off orders over ৳1000', 'fixed', 100.00, 113, NULL, '2026-08-16 12:47:44.298291+00', '2026-10-15 12:47:44.298291+00', 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.promotions (id, code, description, type, value, usage_count, usage_limit, starts_at, ends_at, status, created_at, updated_at) VALUES ('87664354-ea14-43e9-aff5-3d74e64e8bed', 'FREESHIP', 'Free delivery, any order', 'shipping', 0.00, 208, NULL, '2026-09-10 12:47:44.298291+00', '2026-12-14 12:47:44.298291+00', 'active', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.promotions (id, code, description, type, value, usage_count, usage_limit, starts_at, ends_at, status, created_at, updated_at) VALUES ('272118dc-da26-4dd5-8432-6791b3365fdd', 'EIDSALE25', '25% Eid mega sale', 'percentage', 25.00, 0, 500, '2026-10-05 12:47:44.298291+00', '2026-10-20 12:47:44.298291+00', 'scheduled', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;

-- Reviews

INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('385fd589-5114-4303-a0a5-f8eb0522a7e9', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('f0f85a75-1c06-4843-b45c-47283c3c26a1', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('894c0942-70ba-4079-a35d-c73de45a2b97', '2c3512f8-5307-4a3c-8c8f-c04961ea34eb', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('d80011c7-328f-46b9-bf7c-e21690bea821', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('a90cb5ef-0ab3-4808-a253-d566b0a8846d', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('51015d31-5d9e-486a-8c17-dc38cb677871', '2d4c3b28-db0e-4410-b349-177c06c49e64', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('d8e00291-c7cf-440e-80f8-3de8a14ebc97', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('d3fa0780-2a3b-4f68-92fd-e98cb59ef95a', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('4d0c44fe-3d69-4ebd-9087-a03925f24fe1', '3eb5e4ee-7f7e-46f0-816d-789d51e0f1de', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('5b4423e6-0afc-4072-a0b7-115eb99421eb', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('d7a7d132-5626-4e21-b910-66e1014af850', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('ce55e72b-d8d2-4adf-8f1a-7b2c95c375d3', 'ae03ec59-a225-4a9f-9639-fab37713bd79', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('4e7e7e13-7725-43e1-b383-e1382b70854c', '125fc932-65f0-433b-8a7e-002731794d8c', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('70fece6c-c043-4c92-8d35-7ee7cb4a4f6a', '125fc932-65f0-433b-8a7e-002731794d8c', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('8ed93b94-2606-4b94-af16-de6289412392', '125fc932-65f0-433b-8a7e-002731794d8c', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('4c8e67ba-db7b-4e73-b315-a4941840e3f9', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('109bd157-6530-48a9-9deb-d468b4327e53', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('e2c55dad-23e2-44a3-ade4-2f9ef3d53775', 'cef28d53-60e4-4c48-a374-d14a75d0fb01', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('f71ca1d5-7440-4bd8-a8d8-5ae2dbcc8e4d', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('774711f9-3e20-4b0c-a2e3-ce23b52043cd', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('1e633773-bb59-46bb-9aff-27097f0d2585', 'ba2a248e-a4d9-4175-9048-d241dc5def6e', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('abae8a79-f5fe-4dc1-bca4-7736a5cef525', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('13d9c193-d613-4d4c-a747-943df7799342', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('2df1bf83-c02b-447b-b1e8-6581e5d5b145', '6e0592ed-bb5e-42af-85d4-e9c2a80e0398', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('f8e205c5-1e4d-42ce-8aac-cbf8ab3308c0', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('c7f48bee-6190-4efb-804c-ee7324e667fa', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('c1145c49-a0da-4235-b2db-425ee9b5ed37', '83117613-7bf7-44c1-92da-65f2ec06ae1b', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('3712a17f-90f4-4339-9be6-3fbdc463fa41', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('a50b541a-91d6-40d3-a6cb-05aa3e7cd87b', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('889fa57c-5b47-495e-8c08-e0a1284de5df', '490d5763-5768-4fb4-a66c-9b4791ce1080', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('5c90d06f-b2f4-4865-9e34-65133b302aa5', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('86b9825b-cb5f-4361-bc67-eb509b90bc10', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('45b0b3a9-8093-4a62-9077-92100d1f4a14', '45bfb1e9-9ffa-4ac3-8319-8195abac900f', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('b0df4802-1e40-4b61-85cc-524d3c57602b', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('1dea8d86-3257-4e05-b569-1f098b3c4d41', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('6fb85eeb-c792-4762-bffd-a10860acc82e', '971b1cec-5f34-4bc5-a855-1d5e0c825ecb', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('d16fef09-4d62-4d28-9386-f50726d371a6', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('3d3c75ae-10c5-4fa0-8476-62e2c1564352', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('35593b1a-39d2-44ca-b53d-bcfd28a459bf', '4d55bf46-fb43-4de1-a08b-e62b505b76a6', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('bc8de74c-6aeb-4b9a-aea3-4a30ca320987', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'Nusrat J.', 5, 'Absolutely loved it, authentic product and fast delivery!', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('dd0eeeb0-32a6-4fae-bbf3-ce73ed227c41', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'Tanvir A.', 4, 'Good quality for the price. Packaging could be better.', 'approved', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, user_name, rating, comment, status, created_at, updated_at) VALUES ('5a8202b4-705f-43f9-848d-917da21e120d', '4165655c-8ebc-4d98-9ce3-5898966a98f9', 'Sadia I.', 3, 'It is okay, did not work as well for my skin type.', 'pending', '2026-09-15 12:47:44.298291+00', '2026-09-15 12:47:44.298291+00') ON CONFLICT (id) DO NOTHING;

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
