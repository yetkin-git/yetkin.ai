-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).
-- Kaynak sicil: lib/academy/seed.ts — 1 ingest edilmiş kanon SKU.
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
    'A1’den temiz Excel, KVKK maskeleme, üç maddelik yönetim özeti, slayt, hata avı, e-posta ritüeli, Gmail/Outlook aksiyon listesi, Word’de dilekçe ve rapor, Cuma 30 kapanış rutini.',
    'course:01_office_ai',
    1,
    1,
    1,
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
    $exam_01_office_ai$[{"id":"q_off_1","prompt":"Ofiste yapay zekâyı konumlandırırken pedagojik olarak en doğru yaklaşım nedir?","choices":["Mühendislik düzeyinde kodlama gerektiren karmaşık bir yazılım","Masada oturan ve doğru talimatlarla çalışan akıllı bir dijital stajyer","Tüm kararları insansız alan otonom bir yönetici","Sadece grafik ve resim çizen bir tasarım aracı"],"correctIndex":1},{"id":"q_off_2","prompt":"Cuma mesaisinde gelen Excel’de logo ve birleşik boş satırlar üstte, asıl başlık A4’tedir. A1 eşiği için ilk iş nedir?","choices":["A1’i boş bırakıp yapay zekâya ‘veri dördüncü satırdan başlıyor’ diye uzun tarif yazmak","Üstteki dekoratif ve boş satırları temizleyip ilk sütun başlığını A1’e oturtmak","İlk üç satırı gizleyip tabloyu PDF yapmak","Birleşik hücreleri olduğu gibi bırakmak"],"correctIndex":1},{"id":"q_off_3","prompt":"Tutar hücresi sayı gibi durur ama TOPLA’ya girmez. Gizli kesme işaretini açığa çıkarmanın pratik yolu nedir?","choices":["Hücreyi sarıya boyamak","Şüpheli hücreye tıklayıp F2 ile düzenleme modunda baştaki metin ayracını görmek","Yazı tipini değiştirmek","Sütunu PDF’e basmak"],"correctIndex":1},{"id":"q_off_4","prompt":"Excel tablosunu yapay zekâya verirken Üç Kapı sırası hangisidir?","choices":["Önce gemini.google.com, sonra ataş, en son Copilot şeridi","1. Kapı Copilot şeridi, 2. Kapı ataş, 3. Kapı maskeli kısa özet","Önce VBA, sonra ekran görüntüsü zinciri","Ham tabloyu her zaman dış sohbete yapıştırmak"],"correctIndex":1},{"id":"q_off_5","prompt":"30 sayfalık bir sözleşmeyi yapay zekâya analiz ettirirken hangi yaklaşım en güvenli ve verimlidir?","choices":["Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenmek","Cezai şart, fesih ve gizlilik gibi kritik maddelere odaklı özet ve risk listesi talep etmek","Sözleşmeyi sosyal medyada paylaşmak","Sadece ilk sayfayı yüklemek"],"correctIndex":1},{"id":"q_off_6","prompt":"PowerPoint taslağı çıkarırken öğretilen doğru kapı hangisidir?","choices":["VBA makrosu yazdırıp tek tıkla slayt basmak","Copilot varsa şeride yazmak; yoksa .pptx dosyasını ataşlamak","Gamma veya Marp olmadan slayt yapılamaz demek","Tüm paragrafları tek slayta yapıştırıp puntoyu küçültmek"],"correctIndex":1},{"id":"q_off_7","prompt":"Yüzlerce okunmamış e-posta biriktiğinde yapay zekânın rolü ne olmalıdır?","choices":["Bütün mailleri okumadan silmek","İletileri önem etiketine ayırtmak, taslak hazırlatmak; göndermeyi insana bırakmak","Gelen tüm maillere otomatik 'tamam' yanıtı göndermek","Sunucunun fişini çekmek"],"correctIndex":1},{"id":"q_off_8","prompt":"Düzensiz bütçe dosyasını düzenli tabloya çekerken denetim güvenliğini tutan yaklaşım hangisidir?","choices":["Orijinal sayfayı silip tek sayfada devam etmek","Orijinal düzensiz sayfayı koruyup yeni sayfada A1’den düzenli tablo kurmak ve yan yana doğrulamak","Birleşik hücreleri tek hamlede çözüp boşluklara sıfır yazmak","Tabloyu e-posta gövdesine yapıştırıp oradan kontrol etmek"],"correctIndex":1},{"id":"q_off_9","prompt":"Üç maddelik yönetim özetinde ‘karar notu’ ile gözlem cümlesi arasındaki fark nedir?","choices":["Gözlem finans, karar notu insan kaynaklarıdır","Gözlem tabloyu özetler; karar notu onay, bütçe veya yön ister","Karar notu sayı taşımaz","Gözlem mutlaka teknik jargon ister"],"correctIndex":1},{"id":"q_off_10","prompt":"Yapay zekânın satış özetinde satır toplamı ile genel toplam çelişirse kural nedir?","choices":["Model asla hata yapmaz, doğrudan gönderilir","Yapay zekâ taslak hazırlar; kritik sayıyı insan kaynak evrattan kilitler","Sorumluluk modele aittir","Metin kısaysa doğrulamaya gerek yoktur"],"correctIndex":1},{"id":"q_off_11","prompt":"Yapay zekânın akıcı yönetim özeti inandırıcı durur. Hata avında ilk kilit nedir?","choices":["Metin akıcıysa sayıyı kilitlemeye gerek yoktur","Kritik sayıyı kaynak evraktan veya TOPLA ile insan kilitler","Model imza atabilir","Sıcaklığı düşürmek yeter"],"correctIndex":1},{"id":"q_off_12","prompt":"Cuma 30 dakikalık rutin nasıl bölünür?","choices":["Yalnız e-posta, üç kez","10 dakika Excel + 10 dakika slayt + 10 dakika kutu","Bütün haftayı tek oturumda bitirmek","Kaseti iki kez dinlemek"],"correctIndex":1},{"id":"q_off_13","prompt":"Yapay zekâya 'bana bir rapor yaz' demek neden zayıf bir tariftir?","choices":["Çünkü yapay zekâ Türkçe anlamaz","Çünkü alıcı, amaç, biçim ve kısıt yoksa stajyer genel geçer metin üretir","Çünkü rapor ancak Excel'de yazılır","Çünkü tarif her zaman en az 2000 kelime olmalıdır"],"correctIndex":1},{"id":"q_off_14","prompt":"Gelen kutusunu yapay zekâyla sıfırlarken doğru sıra hangisidir?","choices":["Hepsine otomatik yanıt gönder, sonra sil","Önem etiketi, taslak, insan onayı, arşiv","Son üç günü çöpe at","Yalnız bültenleri oku"],"correctIndex":1},{"id":"q_off_15","prompt":"Bölge satırları 50.450, modelin genel toplamı 59.450 ise en güvenilir adım nedir?","choices":["Modele üç kez daha ‘emin misin’ diye sormak","Genel toplamı e-tablo TOPLA formülüne yazdırıp aritmetiği tablo motoruna bırakmak","Satırları silip model toplamını tek gerçek saymak","Sıcaklığı artırıp yeni toplam üretmek"],"correctIndex":1},{"id":"q_off_16","prompt":"Düzensiz tabloda sayı gibi görünen metin hücreleri varsa yapay zekâya ne tarif edilir?","choices":["Sadece ‘düzelt’ demek","Hangi sütunun sayı, hangisinin metin olması gerektiği ve gizli kesme işareti şüphesi","Tüm çalışma kitabını silmek","Makroyu devre dışı bırakmak"],"correctIndex":1},{"id":"q_off_17","prompt":"Cuma 30 dakikalık ofis rutininin amacı nedir?","choices":["Sınavı 6. derste açmak","Excel, slayt ve e-postayı takvimde duran kısa bir bloğa bağlamak","Bütün haftayı tek oturumda bitirmek","Kaseti iki kez dinlemek"],"correctIndex":1},{"id":"q_off_18","prompt":"Uzun bir rapordan yönetici özeti isterken hedef kitle nasıl belirtilir?","choices":["Belirtilmez, model tahmin eder","Alıcı rolü (genel müdür, finans) ve beklenen madde sayısı yazılır","Sadece ilk paragraf kopyalanır","Rapor PDF'e çevrilip bırakılır"],"correctIndex":1},{"id":"q_off_19","prompt":"PowerPoint konuşmacı notları için yapay zekâdan ne istenmelidir?","choices":["Slayt başına 1-2 dakikalık konuşma iskeleti ve geçiş cümlesi","Sadece rastgele emoji","Slaytları silmek","Videoya dönüştürmek"],"correctIndex":0},{"id":"q_off_20","prompt":"Boş slayt sendromunu kırmak için ilk tarife ne konur?","choices":["Konu, süre, kitle ve slayt sayısı","Sadece 'güzel olsun'","Şirket logosunun piksel boyutu","Yazıcı ayarı"],"correctIndex":0},{"id":"q_off_21","prompt":"Gelen kutusunu önceliklendirirken yapay zekâya hangi etiketler verilebilir?","choices":["Acil / bu hafta / bilgi amaçlı gibi açık kovalar","Hepsini sil","Otomatik 'tamam' yanıtı","Sunucu kapat"],"correctIndex":0},{"id":"q_off_22","prompt":"Yapay zekânın yazdığı tedarikçi yanıt taslağı için doğru kural nedir?","choices":["Taslağı okumadan göndermek","Parametreyi ve tonu verip taslak aldırmak, insanın kontrol edip onaylaması","Yanıtlamayı atlayıp iletiyi arşivlemek","Modele sert üslup seçtirip hukuki onaysız basmak"],"correctIndex":1},{"id":"q_off_23","prompt":"Metinden slayt çıkarırken ‘görsel yönlendirme’ kutusunun işi nedir?","choices":["Telifli stok görsel satın almak","Grafik türü, hiyerarşi veya şema için somut tasarım önerisi vermek","Konuşmacının kelimesi kelimesine metnini saklamak","Yazı tipi boyutunu kilitlemek"],"correctIndex":1},{"id":"q_off_24","prompt":"Cuma rutininin üç bloğu nasıl bölünür?","choices":["Yalnız e-posta, üç kez","Excel (ataş veya Copilot), slayt (üç madde + eylem), e-posta (aynı pencerede kapat)","PDF bas, tahmin ettir, sil","Kaseti başa sar"],"correctIndex":1},{"id":"q_off_25","prompt":"Vergi matrahı veya net ciro gibi yüksek riskli sayıda ‘insan gözü kilidi’ ne demektir?","choices":["Yalnız başlık formatına bakmak","Ayda bir rastgele hücre seçmek","Kaynak belgeden uzmanla doğrulanmış değeri sabitlemek; modeli serbest bırakmamak","Tüm formülleri silmek"],"correctIndex":2},{"id":"q_off_26","prompt":"İç içe birleşik hücre ve ara toplamlı ham veride ilk refleks hangisidir?","choices":["Orijinali silmek","Birleşik hücre ve boş satır düzenini tarife yazıp temiz tabloyu yeni sayfada istemek","Hepsini PDF yapmak","Yalnız rengi değiştirmek"],"correctIndex":1},{"id":"q_off_27","prompt":"Yerleşik araç eşleşmesi hangisidir?","choices":["Outlook’a Gemini, Gmail’e Copilot zorlanır","Outlook → Copilot, Gmail → Gemini, Word/Excel → ataş ile dosya yükleme","Her yerde yalnızca ChatGPT","Eşleşme yoktur"],"correctIndex":1},{"id":"q_off_28","prompt":"Yapay zekâ resmî dilekçe taslağı yazdı. Hangisi insanda kalır?","choices":["Hitap satırını modele bırakmak","Tarih, sayı, unvan ve imza; uydurma kanun maddesini silmek","Kanun maddesini modelden olduğu gibi basmak","Dilekçeyi ataşlamadan sayfa sayfa kopyalamak"],"correctIndex":1},{"id":"q_off_29","prompt":"Yönetim özeti isterken tarife en az hangisi konur?","choices":["Yalnız ‘özetle’ demek","Alıcı rolü, üç madde ve bir karar veya eylem cümlesi","Tüm satırları slayta yapıştırmak","Grafik rengi ve punto"],"correctIndex":1},{"id":"q_off_30","prompt":"Slayt yüzeyinin metin yığını olmaması için detay nereye konur?","choices":["Tüm açıklama slayta yapıştırılır, punto küçültülür","Ana mesaj slaytta kalır; bağlam konuşmacı notuna alınır","Görsel yönlendirme iptal edilir","Metin rastgele dağıtılır"],"correctIndex":1},{"id":"q_off_31","prompt":"Gelen kutusunu Gmail dışına kopyalamadan süzmenin doğru yolu hangisidir?","choices":["Maili seçip ChatGPT penceresine yapıştırmak","Ekran görüntüsü alıp harici sohbete yüklemek","Gmail yan panelindeki Gemini’ye istemi yazıp kutuyu yerinde taramak","Mailleri PDF’e basıp modele vermek"],"correctIndex":2},{"id":"q_off_32","prompt":"Üç kapı hiyerarşisinde öğretilen varsayılan yol hangisi değildir?","choices":["Gmail içinde Gemini paneli","Word veya Excel dosyasını ataş ile yükleme","Maili kopyalayıp ekran görüntüsüyle dış sohbete taşıma","Copilot lisansı varsa şeritten okutma"],"correctIndex":2},{"id":"q_off_33","prompt":"30 sayfalık sözleşmede cezai şart ve fesih farklı sayfalardadır. En güvenilir analiz hangisidir?","choices":["Sayfaları ayrı ayrı kopyalayıp sohbete yapıştırmak","Sözleşmeyi docx olarak ataşlayıp dosyanın bütününü inceletmek","Yalnız ilk sayfayı yüklemek","Ekran görüntüsü zinciri basmak"],"correctIndex":1},{"id":"q_off_34","prompt":"Üç Kapı’da 3. kapı (son çare) hangisidir?","choices":["Bütün gelen kutusunu ekran görüntüsüyle dış sohbete taşımak","Ham bilançoyu sayfa sayfa yapıştırmak","İsim, IBAN ve ticari sır maskelenmiş kısa özet yapıştırmak","Copilot dururken şeridi atlayıp hamal taşımak"],"correctIndex":2},{"id":"q_off_35","prompt":"Yapay zekâ dilekçe veya sözleşme taslağı yazdı. Hangisi insanda kalır?","choices":["Hitap satırını modele bırakmak","Tarih, sayı, unvan ve imza; uydurma kanun maddesini silmek","Kanun maddesini modelden olduğu gibi basmak","Dosyayı ataşlamadan sayfa sayfa kopyalamak"],"correctIndex":1},{"id":"q_off_36","prompt":"PowerPoint’te 1. Kapı hangisidir?","choices":["Gamma hesabı açmak","Marp ile markdown derlemek","Şeritteki Copilot paneline istemi yazmak","VBA makrosu üretmek"],"correctIndex":2},{"id":"q_off_37","prompt":"Müşteri adı, telefon ve IBAN aynı tabloda durur. Yapay zekâya vermeden önce doğru refleks hangisidir?","choices":["Ham tabloyu olduğu gibi sohbete yapıştırmak","Adı, telefonu ve IBAN’ı maskeleyip kısa soru bırakmak","CRM’in tüm ekran görüntüsünü yüklemek","Dosyayı silip modeli tahmin ettirmek"],"correctIndex":1},{"id":"q_off_38","prompt":"Kamu ürün kataloğu ile kişiye bağlı müşteri satırı aynı kapıdan mı gider?","choices":["Evet; ikisi de ataşla yüklenir","Hayır; kamu katalog cümlesi gidebilir, kişiye bağlı satır ham haliyle gitmez","KVKK yalnızca e-postayı kapsar","Model sildiği için yüklemek serbesttir"],"correctIndex":1},{"id":"q_off_39","prompt":"3. Kapı (son çare) hangisidir?","choices":["Ham müşteri kutusunu dış sohbete taşımak","Tüm CRM’i ekran görüntüsüyle yüklemek","İsim, telefon, IBAN ve ticari sır maskelenmiş kısa özet","Copilot dururken şeridi atlayıp hamal taşımak"],"correctIndex":2},{"id":"q_off_40","prompt":"Şirket sırrı (henüz açıklanmamış fiyat, maliyet) sohbete nasıl gider?","choices":["Kişisel veri olmadığı için serbestçe yapıştırılır","Ham haliyle gitmez; kamu cümlesi veya maskeli kısa özet yeter","Yalnız PDF’e basılır","Model imza atarsa serbesttir"],"correctIndex":1},{"id":"q_off_41","prompt":"Sohbet kutusuna yanlışlıkla müşteri listesi yapıştırıldı. Hangisi yanlıştır?","choices":["Sohbet arşiv değildir; silmek yüklemiş olmayı geri almaz","Bundan sonra maske refleksini kilitlemek gerekir","Mesajı silmek KVKK ihlalini hiç olmamış sayar","İnsan bekçidir; model bekçi değildir"],"correctIndex":2},{"id":"q_off_42","prompt":"Maskelemek ne demektir?","choices":["Dosyayı silmek","Adı baş harfe, IBAN’ı son dört haneye indirip soruyu bırakmak","Tüm satırları PDF yapmak","Copilot şeridini kapatmak"],"correctIndex":1}]$exam_01_office_ai$,
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
   OR id NOT IN ('ac_01_office_ai');

