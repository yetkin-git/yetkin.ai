-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).

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
    'cat_academy_course_rail_temel',
    'academy',
    'course:rail-temel',
    'MINOR',
    25000,
    'TRY',
    true,
    25000,
    25000,
    'Akademi kurs birim fiyatı — Yetkin Rail: Tek Nakit Defter ve Settlement (S11-A).',
    TIMESTAMP '2026-08-14 09:00:00',
    TIMESTAMP '2026-08-14 09:00:00'
  ),
  (
    'cat_academy_course_ray_sinyal',
    'academy',
    'course:rayli-sinyal-emniyet',
    'MINOR',
    49000,
    'TRY',
    true,
    49000,
    49000,
    'Akademi kurs birim fiyatı — Raylı Sistemler: Sinyal, Emniyet ve Anklaşman Temeli (S11-A).',
    TIMESTAMP '2026-08-14 09:00:00',
    TIMESTAMP '2026-08-14 09:00:00'
  ),
  (
    'cat_academy_course_yz_icerik',
    'academy',
    'course:yz-icerik-gorsel-uretim',
    'MINOR',
    25000,
    'TRY',
    true,
    25000,
    25000,
    'Akademi kurs birim fiyatı — Yapay Zekâ Destekli İçerik ve Görsel Üretim (S11-A).',
    TIMESTAMP '2026-08-17 09:00:00',
    TIMESTAMP '2026-08-17 09:00:00'
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
  is_published,
  created_at,
  updated_at
)
VALUES
  (
    'ac_rail_temel',
    'rail-temel',
    'Yetkin Rail: Tek Nakit Defter ve Settlement',
    'Mühürlü emek muhasebesi: amountMinor, CheckoutPriceLock, anında settlement. Satın al öğrenme kaydıdır; ustalık belgesi sınav kapısıdır.',
    'course:rail-temel',
    true,
    TIMESTAMP '2026-08-14 09:01:00',
    TIMESTAMP '2026-08-14 09:01:00'
  ),
  (
    'ac_ray_sinyal',
    'rayli-sinyal-emniyet',
    'Raylı Sistemler: Sinyal, Emniyet ve Anklaşman Temeli',
    'Teknik işletme müfredatı: fail-safe, anklaşman, ray devresi ve kırmızı aspekt. Mühendislik yetkinliği sınavla mühürlenir.',
    'course:rayli-sinyal-emniyet',
    true,
    TIMESTAMP '2026-08-14 09:00:00',
    TIMESTAMP '2026-08-14 09:00:00'
  ),
  (
    'ac_yz_icerik_gorsel',
    'yz-icerik-gorsel-uretim',
    'Yapay Zekâ Destekli İçerik ve Görsel Üretim',
    'Ticari dikey sınavı: brief okuma, telif/kullanım hakları, prompt disiplini, revizyon yönetimi, teslim şartnamesi. Satın al öğrenme kaydıdır; SHA-256 belge baraj 70 sonrası basılır.',
    'course:yz-icerik-gorsel-uretim',
    true,
    TIMESTAMP '2026-08-17 09:02:00',
    TIMESTAMP '2026-08-17 09:02:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
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
    'exam_rail_temel',
    'ac_rail_temel',
    'Rail temeli müfredat sınavı',
    70,
    $exam_rail_temel$[{"id":"q_rail_temel_1","prompt":"Yetkin Rail nakit tutarını hangi birimde tutar?","choices":["float TL","amountMinor","wei","kuruş string"],"correctIndex":1},{"id":"q_rail_temel_2","prompt":"Kurs satın alma anında ustalık belgesi basılır mı?","choices":["Evet, settlement ile birlikte","Hayır; belge müfredat sınavı ≥70 sonrası basılır","Yalnız Super Admin basar","İade sonrası otomatik basılır"],"correctIndex":1},{"id":"q_rail_temel_3","prompt":"Akademi kurs ödemesinde emanet (escrow) var mıdır?","choices":["Evet, teslim teyidine kadar","Hayır; anında settlement, tutar platform hazinesine geçer","Yalnız 15 gün emanet","Hold bps kadar emanet"],"correctIndex":1},{"id":"q_rail_temel_4","prompt":"CheckoutPriceLock süresi nedir?","choices":["1 dakika","15 dakika","24 saat","Süresiz"],"correctIndex":1}]$exam_rail_temel$,
    TIMESTAMP '2026-08-14 09:01:00',
    TIMESTAMP '2026-08-14 09:01:00'
  ),
  (
    'exam_ray_sinyal',
    'ac_ray_sinyal',
    'Sinyal ve emniyet müfredat sınavı',
    70,
    $exam_ray_sinyal$[{"id":"q_ray_sinyal_1","prompt":"Anklaşman (interlocking) temel görevi nedir?","choices":["Hız rekoru tutmak","Çelişen güzergâhları aynı anda kilitlememek","Bilet satmak","Trafo gerilimini yükseltmek"],"correctIndex":1},{"id":"q_ray_sinyal_2","prompt":"Fail-safe sinyal ilkesi hangisidir?","choices":["Arıza yeşil yakar","Arıza en kısıtlayıcı (kırmızı / dur) duruma düşer","Arıza hattı kapatmaz","Arıza sarı yakmak zorundadır"],"correctIndex":1},{"id":"q_ray_sinyal_3","prompt":"Ray devresi (track circuit) neyi tespit eder?","choices":["Yolcu sayısını","Kesimde tren varlığını","Bilet türünü","Hava sıcaklığını"],"correctIndex":1},{"id":"q_ray_sinyal_4","prompt":"Kırmızı aspektin işletme anlamı nedir?","choices":["Geçilebilir","Dur — güzergâh kapalı veya korunuyor","Hızlan","Makas serbest"],"correctIndex":1}]$exam_ray_sinyal$,
    TIMESTAMP '2026-08-14 09:00:00',
    TIMESTAMP '2026-08-14 09:00:00'
  ),
  (
    'exam_yz_icerik_gorsel',
    'ac_yz_icerik_gorsel',
    'YZ içerik ve görsel üretim müfredat sınavı',
    70,
    $exam_yz_icerik_gorsel$[{"id":"q_yz_icerik_1","prompt":"Brief hem yalnız iki ikon hem her oda için ayrı ikon (12 oda) der. Usta ne yapar?","choices":["12 ikon üretir; ikinci cümle geçerlidir","2 ikon üretir; sayı tavanıdır","Üretimi durdurur; çelişki yazılı netleşmeden Studio jetonu düşülmez","Ortayı (7 ikon) teslim eder"],"correctIndex":2},{"id":"q_yz_icerik_2","prompt":"Brief ticari kullanım, coğrafya ve süre yazmaz. Üretim başlar mı?","choices":["Evet; yapay zekâ çıktısı kamu malıdır","Evet; Studio jetonu düşünce hak müşteriye geçer","Hayır; hak belirsizse üretim fail-closed durur","Hayır; yalnız Super Admin onayından sonra"],"correctIndex":2},{"id":"q_yz_icerik_3","prompt":"Revizyon turunda usta, onaylı prompt paketindeki negatif kısıtı sessizce siler. Bu nedir?","choices":["İyi niyetli iyileştirme","Spec ihlali; paket kilitli kalır, delta yazılı onay ister","Studio'nun beklenen kullanımı","Teslim şartnamesinin parçası"],"correctIndex":1},{"id":"q_yz_icerik_4","prompt":"Müşteri daha pop yapsana der. Geçerli davranış hangisidir?","choices":["Doygunluğu artırıp teslim etmek","Yeni bir model denemek","Filigran eklemek","İsteği ölçülebilir kısıta çevirmeden üretim yapmamak"],"correctIndex":3},{"id":"q_yz_icerik_5","prompt":"DELIVERY mesajında artifact URL var, dosya SHA-256 yok. Teslim tam mıdır?","choices":["Evet; URL yeter","Evet; Studio content_hash otomatik basılır, usta yazmaz","Hayır; her dosya için SHA-256 (content_hash) şartnamede zorunludur","Hayır; yalnız PDF hash yeter"],"correctIndex":2},{"id":"q_yz_icerik_6","prompt":"Rail tanıtım banner'ında lucide ikon, geist font ve dekoratif ilerleme çubuğu kullanılır. Neden düşer?","choices":["Quiet Luxury kanıt dilbilgisidir; hazır ikon ve süs iddia üretir, mühür taşımaz","Lisans pahalıdır","Next.js 16 bunları yasaklar","Yalnız koyu tema zorunludur"],"correctIndex":0},{"id":"q_yz_icerik_7","prompt":"Brief şu yaşayan illustratörün tarzında, ticari ikon seti der. Doğru davranış?","choices":["Üret; model o stili zaten biliyor","Reddet veya tarzı geometri / palet / ızgara kısıtına indirgemeden ticari teslim yapma","Yalnız filigran ekle","Kamu malı say ve teslim et"],"correctIndex":1},{"id":"q_yz_icerik_8","prompt":"Akademi özet metninde cüzdanınızı yükleyin geçer. Usta ne yapar?","choices":["Bırakır; resmi hitap güven verir","Yalnız başlığı düzeltir","İngilizceye çevirir","SEN aksına çeker: satıcı-müşteri hitabı yasaktır, lonca sen der"],"correctIndex":3},{"id":"q_yz_icerik_9","prompt":"Birinci tur sonrası müşteri altı yeni en-boy oranı ister, bütçe aynı. Ne olur?","choices":["Ücretsiz revizyon; oran değişikliği stil işidir","Yeni brief ve emanet farkı olmadan üretilmez","DevLabs exec ile toplu basılır","Yalnız ilk üç oran ücretsizdir"],"correctIndex":1},{"id":"q_yz_icerik_10","prompt":"Prompt şablonu dokümanında bu komutu sunucuda çalıştır örneği vardır. Rail'de doğru ifade?","choices":["DevLabs runner'dır; exec açıktır","Studio exec'i DevLabs'a devreder","DevLabs linter'dır, exec yoktur; şablon üretimi tarif eder, çalıştırmaz","Super Admin exec açabilir"],"correctIndex":2},{"id":"q_yz_icerik_11","prompt":"Bu dikeyin akademi kurs bedeli emanete alınır mı?","choices":["Hayır; akademi anında settlement, tutar hazineye geçer; emanet freelancer işindedir","Evet; sınav geçilince RELEASE","Hold bps kadar emanet","15 gün emanet"],"correctIndex":0},{"id":"q_yz_icerik_12","prompt":"Sınav 70 puanın altında. SHA-256 ustalık belgesi basılır mı?","choices":["Evet; satın alma yeter","Hayır; belge yalnız baraj (70) ve müfredat mührü ile basılır","Super Admin elle basar","50 puan yeter, hash sonra eklenir"],"correctIndex":1}]$exam_yz_icerik_gorsel$,
    TIMESTAMP '2026-08-17 09:02:00',
    TIMESTAMP '2026-08-17 09:02:00'
  )
ON CONFLICT (course_id) DO UPDATE
SET
  title = EXCLUDED.title,
  pass_score = EXCLUDED.pass_score,
  questions_json = EXCLUDED.questions_json,
  updated_at = now();
