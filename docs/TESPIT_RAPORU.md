# TESPİT RAPORU — yetkin.ai teknik röntgen

Tarih: 20 Ekim 2026  
Kapsam: çalışma ağacının statik okuması. Ürün kodu bu turda değiştirilmedi.

Bu rapor çalışan süreç, veritabanı veya test koşusu değildir. Kaynak, şema, kenar kapısı ve sözleşme dosyaları okundu. `node_modules/`, derleme çıktısı, `public/media/` ve müze ağacı taranmadı. Canlı satışın açık olup olmadığı veritabanı satırına bağlıdır; o satır bu turda sorgulanmadı. Diskteki ses mührünün ders ders envanteri de çıkarılmadı.

---

## Mevcut Durum Özeti

Canlı mimari ad **Pragmatik Monolit + `@yetkin/kernel` + Tek Native İstemci**dir. Evi `.system_docs/ANAYASA.md` B1 ve kök `next.config.ts` yorumudur.

Eski «Amiral Gemi + Sürü Dron / Core + Micro-Apps» cümlesi ayrı bir hedef sistem tarif etmez. Kodda karşılığı şudur:

| Eski anlatım | Kodda duran şey |
|---|---|
| Amiral Gemi | Bu Next.js gövdesi: `app/`, `components/`, `lib/` |
| Shared Kernel | İnce paket `@yetkin/kernel` (`packages/kernel`). Para, katalog kimliği, v1 hop metası, JSON zarfı. Prisma ve Supabase taşımaz. |
| Çalışma zamanı çekirdeği | `lib/kernel`. Kimlik, Postgres, ödeme, kenar güvenlik, AI geçidi, iş kuyruğu. Ayrı süreç değildir. |
| Sürü Dron | `lib/dronlar/kayit.ts` satırı, `DronBayrakları` ve route öneki. Ayrı uygulama veya ayrı dağıtım açmaz. |
| Tek native istemci | `apps/rail-is` (paket adı `yetkin.ai-is`, Expo). Aynı `/api/v1` sicilini tüketir. Kök npm workspace’ine dahil değildir. |

Tek veritabanı PostgreSQL’tir. Kimlik Supabase Auth’tur. Prisma `User.id` kendi UUID’sini üretmez; Auth UUID’sini saklar. Ayrı API Gateway süreci yoktur. Next 16 kenarı `proxy.ts`tir. Kök `middleware.ts` yoktur.

### Kök yerleşim

| Yer | Rol |
|---|---|
| `app/` | App Router sayfaları ve `app/api/**/route.ts` handler’ları |
| `components/` | Web arayüzü |
| `lib/` | Oda motorları ve `lib/kernel` çalışma zamanı |
| `packages/kernel` | `@yetkin/kernel` |
| `packages/junior-content` | 6. sınıf içeriğinin türetilmiş JSON’u |
| `packages/junior-graphic` | Junior grafik indirgeyicisi. Next ve Prisma taşımaz |
| `apps/rail-is` | Tek native istemci. Kendi `package-lock.json` dosyası var |
| `prisma/schema/` | Canlı şema: `base`, `kernel`, `academy`, `career`, `freelancer`, `junior` |
| `prisma/migrations/` | 43 Prisma migration |
| `supabase/migrations/` | 16 SQL dosyası: RLS, auth tetikleyicisi, katalog tohumu |
| `proxy.ts` | Tek kenar girişi |
| `scripts/` | Mühür, ops, OpenAPI ve v1 tip üretimi |
| `tests/` | Vitest ve Playwright |
| `.system_docs/` | Anayasa, pedagoji, operasyon. Ürün kodu bu markdown’ı import etmez |

Kök `package.json` workspace’i yalnız `packages/*` dir. Next `^16.2.9`, React `^19.2.7`, Prisma `^7.8.0`, Zod `^4.4.3`, Inngest `^4.11.0`, Tailwind `^4.3.1`. Node `>=20.19.0`. Native istemci Expo `~57` ve React Native `0.86.2` kullanır; `@yetkin/kernel` ve `@yetkin/junior-graphic` bağlantısı `file:` iledir.

### Çalışan kamu yüzeyi

Kayıt defteri `lib/dronlar/kayit.ts`.

Açık odalar: Anasayfa (`/dashboard`), Akademi (`/academy`), Kariyer (`/career`), Junior (`/junior`). Kök `/` kenarda `/academy` adresine 308 döner.

Çekirdek yetenekler oda değildir: `/profil`, `/cuzdan`, `/pasaport`, `/admin`. Kanıt çıkışı `/vize` ve `/academy/dogrula` yeni oda açmaz.

