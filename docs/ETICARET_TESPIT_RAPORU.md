# yetkin.ai — E-Ticaret Modülü ve Tezgâh Araçları Derinlemesine Tespit Raporu

**Denetim tarihi:** 22 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / E-Ticaret Ürün Mimarı
**Kapsam:** `app/(kernel)/e-ticaret`, `app/(kernel)/magazam/**`, `app/(public)/magaza/**`, `app/api/commerce/**` (19 dosya / 33 handler), `app/api/tezgah/**` (14 dosya), `components/commerce/**` (18 dosya / 2.718 satır), `lib/commerce/**` (66 dosya / 10.181 satır), `lib/tezgah/{dukkan,pazaryeri,reklam}/**`, `prisma/schema/{commerce,tezgah}.prisma`, ilgili 8 migration, `tests/commerce/**` + `tests/tezgah/**` (30 dosya / 187 test)
**Kural:** Bu aşamada **hiçbir kaynak kodu değiştirilmedi, silinmedi, düzenlenmedi.** Yalnızca bu rapor üretildi.
**Yöntem:** Statik okuma + rota envanteri çıkarma + şema→kod iz sürme + kapı komutları + iddia/kanıt eşleştirmesi.

---

## 0. Yürütülen Doğrulama Kapıları (kanıt)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip denetimi | `npx tsc --noEmit` | ✅ 0 hata |
| E-ticaret + Tezgâh testleri | `npx vitest run tests/commerce tests/tezgah` | ✅ **30 dosya / 187 test** geçti |
| API ↔ auth haritası | `npx tsx scripts/verify-api-auth.ts --check` | ✅ 135 rota (`session:74, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| Sınır mührü | `npx tsx scripts/verify-boundaries.ts` | ✅ kernel↛dikey, UI↛prisma, oda↛oda engine |
| Dil aksı | `npx tsx scripts/verify-sen-axis.ts` | ✅ 521 dosya tarandı, 0 ihlal |

> **Kritik gözlem:** Bu 5 kapının **hiçbiri** "iki ayrı stok defteri aynı sayıyı mı gösteriyor", "vitrinde yazan kanal gerçekten bağlanabiliyor mu", "kâr hesaplanıyor mu" sorusunu sormuyor. Aşağıdaki `[KRİTİK]` bulguların tamamı yeşil kapılardan geçiyor. Bu bir kapı kusuru değil, **kapı kapsamının ürün sorusu sormamasıdır**.

---

## 1. Yönetici Özeti ve E-Ticaret Modülü Sağlık Skoru

### 1.1 Skor: **44 / 100**

yetkin.ai'nin E-Ticaret modülü, mühendislik açısından Türkiye pazarında nadir görülen bir disipline sahip: **append-only stok defteri**, `FOR UPDATE` ile satır kilidi, idempotency anahtarı olmadan tek kuruş hareket etmeyen bir para hattı, `ccred1:` mühürlü kimlik kasası, gerçek Trendyol/Hepsiburada sipariş çekme cron'ları, 1 TL'lik deneme tahsilatını cüzdana yazmadan mühürleyen bir akış. Bu katman **üretim kalitesinde**.

Buna karşın modül **ürün açısından bir "yönetim paneli"**, bir "kâr beyni" değil. Ve daha ağırı: aynı fiziksel gerçeği (stok) **üç farklı sütunda** tutuyor ve bu üç sütun birbirini güncellemiyor.

| Eksen | Puan | Gerekçe (tek cümle) |
|---|---:|---|
| **Mimari Hazırlık** | **42** | Append-only defter, idempotency ve kimlik mührü örnek niteliğinde; ancak **iki paralel stok defteri, iki paralel kimlik kasası, iki paralel kanal modeli** var ve kâr/komisyon/kargo için şemada **tek satır** yok. |
| **Mevcut İşlevsellik** | **58** | Trendyol + Hepsiburada gerçek push/pull + webhook fişi çalışıyor; Amazon/N11 **tek `fetch`'lik iskelet**; "Tek Tıkla Eşitle" düğmesi **hiçbir şey göndermiyor**; lisans kapısı **yalnız tarayıcıda**. |
| **Ticari Farklılaşma** | **30** | Rakiplerden ayrıştıran tek AI dokunuşu "müşteri sorusuna yanıt taslağı". Kâr, paketleme, kampanya, fırsat radarı — hiçbiri yok. Anlatım ise "Trendyol, Hepsiburada, Amazon ve N11 tek panelden" diyor: bu **StockMount/Ticimax'in cümlesi**, bir AI asistanının cümlesi değil. |
| **UX / Vitrin** | **40** | **Kamuya açık `/e-ticaret` vitrini yok**; adres bir oturum duvarı (`PROTECTED_KERNEL_PATHS`). Huninin ortası boş: `/` → `/fiyatlandirma` kartı → `/register` → kokpit. Kokpitin içi güçlü, ama içeri girmek için 3 adım ve VKN/TCKN şartı var. |

### 1.2 Tek cümlelik teşhis

> **Bu modül, satıcının malını doğru sayan bir muhasebe memuru; satıcının para kazanmasını sağlayan bir ticaret ortağı değil.**

### 1.3 En kritik 5 bulgu

| # | Önem | Bulgu | Ticari etki |
|---|---|---|---|
| 1 | `[KRİTİK]` | **Stok üç yerde, üç farklı sayı.** `commerce_products.approved_stock_qty`, `commerce_variants.on_hand_qty` ve `stock_ledgers`/`inventory_transactions` birbirini güncellemiyor. Kanal webhook'u birini, pazaryeri senkronu diğerini, klasik stok sayfası yalnız varyantı düşürüyor. | Vitrin (varyant) satılan malı görmüyor → **aşırı satış**; kokpit (ürün) yanlış stok gösteriyor → yanlış reklam kararı. |
| 2 | `[KRİTİK]` | **Kâr yok.** Şemada komisyon, kargo, iade oranı, reklam maliyeti, COGS için tek kolon yok; `commerce.prisma` bunu **bilinçli** reddediyor ("Pazaryeri satışı bu tabloya ciro yazmaz"). | Satıcı "kâr ediyor muyum" sorusunun cevabını üründe bulamıyor → **retention yok**. |
| 3 | `[KRİTİK]` | **Kamuya açık vitrin yok.** `/e-ticaret` oturum ister (`edge-guard.ts:42-52`), SEO'da kayıtlı değil, site haritasında yok. | Orta huni (MOFU) tamamen boş; her tıklama doğrudan kayıt duvarına çarpıyor. |
| 4 | `[YÜKSEK]` | **Vitrin vaadi ile kod çelişiyor.** **5 metin satırında** (3 dosya) "Amazon ve N11" satılıyor; bu iki kanalda ne kimlik şeması, ne ilan, ne sipariş çekme var — yalnız tahmin edilmiş URL'e `Bearer` atan bir `fetch`. | Ticari dürüstlük iddiası olan bir üründe **ölçülebilir vaat ihlali**. |
| 5 | `[YÜKSEK]` | **Lisans kapısı istemcide.** "Kanal bağlamak için lisans gerekir" cümlesi yalnız `os-cockpit.tsx:299`'da uygulanıyor; `connectChannel` sunucuda lisans okumuyor. | 30 gün dolduktan sonra API ile kanal bağlanabiliyor; gelir kapısı **atlatılabilir**. |

### 1.4 Modülün gerçek olgunluk tablosu

| Katman | Durum | Kanıt |
|---|---|---|
| Stok defteri (append-only + kilit) | 🟢 Üretim kalitesi | `inventory-sql.ts`, `stock_ledgers_append_only` trigger |
| Para hattı (PayTR + defter + idempotency) | 🟢 Üretim kalitesi | `subscription-checkout.ts`, `paytr-license-bridge.ts` |
| Kimlik kasası (`ccred1:`) | 🟢 Üretim kalitesi | `credential-seal.ts`, AAD `alan:storeId:KANAL` |
| Trendyol (push + pull + webhook) | 🟢 Çalışır | `trendyol-client.ts`, `trendyol-sync.ts`, cron `*/30` |
| Hepsiburada (push + pull + webhook) | 🟢 Çalışır | `hepsiburada-client.ts`, `hepsiburada-sync.ts`, cron `*/30` |
| Amazon / N11 | 🔴 İskelet | `channel-adapters.ts:5-7, 226, 250` |
| Kâr / komisyon / kargo zekâsı | 🔴 Yok | `commerce.prisma` içinde tek kolon yok |
| Paket / set / barem motoru | 🔴 Yok | — |
| Fırsat radarı | 🔴 Yok | — |
| Günlük kâr özeti | 🔴 Yok | `inngest.ts` cron listesinde yok |
| AI (modül içi) | 🟡 Tek kullanım | `os-service.ts:490` yalnız yanıt taslağı |

---

## 2. Mevcut Kod Tabanı Envanteri ve Modül Bağlantı Haritası

### 2.1 "14 API rotası" iddiası yanlış — gerçek: **19 dosya / 33 handler**

Görev tanımındaki "14 API rotası" eski bir sayımdan geliyor. Gerçek envanter:

| # | Rota | Auth | Metotlar | Gerçek yetenek |
|---|---|---|---:|---|
| 1 | `app/api/commerce/stores/route.ts` | session | GET+POST | Mağaza listele / aç (slug çakışma çözümü ile) |
| 2 | `stores/[storeId]/route.ts` | session | GET+PATCH | Kimlik + WhatsApp + durum |
| 3 | `stores/[storeId]/products/route.ts` | session | GET+POST | Kart oluştur (draft/active) |
| 4 | `stores/[storeId]/products/[productId]/route.ts` | session | GET+PATCH | Kart düzenle (stok **yazılamaz**, `service.ts:572`) |
| 5 | `products/[productId]/variants/route.ts` | session | POST | Varyant ekle |
| 6 | `stores/[storeId]/variants/[variantId]/route.ts` | session | PATCH | Varyant düzenle / aktive et |
| 7 | `stores/[storeId]/inventory/route.ts` | session | GET+POST | Hareket yaz (SQL tek yazar) + defter |
| 8 | `stores/[storeId]/imports/csv/route.ts` | session | POST | CSV'den 100 satıra kadar kart |
| 9 | `stores/[storeId]/imports/pazaryeri/route.ts` | session | POST | Tezgâh kataloğundan 8 satıra kadar kart |
| 10 | `stores/[storeId]/credentials/trendyol/route.ts` | session | GET+PUT+DELETE | 3 parçalı kimlik, mühürlü |
| 11 | `stores/[storeId]/credentials/hepsiburada/route.ts` | session | GET+PUT+DELETE | Aynı handler, `HEPSIBURADA` kanalı |
| 12 | `stores/[storeId]/listings/trendyol/route.ts` | session | GET+PUT+DELETE | Uzak barkod eşleme |
| 13 | `stores/[storeId]/listings/hepsiburada/route.ts` | session | GET+PUT+DELETE | Aynı handler, HB kanalı |
| 14 | `stores/[storeId]/subscription/route.ts` | session | POST+DELETE | Deneme/aylık lisans + dönem sonu iptal |
| 15 | `commerce/os/route.ts` | session | POST | **14 eylemli** kokpit mutasyonu |
| 16 | `webhooks/trendyol/route.ts` | webhook | POST | İki lehçe: OS imzası + Trendyol v2 |
| 17 | `webhooks/hepsiburada/route.ts` | webhook | POST | İki lehçe: OS imzası + HB OMS |
| 18 | `webhooks/[channel]/route.ts` | webhook | POST | Genel OS sipariş fişi |
| 19 | `webhooks/[channel]/messages/route.ts` | webhook | POST | Müşteri sorusu fişi |

`commerce/os` tek dosyada 14 eylem taşıyor (`os-handlers.ts:44-120`): `pool`, `stock-draft`, `stock-approve`, `channel`, `sync`, `question`, `reply`, `reply-draft`, `reply-send`, `simulate-sale`, `simulate-question`, `expert`. Bu bir RPC-toplu-rotadır: **tek `auth` beyanı, tek rate-limit, tek idempotency** — sade ve savunulabilir, ama gözlemlenebilirlikte eylem adı log'a yazılmıyor.

### 2.2 Veritabanı: 12 model / 16 enum — ve şemadaki üç itiraf

`prisma/schema/commerce.prisma` (360 satır) şu itirafları **kendi yorumunda** yazıyor:

```1:6:prisma/schema/commerce.prisma
/// Yetkin Commerce — mağaza, Master SKU, append-only stok defteri, pazaryeri kasası.
/// Sahiplik kolonu `owner_user_id` kasıtlıdır: canlı RLS sahiplik sicilinde yoktur.
/// PostgREST `rls_deny_unscoped` (SELECT USING false) alır. Yazma politikası üretilmez.
/// Fiyat `amount_minor`. Para birimi mağazada yalnız TRY.
/// Uzak stok `on_hand_qty` üzerine yazılmaz. Kargo etiketi bu şemada yoktur.
/// Aylık lisans `commerce_subscriptions` satırıdır. Pazaryeri satışı bu tabloya ciro yazmaz.
```

Üç ayrı itiraf, üç ayrı stratejik sonuç:

1. **"Kargo etiketi bu şemada yoktur"** → kargo maliyeti hesaplanamaz. Paket/barem motoru (Motor 1) ve kampanya simülatörü (Motor 3) **bu şema üzerine kurulamaz**.
2. **"Pazaryeri satışı bu tabloya ciro yazmaz"** → komisyon, hakediş, kâr **kaydedilmiyor**. Kâr özeti (Motor 4) için geçmiş veri **yok**.
3. **"Sahiplik kolonu `owner_user_id`... RLS sahiplik sicilinde yoktur"** → `RLS_OWNERSHIP_COLUMNS` (`rls-policy-registry.ts:5-14`) yalnız `user_id, client_id, freelancer_id, ...` sayıyor. Commerce tabloları **kapsamsız deny** ile korunuyor (`SELECT USING false`), yani PostgREST'e tamamen kapalı ve yalnız Prisma'dan okunuyor. Bu **doğru bir sertleştirme**, ama `verify:rls-status` bir sahiplik testi yapamıyor; sahiplik yalnız uygulama kodunda (`findStoreForOwner`).

**Modeller (12):** `CommerceStore`, `CommerceProduct`, `CommerceVariant`, `InventoryTransaction`, `CommerceMarketplaceCredential`, `CommerceChannelListing`, `CommerceMarketplaceWebhookReceipt`, `CommerceSubscription`, `CommerceTrialConsumption`, `StockLedger`, `SalesChannel`, `CommerceInboxEntry`.
**Eksik olan (kâr beyni için minimum):** COGS, kargo tarifesi, komisyon oranı, iade oranı, reklam maliyeti, sipariş tutarı, kampanya, paket/set, günlük özet, aksiyon. Yani **0 / 10**.

### 2.3 Bağlantı haritası: Tezgâh ↔ Commerce gerçekte nasıl bağlı?

Üç araç, üç **tek yönlü aktarım**:

| Kaynak | Hedef | Mekanizma | Veri bağı |
|---|---|---|---|
| `dukkan` | — | **Yok.** HTML üretir, indirir. Commerce'e hiç dokunmaz. | — |
| `pazaryeri` | Commerce | `MasterSkuTransfer` → `POST /imports/pazaryeri` → `catalogTableToDraftImport` | **Taslak** kart; fiyat/barkod/stok **null** (`pazaryeri-bridge.ts:71-88`) |
| `ecommerce` (ürün kartı) | Commerce | `EcommerceDraftTransfer` veya kokpitteki `ProductCardStudio` → `POST /api/commerce/os {action:"pool"}` | Taslak kart, `approvedStockQty: 0`, `criticalStockQty: 5` (`os-service.ts:150-160`) |
| `reklam` | Commerce | **Ters yön:** kokpit → `/tezgah?tool=reklam&offer=...` (`os-growth.ts:11-24`) | Yalnız URL sorgusu; çıktı geri **yazılmaz** |
| Commerce | `hibe` | `/hibe?sekme=proje&ad=...` (`os-growth.ts:26-32`) | Yalnız URL sorgusu |

**Değerlendirme:** Bu bir *entegrasyon* değil, bir **el değiştirme (handoff)** zinciridir. Hiçbir Tezgâh çıktısı bir `productId`'ye bağlanmıyor; `TezgahOutput` (tezgah.prisma:6-18) `toolKey/title/inputSummary/outputContent` taşıyor, **`productId` taşımıyor**. Sonuç: "Bu ürün kartını hangi üretimden aldım, o üretimi kaç kez yeniden yaptım, hangi çıktı kâr getirdi" sorusu **sorulamaz**. Tezgâh 10.044 satır kod, Commerce 10.181 satır kod — birbirini **tanımayan** iki gövde.

`dukkan` özelinde ayrı bir not: motor `void input.actorId; void input.commandKey;` yazıyor (`dukkan/engine.ts:52-54`) ve `open = { remaining: 1, limit: 1 }` sabitini döndürüyor (`:55`). Yani "kalan 1/1" ekranda **sabit**; gerçek kota okunmuyor. Bu bilinçli (AI maliyeti yok, `free_template` havuzu sayaç düşmez — `TEZGAH_TOOL_POOL.dukkan = "free_template"`), ama dönen `remaining/limit` alanları **sahte bir sayaç** gibi görünüyor.

### 2.4 Üç paralel sistem: modülün asıl mimari borcu

Bu, raporun en önemli teknik bulgusu. Aynı işi yapan **iki ayrı** alt sistem var ve ikisi aynı tabloları kullanmıyor.

#### (a) İki kimlik kasası

| | Klasik kanal masası | Kokpit "Kanallar" sekmesi |
|---|---|---|
| Tablo | `commerce_marketplace_credentials` | `sales_channels` |
| Alanlar | `supplierSeal` + `apiKeySeal` + `apiSecretSeal` | tek `apiKeySeal` |
| Girdi | Satıcı ID + API Key + API Secret (3 alan) | **tek "API anahtarı" kutusu** (`os-cockpit.tsx:626-635`) |
| Kim tüketir | `trendyol-sync` / `hepsiburada-sync` (push+pull) | `broadcastStockToChannels`, webhook HMAC |
| Sonuç | Gerçek API çağrısı yapabilir | Yalnız `sellerId:apiKey:apiSecret` **virgüllü** yapıştırılırsa (`channel-adapters.ts:44-55`) |

Kokpitte "Trendyol → Bağla" diyen kullanıcı `sales_channels` satırı yaratıyor. Bu satır **hiçbir zaman** Trendyol siparişi çekmiyor (cron `listCredentials(TRENDYOL)` yalnız `commerce_marketplace_credentials` okuyor — `trendyol-sync.ts:253-257`). Yani kokpitte "Bağlı" yeşil rozeti, **gerçek bir pazaryeri bağlantısı değil**, bir niyet kaydı.

#### (b) İki ilan/eşleme modeli

`commerce_channel_listings` (klasik, `remoteBarcode` + `remoteProductId` + `syncStatus`) vs `sales_channels` (kokpit, ilan yok). Kokpitte "Tek Tıkla Tüm Kataloğu Eşitle" düğmesi `syncCatalog`'ı çağırıyor:

```388:399:lib/commerce/os-service.ts
export async function syncCatalog(userId: string): Promise<CommerceResult<Record<string, unknown>>> {
  const stamped = await stampConnected(userId);
  if (stamped === 0) {
    return commerceFail(422, "Bağlı kanal yok.");
  }
  return {
    ok: true,
    data: {
      synced: stamped,
      message: "Katalog eşitleme kaydı bağlı kanallara düştü.",
    },
  };
}
```

`stampConnected` yalnız `lastSyncedAt = now` yazıyor ve ilanları `PENDING`'e çekiyor (`os-service.ts:99-124`). **Hiçbir HTTP çağrısı yok.** Düğmenin adı "Eşitle", dönen mesaj "kayıt düştü" — bu, dürüstlük iddiası taşıyan bir üründe **kabul edilemez bir yanıltıcı arayüz**.

#### (c) İki stok defteri — ve üç sayı

```161:175:lib/commerce/channel-stock-engine.ts
    const plan = planChannelSale(product.approvedStockQty, product.criticalStockQty, input.quantity);
    const ledger = await uow.insertLedger({
      storeId: input.storeId,
      productId: product.id,
      actorUserId: input.actorUserId,
      type: "CHANNEL_SALE",
      channel: input.channel,
      quantity: -input.quantity,
      stockAfter: plan.stockAfter,
      ...
    });
    await uow.setApprovedStock(product.id, plan.stockAfter);
```

Bu yol (`/api/commerce/webhooks/[channel]` → `commitChannelOrderPrisma`) **yalnız** `commerce_products.approved_stock_qty` düşürüyor ve `stock_ledgers`'a yazıyor.

Diğer yol (`/api/commerce/webhooks/trendyol` gerçek Trendyol gövdesi → `intakeTrendyolPackages` → `applyMovement`) **yalnız** `commerce_variants.on_hand_qty` düşürüyor ve `inventory_transactions`'a yazıyor (`inventory-sql.ts:59-81`; SQL yalnız `commerce_variants` tablosunu UPDATE ediyor).

Üçüncü yol (`/magazam/[storeId]/stok` → `postCommerceInventory`) da varyantı düşürüyor, **ama `approved_stock_qty`'ye dokunmuyor** (`service.ts` içinde `approvedStockQty` yazımı **yok** — grep boş döndü).

Dördüncü yol (klasik formda **aktif kart** oluşturma, `placeVariant` `INBOUND` hareketi yazar — `service.ts:198-215`) varyantı doldurur, `approved_stock_qty` **0 kalır**.

**Somut sonuç senaryosu (bugün, kodda):**
1. Satıcı `/magazam/{id}/urunler` üzerinden "Açık kart kaydet" diyor, 10 adet, fiyat 250 TL. → Varyant: `on_hand_qty = 10`, `ACTIVE`. Ürün: `approved_stock_qty = 0`.
2. Vitrin `/magaza/{slug}` ürünü **satılabilir** gösteriyor (`storefront-load.ts` → `sellableQty(variant.onHandQty, ...)` = 10).
3. Kokpit `/e-ticaret` aynı ürünü **0 adet** gösteriyor, `adEligible = false` (reklam listesine girmiyor), portföy değeri 0 TL (`os-growth.ts:57-67`).
4. Trendyol'dan 1 sipariş gelir (OS lehçesi) → ürün stoğu 0'a düşer, **varyant hâlâ 10**.
5. Vitrin hâlâ 10 adet satıyor. **Aşırı satış.**

Bu zincir testlerden geçiyor çünkü her halka kendi birim testinde doğru; **birleşimi test edilmiyor**.

### 2.5 AI envanteri: 10.181 satır kodda **tek** LLM çağrısı

```
lib/commerce/os-service.ts:490  → invokeLlm({ role: "LITE_STREAM", ... })
```

Tek kullanım: müşteri sorusuna yanıt taslağı (`suggestReply`). Bu taslak `reply-facts.ts` ile **örnek disiplinde** mühürleniyor: fiyat yazması yasak, kartta olmayan ölçü yasak, sayılar kartta geçmeli (`replyStaysOnCard`). Bu, modülün **en iyi yazılmış parçası** — ve ne yazık ki **tek** AI değeri.

Kıyas: `lib/tezgah` 10.044 satırda 5 ayrı LLM motoru (teklif, hibe, dukkan-deterministik, pazaryeri, reklam, tetkik) çalıştırıyor. Commerce'in AI yüzeyi **1/5**.

---

## 3. Kritik Eksikler ve Kopukluklar

### 3.1 `[KRİTİK]` K-01 — Stok gerçeği üç sütuna bölünmüş, uzlaştırma yok

**Kanıt:** §2.4(c). `commerce_products.approved_stock_qty` (kokpit) · `commerce_variants.on_hand_qty` (vitrin + klasik stok) · `stock_ledgers` vs `inventory_transactions` (iki defter, iki anahtar: `product_id` vs `variant_id`).

**Etki:** Aşırı satış (vitrin satılanı görmüyor), yanlış reklam kararı (`adEligible` yanlış), yanlış hibe/ihracat portföyü (`summarizeExportSupport` `approvedStockQty × priceMinor`), yanlış kanal yayını (`broadcastStockToChannels` `product.approvedStockQty` gönderiyor — `channel-broadcast.ts:37`).

**Ek kanıt — kanal yayını SKU'su boş gidebilir:** `channel-broadcast.ts:37` `sku: product.sku` kullanıyor. `commerce_products.sku` yalnız `importPoolProduct` sırasında dolduruluyor (`os-service.ts:157`); klasik yolda kart SKU'su **varyantta** duruyor (`placeVariant` → `insertVariant`). Yani klasik yoldan açılan kartın kanal yayını **boş SKU** ile gidiyor.

**Öneri:** `approved_stock_qty` sütununu **türetilmiş** hâle getirmek (varyant toplamı) veya tek yazar `inventory_transactions`'a indirmek; webhook lehçelerini tek motorda birleştirmek; iki defteri tek deftere çevirmek. Bu, Faz 2'nin **0. maddesi** olmalı — kâr motoru yanlış stok üzerine kurulursa yanlış kâr hesaplar.

---

### 3.2 `[KRİTİK]` K-02 — Kâr/komisyon/kargo katmanı yok ve şema bunu bilinçli reddediyor

**Kanıt:** `commerce.prisma:5-6` itirafı; `lib/commerce` içinde `komisyon|commission|kâr|profitMargin|kargo|desi` araması **0** iş sonucu (yalnız `saas-builder.ts`'te alakasız bir desi hesabı widget'ı).

**Etki:** Modül satıcının en temel sorusunu ("bu iş kâr ediyor mu") cevaplayamıyor. Bu yüzden **retention** yok: satıcı paneli açar, stok görür, kapatır, geri gelmez. Rakiplerin (ikas, StockMount) kâr paneli var; Ticimax/IdeaSoft entegratör olduğu için satıcı kârı kendi Excel'inde tutuyor — **yani bu, pazardaki en büyük açık**: entegratörler kârı bilmiyor, muhasebe yazılımları kanalı bilmiyor. yetkin.ai ikisini de yapı sınırında tutuyor.

**Öneri:** Yeni tablo ailesi (`CommerceUnitEconomics`, `CommerceShippingTariff`, `CommerceChannelEconomics`) — `stock_ledgers`'a **dokunmadan**. Şemanın "ciro yazmaz" kuralı korunur; kâr **ayrı** bir defterde yaşar.

---

### 3.3 `[KRİTİK]` K-03 — Kamuya açık E-Ticaret vitrini yok; `/e-ticaret` bir oturum duvarı

**Kanıt:**

```42:52:lib/kernel/security/edge-guard.ts
export const PROTECTED_KERNEL_PATHS = [
  "/dashboard",
  "/cuzdan",
  "/profil",
  "/pasaport",
  "/career",
  "/admin",
  "/magazam",
  "/e-ticaret",
  "/hibe",
] as const;
```

`app/(public)/` altında `e-ticaret` klasörü **yok** (yalnız `claim, fiyatlandirma, hakkimizda, ilan, iletisim, kasa, kurumsal, legal, magaza, p, rehber, sozluk, tetkik, uzmanlar, vize`). `/e-ticaret` `app/(kernel)/e-ticaret/page.tsx` — `requirePageSession()` ile açılıyor. `PAGE_SEO`'da `e-ticaret` anahtarı yok; `SITEMAP_STATIC_PATHS`'ta yok; `ROBOTS_DISALLOW_PATHS`'ta da yok (yani taranabilir bir 307).

**Etki:** Ürünün anlatımı üç yere dağılmış: `/` (tek "track" kartı), `/fiyatlandirma` (tek vitrin kartı), `/rehber` (4 adım). Hiçbiri "neden ikas değil de yetkin.ai" sorusunu cevaplayan bir sayfa değil. Rakiplerin hepsinde bir ürün sayfası var. **Satıcı, ürünü görmeden VKN girmesi isteniyor.**

---

### 3.4 `[YÜKSEK]` Y-01 — "Amazon ve N11" 5 metin satırında satılıyor, kodda iskelet

**Kanıt — vaat:**

| Dosya | Satır | Cümle |
|---|---|---|
| `lib/pricing/public-vitrine.ts` | 180 | "Trendyol, Hepsiburada, Amazon ve N11 çok kanallı yönetim paneli." |
| `lib/pricing/public-vitrine.ts` | 183 | "…Trendyol, Hepsiburada, Amazon ve N11 tek panelden stok ve sipariş" |
| `components/commerce/os-cockpit.tsx` | 132 | "(Trendyol, Hepsiburada, Amazon, N11 …)" |
| `components/commerce/os-cockpit.tsx` | 137 | "Çok Kanallı E-Ticaret Lisansı (Trendyol, Hepsiburada, Amazon, N11 dahil)" |
| `app/llms.txt/route.ts` | 67 | "Amazon ve N11 tek panelde; stok, sipariş, müşteri sorusu." |

**Kanıt — kod:**

```5:7:lib/commerce/channel-adapters.ts
export const AMAZON_STOCK_URL = "https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/stock";
export const AMAZON_REPLY_URL = "https://sellingpartnerapi-eu.amazon.com/messaging/v1/messages";
export const N11_STOCK_URL = "https://api.n11.com/ms/product/tasks/price-stock-update";
```

- Amazon için **LWA (Login with Amazon) + SigV4 imzası yok**; düz `authorization: Bearer <apiKey>` (`channel-adapters.ts:76-78`). `sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/stock` gerçek SP-API kaynağı değil.
- N11 için imza zinciri yok; `api.n11.com` Bearer kabul etmiyor.
- `CommerceChannel` enum'u **yalnız** `TRENDYOL` + `HEPSIBURADA` (`commerce.prisma:43-46`); `COMMERCE_CHANNELS` da aynı (`marketplace-types.ts:1`). Yani Amazon/N11 için **kimlik saklanamaz**, **ilan eşlenemez**, **sipariş çekilemez** (`inngest.ts`'de yalnız `trendyol-order-pull` ve `hepsiburada-order-pull` var).
- Kokpitte 5 kanal kartı gösteriliyor (`os-rules.ts:5-11`); 2'si gerçek, 1'i (OWN_STORE) yerel, **2'si dekoratif**.

**Etki:** Dürüstlük iddiası taşıyan bir üründe ölçülebilir vaat ihlali. Bir satıcı Amazon anahtarını yapıştırırsa `PUSHED` benzeri bir sonuç **alamaz** (`postJson` HTTP 403 → `FAILED` + "HTTP 403"), ama ürün ona baştan "Amazon bağlanır" demişti.

---

### 3.5 `[YÜKSEK]` Y-02 — Lisans kapısı yalnız tarayıcıda

**Kanıt — istemci:**

```296:306:components/commerce/os-cockpit.tsx
  function connectChannel(kind: string, connect: boolean, apiKey?: string) {
    const row = view.channels.find((channel) => channel.kind === kind);
    if (connect && row?.needsKey && license.gate) {
      setLicenseBlock(row.label);
      setError("");
      setMessage("");
      return;
    }
```

**Kanıt — sunucu:** `connectChannel` (`os-service.ts:323-387`) `isOsChannelKind` doğruluyor, havuz mağazasını açıyor, anahtarı mühürlüyor ve `status: "CONNECTED"` yazıyor. **Lisans okuması yok.** `commerceLicenseActive` bu dosyada import edilmiyor.

**Etki:** 30 gün bitince veya lisans iptal edilince, `POST /api/commerce/os {action:"channel", kind:"TRENDYOL", apiKey:"..."}` çağrısı **200 döner** ve kanal "Bağlı" görünür. Giden senkron sonradan `outgoingSyncAllowed` ile durur (`trendyol-sync.ts:193`) — yani para kaybı yok ama **ürün yalan söylüyor**: "Bağlı" rozeti, lisans yokken de basılıyor.

---

### 3.6 `[YÜKSEK]` Y-03 — Üretimde her zaman 403 dönen iki düğme

**Kanıt:**

```1:4:lib/commerce/simulation-gate.ts
/** Üretimde kapalı. Yalnız üretim dışı ve açık bayrakta örnek satış/soru yazılır. */
export function commerceSimulationAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production" && env.COMMERCE_ALLOW_SIMULATION === "true";
}
```

`os-cockpit.tsx:514-528` (`SimulateSaleButton`) ve `:700` ("Örnek Müşteri Sorusu Simüle Et") düğmeleri **koşulsuz** basılıyor (`:587` ve `:698`); `disabled` yalnız `!canSimulate` (ürün yok) iken. Üretimde tıklayan kullanıcı `403 "Simülasyon bu ortamda kapalı."` alıyor.

**Etki:** Bir demo/onboarding düğmesi üretimde **her zaman** hata veriyor. Yeni kullanıcı, ürünün ilk deneyiminde "çalışmıyor" hissi alıyor. Ya düğme üretimde gizlenmeli ya da gerçek bir "kuru çalıştırma" (dry-run, yazmayan) hâline getirilmeli.

---

### 3.7 `[YÜKSEK]` Y-04 — Yenileme çekimi `user_ip: 127.0.0.1` ve `non_3d: 1` ile

**Kanıt:**

```55:66:lib/commerce/subscription-renewal.ts
      const outcome = await chargeStoredPaytrCard({
        merchantOid: renewalMerchantOid(row.storeId, now),
        email: owner?.email ?? "billing@yetkin.ai",
        userIp: "127.0.0.1",
        amountMinor: step.amountMinor,
        utoken: row.paytrUtoken,
        ctoken: row.paytrCtoken,
      });
```

PayTR kart-saklama (CAPI) hash'i `user_ip` içeriyor (`paytr-stored-card.ts:18-32`). Kayıtlı kart çekiminde `user_ip` gerçek müşteri IP'si olmalı; `127.0.0.1` ile hash tutmayabilir veya PayTR işlemi reddedebilir. Ayrıca `non_3d: "1"` (`:71`) — 3D Secure atlanıyor.

**Etki:** Deneme bittikten sonra **hiçbir yenileme başarılı olmayabilir**; tüm lisanslar 3 denemede `CANCELED`'a düşer. Bu, iş modelinin sessiz ölümü. Ayrıca `email` bulunamazsa `billing@yetkin.ai` yazılıyor — PayTR tarafında yanlış e-posta.

> **Not:** Bu iddia için canlı PayTR hesabıyla doğrulama gerekir; kodun kendisi riski kanıtlıyor, sonucu kanıtlamıyor. `[YÜKSEK]` etiketinin gerekçesi budur: **fail-open değil, sessiz-fail**.

---

### 3.8 `[ORTA]` O-01 — Marka dili ("sen" aksı) modül içinde 5 yerde kırılıyor

`verify:sen-axis` bu dosyaları **tarıyor** (`app + components + lib/copy`) ve yeşil geçiyor — çünkü sözlükte `hakkınız`, `yazınız`, `sizin` yok.

| Dosya | Satır | Metin | Doğrusu |
|---|---|---|---|
| `components/commerce/product-card-studio.tsx` | 81 | "Kalan ücretsiz **hakkınız**: …" | "Kalan ücretsiz hakkın" |
| `components/commerce/product-card-studio.tsx` | 167 | "Kategoriyi **yazınız**..." | "Kategoriyi yaz…" |
| `components/commerce/product-card-studio.tsx` | 201 | "Ürün özelliklerinizi buraya **yazınız**..." | "Ürün özelliklerini buraya yaz…" |
| `components/commerce/product-create-form.tsx` | 116 | "Ürün açıklamasını buraya **yazınız**..." | "…yaz…" |
| `components/commerce/product-editor.tsx` | 85 | "Ürün açıklamasını buraya **yazınız**..." | "…yaz…" |
| `components/commerce/os-cockpit.tsx` | 896 | "Paket **sizin** Kariyer çalışma **odanıza** yazılır." | "Paket senin Kariyer çalışma odana yazılır." |

**Etki:** Aynı ekranda "Stok gir" (sen) ile "yazınız" (siz) yan yana. Ürünün dil sözleşmesi (`lib/copy/sen-voice/magazam.ts`) tutarlıyken bileşenler kendi metnini yazıyor.

---

### 3.9 `[ORTA]` O-02 — Hata sınırı (error boundary) yok

`app/(kernel)/` altında `loading.tsx` var, **`error.tsx` yok**. `app/(kernel)/cuzdan/error.tsx` var ama `e-ticaret` ve `magazam` için yok. Kokpitte `loadOsCockpit` DB dışı bir hata fırlatırsa (`os-load.ts:248-251` yalnız `isDown` için yakalıyor) kullanıcı kök `app/error.tsx`'e düşüyor — o dosyanın metni **kamu** aksında:

```1:10:app/error.tsx
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  ...
  const copy = PUBLIC_SEN.error;
```

Yani satıcı, mağaza panelinde "Bir şeyler ters gitti / Ana sayfa" ekranı görüyor; **hangi mağazada** olduğunu ve mağaza menüsüne nasıl döneceğini kaybediyor.

---

### 3.10 `[ORTA]` O-03 — `/e-ticaret` ve `/magazam` robots.txt'te listelenmiyor

`ROBOTS_DISALLOW_PATHS` (`seo.ts:295-314`) `/dashboard, /cuzdan, /kasa, /profil, /pasaport, /admin, /academy…` sayıyor; `/e-ticaret` ve `/magazam` **yok**. İkisi de oturumsuz istekte 307 → `/login` döndürüyor. Google, 307'yi tarayıp hedefi indeksliyor; **tarama bütçesi** boşa gidiyor.

---

### 3.11 `[ORTA]` O-04 — Kokpit çok varyantlı ürünü tek varyanta indiriyor

`os-load.ts:108` ve `os-service.ts:95, 619, 716` hepsi `variants: { take: 1 }`. Kokpit bir ürünü **tek** varyantla temsil ediyor; stok, fiyat ve SKU ilk varyanttan okunuyor.

**Etki:** 5 bedenli bir tişört kartı kokpitte **tek satır**. "Ürün & Stok Havuzu" ekranında 5 varyantın stoğu görünmüyor; "Onayla ve Kanallara Yay" yalnız ilk varyantı yayıyor (`approveInbound` → `product.variants[0]`, `os-service.ts:252-254`). Varyantlı satıcı için panel **yanlış**.

---

### 3.12 `[ORTA]` O-05 — Deneme doğrulama bedeli cüzdana DEBIT yazılıyor; bakiye yoksa mühür atlanıyor

`fulfillCommerceTrial` (paytr-license-bridge.ts:101-131) 1 TL'lik doğrulama için deftere **DEBIT** yazıyor. `appendLedgerEntry` negatif bakiyeyi `subtractAmountMinor` ile reddediyor (`amount-minor.ts:40-45`). Boş cüzdanlı yeni kullanıcıda bu hata `isInsufficientBalanceError` ile yakalanıyor:

```116:127:lib/commerce/paytr-license-bridge.ts
    if (already && isInsufficientBalanceError(message)) {
      return {
        applied: false,
        expiresAt: existing.expiresAt?.toISOString() ?? null,
        reason: "already_settled",
      };
    }
    throw error;
```

Kapı yalnız `already` (önceki CLEARED) durumunda sessiz dönüyor; **ilk** denemede hata fırlatıyor. Sıra: `clearSuccessfulPaymentOrder` → `notifyCommerceLicenseHook` → burası. Yani para **tahsil edilmiş**, CLEARED **yazılmış**, ama lisans **açılmamış** ve webhook `500`/deferred yoluna düşmüş olabilir. `trialPending` işareti `rememberQuote` ile `true` yazıldığı için sonraki çağrıda tekrar denenebilir — ama o ana kadar satıcı **parasını ödemiş, denemesi açılmamış** durumda.

**Etki:** Deneme hunisinin en kritik adımında, en yeni kullanıcıda (cüzdanı boş olan) **veri tutarsızlığı** riski. `[ORTA]` diyorum çünkü PayTR retry + `trialPending` kurtarma yolu var; ama bu yol **test edilmemiş** (`subscription-lifecycle.test.ts` cüzdanı `PRICE` ile dolu başlatıyor — `:218`).

---

### 3.13 `[ORTA]` O-06 — `e-ticaret` ve `magazam` için `metadata` yok → paylaşım kartı boş

`app/(kernel)/e-ticaret/page.tsx` ve alt sayfaların hiçbirinde `export const metadata` / `generateMetadata` yok. Mağaza vitrini (`/magaza/[slug]`) **var** (`generateMetadata` + `pageMetadata`). Yani satıcı kendi vitrin linkini paylaştığında güzel kart çıkıyor; **paneli** paylaştığında boş. Panel zaten oturum ister, dolayısıyla bu **doğru** bir tercih olabilir — ama `noindex` de yazılmadığı için robots ile çelişiyor (bkz. O-03).

---

### 3.14 `[ORTA]` O-07 — Fiyat kaynağı ikilemi: `basePriceMinor` yalnız havuzda dolduruluyor

`os-load.ts:137` fiyatı `product.basePriceMinor > 0 ? basePriceMinor : variant.amountMinor` ile okuyor. Ama `basePriceMinor` yalnız `importPoolProduct` içinde yazılıyor (`os-service.ts:157`). Klasik yoldan açılan kartta **her zaman 0** → her zaman varyant fiyatı. `ProductEditor` fiyatı varyant üzerinden güncelliyor (`patchCommerceVariant`). İki fiyat alanı var, biri **ölü**.

---

### 3.15 Kopukluk özeti (tek bakışta)

| Beklenen bağ | Gerçek | Durum |
|---|---|---|
| Tezgâh `dukkan` → Commerce vitrini | Yok (HTML indirme) | 🔴 Kopuk |
| Tezgâh `pazaryeri` → Commerce katalog | Taslak aktarım (fiyat/stok null) | 🟡 Tek yön |
| Tezgâh `ecommerce` → Commerce havuz | Taslak aktarım | 🟡 Tek yön |
| Tezgâh `reklam` ← Commerce | URL parametresi (`offer=…`) | 🟡 Tek yön |
| Commerce → `hibe` | URL parametresi | 🟡 Tek yön |
| Commerce → Kariyer uzman masası | `CareerDeskTask` + inbox satırı | 🟢 Gerçek yazma |
| Commerce kokpit kanalı → gerçek API | `sales_channels` ≠ `marketplace_credentials` | 🔴 Kopuk |
| Commerce stok → vitrin | İki sütun | 🔴 Kopuk |
| Commerce satış → kâr | Tablo yok | 🔴 Yok |
| Commerce → günlük bildirim | Cron yok, mail türü yok | 🔴 Yok |

---

## 4. Dört Akıllı Motorun Teknik Tasarım Taslağı

**Ortak kural seti (hepsi için geçerli, mevcut mimariye uyum):**
- Motor `lib/commerce/*` içinde yaşar; `app/api/commerce/*` yalnız kompozisyon (kernel↛dikey mührü).
- Her yeni rota `export const auth = "session"` beyan eder; `verify:api-auth --check` kırılmaz.
- Her yeni tablo: `@@map` snake_case + `RLS_FORCE_TABLES` kaydı (`rls-policy-registry.ts`) + `rls_deny_unscoped` politikası + `FORCE RLS`. Yoksa `verify:rls-status` ve `verify:boundaries` kırılır.
- Para **her zaman** `amountMinor` (tam sayı kuruş); float yasak (`packages/kernel/src/money/amount-minor.ts`).
- Her yazma: `Idempotency-Key` + `settleHttpIdempotency` (mevcut desen, `handlers.ts:66-101`).
- Her LLM çağrısı: `invokeLlm` + `resolveProductModel` + `recordUsage: true` + rate-limit; `AI_TOKEN_SOURCES`'a `COMMERCE` anahtarı eklenir (bugün yanıt taslağı `SUPPORT` yazıyor).
- **Sayı uydurma yasağı:** LLM'e giden prompt'taki her sayı bir tablodan gelir; çıktı `reply-facts.ts` deseniyle mühürlenir (sayı kaynakta yoksa reddet).

---

### 4.1 Motor 1 — Akıllı Paket ve Set Mimarı (1'li/2'li/3'lü Barem Kırıcı)

**Neden bu, birinci sırada olmalı:** Kargo baremi tek başına kâr yaratır. 1 adet gönderi 39,90 TL; 2 adet aynı banda giriyorsa 2. adedin kargo maliyeti **0**. Bu, hiçbir entegratörün satıcıya söylemediği tek somut para.

**Gerekli şema (yeni):**

```prisma
/// Varyant başına maliyet gerçeği. Satıcı girer, biz hesaplarız.
model CommerceUnitEconomics {
  id            String   @id @default(cuid())
  storeId       String   @map("store_id")
  variantId     String   @map("variant_id")
  costMinor     Int      @map("cost_minor")      // COGS (alış + nakliye + gümrük)
  desiGrams     Int      @map("desi_grams")      // hacimsel ağırlık × 1000
  vatBps        Int      @default(2000) @map("vat_bps")  // %20
  updatedAt     DateTime @updatedAt @map("updated_at")
  @@unique([storeId, variantId])
  @@map("commerce_unit_economics")
}

/// Kargo tarifesi. Barem kırıcının kalbi.
model CommerceShippingTariff {
  id            String   @id @default(cuid())
  storeId       String   @map("store_id")
  carrier       String   @db.VarChar(40)
  bandMinGrams  Int      @map("band_min_grams")
  bandMaxGrams  Int      @map("band_max_grams")
  priceMinor    Int      @map("price_minor")
  effectiveFrom DateTime @map("effective_from")
  @@index([storeId, carrier, effectiveFrom])
  @@map("commerce_shipping_tariffs")
}

enum CommerceBundleType { TWO_THREE }
enum CommerceBundleStatus { PROPOSED ACCEPTED DISMISSED }

/// Motorun ürettiği öneri. Kabul edilirse gerçek CommerceProduct doğar.
model CommerceBundleProposal {
  id                 String               @id @default(cuid())
  storeId            String               @map("store_id")
  type               CommerceBundleType
  memberVariantIds   String[]             @map("member_variant_ids")
  singlePriceMinor   Int                  @map("single_price_minor")   // tekil toplam
  suggestedPriceMinor Int                 @map("suggested_price_minor")
  netMinor           Int                  @map("net_minor")
  marginBps          Int                  @map("margin_bps")
  cargoSavedMinor    Int                  @map("cargo_saved_minor")
  rationale          String               @db.VarChar(500)
  status             CommerceBundleStatus @default(PROPOSED)
  computedAt         DateTime             @default(now()) @map("computed_at")
  acceptedProductId  String?              @map("accepted_product_id")
  @@index([storeId, status, computedAt])
  @@map("commerce_bundle_proposals")
}
```

**Hesap çekirdeği (saf fonksiyon, DB'siz, test edilebilir) — `lib/commerce/profit.ts`:**

```
net(v, adet) =
    price × adet
  − commission(price × adet, channelBps)      // Motor 3 tablosundan
  − cargo(tariff, desi(v) × adet)             // barem: N adet tek banda sığar
  − cogs(v) × adet
  − expectedReturn(v)                          // returnBps × net
  − adCostPerOrder(v)                          // varsa
```

Paket önerisi koşulu: `net(2 adet) > 2 × net(1 adet)` **veya** `marginBps(2 adet) ≥ hedefMarj` **ve** 1. ve 2. adet aynı kargo bandında.

**API:**

| Rota | Metot | İş |
|---|---|---|
| `/api/commerce/stores/[storeId]/bundles/propose` | POST | Deterministik tarama + öneri üretimi (idempotent) |
| `/api/commerce/stores/[storeId]/bundles` | GET | Öneri listesi (skor sıralı) |
| `/api/commerce/stores/[storeId]/bundles/[id]/accept` | POST | Gerçek `CommerceProduct` + varyant seti doğurur |
| `/api/commerce/stores/[storeId]/bundles/[id]` | DELETE | Reddet |

**AI akışı:** Optimizasyon **deterministik** (LLM yok). LLM yalnızca kabul edilen paket için başlık + 3 maddelik satış metni yazar; prompt'a `suggestedPriceMinor`, `cargoSavedMinor`, üye başlıkları verilir; çıktı `sealPazaryeriStyle` deseniyle mühürlenir (fiyat dışı sayı reddedilir).

**Neden AI burada ikincil:** Kargo baremi bir **aritmetik** problemidir. LLM'e bırakmak hem pahalı hem yanlış olur. Farklılaşma "akıllı" kelimesinden değil, **doğru sayıdan** gelir.

---

### 4.2 Motor 2 — Katalog Uyumlu "Ne Satılır?" Radarı

**Neden en zor:** Talep verisi dışarıda. Bugün elde olan: kendi katalog (kategori × fiyat bandı yoğunluğu), `YetkinhibeGrantCall` (sektör sinyali), `TetkikReport` (site analizi). Dış pazaryeri trend API'si **yok**.

**Gerekli şema (yeni):**

```prisma
enum CommerceGapSource { OWN_CATALOG GRANT_CALL TETKIK MARKETPLACE_TREND }

/// Sinyal tablosu. Sayı buradan gelir; LLM sayı üretmez.
model CommerceCatalogGapSignal {
  id          String            @id @default(cuid())
  storeId     String            @map("store_id")
  category    String            @db.VarChar(80)
  priceBandMinor Int            @map("price_band_minor")   // bandın alt sınırı
  demandIndex Int               @map("demand_index")       // 0-100, kaynaklı
  supplyGap   Int               @map("supply_gap")         // -100..100
  source      CommerceGapSource
  evidenceJson String           @map("evidence_json") @db.Text
  computedAt  DateTime          @default(now()) @map("computed_at")
  @@index([storeId, computedAt])
  @@map("commerce_catalog_gap_signals")
}

enum CommerceSuggestionStatus { NEW SEEN DISMISSED CONVERTED }

model CommerceProductSuggestion {
  id            String                   @id @default(cuid())
  storeId       String                   @map("store_id")
  title         String                   @db.VarChar(200)
  category      String                   @db.VarChar(80)
  targetPriceMinor Int                   @map("target_price_minor")
  rationale     String                   @db.VarChar(500)
  signalIds     String[]                 @map("signal_ids")   // kanıt zinciri
  status        CommerceSuggestionStatus @default(NEW)
  createdAt     DateTime                 @default(now()) @map("created_at")
  @@index([storeId, status, createdAt])
  @@map("commerce_product_suggestions")
}
```

**API:** `POST .../radar/scan` · `GET .../radar` · `POST .../radar/[id]/convert` (Tezgâh `ecommerce` aracına `?tool=ecommerce&seed=...` ile devreder — mevcut tek yön desenini **kırmadan** kullanır).

**AI akışı:** Deterministik toplayıcı önce sinyalleri üretir. LLM'e **yalnız** şu görev verilir: "verilen 5 sinyal satırından en iyi 3 ürün fikrini seç ve her biri için tek cümle gerekçe yaz; **yeni sayı ekleme**". Çıktı doğrulanır: her gerekçedeki sayı `signalIds` satırlarında geçmiyorsa reddedilir (mevcut `replyStaysOnCard` deseni birebir uygulanır).

**Dürüstlük kapısı:** Yeterli sinyal yoksa motor **"veri yok"** der; uydurma fikir basmaz. Bu, ürünün mevcut kültürüyle (fiyat uydurmama, `honesty: "planned"`) tutarlı tek tasarım.

---

### 4.3 Motor 3 — Kâr Korumalı Kampanya ve İndirim Simülatörü

**Neden ikinci sırada (ve aslında ilk kodlanacak):** Tamamen **saf fonksiyon**. DB'ye yalnız kayıt için yazar. Bugün, hiçbir tablo beklemeden `CommerceChannelEconomics` varsayılanlarıyla çalıştırılabilir ve **ilk gün değer üretir**: "Bu üründe %15 indirim yaparsan kârın 42 TL'den 0 TL'ye düşer."

**Gerekli şema (yeni):**

```prisma
/// Kanal maliyet gerçeği. Satıcı girer, varsayılan sektör ortalamasıdır (kaynak yorumda).
model CommerceChannelEconomics {
  id                  String           @id @default(cuid())
  storeId             String           @map("store_id")
  channel             SalesChannelKind
  commissionBps       Int              @map("commission_bps")        // Trendyol ~2100
  cargoMinorPerOrder  Int              @map("cargo_minor_per_order")
  returnRateBps       Int              @default(0) @map("return_rate_bps")
  adCostMinorPerOrder Int              @default(0) @map("ad_cost_minor_per_order")
  updatedAt           DateTime         @updatedAt @map("updated_at")
  @@unique([storeId, channel])
  @@map("commerce_channel_economics")
}

model CommerceCampaignSimulation {
  id               String   @id @default(cuid())
  storeId          String   @map("store_id")
  variantId        String   @map("variant_id")
  channel          SalesChannelKind
  listPriceMinor   Int      @map("list_price_minor")
  discountBps      Int      @map("discount_bps")
  netMinor         Int      @map("net_minor")
  marginBps        Int      @map("margin_bps")
  breakEvenBps     Int      @map("break_even_bps")     // kârı sıfırlayan indirim
  verdict          String   @db.VarChar(16)            // SAFE | THIN | LOSS
  createdAt        DateTime @default(now()) @map("created_at")
  @@index([storeId, createdAt])
  @@map("commerce_campaign_simulations")
}
```

**Saf fonksiyon — `lib/commerce/profit.ts`:**

```
simulateCampaign({ priceMinor, discountBps, cogsMinor, commissionBps, cargoMinor, returnBps, adCostMinor })
  → { netMinor, marginBps, breakEvenBps, verdict }
  breakEvenBps = fiyatı net = 0 yapan indirim (ikili arama değil, kapalı form)
```

**API:** `POST .../campaigns/simulate` (yazmaz, 200 döner — anlık slider için) · `POST .../campaigns` (kaydeder + kampanya metni üretir) · `GET .../campaigns`.

**AI akışı:** Metin üretimi `lib/tezgah/reklam/guard.ts` deseniyle mühürlenir: model yalnız kanca/metin yazar; **indirim oranı, fiyat ve "kâr" iddiası** kodun metnidir. Model "%50 kâr" yazarsa `inventsMoney` benzeri sayı kapısı reddeder.

**UI kancası:** Kokpitte "Otonom Büyüme" sekmesi (`os-cockpit.tsx:819-933`) bugün 3 kart (reklam / hibe / uzman). Buna 4. kart: **"Kâr Korumalı İndirim"** — slider + `breakEvenBps` göstergesi + "Kâr bölgesi dışındasın" uyarısı.

---

### 4.4 Motor 4 — Günlük Kâr Özeti ve Zarar Kalkanı (Retention Engine)

**Neden en son:** Doğru çalışması için Motor 1–3'ün verisine ihtiyaç duyar. Erken kurulursa **yanlış kâr** raporlar ve güveni ilk günden yakar.

**Gerekli şema (yeni):**

```prisma
model CommerceDailyBrief {
  id          String   @id @default(cuid())
  storeId     String   @map("store_id")
  dayKey      String   @map("day_key") @db.VarChar(10)   // Europe/Istanbul YYYY-MM-DD
  payloadJson String   @map("payload_json") @db.Text
  netMinor    Int      @map("net_minor")
  lossSkuCount Int     @map("loss_sku_count")
  createdAt   DateTime @default(now()) @map("created_at")
  @@unique([storeId, dayKey])
  @@map("commerce_daily_briefs")
}

enum CommerceActionKind { REPRICE LOWER_AD PAUSE_SKU RESTOCK BUNDLE }
enum CommerceActionStatus { SUGGESTED APPLIED DISMISSED }

/// "Tek tıkla uygula"nın sicili. Uygulama ayrı rotada; öneri burada.
model CommerceProfitAction {
  id           String               @id @default(cuid())
  storeId      String               @map("store_id")
  briefId      String               @map("brief_id")
  kind         CommerceActionKind
  variantId    String?              @map("variant_id")
  paramsJson   String               @map("params_json") @db.Text
  expectedGainMinor Int             @map("expected_gain_minor")
  status       CommerceActionStatus @default(SUGGESTED)
  appliedAt    DateTime?            @map("applied_at")
  @@index([storeId, status])
  @@map("commerce_profit_actions")
}
```

**Kural motoru (deterministik):**
- `LOSS` — `netMinor < 0` olan varyant (Motor 3 formülüyle, güncel fiyat + kanal maliyeti).
- `CRITICAL_STOCK` — mevcut `isCriticalStock` yeniden kullanılır (`os-rules.ts:33-35`).
- `DEAD_STOCK` — `approvedStockQty > 0` ve son N günde satış hareketi 0.
- `BREAK_EVEN_NEAR` — `breakEvenBps - discountBps < 500` (500 baz puan = %5 pay).

**Cron:** `inngest.ts`'e `commerce-daily-brief` — `TZ=Europe/Istanbul 0 7 * * *` (mevcut `commerce-subscription-renewal` `15 4 * * *` desenine uyar). Mail: mevcut `deliverCitizenNoticeMail` (`lib/kernel/notice/mail.ts`) genişletilir; `CitizenNotice["kind"]`'a `commerce_daily_loss` eklenir, `NOTICE_SEN` sözlüğüne tek giriş yazılır. **Yeni SMTP yığını kurulmaz** — mevcut `readNoticeMailConfig` yeniden kullanılır.

**API:** `GET /api/commerce/briefs/today` · `POST /api/commerce/actions/[id]/apply` (tek tık: fiyat güncelle / reklamı durdur / paket öner).

**AI akışı:** Yalnız **özet cümlesi** (5 satır) ve **aksiyon gerekçesi** (1 cümle). Sayılar `payloadJson`'dan gelir; LLM sayı yazamaz. Böylece "sabah 07:00'de gelen mail" hem doğru hem ucuz olur (1 küçük çağrı/satıcı/gün).

---

### 4.5 Motorların birbirine bağımlılığı (kodlama sırası)

```
Motor 3 (simülatör, saf fonksiyon)   ← bugün başlanabilir, tablo beklemez
        ↓ profit.ts
Motor 1 (paket/barem)                 ← kargo tarifesi + COGS gerekir
        ↓
Motor 4 (günlük özet + aksiyon)       ← 1 ve 3'ün verisine ihtiyaç duyar
        ↓
Motor 2 (fırsat radarı)               ← dış veri edinimi en pahalı iş; en son
```

Bu sıra, "en hızlı görünür değer" ile "en derin veri yatırımı" arasındaki tek makul dengedir.

---

## 5. Aşamalı Geliştirme Yol Haritası

### Faz 1 — Hızlı Kazanımlar ve Vitrin/UX Yenileme (2 hafta, kod değişikliği)

Hedef: **modül kendi gerçeğini doğru söylesin** ve **satıcı ürünü görmeden VKN vermek zorunda kalmasın**.

| # | İş | Dosya(lar) | Kabul ölçütü |
|---|---|---|---|
| 1.1 | **Kamuya açık `/e-ticaret` vitrin sayfası.** `app/(public)/e-ticaret/page.tsx`; `PROTECTED_KERNEL_PATHS`'tan çıkar, `PAGE_SEO.e-ticaret` ekle, `SITEMAP_STATIC_PATHS`'a yaz. İçerik: tek ekran "stok + sipariş + **kâr**" vaadi, 3 örnek panel görseli, "30 gün ücretsiz" şeridi, tek CTA. | `edge-guard.ts:42-52`, `components/commerce/*` | `/e-ticaret` oturumsuz **200**; site haritasında 1 giriş; `/e-ticaret` korumalı kokpiti `/panel/e-ticaret`'e taşınır |
| 1.2 | **Amazon/N11 dürüstlüğü.** Ya `channel-adapters.ts`'ten çıkar + 5 metin satırından sil (§3.4 tablosu), ya da `OS_CHANNEL_CATALOG`'da `"Yakında"` rozetiyle pasifleştir. Vitrin metni "Trendyol ve Hepsiburada" olur. | `public-vitrine.ts:180-183`, `os-cockpit.tsx:132,137`, `llms.txt:67`, `.system_docs/URUN_VITRINI.md` | `rg -i "amazon"` yalnız gerçek kodda (adaptör + `channelChrome`) kalır; vitrin metninde 0 |
| 1.3 | **Tek stok gerçeği.** `approved_stock_qty` türetilmiş olur: tek yazar `inventory_transactions`. İki webhook lehçesi tek motorda birleşir. Göç: `approved_stock_qty ← SUM(variants.on_hand_qty - safety_buffer)`. | `channel-stock-engine.ts:161-175`, `inventory-sql.ts`, `os-service.ts:296` | Vitrin ve kokpit **aynı** sayıyı gösterir; yeni test: "webhook satışı sonrası vitrin satılabilir adet düştü" |
| 1.4 | **Lisans kapısı sunucuya.** `connectChannel` başında `commerceLicenseActive` okunur; `403 "Kanal bağlamak için lisans gerekir."` | `os-service.ts:323` | Test: lisanssız `action:"channel"` → 403 |
| 1.5 | **Simülasyon düğmeleri.** Üretimde gizle **veya** yazmayan dry-run'a çevir. | `os-cockpit.tsx:514-528, 700` | Üretim derlemesinde düğme yok **veya** 200 döner |
| 1.6 | **"Eşitle" dürüstlüğü.** Düğme adı "Kanallara kuyruk yaz" olur veya `syncCatalog` gerçek push tetikler. | `os-service.ts:388-399`, `os-cockpit.tsx:584-591` | Ekranda "eşitlendi" yalanı yok |
| 1.7 | **Sen aksı temizliği** (6 satır, §3.8). `verify:sen-axis` sözlüğüne `hakkınız|yazınız|sizin ... nıza` eklenir ki tekrar etmesin. | 3 bileşen + `scripts/verify-sen-axis.ts` | Sözlük genişletildi, tarama yeşil |
| 1.8 | **`error.tsx` + robots.** `app/(kernel)/e-ticaret/error.tsx` ve `app/(kernel)/magazam/error.tsx` mağaza diliyle; `/e-ticaret`, `/magazam` `ROBOTS_DISALLOW_PATHS`'a. | `app/(kernel)/…`, `seo.ts:295` | Hata anında mağaza menüsü kalır; robots 2 satır uzar |
| 1.9 | **Çok varyant.** Kokpitte `take: 1` kaldırılır; ürün satırı varyant sayısını gösterir, onay tüm varyantları yayar. | `os-load.ts:108`, `os-service.ts:252-254` | Varyantlı kart kokpitte eksiksiz |

**Faz 1 kapıları (bitirmeden):** `npx tsc --noEmit` · `npx vitest run tests/commerce tests/tezgah` · `npm run verify:api-auth -- --check` · `npm run verify:boundaries` · `npm run verify:rls-status` · `npm run verify:sen-axis`

**Faz 1 riski:** 1.3 (tek stok) veri göçü gerektirir. Geri dönüş planı: göç `approved_stock_qty`'yi **ezmez**, yeni `derived` kolonu ekler; eski kolon 1 sürüm boyunca salt-okunur kalır.

---

### Faz 2 — Veritabanı + Akıllı Motorlar (6 hafta, 4 motor)

| Hafta | İş | Çıktı | Kapı |
|---|---|---|---|
| 1 | **Ekonomi katmanı.** `CommerceUnitEconomics`, `CommerceShippingTariff`, `CommerceChannelEconomics` + 3 migration + RLS sicili. `lib/commerce/profit.ts` saf fonksiyonları (`unitNet`, `simulateCampaign`, `breakEvenBps`) + 25 birim testi. | Motor 3'ün çekirdeği, DB'siz doğrulanmış | `verify:rls-status`, `verify:boundaries`, `vitest` |
| 2 | **Motor 3 (simülatör).** `POST .../campaigns/simulate`, `POST .../campaigns`, `GET .../campaigns`. Kokpitte 4. büyüme kartı + slider. AI yalnız metin, sayı kodda. | Satıcı "bu indirim kârımı bitirir mi" sorusunu **görüyor** | `verify:api-auth`, yeni rota 3 |
| 3 | **Motor 1 (paket/barem).** `CommerceBundleProposal`, `propose`/`accept`/`dismiss`. Deterministik tarayıcı + kargo bandı eşleştirme. Kabul → gerçek `CommerceProduct`. | 2'li/3'lü set önerisi, kargo tasarrufu kanıtlı | Test: "2 adet aynı bara sığıyorsa tekil kârdan yüksek net" |
| 4 | **Motor 4a (özet motoru).** `CommerceDailyBrief` + `CommerceProfitAction`; Inngest cron `0 7 * * *`; `CitizenNotice` yeni tür + mail. | Her sabah doğru sayı | Cron testi + mail kuru çalıştırma |
| 5 | **Motor 4b (aksiyon).** `POST .../actions/[id]/apply` — fiyat güncelle, reklamı durdur, paket öner. Her aksiyon idempotent. | "Tek tıkla kâr aksiyonu" | Test: iki kez apply → tek yazma |
| 6 | **Motor 2 (radar).** `CommerceCatalogGapSignal` + `CommerceProductSuggestion`; sinyal toplayıcı (kendi katalog + hibe kataloğu + tetkik). Yeterli sinyal yoksa **"veri yok"**. | "Ne satılır?" — kanıtlı, uydurmasız | Test: sinyalsiz çağrı boş liste + dürüst mesaj |

**Faz 2 mimari kararları (yazılı olarak sabitlenmeli):**

1. **Kâr defteri ile stok defteri ayrıdır.** `stock_ledgers`'a ciro/kâr yazılmaz (şemanın mevcut kuralı korunur). Kâr `commerce_campaign_simulations` + `commerce_daily_briefs` içinde yaşar.
2. **`AI_TOKEN_SOURCES.COMMERCE` eklenir.** Bugün yanıt taslağı `SUPPORT` yazıyor (`os-service.ts:505`); modül kendi maliyetini göremez.
3. **Hiçbir motor para yazmaz.** Motorlar yalnız **öneri ve hesap** üretir; para hareketi mevcut `appendLedgerEntry` + `Idempotency-Key` hattında kalır. Bu, `A2` (tek tahsilat kanalı) ile uyumun tek yoludur.
4. **Her motor "veri yok" diyebilir.** Fiyat uydurmama kültürünün (`honesty: "planned"`) kâr tarafındaki karşılığı budur.

**Faz 2 sonrası beklenen skor:**

| Eksen | Bugün | Faz 1 sonrası | Faz 2 sonrası |
|---|---:|---:|---:|
| Mimari Hazırlık | 42 | 68 | 82 |
| Mevcut İşlevsellik | 58 | 74 | 84 |
| Ticari Farklılaşma | 30 | 40 | **78** |
| UX / Vitrin | 40 | 76 | 82 |
| **Toplam** | **44** | **65** | **82** |

---

## 6. Raporun Tek Paragraflık Özeti

yetkin.ai'nin E-Ticaret modülü, **Türkiye'de eşi olmayan bir muhasebe disiplinine** sahip — append-only defter, `FOR UPDATE` kilidi, mühürlü kimlik kasası, idempotency olmadan tek kuruş hareket etmeyen bir para hattı. Ama aynı modül, **satıcının kâr etmesini sağlayan hiçbir şeyi bilmiyor**: komisyon, kargo, iade, reklam maliyeti ve COGS için şemada tek kolon yok; stok üç ayrı sütuna bölünmüş ve üçü birbirini güncellemiyor; kamuya açık bir vitrini yok; vitrinde satılan iki kanal (Amazon, N11) kodda iskelet. Bu yüzden modül bugün bir **"entegrasyon paneli"** — rakiplerin (Ticimax, IdeaSoft, StockMount) aynısı, hatta onlardan daha az kanallı. Fark yaratacağı yer belli: **entegratörler kârı bilmiyor, muhasebe yazılımları kanalı bilmiyor.** Dört motorun (paket/barem, radar, kampanya simülatörü, günlük zarar kalkanı) tamamı bu boşluğa nişan alıyor — ve hepsi mevcut mimariye **tablo ekleyerek**, mevcut mühürleri **kırmadan** kurulabilir. Sıra önemli: önce modülün kendi gerçeğini doğru söylemesi (Faz 1), sonra kâr beyni (Faz 2).

---

*Bu rapor hiçbir kaynak dosyayı değiştirmedi. Tüm bulgular okunabilir dosya yolu + satır numarası ile kanıtlanmıştır; "doğrulanması gereken" olarak işaretlenen tek iddia §3.7'deki PayTR yenileme davranışıdır (canlı hesap gerektirir).*
