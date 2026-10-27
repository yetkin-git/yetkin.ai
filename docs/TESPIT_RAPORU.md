# Yetkin.ai — Tespit Raporu

Tarih: 27 Ekim 2026  
Kapsam: çalışma ağacı (commit edilmemiş değişiklikler dahil). Kod düzeltilmedi.  
Okuyucu: SUPER_ADMIN

Bu rapor ürün kodunu, mühür JSON’unu ve strateji belgelerini okuyarak yazıldı. Canlı Postgres fiyat satırları okunmadı. Lighthouse çalıştırılmadı. `juniorProductionSealGaps` bu oturumda yürütülmedi. `.env` açılmadı; üretimdeki `SUPER_ADMIN_USER_ID` değeri bu yüzden doğrulanamaz.

---

## 0. Tek cümlelik hüküm

6. sınıf matematik çekirdeği kendi 2026-2027 kazanım dosyasına göre yazılıdır; süre mührü ise duyulan sesi değil, iki ders dışında karakter saatini yeşil sayar. Seçmeli dersler yıllık müfredat değildir. Akademi vitrini satın almayı üç kapının aynı anda açık olmasına bağlamıştır; kapılardan biri kapanınca düğme kaybolur. `yapinet360@gmail.com` üretimde e-posta adıyla tek başına her yere girmez. Belgelerdeki mimari ad, istemdeki «Amiral Gemi + Sürü Dron» cümlesinden daha dardır ve kod o dar tanıma daha yakındır.

---

## 1. Junior — 6. sınıf

Sınıf seçici yalnız 6. sınıf pilotunu gösterir (`lib/junior/limits.ts`, `JUNIOR_PILOT_GRADE = 6`). Başka sınıfın metni yoktur. Çekirdek kartlar: matematik, fen, Türkçe, İngilizce (`jr_06_ing_main`), sosyal.

İçerik sayımı (yazarlık `.ts` dosyaları, `index.ts` hariç):

| Ders | Yazarlık dosyası | Kendi takvimindeki boşluk |
|---|---|---|
| Matematik | 26 (`mat/1.ts`–`26.ts`) | 26 kilitli zaman çizelgesi var. Eski 27–38 içerik dosyası yok. |
| Fen | 27 | Numaralar atlıyor: 3–8, 11, 13–15, 17 yok. Kazanım dosyasında 36 satır var. |
| Türkçe | 20 (`1`–`20`) | Konu JSON’u 26’ya kadar. `jr_06_turkce-21` kabı: «Anlatım, soru ve ses henüz yazılmadı.» 21–26 aynı kab ailesi. |
| İngilizce | 14 | Konu JSON’u 21 dosya; 21–27 kab. Ücretsiz açılış `jr_06_ing_main-20` (`limits.ts`). Dosya sırasındaki 1. ders değil. |
| Sosyal | 24 | Saat notu «çerçeve PDF’sinden yeniden ölçülmemiştir» (`sosyal.json`). |

### 1.1 Müfredat uyumu

Resmi dayanak repoda bir gazete PDF’i değildir. Dayanak `packages/junior-content/meb/2026-2027/*.json` dosyalarıdır. Okul yılı etiketi bugünün öğretim yılıyla aynıdır: 2026-2027.

Matematik temaları, dosyanın kendi adlarıyla: Sayılar ve nicelikler, Cebir, Geometri, Ölçme, Veri, Olasılık. 24 kazanım satırı ders 1–26 ile eşlenmiştir. Bu listedeki 26 matematik konusu, dosyanın kendi haritasına göre bir ünite eksik bırakmaz.

Saat dürüstlüğü ayrıdır. `mat.json` üst notu: «MAT.6.1.1–MAT.6.1.4 saatleri onaylı rapordaki yıllık plandandır. Diğer matematik saatleri planlama payıdır.» Yalnız ilk dört kazanım `hoursBasis: "meb"`. Geri kalanı `"plan"`. `processOpen: true` olan satırlar, saat yazılmış olsa da süreç bileşeni açık sayılır. Kod bunu vitrinde «Müfredat Destek» diye ayırır (`lib/junior/curriculum-label.ts`).

Fen saatleri «onaylı rapordaki 2026 fen tablosu» diye işaretlenir; aynı not `FB.6.2.2` fiil cümlesinin doğrulanmadığını söyler. Türkçe saatleri «çerçeve planından yeniden ölçülmedi»; tema kabının saati 0’dır. Sosyal saatleri «ikincil derleme»dir.

`FB.6.7` ve `T.6.6` kodun kendi cümlesiyle «kamu dizininde olmayan ek tema»dır. Vitrin bunları «Ek Tema» diye ayırabilir. MEB akreditasyonu hiçbir belgede iddia edilmez. Pedagoji «okul kitabı metni kopyalanmaz, kazanım anlatılır» der. Bu, tema adlarının Maarif modeli başlıklarına benzemesini resmi birebirlik yapmaz.

Eksik olan, matematik ünite listesi değil:

