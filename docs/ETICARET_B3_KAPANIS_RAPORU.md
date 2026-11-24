# E-Ticaret B3 kapanışı — çok kaynaklı pazar talebi radarı

Tarih: 23 Kasım 2026. Bu tur `docs/ETICARET_FINAL_ONAY_RAPORU.md` §3.3 **B3** satırını kapatır. Faz 4 raporu bu maddeyi açık bırakmıştı: radar yalnız `OWN_CATALOG` yazıyordu. Tarama artık dört kaynağı da `CommerceCatalogGapSignal.source` alanına yazar: `OWN_CATALOG`, `MARKETPLACE_TREND`, `TETKIK`, `GRANT_CALL`.

Talep endeksi, arama hacmi ve satış fiyatı istemciden veya modelden alınmaz. Skor, kayıtlı rakip fiyatı, rekabet kuralı, tetkik skoru, hibe destek oranı ve mağazanın kendi fiyat bandından hesaplanır. Kanıt yoksa sinyal yazılmaz.

## 1. Sinyal üreticileri

Saf hesap `lib/commerce/radar-signals.ts` içindedir. Veritabanı bu dosyada yoktur. `lib/commerce/opportunity-radar.ts` kayıtları okur, skoru buradan alır ve `CommerceCatalogGapSignal` ile `CommerceProductSuggestion` satırlarını yazar.

| Kaynak | Girdi | Talep endeksi | Arz açığı | Fiyat bandı |
|---|---|---|---|---|
| `OWN_CATALOG` | En az 3 aktif, maliyetli ürün | Kategorinin katalog içindeki payı | Boş fiyat bandı | Katalogdaki boş 50 TL bandı |
| `MARKETPLACE_TREND` | `CommerceCompetitorQuote` ve `FIXED` olmayan `CommerceChannelPriceRule` | Kategorideki kayıtlı gözlem payı (fiyat adedi ve kural adedi ayrı ayrı, sonra ortalama) | Bant katalogda yoksa 100; rakip veya kural fiyatı mağaza ortancasının altındaysa kayıtlı fark yüzdesi | Rakip veya kural fiyatının 50 TL bandı |
| `TETKIK` | `stage = shop` olan tetkik; kategori kelimesi başlık, host veya metinde | Eşleşen rapor / kayıtlı vitrin tetkiki | `100 − ortalama kayıtlı skor` | Mağazanın kategori ortanca fiyatı veya beslemedeki kayıtlı bant |
| `GRANT_CALL` | Yayında ve başvurusu açık çağrı; etiket veya başlık kategoriyle eşleşir | `supportRatioBps / 100` | Aynı kayıtlı oran | Mağaza bandı. Hibe tutarı satış fiyatı yapılmaz |

Gözlem yoksa, destek oranı 0 ise, tetkik skoru boş bant bırakmıyorsa veya kategori eşleşmiyorsa dizi boş kalır. `buildRadarBundle` her kaynaktan en fazla 5 sinyal alır.

Öneri metni kaynağı açık yazar: «Katalog Boşluğu», «Pazaryeri Trendi», «Web Tetkik Talebi», «Hibe Çağrı Uyumu». Aynı kategoriyi birden fazla kaynak besliyorsa kartlar birleşir; `signalIds` ve `sources` hepsini taşır. Hedef fiyat `formatTryMinor` ile TL basılır. Havuz bağlantısı `poolSeedHref`: `/panel/e-ticaret?sekme=havuz&taslakBaslik&taslakKategori&hedefFiyat`.

## 2. Modül sınırı

E-ticaret, Tezgâh ve YetkinHibe tablolarına doğrudan girmez.

- Pazaryeri: mağazanın kendi `commerce_competitor_quotes` ve `commerce_channel_price_rules` satırları.
- Tetkik ve hibe: `lib/kernel/market-demand/platform-demand-port.ts`. Port oda motorunu import etmez. Son 80 tetkik raporunu ve başvurusu açık en fazla 100 yayınlanmış çağrıyı okur. Skor, tetkik kolonundan; destek oranı çağrı satırından gelir. Bozuk JSON ve destek oranı olmayan çağrı atılır. Havuz tutarı okunmaz.
- Dış besleme: `commerce_demand_feeds`. Tarama bu tabloyu silmez. Satır, bir sonraki taramada yeniden skora çevrilir.

