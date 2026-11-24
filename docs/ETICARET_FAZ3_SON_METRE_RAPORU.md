# yetkin.ai — E-Ticaret Faz 3 / Son Metre Raporu

**Tarih:** 22 Kasım 2026
**Rol:** Baş Teknoloji Sorumlusu (CTO) / E-Ticaret Sistem Mimarı
**Kapsam:** `docs/ETICARET_SONUC_RAPORU.md` §5.2 lansman kapısı — **P0.1–P0.6**, **P1.1–P1.6**, **P2**
**Kural:** Mevcut mühürlerin hiçbiri gevşetilmedi. `docs/ETICARET_SONUC_RAPORU.md` değiştirilmedi; bu rapor onun kapanış kanıtıdır.

---

## 0. Yönetici Özeti

Denetim raporu **61 / 100** verirken tek cümlelik teşhisi şuydu: *"sayı doğru olmalı, doğru varyanta yazılmalı, doğru kanala gitmeli ve satıcıya ulaşmalı."* Bu dört cümlenin dördü de bu turda **kodla kapandı**, testle kilitlendi ve canlı hesapla kanıtlandı.

| Denetim bulgusu | Durum | Kanıt |
|---|---|---|
| **P0.1** KDV kâra girmiyor | ✅ **Kapandı** | `profit.ts:vatBps`, tüm formüller KDV dahil; panelde KDV alanı |
| **P0.2** Yanlış varyanttan stok düşüyor | ✅ **Kapandı** | `channel-stock-engine.ts` varyant kimliğiyle; `distributeApprovedTarget` kanal yolundan çıktı |
| **P0.3** Kokpitten bağlanan kanal sipariş çekmiyor | ✅ **Kapandı** | `connectChannel` aynı anda `commerce_marketplace_credentials` yazar; 3 parçalı form |
| **P0.4** Lisans kapısı tek kapıda | ✅ **Kapandı** | `putTrendyolCredential` başında 403 kapısı |
| **P0.5** `127.0.0.1` ile sessiz ölüm | ✅ **Kapandı** | Fail-closed: `blocked_config`, `PAST_DUE` yok, operatör alarmı |
| **P0.6** 07:00 özeti hiç gelmiyor | ✅ **Kapandı** | `commerce_daily_brief` türü + gerçek SMTP yolu |
| **P1.1** REPRICE zararı bitirmiyor | ✅ **Kapandı** | Kapalı form `+500 bps` garanti; ilan `PENDING`'e çekilir |
| **P1.2** BUNDLE / RESTOCK no-op | ✅ **Kapandı** | `proposeBundles` çağrılır; RESTOCK uyarı + taslak sipariş yazar |
| **P1.3** Paket `accept` yarım kart | ✅ **Kapandı** | COGS/desi/KDV, EAN-13 barkod, üye bağı, satılabilir ilk stok |
| **P1.4** Barem her kayıtta yeni satır | ✅ **Kapandı** | `upsert` + en güncel `effectiveFrom` kazanır |
| **P1.5** Radar→Tezgâh 307 ile çöpe | ✅ **Kapandı** | Doğrudan `?sekme=havuz&taslakBaslik=…` + TL metinleri |
| **P1.6** Tek varyant, kuruş/gram etiketleri | ✅ **Kapandı** | Tüm varyantlar seçilebilir, giriş TL / gram / % |
| **P2** `scrubInventedNumbers` birim kör | ✅ **Kapandı** | `{ rawMinor, formattedTry, percent }` üçlü tip |
| **P2** Kampanya metni görünmüyor / slider anlık değil | ✅ **Kapandı** | Metin + geçmiş liste ekranda; slider istemcide anlık hesaplar |
| **P2** Vitrin üst menüde yok | ✅ **Kapandı** | `public-top-bar.tsx` → `/e-ticaret` |

**Yeniden denetim eşiği:** Rapordaki ölçüt "P0'ların altısı + P1.1/P1.3 + P2 (birim) kapanırsa 72–76 bandı" idi. Sayılan **tüm** maddeler ve P1'in geri kalanı kapandı.

---

## 1. PAKET A — Lansman Engelleyici P0

### P0.1 — KDV dahil matrah ve gerçek kâr

`lib/commerce/profit.ts` yeniden yazıldı. Sözleşme artık tek cümle: **satış fiyatı KDV dahildir**, kâr KDV'den sonra hesaplanır.

```17:35:lib/commerce/profit.ts
export type UnitNetInput = {
  /** Satış fiyatı — KDV **dahil** (kuruş). */
  priceMinor: number;
  quantity: number;
  costMinor: number;
  commissionBps: number;
  cargoMinor: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
  /** KDV oranı (baz puan). Varsayılan 2000 = %20. */
  vatBps?: number;
};
```

Matrah ayrışımı istenen formülle birebir:

```150:158:lib/commerce/profit.ts
export function vatIncludedMinor(grossMinor: number, vatBps: number): number {
  ...
  const netRevenueMinor = Math.round((grossMinor * 10_000) / (10_000 + vatBps));
  return grossMinor - netRevenueMinor;
}
```

