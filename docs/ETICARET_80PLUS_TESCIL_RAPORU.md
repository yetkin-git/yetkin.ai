# yetkin.ai — E-Ticaret Modülü Nihai Puan Kartı ve Tam Ölçekli Ticari Ürün Kararı

**Denetim tarihi:** 23 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / E-Ticaret Ürün Mimarı
**Denetim konusu:** N1–N6, B1–B7 ve Akakçe / Cimri / BuyBox rekabet motoru kapanış beyanının bağımsız çapraz doğrulaması
**Referans:** `docs/ETICARET_TESPIT_RAPORU.md` (**44 / 100**), `docs/ETICARET_SONUC_RAPORU.md` (**61 / 100**), `docs/ETICARET_FINAL_ONAY_RAPORU.md` (**73 / 100, Şartlı Onay**)
**Beyanlar:** `docs/ETICARET_N1_N6_KAPANIS_RAPORU.md`, `docs/ETICARET_FAZ4_80PLUS_RAPORU.md`, `docs/ETICARET_B3_KAPANIS_RAPORU.md`
**Kural:** Hiçbir kaynak dosya değiştirilmedi, silinmedi, oluşturulmadı. Yalnız bu rapor yazıldı.

**Yöntem:** Beyan edilen yollar satır satır okundu (şema → mühür → itme → işçi → kâr formülü → rota → kokpit). Taban kararı ve girdi KDV örneği bu oturumda `tsx` ile yeniden üretildi. Bölüm 3'teki yedi kapı bu oturumda fiilen koşuldu. Yeşil test, ilan fiyatının pazaryerine vardığı anlamına gelmez; N2 testi itmeyi sahte bir fonksiyonla kilitliyor ve `priceMinor` taşımıyor.

---

## 1. Nihai Puan Kartı ve 4 Aşamalı Dönüşüm Özeti (44 → 61 → 73 → 78)

### 1.1 Puan: **78 / 100** (44 → 61 → 73 → **78**, bu tur **+5**)

Kapanış raporları N1–N6 için 76, B listesi ve rekabet motoru için 80 eşiğini ima ediyor. Gerçekleşme **78**. 80 tutmuyor. Tam ölçekli self-serve lansman imzalanmıyor.

Ağırlıklar ilk üç denetimle aynı: Mimari Hazırlık %25, Mevcut İşlevsellik %30, Ticari Farklılaşma %25, UX / Vitrin %20.

| Eksen | 44 | 61 | 73 | **Bu denetim** | 73 → 78 |
|---|---:|---:|---:|---:|---:|
| **Mimari Hazırlık** | 42 | 63 | 75 | **80** | +5 |
| **Mevcut İşlevsellik** | 58 | 61 | 73 | **76** | +3 |
| **Ticari Farklılaşma** | 30 | 60 | 70 | **77** | +7 |
| **UX / Vitrin** | 40 | 58 | 73 | **78** | +5 |
| **Toplam** | **44** | **61** | **73** | **78** | **+5** |

Hesap, önceki raporların yuvarlamasıyla aynı yöntem:

- `42×0,25 + 58×0,30 + 30×0,25 + 40×0,20 = 43,4 → 44`
- `63×0,25 + 61×0,30 + 60×0,25 + 58×0,20 = 60,65 → 61`
- `75×0,25 + 73×0,30 + 70×0,25 + 73×0,20 = 72,75 → 73`
- `80×0,25 + 76×0,30 + 77×0,25 + 78×0,20 = 77,65 → 78`

### 1.2 Eksen gerekçeleri

