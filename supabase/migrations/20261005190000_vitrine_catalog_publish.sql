-- Vitrin kataloğu yayını. Steril kapanış ve tohum `NOT IN` bu dosyadan önce çalışır.
-- Son söz: altı vitrin SKU `is_published` ve aktif PriceCatalogEntry.
-- Super Admin tutarı (updated_by dolu) ezilmez. Lisans / sertifika DROP yok.
-- Tohum kuruş: OFF-101 89000, EC-102 99000, SM-103 89000, BOT-104 129000, PR-105 129000, OFF-201 129000.

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
    'cat_academy_course_01_office_ai',
    'academy',
    'course:01_office_ai',
    'MINOR',
    89000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyati — Ofis yapay zeka (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'cat_academy_course_01_office_ai_ileri',
    'academy',
    'course:01_office_ai_ileri',
    'MINOR',
    129000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyati — Ileri ofis yapay zeka (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'cat_academy_course_02_ecommerce_ai',
    'academy',
    'course:02_ecommerce_ai',
    'MINOR',
    99000,
    'TRY',
    true,
    1,
    50000000,
    'Akademi kurs birim fiyati — E-ticaret yapay zeka (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
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
    'Akademi kurs birim fiyati — Sosyal medya yapay zeka (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
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
    'Akademi kurs birim fiyati — Kodsuz chatbot (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
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
    'Akademi kurs birim fiyati — Prompt muhendisligi (KDV dahil).',
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
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
    'ac_01_office_ai',
    '01_office_ai',
    'İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)',
    $off101$İş hayatında yapay zekâ: Excel Copilot ve Ataş Yöntemi, A1 Düzeni ve Temiz Veri, yönetim özetine dönüştürme, Gmail'de yerleşik Gemini, Word belgesi inceleme, KVKK maskeleme ve haftalık Cuma rutini. Sertifika: 8 ders + 10 soru / 70. Sunucuda dosya kontrolü yok.$off101$,
    'course:01_office_ai',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'ac_01_office_ai_ileri',
    '01_office_ai_ileri',
    'İleri Ofis Yapay Zekâ',
    $off201$İleri ofis işi: dört parçalı istem, toplantı notu, formül, uzun belge, e-posta taslağı ve üç dosyada sayı denetimi.$off201$,
    'course:01_office_ai_ileri',
    14,
    2,
    28,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'ac_02_ecommerce_ai',
    '02_ecommerce_ai',
    'E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)',
    $ec102$Pazaryeri vitrini: ürün yazısı, fotoğraf, yorum, fiyat, toplu açıklama ve mağaza mesajı. Altı ders seslidir. Sınav barajı 70'tir.$ec102$,
    'course:02_ecommerce_ai',
    2,
    1,
    2,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'ac_03_social_media_ai',
    '03_social_media_ai',
    'Yapay Zekâ ile Sosyal Medya İçeriği (Görsel ve Kısa Video)',
    $sm103$Sosyal medya görseli ve kısa video: künye, istem, tek stil ve yayından önce kontrol. Altı ders seslidir. Sınav barajı 70'tir.$sm103$,
    'course:03_social_media_ai',
    3,
    1,
    3,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'ac_04_chatbot_nocode',
    '04_chatbot_nocode',
    'Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)',
    $bot104$Kodsuz müşteri asistanı: WhatsApp ve web sohbet akışı, randevu ve teslim seti. Altı ders seslidir. Sınav barajı 70'tir.$bot104$,
    'course:04_chatbot_nocode',
    4,
    1,
    4,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  ),
  (
    'ac_05_prompt_practice',
    '05_prompt_practice',
    'Yapay Zekâ Prompt Mühendisliği',
    $pr105$Yapay Zekâya Doğru Talimat Verme Sanatı. Altı ders seslidir. Sınav barajı 70'tir.$pr105$,
    'course:05_prompt_practice',
    5,
    1,
    5,
    true,
    TIMESTAMP '2026-10-05 16:30:00',
    TIMESTAMP '2026-10-05 16:30:00'
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  global_rank = EXCLUDED.global_rank,
  local_rank = EXCLUDED.local_rank,
  trend_score = EXCLUDED.trend_score,
  is_published = true,
  updated_at = now();
