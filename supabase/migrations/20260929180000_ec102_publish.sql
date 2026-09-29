-- EC-102 yayın. Steril vitrin `02_ecommerce_ai` satırını kapattı ve fiyatı pasifledi.
-- Bu dosya o kararı geri alır. Super Admin tutarı (updated_by dolu) ezilmez.
-- Tohum 99000 kuruş (₺990, KDV dahil). Canlı kilit PriceCatalogEntry satırıdır.
-- `loadCourseBySlug` bu satırı ses listesiyle ezmez.

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
    'cat_academy_course_02_ecommerce_ai',
    'academy',
    'course:02_ecommerce_ai',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (KDV dahil).',
    TIMESTAMP '2026-09-29 15:00:00',
    TIMESTAMP '2026-09-29 15:00:00'
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

INSERT INTO public.academy_courses (
  id,
  slug,
  title,
  summary,
  catalog_unit_key,
  global_rank,
  local_rank,
  trend_score,
  is_published,
  created_at,
  updated_at
)
VALUES
  (
    'ac_02_ecommerce_ai',
    '02_ecommerce_ai',
    'E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)',
    'Pazaryeri vitrini: ürün yazısı, fotoğraf, yorum, fiyat, toplu açıklama ve mağaza mesajı. Altı ders seslidir. Sınav barajı 70''tir.',
    'course:02_ecommerce_ai',
    2,
    1,
    12,
    true,
    TIMESTAMP '2026-09-29 15:00:00',
    TIMESTAMP '2026-09-29 15:00:00'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  is_published = true,
  updated_at = now();