Junior müstakil odadır. Ders listesi ve her dersin ilk konusu ziyaretçiye açıktır. İkinci konu, anlatış ve konu testi veli oturumu ve yıllık paket ister. Kasa varsayılan kilitlidir (`JUNIOR_CHECKOUT_OPEN` boşken `isJuniorCheckoutLocked` doğrudur). Profil masası kapalı betadır; `DRON_JUNIOR_OPEN`, geçerli paket veya izin listesi açar. `DRON_JUNIOR_OPEN` odayı 410 yapmaz. Oda kapısı ayrıdır: `DRON_JUNIOR_ROOM_OPEN`.

### Bilinçli kapalı yüzey

Bunlar bozuk kurulum değildir. Kod kapıyı fail-closed tutar.

| Yüzey | Kapı | HTTP |
|---|---|---|
| Freelancer kamu sayfası ve `/api/freelancer`, `/api/client/jobs` | `FREELANCER_PUBLIC_SURFACE_LOCKED = true` ve `MARKETPLACE_SPLIT_LIVE = false`. `DRON_FREELANCER_OPEN` tek başına açmaz | 410 |
| Young `/young` | Kayıt satırı `kapali: true`. Açılış `DRON_YOUNG_OPEN` | Kapalıyken 410. Açılırsa sayfa boş raf basar: «İçerik kartı henüz yok.» |
| Studio, DevLabs, Kurumsal, Hibe, Arena, Pazaryeri, Social | `FROZEN_DISK_ROOMS`. Canlı şemada tabloları yok. `20260822010000_drop_frozen_room_tables` düşürmüş | 410. Alias’lar `/yetkinx`, `/corporate`, `/market` canlı odaya rewrite edilmez |
| EİDS emlak/vasıta kamu ilanı | `EIDS_PUBLIC_LISTING_LOCKED = true` | İlan LISTED olamaz |
| Motor 2 / kurumsal vitrin | Anayasa B5: keşif. Kurumsal oda arşivde | Kamu vitrini yok |
| Junior kasa | `JUNIOR_CHECKOUT_OPEN` boş | Checkout 410 |

Freelancer motoru silinmemiştir. `lib/freelancer` ve `prisma/schema/freelancer.prisma` durur. `app/freelancer/page.tsx` hâlâ ilan panosu çizer; kenar kilitliyken bu sayfa çalışmaz. Kilit kalkmadan bu sayfa vatandaşa ulaşmaz.

### Veri modeli

Canlı Prisma modelleri, arşiv şemaları hariç:

- Çekirdek (15): `User`, `UserBillingInfo`, `Wallet`, `LedgerEntry`, `EscrowHold`, `PaymentOrder`, `WalletCardRefund`, `PaymentAnomaly`, `PriceCatalogEntry`, `PriceCatalogDecisionLedger`, `CheckoutPriceLock`, `AiTokenUsage`, `HttpIdempotencyRecord`, `PaidCommandReservation`, `FunnelDailyCounter`
- Akademi (9): kurs, satın alma, sınav, oturum, sertifika, muafiyet mührü, ders tamamlama, ses önbelleği
- Kariyer (2): `CareerVisaStamp`, `CareerPortfolioItem`
- Freelancer (7): ilan, teklif, sözleşme, uyuşmazlık, mesaj, takım, takım üyesi
- Junior (5): `JuniorProfile`, `JuniorGuardianConsent`, `JuniorProgress`, `JuniorXp`, `JuniorSubscription`

Para birimi `amountMinor` + `currencyCode`. Şema yorumu `amountKurus` kolon adını yasaklar. Prisma 7 istemcisi `generated/prisma` altına çıkar; sorgu motoru `engineType = "client"`.

İki SQL akışı vardır ve ikisi de aynı Postgres’e gider. Şema evrimi `prisma/migrations`. RLS, auth senkron tetikleyicisi ve bazı katalog tohumları `supabase/migrations`. İkinci veritabanı değildir. Operatörün yalnız bir akışı uygulaması şema ile satır güvenliğini ayırır.

### Katalog

`packages/kernel` kurs kayıt defterinde 14 yetişkin kart vardır: kanon `01_`–`13_` ve kanon dışı `01_office_ai_ileri` (OFF-201). Junior ve Young bu deftere girmez.

`vitrineOrder` dolu kartlar: `02_ecommerce_ai`, `03_social_media_ai`, `05_prompt_practice`, `04_chatbot_nocode`, `01_office_ai`, `01_office_ai_ileri`. `06_`–`13_` ders yolu boş, kapak yok, vitrin sırası yok; kayıt özeti «Hazırlanıyor»dur.

Satış niyeti kodda üç kapı ister: veritabanında yayın, aktif fiyat satırı, diskte beş katman. Kod listesi tek başına satın al açmaz. Bu turda canlı fiyat satırı okunmadı.

