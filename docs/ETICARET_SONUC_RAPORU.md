# yetkin.ai — E-Ticaret Modülü Final Denetim Raporu

**Denetim tarihi:** 22 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / E-Ticaret Ürün Mimarı
**Denetim konusu:** `docs/ETICARET_FAZ1_RAPORU.md` ve `docs/ETICARET_FAZ2_RAPORU.md` iddialarının bağımsız doğrulaması
**Referans:** `docs/ETICARET_TESPIT_RAPORU.md` (ilk denetim, **44 / 100**)
**Kural:** Hiçbir kaynak dosya değiştirilmedi, silinmedi, oluşturulmadı. Yalnız bu rapor yazıldı.

**Yöntem:** Statik okuma (şema → servis → rota → UI → cron iz sürme), saf fonksiyonların canlı çalıştırılması (`tsx -e`), doğrulama kapılarının fiilen koşulması, `next build` çıktısı ve `routes-manifest.json` üzerinden rota kanıtı.

---

## 0. Yürütülen Doğrulama Kapıları (bu denetimde yeniden koşuldu)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ 0 hata |
| E-Ticaret + Tezgâh testleri | `npx vitest run tests/commerce tests/tezgah` | ✅ **38 dosya / 256 test** |
| API ↔ auth haritası | `npx tsx scripts/verify-api-auth.ts --check` | ✅ 146 rota (`session:85`) |
| Sınır mührü | `npx tsx scripts/verify-boundaries.ts` | ✅ |
| Dil aksı | `npx tsx scripts/verify-sen-axis.ts` | ✅ 536 dosya |
| RLS sicili | `npx tsx scripts/verify-rls-status.ts` | ✅ 9 yeni tablo dahil |
| Sır taraması | `npx tsx scripts/verify-no-secrets.ts` | ✅ |
| Üretim derlemesi | `npx next build` | ✅ `routes-manifest.json`: `/e-ticaret`, `/panel/e-ticaret` her ikisi de üretildi |

> **Kritik gözlem (tekrar):** Bu 8 kapının hiçbiri "kokpitte 'Bağla' dediğim Trendyol sipariş çekiyor mu", "sabah 07:00'de satıcıya bir şey ulaşıyor mu", "kâr rakamı KDV'yi düşüyor mu", "önerdiğim fiyat zararı bitiriyor mu" sorusunu sormuyor. Faz 2 raporundaki "kapılar yeşil" ifadesi **doğru**; ama yeşil kapı bu rapordaki `[KRİTİK]`/`[YÜKSEK]` bulguların **hiçbirini** yakalamıyor. Kapı kapsamı hâlâ ürün sorusu sormuyor.

---

## 1. Final Puan Kartı ve Kıyaslama Tablosu

### 1.1 Puan: **61 / 100** (44 → 61, **+17**)

Faz 2 raporu "82" vaat ediyordu. Gerçekleşme **61**. Aradaki 21 puanın tamamı "motor var, ama motorun çıktısı satıcıya ulaşmıyor / çıktı yanlış" farkından geliyor.

| Eksen | İlk denetim | Faz 1 vaadi | Faz 2 vaadi | **Bu denetim** | Fark (44→61) |
|---|---:|---:|---:|---:|---:|
| **Mimari Hazırlık** | 42 | 68 | 82 | **63** | +21 |
| **Mevcut İşlevsellik** | 58 | 74 | 84 | **61** | +3 |
| **Ticari Farklılaşma** | 30 | 40 | 78 | **60** | +30 |
| **UX / Vitrin** | 40 | 76 | 82 | **58** | +18 |
| **Toplam** (ağırlık: 25/30/25/20) | **44** | 65 | 82 | **61** | **+17** |

Ağırlıklar ilk raporun toplamını birebir üretir: `42×0.25 + 58×0.30 + 30×0.25 + 40×0.20 = 43,4 → 44`. Aynı ağırlıkla yeni toplam `63×0.25 + 61×0.30 + 60×0.25 + 58×0.20 = 60,65 → 61`.

### 1.2 Eksen gerekçeleri (tek cümle + kanıt)

| Eksen | Puan | Neden bu puan, neden daha yüksek değil |
|---|---:|---|
| **Mimari Hazırlık** | **63** | Ekonomi katmanı gerçekten kuruldu: 9 tablo + `FORCE RLS` + `rls_deny_unscoped`, saf `profit.ts` (DB importu yok, float yok), `AI_TOKEN_SOURCES.COMMERCE`, idempotent yazma rotaları — hepsi kanıtlandı (`prisma/migrations/20261122230000_faz2_commerce_economics/migration.sql:205-232`, `lib/commerce/profit.ts:1-6`). **Ama** iki kimlik kasası, iki stok defteri, iki webhook lehçesi, ürün-seviyesi stok dağıtımı ve kullanılmayan `vatBps` duruyor: `lib/commerce/economics-service.ts:63-85` KDV'yi **yazıyor**, `lib/commerce/profit.ts:142-170` KDV'yi **hiç okumuyor**. |
| **Mevcut İşlevsellik** | **61** | Dört motor uçtan uca kodlu ve çalışıyor; ama zincirin son halkaları kopuk: kampanya metni üretilip **hiç gösterilmiyor** (`components/commerce/profit-engines-panel.tsx:191-201`), radar→Tezgâh devri **307 ile çöpe gidiyor** (`lib/commerce/opportunity-radar.ts:152` + `app/tezgah/page.tsx:24-27`), `BUNDLE`/`RESTOCK` "uygula" düğmeleri **hiçbir şey yapmıyor** (`lib/commerce/daily-brief.ts:394-397`). |
| **Ticari Farklılaşma** | **60** | Barem kırıcı + kâr korumalı indirim gerçekten pazarda olmayan şeyler; deterministik hesap doğru kurulmuş (`lib/commerce/profit.ts:280-372`). Ama farkı satıcıya hissettiren üç kanal kapalı: e-posta yok (§3.3), vitrinde "Canlı" denen motorlar tek varyantla çalışıyor (§3.1), ve rakamlar KDV'siz olduğu için **olduğundan iyi** görünüyor (§3.0). |
| **UX / Vitrin** | **40 → 58** | Kamu vitrini, SEO, robots, "Yakında" rozeti, sen aksı gerçekten düzeldi — bunlar ölçüldü. Ama vitrin **üst menüde yok** (`components/public/public-top-bar.tsx:24-29`), panelde satıcıya "Maliyet (**kuruş**)" ve "Desi (**gram**)" yazdırılıyor (`profit-engines-panel.tsx:308-350`) ve başlıkta "kaydırıcı **anlık** hesaplar" yazarken kaydırıcı hesap yapmıyor (`:367` vs `:380`). |

