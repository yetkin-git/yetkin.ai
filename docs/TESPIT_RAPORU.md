# Yetkin.ai Tespit ve Mimari Analiz Raporu

| | |
|---|---|
| Tarih | 5 Ekim 2026 |
| Tür | Salt okuma. Bu turda kod değiştirilmedi. |
| Kapsam | Erişim, ödeme, 6. sınıf Junior, temizlik, sonraki plan |
| Ölçülmeyen | Canlı veritabanı, Vercel ortam değişkenleri, `public/media/` baytları |

Bu rapor kodun bugün ne yaptığını anlatır. Canlı sitede hangi satırın yazılı olduğunu söylemez. Fiyat ve yayın kararı veritabanı satırındadır; o satır bu oturumda okunmadı.

---

## 1. Kullanıcı yetkisi ve erişim

### 1.1 Ziyaretçi, 1. dersi izler; 2. ders kilitlenir

Karar tek fonksiyondadır: `resolveAcademyEntitlement` (`lib/academy/entitlement.ts`).

Oturum yokken ve satın alma yokken açık olanlar:

- O kursun sınav yolundaki **ilk ders**. İlk ders, ders numarasının “1” olması değildir. Sınav yolunun ilk anahtarıdır. Tablo `lib/kernel/catalog-ids/exam-path.ts` içindedir. Anahtarlar yetişkin kurs kartındaki `lessonKeys` sırasından gelir.
- Yalnız ofis temel kursunda (`01_office_ai`) varsa **hazırlık şeridi**. Başka kursta hazırlık şeridi yoktur.

2. ders ve sonrası bu durumda kapalıdır. Kapalı dersin gövdesi tarayıcıya boş gider (`lib/academy/preview-lock.ts`). Kenar, önizlemesi olan kursun oynatıcı adresini (`/academy/{kurs}/oyna`) girişe zorlamaz (`lib/kernel/security/edge-guard.ts`). Oynatıcı sayfası oturumsuz ziyaretçiye kilitli kabuk basar (`app/academy/[slug]/oyna/page.tsx`).

Önizlemenin süresi yoktur. Lisansın süresi ayrıdır: satın alma satırının üstünden **365 gün** (`lib/academy/license.ts`). Süre dolunca kilitli dersler yeniden kapanır. İlk ders açık kalır.

Dersi olmayan boş kabukta (vitrin sırası olmayan 06–13 kartları) ücretsiz kapı açılmaz. İlk anahtar yoksa önizleme de yoktur.

Bu kural bir veritabanı anahtarı değildir. Süper yönetici panelden “şu dersi ücretsiz yap” diyemez. Açık ders, sınav yolunun ilk anahtarıdır.

### 1.2 Normal müşteri, PayTR ve fiyatlar

Müşteri dersi satın alma satırıyla açar. Satır `SETTLED` olmalıdır ve 365 günü dolmamış olmalıdır. Rol kolonu yoktur. “Müşteri” demek, bu satırı olan hesaptır.

**Liste tohumu** (kuruş, KDV dahil) kurs kartındadır: `packages/kernel/src/catalog-ids/course-registry.ts`. Vitrindeki altı kart:

| Kod | Kart | Tohum |
|---|---|---|
| OFF-101 | İş hayatında ofis yapay zekâ | ₺890 |
| SM-103 | Sosyal medya görseli ve kısa video | ₺890 |
| EC-102 | E-ticaret ve pazaryeri | ₺990 |
| OFF-201 | İleri ofis yapay zekâ | ₺1.290 |
| PR-105 | Prompt | ₺1.290 |
| BOT-104 | Kodsuz chatbot | ₺1.290 |

06 ve sonrası kartların tohumu daha yüksektir (binlerce lira). Onların ders yolu boştur. Satış listesine girmezler.

Karttaki rakam **tohumdur**. Müşterinin ödediği tutar, veritabanındaki aktif fiyat satırıdır (`PriceCatalogEntry`). Tohum, satır yokken vitrine fiyat basmaz. Satır varsa tohum onu ezmez (`lib/academy/catalog-pricing.ts`). Bu yüzden “bugün vitrinde ₺890 yazıyor” cümlesi, canlı fiyat satırı okunmadan kesin değildir.

**Satın alma yolu**

