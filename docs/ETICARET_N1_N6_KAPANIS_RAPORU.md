# E-Ticaret N1–N6 kapanış raporu

Tarih: 23 Kasım 2026. Kaynak denetim: `docs/ETICARET_FINAL_ONAY_RAPORU.md` (73 / 100, şartlı onay).

## Karar

**76 / 100 — koşulsuz pilot eşiği.**

Denetim 76'yı ve onayı N1, N2 ve N3'ün kapanmasına bağladı. Üçü kapandı. N4, N5 ve N6 (§3.2, 76 ile 80 arası kalite borçları) de kapandı. §3.3 B1–B7 duruyor; **80 yazılmadı.** 73'ün ağırlığı `75×0,25 + 73×0,30 + 70×0,25 + 73×0,20 = 72,75` idi. Eksen tavanlarının gerekçesi bu altı kusurdu. Yeni kesir üretilmedi: 77–79 uydurulmaz, 80 B listesi kapanmadan yazılmaz.

Şartlı onayın üç daraltması (fiyatı pazaryeri panelinde elle değiştir, set satışını kapat, OS yayınını kimliksiz bırak) bu altı kapanışın konusuydu. Canlı Trendyol / Hepsiburada HTTP yanıtı ve canlı SMTP teslimatı bu oturumda ölçülmedi. Karar, isteği kuran ve kuyruğa koyan koda dayanır.

## N1 — Yayın kimliği ve barkod

Yeni bağlantı `sales_channels.apiKeySeal` içine `satıcı:anahtar:sır` üçlüsünü mühürler (`formatTripleCredential`, alan hâlâ `apiKey`). `commerce_marketplace_credentials` üç ayrı mühürle durur; sipariş cron'u o kasayı okumaya devam eder.

Eski mühür yalnız API anahtarıysa yayın, kasadaki üç alanı açıp üçlüyü kurar (`resolveBroadcastKey`). Webhook HMAC ve simülasyon sırrı üçlünün orta parçasıdır (`webhookSecretFromBroadcastKey`); imza anahtarı değişmez. Yanıt gönderimi üçlünün tamamını adaptöre bırakır.

Stok/fiyat kodu sırası: ilan `remoteBarcode`, yoksa varyant `barcode`, yoksa `sku` (`resolveMarketplaceCode`, `channelItemCode`). Trendyol gövdesi `barcode`, Hepsiburada `merchantSku` bu kodu taşır. N11 ve Amazon gövdesi sku ile kalır.

## N2 — PENDING işçi ve anlık itme

`applyReprice` ilanı `PENDING` yapar ve `publishAppliedTrendyolStock` ile Trendyol ve Hepsiburada fiyat/stok olayını kuyruğa koyar. Kuyruk hatası fiyat yazımını geri almaz; satır `PENDING` kalır. Satıcı metni: fiyat ve ilan sayısı, "pazaryerine gönderildi".

`commerce-pending-listing-sync` her 15 dakikada (`TZ=Europe/Istanbul */15 * * * *`) `syncStatus === "PENDING"` ilanları tarar (en fazla 100, `updatedAt` artan). Fiyatı olan satır Trendyol / Hepsiburada itmesiyle `SYNCED`, `PENDING` veya `FAILED` olur. İtme fırlatırsa satır `FAILED` işaretlenir. `DATABASE_URL` yoksa tarama `{ scanned: 0 }` döner.

## N3 — Set üye stoğu, aynı işlem

`lib/commerce/set-stock.ts` saf planlayıcıdır (`planSetMemberDraws`). Üye yoksa boş plan. Adet geçersizse 422. Aynı üye bir kez yazılır. Anahtar `anahtar:set:varyant`.

Kanal yolu (`applyVariantMovement`) set varyantını yazar, satış veya iade ise üyeleri **aynı Prisma işleminde** düşer veya geri koyar. Üye reddi `BundleMemberStockError` fırlatır; işlem geri alınır. Trendyol ve Hepsiburada sipariş çekimi `moveWithSetMembers` kullanır: bellek ve Prisma işlemi kısa stokta ana hareketi de geri alır.

Envanter POST aynı planlayıcıyı satış ve iade için çağırır. `inventory-sql.ts` tek varyant ifadesi olarak durur; set satışında ifade, aynı işlemde üye başına bir kez çalışır. İç içe set açılmaz: üye hareketi yeniden set aramaz.

`approvedStockQty`, her üye hareketinden sonra o ürünün varyant toplamına çekilir.

## N4 — Hedef varyantlı RESTOCK

Kritik beden, satılabilir adedi (`onHand − safetyBuffer`) en düşük olan varyanttır. Eşitlikte listedeki ilk kalır. Tarama `ACTIVE` ve `PASSIVE` bedenleri okur; kâr satırı `PASSIVE` ve `DRAFT` bedeni atlar.

Taslak notu `variant:<id>` (`stock_ledgers.note`, 500). Onay `resolveInboundVariant` ile o bedene giriş yapar. Hedef ürünün varyantlarında yoksa 422: "Hedef varyant bu üründe yok." Not boşsa ilk `ACTIVE`, o da yoksa ilk varyant. Elle açılan boş notlu taslak bu yolda kalır.

## N5 — Ondalık kuruş kalkanı

`scrubInventedNumbers` kuruş ekini yalnız tam sayıda kabul eder. `"85,00 kuruş"` ve `"85.00 kuruş"`, `rawMinor: 8500` iznine uymaz ve metin boşalır. `"8500 kuruş"` durur. Birimsiz `"85,00"` biçimli TL izni olarak durur.

Kampanya istemi modele TL ve yüzde verir. "Rakamları yalnız TL ve yüzde olarak yaz. Kuruş ve baz puan yazma."

