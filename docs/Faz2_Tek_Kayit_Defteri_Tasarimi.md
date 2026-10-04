# FAZ 2 — Tek Kurs Kayıt Defteri Tasarımı

Tarih: 4 Ekim 2026  
Durum: Tespit ve tasarım. Bu belgede kod değişmedi.  
Kapsam: Canlı akademi kataloğu. Arşiv ve müze odaları bu haritaya girmedi.

Bu belge şunu cevaplar: kurs kimliği bugün kaç yerde elle yazılıyor, tek bir kayıt defteri bunu nasıl toplar, yedinci eğitim eklenince hangi iş gerçekten tek satıra iner, yayın açıp kapatmak neden hâlâ SQL istiyor, ve canlı siteyi kırmadan bu iş nasıl sıraya konur.

---

## 1. Kısa hüküm

Kurs kimliği bugün tek evde durmuyor. Aynı slug, unvan, ders listesi, fiyat tohumu ve «yayında» kararı birkaç dosyada yeniden yazılıyor. Canlı vitrinde altı eğitim var. Kanon listede on üç eğitim var. Mobil uygulama yalnız iki eğitimi sayıyor.

Tek kayıt defteri `lib/academy/registry.ts` adlı tek dosya olamaz. İnce sözleşme paketi (`@yetkin/kernel`) ve mobil istemci akademi motorunu içeri almaz. Kimlik kartı paketin içinde durur. Akademi odası ve mobil uygulama o kartı okur.

Yedinci eğitimin kimlik kartına tek obje eklemek, liste ve kapı işini bitirir. Ders metni, sınav havuzu, ses, ısınma kaseti ve kapak dosyası yine kendi yerinde durur. Onlar adlandırma sözleşmesiyle karta bağlanır. Kartın içine roman yazılmaz.

Yayın anahtarı bugün iki yerde. Biri kodda sabit bayrak. Biri veritabanında `is_published`, ve o kolon yeni bir SQL dosyasıyla değişiyor. Süper Admin paneli bugün tutarı değiştirir; yayını değiştirmez. Tek tuş, bu iki kapıyı tek satıra indirir ve disk mührünü satış kilidi olarak yerinde bırakır.

---

## 2. Bugün kaç eğitim var

| Küme | Adet | Kimler |
| --- | --- | --- |
| Canlı vitrin | 6 | OFF-101 `01_office_ai`, OFF-201 `01_office_ai_ileri`, EC-102 `02_ecommerce_ai`, SM-103 `03_social_media_ai`, BOT-104 `04_chatbot_nocode`, PR-105 `05_prompt_practice` |
| Kanon kart | 13 | `01_` … `13_`. `06_`–`13_` vitrinde «hazırlanıyor» kabuğu. OFF-201 bu on üçe girmez. |
| Mobil liste | 2 | Yalnız `01_office_ai` ve `01_office_ai_ileri` |
| Satın alma adayı (kod) | 6 | Canlı vitrinle aynı |

Yedinci canlı eğitim, kanonda zaten duran `06_n8n_automation` (N8N-201) olur. Unvanı, seviye etiketi, tohum fiyatı ve ses yuvası kanon kartta yazılı. Ders yolu, ısınma kaseti, SEO metni, satış bayrağı ve veritabanı yayın satırı yok.

---

## 3. Dağınık kayıt haritası

Aşağıdaki tablo «bu kurs kim» sorusunun elle yazıldığı evlerdir. Ders gövdesi, sinema slaytı ve sınav cümlesi bu tabloya girmez. Onlar içeriktir. Burada kimlik ve kapı vardır.

