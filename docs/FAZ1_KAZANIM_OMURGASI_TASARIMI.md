# FAZ 1 (AŞAMA 3) — Yasal, ticari temel ve kazanım omurgası tasarımı

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Kime | CEO ve SUPER_ADMIN |
| Konu | Junior odasının KVKK, PayTR lisans hattı ve kazanım omurgası için şema tasarımı |
| Kural | **Salt-okunur analiz.** Bu dosya tek yeni dosyadır. Kod, şema, migrasyon ve ayar değişmedi. |
| Zemin | `docs/TESPIT_RAPORU.md` ve `docs/TEDAVI_RAPORU.md`. Kapı kilidi, sahte kasa ve quiz `CHECK` onarımı bitti. Bu belge o paketin bilerek bırakdığı işin mimarisidir. |
| Dil | Yalın Türkçe. Dosya adları yalnız "nerede bakılır" diye kod biçiminde geçer. |

---

## 0. Bir sayfada karar

Junior bugün **kilitli bir pilot**tur. Üretim kapısı `JUNIOR_PRODUCTION_LOCKED` ve `DRON_JUNIOR_OPEN` ikisi birden kalkmadan açılmaz. Ödeme rotası `not_configured` döner. Bu tasarım kapıyı açmaz.

Üç tek ev kurulacak. İkinci kasa, ikinci fatura künyesi ve ikinci soru listesi yazılmayacak.

| Ev | Bugün | Hedef |
|----|--------|--------|
| Çocuk rızası | Profilde tek `consent_at`. Metin sürümü, veli yaş beyanı ve `guardian_user_id` yok. | Append-only `junior_guardian_consents`. Velinin hesabı `guardian_user_id`. Çocuk profili bu satıra bağlanır. |
| Fatura künyesi | TCKN hem `user_billing_info` hem `junior_subscriptions.invoice_tckn` kolonunda durabiliyor. | TCKN yalnız `user_billing_info`. Lisans satırı künye kopyası taşımaz. |
| Satış fiyatı | `549900` kuruş kodda ve SQL `CHECK` içinde. `PriceCatalogEntry` satırı yok. | `moduleKey=junior`, `unitKey=yearly`, `amountMinor=549900`. Süper Admin mevcut katalog ekranından günceller. |
| Tahsilat | Ayrı test kasası üretim yolundan çıktı. Merchant hattı bağlı değil. | Akademi ile aynı PayTR iFrame, HMAC webhook, `PaymentOrder`, cüzdan `CREDIT`, lisans `DEBIT`. |
| Hak | `junior_subscriptions` kart, fatura ve süreyi tek satırda tutuyor. | Aynı tablo **365 günlük lisans satırı** olur. Süre kuralı Akademi lisansı ile aynı uzunluktadır. |
| Ders | 20 ders ve 30 soru TypeScript dosyasında. `junior_question_bank` boş. | Sürüm kilidi, ders, ünite, kazanım, soru ve cevap satırı. Çalışma zamanı tek listeyi okur. |
| Vitrin | "Maarif Mührü", "%100 Uygun", "5.000 TL bandı". Sınıf değişince yalnız başlık değişir. | Dayanaksız cümle kalkar. Ekran "Şu anda 6. sınıf pilot dersleri açık" der. |