Besleme gövdesindeki `demandIndex` ve `supplyGap` alanları yok sayılır. `POST` gövdesi düz kanıttır (rakip fiyatı, tetkik skoru, destek oranı). Diskteki satır kanonik biçimdedir; tarama `reviveRadarFeed` ile aynı alanları yeniden doğrular.

Şema: `prisma/schema/commerce.prisma` → `CommerceDemandFeed`. Migration: `prisma/migrations/20261123160000_b3_demand_feed/migration.sql`. Tablo `RLS_FORCE_TABLES` içindedir. Migration `ENABLE` + `FORCE ROW LEVEL SECURITY` ve `rls_deny_unscoped` politikasını kurar. Bu tur canlı veritabanına migration uygulamaz.

## 3. Besleme ucu

`POST /api/commerce/stores/[storeId]/radar/signals`

- `export const auth = "session"`
- `Idempotency-Key` zorunlu (`postRadarSignals` → `requireRailV1IdempotencyKey`)
- Mağaza `requireOwnedStore` ile okunur; sahip değilse 404
- Kaynak yalnız `MARKETPLACE_TREND`, `TETKIK`, `GRANT_CALL`. `OWN_CATALOG` reddedilir
- Kanıt sinyal üretmezse 422. Talep endeksi uydurulmaz
- Başarı hem `commerce_demand_feeds` hem `commerce_catalog_gap_signals` satırı yazar

Sicil: `lib/kernel/security/route-auth-map.ts` ve `lib/kernel/http/web-only-write-routes.ts` (`product-commerce-radar-signals`).

## 4. Kokpit

`components/commerce/profit-engines-panel.tsx` her önerinin `sources` dizisini rozet olarak basar: Pazaryeri Trendi, Tetkik Talebi, Hibe Uyumu, Katalog Boşluğu. Hedef satırı `formatTryMinor` kullanır. «Havuza taslak olarak yaz» bağlantısı `cockpitHref(row.seedHref)` ile durur.

## 5. Test

`tests/commerce/b3-radar-sources.test.ts`

- Pazaryeri payı (3/4 → 75, 1/4 → 25) ve boş bant
- Rekabet kuralının kayıtlı fiyat düşüşü
- Vitrin olmayan tetkik ve eşleşmeyen kategori düşer
- Kapalı çağrı, sıfır destek oranı ve başka sektör düşer; açık çağrı `%50` yazar
- Dört kaynaklı paket öneri gerekçesine ve `signalIds` alanına yazılır
- Bozuk tetkik JSON ve desteksiz hibe satırı `null`
- Tarama dört `source` etiketini yazar; havuz bağlantısı durur
- Platform boşken beslenen hibe çağrısı taramaya girer; tek ürün `OWN_CATALOG` üretmez
- `demandIndex: 999` yok sayılır; skor 100 ve kanıt `quoteCount: 2` olur. Aynı `Idempotency-Key` ikinci yazmayı çalıştırmaz. Anahtarsız istek 400. Başka mağaza 404

## 6. Kapı kanıtı

Hepsi bu turda, çıkış kodu 0.

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | tamam, hata yok |
| `npm run verify:sen-axis` | OK — 543 dosya, 37 siz kaçağı tarandı |
| `npm run verify:boundaries` | OK — kernel dikey import etmez, oda duvarı durur |
| `npm run verify:api-auth -- --check` | OK — 152 route. session 91, public 27, closed 11, cron 2, admin 13, webhook 8 |
| `npm run verify:rls-status` | OK — `commerce_demand_feeds` Prisma tabloları ile sicilde |
| `npm run verify:no-secrets` | OK — PEM / service_role JWT / yasaklı `.env` yok |
| `npx vitest run tests/commerce tests/tezgah` | 45 dosya, 348 test geçti |
| `npx next build` | derlendi. TypeScript bitti. 184 sayfa. Rota listesinde `/api/commerce/stores/[storeId]/radar/signals` var |

Kokpit rozeti, oturum açmış satıcı ekranında tıklanarak gezilmedi. Rozet metni, `formatTryMinor` ve `seedHref` sözleşmesi bileşen kaynağı ve tarama yanıtı testiyle doğrulandı.
