# TESPİT RAPORU 001 — Kod tabanı ve mimari teşhis

Tarih: 27 Ekim 2026  
Kapsam: `docs/001. YetkinAI_Değerlendirme_1.md` ve `docs/002. YetkinAI_Değerlendirme_2.md` iddialarının canlı ürün koduyla doğrulanması.  
Yöntem: statik kod okuma. Canlı ödeme, trafik, üretim ortam değişkenleri ve gelir ölçülmedi. Bir ifadenin sitede görünüp görünmediği, onu basan kaynak dosyadan çıkarıldı.

Harici raporların ürün ve güven tespitleri büyük ölçüde kodla örtüşüyor. Mimari özet (Supabase Auth, Prisma, Next.js App Router, pragmatik monolit, ince sözleşme paketi, freelancer’ın kapalı tutulması) da kodla örtüşüyor. Aşağıda her madde dosya kanıtına bağlandı.

---

## 1. Mevcut durum özeti

### 1.1 Yasal ve kurumsal yüzey

Ziyaretçi metinleri ayrı bir i18n JSON’unda veya veritabanı seed’inde değil. Tek kaynak `lib/copy/legal-launch.ts`. Sayfalar bu sabiti basar.

| Ziyaretçi adresi | Kaynak |
| --- | --- |
| `/legal` dizin | `app/(public)/legal/page.tsx` |
| `/legal/kullanim` Kullanım şartları | `LEGAL_LAUNCH_SECTIONS` → `app/(public)/legal/[slug]/page.tsx` |
| `/legal/gizlilik` Gizlilik ve KVKK | aynı |
| `/legal/cerez` Çerez | aynı |
| `/legal/iade` İptal ve iade | aynı |
| `/legal/mesafeli-satis` Ön bilgi ve mesafeli satış | aynı |
| `/hakkimizda` | `app/(public)/hakkimizda/page.tsx` ← `LEGAL_ABOUT_STORY` |
| `/iletisim` | `app/(public)/iletisim/page.tsx` ← `LEGAL_ENTITY` |
| `/legal/junior-veli` | `lib/copy/junior-guardian-notice.ts` |

Künye aynı dosyada: ticari unvan, vergi kimliği, adres, destek e-postası, WhatsApp. Yürürlük etiketi `Yürürlük: 8 Eylül 2026`.

Harici rapordaki üç ifade kamu kopyasının içindedir:

- Kullanım şartları, madde 1 (`legal-launch.ts` kapsam paragrafı): «İkinci nakit yazıcı, platform cüzdanından banka çekimi, GİB canlı fatura ve müze yolları bu gövdede yoktur.» Aynı cümlede «Diskte duran diğer odalar pazarlanmaz.»
- Hakkımızda hikâyesi (`LEGAL_ABOUT_STORY`): «Uydurma unvan yazılmaz; unvan-faaliyet farkı bu sayfada dürüstçe belirtilir.»

Bu cümleler operatör notudur. Anayasa’daki «defter dışı nakit yazıcı yasaktır» kuralının ziyaretçi cümlesine taşınmış hâlidir. Testler bu üç ibareyi kilitlemiyor; 18+ cümlesini kilitliyor (`tests/kernel/legal-launch-surface.test.ts`).

### 1.2 Yaş: iki ürün, tek kayıt beyanı

Yetişkin kayıt, doğum tarihi doğrulamaz. `lib/kernel/auth/signup-metadata.ts` onay kutusunu şart koşar. Kutu yoksa `signUp` gitmez. Auth `user_metadata` içine `is_adult: true` ve `age_confirmed_at` yazılır. Kopya: «18 yaşından büyüğüm.» (`lib/copy/sen-voice/auth.ts`).

Kullanım şartları ve Hakkımızda aynı anda şunu yazar: hizmet 18 yaş ve üzeri içindir; «reşit olmayanların kullanımı» yasaktır (`legal-launch.ts`, yasaklar maddesi).

