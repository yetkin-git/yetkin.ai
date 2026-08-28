-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).
-- Kaynak sicil: lib/academy/seed.ts — 4 büyüme SKU.
-- HARD RESET: eski RAIL / jenerik tohumlar FK sırasıyla DELETE (kurs + bağımlılar + katalog).

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
    'cat_academy_course_python_temel',
    'academy',
    'course:python-temel',
    'MINOR',
    49000,
    'TRY',
    true,
    39000,
    59000,
    'Akademi kurs birim fiyatı — Python ile Sıfırdan Programlama ve Problem Çözme (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_fullstack_temel',
    'academy',
    'course:fullstack-temel',
    'MINOR',
    109000,
    'TRY',
    true,
    39000,
    139000,
    'Akademi kurs birim fiyatı — Full-Stack Web Geliştirme (React, Next.js ve Node.js) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ai_temel',
    'academy',
    'course:ai-temel',
    'MINOR',
    109000,
    'TRY',
    true,
    39000,
    139000,
    'Akademi kurs birim fiyatı — Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'cat_academy_course_ux_temel',
    'academy',
    'course:ux-temel',
    'MINOR',
    109000,
    'TRY',
    true,
    1,
    139000,
    'Akademi kurs birim fiyatı — Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
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
    'ac_python_temel',
    'python-temel',
    'Python ile Sıfırdan Programlama ve Problem Çözme',
    'Sıfırdan Python: değişken, kontrol akışı, koleksiyon, dosya, Pandas ve problem çözme laboratuvarı. Temel’den İleri kapanışa 12 bölüm.',
    'course:python-temel',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_fullstack_temel',
    'fullstack-temel',
    'Full-Stack Web Geliştirme (React, Next.js ve Node.js)',
    'React, Next.js ve Node.js: dürüst HTTP, TypeScript sözleşmesi, App Router ve üretim API’si. 12 bölüm, mühürlü teslim.',
    'course:fullstack-temel',
    1,
    2,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ai_temel',
    'ai-temel',
    'Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)',
    'Prompt mühendisliği ve veri bilimi: tarif katmanları, yapılandırılmış çıktı, tablo temizliği ve kaynaklı cevap. 12 bölüm.',
    'course:ai-temel',
    1,
    3,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_ux_temel',
    'ux-temel',
    'Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)',
    'UI/UX ve Figma Masterclass: araştırma, tel çerçeve, jeton, prototip ve el teslimi. 12 bölüm, kariyer vizesi.',
    'course:ux-temel',
    1,
    4,
    4,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  global_rank = EXCLUDED.global_rank,
  local_rank = EXCLUDED.local_rank,
  trend_score = EXCLUDED.trend_score,
  is_published = true,
  updated_at = now();