- Fen kazanım satırı (36) ile yazarlık dosyası (27) aynı sayı değildir.
- Türkçe 21–26 ve İngilizce çekirdek 21–27 anlatımsız kabdır.
- İngilizce ücretsiz ders, yılın başı değil `jr_06_ing_main-20`’dir.
- Sosyal saatleri birincil program metninden yeniden ölçülmemiştir.
- Seçmeli raflar (aşağıda) 6. sınıf seçmeli yıllık planı değildir.

### 1.2 Anlatım ve görsel

Oynatıcı kilitli zaman çizelgesini okur. `production.status === "locked"` ve `readiness === "ready"` ise motor `"pilot"` olur; değilse zaman çizelgesiz `"sealed"` (`lib/junior/pilot-engine/playback.ts`). Matematikte 26 çizelgenin hepsi kilitli ve hazırdır. `jr_06_mat-6.timeline.json` süresi **142204 ms** (2 dakika 22 saniye). Ürün bandı 180–720 saniyedir (`lib/junior/player-clock.ts`).

Mühür bu süreyi yeşil bırakacak şekilde yazılmıştır:

- `lib/junior/narration-band.ts`: ölçülen kaset 180 sn altındaysa `below_narration_band` uyarısı döner. «Mühür boşluğu açılmaz; oynatıcı kapanmaz.» Uyarı yalnız `jr_06_mat-6` içindir.
- `lib/junior/production-seal.ts`: «`jr_06_mat-6` kilitli PCM 180 sn altındadır. Karakter saati bu dersi yeşil bırakır.» Gerçek MP3 / çizelge süresi yalnız `jr_06_mat-1` ve `jr_06_mat-2` için okunur. Diğer derslerde süre `juniorNarrationDurationMs(mebNote, lifeUse)` ile, yani metin uzunluğundan gelir.

Görsel kip, zaman koduna değil kelimeye bakar. `lib/junior/scene-sync.ts`: «Görsel kip, canlı cümlenin tek başına sıçramasına bırakılmaz. Konu cümlesi kipi değiştirir. Genel cümle son kipi tutar.» Sayı sahnesi `asal`, `ortak bölen`, `çarpan` gibi kalıplarla seçilir. `sticky-frame.ts` boş kareyi atlar ve son çizilebilir kareyi yeni bir görsel işaret gelene kadar ekranda tutar. Sonuç: altyazı akarken sahne, o cümlenin konusuna yapışır; cümle genel konuşmaya dönerse çizim değişmez. Bu, kare kare koreografi değildir.

Eski grafik modülleri oynatıcının saati değildir. `graph-timeline-fallback.ts` başlığı «Eski numaralı grafik saat. Oynatıcı bu dosyayı okumaz» der. Dosya adları canlı anahtarla çakışır: `mat-27.graph.ts` içeriği `jr_06_mat-6`’dan alır; `mat-11.graph.ts` ders 11 değil ders 7 tarafına bağlanır. Yönlendirme tablosu `lib/junior/lesson-key-alias.ts` içindedir (27→6, 28→12, … 38→26).

İsim çarpışması mühür sabitlerindedir. `JUNIOR_PILOT_PLAYBACK_LESSON_KEY` değeri `jr_06_mat-1` iken sabit adı `JR_06_MAT_5_PRODUCTION`’dır. `JR_06_MAT_6_PRODUCTION` ise `jr_06_mat-2` içindir (`playback-key.ts`). Canlı `jr_06_mat-5` kesir ile bölme, canlı `jr_06_mat-6` uzunluk ölçüleridir. Bir sonraki fırın, dosya adına bakarak yanlış dersi mühürleyebilir.

Cümle kapısı da metni eğebilir. `listen-cue-fit.ts`: cümle sonu ölçülen sessizlikten 400 ms uzaktaysa o kelimenin cümle işareti düşer, en fazla 8 geçiş. Ses dosyası ve `production` yazılmaz. Kapı, noktalama silinerek geçebilir.

### 1.3 Anlatım ve altyazı

Çocuğun gördüğü yazı, kilitli çizelgedeki cue metnidir (`lib/junior/cue-cassette.ts`). Çizelge kilitli ve hazır değilse kaset dönmez. Matematik çizelgeleri kilitlidir; örnek süreler mat-1 299799 ms, mat-5 290608 ms, mat-6 142204 ms, mat-11 293264 ms, mat-26 292499 ms.

Kelime zamanı 10 ms RMS / Viterbi ile kurulur (`word-aligner.ts`). Cümle sonu kapısı: p90 &lt; 250 ms ve en büyük sapma &lt; 400 ms (`sync-gate.ts`). Kelime kapısı orta nokta sapması 80 ms, örtüşme 0.55 ve yeterli konuşma enerjisi ister. PCM yolu süre iddiasını örnek sayısından alır.

Karakter uzunluğundan pencere tahmini «mühürlü pilotun kapısı değildir» (`player-clock.ts`). Buna rağmen üretim mührü, mat-1 ve mat-2 dışında o tahmini süre kapısı yapar. Çizelgedeki zaman kodu ile mühürdeki süre hesabı aynı şey değildir. Çocuk kilitli çizelgeyi duyar; yeşil mühür çoğu derste metin uzunluğuna bakar.