Junior ayrı bir çocuk hesabı değildir. `prisma/schema/junior.prisma`: `JuniorProfile` veli `userId` altındadır; çocuk e-postası yoktur. Veli metni (`junior-guardian-notice.ts`) şunu söyler: hesap velinindir, çocuk ayrı giriş almaz, doğum yılı bir beyandır ve kimlik doğrulaması değildir, metni onaylayan kişi o gün 18 yaşından büyük olduğunu beyan eder. Ders, bu metin onaylanmadan açılmaz.

Oda açıktır. `lib/dronlar/kayit.ts` içinde Junior `kapali: false`, blurb «6. Sınıf Pilot». Kenar, vitrin niyetini herkese bırakır (`lib/kernel/security/edge-guard.ts`, Anayasa B6 yorumu). İlk konu ücretsizdir; sonraki konular yıllık paket ister.

Yıllık paket tutarı kodda **549.900 kuruş = 5.499 TL** (`prisma/migrations` ve `supabase/migrations` içinde `549900`; sepet testi `5499.00`). Kasa varsayılanı kapalıdır: `JUNIOR_CHECKOUT_OPEN` boşken `isJuniorCheckoutLocked()` doğrudur. Kapalı ekran metni: «Gerçek PayTR mağaza hattı bağlanana kadar yıllık paket satışı açılmaz.» (`components/junior/checkout-form.tsx`). Fiyat etiketi vitrinde katalog satırından basılabilir; bu depo, üretimde bayrağın açık olup olmadığını söylemez.

Young (`/young`, 9–12 ve YKS) kayıtta `kapali: true` doğar. `DRON_YOUNG_OPEN` boşken kamu yüzeyi kapalı kalır.

Sonuç: çelişki pazarlama cümlesi değil, iki yürürlük metninin aynı gövdede durmasıdır. Kayıt «ben yetişkinim» beyanı ister. Şartlar reşit olmayan kullanımı yasaklar. Junior ise aynı yetişkin hesabın altında çocuk profili açar. İstisna şartlar metninde yazılmamıştır.

### 1.3 Satın alma ve cüzdan

Kart tahsilatının canlı kanalı PayTR Merchant’dır. iyzico akademi kasasında yoktur. `iyzico` adı yalnız pazaryeri split tasarım notunda ve bir sınav çeldiricisinde geçer. `MARKETPLACE_SPLIT_LIVE = false` (`lib/kernel/payments/marketplace-split-live.ts`).

Tek bakiye kaynağı `Wallet` + append-only `LedgerEntry` (`prisma/schema/kernel.prisma`). `User` üzerinde bakiye kolonu yoktur. Tutar kuruş tamsayısıdır (`amountMinor`). Yükleme bandı 10 TL – 20.000 TL (`WALLET_TOP_UP_MIN_MINOR = 1_000`, `WALLET_TOP_UP_MAX_MINOR = 2_000_000`).

Akademi satın alma tek düğmedir ve defterde iki harekettir:

1. Bakiye kursu karşılıyorsa PayTR açılmaz; cüzdan DEBIT + `academy_purchases` SETTLED (`components/academy/purchase-button.tsx`, `academyPaytrTopUpMinor` 0 döner).
2. Bakiye yetmezse aynı düğme `POST /api/wallet/top-up` çağırır, `courseSlug` taşır, PayTR iFrame açar. Sipariş amacı `academy-license:{slug}` düz cüzdan yüklemesinden ayrıdır (`lib/academy/paytr-license-bridge.ts`).
3. PayTR CLEARED olunca kanca bakiyeye CREDIT yazar, ardından aynı tutarı DEBIT edip lisansı kapatır (`register-paytr-license-hook.ts`). Webhook lisansı yazmışsa istemci ikinci kez düşmez. Yetersiz bakiyede lisans yazılmaz; yalnız o siparişin tutarını karta iade denemesi vardır.