1. Karttaki satın al, kurs sayfasındaki kasaya gider (`#satin-al`).
2. Cüzdan tutarı karşılıyorsa karttan çekim olmaz. Cüzdan düşer, kurs satın alma satırı yazılır.
3. Cüzdan yetmezse eksik tutar PayTR çerçevesine gider. İstek `POST /api/wallet/top-up` adresine, kurs kısa adıyla gider. Sipariş niyeti `academy-license:{kısa ad}` olur. Düz cüzdan yüklemesi (`wallet-top-up`) lisans açmaz.
4. PayTR bildirimi iki ağızdan gelir: asıl ağız `/api/payments/webhooks/paytr`, paneldeki kısa ad `/api/paytr/callback`. İkisi aynı işi görür.
5. Sipariş `CLEARED` olunca köprü fiyatı kilitler, cüzdandan düşer ve `academy_purchases` satırını `SETTLED` yazar (`lib/academy/paytr-license-bridge.ts`).

**Satışın açılması** üç şartın birden durmasını ister (`academyCatalogPurchasable`):

- Kursta yayın işareti (`is_published`)
- Aktif fiyat satırı
- Sınav yolundaki her dersin beş katmanı diskte durması (metin, ses, yerel ısınma videosu, görsel, müzik)

Biri eksikse kart satın al demez. Bu oturumda diskteki medya klasörü ve canlı yayın satırı açılmadı. Hangi kartın bugün gerçekten satıldığını buradan ilan etmiyorum.

Junior’un yıllık paketi bu altı karttan ayrıdır. Liste fiyatı **5.499 TL**’dir (`lib/junior/limits.ts`). Junior PayTR mührü şu an deneme anahtarıdır (`merchantId: "000000"`). Canlı mağaza anahtarı değildir (`lib/junior/paytr.ts`).

### 1.3 `yapinet360@gmail.com` — tam erişim var mı?

Akademi derslerinde **izleme** için evet, şartlı. Her oda ve her sınav için hayır.

Tek kapı `isSuperAdminActor` (`lib/kernel/auth/super-admin.ts`). Veritabanında admin rolü yoktur.

Bu adres için kural şudur:

- E-posta, kodun içine yazılı yerleşik kutudur: `yapinet360@gmail.com`.
- Oturumda e-posta **doğrulanmış** olmalıdır (`email_confirmed_at` dolu).
- Bu kutu, `SUPER_ADMIN_USER_ID` boş olsa da, gecikse de veya başka bir adresle uyuşmasa da açılır. Üretimde env yüzünden kilitlenmez.
- Vatandaş test adresi `yetkin.vision@gmail.com` hiçbir ortamda süper yönetici olamaz. Env’e yazılsa da olamaz.

Başka bir adres üretimde iki kilidi birden ister: kanonik e-posta env’i ve kullanıcı kimliği env’i, ikisi de oturumla eşleşir. Biri eksikse o adres admin değildir.

**Akademide açılanlar**

- Doğrulanmış bu kutu, satın alma satırı olmadan oynatıcıyı açar. Sebep `admin-bypass` (`lib/academy/entitlement.ts`).
- Katalogdaki ders sırası kilidi de kalkar. 2. ders ve sonrası gövdesi bu oturumda gelir.
- Satışı kapalı kartta vitrin düğmesi doğrudan oynatıcıya gider. Buna kod “stüdyo önizlemesi” der (`studioPreview`, `app/academy/page.tsx`). Bu, eski `/studio` odası değildir.

**Açılmayanlar ve ince istisnalar**

1. E-posta doğrulanmamışsa bu kutu da admin değildir. İzleme muafiyeti doğmaz.
2. Kursun sınav yolunda olmayan yabancı ders anahtarı kilitli kalır.
3. Vitrin oynatıcısında olmayan kısa ad (06–13 boş kabuklar) sayfa olarak 404’tür. İzlenecek ders yoktur.
4. Üretimde sıfır liralık bağış satırı **yazılmaz**. İzleme bellek içi karardır. Kalıcı satın alma satırı açmaz (`isZeroFeeAcademyGrantOpen` üretimde kapalı).
5. Sınav ve sertifika, üretimde bu muafiyetle atlanmaz. Sınav kapısı gerçek `SETTLED` satır ve bitmiş müfredat ister. Sınırsız laboratuvar geçişi yalnız üretim dışında açıktır (`hasUnlimitedAcademyAccess`). Sınav dosyasındaki “süper yönetici sınavı atlar” cümlesi, üretim koduyla aynı şeyi söylemez.
6. İlerleme, satın alma satırının kimliğine yazılır. Üretimde kalıcı satır yoksa her istek yeni bir bellek kimliği üretebilir. Ders izlenir. Tamamlama ve sertifika bu kimliğe güvenle yapışmayabilir.
7. Yayınlanmamış kartın vitrin düğmesi, stüdyo önizlemesi açık olsa da kapalı kalabilir. Doğrudan oynatıcı adresi, vitrin kısa adıysa ve oturum adminse açılır.
8. Eski stüdyo odası (`/studio`) herkese, bu adrese de, **410** döner. Disk arşivdedir. Menüde canlı oda değildir.
9. Junior odası da bu adrese özel açılmaz. Aşağıda.

