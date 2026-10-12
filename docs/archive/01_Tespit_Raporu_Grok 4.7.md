# Tespit Raporu — yetkin.ai

| Alan | Değer |
|------|--------|
| Tarih | 9 Ekim 2026 |
| Kapsam | 1. aşama: kod ve belge denetimi |
| Yöntem | Aktif kaynak okuması ve dosya sayımı |
| Okunmayan | Canlı veritabanı satırları, Vercel ortam değişkenleri, `.env` dosyaları |
| Sonuç türü | Kodun bugünkü davranışı. Canlı oturum denenmedi. |

Bu rapor ürün kodunun ve `.system_docs` belgelerinin bugünkü halini ölçer. A katmanı (para, kimlik, mühür, dürüst kapı) gevşetilmez. Eleştiri B katmanına, sürece ve tekrarlayan dosyalara aittir.

---

## Özet hüküm

| Soru | Hüküm |
|------|--------|
| 6. sınıf çekirdek dersi var mı? | Evet. Beş kart, 105 konu. Metin, fırınlanmış ses anahtarı, kapak, konu testi ve SVG sahnesi kodda bağlı. |
| 6. sınıf satın alınabiliyor mu? | Hayır. Kasa varsayılan kapalı. PayTR zinciri kurulu; kapı açılmadan iframe ve tahsilat yok. |
| `yapinet360@gmail.com` admin mi? | Kodda yerleşik kutu. Doğrulanmış e-posta ile Super Admin. Veritabanında rol kolonu yok. Canlı satır bu oturumda okunmadı. |
| Mimari «ayrı dron sürüsü» mü? | Hayır. Yaşayan ad: Pragmatik Monolit + `@yetkin/kernel` + tek native istemci (`apps/rail-is`). |
| Bilgi tek yerde mi? | Çekirdek kapılar tek evde. Rapor yığını, arşiv ve seçmeli İngilizce ikinci kopyası tekilliği bozuyor. |

---

## 1. Junior modülü ve 6. sınıf

### 1.1 Oda nerede duruyor

Junior, Akademi’nin iç kanalı değildir. Kayıt `lib/dronlar/kayit.ts` içindedir: id `junior`, yol `/junior`, kamu dörtlüsüne yazılmaz, `passportListed` kapalıdır (`packages/kernel` kurs defteri Junior kartını reddeder).

Kapı tek fonksiyondadır: `canEnterJunior` (`lib/kernel/security/junior-gate.ts`).

| Niyet | Kim girer |
|-------|-----------|
| Vitrin `/junior` | Herkes |
| Dersin ilk konusu | Herkes |
| İkinci konu, anlatış, konu testi | Aktif yıllık paket, ya da denetim aktörü |
| Çocuk profili | `DRON_JUNIOR_OPEN` açıkken oturumlu veli, ya da denetim aktörü |
| Kasa | `JUNIOR_CHECKOUT_OPEN` açıkken oturumlu veli. Denetim hesabı burada 403 alır. |

`DRON_JUNIOR_OPEN` ders kilidini açmaz. Aynı isim oda bayrağında da durur. Boşken oda `kapali: false` olduğu için vitrin açık kalır. `0` / `closed` yazılırsa `DronBayrakları.isKapali("junior")` odayı kapatır. İki iş, tek env adı. Bu, sonraki operatörün kapıyı yanlış okumasına yol açar.

Sınıf seçici 5–12 aralığını bilir (`JUNIOR_GRADE_MIN` / `JUNIOR_GRADE_MAX`). Raf fonksiyonu seçilen sınıfı yok sayar ve her zaman 6. sınıf metnini basar (`juniorShelvesForGrade`). Başka sınıfın dersi yoktur. Abonelikte bir kez sınıf değiştirme hakkı vardır; içerik değişmez.

### 1.2 Çekirdek envanter

Pilot sınıf sabiti `JUNIOR_PILOT_GRADE = 6`. Kartlar:

