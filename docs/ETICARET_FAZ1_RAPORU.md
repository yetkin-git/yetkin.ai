# yetkin.ai — E-Ticaret Faz 1 Operasyon Raporu

**Tarih:** 22 Kasım 2026  
**Kapsam:** Vitrin, tek stok gerçeği ve dürüstlük onarımları (`docs/ETICARET_TESPIT_RAPORU.md` K-01, K-03, Y-01…Y-04, O-01…O-04, O-07)  
**Durum:** 8/8 madde uygulandı; kapılar yeşil.

---

## 0. Yönetici özeti

Faz 1, E-Ticaret’i “oturum duvarı arkası yönetim paneli” olmaktan çıkarıp **kamuya açık vitrin + korumalı kokpit** ayrımına oturttu; stok gerçeğini varyant toplamına bağladı; Amazon/N11 vaadini ve yanıltıcı “Eşitle / Simüle” yüzeylerini dürüstleştirdi; lisans kapısını sunucuya taşıdı.

| Madde | Sonuç |
|---|---|
| 1. `/e-ticaret` vitrin + `/panel/e-ticaret` kokpit | ✅ |
| 2. Amazon/N11 dürüstlük + “Yakında” | ✅ |
| 3. Tek stok gerçeği + migration | ✅ |
| 4. Sunucu lisans kapısı (`connectChannel`) | ✅ |
| 5. Simülasyon gizleme + kuyruk metni | ✅ |
| 6. “Sen” aksı + error boundary | ✅ |
| 7. Çok varyant + yenileme IP | ✅ |
| 8. Testler + kapılar + bu rapor | ✅ |

---

## 1. Kamuya açık vitrin ve rota ayrımı (K-03, O-03)

### Yapılanlar
- Kokpit: `app/(kernel)/e-ticaret/page.tsx` → `app/(kernel)/panel/e-ticaret/page.tsx`
- Kamu vitrin: `app/(public)/e-ticaret/page.tsx`
- `PROTECTED_KERNEL_PATHS`: `"/e-ticaret"` çıkarıldı, `"/panel/e-ticaret"` eklendi
- `AUTH_PATH_ALIASES["/magazam"]` → `"/panel/e-ticaret"`
- `COMMERCE_NAV.path` → `"/panel/e-ticaret"`
- SEO: `PAGE_SEO.eTicaret`, `SITEMAP_STATIC_PATHS` + öncelik `0.9`
- `ROBOTS_DISALLOW_PATHS`: `"/panel/e-ticaret"`, `"/magazam"`

### Vitrin içeriği
- Ana değer önerisi: boru hattı değil; kargo baremi / kâr / fırsat odaklı AI e-ticaret beyni
- Canlı yetenekler: Trendyol & Hepsiburada, stok defteri, AI yanıt taslağı
- Yol haritası (dürüst “Henüz canlı değil”): kâr simülasyonu, barem paketleri, fırsat tarama
- CTA: `buildCitizenRegisterHref("/panel/e-ticaret")` + `TRIAL_COPY` SSOT

### Build kanıtı
`npx next build` çıktısında hem `ƒ /e-ticaret` hem `ƒ /panel/e-ticaret` üretildi.

---

## 2. Amazon ve N11 dürüstlük (Y-01)

| Dosya | Önce | Sonra |
|---|---|---|
| `lib/pricing/public-vitrine.ts` | Amazon ve N11 | Trendyol ve Hepsiburada |
| `components/commerce/os-cockpit.tsx` lisans bandı | Amazon, N11 dahil | Trendyol ve Hepsiburada dahil |
| `app/llms.txt/route.ts` | Amazon ve N11 | Trendyol ve Hepsiburada |

`OS_CHANNEL_CATALOG` içinde Amazon/N11 `comingSoon: true`. Kokpitte **Yakında** rozeti; bağla düğmesi pasif. Sunucu `connect` → `422 "Bu kanal yakında."`

---

## 3. Tek stok gerçeği (K-01, O-07)

### Çalışma zamanı
- `INVENTORY_MOVE_SQL`: varyant `on_hand` güncellenince ürün `approved_stock_qty` = varyant toplamı
- `lib/commerce/stock-sync.ts`: `sumVariantOnHand`, `effectiveSku`, `effectiveApprovedQty`, `distributeApprovedTarget`, `syncApprovedStockFromVariants`
- Kanal satışı (`setApprovedStock`): onaylı adet değişince varyantlara delta dağıtımı
- Yayın / büyüme: boş ürün SKU → ilk dolu varyant SKU; `approvedStockQty === 0` → varyant toplamı yedek

