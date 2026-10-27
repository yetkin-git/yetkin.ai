# ANAYASA — yetkin.ai

İnsan SSOT (Tek Gerçek Kaynak). Ürün kodu bu dosyayı doğrudan import etmez.

Bu belge iki katmandan oluşur:
- **A Katmanı (A1–A5) — tek dokunulmaz katman:** Yasal, finansal ve temel güvenlik zorunluluklarıdır. Değişmez ve taviz verilemez.
- **B Katmanı (B1–B6) — yaşayan ilkeler:** Mimari ve ürün rehberliğidir. Ürünle birlikte güncellenir. Operasyonel sayılar, env bayrakları ve HTTP kod tabloları burada durmaz; tek yaşayan kesit `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` içindedir.

| Alan | Değer |
|------|--------|
| Tarih | 17 Ekim 2026 (son doğrulama: 25 Ekim 2026 — B6 ders kancası ve İngilizce ücretsiz kapı) |
| Kamu markası / domain | `yetkin.ai` |
| Kalıcı belgeler | `/.system_docs` |
| Ops | `.system_docs/OPS_RUNBOOK.md` (db / paytr / inngest / dron) |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Günlük rapor | `/docs` — build fixture değildir |

**SSOT sırası.** Sayı, model kimliği, rol ve bayrak değeri yaşayan koddadır; bu belge onları tekrarlamaz, yalnız ilkeyi ve kodun evini söyler. Model ve rol tanımının tek çalışma zamanı evi `lib/kernel/ai/model-roles.ts` dosyasıdır (`ACADEMY_SEALED_MEDIA_MODEL`). Bu belge, `MANIFESTO.md`, `PEDAGOJI.md` ve `.cursorrules` bu kodla hizalıdır. Super Admin’in kilitli model haritası `.system_docs/AKADEMI_URETIM_ANAYASASI.md` dosyasındadır; kod o haritayla aynı kalır. Uyumsuzluk bulunursa belge silinmez veya eski modele çekilmez, kod dosyası haritaya eşitlenir.

---

# BÖLÜM A — SERT KIRMIZI ÇİZGİLER (DEĞİŞMEZLER)

Bu bölüm doğrudan yasal yaptırım, finansal kayıp ve kritik veri güvenliği risklerini önleyen sınırları tanımlar. PR ile "kolaylaştırmak" veya geçici kısayollar adına gevşetilemez.

## A1. Tek Defter, Tek Birim (`amountMinor`) ve Finansal SSOT

* **Para Birimi Tamsayıdır:** Tüm şema ve tiplerde tutarlar **`amountMinor`** (kuruş cinsinden pozitif tamsayı) ve `currencyCode` olarak tutulur. Float (ondalıklı) para kullanımı kesinlikle yasaktır.
* **Tek Finansal SSOT:** Sistemdeki tek bakiye kaynağı `Wallet` satırı ve append-only (yalnızca eklemeli) çalışan `LedgerEntry` defteridir. `User` modelinde bakiye kolonu bulunamaz. Çift bakiye, kontrolsüz holding havuzları ve defter dışı nakit yazıcılar yasaktır.
* **Emanet İkinci Bakiye Değildir:** `EscrowHold` tablosu bağımsız bir sanal para havuzu değildir; lisanslı ödeme sağlayıcısı (PSP) nezdindeki işlem referansı (`referenceKey` / `pspPaymentId`) ile eşleşir. `Wallet`, platform içi merchant işlem bakiyesidir.
* **Fiyat Dinamiktir:** Satış fiyatının tek ve gerçek kaynağı Super Admin’in veritabanına yazdığı `PriceCatalogEntry.amountMinor` satırıdır. Koda gömülü tutar yalnız soğuk başlangıç tohumudur. Tohum vitrinde, JSON-LD’de ve tahsilatta satış fiyatı değildir. Katalog satırı yokken fiyat basılmaz. Super Admin tutarını tohum ezmez.

## A2. Ödeme Kuruluşu Değiliz (S43 ve 6493 Sayılı Kanun Uyumu)