| Kod | Raf | Konu | Konu testi | Fırın ses anahtarı |
|-----|-----|------|------------|--------------------|
| JR-06-MAT | Matematik | 25 | 25 | 25 |
| JR-06-FEN | Fen Bilimleri | 20 | 20 | 20 |
| JR-06-TUR | Türkçe | 20 | 20 | 20 |
| JR-06-ING-ANA | İngilizce | 20 | 20 | 20 |
| JR-06-SOS | Sosyal Bilgiler | 20 | 20 | 20 |
| **Toplam** | **5 kart** | **105** | **105** | **105** |

Disk sayımı (içerik okunmadı, yalnız dosya adı ve boyut):

| Katman | Disk |
|--------|------|
| Ses | `public/media/junior/audio` — 106 MP3, yaklaşık 1,66 GB. 105 ders + `bgm-light-learning.mp3` |
| Isınma | 5 kaset, ders başına değil kart başına: mat, fen, türkçe, ing_main, sosyal. Yaklaşık 25 MB |
| Kapak | 105 JPG, yaklaşık 21 MB |
| Fon | Tek paylaşılan yatak. Ders başına müzik dosyası yok |

Öğretmen sesi branş bazındadır (`JUNIOR_BRANCH_TEACHERS`): Selim, Deniz, Elif, Selin, Murat. Yetişkin «1 Eğitim Kodu = 1 Ses» kuralının yerine yazılmaz. Ev `lib/junior/voice.ts`.

### 1.3 Eksik içerik

**Konu testi incedir.** Her çekirdek pakette 3 soru vardır. Mühür eşiği `JUNIOR_QUIZ_MIN_ITEMS = 3` olduğu için bu paketler «hazır» sayılır. On soruluk arşiv yorumu kodda durur; eşik üçtür. Çocuk, konuda üç soru görür.

**Seçmeli raf taslaktır.** Altı kart, her birinde iki konu (12 konu), `band: "draft"`:

| Slug | Başlık |
|------|--------|
| `jr_06_ing` | Seçmeli İngilizce (Pratik & Konuşma) |
| `jr_06_alm` | Almanca |
| `jr_06_fra` | Fransızca |
| `jr_06_siyer` | Siyer-i Nebi |
| `jr_06_kod` | Bilgisayar Bilimi / Kodlama |
| `jr_06_arp` | Seçmeli Arapça |

Bu konularda fırın ses anahtarı yok, ısınma kaseti yok, `lib/junior/quiz` paketi yok, kapak JPG yok. Mühür `audio`, `warmup`, `quiz` kapılarından düşer. Kart «Hazırlık Aşamasında» rozeti taşır. Çekirdek kartla aynı tam ders sayılmaz. Bu, Anayasa B6 ile uyumludur.

**İngilizce iki kez duruyor.** Çekirdek `jr_06_ing_main` (20 konu, mühürlü ses) ile seçmeli `jr_06_ing` (2 taslak) ayrı ürünlerdir. Vitrinde ikisi de «İngilizce» ailesindendir. Alıcı için tek ders değildir.

**Din Kültürü ve Ahlak Bilgisi çekirdek kart değildir.** Yalnız seçmeli «Siyer-i Nebi» vardır. 5, 7–12. sınıf metni yoktur.

**Junior mühür, disk bakmaz.** `juniorProductionSealGaps` metin süresi, ses anahtar listesi, ısınma yolu, en az üç soru ve sahne kimliğini bellekte kontrol eder. MP3’ün diskte durup durmadığını `stat` etmez. Akademi satış kapısı diski okur. Junior’da liste ile dosya ayrışırsa kart yine «taze» görünebilir. Bugünkü sayımda 105 anahtar ile 105 ders MP3’ü örtüşüyor; `bgm` ayrı dosyadır.

**Beş yetişkin katman Junior’da birebir değildir.** Yetişkin sıra: metin, ses, yerel ısınma videosu, görsel üretim, müzik. Junior sırası: metin, ses, kart başına ısınma, üç soru, SVG sahne. Görsel, `IMAGE_GEN` karesi değil vektör sahnedir. Müzik tek yataktır. Pedagoji Ek-J bunu yetişkin kapısından ayırır. `AGENTS.md` cümlesi («hiçbir eğitim videosu beş katmandan biri eksikken mühürlenemez») Junior’ı da kapsar gibi okunur. İki standart yan yana duruyor; hangisinin hangi odaya ait olduğu kapak cümlesinde ayrılmamış.