| # | Dosya | Ne elle yazılıyor | Kim okuyor |
| --- | --- | --- | --- |
| 1 | `packages/kernel/src/catalog-ids/course-slugs.ts` | 13 slug, unvan, katman (1/2/3). OFF-201 unvanı ayrı ek: `ACADEMY_STOREFRONT_EXTRA_TITLES`. | Web, pasaport, mobil başlık |
| 2 | `lib/kernel/catalog-ids/course-slugs.ts` | Yukarıdakinin yeniden ihracı. İkinci kopya değil. | Web import yolu |
| 3 | `lib/kernel/catalog-ids/exam-path.ts` | Altı canlı kursun sınav yolu ders anahtarları. Boş dizi «ilk ders yok» demektir. | Ücretsiz önizleme, mühür listesi, kenar |
| 4 | `lib/kernel/catalog-ids/free-preview.ts` | Slug listesi yok. İlk ders anahtarını sınav yolundan okur. | Önizleme kapısı |
| 5 | `lib/academy/pilot-sku.ts` | Vitrin sırası, satış bayrakları, kapak yolu, lisans adayı listesi, mühürlü slug listesi, yeniden fırın betik yolları | Vitrin, satış, site haritası, oynatıcı |
| 6 | `lib/academy/instructors.ts` | Slug → ağız. OFF-201 ayrı sabit (`Kore`). Kanon 13 ayrı harita. | Fırın ve «1 eğitim = 1 ses» |
| 7 | `lib/academy/lesson-veo.ts` | Isınma kaseti anahtarı ve hangi dersin hangi kasete bağlandığı. Liste sınav yoluyla ikinci kez yazılmış. | Oynatıcı video katmanı |
| 8 | `lib/academy/baked-micro-videos.ts` | Yedi ısınma dosya adı, bir daha | Disk video katmanı |
| 9 | `lib/academy/course-level.ts` | 13 slug → Temel / Orta / İleri / Masterclass. OFF-201 yok; sonek `-ileri` ile tahmin ediliyor. | Kart etiketi, tohum |
| 10 | `lib/academy/catalog-pricing.ts` | 13 tohum fiyatı (kuruş). OFF-201 ayrı sabit: 129000. | Tohum. Canlı tutar veritabanı satırı. |
| 11 | `lib/academy/catalog-summaries.ts` | 13 kart özeti. `06_`–`13_` aynı «hazırlanıyor» cümlesi. | Vitrin kartı |
| 12 | `lib/academy/catalog-seed.ts` | 13 satırlık kimlik: `ac_…`, `cat_academy_course_…`, `exam_…`, sıra puanı | SQL tohum ve admin katalog |
| 13 | `lib/academy/catalog-filter.ts` | Slug → eğitim kodu (OFF-101 … GV-303) ve raf sırası | Kart kodu, sıra |
| 14 | `lib/academy/course-cover.ts` | Kapak yolu, kurs kurs | Vitrin ve site haritası görseli |
| 15 | `lib/academy/retired-storefront.ts` | «Canlı sayılan» beş slug. OFF-201 bu listede yok. Emekli URL 301 haritası buradan türer. | Eski adres yönlendirmesi |
| 16 | `lib/academy/seed.ts` | 13 slug için ders anahtarı öneki. Önek zaten slug’ın kendisi. | Sınav tohumu |
| 17 | `lib/copy/seo.ts` | Canlı kurs başına ayrı SEO objesi (başlık, açıklama, H1, anahtar kelime) | Antre arama metası |
| 18 | `lib/copy/json-ld.ts`, `lib/copy/sem-keywords.ts` | OFF-101 ağırlıklı `teaches` ve müfredat yedeği | Arama kartı |
| 19 | `lib/copy/sen-voice/academy.ts` | Bazı kodların vitrin adı | Arayüz cümlesi |
| 20 | `packages/kernel/src/catalog-ids/need-based-mapping.ts` | Beş kod → slug. OFF-201 ve `06_`–`13_` yok. | İlan kapısı, pasaport |
| 21 | `lib/kernel/passport/growth-card.ts` | Beş kısa etiket, bir daha | Pasaport karnesi |
| 22 | `apps/rail-is/src/ui/course-slugs.ts` | Mobil sıra: iki slug | Native vitrin |
| 23 | `app/sitemap.ts` | Site haritası slug’ları `pilot-sku` listelerinden kurulur | Google |
| 24 | `lib/academy/exam-pools.ts` | Kod ve slug → sınav havuzu dosyası | Sınav |
| 25 | `supabase/migrations/*publish*.sql` ve `*academy_course_seed.sql` | Yayın ve fiyat satırının SQL kopyası | Canlı veritabanı |
| 26 | `scripts/ops-migrate-lib.ts` → `EXPECTED_SQL` | 14 SQL dosya adı, klasördeki sıranın elle kopyası | Hosted apply kilidi |

İçerik evleri (karta taşınmaz, ada bağlanır):