Junior pilot sınıfı 6’dır. Çekirdek kartlar `jr_06_mat`, `jr_06_fen`, `jr_06_turkce`, `jr_06_ing_main`, `jr_06_sosyal`. Seçmeli kartlar ayrı listededir ve mühürsüz olanlar tam ders sayılmaz.

### API yüzeyi

`app/api` altında 73 `route.ts` vardır. `/api/v1` için ikinci bir handler ağacı yoktur. `proxy.ts`, sicildeki `/api/v1/...` yolunu kanonik `/api/...` handler’ına rewrite eder. Sicil dışı v1 yolu 404’tür ve kanonik handler’a düşmez.

Yayınlanmış hop sicili `packages/kernel/src/http/v1-hops-meta.ts` içindedir. `lib/kernel/http/v1-hops-meta.ts` bu dosyayı yeniden export eder. Zod şeması `lib/kernel/http/v1-contract.ts` üzerindedir. Sayı: **29 hop**.

| Hop | Yöntem | Yol | Kimlik |
|---|---|---|---|
| health | GET | `/api/v1/health` | yok |
| academy-certificate | GET | `/api/v1/academy/certificates/{hash}` | yok |
| academy-pulse | GET | `/api/v1/academy/pulse` | Bearer |
| academy-purchase | POST | `/api/v1/academy/courses/{id}/purchase` | Bearer |
| academy-lock | POST | `/api/v1/academy/courses/{id}/lock` | Bearer |
| academy-curriculum | POST | `/api/v1/academy/courses/{id}/curriculum` | Bearer |
| academy-curriculum-read | GET | aynı | Bearer |
| academy-exam | POST | `/api/v1/academy/courses/{id}/exam` | Bearer |
| academy-exam-read | GET | aynı | Bearer |
| auth-session | GET | `/api/v1/auth/session` | Bearer |
| wallet-strip | GET | `/api/v1/dashboard/wallet-strip` | Bearer |
| wallet-top-up | POST | `/api/v1/wallet/top-up` | Bearer |
| career-pulse | GET | `/api/v1/career/pulse` | Bearer |
| career-visas | GET | `/api/v1/career/visas` | Bearer |
| career-portfolio | POST | `/api/v1/career/portfolio` | Bearer |
| profile-patch | PATCH | `/api/v1/profile` | Bearer |
| junior-lesson-read | GET | `/api/v1/junior/lessons/{key}` | yok |
| junior-lesson-play | GET | `/api/v1/junior/lessons/{key}/play` | Bearer |
| junior-lesson-progress | POST | `/api/v1/junior/lessons/{key}/progress` | Bearer |
| junior-lesson-practice | POST | `/api/v1/junior/lessons/{key}/practice` | Bearer |
| junior-profile ve create/select/consent/erase | GET POST PATCH PUT DELETE | `/api/v1/junior-pilot/profiles` | Bearer |
| junior-electives | POST | `/api/v1/junior-pilot/electives` | Bearer |
| junior-tell | POST | `/api/v1/junior-pilot/tell` | Bearer |
| junior-practice | POST | `/api/v1/junior-pilot/practice` | Bearer |
| junior-quiz | POST | `/api/v1/junior-pilot/quiz` | Bearer |

Zarf `{ ok, error, requestId, apiVersion, data }`. `apiVersion` `"1"`. Native çağrı çerez oturumu kabul etmez. Ayrı `/api/v1/auth/refresh` ucu yoktur; istemci Supabase Auth JWT’sini yeniler. `X-Rail-Min-Version` health dışında zorunludur. Uyumsuz sürüm 426 döner.

Freelancer hop’ları sicilde yoktur. Yorum ve test bunu bilinçli tutar: Split ve kamu kilidi kalkınca geri yazılır.

### Kimlik, para, AI, kuyruk

- Kimlik: Supabase Auth. Web çerez, native Bearer. Süper yönetici `lib/kernel/auth/super-admin.ts`.
- Tahsilat: PayTR Merchant portu (`PaymentProviderId = "merchant"`). Bildirim ağızları `/api/paytr/callback` ve `/api/payments/webhooks/paytr`. HMAC handler’dadır. Pazaryeri Split kapalıdır.
- Defter: cüzdan, `LedgerEntry`, emanet. Emanet zaman aşımı ve PayTR valör taraması Inngest fonksiyonlarındadır (`lib/kernel/jobs/inngest.ts`). Inngest anahtarı yoksa fonksiyon yine kodda durur; sahte başarı basılmaz.
- AI: `lib/kernel/ai/llm-gateway.ts`. Gemini, OpenAI, Anthropic ve sovereign adaptörü. Model kimliği `lib/kernel/ai/model-roles.ts`. İzlemede canlı video/TTS üretimi anayasa B4 ile kapalıdır; fırın ayrı script’tedir.
- Hız tavanı: Redis REST URL ve token birlikte doluysa paylaşılan depo. Biri dolu biri boşsa fail-closed. İkisi de boşsa süreç içi bellek. Çok örnekli üretimde boş Redis, limitin örnekler arasında paylaşılmaması demektir.
- Medya: Akademi sesi ve sinema dosyası R2 / CDN kapısına bağlıdır. Vatandaş nesne deposu yoktur.