### 1.4 Veritabanı ve API

Şema `prisma/schema/junior.prisma`:

| Tablo | İş |
|-------|-----|
| `junior_profiles` | Veli hesabı altındaki çocuk. Ayrı çocuk e-postası yok |
| `junior_guardian_consents` | Aydınlatma kanıtı. Metin güncellenmez, yeni satır açılır |
| `junior_progress` | speak / write / practice / quiz notu. Ses kolonu yok |
| `junior_xp` | Oyun puanı ve rozet. Cüzdana bağlı değil |
| `junior_subscriptions` | Yıllık paket. `applied_merchant_oids` aynı siparişi ikinci kez uzatmaz |

`users` tablosunda Junior rolü yoktur. Paket, veli `user_id` satırına yazılır.

Web API:

| Yol | İş |
|-----|-----|
| `GET /api/junior/lessons/[key]` | Tek okuma hop’u. Kart, kilit, ses yolu, sahne, kapak. Anlatı metni yok |
| `POST /api/junior-pilot/checkout` | Kasa |
| `POST /api/junior-pilot/profiles` | Çocuk profili |
| `POST /api/junior-pilot/electives` | En fazla 3 seçmeli |
| `POST /api/junior-pilot/tell` | Anlatış |
| `POST /api/junior-pilot/practice` | Pekiştirme |
| `POST /api/junior-pilot/quiz` | Konu testi. Önce anlatış geçer puanı |
| `POST /api/junior-pilot/grade` | Sınıf değiştirme hakkı |

Native sözleşme `junior-lesson-read` hop’unu yayınlar: dış yol `/api/v1/junior/lessons/{key}`, kanonik yol `/api/junior/lessons/{key}`. Kenar, sicildeki v1 yolunu kanonik handler’a çevirir. Dron bu hop ile kart okuyabilir. Dinle-Anlat, test ve kasa v1 sicilinde yoktur; web BFF’tedir. Anayasa B1, yazmanın sessizce yalnız web’de kalmamasını ister. Junior’ın ücretli yazmaları bugün o cümleye uymaz. Web odası çalışır. Native istemci dersi oynatamaz.

Arayüz: `app/junior/page.tsx` rafı basar, `app/junior/ders/[lessonKey]/page.tsx` oynatıcıyı açar, `app/junior/checkout/page.tsx` kasayı açar. Bileşenler `components/junior/` altındadır (oda, zincir, vektör oynatıcı, anlatış, konu testi, ödeme formu).

### 1.5 PayTR ve 6. sınıf satın alma

Zincir kodda uçtan uca bağlıdır. Satış kapısı kapalı olduğu için bugün tahsilat yoktur.

Akış, kapı açıldığında:

1. Fiyat `price_catalog_entries` satırı `cat_junior_yearly` (`module_key=junior`, `unit_key=yearly`). Kod tutar uydurmaz. Satır yoksa 503: «Liste fiyatı katalogda yok.»
2. Soğuk tohum `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` içindedir: 5.499,00 TL (`amount_minor = 549900`). Super Admin `updated_by` doldurduysa tohum tutarı ezmez. Canlı katalog satırı bu oturumda okunmadı.
3. `POST /api/junior-pilot/checkout` oturum ister. Kasa kilitliyse 503. Denetim aktörüyse 403: «Denetim hesabı ödeme kaydı yazmaz.»
4. Üç onay (mesafeli satış, anında ifa, veli aydınlatması) ve fatura bilgisi tamamlanmadan PayTR çağrılmaz.
5. Sipariş `payment_orders` tablosuna `purpose = junior-license:yearly` diye yazılır. Düz cüzdan yüklemesi paket açmaz.
6. PayTR get-token iframe döner. Kart numarası platformda tutulmaz. `card_last4` iframe vermezse `0000` kalır.
7. CLEARED olunca `fulfillJuniorLicenseFromClearedOrder` yıllık hakkı `junior_subscriptions` satırına yazar. Aynı `merchant_oid` süreyi ikinci kez uzatmaz. Bitmemiş süreye bir yıl ekler.
8. Köprü iki kapıdan çağrılır: PayTR webhook rotası ve Inngest mutabakatı. İkisi de `registerPaytrJuniorLicenseHook()` ile kancayı kaydeder.

