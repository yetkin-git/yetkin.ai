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
    25000,
    'TRY',
    true,
    25000,
    5000000,
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
  visa_pathway_id,
  visibility,
  due_days,
  status,
  created_at,
  updated_at
)
VALUES
  (
    'fj_rail_icon_set',
    '00000000-0000-4000-8000-000000000001',
    'SVG İkon Seti Tasarımı',
    $brief_fj_rail_icon_set$16 adet özel ikon hazırlanması. Teslim formatı: SVG kaynak dosyaları ve 256px PNG önizlemeler. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: yetkin.ai.$brief_fj_rail_icon_set$,
    850000,
    'TRY',
    'ai-agent-entegrasyon',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:05:00',
    TIMESTAMP '2026-08-17 12:05:00'
  ),
  (
    'fj_rail_ql_banners',
    '00000000-0000-4000-8000-000000000001',
    'Web ve Sosyal Medya Banner Tasarımı',
    $brief_fj_rail_ql_banners$Üç ölçü tanıtım görseli: 1440×480 web şeridi, 1080×1080 kare ve 1200×630 paylaşım kartı. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: yetkin.ai.$brief_fj_rail_ql_banners$,
    750000,
    'TRY',
    'ai-agent-entegrasyon',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:04:00',
    TIMESTAMP '2026-08-17 12:04:00'
  ),
  (
    'fj_rail_academy_copy',
    '00000000-0000-4000-8000-000000000001',
    'Akademi Ders Özetlerinin Düzenlenmesi',
    $brief_fj_rail_academy_copy$Beş ders özetinin sade Türkçeye çekilmesi (her özet 120–180 sözcük). Teslim formatı: Markdown (.md). Süre: 5 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: yetkin.ai.$brief_fj_rail_academy_copy$,
    350000,
    'TRY',
    'ai-agent-entegrasyon',
    'PUBLIC',
    5,
    'OPEN',
    TIMESTAMP '2026-08-17 12:03:00',
    TIMESTAMP '2026-08-17 12:03:00'
  ),
  (
    'fj_rail_devlabs_prompts',
    '00000000-0000-4000-8000-000000000001',
    'Prompt Şablonları Dokümantasyonu',
    $brief_fj_rail_devlabs_prompts$8 adet kullanıma hazır prompt şablonu. Teslim formatı: Markdown (.md). Süre: 5 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: yetkin.ai.$brief_fj_rail_devlabs_prompts$,
    400000,
    'TRY',
    'ai-agent-entegrasyon',
    'PUBLIC',
    5,
    'OPEN',
    TIMESTAMP '2026-08-17 12:02:00',
    TIMESTAMP '2026-08-17 12:02:00'
  ),
  (
    'fj_rail_seal_social',
    '00000000-0000-4000-8000-000000000001',
    'Sosyal Medya Paylaşım Şablonları',
    $brief_fj_rail_seal_social$Sertifika paylaşımı için 1080×1080 ve 1200×630 şablonlar; açık ve koyu tema. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: yetkin.ai.$brief_fj_rail_seal_social$,
    600000,
    'TRY',
    'ai-agent-entegrasyon',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:01:00',
    TIMESTAMP '2026-08-17 12:01:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  brief = EXCLUDED.brief,
  budget_minor = EXCLUDED.budget_minor,
  currency_code = EXCLUDED.currency_code,
  visa_pathway_id = EXCLUDED.visa_pathway_id,
  visibility = EXCLUDED.visibility,
  due_days = EXCLUDED.due_days,
  status = 'OPEN',
  updated_at = now();

-- Yer tutucu teknik ilanlar ticari dikey değildir; OPEN vitrinden düşer.
-- AWARDED satıra dokunulmaz. Sahte bid / hold / nakit yok.
UPDATE public.freelancer_jobs
SET
  status = 'CANCELLED',
  updated_at = now()
WHERE id IN ('fj_rail_escrow_audit', 'fj_ray_sinyal_brief')
  AND status = 'OPEN';
