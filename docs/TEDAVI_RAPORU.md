# TEDAVİ RAPORU — yetkin.ai

Tarih: 27 Ekim 2026  
Okuyucu: SUPER_ADMIN  
Dayanak: `docs/TESPIT_RAPORU.md` (27 Ekim 2026) ve CEO tedavi paketi.  
A1–A5 gevşetilmedi. Canlı Postgres fiyat satırları ve `.env` içindeki `SUPER_ADMIN_USER_ID` bu turda okunmadı.

---

## Hüküm

Satış düğmesi kapalıysa nedeni artık tek ölü cümleye düşmüyor. Süresi dolmuş lisans, satış kapısı açıksa yenileme kasasına gidiyor. Junior süre mührü karakter saatini yeşil saymıyor; 180 saniyenin altındaki ölçülmüş kaset kartta «Kısa anlatım» oluyor. Jenerik «Süper Kaşif / MEB.6» yedeği çocuk ekranına üretilmiyor. Hop sayısı `ops-dron.md` içinde 33.

---

## 1. Akademi satış yolu

### Satın alma kapısı

`resolveAcademyCatalogCardCta` kapalı kartta `saleHold` cümlesini ayırır:

| Neden | Düğme |
|---|---|
| Yayın kapalı | Yayında Değil |
| Fiyat satırı yok | Fiyat Bekleniyor |
| Ses veya metin mührü eksik | Ses Mührü Eksik |
| İkisi birden | Fiyat Bekleniyor · Ses Mührü Eksik |

Açıklama `priceCaption` olarak durur. `06_`–`13_` boş kanon kabuk bir karta düşerse tohum tutar basılmaz; etiket «Hazırlanıyor»dır. Bu kabukların `vitrineOrder` değeri zaten `null`; rafta değiller.

### Süresi dolmuş lisans

`access === "expired"` ve `purchasable` ise Antre birincil düğmesi «Yenile» olur ve `#satin-al` kasasına gider. Kurs sayfası aynı durumda `PurchaseButton`a `renew` verir; düğme `Yenile (tutar)` yazar. Satış kapısı kapalıysa «Lisans süresi doldu. Satış kapısı şu an kapalı» ve `saleHold` cümlesi basılır. Yeni bir satın alma satırı yazılmaz; mevcut kasa yolu kullanılır.

### Düşüm ve iade cümlesi

Lisans yazılamazsa vatandaş metni artık sessiz talep satırı değildir: sipariş tutarının karta iade edilmeye çalışıldığı, bakiye yetmezse talebin durduğu ve sahte lisans basılmadığı yazılır (`ACADEMY_SEN.purchase.licenseUnwritten`). Bakiye eksiği, PayTR hattının kapalı olması ve düşüm hatası için ayrı cümleler eklendi.

---

## 2. Junior

### Süre mührü

`juniorProductionSealGaps` süreyi `measuredJuniorNarrationMs` ile okur: önce MP3 başlığı, yoksa `packages/junior-content/timelines/*.timeline.json` içindeki kilitli `audio.durationMs`. Karakter saati (`juniorNarrationDurationMs`) bu kapıya girmez.

Ölçülen envanter: 123 kilitli çizelge. 180 saniyenin altında 13 kaset var: `jr_06_mat-6` (142204 ms) ve 12 seçmeli konu (133308–167392 ms). Diğer çekirdek dersler bantta.

180 sn altı `duration` açığıdır. `assertJuniorProductionSeal` bu açığı da reddeder. Paket ve ücretsiz açılış `juniorContentSealGaps` ile bakılır; kısa kaset bütün kursu kilitlemez. Kart `narrationShort` taşır. Rozet «Kısa anlatım»dır (amber). Ücretsiz açılış hâlâ açılır; yeşil tam ders demez. Ders sayfasında saniye yazılır.

Ses dosyaları bu turda yeniden fırınlanmadı. 142 saniyelik `jr_06_mat-6` 180 saniyeye uzatılmadı; gerçek süre kartta duruyor.

Oynatıcı okuyucusu (`registerAcousticTimelineReader`) mühür okumasından kaydedilmez. `jr_06_mat-4` gibi dersler, okuyucu ayrıca bağlanmadan `getPilotTimelineForLesson` ile `null` kalır.

### İsimler

Canlı adlar eklendi ve mühür yolu bunları kullanır:

| Eski sabit | Canlı anahtar | Yeni sabit |
|---|---|---|
| `JR_06_MAT_5_PRODUCTION` / `JR_06_MAT_5_TIMELINE` / `JR_06_MAT_5_BLUEPRINT` | `jr_06_mat-1` | `JR_06_MAT_1_*` |
| `JR_06_MAT_6_PRODUCTION` / `JR_06_MAT_6_TIMELINE` / `JR_06_MAT_6_BLUEPRINT` | `jr_06_mat-2` | `JR_06_MAT_2_*` |

Eski adlar `@deprecated` takma ad olarak aynı nesneyi gösterir. Silinmediler; dış test ve fırın importu kırılmasın diye. Yeni fırın yeni adı okumalıdır.

`mat-27.graph.ts` ve `mat-30`–`mat-36` oynatıcı yükleyicisine bağlı değildir. `graph-timeline-fallback.ts` onları canlı anahtara (`jr_06_mat-6` ← `mat-27`, vb.) yalnız mühür betiği için tutar. Dosyalar silinmedi: betik hâlâ kaynak olarak okur.

### Süper Kaşif