### Native istemci

`apps/rail-is` Akademi oynatıcı, sınav, sertifika, cüzdan yükleme, Junior ders ve profil ekranlarını taşır. Tezgâh ekranları durur; `DRON_TEZGAH_STORE_ISOLATED = true` iken açık işler sekmesi hop çağırmaz. `eas.json` mağaza profilini tutar. `next.config.ts` bu uygulamayı Next fonksiyon izinden çıkarır ve CI’nin binary basmadığını yazar. `package.json` içindeki `publishFrozenUntilFaz1Close` false’tur. Yani istemci repo’da derlenebilir durumdadır; mağaza binary’si bu Next gövdesinin build kapısı değildir.

---

## Teknik Röntgensel Tespitler (Artılar / Eksikler / Riskler)

### Artılar

1. Mimari ad ile kod aynı cümlededir. Ayrı çekirdek servisi, ayrı dron veritabanı ve kopya `/api/v1` handler ağacı yoktur.
2. Import duvarı ESLint’te durur. `lib/kernel` dikey oda motorunu import etmez. Kariyer ve freelancer `lib/academy` import etmez. Müze importu yasaktır. ESLint oda listesini `lib/dronlar/kayit.ts` dosyasından okur; ikinci bir oda dizisi tutmaz.
3. Para, katalog kimliği ve hop metası Prisma’sız pakettedir. Native istemci bu paketi tüketir. Web `lib/kernel/http/v1-hops-meta.ts` aynı metayı export eder.
4. Kapalı ürün sahte yeşil basmaz. Freelancer, Young, donmuş odalar, Split ve Junior kasa 410 veya fail-closed’tur.
5. Kenar tek yerden karar verir: müze 404, donmuş oda 410, oturumsuz çekirdek sayfa 307, v1 allowlist, sürüm, Origin, hız tavanı, JWT. Route auth türü `export const auth` ile `route-auth-map.ts` içindedir ve `verify:api-auth --check` prebuild’e bağlıdır.
6. Ön derleme kapısı sır, tamsayı para, RLS beyanı, v1 sözleşme artefaktı, IDOR mühürleri, public boyut ve Junior içerik kontrolünü `verify:prebuild` altında toplar.
7. Akademi satış kapısı ile önizleme kapısı ayrılmıştır. İlk ders herkese açıktır; mühür ve fiyat satırı satış için ayrıca gerekir.

### Eksikler

1. Native istemcinin konuştuğu sözleşme 29 hop’tur. Web’in konuştuğu yüzey daha geniştir. Aşağıdaki yazma veya sohbet uçları hop sicilinde yoktur. `apps/rail-is/src` bu yolları çağırmaz:
   - `POST /api/ai/chat`
   - `POST /api/academy/lesson-assistant`
   - `POST /api/junior/live-tutor`
   - `POST /api/junior-pilot/checkout`
   - `POST /api/junior-pilot/grade`
   - cüzdan iadesi, fatura profili, hesap kapatma, kayıt ve parola uçları
   Checkout ve sınıf satırı hop yorumunda bilinçli olarak yoktur. Canlı koç ve ders asistanı telefon ürününde yoktur.
2. Handler dosyası durup her metotta 410 dönen uçlar vardır. Ürün değildirler:
   - Akademi stüdyo artığı: `generateSpeech`, `discussion`, `reviews`, `courses/[id]/listen`, `courses/[id]/pdf`, `admin/curriculum-revisions`
   - Freelancer uydusu: `squad`, `direct-offers` ve kabul/red
3. `06_`–`13_` yetişkin kartları kayıt defterinde kabuktur. Ders, kapak ve vitrin sırası yoktur.
4. Young’un konu listesi `lib/kernel/catalog-ids/school-segments.ts` içindedir. Ders kartı yoktur.
5. Junior yıllık paket satışı kodda vardır, kasa kilitlidir. Hukuki metin ve `JUNIOR_CHECKOUT_OPEN` açılmadan nakit hattı çalışmaz.
6. Native binary CI’da üretilmez. Sözleşme tipi `generate:v1-client` ile kontrol edilir; mağaza çıktısı ayrı bir operatör adımıdır.
7. `apps/rail-is` kök workspace’te değildir ve kendi kilit dosyasını taşır. `@yetkin/kernel` sürümü `file:` ile gider; Expo bağımlılıkları monolit `npm install` ağacından ayrı çözülür.