| Eksen | Puan | Neden bu puan |
|---|---:|---|
| **Mimari Hazırlık** | **80** | Kokpit mührü `satıcı:anahtar:sır` üçlüsü. Eski tek parça mühür, pazaryeri kasasından üçlüye tamamlanıyor. `PENDING` işçi, kargo baremi tekil indeksi, dört kaynaklı radar portu ve yeni tabloların RLS sicili duruyor. Tavan burada: ilan fiyatı (`priceMinor`) ile itilen tutar iki ayrı sayı. İşçi ilan fiyatını seçip sonra atıyor. Saatlik rekabet taraması 200 kuralla sınırlı ve kayıt anındaki tabanı yeniden hesaplamıyor. |
| **Mevcut İşlevsellik** | **76** | N1, yerel N3, N5, B1, B6 ve B7 kodda tutuyor. N2, ilan fiyatı boşken varyant fiyatını itebiliyor. Kanal fiyatı varyanttan ayrılınca hem 15 dakikalık işçi hem stok itmesi hem CSV `PENDING` satırı pazaryerine çıkmadan `PENDING` kalıyor. N4 notu doğru bedeni okuyor; seçici taslak bedeni de aday sayıyor. Envanter yolu üye düşümünü aynı işlemde yapıyor, kuyruğa yalnız ilk varyantı koyuyor. |
| **Ticari Farklılaşma** | **77** | Saf karar, rakip tabanın altındayken fiyata inmiyor. Bu oturumda: rakip 9.000 kuruş, taban 10.000 kuruş → `COMPETITOR_BELOW_FLOOR_ALERT`, yeni fiyat 10.000. Girdi KDV örneği 6,33 TL → 13,00 TL üretiyor (alış KDV'si 6,67 TL). Tavan: taban, kural kaydındaki `computedFloorMinor`. Maliyet sonradan artarsa saatlik tarama eski tabanı kullanır. Tarama son gözlemi okur, kanaldaki en düşük rakibi okumaz. Akakçe ve Cimri fiyatı rafta değiştirmez; bu, Faz 4 beyanının kendi sınırı. |
| **UX / Vitrin** | **78** | `?magaza=` ikinci mağazayı özne yapıyor. Maliyet KDV anahtarı, CSV uçları ve radar rozetleri duruyor. Ekran hâlâ işin bittiğini söylüyor: kokpit «ilan fiyatını yayınlar», REPRICE «pazaryerine gönderildi». Günlük net, satılan cironun kârı değil; katalogdaki birim netlerin toplamından iade etkisi düşülüyor. |

### 1.3 Tek cümlelik teşhis

> Kimlik, yerel set düşümü ve kâr formülü artık duruyor; kanal fiyatı yazıldığı anda stok ve fiyat itmesi aynı ilanda kilitleniyor ve ekran bunu «gönderildi» diye anlatıyor.

73'lük denetimin üç yüksek kusurundan N1 kapandı, N3 yerel stokta kapandı, N2 ise kanal fiyatı boşken kapandı ve kanal fiyatı doluyken yeniden açıldı. 80'in şartı olan B listesinin B1, B3, B6 ve B7'si tutuyor. B2 sayı üretir, gerçekleşen kârı geri yazmaz. B4 dosyayı yazar, Trendyol / Hepsiburada ilanına o dosyadaki fiyatı teslim edemez.

---

## 2. N1–N6, B1–B7 ve Rekabet Motoru Çapraz Doğrulama Matrisi

Durum sözlüğü: **Kapandı** = kabul ölçütü kodda ve (varsa) bu oturumdaki canlı hesapta tutuyor. **Kısmi** = beyanın bir yarısı tutuyor, satıcının gördüğü sonuç veya bir yan yol tutmuyor. **Açık** = beyan kodda yok.

| Madde | Karar | Kanıt |
|---|---|---|
| **N1** Üçlü kimlik | **Kapandı** | Yeni bağlantı `formatTripleCredential` ile mühürleniyor (`lib/commerce/os-service.ts:453-459`). Eski mühür üçlü açılmazsa `resolveBroadcastKey` kasadaki satıcı, anahtar ve sırrı birleştiriyor (`lib/commerce/channel-webhook-live.ts:28-56`). |
| **N1** Uzak barkod | **Kapandı** | Sıra `remoteBarcode` → varyant barkodu → sku (`lib/commerce/channel-broadcast.ts:54-67`, çağrı `:149-157`). Trendyol gövdesi `barcode: channelItemCode` (`lib/commerce/channel-adapters.ts:153`). Hepsiburada `merchantSku` aynı kodu taşıyor (`:198`). Ayrılmış itme yolu ilanın `remoteBarcode` alanını kullanıyor (`lib/commerce/trendyol-sync.ts:216`). |
| **N2** Anlık itme | **Kısmi** | `applyReprice` varyant tutarını yazar, ilanı `PENDING` yapar ve `publishAppliedTrendyolStock` çağırır (`lib/commerce/daily-brief.ts:556-573`). İlanın `priceMinor` alanı bu yazımda değişmez (`:562-564`). İtme, yeniden okuduğu ilan fiyatı olay tutarına eşit değilse HTTP'ye çıkmadan `PENDING` döner (`lib/commerce/trendyol-sync.ts:189-194`, Hepsiburada `lib/commerce/hepsiburada-sync.ts:189-194`). |
| **N2** 15 dk işçi | **Kısmi** | Cron `TZ=Europe/Istanbul */15 * * * *` ve `DATABASE_URL` yoksa `{ scanned: 0 }` (`lib/kernel/jobs/inngest.ts:507-520`). Sorgu `priceMinor` seçer, dönüş nesnesi bu alanı atar (`lib/commerce/pending-listing-sync.ts:82-91`). `channelListingSaleMinor` ilan fiyatını göremez ve varyant tutarına düşer (`:59`, `lib/commerce/listing-price.ts:10-17`). İlan fiyatı varyanttan farklıysa itme muhafızı yine `PENDING` döner. Test bu yolu ölçmez: sahte `push`, gövdede `priceMinor` yok (`tests/commerce/n1-n6-closure.test.ts:115-140`). |
| **N3** Kanal / webhook set düşümü | **Kapandı** (yerel) | Webhook satış tipi `SALE`; üye planı aynı Prisma işleminde (`lib/commerce/channel-stock-engine.ts:269-278`, `lib/commerce/channel-stock-prisma.ts:275-314`). Üye reddi `BundleMemberStockError` fırlatır, işlem geri alınır (`:351-352`). Trendyol ve Hepsiburada çekimi `moveWithSetMembers` (`lib/commerce/trendyol-sync.ts:106`, `lib/commerce/hepsiburada-sync.ts:106`). Kısa stokta `CommerceRollback` (`lib/commerce/set-stock.ts:141-149`). |
| **N3** Üye ilanının pazaryeri adedi | **Açık** | Envanter POST üye hareketini diziye koyar, kuyruğa yalnız `appliedPushes[0]` gider (`lib/commerce/service.ts:747-798`). Sipariş çekimi üye ilanını `PENDING` yapmaz. Webhook yayını satılan ürünün kendi kartını basar; başka üründeki üye bu yayına girmez. Yerel adet doğru, üyenin Trendyol / Hepsiburada ilanı eski adette kalır. |
| **N4** Hedef varyant | **Kısmi** | Not `variant:<id>` (`lib/commerce/stock-sync.ts:56-62`). Onay `resolveInboundVariant` ile o bedeni arar; ürünün varyantında yoksa red (`:89-99`, çağrı `lib/commerce/os-service.ts:279`). Seçici durum süzmez (`lib/commerce/stock-sync.ts:69-82`). Günlük tarama bu fonksiyonu ürünün bütün varyantlarıyla çağırır (`lib/commerce/daily-brief.ts:153`). Taslak bedenin eldeki adedi 0 ise hedef, tükenen aktif beden değil taslaktır. |
| **N5** Ondalık kuruş | **Kapandı** | `kuruş` eki ayraç taşıyorsa metin boşalır (`lib/commerce/profit-text.ts:209-212`). Kampanya istemi «Kuruş ve baz puan yazma» der (`lib/commerce/campaign-engine.ts:186-191`). |
| **N6** Ekran | **Kısmi** | «İkinci bir form yok» cümlesi yok. Kokpit, mağaza masasının durduğunu yazar (`components/commerce/os-cockpit.tsx:699-701`). Simülasyon `PUSHED` sayar (`lib/commerce/os-service.ts:816-833`). `LOSS` kayıt 422 (`lib/commerce/campaign-engine.ts:238-239`). Aynı satır «ilan fiyatını yayınlar» der. REPRICE metni, kuyruk susmuş olsa bile «gönderildi» der (`lib/commerce/daily-brief.ts:590-592`). `publishAppliedTrendyolStock` testte ve olay gönderilemeyen ortamda hiçbir şey yapmadan döner (`lib/commerce/trendyol-publish.ts:15-16`). |
| **B1** `?magaza=` | **Kapandı** | `selectCockpitStore` kimliği sahibin mağazalarında arar; yoksa havuz adı (`lib/commerce/os-rules.ts:89-100`). Sayfa `params.magaza` okur (`app/(kernel)/panel/e-ticaret/page.tsx:17-18`). Yükleme seçilen mağazanın ürün, kanal ve ekonomisini çeker (`lib/commerce/os-load.ts:93-102`). Seçici `url.searchParams.set("magaza", …)` (`components/commerce/os-cockpit.tsx:338`). |
| **B2** `returnImpactMinor` | **Kısmi** | Sınıflandırıcı `RETURN_RESTOCK` notundan iade ve iptali ayırır (`lib/commerce/return-impact.ts:20-28`). Günlük özet son 24 saatte en fazla 500 fiş okur ve katalog birim netinden bu tutarı düşer (`lib/commerce/daily-brief.ts:232-247`). Katalog neti, adet çarpımı değil, aktif varyant başına bir birim nettir (`:169-170`, `:219`). Üç iade, hiç satılmamış bir katalog anlık görüntüsünden üç birim net düşer. Kanal ilan fiyatı bu hesaba girmez; fiyat `variant.amountMinor`. |
| **B3** Dört kaynak | **Kapandı** | `OWN_CATALOG`, `MARKETPLACE_TREND`, `TETKIK`, `GRANT_CALL` (`lib/commerce/radar-signals.ts:15`). Talep endeksi istemciden okunmaz (`:473-475`). Tetkik ve hibe `lib/kernel/market-demand/platform-demand-port.ts` üzerinden gelir; dosya oda motoru import etmez. Besleme ucu oturum, `Idempotency-Key` ve mağaza sahibi ister. `verify:boundaries` bu turda ihlal görmedi. |
| **B4** CSV | **Kısmi** | Dışa aktarma ve içe aktarma uçları oturum sicilinde (`lib/kernel/security/route-auth-map.ts:75`). İçe aktarma maliyeti, KDV bayrağını ve kanal fiyatını tek işlemde yazar; aktif fiyat `Math.max(aktif, taban)` (`lib/commerce/economics-transfer.ts:171-185`). Stok defterine dokunulmaz. Trendyol / Hepsiburada ilanı `priceMinor` + `PENDING` olur (`:216-220`) ve bu fonksiyondan itme olayı çıkmaz. Teslimat 15 dk işçiye kalır. İşçi ilan fiyatını atınca satır `PENDING` kalır. |
| **B6** `costIncludesVat` | **Kapandı** | Kolon varsayılan `false` (`prisma/schema/commerce.prisma:495`, migration `ADD COLUMN`). `calculateUnitNet` alış KDV'sini nete ekler (`lib/commerce/profit.ts:216-225`). Kapalı form aynı tutarı sabit giderden düşer (`:287-288`). Bu oturum: hariç net **633** kuruş (6,33 TL), dahil net **1.300** kuruş (13,00 TL), girdi KDV'si **667** kuruş (6,67 TL). Tek oran hem satış hem alış KDV'sidir; ayrı alış oranı alanı yoktur. |
| **B7** Barem tekilliği | **Kapandı** (şema) | `@@unique([storeId, carrier, bandMinGrams, bandMaxGrams])` (`prisma/schema/commerce.prisma:517`). Migration, indeksten önce eski kopyayı siler; en güncel `effective_from` kalır (`prisma/migrations/20261123141500_faz4_channel_repricer/migration.sql:12-24`). Bu oturum canlı veritabanına migration uygulamadı. |
| **Rekabet — taban** | **Kapandı** (saf) | `computeChannelFloorPrice` → `profitablePriceMinor`. Kanal komisyonu, kargo (barem varsa barem, yoksa kanal tutarı), KDV ve `costIncludesVat` aynı girişte (`lib/commerce/repricer-service.ts:60-80`, `lib/commerce/repricer.ts:79-99`). Akakçe ve Cimri `OWN_STORE` ekonomisini kullanır (`repricer-service.ts:41-46`). |
| **Rekabet — taban altı** | **Kapandı** (saf) | `competitor < floor` ise karar `COMPETITOR_BELOW_FLOOR_ALERT`, fiyat `floorPriceMinor`, cümle paketi işaret eder (`lib/commerce/repricer.ts:144-149`). `UNDERCUT_STEP` sonucu tabanın altıysa `HOLD_AT_FLOOR` (`:162-165`). `writeDecision` bir kez daha `Math.max(karar, taban)` uygular (`lib/commerce/repricer-service.ts:326`). Bu oturumda ölçüldü: rakip 9.000, taban 10.000, adım 100 → fiyat 10.000, uyarı metni duruyor. Rakip 10.500 → fiyat 10.400. Rakip 13.000 → baz 12.000. |
| **Rekabet — rafa çıkış** | **Kısmi** | `autoApply` kararı ilan `priceMinor` yazar ve `publishChannelListingPrice` ile o tutarı kuyruğa koyar (`lib/commerce/repricer-service.ts:287-308`). Bu ilk olay, stok o arada değişmediyse ve Inngest olayı gidebiliyorsa tutar. Sonraki stok hareketi varyant tutarını gönderir (`lib/commerce/service.ts:794-798`). İlan fiyatı farklıysa muhafız itmeyi keser. CSV yolu olay bile koymaz. Akakçe / Cimri `applyLivePrice` içinde yazılmadan döner (`:284-286`). |
| **Rekabet — saatlik işçi** | **Kısmi** | Cron `TZ=Europe/Istanbul 20 * * * *` (`lib/kernel/jobs/inngest.ts:524-537`). `autoApply` ve tabanı dolu kurallardan `updatedAt` artan 200 satır (`lib/commerce/repricer-service.ts:482-488`). Fiyat değişmeyen kural `updatedAt` almaz (`:329` erken dönüş). 200'ün dışındaki kural, öndeki 200 değişmedikçe taranmaz. Gözlem `observedAt` azalan tek satırdır (`:496-498`); aynı kanaldaki daha ucuz eski rakip yok sayılır. Taban `computedFloorMinor` olarak okunur, `resolveFloor` çağrılmaz. |

### 2.1 Bu oturumda çalışan sayı

Faz 4 beyanındaki örnek: fiyat 10.000 kuruş, maliyet 4.000, KDV 2.000 bps, komisyon 2.000 bps, kargo 1.000, iade 500 bps, reklam 200.

```
KDV hariç net                         : 633 kuruş   (6,33 TL)
KDV dahil maliyette girdi KDV'si      : 667 kuruş   (6,67 TL)
KDV dahil net                         : 1300 kuruş  (13,00 TL)
Aynı maliyetle taban, KDV hariç, %8   : 10332 kuruş
Aynı maliyetle taban, KDV dahil, %8   : 9006 kuruş
Rakip 9000, taban 10000, adım 100     : COMPETITOR_BELOW_FLOOR_ALERT, fiyat 10000
Rakip 10500, taban 10000, adım 100    : UNDERCUT, fiyat 10400
Rakip 13000, baz 12000                : REVERT_TO_BASE, fiyat 12000
```

Formül beyanı **doğru**. «Kanal fiyatı pazaryerinde korunur» beyanı, ilan fiyatı varyant fiyatından ayrıldığı anda **yanlış**.

### 2.2 Kapılar (23 Kasım 2026, bu oturum)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ çıkış 0 |
| Dil aksı | `npm run verify:sen-axis` | ✅ 543 dosya, 37 kalıp |
| Sınır | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda |
| API ↔ auth | `npm run verify:api-auth -- --check` | ✅ 152 rota (`session:91, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| RLS | `npm run verify:rls-status` | ✅ `commerce_channel_price_rules`, `commerce_competitor_quotes`, `commerce_reprice_logs`, `commerce_demand_feeds` sicilde |
| Sır | `npm run verify:no-secrets` | ✅ PEM / service_role JWT / yasaklı atama yok |
| Test | `npx vitest run tests/commerce tests/tezgah` | ✅ **45 dosya / 348 test** |

348 testin geçmesi kilitlenmeyi kapatmıyor. N2 kabul testi itme fonksiyonunu kendisi veriyor ve ilan fiyatını koymuyor. Rekabet testi saf kararı ve şema metnini kilitliyor; `pushTrendyolListingStock` muhafızının CSV / stok / 15 dk işçisiyle çarpışmasını çalıştırmıyor.

Canlı Trendyol / Hepsiburada HTTP yanıtı, canlı SMTP ve canlı Postgres migration'ı bu oturumda ölçülmedi. Kokpit oturum açılmadan tıklanmadı. Karar, isteği kuran koda ve bu oturumda çalışan saf hesaba dayanır.

### 2.3 Kilitlenme, tek senaryoda

Kanal fiyatı bir kez yazıldıktan sonra üç yol aynı muhafıza çarpar.

1. Rekabet veya CSV, `commerce_channel_listings.price_minor` alanına kanal tutarını yazar. Varyant `amountMinor` Trendyol / Hepsiburada için değişmez (`lib/commerce/repricer-service.ts:277-289`).
2. Stok hareketi, REPRICE veya 15 dk işçi, itme olayına varyant tutarını koyar. İşçi ilan tutarını seçimde görüp nesneye koymaz (`lib/commerce/pending-listing-sync.ts:84-90`).
3. `pushTrendyolListingStock` ilanı veritabanından yeniden okur. `channelListingSaleMinor` dolu ilan fiyatını seçer. Olay tutarı farklıysa fonksiyon `PENDING` döner ve HTTP çağrısı yoktur (`lib/commerce/trendyol-sync.ts:189-194`).

Sonuç: ilk rekabet olayı, stok değişmeden Inngest'e giderse fiyat bir kez çıkabilir. Ondan sonraki stok eşitlemesi ve CSV fiyatı çıkmaz. İlan `PENDING` kalır. Satıcı metni gönderildi der.

---

## 3. Tespit Edilen Yeni Gözlemler / Canlı Operasyon Notları

### 3.1 Tam ölçeği kilitleyen açık

#### K1 — `[YÜKSEK]` Kanal fiyatı, stok itmesini ve `PENDING` işçisini kilitler

Yukarıdaki senaryo N2'nin «kapandı» cümlesini kanal fiyatı boşken doğru, Faz 4 açıldıktan sonra yanlış kılar. B4'ün pazaryeri yarısı da bu kilide bağlıdır: CSV itme olayı koymaz, işçi ilan fiyatını düşürür, muhafız satırı `PENDING` bırakır.

Kendi mağaza kanalı bu kilide girmez. `OWN_STORE` varyant tutarını günceller (`lib/commerce/repricer-service.ts:277-282`). Kilit, Trendyol ve Hepsiburada ilanındadır. Ürünün 80 puanlık vaadi de bu iki kanaldır.

#### K2 — `[YÜKSEK]` Saatlik tarama kârı, kayıttaki eski tabanla korur

`runRepricerSweep` `resolveFloor` çağırmaz. Maliyet, desi, KDV bayrağı veya kanal komisyonu kural kaydından sonra değişirse taban eski kalır. Rakip bu eski tabanın üstünde, yeni maliyetin altındaysa karar `UNDERCUT` veya `MATCHED` olur ve `writeDecision` eski tabanla mühürler. Saf fonksiyonun «tabanın altına inme» vaadi, tabanın kendisi bayatsa zararı engellemez.

Aynı tarama en düşük rakibi değil, son yazılan gözlemi okur. Daha pahalı bir gözlem, duran ucuz rakibin üstüne fiyatı baza çekebilir. 200 kural sınırı, fiyatı değişmeyen öndeki 200 satır yerinde kaldığı sürece arkayı hiç görmez.

### 3.2 Puanı 80'in altında tutan diğer açıklar

#### K3 — `[ORTA]` RESTOCK seçicisi taslak bedeni eleyemez

N4 notu ve onay çözümü doğru. Notu üreten seçim doğru değil. `criticalRestockVariantId` `ACTIVE` / `PASSIVE` ayrımı yapmıyor. Taslak beden elde 0 ile duruyorsa taslak, kritik aktif bedeni yener. Onay o taslağa stok yazar. 73'lük denetimdeki «ilk aktif beden» hatası, taslağı olan kartta hedefin adını değiştirerek duruyor.

#### K4 — `[ORTA]` Set üyesi yerel düşer, üye ilanı düşmez

N3'ün işlem vaadi tutuluyor. Üye başka bir ürünse pazaryeri ilanı `PENDING` olmuyor ve envanter kuyruğu yalnız ilk varyantı itiyor. Set ile tekil, yerel kasada ikinci kez satılmıyor; üyenin pazaryeri ilanı eski adedi göstermeye devam ediyor. İç içe set hâlâ açılmıyor. Bu, kapanış raporunun «bilerek duran» cümlesidir ve tam ölçekte açık kapı olarak durur.

#### K5 — `[ORTA]` Günlük kâr, iade fişinin gerçekleşen etkisini yazmıyor

B2 bir sayı üretiyor. Sayı, satılan adedin kârından iadenin komisyon, kargo ve KDV etkisini düşmek değildir. Katalog anlık görüntüsünden, bulunan fişin birim net × adedini çıkarır. Birim net varyant fiyatındandır; kanal fiyatından değildir. 500 fişten sonrası görünmez. İade, kâr satırını geri yazmaz. 73'lük B2 maddesinin gövdesi bu yüzden kapanmış sayılmıyor.

#### K6 — `[ORTA]` Ekran, kilitlenen itmeyi yayınlanmış sayıyor

| Cümle | Yer | Kod |
|---|---|---|
| «sipariş çeker ve ilan fiyatını yayınlar» | `components/commerce/os-cockpit.tsx:700-701` | K1: ilan fiyatı doluysa itme `PENDING` kalır |
| «ilanın fiyatı ve stoğu pazaryerine gönderildi» | `lib/commerce/daily-brief.ts:592` | Olay gönderilemezse fonksiyon susar; ilan fiyatı uyuşmazsa itme geri döner |
| «maliyet ve kanal fiyatı güncellendi» | `lib/commerce/economics-transfer.ts:240` | Yerel satır güncellenir. Pazaryeri olayı yoktur |

Paket gerekçesi TL yazar ve `sameBand` her üyeyi paket baremiyle karşılaştırır (`lib/commerce/profit.ts:517-519`). Bu iki N6 parçası kapalıdır.

### 3.3 Puanı tek başına oynatmayan, operasyonda duran notlar

- Akakçe ve Cimri komisyon kanalı değildir. Karar günlüğe yazılır, vitrin ve pazaryeri fiyatı bu iki kanaldan değişmez (`lib/commerce/repricer-service.ts:284-286`). BuyBox itmesi Trendyol ve Hepsiburada ile sınırlıdır. Bu, Faz 4 beyanıyla uyumludur; «karşılaştırma sitesindeki fiyat kendiliğinden değişir» diye okunamaz.
- OS yayın adaptörünün Trendyol gövdesi barkod ve adet taşır, satış fiyatı taşımaz (`lib/commerce/channel-adapters.ts:153`). Fiyat, ayrılmış `pushTrendyolPriceAndStock` yolundadır. Webhook yayını stok gövdesidir.
- Üçlü mühür `:` ile ayrılır (`lib/commerce/channel-credentials.ts:100-101`). Parça sayacı tam üç ister (`:87-90`). Anahtar veya sır içinde `:` varsa satış kanalı mührü ayrışmaz; kasa satırı duruyorsa `resolveBroadcastKey` kasadan üçlüyü yeniden kurar. Kasa yazılmamışsa adaptör ham metne düşer.
- `00:00–07:00` arasında panelin yazdığı özeti 07:00 cron'u atlar. `proposeBundles` yeni öneriden önce `PROPOSED` satırlarını `DISMISSED` yapar. İkisi de bu turun kapanış listesinde değildi.
- Girdi KDV'si satış oranıyla mahsup edilir. Alış oranı satıştan farklıysa mahsup o fark kadar kayar. Ayrı alış oranı alanı yoktur.
- Rakip fiyatı URL'den çekilmez. Besleme oturum ve `Idempotency-Key` ister. Bu, kazıma kapısının kapalı kaldığı anlamına gelir; dışarıdaki rafın kendiliğinden okunduğu anlamına gelmez.

---

## 4. Resmî Tam Ölçekli Ticari Ürün Kararı

### Karar: **ŞARTLI ONAY**

**78 / 100.** 80 eşiği aşılmadı. Modül **Tam Ölçekli Ticari Ürün (Self-Serve Lansman)** onayını **almadı.**

73'lük şartlı onayın daraltması (en fazla 5 mağaza, fiyat pazaryeri panelinde elle, set satışı kapalı, OS yayını kimliksiz bırakma) bu turda şöyle değişir:

1. **Kimlik daraltması kalkar.** Kokpit bağlantısı üçlü mührü ve pazaryeri kasasını yazar. Sipariş çekimi o kasayı okur. Yayın adaptörü üçlüyü ve uzak barkodu görür. N1 kapandı.
2. **Otomatik kanal fiyatı açılmaz.** `autoApply`, CSV'den Trendyol / Hepsiburada fiyatı ve dolu `price_minor` bu kararla birlikte açılırsa K1 stok itmesini kilitler. Fiyat değişikliği, ilan fiyatı boşken varyant tutarı üzerinden ya da satıcının pazaryeri panelinde elle kalır.
3. **Set satışı self-serve açılmaz.** Yerel üye düşümü aynı işlemde duruyor. Üye ilanının pazaryeri adedi düşmüyor (K4). Set, denetimli mağazada ve üye ilanı ayrıca kapatılarak açılabilir.
4. **Mağaza sayısı 5'i aşmaz.** B1 seçici ikinci mağazayı özne yapar. Bu, self-serve çok mağaza lansmanı değildir. Saatlik rekabet taraması 200 kuralın ötesini görmez; tarama zaten 2. maddedeki kapatma yüzünden bu pilotun parçası değildir.
5. **73'te tutan beş gövde duruyor.** KDV satış fiyatından düşülür. Kanal satışı çözülen varyanttan düşer. Lisanssız kimlik 403, lisans okunamazsa kapı kapanır. `OUTBOUND_PUBLIC_IP` yoksa veya `127.0.0.0/8` ise yenileme çekimi denenmez. 07:00 cron'u, o sabah ilk kez ürettiği özette `emitCitizenNotice` çağırır.

Tam ölçek **ONAY** için K1 ve K2 kapanmadan yazılmaz. K1 kapanması şudur: itilen tutar, ilan `priceMinor` doluysa o kuruştur; stok, CSV ve 15 dk işçi aynı kuruşu taşır; üye ilanı da kuyruğa girer. K2 kapanması şudur: saatlik tarama tabanı güncel maliyet, kargo, KDV ve komisyondan yeniden kurar ve kanaldaki güncel en düşük gözlemi okur; 200 sınırı arkadaki kuralı aç bırakmaz. K3, K4, K5 ve K6 kapanmadan ekran «gönderildi» demez ve günlük net gerçekleşen kâr diye sunulmaz.

Bu beş şart yazılmadan tahsilat açılırsa, özellikle otomatik rekabet veya CSV kanal fiyatı açılırsa, bu karar **RED** sayılır. Şart yazılırsa karar **ŞARTLI ONAY** olarak kalır. Koşulsuz **ONAY** ve **80+ / self-serve lansman** bu kod ağacında yoktur.

---

*Bu rapor hiçbir kaynak dosyayı değiştirmedi. §2.1 sayıları `lib/commerce/profit.ts` ve `lib/commerce/repricer.ts` fonksiyonlarının 23 Kasım 2026 oturumunda çalıştırılmasıyla üretildi. Kapı sonuçları aynı oturumda alınan çıkış kodlarıdır. Canlı Trendyol / Hepsiburada HTTP yanıtı, canlı SMTP teslimatı ve canlı veritabanı migration'ı ölçülmedi. N1, N2 ve rekabet motoru bu dış sistemlere değil, isteği kuran ve kuyruğa koyan koda dayanır.*