## N6 — Ekran ve hesap

Paket gerekçesi tutarı `formatTryFromMinor` ile TL yazar. `sameBand`, her üyenin kendi baremini paket toplamının baremiyle karşılaştırır. İlk üye üst baremde, ikinci üye alt baremdeyse `sameBand` yanlıştır.

Kokpit varyantı `costMinor`, `desiGrams`, `vatBps` taşır. Seçim değişince kutular o bedenin kayıtlı değerine döner; kayıt yoksa yer tutucu `50,00` / `1000` / varsayılan KDV. Kayıtlı maliyet `0` da kutuya yazılır.

Kaydırıcı `campaignPreviewInput` ile sunucu `simulateCampaign` girdisini kullanır: kanal `commissionBps`, düz `cargoMinorPerOrder`, `returnRateBps`, `adCostMinorPerOrder`. Desi baremi bu kutuya girmez. Kanal satırı yoksa Trendyol varsayılanı (komisyon 2100 bps, kargo 3990, iade 800, reklam 0).

`LOSS` kampanya sunucuda 422 döner, metin üretilmez, satır yazılmaz: "Bu indirim zarar yazıyor. Kampanya kaydedilmedi." Düğme aynı kararda kapalıdır.

`readOutboundPublicIp` tüm `127.0.0.0/8` bloğunu, `localhost`, `::1`, `0.0.0.0` ve `::ffff:127.*` adreslerini loopback sayar. Çekim denenmez.

Kokpit "ikinci bir form yok" demez. Mağaza masasının kanal sayfasının durduğu ve sipariş kimliğinin kokpit kaydı olduğu yazılır. Simülasyon "eşitleme kaydı gitti" demez: `PUSHED` kanalları sayar, diğerlerini "bekliyor veya reddetti" der. Yayın satırı yoksa "Başka kanala yayın satırı düşmedi."

## Testler

`npx vitest run tests/commerce tests/tezgah` — **43 dosya, 327 test, çıkış 0.** Denetim turu 41 dosya / 312 testti.

Yeni dosyalar:

- `tests/commerce/n1-n6-closure.test.ts` — üçlü mühür, webhook sırrının API anahtarı olması, barkod sırası, Trendyol üçlüsü + uzak barkod, PENDING sayacı, 15 dk cron metni, set planı, hedef varyant, TL istemi, kaydırıcı girdisi, simülasyon yayın cümlesi.
- `tests/commerce/campaign-loss-gate.test.ts` — `LOSS` kayıt 422, `invokeLlm` ve kampanya satırı çağrılmaz.

Güncellenen kabul testleri: `channel-webhook` (yayın satırında `barcode` / `variantId`), `faz3-aksiyon-motorlari` (itme çağrısı ve `variant:` notu), `os-load-variants` (maliyet alanları ve Trendyol varsayılanı), `os-channel-license` (açılan mühür `27380001:trendyol-api-key-1:secret-value-1`), `profit-math` (ondalık kuruş reddi, bütün üyelerin baremi, gerekçede TL), `set-stock` (ikinci üye yetmezse ilki de geri gelir), `subscription-renewal-ip` (`127.0.0.2`, `127.8.8.8`, `::ffff:127.0.0.2`).

## Kapılar

Hepsi son ağaçta, çıkış kodu 0. Tarih 23 Kasım 2026.

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | çıkış 0, tanı yok |
| `npm run verify:sen-axis` | OK — 536 dosya, 37 siz kaçağı tarandı (app + components + lib/copy) |
| `npm run verify:boundaries` | OK — kernel↛dikey, UI↛prisma, oda duvarları, tablo sahipliği |
| `npm run verify:api-auth -- --check` | OK — 146 route. session 85, public 27, closed 11, cron 2, admin 13, webhook 8, hybrid 0, internal 0 |
| `npm run verify:rls-status` | OK — Auth sync, FORCE RLS, owner SELECT, kapsamsız deny |
| `npm run verify:no-secrets` | OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok |
| `npx vitest run tests/commerce tests/tezgah` | 43 dosya, 327 test, çıkış 0 |
| `npx next build` | çıkış 0. Next.js 16.3.1 Turbopack. Derleme 23,9 s, TypeScript 16,7 s, 184 statik sayfa 2,7 s. Duvar saati 56,5 s |

## Tarayıcı

`npx next start -p 3000` sonrası `http://127.0.0.1:3000/panel/e-ticaret` **Giriş** sayfasına döndü (`/login?next=/panel/e-ticaret`). Oturum açılmadan varyant seçimi, kaydırıcı ve `LOSS` düğmesi tıklanmadı. Bu üç davranış birim testinde ve üretim derlemesinin TypeScript adımında duruyor. Sunucu kontrol bitince kapatıldı.

## Bilerek duranlar

- B1 çok mağaza, B2 iade sonrası kâr düzeltmesi, B3 radar kaynağı, B4 CSV maliyet, B6 girdi KDV sözleşmesi, B7 kargo baremi tekilliği. B5, N2 ile kapandı.
- Set kartı doğarken üye stoğunu kopyalar; düşüm satış ve iade anındadır.
- Üye ilanı, set satışı sırasında kendiliğinden `PENDING` olmaz. Üye `onHand` ve `approvedStockQty` aynı işlemde güncellenir. Pazaryeri üye adedi, ilan zaten `PENDING` ise 15 dk taramasında ya da ayrı bir stok itmesinde gider.
- İç içe set (üyenin kendisi set) açılmaz.
- 00:00–07:00 arasında panelin yazdığı özeti 07:00 cron'u atlar. `proposeBundles` yeni öneriden önce `PROPOSED` satırlarını `DISMISSED` yapar. İkisi de N1–N6 listesinin dışında bırakıldı.