* **Lisanssız Para Tutma ve Çekim Yasağı:** yetkin.ai bir banka veya lisanslı ödeme kuruluşu değildir. Platform içinden harici banka hesaplarına doğrudan para transferi veya çekim rotası (`/api/wallet/withdraw`) açılamaz. GİB, e-arşiv ve banka çekim paneli kurgulanamaz.
* **Tahsilat ve Hakediş Dağıtımı:**
  - Akademi eğitim ve sınav harçları lisanslı ödeme kuruluşu (PayTR Merchant Port) aracılığıyla tahsil edilir.
  - **Faz 2; lisanslı Split bağlıysa uygulanır:** Freelancer iş bedelleri lisanslı kuruluşun Pazaryeri Split altyapısında emanet ve bloke statüsünde tutulur; iş tesliminde ustanın net hakedişi doğrudan ödeme kuruluşu tarafından ustanın IBAN'ına aktarılır. Usta net hakedişi platform içi Rail cüzdanına CREDIT olarak yazılamaz.
* **Dürüst Durum (Fail-Closed):** Ödeme sağlayıcısı veya split portu bağlı değilse sahte onay verilmez; sistem dürüstçe ilgili işlemin henüz bağlanmadığını (`not_configured` / 503) bildirir.

## A3. Güvenlik, Kimlik ve İzolasyon (RLS, IDOR, Sır Koruması)

* **Servis Anahtarı İstemciye Sızamaz:** `SUPABASE_SERVICE_ROLE_KEY` / `service_role` anahtarı istemci tarafı (browser/frontend JS) koduna, açık `.env` değişkenlerine veya kullanıcıya açık yüzeylere asla sızdırılamaz. İstemci katmanı yalnızca doğrulanmış JWT oturumu ile konuşur.
* **Sunucu Tarafı Güvenli Erişim:** Sunucu tarafındaki veri erişimleri Prisma Postgres rolü ile yetkilendirilir. Arka plan görevleri ve izole sunucu işlemleri güvenli ortamda yürütülür.
* **RLS ve IDOR Koruması:** Tüm kullanıcı kaynaklarında Satır Düzeyinde Güvenlik (RLS) ve IDOR (Insecure Direct Object Reference) kontrolleri zorunludur. Hiçbir kullanıcı başka bir kullanıcının cüzdanına, teklifine, sözleşmesine veya sınav oturumuna izinsiz erişemez.
* **Idempotency:** Kritik mali yazma ve ödeme tamamlama işlemlerinde mükerrer işlem riskine karşı `Idempotency-Key` kullanımı esastır.

## A4. Kanıt Satın Alınamaz (Sunucu Değerlendirmeli Mühür)

* **Sunucu Tarafı Puanlama:** Sınav puanları ve başarı kriterleri asla tarayıcıda/istemcide hesaplanamaz. Puanlama ve değerlendirme sunucu tarafında yetkili motor tarafından icra edilir.
* **Kriptografik Mühür:** Akademi sertifikası ve başarı kanıtı para ödenerek satın alınamaz (baraj ≥70 puandır). Mühür yükü kriptografik olarak kilitlenir: `userId · courseId · attemptId · score · issuedAt · curriculumSeal`. Bu yük içerisine ödeme miktarı, vanity bilgileri veya sıralama dahil edilmez.
* **Açık Doğrulama:** Sertifika `/academy/dogrula/[hash]` adresinden kamuya açık, oturum gerektirmeksizin doğrulanabilir.

## A5. Dürüst Kapalı Yüzey (Sahte Bakiye ve Veri Yasağı)

* **Gerçek Neyse O:** Bağlı olmayan bir API, eksik bir ortam değişkeni veya yapılandırılmamış bir ödeme kanalı için kullanıcıya hayali başarı mesajı veya sahte onay gösterilemez. Kullanıcıya açık ve dürüstçe "henüz bağlanmadı / yüklenemedi" bilgisi verilir.
* **Sahte Finansal Veri Yasaktır:** Gerçek karşılığı olmayan sahte bakiye veya uydurma CREDIT satırı açılamaz.

---

# BÖLÜM B — OPS, ÜRÜN VE MİMARİ NOTLARI (YAŞAYAN İLKELER)

Bu bölüm **dokunulmaz değildir.** Operasyonel, mimari ve ürün geliştirme rehberliğidir; ürün gerçeği değişince bu maddeler güncellenir. Import duvarı (kernel ↛ dikey) B1 mühendisliği olarak durur.

## B1. Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci

* **Mimari ad:** Canlı ürün bu cümledir. Pragmatik Monolit bu Next.js gövdesidir (`app/`, `lib/`). İnce sözleşme paketi `@yetkin/kernel` (`packages/kernel`)dir; para, katalog kimliği, v1 hop ve JSON zarfını taşır. Prisma ve Supabase taşımaz. Tek native istemci `apps/rail-is`tir ve aynı `/api/v1` hop sicilini tüketir. Ayrı deploy, ayrı veritabanı ve ayrı kimlik yoktur. «Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez. İkinci istemci ancak aynı paketi ve aynı hop’u tüketerek doğar. Bugün tek native istemci vardır.
* **Terminoloji hizası:** «Amiral Gemi + Sürü Dron» ve «Core + Micro-Apps / Shared Kernel» eski anlatım dilidir; ayrı bir mimari tarif etmez, bu maddedeki yapının takma adıdır. Karşılıkları: Amiral Gemi = Pragmatik Monolit. Sürü Dron = monolit içindeki kayıtlı yetenek ve oda (`lib/dronlar/kayit.ts` kaydı, `DronBayrakları` bayrağı, route öneki); ayrı uygulama veya ayrı dağıtım değildir. Shared Kernel = `@yetkin/kernel`. Yeni belge ve kod bu adı değil Mimari adı kullanır.
* **Katman disiplini:** Modülerlik ESLint kuralları, TypeScript ve sağlıklı yazılım prensipleriyle korunur. `lib/kernel` dikey oda motoru import etmez.
* **Yeni yetenek önce v1 hop’tur.** Tek native istemcinin tüketeceği yazma/okuma yeteneği `RAIL_V1_HOPS_META` siciline yazılır; kanonik handler aynı omurgada durur. RSC’nin `lib/` üzerinden **okuma/query** yüklemesi serbesttir. Yazma işlemi sessizce yalnız web BFF’te bırakılmaz.
* **Dış sözleşme:** Tek native istemci `/api/v1` JSON zarfı `{ ok, error, requestId, apiVersion, data }` ile konuşur. Shared Kernel `@yetkin/kernel` paketidir.
* **Kayıt kuralı:** Yeni oda = `lib/dronlar/kayit.ts` kaydı + sözleşme + `DronBayrakları.isKapali(id)` bayrağı. Yasak liste değil, checklist vardır. Kayıt ayrı bir uygulama açmaz.

## B2. Odaklar ve Dinamik Modül Alanı

* **Faz 1 kamu vitrini kilidi:** Çalışan kamu yüzeyi Panel, Akademi ve Kariyer’dir. Freelancer motoru sicilde durur; kamu yüzeyi kilitliyken 410 döner. Kilit mekanizması `DronBayrakları`’dır — takvim Anayasa maddesi değildir.
* **Kamu kanıt URL’si oda değildir:** `/vize` ve `/academy/dogrula` kanıt çıkışıdır; yeni oda açmaz.
* **Çekirdek yetenekler (eski “sığınak” kavramı emeklidir):** Kimlik (`/profil`), fatura/cüzdan (`/cuzdan`), pasaport (`/pasaport`) ve idare (`/admin`) çekirdek yeteneklerdir; yan alan değildir.
* **Genişleme:** Meşru ürün ihtiyaçları kayıt + bayrak + hop checklist’i ile monolit içinde açılır. Arşiv (`yetkin_muze/`, `archived/`) ana akışı kirletmez.
* **Yetkin Junior:** Müstakil odadır. Panel, Akademi ve Kariyer vitrininin dördüncü odası değildir. Kapı ve erişim B6 ve `lib/kernel/security/junior-gate.ts` içindedir. Bu madde o kapıyı ikinci kez yazmaz. Young bu vitrinde yoktur; kayıt defterinde kapalıdır.

## B3. Geliştirici Dostu Test ve CI Politikası

