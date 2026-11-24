# yetkin.ai — E-Ticaret K1–K6 Kapanış Raporu

**Tarih:** 23 Kasım 2026
**Karar:** **ONAY — Koşulsuz Tam Ölçekli Ticari Ürün**
**Puan:** **86 / 100** (44 → 61 → 73 → 78 → **86**)
**Girdi:** `docs/ETICARET_80PLUS_TESCIL_RAPORU.md` (78 / 100, Şartlı Onay). O raporun tam ölçek şartı K1 ve K2 idi; K3–K6 kapanmadan ekran «gönderildi» demeyecek ve günlük net gerçekleşen kâr diye sunulmayacaktı.

Bu tur kaynak kodu değiştirdi. Altı bulgu kapanış testiyle kilitlendi. Kapılar bu oturumda fiilen koşuldu.

---

## 1. Puan kartı

Ağırlıklar önceki denetimlerle aynı: Mimari Hazırlık %25, Mevcut İşlevsellik %30, Ticari Farklılaşma %25, UX / Vitrin %20.

| Eksen | 78 | **Bu tur** | Neden |
|---|---:|---:|---|
| **Mimari Hazırlık** | 80 | **88** | İtilen kuruş `channelListingSaleMinor`: ilan `priceMinor` doluysa o, boşsa varyant `amountMinor`. 15 dk işçi `priceMinor` taşır. Stok, CSV ve yayın kapısı aynı kuralı kullanır. Saatlik tarama `lastRepricedAt` artan, `nulls: first`, 200’lük pencereyi döndürür. |
| **Mevcut İşlevsellik** | 76 | **86** | CSV Trendyol / Hepsiburada satırını `PENDING` yapar ve `publishAppliedTrendyolStock` çağırır. `DRAFT` kritik stok hedefi değildir. Set satışı üye ilanını da `PENDING` yapar; `appliedPushes` dizisinin tamamı kuyruğa girer. |
| **Ticari Farklılaşma** | 77 | **86** | Taban her taramada güncel maliyet, KDV bayrağı, kargo baremi ve kanal komisyonundan kurulur. Kayıtlı taban değiştiyse yazılır. Rakip, son 24 saatin en düşük `competitorPriceMinor` değeridir. Karar bu tabanla mühürlenir. |
| **UX / Vitrin** | 78 | **84** | Kuyruğa alınan iş «pazaryeri eşitleme kuyruğuna alındı» der. Yalnız yerel yazım «yerel fiyat güncellendi; periyodik eşitlemede pazaryerine aktarılacak» der. Günlük özet katalog anlık görüntüsünü gerçekleşen kâr diye basmaz. |
| **Toplam** | **78** | **86** | `88×0,25 + 86×0,30 + 86×0,25 + 84×0,20 = 86,1 → 86`. Eksenler 90’ın altında: canlı pazaryeri HTTP’si bu oturumda ölçülmedi. |

78’lik kartın tavanı altı bulguydu. Altısı kapandı. 80 eşiği aşıldı. Toplam, önceki raporların yuvarlamasıyla **86**.

---

## 2. Kapanış matrisi

