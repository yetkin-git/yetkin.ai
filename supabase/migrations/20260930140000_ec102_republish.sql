-- EC-102 kamu yayını. HOTFIX-EC102 kapanışını geri alır.
-- Satın alma, sertifika ve Super Admin tutarı (updated_by) ezilmez.
-- Sıra bu dosyayı unpublish SQL'inden sonra uygular.

UPDATE public.academy_courses
SET
  is_published = true,
  updated_at = now()
WHERE slug = '02_ecommerce_ai';

UPDATE public.price_catalog_entries
SET
  is_active = true,
  updated_at = now()
WHERE module_key = 'academy'
  AND unit_key = 'course:02_ecommerce_ai';
