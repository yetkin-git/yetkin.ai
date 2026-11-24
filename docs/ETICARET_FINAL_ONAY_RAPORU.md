# yetkin.ai — E-Ticaret Modülü Final Puan Kartı ve Pilot Lansman Kararı

**Denetim tarihi:** 23 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / E-Ticaret Ürün Mimarı
**Denetim konusu:** `docs/ETICARET_FAZ3_SON_METRE_RAPORU.md` kapanış beyanının bağımsız çapraz doğrulaması
**Referans:** `docs/ETICARET_TESPIT_RAPORU.md` (**44 / 100**), `docs/ETICARET_SONUC_RAPORU.md` (**61 / 100**)
**Kural:** Hiçbir kaynak dosya değiştirilmedi, silinmedi, oluşturulmadı. Yalnız bu rapor yazıldı.

**Yöntem:** Beyan edilen dosyalar satır satır okundu (şema → servis → rota → cron → UI). `profit.ts` ve `profit-text.ts` bu oturumda `tsx` ile çalıştırıldı. Bölüm 3'teki yedi kapı bu oturumda fiilen koşuldu. Faz 3 raporundaki sayı, rapor doğru olduğu için değil, fonksiyon aynı sayıyı ürettiği için kabul edildi.

---

## 1. Final Puan Kartı ve Yolculuk Özeti (44 → 61 → 73)

### 1.1 Puan: **73 / 100** (44 → 61 → **73**, bu tur **+12**)

Faz 3 raporu, ikinci denetimin "P0 altısı + P1.1 + P1.3 + P2 birim kapanırsa 72–76" cümlesini **tüm maddeler kapandı** diye okuyup eşiğin üstünü ima ediyor. Gerçekleşme **73**. 76 tutmuyor. Ücretli self-serve pilot imzalanmıyor.

Ağırlıklar ilk iki denetimle aynı: Mimari %25, Mevcut İşlevsellik %30, Ticari Farklılaşma %25, UX / Vitrin %20.

| Eksen | 44'lük denetim | 61'lik denetim | **Bu denetim** | 61 → 73 |
|---|---:|---:|---:|---:|
| **Mimari Hazırlık** | 42 | 63 | **75** | +12 |
| **Mevcut İşlevsellik** | 58 | 61 | **73** | +12 |
| **Ticari Farklılaşma** | 30 | 60 | **70** | +10 |
| **UX / Vitrin** | 40 | 58 | **73** | +15 |
| **Toplam** | **44** | **61** | **73** | **+12** |

Hesap, önceki raporların yuvarlamasıyla aynı yöntem:

- `42×0,25 + 58×0,30 + 30×0,25 + 40×0,20 = 43,4 → 44`
- `63×0,25 + 61×0,30 + 60×0,25 + 58×0,20 = 60,65 → 61`
- `75×0,25 + 73×0,30 + 70×0,25 + 73×0,20 = 72,75 → 73`

### 1.2 Eksen gerekçeleri

