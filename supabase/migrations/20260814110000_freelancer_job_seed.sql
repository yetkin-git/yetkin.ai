-- [ADIM 11] Freelancer iş ilanı + bütçe/emanet katalog tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000)
--        → akademi tohumu (90000) → e-posta senkronu (100000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
-- client_id = platform hazine sentinel (SQL 10000). Auth login değildir; Super Admin değildir.
-- Resmî yetkin.ai Örnek Görevleri: Büyüme Beşlisi 5 kapı + Açık Deneme (lib/freelancer/seed.ts).
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
    'yetkin.ai Örnek Görev — Excel Veri Otomasyonu',
    $brief_fj_rail_icon_set$Akademi ilerleme CSV'sinden Power Query ile üç özet sayfa ve bir gösterge paneli. Teslim formatı: XLSX. Süre: 7 gün. 3 revizyon hakkı. Teklif için Ofis Yapay Zekâ belgesi gerekir. İşveren: yetkin.ai Ekosistem.$brief_fj_rail_icon_set$,
    850000,
    'TRY',
    'excel-veri-otomasyon',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:06:00',
    TIMESTAMP '2026-08-17 12:06:00'
  ),
  (
    'fj_rail_ql_banners',
    '00000000-0000-4000-8000-000000000001',
    'yetkin.ai Örnek Görev — E-Ticaret Asistanlığı',
    $brief_fj_rail_ql_banners$Beş compact SKU için e-ticaret ürün kartı: başlık, özellik maddeleri, 150–200 sözcük açıklama ve 5 SSS. Teslim formatı: Markdown. Süre: 7 gün. 3 revizyon hakkı. Teklif için E-Ticaret Asistanlığı belgesi gerekir. İşveren: yetkin.ai Ekosistem.$brief_fj_rail_ql_banners$,
    750000,
    'TRY',
    'eticaret-pazaryeri',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:05:00',
    TIMESTAMP '2026-08-17 12:05:00'
  ),
  (
    'fj_rail_seal_social',
    '00000000-0000-4000-8000-000000000001',
    'yetkin.ai Örnek Görev — Sosyal Medya İçerik Üretimi',
    $brief_fj_rail_seal_social$Sertifika paylaşımı için 1080×1080 ve 1200×630 şablonlar; açık ve koyu tema. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Sosyal Medya İçerik belgesi gerekir. İşveren: yetkin.ai Ekosistem.$brief_fj_rail_seal_social$,
    600000,
    'TRY',
    'logo-gorsel-sosyal-medya',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:04:00',
    TIMESTAMP '2026-08-17 12:04:00'
  ),
  (
    'fj_rail_academy_copy',
    '00000000-0000-4000-8000-000000000001',
    'yetkin.ai Örnek Görev — WhatsApp Chatbot Kurulumu',
    $brief_fj_rail_academy_copy$Akademi destek SSS için WhatsApp chatbot akışı: karşılama, 8 soru ve insan devri. Teslim formatı: Voiceflow JSON. Süre: 7 gün. 3 revizyon hakkı. Teklif için Kodsuz Chatbot belgesi gerekir. İşveren: yetkin.ai Ekosistem.$brief_fj_rail_academy_copy$,
    650000,
    'TRY',
    'chatbot-musteri-hizmetleri',
    'PUBLIC',
    7,
    'OPEN',
    TIMESTAMP '2026-08-17 12:03:00',
    TIMESTAMP '2026-08-17 12:03:00'
  ),
  (
    'fj_rail_devlabs_prompts',
    '00000000-0000-4000-8000-000000000001',
    'yetkin.ai Örnek Görev — Prompt ve Günlük Üretkenlik',
    $brief_fj_rail_devlabs_prompts$Beş compact SKU için 8 kullanıma hazır prompt şablonu (sistem, kullanıcı, örnek). Teslim formatı: Markdown. Süre: 5 gün. 3 revizyon hakkı. Teklif için Prompt Üretkenlik belgesi gerekir. İşveren: yetkin.ai Ekosistem.$brief_fj_rail_devlabs_prompts$,
    400000,
    'TRY',
    'prompt-uretkenlik',
    'PUBLIC',
    5,
    'OPEN',
    TIMESTAMP '2026-08-17 12:02:00',
    TIMESTAMP '2026-08-17 12:02:00'
  ),
  (
    'fj_yetkin_acik_deneme',
    '00000000-0000-4000-8000-000000000001',
    'yetkin.ai Örnek Görev — Açık Deneme',
    $brief_fj_yetkin_acik_deneme$Akademi antre sayfası için 8 maddelik dürüst kontrol listesi. Teslim formatı: Markdown. Süre: 5 gün. 3 revizyon hakkı. Açık Deneme — Erişim Hakkı istenmez. İşveren: yetkin.ai Ekosistem.$brief_fj_yetkin_acik_deneme$,
    250000,
    'TRY',
    'acik-deneme',
    'PUBLIC',
    5,
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
