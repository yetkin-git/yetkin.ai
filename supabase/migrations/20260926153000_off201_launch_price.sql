-- OFF-201 lansman fiyatı. Steril vitrin amiral dışı satırları kapattıktan sonra çalışır.
-- Tutar PriceCatalogEntry satırındadır. Super Admin yazdıysa (updated_by dolu) amount_minor ezilmez.
-- Kurs satırında tutar yoktur (S11-A).

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
    'cat_academy_course_01_office_ai_ileri',
    'academy',
    'course:01_office_ai_ileri',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — İleri Ofis Yapay Zekâ lansman (KDV dahil).',
    TIMESTAMP '2026-09-26 12:00:00',
    TIMESTAMP '2026-09-26 12:00:00'
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
    'ac_01_office_ai_ileri',
    '01_office_ai_ileri',
    'İleri Ofis Yapay Zekâ',
    'İleri ofis işi: dört parçalı istem, toplantı notu, formül, uzun belge, e-posta taslağı ve üç dosyada sayı denetimi.',
    'course:01_office_ai_ileri',
    14,
    2,
    28,
    true,
    TIMESTAMP '2026-09-26 12:00:00',
    TIMESTAMP '2026-09-26 12:00:00'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  is_published = true,
  updated_at = now();
