# E-Ticaret Faz 4 — kanal fiyatı, rekabet motoru, B1/B2/B4/B6/B7

Tarih: 23 Kasım 2026. Bu tur `docs/ETICARET_FINAL_ONAY_RAPORU.md` §3.3 içinden istenen **B1, B2, B4, B6, B7** satırlarını ve kanal bazlı kâr korumalı rekabet motorunu kod ağacına yazdı. **B3** (gerçek talep: `GRANT_CALL` / `TETKIK` / `MARKETPLACE_TREND`) bu turda yok. Önceki rapor, 80+ kararını B1–B7 kapanmadan vermez. B3 durduğu için bu belge resmi puanı 80 diye yeniden yazmaz; kapanan beş madde ve rekabet motoru aşağıdadır.

Rakip fiyatı dış siteye bot ile gidilerek okunmaz. Fiyat, satıcının veya entegrasyonun `POST /api/commerce/stores/[storeId]/competitors/ingest` gövdesinden gelir: tekil kayıt, `quotes` listesi, `feed.items` veya JSON-LD `Offer`/`price`. URL fetch edilmez.

## 1. Kanal fiyatı ve rekabet motoru

Üç tablo `prisma/schema/commerce.prisma` ve `prisma/migrations/20261123141500_faz4_channel_repricer/migration.sql` içindedir. Üçü de `RLS_FORCE_TABLES` sicilindedir. Migration `ENABLE` + `FORCE ROW LEVEL SECURITY` ve `rls_deny_unscoped` politikasını idempotent kurar.

| Tablo | Tekillik |
|---|---|
| `commerce_channel_price_rules` | `(store_id, variant_id, channel)` |
| `commerce_competitor_quotes` | besleme günlüğü, kanal + varyant indeksi |
| `commerce_reprice_logs` | karar günlüğü |

Kanal kümesi: `TRENDYOL`, `HEPSIBURADA`, `OWN_STORE`, `AKAKCE`, `CIMRI`.

Saf matematik `lib/commerce/repricer.ts`:

- `computeChannelFloorPrice` tabanı `profit.profitablePriceMinor` kapalı formundan üretir. `manualFloorMinor` varsa sonuç `Math.max(matematik, manuel)` olur. Denklem imkânsızsa ve manuel taban yoksa `null` döner; uydurma fiyat yazılmaz.
- `evaluateRepriceDecision`: rakip baz fiyatın üstündeyse fiyat baza döner (`REVERT_TO_BASE`). Rakip tabanın altındaysa fiyat `floorPriceMinor` kalır ve karar `COMPETITOR_BELOW_FLOOR_ALERT` olur. Cümle: «Rakip tabanının altına indi, tekli üründe zarar etme; 2'li paket önerisini değerlendir». Aradaki bantta `UNDERCUT_STEP` rakip eksi `stepMinor`, `MATCH_LOWEST` rakibin kendisi; ikisi de `Math.max(hedef, taban)` ile mühürlenir. `FIXED` rakibi kovalamaz.

`REVERT_TO_BASE` şemadaki dört kararın dışındadır. Rakip bazın üstündeyken gereksiz indirimi geri alan davranışın adı budur; o davranışı `MATCHED` diye yazmak günlüğü yanıltırdı.

Akakçe ve Cimri komisyon kanalı değildir. Taban hesabı o iki kanalda kendi mağaza maliyetini (`OWN_STORE`) kullanır. Trendyol ve Hepsiburada kendi kanal ekonomisini kullanır. Kargo, desi baremine düşüyorsa baremden, düşmüyorsa kanalın kargo tutarından okunur.

`autoApply: true` iken besleme kararı hemen yazar. Trendyol ve Hepsiburada ilanının `price_minor` alanı güncellenir, ilan `PENDING` olur ve kanal itmesi kuyruğa girer. İlan fiyatı boşsa itme, eskisi gibi varyant fiyatını kullanır (`channelListingSaleMinor`). Kendi mağazada aktif fiyat varyant tutarına yazılır. Akakçe ve Cimri yalnız kural ve günlüğe yazılır.