### 1.3 Tek cümlelik teşhis (güncel)

> İlk denetimde modül "muhasebe memuru"ydu; bugün **kâr beyni olma iddiasını taşıyan bir muhasebe memuru** — beyin ameliyatı yapıldı, ama sinir uçları satıcının eline kadar uzatılmadı.

---

## 2. Çözülenler vs. Hâlâ Açık Kalanlar (Kanıtlı Liste)

### 2.1 Gerçekten çözülenler (doğrulandı, itiraz yok)

| İlk bulgu | Durum | Kanıt |
|---|---|---|
| **K-03** Kamuya açık vitrin yok | ✅ **Çözüldü** | `app/(public)/e-ticaret/page.tsx` var; `PAGE_SEO.eTicaret` (`lib/copy/seo.ts:148-161`), `SITEMAP_STATIC_PATHS` (`:277`), `sitemapRoutePolicy` priority 0.9 (`:401`), `ROBOTS_DISALLOW_PATHS` `/panel/e-ticaret` + `/magazam` (`:324-325`). `routes-manifest.json` ikisini de listeliyor. |
| **K-01 (kısmi)** `approved_stock_qty` ≠ varyant toplamı | ✅ **Büyük ölçüde çözüldü** (aşağıda kalan delik var) | `INVENTORY_MOVE_SQL` içinde `synced AS (UPDATE commerce_products ... SUM(sib.on_hand_qty) + g.next_on_hand)` (`lib/commerce/inventory-sql.ts:130-146`); kanal satışı hedefi varyantlara dağıtıyor (`lib/commerce/channel-stock-prisma.ts:119-147`); idempotent göç (`prisma/migrations/20261122220000_faz1_sync_approved_stock/migration.sql:1-11`). |
| **Y-01** Amazon/N11 metinde satılıyor | ✅ **Çözüldü** | `OS_CHANNEL_CATALOG` ikisinde `comingSoon: true` (`lib/commerce/os-rules.ts:13-14`); sunucu `422 "Bu kanal yakında."` (`lib/commerce/os-service.ts:344`); vitrin/llms.txt/pricing metinlerinde geçmiyor — `tests/commerce/e-ticaret-vitrine-surface.test.ts:42-46` bunu kilitliyor. |
| **Y-02** Lisans kapısı yalnız istemcide | 🟡 **Kısmen çözüldü** | `connectChannel` artık `403` dönüyor (`lib/commerce/os-service.ts:368-371`). **Ama kapı iki kapıdan yalnız birinde** — §2.2/A3. |
| **Y-03** Üretimde her zaman 403 veren düğmeler | ✅ **Çözüldü** | `SHOW_SIMULATION_CONTROLS` üretimde `null` döner (`components/commerce/os-cockpit.tsx:516-535, 710-713`). |
| **Y-04** Yenileme `127.0.0.1` + sahte e-posta | 🟡 **Kısmen çözüldü** | `OUTBOUND_PUBLIC_IP` okunuyor, e-posta yoksa çekim yapılmıyor (`lib/commerce/subscription-renewal.ts:34-42, 66-86`), `.env.example`'da anahtar var. **Ama** IP yoksa hâlâ `127.0.0.1` ile çekim deneniyor ve yalnız `warn` log'u düşüyor — sessiz ölüm aynen duruyor; `non_3d: "1"` hâlâ sabit (`lib/commerce/paytr-stored-card.ts:72`). |
| **O-01** "siz" aksı | ✅ **Çözüldü** | `verify:sen-axis` 536 dosya, 37 kalıp, 0 ihlal; commerce bileşenlerinde `yazınız/hakkınız/sizin` kalmadı (yalnız yorum satırlarında "yalnız"). |
| **O-02** Error boundary yok | ✅ **Çözüldü** | `app/(kernel)/panel/e-ticaret/error.tsx`, `app/(kernel)/magazam/error.tsx` var; panele dönüş bağlantısı taşıyor. |
| **O-03** robots'ta listelenmiyor | ✅ **Çözüldü** | `lib/copy/seo.ts:324-325`. |
| **O-04** `variants: { take: 1 }` | ✅ **Çözüldü (veri katmanında)** | `lib/commerce/os-load.ts:110` tüm varyantları çekiyor, `variantCount` gösteriliyor (`os-types.ts:16-17`). **Ama UI hâlâ tek varyantı seçtiriyor** — §3.1. |
| **K-02** Kâr/komisyon/kargo şeması yok | ✅ **Çözüldü (şema)** | 9 tablo + saf çekirdek + testler; `stock_ledgers`'a ciro yazılmıyor kuralı korunmuş (`migration.sql:1-2`). |
| Dört motor yok | ✅ **Kodlandı** | `profit.ts`, `campaign-engine.ts`, `bundle-engine.ts`, `daily-brief.ts`, `opportunity-radar.ts` + 11 rota + cron — hepsi mevcut ve testten geçiyor. |

### 2.2 Hâlâ açık kalanlar

#### A1 — `[KRİTİK]` KDV hesaplanıyor ama kâra hiç girmiyor: kâr sistematik olarak **şişik**

`CommerceUnitEconomics.vatBps` şemada var, serviste yazılıyor (`lib/commerce/economics-service.ts:63, 82, 85`), panelde varsayılanı `2000` (`prisma/schema/commerce.prisma:484`). Ama kâr çekirdeği onu **hiç okumuyor**:

```142:170:lib/commerce/profit.ts
export function calculateUnitNet(input: UnitNetInput): UnitNetResult {
  ...
  const revenueMinor = input.priceMinor * input.quantity;
  const commissionMinor = bpsOf(revenueMinor, input.commissionBps);
  const cogsMinor = input.costMinor * input.quantity;
  const returnMinor = bpsOf(revenueMinor, input.returnRateBps);
  const netMinor =
    revenueMinor - commissionMinor - input.cargoMinor - cogsMinor - returnMinor - input.adCostMinorPerOrder;
```

`UnitNetInput` tipinde `vatBps` alanı **yok** (`lib/commerce/profit.ts:17-26`). Türkiye'de pazaryeri fiyatı **KDV dahildir**. 100,00 TL'lik (10.000 kuruş) bir üründe devlete ödenecek KDV ≈ **1.667 kuruş**; modül bu tutarı "kâr" sayıyor. Marj %10 iken bu, marjın **~%17'sini** hayalet kâr olarak göstermek demek. "Kâr beyni"nin ana ekranındaki rakam, ilk günden **yanlış yönde** yanılıyor.

**Etki:** Satıcı "kâr ediyorum" der, ay sonunda muhasebe "etmedin" der. Bu, kâr panelinin retention üretmesi beklenen tek şeyi — **güveni** — ilk ayda yakar.
**Kanıt ek:** Satıcının `vatBps` girebileceği bir UI alanı da yok (`components/commerce/profit-engines-panel.tsx:280-355` yalnız maliyet/desi/komisyon/barem alır); yani KDV ayarlanamıyor bile.

#### A2 — `[KRİTİK]` Çok varyantlı üründe kanal satışı **yanlış varyanttan** düşüyor → aşırı satış

OS lehçesi webhook'u satışı **ürün** seviyesinde planlıyor, sonra hedefi varyantlara `createdAt` sırasıyla dağıtıyor:

```161:175:lib/commerce/channel-stock-engine.ts
    const plan = planChannelSale(product.approvedStockQty, product.criticalStockQty, input.quantity);
    ...
    await uow.setApprovedStock(product.id, plan.stockAfter);
```

```119:147:lib/commerce/channel-stock-prisma.ts
    async setApprovedStock(productId, quantity) {
      const goal = Math.max(0, quantity);
      const variants = await tx.commerceVariant.findMany({ where: { productId }, orderBy: { createdAt: "asc" }, ... });
      const nextOnHand = distributeApprovedTarget(variants, goal);
```

Azalışta `distributeApprovedTarget` **ilk varyanttan** düşüyor, satılan varyantı bilmiyor (`lib/commerce/stock-sync.ts:83-90`).

**Somut senaryo (kodda bugün):** Tişört, S=5, XL=1. Trendyol'dan **XL** satılır.
1. `lockProductBySku` ürünü `variants: { some: { sku } }` ile bulur → ürün kilidi (`channel-stock-prisma.ts:22-56`).
2. `planChannelSale(6, …)` → `stockAfter = 5`.
3. `distributeApprovedTarget([5, 1], 5)` → **S: 5→4**, XL: **1 kalır**.
4. Vitrin varyant `on_hand_qty` okur (`lib/commerce/storefront-load.ts:41-50`) → **XL hâlâ "1 adet satılabilir"**. Aşırı satış.
5. S stoğu tükenirse `nextVariantStatus` onu `PASSIVE` yapar (`channel-stock-prisma.ts:136-143`) → satılmayan beden vitrinden **düşer**, satılan beden görünür kalır.

Bu, K-01'in "tek sayı" kısmının çözülüp **"doğru varyant"** kısmının çözülmediğini gösteriyor. Beş bedenli bir tişört satan satıcı için bu bir "edge case" değil, **ana akış**.

#### A3 — `[YÜKSEK]` Kanal yayını **ilk varyantın SKU'sunu + ürün toplam stoğunu** gönderiyor

```40:43:lib/commerce/channel-broadcast.ts
  // Ürün SKU'su boşsa ilk dolu varyant SKU'su; onaylı adet 0 ise varyant toplamı.
  const sku = effectiveSku(product.sku, variants);
  const quantity = effectiveApprovedQty(product.approvedStockQty, variants);
```

`effectiveSku` ilk **dolu** varyant SKU'sunu alır (`stock-sync.ts:26-38`). Yani 5 bedenli üründe onay akışı Trendyol'a **S bedenin barkoduyla 6 adet** yazar; XL/L/M hiç güncellenmez. Pazaryerinde ya tek beden şişer ya da Trendyol "barkod bulunamadı" döner. `broadcastStockToChannels` `approvedStockQty` üzerinden çalıştığı için (§A2 ile aynı kök) bu hata **onay akışında da** tekrar ediyor (`lib/commerce/os-service.ts:310`).

#### A4 — `[YÜKSEK]` Lisans kapısı iki kapıdan yalnız birinde: klasik kanal masası **kapısız**

- Kokpit kapısı: `connectChannel` → `403 "Kanal bağlamak için aktif lisans gerekir."` (`lib/commerce/os-service.ts:368-371`). ✅
- Klasik masa: `PUT /api/commerce/stores/[storeId]/credentials/trendyol` → `putTrendyolCredential` (`lib/commerce/marketplace-service.ts:87-119`). **Lisans okuması yok** — tek satır `commerceLicenseActive` importu bile yok.

**Etki:** 30 gün bitince satıcı `/magazam/{id}/kanallar` formundan 3 alanı girer, kimlik kasaya yazılır, ekranda "kaydedildi" görür. Sipariş çekme `outgoingSyncAllowed` ile durduğu için para kaybı yok — ama ürün, ekranında **"kimlik kayıtlı"** diyor. Yani Y-02'nin ruhu (gelir kapısı) tek kapıda kapatıldı, diğeri açık kaldı.

#### A5 — `[YÜKSEK]` Kokpitte "Bağla" hâlâ **sipariş çekmiyor** — iki kasa borcu kapanmadı

Kokpit `sales_channels`'a yazıyor (`lib/commerce/os-service.ts:389-404`). Sipariş çeken cron `commerceMarketplaceCredential` okuyor:

