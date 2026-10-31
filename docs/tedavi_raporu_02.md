# Tedavi Raporu 02 — GA4 fişi, sayfa geçişi, huni ölçümü

Tarih: 2026-10-31  
Kaynak: `docs/tespit_raporu_02.md`  
Kapsam: ölçüm kimliği kapısı, CSP, App Router `page_view`, dönüşüm olayının tek `gtag` yolu, Junior yıllık paket hunisi, Search Console meta kapısı, site haritası `lastmod`.

Üretim `G-` kimliği bu turda repoya yazılmadı. Vercel paneli açılmadı. Canlı HTML’e etiket basılması, kimliğin derleme anında gömülmesine bağlıdır.

## Özet

| İş | Sonuç |
|---|---|
| GA4 yükleyici | Geçerli `G-` kimliğinde nonce’lu `gtag/js` basılır. Boş, `GTM-` ve bozuk kimlik yine `null` döner. |
| CSP | Kimlik geçerliyken `script-src`, `connect-src` ve `img-src` Google Analytics ile Tag Manager kökenini açar. Kimlik yokken bu kökenler kapalı kalır. |
| Sayfa geçişi | `send_page_view: false`. Her rota `usePathname` + `useSearchParams` ile `page_view` olur. |
| `purchase` | Cüzdan kapanışı ve PayTR dönüşü aynı `trackPurchase` → `gtag('event', 'purchase', …)` yoludur. |
| Kayıt | `sign_up` aynı `gtag('event', …)` yoludur. Düz `dataLayer` nesnesi kalkmıştır. |
| Junior | İniş `view_item`, kasa `begin_checkout`, paket açılınca `purchase`. |
| Search Console meta | Jeton varsa `google-site-verification` basılır. Jeton repoda yoktur. |
| `lastmod` | İstek saati değil. Bu çalışma ağacında içerik saati `2026-10-31T00:00:00.000Z`. |

---

## ADIM 1 — GA4 ve sayfa görüntüleme

### Kimlik

Kapı aynı dosyada durur: `lib/kernel/telemetry/measurement-id.ts`. Biçim `G-` ve ardından 4–32 harf veya rakam. Boşluk, `GTM-`, `UA-` ve tırnak artığı etiketi düşürür. Sayfa bu yüzden 500 vermez.

`.env.example` içinde `NEXT_PUBLIC_GA_ID=""` duruyor. Bu değişken `NEXT_PUBLIC_` olduğu için Next derlemede gömer. Panelde değer yazmak, yeniden derleme olmadan canlı HTML’e etiketi koymaz.

`components/kernel/ga4-bootstrap.tsx` kimlik geçerliyken iki `next/script` basar. İkisi de `afterInteractive` ve isteğin `x-nonce` değerini taşır. İlk boyama bekletilmez. Nonce okunamazsa etiket nonce’suz kalır; `strict-dynamic` o betiği keser, sayfa ayakta kalır.

Yapılandırma artık otomatik sayfa görüntüleme göndermez:

`gtag('config', '<G-…>', { send_page_view: false })`

İlk belge ve sonraki geçişler tek dinleyiciden gider. Aksi halde ilk URL iki kez sayılırdı.

### CSP

`lib/kernel/telemetry/csp.ts` kimlik geçerliyken üç liste üretir. `lib/kernel/security/edge-guard.ts` bunları kenar politikasına ekler.

| Yönerge | Köken |
|---|---|
| `script-src` | `https://www.googletagmanager.com` |
| `connect-src` | `https://www.google-analytics.com`, `https://*.google-analytics.com`, `https://*.analytics.google.com`, `https://www.googletagmanager.com` |
| `img-src` | `https://www.google-analytics.com`, `https://*.google-analytics.com`, `https://www.googletagmanager.com` |

`script-src` üzerindeki nonce + `strict-dynamic` CSP3 tarayıcıda host listesini yedek tutar. Collect çağrısı `connect-src` ile gider. Beacon kesilirse görüntü taşıması `img-src` ile gider.

Kimlik boşken bu üç liste boş string döner. Canlı sitede etiket yokken Analytics kökeninin kapalı olması bu kapıyla örtüşür. Etiket açılınca aynı istekte CSP de açılır.

GTM kabı (`GTM-`) reddedilmeye devam eder. İkinci bir konteyner eklenmedi.

### Rota dinleyicisi

`components/kernel/ga4-route-page-view.tsx` istemci bileşenidir. `usePathname` ve `useSearchParams` değişince `trackPageView` çağrılır. `useSearchParams` kök kabukta `Suspense` içindedir. Dinleyici yalnız kimlik geçerliyken, `Ga4Bootstrap` tarafından basılır.

Olay parametreleri:

- `page_path`: yol + süzülmüş sorgu
- `page_location`: aynı köken + bu yol
- `page_title`: belge başlığı doluysa
- `page_referrer`: `http`/`https` ise, sorgusu aynı süzgeçten geçmişse

