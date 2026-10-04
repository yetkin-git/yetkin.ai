-- SM-103, BOT-104 ve PR-105 yayın.
-- Steril vitrin bu üç slug'ı kapattı ve fiyatı pasifledi. Bu dosya o kararı geri alır.
-- Super Admin tutarı (updated_by dolu) ezilmez.
-- Tohum: SM-103 89000 kuruş (₺890), BOT-104 ve PR-105 129000 kuruş (₺1.290). KDV dahil.
-- Canlı kilit PriceCatalogEntry satırıdır.

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
    'cat_academy_course_03_social_media_ai',
    'academy',
    'course:03_social_media_ai',
    'MINOR',
    89000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Yapay Zekâ ile Sosyal Medya İçeriği (KDV dahil).',
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
  ),
  (
    'cat_academy_course_04_chatbot_nocode',
    'academy',
    'course:04_chatbot_nocode',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Kodsuz WhatsApp / Web Chatbot (KDV dahil).',
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
  ),
  (
    'cat_academy_course_05_prompt_practice',
    'academy',
    'course:05_prompt_practice',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyatı — Yapay Zekâ Prompt Mühendisliği (KDV dahil).',
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
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
    'ac_03_social_media_ai',
    '03_social_media_ai',
    'Yapay Zekâ ile Sosyal Medya İçeriği (Görsel ve Kısa Video)',
    'Sosyal medya görseli ve kısa video: künye, istem, tek stil ve yayından önce kontrol. Altı ders seslidir. Sınav barajı 70''tir.',
    'course:03_social_media_ai',
    3,
    1,
    3,
    true,
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
  ),
  (
    'ac_04_chatbot_nocode',
    '04_chatbot_nocode',
    'Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)',
    'Kodsuz müşteri asistanı: WhatsApp ve web sohbet akışı, randevu ve teslim seti. Altı ders seslidir. Sınav barajı 70''tir.',
    'course:04_chatbot_nocode',
    4,
    1,
    4,
    true,
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
  ),
  (
    'ac_05_prompt_practice',
    '05_prompt_practice',
    'Yapay Zekâ Prompt Mühendisliği',
    'Yapay Zekâya Doğru Talimat Verme Sanatı. Altı ders seslidir. Sınav barajı 70''tir.',
    'course:05_prompt_practice',
    5,
    1,
    5,
    true,
    TIMESTAMP '2026-10-03 20:04:00',
    TIMESTAMP '2026-10-03 20:04:00'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  is_published = true,
  updated_at = now();