### Riskler

1. İki SQL akışı. Prisma migration uygulanıp Supabase RLS/tohum atlanırsa tablo vardır, satır politikası veya katalog satırı eksik kalır. Tersi de geçerlidir.
2. Redis boşken hız tavanı süreç belleğindedir. Birden fazla Next örneğinde limit paylaşılmaz. Kısmi Redis config’i ise tüm limiti kapatır. Üretimde ikisinin de dolu olması gerekir; bu turda canlı env okunmadı.
3. Freelancer sayfası kilit arkasında tam ilan panosu taşır. Kenar kapısı kalkarsa vatandaş, Split hâlâ kapalıyken o panoyu görür. Asıl açılış üç koşulu birlikte ister; sayfa bileşeni bu üç koşulu kendi içinde tekrar etmez.
4. Çalışma ağacında Junior oynatıcı iki motor arasında dikiş halindedir. Ayrıntı bir sonraki bölümde.
5. `POST /api/junior/live-tutor` kenar türü `public`tir. Handler misafire LLM çağırmaz; yerel pedagojik yanıt verir. Oturumlu çağrı modele gider ve kota vardır. Uç hop sicilinde olmadığı için native sürüm kapısı ve Bearer zorunluluğu bu yola uygulanmaz. Web çerezi ve misafir yolu aynı handler’dadır.
6. Donmuş oda kodu `archived/` altındadır ve canlı şemadan düşmüştür. Orayı yeniden import etmek build duvarına çarpar. Eski tabloları geri almak ayrı bir migration kararıdır; dosyayı geri taşımak yetmez.

### Çalışma ağacında doğrulanan Junior ayrışması

Bu tur başındaki git durumunda Junior ders motoru dosyaları değişmiş veya izlenmeyen dosya olarak durur. Kaynak okuması şunu gösterir:

- Kalıcı ders sayfası `app/junior/ders/[lessonKey]/page.tsx` `LessonChain` çizer.
- Aynı ağaçta `app/junior/ders/jr_06_mat-1/page.tsx` vardır ve `JuniorEngineProductionLesson` çizer.
- Next.js’te statik segment dinamik segmentten önce gelir. `jr_06_mat-1` adresi `LessonChain` sayfasına düşmez.
- `LessonChain`, etkinlik rayı ve simülasyonlar `lib/junior/lesson-engine` kayıt defterini de çağırır. Bu kayıt şu an matematik 1–5 blueprint’ini taşır (`lib/junior/lesson-engine/modules/mat-1-to-5.ts`).
- Eski oynatıcı grafikleri `lib/junior/pilot-engine/` altındadır ve durur.

Sonuç: 6. sınıf matematik 1, diğer derslerden farklı bir sayfa bileşeniyle açılır. Bu bir üretim kilidi değildir. İki oynatıcının aynı derste birleşmeden büyümesidir. Commit edilmeden «yayındaki ürün» sayılmamalıdır; diskte ise etkindir.

---

## Shared Kernel ve API-First Uyum Durumu

Uyum yüksektir ve mikro servis haritasına uyum diye okunmamalıdır. Uyum, B1’in tarif ettiği ince pakete göredir.

| Beklenti | Durum |
|---|---|
| Tek gövde, tek veritabanı, tek kimlik | Sağlanmış |
| Paylaşılan paket Prisma’sız | Sağlanmış. `@yetkin/kernel` para, katalog, zarf, hop metası |
| Native aynı hop sicilini tüketir | Sağlanmış. `apps/rail-is/src/api/hops.ts` `RAIL_V1_HOPS_META` ile eşleşen çağrı süzgeci kurar |
| Yeni yetenek önce hop | Kısmi. Akademi satın alma, sınav, müfredat, cüzdan yükleme, kariyer portföyü, profil yaması ve Junior ders/profil yazmaları hop’tadır. Canlı koç, ders asistanı, genel sohbet, Junior kasa ve sınıf değişimi web BFF’de kalır |
| Kopya v1 handler yok | Sağlanmış. Kenar soyar ve rewrite eder |
| Oda = ayrı deploy | Bilinçli olarak yok. Kayıt satırı + bayrak + hop checklist’i var |
| Freelancer v1’de | Bilinçli olarak yok |
| İkinci native istemci | Yok. Doğması için aynı paket ve aynı hop şart |

