# TESPİT RAPORU — OFF-101 / OFF-201, Canlı Sistem, PayTR ve Kılavuz Belgeler

| Alan | Değer |
|------|-------|
| Tarih | 27 Eylül 2026 |
| Tür | Salt okuma tespiti. Kod yazılmadı, dosya silinmedi. Bu dosya tek değişikliktir. |
| Çalışma dalı | `off-201-stage` — uzak `origin/off-201-stage` önünde **4** commit, `origin/main` önünde **20** commit |
| Commit edilmemiş iş | `.system_docs/` altındaki 4 belge, `docs/ops/DURUM.md`, OFF-201 müfredatında 9 dosya (yalnız yorum), 2 test dosyası, `docs/` altında 6 silinmiş rapor |
| Önem etiketleri | **[KRİTİK]** hemen karar ister · **[YÜKSEK]** bu hafta · **[ORTA]** plana alınır · **[DÜŞÜK]** fırsat buldukça · **[BİLGİ]** durum notu |

---

## 0. ÖZET — İLK OKUNACAK SAYFA

1. **[KRİTİK] Canlı site `main` dalından yayında değil.** `https://yetkin.ai/academy/01_office_ai_ileri` sayfası açık, ders listesi basılı. Bu sayfanın metni yalnız `off-201-stage` dalında var. `origin/main` dalında OFF-201 kodu hiç yok. Yani canlıya birleşmemiş bir dal çıkmış. Bu, Anayasa B3'teki "mühürsüz merge ve yayın yasağı" maddesine aykırıdır. CI yalnız `main` için koşar; canlı kod CI'dan geçmemiş olabilir.
2. **[KRİTİK] Canlıda OFF-201 için iptal edilmiş ses kasetleri yayında.** Canlıdaki `01_office_ai_ileri-1.mp3` ve `01_office_ai_ileri-6.mp3` dosyalarının MD5 özeti, `archived/academy-audio-revoked/01_office_ai_ileri/multi-voice/` altındaki iptal kasetleriyle birebir aynı. Uzak `off-201-stage` dalında iptal listesi boş ve 6 dersin 6'sı "mühürlü" sayılıyor. Bu dal canlıdaysa oynatıcı bu kasetleri açar. Katalog satırı da varsa satış açık olabilir. Yereldeki "0/6 mühürlü, satış KAPALI" kararı henüz push edilmedi.
3. **[YÜKSEK] Ücretli ders sesleri satın almadan indirilebilir.** `public/media/academy/audio/...mp3` yolu oturum istemeden 200 döner (OFF-101 ders 1 ve OFF-201 ders 1 ile 6'da doğrulandı). Satış sayfası ise "sesli anlatım satın alma sonrasında açılır" diyor.
4. **[YÜKSEK] `docs/DURUM.md` silindi ama her yerde ona yönlendirme var.** Üç kılavuz belge, üç ops belgesi ve üç test dosyası bu dosyayı arıyor. CI `main` dalında `npm run test` koşuyor. Bu silme merge olursa ana dal kırmızıya düşer.
5. **[YÜKSEK] PayTR panel adresi imzası tutmayan bildirime de "OK" diyor.** Canlıda sır yanlış girilirse PayTR yeniden denemeyi bırakır. Kart çekilir, lisans açılmaz. Tek kurtarma yolu Inngest mutabakat işidir.
6. **[YÜKSEK] OFF-101 kendi kurallarıyla yeniden fırınlanamaz.** Mühürlü kurs 128 TTS parçası taşıyor; tavan 100. Her ders 14–19 parça taşıyor; bant 10–12.
7. **[YÜKSEK] Pedagoji "kapı" kelimesini öğrenciye yasaklıyor.** Mühürlü OFF-101 sesi, sınav soruları ve kamu satış sayfası "Üç Kapı" diyor.
8. **[BİLGİ] PayTR çekirdeği sağlam.** HMAC zamanlama-güvenli, tutar eşleşmesi zorunlu, sandbox ve mock üretimde kapalı, defter tek yönlü (append-only). 18 Eylül 2026 canlı tanığı belgede kayıtlı.
9. **[BİLGİ] Mimari tutarlı.** "Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci" gerçekten kurulmuş. Dron uygulaması Amiral koduna değil, `@yetkin/kernel` paketine ve `/api/v1` hop'larına bağlı.

---

## 1. YÖNTEM VE SINIRLAR

**Ne yapıldı**

- Kaynak kod, Prisma şeması, testler, scriptler ve `.system_docs/` okundu.
- Git dalları karşılaştırıldı (`origin/main`, `origin/off-201-stage`, yerel `HEAD`).
- Canlı siteden üç sayfa okundu: ana sayfa, `/academy/01_office_ai`, `/academy/01_office_ai_ileri`.
- Canlıdaki üç MP3 dosyasına yalnız başlık isteği (HEAD) atıldı. `etag` değeri yerel dosyaların MD5 özetiyle karşılaştırıldı. İndirme yapılmadı.
- `tests/academy` paketi tarama sırasında bir kez okuma amaçlı koşturuldu.

**Ne yapılmadı**

- Tam test paketi koşturulmadı. "Yalnız oku" talimatı gereği engellendi.
- 14 dersin tamamı canlıyla karşılaştırılmadı. Aynı gerekçeyle ek ağ sorgusu yapılmadı. Karşılaştırma 3 dosyayla sınırlı kaldı.
- Vercel ortam değişkenleri, PayTR paneli, canlı veritabanı ve Inngest paneli görülmedi.
- `node_modules/`, `.env*` dosyaları, `yetkin_muze/` ve `public/media/` içeriği okunmadı. Yalnız dosya adı, boyut ve özet alındı.

**Çürütülen bir iddia**

Tarama sırasında "OFF-101 ders 3 ve 4 seste yanlış sıra numarası söylüyor" iddiası çıktı. Doğrulandı ve **yanlış** çıktı. `lib/academy/curricula/lesson-index.ts` sırası `1 → k1 → 2 → 3 → 5 → g1 → w1 → 6` şeklindedir. `01_office_ai-2` üçüncü, `01_office_ai-3` dördüncü derstir. Seste söylenen numaralar doğrudur.

---

## 2. CANLI SİSTEM VE ÖDEME (PAYTR)

### 2.1 Canlı ortam ile kod dalı ilişkisi

| Kanıt | Bulgu |
|-------|-------|
| `origin/main` son commit | `49761f4` (25 Eylül 2026, cüzdan düzeltmesi) |
| `origin/main` içinde OFF-201 | `lib/academy/curricula/office_ai_2/` yok, `office_ai/off-201.ts` yok, `01_office_ai_ileri` MP3 yok |
| Canlı OFF-201 sayfası | Açık. "İleri Ofis Yapay Zekâ", 6 ders, "Eğitimi başlat", "Gösterilen tutar KDV dahildir" |
| Sayfadaki özgün cümle | "Bu eğitim ileri seviye uygulamalar içerir" yalnız `origin/off-201-stage:lib/copy/sen-voice/academy.ts` içinde var |
| Canlı OFF-201 ders 1 MP3 | `etag 12a40302c3636c632f1f184851a5c949` = `archived/academy-audio-revoked/01_office_ai_ileri/multi-voice/01_office_ai_ileri-1.mp3` MD5 |
| Canlı OFF-201 ders 6 MP3 | `etag 249dd37d843745af8f45cf7f5c410773` = `archived/.../multi-voice/01_office_ai_ileri-6.mp3` MD5 |
| Canlı OFF-101 ders 1 MP3 | `etag eb80e82458ab52f7ba19ac02627e5a72` = yerel `public/media/academy/audio/01_office_ai/01_office_ai-1.mp3` MD5 (doğru kaset) |
| `origin/off-201-stage` iptal listesi | `ACADEMY_TTS_REVOKED_CASSETTES = {}` ve `ACADEMY_TTS_REBAKE_QUEUE = {}` — 6/6 mühürlü sayılır (`lib/academy/pilot-sku.ts:62-95` o daldaki hâli) |
| Yerel `HEAD` iptal listesi | 6 ders iptal, 6 ders kuyrukta, satış kapalı — **push edilmedi** |

**[KRİTİK] K-1 · Canlı yayın birleşmemiş daldan çıkmış.** Olası yollar: Vercel üretim dalı `off-201-stage` olarak ayarlanmış, bir önizleme üretime taşınmış ya da yerelden `vercel --prod` basılmış. Kökte `.vercel/` bağlantı klasörü var; bu yerelden basma olasılığını açık tutuyor. Hangi yolun kullanıldığı Vercel panelinden doğrulanmalı. CI (`.github/workflows/ci.yml`) yalnız `main` için koşar.

**[KRİTİK] K-2 · Canlıda iptal kasetleri servis ediliyor.** `.cursorrules` §5 bu kasetleri "vatandaş oynatıcı açmaz" diye tanımlar. Canlı kod uzak `off-201-stage` ise oynatıcı açar. `academyCourseSaleOpen("01_office_ai_ileri")` o dalda ses kapısından geçer. Satışın gerçekten açık olup olmadığı üç şeye bağlıdır: `PriceCatalogEntry` satırı, `isPublished` ve canlı kodun hangi commit olduğu. Hemen bakılması gerekenler:

- Canlı OFF-201 sayfasında satın alma düğmesi basılı mı?
- Veritabanında `academy_purchases` içinde `01_office_ai_ileri` için SETTLED satır var mı?
- Varsa bu kullanıcılara hangi ses çalındı ve ne yapılacak (erişim, iade, bilgilendirme)?

**[YÜKSEK] K-3 · Ders sesi herkese açık.** `STORAGE_CONTRACT.md:5,13` kamu yolunu bilinçli olarak `public/media/academy/audio/{slug}/{key}.mp3` diye tanımlar. Ama satış sayfası şunu söyler: "tam ders metinleri, sesli anlatım ve sınav soruları satın alma sonrasında açılır". Adresler tahmin edilebilir. Oturum istemez. Ücretli OFF-101'in 8 dersi satın almadan indirilebilir. Oynatıcı kapısı erişim kapısı değildir. Ayrıca iptal kasetleri de aynı yoldan açığa çıkar. `STORAGE_CONTRACT.md:13` listesinde `01_office_ai_ileri` klasörü de anılmıyor.

### 2.2 PayTR mimarisi (kod gerçeği)

İki ayrı port vardır:

| Port | Rol | Durum |
|------|-----|-------|
| Merchant iFrame | Cüzdan yükleme + Akademi lisansı | Kod canlıya hazır |
| Pazaryeri Split | Freelancer emanet | `MARKETPLACE_SPLIT_LIVE = false` — her çağrı `not_configured` döner |

**Akış (adım adım)**

1. Fiyat `PriceCatalogEntry.amountMinor` satırından okunur. Tohumlar: OFF-101 `89_000` kuruş (₺890), OFF-201 `OFF_201_LAUNCH_PRICE_MINOR = 129_000` (₺1.290).
2. `POST /api/wallet/top-up` oturum, hız sınırı (IP 8/10 dk, kullanıcı 4/10 dk) ve `Idempotency-Key` ister. `PaymentOrder` PENDING açılır. Amaç `wallet-top-up` ya da `academy-license:{slug}`.
3. Token HMAC-SHA256 ile üretilir (`lib/kernel/payments/paytr/checkout.ts:350-375, 422-440`). `payment_amount` kuruş, sepet TL ondalıktır. `no_installment=1`, `max_installment=0`, `timeout_limit` 30 dk.
4. iFrame `https://www.paytr.com/odeme/guvenli/{token}` açılır.
5. Tarayıcı dönüşü `/cuzdan` sayfasına gider. Bu dönüş CREDIT yazmaz.
6. Bildirim `https://yetkin.ai/api/paytr/callback` adresine gelir. Bu adres `app/api/(kernel)/payments/webhooks/paytr/route.ts` işleyicisinin takma adıdır.
7. İmza `merchant_oid + merchant_salt + status + total_amount` ile doğrulanır. Karşılaştırma `timingSafeEqual` iledir (`webhook.ts:67-76, 316-326`).
8. Başarıda `total_amount` ile `order.amountMinor` eşleşmelidir. Sonra satır kilitlenir (FOR UPDATE), defter CREDIT yazılır, sipariş CLEARED olur.
9. Amaç akademi lisansıysa kanca çalışır: fiyat kilidi, cüzdan DEBIT, `academy_purchases` SETTLED.
10. Kapanış hata verirse Inngest `PAYTR_CLEARING_REQUESTED` olayı gönderilir. Inngest yoksa 503 döner; PayTR yeniden dener.
11. Mutabakat işi (`reconcile.ts:76-170`) PayTR durum sorgusuna bakar. Ödeme görünüyorsa geç de olsa kapatır. PENDING 2 saat sonra FAILED olur.

**Güçlü yanlar [BİLGİ]**

- Üretimde sandbox ve mock açılırsa kod hata fırlatır (`checkout.ts:130-155`, `mock-checkout.ts:31-32`).
- Canlıda `NEXT_PUBLIC_APP_URL` için localhost yasak (`checkout.ts:255-274`).
- CREDIT yalnız imzalı bildirimden veya PSP durum sorgusundan doğar. Kodda "imzasız CREDIT" yolu bulunmadı.
- Başarısız bildirim CLEARED siparişi ezmez.
- Test kapsamı geniş: `tests/kernel/paytr*.test.ts` (token, imza güvenliği, cüzdan akışı, mutabakat, takma ad), `tests/academy/paytr-license-bridge.test.ts`, `wallet-card-refund.test.ts`.

### 2.3 PayTR bulguları

**[YÜKSEK] P-1 · Panel adresinde imzasız bildirime 200 OK.** `route.ts:69-71` şu kuralı koyar: istek resmî PayTR IP'sinden geliyorsa **ya da** yol panel takma adıysa, imza tutmasa bile "OK" döner. Canlı panel adresi zaten takma addır. Sonuç şudur:

- Canlıda `PAYTR_MERCHANT_SALT` veya `PAYTR_MERCHANT_KEY` yanlışsa gerçek ödemeler de "OK" alır. PayTR yeniden denemeyi bırakır.
- Kimlik bilgisi eksikse (`production_safety`) yine "OK" döner (`route.ts:193-197`).
- Kurtarma yalnız mutabakat işindedir. Aynı yanlış sırla PSP durum sorgusu da düşerse sipariş `psp_unavailable` ile atlanır ve PENDING kalır (`reconcile.ts:154-161`). Para kaybolmaz, ama kart çekilmiş müşteri lisanssız bekler.
- Güvenlik ağı mutabakat işinin canlıda gerçekten koştuğuna bağlıdır. Bu doğrulanamadı.

Ek not: İzin listesi doluyken panel yolu IP kontrolünü de atlar; yalnız `ip_bypassed` logu düşer (`route.ts:168-176`).

**[ORTA] P-2 · Ops belgesi ile kod ayrışıyor.** `.system_docs/ops/ops-paytr.md` "geçersiz imza → 403" ve "eksik kimlik → 400" der. Panel yolunda ikisi de 200 OK'dir.

**[ORTA] P-3 · İmza hatası logu iki özeti birden basar.** `webhook.ts:341-357` alınan ve hesaplanan özeti `merchant_oid` ile loglar. Anahtar basılmaz, ama log yüzeyi gereğinden geniş.

**[ORTA] P-4 · Canlı kod, `main` kodu değil.** 2.1'deki bulgu PayTR için de geçerli. Canlıdaki PayTR kodu `main` ile `off-201-stage` arasındaki 20 commit'lik farkı taşıyor olabilir. Bu fark CI'dan geçmedi.

**[DÜŞÜK] P-5 · `LIVE_BROADCAST_SHUTDOWN` açıkken bildirim 503 alır.** Tasarım budur; kapatma uzun sürerse valör gecikir.

**[DÜŞÜK] P-6 · `.env.example` laboratuvar değeri `PAYTR_SANDBOX="1"`.** Üretime kopyalanırsa kod hata fırlatır. Bu iyi bir kalkan; yine de operatör hatası riski taşır.

**Canlı erişim olmadan doğrulanamayanlar**

- Vercel Production'daki `PAYTR_*`, `NEXT_PUBLIC_APP_URL`, `TRUSTED_PROXY_HOPS`, `INNGEST_*` değerleri.
- PayTR panelindeki Bildirim URL'si ve mağazanın canlı/test modu.
- Inngest mutabakat taramasının canlıda koşup koşmadığı.
- Canlı `PriceCatalogEntry` tutarları.
- 18 Eylül 2026 tarihli ₺15 CLEARED tanığı. Bu yalnız belgede kayıtlıdır (`ops-paytr.md:48`, `docs/ops/DURUM.md:62`).

---

## 3. OFF-101 — `01_office_ai` (Son kontrol)

### 3.1 Genel durum

| Ölçüt | Durum |
|-------|-------|
| Sınav yolu | 8 ders — `1 → k1 → 2 → 3 → 5 → g1 → w1 → 6` |
| Mühür | 8/8 mühürlü (`ACADEMY_MEDIA_SEALED_AUDIO`) |
| Ses | Callirrhoe / Gözde, hız 0.93 (`instructors.ts:169, 360`) |
| Süre | 4698.12 sn ≈ 78.3 dk. Her ders 5 dakikanın üstünde (en kısa `-6`: 506.04 sn) |
| Satış | Açık. Tohum ₺890 |
| Canlı ses | Ders 1 canlıda yerel mühürlü kasetle birebir aynı (MD5) |
| Satış sayfası | Canlı. "8 ders · 79 dk" |

### 3.2 Ders tablosu

| Sıra | Anahtar | Süre (sn) | TTS parçası | 10–12 bandı |
|------|---------|-----------|-------------|-------------|
| 1 | `01_office_ai-1` | 691.84 | 16 | dışında |
| 2 | `01_office_ai-k1` | 702.00 | 15 | dışında |
| 3 | `01_office_ai-2` | 520.08 | 14 | dışında |
| 4 | `01_office_ai-3` | 537.96 | 14 | dışında |
| 5 | `01_office_ai-5` | 553.00 | 14 | dışında |
| 6 | `01_office_ai-g1` | 603.84 | 18 | dışında |
| 7 | `01_office_ai-w1` | 583.36 | 19 | dışında |
| 8 | `01_office_ai-6` | 506.04 | 18 | dışında |
| | **Toplam** | **4698.12** | **128** | tavan 100 |

Kaynak: `lib/academy/lesson-audio-timings/*.json` içindeki `pieces` dizisi.

### 3.3 Eksik ve hatalı parçalar

**[YÜKSEK] O1-1 · Kurs kendi kuralıyla yeniden fırınlanamaz.** 128 parça, `ACADEMY_MATCH_WHISTLE_MAX = 100` tavanını aşıyor. Her ders `ACADEMY_TTS_LESSON_REQUEST_MIN/MAX = 10/12` bandının dışında. Bir dil düzeltmesi için yeniden fırın gerekirse `assertAcademyMatchWhistleBudget` ve `assertAcademyTtsLessonRequestBudget` durdurur. Metin önce 10–12 bloğa yeniden paketlenmelidir. 8 ders × 10 blok = 80 istek, normal bandın tam üst sınırıdır.

**[YÜKSEK] O1-2 · "Kapı" kelimesi mühürlü içerikte.** `PEDAGOJI.md §A.2` ve `§C` şunu der: "«Kapı» kelimesi öğrenci cümlesine girmez." Kullanımlar:

- Ses ve cue: `spoken-scripts/01_office_ai-k1.md:27,29`, `01_office_ai-3.md:21`, `section_1.ts:22` ("aynı kapıdandır").
- Sınav: `lesson-exams/01_office_ai-k1.json:18` ("Üç Kapı'da 3. Kapı..."), `exam-pools.ts:60,390`.
- Kamu sayfası: `components/academy/office-ai-guide-preview.tsx:81,85` ("Üç kapı: dosyayı modele nasıl verirsin?").
- Asistan: `lib/academy/ai-desk.ts:35` ("Bu birinci kapıdır").

Aynı `k1` paragrafında iki ayrı üçlü var. "Üç adım" (şirket politikası, veri sınıfı, aktarım yolu) ile "Üç Kapı" (panel, ataş, maskeli özet) arka arkaya anlatılıyor. Öğrenci için iki farklı "üç" aynı anda duruyor. Bu, anlamayı zorlaştırır.

**[ORTA] O1-3 · Yasak aileye yakın ve şov kokan ifadeler.**

- `section_3.ts:16` (ses: `01_office_ai-3.md:13`): "Elinde harika fikirler, eksiksiz veriler var ama onları boş bir slayta dökmek korkutucu gelir."
- `section_3.ts:14`: "devasa tabloları ... dakikalar içinde derleyip toparlamıştık", "kararsızlığı nasıl hızla ortadan kaldırabileceğimizi gördük", "o güçlü analizi".
- `section_3.ts:40`: "Üstelik bu dönüşümü dakikalarca uğraşarak değil, doğru yönlendirilmiş tek bir istemle elde ediyorsun."
- `section_1.ts:56`: "Kendi gözlerinle dönüşümün hızını gördüğünde..."
- `section_w1.ts:48`: "Hata yapmamak için kural basittir" ve "tek seferde eksiksiz analiz eder" — hem "basit" ailesi hem gerçek dışı vaat.
- `cinema-cue-catalog.ts:882`: "Kendi metnini tek tıkla slayt taslağına çevir."

**[ORTA] O1-4 · "Suçu anlatıcı alır" kalıbı OFF-101'de yok.** `.cursorrules §7` ve `PEDAGOJI §A.2` bu kalıbı ister. OFF-201'de iki yerde var. OFF-101'de hiç yok. Bunun yerine "Unutma, ..." gibi emir cümleleri var.

**[ORTA] O1-5 · Uzun, çok işli cümleler.** Ortalama cümle 9.1 kelime; bu iyi. Ama kuyrukta 22–44 kelimelik cümleler var. En uzunları `section_1.ts:38` (44 kelime), `prep.ts:17` (30), `section_2.ts:40` (26), `section_g1.ts:14` (25), `section_k1.ts:39` (25). OFF-201'de 20 kelimeyi aşan cümle yok.

**[ORTA] O1-6 · Isınma videosu içerikle örtüşmüyor.** `lib/academy/lesson-veo.ts:42` yorumu "Excel B-roll yalnız Excel masalı derslerde" der. Aynı listede `k1` (KVKK), `g1` (e-posta) ve `w1` (Word) var. Bu dersler aynı Excel/ofis klibini açar. `PEDAGOJI §A.1` "anlatılan işlem ile görünen kare örtüşür" der.

**[ORTA] O1-7 · Fon müziği yalnız ders 1'de, diyagram klasörü yok.** Yatak MP3'ü yalnız `01_office_ai-1.bed.mp3`. `public/media/academy/diagrams/` yok. Oysa `production-standard.ts:94-100` `diagrams` katmanını mühürlü katman diye listeler. Anayasa B4'e göre bu eksikler satışı kapatmaz. `.cursorrules §1`'e göre her ders 4 katman taşımak zorundadır. İki kural çelişiyor (bkz. §6).

**[ORTA] O1-8 · Fon müziği mantığında muhtemel ters etki.** `lib/academy/lesson-bed-duck.ts:166-170` her konuşma bloğunun ilk 3 saniyesinde hedef kazancı nefes seviyesinden (0.46) başlatıp dibe (0.12) indirir. Bloklar arası boşluk en fazla 1.75 sn'dir (`human-rhythm.ts`). Bu sürede müzik ancak yaklaşık 0.26'ya çıkar. Yani müzik anlatıcı konuşmaya başladığında yükseliyor, sessizlikte değil. Oynatıcı 4 sn'lik yumuşatma uyguladığı için sıçrama yumuşar. Yine de yön ters. Bugün yalnız ders 1'de yatak olduğu için etki sınırlı. Kulakla dinleme testi gerekir.

**[DÜŞÜK] O1-9 · Emekli ders kalıntıları.** `01_office_ai-4` sınav yolunda yok. Ama `public/media/academy/audio/01_office_ai/01_office_ai-4.mp3`, `curricula/office_ai/section_4.ts` ve `docs/curriculum/01_office_ai_04_cue.json` duruyor. `lesson-veo.ts` ve `lesson-bed-duck.ts` listelerinde de anahtarı geçiyor.

**[DÜŞÜK] O1-10 · Açılış cümleleri tutarsız.** Ders 3 ve 4 "yetkin.ai akademisinin bu üçüncü dersinde" diye açılıyor. Ders 5 ve 6 "İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin ... dersine hoş geldin" diyor.

**[BİLGİ]** Sabitler kilitle uyumlu: 5 dk taban, 6 ders taban, 100 tavan, hız 0.93, nefes 0.4, geçiş 1.75, ön açılış 1.5, yalnız `gemini-3.1-flash-tts-preview`, `VOICE_TTS_FALLBACK_TO_2_5 = false`.

---

## 4. OFF-201 — `01_office_ai_ileri` (Geliştirme aşaması)

### 4.1 Yapı

| Katman | Dosya |
|--------|-------|
| SKU sabitleri | `lib/academy/curricula/office_ai/off-201.ts` |
| Modül ve dersler | `lib/academy/curricula/office_ai_2/index.ts`, `planned.ts`, `section_1..6.ts` |
| Konuşma gövdesi | `office_ai_2/spoken-body.ts` → `lib/academy/spoken-scripts/01_office_ai_ileri-{1..6}.md` |
| Sıra | `lesson-index.ts:23-30` |
| Ses kilidi | `instructors.ts:201` `ACADEMY_OFF201_COURSE_MASTER_VOICE = "Kore"` |
| İptal ve kuyruk | `pilot-sku.ts:87-110` (yerel `HEAD`) |
| Yatak havası | `lesson-bed-duck.ts:11-18` (ambient / lo-fi / upbeat) |
| Görsel reji | `lesson-beat-visual.ts` OFF-201 bloğu, `off201-cinema-slides` |
| Fırın makbuzları | `media-bake/academy/dry-run-receipts/01_office_ai_ileri/*.json` — 6/6, hepsi `"courseMasterVoice":"Kore"` |

### 4.2 Ders tablosu

| Sıra | Başlık | Eski kayıt (sn) | `targetDurationMinutes` | Canlı vitrin | TTS parçası |
|------|--------|-----------------|-------------------------|--------------|-------------|
| 1 | Dört Parçalı İstem | 514.261 | 8 | 9 dk | 12 |
| 2 | Toplantı Notu ve Eylem Listesi | 615.508 | 8 | 10 dk | 12 |
| 3 | Excel Formül ve Grafik | 688.064 | 8 | 14 dk | 11 |
| 4 | Uzun Belge ve Sayfa Kontrolü | 765.066 | 10 | 18 dk | 12 |
| 5 | E-Posta Sınıflandırma ve Yanıt Taslağı | 864.722 | 11 | 18 dk | 12 |
| 6 | Üç Dosyada Yan Yana Sayı Denetimi | 754.906 | 11 | 13 dk | 12 |
| | **Toplam** | **≈ 70 dk** | **56 dk** | **82 dk** | **71** |

71 istek, 70–80 normal bandın içinde ve 100 tavanının altında. Kore yeniden fırını bütçeye sığar.

### 4.3 Bağımlılıklar

- OFF-101'e zorunlu ön koşul yok (`off-201.ts:18`). `off101-exemption.ts` isteğe bağlı muafiyet yoludur.
- OFF-101 `planned.ts` içinde `01_office_ai-10..12` uydu anahtarları OFF-201 başlıklarını yansıtır. Bu tasarım gereğidir; ikinci bir müfredat değildir.
- Ortak modüller: `instructors.ts`, `pilot-sku.ts`, `lesson-beat-visual.ts`, sınav havuzları, fırın scriptleri.
- `02_ecommerce_ai` da Kore sesine bağlı (`instructors.ts:361`). Kural kurslar arası aynı sese izin verir.

### 4.4 Bulgular

**[KRİTİK] O2-1 · Canlı durum ile yerel karar ayrışıyor.** Yerelde OFF-201 0/6 mühürlü ve satış kapalı. Canlıda iptal kasetleri servis ediliyor ve uzak dal 6/6 mühürlü sayıyor (bkz. K-1, K-2). Yereldeki 4 düzeltme commit'i (`8d1166a`, `a7ef394`, `3d4c92f`, `d194f4a`) push edilmedi.

**[YÜKSEK] O2-2 · İptal kasetleri `public/` içinde duruyor.** Yereldeki 6 OFF-201 MP3'ü iptal kuşağıdır; ders 6 dosyası iptal klasöründeki `multi-voice` kasetiyle aynı boyuttadır. Oynatıcı açmasa da adres herkese açıktır (bkz. K-3).

**[YÜKSEK] O2-3 · Isınma videosu hiç yok.** `academyLessonWarmupVeoAssetKey` OFF-201 anahtarları için `null` döner. `public/media/academy/micro/` altında OFF-201 klibi yok. `.cursorrules §6` ders başına 1 Veo 3.1 Lite klibi ister.

**[ORTA] O2-4 · Üç farklı süre.** Müfredat hedefi 56 dk, eski kayıt ≈ 70 dk, canlı vitrin 82 dk. Canlı vitrin, ses iptal olunca metinden tahmin üretir (`lesson-meta.ts:49-67`). Öğrenci gerçek olmayan bir süre görür.

**[ORTA] O2-5 · "Ses var" sinyali iki yerde farklı.** `academyCourseHasSealedAudio` liste uzunluğuna bakar ve iptali süzmez. Oynatıcı ise iptali süzer. Bir yüzey "sesli" derken öteki makale açabilir.

**[ORTA] O2-6 · Konuşma metni ikili yoldan okunur.** OFF-201 `.md` dosyaları `ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS` listesinde yok. Yeniden fırın `ACADEMY_TTS_REBAKE_SCRIPT_BY_LESSON` haritasını okur. İki kaynak ileride ayrışabilir.

**[ORTA] O2-7 · Yatak havası tanımlı, yatak dosyası yok.** Her ders için hava seçilmiş. Fırınlanmış yatak MP3'ü yok.

**[BİLGİ] O2-8 · Dil kalitesi iyi.** Ortalama cümle 5.5 kelime. 20 kelimeyi aşan cümle yok. "İstem" kelimesi tutarlı; "prompt mühendisliği" yok. "Suçu anlatıcı alır" kalıbı var: `01_office_ai_ileri-1.md:5`, `01_office_ai_ileri-2.md:7`. OFF-201 metni gelecek dersler için örnek standarttır.

**[BİLGİ] O2-9 · Commit edilmemiş müfredat farkı yalnız yorum.** 9 dosyada +17/−10 satır. Mantık değişmedi. Yorumlar "0/6 mühürlü, satış kapalı" durumuna hizalandı.

---

## 5. TEMİZLİK VE ATIL DOSYA TESPİTİ

Önemli uyarı: "silinebilir" demek "bedava yeniden üretilir" demek değildir. Fırın dosyaları TTS kotası harcar.

### 5.1 Büyük hacimler

| Yol | Boyut | Git | Değerlendirme |
|-----|-------|-----|---------------|
| `media-bake/` | ~884 MB | izlenmiyor | Mühürlü OFF-101 WAV'ları **silinmemeli**. Silinirse fırın "WAV var, atlandı" korumasını kaybeder ve kota harcar. Yalnız iptal edilen OFF-201 WAV'ları (~380 MB) yeni fırından sonra silinebilir. |
| `archived/academy-audio-revoked/` | ~137 MB | **izleniyor** (8 dosya) | Bu raporda kanıt olarak işe yaradı. Git yerine Git LFS veya dış arşiv düşünülmeli. |
| `public/media/` | ~230 MB | ~20 dosya izleniyor | Yayın dosyaları. İptal kasetleri burada durmamalı (bkz. O2-2). |
| `.git/` | ~2.6 GB | — | Büyük ikili dosya geçmişi. |
| `generated/`, `tsconfig.tsbuildinfo`, `.vercel/` | ~3.9 MB | izlenmiyor | Güvenle silinebilir. |

### 5.2 Kesin veya muhtemel atıl dosyalar

| Yol | Güven | Gerekçe |
|-----|-------|---------|
| `lib/academy/audio-gain.ts` | Kesin | Canlı kodda sıfır başvuru. Yalnız silinmiş `docs/TESPIT_RAPORU.md` anıyor. |
| `public/media/academy/audio/01_office_ai/01_office_ai-4.mp3` | Kesin | Sınav yolunda değil. Kamu adresinden hâlâ açılabilir. |
| `lib/academy/curricula/office_ai/section_4.ts` | Muhtemel | Emekli ders gövdesi; `archived/academy/01_office_ai-4/` altında kopyası var. |
| `docs/curriculum/01_office_ai_00_cue.json` … `_w1_cue.json` (10 dosya) | Şüpheli | Canlı cue kaynağı `lib/academy/lesson-cues/`. Bu kopyaların okunduğu bir kod yolu bulunmadı. `_04_` emekli derse ait. |
| `scripts/bake-office-ai-0{1..5}-sealed-pack.ts` | Muhtemel | Tek seferlik fırın paketleri. `package.json` ve başka dosya anmıyor. |
| `scripts/repair-office-ai-05-silence-hole.ts` | Muhtemel | Tek seferlik onarım. |
| `scripts/generate-brand-icons.ts`, `optimize-academy-course-covers.ts`, `sync-academy-cue-paragraphs.ts`, `ingest-ecommerce-ai-sections.ts`, `write-pilot-academy-seed-sql.ts` | Muhtemel | Başvuru yok. |
| `scripts/ops-settle-cleared-academy-license.ts` | Şüpheli | Elle kullanılan ops aracı olabilir; silinmeden önce sorulmalı. |
| `components/freelancer/direct-job-offer-modal.tsx`, `direct-offer-inbox.tsx` | Şüpheli | Yalnız testler anıyor. 410 yüzey testleri için tutuluyor olabilir. |

### 5.3 Belge ve git düzeni

- **[YÜKSEK]** `docs/DURUM.md` silindi (commit edilmedi). Başvuranlar: `ANAYASA.md:7,97,108`, `MANIFESTO.md:12`, `PEDAGOJI.md:3,138`, `OPS_RUNBOOK.md:24`, `ops/ops-dron.md:5,50`, `DRON_CLIENT_SPEC.md:101`, `docs/ops/DURUM.md:3,76`. Okuyan testler: `tests/academy/production-standard.test.ts:292`, `tests/academy/sealed-audio-pilot.test.ts`, `tests/kernel/faz2-t3-dron-ring-surface.test.ts:100`. `docs/ops/DURUM.md:76` "P0-2 Kapandı — `docs/DURUM.md` yönlendirmedir" diyor; bu artık doğru değil. Silinen eski `docs/TESPIT_RAPORU.md` aynı sorunu daha önce yazmıştı. Sorun tekrar ediyor.
- **[ORTA]** `docs/TEDAVI_RAPORU_01..04.md` ve `docs/TESPIT_RAPORU.md` silinmiş, commit edilmemiş.
- **[ORTA]** Oturum başındaki git görüntüsünde `docs/PAKET_03_PLAN.md` ve `docs/TEDAVI_RAPORU_05.md` izlenmeyen dosya olarak görünüyordu. Tarama sırasında ikisi de diskte yoktu. Git'te izlenmedikleri için git'ten geri gelmezler. Kasıtlı silme değilse editör yerel geçmişinden kurtarılmalı.
- **[BİLGİ]** Oturum başındaki git görüntüsünde `.system_docs/ANAYASA.md` hem "değişti" hem "izlenmiyor" görünüyordu. Bu, Windows yol ayracı (`/` ve `\`) kaynaklı bir görüntüdür. Diskte tek kopya var.
- **[BİLGİ]** `yetkin_muze/` diskte yok; kurallarda ve `.gitignore` içinde anılıyor.

### 5.4 Test durumu

`tests/academy` okuma amaçlı koşusu: **556 geçti, 4 kaldı** (35.8 sn).

| Kalan test | Neden |
|------------|-------|
| `production-standard.test.ts` | `docs/DURUM.md` yok |
| `sealed-audio-pilot.test.ts` | `docs/DURUM.md` yok |
| `course-seed-surface.test.ts` | SQL tohum kilidi |
| `lesson-media-surface.test.ts` | Oynatıcı saat metni kayması |

Tam paket koşturulmadı. `tests/kernel/faz2-t3-dron-ring-surface.test.ts` de `docs/DURUM.md` okur. Surface testleri `npm run test` dışında kalır, `test:surface` ve nightly içinde koşar.

**[ORTA] Testler belge cümlesine bağlı.** `production-standard.test.ts:400-405` `.cursorrules` içinde "1 Maç = 1 Hakem", "FIFA Kokartlı Hakem" gibi cümlelerin geçtiğini kontrol eder. Belgelerde tek kelime değişince CI kırılır. Bu, Anayasa B3'teki "stil taramaları derlemeyi kıran mutlak engeller değildir" ilkesiyle ve Anayasa başlığındaki "Günlük rapor build fixture değildir" cümlesiyle çelişir.

---

## 6. KILAVUZ BELGE DEĞERLENDİRMESİ

Değerlendirilen: `.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, `.system_docs/PEDAGOJI.md`. Karşılaştırma için `.cursorrules` ve `docs/ops/DURUM.md` da okundu. Üç belgenin 27 Eylül 2026 reformu henüz commit edilmedi.

### 6.1 Kodla uyumlu olanlar [BİLGİ]

- Anayasa A1 (tamsayı para, tek defter, fiyat katalogda) kodda uygulanmış. `verify:amount-minor` bunu denetliyor.
- Anayasa A2 (ödeme kuruluşu değiliz, Split kapalı) kodda uygulanmış.
- Anayasa A3–A5 (RLS, IDOR, sunucu puanlaması, dürüst kapalı yüzey) için ön derleme kapısı var.
- Anayasa B1 mimari tanımı gerçeğe uyuyor (bkz. §8.2).
- Pedagoji ses kuralları (tek ses, 0.93, yalnız Gemini 3.1 Flash TTS) kodda kilitli.

### 6.2 Kırık başvurular

| Belge | Başvuru | Gerçek |
|-------|---------|--------|
| Anayasa, Manifesto, Pedagoji | `docs/DURUM.md` "yalnız yönlendirir" | Dosya silinmiş |
| Kod yorumları (`planned.ts:12`, `ai-desk.ts:33`) | `PEDAGOJI.md §E.10` | Pedagoji'de §E.10 yok; E bölümü E.2–E.5 |
| `.cursorrules §2` | "Anayasa B4 ve Pedagoji D.1" taban sayıları | İki belge de sayıyı yazmadığını söyler; sayı koddadır |

### 6.3 Mantık hataları ve çelişkiler

**[YÜKSEK] D-1 · "Üst tavan yok" cümlesi doğru değil.** Anayasa B4, Pedagoji §D.1 ve `.cursorrules §2` "üst dakika veya üst ders tavanı yoktur" der. Ama kodda şu kurallar var:

- Kurs başına en fazla 100 TTS isteği.
- Ders başına tam 10–12 istek.
- Bir blok en fazla 120 sn (`ACADEMY_TTS_LESSON_BLOCK_DICTION_MAX_SEC`).

Bunların sonucu şudur: bir kurs en fazla 10 ders olabilir (100 ÷ 10). Bir ders en fazla yaklaşık 24 dakika olabilir (12 × 120 sn). Vitrin kartı ayrıca 25 dakikada keser (`lesson-meta.ts:19`). Fiili tavan var. Belge bunu saklıyor.

**[YÜKSEK] D-2 · Dört katman "zorunlu" mu "hedef" mi?** `.cursorrules §1` "Her ders şu 4 temel medya katmanından oluşur" der. Anayasa B4 "Bu dörtlü olması gereken mimaridir ... satış için yeterli yüzey mühürlü TTS, karaoke rozeti ve canlı karttır" der. OFF-101 bugün Anayasa'ya göre uyumlu, `.cursorrules`'a göre uyumsuz. Aynı konuda iki bağlayıcı metin olamaz.

**[YÜKSEK] D-3 · "Kapı" yasağı ile mühürlü içerik çelişiyor.** Bkz. O1-2. Ya kural yumuşatılmalı ya da içerik düzeltilip yeniden fırınlanmalı. Yeniden fırın O1-1 nedeniyle önce metnin yeniden paketlenmesini ister.

**[ORTA] D-4 · "100 istek" kuralı kurs başına yazılmış, script başına uygulanıyor.** `scripts/generate-academy-lesson-audio.ts:132` sayacı bellekte tutar. `--key` ile dersler ayrı ayrı fırınlanırsa kurs toplamı hiçbir yerde birikmez. Olumlu yan: yeniden denemeler de sayılıyor (`:507`).

**[ORTA] D-5 · Gizli taban kuralı.** Kodda `ACADEMY_AI_COURSE_DURATION_MIN_MINUTES = 45` var (`production-standard.ts:8`). Belgelerde yok. 6 ders × 5 dk = 30 dk yapar. Belgelere göre geçerli bir kurs, koda göre geçersizdir.

**[ORTA] D-6 · Nefes payı sayıları uyuşmuyor.** Pedagoji §B ve `lesson-bed-duck.ts:2,32` "konuşma aralarındaki 3–5 saniyelik nefes payları" der. `human-rhythm.ts` en uzun iç boşluğu 1.75 sn verir. 3–5 sn'lik boşluk hiç oluşmaz. Müzik tasarımı olmayan bir boşluğa göre yazılmış (bkz. O1-8).

**[ORTA] D-7 · "Sayının tek evi koddur" ilkesi belgelerde çiğneniyor.** Anayasa ve Pedagoji sayıyı tekrar yazmadığını söyler. `.cursorrules`, `akademi-bake-elkitabi.md` ve `docs/ops/DURUM.md` aynı sayıları tekrar yazar. Testler de bu metinleri kilitler. Bir sayı değişince en az dört yer değişmek zorunda.

**[ORTA] D-8 · Manifesto kendi sloganını taşıyor.** §1.1 "Kullanıcıya:" başlığı altında "Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun." der. Bu, Pedagoji'nin aforizma yasağına ve "kapı" yasağına takılır. Canlı ana sayfa başlığı da aynı ailedendir: "Yapay zekâ yetkinliğini kanıtla, kariyerini mühürle".

**[ORTA] D-9 · Anayasa B1 "Sürü Dron" adını reddediyor, kod ve arayüz kullanıyor.** B1: "«Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez." Kodda `lib/dronlar/`, `DronBayrakları` var. Kullanıcı arayüzünde "Dron kasa" var (bkz. §7).

**[ORTA] D-10 · Asistan "mühür" demez, arayüz der.** `lib/copy/sen-voice/assistant.ts:54` asistana "Mühür ... gibi yapay ve bürokratik terimleri asla kullanma" der. Kariyer, akademi ve profil metinleri "Mühür geçerli", "Toplam mühür" der. Öğrenci iki kanalda iki farklı dil duyar.

**[DÜŞÜK] D-11 · Pedagoji'de araç adı var.** §B tablosu "Müfredat, fırın ve montaj: Üretken yapay zekâ (Cursor)" der. Editör değişince belge yanlış olur. Aynı belge model adlarını dondurmadığını söyler.

**[DÜŞÜK] D-12 · Isınma süresi iki türlü.** Pedagoji "Warm-up B-roll 8 sn kalır" der. Kod 6–8 sn bandı tanımlar (`lesson-veo.ts:12-15`).

**[DÜŞÜK] D-13 · Metafor katmanı.** `.cursorrules` "Maç, Yarı, Hakem, Düdük, FIFA Kokartlı Hakem" dilini kullanır. Script hata mesajları da bunu basar ("1 Maç = MAX 100 Düdük"). Bu ikinci bir sözlüktür. Yeni gelen biri önce metaforu çözmek zorunda kalır.

**[DÜŞÜK] D-14 · `docs/ops/DURUM.md` belge dilinde de slogan var.** Örnek: "jilet gibi Vatandaş Lisanı ile kilitlendi", "%100 baştan yazılıp kilitlendi".

### 6.4 Kısıtlayıcı yönler

- **Ders başına "tam 10–12" istek** hem alt hem üst sınırdır. Kısa ama değerli bir ders 10 bloğa zorlanır. Uzun bir ders 12'de kesilir. Anayasa'nın "konunun hakkı" ilkesiyle gerilir.
- **Belge metinlerini kilitleyen testler** belge güncellemesini kod değişikliği kadar pahalı yapıyor.
- **`.cursorrules` hem dışlama listesi hem anayasa gibi davranıyor.** 13 KB'lık dosyanın yarısı ürün kuralı. Ürün kuralı `.system_docs/` içinde durmalı.

---

## 7. EĞİTİM DİLİ VE İÇERİK KONTROLÜ

### 7.1 İç kod adı kullanıcıya sızıyor

| Önem | Dosya:satır | Metin |
|------|-------------|-------|
| [YÜKSEK] | `lib/copy/sen-voice/cuzdan.ts:54` | `kasaTitle: "Dron kasa"` |
| [YÜKSEK] | `lib/copy/sen-voice/cuzdan.ts:57` | "Drona dönüp yeniden dene." |
| [YÜKSEK] | `lib/copy/sen-voice/cuzdan.ts:53` | "gerçek LedgerEntry satırları burada durur" |
| [YÜKSEK] | `lib/copy/sen-voice/cuzdan.ts:55` | "HMAC pasaportu yeter" |
| [YÜKSEK] | `lib/copy/sen-voice/career.ts:47,55` | "Akademi SKU'sunun", "bu SKU'nun müfredat sınavını" |
| [ORTA] | `lib/copy/sen-voice/cuzdan.ts:20-21`, `ux.ts:59` | "Kokpite dön" |
| [ORTA] | `lib/copy/sen-voice/academy.ts:156` | "Amiral: 8 mühürlü sesli ders." |
| [ORTA] | `lib/copy/sen-voice/academy.ts:456` | "Onaylı Maya metni açık" |

Manifesto §1.4 şunu der: "Stüdyo sözü vatandaş yüzeyine çıkmaz."

### 7.2 Yasak aile ve slogan

| Önem | Dosya:satır | Metin | Not |
|------|-------------|-------|-----|
| [ORTA] | `lib/academy/exam-pools-ecommerce.ts:126` | "saniyeler içinde teşhis etmek" | Satışta olmayan kurs; açılmadan düzeltilmeli |
| [ORTA] | `lib/academy/exam-pools-prompt.ts:308` | "prompt mühendisliği neden omurga sayılır?" | aynı |
| [ORTA] | `lib/academy/exam-pools-social.ts:77` | "süper metrikleri" | aynı |
| [ORTA] | `lib/academy/exam-pools-social.ts:113` | "tek tıkla basar" | aynı |
| [ORTA] | `lib/academy/cinema-cue-catalog.ts:882` | "tek tıkla slayt taslağına çevir" | OFF-101 |
| [ORTA] | OFF-101 `section_3.ts`, `section_1.ts`, `section_w1.ts` | bkz. O1-3 | mühürlü ses |

### 7.3 Canlı ana sayfa ve satış sayfası

- **[ORTA]** Ana sayfa "Yapay zeka eğitimi ve online kurs vitrini hazırlanıyor. Taslak kartlar yayında değildir." der. Oysa amiral kurs satışta. Aynı paragraf sayfada iki kez tekrar ediyor.
- **[ORTA]** "Prompt eğitimi" dört yerde geçiyor (`lib/copy/sen-voice/public.ts:9,23`, `lib/copy/seo.ts:40,62`, `lib/copy/sem-keywords.ts:65-67`). Akademi içinde doğru kelime "istem"dir.
- **[ORTA]** Arama motoru dolgusu öğrenciye görünüyor. OFF-101 sayfası: "Not: arama motoruna yanlışlıkla 'yapay zeka sertifikasi' yazanlar da aynı belgeyi arıyor..." ve "Arama dilindeki karşılığıyla: yapay zeka sertifikasi bu sınav barajından sonra mühürlenir."
- **[DÜŞÜK]** "PayTR iFrame + 3D Secure" ifadesi öğrenci için teknik. "Kart bilgin PayTR'nin güvenli ödeme penceresinde girilir" yeterli.
- **[DÜŞÜK]** Satış sayfasında "5 altın KVKK kuralı", "bir çırpıda anlar", "maske refleksini kilitlersin" gibi ifadeler var.

### 7.4 "Günlük dil, tek iş, tek cümle" ölçümü

| Ölçüt | OFF-101 | OFF-201 |
|-------|---------|---------|
| Ortalama kelime / cümle | 9.1 | 5.5 |
| 20 kelimeyi aşan cümle | %1.8 (22 cümle) | %0 |
| Birden çok eylem taşıyan cümle | ~%9.5 | ~%3.6 |
| "Suçu anlatıcı alır" kalıbı | yok | var |

**Sonuç:** OFF-201 kurala uyuyor. OFF-101 büyük ölçüde uyuyor; kuyrukta uzun, çok işli ve şov kokan cümleler var. Kullanıcı arayüzündeki asıl sorun slogandan çok iç kod adlarıdır.

**Olumlu gözlemler [BİLGİ]:** "muazzam", "mucize", "devrim niteliğinde", "game changer" canlı arayüzde yok. Asistan bu kalıpları süzüyor (`lesson-assistant-policy.ts:63`). Yasal "anında ifa" ifadesi pazarlama değil, 6502 sayılı kanunun dilidir.

---

## 8. TARAFSIZ GÖRÜŞ VE STRATEJİ SORULARI

### 8.1 Sen olsaydın ne yapardın?

Sırayla, önce zararı durdurup sonra düzeltirdim.

**Bugün (24 saat içinde)**

1. Vercel panelinde canlı dağıtımın hangi dal ve commit'ten çıktığına bakardım.
2. Canlı OFF-201 sayfasında satın alma düğmesi olup olmadığını elle kontrol ederdim.
3. Veritabanında `01_office_ai_ileri` için SETTLED satın alma var mı diye bakardım. Varsa bu kullanıcılar için ayrı karar alırdım.
4. OFF-201 satışını canlıda kapatırdım. En güvenli yol, `PriceCatalogEntry` satırını pasif yapmak veya kursu yayından çekmektir. Kod dağıtımı beklemez.
5. Canlıdan iptal kasetlerini kaldırırdım.

**Bu hafta**

6. Canlıyı `main`'e bağlardım. Üretim dağıtımı yalnız `main`'den çıkmalı. Yerelden `vercel --prod` kapatılmalı.
7. Yereldeki 4 commit'i PR ile `main`'e götürürdüm. Önce `docs/DURUM.md` kararını verip CI'ı yeşile çekerdim.
8. PayTR panel yolundaki "imzasız OK" davranışına alarm eklerdim. `paytr.webhook.official_ip_ack` logu `hmac_mismatch` ile düşerse operatöre haber gitmeli. Canlıda Inngest mutabakatının çalıştığını bir test siparişiyle doğrulardım.
9. Ders seslerini kamu klasöründen çıkarma planını başlatırdım. Hedef: ödeme sonrası kısa ömürlü imzalı adres.

**Sonra**

10. Arayüzdeki iç kod adlarını temizlerdim (bkz. §7.1).
11. "Kapı" konusunda karar verirdim: kural mı değişecek, içerik mi?
12. OFF-201'i Kore sesiyle fırınlar, CEO onayıyla satışa açardım.

**Kritik açıklar özeti:** Dağıtım disiplini yok. İptal edilen içerik canlıda. Ücretli ses korumasız. Ödeme bildiriminde sessiz kabul var. Bunların hiçbiri kod kalitesi sorunu değil. Hepsi süreç ve yayın sorunudur. Kod tabanı genel olarak özenli.

### 8.2 Platform kurgusu doğru kurulmuş mu?

**Kısa cevap: Evet, bugünkü ölçek için doğru. Ama adı "Sürü Dron / Micro-Apps" değil, ve olmamalı.**

Kodda gerçekten kurulu olan şudur:

| Katman | Gerçek |
|--------|--------|
| Amiral | Tek Next.js uygulaması (`app/`, `lib/`). 59 API route. |
| Ortak çekirdek | `packages/kernel` (`@yetkin/kernel` v1.0.0). Para, katalog kimliği, v1 hop sicili, JSON zarfı. Prisma ve Supabase taşımıyor. |
| API-First | `/api/v1/*` → `proxy.ts` ile kanonik `/api/*` yoluna yeniden yazılıyor. 16 hop (`RAIL_V1_HOPS_META`). OpenAPI çıktısı `lib/kernel/http/openapi-v1.json`. Zod sözleşmesi `lib/kernel/http/v1-contract.ts`. |
| Tek istemci | `apps/rail-is` (Expo). Yalnız `@yetkin/kernel` ve HTTP kullanıyor. `lib/` içe aktarmıyor. |
| Sınır denetimi | `scripts/verify-boundaries.ts`. `lib/kernel` dikey odaları (`academy`, `freelancer`, `career`) içe aktarmıyor. |

**Doğru olanlar**

- Çekirdek ile dikey odalar arasında gerçek bir duvar var.
- Mobil istemci sözleşmeye bağlı, iç koda değil.
- Tek veritabanı, tek kimlik, tek dağıtım. Bu ekip büyüklüğü için doğru seçim.

**Zayıf olanlar**

- `apps/rail-is` npm workspace üyesi değil. `file:../../packages/kernel` ile bağlı. Paket sürümü değişince elle güncelleme ister.
- `lib/kernel` → `lib/copy` bağı var. Çekirdek, arayüz metnine bağımlı.
- "Dron" adı Anayasa'da reddedilmiş ama kodda ve arayüzde yaşıyor.
- `.system_docs/DRON_CLIENT_SPEC.md` ve ops belgeleri de silinmiş `docs/DURUM.md` dosyasına bağlı.

**Gerçek mikro servis olmalı mı?** Hayır. Ayrı dağıtım, ayrı veritabanı ve ayrı kimlik bugün yalnız maliyet getirir. Mevcut kurgu ileride bir odayı ayırmaya izin veriyor. Bu yeterli.

### 8.3 Gelecek MASTER PLAN önerisi

**Faz 0 — Yayını durdur ve hizala (1–2 gün)**

- Canlı dal = `main` kuralı. Üretim dağıtımı yalnız `main` + yeşil CI.
- OFF-201 canlıda satış dışı. İptal kasetleri canlıdan kalkar.
- Satın alan varsa ayrı çözüm.
- Çıkış ölçütü: canlı commit = `origin/main` HEAD. OFF-201 satın alınamaz.

**Faz 1 — Temel onarım (1 hafta)**

- `docs/DURUM.md` kararı: geri getir veya tüm başvuruları sil. Testler buna göre güncellenir.
- CI yeşil. `tests/academy` 4 kırmızı test kapanır.
- PayTR: sessiz kabul için alarm, Inngest canlı doğrulaması, ops belgesi kodla hizalanır.
- Arayüz jargonu temizliği (§7.1).
- Çıkış ölçütü: CI yeşil, PayTR alarmı çalışıyor, arayüzde "Dron/SKU/LedgerEntry/HMAC" yok.

**Faz 2 — OFF-201 lansmanı (2–3 hafta)**

- Kore + Gemini 3.1 Flash TTS ile 6 ders fırını (plan 71 istek).
- Cue ve zaman dosyaları yeni sese kilitlenir. Süre tek kaynaktan gösterilir.
- En az bir ısınma klibi veya bilinçli "klip yok" kararı. Yatak müziği kararı.
- Ders sesleri için imzalı adres (hem OFF-101 hem OFF-201).
- CEO onayı ile PR → `main` → canlı.
- Çıkış ölçütü: canlı OFF-201 MP3 özetleri yeni Kore kasetleriyle aynı. Satın alma → lisans → sınav → sertifika uçtan uca çalışıyor.

**Faz 3 — OFF-101 sürüm 2 (3–4 hafta, isteğe bağlı)**

- Metni ders başına 10–12 bloğa yeniden paketle (toplam ≤ 100).
- "Kapı" dili, uzun cümleler ve şov ifadeleri düzeltilir. "Suçu anlatıcı alır" kalıbı eklenir.
- Fon müziği mantığı kulakla test edilip düzeltilir.
- Isınma klibi dersin konusuna uyar.
- Çıkış ölçütü: OFF-101 metni OFF-201 ile aynı dil standardında.

**Faz 4 — Ölçek (sonra)**

- Sıradaki SKU (`02_ecommerce_ai` vb.) OFF-201 şablonuyla açılır. Sınav havuzlarındaki yasak ifadeler açılıştan önce temizlenir.
- Split ve Freelancer yalnız Anayasa B5 kontrol listesiyle.

### 8.4 Kılavuz belgeler güncellenmeli mi?

**Evet.** Kırmızı çizgiler (Anayasa A1–A5) sağlam ve kodla uyumlu; onlara dokunulmamalı. Güncellenmesi gerekenler:

| # | Öneri | Gerekçe |
|---|-------|---------|
| 1 | `docs/DURUM.md` başvurularını tek kararla düzelt | Kırık başvuru, CI riski (§5.3) |
| 2 | "Üst tavan yoktur" cümlesini dürüst yaz: "Süre için üst sınır yoktur; TTS bütçesi nedeniyle kurs en fazla 10 ders, ders en fazla ~24 dakikadır" | Mantık hatası (D-1) |
| 3 | Dört katmanın durumunu tek yerde tanımla: "hedef" mi "zorunlu" mu | `.cursorrules` ile Anayasa B4 çelişiyor (D-2) |
| 4 | "Kapı" kuralını içerikle hizala | Mühürlü ses kurala aykırı (D-3) |
| 5 | 45 dakikalık kurs tabanını belgeye yaz ya da koddan kaldır | Gizli kural (D-5) |
| 6 | "3–5 sn nefes payı" cümlesini gerçek boşluklara göre düzelt | D-6 |
| 7 | `.cursorrules`'u yalnız dışlama listesi + belge yönlendirmesine indir | Aynı kural beş yerde (D-7) |
| 8 | Testlerin belge cümlesi kilitlemesini kaldır; testler kod sabitini denetlesin | Anayasa B3 ile çelişki (§5.4) |
| 9 | Manifesto §1.1 kullanıcı cümlesini slogan olmaktan çıkar | D-8 |
| 10 | "Dron" adına karar ver: ya kodda ve arayüzde de bırak ya da Anayasa'daki reddi kaldır | D-9 |
| 11 | "Mühür" kelimesi için tek karar: arayüz ve asistan aynı dili konuşsun | D-10 |
| 12 | Anayasa B3'e ekle: "Üretim dağıtımı yalnız `main` dalından ve yeşil CI ile çıkar. Yerelden üretime basılmaz." | K-1 bugün bu boşluktan doğdu |
| 13 | Metafor sözlüğünü ("Maç/Hakem/Düdük") sade adlarla değiştir | D-13 |

**Kısıtlayıcı bulduğum tek önemli madde:** Ders başına "tam 10–12 istek" kuralı. Bu bir maliyet kuralıdır, pedagoji kuralı değildir. "En fazla 12" yeterli olur; alt sınır kısa dersleri zorlar.

---

## EK A — Önem sırasına göre bulgu listesi

| ID | Önem | Başlık | Bölüm |
|----|------|--------|-------|
| K-1 | KRİTİK | Canlı yayın birleşmemiş daldan | 2.1 |
| K-2 | KRİTİK | Canlıda OFF-201 iptal kasetleri | 2.1 |
| O2-1 | KRİTİK | OFF-201 canlı ve yerel durum ayrışıyor | 4.4 |
| K-3 | YÜKSEK | Ücretli ders sesi herkese açık | 2.1 |
| P-1 | YÜKSEK | PayTR panel yolunda imzasız OK | 2.3 |
| O1-1 | YÜKSEK | OFF-101 yeniden fırınlanamaz (128 > 100) | 3.3 |
| O1-2 / D-3 | YÜKSEK | "Kapı" yasağı ile mühürlü içerik | 3.3, 6.3 |
| O2-2 | YÜKSEK | İptal kasetleri `public/` içinde | 4.4 |
| O2-3 | YÜKSEK | OFF-201 ısınma videosu yok | 4.4 |
| D-1 | YÜKSEK | "Üst tavan yok" cümlesi yanlış | 6.3 |
| D-2 | YÜKSEK | Dört katman: zorunlu mu hedef mi | 6.3 |
| — | YÜKSEK | `docs/DURUM.md` kırık başvurusu ve CI riski | 5.3 |
| — | YÜKSEK | Arayüzde iç kod adları | 7.1 |
| P-2..P-4 | ORTA | PayTR belge farkı, log, canlı kod farkı | 2.3 |
| O1-3..O1-8 | ORTA | OFF-101 dil, video, müzik | 3.3 |
| O2-4..O2-7 | ORTA | OFF-201 süre, sinyal, metin yolu, yatak | 4.4 |
| D-4..D-10 | ORTA | Belge mantık hataları | 6.3 |
| — | ORTA | Belge cümlesi kilitleyen testler | 5.4 |

## EK B — Bu raporda kullanılan ana kanıt yolları

- `lib/academy/pilot-sku.ts`, `lib/academy/instructors.ts`, `lib/academy/production-standard.ts`, `lib/academy/human-rhythm.ts`, `lib/academy/tts-breath-chunks.ts`, `lib/academy/lesson-bed-duck.ts`, `lib/academy/lesson-veo.ts`, `lib/academy/lesson-meta.ts`, `lib/academy/curricula/lesson-index.ts`
- `lib/academy/lesson-audio-timings/*.json`, `lib/academy/spoken-scripts/*.md`, `lib/academy/curricula/office_ai/*.ts`, `lib/academy/curricula/office_ai_2/*.ts`
- `scripts/generate-academy-lesson-audio.ts`
- `app/api/(kernel)/payments/webhooks/paytr/route.ts`, `app/api/paytr/callback/route.ts`, `lib/kernel/payments/paytr/{checkout,webhook,reconcile}.ts`
- `lib/copy/sen-voice/{cuzdan,career,academy,assistant,public}.ts`, `components/academy/office-ai-guide-preview.tsx`
- `.github/workflows/ci.yml`, `package.json`
- `git show origin/main:…`, `git show origin/off-201-stage:lib/academy/pilot-sku.ts`
- Canlı: `https://yetkin.ai/`, `/academy/01_office_ai`, `/academy/01_office_ai_ileri`, üç MP3 için HEAD isteği ve `etag`
