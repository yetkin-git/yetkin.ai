-- Lansman katalog açılışı. Satış fiyatı kod sabiti değildir (A1).
-- Tutar amount_minor kuruştur. Super Admin yazdıysa (updated_by dolu) bu tohum ezilmez.
-- Karar defteri yalnız tutar bu göçle yazıldığında eklenir. Sessiz zam yok.
-- credit-pack tutarı 10 krediye tam bölünür; bölünmezse kredi yazılmaz.

DO $$
DECLARE
  seed record;
  existing record;
  v_id text;
  v_module text;
  v_unit text;
  v_amount integer;
  v_min integer;
  v_max integer;
  v_description text;
  ledger_id text;
  catalog_id text;
  old_minor integer;
  v_existing_id text;
BEGIN
  FOR seed IN
    SELECT *
    FROM (
      VALUES
        (
          'cat_commerce_monthly',
          'commerce',
          'monthly',
          149000,
          1,
          50000000,
          'Yetkin Commerce aylık mağaza lisansı. Tutar katalog satırındadır.'
        ),
        (
          'cat_commerce_agency',
          'commerce',
          'agency',
          790000,
          1,
          50000000,
          'E-ticaret ajans paketi, 10 mağaza koltuğu. Tutar katalog satırındadır.'
        ),
        (
          'cat_tezgah_pro',
          'tezgah',
          'pro',
          59000,
          1,
          50000000,
          'Tezgâh Pro aylık abonelik. Tutar katalog satırındadır. Satır yoksa ücretli yol kapalıdır.'
        ),
        (
          'cat_tezgah_credit_pack',
          'tezgah',
          'credit-pack',
          19000,
          10,
          50000000,
          'Tezgâh 10 üretim kredisi. Tutar 10''a bölünemezse kredi yazılmaz. Satır yoksa ücretli yol kapalıdır.'
        ),
        (
          'cat_tezgah_grant_dossier',
          'tezgah',
          'grant-dossier',
          149000,
          1,
          50000000,
          'Tam hibe proje dosyası. Tutar katalog satırındadır. Satır yoksa dosya üretilmez.'
        ),
        (
          'cat_academy_team_seat',
          'academy',
          'team-seat',
          490000,
          1,
          50000000,
          'KOBİ ekip rozeti, 5 koltuk. Tutar katalog satırındadır.'
        )
    ) AS v(
      id,
      module_key,
      unit_key,
      amount_minor,
      min_minor,
      max_minor,
      description
    )
  LOOP
    v_id := seed.id;
    v_module := seed.module_key;
    v_unit := seed.unit_key;
    v_amount := seed.amount_minor;
    v_min := seed.min_minor;
    v_max := seed.max_minor;
    v_description := seed.description;

    IF v_amount <= 0 OR v_amount < v_min OR v_amount > v_max THEN
      RAISE EXCEPTION 'katalog tutarı bant dışında: %/%', v_module, v_unit;
    END IF;

    IF v_unit = 'credit-pack' AND v_amount % 10 <> 0 THEN
      RAISE EXCEPTION 'tezgah/credit-pack tutarı 10 krediye bölünmüyor';
    END IF;

    SELECT e.id AS id, e.amount_minor AS amount_minor, e.updated_by AS updated_by
      INTO existing
      FROM "price_catalog_entries" e
      WHERE e.module_key = v_module
        AND e.unit_key = v_unit;

    IF NOT FOUND THEN
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
      ) VALUES (
        v_id,
        v_module,
        v_unit,
        'MINOR',
        v_amount,
        'TRY',
        true,
        v_min,
        v_max,
        v_description,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
      catalog_id := v_id;
      old_minor := 0;
    ELSIF existing.updated_by IS NOT NULL THEN
      -- Super Admin tutarı tohum ezmez.
      CONTINUE;
    ELSIF existing.amount_minor IS DISTINCT FROM v_amount THEN
      v_existing_id := existing.id;
      UPDATE "price_catalog_entries"
      SET
        "amount_minor" = v_amount,
        "unit_type" = 'MINOR',
        "currency_code" = 'TRY',
        "is_active" = true,
        "min_minor" = v_min,
        "max_minor" = v_max,
        "description" = v_description,
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = v_existing_id;
      catalog_id := v_existing_id;
      old_minor := existing.amount_minor;
    ELSE
      v_existing_id := existing.id;
      UPDATE "price_catalog_entries"
      SET
        "unit_type" = 'MINOR',
        "currency_code" = 'TRY',
        "is_active" = true,
        "min_minor" = v_min,
        "max_minor" = v_max,
        "description" = v_description,
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = v_existing_id
        AND "updated_by" IS NULL;
      CONTINUE;
    END IF;

    ledger_id := 'pcl_open_' || v_module || '_' || replace(v_unit, '-', '_');

    INSERT INTO "price_catalog_decision_ledger" (
      "id",
      "catalog_entry_id",
      "module_key",
      "unit_key",
      "unit_type",
      "reason_code",
      "reason",
      "old_minor",
      "new_minor",
      "currency_code",
      "actor_user_id",
      "created_at"
    )
    SELECT
      ledger_id,
      catalog_id,
      v_module,
      v_unit,
      'MINOR',
      'ADMIN_MANUAL',
      'Lansman katalog açılışı. Tutar amount_minor kuruştur. Super Admin yazdıysa bu tohum ezmez.',
      old_minor,
      v_amount,
      'TRY',
      'migration:20261118160000',
      CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
      SELECT 1
      FROM "price_catalog_decision_ledger" d
      WHERE d.id = ledger_id
    );
  END LOOP;
END $$;