- Müfredat gövdesi: `lib/academy/curricula/<kurs>/`
- Konuşma metni: `lib/academy/spoken-scripts/`
- Sınav cümleleri: `lib/academy/exam-pools-*.ts`
- Isınma dosyası: `public/media/academy/micro/*-warmup.mp4`
- Sinema karesi: `public` altındaki kapak ve cue görselleri

`lesson-index.ts` sınav yolunu ikinci kez yazmaz. `exam-path.ts` tablosunu okur. Bu doğru desen. Yeni defter aynı deseni bütün listelere yayar.

---

## 4. Aynı kararın iki evi

### 4.1 Yayın

Bir kursun vitrinde durması bugün üç kilide bağlı.

1. Kod bayrağı. Örnek: `ACADEMY_EC102_PUBLIC_RELEASE_OPEN`, `ACADEMY_SM103_PUBLIC_RELEASE_OPEN`, `ACADEMY_BOT104_PUBLIC_RELEASE_OPEN`, `ACADEMY_PR105_PUBLIC_RELEASE_OPEN`, `ACADEMY_OFF201_LAUNCH_SALE_OPEN`. Her yeni canlı kursa yeni bir `true` yazılıyor.
2. Veritabanı kolonu `academy_courses.is_published`. EC-102 üç SQL gördü: aç, kapat, yeniden aç (`20260929180000`, `20260930133000`, `20260930140000`). SM-103, BOT-104 ve PR-105 tek SQL ile açıldı (`20261003230400`).
3. Disk mührü. `academyCourseSaleOpen` sınav yolundaki her dersin beş katmanı diskte durmadan satışı açmaz.

Süper Admin sayfası (`app/(kernel)/admin/page.tsx`) katalog tutarını değiştirir. `PATCH /api/(kernel)/admin/catalog` yalnız `amountMinor` kabul eder. `is_published` için düğme yoktur.

### 4.2 Liste sapması

- Web vitrin altı kart gösterir. Mobil liste iki kart gösterir.
- `retired-storefront.ts` canlı saydığı küme beş slug’dır. OFF-201 kanon olmadığı için 301 yemez. Yine de «canlı kim» sorusu o dosyada eksik cevaplanır.
- `ACADEMY_GROWTH_SKU_SLUGS` yalnız amiraldir. OFF-201 ve dört kardeş ayrı listelerde durur. Site haritası bu parçaları elde birleştirir.
- Pasaport ve ilan kapısı beş kod bilir. OFF-201 o beşliye girmez. Bu, ürün kararı olarak durabilir. Karar yine de kartta bir alan olmalı. İkinci bir tablo olmamalı.

---

## 5. Tek kayıt defteri

### 5.1 Nereye konur

İki katman. Tek anlam.

| Katman | Dosya | Görevi |
| --- | --- | --- |
| Kimlik kartı | `packages/kernel/src/catalog-ids/course-registry.ts` | Saf veri. Dosya sistemi, Prisma ve akademi motoru yok. |
| Akademi kapısı | `lib/academy/registry.ts` | Kartı yeniden ihraç eder. Satış, vitrin ve kapak fonksiyonları bu kartı okur. |

Mobil uygulama `@yetkin/kernel` üzerinden kartı okur. `apps/rail-is/src/ui/course-slugs.ts` içindeki elle dizi kalkar. `nativeListed === true` olan kartlar mobil sırayı verir.

Kenar (`free-preview`, sınav yolunun ilk dersi) akademi motorunu import etmez. İlk ders, karttaki `lessonKeys[0]` olur. `exam-path.ts` tabloyu kendisi yazmaz. Karttan türer ve aynı fonksiyon adlarını dışarı vermeye devam eder.

`lib/kernel/catalog-ids/*` bugün paketi yeniden ihraç ediyor. Bu ince yol kalır. İkinci bir slug tablosu açılmaz.

### 5.2 Bir kartta ne durur

Bir eğitim, bir obje.

