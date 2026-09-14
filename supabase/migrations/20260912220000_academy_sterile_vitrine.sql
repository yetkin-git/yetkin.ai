-- Akademi vitrin hijyeni — taslak kardeş SKU izolasyonu.
-- Mühürlü amiral `01_office_ai` / `01_office_ai-1` çekirdek kaydı ve fiyat SSOT durur.
-- Satın alma / sertifika / defter DROP yok. amount_minor ezilmez.

UPDATE public.academy_courses
SET
  summary = 'Müfredat taze ingest bekliyor. Ders gövdesi, kapak ve ses mührü yayın öncesi basılacaktır.',
  is_published = false,
  updated_at = now()
WHERE slug IN (
  '02_ecommerce_ai',
  '03_social_media_ai',
  '04_chatbot_nocode',
  '05_prompt_practice'
);

UPDATE public.academy_courses
SET
  is_published = false,
  updated_at = now()
WHERE slug IS DISTINCT FROM '01_office_ai'
  AND is_published = true;

UPDATE public.academy_courses
SET
  is_published = true,
  updated_at = now()
WHERE slug = '01_office_ai';

UPDATE public.price_catalog_entries
SET
  is_active = false,
  updated_at = now()
WHERE module_key = 'academy'
  AND unit_key LIKE 'course:%'
  AND unit_key <> 'course:01_office_ai';

DO $$
BEGIN
  IF to_regclass('public.academy_audio_cache') IS NOT NULL THEN
    DELETE FROM public.academy_audio_cache;
  END IF;
END $$;