`getJuniorLessonBlueprint` kayıt yoksa `null` döner. `MEB.6` ve «Süper Kaşif» kabı üretilmez. Simülasyon sekmesi, rozet penceresi ve motor, şablonu olmayan derste bu rozeti basmaz. Kayıtlı şablonlar `jr_06_mat-1` ve `jr_06_mat-2`.

### Seçmeli

Raf etiketi «Kişiye Özel Müfredat» olmaktan çıktı. Seçmeli etiket: «İki konu taslak · yıllık müfredat değil». Kasa metni aynı ayrımı zaten söylüyordu. On iki seçmeli konu ölçülmüş sesle 3 dakikanın altındadır; kart «Kısa anlatım»dır, yıllık müfredat rozeti değildir.

---

## 3. Yetki ve tek ev

### Super Admin

Üretim kuralı durur (T-03): `NODE_ENV=production` iken `SUPER_ADMIN_USER_ID` boşsa kimse admin olmaz. `yapinet360@gmail.com` üretimde yalnız oturum UUID’si bu değişkenle birebir aynıysa açılır. Geliştirmede doğrulanmış yerleşik kutu UUID beklemez. `.env` açılmadığı için üretimdeki UUID değeri bu raporda doğrulanmadı.

### İnceleme

`canEnterJunior` kasa niyetinde denetim aktörüne `allow: true, via: "audit"` verir. Kilitli ders izni zaten vardı. Ödeme yazımı durur: kasa kilitliyken sipariş 503, denetim hesabı nakit satırı açmaya kalkarsa 403 (`JUNIOR_CHECKOUT_AUDIT_MESSAGE`). Kasa sayfası inceleme şeridini basar. Donmuş odalar (studio, freelancer, arena) 410 kalır; inceleme onları vitrine açmaz.

### Fiyat evi

Canlı tutar `PriceCatalogEntry`. Tohum `COURSE_REGISTRY.priceSeedMinor` (`ACADEMY_CATALOG_PRICE_MINOR` bu diziden türer). `resolveAcademySeedMoney` seviye bandından (49.000 / 109.000 / 289.000) tutar üretmez; `amountMinor` zorunludur. `ACADEMY_LEVEL_PRICE_BANDS` deprecated durur ve yeni kod onu okumaz.

### Kök `/`

`next.config.ts` `/` adresini `/academy`ye 308 ile çevirmeye devam eder. `app/(public)/page.tsx` bu kilit açıkken basılmaz; meta `noindex`. Kök layout varsayılan başlığı markadır (`yetkin.ai`). Akademi kataloğunun arama başlığı «Akademi eğitim kataloğu»dır. Görünen H1 sloganı (`Yapay Zekâyı Öğren. Gerçek İşlerinde Kullan.`) katalog gövdesinde durur; kök kabuk ve noindex oynatıcı onu miras almaz.

---

## 4. SEO

- Kök `layout.tsx` title/description, katalog sloganından ayrıldı.
- `/academy/[slug]/oyna` kendi başlığını ve açıklamasını basar (`Ders oynatıcı`), `noindex`.
- Kilitli Junior ders meta’sı başlıkla birlikte «arama dizinine kapalıdır» açıklamasını basar.
- Canonical `pageMetadata` üzerinden kamu sayfalarında durur. Sitemap statik yolları: `/academy`, `/academy/ileri`, `/career`, `/junior`, doğrulama, vize. Kök `/` 308 olduğu için sitemap’te yok.

---

## 5. Belgeler

| Dosya | Hizalama |
|---|---|
| `PEDAGOJI.md` | Model uyumsuzluğunda kod haritaya eşitlenir. «Beş aşama» ders metninin yazım sırasıdır; üretim 0–5 altı adımdır; beş medya katmanı ayrıdır. Ek-J: ilk konu kamu, pilot yalnız 6. sınıf, süre ölçülmüş sestir, grafik tahta oynatıcı yedeği değildir. |
| `MANIFESTO.md` | Aynı model cümlesi. Seçmeli kart yıllık müfredat değildir. |
| `.cursorrules` | Üretim kapısı «0–5, altı adım» diye yazılır. Beş medya katmanı ayrı nesnedir. Kapı silinmedi. |
| `ANAYASA.md` A1–A5 | Değiştirilmedi. B6 zaten kodla aynı kapıyı söylüyordu. |
| `ops-dron.md` | `RAIL_V1_HOPS` **33 kayıt**. Kod sabiti `RAIL_V1_HOP_META_COUNT = 33`. |

`AKADEMI_URETIM_ANAYASASI.md` model haritası ve aşama kapısı silinmedi.

---

## 6. Sözleşme

Junior raf dersine isteğe bağlı `narrationShort` eklendi (`v1-contract`, `openapi-v1.json`, `packages/kernel/src/generated/v1.ts`). Eski istemci alanı yok sayabilir.

---

## 7. Test

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | geçti |
| `npx vitest run` | 393 dosya, 1911 test geçti |
| `npm run verify:api-auth -- --check` | 77 rota, sapma yok |
| `npm run verify:junior-content` | geçti (111 senaryo, 13 kab). Çıktıdaki «açık» satırları kazanım kapsam notudur; komut kırılmadı. |

Lighthouse çalıştırılmadı. Canlı `PriceCatalogEntry` ve üretim `SUPER_ADMIN_USER_ID` okunmadı. `jr_06_mat-6` sesi uzatılmadı.

---

## SUPER_ADMIN

Tedavi paketi kod ve belge tarafında tamamlandı. Üretim kutusunun açılması için `SUPER_ADMIN_USER_ID`, `yapinet360@gmail.com` oturum UUID’si ile birebir aynı olmalıdır. Bu değer bu turda dosyadan okunmadı.