### 1.4 Anlatım ve etkinlik

Matematik soru paketleri 1–26 için hem yazarlık dosyasında hem `packages/junior-content/quiz` JSON’unda vardır. Mühür en az üç soru, dolu kök, açıklama ve en az iki seçenek ister. Kab derslerin sorusu yoktur.

Etkileşimli şablon ayrı bir katmandır ve neredeyse boştur. `lib/junior/lesson-engine/registry.ts` yalnız iki şablon kaydeder: `jr_06_mat-1` ve `jr_06_mat-2`. `getJuniorLessonBlueprint` diğer her anahtar için yedek üretir: `mebCode: "MEB.6"`, başlık ham anahtar, kahraman soru «Bu konunun temel kuralını günlük yaşamda nasıl kullanırız?», rozet «Süper Kaşif», `simulations: []`. `listJuniorMatLessonBlueprints` yalnız mat-1 şablonunu döner.

Teorik metin ve üç soruluk quiz, konu başlığıyla aynı pakettedir. Dokunsal etkinlik, simülasyon ve rozet metni dersin kazanımına kilitli değildir; iki ders dışında jenerik kabuktur. Bu, «anlatılan teori ile etkinlik örtüşmüyor» bulgusunun kod karşılığıdır.

### 1.5 Seçmeli dersler — canlıya hazır değil

Altı kart, kart başına iki konu. Rozet metni «İki Konu / İlk Konu Ücretsiz» (`limits.ts`). Raf notu: «Yıllık seçmeli müfredat değildir. İngilizce, 6. Sınıf İngilizce kartındadır.» (`elective-shelf-note.ts`).

| Slug | Konu çifti | Paket |
|---|---|---|
| `jr_06_ing` | Selam / ad sorma | Fiyatın dışında. Rafta ikinci İngilizce kartı basılmaz. |
| `jr_06_alm` | Günün selamı / adını söylemek | Mühür açıksa seçilebilir |
| `jr_06_fra` | Bonjour / adını sormak | Aynı |
| `jr_06_siyer` | Doğru söz / merhamet | Aynı |
| `jr_06_kod` | Komut sırası / hatalı adım | Aynı |
| `jr_06_arp` | Selam / sağdan sola okumak | Aynı |

Her senaryo `scene: "elective"`, `band: "draft"` (`elective-catalog.ts` ve 12 konu JSON’u). Taslak bandı 3 dakika tabanını atlar. Ölçülen MP3’lerin hepsi 180 saniyenin altındadır (en kısası `jr_06_fra-2` 133308 ms, en uzunu `jr_06_ing-1` 167392 ms). Mühür seçmelide ısınma kaseti aramaz ve süreyi yine karakter saatinden okuyabilir. Ses modeli manifestte `gemini-3.8-flash-lite-tts`.

Veritabanında seçmeli kurs tablosu yoktur. `JuniorProfile.selectedElectives`, `JuniorSubscription.electiveQuota` (kota 3) ve genel `JuniorProgress` vardır. Kayıt `POST /api/junior-pilot/electives`.

UI kapıları:

- 1. konu, mühür açıksa kamuya açık. 2. konu yıllık plan ve kota seçimi olmadan kilitli.
- Mühür boşluğu olan kart `preparing`; düğme yok; oynat / anlat / öğretmen 403.
- Kota dolunca sonraki tıklama değiştirmedir.
- Denetim hesabı kartta «Admin İncele» görür.

Canlıya %100 hazır sayılmasını engelleyenler: iki konu, taslak bandı, üç dakikanın altındaki ses, İngilizce kartının paket dışına alınması, ortak `ElectiveMotif` sahnesi, karakter saatiyle açılabilecek mühür.

---

## 2. Akademi — satış

Erişim modeli `AcademyPurchase` satırıdır (`status` yalnız `SETTLED`, `userId + courseId` tekil). Ayrı `Enrollment` veya `License` tablosu yoktur. Süre, `settledAt` artı 365 gündür (`lib/academy/license.ts`). Fiyat kolonu kurs satırında değildir. Canlı tutar `PriceCatalogEntry.amountMinor` ve `isActive` olur. Aşağıdaki tutarlar kod tohumudur; canlı katalog satırı bu oturumda okunmadı.

### 2.1 Teknik kapılar

Satın alınabilirlik üç şartın kesişimidir (`academyCatalogPurchasable`, `pilot-sku.ts`):

1. Aktif fiyat satırı var.
2. `isPublished`.
3. `academyCourseSaleOpen`: sınav yolundaki her derste konuşma metni ve mühürlü ses. Isınma klibi, sabit görsel ve fon müziği bu kapıyı kapatmaz.

Biri eksikse kart CTA’sı satın alma bağlantısı basmaz (`storefront-cta.ts`):

- Üretim hattı SKU’su satış listesinde değilse «Çok Yakında», `href: ""`.
- `isPublished === false` ise «Yayında Değil», düğme kapalı.
- `purchasable` değilse «Kayıt Kapalı / Fiyat Bekleniyor», düğme kapalı.
- Kurs sayfası `PurchaseButton`’ı yalnız `purchasable` iken kurar.

