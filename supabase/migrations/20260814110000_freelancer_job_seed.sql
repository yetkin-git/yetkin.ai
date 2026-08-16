-- [ADIM 11] Freelancer iş ilanı + bütçe/emanet katalog tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000)
--        → akademi tohumu (90000) → e-posta senkronu (100000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
-- client_id = platform hazine sentinel (SQL 10000). Auth login değildir; Super Admin değildir.
-- İlan tutarı freelancer_jobs.budget_minor satırındadır; katalog taban + hold bandı S11-A sicilidir.
-- catalog unit_key ↔ motor bant (FREELANCER_JOB_MIN/MAX, HOLD_BPS_*) mantıksal bağdır (FK yok).
-- Katalog amount_minor Super Admin PATCH (updated_by dolu) sonrası ops:migrate ile ezilmez.
-- OPEN ilan metni hâlâ tohumla hizalanır; fiyat/hold yalnız boş katalog satırında dolar.
-- freelancer_jobs sahiplik kolonu (client_id) vardır; PostgREST owner SELECT üretilir.
-- Prisma sunucu okuması postgres rolünden listOpenJobs ile vitrine basar.

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
    'cat_freelancer_job_posting_floor',
    'freelancer',
    'job-posting:floor',
    'MINOR',
    1000,
    'TRY',
    true,
    1000,
    2000000,
    'Freelancer mühürlü ilan bütçe tabanı / tavanı.',
    TIMESTAMP '2026-08-14 11:00:00',
    TIMESTAMP '2026-08-14 11:00:00'
  ),
  (
    'cat_freelancer_escrow_hold',
    'freelancer',
    'escrow:hold',
    'BPS',
    1000,
    'TRY',
    true,
    1000,
    1500,
    'Freelancer emanet platform hold bandı (1000–1500 bps).',
    TIMESTAMP '2026-08-14 11:00:00',
    TIMESTAMP '2026-08-14 11:00:00'
  )
ON CONFLICT (module_key, unit_key) DO UPDATE
SET
  unit_type = EXCLUDED.unit_type,
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

INSERT INTO public.freelancer_jobs (
  id,
  client_id,
  title,
  brief,
  budget_minor,
  currency_code,
  status,
  created_at,
  updated_at
)
VALUES
  (
    'fj_rail_escrow_audit',
    '00000000-0000-4000-8000-000000000001',
    'Yetkin Rail: EscrowHold kilit denetimi',
    'Yayında OPEN ilan. Teklif kabulünde tutar EscrowHold ile kilitlenir; teslim teyidine kadar serbest kalmaz. Teslimat: mühürlü emek yolunun (ilan, emanet, RELEASED) yazılı denetimi. Sahte settlement yok. Platform hold bps katalog bandındadır.',
    1250000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-14 11:01:00',
    TIMESTAMP '2026-08-14 11:01:00'
  ),
  (
    'fj_ray_sinyal_brief',
    '00000000-0000-4000-8000-000000000001',
    'Raylı sinyal: Fail-safe brief ve anklaşman özeti',
    'Anklaşman (interlocking) fail-safe ilkesi, ray devresi tespiti ve kırmızı aspekt işletme anlamı için mühürlü teknik brief. Teslim: sözleşme mesajı ve artifact. Ödeme EscrowHold içinde kalır; serbest bırakma RELEASED ve kariyer vizesi kapısıdır.',
    875000,
    'TRY',
    'OPEN',
    TIMESTAMP '2026-08-14 11:00:00',
    TIMESTAMP '2026-08-14 11:00:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  brief = EXCLUDED.brief,
  budget_minor = EXCLUDED.budget_minor,
  currency_code = EXCLUDED.currency_code,
  status = 'OPEN',
  updated_at = now();