```253:258:lib/commerce/trendyol-sync.ts
  const rows = await ports.marketplace.listCredentials(COMMERCE_CHANNEL);
```

```157:159:lib/commerce/marketplace-prisma.ts
    async listCredentials(channel) {
      const rows = await db.commerceMarketplaceCredential.findMany({ where: { channel } });
```

İki tablo, iki form, iki anahtar girişi. Faz 1 raporu bu borcu "bilinçli sınır" diye işaretlemişti; **satıcı açısından sonuç değişmedi**: kokpitte yeşil "Bağlı" rozeti, gerçek sipariş hattına bağlı değil. Satıcı iki ayrı yere anahtar girmek zorunda (veya yalnız klasik masaya girip kokpitte "bağlı değil" görmek zorunda).

#### A6 — `[YÜKSEK]` `syncCatalog` kuyruğu **hiç boşalmıyor** — "kuyruk" yazılıyor, işçi yok

```406:414:lib/commerce/os-service.ts
export async function syncCatalog(...) {
  const stamped = await stampConnected(userId);
  ...
      message: "Güncelleme kuyruğa alındı; periyodik senkronizasyonda işlenecek.",
```

`stampConnected` yalnız `lastSyncedAt` yazar ve ilanları `PENDING`'e çeker (`lib/commerce/os-service.ts:110-134`). Depoda `PENDING` ilanları **okuyup işleyen** tek bir yol yok: `grep syncStatus` yalnız `markListing` yazıcılarını ve `pushTrendyolListingStock`'u (olay tetiklemeli) gösteriyor; cron listesinde ilan tarayıcısı yok (`lib/kernel/jobs/inngest.ts:378-490`). Düğme metni dürüstleştirildi (Y-03 ruhu ✅) ama **vaat edilen periyodik senkronizasyon yok**. Satıcı sonsuza kadar `PENDING` görür.

#### A7 — `[ORTA]` `PUT .../economics` her kayıtta **yeni kargo baremi satırı** açıyor; eski barem sessizce "en ucuz" olarak kazanıyor

```106:127:lib/commerce/economics-service.ts
    const row = await prisma.commerceShippingTariff.create({ ... effectiveFrom: now });
```

Tekillik yok (`(storeId, carrier, bandMin)` unique değil), güncelleme yok. `cargoForWeight` uyan bantları **fiyata göre sıralayıp en ucuzunu** seçiyor (`lib/commerce/profit.ts:255-260`).

**Sonuç:** Satıcı baremi 39,90 → 49,90 yaptığında eski 39,90 satırı silinmiyor; motor sonsuza kadar **39,90** ile hesaplıyor. Barem kırıcı motorun tüm "kargo tasarrufu" iddiası, tek bir zam sonrası yanlış sayıya dönüşüyor. Aynı şey `desi/cost` düzeltmelerinde de yaşanmıyor (unit economics `upsert`, doğru) — yani tutarsız: **maliyet upsert, tarife create**.

---

## 3. Dört Akıllı Motorun Gerçeklik Testi (UI ↔ API ↔ Motor ↔ DB ↔ Cron)

### 3.1 Genel: motorlar **tek varyantla** çalışıyor

`ProfitEnginesPanel` ürün listesini `variantId` üzerinden kuruyor, seçenek **değeri** tek varyant:

```69:96:components/commerce/profit-engines-panel.tsx
  const products = view.products.filter((product) => product.variantId);
  ...
  const [variantId, setVariantId] = useState(products[0]?.variantId ?? "");
```

`os-load` her ürün için tek `variantId` üretiyor:

```135:153:lib/commerce/os-load.ts
      const variant = product.variants[0] ?? null;
      ...
        variantId: variant?.id ?? null,
        variantCount: product.variants.length,
```

**Sonuç:** 5 bedenli tişörtte **yalnız ilk bedenin** maliyeti/desisi girilebilir, yalnız ilk beden simüle edilir, günlük özet yalnız varyantları `ACTIVE` olanları tarar ama panelde o varyantlara ulaşan arayüz yok. O-04 veri katmanında kapandı, **ürün yüzeyinde kapanmadı**. Faz 2 raporunun "Çok Varyant" başlığı burada tutmuyor.

### 3.2 Motor 3 — Kampanya & İndirim Simülatörü