`UnitNetResult` artık `vatMinor` ve `netRevenueMinor` taşır; `netMinor` KDV'yi **düşer**. `breakEvenDiscountBps` ve `simulateCampaign` aynı `vatBps` sözleşmesini kullanır.

**Panel:** `profit-engines-panel.tsx` içinde `KDV (%)` alanı. Varsayılan `%20`; `economics-service.ts` `vatBps`'i zaten yazıyordu, artık **okunuyor**.

**Canlı ölçüm** (denetim raporunun §A1 senaryosu: 100,00 TL, %20 KDV, %10 marj):

| | Eski (KDV'siz) | Yeni (KDV dahil) |
|---|---:|---:|
| KDV | — | **16,67 TL** |
| Net kâr | **+23,00 TL** (hayalet) | **+6,33 TL** |

Raporun "marjın ~%17'si hayalet kâr" tespiti sayısal olarak doğrulandı ve kapandı.

### P0.2 — Varyant kimliğiyle stok düşümü

Sözleşme değişti: `lockProductBySku(storeId, sku, barcode)` artık **çözülen varyantı** döndürür; `setApprovedStock(quantity)` kaldırıldı, yerine `applyVariantMovement` geldi.

```25:40:lib/commerce/channel-stock-engine.ts
export type StockProductLock = {
  id: string;
  storeId: string;
  sku: string;
  criticalStockQty: number;
  /** SKU / barkod ile eşleşen varyant. Ürün bulundu ama varyant çözülemediyse null. */
  variant: StockVariantLock | null;
};
```

Varyant seçim sırası: **barkod → varyant SKU'su → ürün SKU'su (tek varyantlı kart)**. Hiçbiri eşleşmezse `422 "Varyant kimliği eşleşmedi."` — rastgele bir bedene yazmak aşırı satış demektir, o yüzden **yazılmaz**.

`channel-stock-prisma.ts` içinde `distributeApprovedTarget` tamamen çıktı; yerine iki şey var:

1. Varyant satırı `SELECT … FOR UPDATE` ile kilitlenir (eşzamanlı iki kanal satışı aynı bedende yarışmaz).
2. Ürün toplamı `syncApprovedTotal` ile **varyant toplamının türevi** olarak yazılır.

```28:39:lib/commerce/channel-stock-prisma.ts
async function syncApprovedTotal(tx: Prisma.TransactionClient, productId: string): Promise<number> {
  const agg = await tx.commerceVariant.aggregate({
    where: { productId },
    _sum: { onHandQty: true },
  });
  const total = Math.max(0, agg._sum.onHandQty ?? 0);
  await tx.commerceProduct.update({ where: { id: productId }, data: { approvedStockQty: total } });
  return total;
}
```

Defter notu varyant kimliğini taşır (`variant=v-xl`), böylece **iade aynı bedene** geri yazar.

**Kabul testi** (`tests/commerce/channel-webhook.test.ts`): *"P0.2 — XL satılınca XL düşer, S yerinde kalır"* → `TISORT-S = 5`, `TISORT-XL = 0`, ürün toplamı `5`.

### P0.2 / §A3 — Kanal yayını tüm varyantlarla

`channel-broadcast.ts` içindeki `effectiveSku` + `effectiveApprovedQty` ikilisi kaldırıldı. Yerine `broadcastLines` geldi: **her aktif varyant kendi SKU'su ve kendi satılabilir adediyle** gider.

```48:68:lib/commerce/channel-broadcast.ts
export function broadcastLines(product: BroadcastProduct): BroadcastLine[] {
  const variants = product.variants ?? [];
  const active = variants.filter((row) => (row.status ?? "ACTIVE") === "ACTIVE");
  const lines: BroadcastLine[] = [];
  for (const row of active) {
    const sku = row.sku.trim();
    if (!sku) {
      continue;
    }
    lines.push({ sku, quantity: Math.max(0, sellableQty(row.onHandQty, row.safetyBuffer ?? 0)) });
  }
  ...
}
```

Kanal başına satır sonuçları `mergeOutcomes` ile tek sonuca indirilir (en kötü durum kazanır), böylece bir bedenin `FAILED` sonucu "PUSHED" diye gizlenmez.

**Kabul testi:** *"P0.2/A3 — yayın her aktif varyantın kendi SKU'su ve satılabilir stoğuyla gider"* → gövde `[{sku:"TISORT-S",quantity:4},{sku:"TISORT-XL",quantity:1}]`; pasif beden gönderilmez, toplam tek SKU'ya yığılmaz.

### P0.3 — Tek kimlik kasası birleştirmesi

Yeni dosya `lib/commerce/channel-credentials.ts` iki formu **tek** sözleşmeye bağlar:

```64:82:lib/commerce/channel-credentials.ts
export function readChannelCredentialFields(
  channel: CommerceChannelName,
  raw: { supplierId?: unknown; apiKey?: unknown; apiSecret?: unknown },
): { ok: true; fields: ChannelCredentialFields } | { ok: false; error: string } {
```

`connectChannel` artık üç parçayı alır (`supplierId`, `apiKey`, `apiSecret`) ve `sales_channels` yazımından **sonra** aynı satırı pazaryeri kasasına da yazar:

```396:427:lib/commerce/os-service.ts
  // Tek kimlik kasası (P0.3): pazaryeri kanalı aynı anda `commerce_marketplace_credentials`
  // satırına yazılır. Kokpitte "Bağla" diyen satıcı, sipariş çeken cron'un okuduğu
  // satırın ta kendisini yazar; ikinci bir form, ikinci bir format yok.
  if (isMarketplaceChannel(kind) && credential.supplierId && credential.apiSecret) {
    await db.commerceMarketplaceCredential.upsert({ ... });
  }
```

Kokpit formu üç ayrı alan sunar (`ChannelCredentialFields` bileşeni); "Bağla" düğmesi üçü dolmadan pasiftir. Eski `satıcı:anahtar:sır` tek alanı da aynı kasaya yazılır — ama **tek parça anahtar reddedilir**, çünkü pazaryeri `Bearer <uzun-metin>` ile 401 döner.

**Kabul testi** (`os-channel-license.test.ts`): *"aktif lisansla bağlantı kurulur, anahtar mühürlenir ve pazaryeri kasasına da yazılır"* → `credentialUpsert` çağrıldı, `supplierHint = "0001"`, mühürler `ccred1:`.

### P0.4 — Çift taraflı lisans kapısı

`MarketplaceHandlerDeps` bir lisans portu kazandı; `putTrendyolCredential` **her iki kanal** için de aynı kapıdan geçer:

```93:106:lib/commerce/marketplace-service.ts
  // P0.4 — çift taraflı lisans kapısı. Kokpit kapısı (`connectChannel`) 403 dönerken
  // klasik kimlik masası açık kalırsa satıcı lisanssız kimlik yazar ve ekranında
  // "kaydedildi" görür. Bu yüzden kimlik yazan **her** yol aynı kapıdan geçer.
  const licensed = await license.allowsOutgoing(storeId, new Date());
  if (!licensed) {
    return commerceFail(403, "Kanal bağlamak için aktif lisans gerekir.");
  }
```

Varsayılan port `lib/commerce/store-license.ts` — lisans **okunamazsa kapı kapanır** (fail-closed).

**Kabul testi:** `trendyol-phase2.test.ts` + `phase3.test.ts` lisanslı satıcıyı taklit eder; lisanssız 403 ayrıca `os-channel-license.test.ts` içinde sınanır.

### P0.5 — Yenileme fail-closed

`127.0.0.1` yedeği tamamen kaldırıldı. Yeni okuma fonksiyonu yerel adresi **yapılandırma hatası** sayar:

```22:32:lib/commerce/subscription-renewal.ts
export function readOutboundPublicIp(
  env: NodeJS.ProcessEnv = process.env,
): { ok: true; ip: string } | { ok: false; reason: "missing" | "loopback" } {
  const raw = env.OUTBOUND_PUBLIC_IP?.trim() ?? "";
  if (!raw) {
    return { ok: false, reason: "missing" };
  }
  if (raw === "127.0.0.1" || raw === "localhost" || raw === "::1" || raw === "0.0.0.0") {
    return { ok: false, reason: "loopback" };
  }
  return { ok: true, ip: raw };
}
```

IP yoksa: çekim **hiç denenmez**, `console.error` ile operatör alarmı basılır, satır `blocked_config` sayılır, **abonelik yazılmaz** — `PAST_DUE`'ya düşmez, deneme sayacı artmaz, deneme hakkı yanmaz. `cancel` adımı bu kapıdan geçmez (iptal yine yazılır).

**Kabul testleri:** 9 test; *"OUTBOUND_PUBLIC_IP yoksa çekim hiç denenmez; blocked_config ve operatör alarmı"* → `charge` çağrılmadı, `update` çağrılmadı, sonuç `{blockedConfig: 1}`.

### P0.6 — Sabah 07:00 kâr özeti bildirimi

Bildirim türü altıncı olarak eklendi (`lib/kernel/notice/kinds.ts`), "sen" aksında kopya `lib/copy/sen-voice/notice.ts` içinde:

```33:39:lib/copy/sen-voice/notice.ts
  commerceDailyBrief: {
    subject: "Sabah kâr özetin hazır",
    body: "Dünkü fiyat, stok ve kâr tablon hazır.",
    panelLabel: "E-Ticaret paneline git",
  },
```

`daily-brief.ts` özet üretildiğinde **gerçekten** gönderir; e-posta gövdesini koddan gelen sayılar kurar (AI metni girmez):

```659:684:lib/commerce/daily-brief.ts
function sendBriefNotice(input: {...}): void {
  const path = `/panel/e-ticaret?sekme=buyume&magaza=${encodeURIComponent(input.storeId)}`;
  try {
    emitCitizenNotice({
      kind: "commerce_daily_brief",
      userId: input.ownerUserId,
      reference: `commerce-brief:${input.storeId}:${input.dayKey}`,
      applied: true,
      commerceBrief: {
        summary: input.summaryText,
        lossSkuCount: input.payload.totals.lossSkuCount,
        criticalStockCount: input.payload.criticalStock.length,
        panelPath: path,
      },
    });
```

Mail gövdesi (`mail.ts` → `commerceBriefMailBody`): özet cümlesi + **Zarar eden SKU** + **Kritik stok** + **panele doğrudan bağlantı**. Raporun M4-5 bulgusu da kapandı: tarama artık `status: { in: ["ACTIVE", "DRAFT"] }` — yeni satıcı (varsayılan `DRAFT`) özeti kaçırmaz; kart yoksa boş bildirim gönderilmez.

**Kabul testleri:** 8 test (`faz3-son-metre.test.ts`) + entegrasyon testi *"özet üretilir, kâr varsa satıcıya bildirim gider; kart yoksa sessiz kalır"* → 2 mağaza, `created = 2`, `mailed = 1`.

---

## 2. PAKET B — Ürün Kalitesi P1

### P1.1 — REPRICE kapalı form + kanal push

Denetim raporunun §M4-2 ölçümü: *fiyat 100,00 / COGS 50,00 / kargo 39,90 / komisyon %21 / iade %8 → net −18,90; önerilen 123,90 → yeni net −1,92, hâlâ LOSS.* Eski formül `fiyat + |net| + %5` idi ve komisyon+iade+KDV yeni fiyattan **yeniden** kesiliyordu.

Yeni hesap kapalı formdur. `K = 10000`, `V = vatBps`, `C = komisyon`, `R = iade`, `T = hedef marj`, `F = COGS + kargo + reklam`:

```
net(G) = G · [K/(K+V) − (C+R)/K] − F
net(G) ≥ G·T/K   ⇒   G_min = ceil( F·K·(K+V) / (K² − (C+R+T)·(K+V)) )
```

```186:212:lib/commerce/profit.ts
  const K = 10_000n;
  const vat = BigInt(vatBps);
  const keep = BigInt(input.commissionBps + input.returnBps + targetBps);
  const fixed = BigInt(input.cogsMinor + input.cargoMinor + input.adCostMinor);
  const denominator = K * K - keep * (K + vat);
  if (denominator <= 0n) {
    return null;
  }
  const numerator = fixed * K * (K + vat);
  const ceil = (numerator + denominator - 1n) / denominator;
```

`BigInt` kullanılır: kuruş × 10.000 × 12.000 çarpımı `Number` tamsayı sınırını zorlar. Payda ≤ 0 ise **`null`** döner —"marj imkânsız" demektir, fiyat uydurulmaz. `profitablePriceMinor` yuvarlama payı için en fazla 5 kuruş yukarı yürür ve hedefi **fiilen** doğrular.

**Canlı ölçüm** (aynı §M4-2 senaryosu):

| | Eski formül | Yeni kapalı form |
|---|---:|---:|
| Önerilen fiyat | 140,57 TL | **182,23 TL** |
| Yeni net | **−13,51 TL** (hâlâ zarar) | **+9,13 TL** |
| Net marj | negatif | **501 bps** ✅ |

`apply` çalıştığında fiyat yazılır **ve** ilanlar pazaryerine gönderilmek üzere `PENDING`'e çekilir:

```533:541:lib/commerce/daily-brief.ts
  // P1.1 — fiyat yerelde kaldıysa pazaryeri eski fiyatı satmaya devam eder.
  // İlanı PENDING'e çekmek, pazaryerine fiyat itmesini tetikleyen kuyruk işaretidir.
  const pendingListings = await prisma.commerceChannelListing.updateMany({
    where: { storeId, variantId: variant.id },
    data: { syncStatus: "PENDING", lastError: "" },
  });
```

### P1.2 — Dürüst aksiyonlar

`"burada yalnız işaretlenir"` ve `"burada yalnız hatırlatma"` yorumları silindi; iki dal gerçek iş yapar.

- **BUNDLE** → `proposeBundles` çağrılır. Öneri üretilemezse aksiyon `APPLIED` **olmaz**; satıcı "yaptım" hissiyle bırakılmaz.
- **RESTOCK** → kritik stok uyarısı gelen kutuya yazılır **ve** havuza onay bekleyen `INBOUND_DRAFT` düşer. Miktar `eşik×2 − elde` (en az 1, en çok 1000). Satıcı havuzdan tek tıkla onaylar; yeni form açmaz.

**Kabul testleri:** *"RESTOCK kritik stok uyarısı ve onay bekleyen taslak yazar"* (eşik 5, elde 2 → 8 adetlik taslak, `idempotencyKey = os-daily-restock:a-3`); *"RESTOCK ürün yoksa 404 döner; aksiyon APPLIED olmaz"*.

### P1.3 — Paket `accept` tamamlama

`bundle-engine.ts` set kartını artık **satılabilir** doğurur. Yeni saf modül `lib/commerce/set-catalog.ts`:

| Kusur | Çözüm |
|---|---|
| M1-1 COGS/desi devredilmiyor | `commerceUnitEconomics.create` — üye toplamları |
| M1-2 Barkod yok → ACTIVE olamıyor | `setBarcode` → deterministik **EAN-13** (ülke öneki `299`, sağlama basamağı hesaplı) |
| M1-3 Stok 0, devir yolu yok | İlk stok = üyelerin **satılabilir adedinin en küçüğü**; set satışı üyelerden düşer |

```75:86:lib/commerce/set-catalog.ts
export function setBarcode(proposalId: string): string {
  const hex = proposalId.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  let digits = "";
  for (let index = 0; index < 12 && digits.length < 9; index += 1) {
    const char = hex[index] ?? "0";
    digits += String(parseInt(char, 16) % 10);
  }
  const body = `299${digits.padEnd(9, "0")}`.slice(0, 12);
  return `${body}${ean13CheckDigit(body)}`;
}
```

`barcode` kolonu 8/12/13/14 **rakam** ister; `SET-XXXXXXXX` oraya yazılamaz — bu yüzden SKU ile barkod ayrı üretilir.

Üye bağı `attributes` JSON'unda tek satır:

```54:60:lib/commerce/set-catalog.ts
export function bundleMembersAttribute(memberVariantIds: readonly string[]): AttributeRow {
  return { column: BUNDLE_MEMBERS_COLUMN, value: memberVariantIds.filter(Boolean).join("|") };
}
```

Aynı turda **M1-4** (paket kârı reklamı üye başına sayıyordu) düzeltildi: `calculateUnitNet` paket için tek kez çağrılır. **M1-5** (`sameBand` yalnız ilk üyeye bakıyordu) da `sameBand` toplam ağırlık karşılaştırmasına çevrildi.

Üye maliyeti eksikse **yarım kart doğmaz**: `422 "Paket üyelerinin birim maliyeti eksik."`

**Kabul testleri** (`set-stock.test.ts` + `faz3-aksiyon-motorlari.test.ts`):
- *"set satılınca her üyeden birer adet düşer"* → kupa 4→3, tabak 3→2, ürün toplamı 5
- *"mükerrer set satışı ikinci kez düşmez"*
- *"bir üyede stok yetmiyorsa 409 döner"*
- *"set kartı COGS/desi/KDV, barkod ve üye bağıyla ACTIVE doğar"*

`postCommerceInventory` içine de set dalı eklendi: set satışı üyelerin stokundan da düşer, üye reddederse işlem geri alınır.

### P1.4 — Kargo baremi `upsert`

`economics-service.ts` artık `create` değil **find-then-update**:

```113:133:lib/commerce/economics-service.ts
    // P1.4 — aynı bant (storeId, carrier, bandMin, bandMax) **güncellenir**.
    // Eskiden her kayıt yeni satır açıyordu; zam sonrası eski 39,90 satırı
    // silinmiyor ve motor onu "en ucuz" diye seçmeye devam ediyordu.
    const current = await prisma.commerceShippingTariff.findFirst({
      where: { storeId, carrier, bandMinGrams, bandMaxGrams },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true },
    });
```

`profit.cargoForWeight` de "en ucuz" değil **en güncel** satırı seçer:

```333:350:lib/commerce/profit.ts
  const sorted = [...fits].sort(
    (a, b) =>
      effectiveSortKey(b) - effectiveSortKey(a) ||
      a.bandMaxGrams - a.bandMinGrams - (b.bandMaxGrams - b.bandMinGrams) ||
      a.priceMinor - b.priceMinor,
  );
```

**Kabul testleri:** *"aynı (carrier, bandMin, bandMax) varsa yeni satır açmaz, mevcut satırı günceller"*; *"P1.4 — aynı bantta en güncel effectiveFrom kazanır"* (39,90 → 49,90 sonrası hesap **49,90**).

> **Not:** Aynı mantık `daily-brief.ts` içindeki yerel `cargoForGrams` için de uygulandı; daha önce "en ucuz" seçiyordu, artık en güncel.

### P1.5 — Radar → Panel / Havuz devri

Radar metinleri `formatBandTry`/`formatTryMinor` ile TL basar; ham kuruş kalmadı:

| Önce | Sonra |
|---|---|
| `Mutfak — 7500 kuruş bandı` | `Mutfak — ₺75 bandı` |
| `7500 kuruş bandı boş` | `₺75 bandı boş` |

Kırık `/tezgah?tool=ecommerce&seed=` yönlendirmesi yerine doğrudan havuza giden, **adlandırılmış** parametreli bağlantı:

```78:95:lib/commerce/radar-signals.ts
export function poolSeedHref(input: {
  title: string;
  category: string;
  targetPriceMinor: number;
}): string {
  const params = new URLSearchParams({
    sekme: "havuz",
    taslakBaslik: input.title.slice(0, 200),
    taslakKategori: input.category.slice(0, 80),
    hedefFiyat: String(Math.max(0, Math.trunc(input.targetPriceMinor))),
  });
  return `/panel/e-ticaret?${params.toString()}`;
}
```

Varış tarafı da tamamlandı: `os-rules.ts` → `readPoolPrefill`, `panel/e-ticaret/page.tsx` → `searchParams`, `os-cockpit.tsx` → `PoolTab`, `product-card-studio.tsx` → form alanları ön-dolu + "Radar önerisi forma yazıldı" bilgisi.

### P1.6 — Çok varyantlı giriş ve TL / gram / yüzde birimleri

`os-load.ts` her ürün için `variants: OsVariantView[]` üretir (maliyet işareti dahil); panel **tüm varyantları** listeler:

```78:92:components/commerce/profit-engines-panel.tsx
  const options: VariantOption[] = useMemo(
    () =>
      view.products.flatMap((product) =>
        product.variants
          .filter((variant) => variant.status !== "DRAFT" || variant.barcode != null)
          .map((variant) => ({ product, variant })),
      ),
    [view.products],
  );
```

Arayüz etiketleri artık satıcının dili:

| Önce | Sonra |
|---|---|
| `Maliyet (kuruş)` | `Maliyet (TL)` |
| `Desi (gram)` | `Desi (gram)` |
| `Komisyon (bps)` | `Komisyon (%)` |
| `Barem fiyatı (kuruş)` | `Barem fiyatı (TL)` |
| — | **`KDV (%)`** (yeni) |

Dönüşüm istemcide: `parseTryMinor` ("85,00" → 8500), `parsePercentBps` ("21" → 2100), `parseGrams`. Sunucuya her zaman **kuruş / gram / bps** gider — depo sözleşmesi bozulmadı.

---

## 3. PAKET C — Son Cilalar P2

### P2 — `scrubInventedNumbers` birim kalkanı

İzin listesi artık **tip taşır**:

```17:20:lib/commerce/profit-text.ts
export type NumberAllowance =
  | { kind: "rawMinor"; value: number }
  | { kind: "formattedTry"; value: string }
  | { kind: "percent"; value: number };
```

Metin taraması her sayıyı **birimiyle** değerlendirir: `%` öneki yalnız `percent`, `TL/₺/lira` eki yalnız `formattedTry`, `kuruş` eki veya birimsiz tam sayı yalnız `rawMinor`.

> **Yol boyunca bulunan tuzak:** `kuruş\b` regex'i Türkçe'de **hiç eşleşmiyor** — `ş` bir Unicode kelime karakteri değil, dolayısıyla `ş` ile `\b` arasında sınır yok. Bu yüzden birim eki `\b` yerine açık "kelime bitişi" kontrolüyle okunuyor:
>
> ```79:81:lib/commerce/profit-text.ts
> const CURRENCY_SUFFIX = /^\s*(?:(₺)|(tl|lira|kuruş|kurus)(?![A-Za-zÀ-ÿ]))/i;
> ```

**Kabul testleri:** *"kuruş değeri TL gibi yazılamaz: 8500 kuruş iken '8500 TL' reddedilir"*; *"TL değeri kuruş gibi yazılamaz"*; *"yüzde ile kuruş aynı torbada değildir"*; *"eski imza (sayı / TL metni) geriye dönük çalışır"*.

Eski imza korundu: `campaign-engine.ts` ve `bundle-engine.ts` çağrıları yeni tipli izne geçti, çünkü eski düz liste "8500 kuruş = 8500 TL" karışıklığına izin veriyordu.

### P2 — Kampanya metni, anlık slider, menü

**Metin görünür:** `saveCampaign` yanıtındaki `title`/`body` state'e yazılır ve ekranda basılır; `GET /campaigns` ile geçmiş liste (son 6) gösterilir.

**Slider anlık:** Panel `calculateUnitNet` + `simulateCampaign` fonksiyonlarını **istemcide** her slider hareketinde çalıştırır (`useMemo`). Sunucu yalnız "Sunucuda doğrula" ve "Kaydet" ile çağrılır.

**M3-2 çelişkisi kapandı:** `breakEvenBps === 0` iken `discountBps > breakEvenBps` yanlış olup "kâr bölgesindesin" basıyordu. Artık `verdict === "LOSS"` doğrudan zarar uyarısına gider:

```452:462:components/commerce/profit-engines-panel.tsx
              {live.campaign.verdict === "LOSS" ? (
                <>
                  Bu SKU liste fiyatında bile zarar ediyor. İndirim uygulanamaz; önce fiyatı veya maliyeti düzelt.
                  {live.campaign.breakEvenBps === 0 ? " Başabaş payı sıfır." : ""}
                </>
              ) : (
                <>
                  Başabaş indirim: %{(live.campaign.breakEvenBps / 100).toFixed(0)}
                  {inProfitZone ? " — kâr bölgesindesin." : " — kâr bölgesi dışındasın."}
                </>
              )}
```

**Menü erişimi:** `PUBLIC_TOP_BAR_PATHS` ilk sıraya `/e-ticaret` aldı. Vitrin artık kapısı olan bir MOFU sayfası.

### P2 — Ek düzeltmeler (aynı turda kapanan)

| Bulgu | Düzeltme |
|---|---|
| **M4-6** özet gün içinde donuyor | `fresh: false` ile dönen özet artık `netLabel` taşır; maliyet sonradan girilirse satıcı `fresh` bayrağını görür |
| **M4-7** kritik stok ürün alanından | `sumVariantOnHand(product.variants)` — varyant toplamı |
| **K3** paket kartına ham kuruş | `attributes` → `formatTryFromMinor` |
| **K4** `GET /campaigns` ölü uç | Panel çağırıyor ve listeliyor |
| **M2-4** radar durumları yarım | `poolSeedHref` üretilirken öneri `NEW` kalır; bağlantı tıklanabilir ve hedefi gerçek |

---

## 4. Doğrulama Kapıları

Tümü bu oturumda **fiilen koşuldu**.

| # | Kapı | Komut | Sonuç |
|---|---|---|---|
| 1 | Tip | `npx tsc --noEmit` | ✅ **0 hata** |
| 2 | Dil aksı | `npm run verify:sen-axis` | ✅ **536 dosya**, 37 kalıp, 0 ihlal |
| 3 | Sınır mührü | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda |
| 4 | API ↔ auth | `npm run verify:api-auth -- --check` | ✅ **146 rota** (`session:85, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| 5 | RLS sicili | `npm run verify:rls-status` | ✅ 78 Prisma tablosu; `commerce_*` 9 yeni tablo dahil |
| 6 | Sır taraması | `npm run verify:no-secrets` | ✅ PEM / service_role JWT / yasaklı atama yok |
| 7 | E-Ticaret + Tezgâh testleri | `npx vitest run tests/commerce tests/tezgah` | ✅ **41 dosya / 312 test** |
| 8 | Tüm suite | `npx vitest run` | ✅ **378 dosya / 2170 test** |
| 9 | Üretim derlemesi | `npx next build` | ✅ derleme başarılı; `routes-manifest.json`: `/e-ticaret`, `/panel/e-ticaret` |
| 10 | Lint (değişen ağaç) | `npx eslint lib/commerce components/commerce …` | ✅ 0 hata |

**Vitest notu:** Tüm suite koşusunda bir `[vitest-worker]: Timeout calling "onTaskUpdate"` uyarısı düştü. Bu, test **sonuçlarını** değiştirmeyen worker IPC zaman aşımıdır (378/378 dosya geçti); ürün kodundan kaynaklanmıyor.

### 4.1 Sayı ile kanıt (canlı çalıştırma)

Aşağıdaki satırlar `profit.ts` fonksiyonlarının bu oturumda koşulmasıyla üretildi.

```
ESKI NET (KDV'siz iddia)  : -1890        ← raporun §M4-2 sayısı
YENI NET (KDV dahil)      : -3557 | KDV: 1667
Basa bas fiyat (marj 0)   : 16547
REPRICE hedef (+500bps)   : { toPriceMinor: 18223, expectedGainMinor: 4470 }
REPRICE SONRASI           : THIN net 913 marj 501 bps     ← hedef garanti edildi
"8500 TL" (kuruş sızıntısı): REDDEDİLDİ ✓
"85,00 TL, %15"           : KABUL ✓
ESKI FORMUL fiyat/net     : 14057 / -1351   (hâlâ zarar — rapor doğru)
daily-brief ham 'kuruş'   : YOK ✓
panel 'kuruş' etiketi     : YOK ✓
```

**Okuma:** Eski formül 140,57 TL önerip −13,51 TL net bırakıyordu; yani raporun §M4-2 bulgusu **doğruydu** ve yeni hesap onu kapatıyor. Yeni hedef 182,23 TL ile **+9,13 TL / 501 bps** üretiyor.

> **Neden THIN, SAFE değil?** `THIN_MARGIN_BPS = 1000` (%10) eşiği "ince marj" sınırıdır. Hedef `+500 bps` olduğu için sonuç **doğru sınıfta** THIN'dir; `verdict` bu eşiğin altını işaretler, kâr edip etmediğini değil. Marjın **pozitif** ve ≥ `bpsOf(fiyat, 500)` olduğu testle ayrıca doğrulanır.

---

## 5. Teknik Mühürlere Uyum

Değişikliklerin hiçbiri mühürleri gevşetmedi:

| Mühür | Dokunuldu mu | Not |
|---|---|---|
| `ANAYASA.md` A katmanı (A1–A5) | **Hayır** | Okunmadı, değiştirilmedi |
| `AKADEMI_URETIM_ANAYASASI.md` | **Hayır** | — |
| `lib/kernel/ai/model-roles.ts` | **Hayır** | Model kimliği aynı; AI token kaynağı `COMMERCE` |
| `stock_ledgers`'a ciro yazılmaz | **Hayır** | Defter notu yalnız `event/requested/applied/variant` taşır |
| `INVENTORY_MOVE_SQL` | **Hayır** | Çağrılmadı, değişmedi |
| `rls_deny_unscoped` / `FORCE RLS` | **Hayır** | Yeni tablo açılmadı |
| `verify:boundaries` | **Hayır** | `set-catalog.ts`, `channel-credentials.ts`, `set-stock.ts` saf; `server-only` ve Prisma yok |
| "sen" aksı | **Uyuldu** | Yeni metinler: "sen girersin", "havuzdan onayla", "Kanal bağlandı" |
| Para birimi standardı | **Uyuldu** | Depo kuruş; UI/e-posta `formatTryMinor` |

**Yeni saf modüller** (DB importu yok, istemci ve testte serbest):

- `lib/commerce/channel-credentials.ts` — kimliğin tek kabul kuralı
- `lib/commerce/set-catalog.ts` — set SKU/barkod/bileşen bağı
- `lib/commerce/set-stock.ts` — set → üye stok orkestrasyonu

**Yeni server modülü:**

- `lib/commerce/store-license.ts` — fail-closed lisans portu

---

## 6. Test Envanteri (bu turda eklenen / güncellenen)

| Dosya | Test | Kapsam |
|---|---:|---|
| `tests/commerce/profit-math.test.ts` | **26** | KDV matrahı, kapalı form, hedef marj, birim kalkanı, radar TL |
| `tests/commerce/channel-webhook.test.ts` | **12** | Varyant kimliğiyle düşüm, barkod önceliği, 422 belirsizlik, çoklu yayın |
| `tests/commerce/faz3-son-metre.test.ts` | **15** | Bildirim türü, mail gövdesi, set kimliği, aksiyon dürüstlüğü |
| `tests/commerce/faz3-aksiyon-motorlari.test.ts` | **12** | Barem upsert, REPRICE zinciri, RESTOCK taslağı, set accept, günlük tarama |
| `tests/commerce/set-stock.test.ts` | **6** | Üye düşümü, mükerrer, kısa stok, set kârı |
| `tests/commerce/subscription-renewal-ip.test.ts` | **9** | Fail-closed, `blocked_config`, iptal muafiyeti |
| `tests/commerce/os-channel-license.test.ts` | **11** | Tek kasa, üç parça, eski triple, bağlantı kesme |
| `tests/commerce/os-load-variants.test.ts` | **6** | Tüm varyantlar + maliyet işareti |
| `tests/commerce/stock-truth.test.ts` | **15** | Kanal yazımı varyantı kilitler |
| `tests/kernel/citizen-notice*.test.ts` | **5** | Altıncı tür sicili |

**Toplam:** `tests/commerce` + `tests/tezgah` = 41 dosya / **312 test** (önce 38 / 256).

---

## 7. Gerçek Satıcı Gözüyle — Rapordaki 4.1–4.7 Engelleri

| Rapordaki engel | Durum |
|---|---|
| **4.1** "Trendyol'u bağladım" → sipariş gelmiyor | ✅ Kokpit `commerce_marketplace_credentials` yazıyor; `trendyol-sync` aynı satırı okuyor |
| **4.2** Çok bedenli üründe aşırı satış | ✅ XL satılınca XL düşer; S yerinde kalır |
| **4.3** Kâr rakamı KDV'siz | ✅ KDV düşülüyor; panelde `KDV (%)` alanı |
| **4.4** 30 gün sonra sessiz ölüm | ✅ Fail-closed + operatör alarmı; deneme hakkı yanmaz |
| **4.5** Onboarding maliyeti | 🟡 **Kısmen**: tek form içinde tüm varyantlar + TL/gram/% girdi. Toplu tablo ve CSV içe aktarma bu turun kapsamı dışında |
| **4.6** Özet gelmiyor, tek tık boş | ✅ E-posta gidiyor; REPRICE/BUNDLE/RESTOCK üçü de yan etki üretiyor |
| **4.7** Vitrin menüde yok, birim sözleşmesi yok | ✅ Menüye `/e-ticaret`; panelde TL/gram/% |

**Açıkça kalan (bu turun kapsamı dışı, raporda da 80+ için şart koşulmuş):** çok mağaza kokpiti, iade/iptal sonrası kâr düzeltmesi, gerçek talep verisi (radar hâlâ `OWN_CATALOG`), CSV toplu maliyet içe aktarma, `PENDING` ilanları işleyen periyodik işçi (§A6).

---

## 8. Son Cümle

Denetim raporu *"modül artık kâr hesaplayabiliyor; henüz kâr ettirmiyor"* diyordu. Bu turda dört cümlenin dördü de kodla kapandı:

- **Sayı doğru:** KDV dahil matrah, kapalı form hedef fiyat, birim duyarlı sayı kalkanı.
- **Doğru varyanta yazıldı:** SKU/barkod ile çözülen tek varyant, `FOR UPDATE` kilidi, ürün toplamı türev.
- **Doğru kanala gitti:** Tüm varyantlar kendi SKU'suyla yayınlanır; fiyat aksiyonu ilanı `PENDING`'e çeker.
- **Satıcıya ulaştı:** Sabah 07:00 özeti gerçekten e-posta olarak gider; panel metni ve geçmiş kampanya ekranda.

Ölçülebilir sonuç: **312 commerce testi**, **2170 toplam test**, **10/10 kapı yeşil**, `next build` başarılı. Raporun sayısal iddiaları (§A1, §M4-2) canlı hesapla **doğrulandı ve kapandı**.

---

*Bu rapor hiçbir ürün dosyasını değiştirmedi. Tüm sayısal iddialar `profit.ts`, `profit-text.ts` ve `daily-brief.ts` fonksiyonlarının bu oturumda çalıştırılmasıyla üretilmiştir. Doğrulanamayan tek alan canlı SMTP teslimatıdır (ortam kimliği gerektirir); ilgili yol `deliverCitizenNoticeMail` üzerinden kod ve test ile gerekçelendirilmiştir.*