`lib/kernel` ile `packages/kernel` iki farklı büyüklüktedir. İlki süreç içi işletim sistemidir. İkincisi istemcinin import edebildiği sözleşmedir. İkisini tek «Shared Kernel servisi» sanmak uyumu bozar. Servis ayırmak bu repoda yapılmamıştır ve B1 bunu istemez.

API-First burada «her HTTP yolu dış ürün sözleşmesidir» demek değildir. Dış sözleşme 29 hop ve zarftır. RSC, `lib/` üzerinden okuyabilir. Yazmanın sessizce yalnız tarayıcıda kalması, telefonun da kullanacağı yetenek için yasaktır. Telefonun kullanmadığı yetenek web’de kalabilir. Canlı koç bu ikinci gruptadır; ürün kararı olarak telefon sözleşmesine alınmamıştır.

---

## Doğrulanmış Hata ve İyileştirme Listesi

«Hata» ile «bilinçli kilit» ayrıldı. Kilit satırları yukarıdaki tabloda. Aşağıdakiler koddan doğrulanan iyileştirme ve tutarlılık işleridir. Canlı 500 veya düşen test iddiası yoktur; test çalıştırılmadı.

1. **İki Junior oynatıcı.** `pilot-engine` duruyor, `lesson-engine` matematik 1–5 için bağlı, `jr_06_mat-1` ayrı sayfa. Tek ders kabuğu seçilmeden yeni konu eklenmemeli.
2. **Hayalet 410 route’ları.** Stüdyo ve freelancer uydusu handler’ları ürün haritasını şişirir. `app/api/_gone/[...path]` zaten donmuş oda yakalayıcısıdır. Kalıcı kapalı uçlar ya bu yakalayıcıda toplanmalı ya da dosya olarak «kapalı» diye hop dışı bir listede tutulmalıdır. Şu an ikisi birden vardır: gerçek handler dosyası ve 410 gövdesi.
3. **Freelancer sayfa gövdesi.** Kenar 410 basarken sayfa ilan listesi import eder. Kilit kalkmadan bu gövde ya kenarla aynı üç koşulu okumalı ya da kilit süresince boş 410 kabuğuna inmelidir.
4. **Hop dışı ürün yazmaları.** Telefon Junior’da anlatış, quiz ve profil vardır; kasa ve sınıf değişimi yoktur. Web’de kasa kilitli de olsa handler durur. Açılacağı gün hop’a yazılmazsa native ile web kasası ayrılır. Açılış anının checklist’ine hop maddesi konmalıdır. Aynı şey, telefonda istenirse, canlı koç için de geçerlidir.
5. **İki migration akışı.** Operatör runbook’unda hangi değişikliğin Prisma, hangisinin Supabase SQL olduğu tek bakışta seçilmelidir. Bu raporda o runbook yeniden yazılmadı. Risk kod yerleşiminden okunur.
6. **Redis koşulu.** Üretimde URL ve token çifti dolu olmalıdır. Boş çift lab içindir. Kısmi çift siteyi fail-closed keser.
7. **Native kilit dosyası.** `apps/rail-is/package-lock.json` monolit ağacından ayrıdır. Kernel `file:` bağı temizdir. Expo sürüm kayması ancak o dizinde `npm install` ile görünür. `typecheck:rail-is` kök script’te vardır; kök `npm install` bu kilidi güncellemez.
8. **Kabuk katalog.** `06_`–`13_` satın alınabilir ders gibi durmamalı. Kod bunu boş `lessonKeys` ve `vitrineOrder: null` ile tutar. Vitrin metni bu alanları ezmemelidir.
9. **Young.** Bayrak açılırsa boş kart rafı yayınlanır. İçerik mühürü olmadan `DRON_YOUNG_OPEN` açılmamalıdır.
10. **Çalışma ağacı temizliği.** Bu turda ürün kodu yazılmadı. Junior ders motoru diff’i commitlenmeden «tespit edildi, bitti» sayılmamalıdır.

Doğrulanmayanlar, bu yüzden hata listesine yazılmayanlar: canlı PayTR kimlik bilgisi, Supabase proje sağlığı, R2’de hangi WAV’ın durduğu, Inngest Cloud cron’unun işlediği, Vercel örnek sayısı, Redis’in üretimde dolu olup olmadığı.

---

## SEN OLSAYDIN NE YAPARDIN?

Mikro servise bölmezdim. Bu gövde zaten doğru radikal kararı vermiş: tek süreç, tek defter, ince sözleşme, bayraklı oda. Şimdi yapılacak radikal iş bölmek değil, yüzeyi sözleşme kadar inceltmektir.

Yapacağım sıra:

1. Ürün cümlesini dondururdum. Yeni oda, yeni repo veya yeni veritabanı açılmaz. İkinci telefon ancak aynı paketi ve aynı 29 hop’u tüketerek doğar.
2. Junior’da tek oynatıcı bırakırdım. `jr_06_mat-1` özel sayfası ya tüm çekirdek derslerin kabuğu olur ya da silinir. `pilot-engine` grafiklerinin `lesson-engine` blueprint’ine nasıl bağlandığı bir tabloda biter. İki motor yan yana konu üretmez.
3. Hayalet 410 dosyalarını tek kapalı listeye indirirdim. API haritası vatandaşın çağırabildiği uçlarla aynı görünür.
4. Freelancer’a dokunmazdım. Motor ve şema laboratuvarda kalır. Açılış ancak B5 checklist’i gerçekken olur: lisanslı Pazaryeri sözleşmesi, alt satıcı onboard, hop’ların sicile geri yazımı, kapalı test halkası, `DronBayrakları.isKapali("freelancer") === false`. `DRON_FREELANCER_OPEN` bu beşlinin yerine geçmez.
5. `@yetkin/kernel`i şişirmezdim. Prisma, Supabase ve LLM oraya girmez. Yeni telefon yeteneği önce hop metası, sonra Zod, sonra mevcut handler, sonra `apps/rail-is` çağrısıdır.
6. Ölçmeden servis ayırmam. Ayırma gerekirse adaylar bellidir: medya CDN’i zaten ayrı, AI çağrısı zaten geçitten, valör taraması zaten Inngest’te. Bunlar süreç içi modüldür. Ayrı Node servisine çıkarmak ancak havuz, süre veya maliyet sayısı bunu zorlarsa konuşulur.
7. Üretim env’ini kod kilidi gibi okurdum: Redis çifti dolu, PayTR sandbox kapalı, Junior kasa kapalı, Split kapalı. Boş env’yi «çalışıyor» saymam.

Bu yaklaşım yeni bir platform kurmaz. Durmakta olan kapıları ürün kararı haline getirir.

---

## Platform Kurgusu Doğru mu?

Evet. Doğru kurgu, eski slayt cümlesinin birebir mikro uygulama karşılığı değildir. Doğru kurgu B1’dir ve kod o cümleye oturur.

Örtüşme:

- Tek Next.js gövde, tek Postgres, tek Supabase Auth vardır.
- Paylaşılan çekirdek bir paket olarak vardır ve istemci onu import eder.
- Odalar kayıt defteri ve bayrakla açılır. Kapalı oda 410 döner, sahte veri basmaz.
- Native istemci aynı hop zarfını konuşur. Ayrı kimlik sistemi kurmamıştır.
- Akademi, Kariyer, Panel ve kanıt URL’si kamu vitrinidir. Junior dördüncü vitrin odası değildir. Freelancer kilitli motordur. Young kapalıdır. Bu, anayasa B2 ve B6 ile aynıdır.

Örtüşmeyen tek şey, «sürü» kelimesinin çağrıştırdığı ayrı deploy edilebilir uygulamalardır. O uygulamalar bu repoda yoktur. `archived/` altındaki studio, pazaryeri, arena, hibe, kurumsal, social ve devlabs denemeleri canlı şemadan düşmüştür. Onları yeniden mikro uygulama yapmak, çalışan defteri ve RLS’i ikiye böler.

Eksik olan kurgunun kendisi değildir. Eksik olan, telefon sözleşmesinin web’deki her yeteneği taşıması ve Junior oynatıcının tek kabuğa inmesidir. İkisi de mevcut temelin üstüne eklenir.

---

## Gelecek MASTER PLANI

Amaç ölçeklenebilir bir sürü kurmak değildir. Amaç bu monolitin ikinci ve üçüncü istemciyi aynı hop ile taşıyacak kadar sıkı kalmasıdır.

### Adım 0 — Sözlük ve kapı

Yeni belge ve kod B1 adını kullanır. Yeni oda checklist’i: `lib/dronlar/kayit.ts` satırı, bayrak, hop, test. Repo açılmaz.

### Adım 1 — Junior tek kabuk

- `jr_06_mat-1` özel sayfası ile `[lessonKey]` tek bileşende birleşir.
- Blueprint kayıt defteri hangi derslerin yeni kabukta olduğu liste olur. Bugün bu liste matematik 1–5’tir.
- `pilot-engine` ya bu kaydın zaman çizelgesi kaynağı olarak kalır ya da ders ders taşınıp silinir. İkisi birden «asıl oynatıcı» olmaz.
- İçerik yolu değişmez: metin `lib/junior` TypeScript’inde, çalışma zamanı `packages/junior-content` JSON’unda, JSON `export:junior-content` ile türer.
- Seçmeli ders `assertJuniorProductionSeal` geçmeden çekirdek kart gibi sunulmaz.

