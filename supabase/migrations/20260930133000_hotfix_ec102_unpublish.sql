-- HOTFIX-EC102: EC-102 kamu yayını ve satış kapısı kapanır.
-- Satın alma, sertifika ve fiyat tutarı silinmez.
-- Beş medya katmanı yeniden doğrulanmadan bu iki bayrak açılmaz.

UPDATE public.academy_courses
SET
  is_published = false,
  updated_at = now()
WHERE slug = '02_ecommerce_ai';

UPDATE public.price_catalog_entries
SET
  is_active = false,
  updated_at = now()
WHERE module_key = 'academy'
  AND unit_key = 'course:02_ecommerce_ai';
