-- Junior yıllık lisans tohumu. Satış fiyatının evi PriceCatalogEntry olur.
-- Super Admin PATCH tutarı (updated_by dolu) yeniden tohumla ezilmez.
-- Yeni tablo yok. junior_subscriptions CHECK bu dosyada kalkmaz.

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
    'cat_junior_yearly',
    'junior',
    'yearly',
    'MINOR',
    549900,
    'TRY',
    true,
    1,
    50000000,
    'Junior yıllık lisans. 365 gün. KDV dahil satış fiyatı.',
    TIMESTAMP '2026-10-05 16:00:00',
    TIMESTAMP '2026-10-05 16:00:00'
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