| Madde | Karar | Ne değişti |
|---|---|---|
| **K1** İlan fiyatı | **Kapandı** | `pending-listing-sync.ts` dönüşüne `priceMinor` girdi. `syncPendingChannelListings` dolu ilan fiyatını itilen tutar yapar. `publishAppliedTrendyolStock` her ilan için `channelListingSaleMinor(listing, fallback)` kullanır; kardeş ilanın fiyatı boşsa yedek varyant tutarıdır. `postCommerceInventory` `appliedPushes` dizisinin her elemanını iter. CSV, Trendyol / Hepsiburada güncellemesinden sonra `publishAppliedTrendyolStock` çağırır. |
| **K2** Saatlik taban | **Kapandı** | `runRepricerSweep` her kuralda `resolveFloor` çağırır. `nextComputedFloor` değiştiyse `computedFloorMinor` yazılır. Hesap yoksa bayat tabanla karar verilmez. Gözlem `observedAt >= şimdi − 24 saat` içinden `lowestObservedCompetitorMinor` ile okunur. Sıra `lastRepricedAt: { sort: "asc", nulls: "first" }`. Her taramada `lastRepricedAt` damgalanır; fiyat değişmeyen kural 200’lük pencerenin önünü tutmaz. |
| **K3** RESTOCK / DRAFT | **Kapandı** | `criticalRestockVariantId` `status === "DRAFT"` bedeni eler. Adaylar `ACTIVE` ve `PASSIVE`. En düşük satılabilir adet kazanır. Yalnız taslak varsa hedef yoktur. |
| **K4** Set üye ilanı | **Kapandı** | `moveWithSetMembers` uygulanan üye hareketlerini `memberPushes` olarak döner. Trendyol ve Hepsiburada çekimi bu diziyi `enqueueMovedStock` ile `PENDING` yapar ve itmeyi kurar. `applyVariantMovement` satılan varyantın ve her üyenin `commerce_channel_listings` satırını `PENDING` çeker; `commitChannelOrderPrisma` `queuedPushes` tamamını yayınlar. Envanter POST yalnız `appliedPushes[0]` ile yetinmez. |
| **K5** Gerçekleşen net | **Kapandı** | Son 24 saatte `CHANNEL_SALE` / `SALE` gerçekleşen neti, `RETURN_RESTOCK` iade ve iptal etkisini üretir. Tutar, hareketin kanalındaki ilan fiyatı doluysa odur; boşsa varyant tutarıdır. `selectRealizedCommerceMoves` kanal defterinin envanter ikizini (`event=ORDER_`) ve `Set üyesi:` düşümünü ikinci kez saymaz. Özet alanları `realizedNetMinor` ve `returnImpactMinor`. Başlık neti `realizedNetMinor − returnImpactMinor`. Katalog birim neti `catalogNetMinor` olarak durur; gerçekleşen kâr diye sunulmaz. |
| **K6** Dürüst metin | **Kapandı** | Kokpit «ilan fiyatını yayınlar» demez; «pazaryeri eşitleme kuyruğuna alındı» der. REPRICE, ilan `PENDING` olduysa kuyruk cümlesini, eşlenmiş ilan yoksa yerel cümleyi basar. CSV `economicsImportMessage` aynı ayrımı kurallı yazar. |

---

## 3. Kilitlenen senaryolar

`tests/commerce/k1-k6-closure.test.ts`

- Dolu `priceMinor` (9.900) itilen tutardır; boş ilan varyant tutarına (12.000) düşer.
- İşçi kaynağı `priceMinor: row.priceMinor` taşır. CSV ve yayın kapısı `channelListingSaleMinor` çağırır. Envanter döngüsü `appliedPushes[0]` değildir.
- `nextComputedFloor(10.000, 11.200)` tabanı yeniler. 24 saat içindeki 9.400, daha yeni 13.000’in ve pencere dışı 8.000’in önüne geçer.
- Taslak elde 0, pasif elde 1, aktif elde 2 → hedef pasiftir. Yalnız taslak → hedef yok.
- Set satışı üye kimliklerini `memberPushes` olarak döner ve yerel adedi düşer. Envanter satışı set, kupa ve tabak için üç itme kurar. Üye ilanı `PENDING` olur; yayın tutarı 15.000 kuruştur, varyant tutarı 10.000 yedekte kalır.
- Kanal satışı 2 adet ilan fiyatından (15.000) netlenir; aynı fişin envanter ikizi ve set üyesi satırı eklenmez. Bir iade `returnImpactMinor` olur. Varyant tutarı (10.000) bu neti kurmaz.
- Kokpit ve günlük fiyat aksiyonu kuyruk cümlesini taşır; «pazaryerine gönderildi» ve «ilan fiyatını yayınlar» kalkmıştır.

