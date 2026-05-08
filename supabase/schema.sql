-- ════════════════════════════════════════════════════════════════
-- B2B Katalog Uygulaması — Supabase Schema
-- Supabase Dashboard > SQL Editor'a yapıştırın ve çalıştırın
-- ════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLOSU
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username       TEXT UNIQUE NOT NULL,
  internal_email TEXT UNIQUE NOT NULL,   -- username@app.local (Supabase auth email)
  real_email     TEXT,                   -- nullable, gerçek e-posta (ileride kullanılacak)
  full_name      TEXT,
  -- MVP: Default 'admin'. İleride sales rolü eklenince 'sales' olarak değiştir.
  role           TEXT NOT NULL DEFAULT 'admin'
                   CHECK (role IN ('admin', 'sales')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 2. PRODUCTS TABLOSU
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  sku             TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  retail_price    NUMERIC(10,2) NOT NULL CHECK (retail_price >= 0),
  wholesale_price NUMERIC(10,2) NOT NULL CHECK (wholesale_price >= 0),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 3. updated_at OTOMATİK GÜNCELLEME TRIGGER
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────
-- 4. YENİ KULLANICI → OTOMATİK PROFİL OLUŞTURMA TRIGGER
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, internal_email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    -- MVP: Yeni kullanıcılar default 'admin'. Sales eklenince 'sales' yapılır.
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY — PROFILES
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kendi profilini okuyabilir
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin tüm profilleri görebilir
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin profil güncelleyebilir
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY — PRODUCTS
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış herkes ürünleri görebilir
CREATE POLICY "products_select_authenticated"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Sadece admin ürün ekleyebilir
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Sadece admin ürün güncelleyebilir
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Sadece admin ürün silebilir
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKET — product-images
-- ─────────────────────────────────────────────────────────────────
-- Supabase Dashboard > Storage > New Bucket
-- Name: product-images
-- Public: TRUE (görseller herkese açık URL ile erişilebilir)
-- Aşağıdaki SQL'i Storage Policies için çalıştırın:

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Giriş yapmış herkes görselleri görebilir
CREATE POLICY "product_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Sadece admin görsel yükleyebilir
CREATE POLICY "product_images_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Sadece admin görsel güncelleyebilir
CREATE POLICY "product_images_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Sadece admin görsel silebilir
CREATE POLICY "product_images_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- 8. KULLANICI OLUŞTURMA TALIMATLARI
-- ─────────────────────────────────────────────────────────────────
-- Supabase Dashboard > Authentication > Users > "Invite user" KULLANMAYIN
-- Bunun yerine aşağıdaki yöntemi kullanın:
--
-- Seçenek A: Supabase Dashboard > Authentication > Users > Add User
--   Email: admin1@app.local
--   Password: [güçlü şifre]
--   Auto Confirm User: TRUE
--
-- Sonra profiles tablosunda rolü ayarlayın:
--   UPDATE public.profiles SET role = 'admin', full_name = 'Admin Kullanıcı'
--   WHERE username = 'admin1';
--
-- Seçenek B: SQL ile (Supabase Edge Function veya Service Role Key kullanılır)
-- ─────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────
-- 9. TEST VERİSİ (OPSİYONEL)
-- ─────────────────────────────────────────────────────────────────
-- Kullanıcılar oluşturulduktan sonra test ürünleri:
-- INSERT INTO public.products (name, sku, category, description, retail_price, wholesale_price)
-- VALUES
--   ('Örnek Ürün 1', 'SKU-001', 'Elektronik', 'Test ürün açıklaması', 299.90, 199.90),
--   ('Örnek Ürün 2', 'SKU-002', 'Tekstil', 'Test ürün açıklaması', 149.90, 89.90),
--   ('Örnek Ürün 3', 'SKU-003', 'Gıda', 'Test ürün açıklaması', 49.90, 29.90);