INSERT INTO public.academy_exams (
  id,
  course_id,
  title,
  pass_score,
  questions_json,
  created_at,
  updated_at
)
VALUES
  (
    'exam_python_temel',
    'ac_python_temel',
    'Python ile Sıfırdan Programlama ve Problem Çözme müfredat sınavı',
    70,
    $exam_python_temel$[{"id":"q_pow_python-temel-1","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-10","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-11","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-12","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-2","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-3","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-4","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-5","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-6","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-7","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-8","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_python-temel-9","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_python_temel_1","prompt":"print ne yapar?","choices":["Dosya siler","Değeri standart çıktıya yazar","Tip dönüştürür","Döngü açar"],"correctIndex":1},{"id":"q_python_temel_2","prompt":"Tırnaksız Hello yazmak doğru mudur?","choices":["Evet","Hayır; string tırnak ister","Evet; Python tahmin eder","Hayır; yalnız print yasak"],"correctIndex":1},{"id":"q_python_temel_3","prompt":"input() ne döner?","choices":["Her zaman int","Her zaman str","bool","None"],"correctIndex":1},{"id":"q_python_temel_4","prompt":"type() ne işe yarar?","choices":["Dosya açar","Değerin tipini gösterir","Döngü kırar","Modül yükler"],"correctIndex":1},{"id":"q_python_temel_5","prompt":"= ile == farkı nedir?","choices":["Aynıdır","= atama, == karşılaştırma","İkisi de karşılaştırma","İkisi de atama"],"correctIndex":1},{"id":"q_python_temel_6","prompt":"if blogunu ne belirler?","choices":["Virgül","Girinti (indentation)","Noktalı virgül","Büyük harf"],"correctIndex":1},{"id":"q_python_temel_7","prompt":"range(1, 6) hangi sayıları üretir?","choices":["1..6","1..5","0..5","0..6"],"correctIndex":1},{"id":"q_python_temel_8","prompt":"return olmadan fonksiyon ne döner?","choices":["0","None","Boş string","Hata zorunlu"],"correctIndex":1},{"id":"q_python_temel_9","prompt":"Metin «250,00» ile * 2 ne üretir?","choices":["500","Birleştirilmiş metin","Hata her zaman","250"],"correctIndex":1},{"id":"q_python_temel_10","prompt":"try/except ValueError ne zaman işe yarar?","choices":["Her hatada","int('üç') gibi dönüşüm hatalarında","Yalnız dosyada","Yalnız ağda"],"correctIndex":1},{"id":"q_python_temel_11","prompt":"bool hangi ikilidir?","choices":["1 ve 2","True / False","yes / no","on / off string"],"correctIndex":1},{"id":"q_python_temel_12","prompt":"Anlamlı değişken adı neden iyidir?","choices":["Zorunlu sözdizimi","Okunur sözleşme","Daha hızlı CPU","Garbage collector"],"correctIndex":1},{"id":"q_python_temel_13","prompt":"while True riski nedir?","choices":["Yavaşlık","Çıkış yoksa sonsuz döngü","Tip hatası","Import hatası"],"correctIndex":1},{"id":"q_python_temel_14","prompt":"break ne yapar?","choices":["Fonksiyon siler","Döngüyü erken bitirir","Dosya kapatır","Tip değiştirir"],"correctIndex":1},{"id":"q_python_temel_15","prompt":"def ne başlatır?","choices":["Sınıf","Fonksiyon tanımı","Modül","Paket"],"correctIndex":1},{"id":"q_python_temel_16","prompt":"Kuruş dönüşümü için doğru yaklaşım?","choices":["float basmak","int(round(lira * 100))","str çarpmak","hex"],"correctIndex":1},{"id":"q_python_temel_17","prompt":"elif ne işe yarar?","choices":["Import","Ek koşul dalı","Döngü","Sınıf"],"correctIndex":1},{"id":"q_python_temel_18","prompt":"Boş girdi nasıl ele alınır?","choices":["Yoksay","strip sonrası reddet / yeniden sor","0 kabul et","None bas"],"correctIndex":1},{"id":"q_python_temel_19","prompt":"Bu eğitim kaç bölüm?","choices":["5 sabit","12 (Temel ve İleri kapanış)","3","6"],"correctIndex":1},{"id":"q_python_temel_20","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1}]$exam_python_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_fullstack_temel',
    'ac_fullstack_temel',
    'Full-Stack Web Geliştirme (React, Next.js ve Node.js) müfredat sınavı',
    70,
    $exam_fullstack_temel$[{"id":"q_pow_fullstack-temel-1","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-10","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-11","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-12","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-2","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-3","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-4","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-5","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-6","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-7","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-8","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_fullstack-temel-9","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_fs_1","prompt":"HTTP durum kodu ne işe yarar?","choices":["Süs","Fişteki mühür; istek-yanıt dürüstlüğü","CSS sınıfı","DNS"],"correctIndex":1},{"id":"q_fs_2","prompt":"res.ok false iken yeşil tik?","choices":["Doğru","Yalan; hata yansıtılır","Zorunlu","Yalnız GET"],"correctIndex":1},{"id":"q_fs_3","prompt":"TypeScript as any ne yapar?","choices":["Mühürler","Hatayı erteler; kapı açmaz","Hızlandırır","Zod yerine geçer"],"correctIndex":1},{"id":"q_fs_4","prompt":"Çelişen isLoading ve isSuccess?","choices":["SSOT","Yasak birleşim; tek faz gerekir","Normal React","Context zorunlu"],"correctIndex":1},{"id":"q_fs_5","prompt":"props.title çocuktan mutasyon?","choices":["Evet","Hayır; tek yönlü veri","Redux zorunlu","CSS"],"correctIndex":1},{"id":"q_fs_6","prompt":"Zod safeParse başarısızken?","choices":["200","400 + issues","500 ok:true","Yoksay"],"correctIndex":1},{"id":"q_fs_7","prompt":"PostgreSQL $1 nedir?","choices":["Yorum","Parametre yer tutucusu","Tablo adı","JWT"],"correctIndex":1},{"id":"q_fs_8","prompt":"Birleştirmeli SQL riski?","choices":["Hız","Enjeksiyon kapısı","Daha okunur","Zod"],"correctIndex":1},{"id":"q_fs_9","prompt":"Next.js App Router sayfası nerede durur?","choices":["public/","app/.../page.tsx","node_modules","Dockerfile"],"correctIndex":1},{"id":"q_fs_10","prompt":"Boş sepet ödeme başarılı iskeleti?","choices":["Doğru UX","Adres yalanı; reddedilir","SEO","Zod"],"correctIndex":1},{"id":"q_fs_11","prompt":"Express sıra hangisi?","choices":["handler → json","json → validate → handler","SQL → json","CSS → handler"],"correctIndex":1},{"id":"q_fs_12","prompt":"fetch ağı kuruldu diye iş bitti mi?","choices":["Evet","Hayır; res.ok ve gövde okunur","Evet GET’te","Yalnız 201"],"correctIndex":1},{"id":"q_fs_13","prompt":"Number(\"\") tuzağı nedir?","choices":["NaN her zaman","0 olabilir; boş adet geçerli değildir","Hata zorunlu","Infinity"],"correctIndex":1},{"id":"q_fs_14","prompt":"disabled loading iken?","choices":["İkinci Post atılır","Çift tıklama yutulur","Zod açılır","SQL bağlanır"],"correctIndex":1},{"id":"q_fs_15","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1},{"id":"q_fs_16","prompt":"Satın alma belge midir?","choices":["Evet","Hayır; belge sınav barajından sonra","Evet hash","Yalnız vize"],"correctIndex":1},{"id":"q_fs_17","prompt":"TestClient neyi kanıtlar?","choices":["Benim makinemde geçti","Sözleşmenin her sabah aynı kartla koşması","Figma","SEO"],"correctIndex":1},{"id":"q_fs_18","prompt":"5xx gövdede ok:true?","choices":["Dürüst","Yalan; reddedilir","Zod","JWT"],"correctIndex":1},{"id":"q_fs_19","prompt":"Bu eğitim kaç bölüm?","choices":["6","12","3","24"],"correctIndex":1},{"id":"q_fs_20","prompt":"CareerVisaStamp ne zaman?","choices":["Satın alınca","Sınav barajı üstünde","İlk derste","Docker’da"],"correctIndex":1}]$exam_fullstack_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ai_temel',
    'ac_ai_temel',
    'Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi) müfredat sınavı',
    70,
    $exam_ai_temel$[{"id":"q_pow_ai-temel-1","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-10","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-11","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-12","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-2","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-3","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-4","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-5","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-6","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-7","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-8","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ai-temel-9","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_ai_1","prompt":"Bağlam penceresi dolunca sessiz özet?","choices":["Doğru","Uydurma; iş bölünür veya bellek yazılır","Zorunlu","Hızlıdır"],"correctIndex":1},{"id":"q_ai_2","prompt":"«JSON gibi yaz» şema mıdır?","choices":["Evet","Hayır; şema ve parse kapısı gerekir","Zod’suz yeter","CSS"],"correctIndex":1},{"id":"q_ai_3","prompt":"Sır tarife girince?","choices":["Orta değer uydurulur","Üretim kapanır","Log’a yazılır","Few-shot artar"],"correctIndex":1},{"id":"q_ai_4","prompt":"Few-shot örnekleri her istekte değişirse?","choices":["İyidir","Regresyon; örnek sabit kalır","Daha yaratıcı","JSON zorunlu"],"correctIndex":1},{"id":"q_ai_5","prompt":"Getirici boşken model ne yapar?","choices":["Wikipedia basar","Dürüst «belgede yok»; üretim durur","Uydurur","PII ekler"],"correctIndex":1},{"id":"q_ai_6","prompt":"Paydasız yüzde?","choices":["Kanıt","Yalan; payda yazılı olmadan basılmaz","RAG","Token"],"correctIndex":1},{"id":"q_ai_7","prompt":"Boş tutarı 0 yapmak?","choices":["Temizlik","Cehaleti gizler; eksik ayrı durur","int64","SQL"],"correctIndex":1},{"id":"q_ai_8","prompt":"Eşik altı skorla iddia?","choices":["OK","Kapalı; alıntı yoksa cümle yok","Few-shot","JSON"],"correctIndex":1},{"id":"q_ai_9","prompt":"Tarif katmanları hangileri?","choices":["Yalnız kullanıcı","sistem / kullanıcı / biçim","Yalnız JSON","Yalnız RAG"],"correctIndex":1},{"id":"q_ai_10","prompt":"Tablo yokken ortalama istemek?","choices":["Veri bilimi","Boş tezgâh; üretim durur","Pandas zorunlu","Prompt yeter"],"correctIndex":1},{"id":"q_ai_11","prompt":"n=8 yüzde yetmiş?","choices":["Referandum","Vitrin mankeni; n dipnot ister","RAG","JWT"],"correctIndex":1},{"id":"q_ai_12","prompt":"PDF yüklemek okumak mıdır?","choices":["Evet","Hayır; getiri ve alıntı okumaktır","Evet OCR","Token"],"correctIndex":1},{"id":"q_ai_13","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1},{"id":"q_ai_14","prompt":"Satın alma belge midir?","choices":["Evet","Hayır; belge sınav barajından sonra","Evet hash","Yalnız vize"],"correctIndex":1},{"id":"q_ai_15","prompt":"PII log’a girer mi?","choices":["Evet hata ayıklama","Hayır","JSON modunda evet","RAG’te evet"],"correctIndex":1},{"id":"q_ai_16","prompt":"Parse hatasında çökmek?","choices":["Nezaket","Hayır; yeniden sorulur","Zorunlu","Fail-open"],"correctIndex":1},{"id":"q_ai_17","prompt":"Bu eğitim kaç bölüm?","choices":["6","12","3","8"],"correctIndex":1},{"id":"q_ai_18","prompt":"CareerVisaStamp ne zaman?","choices":["Satın alınca","Sınav barajı üstünde","İlk prompt’ta","PDF’te"],"correctIndex":1},{"id":"q_ai_19","prompt":"3D pasta kanıt mıdır?","choices":["Evet","Hayır; süs grafiği reddedilir","n büyükse evet","RAG"],"correctIndex":1},{"id":"q_ai_20","prompt":"Kaynak satırı olmayan RAG cevabı?","choices":["Teslim","Teslim değil","Few-shot yeter","JSON yeter"],"correctIndex":1}]$exam_ai_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_ux_temel',
    'ac_ux_temel',
    'Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass) müfredat sınavı',
    70,
    $exam_ux_temel$[{"id":"q_pow_ux-temel-1","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-10","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-11","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-12","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-2","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-3","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-4","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-5","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-6","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-7","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-8","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_pow_ux-temel-9","prompt":"İş kanıtı (parametre): Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz. Kapı ne zaman açılır?","choices":["Yaklaşık etiket yeter","Her kilit doğru token ile durunca","Boş kilit yorum hakkı doğurur","İstemci kendi kendine geçer"],"correctIndex":1},{"id":"q_ux_1","prompt":"UX ile UI farkı nedir?","choices":["Aynıdır","UX yol/acı, UI yüz/piksel","UI araştırma","UX yalnız renk"],"correctIndex":1},{"id":"q_ux_2","prompt":"Beğeni kabul ölçütü müdür?","choices":["Evet","Hayır; görev tamamlanır","Figma’da evet","WCAG"],"correctIndex":1},{"id":"q_ux_3","prompt":"Yönlendirici araştırma sorusu?","choices":["İyidir","«güzel değil mi» tuzağı; reddedilir","Kart sıralama","Jeton"],"correctIndex":1},{"id":"q_ux_4","prompt":"Stok fotoğraf persona?","choices":["Kanıt","Masal; acı ve iş yazılı durur","Yolculuk","IA"],"correctIndex":1},{"id":"q_ux_5","prompt":"Organigram menü?","choices":["IA","Jargon; kullanıcı dili etiket olur","WCAG","Token"],"correctIndex":1},{"id":"q_ux_6","prompt":"Tel çerçevede palet?","choices":["Erken sadakat","Yasak; tartışma süse kaymasın","Token","Handoff"],"correctIndex":1},{"id":"q_ux_7","prompt":"Kopyala-yapıştır düğme?","choices":["Component","Borç; ana bileşen güncellenmez","Auto layout","8px"],"correctIndex":1},{"id":"q_ux_8","prompt":"Üç birincil düğme?","choices":["Hiyerarşi","Odak kırılır; birincil tek durur","WCAG","Persona"],"correctIndex":1},{"id":"q_ux_9","prompt":"Serbest hex her ekranda?","choices":["Token","Sistem ölür; jeton adı gerekir","Prototype","IA"],"correctIndex":1},{"id":"q_ux_10","prompt":"Statik slayt akış mıdır?","choices":["Evet","Hayır; tıklanır prototip görev test eder","Figma link yeter","WCAG"],"correctIndex":1},{"id":"q_ux_11","prompt":"İkon-only düğme?","choices":["Şık","Etiket yoksa kör kapı","Token","8px"],"correctIndex":1},{"id":"q_ux_12","prompt":"«Figma’da var bakarsınız» teslim mi?","choices":["Evet","Hayır; ölçü ve durum notu gerekir","Prototype yeter","IA yeter"],"correctIndex":1},{"id":"q_ux_13","prompt":"Baraj kaçtır?","choices":["50","70+","100","Yok"],"correctIndex":1},{"id":"q_ux_14","prompt":"Satın alma belge midir?","choices":["Evet","Hayır; belge sınav barajından sonra","Evet hash","Yalnız vize"],"correctIndex":1},{"id":"q_ux_15","prompt":"8px ızgara ne işe yarar?","choices":["Renk","Ritim; rastgele boşluk atölyeyi bozar","SQL","JWT"],"correctIndex":1},{"id":"q_ux_16","prompt":"Bu eğitim kaç bölüm?","choices":["7","12","3","6"],"correctIndex":1},{"id":"q_ux_17","prompt":"CareerVisaStamp ne zaman?","choices":["Satın alınca","Sınav barajı üstünde","İlk Figma’da","Beğenide"],"correctIndex":1},{"id":"q_ux_18","prompt":"Görüşmesiz Figma?","choices":["Hızlı","Tahmin; defter önce gelir","Token","WCAG"],"correctIndex":1},{"id":"q_ux_19","prompt":"Kontrast eşiği süs müdür?","choices":["Evet silinir","Hayır; erişim barajıdır","Yalnız dark mode","IA"],"correctIndex":1},{"id":"q_ux_20","prompt":"Masterclass kapanış paketi?","choices":["Yalnız palet","Kanıt, iskelet, kalıp, baraj, tutanak","Yalnız hex","Yalnız slayt"],"correctIndex":1}]$exam_ux_temel$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (course_id) DO UPDATE
SET
  title = EXCLUDED.title,
  pass_score = EXCLUDED.pass_score,
  questions_json = EXCLUDED.questions_json,
  updated_at = now();

-- HARD RESET: eski RAIL / jenerik tohumları tamamen düşür (büyüme SKU dışı — DELETE/PURGE).
DELETE FROM public.academy_certificates
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel');

DELETE FROM public.academy_exam_attempts
WHERE exam_id IN (
  SELECT id FROM public.academy_exams
  WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
     OR course_id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel')
);

DELETE FROM public.academy_lesson_completions
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel');

DELETE FROM public.academy_purchases
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel');

DELETE FROM public.academy_exams
WHERE course_id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR course_id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel');

DELETE FROM public.academy_courses
WHERE id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_python_orta', 'ac_python_ileri', 'ac_ai_orta', 'ac_ai_ileri', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel')
   OR id NOT IN ('ac_python_temel', 'ac_fullstack_temel', 'ac_ai_temel', 'ac_ux_temel');

DELETE FROM public.price_catalog_entries
WHERE module_key = 'academy'
  AND (
    unit_key IN ('course:rail-temel', 'course:rayli-sinyal-emniyet', 'course:yz-icerik-gorsel-uretim', 'course:ileri-prompt-muhendisligi', 'course:bim-iso-19650', 'course:siber-guvenlik-kvkk-iso-27001', 'course:python-veri-analizi-is-zekasi', 'course:kurumsal-esg-surdurulebilirlik', 'course:agile-scrum-masterlik', 'course:bulut-mimarisi-devops', 'course:ui-ux-design-systems', 'course:fintek-acik-bankacilik', 'course:python-orta', 'course:python-ileri', 'course:ai-orta', 'course:ai-ileri', 'course:fullstack-orta', 'course:fullstack-ileri', 'course:devops-temel', 'course:devops-orta', 'course:devops-ileri', 'course:flutter-temel', 'course:flutter-orta', 'course:flutter-ileri', 'course:ds-temel', 'course:ds-orta', 'course:ds-ileri', 'course:sec-temel', 'course:sec-orta', 'course:sec-ileri', 'course:db-temel', 'course:db-orta', 'course:db-ileri', 'course:arch-temel', 'course:arch-orta', 'course:arch-ileri', 'course:pm-temel', 'course:pm-orta', 'course:pm-ileri', 'course:ux-orta', 'course:ux-ileri', 'course:w3-temel', 'course:w3-orta', 'course:w3-ileri', 'course:ex-temel', 'course:ex-orta', 'course:ex-ileri', 'course:mkt-temel', 'course:mkt-orta', 'course:mkt-ileri', 'course:mnt-temel', 'course:mnt-orta', 'course:mnt-ileri', 'course:pd-temel', 'course:pd-orta', 'course:pd-ileri', 'course:cld-temel', 'course:cld-orta', 'course:cld-ileri', 'course:eng-temel', 'course:eng-orta', 'course:eng-ileri', 'course:qa-temel', 'course:qa-orta', 'course:qa-ileri', 'course:jav-temel', 'course:jav-orta', 'course:jav-ileri', 'course:rn-temel', 'course:rn-orta', 'course:rn-ileri', 'course:gam-temel', 'course:gam-orta', 'course:gam-ileri', 'course:mlo-temel', 'course:sys-temel', 'course:canva-temel', 'course:pra-temel', 'course:linkedin-temel', 'course:cad-temel')
    OR (
      unit_key LIKE 'course:%'
      AND unit_key NOT IN ('course:python-temel', 'course:fullstack-temel', 'course:ai-temel', 'course:ux-temel')
    )
  );