Satışın açılması için hepsi birden gerekir (`juniorPaytrSaleGate`):

- `JUNIOR_CHECKOUT_OPEN` = `1` / `true` / `open`
- Aydınlatma metni kullanılabilir (`isJuniorNoticeUsable`)
- Çalışma kipi `live` ve mağaza üçlüsü deneme / `000000` / `sandbox` değil

Üretimde sandbox `refused` kalır. Deneme mağaza gerçek satışı açmaz. Geliştirmede sandbox, get-token iframe açabilir; üretim satış sayılmaz.

Ekran dürüsttür. Kasa kilitliyken `/junior/checkout` «Ödeme hattı kapalı» der ve iframe basmaz. Misafir «Ödeme için veli girişi gerekir» görür.

**Hüküm:** Entegrasyon 6. sınıf satın alma akışına doğru bağlanmıştır. Çalışır satış değildir. Kapı, hukuk ve canlı mağaza üçlüsü kapanmadan tahsilat yok. Super Admin bu kasadan paket alamaz; kilitli konuyu denetim yoluyla izler, abonelik satırı yazmaz.

---

## 2. Super Admin — `yapinet360@gmail.com`

### 2.1 Yetki modeli

Tek kapı `isSuperAdminActor` (`lib/kernel/auth/super-admin.ts`). `users` tablosunda `role` kolonu yoktur. Admin, veritabanı rolü değil, oturum + e-posta doğrulaması + kod kuralıdır.

| Kural | Davranış |
|-------|----------|
| E-posta doğrulanmamış | Admin yoktur |
| `yetkin.vision@gmail.com` | Vatandaş test hesabı. Env’e yazılsa da admin olmaz |
| Yerleşik kutu `yapinet360@gmail.com` ve `email_confirmed_at` dolu | Admin. `SUPER_ADMIN_USER_ID` boş olsa da, UUID başka bir kişiye işaret etse de bu kutu kapanmaz |
| Başka adres, üretim | Hem `CANONICAL_SUPER_ADMIN_EMAIL` hem `SUPER_ADMIN_USER_ID` oturumla eşleşmeli. Biri boşsa o adres admin değildir |
| Başka adres, geliştirme | Doğrulanmış kanonik e-posta veya UUID yeter |

Sayfa kapısı `resolveSuperAdminAccess`. API kapısı `auth = "admin"` ve aynı fonksiyon. Kenar, JWT + bu kapıyı okur.

### 2.2 Açık olan yüzeyler

Doğrulanmış yerleşik kutu şunlara girer:

- `/admin` — katalog, fiyat kararı, yayın, huni
- `GET/PATCH` katalog ve yayın API’leri (`/api/.../admin/catalog`, `publish`, `funnel`)
- Yetişkin Akademi oynatıcısı satın alma satırı aranmadan (`hasAcademyPlayerAccess`)
- Junior’da kilitli konu, anlatış ve konu testi (denetim yolu, `via: "audit"`)
- Junior vitrininde denetim aktörüne bütün seçmeli kartlar açık gösterilir
- Freelancer anlaşmazlık hakemliği ve bazı iş kapıları, oda kilitliyken kamu 410’dur

Müfredat revizyon kuyruğu sayfası durur ve her metoda 410 döner. Motor arşivdedir. Bu bir açık değildir; dürüst kapalı kapıdır.

### 2.3 Kısıtlar

- Junior ders metnini panelden yazamaz. Metin `lib/junior/content` kod dosyasıdır.
- Junior kasasını açamaz ve kendi adına `junior_subscriptions` yazamaz (403).
- Fiyat, katalog satırından gelir. Kod sabiti satış fiyatı değildir.
- Canlıda bu e-postanın Supabase kullanıcısı, `email_confirmed_at` değeri ve `SUPER_ADMIN_USER_ID` eşleşmesi bu oturumda ölçülmedi.

### 2.4 Açıklık

