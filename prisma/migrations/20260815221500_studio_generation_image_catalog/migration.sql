-- Studio görsel üretim katalog tohumu (T1). Kod sabiti satış fiyatı yok (S11-A).
-- Super Admin PATCH (amount_minor + updated_by) yeniden migrate ile ezilmez.

INSERT INTO "price_catalog_entries" (
  "id",
  "module_key",
  "unit_key",
  "unit_type",
  "amount_minor",
  "currency_code",
  "is_active",
  "min_minor",
  "max_minor",
  "description",
  "created_at",
  "updated_at"
)
VALUES
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
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("module_key", "unit_key") DO UPDATE
SET
  "amount_minor" = CASE
    WHEN "price_catalog_entries"."updated_by" IS NOT NULL
      THEN "price_catalog_entries"."amount_minor"
    ELSE EXCLUDED."amount_minor"
  END,
  "updated_by" = "price_catalog_entries"."updated_by",
  "currency_code" = EXCLUDED."currency_code",
  "is_active" = true,
  "min_minor" = EXCLUDED."min_minor",
  "max_minor" = EXCLUDED."max_minor",
  "description" = EXCLUDED."description",
  "updated_at" = CASE
    WHEN "price_catalog_entries"."updated_by" IS NOT NULL
      THEN "price_catalog_entries"."updated_at"
    ELSE CURRENT_TIMESTAMP
  END;
