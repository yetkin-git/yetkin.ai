-- DevLabs kod üretim katalog tohumu (Faz 1). Kod sabiti satış fiyatı yok (S11-A).
-- Super Admin PATCH (amount_minor + updated_by) yeniden migrate ile ezilmez.
-- Motor `devlabs` / `generation:code` okur; sicil + ops SQL ile aynı anahtar.

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
    'cat_devlabs_generation_code',
    'devlabs',
    'generation:code',
    'MINOR',
    150,
    'TRY',
    true,
    150,
    NULL,
    'DevLabs kod üretim tabanı — debit = max(taban, token) (S32-A). Exec yoktur.',
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