| Alan | Anlamı | Örnek |
| --- | --- | --- |
| `slug` | Adres ve veritabanı anahtarı | `06_n8n_automation` |
| `code` | Vatandaşın gördüğü kısa kod | `N8N-201` |
| `title` | Sicil unvanı | Kanon cümlesi |
| `level` | Serbest etiket | `Orta` |
| `layer` | Raf: 1 kitlesel, 2 mesleki, 3 kurumsal | `2` |
| `canon` | On üçlük kanonda mı | `true` (OFF-201 için `false`) |
| `priceSeedMinor` | Kuruş tohumu. Canlı tutar değildir. | `390000` |
| `voice` | Tek ağız kimliği | `Zephyr` |
| `lessonKeys` | Sınav yolu, sırayla | `["06_n8n_automation-1", …]` |
| `warmup` | Kaset adı ve bağlı dersler | `{ assetKey, lessonKeys }` |
| `coverPath` | Kart görseli | `/academy/cinema/…` |
| `summary` | Vitrin özeti | Kısa cümle |
| `seo` | Varsa arama metası. Yoksa unvan ve ders sayısından düz cümle. | İsteğe bağlı |
| `vitrineOrder` | Vitrin sırası. `null` ise rafta görünmez. | `7` |
| `nativeListed` | Mobil listede durur | `true` / `false` |
| `passportListed` | İlan kapısı ve pasaport bu kodu bilir | `true` / `false` |
| `seedRanks` | `globalRank`, `localRank` | Sıra puanı |

Türetilen ve bir daha yazılmayan kimlikler:

- Kurs satır kimliği: `ac_<slug>`
- Katalog birimi: `course:<slug>`
- Fiyat satır kimliği: `cat_academy_course_<slug>`
- Sınav kimliği: `exam_<slug>`
- Ücretsiz önizleme: `lessonKeys` dizisinin ilk elemanı. Dizi boşsa önizleme kapalı.
- Mühür listesi: `lessonKeys` dolu olan kartlar. İkinci dizi yok.
- Ders sayısı: `lessonKeys.length`

`voice` yalnız ağız kimliğidir. Ses parmak izi, tempo ve sunucu cümleleri `instructors.ts` içinde kalır. Kural yerinde durur: bir eğitim kodu bir ses. Ders bazlı ses haritası açılmaz.

### 5.3 Kartta durmayanlar

Bunlar ikinci ev olursa defter şişer ve anayasa hizası bozulur.

| Konu | Evi | Neden |
| --- | --- | --- |
| Fırın modeli | `lib/kernel/ai/model-roles.ts` | Kilitli harita SOP belgesindedir. Defter model adı taşımaz. |
| Beş katman mühür kapısı | `lib/academy/production-standard.ts` | Süre, katman ve `--seal` kuralı kurs kartı değildir. |
| Konuşma temposu | `lib/academy/instructors.ts` | Kurs kartı ağzı seçer. Tempo bütün stüdyonundur. |
| Canlı fiyat | `PriceCatalogEntry` | Tohum yumuşak başlangıçtır. Süper Admin satırı ezilmez. |
| Ders metni, slayt, sınav cümlesi | Müfredat ve havuz dosyaları | İçerik kartın alanı değildir. |
| `is_published` çalışma değeri | `academy_courses` satırı | Aç/kapa veritabanındadır. Kart yalnız ilk tohum niyetini taşır. |

### 5.4 Diğer modüller kartı nasıl okur

Eski fonksiyon adları kalır. Gövde karttan okur. Çağıran dosyalar ilk turda yer değiştirmez.

