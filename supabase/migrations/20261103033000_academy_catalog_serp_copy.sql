-- Katalog SERP kopyası.
-- Kart başlığı 55, kart özeti 140, arama başlığı 50-60 karakter.
-- Parantez içi marka özetin içine iner. Ders sayısı ve baraj kart metasında durur.
-- Basılmış sertifika satırı ezilmez.

UPDATE public.academy_courses
SET
  title = 'İş Hayatında ve Ofiste Yapay Zekâ',
  summary = 'Excel, Word, PowerPoint ve e-postada yapay zekâ: yönetim özetine dönüştürme. Sertifika: 8 ders + 10 soru / 70. Sunucuda dosya kontrolü yok.',
  updated_at = now()
WHERE slug = '01_office_ai';

UPDATE public.academy_courses
SET
  title = 'E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı',
  summary = 'Trendyol, Hepsiburada, Amazon ve Shopify vitrini: ürün yazısı, fotoğraf, yorum, fiyat ve mağaza mesajı.',
  updated_at = now()
WHERE slug = '02_ecommerce_ai';

UPDATE public.academy_courses
SET
  title = 'Yapay Zekâ ile Sosyal Medya İçeriği',
  summary = 'Sosyal medya görseli ve kısa video: künye, istem, tek stil ve yayından önce kontrol.',
  updated_at = now()
WHERE slug = '03_social_media_ai';

UPDATE public.academy_courses
SET
  title = 'Kodsuz WhatsApp ve Web Chatbot Kurulumu',
  summary = 'Voiceflow ve Botpress ile kodsuz müşteri asistanı: WhatsApp, web sohbet, randevu ve teslim seti.',
  updated_at = now()
WHERE slug = '04_chatbot_nocode';

UPDATE public.academy_courses
SET
  title = 'Yapay Zekâ Prompt Mühendisliği',
  summary = 'Yapay Zekâya Doğru Talimat Verme Sanatı. Rol, bağlam, biçim ve günlük istem seti.',
  updated_at = now()
WHERE slug = '05_prompt_practice';

UPDATE public.academy_exams AS exam
SET
  title = course.title || ' müfredat sınavı',
  updated_at = now()
FROM public.academy_courses AS course
WHERE exam.course_id = course.id
  AND course.slug IN (
    '01_office_ai',
    '02_ecommerce_ai',
    '03_social_media_ai',
    '04_chatbot_nocode',
    '05_prompt_practice'
  )
  AND exam.title LIKE '%müfredat sınavı';
