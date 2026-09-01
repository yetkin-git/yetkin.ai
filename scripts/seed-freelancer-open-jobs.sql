-- İş Pazarı açık ilan tohumu — Supabase SQL Editor veya:
--   psql "$DIRECT_URL" -f scripts/seed-freelancer-open-jobs.sql
--
-- Tablo: public.freelancer_jobs (Prisma FreelancerJob).
-- client_id = platform hazine sentinel; Auth login değildir.
-- Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
-- ON CONFLICT ile idempotenttir; OPEN + PUBLIC vitrine basar.
--
-- Temsili üç ilan: SVG İkon Seti, Banner Tasarımı, Akademi Ders Özetleri.
-- Katalog kardeşleri (prompt şablonları, sosyal şablonlar) ops:migrate mührü için aynı dosyadadır.

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