| Bugünkü sembol | Karttan türetilen kural |
| --- | --- |
| `ACADEMY_CANON_SKU_SLUGS`, `ACADEMY_COURSE_TITLES` | `canon === true` kartlar |
| `ACADEMY_STOREFRONT_EXTRA_TITLES` | `canon === false` ve unvanı olan kart |
| `CURRICULUM_LESSON_KEYS_BY_SLUG` | `lessonKeys` |
| `ACADEMY_VITRINE_SHELL_SKU_SLUGS` | `vitrineOrder` dolu kartlar, sırayla |
| `ACADEMY_LICENSE_SALE_SLUGS` | `vitrineOrder` dolu ve `lessonKeys` dolu kartlar |
| `ACADEMY_*_PUBLIC_RELEASE_OPEN` | Kalkar. Yerine veritabanı `is_published` gelir. Geçiş bitene kadar karttaki geçici `releaseOpen` aynı işi görür. |
| `ACADEMY_INSTRUCTOR_VOICE_BY_SLUG` ve OFF-201 özel kol | `voice` |
| `academyLessonWarmupVeoAssetKey` | `warmup` |
| `ACADEMY_CATALOG_PRICE_MINOR`, `OFF_201_LAUNCH_PRICE_MINOR` | `priceSeedMinor` |
| `ACADEMY_COURSE_LEVEL_BY_SLUG` | `level` |
| `MODULE_CODE_BY_SLUG` | `code` |
| `SEED_META` | Slug’dan üretilen kimlikler ve `seedRanks` |
| `ACADEMY_CATALOG_SUMMARIES` | `summary` |
| `DRON_COURSE_SLUGS` | `nativeListed` |
| `ACADEMY_SKU_SLUG_BY_CODE` | `passportListed` |
| SEO objeleri | `seo`, yoksa unvan + ders sayısı |
| `retired-storefront` canlı kümesi | `vitrineOrder` dolu slug’lar. Onların dışında kalan kanon slug 301 adayıdır. |

Satış fonksiyonu `academyCourseSaleOpen` yerinde kalır. Okuduğu liste karttır. Disk mührü aynı kapıdır.

---

## 6. Yedinci eğitim: tek obje nereye yeter

Hedef cümle: `06_n8n_automation` canlıya çıkarken kimlik listelerine elle satır eklenmez.

Yeterli olan iş, karta tek objedir. Obje şunları söyler: slug, kod, unvan, seviye, katman, tohum fiyat, ağız, ders anahtarları, ısınma grubu, kapak yolu, özet, vitrin sırası, mobil ve pasaport bayrağı.

Bu obje şu dosyalardaki elle satırı gereksiz kılar: kanon unvan (zaten var, kart onu yutar), sınav yolu, vitrin sırası, satış listesi, ses haritası, ısınma listesi, fiyat tohumu, seviye, modül kodu, tohum kimliği, özet, mobil dizi, pasaport kodu, SEO yedeği.

Yeterli olmayan iş, içeriktir. Obje şunların yerine geçmez:

1. Ders metin dosyası (`lib/academy/curricula/n8n/` veya mevcut taslak evi).
2. Sınav havuzu dosyası ve `exam-pools.ts` içindeki tek bağ satırı. Bağ, dosya adı sözleşmesiyle de kalkabilir: `exam-pools/<slug>.ts` varsa havuz odur.
3. Konuşma metni ve beş katman fırını. Mühür kapısı içeriği karttan kabul etmez.
4. `public` altındaki ısınma kaseti ve kapak dosyası. Kart yolu söyler. Dosyayı üretmez.
5. İlk veritabanı satırı. Bir kez yazılır. Sonraki aç/kapa SQL değildir. Bölüm 8.

«Yalnızca bu dosyaya tek satır» cümlesi kimlik ve kapı için doğrudur. Fırın için doğru değildir. Fırın zaten beş katman ve mühür kapısı ister. O kapı bu sadeleştirmede yer değiştirmez.

---

## 7. SQL sıra kilidi

### 7.1 Bugün

`listSqlSealFiles` klasörü okur, `.sql` süzgeçler, ada göre sıralar. `EXPECTED_SQL` aynı adların elle yazılmış ikizidir. On dört adet. Sıra, dosya adının başındaki `YYYYMMDDHHMMSS` damgasıdır. Alfabetik sıra ile zaman sırası aynı kapıya çıkar.

İkiz liste şunu yakalar: klasöre fazla dosya düşmesi, adın değişmesi, sıranın bozulması. Bedeli şudur: her yeni SQL’de hem dosya hem dizi güncellenir. Unutulursa apply durur.

Prisma tarafında `EXPECTED_PRISMA_MIGRATIONS` aynı ikiz desendedir. Bu belgenin kilidi SQL’dir. Prisma ikizi aynı yöntemle, ayrı bir adımda ele alınır.

### 7.2 Tasarım

Kaynak, klasördür. `EXPECTED_SQL` dizisi kalkar. Yerine şu üç kilit gelir.

