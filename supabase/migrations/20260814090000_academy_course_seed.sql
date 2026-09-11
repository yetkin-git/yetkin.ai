-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).
-- Kaynak sicil: lib/academy/seed.ts — 5 ingest edilmiş kanon SKU.
-- Eski SKU: is_published=false + fiyat is_active=false. Lisans / mühür / satın alma DROP yok.

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
    'Akademi kurs birim fiyatı — İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
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
    'Akademi kurs birim fiyatı — E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
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
    'Akademi kurs birim fiyatı — Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
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
    'Akademi kurs birim fiyatı — Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress) (S11-A).',
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
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
    'Akademi kurs birim fiyatı — Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity) (S11-A).',
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
    'ac_01_office_ai',
    '01_office_ai',
    'İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu)',
    'Ofiste yapay zekâ devrimi: Excel formül sihirbazlığı, profesyonel Word raporlama, PowerPoint sunum hazırlama, Outlook e-posta otomasyonu ve kurumsal KVKK etiği.',
    'course:01_office_ai',
    1,
    1,
    1,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_02_ecommerce_ai',
    '02_ecommerce_ai',
    'E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)',
    'Pazaryeri satıcısı için yapay zekâ: SEO başlık, ürün açıklaması, yorum analitiği, Buybox/fiyat ve iade kriz protokolü.',
    'course:02_ecommerce_ai',
    2,
    1,
    2,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_03_social_media_ai',
    '03_social_media_ai',
    'Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut)',
    'Reels, TikTok ve ürün görseli fabrikası: Midjourney, Runway, Kling ve CapCut ile dakikalar içinde yayınlık içerik.',
    'course:03_social_media_ai',
    3,
    1,
    3,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_04_chatbot_nocode',
    '04_chatbot_nocode',
    'Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)',
    'Kod yazmadan WhatsApp ve web chatbot: Voiceflow & Botpress ile 7/24 randevu, SSS ve satış asistanı.',
    'course:04_chatbot_nocode',
    4,
    1,
    4,
    true,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'ac_05_prompt_practice',
    '05_prompt_practice',
    'Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)',
    'ChatGPT, Claude ve Perplexity ile günlük üretkenlik: doğru tarif, ödev, araştırma ve metin hızı.',
    'course:05_prompt_practice',
    5,
    1,
    5,
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
    'exam_01_office_ai',
    'ac_01_office_ai',
    'İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu) müfredat sınavı',
    70,
    $exam_01_office_ai$[{"id":"q_off_1","prompt":"Ofiste yapay zekâyı konumlandırırken pedagojik olarak en doğru yaklaşım nedir?","choices":["Mühendislik düzeyinde kodlama gerektiren karmaşık bir yazılım","Masada oturan ve doğru talimatlarla çalışan akıllı bir dijital stajyer","Tüm kararları insansız alan otonom bir yönetici","Sadece grafik ve resim çizen bir tasarım aracı"],"correctIndex":1},{"id":"q_off_2","prompt":"Excel'de karmaşık bir formül (örn. ÇOKETOPLA) yazdırmak için yapay zekâya nasıl bir girdi verilmelidir?","choices":["Sadece 'bana formül yaz' demek","Tablonun sütun başlıklarını, koşulları ve beklenen sonucu doğal dille açıkça tarif etmek","Önce Python ile script yazıp sonra Excel'e yapıştırmak","Tüm hücreleri tek tek metin olarak sohbet kutusuna yapıştırmak"],"correctIndex":1},{"id":"q_off_3","prompt":"Excel'de bir formül '#BAŞV!' (#REF!) hatası veriyorsa yapay zekâya bunu onartmanın en pratik yolu nedir?","choices":["Excel'i kapatıp baştan kurmak","Bozuk formülü, ilgili sütunların yerini ve hatayı tarif ederek hatanın kök nedenini sormak","Formülü tamamen silip değerleri elle girmek","Sadece 'çalışmıyor' yazıp beklemek"],"correctIndex":1},{"id":"q_off_4","prompt":"Farklı kaynaklardan gelen kaymış metinleri ve yapışık isim-telefon listelerini temizlemek için yapay zekâdan ne istenebilir?","choices":["Tek tek elle ayrıştırmak","Ayrıştırma kuralını belirterek veriyi standart sütunlara bölen tablo veya kodsuz regex deseni üretmesini istemek","Tüm verileri silip sıfırdan toplamak","Veriyi PDF yapıp bırakmak"],"correctIndex":1},{"id":"q_off_5","prompt":"30 sayfalık bir sözleşmeyi yapay zekâya analiz ettirirken hangi yaklaşım en güvenli ve verimlidir?","choices":["Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenmek","Tazminat, fesih, cezai şartlar gibi kritik maddelere odaklı 'Yönetici Özeti' ve 'Risk Analizi' talep etmek","Sözleşmeyi sosyal medyada paylaşmak","Sadece ilk sayfayı yüklemek"],"correctIndex":1},{"id":"q_off_6","prompt":"PowerPoint sunumu hazırlarken yapay zekâdan nasıl yararlanılır?","choices":["Sadece rastgele resimler indirmek","Rapor veya konu başlığından slayt slayt başlık, madde ve konuşmacı notları çıkarıp VBA makrosuyla tek tıkla slaytlara dökmek","PowerPoint yerine düz metin dosyası açmak","Sunum yapmaktan vazgeçmek"],"correctIndex":1},{"id":"q_off_7","prompt":"Yüzlerce okunmamış e-posta biriktiğinde yapay zekânın rolü ne olmalıdır?","choices":["Bütün mailleri okumadan silmek","E-posta zincirini özetletmek, acil aksiyon maddelerini ve diplomatik yanıt taslaklarını hazırlatmak","Gelen tüm maillere otomatik 'tamam' yanıtı göndermek","Sunucunun fişini çekmek"],"correctIndex":1},{"id":"q_off_8","prompt":"Müşteri e-postalarını veya şirket verilerini yapay zekâya aktarırken KVKK gereği ilk adım ne olmalıdır?","choices":["Hiçbir değişiklik yapmadan aktarmak","Şahıs isimleri, TC kimlik no, telefon, IBAN gibi kişisel verileri maskelemek ([Müşteri A], [IBAN X])","Verileri herkese açık bir blogda yayınlamak","Sadece şifreleri kaldırmak"],"correctIndex":1},{"id":"q_off_9","prompt":"Şirketin kamuya açıklanmamış finansal bilançoları veya ticari sırları yapay zekâya nasıl beslenmelidir?","choices":["Genel açık sohbetlere ham metin olarak yapıştırılmalıdır","Genel açık yapay zekâ sohbetlerine asla açık metin olarak beslenmemeli, ticari sırlar korunmalıdır","Rakiplere e-posta ile gönderilmelidir","Her gün düzenli olarak paylaşılmalıdır"],"correctIndex":1},{"id":"q_off_10","prompt":"Yapay zekânın ürettiği resmi bir dilekçe veya teklif mektubunda 'halüsinasyon' riskine karşı kural nedir?","choices":["Yapay zekâ asla hata yapmaz, doğrudan gönderilir","Yapay zekâ taslak hazırlar; tarih, rakam ve kanun maddelerini insan gözü denetler, imzayı ve sorumluluğu insan taşır","Sorumluluk tamamen yapay zekâ şirketine aittir","Metin kısaysa doğrulamaya gerek yoktur"],"correctIndex":1},{"id":"q_off_11","prompt":"Sertifika almak için Yetkin Akademi'de sınav barajı kaçtır?","choices":["50 puan","70 puan ve üzeri","100 puan tam not","Baraj yoktur, satın alan herkes doğrudan alır"],"correctIndex":1},{"id":"q_off_12","prompt":"Yetkin Akademi'de sertifika ne zaman hak edilir?","choices":["Eğitim satın alındığı anda","Müfredat tamamlanıp sertifika sınavında baraj puanı (≥70) geçildiğinde","İlk derse tıklandığında","Özet PDF indirildiğinde"],"correctIndex":1},{"id":"q_off_13","prompt":"Yapay zekâya 'bana bir rapor yaz' demek neden zayıf bir tariftir?","choices":["Çünkü yapay zekâ Türkçe anlamaz","Çünkü alıcı, amaç, biçim ve kısıt yoksa stajyer genel geçer metin üretir","Çünkü rapor ancak Excel'de yazılır","Çünkü tarif her zaman en az 2000 kelime olmalıdır"],"correctIndex":1},{"id":"q_off_14","prompt":"Toplantı notunu aksiyon planına çevirirken tarife ne eklenmelidir?","choices":["Yalnızca 'özetle' demek","Karar, sorumlu, son tarih ve sonraki adım sütunlarını açıkça istemek","Notu silip yeniden yazmak","Toplantıyı kaydetmeden geçmek"],"correctIndex":1},{"id":"q_off_15","prompt":"Excel'de DÜŞEYARA (VLOOKUP) yazdırırken hangi bilgi zorunludur?","choices":["Sadece tablo rengi","Aranan değer, arama aralığı, dönecek sütun ve tam/yaklaşık eşleşme tercihi","Yalnızca dosya adı","PowerPoint slayt sayısı"],"correctIndex":1},{"id":"q_off_16","prompt":"Tarihleri ve para birimlerini standartlaştırmak için yapay zekâya ne verilmelidir?","choices":["Rastgele örnek satırlar ve hedef format (GG.AA.YYYY, TL)","Sadece 'düzelt' demek","Tüm çalışma kitabını silmek","Makroyu devre dışı bırakmak"],"correctIndex":1},{"id":"q_off_17","prompt":"Word'de resmi dilekçe üretirken en doğru iş bölümü hangisidir?","choices":["Yapay zekâ imzalar, insan bakmaz","Yapay zekâ taslak yazar; unvan, tarih, sayı ve hitap insan denetimindedir","Dilekçe sosyal medyada yayınlanır","Yalnızca İngilizce yazılır"],"correctIndex":1},{"id":"q_off_18","prompt":"Uzun bir rapordan yönetici özeti isterken hedef kitle nasıl belirtilir?","choices":["Belirtilmez, model tahmin eder","Alıcı rolü (genel müdür, finans) ve beklenen madde sayısı yazılır","Sadece ilk paragraf kopyalanır","Rapor PDF'e çevrilip bırakılır"],"correctIndex":1},{"id":"q_off_19","prompt":"PowerPoint konuşmacı notları için yapay zekâdan ne istenmelidir?","choices":["Slayt başına 1-2 dakikalık konuşma iskeleti ve geçiş cümlesi","Sadece rastgele emoji","Slaytları silmek","Videoya dönüştürmek"],"correctIndex":1},{"id":"q_off_20","prompt":"Boş slayt sendromunu kırmak için ilk tarife ne konur?","choices":["Konu, süre, kitle ve slayt sayısı","Sadece 'güzel olsun'","Şirket logosunun piksel boyutu","Yazıcı ayarı"],"correctIndex":1},{"id":"q_off_21","prompt":"Gelen kutusunu önceliklendirirken yapay zekâya hangi etiketler verilebilir?","choices":["Acil / bu hafta / bilgi amaçlı gibi açık kovalar","Hepsini sil","Otomatik 'tamam' yanıtı","Sunucu kapat"],"correctIndex":1},{"id":"q_off_22","prompt":"Gergin müşteri şikayetine diplomatik yanıtta ilk kural nedir?","choices":["Suçlamak ve tehdit etmek","Duyguyu tanımak, somut adım ve süre vermek; hakaret etmemek","Müşteriyi engellemek","İç yazışmayı olduğu gibi iletmek"],"correctIndex":1},{"id":"q_off_23","prompt":"Kişisel verileri maskelemede hangisi doğrudur?","choices":["TC, telefon, IBAN ve isimleri takma değerlerle değiştirmek","Hiçbir şey değiştirmemek","Veriyi herkese açık sohbete yapıştırmak","Sadece soyadı silmek"],"correctIndex":1},{"id":"q_off_24","prompt":"Ticari sır içeren bilanço yapay zekâya nasıl verilmez?","choices":["Genel açık sohbete ham metin olarak","İç politika ve onaylı kurumsal araç ile, gerekirse özetlenerek","Rakibe e-posta ile","Sosyal medyada paylaşarak"],"correctIndex":1},{"id":"q_off_25","prompt":"Yapay zekânın uydurduğu kanun maddesi görülürse ne yapılır?","choices":["Doğrudan gönderilir","İnsan resmi kaynağı kontrol eder; uydurma madde silinir veya düzeltilir","Sorumluluk modele bırakılır","Metin kısaysa geçilir"],"correctIndex":1},{"id":"q_off_26","prompt":"İki sütunu birleştirip 'Ad Soyad' üretmek için doğru tarife örneği nedir?","choices":["Kaynak sütunları, ayırıcı (boşluk) ve hedef sütun adını belirtmek","Sadece 'birleştir' yazmak","Satırları elle kopyalamak","Dosyayı PDF yapmak"],"correctIndex":1},{"id":"q_off_27","prompt":"Bozuk formülü onartırken ekran görüntüsü yerine ne tarif edilir?","choices":["Formül metni, hata kodu ve ilgili sütun başlıkları","Sadece 'çalışmıyor'","Excel sürüm numarası tek başına","Yazıcı kuyruğu"],"correctIndex":1},{"id":"q_off_28","prompt":"Ofiste yapay zekâ kullanımının pedagojik vaadi nedir?","choices":["Kod yazmadan rutin işi stajyere devredip stratejiye zaman açmak","Tüm kararları insansız almak","İnsanı işten çıkarmak","Sadece resim çizmek"],"correctIndex":1},{"id":"q_off_29","prompt":"Sınavda barajı geçmek için müfredat tamamlanmış olsa bile ne gerekir?","choices":["Sunucuda puanlanan testte 70 ve üzeri","Satın alma makbuzu","İlk derse tıklamak","PDF indirmek"],"correctIndex":1},{"id":"q_off_30","prompt":"Compact makale dersinde canlı TTS neden çağrılmaz?","choices":["İzleme anında harici ses maliyeti yoktur; mühürlü WAV yoksa sahte 'üretiliyor' da yok","Tarayıcı sesi yasaktır","Kart ağı ses ister","Sınav sesli olmak zorundadır"],"correctIndex":1}]$exam_01_office_ai$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_02_ecommerce_ai',
    'ac_02_ecommerce_ai',
    'E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify) müfredat sınavı',
    70,
    $exam_02_ecommerce_ai$[{"id":"q_ec_1","prompt":"E-ticarette yapay zekânın pedagojik olarak en doğru konumlandırılması hangisidir?","choices":["Süslü tanıtım metinleri yazan bir edebiyat stajyeri","Mağazanın 7/24 çalışan kıdemli operasyon ve satış müdürü","Sadece görsel üreten bir tasarım aracı","Fiyatı otomatik kıran bir indirim robotu"],"correctIndex":1},{"id":"q_ec_2","prompt":"Pazaryeri uyumlu SEO başlığı hangi hiyerarşiyle kurulur?","choices":["Duygusal slogan + marka hikâyesi + kampanya cümlesi","Bulunan tüm anahtar kelimeler arka arkaya dizilir","[Marka/Tip] + [Ana Ürün Tanımı] + [Model/Kapasite] + [En Çarpıcı 2 Teknik Fayda] + [Renk/Materyal]","Sadece barkod numarası ve fiyat yazılır"],"correctIndex":2},{"id":"q_ec_3","prompt":"Vitrin maddeleri (bullet points) neden kalın fayda başlığı ve tek cümlelik kanıtla yazılır?","choices":["Müşterilerin yaklaşık %85'i mobilden alışveriş yapar; uzun paragraflar okunmaz","Pazaryeri panelleri kalın yazıyı teknik olarak zorunlu tutar","Kalın yazı kargo ücretini düşürür","Algoritma yalnızca emoji içeren metinleri indeksler"],"correctIndex":0},{"id":"q_ec_4","prompt":"'İade önleyici kullanım notu'nun (örn. LED kapağın elde yıkanması uyarısı) işlevi nedir?","choices":["Müşteriyi ürünü almaktan caydırmak","Kargo teslim süresini uzatmak","Garanti kapsamını daraltmak","Yanlış kullanım kaynaklı 1 yıldızlı yorumu ve iadeyi baştan önlemek"],"correctIndex":3},{"id":"q_ec_5","prompt":"Yapay zekâ istemlerinde ticari sır koruması nasıl sağlanır?","choices":["Maliyet, tedarikçi adı ve kâr marjı prompt'a açıkça yazılır","Maliyet ve tedarikçi bilgisi maskelenir; [Birim Maliyet] gibi sembolik terimler kullanılır","Tedarikçi faturası sohbete fotoğraf olarak yüklenir","Ticari sırlar yalnızca sosyal medyada paylaşılır"],"correctIndex":1},{"id":"q_ec_6","prompt":"'Özellik değil, fayda' yaklaşımında hangisi FAYDA cümlesidir?","choices":["İç gövde SUS 304 paslanmaz çeliktir","Ürün 500 ml hacme sahiptir","Sabah demlediğiniz kahve akşamüstü bile ilk anki lezzetiyle kalır; metal koku yapmaz","Dış kaplama mat siyah renklidir"],"correctIndex":2},{"id":"q_ec_7","prompt":"AIDA satış şablonunun doğru sıralaması nedir?","choices":["Dikkat → İlgi → Arzu → Eylem","Arzu → Dikkat → Eylem → İlgi","Eylem → Arzu → İlgi → Dikkat","İlgi → Eylem → Dikkat → Arzu"],"correctIndex":0},{"id":"q_ec_8","prompt":"PAS modelinde 'A' harfi neyi temsil eder?","choices":["Analiz","Reklam (Advertisement)","Agitation — problemin yarattığı stresi büyütme","Aksiyon"],"correctIndex":2},{"id":"q_ec_9","prompt":"Anahtar kelime doldurma (keyword stuffing) neden yasaktır?","choices":["Pazaryeri ve Google'ın NLP algoritmaları spam'i yakalar; mağaza geri plana itilir ve müşteri güveni kırılır","Sayfa yüklenme hızını artırır","Kargo maliyetini yükseltir","Yasak değildir; her listenin altına kelime bulutu eklenmelidir"],"correctIndex":0},{"id":"q_ec_10","prompt":"Anahtar kelime kümeleme (keyword clustering) hangi 4 katmandan oluşur?","choices":["Renk, beden, fiyat, stok","Ana tohum terimler, nitelik/long-tail terimler, kullanım senaryosu (intent) terimleri, sorun çözme terimleri","Başlık, alt başlık, dipnot, kaynakça","Marka, rakip, tedarikçi, kargo"],"correctIndex":1},{"id":"q_ec_11","prompt":"Müşteri yorumlarına duygu analizi (sentiment analysis) yaptırmanın temel amacı nedir?","choices":["Olumsuz yorum yazan müşterileri tespit edip engellemek","Yorum sayısını yapay olarak şişirmek","Rakip mağazaların yorumlarını sildirmek","Kronik ürün kusurlarını ve iade kök nedenlerini saniyeler içinde teşhis etmek"],"correctIndex":3},{"id":"q_ec_12","prompt":"1 yıldızlı öfkeli bir yoruma yazılan diplomatik yanıt aslında kime yazılır?","choices":["Yalnızca şikâyet eden müşteriye","Pazaryeri algoritmasına","O yorumu okuyacak sonraki yüzlerce potansiyel alıcıya","Kargo firmasına"],"correctIndex":2},{"id":"q_ec_13","prompt":"Pazaryeri yorum ve soru-cevap alanlarında kesinlikle yasak olan nedir?","choices":["Empati cümlesi kurmak","Telefon, WhatsApp, e-posta veya harici link paylaşmak","Ürünün arkasında durduğunu belirtmek","Ücretsiz parça telafisi önermek"],"correctIndex":1},{"id":"q_ec_14","prompt":"Kapalı döngü (closed-loop) soru-cevap otomasyonu nedir?","choices":["Gelen her sorunun silinmesi","Sorular yanıtlandıktan sonra tekrarlananların ürün açıklamasına SSS bloğu olarak gömülüp soru yükünün azaltılması","Müşterinin başka satıcıya yönlendirilmesi","Soru panelinin tamamen kapatılması"],"correctIndex":1},{"id":"q_ec_15","prompt":"'5 yıldız verirseniz kupon hediye' tarzı yorum teşviki neden yasaktır?","choices":["Kupon maliyeti kârı düşürür","Yasak değildir; standart pazarlama yöntemidir","Tüketiciyi yanıltma sayılır; liste askıya alınabilir","Algoritma kupon kelimesini tanımaz"],"correctIndex":2},{"id":"q_ec_16","prompt":"Buybox nedir?","choices":["Pazaryerinin depo kiralama hizmeti","Aynı üründe 'Sepete Ekle' butonunu tek satıcıya veren ve satışların %80-85'ini toplayan altın kutu","Müşteri iade formu","Kargo takip ekranı"],"correctIndex":1},{"id":"q_ec_17","prompt":"'Dibe doğru yarış' (race to the bottom) neyle sonuçlanır?","choices":["Kalıcı müşteri sadakatiyle","Pazaryeri komisyonunun düşmesiyle","Ciro şişer ancak komisyon, kargo ve maliyet sonrası net kâr sıfırlanır veya zarara döner","Mağaza puanının otomatik yükselmesiyle"],"correctIndex":2},{"id":"q_ec_18","prompt":"Bundle (değer paketi) stratejisinin Buybox açısından en kritik avantajı nedir?","choices":["Kargo ücretini sıfırlaması","Rakibin listesine sızmaya izin vermesi","Komisyon oranını düşürmesi","Kendine ait yeni barkod/liste yarattığı için Buybox'ın tek ve mutlak sahibi olmayı sağlaması"],"correctIndex":3},{"id":"q_ec_19","prompt":"Termos seti simülasyonunda satış fiyatı 269 TL'ye çekilirse (maliyet 170 TL, komisyon %20, kargo 45 TL, vergi ~%5) sonuç ne olur?","choices":["Sipariş başına yaklaşık 13 TL net zarar — kırmızı çizgi ihlali","Sipariş başına yaklaşık 77 TL net kâr","Sipariş başına yaklaşık 32 TL net kâr","Komisyon sıfırlandığı için kâr değişmez"],"correctIndex":0},{"id":"q_ec_20","prompt":"Otomatik fiyatlandırıcı (repricer) kullanırken olmazsa olmaz kural nedir?","choices":["Rakibin hep 1 TL altına inme kuralı","Stop-loss / taban fiyat kilidi konmadan dinamik fiyat kuralı asla açılmaz","Fiyatın her gece 00:00'da sıfırlanması","Tüm rakiplerin platforma şikâyet edilmesi"],"correctIndex":1},{"id":"q_ec_21","prompt":"Pazaryeri arama sonuçlarında müşterinin bir ürüne tıklayıp tıklamama kararı ortalama ne kadar sürer?","choices":["Yaklaşık 0.8 saniye — ilk görsel belirleyicidir","Yaklaşık 8 dakika","Yaklaşık 30 saniye — tüm açıklama okunur","Karar her zaman bir gün bekletilip fiyata göre verilir"],"correctIndex":0},{"id":"q_ec_22","prompt":"Pazaryerlerinde ana görsel (1. görsel) kuralı nedir?","choices":["Kampanya sloganı ve fiyat etiketiyle dolu olmalıdır","Yaşam tarzı (lifestyle) sahnesi zorunludur","Saf/temiz zemin ister; lifestyle ve infografikler 2. görselden itibaren kullanılır","Tedarikçi logosu büyük puntoyla basılmalıdır"],"correctIndex":2},{"id":"q_ec_23","prompt":"Galerideki milimetrik ölçü şeması (örn. 7 cm taban çapı) hangi problemi baştan çözer?","choices":["Ürünün SEO başlığını uzatır","'Araç bardaklığına sığmadı' kaynaklı iade ve 1 yıldızları önler","Kargo desi ücretini düşürür","Rakip fiyatlarını gizler"],"correctIndex":1},{"id":"q_ec_24","prompt":"TikTok / Instagram Reels satış videosunda altın kural nedir?","choices":["İlk 3 saniyede parmağı durduran kanca (hook); 'merhaba arkadaşlar' açılışıyla başlanmaz","Video en az 10 dakika olmalıdır","Önce şirket tarihçesi anlatılmalıdır","Hashtag kullanımı yasaktır"],"correctIndex":0},{"id":"q_ec_25","prompt":"Yapay zekâyla üretilen görselde üründe gerçekte olmayan bir özellik (örn. Bluetooth simgesi) gösterilirse ne olur?","choices":["Dönüşüm oranı artar, risk yoktur","Algoritma ürünü öne çıkarır","Müşteri görseli beğenirse iade hakkını kaybeder","'Yanıltıcı görsel' iadesi ve Reklam Kurulu idari para cezası riski doğar"],"correctIndex":3},{"id":"q_ec_26","prompt":"Hasarlı/yanlış ürün krizinde iadeyi durduran otonom telafi protokolünün özü nedir?","choices":["Müşteriden ürünü kargolayıp 10 gün inceleme beklemesi istenir","Kırık ürün geri istenmez; doğru ürün hediyesiyle ekspres gönderilir — çift kargo + puan kaybı yerine kontrollü telafi maliyeti","Müşteri doğrudan Tüketici Hakem Heyeti'ne yönlendirilir","Kargo firması suçlanarak konu kapatılır"],"correctIndex":1},{"id":"q_ec_27","prompt":"Mağaza sağlık puanı (seller score) eşikleri nasıldır?","choices":["Puanın algoritmaya hiçbir etkisi yoktur","9.5 altı Buybox kaybı, 8.5 altı arama sonuçlarında geriye itilme riski","7.0 altında mağaza otomatik kapanır","Puan yalnızca yılda bir güncellenir"],"correctIndex":1},{"id":"q_ec_28","prompt":"Müşteri kriz mesajları yapay zekâya verilirken KVKK kuralı nedir?","choices":["Ad, açık adres ve telefon prompt'a aynen yapıştırılır","Veriler rakip analizi için arşivlenir","Kişisel veriler maskelenir: [Müşteri X], [Sipariş No 123]","KVKK e-ticaret satıcılarını kapsamaz"],"correctIndex":2},{"id":"q_ec_29","prompt":"Yetkin Akademi'de sertifika/mühür kazanmak için sınav barajı kaçtır?","choices":["50 puan","70 puan ve üzeri","100 puan tam not","Baraj yoktur; satın alan herkes doğrudan alır"],"correctIndex":1},{"id":"q_ec_30","prompt":"Sertifika ne zaman hak edilir?","choices":["Eğitim satın alındığı anda","İlk ders açıldığında","Özet PDF indirildiğinde","Sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde; SHA-256 mühür o zaman basılır"],"correctIndex":3}]$exam_02_ecommerce_ai$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_03_social_media_ai',
    'ac_03_social_media_ai',
    'Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut) müfredat sınavı',
    70,
    $exam_03_social_media_ai$[{"id":"q_sm_1","prompt":"İçerik üretiminde pedagojik olarak doğru zihniyet hangisidir?","choices":["Her gün ilham perisini bekleyip tek tek zanaatkar üretimi yapmak","Tek girdiyle çok çıktı üreten endüstriyel montaj hattı (fabrika) kurmak","Yalnızca trend seslere göre rastgele video çekmek","Tüm işi bir sosyal medya asistanına bırakıp denetlememek"],"correctIndex":1},{"id":"q_sm_2","prompt":"'İçerik atomizasyonu' (1 girdi → 30 çıktı) ne anlama gelir?","choices":["Aynı görseli 30 kez paylaşmak","Tek bir ürün veya fikirden beş sütunla 30 günlük takvim türetmek","30 farklı ürüne aynı metni yazmak","Algoritmaya 30 hashtag basmak"],"correctIndex":1},{"id":"q_sm_3","prompt":"30 günlük içerik matrisinin beş sütunu hangileridir?","choices":["Fiyat, kargo, iade, stok, yorum","Acı noktası, mit çürütme, sosyal kanıt, yaşam tarzı, doğrudan satış","Renk, logo, slogan, müzik, filtre","Reels, Story, Post, Live, Newsletter"],"correctIndex":1},{"id":"q_sm_4","prompt":"Kullanıcının parmağını durduran kanca (hook) penceresi yaklaşık kaç saniyedir?","choices":["İlk 10 saniye yeterlidir","Yaklaşık 0.8 saniye; kanca atılmazsa içerik yok sayılır","Videonun son 3 saniyesi","Yalnızca kapak görseli yeterlidir"],"correctIndex":1},{"id":"q_sm_5","prompt":"Beş psikolojik kanca türü hangileridir?","choices":["Renk, font, müzik, filtre, hashtag","Acı, merak, mit çürütme, kanıt, fırsat","Fiyat, stok, kargo, iade, puan","Like, yorum, kaydet, paylaş, takip"],"correctIndex":1},{"id":"q_sm_6","prompt":"Kanca oranı (hook rate) pratikte neyi ölçer?","choices":["Toplam takipçi sayısını","İlk 3 saniyede videoda kalan izleyici oranını","Reklam bütçesini","Hashtag sayısını"],"correctIndex":1},{"id":"q_sm_7","prompt":"Algoritmanın süper metrikleri olarak öne çıkan eylemler hangileridir?","choices":["Yalnızca beğeni","Kaydetme ve paylaşma","Yalnızca profil ziyareti","Yalnızca hikâye yanıtı"],"correctIndex":1},{"id":"q_sm_8","prompt":"Midjourney ticari görsel promptunun temel anatomisi nedir?","choices":["Sadece ürün adını yazmak","Özne, çevre, ışık, kamera/lens ve teknik parametreler","Yalnızca '--v 6.0' eklemek","Türkçe sloganı tırnak içinde göndermek"],"correctIndex":1},{"id":"q_sm_9","prompt":"Dikey Reels formatı için Midjourney parametresi hangisidir?","choices":["--ar 1:1","--ar 9:16","--ar 16:9","--ar 4:3"],"correctIndex":1},{"id":"q_sm_10","prompt":"Canva Bulk Create (Toplu Oluşturma) ne işe yarar?","choices":["Tek bir görseli rastgele yeniden çizer","Bir şablona tablo bağlayıp 30 markalı postu tek tıkla basar","Videoyu otomatik yayınlar","Takipçi satın alır"],"correctIndex":1},{"id":"q_sm_11","prompt":"Canva Brand Kit neden fabrikada zorunlu bir istasyondur?","choices":["Algoritma logoyu zorunlu tutar","Renk, yazı tipi ve logo bir kez tanımlanır; 30 sayfaya kurumsal kimlik uygulanır","Marka kiti ücretsiz reklam verir","Yalnızca PDF dışa aktarır"],"correctIndex":1},{"id":"q_sm_12","prompt":"Magic Expand ne zaman kullanılır?","choices":["Metni İngilizceye çevirmek için","Kare görseli 9:16 dikeye doğal şekilde uzatmak için","Hashtag üretmek için","Ses klonlamak için"],"correctIndex":1},{"id":"q_sm_13","prompt":"Kuru 'beğen ve takip et' CTA'sı yerine ne yapılmalıdır?","choices":["Daha fazla emoji eklemek","ManyChat, Tidio veya DM otomasyonuna bağlanan dönüşümlü eylem çağrısı kurmak","Videoyu sessiz paylaşmak","Yorumları kapatmak"],"correctIndex":1},{"id":"q_sm_14","prompt":"ElevenLabs bu fabrikada hangi istasyonu doldurur?","choices":["Kapak tasarımı","Doğal tonlamalı, nefes alan seslendirme ve ses klonlama","Takvim planlama","Reklam bütçesi yönetimi"],"correctIndex":1},{"id":"q_sm_15","prompt":"HeyGen'in pedagojik vaadi nedir?","choices":["Kamera ve stüdyo zorunluluğunu kaldırıp hiper-gerçekçi avatarla metni okutmak","Yalnızca stok video aramak","Instagram hesabını otomatik kapatmak","PDF sertifika basmak"],"correctIndex":0},{"id":"q_sm_16","prompt":"Lip-sync (dudak senkronizasyonu) neden kritiktir?","choices":["Algoritma yalnızca dudak hareketi sayar","Avatarın konuşması doğal durmazsa güven ve tutundurma düşer","Yasal olarak zorunludur","Ses dosyasını küçültür"],"correctIndex":1},{"id":"q_sm_17","prompt":"CapCut dikey kurguda görsel değişim ritmi için verilen kural nedir?","choices":["Sahne 15 saniyede bir değişir","Yaklaşık 2.5 saniyelik görsel değişim kuralı","Tek plan 60 saniye tutulur","Yalnızca yavaş çekim kullanılır"],"correctIndex":1},{"id":"q_sm_18","prompt":"CapCut Auto Captions neden 'dinamik kelime vurgulu' olmalıdır?","choices":["Altyazısız video yasaktır","Sessiz izlemede kelime kelime vurgu tutundurmayı ve erişilebilirliği artırır","Altyazı reklam maliyetini düşürür","Yalnızca İngilizce içerikte gerekir"],"correctIndex":1},{"id":"q_sm_19","prompt":"Kısa dikey video için doğru çerçeve hangisidir?","choices":["16:9 yatay sinema","9:16 dikey format (Reels / Shorts / TikTok)","21:9 ultra geniş","Yalnızca kare 1:1"],"correctIndex":1},{"id":"q_sm_20","prompt":"Otonom yayınlama için müfredatta geçen araç ailesi hangisidir?","choices":["Excel, Word, PowerPoint","Buffer, Metricool ve Publer","Git, Docker, Kubernetes","PayTR, iyzico, Stripe"],"correctIndex":1},{"id":"q_sm_21","prompt":"CCaaS (Content Creator as a Service) modeli nedir?","choices":["Ücretsiz içerik bağışı","Fabrika gücünü markalara aylık paket halinde satmak","Yalnızca kendi hesabına içerik üretmek","Stok fotoğraf sitesi açmak"],"correctIndex":1},{"id":"q_sm_22","prompt":"Fabrikadaki insanın doğru rolü nedir?","choices":["Her kareyi elle kesen içerik amelesi","İstasyonları denetleyen ve kalite kontrolü yapan genel müdür","Yalnızca hashtag yazan asistan","Algoritmayı tahmin eden kahin"],"correctIndex":1},{"id":"q_sm_23","prompt":"Midjourney `--style raw` parametresi ne işe yarar?","choices":["Görseli siyah-beyaz yapar","Aşırı süslemeyi kesip fotogerçekçiliği artırır","Videoya çevirir","Türkçe altyazı ekler"],"correctIndex":1},{"id":"q_sm_24","prompt":"Lifestyle fotoğrafta pedagojik hedef nedir?","choices":["Ürünü beyaz fonda tek başına göstermek","Ürünü gerçek kullanım sahnesinde, doğal insan ve ışıkla göstermek","Yalnızca logo basmak","Fiyat etiketini kocaman yazmak"],"correctIndex":1},{"id":"q_sm_25","prompt":"Storyboard'un ilk 0–3 saniyesi neyi taşımalıdır?","choices":["Uzun marka hikâyesi","Kanca ve şok: ani görsel + kalın başlık + çarpıcı soru","Fiyat listesi","Kapanış jingle'ı"],"correctIndex":1},{"id":"q_sm_26","prompt":"B-roll stok sahneler CapCut hattında neden eklenir?","choices":["Videoyu yasal olarak uzatmak için","2.5 saniyelik ritimde görsel çeşitlilik ve tutundurma sağlamak için","Ses dosyasını gizlemek için","Hashtag sayısını artırmak için"],"correctIndex":1},{"id":"q_sm_27","prompt":"Yapay zekâya ticari görsel ürettirirken marka riski nasıl yönetilir?","choices":["Rakip tescilli isimleri prompt'a yazmak serbesttir","Tescilli marka ve yüzleri izinsiz taklit etmemek; kendi ürün ve sahneyi tarif etmek","Başka markanın logosunu Magic Eraser ile kopyalamak","Ünlü yüzleri izinsiz klonlamak"],"correctIndex":1},{"id":"q_sm_28","prompt":"Henry Ford benzetmesinin içerik fabrikasına uyarlanması nedir?","choices":["Her ustanın arabayı baştan yapması","İşi istasyonlara bölmek: metin, görsel, ses, kurgu, dağıtım","Tek kişilik zanaatı yüceltmek","Üretimi tamamen durdurmak"],"correctIndex":1},{"id":"q_sm_29","prompt":"Yetkin Akademi'de sertifika barajı kaçtır?","choices":["50 puan","70 puan ve üzeri","100 puan tam not","Baraj yoktur; satın alan herkes doğrudan alır"],"correctIndex":1},{"id":"q_sm_30","prompt":"Sertifika ne zaman hak edilir?","choices":["Eğitim satın alındığı anda","Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde","İlk Reels paylaşıldığında","Özet PDF indirildiğinde"],"correctIndex":1}]$exam_03_social_media_ai$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_04_chatbot_nocode',
    'ac_04_chatbot_nocode',
    'Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress) müfredat sınavı',
    70,
    $exam_04_chatbot_nocode$[{"id":"q_bot_1","prompt":"Kodsuz akıllı chatbotun pedagojik olarak doğru konumu nedir?","choices":["İnsanın yerine geçen otonom hekim veya avukat","İlk filtrelemeyi yapan, randevu/satış kapatan; insanı rutin amelelikten kurtaran dijital temsilci","Yalnızca menü tuşlarıyla çalışan IVR","Müşteriye Wikipedia maddesi okuyan ansiklopedi"],"correctIndex":1},{"id":"q_bot_2","prompt":"Eski nesil kural tabanlı botun temel kusuru nedir?","choices":["Çok pahalı olması","Dar kalıpların dışına çıkamayıp '1-2-3 yazınız' döngüsüne saplanması","Çok hızlı cevap vermesi","WhatsApp'ta çalışmaması"],"correctIndex":1},{"id":"q_bot_3","prompt":"Amatör SSS botunun satış hatası nedir?","choices":["Fiyatı hiç söylememesi","Cevabı ansiklopedi gibi verip eylemsiz bırakması; CTA ile randevuya bağlamaması","Çok kibar konuşması","Emoji kullanması"],"correctIndex":1},{"id":"q_bot_4","prompt":"Voiceflow bu müfredatta nasıl konumlanır?","choices":["Yalnızca WhatsApp Cloud API motoru","Diyalog tasarımının Figma'sı: web widget, görsel prototip ve karar ağacı","Muhasebe yazılımı","E-posta pazarlama aracı"],"correctIndex":1},{"id":"q_bot_5","prompt":"Botpress bu müfredatta nasıl konumlanır?","choices":["Yalnızca kapak tasarımı","RAG bilgi tabanı ve WhatsApp/Telegram gibi kanallarla derin entegrasyon motoru","Sadece slayt sunumu","Ödeme tahsilat POS'u"],"correctIndex":1},{"id":"q_bot_6","prompt":"Profesyonel hibrit strateji nedir?","choices":["Yalnızca ManyChat kullanmak","Voiceflow ile 15 dakikada görsel prototip satmak; WhatsApp+RAG için Botpress ve Make.com bağlamak","Önce Python API yazmak","Botu Excel'de tutmak"],"correctIndex":1},{"id":"q_bot_7","prompt":"Intent (niyet) nedir?","choices":["Botun logo rengi","Kullanıcının kafasındaki ana amaç (ör. Randevu_Almak)","Webhook URL'si","Yeşil tik başvurusu"],"correctIndex":1},{"id":"q_bot_8","prompt":"Utterance (ifade) nedir?","choices":["Aynı niyeti anlatan onlarca farklı doğal cümle örneği","Tek bir zorunlu menü tuşu","PDF dosya adı","Meta reklam bütçesi"],"correctIndex":0},{"id":"q_bot_9","prompt":"Entity (varlık) neyi cımbızlar?","choices":["Botun kişilik metnini","Cümledeki somut veri parçalarını: tarih, saat, isim, telefon","Sunucu IP adresini","Sınav barajını"],"correctIndex":1},{"id":"q_bot_10","prompt":"Voiceflow Carousel kartı ne işe yarar?","choices":["Ses kaydı alır","Yatay kaydırılabilir görsel kartlarla hekim/tedavi vitrini sunar","WhatsApp şablon onayı ister","Fatura keser"],"correctIndex":1},{"id":"q_bot_11","prompt":"Telefon numarası alınırken neden regex/format kontrolü gerekir?","choices":["Estetik için","Yanlış formatlı numaranın randevu ve CRM kaydını bozmaması için","Meta bunu gizli tutar","Sınav sorusu üretmek için"],"correctIndex":1},{"id":"q_bot_12","prompt":"RAG (Retrieval-Augmented Generation) mutfak benzetmesinde kütüphane görevlisi ne yapar?","choices":["Yemek uydurur","Belgeden ilgili parçayı çekip şefe uzatır; şef belgeye sadık cevap verir","Mutfağı kapatır","Müşteriyi kovar"],"correctIndex":1},{"id":"q_bot_13","prompt":"Anlamsal benzerlik eşiği (similarity threshold) neden konur?","choices":["Botu yavaşlatmak için","Soru bilgi tabanıyla yeterince uyuşmuyorsa uydurmayı kesip Fallback'e gitmek için","Reklam maliyetini artırmak için","Yeşil tik almak için"],"correctIndex":1},{"id":"q_bot_14","prompt":"Botpress Knowledge Base'e PDF atarken kritik kalite kuralı nedir?","choices":["Taranmış resim (OCR'siz görüntü) yeterlidir","Seçilebilir temiz metin; H1/H2 hiyerarşisi anlamayı hızlandırır","Dosya şifreli olmalıdır","Yalnızca İngilizce PDF kabul edilir"],"correctIndex":1},{"id":"q_bot_15","prompt":"Klinik botunda Guardrails'ın tıbbi kırmızı çizgisi nedir?","choices":["Fiyat asla söylenmez","Teşhis, tedavi garantisi ve ilaç dozu yok; kesin tanı hekim muayenesine bırakılır","Hasta ismi kaydedilmez","Bot yalnızca İngilizce konuşur"],"correctIndex":1},{"id":"q_bot_16","prompt":"Standart WhatsApp Business uygulamasının kurumsal sınırı nedir?","choices":["Mesaj gönderememesi","Tek telefona hapsolması; çoklu operatör ve Cloud API omurgası olmaması","Fotoğraf gönderememesi","Türkçe desteklememesi"],"correctIndex":1},{"id":"q_bot_17","prompt":"WhatsApp 24 saat kuralı pratikte ne anlama gelir?","choices":["Bot günde 24 saat kapalıdır","Kullanıcı mesajından sonra serbest pencere sınırlıdır; sonrasında onaylı şablon (template) gerekir","Her mesaj 24 saat gecikmeyle gider","Yeşil tik 24 saatte düşer"],"correctIndex":1},{"id":"q_bot_18","prompt":"Şablon mesaj (template message) neden Meta onayı ister?","choices":["Tasarım estetiği için","Spam kalkanı: işletmenin kullanıcıyı izinsiz bombardıman etmesini engellemek için","Fatura kesmek için","Sınav barajını ayarlamak için"],"correctIndex":1},{"id":"q_bot_19","prompt":"ManyChat ile Botpress tercihi nasıl ayrışır?","choices":["ManyChat her zaman yasaktır","ManyChat hızlı reklam/DM otomasyonu; derin RAG ve kanal mühendisliği için Botpress","İkisi aynı üründür","Botpress yalnızca e-posta gönderir"],"correctIndex":1},{"id":"q_bot_20","prompt":"Webhook chatbot'u operasyon memuruna nasıl çevirir?","choices":["Sohbet metnini PDF basar","Toplanan JSON'u Make.com üzerinden Sheets, takvim ve CRM'e aktarır","Botu sessize alır","Yeşil tik üretir"],"correctIndex":1},{"id":"q_bot_21","prompt":"Human Handoff ne zaman tetiklenmelidir?","choices":["Her mesajda","Acil durum, öfke, belirsizlik veya Guardrails ihlali: bot susup canlı temsilciye devreder","Yalnızca mesai saatlerinde","Asla; bot her şeyi çözer"],"correctIndex":1},{"id":"q_bot_22","prompt":"Asenkron webhook yanıtı neden önemlidir?","choices":["Botun daha yavaş görünmesi için","Dış sistem cevabı gecikse bile diyaloğun kilitlenmemesi ve sonra dönmesi için","Meta cezası almak için","Sınav süresini uzatmak için"],"correctIndex":1},{"id":"q_bot_23","prompt":"Click-to-WhatsApp reklamının bot mimarisindeki yeri nedir?","choices":["Reklam tıklanınca sohbeti boş bırakmak","Reklamdan düşen niyeti botun karşılayıp randevu/lead akışına bağlamak","Reklamı kapatmak","Yalnızca e-posta toplamak"],"correctIndex":1},{"id":"q_bot_24","prompt":"Chatbot as a Service (CaaS) ticari modeli nedir?","choices":["Botu ücretsiz GitHub'a koymak","KOBİ'ye kurulum ücreti + aylık bakım/SLA paketi satmak","Yalnızca kendi kliniğinde kullanmak","WhatsApp'tan rastgele spam atmak"],"correctIndex":1},{"id":"q_bot_25","prompt":"Hasta/müşteri verisi bota veya Make.com'a giderken KVKK kuralı nedir?","choices":["Ham TC, telefon ve şikayet metni her yere yapıştırılır","Kişisel veriler maskelenir; yalnızca iş için gerekli alanlar aktarılır","KVKK chatbot'u kapsamaz","Veriler Twitter'da paylaşılır"],"correctIndex":1},{"id":"q_bot_26","prompt":"Duygu analizi botta ne işe yarar?","choices":["Reklam bütçesini hesaplar","Öfke veya acil acı sinyalinde Human Handoff ve empati protokolünü tetikler","Yeşil tik üretir","Sınav sorusu basar"],"correctIndex":1},{"id":"q_bot_27","prompt":"If/Else karar dalında 'acil ağrı' niyeti gelince doğru davranış nedir?","choices":["Rutin fiyat menüsüne devam","Rutin soruları atlayıp nöbetçi hekim / acil hatta yönlendirmek","Sohbeti kapatmak","PDF katalog göndermek"],"correctIndex":1},{"id":"q_bot_28","prompt":"Voiceflow widget yayınında gömme kodu ne sağlar?","choices":["WhatsApp Cloud API onayı","Web sitesine birkaç satırlık embed ile canlı sohbet penceresi","PayTR tahsilatı","Sertifika hash'i"],"correctIndex":1},{"id":"q_bot_29","prompt":"Yetkin Akademi'de sertifika barajı kaçtır?","choices":["50 puan","70 puan ve üzeri","100 puan tam not","Baraj yoktur; satın alan herkes doğrudan alır"],"correctIndex":1},{"id":"q_bot_30","prompt":"Sertifika ne zaman hak edilir?","choices":["Eğitim satın alındığı anda","Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde","İlk bot yayınlandığında","Özet PDF indirildiğinde"],"correctIndex":1}]$exam_04_chatbot_nocode$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  ),
  (
    'exam_05_prompt_practice',
    'ac_05_prompt_practice',
    'Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity) müfredat sınavı',
    70,
    $exam_05_prompt_practice$[{"id":"q_pr_1","prompt":"Arama motoru ile üretici yapay zekâ arasındaki temel fark nedir?","choices":["İkisi de anahtar kelime eşleştirip link listeler","Google fihristtir; LLM bağlama göre sonraki kelimeyi hesaplayan bilişsel asistandır","Yapay zekâ yalnızca resim çizer","Google her zaman daha doğrudur"],"correctIndex":1},{"id":"q_pr_2","prompt":"Halüsinasyonun pedagojik nedeni nedir?","choices":["Modelin interneti kasten bozması","Boşluk bırakılınca modelin 'bilmiyorum' demeyip en ikna edici kelimeleri doldurması","Bilgisayarın virüs kapması","Prompt'un çok uzun olması"],"correctIndex":1},{"id":"q_pr_3","prompt":"Bir promptun beş temel yapı taşı hangileridir?","choices":["Başlık, hashtag, emoji, link, fiyat","Rol, görev, bağlam, kısıtlar, çıktı formatı","CPU, RAM, GPU, disk, ağ","Giriş, gelişme, sonuç, özet, test"],"correctIndex":1},{"id":"q_pr_4","prompt":"Rol (Role) tanımlamak neden işe yarar?","choices":["Modeli yavaşlatır","Milyarlarca parametre içinden o uzmanlığın dilini ve düşünce kalıbını öne çeker","Yasal imza yerine geçer","Sınav barajını düşürür"],"correctIndex":1},{"id":"q_pr_5","prompt":"Kısıtlar (constraints) halüsinasyonu nasıl keser?","choices":["Modeli kapatarak","Yapılmayacakları ve 'veride yoksa uydurma' kuralını açık yazarak","Daha çok emoji ekleyerek","Prompt'u tek kelimeye indirerek"],"correctIndex":1},{"id":"q_pr_6","prompt":"Kötü prompt örneği hangisidir?","choices":["Rol, görev, bağlam, kısıt ve formatı dolduran istem","'Bana bir e-posta yaz' gibi muğlak tek cümle","Few-Shot örnekli istem","Chain-of-Thought isteyen istem"],"correctIndex":1},{"id":"q_pr_7","prompt":"Zero-Shot, One-Shot ve Few-Shot farkı nedir?","choices":["Hepsi aynıdır","Sıfır / bir / birkaç tamamlanmış örnekle modelin biçimi öğrenmesi","Yalnızca görsel modellerde geçerlidir","Shot sayısı token fiyatını sıfırlar"],"correctIndex":1},{"id":"q_pr_8","prompt":"Few-Shot pratikte ne zaman seçilir?","choices":["Modelin üslup ve formatı birebir kopyalamasını istediğinde (2–4 örnek)","Hiç örnek verilemediğinde","Yalnızca matematik sorularında","Sınavı atlamak için"],"correctIndex":0},{"id":"q_pr_9","prompt":"Chain-of-Thought (düşünce zinciri) ne ister?","choices":["Cevabı tek kelimede basmasını","Adım adım düşünmesini; acele saçmalamayı kesmesini","İnterneti kapatmasını","Yalnızca şiir yazmasını"],"correctIndex":1},{"id":"q_pr_10","prompt":"Uzman paneli simülasyonu ne işe yarar?","choices":["Tek bir evet/hayır cevabı üretmek","Birden fazla uzman rolünü aynı masada konuşturup stratejik kararı çok açıdan sınamak","PDF'i silmek","Sınav sorusu çalmak"],"correctIndex":1},{"id":"q_pr_11","prompt":"İş e-postasında diplomatik tahsilat promptu neyi korur?","choices":["Müşteriyi aşağılamak","İlişkiyi bozmadan geciken ödemeyi net aksiyonla hatırlatmak","Yasal icra tehdidini yapay zekâya bırakmak","Kişisel verileri açık paylaşmak"],"correctIndex":1},{"id":"q_pr_12","prompt":"Dört üslup kanalı hangileridir?","choices":["HTML, CSS, JS, SQL","Resmi-kurumsal, sıcak-empatik, ikna edici, yalın-eğitici","Tweet, Reels, Blog, PDF","Alıcı, satıcı, kargo, iade"],"correctIndex":1},{"id":"q_pr_13","prompt":"Critique & Refine döngüsü nedir?","choices":["İlk taslağı olduğu gibi göndermek","Çıktıyı eleştirip kör noktayı düzelterek ikinci turda sıkılaştırmak","Prompt'u silmek","Modeli değiştirmeden aynı hatayı tekrarlamak"],"correctIndex":1},{"id":"q_pr_14","prompt":"Pre-Mortem kriz testi ne sorar?","choices":["Proje bittikten sonra kim suçlu","Henüz başlamadan 'bu iş nasıl başarısız olur' senaryosunu yazdırır","Yalnızca bütçe kalemini","Sınav notunu"],"correctIndex":1},{"id":"q_pr_15","prompt":"Dağınık veriden SWOT isterken doğru yaklaşım nedir?","choices":["Veri yokken ortalama uydurmak","Ham notları bağlama koyup kanıtsız iddia basmamayı kısıt olarak yazmak","Yalnızca tehditleri sormak","Google'dan kopyalamak"],"correctIndex":1},{"id":"q_pr_16","prompt":"Görsel promptun beş katmanı hangileridir?","choices":["Fiyat, stok, kargo, iade, puan","Ana konu, çevre, ışık, kamera/lens, sanat tarzı ve doku","Giriş, gelişme, sonuç, test, özet","Rol, görev, webhook, CRM, SLA"],"correctIndex":1},{"id":"q_pr_17","prompt":"Vision (görsel algılama) yapay zekâsı müfredatta ne işe yarar?","choices":["Yalnızca duvar kağıdı üretir","Fotoğraf, grafik veya el çiziminden içgörü, hata ve taslak çıkarır","Sesi klonlar","Sınavı otomatik geçer"],"correctIndex":1},{"id":"q_pr_18","prompt":"ElevenLabs metninde parantez içi yönlendirme neden kullanılır?","choices":["Dosya boyutunu küçültmek için","Duygu ve nefes ([fısıltıyla], duraklama) yöneterek robotik okumayı kırmak için","Telif hakkını silmek için","Videoyu 9:16 yapmak için"],"correctIndex":1},{"id":"q_pr_19","prompt":"Video modellerinde (Runway, Kling, Sora) kritik unsur nedir?","choices":["Yalnızca ürün adını yazmak","Kamera hareketini tarif etmek (açı, takip, motion blur)","Hashtag listesi","PDF eklemek"],"correctIndex":1},{"id":"q_pr_20","prompt":"Prompt kütüphanesini ölçeklenebilir kılan nedir?","choices":["Her seferinde sıfırdan yazmak","Dinamik parametreler (`[DEĞİŞKEN]`) ile ekip içinde paylaşılabilir şablon","Şifreyi sohbete yapıştırmak","Yalnızca ekran görüntüsü saklamak"],"correctIndex":1},{"id":"q_pr_21","prompt":"Kütüphane klasör mimarisinde hangisi vardır?","choices":["Yalnızca rastgele notlar","İletişim, içerik, yönetim/strateji, pazarlama, multimodal","Yalnızca şifreler","Yalnızca faturalar"],"correctIndex":1},{"id":"q_pr_22","prompt":"Görev (task) cümlesi nasıl yazılır?","choices":["Muğlak 'yap şunu' ile","Net eylem fiili: özetle, karşılaştır, hataları listele, 3 alternatif üret","Yalnızca emoji ile","Boş bırakılarak"],"correctIndex":1},{"id":"q_pr_23","prompt":"Çıktı formatı neden açık yazılır?","choices":["Model varsayılan olarak her zaman tablo basar","Paragraf, madde, e-posta veya kontrol listesi tesliminin rastgele kalmaması için","Token'ı ücretsiz yapmak için","Sınavı iptal etmek için"],"correctIndex":1},{"id":"q_pr_24","prompt":"Müşteri veya şirket verisini prompt'a koyarken kural nedir?","choices":["TC, IBAN ve isimleri ham yapıştırmak","KVKK: kişisel ve ticari sırları maskelemek","Verileri herkese açık pastete atmak","Yalnızca şifreyi silmek yeter"],"correctIndex":1},{"id":"q_pr_25","prompt":"Yapay zekânın ürettiği resmi metinde son sorumluluk kimdedir?","choices":["Tamamen model şirketinde","Tarih, rakam ve iddiayı insan denetler; imza insandadır","Metin kısaysa denetim gerekmez","Sınavı geçen herkes sorumluluktan muaftır"],"correctIndex":1},{"id":"q_pr_26","prompt":"Soğuk satış (cold email) promptunun hedefi nedir?","choices":["Alıcıyı spam ile boğmak","Kısa, kişiselleştirilmiş ve randevu koparan diplomatik ilk dokunuş","Tüm fiyat listesini yapıştırmak","Yasal sözleşme imzalatmak"],"correctIndex":1},{"id":"q_pr_27","prompt":"'Adım adım düşün' talimatı hangi sınıfa girer?","choices":["Zero-Shot ansiklopedi","Chain-of-Thought","Brand Kit","Human Handoff"],"correctIndex":1},{"id":"q_pr_28","prompt":"Katman 1 kapanışında prompt mühendisliği neden omurga sayılır?","choices":["Yalnızca kod yazdırır","Ofis, e-ticaret, chatbot ve içerik fabrikasının ortak dilidir","Sertifikayı satın alma anında basar","Katman 2'yi iptal eder"],"correctIndex":1},{"id":"q_pr_29","prompt":"Yetkin Akademi'de sertifika barajı kaçtır?","choices":["50 puan","70 puan ve üzeri","100 puan tam not","Baraj yoktur; satın alan herkes doğrudan alır"],"correctIndex":1},{"id":"q_pr_30","prompt":"Sertifika ne zaman hak edilir?","choices":["Eğitim satın alındığı anda","Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde","İlk prompt yazıldığında","Özet PDF indirildiğinde"],"correctIndex":1}]$exam_05_prompt_practice$,
    TIMESTAMP '2026-08-21 15:00:00',
    TIMESTAMP '2026-08-21 15:00:00'
  )