Ziyaretçi metni hâlâ iki ayrı iş anlatır (`legal-launch.ts`, iade madde 2): «Bakiye yükleme işlemi ders erişimini doğrudan açmaz; eğitimin cüzdan bakiyesiyle ayrıca satın alınması gerekir.» Kullanılmamış bakiyenin kendiliğinden karta dönmediği de aynı paragraftadır. Kod, akademi niyetli yüklemede ikinci tıklamayı kaldırmaya çalışır. Metin ve başarısızlık yolu (lisans yazılamazsa bakiye elde kalır) cüzdanı kullanıcıya gösterir.

Vitrin tohum fiyatları KDV dahildir. Sıralı vitrinde altı kart vardır (`vitrineOrder` 1–6, `packages/kernel/src/catalog-ids/course-registry.ts`): 89.000, 99.000 ve 129.000 kuruş, yani 890 TL, 990 TL ve 1.290 TL. Amiral `01_office_ai` 890 TL. Kayıt defterinde 13 kanon kart daha vardır; `06_`–`13_` vitrin sırası taşımaz ve özetleri «Hazırlanıyor» kabuğudur. Canlı kilit `PriceCatalogEntry` satırıdır; tohum, satır varken fiyatı ezmez.

Sertifika satın alma ile basılmaz. Sınav barajı 70 (`ACADEMY_EXAM_PASS_SCORE`). Lisans 365 gün. İlk ders önizlemesi oturumsuz açıktır (`isAcademyFreePreviewPlayerPath`).

### 1.4 Yönlendirme

Kök adres oturumdan bağımsız Akademi kataloğuna iner. İki kilit aynı hükmü verir:

- `next.config.ts`: `source: "/"` → `destination: "/academy"`, kalıcı. `www` kökü `https://yetkin.ai/academy`.
- `proxy.ts` / `decideEdgeAction`: `kind: "root-308"`, pathname `/academy`.

`app/(public)/page.tsx` bir iniş gövdesi taşır ve dosyanın kendi yorumu şunu söyler: kilit durduğu sürece bu gövde basılmaz.

Kabukta «Anasayfa» etiketi `/dashboard` odasıdır (`lib/dronlar/kayit.ts`, `label: "Anasayfa"`). `/dashboard` herkese açıktır. Oturum yoksa `PublicHomePanel`, oturum varsa nabız panosu basılır (`app/dashboard/page.tsx`). Kenar bu adresi kataloğa düşürmez (`isPublicKernelVitrinePath`).

Ziyaretçinin gördüğü iki giriş: kök = katalog, menüdeki Anasayfa = genel bakış. Harici raporun «iki ayrı giriş noktası» tespiti kodla aynıdır.

Kamu vitrin odaları: Panel (`/dashboard`), Akademi, Kariyer. Junior menüde ayrı durur. Freelancer ve Young kapalı doğar.

### 1.5 Sertifika ve SHA-256

`AcademyCertificate` satın almaya ve sınav denemesine bağlıdır (`prisma/schema/academy.prisma`). Hash, sunucuda şu yükün SHA-256’sıdır (`lib/academy/exam.ts`): sürüm, `userId`, `courseId`, `attemptId`, puan, basım anı, müfredat özeti. Doğrulama aynı yükü yeniden hesaplar. Kopya bunu kriptografik imza diye satmaz: «sicil bütünlük kaydı».

Doğrulama adresleri:

- Kanonik form: `/academy/dogrula` — 64 hex yapıştırma (`components/academy/certificate-verify-form.tsx`).
- Kanonik sonuç: `/academy/dogrula/[hash]`. Oturum yok. Kimlik basılmaz.
- Kısa alias: `/verify` ve `/verify/:hash` 301 ile kanoniğe iner.

Kariyer’in oturumsuz sayfası üç adımı açıkça yazar (`lib/copy/sen-voice/career.ts`, `publicRoom.steps`):