Özet: doğrulanmış `yapinet360@gmail.com`, yetişkin akademide ders gövdesini satın almadan izler. Sınavı, sertifikayı, Junior’u ve eski stüdyo odasını koşulsuz açmaz.

---

## 2. Junior — 6. sınıf derslerinin durumu

### 2.1 Bugün kapı kapalı

`JUNIOR_PRODUCTION_LOCKED` sabiti `true` (`lib/kernel/compliance/circuit-breakers.ts`).

Bu sabit dururken ortam bayrağı `DRON_JUNIOR_OPEN` tek başına yetmez. İkisi birden kalkmadan:

- `/junior` ve altı **410** döner (ziyaretçi, veli ve süper yönetici aynı).
- `/api/junior-pilot` ve altı da **410** döner.

Sol menü yine de “Junior” linkini basar (`components/shell/sidebar-nav.tsx`). Tıklayınca kapalı oda sayfası gelir.

Anayasa B6, ders listesinin ziyaretçiye açık olduğunu ve kilidin yalnız para akışında olduğunu yazar. Kod, sayfanın kendisini kapatır. Bu, belgenin bugünkü kodla çeliştiği yerdir.

### 2.2 Dersler veritabanında durmuyor

6. sınıf metni TypeScript dosyasındadır. Veritabanı ders gövdesi tutmaz.

| Ne | Nerede |
|---|---|
| Dört çekirdek ders | `lib/junior/catalog.ts` |
| Altı seçmeli ders | `lib/junior/elective-catalog.ts` |
| Soru kalıpları | `lib/junior/question-bank.ts` (kod). Tablo `junior_question_bank` şemada var. Konu testi bugün kod arşivini okur. |
| Çocuk profili, rıza, ilerleme, oyun puanı, yıllık paket | `prisma/schema/junior.prisma` |
| Sayfalar | `app/junior/page.tsx`, `app/junior/ders/[lessonKey]/page.tsx`, `app/junior/checkout/page.tsx` |
| Yazma ağızları | `app/api/junior-pilot/` altında profil, seçmeli, kasa, anlat, pekiştirme, konu testi, sınıf |
| Çizim | `components/junior/vector-player.tsx` |
| Ses | Tarayıcının kendi sesi. Dış ses servisi yok (`lib/junior/speech.ts`). |

Sayfa kodu durur. Kenar 410 bastığı için vatandaş bu sayfaya ulaşamaz.

Pilot sınıf **6**’dır. Sınıf seçici 5 ile 12 arasını kabul eder. Başka sınıf seçilince kartın başlığı o sınıfa çekilir. Metin 6. sınıf metni olarak kalır. Ekranda uyarı cümlesi vardır: seçilen sınıf başlığı değiştirmez, raftaki metin 6. sınıf dersidir.

### 2.3 Hangi ders yazılmış

Her kartta **iki konu** vardır. Tam bir 6. sınıf yılı değildir.

**Çekirdek (paket açılınca 2. konu da açılır)**

| Kart | 1. konu (ücretsiz kapı) | 2. konu (paket) | Çizim | 10 soruluk test |
|---|---|---|---|---|
| Matematik `jr_06_mat` | Kesir | Aynı paydada toplama | Var | Yalnız 1. konuda |
| Fen `jr_06_fen` | Kuvvet | Sürtünme | Var | Yalnız 1. konuda |
| Türkçe `jr_06_turkce` | Ana fikir | Yardımcı fikir | Var | Yalnız 1. konuda |
| Ana İngilizce `jr_06_ing_main` | I'm, is, are | a ve an | Adım şeridi | Yok |