Yerleşik kutu, üretimde UUID’ye kilitlenmez. `SUPER_ADMIN_USER_ID` başka bir kişiye işaret etse bile doğrulanmış `yapinet360@gmail.com` admin kalır. İkinci bir adres env çiftiyle ayrıca admin olabilir. Sonuç: tek hesap modeli değil, «yerleşik kutu her zaman» artı «isteğe bağlı ikinci çift».

Bu, kasıtlı bir kurtarma kapısıdır. Bedeli şudur: o posta kutusunun oturumu ele geçirilirse katalog, fiyat ve yetişkin oynatıcı aynı kapıdan açılır. Daraltma, A3 kimlik ilkesini bozmadan yapılabilir: üretimde yerleşik kutu da `SUPER_ADMIN_USER_ID` ile eşleşsin, kutu yalnız env boşken kurtarma olsun. Bu değişiklik bu raporda uygulanmadı.

---

## 3. Atıl dosya ve tek kaynak

### 3.1 Hacim

| Yer | Ölçü | Hüküm |
|-----|------|--------|
| `archived/` | 268 dosya, yaklaşık 139 MB | Donmuş odalar. Aktif ürün değildir |
| Bunun 137 MB’si | `archived/academy-audio-revoked/` (8 dosya) | İptal edilmiş Akademi sesi. Canlı oynatıcı bunu okumaz |
| `archived/lib/junior` | 12 dosya (engine, prisma-store, age-gate, meb-catalog) | Eski Junior motoru. Canlı ev `lib/junior` |
| `archived/app/junior` + `archived/components/junior` | 10 dosya | Eski ebeveyn davet ekranları |
| `yetkin_muze/` | Yok | |
| `docs/` | 16 markdown, yaklaşık 0,3 MB | Küçük boyut, yüksek tekrar |

Medya ağırlığı ayrıdır ve atıl değildir: Junior sesi yaklaşık 1,66 GB. Ürün dosyasıdır. Ajan taramasının dışında kalması doğrudur. Git ve yedek maliyeti ayrı bir karardır.

### 3.2 Tek kaynak nerede sağlam

| Bilgi | Tek ev |
|-------|--------|
| Super Admin | `lib/kernel/auth/super-admin.ts` |
| Junior kapı | `lib/kernel/security/junior-gate.ts` |
| 6. sınıf katalog | `lib/junior/catalog.ts` |
| Junior yıllık fiyat | `price_catalog_entries` / `cat_junior_yearly` |
| v1 hop kimliği | `packages/kernel` `RAIL_V1_HOPS_META` |
| Model kimliği | `lib/kernel/ai/model-roles.ts` |
| Oda kaydı | `lib/dronlar/kayit.ts` |
| Konu başlığı yüzü | Senaryo. `lib/junior/lesson-face.ts` elle yazılmaz; `scripts/sync-junior-lesson-face.ts` üretir |

### 3.3 Tek kaynağı bozan yapılar

1. **`docs/` içinde aynı işin birçok raporu.** `1.TESPIT_RAPORU.md`, `260930a`, `261004a`, `261006a`, `JUNIOR_6_SINIF_TESPIT_RAPORU.md`, `3.junior_6_sinif_tespit_raporu.md` ve tedavi eşleri. Tarih ve hüküm birbirine karışır. Günlük rapor serbesttir; «son tespit» diye okunan dosya tek olmalıdır. Bu dosya (`docs/tespit_raporu.md`) o yığının üstüne bir tane daha ekler. Sonraki turda eskisi arşiv notuna indirilmeli, yeni hüküm buraya yazılmalıdır.
2. **İptal ses arşivi (137 MB)** depoda duruyor. Oynatıcı yolu değildir.
3. **Eski Junior motoru** `archived/lib/junior` altında duruyor. Canlı import yolu değildir. Yeni gelen, `engine.ts` sandığı dosyayı oradan okursa yanlış odayı tamir eder.
4. **İngilizce çift kart** (çekirdek + seçmeli taslak).
5. **Sınıf alanı ile raf.** Profil `grade` tutar, raf her zaman 6 basar.
6. **`DRON_JUNIOR_OPEN` iki anlama geliyor:** profil kapısı ve oda bayrağı.
7. **Kod içi «amiral» kelimesi** (`sahipEkip: "amiral"`, bazı test adları). Mimari adın kendisi değildir; okuyanı eski sürü diline çeker.