1. Sertifikadaki SHA-256 özetini kopyala.
2. Doğrulama sayfasını aç.
3. Özeti yapıştır.

Aynı gövdede yapıştırma tek yol değildir. Hash’ten üretilen QR vardır (`components/academy/certificate-verify-qr.tsx`, «kullanıcı girdisi değil»). Sertifika listesinde paylaşım bağı, LinkedIn ve X vardır. Kamuya açık yetkinlik kartı `/vize/:id` (eski `/p/:id` 301) oturumsuz mühür kartıdır ve QR basabilir. İmzalı kariyer defteri hash’i kopyalatır ve doğrulama bağı üretir. Eksik olan mekanizma değil, oturumsuz kariyer anlatısının hâlâ yapıştırmayı birinci yol yapmasıdır.

### 1.6 Çekirdek, şema, auth

`@yetkin/kernel` (`packages/kernel`) Prisma ve Supabase taşımaz. İçinde para tipleri, katalog kimlikleri, v1 zarfı ve SHA-256 vardır. İş kuralları `lib/kernel` ve oda motorlarındadır.

Kimlik Supabase Auth’tur (`lib/kernel/auth/supabase-server.ts`, `supabase-browser.ts`). `User.id` uygulama tarafından üretilmez; Auth UUID’sidir. Veri erişimi Prisma 7, çok dosyalı şema, PostgreSQL:

- `prisma/schema/kernel.prisma` — User, Wallet, LedgerEntry, EscrowHold, PaymentOrder, fiyat, fatura bilgisi
- `prisma/schema/academy.prisma` — kurs, satın alma, sınav, sertifika, ders tamamlama, ses önbelleği
- `prisma/schema/career.prisma` — `CareerVisaStamp`, `CareerPortfolioItem`
- `prisma/schema/junior.prisma` — profil, veli onayı, ilerleme, abonelik
- `prisma/schema/freelancer.prisma` — iş, teklif, sözleşme, uyuşmazlık, mesaj, squad

`/api/v1` kopya handler ağacı değildir. Kenar öneki soyar ve mevcut rota gövdesine yazar (`lib/kernel/http/api-v1.ts`). Sözleşme `lib/kernel/http/v1-contract.ts` içindedir. Native istemci Bearer ister.

### 1.7 Freelancer pazaryeri

Motor silinmemiştir. Şema, sözleşme durumları (FUNDED, RELEASED, REFUNDED, DISPUTED), emanet kilidi ve tahkim turları durur. Kamu yüzeyi kilitlidir:

- `FREELANCER_PUBLIC_SURFACE_LOCKED = true`
- `DRON_KAYIT` freelancer satırı `kapali: true`, `DRON_FREELANCER_OPEN` boşken 410
- `/api/freelancer/*`, `/api/client/jobs/*` ve soyulmuş `/api/v1/freelancer/*` 410 (`proxy.ts`)
- Split kapalı. Cüzdandan IBAN çekimi yok.

Diskte durup kenarda 410 yiyen odalar: studio, devlabs, kurumsal, hibe, arena, pazaryeri, social (`FROZEN_DISK_ROOMS`). Eski `archived/` gövdesi canlı ürün değildir.

Kariyer «Teklif Kapısı» bir ilan tahtası değildir. Metin, sınavı geçen mühürden görünürlük, özgeçmiş bağı ve portföy satırı türetir. Freelancer panosu linki kilit açık değilken basılmaz.

### 1.8 İçerik üretim hattı