**Seçmeli (yıllık pakette en fazla 3 ders)**

İngilizce pratik, Almanca, Fransızca, Siyer-i Nebi, Kodlama, Arapça. Her birinde iki konu. İlk konu erişim kuralında ücretsiz sayılır. Hiçbirinin soru arşivi yoktur.

Soru arşivi yalnız üç konudadır: matematik, fen ve Türkçe’nin ilk konusu. Her birinde on soru vardır (yedi güncel kalıp, üç eski kalıp). On sorudan az arşivi olan konuda test puanlanmaz (`gradeJuniorTopicQuiz` boş döner).

Erişim kuralı ile ücretsiz liste aynı şeyi söylemez:

- `juniorLessonAccess`: her kartın **ilk konusu** ücretsizdir. Bu, İngilizce ve seçmelileri de kapsar.
- `JUNIOR_FREE_LESSON_KEYS`: yalnız matematik, fen ve Türkçe’nin ilk konusunu sayar. Soru arşivi bu üçüne yazılmıştır.

İngilizce’nin ilk konusu açılırsa çocuk dinler. Konu testi kurulamaz.

Junior servisinde süper yönetici istisnası yoktur. Kapı açılsa bile `yapinet360@gmail.com` paket almadan 2. konuları açamaz.

### 2.4 Yayına hazır olmak için eksik olanlar

Metin taslağı, dört çekirdekte ve altı seçmelide ikişer konu olarak duruyor. Yayın bundan ibaret değildir.

1. **Kapı.** Üretim kilidi ve `DRON_JUNIOR_OPEN` birlikte kalkmalı. Kilit cümlesi, veli doğrulaması ve hukuki altyapı bitmeden para ve vitrin açılmasın der. Bu karar kodda hâlâ kapalı.
2. **Belge ile kod.** Ya ders listesi gerçekten ziyaretçiye açılır ve yalnız kasa kilitli kalır, ya da Anayasa B6 o cümleyi bugünkü 410’a çeker. İkisi birden durursa menü yalan söyler.
3. **Sınav.** Ana İngilizce’nin ilk konusu ve bütün 2. konular, seçmelilerle birlikte, on soruluk arşiv beklemektedir. Arşivsiz konuda ders “bitti” sayılamaz. Baraj, on soruda en az yedi doğrudur.
4. **Ödeme.** Junior kasası deneme anahtarıdır. Canlı PayTR üçlüsü, fatura ve webhook bu pakete bağlanmadan 5.499 TL tahsil edilemez.
5. **Müfredat boyu.** İki konu, “6. sınıf dersi yayında” sözü için azdır. Ya ürün “pilot, iki konu” diye kalır, ya da konu sayısı artar.
6. **Sınıf başlığı.** 7. veya 8. sınıf seçmek metni o sınıfa çevirmez. Yayında bu ya dürüstçe “yalnız 6. sınıf” olarak kilitlenir, ya da her sınıfın kendi metni yazılır.
7. **Yetişkin beş katman bu odaya kopyalanmaz.** Junior sesi tarayıcıdadır. Isınma videosu ve fon müziği bu pilotun parçası değildir. Pedagoji eki bunu ayrı karar sayar. Eksik diye yetişkin fırın kapısına sokmak yanlış iş olur.
8. **Eski tablo.** Ağustos 2026 davet tablosu (`junior_guardian_invites`) sonraki temizlikten sonra şemada yoktur. Ekim pilotu profilleri yeniden kurar. Canlı veritabanında o eski tablonun durup durmadığı ölçülmedi.

---

## 3. Temizlik ve bilginin tek evi

### 3.1 Atıl görünen yerler

Tam bir “hiçbir dosya kullanılmıyor” taraması yapılmadı. Bilinçli olarak duran bölgeler şunlar:

- `archived/` ve `yetkin_muze/`: eski odaların müzesi. Canlı davranışın evi değildir. Silinmesi ayrı bir karar ister.
- Kenarda 410 dönen odalar: stüdyo, DevLabs, kurumsal, hibe, arena, pazaryeri, sosyal. Diskte arşiv, adreste kapalı.
- Junior bu listeye de yazılmıştır **ve** `app/junior` ile `lib/junior` canlı kod olarak durur. İki ev birden vardır. Biri “donmuş oda”, öteki “müstakil oda”. Ziyaretçi 410 görür.
- `docs/TESPIT_RAPORU_.md`: alt çizgili eski kardeş. Bu dosyanın yerine geçmez. Canlı tespit bu belgedir.