Misafir PayTR’ye gitmez. Oturum yoksa kahraman bağlantı giriş adresidir.

Kart tahsilatı cüzdan yüklemesidir. Amaç kodu `academy-license:{slug}` (`paytr-license-bridge.ts`). Düz cüzdan yüklemesi lisans açmaz. PayTR yapılandırılmamışsa top-up 503 döner ve iframe açılmaz. CLEARED olunca kanca cüzdandan düşer ve `AcademyPurchase` yazar. Düşüm tutmazsa lisans yazılmaz; `refundUnlicensedAcademyCredit` aynı siparişin tutarını karta geri göndermeyi dener. Var olan bir satın alma satırını silmez. Bakiye siparişin altındaysa PayTR çağrılmaz, REQUESTED iade satırı durur.

`app/api/(kernel)/cron/paytr-reconcile/route.ts` bayat PENDING siparişleri kapatır. Erişim vermez. `CRON_SECRET` boşsa 503. Dosya yorumu, bir dönemde 16 siparişin 48 gün açık kaldığını tarihçe olarak yazar; bugünkü açık sipariş sayısı bu raporda yoktur.

Tohum kartı, veritabanı kurs satırı yokken vitrinde satın alınabilir görünebilir (`published-catalog.ts`). Satın alma o anda «Kayıt satırı henüz yazılmadı» diye düşer (`engine.ts`).

Süresi dolmuş lisans «bitti» gösterir ve yeniden satın alma düğmesi koymaz (`storefront-cta.ts`, `access === "expired"` → `primaryLabel: null`).

İlerleme kapısı katalogdaki Satın Al’ı gizlemez. İlk ders bittikten sonra oynatıcıda kasaya bağlanan bir karttır (`progress-gate.ts`).

RBAC satın almada ek rol aramaz. Oturum yeter. Ayrı bir sepet nesnesi yoktur; niyet tek kurs lisansıdır.

### 2.2 Kurgu ve fiyat

Vitrin tohumları (`packages/kernel/src/catalog-ids/course-registry.ts`, kuruş):

| Slug | Kod | Tohum | Vitrin sırası |
|---|---|---|---|
| `01_office_ai` | OFF-101 | 89.000 (₺890) | 1 — ana kahraman |
| `02_ecommerce_ai` | EC-102 | 99.000 (₺990) | 2 |
| `03_social_media_ai` | SM-103 | 89.000 (₺890) | 3 |
| `05_prompt_practice` | PR-105 | 129.000 (₺1.290) | 4 |
| `04_chatbot_nocode` | BOT-104 | 129.000 (₺1.290) | 5 |
| `01_office_ai_ileri` | OFF-201 | 129.000 (₺1.290) | 6 |

`/academy` yorumu vitrini tek kahramana indirmiştir. Kalan beş modül `/academy/ileri` üzerindedir; satın alma kapısı aynı çözücüdür (`app/academy/ileri/page.tsx`). Karar yorgunluğu azaltılmıştır. Kahraman kartın üç kapısından biri kapanırsa mağazanın görünen yüzü kapanır.

`06_`–`13_` kanon kabuktur: `vitrineOrder: null`, ders yolu boş, satış listesi kapalı. Tohumları ₺3.490 ile ₺19.000 arasındadır (`10_data_analytics_ai` 349.000 kuruş, `12_onprem_finetune` 1.900.000 kuruş). Rafta yoktur. «13 eğitim» vaadi kodda 6 dolu kart artı 8 boş kabuktur.

İkinci fiyat bandı `lib/academy/course-level.ts` içindedir (Temel 49.000, Orta 109.000, İleri 289.000 kuruş). Tutar boşsa yumuşak banttır. Vitrin tohumu değildir. İki fiyat evinin durması, «bilgi tek yerde» kuralını fiyat için deler. Canlı kilit yine `PriceCatalogEntry`’dir; tohum satırı ezer denmez.

Değer önerisi metni iş çıktısı anlatır (Excel tablosu, ürün başlığı, istem). Güven cümlesi lisansı 365 gün sayar ve şunu yazar (`focus-sale-pitch.ts`): «Ders erişimi açılınca bedel iade edilmez; henüz harcanmamış cüzdan yüklemesi kendiliğinden karta dönmez.» Katalog düğmesi ise «Eğitime Başla ve Sertifikana Ulaş — {fiyat}» der. Aynı güven cümlesi «satın alma tek başına belge basmaz» der. Sertifika eşiği 70’tir. Düğme belge vaat eder, gövde belgeyi teste bağlar ve iadeyi kapatır.

Hedef kitle kodda «işinde yapay zekâ kullanan yetişkin»dir. Ulaşım kanalı bu repoda bir büyüme yüzeyi değildir: ana sayfa 308 ile `/academy`’ye gider, sitemap kurs URL’lerini yalnız yayımlı adaylara koyar. Satmama şikâyetinin kodda görünen kökü pazarlama hunisi değil, düğmenin üç kapıdan birinde ölmesidir. Hangi kapının üretimde kırmızı olduğu veritabanı ve disk mührü okunmadan bilinmez. Bu, raporun bilerek açık bıraktığı tek satış gerçeğidir.