Yetişkin ders gövdesi CMS değildir. Müfredat TypeScript modüllerindedir (`lib/academy/curricula`). Satış kapısı konuşma metni ve mühürlü ses olmadan lisansı açmaz (`academyCourseSaleOpen`). Üretim tabanı `lib/academy/production-standard.ts`: kurs en az 6 ders, ders en az 5 dakika ve 600 kelime, TTS istek tavanı kurs başına 100. Beş medya katmanının disk okuyucusu `production-seal-disk.ts`. Model rolleri `lib/kernel/ai/model-roles.ts` içindedir (7 canlı rol + mühürlü-ölü `VIDEO_GEN`). Kimlikler üretim anayasasına kilitlidir; bu rapor o tabloyu kopyalamaz.

Junior hattı ayrı mühürdür (`lib/junior/production-seal.ts`): metin, ses, ısınma, quiz, sahne, süre. Ses dosyaları manifestte SHA-256 ve bayt ile kilitlenir. Kapak üretimi yetişkin görsel rolünün yedeği değildir. 6. sınıf pilotu tek yazılan sınıftır.

---

## 2. Kritik inceleme ve uyumsuzluklar

### 2.1 Metin hataları — doğrulandı

Harici raporun üç örneği aynen kamu kaynağındadır. Ziyaretçi «ikinci nakit yazıcı» ve «müze yolları»nı ödeme yapacağı sözleşmede okur. «Uydurma unvan yazılmaz» Hakkımızda hikâyesindedir. Bunlar yazım hatası değil, iç mühür dilinin vitrine sızmasıdır.

Aynı dosyada ziyaretçiye yarayan künye de vardır: unvan, VKN, adres, destek, cayma istisnası, tüketici hakem heyeti. Sorun sayfanın boş olması değil, kurumsal cümlenin içine operatör cümlesinin gömülmesidir.

### 2.2 Yaş çelişkisi — doğrulandı, nüansla

Üç katman birlikte durur:

1. Şartlar: platform 18+, reşit olmayan kullanım yasak.
2. Kayıt: kendi beyanı, doğum tarihi veya kimlik kontrolü yok.
3. Junior: veli hesabı + çocuk profili + veli aydınlatması + 5.499 TL yıllık tohum. Kasa kodda varsayılan kapalı.

Harici rapor «Junior satılıyor ve şartlar 18+ diyor» diye okumuş. Kod, satışı bayrağa bağlamış ve çocuk hesabını veli hesabından ayırmış. Metinler bu ayrımı şartlarda söylemiyor. Veli aydınlatması ile kullanım şartları yan yana okununca biri çocuk profilini tarif eder, diğeri reşit olmayan kullanımı yasaklar.

### 2.3 Satın alma — kısmen doğrulandı

Harici rapor «önce cüzdana yükle, sonra kursu ayrıca satın al» demiş. Yasal metin hâlâ bunu söylüyor. Çalışan akademi düğmesi ise tek tıklamadır: eksik tutar PayTR’ye gider, webhook lisansı kapatır. Kullanıcıdan ikinci bir satın alma istenmesi, lisansın yazılamadığı arıza yolunda kalır. Kullanılmamış bakiyenin otomatik karta dönmemesi doğrudur ve metinde açıktır.

Bu, sade bir «kart → kurs» deneyimi değildir. Defter doğruluğu için cüzdan aradadır. Ziyaretçi metni ara katmanı ürün adımı gibi anlatır.

### 2.4 Yönlendirme — doğrulandı

Kök `/academy`. Menüdeki Anasayfa `/dashboard`. İniş sayfası dosyası durur ve kenar onu basmaz. İki genel bakış hissi kasıtlı kilitlerin sonucudur (`next.config.ts` yorumu: «soğuk iniş kalkar»).

### 2.5 Sertifika anlatımı — doğrulandı, eksik değil

Yapıştırma akışı kariyerin oturumsuz adımlarında birincildir. Paylaşılabilir bağ, QR ve `/vize` kartı kodda vardır. Harici raporun önerdiği «paylaşılabilir bağlantı» sıfırdan icat gerektirmez. Birinci yolun değişmesi gerekir. Hash’in imza olmadığı da zaten kopyada yazılıdır; işveren değeri ile bütünlük kaydı birbirine karıştırılmamalıdır. Kod işe yerleşmeyi garanti etmez.