Boş kuyruklar kasıtlıdır: yeniden fırın kuyruğu boş, diyalog SKU listesi boş. Bunlar çöp dosya değildir. “Şu an iş yok” demektir.

### 3.2 Aynı işin birden fazla yerde durması

| Konu | Durum |
|---|---|
| Yetişkin ders kapısı | Tek fonksiyon: `resolveAcademyEntitlement`. Dağınık kapılar buna bağlanmış. Bu taraf temiz. |
| Fiyat | Tohum kartta, kasa fiyatı veritabanında. Bu iki katman bilinçli. SM-103 dosyası ayrıca “₺890’dan koptu” diye kendini denetler. Üçüncü bir fiyat listesi açılmamalı. |
| PayTR | Yetişkin kasa `lib/kernel/payments/paytr`. Junior ayrı deneme mührü. İki ağız (webhook ve `/api/paytr/callback`) aynı bildirimin kısa adıdır. Junior’u canlıya alırken ikinci bir sahte mağaza anahtarı kalmamalı. |
| Ücretsiz Junior konu | Erişim “her kartın ilk konusu”, soru listesi “yalnız üç konu” der. Yayın öncesi tek listeye inmeli. |
| Süper yönetici sınavı | Yorum, üretimde sınırsız geçiş var der. Kod, o geçişi üretimde kapatır. Yorum yanıltır. |
| Junior’un yeri | Menüde açık oda, kenarda donmuş oda, Anayasa’da “liste ziyaretçiye açık”. Üç cümle aynı kapıyı anlatmıyor. |

Model kimliği tek evdedir: `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL`. Eğitim hazırlama belgesindeki kilitli harita ile aynıdır (ses `gemini-3.8-flash-tts`, görsel `gemini-3.1-flash-image`, müzik `lyria-3.5`, metin `gemini-3.8-flash`). Bu turda harita silinmedi ve eski modele çekilmedi.

### 3.3 Belgeler kodla ne kadar uyumlu

**Anayasa B1** günceldir. Canlı ad şudur: Pragmatik Monolit + ince sözleşme paketi (`@yetkin/kernel`) + tek native istemci (`apps/rail-is`). “Amiral Gemi + Sürü Dron” bu yapının eski adıdır. Ayrı uygulama veya ayrı veritabanı tarif etmez. Manifesto aynı cümleyi tekrar etmez, B1’e işaret eder. `.cursorrules` da bu adı korur. Bu üçü birbiriyle uyumludur.

**Anayasa B4 ve Pedagoji** yetişkin fırın kuralında uyumludur. Beş katman, ilk dersin ücretsiz olması, hazırlık şeridi ve “karar veritabanı bayrağı değildir” cümlesi kodla aynıdır.

**Anayasa B6** Junior kapısında kodun gerisindedir. Belge, ders listesini herkese açık sayar ve kilidi paraya bağlar. Kod, listenin adresini de 410 yapar. Pasaport cümlesi doğru yöndedir: Junior, yetişkin kurs kartına ve kariyer vizesine girmez.

**Pedagoji Ek-J** öğretme modeli olarak kodla konuşur: veli hesabı, çocuk profili, ses saklanmaz, oyun puanı para değildir, ilk konu tam derstir. Üslubun yaşa göre değişmesi belge kuralıdır. Bu turda her yaş üslubunun anlatış motorunda gerçekten ayrıldığı satır satır ölçülmedi. Raf başlığının sınıfa göre değişip metnin değişmemesi, belgenin “kazanım değişmez, ses değişir” cümlesinden daha ileri gider: başlık da değişiyor, içerik 6. sınıfta kalıyor.

**Manifesto** gelir motorlarını vizyon olarak tutar. Freelancer’ın kilitli olduğunu B2’ye bırakır. Bu, kodla uyumludur: freelancer kamu yüzeyi 410.

Belgeler modeli kendi içlerinde ikinci kez saymaz. Bu doğru. Sayı ve tempo kodda durur.

---

## 4. Görüş, kurgu ve sonraki plan

### 4.1 Ben olsam neyi farklı kurardım

Yetişkin kapısını baştan yazmazdım. Tek karar fonksiyonu doğru yerde. Dağıtık “şu sayfa kendi kilidini koysun” düzenine dönmezdim.

