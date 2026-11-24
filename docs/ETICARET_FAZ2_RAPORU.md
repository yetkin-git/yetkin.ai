# yetkin.ai — E-Ticaret Faz 2 Raporu

**Tarih:** 22 Kasım 2026  
**Kapsam:** Dört Akıllı Kâr ve Büyüme Motoru (tasarım: `docs/ETICARET_TESPIT_RAPORU.md` §4–§5)  
**Durum:** Kodlandı, test edildi, doğrulama kapıları yeşil.

---

## 0. Yönetici özeti

Faz 2, stok defterine dokunmadan ayrı bir **ekonomi katmanı** kurar ve dört motoru uçtan uca bağlar:

| Motor | İş | Sayı kaynağı | AI rolü |
|---|---|---|---|
| **3 — Kampanya simülatörü** | İndirim → net / başabaş / SAFE\|THIN\|LOSS | `lib/commerce/profit.ts` | Başlık + gövde (mühürlü) |
| **1 — Barem kırıcı paket** | 2'li/3'lü set, kargo tasarrufu | `evaluateBundleOpportunity` | Kabul sonrası satış metni |
| **4 — Günlük kâr özeti** | Zarar SKU, kritik stok, tek tık aksiyon | Brief tarama + `profit.ts` | Yok (özet cümlesi kodda) |
| **2 — Fırsat radarı** | Kategori × fiyat bandı boşluğu | `radar-signals.ts` | Yok (dürüst "veri yok") |

**Mimari mühürler korundu:** `stock_ledgers`'a ciro yazılmaz; tüm yeni tablolar `RLS_FORCE_TABLES` + `FORCE RLS` + `rls_deny_unscoped`; yazma rotaları `export const auth = "session"` + `Idempotency-Key` + `findStoreForOwner` / `requireOwnedStore`; `AI_TOKEN_SOURCES.COMMERCE` eklendi.

---

## 1. Veritabanı — ekonomi katmanı

### 1.1 Yeni modeller (`prisma/schema/commerce.prisma`)

| Model | `@@map` | Amaç |
|---|---|---|
| `CommerceUnitEconomics` | `commerce_unit_economics` | Varyant COGS (`costMinor`), desi (`desiGrams`), KDV (`vatBps`) |
| `CommerceShippingTariff` | `commerce_shipping_tariffs` | Kargo baremi (gram bandı → `priceMinor`) |
| `CommerceChannelEconomics` | `commerce_channel_economics` | Komisyon / kargo / iade / reklam (kanal başına) |
| `CommerceCampaignSimulation` | `commerce_campaign_simulations` | Kaydedilmiş indirim simülasyonu + verdict |
| `CommerceBundleProposal` | `commerce_bundle_proposals` | 2'li/3'lü paket önerisi |
| `CommerceDailyBrief` | `commerce_daily_briefs` | Günlük özet (`dayKey` Europe/Istanbul) |
| `CommerceProfitAction` | `commerce_profit_actions` | REPRICE / BUNDLE / RESTOCK aksiyonları |
| `CommerceCatalogGapSignal` | `commerce_catalog_gap_signals` | Katalog boşluk sinyali |
| `CommerceProductSuggestion` | `commerce_product_suggestions` | "Ne satılır?" önerisi + `signalIds` |

### 1.2 Migration

`prisma/migrations/20261122230000_faz2_commerce_economics/migration.sql`

- 9 tablo + enum'lar
- Her tablo: `ENABLE` + `FORCE ROW LEVEL SECURITY`
- Idempotent `rls_deny_unscoped` (anon/authenticated SELECT USING false)

### 1.3 RLS sicili

`lib/kernel/security/rls-policy-registry.ts` — 9 yeni tablo alfabetik sırada `RLS_FORCE_TABLES` içinde.

---

## 2. Saf kâr çekirdeği

**Dosya:** `lib/commerce/profit.ts` (DB yok, `server-only` yok)