---

## 3. Yetki, atıl yüzey, SEO

### 3.1 `yapinet360@gmail.com`

Prisma `User` satırında rol kolonu yoktur. Tek kapı `isSuperAdminActor` (`lib/kernel/auth/super-admin.ts`).

- Geliştirmede doğrulanmış yerleşik kutu UUID beklemez. Varsayılan adres bu e-postadır.
- Üretimde `SUPER_ADMIN_USER_ID` boşsa yerleşik kutu dahil kimse admin olmaz.
- Üretimde yerleşik kutu, oturum UUID’si bu değişkenle birebir aynıysa açılır. `email_confirmed_at` token’da yoksa aynı eşleşme yedek olarak yeter.
- Başka bir adres üretimde hem `CANONICAL_SUPER_ADMIN_EMAIL` hem UUID ister.
- `yetkin.vision@gmail.com` env’e yazılsa da admin olamaz.

Admin sayfaları: `/admin`, `/admin/catalog`, `/admin/curriculum-revisions`. API `auth: "admin"`: katalog, yayın, huni. Akademi izleme bypass’ı aynı aktördür. Üretimde `hasUnlimitedAcademyAccess` kapalıdır: süper yönetici ders izler, sınavı ve sertifikayı bu fonksiyonla atlamaz (`lib/academy/access.ts`).

Kısıtlar, «tüm modüllere kısıtsız» cümlesini bozar:

- Junior kasası denetim hesabına 403 verir. Metin: «Denetim hesabı ödeme kaydı yazmaz.» (`lib/junior/checkout.ts`).
- Donmuş odalar admin kontrolünden önce kapanır: studio, devlabs, kurumsal, hibe, arena, pazaryeri, social (`lib/dronlar/kayit.ts`). Süper yönetici istisnası yoktur.
- Bakım bypass’ı `SITE_MAINTENANCE_BYPASS_TOKEN` / `MAINTENANCE_BYPASS_SECRET` ile olur, UUID ile değil.
- PayTR cron oturum tanımaz; `CRON_SECRET` ister.
- Cüzdan top-up ve iade oturum ister. Ayrı bir admin kasa paneli yoktur.
- Junior metni panelden düzenlenmez. Metin kod ve JSON’dur.

Üretimde bu kutunun gerçekten açık olup olmadığı `SUPER_ADMIN_USER_ID` değerine bağlıdır. Bu dosya okunmadı. Kod, adresin tek başına üretim anahtarı olmadığını söyler.

### 3.2 Atıl ve çift ev

Güçlü olanlar:

- `lib/junior/pilot-engine/mat-27.graph.ts` ve `mat-30`–`mat-36` grafik dosyaları duruyor. Karşılık gelen `content/mat/27.ts`–`38.ts` yok. Oynatıcı bunları okumaz. Mühür betikleri okur. Dosya adı ile canlı anahtar farklı dersi gösterir.
- `JR_06_MAT_5_*` adı `jr_06_mat-1` içeriğini, `JR_06_MAT_6_*` adı `jr_06_mat-2` içeriğini taşır. İki saat dili (koreografi ve grafik) aynı numarayı iki anlama çeker.
- Akademi kurs sayfası üç satın alma yüzeyi birden kurar: `PurchaseButton`, `BeginCheckoutLink`, `CourseHeroActions`, üstüne `FocusSalePitch` ve `FreePreviewLink`. Hepsi hâlâ import edilir. Ölü değiller; aynı kararı üst üste basarlar.
- `app/(public)/page.tsx` bir karşılama belgesidir. `next.config.ts` `/` adresini `/academy`’ye 308 ile çevirir. Başlık metni `lib/copy/sen-voice/public.ts` ve `academy.ts` içinde aynı cümledir: «Yapay Zekâyı Öğren. Gerçek İşlerinde Kullan.»
- Fiyat: `PriceCatalogEntry`, `priceSeedMinor`, `course-level.ts` yumuşak bandı.
- Hop sayısı: kod `RAIL_V1_HOP_META_COUNT = 33`. `OPS_RUNBOOK.md` 33 der. `ops/ops-dron.md` 30 der.
- Model kimliği: Anayasa «uyumsuzlukta kod haritaya çekilir» der. `.cursorrules` «bu dosya belgeye eşitlenir» der. Pedagoji «belge değil, kod düzeltilir» der. Bugün örtüşen kimlikler uyumludur. Bir sonraki değişiklik için kural üç yönlüdür.

Slug kataloğu ikiye bölünmemiştir. `COURSE_REGISTRY` (`packages/kernel`) hem web hem `apps/rail-is` tarafından süzülür. `academy-catalog.ts` fiyat etiketini API’den ekler.

`components/junior/lesson-engine/JuniorEngineProductionLesson.tsx` silinmiştir. Test dosyanın yokluğunu bekler.

### 3.3 SEO

Lighthouse çalıştırılmadı. Aşağısı kod riskidir.