| Eksen | Puan | Neden bu puan |
|---|---:|---|
| **Mimari Hazırlık** | **75** | KDV matrahı, varyant kilidi (`FOR UPDATE`), fail-closed lisans portu, fail-closed yenileme ve kokpitin `commerce_marketplace_credentials` yazması gerçekten duruyor. Tavan burada: `sales_channels` hâlâ ikinci kasa ve içine yazılan mühür, yayın adaptörünün beklediği üçlü değil (`os-service.ts:448` ↔ `channel-adapters.ts:134`). `PENDING` bir durum bayrağı; onu boşaltan işçi yok. |
| **Mevcut İşlevsellik** | **73** | XL satışı XL'den düşüyor, lisanssız kimlik 403, IP yoksa çekim duruyor, 07:00 taraması `emitCitizenNotice` çağırıyor, REPRICE matematiği +500 bps üretiyor. Kopuk halka aynı yerde: fiyat pazaryerine gitmiyor, OS yayını kimlik doğrulayamıyor, set satışı kanal yolunda üye stoklarını düşürmüyor. |
| **Ticari Farklılaşma** | **70** | Kapalı form fiyat, ikinci denetimin §M4-2 senaryosunda **18.223 kuruş / net +913 kuruş / 501 bps** üretiyor; bu oturumda yeniden ölçüldü. Satıcı Trendyol'da hâlâ eski zarar fiyatını satar, çünkü ilan `PENDING`'de kalır ve kimse o bayrağı okumaz. Radar kaynağı hâlâ `OWN_CATALOG`. |
| **UX / Vitrin** | **73** | `/e-ticaret` üst menüde, KDV alanı var, giriş birimleri TL / gram / %, kaydırıcı istemcide anlık hesaplıyor, kampanya metni ekrana basılıyor, radar bağlantısı havuz formunu TL ile dolduruyor. Ekrandaki üç cümle fazla söylüyor: "kuyruğa alındı", "ikinci bir form yok", "eşitleme kaydı gitti". Paket gerekçesi hâlâ "kuruş" yazıyor. |

### 1.3 Tek cümlelik teşhis

> Sayı artık doğru, doğru bedenden düşülüyor ve sabah postasının kancası var; fiyat ile stok yayını hâlâ satıcının pazaryeri ilanına varmadan "oldu" diyor.

İkinci denetimin dört cümlesinden ikisi kapandı (sayı doğru, doğru varyanta yazıldı), biri kısmen kapandı (satıcıya e-posta hattı bağlandı), biri açık kaldı (doğru kanala gitmedi).

---

## 2. P0, P1 ve P2 Çapraz Doğrulama Matrisi

Durum sözlüğü: **Kapandı** = kabul ölçütü kodda ve (varsa) bu oturumdaki canlı hesapta tutuyor. **Kısmi** = beyanın bir yarısı tutuyor, satıcının gördüğü sonuç tutmuyor. **Açık** = beyan kodda yok.