### 2.6 Harici raporun bilerek ölçmediği şeyler

Satış, dönüşüm, mobil performans ve uçtan uca tahsilat bu depodan çıkmaz. Freelancer’ın kapalı tutulması, ikinci raporun «acele açma» hükmüyle aynı yöndedir ve kodda sert kilit olarak durur.

---

## 3. Teknik borç ve altyapı

Sağlam olanlar:

- Tek nakit defteri, kart numarasının platformda tutulmaması, idempotent ödeme, fiyat kilidi, sınav olmadan sertifika basılmaması.
- Oda kapılarının tek kayıtta durması (`lib/dronlar/kayit.ts`). Kapalı oda 410, müze yolu 404. Sahte vitrin basılmıyor.
- `@yetkin/kernel` ince. Veritabanı ve auth gövdeye yapışık. Mikroservis bölünmesi yok. Bu, ikinci raporun övdüğü pragmatik monolit ile aynıdır.
- Freelancer şeması pazaryeri pilotuna yetecek iskeleti taşır (iş, teklif, sözleşme, emanet, uyuşmazlık). Split ve kamu API kapalı olduğu için iskelet kullanıcıya yük bindirmez.

Borç ve sürtünme:

- **Kopya SSOT’u iç dil taşıyor.** `legal-launch.ts` ve `career.ts` `publicRoom.steps` ziyaretçi cümlesi ile operatör cümlesini aynı sabitte tutuyor. Hukuki dürüstlük (unvanın gayrimenkul/e-ticaret olması, bakiyenin otomatik dönmemesi) kalabilir. «Nakit yazıcı», «müze yolları», «uydurma unvan yazılmaz» kalamaz.
- **Yaş politikası üç yerde üç türlü.** Şartlar, kayıt metadata’sı ve Junior veli metni tek hükme bağlanmamış. Teknik kapı (veli beyanı, ayrı çocuk e-postası yok) ürün niyetine yakın; sözleşme metni değil.
- **Ödeme hikâyesi kodun gerisinde.** Otomatik lisans kancası varken iade ve ön bilgilendirme hâlâ «ayrıca satın al» diyor. Arıza yolu bakiyeyi kullanıcıya bırakıyor. Metin, tek tıklamayı ve artık bakiye kuralını aynı doğrulukta anlatmalı.
- **İki ana sayfa.** `app/(public)/page.tsx` ölü gövde. Kök kataloğa kilitli. `/dashboard` «Anasayfa» diye ikinci vitrin. Ürün kararı netleşmeden yönlendirme silinmemeli; silinirse kenar ve `next.config.ts` birlikte değişmeli, yoksa çift hop veya ölü sayfa kalır.
- **Doğrulama UX’i hazır parçaları öne çıkarmıyor.** QR ve `/academy/dogrula/{hash}` duruyor. Oturumsuz kariyer adımları 64 hex istiyor.
- **Vitrin ile kayıt defteri ayrı.** Altı kart satılır, yedi kanon kabuk «hazırlanıyor». Fiyat tohumu ile `PriceCatalogEntry` ayrı. Tohum tek başına vitrin fiyatı değildir.
- **Junior kasa ile vitrin fiyatı ayrı.** 5.499 TL tohumu ve kilitli kasa birlikte durur. Ziyaretçi fiyatı görüp ödeyememeyi, metinler açıklamazsa güven kırılır. Üretim bayrağı bu raporda okunmadı.
- **Pazaryeri hazırlığı kodda, eşleşme değil.** Şema ve 410 kilidi «kontrollü hazırlık» ile uyumludur. Akademi kategorisi ile gelecekteki hizmet kategorisini bağlayan bir ürün köprüsü yoktur. Kariyer kapısı görünürlük metnidir, iş emri değildir.