ON CONFLICT (course_id) DO UPDATE
SET
  title = EXCLUDED.title,
  pass_score = EXCLUDED.pass_score,
  questions_json = EXCLUDED.questions_json,
  updated_at = now();

-- Eski SKU: vitrin ve yeni satış kapalı. academy_purchases / academy_certificates durur.
UPDATE public.academy_courses
SET is_published = false, updated_at = now()
WHERE id IN ('ac_rail_temel', 'ac_ray_sinyal', 'ac_yz_icerik_gorsel', 'ac_ileri_prompt', 'ac_bim_iso', 'ac_siber_kvkk', 'ac_python_bi', 'ac_esg', 'ac_agile_scrum', 'ac_bulut_devops', 'ac_uiux_ds', 'ac_fintek_ob', 'ac_ai_orta', 'ac_ai_ileri', 'ac_devops_temel', 'ac_devops_orta', 'ac_devops_ileri', 'ac_flutter_temel', 'ac_flutter_orta', 'ac_flutter_ileri', 'ac_ds_temel', 'ac_ds_orta', 'ac_ds_ileri', 'ac_sec_temel', 'ac_sec_orta', 'ac_sec_ileri', 'ac_db_temel', 'ac_db_orta', 'ac_db_ileri', 'ac_arch_temel', 'ac_arch_orta', 'ac_arch_ileri', 'ac_pm_temel', 'ac_pm_orta', 'ac_pm_ileri', 'ac_ux_orta', 'ac_ux_ileri', 'ac_w3_temel', 'ac_w3_orta', 'ac_w3_ileri', 'ac_ex_temel', 'ac_ex_orta', 'ac_ex_ileri', 'ac_mkt_temel', 'ac_mkt_orta', 'ac_mkt_ileri', 'ac_mnt_temel', 'ac_mnt_orta', 'ac_mnt_ileri', 'ac_pd_temel', 'ac_pd_orta', 'ac_pd_ileri', 'ac_cld_temel', 'ac_cld_orta', 'ac_cld_ileri', 'ac_eng_temel', 'ac_eng_orta', 'ac_eng_ileri', 'ac_qa_temel', 'ac_qa_orta', 'ac_qa_ileri', 'ac_jav_temel', 'ac_jav_orta', 'ac_jav_ileri', 'ac_rn_temel', 'ac_rn_orta', 'ac_rn_ileri', 'ac_gam_temel', 'ac_gam_orta', 'ac_gam_ileri', 'ac_mlo_temel', 'ac_sys_temel', 'ac_canva_temel', 'ac_pra_temel', 'ac_linkedin_temel', 'ac_cad_temel', 'ac_security_temel', 'ac_security_orta', 'ac_security_ileri', 'ac_ai_agent_temel', 'ac_ai_agent_orta', 'ac_ai_agent_ileri', 'ac_python_temel', 'ac_python_orta', 'ac_python_ileri', 'ac_fullstack_temel', 'ac_fullstack_orta', 'ac_fullstack_ileri', 'ac_ai_temel', 'ac_ux_temel', 'ac_excel_masterclass', 'ac_google_ads_masterclass', 'ac_meta_ads_masterclass', 'ac_eticaret_masterclass', 'ac_canva_masterclass', 'ac_linkedin_masterclass', 'ac_production_rag_graphrag')
   OR id NOT IN ('ac_01_office_ai', 'ac_02_ecommerce_ai', 'ac_03_social_media_ai', 'ac_04_chatbot_nocode', 'ac_05_prompt_practice');