---

## 4. Kapılar (23 Kasım 2026, bu oturum)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ çıkış 0 |
| Dil aksı | `npm run verify:sen-axis` | ✅ 543 dosya, 37 kalıp |
| Sınır | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda |
| API ↔ auth | `npm run verify:api-auth -- --check` | ✅ 152 rota (`session:91, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| RLS | `npm run verify:rls-status` | ✅ `commerce_channel_price_rules`, `commerce_competitor_quotes`, `commerce_reprice_logs`, `commerce_demand_feeds` sicilde |
| Sır | `npm run verify:no-secrets` | ✅ PEM / service_role JWT / yasaklı atama yok |
| Test | `npx vitest run tests/commerce tests/tezgah` | ✅ **46 dosya / 360 test** (önceki tur 45 / 348) |
| Derleme | `npx next build` | ✅ çıkış 0. Next.js 16.3.1, derleme 31,2 sn, 184 statik sayfa |

360 testin içinde K1–K6 kapanış dosyası vardır. Önceki turun «yeşil test ilan fiyatını taşımaz» notu bu dosyayla kapanır: tarama testi dolu `priceMinor` ile itilen tutarı ölçer.

Canlı Trendyol / Hepsiburada HTTP yanıtı, canlı SMTP ve canlı Postgres migration’ı bu oturumda ölçülmedi. Karar, isteği kuran ve kuyruğa koyan koda ve bu oturumdaki testlere dayanır.

---

## 5. Bilerek duran, puanı tek başına oynatmayan notlar

- Akakçe ve Cimri komisyon kanalı değildir. Karar günlüğe yazılır; vitrin fiyatı bu iki kanaldan değişmez. BuyBox itmesi Trendyol ve Hepsiburada ile sınırlıdır.
- OS yayın adaptörünün gövdesi barkod ve adet taşır. Satış fiyatı ayrılmış `pushTrendyolPriceAndStock` / Hepsiburada fiyat-stok yolundadır. Bu tur o yola ilan kuruşunu bağlar.
- İç içe set açılmaz. Üye bağı bir kattır.
- Günlük özet hareket sorgusu kanal defteri ve envanter için ayrı ayrı en fazla 500 satır okur.
- Girdi KDV’si satış oranıyla mahsup edilir. Ayrı alış oranı alanı yoktur.
- Rakip fiyatı URL’den çekilmez. Besleme oturum ve `Idempotency-Key` ister.

Bu notlar K1–K6’yı yeniden açmaz.

---

## 6. Resmî karar

**86 / 100. ONAY.**

Modül **Koşulsuz Tam Ölçekli Ticari Ürün** bandındadır. 78’lik şartlı onayın «otomatik kanal fiyatı açılmaz» ve «set satışı self-serve açılmaz» daraltması bu turda kalkar: itilen tutar ilan fiyatıdır, set üyesinin ilanı da kuyruğa girer, saatlik tarama bayat tabanla karar vermez.

78’lik karttaki şu üç daraltma durur, çünkü bu turun kapanış listesinde değildi ve puanı tek başına oynatmaz:

1. Akakçe / Cimri raf fiyatı yazmaz.
2. Rakip fiyatı kazıma ile okunmaz.
3. Canlı pazaryeri HTTP’si bu kod ağacının birim testiyle ölçülmez; teslimat kuyruk ve mühür katmanındadır.

Şartlı onayın «K1 ve K2 kapanmadan tam ölçek yazılmaz» cümlesi bu raporda kapanmış sayılır.

---

*Kapı çıkışları 23 Kasım 2026 oturumunda alındı. `npx tsc --noEmit` çıkış 0. `npx vitest run tests/commerce tests/tezgah` 46 dosya / 360 test, çıkış 0. `npx next build` çıkış 0.*