| Fonksiyon | Çıktı |
|---|---|
| `calculateUnitNet` | gelir, komisyon, COGS, iade, **netMinor**, **marginBps** |
| `simulateCampaign` | soldPrice, net, marj, **breakEvenBps**, **verdict** |
| `breakEvenDiscountBps` | Kapalı form başabaş indirimi |
| `evaluateBundleOpportunity` | kargo tasarrufu, net lift, sameBand, rationale |
| `cargoForWeight` / `sameShippingBand` | Barem eşleştirme |

**Kurallar:** tutar = kuruş (tam sayı); oran = bps; float yasak; `THIN_MARGIN_BPS = 1000`; `BREAK_EVEN_NEAR_BPS = 500`.

**AI mühürü:** `lib/commerce/profit-text.ts` — `textStaysOnNumbers` / `scrubInventedNumbers`; uydurma rakam → metin reddedilir.

---

## 3. API rotaları

Tümü `export const auth = "session"`. Yazmalar `Idempotency-Key` + sahiplik.

| Metot | Yol | Motor |
|---|---|---|
| POST | `/api/commerce/stores/[storeId]/economics` | Maliyet / tarife / kanal |
| POST | `.../campaigns/simulate` | Anlık simülasyon (DB yazmaz) |
| POST | `.../campaigns` | Kaydet + AI metin |
| GET | `.../campaigns` | Liste |
| POST | `.../bundles/propose` | Deterministik tarama |
| GET | `.../bundles` | Öneriler |
| POST | `.../bundles/[id]/accept` | Set ürün doğur |
| DELETE | `.../bundles/[id]` | Reddet |
| GET | `.../briefs/today` | Bugünün özeti (yoksa üret) |
| POST | `.../actions/[id]/apply` | Tek tıkla uygula |
| POST | `.../radar/scan` | Boşluk taraması |
| GET | `.../radar` | Sinyal + öneri |

**Kayıtlar:** `web-only-write-routes.ts` + `route-auth-map.ts` (146 rota, session:85).

**Servis katmanı:**

- `lib/commerce/economics-service.ts`
- `lib/commerce/campaign-engine.ts`
- `lib/commerce/bundle-engine.ts`
- `lib/commerce/daily-brief.ts`
- `lib/commerce/opportunity-radar.ts` + `radar-signals.ts`
- `lib/commerce/profit-handlers.ts` / `profit-live.ts`

---

## 4. Cron

`lib/kernel/jobs/inngest.ts`:

```
id: commerce-daily-brief
cron: TZ=Europe/Istanbul 0 7 * * *
→ runCommerceDailyBriefScan()
```

Aktif mağazalar için bugünün brief'ini üretir (varsa atlar).

---

## 5. UI

### Kokpit (`components/commerce/os-cockpit.tsx` + `profit-engines-panel.tsx`)

Sekme adı: **Kâr & Büyüme**. Panel:

1. Maliyet / desi / komisyon / barem formu  
2. İndirim kaydırıcısı + başabaş + zarar uyarısı  
3. Barem kırıcı paketler + "Tek tıkla set ürün oluştur"  
4. Günlük özet aksiyonları + fırsat radarı → `/tezgah?tool=ecommerce&seed=...`

### Kamu vitrin (`app/(public)/e-ticaret/page.tsx`)

"Henüz canlı değil" kaldırıldı. Dört motor **Canlı** rozetiyle sunuluyor.

---

## 6. AI ve sayı yasağı

- `AI_TOKEN_SOURCES.COMMERCE = "commerce"` (`lib/kernel/ai/sources.ts`)
- Gelen kutu yanıt taslağı `SUPPORT` → `COMMERCE` (`os-service.ts`)
- Kampanya / paket metni: prompt'taki sayılar koddan; çıktı `scrubInventedNumbers` ile mühürlenir
- Radar ve brief: LLM sayı üretmez; yetersiz veride dürüst mesaj:
  > *"Analiz için en az 3 aktif ürün ve maliyet verisi gerekir."*

---

## 7. Testler

