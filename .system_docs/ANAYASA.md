# ANAYASA — yetkin.ai

İnsan SSOT (Tek Gerçek Kaynak). Ürün kodu bu dosyayı doğrudan import etmez.

Bu belge iki katmandan oluşur:
- **A Katmanı (A1–A5) — tek dokunulmaz katman:** Yasal, finansal ve temel güvenlik zorunluluklarıdır. Değişmez ve taviz verilemez.
- **B Katmanı (B1–B5) — yaşayan ilkeler:** Mimari ve ürün rehberliğidir. Ürünle birlikte güncellenir. Operasyonel sayılar, env bayrakları ve HTTP kod tabloları burada durmaz; tek yaşayan kesit `docs/ops/DURUM.md` içindedir. `docs/DURUM.md` yalnız oraya yönlendirir.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Son Reform | **27 Eylül 2026:** B3’e PR ve önizleme yayın kuralı eklendi: önizleme serbesttir; mühürsüz satış/merge ve canlı yayın yasaktır. B4 hedef mimariyi dört katman olarak ayırır; satışta yeterli yüzey karaoke ve karttır. Süre ve sayısal sınırın tek evi koddur. A1–A5 çizgisi gevşetilmedi. |
| Kamu markası / domain | `yetkin.ai` |
| Kalıcı belgeler | `/.system_docs` |
| Ops | `.system_docs/OPS_RUNBOOK.md` (db / paytr / inngest / dron) |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Günlük rapor | `/docs` — build fixture değildir |

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

* **Mimari ad:** Canlı ürün bu cümledir. Amiral gövde bu Next.js monolith’tir (`app/`, `lib/`). İnce sözleşme paketi `@yetkin/kernel` (`packages/kernel`)dir; para, katalog kimliği, v1 hop ve JSON zarfını taşır. Prisma ve Supabase taşımaz. Tek native istemci `apps/rail-is`tir ve aynı `/api/v1` hop sicilini tüketir. Ayrı deploy, ayrı veritabanı ve ayrı kimlik yoktur. «Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez. İkinci istemci ancak aynı paketi ve aynı hop’u tüketerek doğar. Bugün tek native istemci vardır.
* **Katman disiplini:** Modülerlik ESLint kuralları, TypeScript ve sağlıklı yazılım prensipleriyle korunur. `lib/kernel` dikey oda motoru import etmez.
* **Yeni yetenek önce v1 hop’tur.** Tek native istemcinin tüketeceği yazma/okuma yeteneği `RAIL_V1_HOPS_META` siciline yazılır; kanonik handler aynı omurgada durur. RSC’nin `lib/` üzerinden **okuma/query** yüklemesi serbesttir. Yazma işlemi sessizce yalnız web BFF’te bırakılmaz.
* **Dış sözleşme:** Tek native istemci `/api/v1` JSON zarfı `{ ok, error, requestId, apiVersion, data }` ile konuşur. Shared Kernel `@yetkin/kernel` paketidir.
* **Kayıt kuralı:** Yeni oda = `lib/dronlar/kayit.ts` kaydı + sözleşme + `DronBayrakları.isKapali(id)` bayrağı. Yasak liste değil, checklist vardır. Kayıt ayrı bir uygulama açmaz.

## B2. Odaklar ve Dinamik Modül Alanı

* **Faz 1 kamu vitrini kilidi:** Çalışan kamu yüzeyi Panel, Akademi ve Kariyer’dir. Freelancer motoru sicilde durur; kamu yüzeyi kilitliyken 410 döner. Kilit mekanizması `DronBayrakları`’dır — takvim Anayasa maddesi değildir.
* **Kamu kanıt URL’si oda değildir:** `/vize` ve `/academy/dogrula` kanıt çıkışıdır; yeni oda açmaz.
* **Çekirdek yetenekler (eski “sığınak” kavramı emeklidir):** Kimlik (`/profil`), fatura/cüzdan (`/cuzdan`), pasaport (`/pasaport`) ve idare (`/admin`) çekirdek yeteneklerdir; yan alan değildir.
* **Genişleme:** Meşru ürün ihtiyaçları kayıt + bayrak + hop checklist’i ile monolit içinde açılır. Arşiv (`yetkin_muze/`, `archived/`) ana akışı kirletmez.
* **18 yaş altı ürün yoktur.** Junior kamu yüzeyi kilitlidir (`circuit-breakers`).

## B3. Geliştirici Dostu Test ve CI Politikası

* **Ön Derleme Kapısı (`verify:prebuild`):** Bu kapı yalnızca A Katmanı'ndaki hayati güvenlik ve finansal unsurları denetler (sır taraması, tamsayı para, RLS durumu, IDOR testleri ve temel API sözleşmesi). Paket sürümü (`@yetkin/kernel`) v1 sözleşme kapısının parçasıdır.
* **Esnek Grep ve Stil Taramaları:** Belirli Türkçe kelimeleri veya stil tercihlerini denetleyen taramalar derlemeyi kıran mutlak engeller değildir; isteğe bağlı kalite veya nightly raporlama araçlarıdır.
* **PR ve Önizleme Yayın Kuralı (Mühürsüz Satış / Merge Yasağı):**
  - **Önizleme Ortamı Serbesttir:** Yapılan geliştirmeler, PR açılması ve Vercel Preview (Önizleme) ortamında otomatik derlenip incelenmesi serbesttir.
  - **Mühürsüz Merge ve Yayın Yasağı:** Ancak ilgili kursun/modülün medya fırınlama (bake), mühürlü ses (Gemini 3.1 Flash TTS), cue-zamanlama, sınav ve onay süreçleri %100 tamamlanmadan ve CEO/Super Admin onayı alınmadan, satışa veya yayına alma içeren hiçbir PR (`feat/launch`, `price update` vb.) GitHub ana dalına (main) **birleştirilemez (merge edilemez)** ve canlıya (production) alınamaz. Vercel Preview URL'si yalnız test içindir; ürün lansmanı anlamına gelmez.