Periyodik işçi `commerce-repricer-sweep`, Europe/Istanbul her saat **:20**. Son gözlemi okur. Fiyat değişmediyse ve aynı taban uyarısı zaten günlüğe yazıldıysa ikinci satır açmaz.

Rotalar oturum ister. Yazma rotaları `Idempotency-Key` ister ve mağaza sahibi değilse 404 döner.

| Rota | Fiil |
|---|---|
| `/api/commerce/stores/[storeId]/repricer/rules` | POST |
| `/api/commerce/stores/[storeId]/repricer` | GET |
| `/api/commerce/stores/[storeId]/competitors/ingest` | POST |

## 2. Backlog

**B1.** `selectCockpitStore` `?magaza=` kimliğini sahibin mağazalarından seçer. Parametre yoksa veya yabancıysa havuz adı, o da yoksa ilk mağaza kalır. Kokpit ürün, kanal, gelen kutu ve Trendyol ekonomisini yalnız seçili mağazadan yükler. Üst çubukta mağaza seçici vardır; büyüme sekmesinin mağaza adı da bu kimlikten okunur.

**B6.** `commerce_unit_economics.cost_includes_vat` varsayılan `false`. `true` ise `calculateUnitNet` maliyetin içindeki alış KDV'sini `vatIncludedMinor(cogs, vatBps)` ile mahsup eder ve nete ekler. Kapalı form aynı tutarı sabit giderden düşer. Kokpitte «Maliyet KDV dahil» anahtarı vardır. Örnek: 100,00 TL fiyat, 40,00 TL maliyet, %20 KDV, %20 komisyon, 10,00 TL kargo, %5 iade, 2,00 TL reklam. KDV hariç net 6,33 TL; KDV dahil maliyette girdi KDV'si 6,67 TL ve net 13,00 TL (`tests/commerce/faz4-repricer.test.ts`).

**B2.** Günlük özet son 24 saatteki `RETURN_RESTOCK` fişlerini tarar. Stok motoru iade ve iptali bu tipe yazar; not `ORDER_RETURNED` / `ORDER_CANCELLED` ayırır. Saf sınıflandırıcı `RETURN` ve `CANCEL` tiplerini de tanır. `returnImpactMinor` = bilinen birim net × adet. Günlük `netMinor` katalog birim netinden bu etkiyi düşer. Özet satılabilir adedi, iade adedini ve iptal adedini de taşır. Birim neti bilinmeyen fişin tutarı 0 kalır.

**B4.** `GET .../economics/export-csv` SKU, ad, stok, maliyet, KDV, desi ve beş kanalın baz/aktif fiyatını indirir. `POST .../economics/import-csv` maliyeti, KDV bayrağını, desiyi ve kanal baz/aktif fiyatını tek transaction'da yazar. Stok deftere dokunulmaz. Aktif fiyat tabanın altına inemez. Trendyol/Hepsiburada ilanı `PENDING` olur; kendi mağaza fiyatı varyanta yazılır.

**B7.** `commerce_shipping_tariffs` üzerinde `(store_id, carrier, band_min_grams, band_max_grams)` unique indeksi vardır. Migration, indeksten önce aynı bandın eski satırlarını siler; en güncel `effective_from` kalır.

## 3. Kapılar

Aynı oturumda alınan çıkış kodları. Canlı Postgres'e migration uygulanmadı. Canlı Trendyol/Hepsiburada HTTP yanıtı ölçülmedi. Kokpit tarayıcıda tıklanmadı; `npx next build` istemci derlemesini ve statik sayfa üretimini geçti.

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | çıkış 0 |
| `npm run verify:sen-axis` | OK — 542 dosya |
| `npm run verify:boundaries` | OK |
| `npm run verify:api-auth -- --check` | OK — 151 rota, session 90 |
| `npm run verify:rls-status` | OK — üç yeni tablo sicille örtüşür |
| `npm run verify:no-secrets` | OK |
| `npx vitest run tests/commerce tests/tezgah` | 44 dosya, 336 test geçti |
| `npx next build` | Next.js 16.3.1, derleme geçti, 184 statik sayfa |

Yeni rotalar derleme çıktısında durur: `competitors/ingest`, `economics/export-csv`, `economics/import-csv`, `repricer`, `repricer/rules`.