### Migration (idempotent)
`prisma/migrations/20261122220000_faz1_sync_approved_stock/migration.sql`

Mevcut kayıtları yalnız fark varsa günceller (`IS DISTINCT FROM`).

---

## 4. Sunucu lisans kapısı (Y-02)

`connectChannel` (`lib/commerce/os-service.ts`):
1. `comingSoon` → 422  
2. `connect === true` ve `!commerceLicenseActive` → **403** `"Kanal bağlamak için aktif lisans gerekir."`  
3. Bağlantı kesme lisanssız da çalışır  

---

## 5. Simülasyon ve “Eşitle” dürüstlüğü (Y-03)

- `SHOW_SIMULATION_CONTROLS = process.env.NODE_ENV !== "production"` — üretimde simülasyon düğmeleri render edilmez
- Düğme: **“Bağlı Kanallara Kuyruk Yaz”**
- `syncCatalog` mesajı: **“Güncelleme kuyruğa alındı; periyodik senkronizasyonda işlenecek.”**

---

## 6. Marka dili ve hata sınırları (O-01, O-02)

### Sen aksı
Commerce’deki 6 `siz` kalıbı `sen`e çevrildi. `verify-sen-axis` sözlüğüne `hakkınız`, `yazınız`, `sizin` eklendi; taranan diğer `components/*` kaçakları da hizalandı (Junior hukuki metin istisnası korunur).

### Error boundary
- `app/(kernel)/panel/e-ticaret/error.tsx` → panele dönüş
- `app/(kernel)/magazam/error.tsx` → `/panel/e-ticaret` (mağaza navigasyonu)

---

## 7. Çok varyant ve yenileme IP (O-04, Y-04)

- `os-load` / `ownedProduct` / simülasyon sorgularında `variants: { take: 1 }` kaldırıldı
- Kokpit: `variantCount` gösterimi; onaylı stok tüm varyant toplamıyla
- Onay: inbound ilk ACTIVE (yoksa ilk) varyanta; ardından ürün onaylı stok tüm varyantlardan senkron

### Yenileme (`subscription-renewal.ts`)
- `userIp = process.env.OUTBOUND_PUBLIC_IP?.trim() || "127.0.0.1"`
- Sahip e-postası yoksa çekim **yapılmaz** (`billing@yetkin.ai` yedek kaldırıldı)
- `.env.example` + `lib/kernel/env.ts` → `OUTBOUND_PUBLIC_IP`

---

## 8. Doğrulama kapıları (kanıt)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ 0 hata |
| Sen aksı | `npm run verify:sen-axis` | ✅ 524 dosya, 37 kalıp |
| Sınır | `npm run verify:boundaries` | ✅ |
| API auth | `npm run verify:api-auth -- --check` | ✅ 135 rota |
| RLS | `npm run verify:rls-status` | ✅ |
| Gizli | `npm run verify:no-secrets` | ✅ |
| Test | `npx vitest run tests/commerce tests/tezgah` | ✅ **35 dosya / 233 test** |
| Build | `npx next build` | ✅ `/e-ticaret` + `/panel/e-ticaret` |

### Yeni / güncellenen test yüzeyleri
- `tests/commerce/e-ticaret-vitrine-surface.test.ts`
- `tests/commerce/stock-truth.test.ts`
- `tests/commerce/os-channel-license.test.ts`
- `tests/commerce/subscription-renewal-ip.test.ts`
- `tests/commerce/os-load-variants.test.ts`
- Mevcut SEO / edge-guard / cockpit / tezgah / dashboard yüzey testleri panel yoluna güncellendi

---

## 9. Bilinçli sınırlar (Faz 1 dışı)

Bu faz **bilinçli olarak** şunlara dokunmadı (tespit raporunda Faz 2+):
- Kâr / komisyon / kargo şema katmanı (K-02)
- İki kimlik kasası birleşimi (`sales_channels` ↔ `commerce_marketplace_credentials`)
- `syncCatalog` gerçek HTTP push’u (yalnız dürüst kuyruk dili)
- Tezgâh ↔ Commerce çift yönlü `productId` bağı

---

## 10. Operatör notları

1. Migration’ı üretimde uygula: `npx prisma migrate deploy`
2. Yenileme cron’u için `OUTBOUND_PUBLIC_IP` gerçek çıkış IP’si olmalı
3. Amazon/N11 canlıya alınca: `comingSoon: false` + gerçek adapter + vitrin metni