| Madde | Karar | Kanıt |
|---|---|---|
| **P0.1** KDV matrahı | **Kapandı** | `vatIncludedMinor` KDV dahil fiyattan matrahı ayırıyor (`lib/commerce/profit.ts:166-174`). `calculateUnitNet` netten KDV'yi düşüyor (`:199-211`). Panelde `KDV (%)` var ve kayıt `vatBps` gönderiyor (`components/commerce/profit-engines-panel.tsx:284-285`, `:470-477`). |
| **P0.2** Varyant düşümü | **Kapandı** | Satış `planVariantSale` + `applyVariantMovement(variantId)` (`channel-stock-engine.ts:249-278`). Çözüm sırası barkod → varyant SKU → tek varyant (`channel-stock-prisma.ts:43-64`). Eşleşme yoksa 422, ilk bedene yazılmıyor (`channel-stock-engine.ts:238-241`). Trendyol çekimi ilanın `variantId`'sine hareket yazıyor (`trendyol-sync.ts:95-114`). |
| **P0.2** Çoklu yayın | **Kısmi** | `broadcastLines` her aktif varyantı kendi SKU'su ve satılabilir adediyle kuruyor (`channel-broadcast.ts:52-61`). Bu satır Trendyol'a iki nedenle oturmuyor: bkz. **N1**. Kabul testi N11'e ham anahtarla atıyor (`tests/commerce/channel-webhook.test.ts:549-575`); Trendyol üçlüsünü ve barkodu sınamıyor. |
| **P0.3** Tek kimlik kasası | **Kısmi** | Kokpit, pazaryeri kanalında `commerceMarketplaceCredential.upsert` yazıyor (`os-service.ts:474-496`). Sipariş cron'u aynı tabloyu okuyor (`trendyol-sync.ts:256`). Üç alan dolmadan "Bağla" pasif (`os-cockpit.tsx:743-750`). İkinci form duruyor ve metin bunu inkâr ediyor: bkz. **N6**. Yayın kasasına yazılan mühür üçlü değil: bkz. **N1**. |
| **P0.4** Çift lisans kapısı | **Kapandı** | `putTrendyolCredential` lisanssızda 403 (`marketplace-service.ts:103-106`). Rota bu fonksiyonu lisans portuyla çağırıyor (`marketplace-handlers.ts:120-129`). Hepsiburada aynı rotayı kullanıyor (`app/api/commerce/stores/[storeId]/credentials/hepsiburada/route.ts:20`). Kokpit kapısı duruyor (`os-service.ts:436-438`). Port okunamazsa `false` (`store-license.ts:14-22`). |
| **P0.5** Fail-closed yenileme | **Kapandı** | `OUTBOUND_PUBLIC_IP` boşsa veya `127.0.0.1` / `localhost` / `::1` / `0.0.0.0` ise çekim yok (`subscription-renewal.ts:24-35`, `:98-109`). Sayaç artmıyor, abonelik yazılmıyor, `blocked_config` loglanıyor. İptal adımı bu kapıdan geçmiyor (`:98` yalnız `step.kind === "charge"`). |
| **P0.6** 07:00 özeti | **Kapandı** | Cron `TZ=Europe/Istanbul 0 7 * * *` (`lib/kernel/jobs/inngest.ts:507-516`). Yeni özet `emitCitizenNotice({ kind: "commerce_daily_brief" })` çağırıyor (`daily-brief.ts:674-684`). Tür sicilde (`lib/kernel/notice/kinds.ts:14`). Posta gövdesi özet + zarar adedi + kritik stok + panel yolu (`lib/kernel/notice/mail.ts:83-99`, `:137-138`). SMTP boşsa teslimat `skipped`; kanca yine de bu fonksiyon. |
| **P1.1** REPRICE matematiği | **Kapandı** | Kapalı form `breakEvenPriceMinor` (`profit.ts:254-278`), doğrulama yürüyüşü `profitablePriceMinor` (`:286-307`). §M4-2 senaryosu bu oturumda: fiyat 10.000, KDV 1.667, net **−3.557**; hedef **18.223**; sonrası net **+913**, marj **501 bps**, karar **THIN**, 500 bps tabanı 911 kuruş ve tutuyor. |
| **P1.1** Kanala fiyat itmesi | **Açık** | `applyReprice` yalnız `syncStatus: "PENDING"` yazar (`daily-brief.ts:486-488`) ve metin "kuyruğa alındı" der (`:497-500`). `publishAppliedTrendyolStock` bu fonksiyondan çağrılmaz; tek çağrı envanter POST'undadır ve yalnız ilk hareketi kuyruğa koyar (`service.ts:785-793`, `trendyol-publish.ts:15-20`). `PENDING` okuyan cron yok. Test de yalnız bayrağı kilitliyor (`tests/commerce/faz3-aksiyon-motorlari.test.ts:194-242`). |
| **P1.2** BUNDLE / RESTOCK | **Kısmi** | BUNDLE `proposeBundles` çağırır; öneri üretilemezse `APPLIED` yazılmaz (`daily-brief.ts:630-637`). RESTOCK gelen kutuya uyarı ve `INBOUND_DRAFT` yazar (`:531-557`). Onay, taslağı **ilk aktif varyanta** basar (`os-service.ts:276-288`, `stock-sync.ts:48-50`). Çok bedende kritik olan XL ise giriş S'ye gider. |
| **P1.3** Paket kartı | **Kapandı** | `accept` COGS, desi, KDV, EAN-13 barkod, üye bağı ve `ACTIVE` kart yazar (`bundle-engine.ts:313-374`). Barkod `299` + sağlama hanesi (`set-catalog.ts:30-38`). Üye maliyeti yoksa 422, yarım kart yok (`bundle-engine.ts:295-302`). |
| **P1.3** Üye stok düşümü | **Kısmi** | Düşüm yalnız `postCommerceInventory` içinde ve işlem geri almalı (`service.ts:753-772`). Trendyol / Hepsiburada çekimi düz `applyMovement` yapar (`trendyol-sync.ts:104-114`); set üyesi aranmaz. `drawSetMembers` üretim kodundan çağrılmıyor. Yorum "hiçbiri yazılmaz" der (`set-stock.ts:28-29`); döngü ilk üyeyi yazdıktan sonra ikincide 409 döner, geri alma yok (`:51-68`). `accept` stoğu kopyalar, üye stoğunu düşürmez (`bundle-engine.ts:317-323`). Set ve tekil aynı anda satılabilir. |
| **P1.4** Barem | **Kapandı** | Aynı `(storeId, carrier, bandMin, bandMax)` satırı güncellenir (`economics-service.ts:113-133`). `cargoForWeight` en güncel `effectiveFrom`'u seçer (`profit.ts:402-417`). Tekillik indeksi yok (`commerce.prisma` `CommerceShippingTariff` yalnız `@@index`); eşzamanlı iki kayıt açılabilir, seçici yine en günceli alır. Eski "en ucuz kazanır" hatası kapalı. |
| **P1.5** Radar → havuz | **Kapandı** | Başlık `₺` basar (`radar-signals.ts:131-138`). Bağlantı `/panel/e-ticaret?sekme=havuz&taslakBaslik&taslakKategori&hedefFiyat` (`:111-122`). Sayfa `readPoolPrefill` okur (`app/(kernel)/panel/e-ticaret/page.tsx:28-33`, `os-rules.ts:59-68`). Form ilk açılışta dolar (`product-card-studio.tsx:33-37`) ve "Radar önerisi forma yazıldı" der (`:160-162`). Havuz sekmesi büyüme sekmesindeyken bağlı değildir; tıklama yeni mount üretir. |
| **P1.6** Çok varyant + birim | **Kısmi** | Seçenek listesi ürünün varyantlarını düzleştirir (`profit-engines-panel.tsx:134-141`). Etiketler `Maliyet (TL)`, `Desi (gram)`, `Komisyon (%)`, `Barem fiyatı (TL)`. Toplu tablo yok. Seçim değişince alanlar o varyantın kayıtlı maliyetini yüklemez; `OsVariantView` yalnız `hasEconomics` bayrağı taşır (`os-load.ts:157-166`, panel `:147-155`). İkinci bedene geçip kaydetmek, kutuda kalan rakamı o bedene yazar. |
| **P2** Sayı kalkanı | **Kısmi** | `"8500 TL"` reddedilir, `"85,00 TL"` kabul edilir. Bu oturumda ölçüldü. `"85,00 kuruş"` da kabul edilir: ayraç silinince rakam `8500` olur ve kuruş iznine uyar (`profit-text.ts:124`, `:209-213`). Adlandırılmış test kapanmış, birim kalkanı tam kapanmamış. Bkz. **N5**. |
| **P2** Metin, kaydırıcı, menü | **Kapandı** | Kaydırıcı `discountBps` değiştirir; `useMemo` `calculateUnitNet` + `simulateCampaign` çalıştırır (`profit-engines-panel.tsx:199-230`, `:555-563`). Kayıt `title` / `body` basar (`:616-620`) ve son 6 kampanyayı listeler (`:622-633`). `LOSS` iken "kâr bölgesindesin" basılmaz (`:592-596`). Menüde ilk öğe `/e-ticaret` (`components/public/public-top-bar.tsx:24-25`). |

