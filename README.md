# Katalog — B2B Ürün Katalog & Fiyat Yönetim Uygulaması

Plasiyer/saha satış temsilcisi için profesyonel B2B ürün kataloğu. Müşteriye ürünleri tablet, telefon veya bilgisayardan şık şekilde gösterir.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** — Auth, PostgreSQL, Storage
- **Vercel** — Deploy

---

## Kurulum Adımları

### 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) → Giriş yap → **New Project**
2. Proje adı, şifre, bölge (Europe West) seç → **Create**
3. Proje hazır olunca: **Settings → API** sayfasına git
4. Şunları kopyala:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Veritabanı Şemasını Çalıştır

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. `supabase/schema.sql` içeriğini yapıştır
3. **Run** (F5)

### 3. Kullanıcı Oluştur

Supabase Dashboard → **Authentication → Users → Add User**:

**Admin kullanıcı:**
```
Email: admin1@app.local
Password: [güçlü şifre — en az 8 karakter]
Auto Confirm: ✅
```

**Sales kullanıcı:**
```
Email: plasiyer1@app.local
Password: [güçlü şifre]
Auto Confirm: ✅
```

Kullanıcılar oluşturulunca **SQL Editor**'da:
```sql
-- Admin rolü ver
UPDATE public.profiles
SET role = 'admin', full_name = 'Admin Kullanıcı'
WHERE username = 'admin1';

-- Sales rolünü onayla (default zaten sales)
UPDATE public.profiles
SET full_name = 'Satış Temsilcisi'
WHERE username = 'plasiyer1';
```

### 4. .env.local Dosyasını Düzenle

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Paketleri Yükle ve Başlat

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

**Login:**
- Kullanıcı adı: `admin1`
- Şifre: (Supabase'de girdiğiniz şifre)

---

## Vercel'e Deploy

### Otomatik Deploy (GitHub)

1. Kodu GitHub'a push et
2. [vercel.com](https://vercel.com) → **New Project** → GitHub repo seç
3. **Environment Variables** ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** → Birkaç dakika içinde canlı

### Manuel Deploy

```bash
npm install -g vercel
vercel --prod
```

---

## Kullanım

### Login
- `username` girin (e-posta değil)
- Admin: ürün ekler, fiyat değiştirir
- Sales: sadece görüntüler

### Ürün Ekleme (Admin)
- Navbar → **Ürün Ekle**
- Tüm alanları doldurun
- Görsel yükleyin (max 5MB)
- **Ürünü Ekle**

### Fiyat Değiştirme (Admin)
- Ürün kartı → **Fiyat** butonu
- Yeni fiyatları girin
- **Fiyatları Güncelle**

### Ürün Detayı
- Herhangi bir karta tıkla
- Büyük görsel, fiyatlar ve bilgiler açılır
- Görsele tıklayarak tam ekran zoom

---

## Klasör Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── login/              # Login sayfası
│   ├── dashboard/          # Ana katalog sayfası
│   ├── products/
│   │   ├── new/            # Yeni ürün ekleme
│   │   └── [id]/edit/      # Ürün düzenleme
│   └── admin/              # Yönetim paneli
├── components/
│   ├── layout/             # Navbar, AuthGuard
│   ├── products/           # ProductCard, Modal, Form
│   └── shared/             # SearchBar, Filter, States
├── lib/
│   ├── supabase/           # Supabase client/server
│   ├── hooks/              # useAuth, useProducts, useImageUpload
│   ├── types/              # TypeScript tipleri
│   └── utils/              # Formatters, validators
└── constants/              # Kategori listesi
```

---

## Güvenlik
 

- **Middleware** korumalı rotaları kontrol eder
- **RLS politikaları** veritabanı seviyesinde erişimi kısıtlar
- Admin olmayan kullanıcılar ürün ekleyemez/değiştiremez
- Giriş yapılmadan dashboard'a erişilemez