UPDATE public.price_catalog_entries
SET is_active = false, updated_at = now()
WHERE module_key = 'academy'
  AND (
    unit_key IN ('course:rail-temel', 'course:rayli-sinyal-emniyet', 'course:yz-icerik-gorsel-uretim', 'course:ileri-prompt-muhendisligi', 'course:bim-iso-19650', 'course:siber-guvenlik-kvkk-iso-27001', 'course:python-veri-analizi-is-zekasi', 'course:kurumsal-esg-surdurulebilirlik', 'course:agile-scrum-masterlik', 'course:bulut-mimarisi-devops', 'course:ui-ux-design-systems', 'course:fintek-acik-bankacilik', 'course:ai-orta', 'course:ai-ileri', 'course:devops-temel', 'course:devops-orta', 'course:devops-ileri', 'course:flutter-temel', 'course:flutter-orta', 'course:flutter-ileri', 'course:ds-temel', 'course:ds-orta', 'course:ds-ileri', 'course:sec-temel', 'course:sec-orta', 'course:sec-ileri', 'course:db-temel', 'course:db-orta', 'course:db-ileri', 'course:arch-temel', 'course:arch-orta', 'course:arch-ileri', 'course:pm-temel', 'course:pm-orta', 'course:pm-ileri', 'course:ux-orta', 'course:ux-ileri', 'course:w3-temel', 'course:w3-orta', 'course:w3-ileri', 'course:ex-temel', 'course:ex-orta', 'course:ex-ileri', 'course:mkt-temel', 'course:mkt-orta', 'course:mkt-ileri', 'course:mnt-temel', 'course:mnt-orta', 'course:mnt-ileri', 'course:pd-temel', 'course:pd-orta', 'course:pd-ileri', 'course:cld-temel', 'course:cld-orta', 'course:cld-ileri', 'course:eng-temel', 'course:eng-orta', 'course:eng-ileri', 'course:qa-temel', 'course:qa-orta', 'course:qa-ileri', 'course:jav-temel', 'course:jav-orta', 'course:jav-ileri', 'course:rn-temel', 'course:rn-orta', 'course:rn-ileri', 'course:gam-temel', 'course:gam-orta', 'course:gam-ileri', 'course:mlo-temel', 'course:sys-temel', 'course:canva-temel', 'course:pra-temel', 'course:linkedin-temel', 'course:cad-temel', 'course:security-temel', 'course:security-orta', 'course:security-ileri', 'course:ai-agent-temel', 'course:ai-agent-orta', 'course:ai-agent-ileri', 'course:python-temel', 'course:python-orta', 'course:python-ileri', 'course:fullstack-temel', 'course:fullstack-orta', 'course:fullstack-ileri', 'course:ai-temel', 'course:ux-temel', 'course:excel-masterclass', 'course:google-ads-masterclass', 'course:meta-ads-masterclass', 'course:eticaret-masterclass', 'course:canva-masterclass', 'course:linkedin-masterclass', 'course:production-rag-graphrag')
    OR (
      unit_key LIKE 'course:%'
      AND unit_key NOT IN ('course:01_office_ai', 'course:02_ecommerce_ai', 'course:03_social_media_ai', 'course:04_chatbot_nocode', 'course:05_prompt_practice')
    )
  );