### Adım 2 — Sözleşmeyi ürünle eşitle

- Hayalet 410 route’ları tek kapalı yüzeye iner.
- Telefonda kalacak her yazma, açılmadan önce `RAIL_V1_HOPS_META` satırı olur. Junior kasa bu listenin başına yazılır; env açmak hop yazmanın yerine geçmez.
- Freelancer hop’ları Split checklist’inden önce sicile eklenmez.
- `verify:v1-contract-artifacts` yeşil kalmadan native ekran eklenmez.

### Adım 3 — Operasyon tek bakış

- Prisma migration ve Supabase SQL için tek operatör sırası yazılır. Şema, RLS, auth tetikleyicisi, fiyat tohumu hangi komutla uygulanır, bu sıra `OPS_RUNBOOK` içinde seçilir.
- Üretim Redis çifti, PayTR sandbox, bakım bayrağı ve Junior kasa bayrağı readiness çıktısında yan yana okunur. `ops:runtime-readiness` bu işin mevcut kancasıdır.
- Native için CI’da en az `typecheck:rail-is` ve v1 artefakt kontrolü kalır. Mağaza binary’si ancak sürüm kararıyla EAS’ten basılır. Next build o binary’yi üretmez.

### Adım 4 — Akademi satış hattı

- Vitrindeki her kart için üç kapı birlikte okunur: `is_published`, aktif fiyat, disk mührü.
- `06_`–`13_` ders yolu dolmadan vitrin sırası almaz.
- İzleme yolu canlı TTS/video çağırmaz. Fırın script’leri ayrı kalır.

### Adım 5 — Faz 2 yalnızca checklist ile

Sıra değişmez:

1. Lisanslı Pazaryeri sözleşmesi.
2. Alt satıcı onboard.
3. Freelancer hop’larının v1 siciline yazılması ve kenar 410’un kalkması.
4. Kapalı test halkası.
5. `isKapali("freelancer") === false` ve `FREELANCER_PUBLIC_SURFACE_LOCKED` ile `MARKETPLACE_SPLIT_LIVE` aynı anda açılır. Biri tek başına vitrin açmaz.

Kurumsal oda ilk pilot müşteri profili olmadan açılmaz.

### Adım 6 — Young

`DRON_YOUNG_OPEN` içerik kartı ve mühür olmadan açılmaz. Açıldığında Junior’ın kapı modeli kopyalanır: kayıt satırı, katalog paketi, hop, yaş penceresi. Akademi kayıt defterine Young kartı eklenmez.

### Adım 7 — Ölçülen ayrışma

Ancak bundan sonra, sayı varsa:

- Medya zaten R2’dedir.
- AI maliyeti `AiTokenUsage` ve günlük tavan ile izlenir.
- Valör ve emanet Inngest’tedir.

Bu üçü ayrı ürün servisi yapılmaz. Darboğaz ölçülürse ilgili modül süreç dışına alınır. Defter ve kimlik gövdede kalır.

---

## Bir Sonraki Aşamada Ne Yapılmalı?

CEO ve SUPER_ADMIN için sıradaki odak ürün bölmek değildir. Sıradaki odak Junior kabuğunu tekleştirmek ve kasayı hop’suz açmamaktır.

Yapılacaklar:

1. Çalışma ağacındaki Junior ders motorunu bitirin veya geri alın. `jr_06_mat-1` ile diğer dersler aynı sayfa sözleşmesini kullanmadan yeni matematik konusu eklemeyin.
2. Junior kasasını kapalı tutun. Açılış kararı hukuki metin, fatura mührü, PayTR siparişi ve v1 hop satırı birlikte gelince verilir. `JUNIOR_CHECKOUT_OPEN=1` tek başına yeterli karar değildir.
3. Freelancer ve Young bayraklarını açmayın. İkisi de içerik veya sözleşme olmadan vitrin vaadi üretir.
4. Üretimde Redis URL ve token çiftini doğrulayın. Kısmi config hız limitini kapatır. Boş çift limiti örnek belleğine bırakır.
5. Prisma ve Supabase SQL akışının ikisinin de son uygulanan sürümünü yan yana yazın. Bu rapor o sürümü canlı veritabanından okumadı.
6. Telefon sözleşmesine eklenecek ilk yetenek, canlı koç değil, kasadır. Koç web’de kalmaya devam edebilir. Kasa açılacaksa önce hop olur.
7. `06_`–`13_` kabuklarını vitrine taşamayın. Satış kapısı üçlüdür; kayıt defterindeki fiyat tohumu satış değildir.

Bu adımlar bitmeden yeni oda, yeni repo veya ikinci veritabanı açılmamalıdır.