| # | Kusur | Kanıt |
|---|---|---|
| M3-1 | **Başlık "anlık" diyor, kaydırıcı hesap yapmıyor.** "Kaydırıcı indirimi anlık hesaplar" metni duruyor; hesaplama yalnız "Simüle et" düğmesine bağlı. | Metin `profit-engines-panel.tsx:367`; slider yalnız state yazıyor `:374-381`; hesap `runSimulate()` içinde `:165-188`, düğme `:382-384` |
| M3-2 | **Zarar eden SKU'da ekran kendi kendisiyle çelişiyor.** `breakEvenBps = 0` döndüğü için `discountBps > breakEvenBps` yanlış olur ve ekran "kâr bölgesindesin" basar — verdict aynı anda **LOSS**. | `lib/commerce/profit.ts:201-216` (liste fiyatı başabaşı karşılamıyorsa `0` döner); UI karşılaştırması `profit-engines-panel.tsx:405-409`. Ölçüm: fiyat 100,00 / COGS 90,00 / kargo 39,90 → `verdict=LOSS`, `breakEvenBps=0`, `0>0=false` → **"kâr bölgesindesin"** |
| M3-3 | **`scrubInventedNumbers` aşılabiliyor: birim kör.** İzin listesi kuruş ve TL karışık; model "8500 TL" yazarsa (kuruş değerini TL sanıp) geçer. Yüzde de aynı torbada: `discountBps=1500` ve `floor(1500/100)=15` birlikte izinli → "%1500" ya da "%15" ikisi de geçer. | `lib/commerce/profit.ts:158-166` (allowed listesi), `lib/commerce/profit-text.ts:22-37`. Ölçüm: izin `[1500,15,8500,'85,00',2500,'25,00',…]` iken `"Bu urun 8500 TL, indirim %15."` **kabul edildi**; `"Kar oranı %25, fiyat 25,00 TL."` reddedildi. Yani kalkan **sayıyı** koruyor, **birimi** korumuyor → 100 katı hata mümkün |
| M3-4 | **AI metni üretiliyor, ekrana hiç gelmiyor.** `saveCampaign` yanıtındaki `title`/`body` okunmuyor; kayıtlı kampanya listesi de çağrılmıyor (`GET /campaigns` UI'da yok). | `profit-engines-panel.tsx:191-201` (`run()` sonucu atılıyor); `campaign-engine.ts:239-270` metni döndürüyor |
| M3-5 | **Zarar verdict'i kayda engel değil.** `LOSS` kampanya sessizce DB'ye yazılıyor. | `campaign-engine.ts:239-256` (verdict kontrolü yok) |
| M3-6 | Simülasyon "yazmaz" deniyor ama `Idempotency-Key` + `http_idempotency_records` yazımı her slider turunda DB'ye satır atıyor. | `lib/commerce/profit-handlers.ts:96-100` + `settleHttpIdempotency` |

**Uç durum:** `listPriceMinor` istemciden serbestçe geçilebiliyor (`campaign-engine.ts:48-57`). Panel göndermiyor, ama API'yi çağıran biri varyant fiyatından farklı bir liste fiyatıyla simüle edip "SAFE" sonucu üretebilir; sonra kaydedilen satır varyantın fiyatıyla uyuşmaz.

### 3.3 Motor 1 — Barem Kırıcı Paket Mimarı

`accept` **yarım kalmış ürün kartı** doğuruyor. Üç ayrı kopukluk:

```299:330:lib/commerce/bundle-engine.ts
    const created = await tx.commerceProduct.create({
      data: { ..., sku, basePriceMinor: proposal.suggestedPriceMinor, approvedStockQty: 0, status: "DRAFT", ... },
    });
    await tx.commerceVariant.create({
      data: { ..., sku, amountMinor: proposal.suggestedPriceMinor, onHandQty: 0, safetyBuffer: 0, status: "DRAFT", ... },
    });
```

| # | Kusur | Neden önemli |
|---|---|---|
| M1-1 | **COGS ve desi devredilmiyor.** `commerce_unit_economics` satırı **yaratılmıyor**; üyelerin `costMinor`/`desiGrams` toplamı hiçbir yere yazılmıyor. | Set ürünü kâr motoruna giremiyor: simülatör `422 "Birim maliyet yok"` (`campaign-engine.ts:85-87`), radar `unitEconomics` şartı (`opportunity-radar.ts:46-48`), paket adaylığı da `unitEconomics` şartı (`bundle-engine.ts:43`). Yani **set ürünü, set öneren motorun kendisinde görünmüyor**. |
| M1-2 | **Barkod yok → ürün asla yayına alınamıyor.** `patchCommerceVariant` ACTIVE için barkod **ve** fiyat şartı koyuyor. | `lib/commerce/service.ts:610-624`. Set kartı DRAFT'ta kalır; vitrine çıkmaz, kanala eşlenemez (`marketplace-service.ts:178-180` aynı şartı koyuyor). |
| M1-3 | **Stok 0; devir yolu yok.** `approvedStockQty: 0`, `onHandQty: 0`; "stoğu onayla" dense bile havuzdaki `+ Stok Gir` **set kartını üye stoklarından düşmüyor**. | Set satıldığında üyelerin stoğu düşmez → **set + tekil aynı malı iki kez satar**. Bu, barem motorunun doğurduğu en pahalı senaryo. |
| M1-4 | Paket kârı **reklam maliyetini üye başına** sayıyor, tek siparişte bir kez sayıyor → paket olduğundan kârlı görünüyor. | `profit.ts:316-327` (her üye için `adCostMinorPerOrder`) vs `:341-349` (paket için 1 kez) |
| M1-5 | `sameBand` yalnız `members[0]` ile toplamı karşılaştırıyor; 2. üyenin bandı hiç kontrol edilmiyor. | `profit.ts:333-338` |
| M1-6 | Her `propose` çağrısı önceki tüm `PROPOSED` önerileri `DISMISSED` yapıyor; üretim ortasında hata olursa satıcı önerilerini kaybediyor. | `bundle-engine.ts:106-109` |
| M1-7 | Paket önerisi her zaman **TRENDYOL** maliyetiyle hesaplanıyor; çok kanallı satıcı için HB/OWN_STORE farkı yok sayılıyor. | `bundle-engine.ts:89` |

### 3.4 Motor 4 — Günlük Kâr Özeti & Tek Tıkla Aksiyon

| # | Kusur | Kanıt |
|---|---|---|
| M4-1 | `[KRİTİK]` **Sabah 07:00'de satıcıya hiçbir şey ulaşmıyor.** Cron DB'ye satır yazıyor, başka hiçbir şey yapmıyor. Bildirim türü yok, e-posta şablonu yok, çağrı yok. | `lib/kernel/jobs/inngest.ts:507-519` → `runCommerceDailyBriefScan` (`daily-brief.ts:421-444`) yalnız `commerceDailyBrief.create`. `CITIZEN_NOTICE_KINDS` beş olayla sınırlı ve hiçbiri commerce değil (`lib/kernel/notice/kinds.ts:2-8`); `copyFor` switch'inde commerce dalı yok (`lib/kernel/notice/mail.ts:49-62`); `emitCitizenNotice` commerce'de **hiç çağrılmıyor** |
| M4-2 | `[KRİTİK]` **REPRICE aksiyonu zararı bitirmiyor.** Formül `fiyat + |net| + %5`; komisyon+kargo+iade de yeni fiyattan yeniden kesiliyor. | `daily-brief.ts:177-188`. **Ölçüm:** fiyat 100,00 / COGS 50,00 / kargo 39,90 / komisyon %21 / iade %8 → net **−18,90**; önerilen fiyat **123,90**; yeni net **−1,92** → hâlâ **LOSS**. "Tek tıkla kâr aksiyonu" satıcıyı zarardan çıkarmıyor, sadece zararı küçültüyor |
| M4-3 | **`BUNDLE` ve `RESTOCK` aksiyonları no-op.** `apply` yalnız `status: APPLIED` yazıyor. | `daily-brief.ts:394-397`, mesajlar `:411-415`. Arayüzde "Tek tıkla uygula" düğmesi (`profit-engines-panel.tsx:484-486`) satıcıya **yaptı** hissi veriyor |
| M4-4 | **Fiyat aksiyonu kanala gitmiyor.** REPRICE yalnız `commerceVariant.amountMinor` yazıyor; Trendyol/HB ilanına push yok, ilan `PENDING`'e çekilmiyor. | `daily-brief.ts:386-392`. Pazaryerinde fiyat değişmiyor → satıcı panelde "güncellendi" görüp Trendyol'da eski fiyatı satmaya devam ediyor |
| M4-5 | **Özet yalnız `ACTIVE` mağazalara üretiliyor; yeni mağaza varsayılan `DRAFT`.** | `daily-brief.ts:423` vs `lib/commerce/service.ts:278`. Yeni satıcı özet **hiç** almıyor |
| M4-6 | Özet gün içinde bir kez üretilip donuyor; maliyet sonradan girilirse `fresh:false` ile **eski** özet dönüyor. | `daily-brief.ts:265-272` |
| M4-7 | Kritik stok `product.approvedStockQty` üzerinden (varyant toplamı değil) okunuyor; drift olan kartta uyarı kaçar. | `daily-brief.ts:76` (karşılaştır: `os-load.ts:139` doğru yolu kullanıyor) |

### 3.5 Motor 2 — Fırsat Radarı

| # | Kusur | Kanıt |
|---|---|---|
| M2-1 | **Radar "talep" bilmiyor, kendi kataloğunun fiyat boşluğunu sayıyor.** `demandIndex` kendi katalog payından türetiliyor, pazar talebi değil; şemadaki `GRANT_CALL`, `TETKIK`, `MARKETPLACE_TREND` kaynaklarının **hiçbiri** kullanılmıyor. | `lib/commerce/radar-signals.ts:22-80`; `opportunity-radar.ts:99` (`source: "OWN_CATALOG"` sabit). Yani "ne satılır?" sorusuna cevap: "kendi katalogunda olmayan fiyat aralığında bir şey sat" |
| M2-2 | `[ORTA]` **Kullanıcıya iç birim basılıyor.** Öneri başlığı ve gerekçesi "kuruş" diyor: *"Mutfak — 7500 kuruş bandı"*. Platformun para standardı `formatTryMinor` iken burada ham kuruş var. | `radar-signals.ts:103, 106`; UI doğrudan basıyor `profit-engines-panel.tsx:498-501` (yalnız "Hedef" satırı TL) |
| M2-3 | `[KRİTİK]` **`/tezgah`'a aktarım kusursuz değil, tamamen kırık.** `seedHref` `/tezgah?tool=ecommerce&seed=<json>` üretiyor. Ama `/tezgah` sayfası `tool=ecommerce` görünce **307 ile `/panel/e-ticaret?sekme=havuz`'a yönlendiriyor**; `seed` parametresi hiç okunmuyor ve okunacak yer de yok. | Üretim: `opportunity-radar.ts:152, 216`. Yönlendirme: `app/tezgah/page.tsx:24-27` + `lib/tezgah/catalog.ts:708-719` (`tezgahRelocatedOsHref("ecommerce") → "/panel/e-ticaret?sekme=havuz"`). Prefill yalnız **adlandırılmış alanları** okuyor, `seed` diye bir alan yok: `lib/tezgah/catalog.ts:730-759`. Ayrıca `ecommerce` artık tezgâh masasında **değil** (`catalog.ts:162-173`) |
| M2-4 | Sinyal/öneri durumları yarım: `CONVERTED` ve `SEEN` hiç yazılmıyor; her tarama önceki `NEW` önerileri `DISMISSED` yapıyor. | `opportunity-radar.ts:85-88` |

**Sonuç:** Radar bugün **dürüst ama sığ**: uydurmuyor (✅ kültür korunmuş), fakat "ne satılır" sorusuna pazar verisiyle cevap vermiyor ve cevabı bir sonraki adıma **taşıyamıyor**.

### 3.6 Stok gerçeği — kalan açık kapılar (K-01 artığı)

| # | Açık kapı | Kanıt |
|---|---|---|
| S-1 | Webhook satışı varyant kimliği taşımıyor; ürün toplamı düşüp ilk varyanttan dağıtılıyor | §A2 — `channel-stock-engine.ts:161-175`, `channel-stock-prisma.ts:119-147` |
| S-2 | Onay/yayın akışı tek SKU + toplam adet gönderiyor | §A3 — `channel-broadcast.ts:40-43` |
| S-3 | **İki defter hâlâ iki:** OS lehçesi `stock_ledgers` (product_id), pazaryeri lehçesi `inventory_transactions` (variant_id) | `prisma/schema/commerce.prisma:209-228` vs `:349-371`; iki ayrı yazıcı: `channel-stock-prisma.ts:94-118` vs `inventory-sql.ts` |
| S-4 | İki webhook lehçesi tek motorda birleşmedi (Faz 1 planı 1.3'ün yarısı yapılmadı) | `app/api/commerce/webhooks/trendyol/route.ts:12-22` iki ayrı işleyiciye dallanıyor |
| S-5 | `approved_stock_qty` türetilmiş kolon değil, **yazılan** kolon; `effectiveApprovedQty` "0 ise varyant toplamı" yedeği drift'i gizliyor | `stock-sync.ts:44-46`. Drift temizlenene kadar iki farklı sayı ekranda dolaşabilir |

---

## 4. Gerçek Satıcı Gözüyle Son Engeller (Lansman Öncesi Kritik Notlar)

**Test öznesi:** Trendyol'da günde 50 sipariş gönderen, 5 bedenli ürünleri olan, 1 mağazası olan gerçek bir satıcı.
**Karar: HAYIR — bu haliyle satılamaz.** Aşağıdaki yedi madde kapanmadan imzalanmamalı.

### 4.1 `[KRİTİK]` "Trendyol'u bağladım" dedikten sonra sipariş gelmiyor

Satıcı kokpitte `Trendyol → API anahtarı → Bağla` yapar (`os-cockpit.tsx:636-652`). Sistem `sales_channels`'a yazar (`os-service.ts:389-404`). Sipariş çeken cron `commerce_marketplace_credentials` okur (`trendyol-sync.ts:253`). **Sonuç: hiç sipariş yok, ama ekranda yeşil "Bağlı" var.**

Daha kötüsü: kokpitteki tek kutuya gerçek anahtar girilirse, `parseTriple` üç parçalı `sellerId:apiKey:apiSecret` beklediği için ayrıştırma başarısız olur (`channel-adapters.ts:47-55`) ve yayın düz `Bearer <uzun-metin>` ile gider → Trendyol `401`. Yani **doğru davranış için anahtarı iki ayrı ekranda, iki ayrı formatta** girmek gerekiyor. Bu, tek başına satışı bitirir: satıcı "çalışmıyor" der ve iade ister.

### 4.2 `[KRİTİK]` Çok bedenli üründe aşırı satış riski açık

§A2. XL satılır, S düşer. Satıcı iki gün sonra "XL vardı, yok" der; müşteri iptal eder; Trendyol ceza keser. **Bu, modülün en temel vaadini (stok doğru) çürüten tek senaryo.**

### 4.3 `[KRİTİK]` Kâr rakamı KDV'siz — satıcı "kâr ediyorum" diyip zarar eder

§A1. Kâr paneli, modülün retention motoru. Yanlış yönde yanılıyorsa satıcıyı **batırır**. `vatBps` şemada durup hesapta kullanılmıyorsa, bu bir "eksik özellik" değil **hatalı beyan**.

### 4.4 `[KRİTİK]` 30 gün sonra sessiz ölüm: yenileme

`OUTBOUND_PUBLIC_IP` tanımlı değilse `127.0.0.1` ile çekim denenir (`subscription-renewal.ts:34-42`); PayTR CAPI hash'i `user_ip` içerdiği için tutmaz (`paytr-stored-card.ts:18-32`). Kod bunu **biliyor** ama yalnız `warn` log atıyor, çekimi yine deniyor. 3 denemede `CANCELED`. Sonuç: **ilk ayın sonunda tüm lisanslar sessizce ölür.** Lansman öncesi zorunlu: env yoksa çekim **fail-closed** olmalı + operatöre alarm.

### 4.5 `[YÜKSEK]` Onboarding maliyeti satıcının kabul edeceği süreyi aşıyor

Kâr motoru için satıcıdan istenen: **varyant başına** maliyet (kuruş!) + desi (gram) + komisyon (bps!) + barem (gram/kuruş). Panel etiketleri teknik birimle yazılmış (`profit-engines-panel.tsx:308-350`) ve **tek varyant** seçilebiliyor (§3.1). 20 varyantlı bir mağaza = 20 kez form + manuel kuruş çevirme. Satıcı bunu yapmaz; motor boş veriyle "en az 3 aktif ürün" der. **Farklılaşma burada ölür.** Zorunlu: TL/gram girdi, varyant tablosunda toplu düzenleme, CSV içe aktarma, ilk kurulumda örnek barem.

### 4.6 `[YÜKSEK]` "Sabah 07:00 özet" hiç gelmiyor; "tek tık" bazen hiçbir şey yapmıyor

§M4-1..M4-4. Bir retention motorunun tek işi satıcıyı geri getirmektir. Bu motor **dışa hiç ses vermiyor** (e-posta yok, uygulama içi bildirim yok, WhatsApp yok). İçeride kalsa bile: REPRICE zararı bitirmiyor, BUNDLE/RESTOCK no-op, fiyat kanala gitmiyor. **Üç aksiyonun üçü de satıcıyı yanıltıyor.**

### 4.7 `[YÜKSEK]` Vitrin "Canlı" diyor; ilk 10 dakika hayal kırıklığı

Kamu vitrini artık var ve dürüst (Amazon/N11 temiz, sitemap/robots doğru). Ama:
- Vitrin **üst menüde yok** (`components/public/public-top-bar.tsx:24-29` — yalnız Tezgâh/Fiyatlandırma/Kurumsal/Rehber). MOFU sayfası yayında ama **kapısı yok**; trafik yalnız `/fiyatlandirma` kartından ve `llms.txt`'ten geliyor.
- "Dört kâr ve büyüme motoru — **Canlı**" rozeti (`app/(public)/e-ticaret/page.tsx:183-200`) ile panelin gerçeği arasında mesafe var: radar aktarımı kırık, kampanya metni görünmüyor, özet e-posta atmıyor.
- Radar önerisi "7500 kuruş bandı" diyor; vitrinden gelen satıcı panelde **kuruş** ve **bps** ile karşılaşıyor. Dil sözleşmesi (sen aksı) düzeldi, **birim sözleşmesi** düzelmedi.

### 4.8 Küçük ama görünür kalanlar

| # | Bulgu | Kanıt |
|---|---|---|
| K1 | Ürün formunda hâlâ **Amazon** pazaryeri seçeneği var; Amazon kanalı "Yakında" | `components/commerce/product-create-form.tsx:149`; `cockpit-types.ts:40`; `os-rules.ts:13` |
| K2 | Kokpitte mağaza bağlantısı `/magazam/{id}`'ye gidiyor ama mağaza `status` bilgisi taşınmıyor | `lib/commerce/os-load.ts:98-104` + `os-cockpit.tsx:333-340` |
| K3 | Paket kartı `attributes` içine **ham kuruş** yazıyor ("Kargo tasarrufu kuruş") | `bundle-engine.ts:303-307` |
| K4 | Kaydedilmiş kampanyaları listeleyen UI yok; `GET /campaigns` ölü uç | `profit-engines-panel.tsx` (çağrı yok) |
| K5 | Varyant `safetyBuffer` kâr/stok yayınında düşülüyor ama kâr motorunda stok hiç kullanılmıyor; tamponlu adet "stok" sanılabiliyor | `trendyol-client.ts:78-84` vs `channel-broadcast.ts:42` |

---

## 5. Yönetici Kararı

### 5.1 44 → 61 ne anlama geliyor

Faz 1 gerçek iş yaptı: **vitrin, dürüstlük, lisans kapısı (bir kapıda), sen aksı, error boundary, robots, stok toplamı**. Bunlar ölçüldü ve itirazım yok — ilk rapordaki 4 `[YÜKSEK]`/`[ORTA]` bulgunun 3'ü tamamen, 2'si kısmen kapandı.

Faz 2 **çekirdeği** doğru kurdu: saf kâr matematiği, ekonomi tabloları, RLS, idempotency, AI token kaynağı, cron kaydı. Mimari olarak bu, Türkiye pazarında gerçekten farklı bir konum.

Ama Faz 2 **ürünü** teslim etmedi: motorların çıktısı satıcının gözüne, e-postasına, pazaryerine ulaşmıyor; ulaşan rakamlar KDV'siz ve bazen kendi kendisiyle çelişiyor; stok doğruluğu çok varyantta hâlâ kırık. **82 değil 61**, çünkü "kodlandı" ile "satıcı kullandı" arasındaki mesafe bu modülde 21 puan.

### 5.2 Lansman kapısı (bu sırayla, hepsi zorunlu)

| # | İş | Kabul ölçütü |
|---|---|---|
| **P0.1** | KDV kâra girsin: `vatBps` `calculateUnitNet`'e parametre, satış fiyatı KDV dahil kabul edilip matrah ayrışsın | "100 TL, %20 KDV, marj %10" testinde marj **KDV sonrası**; panelde KDV alanı |
| **P0.2** | Kanal satışı **varyant kimliğiyle** düşsün (webhook payload'a variant/barcode; `setApprovedStock` yerine `applyMovement` yolu) | Test: "S=5, XL=1; XL satıldı → S=5, XL=0, vitrinde yalnız S" |
| **P0.3** | Tek kimlik kasası: kokpitte "Bağla" yazsın → sipariş çeken cron aynı satırı okusun (ya `sales_channels`'ı sync'e bağla ya kokpiti `commerce_marketplace_credentials`'a yaz) | Test: "kokpitten bağlanan kanal `listCredentials`'ta görünür" + tek form, tek format |
| **P0.4** | Lisans kapısı **her iki** kimlik yazma yolunda | Test: lisanssız `PUT /credentials/trendyol` → 403 |
| **P0.5** | Yenileme fail-closed: `OUTBOUND_PUBLIC_IP` yoksa çekim yapılmasın, operatöre alarm gitsin | Test: env yok → `charge` çağrılmaz, `PAST_DUE` değil `blocked_config` |
| **P0.6** | 07:00 özeti gerçekten **gitsin**: `commerce_daily_brief` bildirim türü + mevcut SMTP (`deliverCitizenNoticeMail`) | Test: cron → `emitCitizenNotice` çağrıldı, mail gövdesinde özet |
| **P1.1** | REPRICE kapalı formla **başabaş üstü** fiyat üretsin (kâr ≥ hedef bps) ve kanala push etsin | Test: "LOSS SKU → uygula → tekrar tarama SAFE" |
| **P1.2** | `BUNDLE`/`RESTOCK` no-op olmasın: ya gerçek iş yapsın ya düğme kalksın | Test: "uygula" sonrası yan etki doğrulandı |
| **P1.3** | Paket `accept`: `unitEconomics` (COGS+desi), barkod, üye stoğundan düşüm | Test: "set kartı kâr motorunda görünür ve satılabilir" |
| **P1.4** | Kargo baremi `upsert` olsun; `effectiveFrom` ile **en güncel** bant seçilsin | Test: "barem 39,90→49,90; hesap 49,90" |
| **P1.5** | Radar→Tezgâh devri çalışsın (ya `seed` okuyan bir varış ya doğrudan kokpitte "havuza yaz" aksiyonu) | Test: tıkla → alanlar dolu |
| **P1.6** | Varyant başına maliyet/desi girişi + TL/gram birimi + toplu tablo | Test: 5 varyant tek ekranda |
| **P2** | `scrubInventedNumbers` birim duyarlı olsun: izin listesi `{kuruş, TL-string, %}` ayrı tip taşısın | Test: "8500 TL" (kuruş sızıntısı) **reddedilir** |
| **P2** | Kampanya metni ekranda + kayıtlı kampanya listesi; slider gerçekten anlık (veya metin düzeltilsin) | Test: kaydet → metin görünür |

**Yeniden denetim eşiği:** P0'ların altısı + P1.1/P1.3 + P2 (birim) kapanırsa modül **72–76** bandına çıkar ve **pilot satıcıyla** (5–10 mağaza, ücretli ama indirimli) satılabilir. "Gönül rahatlığıyla satılır" seviyesi (80+) için ayrıca: çok mağaza kokpiti, iade/iptal sonrası kâr düzeltmesi ve gerçek talep verisi (radar) gerekir.

### 5.3 Son cümle

Bu modül artık **kâr hesaplayabiliyor**; henüz **kâr ettirmiyor**. Aradaki fark, altı P0 maddesinde ve tek bir cümlede toplanabilir: *sayı doğru olmalı, doğru varyanta yazılmalı, doğru kanala gitmeli ve satıcıya ulaşmalı.* Dördü de bugün eksik. Kodun disiplini (append-only defter, `FOR UPDATE`, mühürlü kimlik, idempotency, RLS) bu dört adımı **kaldıracak kadar** sağlam — eksik olan ürün hattının son metresi.

---

*Bu rapor hiçbir kaynak dosyayı değiştirmedi. Tüm bulgular dosya yolu + satır numarasıyla kanıtlanmış; §1, §A1, §M3-2, §M3-3 ve §M4-2'deki sayısal iddialar `profit.ts` / `profit-text.ts` / `daily-brief.ts` fonksiyonlarının bu oturumda çalıştırılmasıyla üretilmiştir. Doğrulanamayan tek alan PayTR canlı hesap davranışıdır (canlı anahtar gerektirir); ilgili bulgu `[YÜKSEK]` olarak, kodun kendisi üzerinden gerekçelendirilmiştir.*