Sitemap (`app/sitemap.ts`, `force-dynamic`) şunları basar: `/academy`, `/academy/ileri`, `/career`, `/junior`, doğrulama, vize, yasal yollar, yayımlı akademi kursları, Junior’da yalnız herkese açık ilk konular ve seçmeli açılışlar. Kilitli haftalar bilerek dışarıdadır. `/` sitemap’te yoktur çünkü 308’dir. Oynatıcı, çıkış paketi, kasa, profil, admin, giriş sitemap’te yoktur.

`robots.ts` bu özel yolları ve `/api/` yolunu kapatır. Canlı yayın kapanışı açıksa izin yasal sayfalara iner. Sitemap adresi `https://yetkin.ai/sitemap.xml` olarak sabittir.

Kök `layout.tsx` başlık ve Open Graph taşır, kanonik taşımaz; çocuk sayfalar `/` kanoniğini miras almasın diye. OG görseli kök, `/junior` ve doğrulama hash’i için üretilir. Kilitli Junior dersi `noindex` ve kanoniksizdir. Oynatıcı `noindex` basar, başlık ve açıklama basmaz; kök başlık noindex URL’ye sızabilir.

`app/layout.tsx` `connection()` ile belgeyi dinamik ve önbelleksiz kılar. `/junior` ve ders sayfası `force-dynamic`. `/junior` ve katalog gövdesi `"use client"` bileşenlerdir; Next onları sunucuda da basar, salt istemci SPA değildir. Ders zinciri `JuniorLessonEngine`’i `next/dynamic` ile bölmez.

Ana sayfa ile katalog aynı title dizesini paylaşır. Açıklamalar ayrıdır.

---

## 4. Belgeler — eleştirel okuma