Sorgu süzgeci `publicPageQuery`. Kampanya anahtarları (`utm_source` ve benzeri) kalır. Düşenler: `p` (kasa pasaportu), `token`, `access_token`, `refresh_token`, `id_token`, `code`, `state`, `email`, `password`, `session`, `secret`, `sig`, `signature`, `jwt`. 160 karakterden uzun değer de düşer.

Huni olayları (`view_item`, `begin_checkout`, `purchase`) yolun sorgu dizesini taşımaz. Pasaport bu olaylara yazılmaz.

---

## ADIM 2 — Huni

### `emitSemConversion`

`lib/kernel/sem/conversion.ts` içindeki `dataLayer.push({ event, … })` kalktı. Bu biçim GTM içindir. Burada GTM yok; gtag kuyruğu `gtag('event', ad, parametre)` bekler.

Yeni yol:

| Çağrı | GA4 olayı |
|---|---|
| `emitSemConversion("purchase", …)` | `trackPurchase` → `purchase` |
| `emitSemConversion("register")` | `sign_up`, `method: "email"` |
| `emitSemConversion("form", …)` | `generate_lead` |

Birinci taraf `yetkin:conversion` olayı duruyor. E-posta ve parola parametreleri GA’ya kopyalanmaz. Komut dosyası bu dosyadan yüklenmez. Kimlik yoksa fonksiyon no-op kalır.

Kayıt formu `components/auth/register-form.tsx` aynı `emitSemConversion("register")` çağrısını kullanır. Olay artık `sign_up` olarak gtag kuyruğuna gider.

### Cüzdan ve PayTR `purchase`

İkisi de `lib/kernel/telemetry/funnel.ts` içindeki `trackPurchase` fonksiyonunu çağırır. Parametre şekli ortaktır: `item_id`, `value` (kuruş / 100), `currency`, `items[]`, varsa `transaction_id`.

| Yol | Ne zaman | Tutar | `transaction_id` |
|---|---|---|---|
| Cüzdan kapanışı | `purchase-button` satın alma yanıtı `id` döndürünce | Düğmedeki `priceMinor` | Defterdeki satın alma `id` |
| PayTR dönüşü | `kasa-return-panel`, `sonuc` hata değilken | Dönüş sayfasında yoksa `begin_checkout` hafızası | Dönüş URL’sinde yok |

Hafıza anahtarı `sessionStorage` `yetkin:ga4:checkout`. `begin_checkout` bu kaydı yazar. Dönüş sayfası kapanırsa olay kaçabilir; bu sınır duruyor. Web kasasında bakiye yetmeyince PayTR iframe’i `/cuzdan` adresine döner. Satın alma olayı, lisans satırı yazılınca üst penceredeki `trackPurchase` ile bir kez gider.

`value_minor` kuruş olarak da durur. GA4 `value` birim para birimidir (89000 kuruş → 890).

### Junior oda

Kalem kimliği katalog satırıyla aynıdır: `cat_junior_yearly`. Ad: `Junior yıllık paket`. Tutar `readJuniorYearlyPrice` sonucundan `juniorYearlyMeasurement` ile gelir. Katalogda fiyat yoksa tutar uydurulmaz; olay tutarsız kalır. Sayfa kaynağı `amountMinor` taşımaz. Oyun puanı ve cüzdan yasağı (`junior-faz2-pilot`) durur.

| Adım | Olay | Yer |
|---|---|---|
| Paket inişi | `view_item` | `/junior`, `JuniorPackageViewItem` |
| Kasa adımı | `begin_checkout` | `/junior/checkout`, oturum açık, paket kapalı, satış kapısı açıkken `JuniorCheckoutBeacon` |
| Satın alma | `purchase` | Paket `ACTIVE` olunca |

Kasa adımı sayfa açılışıdır. «Ödemeye geç» ikinci bir `begin_checkout` basmaz.

`purchase` iki kapıdan gelir:

1. Ödeme isteği iframe’siz `ACTIVE` dönerse (sipariş zaten CLEARED ve lisans yazılmış) olay hemen gider. `transaction_id` siparişin `merchantOid` değeridir.
2. iframe dönüşü tek başına satın alma sayılmaz. `/cuzdan` gömülü sayfası başarı ile hatayı ayırmaz ve dönüşü `ok` diye bildirir. Form, `GET /api/junior/shelves` ile paketi yoklar. `plan.status === "ACTIVE"` olunca `purchase` gider. Açılmazsa olay basılmaz.

Yoklama aralıkları 1 + 1,5 + 2 + 3 + 5 + 8 + 8 + 8 saniye, her aralıktan önce bir okuma. Pencere yaklaşık kırk saniyedir. Bildirim bu pencereden sonra gelirse ve ziyaretçi sayfadan çıkmışsa olay düşer. Defter yine asıl kayıttır.