* **Ön Derleme Kapısı (`verify:prebuild`):** Bu kapı A Katmanı'ndaki hayati güvenlik ve finansal unsurları denetler (sır taraması, tamsayı para, RLS durumu, IDOR testleri, temel API sözleşmesi ve `route-auth-map` `--check`). Paket sürümü (`@yetkin/kernel`) v1 sözleşme kapısının parçasıdır. Aynı zincir `public/` statik boyut bütçesini okur (`scripts/verify-public-size.ts`). Uyarı ve hata eşikleri o betikte durur; bu madde o baytları tekrarlamaz.
* **Esnek Grep ve Stil Taramaları:** Belirli Türkçe kelimeleri veya stil tercihlerini denetleyen taramalar derlemeyi kıran mutlak engeller değildir; isteğe bağlı kalite veya nightly raporlama araçlarıdır.
* **Önizleme ve satış kapısı:**
  - **Önizleme serbesttir:** PR açılması ve Vercel Preview ortamında derlenip incelenmesi serbesttir. Kurs mührü GitHub `main` birleştirme şartı değildir.
  - **Satış, vaadin karşılığıdır (Tek Geçerli Kural — `lib/kernel/admin/sale-gate.ts`):** Canlı satış, derleme kapısından ayrıdır. Karttaki Satın Al `academyCatalogPurchasable` ve `readAcademyVitrineSaleGates` (`lib/academy/sale-gate-board.ts`, karar `ACADEMY_SALE_GATE_GAPS` → `lib/kernel/admin/sale-gate.ts`) okur. Üçü birden gerekir: veritabanında kurs yayını (`is_published`), aktif fiyat satırı (`findActiveEntry`, `is_active`) ve sınav yolundaki her derste konuşma metni ile mühürlü ses (`academyCourseSaleOpen` → `academyCourseVoiceTextSealed`). Mühür listesi (`academySkuAudioAllowsPurchase`) tek başına satın al açmaz. Yayın, fiyat veya ses/metin eksikse kart satın al demez ve eksik kutuyu yazar. Preview URL ürün lansmanı değildir. Derleme kapısı A katmanında kalır (`verify:prebuild`).
  - **Stüdyo mührü satış şartı değildir:** Beş katman (`academyCourseProductionDiskSealed` / `assertAcademyProductionSeal`) `--seal` ve tam sinema vaadi içindir (`PEDAGOJI.md` §B ve `AKADEMI_URETIM_ANAYASASI.md` bu tek kurala bağlıdır). Isınma klibi, sabit görsel veya fon müziği eksik diye yüksek kaliteli ses ve metin raftan inmez; admin satış kapısı şeridinde `Stüdyo notu` olarak izlenir. A katmanı, sahte bakiye yasağı ve sunucu puanı durur.
  - **Kademeli yayın:** Kademe `academyCourseSaleTier` (`lib/academy/production-standard.ts`) ses ve metni sayar: `closed` (hiçbir derste ses ve metin yok → Hazırlanıyor), `showcase` (bazı derslerde ses ve metin var → vitrin ve ücretsiz önizleme açık, Satın Al kapalı), `sale` (sınav yolunun her dersinde ses ve metin var → yukarıdaki üçlü kapı Satın Al'ı açabilir). Beş katmanın tamamı ayrıca «Tam mühür» notudur. Kademe `/admin/catalog` satış kapısı şeridinde rozetle durur.

## B4. Müfredat ve Yayın Formatı

* **1 Eğitim Kodu = 1 Ses:** Bir kurs kodu tek bir `courseMasterVoice` stringi taşır. Ders bazlı ses haritası yoktur. Persona (dil ve üslup) ile anlatıcı adı (ses) ayrıdır. Persona Tezgâh / Anlatıcı yapısıdır; her kursta aynıdır (`.system_docs/PEDAGOJI.md` §2.2). Anlatıcı adlarının tek yazı evi o maddedir. Çalışma zamanı evi `lib/academy/instructors.ts` dir. Bu madde o adları ikinci kez yazmaz. Fırın modeli `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` dir.
* **Ses modeli:** Çağrı kimliği yalnız `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` nesnesindedir. Fırın ve gümrük `VOICE_TTS` aynı kimliği okur. Gemini 2.5 ve alt modeller yasaktır. Kota yoksa işlem durur. Kota açılınca aynı rol ve aynı kurs sesi kullanılır. Konuşma temposu `ACADEMY_BAKE_ATEMPO`, ölçülen hedef `ACADEMY_INSTRUCTOR_SPEECH_RATE` dir. Ev `lib/academy/tts-loudnorm.ts` ve `lib/academy/instructors.ts`. Tempo, kodun yazdığı katsayının üzerine yükseltilmez. Bu maddede model kimliği, tempo ve desibel tekrarlanmaz.
* **Süre ve sayısal sınır:** Tabanlar ve TTS bütçe tavanı `lib/academy/production-standard.ts` içindeki `ACADEMY_AI_LESSON_DURATION_MIN_MINUTES`, `ACADEMY_AI_LESSON_COUNT_MIN` ve `ACADEMY_MATCH_WHISTLE_MAX` sabitlerindedir. Ders istek bandı `lib/academy/tts-breath-chunks.ts` içindedir (`ACADEMY_TTS_LESSON_REQUEST_MIN`, `ACADEMY_TTS_LESSON_REQUEST_MAX`). Bu sabitlerin kilitlendiği test `tests/academy/production-standard.test.ts` dir. Ses modeli kimliği `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` dir. Bu maddede o sayılar ve model kimliği tekrarlanmaz. Metin kırpılmaz, tempo yükseltilmez. İstek bandına sığmayan metin yeniden paketlenir; bütçe tavanı konunun hakkını kesmek için gerekçe değildir.
* **5 medya katmanı zorunluluğu:** Bu sıra yetişkin Akademi videosudur. Üretim sırası sabittir. Hiçbir yetişkin eğitim videosu bu katmanlardan biri eksikken fırınlanamaz ve mühürlenemez. Katman listesinin tek tanımı `.system_docs/PEDAGOJI.md` §B «Zorunlu üretim sırası» altındadır. Bu madde o beş maddeyi ikinci kez açmaz. Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir. Junior okul dersi bu listeye girmez. Junior kapısı `assertJuniorProductionSeal` dir. Ayrıntı `.system_docs/PEDAGOJI.md` Ek-J.
* **3 aşamalı kontrol kapısı:** Anlatının tek evi `.system_docs/PEDAGOJI.md` §B’dir. Bu madde o listeyi ikinci kez açmaz. Son kontrol kod seviyesinde fail-closed zorunluluktur: beş katmanın tamamı teyit edilmeden `--seal` basılamaz. Kapı `assertAcademyProductionSeal` içindedir.
* Cue ve karaoke rozeti konuşmayla akar; beş katmanın yerine geçmez. İzlemede canlı üretici çağrısı yoktur. Makale katmanı, ses yokken dürüst boşluktur; satış yüzeyi değildir.
* **Konunun Hakkı:** Ders makaleye veya okuma dökümanına indirgenmez. Süre bantları üretim standardıdır; müfredatın hakkını kesmek için gerekçe gösterilemez.
* **Müfredat ilkesi `.system_docs/PEDAGOJI.md` içindedir.** Haftalık SKU envanteri ve kaset listesi Anayasa maddesi değildir; sayılar ve müfredat koddadır.
* **Canlı yol** `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` SSOT’udur. Sınav yolu anahtar tablosu `lib/kernel/catalog-ids/exam-path.ts` içindedir; `lesson-index` onu yeniden dışa aktarır. İzlemede canlı üretici API (`VIDEO_GEN` / TTS) yoktur. Bake ayrıntısı `lib/academy/production-standard.ts` ve `scripts/generate-academy-lesson-audio.ts`, `scripts/generate-academy-lesson-veo.ts`, `scripts/generate-academy-lesson-bed.ts` içindedir.
* **Freemium ilkesi (ücretsiz önizleme):** Her eğitimin ilk dersi, varsa hazırlık şeridiyle birlikte, herkese açık ve ücretsiz önizlemedir. Oturumsuz ziyaretçi o dersi izler ve dinler; bu, eğitimin vitrinidir. Sonraki dersler, sınav yolu ve sertifika lisans ister. Önizleme A4 mührünü, A1 fiyat kaydını veya satış kapısını (B3) gevşetmez; yalnız ilk dersin oynatımını açar. Dersi olmayan boş kabuk eğitimde önizleme yoktur. Önizlemenin süresi yoktur; lisansın süresi ayrıdır. Hangi dersin açık sayıldığının tek kaynağı koddur: sınav yolunun ilk anahtarı (`lib/kernel/catalog-ids/exam-path.ts`, `lib/kernel/catalog-ids/free-preview.ts`). Bu ilke bir veritabanı bayrağı değildir; Super Admin DB’den açıp kapatamaz, karar bu belgede ve kodda durur.
* **Karar tablosu (tek bakış, sıfır atlama):**

| Soru | SSOT |
|------|------|
| Yayın formatı (5 medya katmanı; son kontrol olmadan `--seal` yok) | `.system_docs/PEDAGOJI.md` §B; son kontrol bu madde ve `assertAcademyProductionSeal` |
| 1 Eğitim Kodu = 1 Ses | `lib/academy/instructors.ts` (`courseMasterVoice`, `ACADEMY_OFF201_COURSE_MASTER_VOICE`) |
| Model ve rol kimliği (ses, görsel, müzik, metin, canlı sohbet) | `lib/kernel/ai/model-roles.ts` (`ACADEMY_SEALED_MEDIA_MODEL`); Super Admin haritası `.system_docs/AKADEMI_URETIM_ANAYASASI.md` ile hizalı |
| Ses modeli | `lib/kernel/ai/model-roles.ts` (`ACADEMY_SEALED_MEDIA_MODEL`) |
| Ücretsiz önizleme (her eğitimin ilk dersi) | Bu madde (B4) ve `.system_docs/PEDAGOJI.md`; kod `lib/kernel/catalog-ids/exam-path.ts` |
| Süre, ders sayısı ve TTS istek tavanı | `lib/academy/production-standard.ts` |
| Sınav barajı | `lib/academy/exam.ts` (`ACADEMY_EXAM_PASS_SCORE`) |
| Canlı kaset / sınav yolu | `lib/academy/pilot-sku.ts`, `lib/academy/curricula/lesson-index.ts` |
| Haftalık kesit | `lib/academy/pilot-sku.ts`, `lib/academy/curricula/lesson-index.ts` |
| Bake SOP | `lib/academy/production-standard.ts` ve `scripts/generate-academy-lesson-*.ts` |
| Müfredat ilkesi | `.system_docs/PEDAGOJI.md` |

## B5. Harici Entegrasyonlar ve Pilot İş Modelleri

* **Nakit kanalı:** Kamu tahsilatı lisanslı Merchant portudur. Split bağlı değilse freelancer nakit kabul edilmez (A2 fail-closed). Merchant onayı Split izni değildir.
* **Faz 2 açılış kriterleri (checklist):** (1) lisanslı Pazaryeri sözleşmesi, (2) alt satıcı onboard, (3) freelancer hop’larının v1 siciline geri yazımı, (4) kapalı test halkası yeşil, (5) `DronBayrakları.isKapali("freelancer") === false`. İmza Super Admin + CEO.
* **Motor 2 (B2B):** Keşif fazındadır. Kurumsal oda arşivde kalır; ilk pilot müşteri profili olmadan kamu vitrini açılmaz.
* **Altyapı:** Redis, Inngest, e-posta gibi üçüncü taraf servisler operasyonel ihtiyaçlara göre devreye alınır; eksiklikte sahte yeşil basılmaz.

## B6. Yetkin Junior

* **Yetkin Junior:** Junior modülü veli hesabı altında müstakil bir odadır. Doğum yılı penceresi `juniorBirthYearBounds` ve sınıf aralığı `JUNIOR_GRADE_MIN`–`JUNIOR_GRADE_MAX` kodundadır (`lib/junior/limits.ts`). Bu madde yaş sayısını ve kart slug’larını ikinci kez yazmaz. Pilot sınıf `JUNIOR_PILOT_GRADE` dir. Çekirdek ve seçmeli kart listeleri `JUNIOR_PILOT_SLUGS` ve `JUNIOR_ELECTIVE_SLUGS` içindedir. Ev `lib/junior/catalog.ts`. Sahte bakiye tutmaz. Her kartın ilk mühürlü konusu ücretsizdir. `JUNIOR_FREE_LESSON_KEY` matematik açılışıyla aynı dersi tutar; ikinci bir bedava matematik konusu eklemez. Çekirdek İngilizcenin ücretsiz konusu dosya sırasındaki 1. ders değildir. `JUNIOR_FREE_OPENER_OVERRIDE` bu kartı `jr_06_ing_main-20` ile açar (`JUNIOR_ING_FREE_LESSON_KEY`). Ev `lib/junior/limits.ts`.
* **1. tema deneme kancası:** `jr_06_mat-1`, `jr_06_mat-2` ve `jr_06_mat-3` misafirde bir kez anlatış ve bir kez konu testi açar. Dizi `JUNIOR_PILOT_TRIAL_LESSON_KEYS` (`lib/junior/limits.ts`). İkinci deneme veli girişi ve yıllık paket ister. Bu üç anahtar deneme kancasının kendisidir. `jr_06_mat-2` asal sayılar ve asal çarpanlar dersidir. `jr_06_mat-3` ortak bölen ve ortak kat dersidir. `canonicalJuniorLessonKey` canlı anahtarı yerinde bırakır: `jr_06_mat-6` ve `jr_06_mat-7` haritanın değerindedir, adresleri değişmez. Yönlendirme yalnız haritanın değerinde olmayan emekli numaraya gider. `jr_06_mat-27` → `jr_06_mat-6` olur. Aynı kural `jr_06_mat-28` … `jr_06_mat-38` için geçerlidir. Ev `lib/junior/lesson-key-alias.ts`. Test `tests/kernel/junior-mat-meb-rekey.test.ts`. Canlı `jr_06_mat-6` standart uzunluk ölçü birimleridir (`MAT.6.1.8`). Canlı `jr_06_mat-7` kesir, ondalık ve yüzde ile dört işlemdir (`MAT.6.1.7`). Bu iki canlı ders deneme kancasının dışında, kilitli katalog dersidir. Deneme karnesine yazılmaz.
* **Kapı:** Bu oda Akademi’nin iç kanalı değildir. Panel, Akademi ve Kariyer vitrini B2’de durur. Sol menüde Junior herkese açıktır. `/junior` ders listesi ve her dersin ilk konusu ziyaretçiye açıktır. Bu üç dersin dışındaki anlatış kaydı ve konu testi veli girişi ile yıllık paket ister. Oturum yokken deneme kancası sunucuya gider; diğer konularda sayfa üyelik veya profil penceresi açar. Sınıf seçici yalnız pilot sınıfı gösterir. Soru arşivi olmayan konuda test adımı hazırlık aşamasındadır. Seçmeli ders `assertJuniorProductionSeal` (`lib/junior/production-seal.ts`) geçmeden çekirdek kartla aynı tam ders sayılmaz; vitrin bu kartları hazır ders diye sunmaz. Kasa `JUNIOR_CHECKOUT_OPEN` boşken `isJuniorCheckoutLocked` ile kapalıdır; bayrak dolunca açılır. Belge kasayı kalıcı kilit diye yazmaz. Ücretli anlatış ve ikinci deneme `canEnterJunior` kapalı betasına bağlıdır. Deneme kancası bu kapıyı üç derste bir kez deler. Deneme mağaza anahtarı satışı açmaz. Junior müstakil bir odadır; Akademi kartının içine gömülmez ve Akademi dersi Junior müfredatına yazılmaz. İki oda birbirinin ziyaretçisini tek satırlık kapı ile görebilir: Akademi vitrini `/junior` pilot dersine, Junior odası `/academy` kataloğuna bağlantı verir. Bu bağlantı satış vaadini, fiyatı ve mührü karıştırmaz. Sol menü ve doğrudan rota durur. Teknik kaynak `canEnterJunior` (`lib/kernel/security/junior-gate.ts`) dir. Başka belge bu kapıyı yeniden yazmaz.
* **Pasaport:** Junior kursu Kariyer vizesine girmez. Kayıt defterinde `passportListed` kapalıdır. Ev `packages/kernel/src/catalog-ids/course-registry.ts`.
* **Denetim sınırı:** İçerik yazımı maker-checker denetim izli yapıyla yürütülür; kasa ve fiyat yetkisi ayrılır. Super Admin kilitli dersleri, anlatışları ve testleri denetim amacıyla izleyebilir. Kapalı kasayı denetim hesabı açamaz. Yönetim kutusu `lib/kernel/auth/super-admin.ts` içindedir; kamu destek adresi bu maddeye yazılmaz.
* **Öğretme:** Dinle ve Anlat ile veli modeli `.system_docs/PEDAGOJI.md` ve `.system_docs/MANIFESTO.md` Ek-J bölümlerindedir. Bu madde o metni ikinci kez yazmaz.
* **Tek ev:** Anlatımın şekli `lib/junior/scenario.ts`, soru şekli `lib/junior/quiz` içindedir. Metin `lib/junior/content` ve `lib/junior/quiz` TypeScript dosyasına yazılır. Çalışma zamanı `packages/junior-content` JSON’unu okur (`lib/junior/content-source.ts`). JSON, `export:junior-content` ile tek yönlü türetilir; elle JSON düzeltmesi sonraki dışa aktarımda silinir. Vitrin, fırınlanmış sesi olan dersi basar. Envanter sayısı kodda kalır.