## B4. Müfredat ve Yayın Formatı

* **1 Eğitim Kodu = 1 Ses:** Bir kurs kodu tek bir `courseMasterVoice` stringi taşır. Ders bazlı ses haritası yoktur. OFF-101 (`01_office_ai`) mührü Callirrhoe (Gözde) dir. OFF-201 (`01_office_ai_ileri`) mührü Kore (Aylin) dir (`ACADEMY_OFF201_COURSE_MASTER_VOICE`). OFF-201 eğitmeni Gözde olamaz.
* **Ses modeli:** Seslendirme yalnız Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`) dir. Gemini 2.5 ve alt modeller yasaktır (`VOICE_TTS_FALLBACK_TO_2_5` kapalı). Kota yoksa işlem durur. Kota açılınca aynı model ve aynı kurs sesi kullanılır.
* **Süre ve sayısal sınır:** Tabanlar `lib/academy/production-standard.ts` içindeki `ACADEMY_AI_LESSON_DURATION_MIN_MINUTES` ve `ACADEMY_AI_LESSON_COUNT_MIN` sabitlerindedir. TTS bütçe tavanı aynı dosyadaki `ACADEMY_MATCH_WHISTLE_MAX` (kurs başına 100 istek) ve `lib/academy/tts-breath-chunks.ts` içindeki ders bandı 10–12 istektir. Üst dakika dayatması yoktur: metin kırpılmaz, tempo yükseltilmez. İstek bandına sığmayan metin yeniden paketlenir; bütçe tavanı konunun hakkını kesmek için gerekçe değildir.
* **Hedef mimari:** Yayın hedefi dört katmanlı eğitim videosudur: Gemini 3.1 TTS ses, Lyria 3.5 ducking müzik, Nano Banana 2 / Veo 3.1 Lite reji, cue ve karaoke rozeti. Bu dörtlü olması gereken mimaridir. İzlemede canlı üretici çağrısı yoktur.
* **Bugünkü disk:** Ürün satışı için yeterli yüzey mühürlü TTS, karaoke rozeti ve canlı karttır. Yatak ve ısınma klibi mühürlenince eklenir; eksikleri satışı tek başına kapatmaz. Satışı kapatan eşik ses mührüdür. Makale katmanı, ses yokken dürüst boşluktur; satış yüzeyi değildir.
* **Konunun Hakkı:** Ders makaleye veya okuma dökümanına indirgenmez. Süre bantları üretim standardıdır; müfredatın hakkını kesmek için gerekçe gösterilemez.
* **Müfredat ilkesi `.system_docs/PEDAGOJI.md` içindedir.** Haftalık SKU envanteri ve kaset listesi Anayasa maddesi değildir; sayılar ve müfredat koddadır.
* **Canlı yol** `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` SSOT’udur; yaşayan haftalık kesit `docs/ops/DURUM.md` içindedir. `docs/DURUM.md` yalnız oraya yönlendirir. İzlemede canlı üretici API (`VIDEO_GEN` / TTS) yoktur. Bake ayrıntısı `docs/ops/akademi-bake-elkitabi.md` içindedir.
* **Karar tablosu (tek bakış, sıfır atlama):**

| Soru | SSOT |
|------|------|
| Yayın formatı (hedef dört katman; satışta karaoke + kart) | Bu madde (B4) ve `.system_docs/PEDAGOJI.md` |
| 1 Eğitim Kodu = 1 Ses | `lib/academy/instructors.ts` (`courseMasterVoice`, `ACADEMY_OFF201_COURSE_MASTER_VOICE`) |
| Ses modeli (yalnız Gemini 3.1 Flash TTS) | `lib/kernel/ai/model-roles.ts` (`VOICE_TTS`, `VOICE_TTS_FALLBACK_TO_2_5`) |
| Süre, ders sayısı ve TTS istek tavanı | `lib/academy/production-standard.ts` |
| Sınav barajı | `lib/academy/exam.ts` (`ACADEMY_EXAM_PASS_SCORE`) |
| Canlı kaset / sınav yolu | `lib/academy/pilot-sku.ts`, `lib/academy/curricula/lesson-index.ts` |
| Haftalık kesit | `docs/ops/DURUM.md` (`docs/DURUM.md` yalnız yönlendirir) |
| Bake SOP | `docs/ops/akademi-bake-elkitabi.md` |
| Müfredat ilkesi | `.system_docs/PEDAGOJI.md` |

## B5. Harici Entegrasyonlar ve Pilot İş Modelleri

* **Nakit kanalı:** Kamu tahsilatı lisanslı Merchant portudur. Split bağlı değilse freelancer nakit kabul edilmez (A2 fail-closed). Merchant onayı Split izni değildir.
* **Faz 2 açılış kriterleri (checklist):** (1) lisanslı Pazaryeri sözleşmesi, (2) alt satıcı onboard, (3) freelancer hop’larının v1 siciline geri yazımı, (4) kapalı test halkası yeşil, (5) `DronBayrakları.isKapali("freelancer") === false`. İmza Super Admin + CEO.
* **Motor 2 (B2B):** Keşif fazındadır. Kurumsal oda arşivde kalır; ilk pilot müşteri profili olmadan kamu vitrini açılmaz.
* **Altyapı:** Redis, Inngest, e-posta gibi üçüncü taraf servisler operasyonel ihtiyaçlara göre devreye alınır; eksiklikte sahte yeşil basılmaz.
