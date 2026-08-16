-- Faz 5 — PriceCatalogEntry ops tohumu (S35-A).
-- Sıra: prisma migrate deploy → handle_new_user → FORCE RLS → owner SELECT → bu dosya.
-- Motor bu tutarları kod sabiti olarak okumaz; Super Admin satırı değiştirebilir (S11-A).
-- Prisma migrate de faz tohumu basar; bu dosya ops yeniden oynatmasıdır (upsert).
-- Super Admin PATCH (amount_minor + updated_by) yeniden ops:migrate ile ezilmez.
-- updated_by doluysa mevcut tutar korunur; yalnız boş/tohum satırı EXCLUDED ile dolar.
-- Sahiplik kolonu yok: authenticated SELECT politikası üretilmez (PostgREST fail-closed).

INSERT INTO public.price_catalog_entries (
  id,
  module_key,
  unit_key,
  unit_type,
  amount_minor,
  currency_code,
  is_active,
  min_minor,
  max_minor,
  description,
  created_at,
  updated_at
)
VALUES
  (
    'cat_studio_generation_text',
    'studio',
    'generation:text',
    'MINOR',
    100,
    'TRY',
    true,
    100,
    NULL,
    'Studio metin üretim tabanı — debit = max(taban, token) (S32-A).',
    now(),
    now()
  ),
  (
    'cat_studio_generation_image',
    'studio',
    'generation:image',
    'MINOR',
    250,
    'TRY',
    true,
    250,
    NULL,
    'Studio görsel üretim tabanı — debit = max(taban, token) (S32-A).',
    now(),
    now()
  ),
  (
    'cat_kurumsal_job_posting_floor',
    'kurumsal',
    'job-posting:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Kurumsal mühürlü ilan bütçe tabanı / tavanı.',
    now(),
    now()
  ),
  (
    'cat_arena_tender_pool_floor',
    'arena',
    'tender-pool:floor',
    'MINOR',
    10000,
    'TRY',
    true,
    10000,
    2000000,
    'Arena ihale ödül havuzu tabanı / tavanı.',
    now(),
    now()
  ),
  (
    'cat_pazaryeri_listing_floor',
    'pazaryeri',
    'listing:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Yetkinİlan dijital/hizmet ilan fiyat tabanı / tavanı.',
    now(),
    now()
  ),
  (
    'cat_pazaryeri_listing_asset_floor',
    'pazaryeri',
    'listing:asset-floor',
    'MINOR',
    100000,
    'TRY',
    true,
    10000,
    2000000000,
    'Yetkinİlan emlak/vasıta ilan fiyat tabanı / tavanı (S61-A). Tavan Int32 güvenli ₺20M.',
    now(),
    now()
  ),
  (
    'cat_pazaryeri_doping_boost',
    'pazaryeri',
    'doping:boost',
    'MINOR',
    5000,
    'TRY',
    true,
    5000,
    5000,
    'Yetkinİlan ilan doping / öne çıkarma ücreti (S61-A, S11-A).',
    now(),
    now()
  )
ON CONFLICT (module_key, unit_key) DO UPDATE
SET
  amount_minor = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.amount_minor
    ELSE EXCLUDED.amount_minor
  END,
  updated_by = price_catalog_entries.updated_by,
  currency_code = EXCLUDED.currency_code,
  is_active = true,
  min_minor = EXCLUDED.min_minor,
  max_minor = EXCLUDED.max_minor,
  description = EXCLUDED.description,
  updated_at = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.updated_at
    ELSE now()
  END;