Ölçek ve güvenlik için temel doğrudur: tek süreç, tek defter, fail-closed kapılar, sözleşme paketi büyüyünce duracak yer. Darboğaz yeni servis değildir. Darboğaz ziyaretçi metni, yaş hükmü, ödeme anlatısı ve doğrulama yolunun mevcut parçalarla hizalanmasıdır.

---

## 4. Uzman görüşü

### 4.1 Sen olsan ilk neyi düzeltirdin?

İlk iş `lib/copy/legal-launch.ts` ve onu basan sayfalardır. Kullanım şartları madde 1 ve Hakkımızda hikâyesindeki operatör cümleleri, aynı hukuki hükmü koruyarak ziyaretçi cümlesine çevrilir. Unvan-faaliyet farkı kalır. «Uydurma unvan yazılmaz» kalkar. «İkinci nakit yazıcı» ve «müze yolları» kalkar. Yerine kısa hüküm gelir: tek tahsilat kanalı Yetkili Ödeme Kuruluşu, bakiye banka hesabına çekilmez, kapalı odalar vitrinde yoktur.

Aynı turda yaş hükmü tek cümlede birleşir. Yetişkin hesap 18+ beyanıdır. Çocuk ayrı üye olmaz. Junior, veli hesabının altındaki profildir ve veli metnine tabidir. «Reşit olmayanların kullanımı yasaktır» cümlesi, bu istisna yazılmadan duramaz.

İkinci iş, yeni bir doğrulama motoru yazmak değildir. `career.ts` içindeki üç yapıştırma adımı, mevcut `/academy/dogrula/{hash}` bağı ve QR’ı birinci yol yapar. Hex alanı üçüncü şahıs yedeği olarak kalır. Kopya zaten «bu bir imza değildir» diyor. O cümle durur.

Cüzdanı ilk turda sökmezdim. Defter tek nakit kaynağıdır ve akademi düğmesi zaten PayTR ile lisansı aynı akışta kapatmaya çalışıyor. Sökmek, mutabakatı ve iade kancasını yeniden yazmak demektir. Önce metin, çalışan akışla aynı hikâyeyi anlatır.

### 4.2 Platform kurgusu doğru kurulmuş mu?

Akademi + ileride pazaryeri için temel doğru kurulmuş. Gerekçesi:

- Kimlik, veri ve HTTP tek gövdede. Sözleşme paketi veritabanına yapışık değil. Oda eklemek yeni repo açmıyor.
- Para append-only defterde. Kart platformda durmuyor. Satın alma belge basmıyor. Belge sınav ve yeniden hesaplanan özete bağlı.
- Pazaryeri şeması duruyor ve kullanıcıya kapalı. İki taraflı pazar, talep olmadan açılmıyor. Bu, ikinci raporun stratejisiyle aynı teknik karardır.
- Üretim, tek ders dosyası değil, mühür fonksiyonları ve manifest ile kapanıyor. Kalite iddiası metin olarak değil, kapı olarak duruyor.

Eksik olan temel değil, temel ile vitrinin aynı cümleyi kurmaması. Yaş, iade ve ana sayfa üç ayrı ürün gibi okunuyor. Ölçek için mikroservis gerekmiyor. Güven için eksik olan katman, yaşın yalnızca beyan olmasıdır. Bu, çocuk ürünü açık kaldıkça hukuki metin işidir. Kimlik sağlayıcı entegrasyonu bu teşhisin konusu değildir ve şart koşulmaz.

### 4.3 Gelecek master plan (Phase 2: tedavi)

Amaç yeni modül açmak değil, doğrulanmış uyumsuzlukları mevcut kapıları bozmadan kapatmaktır. Sıra risk ve bağımlılığa göredir.

