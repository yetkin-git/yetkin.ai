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
    'Akademi kurs birim fiyatı — İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği) (S11-A).',
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
    'İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)',
    'Office AI eğitimi — iş hayatında yapay zekâ: Excel Gemini kullanımı, Word ataş ile belge analizi, KVKK maskeleme, slayt, Gmail ve Cuma 30 rutini.',
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
    'İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği) müfredat sınavı',
    70,
    $exam_01_office_ai$[{"id":"q_off_1","prompt":"Ofiste yapay zekâyı masana nasıl oturtursun?","choices":["Kod yazman gereken karmaşık bir yazılım gibi","Masadaki asistanın gibi: doğru istemle çalışır","Tüm kararları senin yerine alan bir yönetici gibi","Yalnız grafik ve resim çizen bir tasarım aracı gibi"],"correctIndex":1},{"id":"q_off_2","prompt":"Cuma mesaisinde gelen Excel’de logo ve birleşik boş satırlar üstte, asıl başlık A4’tedir. A1 kuralı için ilk iş nedir?","choices":["A1’i boş bırakıp yapay zekâya ‘veri dördüncü satırdan başlıyor’ diye uzun anlat","Üstteki dekoratif ve boş satırları temizleyip ilk sütun başlığını A1’e oturt","İlk üç satırı gizleyip tabloyu belgeye çevir","Birleşik hücreleri olduğu gibi bırak"],"correctIndex":1},{"id":"q_off_3","prompt":"Tutar hücresi sayı gibi durur ama TOPLA’ya girmez. Gizli kesme işaretini açığa çıkarmanın pratik yolu nedir?","choices":["Hücreyi sarıya boya","Şüpheli hücreye tıkla, klavyenin üstündeki F2 tuşuna bas (Mac'te Fn+F2) — hücre düzenleme açılır; kesme işaretini kontrol et","Yazı tipini değiştir","Sütunu belgeye bas"],"correctIndex":1},{"id":"q_off_4","prompt":"Excel tablosunu yapay zekâya verirken Üç Kapı sırası hangisidir?","choices":["Önce harici sohbet sitesine gitmek, sonra ataş, en son Copilot şeridi","1. Kapı yerleşik panel (Copilot / Gemini şeridi), 2. Kapı ataş (Excel tablosu, Word belgesi, PowerPoint sunusu), 3. Kapı maskeli kısa özet","Önce VBA, sonra ekran görüntüsü zinciri","Ham tabloyu her zaman dış sohbete yapıştırmak"],"correctIndex":1},{"id":"q_off_5","prompt":"30 sayfalık bir sözleşmeyi yapay zekâya çözerken ne yaparsın?","choices":["Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenirsin","Cezai şart, fesih ve gizlilik gibi kritik maddelere odaklı özet ve risk listesi istersin","Sözleşmeyi sosyal medyada paylaşırsın","Sadece ilk sayfayı yüklersin"],"correctIndex":1},{"id":"q_off_6","prompt":"PowerPoint taslağını hangi kapıdan verirsin?","choices":["Boş slayta metni aynen yapıştırıp puntoyu küçültmek","Copilot varsa şeride yazmak; yoksa PowerPoint sunusunu ataşlamak","Önce tema süsleyip mesajı sona bırakmak","On maddeyi tek slayta yığmak"],"correctIndex":1},{"id":"q_off_7","prompt":"Yüzlerce okunmamış e-posta biriktiğinde ne yaparsın?","choices":["Bütün iletileri okumadan silersin","İletileri önem etiketine ayırırsın, taslak istersin; göndermezsin, sen onaylarsın","Gelen tüm iletilere otomatik 'tamam' yanıtı gönderirsin","Sunucunun fişini çekmek"],"correctIndex":1},{"id":"q_off_8","prompt":"Düzensiz bütçe dosyasını düzenli tabloya çekerken denetim güvenliğini tutan yaklaşım hangisidir?","choices":["Orijinal sayfayı silip tek sayfada devam etmek","Orijinal düzensiz sayfayı koruyup yeni sayfada A1’den düzenli tablo kurmak ve yan yana doğrulamak","Birleşik hücreleri tek hamlede çözüp boşluklara sıfır yazmak","Tabloyu e-posta gövdesine yapıştırıp oradan kontrol etmek"],"correctIndex":1},{"id":"q_off_9","prompt":"Üç maddelik yönetim özetinde karar cümlesi ile gözlem cümlesi arasındaki fark nedir?","choices":["Gözlem finans, karar cümlesi insan kaynaklarıdır","Gözlem tabloyu özetler; karar cümlesi onay, bütçe veya yön ister","Karar cümlesi sayı taşımaz","Gözlem mutlaka teknik jargon ister"],"correctIndex":1},{"id":"q_off_10","prompt":"Yapay zekânın satış özetinde satır toplamı ile genel toplam çelişirse ne yaparsın?","choices":["Model asla hata yapmaz, doğrudan gönderilir","Yapay zekâ taslak hazırlar; kritik sayıyı kaynak hücreden kilitlersin","Sorumluluk modele aittir","Metin kısaysa doğrulamaya gerek yoktur"],"correctIndex":1},{"id":"q_off_11","prompt":"Yapay zekânın akıcı yönetim özeti inandırıcı durur. Hata avında ilk neyi kilitlersin?","choices":["Metin akıcıysa sayıyı kilitlemeye gerek yoktur","Kritik sayıyı kaynak hücreden veya TOPLA ile kilitlersin","Model imza atabilir","Modele üç kez daha ‘emin misin’ diye sormak yeter"],"correctIndex":1},{"id":"q_off_12","prompt":"Cuma 30 dakikalık rutini nasıl bölersin?","choices":["Yalnız e-posta, üç kez","10 dakika Excel + 10 dakika slayt + 10 dakika kutu","Bütün haftayı tek oturumda bitirmek","Kaseti iki kez dinlemek"],"correctIndex":1},{"id":"q_off_13","prompt":"Yapay zekâya 'bana bir rapor yaz' demek neden zayıf bir istemdir?","choices":["Çünkü yapay zekâ Türkçe anlamaz","Çünkü alıcı, amaç, Format ve kısıt yoksa masadaki asistan genel geçer metin üretir","Çünkü rapor ancak Excel'de yazılır","Çünkü istem her zaman en az 2000 kelime olmalıdır"],"correctIndex":1},{"id":"q_off_14","prompt":"Gelen kutusunu yapay zekâyla sıfırlarken hangi sırayla kapatırsın?","choices":["Hepsine otomatik yanıt gönder, sonra sil","Önem etiketi, taslak, insan onayı, arşiv","Son üç günü çöpe at","Yalnız bültenleri oku"],"correctIndex":1},{"id":"q_off_15","prompt":"Cari satırları 50.450, modelin genel toplamı 59.450 ise ne yaparsın?","choices":["Modele üç kez daha ‘emin misin’ diye sormak","Genel toplamı Excel TOPLA formülüne yazıp aritmetiği Excel’e hesaplatmak","Satırları silip model toplamını tek gerçek saymak","Kişi adı geçen ham tabloyu aynen sohbete yapıştırmak"],"correctIndex":1},{"id":"q_off_16","prompt":"Düzensiz tabloda sayı gibi görünen metin hücreleri varsa yapay zekâya hangi istemi yazarsın?","choices":["Sadece ‘düzelt’ demek","Hangi sütunun sayı, hangisinin metin olması gerektiği ve gizli kesme işareti şüphesi","Tüm çalışma kitabını silmek","Makroyu devre dışı bırakmak"],"correctIndex":1},{"id":"q_off_17","prompt":"Cuma 30 dakikalık ofis rutini ne işe yarar?","choices":["Excel'i Pazartesi, slaytı Çarşamba, kutuyu Cuma yapmak","Excel, slayt ve e-postayı takvime yazdığın kısa bir bloğa bağlamak","Bütün haftayı tek oturumda bitirmek","Kaseti iki kez dinlemek"],"correctIndex":1},{"id":"q_off_18","prompt":"Uzun bir rapordan yönetim özeti isterken alıcı nasıl belirtilir?","choices":["Belirtilmez, model tahmin eder","Alıcı rolünü (genel müdür, finans müdürü) ve beklenen madde sayısını yazarsın","Sadece ilk paragraf kopyalanır","Rapor PDF'e çevrilip bırakılır"],"correctIndex":1},{"id":"q_off_19","prompt":"PowerPoint konuşmacı notları için yapay zekâdan ne istersin?","choices":["Slayt başına konuşma taslağı ve notunu istersin.","Sadece rastgele emoji","Slaytları silmek","Videoya dönüştürmek"],"correctIndex":0},{"id":"q_off_20","prompt":"Boş slayt stresini yenmek için ilk isteme ne koyarsın?","choices":["Tek fikir, görsel yönlendirme ve konuşmacı notu","Sadece 'güzel olsun'","Şirket logosunun piksel boyutu","Yazıcı ayarı"],"correctIndex":0},{"id":"q_off_21","prompt":"Gelen kutusunu sıralarken yapay zekâya hangi etiketleri verirsin?","choices":["Acil / Aksiyon / Arşivlik gibi açık etiketler","Hepsini sil","Otomatik 'tamam' yanıtı","Sunucu kapat"],"correctIndex":0},{"id":"q_off_22","prompt":"Yapay zekânın yazdığı tedarikçi yanıt taslağı için ne yaparsın?","choices":["Taslağı okumadan göndermek","Tarih ve tutarı verip taslak ister, sen kontrol edip onaylarsın","Yanıtlamayı atlayıp iletiyi arşivlemek","Modele sert dil yazdırıp okumadan göndermek"],"correctIndex":1},{"id":"q_off_23","prompt":"Metinden slayt çıkarırken görsel yönlendirmeyi neden yazarsın?","choices":["Telifli stok görsel satın almak","Hangi grafiği koyacağını ve başlık-madde sırasını parantezde tarif edersin","Konuşmacının kelimesi kelimesine metnini saklamak","Yazı tipi boyutunu kilitlemek"],"correctIndex":1},{"id":"q_off_24","prompt":"Müşteri programı (CRM) ekran görüntüsünü sohbet kutusuna yapıştırmak neden üçüncü kapı değildir?","choices":["Ekran görüntüsü her zaman maskelidir","Ham kimlik ve sır görüntüde durur; üçüncü kapı yalnız maskeli kısa özettir","PDF yapmak üçüncü kapıdır","Copilot paneli ekran görüntüsü ister"],"correctIndex":1},{"id":"q_off_25","prompt":"Vergi matrahı veya net ciro gibi kritik sayıyı neden insan gözüyle kilitlersin?","choices":["Yalnız başlık formatına bakarsın","Ayda bir rastgele hücre seçersin","Kaynak evraktan insan gözüyle doğrulanmış değeri sabitlersin; modeli serbest bırakmazsın","Tüm formülleri silersin"],"correctIndex":2},{"id":"q_off_26","prompt":"İç içe birleşik hücre ve ara toplamlı ham veride ilk refleks hangisidir?","choices":["Orijinali silmek","Birleşik hücre ve boş satır düzenini istemine yazıp temiz tabloyu yeni sayfada iste","Hepsini PDF yapmak","Yalnız rengi değiştirmek"],"correctIndex":1},{"id":"q_off_27","prompt":"Yerleşik araç hangi kutuda hangisidir?","choices":["Outlook’a Gemini, Gmail’e Copilot zorlanır","Outlook → Copilot, Gmail → Gemini, Word/Excel dosyası ataş, PowerPoint Copilot","Her yerde yalnızca ChatGPT","Eşleşme yoktur"],"correctIndex":1},{"id":"q_off_28","prompt":"Dilekçede tarihi, sayıyı ve imzayı neden sen yazarsın?","choices":["Çünkü model resmi mühürü senin yerine basar","Çünkü model taslak yazar; unvan, tarih, sayı ve imza sendedir","Çünkü kanun maddesini modelden olduğu gibi kabul edersin","Çünkü dilekçeyi yüklemeden sayfa sayfa kopyalaman yeter"],"correctIndex":1},{"id":"q_off_29","prompt":"Yönetim özeti isterken isteme en az hangisi konur?","choices":["Yalnız ‘özetle’ demek","Alıcı rolü, üç madde ve tek karar cümlesi","Tüm satırları slayta yapıştırmak","Grafik rengi ve punto"],"correctIndex":1},{"id":"q_off_30","prompt":"Slayt metin yığını olmasın diye detayı nereye koyarsın?","choices":["Tüm açıklama slayta yapıştırılır, punto küçültülür","Ana mesajı slaytta tutarsın; detayı konuşmacı notuna yazarsın.","Görsel yönlendirme iptal edilir","Metin rastgele dağıtılır"],"correctIndex":1},{"id":"q_off_31","prompt":"Gelen kutusunu Gmail dışına kopyalamadan nasıl süzersin?","choices":["İletiyi seçip ChatGPT penceresine yapıştırırsın","Ekran görüntüsü alıp dış sohbete yüklersin","Yerleşik Gemini paneline istemi yazarsın; kutuyu yerinde tararsın.","İletileri belgeye çevirip modele verirsin"],"correctIndex":2},{"id":"q_off_32","prompt":"Birinci ve ikinci kapı dururken hangi yolu atlanmış kapı sayarsın?","choices":["Gmail içinde Gemini panelini açarsın","Word veya Excel belgesini ataş ile yüklersin","İletiyi kopyalayıp ekran görüntüsüyle dış sohbete taşırsın","Copilot lisansın varsa şeritten okutursun"],"correctIndex":2},{"id":"q_off_33","prompt":"30 sayfalık sözleşmede cezai şart ve fesih farklı sayfalardadır. Dosyayı nasıl incelersin?","choices":["Her maddeyi ayrı sohbete kopyalarsın","Sözleşmeyi Word belgesi olarak yükler, dosyanın bütününü incelersin","Yalnız kapak sayfasını okutursun","Ekran görüntüsü zincirini dış sohbete taşırsın"],"correctIndex":1},{"id":"q_off_34","prompt":"Üç kapıda son çarede ne yaparsın?","choices":["Bütün gelen kutusunu ekran görüntüsüyle dış sohbete taşırsın","Ham dekontları sayfa sayfa yapıştırırsın","Ad, IBAN ve ticari sır maskelenmiş kısa özet yapıştırırsın","Copilot dururken paneli atlayıp ham listeyi taşırsın"],"correctIndex":2},{"id":"q_off_35","prompt":"Word’de sözleşme, dilekçe ve rapor aynı ataş kapısından gider. Üç işi tek istemde mi sorarsın, ayrı ayrı mı?","choices":["Üç işi tek istemde karıştırırsın","Her işi ayrı istemle sorarsın; imza ve tarihi sende bırakırsın","Kanun maddesini modelden olduğu gibi kabul edersin","Dosyayı yüklemeden sayfa sayfa kopyalarsın"],"correctIndex":1},{"id":"q_off_36","prompt":"PowerPoint’te 1. Kapı hangisidir?","choices":["Önce tema süsleyip mesajı sona bırakmak","Konuşmacı notunu slayt gövdesine basmak","Şeritteki Copilot paneline istemi yazmak","On maddeyi tek slayta yığmak"],"correctIndex":2},{"id":"q_off_37","prompt":"Müşteri adı, telefon ve IBAN aynı tabloda durur. Yapay zekâya vermeden önce doğru refleks hangisidir?","choices":["Ham tabloyu olduğu gibi sohbete yapıştırmak","Adı, telefonu ve IBAN’ı maskeleyip kısa sorunu yazmak","Müşteri programının tüm ekran görüntüsünü yüklemek","Dosyayı silip modeli tahmin ettirmek"],"correctIndex":1},{"id":"q_off_38","prompt":"Açık katalog bilgisi ile kişiye bağlı müşteri satırı aynı türden midir?","choices":["Evet; ikisini de ataşla yüklersin","Hayır; açık katalog bilgisi gidebilir, kişiye bağlı satır ham haliyle gitmez","KVKK yalnızca e-postayı kapsar","Model sildiği için yüklemek serbesttir"],"correctIndex":1},{"id":"q_off_39","prompt":"Copilot veya Gemini lisansı, ham müşteri listesini sohbete yüklemeyi yasal kılar mı?","choices":["Evet; lisans yeterlidir","KVKK yalnızca e-postayı kapsar","Hayır; lisans, kişisel veri ve şirket sırrı kuralını değiştirmez","Model sildiği için yüklemek serbesttir"],"correctIndex":2},{"id":"q_off_40","prompt":"Şirket sırrı (henüz açıklanmamış fiyat, maliyet) sohbete nasıl gider?","choices":["Kişisel veri olmadığı için serbestçe yapıştırılır","Ham haliyle gitmez; açık katalog bilgisi veya maskeli kısa özet yeter","Yalnız PDF’e basılır","Model imza atarsa serbesttir"],"correctIndex":1},{"id":"q_off_41","prompt":"Sohbet kutusuna yanlışlıkla müşteri listesi yapıştırıldı. Hangisi yanlıştır?","choices":["Sohbet arşiv değildir; silmek yüklemiş olmayı geri almaz","Bundan sonra maske refleksini kilitlemek gerekir","Mesajı silmek KVKK ihlalini hiç olmamış sayar","İnsan onaylar; model onaylamaz"],"correctIndex":2},{"id":"q_off_42","prompt":"Maskelemek ne demektir?","choices":["Dosyayı silmek","Ayşe Kaya yerine Müşteri A, IBAN yerine MASKELİ_IBAN yazıp sorunu yazmak","Adı baş harfe, IBAN’ı son dört haneye indirip sorunu yazmak","Tüm satırları PDF yapmak"],"correctIndex":1}]$exam_01_office_ai$,
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
