-- İş Pazarı açık ilan tohumu — Supabase SQL Editor veya:
--   psql "$DIRECT_URL" -f scripts/seed-freelancer-open-jobs.sql
--
-- Tablo: public.freelancer_jobs (Prisma FreelancerJob).
-- client_id = platform hazine sentinel; Auth login değildir.
-- Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
-- ON CONFLICT ile idempotenttir; OPEN + PUBLIC vitrine basar.
--
-- Resmî yetkin.ai Örnek Görevleri: Büyüme Beşlisi 5 kapı + Açık Deneme.
-- Kaynak sicil: lib/freelancer/seed.ts

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