Boş Junior iskeleti bu taramada çıkmadı. Çekirdek konu dosyaları dolu. Seçmeli ikişer konu taslak bandındadır; boş dosya değil, mühürsüz derstir.

---

## 4. Kılavuz belgeler ve mimari

### 4.1 Belgeler ne diyor

Yaşayan mimari ad Anayasa B1’dedir:

**Pragmatik Monolit + İnce Sözleşme Paketi (`@yetkin/kernel`) + Tek Native İstemci.**

Eski anlatım («Amiral Gemi + Sürü Dron», «Core + Micro-Apps / Shared Kernel») B1’de takma ad olarak durur. Karşılık tablosu doğrudur:

| Eski ad | Kodun karşılığı |
|---------|-----------------|
| Amiral Gemi | Bu Next.js gövdesi (`app/`, `lib/`) |
| Sürü Dron | `lib/dronlar/kayit.ts` satırı + bayrak + yol. Ayrı deploy değil |
| Shared Kernel | `packages/kernel` (`@yetkin/kernel`). Prisma ve Supabase taşımaz |
| Tek native istemci | `apps/rail-is`. Aynı `/api/v1` hop sicili |

`MANIFESTO.md` ve `PEDAGOJI.md` bu adı tekrar bir ürün mimarisi olarak yazmaz. `.cursorrules` aynı hizayı ajanlara zorunlu kılar. Model haritası `.system_docs/AKADEMI_URETIM_ANAYASASI.md` içindedir; bu rapor o haritayı değiştirmez.

### 4.2 Kurgu doğru mu

Evet, monolit olarak doğru kurulmuş. Ayrı veritabanı, ayrı kimlik ve ayrı Junior servisi yoktur. Kernel dikey odayı import etmez; Junior lisansı bir kanca ile bağlanır. Para `amountMinor` ve katalog satırındadır. Kilitli yüzey 410/503 döner, sahte yeşil basmaz.

Eksik olan «sürü» değil, hop tamlığıdır. B1, native’in tüketeceği yazmayı önce v1 siciline ister. Junior’ın ücretli yazmaları (`tell`, `quiz`, `checkout`, profil) sicilde yoktur. Okuma hop’u kart döner, dersi oynatmaz. Bu, bozuk bir mikroservis değildir. Web’e sıkışmış bir odadır. Native istemciye Junior sözü verilmiş gibi hop satırı durur; oynatıcı sözü verilmemiştir.

Freelancer odası kayıtta kapalıdır ve kamu 410 döner. Bu, B2 ile uyumludur.

### 4.3 Dokunulmazlık ezberini bozan eleştiri

A katmanı (A1–A5) yerinde kalsın: tamsayı para, tek defter, PayTR, RLS, sunucu puanı, sahte bakiye yasağı. Bunlar «ezber» değil, yaptırım sınırıdır.

B katmanı kendi cümlesiyle yaşayan ilkedir. Şu noktalar güncellenmeli:

1. **B6 «para akışı kapalıdır» cümlesi, kodda bir bayraktır.** Kalıcı yasak gibi okunur. Yaşayan cümle şöyle olmalıdır: kasa varsayılan kapalıdır; açılış `JUNIOR_CHECKOUT_OPEN` + kullanılabilir aydınlatma + canlı mağaza üçlüsüdür; denetim hesabı tahsilat yazmaz. Sayı ve env adı belgede ikinci kez tablolaşmasın; ev `junior-gate.ts` ve `lib/junior/paytr.ts` kalsın.
2. **`AGENTS.md` beş katman cümlesi oda ayrımı yapmıyor.** Yetişkin kapı `assertAcademyProductionSeal`. Junior kapı `assertJuniorProductionSeal`. İkisi aynı cümlede erirse Junior, olmayan `IMAGE_GEN` karesi yüzünden yanlış mühürlenir ya da yetişkin kapı gevşetilir. Kapak cümlesi «yetişkin Akademi videosu» demelidir. Junior standardı Pedagoji Ek-J ve `lib/junior/production-seal.ts` olarak kalsın.
3. **B4 ücretsiz önizleme evi `exam-path.ts` der.** Junior’ın ücretsiz konusu `juniorFreeLessonKeys` (her kartın ilk konusu). İkinci ev gerekçelidir çünkü Junior Akademi defterinde değildir. B4 tablosuna bir satır eklenmeli: Junior önizlemesi `lib/junior/catalog.ts`. Sayı yazılmasın.
4. **B6 «ikinci konu kapalı betaya bağlı» cümlesi kapıyı eksik anlatır.** İkinci konuyu yıllık paket de açar. Kapalı beta ve Super Admin denetim yoludur. Cümle, paket ile denetimi ayırmalıdır.
5. **Eski ad dipnotu hâlâ soru üretiyor.** Karşılık tablosu bir kez B1’de kalsın. Yeni ajan istemi, manifesto ve rapor başlığı o adı planın adı yapmasın. Kodda `sahipEkip: "amiral"` düz metne çekilebilir (`gövde`). Bu, mimariyi değiştirmez.
6. **`.cursorrules` dışlama listesi doğru çalışıyor** ve ajan bağlamını şişirmiyor. Eksik olan, `archived/academy-audio-revoked` için bir «bu bayt ürün değildir» notudur. Listeye path eklemek tarama yasağını zaten `archived/` ile karşılar. Asıl iş, o 137 MB’nin depodan çıkarılmasıdır.
7. **Anayasa tarihi 16 Ağustos 2026, Manifesto 17 Ağustos 2026.** B6 ve Ek-J sonradan işlendi. Tarih, belgenin doğumudur; «içerik bu tarihte dondu» diye okunursa operatör yanılır. Kapakta «son ilke gözden geçirmesi» ayrı bir satır olmalıdır. Bu rapor o tarihi kendiliğinden değiştirmez.

Model tablosu ve beş yetişkin aşama kapısı silinmez. Uyumsuzluk varsa düzelen taraf koddur. Bu turda model kimliği sapması aranmadı; harita dokunulmadı.

---

## 5. Sen olsaydın ne yapardın

### 5.1 Hüküm

Bu projeyi hızlandırmak için yeni bir servis, yeni bir veritabanı ve yeni bir «dron uygulaması» açmam. Monolit doğru. Yavaşlık, oda sayısından değil, aynı kararın birçok dosyada ve birçok raporda yaşamasından geliyor.

Yapacağım üç şey:

1. **6. sınıfı satılabilir tek ürün yaparım.** Beş çekirdek kart kalsın. Seçmeli raf ve 7–12. sınıf bu turda yazılmaz. İngilizce seçmeli taslak, çekirdek İngilizce dururken vitrinden çekilir. Üç soru, satış vaadi «konu testi» ise on soruya çıkar ya da vaat «üç soruluk kontrol» diye dürüstleştirilir. İkisini birden söylemeyi bırakırım.
2. **Kasayı hukuk bitmeden açmam.** Zincir hazır. Açılış bir kod haftası değil, üç koşulun birlikte imzasıdır: aydınlatma, canlı PayTR, `JUNIOR_CHECKOUT_OPEN`. İmza Super Admin’dedir. Denetim kutusu alıcı olmaz; deneme velisi ayrı hesaptır.
3. **Rapor ve arşiv bütçesi koyarım.** Yeni tespit, tek dosyaya yazılır. `archived/academy-audio-revoked` depodan çıkar. Eski Junior motoruna dokunulmaz; silme kararı ayrı ve bilinçli olur.

Native Junior uygulamasını şimdi yazmam. Web oda bitmeden ikinci istemci, B1’deki «önce hop» kuralını hop iskeletiyle kandırır. Hop satırı kart içindir. Oynatıcı sözü verilene kadar dron menüsünde Junior dersi vaat edilmez.

### 5.2 Bir sonraki aşama — tam olarak bu

Aşama 2 bir tedavi turudur. Kapsamı şudur:

1. Super Admin kararı, yazılmadan kod yok: satış vaadi «beş çekirdek ders» mi, «okul dersleri» mi? Din Kültürü çekirdek mi, seçmeli mi? Üç soru mu, on soru mu?
2. Karar «beş çekirdek» ise seçmeli İngilizce kartı vitrin cümlesinden ayrılır; taslak raf «hazırlık» olarak kalır, çekirdek gibi fiyat vaadi taşımaz.
3. Çekirdek 105 konuda mühür, disk dosyasıyla bir kez doğrulanır (ses anahtarı var ama dosya yok durumu). Eksik dosya varsa o konu taze sayılmaz.
4. Kasa açılmaz. Açılış listesi yazılır: aydınlatma sürümü, katalog `updated_by`, canlı üçlü, deneme velisi (Super Admin değil), bir CLEARED siparişin tek abonelik yazdığı.
5. `docs/` yığınında «güncel tespit budur» işaretlenir. Bu dosya o işarettir. Eski raporlar tarihli not olarak kalır, yeni iş onlardan türetilmez.
6. `DRON_JUNIOR_OPEN` adı iki işten birine indirilir: ya yalnız profil, ya yalnız oda. İkisi aynı env’de durmaz.

Bu aşamada 7. sınıf metni, native oynatıcı ve freelancer açılışı yoktur.

### 5.3 Gelecek master planı

**0–6 hafta — 6. sınıf satılır.** Beş kart mühür + disk. Konu testi kararı uygulanır. Kasa üç koşulla açılır. Bir deneme velisi uçtan uca öder, paket bir kez yazılır, aynı sipariş ikinci kez süreyi uzatmaz. Super Admin izler, satın almaz.

**6–16 hafta — aynı oda, ikinci sınıf yok.** Seçmeli kotanın içi doldurulur: en fazla üç kart, her biri Junior mührünü geçer (ses, ısınma ya da bilinçli «ısınmasız seçmeli» kuralı, soru, sahne). Siyer, kod, dil kartları okul vaadi değil seçmeli vaat olarak adlandırılır. Sınıf seçici, metni olmayan sınıfı «yakında» diye kilitler; hak, içerik yokken harcanmaz.

**4–8 ay — 7. sınıf, kopya değil şablon.** 6. sınıfın 105 dosyalık deseni bir üretici sözleşmeye bağlanır: konu dosyası, yüz senkronu, ses, kapak, soru. Elle 105 import satırı ikinci kez yazılmaz. Ücretsiz konu yine kartın ilki olur. Fiyat hâlâ tek katalog satırı olabilir (yıllık oda) ya da sınıf ek SKU’su açılır; karar A1’e uyar, koda gömülü tutar olmaz.

**8–14 ay — native, ancak hop ile.** Dinle-Anlat ve konu testi v1 yazma hop’una çıkar. Web ve `apps/rail-is` aynı handler’ı çağırır. O güne kadar native yalnız kart okur. Ayrı Junior backend açılmaz.

**14–24 ay — yetişkin çizgi ayrı kalır.** Akademi beş katman ve «1 Eğitim Kodu = 1 Ses» yetişkin ofis dersindedir. Junior okul dersi kendi ses haritasında kalır. Kariyer vizesi Junior notunu yutmaz. Freelancer, B5 checklist’i (lisanslı split, alt satıcı, hop, kapalı test, bayrak) bitmeden kamu yüzü açmaz.

**Sürekli — tek defter.** Para `amountMinor`. Admin tek fonksiyon. Kapı tek fonksiyon. Yeni tespit tek dosya. İptal medya depoda yaşamaz. A katmanı PR ile gevşetilmez.

---

## Ölçülmeyenler

- Canlı `users` satırında `yapinet360@gmail.com` var mı, `email_confirmed_at` dolu mu.
- Vercel’de `SUPER_ADMIN_USER_ID`, `JUNIOR_CHECKOUT_OPEN`, `DRON_JUNIOR_OPEN`, PayTR üçlüsü ve `PAYTR_SANDBOX`.
- Canlı `price_catalog_entries` içinde `cat_junior_yearly` ve `updated_by`.
- Tarayıcıda uçtan uca satın alma. Kasa kilitliyken bu deneme tahsilat üretmez; kod yolu yukarıdaki kapılarla sınırlıdır.