Şunları farklı tutardım:

1. **Süper yönetici izlemesi ile süper yönetici sınavı aynı cümle olmasın.** İzleme muafiyeti üretimde açık. Sınav muafiyeti üretimde kapalı. Bu ayrım doğrudur (kanıt satın alınamaz). Yorum ve operasyon notu bunu tek cümlede “her yere girer” diye yazmasın. İzleme için kalıcı bir laboratuvar satırı da gerekmez. Gerekirse ilerleme, bellek kimliği yerine sabit bir “izleme, nakit değil” işaretine yazılsın. Böylece ders bitirme denemesi yabancı anahtara çarpmaz.
2. **Junior’a aynı türden tek kapı.** Bugün kenar 410, sayfa “açık olsa” ayrı kural, soru arşivi üçüncü kural. Yayın günü üçü birden şaşırtır. Tek fonksiyon şunu sorsun: bu çocuk, bu konuda, bu paketle girebilir mi. Süper yönetici bu fonksiyona ancak açıkça yazılırsa girsin. Şu an girmiyor. Bu, yetişkin odadan daha dürüst. Belgeler de öyle söylesin.
3. **Fiyatın evi veritabanı satırı olarak kalsın.** Tohum kartı kalsın. Üçüncü bir fiyat dosyası açmayın. Canlı tutarı değiştirmek kod yayını istemesin.
4. **6. sınıf metnini hemen veritabanına taşımayın.** Yirmi kısa konu dosyada duruyor. Metin oturmadan tabloya göç, her cümle düzeltmesini migration yapar. Önce konu listesi ve soru arşivi bitsin. Sonra, birden fazla yazar aynı anda yazacaksa tabloya geçilir.
5. **Sınıf seçici ya dürüst kilitlensin ya da gerçekten o sınıfın metnini göstersin.** Başlığı “8. Sınıf Matematik” yapıp kesir pilotunu göstermek, dürüst yüzey kuralını zorlar. Uyarı cümlesi bunu tamir etmez. Seçici, metin yazılana kadar yalnız 6’da kalabilir.

### 4.2 Kurgu doğru mu

Evet. Ayrı mikro uygulamalar ve ayrı veritabanları bu ürünü büyütmez. Şu anki gövde doğrudur:

- Gövde bu Next.js uygulamasıdır (`app/`, `lib/`).
- Para, katalog kimliği ve dış zarf ince pakettedir (`packages/kernel`). Paket Prisma taşımaz. Bu sınır korunmalı.
- Telefon istemcisi tekdir (`apps/rail-is`) ve aynı `/api/v1` ağzını kullanır.
- “Sürü Dron” ayrı bir gemi değildir. Kayıt defterindeki oda ve bayraktır (`lib/dronlar/kayit.ts`). Yeni oda, yeni sunucu açmaz. Kayıt, sözleşme ve kapalı doğan bayrak yeter.

Sürdürülebilirlik, oda sayısını artırmakta değil, kapalı odanın belgede ve kenarda aynı cümleyi söylemesindedir. Junior bugün bu testi geçmez. Freelancer geçer: motor durur, vitrin 410 der, belge de kilitli der.

PayTR’yi cüzdanın önüne koymak da doğrudur. Platform, müşterinin parasını kendi havuzunda tutup bankaya çekim açmıyor. Kart, lisanslı işyeri çerçevesinden geçer. Sipariş `CLEARED` olmadan lisans yazılmaz. Bu düzen bozulmamalı.

### 4.3 Belgeler bizi nerede yavaşlatır, nerede korur

Koruyan maddeler:

- Beş katman olmadan yetişkin dersin satılmaması. Yarım videoyu vitrine koyma riskini keser.
- İlk dersin ücretsiz olması ve bunun veritabanı anahtarı olmaması. Satış ekibi “şu kampanyada 3. dersi de açalım” diyemez. Karar sınav yolunun ilk anahtarıdır.
- Kanıtın satın alınmaması. Süper yöneticinin üretimde sınavı atlayamaması bu ilkeye uygundur. Belge bunu “her kapı açık” sanmasın diye cümle netleşmeli.
- Model haritasının kodu geriye çekememesi. Eski sese düşmek, mühürlü kaseti sessizce bozar.
- Freelancer’ın lisanssız split olmadan para almaması.

Yavaşlatan veya çelişen maddeler:

- **B6 ile kenar kilidi.** Ekip “liste açık, kasa kapalı” sanarak vitrin işi yapar. Ziyaretçi 410 görür. Önce bu cümle tek olsun.
- **Beş katmanı Junior’a da şart sanmak.** Pedagoji bunu yasaklar. Yine de fırın alışkanlığı Junior’u yetişkin kaset kuyruğuna sokabilir. Junior’un kendi sesi tarayıcıdır. Bunu ikinci bir anayasa maddesiyle uzatmaya gerek yok. B6 zaten “öğretme pedagojidedir” der. Eksik olan, kapının tarifidir.
- **Eski adların raporda yaşaması.** “Amiral Gemi + Sürü Dron” yeni bir mimari değildir. Yeni belgede bu adla plan yazılırsa ekip ikinci bir deploy arar. B1 yeter.
- **Faz 1’de yeni oda açılmaz** (Manifesto). Junior zaten oda olarak kodlanmış, sonra kilitlenmiş. Yeni oda açmak yavaşlatmaz. Kilitli odanın yarım vitrini yavaşlatır.

Silinmesini önermediğim madde: model tablosu ve beş aşama kapısı. Onlar kısıt değil, üretim emniyetidir.

### 4.4 Sonraki aşama — master plan

Ölçek, yeni sunucu değildir. Aynı gövdede üç işin sırayla bitmesidir.

**Aşama A — Dürüst kapı (önce bu)**

1. Junior için tek cümle seçin. Öneri: ders listesi ve ilk konular, veli girişi olmadan okunabilsin. Kasa, anlatış kaydı ve 2. konular kilitli kalsın. 410, bütün adresi yutmasın. Menü ancak bu cümle kodda doğruysa “Junior” desin.
2. Anayasa B6’yı bu cümleye eşitleyin. Kodu belgeye uydurmak veya belgeyi koda uydurmak aynı turda bitsin. İkisi açık kalmasın.
3. Süper yönetici notunu iki satıra ayırın: yetişkin oynatıcı açık, sınav ve Junior paket kuralına bağlı.
4. Canlıda, altı yetişkin kart için üçlü kontrol: yayın satırı, aktif fiyat, beş katman. Bu oturum onu ölçmedi. Satış hunisi bu listeden yazılır. Mühürsüz kart satın al demez.

**Aşama B — 6. sınıf pilotu, yıl değil**

1. Ürün sözü “6. sınıfın tamamı” olmasın. Söz, “dört derste ikişer konu, üçünde test” olsun. Seçmeliler test yazılmadan paket vaadi olmasın.
2. Ana İngilizce ilk konusuna on soru. Sonra açılacak her 2. konuya on soru.
3. Sınıf seçici yalnız 6. Yayında başka sınıfın başlığı basılmasın.
4. PayTR deneme anahtarı canlı üçlüyle değişmeden tahsilat açılmasın. Fiyat 5.499 TL olarak kodda duruyor. Canlı mağaza onayı ayrı iştir.
5. Hukuk kilidi (veli doğrulaması) kalkmadan `JUNIOR_PRODUCTION_LOCKED` indirilmesin. İndirince `DRON_JUNIOR_OPEN` da bilinçli açılır. İkisi birden gerekir.

**Aşama C — Yetişkin vitrin**

1. Satışı açık olan kartlarda ilk ders gerçekten tam ders kalsın. Kırpılmış tanıtım eklenmesin.
2. 06–13 boş kabuklar vitrine ve oynatıcıya girmez. Girmeleri için ders yolu, beş katman ve fiyat satırı gerekir. Bu, Junior’dan önce değildir.
3. Freelancer ve pazaryeri, lisanslı split checklist’i bitmeden açılmaz. Motoru silmeyin. Vitrini de açmayın.

**Aşama D — Ancak konu sayısı artınca**

1. 6. sınıf konusu onlarca olursa metin dosyadan tabloya geçer. O güne kadar katalog dosyası tek evdir.
2. İkinci native istemci ancak aynı paket ve aynı `/api/v1` ağzıyla doğar. Ayrı kimlik ve ayrı veritabanı açılmaz.
3. Oyun puanı para birimine bağlanmaz. Junior ile cüzdan ayrı kalır.

Bu sıra, yeni mimari aramaz. Kapıyı belgesiyle aynı yapar, 6. sınıfı olduğundan büyük göstermez, yetişkin satışını mühürsüz kartla şişirmez.