Okunanlar: `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `AKADEMI_URETIM_ANAYASASI.md`, `README.md`, `OPS_RUNBOOK.md` başlıkları, `.cursorrules`, `AGENTS.md`, `lib/kernel/ai/model-roles.ts`.

A1–A5 ile kod uyumludur ve gevşetilmemelidir: para tamsayı ve `Wallet.amountMinor`, çekim rotası yok, satış fiyatı katalog satırında, sınav eşiği 70, doğrulama rotası var. Bu katman hantallık değil, kasa kilididir.

Geliştirmeyi yavaşlatan ve kendi içinde çelişen yerler:

1. **Modelin tek evi üç cümleyle üç yerdir.** Anayasa kodu haritaya çeker. `.cursorrules` belgeyi koda eşitler ve «beş aşama kapısı»nı dondurur. Pedagoji çelişkide belgeyi değil kodu düzeltir. `AKADEMI_URETIM_ANAYASASI.md` prosedürü «6 sıralı aşama» (0–5) diye yazar. Pedagoji «beş aşama»yı ders senaryosuna, «5 medya katmanı»nı dosyaya kullanır. Aynı sözcük üç nesnedir.
2. **Satış ile stüdyo mührü başlıkta birleşir, gövdede ayrılır.** Anayasa B3: Satın Al, yayın + aktif fiyat + ses ve metin ile açılır; beş katman stüdyo notudur. Üretim anayasasının 5. aşama başlığı «FİZİKİ DİSK MÜHRÜ VE SATIŞ MANDALI (5 Katman Doğrulaması)» der. Alt paragraf B3 ile uyumludur. Başlık, satışı beş dosyaya bağlar gibi okunur. Kod B3’ü uygular: ısınma, sabit görsel ve müzik satış kapısını kapatmaz.
3. **Junior kapısı iki belgede iki türlüdür.** Pedagoji Ek-J: ders veli rızası olmadan açılmaz; çekirdek dersin ilk konusu ücretsizdir; 10–18 yaş ve 5–12. sınıf aynı dersi farklı sesle dinler. Anayasa B6 ve kod: `/junior` ve kartların tanımlı açılışları kamuya açıktır; İngilizce açılışı 20. derstir; sınıf seçici yalnız 6. sınıfı gösterir; Young vitrinde yoktur. Kod B6’yı izler. Yaş penceresi `year - 18` … `year - 9` ve persona bantları `10-12` / `13-14` / `15-18` hâlâ `persona.ts` içindedir. Raf «sadece 6. Sınıf Pilot» der.
4. **«Çekirdek 105 konu kapağı» ile dosya sayımı ayrıdır.** Kapak manifestinde 100 `jr_` kaydı sayıldı. Çekirdek yazarlık dosyaları 26+27+20+14+24 = 111’dir. Kablar ve seçmeliler bu sayıya dahil değildir.
5. **Belgeler üründe olup adını koymadıkları şeyler:** `sale-hold.ts` cümleleri, lisans düşümü tutmayınca PayTR iadesi, `paytr-reconcile` cron’u (runbook Inngest taramasını anlatır), seçmeli kota 3 ve «iki konu» rozeti. `apps/rail-is` belgelerde vardır; eksik olan hop sayısının `ops-dron.md` içinde 30 kalmasıdır.
6. **Bitiş kapısı her işe tam takımdır.** `.cursorrules` içerik veya kasa dokunuşunda `tsc`, tüm vitest, API auth haritası, Junior içerik, akustik kapı, görsel op ve PayTR mühürlerini ister. Bu bir yayın kapısı olarak doğrudur. Her küçük tespit turunda aynı takımı koşturmak, tespit ile tedaviyi birbirine bağlar ve ajanı ya kuralı delen ya da günlerce mühür kovalayan konuma iter.

README «kamu vitrini Panel + Akademi + Kariyer» der. Junior müstakil odadır, dördüncü vitrin odası değildir. Cümle, Junior’ın kapalı olduğu şeklinde okunabilir. Kodda `/junior` açıktır; Young kapalı doğar.

---

## 5. Dört soru

### 5.1 Bu platformun mimarı olsam ilk üç adım

1. **Bir akademi kartını uçtan uca satılır hale getirmek.** Kahraman `01_office_ai` için canlıda üç kapının hangisinin kırmızı olduğunu okumak (yayın, fiyat satırı, ses-metin mührü). Kırmızı olanı kapatmak. Misafirin girdiği duvarda düğmenin neden durmadığını aynı ekranda yazmak («Yayında değil» ile «fiyat bekleniyor» ile «ses mührü eksik» aynı ölü düğmeye düşmesin). Süresi dolmuş lisansa yeniden satın alma koymak. Bunu yapmadan yeni kurs, yeni dron ve yeni belge maddesi yazmam.

2. **Junior mühür saatini duyulan sese bağlamak.** `jr_06_mat-6` ya 180 saniyeye çıkar ya da rafta kısa diye işaretlenir. mat-1 ve mat-2 dışındaki dersler karakter saatiyle yeşil kalamaz. `JR_06_MAT_5` / `mat-27.graph` adlandırma borcu, bir sonraki fırının yanlış dersi kilitlememesi için aynı turda sökülür. Etkinlik şablonu olmayan derse «Süper Kaşif / MEB.6» basılmaz; şablon yoksa jenerik rozet de basılmaz.

3. **Seçmeli ve 8 boş akademi kabuğunu vitrin vaadinden çıkarmak.** İki dakikalık taslak, yıllık seçmeli diye durmaz. `06`–`13` tohum fiyatları rafta yoktur; belgeler ve konuşma dili hâlâ «katalog» diyorsa kabuk sayısı ile satılan sayı ayrı yazılır. Genişletme, bu üç adım yeşil olduktan sonra başlar.

### 5.2 Platform kurgusu doğru mu?

İstemdeki hedef cümle «Amiral Gemi + Sürü Dron (Core + Micro-Apps / Shared Kernel / API-First)»dir. Anayasa B1 bu cümleyi emekli takma ad sayar. Canlı ad: **Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci.**

Kod bu ada uyar:

- Gövde tek Next.js uygulamasıdır (`app/`, `lib/`). Ayrı veritabanı ve ayrı kimlik yoktur.
- `@yetkin/kernel` para, katalog kimliği, hop ve zarfı taşır. Prisma taşımaz.
- `apps/rail-is` aynı `/api/v1` hop sicilini tüketen tek native istemcidir.
- «Dron» ayrı mikro uygulama değildir. `lib/dronlar/kayit.ts` içinde bir satır, bir bayrak ve bir yol önekidir. Yedi oda donmuştur.

Kayma şuradadır:

- Ürün yüzeyi iki büyük dikeydir (Junior ve Akademi) ve bir pasif kariyer/freelancer odasıdır. Donmuş yedi oda mimari seçenek olarak durur, ürün olarak durmaz. İsimleri roadmap sanılırsa çekirdek şişer.
- Junior, kernel’den çok `lib/junior` ve `packages/junior-content` içine gömülüdür. Hop’lar (`junior-shelves`, `junior-progress-read`) sonradan eklenmiştir. Native istemci bu yüzden ince sözleşmeyi tüketebilir; içerik fabrikasının kendisi hâlâ monolit dosyalarıdır. Bu, B1 ile çelişmez. «Her dikey kendi deploy’u» hayaliyle çelişir. O hayali belge bilinçli olarak öldürmüştür.
- API-first, vitrin sayfaları için geçerli değildir. Vitrin sunucu bileşeninden kataloğu okur. Mobil, hop’tan okur. İki kapı aynı kayıt defterine bakıyorsa bu doğrudur. Fiyat ve satış kapısı iki kapıda da `academyCatalogPurchasable` ise doğrudur. Bu raporda ikinci bir slug kataloğu bulunmadı.

Hüküm: mikro uygulama sürüsü inşa edilmemiştir ve edilmemesi, güncel anayasa ile uyumludur. Eski adla yeni kodu yargılamak yanlış kapı arar. Asıl kayma, donmuş odaların ve boş SKU’ların hâlâ «platform genişliği» gibi durmasıdır.

### 5.3 Tedavi sırası

1. Üretim okuması, kod yazmadan: kahraman kurs için `isPublished`, aktif `PriceCatalogEntry`, ses-metin mührü, PayTR yapılandırması, son 30 günde PENDING kalan sipariş. Hangi kapı kırmızıysa tedavi ona gider.
2. Satış yolu: ölü düğmenin nedenini ayırmak, süresi dolmuş lisansın yeniden satın alınması, düşüm tutmayınca kullanıcının gördüğü cümle (sessiz iade satırı yetmez).
3. Junior süre mührü: ölçülen MP3, mat-6 kararı, karakter saati yedeğinin kapatılması.
4. İsim borcu: grafik dosyası ve `MAT_5` / `MAT_6` sabitleri canlı anahtarla aynı adı taşısın ya da mühür betiğinin yolundan çıksın.
5. Jenerik «Süper Kaşif» şablonunun çocuk ekranına düşmesinin kapatılması. Şablon yazılmadan rozet vaadi yok.
6. Seçmeli: ya «iki konu taslak» diye kalır ve paket fiyatı onu yıl vaadi saymaz (bugün metin bunu söylüyor; vitrin hâlâ ders kartı gibi duruyor) ya da yıl planı yazılmadan satış kopyasından çıkar.
7. SEO: kamu katalogda `force-dynamic` ihtiyacını ölçmek, title çiftini ayırmak, oynatıcı noindex sayfasına kendi başlığını vermek. Lighthouse ancak bundan sonra.
8. Belgeler: model kuralını tek cümleye indirmek, «beş aşama» ile «altı aşama»yı ayırmak, Pedagoji Ek-J’yi B6 ve koda çekmek, `ops-dron.md` hop sayısını 33 yapmak, cron’u runbook’a yazmak.

A1–A5 bu sıranın hiçbir adımında gevşetilmez.

### 5.4 Uzun vadeli master plan

Çekirdek motor şu sözleşmelerden ibaret kalır: kimlik, tamsayı cüzdan, katalog fiyatı, 365 gün lisans, ilerleme, mühürlü medya, `/api/v1` hop. Dikeyler bu sözleşmeyi tüketir. Yeni ülke, yeni sınıf veya yeni mobil kabuk yeni veritabanı açmaz.

Ürün sırası:

- **Kama:** 6. sınıf, beş çekirdek ders, ölçülmüş ses, kazanım koduyla birebir soru. Türkiye’de ödeyen kişi velidir. Seçmeli, çekirdek yıl dolmadan «yıllık paket» cümlesine girmez.
- **İkinci ürün:** Akademi’de az sayıda, sesi mühürlü, tek iş vaat eden kurs. Boş `06`–`13` kartları ya dersle dolar ya kayıt defterinden «hazırlanıyor» kabuğu olarak kalır ve fiyat tohumu vitrin konuşmasına sızmaz.
- **Üçüncü:** Young, `DRON_YOUNG_OPEN` ile, Junior şemasının lise bantına taşınmasıyla. Aynı dersi 8. sınıf ve lise öğrencisine farklı sesle okutma vaadi, bant gerçekten yazılmadan belgede durmaz.
- **İstemci:** `rail-is` kalıbı. Her dikey mobil uygulama aynı hop sicilini tüketir. İçerik fabrikasının çıktısı JSON + mühürlü ses + zaman çizelgesidir; uygulama o paketi çalar, müfredatı gömmez.
- **Fabrika:** Bir dersin yeşil sayılması için tek süre kaynağı ölçülen ses olur. Çizelge kilitli değilse ders rafta «hazırlanıyor» durur. Jenerik rozet ve `MEB.6` yedeği kalkar. Görsel kip, kelime avı yerine çizelgedeki görsel işarete bağlanır.
- **Coğrafya:** Çekirdek müfredattan bağımsızdır (kimlik, para, mühür, hop). Müfredat paketleri ülkeye özeldir. İkinci ülke, 6. sınıf Türkiye paketinin mühür disiplini bir yıl dönmeden açılmaz. Aksi halde global çekirdek, iki yarım katalog olur.

Donmuş odalar (pazaryeri, arena, sosyal, hibe, kurumsal) master planın parçası değildir. Açılmaları ayrı bir ürün kararıdır ve çekirdeğe yeni tablo eklemeden, aynı cüzdan ve aynı hop ile yapılır. Açılmadan önce silinmiş sayılırlar: kodda 410, yol haritasında yok.

---

## 6. Bilerek doğrulanmayanlar

- Canlı `PriceCatalogEntry` tutarları ve `academy_courses.is_published` değerleri.
- Kahraman kurstaki ses dosyalarının diskte gerçekten mühürlü olup olmadığı (`public/media` taranmadı).
- Üretim `SUPER_ADMIN_USER_ID` eşleşmesi.
- `juniorProductionSealGaps` çalıştırıldığında hangi derslerin kırmızı döndüğü. Mat-6’nın karakter saatiyle yeşil kalacağı, fonksiyonun kendi yorumundan okunur.
- Lighthouse puanı.
- RLS politikalarının her tabloyu hâlâ örtüp örtmediği. Migration dosyaları vardır; tam kaplama sayılmadı.
- Çocuk ekranında yedek «Süper Kaşif» şablonunun hangi bileşenden basıldığı. `getJuniorLessonBlueprint` yedeği üretir; bu oturumda oynatıcı ağacı tıklanarak doğrulanmadı.