UPDATE public.price_catalog_entries
SET is_active = false, updated_at = now()
WHERE module_key = 'academy'
  AND (
    unit_key IN ('course:rail-temel', 'course:rayli-sinyal-emniyet', 'course:yz-icerik-gorsel-uretim', 'course:ileri-prompt-muhendisligi', 'course:bim-iso-19650', 'course:siber-guvenlik-kvkk-iso-27001', 'course:python-veri-analizi-is-zekasi', 'course:kurumsal-esg-surdurulebilirlik', 'course:agile-scrum-masterlik', 'course:bulut-mimarisi-devops', 'course:ui-ux-design-systems', 'course:fintek-acik-bankacilik', 'course:ai-orta', 'course:ai-ileri', 'course:devops-temel', 'course:devops-orta', 'course:devops-ileri', 'course:flutter-temel', 'course:flutter-orta', 'course:flutter-ileri', 'course:ds-temel', 'course:ds-orta', 'course:ds-ileri', 'course:sec-temel', 'course:sec-orta', 'course:sec-ileri', 'course:db-temel', 'course:db-orta', 'course:db-ileri', 'course:arch-temel', 'course:arch-orta', 'course:arch-ileri', 'course:pm-temel', 'course:pm-orta', 'course:pm-ileri', 'course:ux-orta', 'course:ux-ileri', 'course:w3-temel', 'course:w3-orta', 'course:w3-ileri', 'course:ex-temel', 'course:ex-orta', 'course:ex-ileri', 'course:mkt-temel', 'course:mkt-orta', 'course:mkt-ileri', 'course:mnt-temel', 'course:mnt-orta', 'course:mnt-ileri', 'course:pd-temel', 'course:pd-orta', 'course:pd-ileri', 'course:cld-temel', 'course:cld-orta', 'course:cld-ileri', 'course:eng-temel', 'course:eng-orta', 'course:eng-ileri', 'course:qa-temel', 'course:qa-orta', 'course:qa-ileri', 'course:jav-temel', 'course:jav-orta', 'course:jav-ileri', 'course:rn-temel', 'course:rn-orta', 'course:rn-ileri', 'course:gam-temel', 'course:gam-orta', 'course:gam-ileri', 'course:mlo-temel', 'course:sys-temel', 'course:canva-temel', 'course:pra-temel', 'course:linkedin-temel', 'course:cad-temel', 'course:security-temel', 'course:security-orta', 'course:security-ileri', 'course:ai-agent-temel', 'course:ai-agent-orta', 'course:ai-agent-ileri', 'course:python-temel', 'course:python-orta', 'course:python-ileri', 'course:fullstack-temel', 'course:fullstack-orta', 'course:fullstack-ileri', 'course:ai-temel', 'course:ux-temel', 'course:excel-masterclass', 'course:google-ads-masterclass', 'course:meta-ads-masterclass', 'course:eticaret-masterclass', 'course:canva-masterclass', 'course:linkedin-masterclass', 'course:production-rag-graphrag')
    OR (
      unit_key LIKE 'course:%'
      AND unit_key NOT IN ('course:01_office_ai')
    )
  );