| Dosya | Kapsam |
|---|---|
| `tests/commerce/profit-math.test.ts` | Birim net, kampanya, başabaş, paket/barem, AI mühür, radar sinyal |
| `tests/commerce/daily-brief-radar.test.ts` | dayKey, LOSS formülü, radar dürüstlük |
| `tests/commerce/faz2-profit-engines-surface.test.ts` | Şema, migration RLS, auth, COMMERCE, cron, UI |
| Mevcut commerce + tezgah suite | Regresyon |

**Sonuç:** `npx vitest run tests/commerce tests/tezgah` → **38 dosya / 256 test** geçti.

---

## 8. Doğrulama kapıları (kanıt)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ 0 hata |
| Sen aksı | `npm run verify:sen-axis` | ✅ 536 dosya |
| Sınır | `npm run verify:boundaries` | ✅ |
| API auth | `npm run verify:api-auth -- --check` | ✅ 146 rota (session:85) |
| RLS | `npm run verify:rls-status` | ✅ 9 yeni tablo dahil |
| Sırlar | `npm run verify:no-secrets` | ✅ |
| Test | `npx vitest run tests/commerce tests/tezgah` | ✅ 256 test |
| Build | `npx next build` | ✅ |

---

## 9. Operasyon notları

1. **Migration uygulaması:** üretim/staging'de `prisma migrate deploy` (veya ekip standardı) ile `20261122230000_faz2_commerce_economics` uygulanmalı.
2. **Satıcı onboarding:** motorlar maliyet + barem olmadan anlamlı sonuç vermez; kokpit formu bunu zorunlu kılar.
3. **Para yazılmaz:** REPRICE yalnız `commerce_variants.amount_minor` günceller; cüzdan / ledger / stock_ledgers'a dokunulmaz.
4. **Paket accept:** `CommerceProduct` + varyant **DRAFT** doğar; stok onayı mevcut havuz akışındadır.

---

## 10. Dosya envanteri (yeni / değişen ana hat)

```
prisma/schema/commerce.prisma
prisma/migrations/20261122230000_faz2_commerce_economics/migration.sql
lib/kernel/security/rls-policy-registry.ts
lib/kernel/ai/sources.ts
lib/kernel/jobs/inngest.ts
lib/kernel/http/web-only-write-routes.ts
lib/kernel/security/route-auth-map.ts
lib/commerce/profit.ts
lib/commerce/profit-text.ts
lib/commerce/profit-handlers.ts
lib/commerce/profit-live.ts
lib/commerce/economics-defaults.ts
lib/commerce/economics-service.ts
lib/commerce/campaign-engine.ts
lib/commerce/bundle-engine.ts
lib/commerce/daily-brief.ts
lib/commerce/day-key.ts
lib/commerce/opportunity-radar.ts
lib/commerce/radar-signals.ts
lib/commerce/os-service.ts                    # COMMERCE kaynağı
app/api/commerce/stores/[storeId]/economics/
app/api/commerce/stores/[storeId]/campaigns/
app/api/commerce/stores/[storeId]/campaigns/simulate/
app/api/commerce/stores/[storeId]/bundles/
app/api/commerce/stores/[storeId]/bundles/propose/
app/api/commerce/stores/[storeId]/bundles/[id]/
app/api/commerce/stores/[storeId]/bundles/[id]/accept/
app/api/commerce/stores/[storeId]/briefs/today/
app/api/commerce/stores/[storeId]/actions/[id]/apply/
app/api/commerce/stores/[storeId]/radar/
app/api/commerce/stores/[storeId]/radar/scan/
components/commerce/profit-engines-panel.tsx
components/commerce/os-cockpit.tsx
app/(public)/e-ticaret/page.tsx
tests/commerce/profit-math.test.ts
tests/commerce/daily-brief-radar.test.ts
tests/commerce/faz2-profit-engines-surface.test.ts
docs/ETICARET_FAZ2_RAPORU.md
```

---

*Bu rapor Faz 2 kodlamasının kanıtıdır. Stok defteri muhasebe disiplini korunmuş; kâr beyni ayrı ekonomi katmanında yaşamaktadır.*