1. Ad kalıbı. `supabase/migrations` altında yalnız `14 haneli damga + alt çizgi + küçük harf ve rakam + .sql` durur. Kalıba uymayan dosya apply’i durdurur.
2. Sıra, `listSqlSealFiles` çıktısıdır. İkinci diziyle karşılaştırma yoktur.
3. Anlam iğneleri yerinde kalır. `assertSqlSealPlanComplete` ve içindeki tablo/kolon kontrolleri dosya adından türemez. Onlar «bu SQL’in içinde şu hüküm var mı» der. Dosya listesiyle karıştırılmaz.

Yeni yayın SQL’i yazılmayacağı için (bölüm 8) bu listenin büyüme sebebi de azalır. Şema değişikliği yine bir dosyadır. Dosya klasöre düşünce sıra kendiliğinden doğar. Elle diziye ekleme kalkar.

Kayıp risk: biri yanlışlıkla `.sql` bırakırsa apply onu da görür. Kalıp kilidi ve pull request farkı bu riski görünür kılar. İkiz liste bu görünürlüğü ikinci bir yerde satın alıyordu. Git farkı tek yer olarak yeter.

Geçiş testi: türev liste, bugünkü on dört adla birebir aynıdır. Eşitlik yeşilken elle dizi silinir.

---

## 8. Süper Admin: Yayında / Pasif

### 8.1 En küçük dokunuş

Yeni tablo yok. Yeni SQL dosyası yok. Var olan satır güncellenir.

1. Komut: `setAcademyCoursePublished({ slug, published, reason })`.
2. Kapı: bugünkü `requireSuperAdmin`. Başka rol bu komutu çağırmaz.
3. Yazılan yer: `academy_courses.is_published`. İsteğe bağlı eşlik: `price_catalog_entries.is_active` aynı slug’ın `course:<slug>` satırında. Fiyat tutarına dokunulmaz. `updated_by` dolu satırın tutarı yerinde kalır.
4. Gerekçe: fiyat kararındaki gibi kısa bir neden satırı. Denetim izi fiyat defterinin yanına, aynı süper admin oturumuna yazılır.
5. Panel: admin katalog listesinde, kartın yanında tek anahtar. Açık yazısı «Yayında», kapalı yazısı «Pasif».

Satış yine `academyCourseSaleOpen` okur. Anahtar açılsa bile disk mührü yoksa satın alma kapalı kalır. Düğme eksik kursu satışa çıkarmaz. Düğme vitrin görünürlüğünü değiştirir. Mühür, parayı tutar.

### 8.2 Kod bayrağı neden kalkmalı

Yalnız veritabanını çevirmek yetmez. `academyProductionLineReleaseOpen` hâlâ `false` ise antre, oynatıcı ve site haritası kursu yok sayar. Tek tuşun işe yaraması için o bayraklar okunmaz olur. Yayın hükmü satırdan gelir.

Statik sayfa notu: `generateStaticParams` ve site haritası bugün derleme anındaki kod listesini okur. Anahtar veritabanına geçince bu iki yüzey istek anında «kartta var ve satır yayında» diye bakar. Aksi halde düğme basılır, sayfa bir sonraki deploy’a kadar 404 kalır. Bu, düğmenin parçasıdır. Ayrı bir proje değildir.

İlk satır hâlâ bir kez doğar. Karttaki tohum, kurs satırı yoksa insert eder. Sonraki aç ve kapa update’tir. EC-102’de görülen üç SQL dosyası bir daha yazılmaz.

OFF-201 fiyat yuvası (`off201-catalog-slot.ts`) bu işin fiyat kardeşidir. Yayın anahtarı onu kopyalamaz. Aynı süper admin oturumu, fiyat için mevcut formu, yayın için yeni anahtarı kullanır.

---

## 9. Sıfır risk geçiş

İlke: canlı `yetkin.ai` her adımda bugünkü vitrin, satış ve önizleme ile aynı cevap verir. Büyük yeniden yazım yok. Fonksiyon adları durur. Mühür kapısı ve model haritası durur.