**İlk kod adımı** (onaydan sonra, bu belgenin 6.3'ü): rıza tablosu, profil bağı ve fiyat tohumu. Tahsilat 503 kalır. Soru bankası bu adımda taşınmaz. Kapı açılmaz.

---

## 1. Ölçülen zemin

Aşağıdaki cümleler bu oturumda okunan şema, migrasyon ve çalışma zamanı koduna dayanır. Veritabanına bağlanılmadı. Canlı sitede hangi migrasyonun uygulandığı ölçülmedi.

### 1.1 Kapı ve para

- Yüzey kilidi `isJuniorSurfaceLocked` içindedir. Kapalıyken sayfa ve API 410/503 döner.
- `completeJuniorCheckout` kart, TCKN ve deneme POS okumaz. Yanıt `not_configured`.
- `junior_subscriptions_shape` hâlâ şunu kilitler: `plan_code = junior-yearly`, `list_price_minor = 549900`, `provider = paytr-test`, zorunlu `invoice_tckn` ve `card_last4`. Kaynak: `prisma/migrations/20261005093000_junior_paytr_grade_switch`.
- Liste fiyatının ikinci kopyası `lib/junior/limits.ts` içindeki `JUNIOR_YEARLY_LIST_PRICE_MINOR`.
- Akademi satış fiyatının tek evi `PriceCatalogEntry`. Çekirdek anahtar `academy`. Junior anahtarı katalogda yok.
- Akademi tahsilatı: sipariş niyeti `academy-license:{slug}`, PayTR `get-token`, webhook HMAC (`merchant_oid + salt + status + total_amount`), `PaymentOrder` CLEARED olunca cüzdan `CREDIT`, ardından `fulfillAcademyLicenseFromClearedOrder` fiyat kilidi ve `DEBIT` ile `academy_purchases` satırını açar. Süre `settledAt + 365 gün`, kolon olarak Akademi satın almasında durmaz (`lib/academy/license.ts`).
- Çekirdek, Junior motorunu import etmez. Akademi lisansı da çekirdeğe bir kanca ile bağlanır (`notifyAcademyLicenseHook`). Junior aynı kancanın yanına ikinci bir kayıt olarak girer. Çekirdek `lib/junior` dosyasını import etmez.
- `merchantOid` önekleri bugün `wallettopup`, `freelancerescrow`, `academy`. `junior` öneki yok (`lib/kernel/payments/merchant-oid.ts`).
- Katalog ekranı bütün `PriceCatalogEntry` satırlarını okur. `catalogModuleLabel("junior")` donmuş oda listesindeki "Junior" etiketine düşer. Ayrı bir Junior fiyat ekranı gerekmez. Satır yokken ekranda da görünmez.

### 1.2 Çocuk verisi

- Hesap velinindir. Çocuğun e-postası yok. Profil `junior_profiles`: takma ad, sınıf, doğum yılı, `consent_at`.
- Form tek kutu gönderir: `consent: true`. Metin: "Bu profili ben, veli olarak açıyorum. Çocuğun sesi saklanmaz. Ders, onay olmadan açılmaz." Sürüm yok. Veli yaş beyanı yok.
- `userId` veli hesabıdır. Ayrı `guardian_user_id` kolonu yok. Rıza kanıtı, metnin hash'i ile birlikte durmaz.
- Platform kuralı (`ops-db` §18): ürün içi self-serve silme yok. KVKK m.11 talebi `destek@yetkin.ai` üzerinden elle yürür. Defter satırı silinmez.
- Yasal sayfa, platform kullanımını 18 yaş ve üzeri hesaplara bağlar (`lib/copy/legal-launch.ts`). Junior'da bunu karşılayan bir veli yaş damgası yok.
- Ses: `wipeAudioCarrier` dizgiyi bellekte boşaltır. `junior_progress` ses kolonu taşımaz. Kalan kişisel veri; takma ad, doğum yılı, `praised` / `missing` / `advice` metni, skor ve oyun puanıdır. Çocuğun kendi cümlesi bugün tabloya yazılmaz.
- Konu testi cevabı madde madde durmaz. `submit` yolu yalnız toplam skoru `mode=quiz` ilerleme satırına yazar.
- Kasa rızası (6502, sürüm `2026-09-05`) `PaymentOrder` üzerindedir. Bu, çocuk aydınlatma metni değildir. İkisi ayrı sürüm taşır.

### 1.3 İçerik

- Katalog `lib/junior/catalog.ts` ve `lib/junior/elective-catalog.ts`: 4 çekirdek ders × 2 konu + 6 seçmeli × 2 konu = **20 ders**. Hepsi 6. sınıf metnidir.
- Kazanım, ders nesnesinde düz cümle dizisidir. Resmî kod yoktur. İç kodlar soru arşivindedir (`JR-06-MAT-KESIR` gibi).
- Ünite / tema katmanı yoktur.
- `JUNIOR_QUESTION_ARCHIVE`: **30 soru**, üç ücretsiz konuda onar (`jr_06_mat-1`, `jr_06_fen-1`, `jr_06_turkce-1`). Şık sayısı **3**. `correctIndex` 0–2. Yanlış kavram etiketi ve zorluk derecesi yoktur.
- `junior_question_bank` tablosu aynı üç şık kuralını `CHECK` ile kilitler. Çalışma zamanı bu tabloyu okumaz. Tohum da yazılmamıştır.
- `JUNIOR_OUTCOME_POOL_CAPACITY = 100_000`, yuvayı `slot % 30` ile aynı 30 kalıba bağlar. Yüz bin soru yoktur.
- `juniorShelvesForGrade` seçilen sınıf 6 değilse başlıktaki "6. Sınıf" yazısını değiştirir. Ders anahtarı ve metin durur.
- Profil penceresi şöyle der: "Yıllık paket açıkken bu çocuk bir kez sınıf değiştirir. Raf, yeni sınıfa göre açılır."
- Vitrin cümleleri `components/junior/maarif-seal.tsx` içindedir: "Türkiye Yüzyılı Maarif Modeline %100 Uygun", "Maarif Mührü", "Eğitim değeri 5.000 TL bandında". `junior-room.tsx` mühür etiketini basar.
- `.system_docs` içinde Maarif uygunluk ölçütü tanımlı değildir. Pedagoji Ek-J, Dinle ve Anlat ile veli hesabını tanımlar. "%100 uygun" cümlesini belgelemez.

---

## 2. Yasal altyapı

### 2.1 Veli aydınlatması ve açık rıza

Rıza, profil satırının üstüne yazılan tek zaman damgası olmaktan çıkar. Her onay **yeni bir satırdır**. Eski satır güncellenmez. Metin değişince yeni sürüm yeni satır ister. Eski sürümle açılmış profil, mikrofon ve konu testi yoluna yeni sürümü onaylamadan girmez. Mevcut `consent_at` kapısı bu bağ durana kadar kalır. Böylece bugünkü "onaysız ders yok" kuralı bozulmaz.

Tablo: `junior_guardian_consents`

| Kolon | Kural |
|-------|--------|
| `id` | cuid |
| `guardian_user_id` | `users.id`. Onayı veren hesap. Değişmez. |
| `profile_id` | `junior_profiles.id`. Çocuk silinince boşalabilir. Satır silinmez. |
| `consent_version` | Aydınlatma sürümü. Örnek yer tutucu: `junior-notice-2026-10-05`. 6502 sürümü `2026-09-05` ile aynı dize değildir. |
| `notice_sha256` | Velinin gördüğü metnin 64 karakter hex özeti. Metin sonradan değişirse eski kanıt bozulmaz. |
| `guardian_declared_adult` | Yalnız `true`. |
| `guardian_birth_year` | Beyan. Üst sınır `içinde bulunulan yıl - 18`. Alt sınır makul bir tavan (ör. 100 yıl). Bu, kimlik doğrulaması değildir. e-Devlet sorgusu bu fazda yoktur. |
| `consent_at` | Onay anı. |
| `created_at` | Satırın yazıldığı an. `updated_at` yoktur. |

Profil tarafı:

| Kolon | Kural |
|-------|--------|
| `active_consent_id` | Güncel rıza satırı. Boşsa ders açılmaz. |
| `consent_at` | Aktif rızanın zamanı. Eski kapı bunu okumaya devam eder. |

`guardian_user_id`, profildeki `user_id` ile aynı kişidir: hesabın sahibi. Kolonun ayrı durmasının nedeni, silme anında profil takma adının gitmesi ve rıza kanıtının hesapta kalmasıdır. İkinci bir veli kullanıcısı bu fazda açılmaz.

Aydınlatma metninin başlıkları (cümleleri hukuk yazar, ajan uydurmaz):

1. Veri sorumlusu künyesi (`LEGAL_ENTITY` — mevcut yasal sayfa ile aynı).
2. İşlenen çocuk verisi: takma ad, doğum yılı, sınıf, ders ilerlemesi, konu testi cevapları, oyun puanı.
3. İşlenmeyen veri: çocuğun e-postası, ses dosyası, TCKN.
4. Ses klibi: Dinle ve Anlat sırasında `FAST_STREAM` rolüne gider, değerlendirme bitince bellekten silinir, tabloya yazılmaz. Model kimliği `lib/kernel/ai/model-roles.ts` içinden okunur. Bildirimde satıcı adı, hukuk metni mühürlenirken o dosyadaki kimlikle yazılır.
5. Amaç: veli hesabı altındaki okul tekrarı ve veli raporu.
6. Haklar: KVKK m.11. Başvuru `destek@yetkin.ai` ve hesap içi silme (2.2).
7. Veli beyanı: hesabı 18 yaşını doldurmuş kişi açar. Çocuk ayrı giriş yapmaz.

Sürüm sabiti, metin `lib/copy` altında mühürlenmeden koda `true` varsayılanı olarak girmez. Hukuk metni yokken profil formu bugünkü kutuyu korur. Yeni kolonlar boş kalabilir. Kapı zaten kapalıdır.

### 2.2 Silme ve dışa aktarma (KVKK m.11)

Çocuk verisinin envanteri:

| Veri | Yer | Dışa aktarma | Silme |
|------|-----|----------------|--------|
| Takma ad, doğum yılı, sınıf, seçmeli dersler | `junior_profiles` | Evet | Takma ad ve doğum yılı temizlenir veya profil satırı kapanır |
| Övgü, eksik, öğüt, skor | `junior_progress` | Evet | Satırlar silinir |
| Oyun puanı, rozet | `junior_xp` | Evet | Satır silinir |
| Soru cevabı (bu tasarımdan sonra) | `junior_responses` | Evet | Satırlar silinir |
| Test denemesi | `junior_quiz_attempts` | Evet | Satırlar silinir |
| Ses dosyası | Yok | Dışa aktarmada "ses kaydı tutulmuyor" cümlesi | Silinecek dosya yok |
| Çocuğun kendi cümlesi | Yok | Aynı cümle | Tablo açılmayacak |
| Rıza satırı | `junior_guardian_consents` | Velinin kendi kaydı olarak evet | Profil bağı kopar. Satır kalır. |
| TCKN, adres, telefon | `user_billing_info` | Velinin fatura verisi. Çocuk dosyasına girmez | Çocuk silme bunu silmez |
| `PaymentOrder`, `LedgerEntry` | Çekirdek | Tutar, tarih, sipariş no. Kart numarası zaten yok | Silinmez. Append-only defter ve vergi sicili |

Akış:

1. İstek, oturumdaki veli hesabından gelir. Profil `user_id` bu hesaba ait değilse 404.
2. Bir işlem içinde: ilerleme, puan, cevap, deneme silinir. Profilde takma ad sabit bir kapanış değerine çekilir, doğum yılı boşalır, `active_consent_id` boşalır, `selected` kapanır.
3. Rıza satırında `profile_id` boşalır, `erased_at` yazılır. `guardian_user_id` ve `notice_sha256` durur.
4. Lisans satırı ve defter durur. Lisans, velinin satın aldığı haktır. Çocuk profili silinince para iadesi kendiliğinden doğmaz. İade, mevcut kart iade hattının ayrı kararıdır.
5. Dışa aktarma aynı kümenin JSON dosyasıdır. İçinde ses ve TCKN yoktur.

Platformun genel kuralı self-serve silmeyi kapalı tutar. Junior için önerilen istisna şudur: **çocuk profilinin alt ağacı, hesabın sahibi tarafından silinebilir**. Defter ve fatura künyesi bu istisnanın dışındadır. Bu istisna `ops-db` §18'e işlenmeden koda girmez. SUPER_ADMIN imzası 7. bölümdedir.

Silme rotası, oda kilidi açık değilken de 410/503 verir. Tasarım, kilidi delmek için bir arka kapı tanımlamaz. Kapı kapalıyken silme, destek e-postası ve operatör işlemiyle yürür. Bu, bugünkü platform kuralıyla aynıdır.

### 2.3 Fatura künyesini tekleştirme

`user_billing_info` zaten bireysel künyeyi tutar: ad, TCKN (11 hane), telefon, adres, fatura tipi. Akademi ödemesi bu satırı kullanır.

`junior_subscriptions` üzerindeki `invoice_name`, `invoice_tckn`, `invoice_phone`, `invoice_address` ve `card_last4` hedef modelde yoktur.

Geçiş sırası (tek migrasyonda kolon düşürmek yok):

1. Okuma yolu fatura künyesini `user_billing_info` üzerinden alır. Lisans satırına TCKN yazan kod kapanır.
2. Veritabanında eski Junior satırı varsa, künye `user_billing_info` boşsa oraya taşınır. Doluysa Junior kopyası çöpe yazılmaz. Çakışma operatöre raporlanır.
3. Ayrı bir migrasyon `invoice_*` ve `card_last4` kolonlarını ve bunları zorunlu kılan `CHECK` parçasını kaldırır.
4. PayTR iFrame kart numarasını sunucuya getirmez. Son dört hane Junior lisansının şartı olmaktan çıkar. Sipariş kimliği `PaymentOrder.merchant_oid` olur.

Veli iki modülde de alışveriş ederse tek künye görür. Künye değişince geçmiş siparişin tutarı değişmez. Geçmiş sipariş `PaymentOrder.amount_minor` üzerinde durur.

---

## 3. Ticari hat

### 3.1 PayTR Merchant'a bağ

Junior'a ikinci bir `get-token`, ikinci bir webhook ve ikinci bir defter yazılmaz. Mevcut hat şöyledir:

```text
Veli kasası
  → CheckoutPriceLock (15 dk, katalog tutarı)
  → PaymentOrder purpose = junior-license:yearly
  → PayTR iFrame token (mevcut get-token)
  → HMAC webhook (mevcut /api/payments/webhooks/paytr)
  → clearSuccessfulPaymentOrder → cüzdan CREDIT
  → junior lisans kancası → fiyat kilidi tüketilir → cüzdan DEBIT
  → junior_subscriptions ACTIVE, süre 365 gün
```

Kurallar:

- Sipariş niyeti `junior-license:yearly`. Düz `wallet-top-up` lisans açmaz. Akademi niyeti Junior açmaz.
- `merchantOid` öneki `junior` olarak `MERCHANT_OID_PREFIXES` içine girer. Idempotency anahtarı bugünkü `buildIdempotentMerchantOid` ile kurulur. `JR` + zaman damgası + son dört hane üreten `juniorPaytrMerchantOid` tahsilat kimliği olmaktan çıkar. O fonksiyon test mühründe kalır.
- Tutar, kilit anındaki katalog kuruşudur. Webhook tutarı sipariş tutarına eşit değilse `CREDIT` yazılmaz. Bu kural Akademi'de duruyor. Junior onu gevşetmez.
- Kanca, Akademi kancası gibi `app/api` kompozisyonunda kaydolur. `lib/kernel` Junior import etmez.
- 6502 tikleri (`distanceContractAccepted`, `digitalImmediatePerformanceAccepted`, sürüm `2026-09-05`) sipariş satırında kalır. Çocuk aydınlatması 2.1'deki ayrı satırdadır. İkisi bir kasada iki ayrı onaydır.
- `JUNIOR_PRODUCTION_LOCKED` dururken bu fonksiyonlar testten çağrılır, HTTP 503 kalır. Kanca, kapı kilitliyken CLEARED siparişi lisansa çevirmez.

`lib/junior/paytr.ts` içindeki deneme mağaza üçlüsü (`000000`, sandbox key) canlı kimlik bilgisi değildir. Canlı üçlü mevcut PayTR ortam değişkenleridir. Junior için ikinci mağaza açılmaz.

### 3.2 Fiyat kataloğu

Tohum satırı, Akademi tohumundaki korumayı kullanır: `updated_by` doluysa `amount_minor` ezilmez (`supabase/migrations/20260814090000_academy_course_seed.sql`).

| Alan | Değer |
|------|--------|
| `module_key` | `junior` |
| `unit_key` | `yearly` |
| `unit_type` | `MINOR` |
| `amount_minor` | `549900` |
| `currency_code` | `TRY` |
| `is_active` | `true` |
| `min_minor` / `max_minor` | Akademi bandı ile aynı güvenlik tabanı ve tavanı (1 … 50_000_000) önerilir. SUPER_ADMIN bandı daraltabilir. |
| `description` | Junior yıllık lisans. 365 gün. KDV dahil satış fiyatı. |

`549900` kuruş = 5.499 TL. Bu, tohumdur. Satışta okunan yer `PriceCatalogEntry.amount_minor` olur. `JUNIOR_YEARLY_LIST_PRICE_MINOR` tohum sabiti olarak kalır. Ekran ve kasa onu fiyat diye basmaz.

Süper Admin yolu bugün şudur: katalog listesi bütün satırları gösterir, PATCH `amount_minor` yazar, `PriceCatalogDecisionLedger` gerekçeyi tutar. `junior` / `yearly` satırı düşünce aynı ekranda "Junior" grubu olarak görünür. Yeni panel sayfası yok.

SQL `CHECK (list_price_minor = 549900)` katalog okunmadan kalkarsa fiyat ikiye bölünür. Bu `CHECK`, lisans satırı katalog tutarının kopyasını taşıyana kadar durur. Kopya, sipariş anının tutarıdır. Sonraki zam eski lisansı değiştirmez.

### 3.3 Lisans satırı

Yeni tablo açılmaz. `junior_subscriptions` lisans satırı olur. Prisma yorumu bunu söyler. İkinci bir `junior_licenses` tablosu aynı hakkın iki evi olur.

Hedef şekil:

| Kolon | Anlam |
|-------|--------|
| `user_id` | Veli hesabı. Tek satır. |
| `status` | `PENDING` veya `ACTIVE`. Süre dolunca durum türetilir. Ayrı `EXPIRED` yazımı şart değildir. Akademi de böyle yapar. |
| `plan_code` | `junior-yearly` |
| `list_price_minor` | Tahsil edilen kuruş. Sipariş tutarı ile aynı. |
| `currency_code` | `TRY` |
| `provider` | `paytr` |
| `merchant_oid` | `PaymentOrder.merchant_oid`. Bugünkü `provider_ref` bunun yerine geçer. |
| `elective_quota` | 3 |
| `grade_switch_rights` | 0 veya 1. İçerik o sınıf için yoksa hak harcanmaz (4.2). |
| `activated_at` | CLEARED ve DEBIT anı |
| `expires_at` | `activated_at + 365 gün` |

Süre sabiti `lib/junior/license.ts` içinde durur. Test, bu sürenin `ACADEMY_LICENSE_DURATION_MS` ile aynı olduğunu kilitler. Junior, Akademi motorunu import etmez. Eşitlik testi iki sabiti yan yana okur.

Aktiflik: `status = ACTIVE` ve `now < expires_at`. Yenileme, yeni sipariş ve yeni `activated_at` ister. Eski cevap satırları silinmez. Süre bitince kilitli dersler kapanır. Her dersin ilk konusu ücretsiz kalır. Bu, Pedagoji Ek-J ve bugünkü `juniorLessonAccess` kuralıdır.

Oyun puanı bu satıra yazılmaz. Cüzdan bakiyesi lisans süresi değildir.

---

## 4. Kazanım omurgası

### 4.1 Neden tablo

Bugün ders metni, kazanım cümlesi ve soru aynı TypeScript dosyalarındadır. Sınıf eklemek dosya eklemektir. Çocuğun hangi cümleyi kaçırdığı durmaz. Dinle ve Anlat istemi, dersin cümle listesini her seferinde sıfırdan okur. Geçmiş yanlış içeri girmez.

Tablo, metni serbest bırakmak için değil, **sürümü kilitlemek** ve **cevabı kazanıma bağlamak** için açılır. Maarif belgesi değişince eski cevaplar eski sürüme bağlı kalır. Yeni sürüm eski satırın üstüne yazılmaz.

### 4.2 Modeller

```text
JuniorCurriculum
  └── JuniorCourse (branş, sınıf, çekirdek | seçmeli)
        └── JuniorUnit (tema / öğrenme alanı)
              └── JuniorLesson (metin, sahne)
                    └── JuniorOutcome (cümle + isteğe bağlı resmî kod)
                          └── JuniorQuestion
                                └── JuniorResponse (çocuk × soru × deneme)
```

**`JuniorCurriculum`**

| Kolon | Kural |
|-------|--------|
| `id` | cuid |
| `code` | Örnek: `pilot-6-2026-10`. Tekil. |
| `maarif_model_version` | Boş bırakılır. MEB belge sürümü insan eliyle yazılır. Boşken ekranda Maarif mührü basılmaz. |
| `status` | `DRAFT` veya `PUBLISHED` |
| `published_at` | Yayın anı. Taslakta boş. |

İlk yayın `pilot-6-2026-10` olur. `maarif_model_version` boştur. Bu dürüst kayıttır.

**`JuniorCourse`**

| Kolon | Kural |
|-------|--------|
| `curriculum_id` | Üst sürüm |
| `slug` | `jr_06_mat` ve bugünkü diğer kısa adlar |
| `subject` | Matematik, Fen Bilimleri, … |
| `grade` | İçeriğin sınıfı. Pilot satırlarında 6. |
| `track` | `core` veya `elective` |
| `title` | "6. Sınıf Matematik" |
| `code` | `JR-06-MAT` |

Çocuğun profil sınıfı bu kolonun yerine geçmez. Raf, profil sınıfı 6 değilse bu dersi "11. Sınıf Matematik" diye yeniden adlandırmaz. 4.2'nin vitrin kuralı bunu ekranda söyler.

**`JuniorUnit`**

| Kolon | Kural |
|-------|--------|
| `course_id` | Ders |
| `ordinal` | Sıra |
| `title` | Tema adı |
| `learning_area` | Öğrenme alanı. Kaynak cümlesi yoksa boş. |

Pilot tohumunda ünite adları, metnin kendi konusundan gelir. Bunlar resmî tema adı diye mühürlenmez:

| Ders | Ünite tohumu | Gerekçe |
|------|----------------|---------|
| Matematik | Kesirler | İki konu da kesir |
| Fen | Kuvvet | İtme, çekme, sürtünme |
| Türkçe | Ana fikir | Ana fikir ve yardımcı fikir |
| Ana İngilizce | İki ayrı ünite | `I'm / is / are` ve `a / an` aynı tema değildir |
| Seçmeliler | Ders başına bir ünite | Şablon metin. Tema adı ayrıca yazılır. |

**`JuniorLesson`**

| Kolon | Kaynak |
|-------|--------|
| `unit_id` | Üst ünite |
| `key` | `jr_06_mat-1` |
| `ordinal` | Konu sırası |
| `title`, `teaser`, `listen_text`, `meb_note`, `life_use` | Bugünkü `JuniorLessonScript` |
| `scene` | Vektör sahnesi |
| `steps_json` | Dokuz adım. Çekirdekte boş olabilir. |
| `access` | `free` veya `licensed` |

Ücretsiz kural bugün fonksiyonla duruyor: her dersin ilk konusu. Tohum da bunu yazar. `JUNIOR_FREE_LESSON_KEYS` ikinci liste olarak kalmaz.

**`JuniorOutcome`**

| Kolon | Kural |
|-------|--------|
| `lesson_id` | Konu |
| `ordinal` | Ders içi sıra |
| `statement` | Bugünkü kazanım cümlesi. Örnek: "Pay üstteki sayıdır." |
| `internal_code` | `JR-06-MAT-PAY`. Soru arşiviyle köprü. |
| `official_code` | Boş. Doluysa biçim serbest metin değil, editörün yapıştırdığı resmî dizedir. |
| `source_citation` | Belge adı, yıl, sayfa veya kazanım tablosu satırı. |
| `verified_at` | `official_code` doluysa zorunlu. Boşsa kod yazılmaz. |
| `skill` | `kavramsal` veya `ifade`. Ders metni bu iki adı zaten kullanır. |

`MAT.6.1.1` örneği şema kapasitesidir. Bu oturumda MEB tablosu satır satır eşlenmedi. 2018 kazanım kodu ile Maarif öğrenme çıktısı aynı dize olmayabilir. Kod, kaynak cümlesi ve `verified_at` olmadan basılmaz. Ajan ve tohum betiği kod üretmez.

**`JuniorQuestion`**

Fiziksel tablo `junior_question_bank` kalır. Prisma modeli `JuniorQuestion` adını alır. İkinci soru tablosu açılmaz. Bugünkü tablo boştur. Bu, taşımaya engel değildir.

Mevcut kolonlar durur: `lesson_key`, `item_id`, `outcome_code`, `prompt`, `choices_json`, `correct_index`, `explanation`, `tag`, `weight`, `pattern_year`, `active`.

Eklenecekler:

| Kolon | Kural |
|-------|--------|
| `outcome_id` | `JuniorOutcome`. `outcome_code` köprü olarak bir süre kalır. |
| `difficulty` | 1, 2 veya 3. Pilot sorularda boş bırakılabilir. Uydurma zorluk yazılmaz. |
| `choice_count` | Bugün 3. |

Şık JSON'unun hedefi:

```json
[
  {"text": "Üstte", "misconception": null},
  {"text": "Altta", "misconception": "pay-payda-yer-degistir"}
]
```

Doğru şıkta `misconception` boştur. Yanlış şıkta etiket, o şıkkı seçenin karıştırdığı kavramdır. Bugünkü 30 soruda bu etiket yoktur. Tohum, etiketi boş yazar. Editör doldurur.

Dört şık hedefi doğrudur. **CHECK bugün 3 şık ve `correct_index` 0–2 ister.** Otuz sorunun dördüncü şıkkı yazılmadan bu `CHECK` genişlemez. Dördüncü şık olarak otomatik "Bilmiyorum" eklenmez. O ek, ölçmeyi değiştirir.

`JUNIOR_OUTCOME_POOL_CAPACITY` çalışma zamanından çıkar. Yüz bin yuva satırı açılmaz.

**`JuniorQuizAttempt`** ve **`JuniorResponse`**

İlerleme satırı ders mührü olarak kalır: skor, oyun puanı, ders anahtarı, `mode=quiz`. Madde madde cevap oraya yazılmaz. İkisi karışırsa puan iki kez verilir.

| `JuniorQuizAttempt` | |
|---------------------|--|
| `profile_id`, `user_id` | Çocuk ve veli hesabı |
| `lesson_key` | Konu |
| `score`, `correct_count`, `item_count` | 0–100, bugünkü baraj 70 |
| `passed` | Skor barajı geçti mi |
| `progress_id` | Varsa XP satırının bağı. Tekrar denemede yeni attempt, yeni XP kuralı bugünkü günlük tavanı bozmaz. |

| `JuniorResponse` | |
|--------------------|--|
| `attempt_id` | Üst deneme |
| `profile_id`, `user_id` | Silme kümesi buradan yürür |
| `question_id` | Soru |
| `outcome_id` | Sorunun kazanımı. Soru satırıyla aynı olmak zorunda. |
| `choice_index` | Seçilen şık |
| `correct` | Sunucunun kararı. İstemci göndermez. |
| `misconception` | Seçilen yanlış şıkkın etiketi. Doğruysa boş. |
| `created_at` | An |

Doğru şık istemciye bugün de gitmez (`publicJuniorTopicQuiz` yalnız soru ve şıkları verir). Bu kural durur.

### 4.3 Otuz sorunun taşınma akışı

1. Taslak müfredat, dört çekirdek ders ve üç ücretsiz konu yazılır.
2. Her sorunun `outcome_code` değeri, dersin cümlesine bağlanır. Eşleşmeyen kod satırı tohumu düşürür.
3. 30 satır `junior_question_bank` içine girer. `choices_json` üç elemanlıdır. Zorluk ve yanlış kavram boştur.
4. Parite testi: aynı ders anahtarı için veritabanı kümesi ile `JUNIOR_QUESTION_ARCHIVE` aynı `item_id`, aynı doğru şık ve aynı açıklamayı verir.
5. Parite yeşil olunca `assembleJuniorQuestionSet` tabloyu okur. Arşiv dizisi tohum kaynağı olarak kalır, ikinci çalışma zamanı listesi olarak kalmaz.
6. Konu testi gönderilince, bugünkü skor hesabı durur. Ek olarak bir `JuniorQuizAttempt` ve her şık için bir `JuniorResponse` yazılır. İlerleme satırı bundan sonra XP için yazılır. Yazma sırası tek işlemde biter. Cevap yazılır da XP yazılmazsa deneme geri alınır.
7. Ücretli konularda soru yoksa test yine açılmaz. Bu, J-5 boşluğudur. Şema onu doldurmaz. Matematik 6. sınıfın ikinci konusu, ilk ücretli tam konu olarak ayrıca yazılır. Bu tasarımın kod adımı değildir.

İngilizce ilk konusu ve seçmeli ilk konular ücretsizdir ve soru arşivinde yoktur. Çocuk o konuda testi bitiremez. Tohum bunu gizlemez. O konular `JuniorQuestion` satırı yazılana kadar "konu testi yok" der.

---

## 5. Vitrin hijyeni

### 5.1 Kalkacak veya değişecek cümleler

| Yer | Bugünkü cümle | Karar |
|-----|----------------|--------|
| `components/junior/maarif-seal.tsx` `MAARIF_FIT_LINE` | "Türkiye Yüzyılı Maarif Modeline %100 Uygun" | Kalkar. |
| Aynı dosya, `MaarifSealLabel` | "%100" rozeti ve "Maarif Mührü" | Kalkar. `junior-room.tsx` bunu basıyor. |
| Aynı dosya, `JUNIOR_VALUE_BAND_LINE` | "Eğitim değeri 5.000 TL bandında" | Kalkar. Satış fiyatı katalog satırıdır. Değer bandı diye ikinci bir tutar durmaz. |
| `lib/junior/types.ts` `JUNIOR_MAARIF_SKILL_TAGS` | "Sözlü Anlatım Odaklı", "Beceri Temelli Öğrenme", "AI Destekli Birebir Dönüt" | İlk etiket ürünün yaptığı işe yakındır. Diğer ikisi ölçülmüş iddia değildir. Üçlü "Maarif becerileri" diye basılmaz. |
| `profile-switcher.tsx` | "Raf, yeni sınıfa göre açılır." | Kalkar. Yerine 5.2 cümlesi gelir. |

Kalacak doğru cümleler:

- "Hesap senindir. Çocuğun ayrı e-postası yok."
- "Buradaki puan cüzdan değildir."
- "Çocuğun sesi saklanmaz." (kod bunu yapıyor: ses kolonu yok, bellek siliniyor)
- "Her dersin ilk konusu ücretsizdir." (fonksiyon bunu yapıyor)
- Ödeme kapalıyken kasa formunun "ödeme hattı kapalı" cümlesi.

Yerine geçebilecek etiketler, kodun bugün yaptığı işle sınırlıdır:

- "Dinle ve anlat"
- "İlk konu ücretsiz"
- "Anlatış, bu dersin cümlelerine göre okunur"

"Maarif modeli sürümü işlendi" cümlesi, ancak `JuniorCurriculum.maarif_model_version` dolu ve `status = PUBLISHED` iken basılır. Yüzde ve mühür sözcüğü bu cümlede yoktur.

### 5.2 Sınıf değiştirme

`juniorShelvesForGrade` başlığı yeniden yazar. Ders anahtarı, metin ve soru 6. sınıf kalır. Ekran bunu şöyle söyler:

> Şu anda 6. sınıf pilot dersleri açık. Seçtiğin sınıf başlığı değiştirmez. Bu raftaki metin 6. sınıf dersidir.

Sınıf seçici (5–12) profil oluştururken kalabilir. Çocuk 7. sınıfta da 6. sınıf tekrarını dinleyebilir. Bu, Pedagoji Ek-J ile uyumludur: kazanım aynı kalır, değişen değerlendirme üslubudur. Üslup doğum yılından okunur. Başlık hilesi üslubun yerine geçmez.

"Sınıf Değiştir / Yükselt" düğmesi, o sınıf için `PUBLISHED` bir `JuniorCourse` satırı yokken görünmez. Hak sayısı düşmez. Böylece veli hakkını, içeriği değişmeyen bir yeniden adlandırmaya harcamaz. İleride 7. sınıf müfredatı yayınlanırsa düğme yalnız o sınıfları listeler.

Profil rozeti bugünkü gibi "{ad} - {sınıf}. Sınıf" kalır. Raf başlığı katalogdaki `JuniorCourse.title` olur. İkisi farklıysa rafın üstünde 6. sınıf pilot cümlesi durur.

---

## 6. Stratejik beklenti

### 6.1 Bu model ne sağlar

Karşılaştırma, bu oturumda laboratuvar ölçümü değildir. Ürünlerin bilinen çalışma biçimine göre mimari farktır.

| Ürün | Güçlü tarafı | Bu tasarımın farkı |
|------|----------------|--------------------|
| Duolingo Max | Kısa alıştırma döngüsü ve konuşma pratiği | Her cevap bir kazanım satırına ve silinebilir çocuk profiline bağlanır. Ses dosyası durmaz. |
| Khanmigo | Sokratik anlatım ve geniş içerik | Veli rızası sürümlü durur. Ulusal çıktı kodu, boşken uydurulmadan, dolunca cevap satırının yabancı anahtarı olur. |
| Doping Hafıza | Geniş video katalog ve veli satın alması | İzleme yerine madde madde cevap defteri. Fiyat ve tahsilat, vergi defteriyle aynı `PaymentOrder` hattındadır. |

Üstünlük, tablo açılınca kendiliğinden doğmaz. Üstünlük şu üçü birlikte durunca doğar:

1. Cevap, tek bir kazanım cümlesine bağlıdır ve silinebilir.
2. Para, tek defterdedir. Çocuğun TCKN'si diye bir kolon yoktur. Velinin TCKN'si fatura künyesinde bir kez durur.
3. Müfredat sürümü değişince eski cevap eski sürüme yapışık kalır.

İçerik hacmi bu üstünlüğün parçası değildir. Rafta 20 ders ve 30 üç şıklı soru vardır. Bu hacimle katalog karşılaşması kaybedilir. Kazanılan şey, dürüst ve denetlenebilir bir kayıt modelidir. Matematik yılının tamamı yazılmadan satış iddiası büyütülmez.

### 6.2 Dinle ve Anlat kalitesi

Bugünkü istem, dersin kazanım cümlelerini listeler ve tek skor ister (`juniorTellSystemPrompt`). Geçmiş cevap bu listeye girmez. Çocuk pay ile paydayı her seferinde karıştırsa da bir sonraki anlatış bunu bilmez.

Omurga inince kalite şöyle değişir:

- Soru ile anlatış aynı `JuniorOutcome` satırını kullanır. "Pay üstteki sayıdır" hem testin hem mikrofonun ölçütüdür.
- Bir sonraki anlatışın istemine, son denemede yanlış kalan kazanım cümleleri eklenir. Ham ses ve çocuğun eski cümlesi eklenmez.
- Geri bildirim "bir kısmını bildin" yerine o cümlenin eksiğini söyleyebilir. Bugünkü quiz övgüsü bu kadar geneldir.
- Yanlış kavram etiketi dolunca öğüt, o karışıklığa daralır. Etiket boşken öğüt bugünkü gibi ders cümlesinde kalır. Etiket uydurulmaz.

Kalite, metni tabloya kopyalamakla artmaz. Artış, bir cümlenin hem soruda hem anlatışta aynı kimliği taşımasıyla olur. Cümleler uzun ve iç içe kalırsa model yine genel öğüt verir.

Kişiselleştirme ses saklamayı gerektirmez. Pedagoji Ek-J "kalan, yazıya dökülmüş metin ve öğretici nottur" der. Kod bugün çocuğun cümlesini yazmaz. Öğretici not `praised` / `missing` / `advice` olarak durur. Tasarım bu sınırı korur. Yeni bir transkript tablosu açılmaz.

### 6.3 İlk kodlama adımı

Onaydan sonra ilk iş bir özellik yayını değildir. Üç dosya ailesidir. Kapı açılmaz. Checkout 503 kalır. Soru arşivi yerinde durur.

**Adım A — Prisma ve SQL**

Yeni migrasyon, adı örneğin `junior_guardian_consent`:

- `junior_guardian_consents` tablosu (2.1). Append-only: `updated_at` yok.
- `junior_profiles.active_consent_id` boş olabilir. Eski profiller düşmez.
- Tablo, `lib/kernel/security/rls-policy-registry.ts` listesine girer. FORCE RLS, PostgREST yazma politikası yok. Diğer Junior tabloları böyledir.
- `junior_subscriptions` kolonları ve `list_price_minor = 549900` kilidi bu migrasyonda durur.

Ayrı Supabase tohumu:

- `price_catalog_entries` satırı `junior` / `yearly` / `549900`.
- `ON CONFLICT` güncellemesi, `updated_by` doluysa tutarı ezmez.

**Adım B — Profil yazma yolu**

- Şema, kutu yanında `consentVersion` ve `guardianBirthYear` kabul edecek şekilde hazırlanır.
- Metin sürümü mühürlü değilse bu alanlar reddedilir ve bugünkü `consent: true` yolu çalışmaya devam eder. Böylece hukuksuz bir sürüm dizesi "onaylandı" diye yazılmaz.
- Hukuk metni mühürlenince `createJuniorProfile` rıza satırı yazar ve `active_consent_id` bağlar.
- Test, sürüm yokken ders kapısının `consent_at` ile durduğunu ve oda kilidinin 410/503 verdiğini yeniden okur (`verify:junior-pilot-seals`).

**Adım C — Bu adımda yapılmayanlar**

- PayTR öneki, lisans kancası, fatura kolonu düşürme.
- Müfredat tabloları ve 30 sorunun taşınması.
- Vitrin cümlelerinin silinmesi. Onlar küçük bir sonraki iştir. Satıştan önce durur. İlk migrasyonun içine karışmaz.
- `DRON_JUNIOR_OPEN` ve `JUNIOR_PRODUCTION_LOCKED`.

Sonraki kod sırası, ilk adım yeşil olduktan sonra:

1. Lisans satırını incelt. Fatura kolonlarını düşür. `merchant_oid` bağla. Fiyat `CHECK` sabitini, sipariş tutarı kopyasına çevir.
2. `junior` önekli sipariş ve lisans kancası. HTTP hâlâ 503.
3. Müfredat tabloları ve 30 soruluk parite. Çalışma zamanı arşivi, parite yeşil olunca bırakır.
4. `JuniorResponse` yazımı ve vitrin cümleleri.
5. Kapının açılması ayrı bir SUPER_ADMIN kararıdır. Bu tasarım o kararı içermez.

---

## 7. SUPER_ADMIN imza listesi

Kod, aşağıdaki altı madde işaretlenmeden 6.3'ün ötesine geçmez.

| # | Karar | Öneri |
|---|---------|--------|
| 1 | Çocuk aydınlatma metnini hukuk yazar. Sürüm dizesi ondan sonra kilitlenir. | Metin yokken rıza tablosu boş durur. Sahte sürüm basılmaz. |
| 2 | Çocuk profili self-serve silinebilir. Defter ve TCKN silinmez. | `ops-db` §18'e Junior istisnası olarak işlenir. |
| 3 | Fiyat tohumu 549.900 kuruştur. Sonraki zam katalog defterine gerekçe ile yazılır. | Satır `junior` / `yearly`. |
| 4 | Resmî kazanım kodu boş kalır. `MAT.6.1.1` örneği kapasitedir. | Eşleme insan işidir. Tohum kod üretmez. |
| 5 | Dört şık, 30 soruya dördüncü cümle yazılınca açılır. | Otomatik doldurma yok. |
| 6 | Oda kilitli kalır. Sınıf değiştir düğmesi, o sınıfın dersi yayınlanana kadar gizlenir. | İlk kod adımı düğmeye dokunmak zorunda değildir. Vitrin temizliği 4. sıradadır. |

---

## 8. Bu oturumda yapılmayanlar

- Veritabanına bağlanılmadı. `junior_subscriptions` içinde canlı satır olup olmadığı ölçülmedi. Fatura taşıma adımı bu yüzden "satır varsa" diye yazıldı.
- MEB Maarif PDF'i satır satır okunmadı. Resmî kod biçimi açık bırakıldı.
- Rakip ürünler çalıştırılmadı. 6.1 mimari farktır.
- Hukuk cümlesi yazılmadı. Başlık listesi 2.1'dedir.
- Kapı, fiyat, şema ve arayüz değiştirilmedi.