Satış kapalıyken kasa `begin_checkout` basmaz. Paketi zaten açık hesap kasa düğmesini görmez.

---

## ADIM 3 — Search Console ve site haritası

### HTML doğrulama

`lib/copy/site-verification.ts` jetonu şu sırayla okur:

1. `GOOGLE_SITE_VERIFICATION`
2. `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
3. Kaynak sabiti `GOOGLE_SITE_VERIFICATION_STATIC` (boş)

Biçim: 20–128 karakter, harf, rakam, `_`, `-`. Boşluk, `<` ve tırnak düşer. Geçerli jeton yoksa meta basılmaz.

Kök kabuk `generateMetadata` ile isteğe bağlı `verification.google` yazar. Next bunu `<meta name="google-site-verification" content="…">` olarak head’e koyar. Jeton repoya ve bu rapora yazılmadı. DNS TXT kayıtları duruyor; HTML meta, jeton ortama konunca aynı mülkü ikinci bir yöntemle doğrular.

`.env.example` iki doğrulama anahtarını boş atar. `lib/kernel/env.ts` şeması aynı anahtarları opsiyonel tutar.

### `lastmod`

`app/sitemap.ts` istek saati basmaz. `lib/copy/sitemap-lastmod.ts` günü şöyle seçer:

1. `SITE_CONTENT_REVISED_AT` ortam değişkeni `YYYY-MM-DD` ise o UTC günü. Gelecek gün, bugünün UTC gününe çekilir.
2. Ortam boşsa içerik dosyalarının değişim günlerinin en yenisi. Alt sınır `lib/copy/seo.ts` içindeki editöryal mühür `2026-10-27T00:00:00.000Z`. Daha eski bir dosya saati mühürü geri çekmez.
3. Sonuç süreç içinde önbelleğe alınır. Aynı süreçte iki istek aynı günü görür.

Saat kaynağı dosyalar: `lib/copy/seo.ts`, `lib/copy/legal-launch.ts`, `lib/copy/json-ld.ts`, `lib/junior/limits.ts`, `lib/academy/pilot-sku.ts`, `app/sitemap.ts`.

Bu çalışma ağacında en yeni saat `app/sitemap.ts` (`2026-10-31T17:41:29Z`). Basılan `lastmod`: `2026-10-31T00:00:00.000Z`.

Vercel işlev kopyasında dosya saati çoğu zaman derleme anıdır. O zaman `lastmod` derleme gününe oturur. İstek anına oturmaz. Operatör günü elle kilitlemek isterse `SITE_CONTENT_REVISED_AT=2026-10-31` yeter.

---

## ADIM 4 — Doğrulama

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | Geçti |
| `npm run verify:api-auth -- --check` | Geçti. 77 rota. |
| `npm run verify:boundaries` | Geçti |
| `npx vitest run` | 1947 geçti, 10 kaldı. 400 dosya. |

Kalan 10 test Akademi ses mühründedir (`01_office_ai-k1` süre, parça sayısı, karaoke). Bu tur o kaset dosyalarına dokunmadı. Ölçüm testleri geçti: `tests/kernel/ga4-funnel.test.ts`, `tests/copy/seo-surface.test.ts`, `tests/kernel/junior-faz2-pilot.test.ts`, `tests/kernel/env-example-surface.test.ts`, `tests/kernel/auth-identity-ux-surface.test.ts`.

Vitest bir işçi zaman aşımı da yazdı (`onTaskUpdate`). Test sayısına eklenmedi.

Tarayıcıda canlı etiket turu yapılmadı. Kimlik boşken yükleyici düğüm basmaz; bu davranış birim testte kilitli. Canlı HTML’de `gtag/js` görmek için üretim `G-` kimliği ve yeniden derleme gerekir.

---

## Operatörde kalan

1. Vercel Production `NEXT_PUBLIC_GA_ID` = geçerli `G-` kimliği. Preview ve Development boş kalabilir. Kayıt sonrası yeniden derleme. Çerez metni GA4’ü birinci taraf ölçüm olarak anlatıyor (`lib/copy/legal-launch.ts`). Ayrı bir pazarlama pikseli eklenmedi.
2. Deploy sonrası kök HTML’de `googletagmanager.com/gtag/js` ve CSP’de `google-analytics.com` aranır. Kimlik boşsa ikisi de görünmez.
3. Search Console HTML yöntemi istenirse `GOOGLE_SITE_VERIFICATION` doldurulur. DNS TXT duruyorsa bu adım şart değildir. Site haritası `https://yetkin.ai/sitemap.xml` mülke bu turda panelden gönderilmedi.
4. Yönetici hunisindeki gerçekleşmiş satış ile GA4 `purchase` haftalık yan yana okunur. Sapmada defter esastır. Junior `purchase`, paket `ACTIVE` olduktan sonra gider; bildirim gecikirse GA geride kalabilir.