**Adım 1 — Vitrin dili (kopya, davranış yok)**  
`lib/copy/legal-launch.ts`, `lib/copy/sen-voice/career.ts` `publicRoom.steps`, Hakkımızda ve İletişim’in okuduğu sabitler. Operatör ibareleri çıkar. 18+ ile Junior veli istisnası aynı hükümde yazılır. İade ve ön bilgilendirme, akademi niyetli PayTR akışını tek tahsilat diye anlatır. Artık bakiyenin otomatik dönmediği cümle kalır. `tests/kernel/legal-launch-surface.test.ts` ve kariyer yüzey testleri yeni cümleyle güncellenir. A katmanı anayasa metnine dokunulmaz.

**Adım 2 — Doğrulama yolu (mevcut URL ve QR)**  
Oturumsuz kariyer adımları paylaşılabilir bağı ve QR’ı öne alır. Yapıştırma formu `/academy/dogrula` üzerinde yedek kalır. `/verify` 301’i değişmez. Sertifika sayfasında eğitim adı, puan, basım tarihi ve doğrulama bağı zaten basılıyorsa vitrin sırası kontrol edilir. Yeni hash algoritması yazılmaz.

**Adım 3 — Tek giriş hikâyesi**  
Ürün kararı koddan önce gelir. İki meşru seçenek vardır. Biri: kök katalog kalsın, menüdeki «Anasayfa» etiketi «Genel bakış» olsun, `/dashboard` oturumlu nabız olarak kalsın. Diğeri: kökteki 308 ve `next.config.ts` kalıcı yönlendirmesi birlikte kalksın, `app/(public)/page.tsx` gerçek iniş olsun, katalog `/academy` olarak kalsın. İkisi birden sessizce silinmez. Kenar testi `tests/kernel/edge-guard.test.ts` kökü 308 bekliyor. Karar hangisiyse test onunla kilitlenir.

**Adım 4 — Ödeme anlatısı ile kancanın aynı olması**  
Kod akışı (tek düğme, `academy-license:` amacı, CLEARED sonrası DEBIT) korunur. Metin bu akışı anlatır. Arıza yolunda lisans yazılamazsa kullanıcının gördüğü bakiye mesajı, iade paragrafıyla çelişmeyecek şekilde gözden geçirilir. Junior kasası kapalıysa vitrin fiyatı «satış kapalı» ile birlikte durur. Bayrak açılmadan 5.499 TL tahsilat vaadi verilmez. PayTR mutabakat scriptleri bu adımda yeniden yazılmaz. Davranış değişirse `npm run verify:paytr-reconciliation-seals` çalışır.

**Adım 5 — Ölçüm, yeni oda değil**  
Mevcut huni olayları (`begin_checkout` ve katalog görüntüleme) duruyor. Phase 2’nin ürün işi, amiral eğitim için ziyaret → ücretsiz ders → kayıt → ödeme tamamlama → sınavı geçme sayaçlarını okumaktır. Freelancer 410 kalkmaz. Split açılmaz. İlk pazaryeri işi elle eşleşir. Otomasyon, o işler tekrar edince `FreelancerJob` kapısının hangi alanları eksik bıraktığını gösterir.

**Adım 6 — Kapanış kapıları**  
Kopya veya şablon değişince: `npx tsc --noEmit`, `npx vitest run`, `npm run verify:api-auth -- --check`. Junior metni veya müfredat değişirse `npm run verify:junior-content` ve `npm run verify:boundaries`. Ödeme gövdesine dokunulursa PayTR mühür komutları. Bu rapor `/docs` altındadır. Derleme bu dosyaya bağlı değildir.

Phase 2’nin bitmiş hali: ziyaretçi yasal sayfada operatör kelimesi görmez, yaş hükmü veli profiliyle çelişmez, kök ile menü aynı hikâyeyi söyler, sertifika bağı yapıştırmadan açılır, cüzdan defteri durur ve kullanıcıya ikinci bir satın alma adımı anlatılmaz. Pazaryeri o aşamanın konusu değildir.