| Sıra | Ne yapılır | Bitti sayılması | Canlı risk |
| --- | --- | --- | --- |
| 0 | Bu belge. Kod yok. | Dosya durur. | Yok |
| 1 | Kimlik kartı pakete eklenir. Değerler bugünkü tablolardan kopyalanır. Eski dosyalar kartı okuyup aynı sabitleri üretir. | Mevcut akademi testleri yeşil. Türetilen slug, ders anahtarı, fiyat ve ses bugünküle aynı. | Yok. Davranış değişmez. |
| 2 | `exam-path`, `pilot-sku` listeleri, fiyat, seviye, kod, tohum kimliği ve mobil dizi ince sarıcı olur. Elle diziler silinir. | Aynı testler. Özellikle vitrin, freemium, katalog tohumu, SEO site haritası. | Düşük. Sapma testte patlar, deploy’da değil. |
| 3 | Mobil liste `nativeListed` okur. Ürün kararı: dört kardeş mobil listeye girer mi, girmez mi. Karar karttaki bayraktır. | Rail vitrin testi, seçilen bayrakla aynı sırayı görür. | Düşük. Web’e değmez. |
| 4 | Yayın anahtarı. Kod bayrakları bir süre satırla birlikte okunur: ikisi de açıksa açık. Sonra bayrak kalkar, satır kalır. Statik antre ve site haritası satırı okur. | EC-102’yi pasife alıp geri açmak SQL’siz, vitrin ve satın alma aynı turda uyar. Mührü olmayan `06_` satışa çıkmaz. | Orta. Bu adım tek başına deploy edilir. Önce önizleme ortamında anahtar denenir. |
| 5 | `EXPECTED_SQL` kalkar. Klasör + ad kalıbı + anlam iğneleri kalır. | Türetilen on dört ad, silinen diziyle aynı. Apply dry-run aynı planı basar. | Düşük. Şema değişmez. |

Deploy kuralı: 1 ve 2 aynı sürümde gidebilir, çünkü dış cevap değişmez. 4 ayrı sürümde gider. 3, mobil sürümle gider. Web deploy’u mobil listeyi beklemez.

Geri alma: 1 ve 2 sarıcıdır. Eski sabitler git geçmişindedir. 4 için bayrak ile satır birlikte durduğu sürece bayrağa dönmek bir satırlık okuma değişimidir. 4 tamamlanıp bayrak silindikten sonra geri alma, satırı eski değere yazmaktır. SQL dosyası gerekmez.

Yapılmayacaklar:

- Mühürlü MP3, ısınma kaseti ve kapak yeniden üretilmez.
- `model-roles.ts` ve üretim anayasasındaki model haritası değişmez.
- `assertAcademyProductionSeal` gevşetilmez.
- Kanon on üç, tek seferde yedi canlı karta indirilmez. Kabuk kartlar defterde durur. `vitrineOrder: null` ve boş `lessonKeys` onların bugünkü «hazırlanıyor» halidir.
- Veritabanı kurs satırı silinmez. Pasif, satırı yerinde bırakır. Lisans ve sertifika durur.

---

## 10. İlk kod adımı başlarken kontrol listesi

Sıra 1’e geçilirken ajan şunları birebir kopyalar, yeniden yorumlamaz:

- Altı canlı ders yolu, `exam-path.ts` ile aynı sıra.
- OFF-201 kanon dışıdır. Unvanı «İleri Ofis Yapay Zekâ». Ağzı Kore. Tohum 129000 kuruş.
- Dört kardeşin kamu bayrağı bugün açıktır. Geçici `releaseOpen` onu taşır.
- Mobil bayrak bugün yalnız iki slug’da açıktır. Ürün kararı değişmeden dört kardeş mobilde açılmaz.
- Pasaport beş koddur. OFF-201 `passportListed: false` kalır.
- `06_`–`13_` tohum fiyatı ve unvanı kanon tablodaki sayıdır. Vitrin sırası yoktur.

Sapma bulunursa düzeltilen taraf eski dosyadaki sayı değildir. Kart, eski dosyaya eşitlenir. Eşitlik bozulursa sıra 2’ye geçilmez.

---

## 11. Karar

Tek kayıt defteri, ince sözleşme paketindeki kimlik kartıdır. Akademi ve mobil onu okur. İçerik, fiyatın canlı satırı, mühür kapısı ve model haritası kendi evinde kalır.

Yedinci eğitimin liste işi bir objedir. Fırın işi beş katmandır.

Yayın, süper admin oturumuyla `is_published` güncellemesidir. SQL sıra kilidi, klasörün kendisidir. İkisi de canlı vitrin sarıcı olarak eşitlendikten sonra açılır.