### 2.1 Bu oturumda çalışan sayı

§M4-2 girdisi: satış 10.000 kuruş, COGS 5.000, kargo 3.990, komisyon 2.100 bps, iade 800 bps, KDV 2.000 bps, reklam 0.

```
KDV (10.000 kuruş, %20)     : 1667
Net, KDV düşülmüş           : -3557
REPRICE hedef (+500 bps)    : 18223
REPRICE sonrası net / marj  : 913 / 501 bps   karar THIN
500 bps tabanı              : 911 kuruş       913 >= 911
"8500 TL"                   : reddedildi
"85,00 TL"                  : kabul
"85,00 kuruş"               : kabul   ← kalkan deliği
```

Faz 3 raporundaki 18.223 / +9,13 TL / 501 bps iddiası **doğru**. Aynı fonksiyonun "ilan pazaryerine gider" iddiası **yanlış**.

### 2.2 Kapılar (23 Kasım 2026, bu oturum)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ çıkış 0 |
| Dil aksı | `npm run verify:sen-axis` | ✅ 536 dosya, 37 kalıp |
| Sınır | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda |
| API ↔ auth | `npm run verify:api-auth -- --check` | ✅ 146 rota (`session:85, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| RLS | `npm run verify:rls-status` | ✅ `commerce_marketplace_credentials` dahil commerce tabloları sicilde |
| Sır | `npm run verify:no-secrets` | ✅ PEM / service_role JWT / yasaklı atama yok |
| Test | `npx vitest run tests/commerce tests/tezgah` | ✅ **41 dosya / 312 test** |

Bu yedi kapı yine "fiyat Trendyol'a gitti mi" ve "kokpitte bağlanan anahtar yayın adaptöründe üçlü mü" diye sormuyor. 312 testin geçmesi N1 ve N2'yi kapatmıyor: yayın testi N11 ham anahtarıyla yeşil, REPRICE testi yalnız `PENDING` bayrağını yeşil kılıyor.

### 2.3 Yeni dosyalarda mühür taraması

| Dosya | Bulgu |
|---|---|
| `channel-credentials.ts` | Saf. DB yok. Üç parça eksikse hiçbiri kabul edilmiyor (`:54-79`). Tek parça anahtar `parseTripleCredential` ile reddediliyor (`:87-96`). "sen" metni alan adını söylüyor. |
| `set-catalog.ts` | Saf. EAN-13 sağlama hanesi standart (tek sıra 1, çift sıra 3). Üretimde `drawSetMembers` bunu kullanmıyor; kart `accept` içinde doğuyor. |
| `set-stock.ts` | Saf ve **ölü**. Üretim çağrısı yok. Geri alma vaadi tutulmuyor (`:28-68`). |
| `store-license.ts` | `server-only`. Okuma hatasında kapı kapanıyor (`:14-22`). |
| Güncellenen motorlar | `verify:boundaries` ve `verify:sen-axis` ihlal görmedi. Marka aksı ("siz") bu ağaçta kırık değil. Kırık olan, satıcıya söylenen işin yapılmış olması. |

---

## 3. Tespit Edilen Yeni Kusurlar / Kalan 80+ Backlog

### 3.1 76'ya kadar kapanması gerekenler

Bunlar Faz 3'ün "kapandı" dediği ve satıcının parasını veya stoğunu etkileyen delikler. 76 ve ücretli self-serve pilot bunların kapanmasına bağlı.

#### N1 — `[YÜKSEK]` Yayın kimliği, kokpit bağlantısından sonra Trendyol/HB'ye gitmez

Kokpit `sales_channels.apiKeySeal` içine yalnız API anahtarını mühürler:

```448:448:lib/commerce/os-service.ts
      apiKeySeal = sealCommerceCredential(credential.apiKey, "apiKey", pool.id, process.env, kind);
```

Yayın bu mührü açar (`channel-webhook-live.ts:45-51`). Trendyol adaptörü `satıcı:anahtar:sır` üçlüsü arar; bulamazsa supplier başlığı kurmaz ve ham anahtarla `Bearer` gider (`channel-adapters.ts:134-148`). Hepsiburada aynı üçlüyü Basic kimliğe çevirir (`:173-185`).

İkinci kopukluk: `broadcastLines` barkodu taşımıyor (`channel-broadcast.ts:61`). Trendyol gövdesi `barcode: input.sku` yazar (`channel-adapters.ts:145`). Pazaryeri barkodu SKU'dan farklıysa — beş bedenli üründe olağan durum — doğru kimlik olsa bile ilan bulunamaz. Doğru boru `pushTrendyolListingStock` içindeki `listing.remoteBarcode` (`trendyol-sync.ts:209-214`). REPRICE ve sipariş çekimi bu boruyu çağırmaz.

**Etki:** "Her beden kendi SKU'suyla yayına gider" cümlesi dizi kurulumunda doğru, pazaryeri sonucunda yanlış. Onay sonrası kokpit "eşitleme kaydı düştü" diyebilir (`os-service.ts:336-338`); `fanout`, sonuç `FAILED` olsa da kanal sayısından türer.

#### N2 — `[YÜKSEK]` REPRICE fiyatı yerelde bırakır ve bunu kuyruk diye anlatır

```486:500:lib/commerce/daily-brief.ts
  const pendingListings = await prisma.commerceChannelListing.updateMany({
    where: { storeId, variantId: variant.id },
    data: { syncStatus: "PENDING", lastError: "" },
  });
  ...
          ? `Fiyat ${formatTryMinor(target.toPriceMinor)} oldu. ${pendingListings.count} ilan pazaryerine gönderilmek üzere kuyruğa alındı.`
```

`inngest.ts` içindeki `trendyolStockPush` yalnız `TRENDYOL_STOCK_PUSH_REQUESTED` olayında uyanır (`:376-381`). Bu olayı gönderen tek üretim yolu envanter hareketidir. Fiyat aksiyonu olay göndermez. `syncStatus: "PENDING"` okuyan bir tarama da yoktur.

**Etki:** Zarar eden SKU panelde 182,23 TL olur. Trendyol 100 TL'den satmaya devam eder. İkinci denetimin §M4-4 / §A6 bulgusu kapanmadı; üzerine "kuyruğa alındı" cümlesi eklendi.

#### N3 — `[YÜKSEK]` Set kartı satılabilir doğar, kanal satışı üyeyi düşürmez

`accept` set stoğunu üyelerin satılabilir adedinin en küçüğü olarak **kopyalar** (`bundle-engine.ts:317-323`). Üye stoğu yerinde kalır. Kanal satışı (`trendyol-sync.ts:104`, Hepsiburada eşdeğeri, OS webhook `commitChannelEvent`) set varyantını düşürür, `readBundleMembers` bakmaz.

Envanter POST yolu üyeyi işlem içinde düşürür ve kısa stokta geri alır (`service.ts:753-772`). Bu, Trendyol'dan gelen set satışının yolu değildir. `lib/commerce/set-stock.ts` bu yolu da sarmalamaz; test dışında çağrısı yoktur ve kendi döngüsü geri almaz.

**Etki:** Set + tekil aynı malı iki kez satabilir. Barem motorunun pahalı senaryosu, kartın doğduğu anda açıktır.

#### N4 — `[ORTA]` RESTOCK onayı ilk aktif bedene yazılır

Taslak ürün seviyesindedir. `approveInbound` hedefi `inboundTargetVariant`: ilk `ACTIVE`, yoksa ilk varyant (`stock-sync.ts:48-50`, `os-service.ts:276-288`). Günlük özet kritik stoğu varyant toplamından okur. Toplam eşiğin altındayken onay, tükenen XL'ye değil ilk aktif bedene (çoğu kartta S) stok ekler. Yan etki vardır; doğru bedene yan etki yoktur.

### 3.2 76 ile 80 arasında duran kalite borçları

#### N5 — `[ORTA]` `scrubInventedNumbers` ondalık kuruşu geçiriyor

İzin `{ kind: "rawMinor", value: 8500 }` iken:

- `"8500 TL"` → boş metin (red)
- `"85,00 TL"` → metin durur (doğru)
- `"85,00 kuruş"` → metin durur (yanlış)

`numberTokensIn` nokta ve virgülü siler (`profit-text.ts:124`). Kuruş eki `MINOR` sayılır (`:209-213`) ve `"8500"` izin kümesine uyar. Okuyan kişi 85 kuruş görür; izin 8.500 kuruştur. Adlandırılmış P2 testi kapanmış durumda. Kampanya istemi modele hâlâ "kuruş" ve "baz puan" veriyor (`campaign-engine.ts:184-189`), yani modelin bu deliğe yürümesi teşvik ediliyor.

#### N6 — `[ORTA]` Ekran, kodun yapmadığını söylüyor

| Cümle | Yer | Kod |
|---|---|---|
| "ilan … kuyruğa alındı" | `daily-brief.ts:499` | N2: işçi yok |
| "ikinci bir form yok" | `os-cockpit.tsx:675-677` | `/magazam/[storeId]/kanallar` hâlâ `ChannelDesk` basıyor (`app/(kernel)/magazam/[storeId]/kanallar/page.tsx:52-67`). Klasik masa `sales_channels` yazmaz. |
| "Diğer kanallara eşitleme kaydı gitti" | `os-service.ts:796` | N1: kayıt gider, kimlik üçlü değildir |
| Paket gerekçesi "kuruş" | `profit.ts:511-513` | Panel gerekçeyi basar (`profit-engines-panel.tsx:659`) |
| `sameBand` düzeltildi (Faz 3 §M1-5) | beyan | Kod hâlâ `members[0]` ile toplamı karşılaştırıyor (`profit.ts:492`) |

Kaydırıcı anlık hesaplar. Hesap, sunucu simülasyonunun hesabı değildir: istemci iade oranını **800 bps** sabitler ve desi baremine bakar (`profit-engines-panel.tsx:207-227`); sunucu kanalın düz `cargoMinorPerOrder` ve kayıtlı iade oranını kullanır, baremi kullanmaz (`campaign-engine.ts:92-100`). "Sunucuda doğrula" ile anlık kutu farklı net basabilir.

Ek, puanı tek başına oynatmayan açıklar:

- 00:00–07:00 arasında panel özeti ürettiyse 07:00 cron'u `exists` görüp postayı atlar (`daily-brief.ts:712-718`). Posta yalnız cron'un kendisinin yarattığı satırda gider.
- `readOutboundPublicIp` yalnız dört dizgeyi yerel sayar. `127.0.0.2` çekime girer (`subscription-renewal.ts:31`).
- `LOSS` kampanya kayda girer (`campaign-engine.ts:243-257`). Başlık "yayına alma" der, satır yine yazılır.
- `proposeBundles` yeni öneriden önce tüm `PROPOSED` satırları `DISMISSED` yapar (`bundle-engine.ts:116-119`).
- İade, fiş notundaki `variant=` alanını okumaz; geri yazılacak beden, iade olayının o anki kilididir (`channel-stock-engine.ts:361-365`). Not dokümandır, anahtar değildir.
- Maliyet alanı "KDV hariç mi dahil mi" demez. Çıktı KDV'si düşülür, alış KDV'si mahsup edilmez. Satıcı raftan ödediği KDV dahil maliyeti girerse kâr, mahsup edilecek girdi KDV'si kadar düşük görünür. Yön, eski "hayalet kâr"ın tersidir; ince marjda REPRICE'ı gereksiz yukarı iter.

### 3.3 80+ için duran, bu turda da kapanmayan backlog

İkinci denetimin 80+ listesi kodda duruyor. N1–N3 bunların önündedir; bunlar kapanmadan 80 konuşulmaz.

| # | Madde | Neden hâlâ 80'in şartı |
|---|---|---|
| B1 | Çok mağaza kokpiti | `pickPoolStore` tek havuz adı arar (`os-rules.ts:82-86`). İkinci mağaza kokpitin öznesi değil. |
| B2 | İade / iptal sonrası kâr düzeltmesi | Günlük net, anlık birim hesabıdır. İade fişi kâr satırını geri yazmaz. |
| B3 | Gerçek talep | Radar `collectOwnCatalogGaps` ile kendi katalog boşluğunu sayar (`radar-signals.ts:27-31`). `GRANT_CALL` / `TETKIK` / `MARKETPLACE_TREND` kaynağı üretilmiyor. |
| B4 | CSV ile toplu maliyet | P1.6 tek formdur. 20 varyant = 20 kayıt, üstelik seçim değişince kutu eski rakamı taşır (N6). |
| B5 | `PENDING` ilan işçisi | N2 ile aynı borç. 80'in değil, 76'nın şartı haline geldi. |
| B6 | Girdi KDV'si sözleşmesi | Bölüm 3.2 son madde. Pilot satıcısı maliyeti KDV dahil girer. |
| B7 | Kargo baremi tekilliği | P1.4 seçici doğru; yarış iki satır açabilir. İndeks şart değil, 80 öncesi sertleştirme. |

---

## 4. Resmî Pilot Lansman Kararı

### Karar: **ŞARTLI ONAY**

**73 / 100.** 76 eşiği aşılmadı. 5–10 mağazalık **self-serve ücretli pilot imzalanmaz.**

Şartlı olan şudur: en fazla **5 mağaza**, **tek kanal**, **set satışı kapalı**, fiyat değişikliği satıcının pazaryeri panelinde **elle**, stok yayını OS broadcast'e bırakılmadan. Bu dar kapsamda tahsilat alınabilir, çünkü aşağıdaki beş madde kodda tutuyor:

1. Kokpitte bağlanan Trendyol/Hepsiburada kimliği `commerce_marketplace_credentials` satırına yazılır ve sipariş cron'u o satırı okur.
2. Kanal satışı çözülen varyanttan düşer; XL satışı S'yi düşürmez.
3. KDV dahil fiyattan KDV düşülür; panelden oran girilir.
4. Lisanssız kimlik yazımı her iki rotada 403; lisans okunamazsa kapı kapanır.
5. `OUTBOUND_PUBLIC_IP` yoksa yenileme çekimi denenmez. 07:00 cron'u, o sabah ilk kez ürettiği özette `emitCitizenNotice` çağırır.

Bu beş madde, ikinci denetimin "sayı yanlış, beden yanlış, sipariş gelmiyor, lisans ölüyor, posta yok" listesinin gövdesini kapatır. İmzanın self-serve olmamasının nedeni, kapanan gövdenin üstüne binen üç yüksek kusurdur:

- **N2** — tek tık fiyat, Trendyol ilanını değiştirmez ve "kuyruğa alındı" der.
- **N1** — çok beden yayını doğru diziyi kurar, Trendyol/HB kimliği ve Trendyol barkodu o diziyi ilana oturtmaz.
- **N3** — set kartı satılabilir stokla doğar; kanal satışı üye stoğunu düşürmez.

N1, N2 ve N3 kapanmadan karar **ONAY** olmaz ve 76 yazılmaz. N1–N3 kapandıktan sonra bölüm 3.3'teki B1–B7 kapanmadan karar **80+ / tam ölçekli satış** olmaz.

Denetimli 5 mağaza şartı yazılmadan tahsilat açılırsa bu karar **RED** sayılır. Şart yazılırsa karar **ŞARTLI ONAY** olarak kalır. Koşulsuz **ONAY** bu kod ağacında yoktur.

---

*Bu rapor hiçbir kaynak dosyayı değiştirmedi. §2.1 sayıları `lib/commerce/profit.ts` ve `lib/commerce/profit-text.ts` fonksiyonlarının 23 Kasım 2026 oturumunda çalıştırılmasıyla üretildi. Kapı sonuçları aynı oturumda alınan çıkış kodlarıdır. Canlı Trendyol/Hepsiburada HTTP yanıtı ve canlı SMTP teslimatı ölçülmedi; N1 ve P0.6 bu iki dış sisteme değil, isteği kuran ve postayı kuyruğa koyan koda dayanır.*
