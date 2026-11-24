# yetkin.ai — YetkinHibe (`/hibe`) Modülü Derinlemesine Tespit Raporu

**Denetim tarihi:** 23 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / Türkiye Hibe & Teşvik Ürün Mimarı (KOSGEB, TÜBİTAK, Ticaret Bakanlığı İhracat Destekleri, Kalkınma Ajansları, TKDK/IPARD)
**Kapsam:** `app/(kernel)/hibe/**`, `app/api/yetkinhibe/**`, `app/api/tezgah/grant/**`, `components/hibe/**` (4 dosya / 1.019 satır), `lib/yetkinhibe/**` (28 dosya / ~3.406 satır), `lib/tezgah/grant/**` (12 dosya / 1.467 satır), `prisma/schema/yetkinhibe.prisma`, 2 migration, `tests/yetkinhibe-core/**` (19 dosya / ~2.132 satır) + `tests/tezgah/grant-*`
**Kural:** **Hiçbir kaynak kodu değiştirilmedi, silinmedi, düzenlenmedi.** Yalnız bu rapor üretildi.
**Yöntem:** Statik okuma → rota envanteri → şema→kod iz sürme → veri tazeliği hesabı → doğrulama kapıları → iddia/kanıt eşleştirmesi.

---

## 0. Yürütülen Doğrulama Kapıları (kanıt)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip denetimi | `npx tsc --noEmit` | ✅ 0 hata (exit 0) |
| Hibe çekirdeği + Tezgâh hibe testleri | `npx vitest run tests/yetkinhibe-core tests/tezgah/grant-*` | ✅ **20 dosya / 178 test** geçti |
| API ↔ auth haritası | `npx tsx scripts/verify-api-auth.ts --check` | ✅ 156 rota (`session:95, public:27, closed:11, cron:2, admin:13, webhook:8`) |
| Sınır mührü | `npx tsx scripts/verify-boundaries.ts` | ✅ kernel↛dikey, UI↛prisma, oda↛oda engine |
| RLS sicili | `npx tsx scripts/verify-rls-status.ts` | ✅ `yetkinhibe_grant_calls`, `yetkinhibe_grant_sources` FORCE RLS + kapsamsız deny |
| Dil aksı | `npx tsx scripts/verify-sen-axis.ts` | ✅ 549 dosya tarandı, `siz` kaçağı yok |

> **Kritik gözlem (kapı kapsamı):** Altı kapı da yeşil. Buna karşın **katalogda bugün açık tek çağrı var ve 3 gün sonra kapanıyor**; **katalogu yazacak tek bir kod yolu yok**; **kamuya açık uygunluk widget'ı fikirden bağımsız olarak sabit bir skor üretiyor**; **ödeme hunisinde cüzdan adımına giden tek bir bağlantı yok**. Bu dördü de yeşil kapılardan geçiyor — çünkü kapılar "ürün doğru çalışıyor mu" değil, "mühür bozulmamış mı" sorusunu soruyor.

---

## 1. Yönetici Özeti ve Mevcut Puan Kartı

### 1.1 Skor: **46 / 100**

YetkinHibe'nin **mühendislik çekirdeği**, Türkiye'deki hibe danışmanlığı pazarında nadir görülen bir dürüstlük disiplinine sahip: fail-closed katalog (bozuk satır → 503, uydurma yok), tam sayı kuruş mühürü (`AmountMinor` + `BIGINT` havuz), `FORCE ROW LEVEL SECURITY` + `rls_deny_unscoped`, LLM'e tutar/oran yazdırmayan iki katmanlı regex kalkanı, `Idempotency-Key` + `PaidCommandReservation` + append-only defter ile tahsil edilen tam dosya, ve 178 testin tamamı yeşil. Bu katman **üretim kalitesinde**.

Buna karşın modül **ürün olarak bir "hibe bulucu" değil, bir "katalog görüntüleyici"**. Ve daha ağırı: modülün ticari değerinin tamamı **katalog tazeliğine** bağlı — katalogu besleyen hiçbir mekanizma koda yazılmamış.

| Eksen | Ağırlık | Puan | Gerekçe (tek cümle) |
|---|---:|---:|---|
| **Mimari Hazırlık** | %25 | **58** | Saf çekirdek + fail-closed katalog + RLS + para mühürü örnek niteliğinde; ancak **katalog yazma yolu yok**, uygulama/firma kalıcılığı yok, 5 modül ölü kod, 3 ayrı puanlama motoru ve kernel dikeyin tablosunu doğrudan okuyor. |
| **Mevcut İşlevsellik** | %30 | **47** | Deterministik eşleştirme + LLM anlatı + bütçe/Gantt + DOCX + yazdır/PDF + ücretli dosya gerçekten çalışıyor; ama **9 çağrının 8'i kapalı, 1'i 3 gün ömrüllü**, TKDK/IPARD hiç yok, kamu widget'ı sabit skor, arşiv yeniden açılamıyor. |
| **Ticari Farklılaşma** | %25 | **38** | B2B outbound + `GRANT_CALL` radar sinyali + haftalık radar + 90 günlük master plan gerçek ayrıştırıcı; ama **başvuru sonrası izleme yok** (asıl para burada), ajans/çoklu müşteri modu ölü kod, başarı primi modeli yok. |
| **UX / Vitrin** | %20 | **42** | Dürüstlük uyarıları her ekranda; ama `/hibe` oturum duvarı arkasında, profil URL query'sinde yaşıyor, fiyat görünüyor **satın alma düğmesi yok**, 402 hatasında cüzdan bağlantısı yok, `sen`/`siz` aksı karışık. |

**Ağırlıklı hesap:** `58×0,25 + 47×0,30 + 38×0,25 + 42×0,20 = 14,5 + 14,1 + 9,5 + 8,4 = 46,5`

### 1.2 Tek cümlelik teşhis

> **Bu modül, başvuruyu doğru kurallarla eşleştiren dürüst bir katalog memuru; KOBİ'nin hibeyi kazanmasını ve sonrasını yöneten bir teşvik ortağı değil.**

### 1.3 En kritik 5 bulgu

| # | Önem | Bulgu | Ticari etki |
|---|---|---|---|
| 1 | `[KRİTİK]` | **Katalog ölü.** 9 çağrının 8'i kapalı, tek açık çağrı `tubitak-1507-2026-2` ve **25 Kasım 2026'da kapanıyor**. Katalogu eklemek/güncellemek için **tek yol migration** — admin rotası, ops script'i, Inngest job'u yok. | 26 Kasım'dan itibaren **tüm eşleştirme ekranları boş** döner; ürün "çalışmıyor" görünür. |
| 2 | `[KRİTİK]` | **Kamuya açık uygunluk widget'ı fikirden bağımsız sabit skor üretiyor.** Tek açık çağrının kısıtları profilde "sınırsız"a düştüğü için taban skor **100**, üst sınır **98**; fikir metni yalnız ±birkaç puan anahtar kelime ekliyor. Kafe açacağım diyen ziyaretçi de TÜBİTAK 1507 Ar-Ge'de %98 alır. | Vitrinde **ölçülemez iddia**; güven kaybı ve yanlış yönlendirme. |
| 3 | `[KRİTİK]` | **Ödeme hunisi kopuk.** Fiyat (`1.490 TL`) ekranda; `/hibe` içinde **cüzdan yükleme veya satın alma bağlantısı yok**; `POST /api/tezgah/grant/dossier` bakiyeyi **LLM'den sonra** kontrol ediyor. | Kullanıcı 402 görür ve **çıkmaz sokağa** girer; gelir kapısı fiilen kapalı. |
| 4 | `[YÜKSEK]` | **Üç ayrı "uyum" tanımı** aynı kullanıcıya farklı yüzdeler gösteriyor: ağırlıklı profil skoru (`match-grants-for-profile`), kriter AND-kapısı (`grant-program-fit` → `fitPct`), ve önizleme skoru (keyword boost + sabit profil). | Danışman karşısında **savunulamaz sayı**; "%98 uyum" ile "uygun değil" aynı üründe. |
| 5 | `[YÜKSEK]` | **Başvuru sonrası hayat yok.** Canlı şemada `HibeApplication` tablosu yok; `grant-lifecycle.ts` (faz, evrak, gecikme uyarısı) **sıfır canlı tüketiciyle** duruyor — yalnız testte. | Danışmanlık firmalarının asıl ücret aldığı yer (ara rapor, SGK faturası, denetim, hakediş) **tamamen boş**. |

### 1.4 Olgunluk tablosu

| Katman | Durum | Kanıt |
|---|---|---|
| Katalog doğrulama (fail-closed) | 🟢 Üretim kalitesi | `grant-catalog-core.ts:112-159`, `grant-catalog-live.ts:26-56` |
| Para mühürü (kuruş, BIGINT havuz, CHECK) | 🟢 Üretim kalitesi | `yetkinhibe.prisma:23-30`, migration `20261109120000:40-49` |
| RLS (ENABLE + FORCE + kapsamsız deny) | 🟢 Üretim kalitesi | migration `:128-137`, `rls-policy-registry.ts:112-113` |
| Deterministik eşleştirme (AND kapısı) | 🟢 Çalışır | `match-grant-programs-for-brief.ts:124-304` |
| LLM halüsinasyon kalkanı | 🟡 Çalışır ama delikli | `narrative.ts:10-12,68-70` |
| Bütçe/Gantt şablon motoru | 🟢 Çalışır | `details.ts:42-58,138-191` |
| DOCX üretimi | 🟡 Düz metin (tablo/stil yok) | `docx.ts:13-22`, `master-plan.ts:555-573` |
| Ücretli dosya (idempotent + defter) | 🟢 Çalışır | `paid-dossier.ts:53-168` |
| Katalog yazma / radar besleme | 🔴 **Yok** | tüm `prisma.yetkinhibeGrantCall.*` yazma çağrısı: **0** |
| Başvuru/şirket kalıcılığı | 🔴 **Yok** | canlı şemada `HibeCompanyProfile`, `HibeApplication` yok |
| Başvuru sonrası yaşam döngüsü | 🔴 Ölü kod | `grant-lifecycle.ts` tüketici: 0 |
| Kamu vitrini + SEO | 🔴 Yok | `/hibe` ∈ `PROTECTED_KERNEL_PATHS`, sitemap'te yok |
| Ödeme/satın alma yolu | 🔴 Kopuk | `checkout.ts:34,51-52` yalnız `pro` \| `credit-pack` |

---

## 2. Envanter Haritası

### 2.1 Sayfalar

| Yol | Dosya | Durum | Not |
|---|---|---|---|
| `/hibe` | `app/(kernel)/hibe/page.tsx` | **Tek sayfa, 4 sekme** | `requirePageSession()` (`:12`); profil `searchParams`'ta yaşıyor (`:17-30`); `loadHibeCockpit` (`:32`) |
| `/hibe?sekme=analiz` | `components/hibe/os-cockpit.tsx:146-292` | GET form | 10 alan; `hesap=1` gizli alan |
| `/hibe?sekme=programlar` | `os-cockpit.tsx:295-331` | Liste | Katalog kartları |
| `/hibe?sekme=proje` | `components/hibe/project-desk.tsx` | İstemci formu | Taslak + tam dosya |
| `/hibe?sekme=arsiv` | `os-cockpit.tsx:345-366` | Liste | Kart **yeniden açılamıyor** (bkz. B-07) |
| `/yetkinhibe/olustur` | **YOK** | — | `wizard-navigation.ts:8` bu yolu üretiyor; dizin diskte **mevcut değil** (bkz. B-11) |
| `archived/app/hibe/**` | Arşiv | 410 | Canlı değil; referans olarak okunmadı |

### 2.2 API Rotaları (5)

| Rota | Dosya | `auth` | Idempotency | Rate limit | Gerçek iş |
|---|---|---|---|---|---|
| `POST /api/yetkinhibe/grant/match` | `app/api/yetkinhibe/grant/match/route.ts` | `session` (`:27`) | — (yazmıyor) | `yetkinhibeMatchUser` 30/10dk (`:36-41`) | Ağırlıklı profil skoru; **hiçbir UI çağırmıyor** |
| `GET /api/yetkinhibe/grant/catalog` | `.../catalog/route.ts` | `public` (`:11`) | — | ❌ **yok** | Tüm kataloğu anonim döner; **hiçbir UI çağırmıyor** |
| `POST /api/tezgah/grant/match` | `app/api/tezgah/grant/match/route.ts` | `public` (`:21`) | — | `llmIp` (`:34`) | Kamu ön uygunluk widget'ı |
| `POST /api/tezgah/grant/generate` | `app/api/tezgah/grant/generate/route.ts` | `public` (`:20`) | **opsiyonel** (`command-key.ts:8-10` null kabul) | `tezgahGenerateUser` | Günlük hakla taslak + (details varsa) tam dosya |
| `POST /api/tezgah/grant/dossier` | `app/api/tezgah/grant/dossier/route.ts` | `session` (`:13`) | **zorunlu** (`:21`) | — | Cüzdandan **1.490 TL** düşerek tam dosya |

### 2.3 Servisler (`lib/yetkinhibe` 28 dosya)

| Grup | Dosyalar | Canlı tüketici |
|---|---|---|
| **Katalog** | `grant-catalog-core.ts`, `grant-catalog-live.ts`, `format-amount.ts`, `types.ts` | ✅ os-load, engine, commerce, radar |
| **Eşleştirme** | `match-grant-programs-for-brief.ts`, `program-fit.ts`, `match-grants-for-profile.ts`, `grant-match-api.ts` | ✅ (AND kapısı) / ⚠️ (ağırlıklı skor yalnız API+preview) |
| **Proje dosyası** | `master-plan.ts`, `grant-investment-skeleton.ts`, `os-brief.ts`, `os-load.ts` | ✅ |
| **Önizleme** | `preview-idea-validator.ts`, `preview-match-score.ts`, `public-eligibility.ts` | ✅ (kamu widget'ı) |
| **Eksenler** | `grant-brief-axes.ts` (81 il, 12 NACE, 4 odak, 4 Ar-Ge düzeyi, 2 kitle) | ✅ |
| **Metin/mühür** | `copy.ts`, `grant-project-notes.ts` | ✅ |
| **Ölü kod** | `grant-lifecycle.ts`, `analyze-grant-eligibility-gap.ts`, `build-preview-gap-from-criteria.ts`, `grant-profile-mode.ts`, `calculate-grant-budget.ts`, `idea-detail.ts`* | ❌ **0 canlı tüketici** (yalnız test) |
| **Yardımcı** | `grant-fail-closed.ts`, `wizard-navigation.ts`, `home-offer-state.ts`, `b2b-sector-match.ts` | ⚠️ kısmi (b2b ✅, fail-closed ❌, `wizard-navigation` yolu 404) |

\* `idea-detail.ts` yalnız `smart-textarea` içinde dolaylı kullanılıyor.

`lib/tezgah/grant` (12 dosya): `engine.ts` (409 satır — LLM + kota + eşleştirme kompozisyonu), `paid-dossier.ts`, `details.ts`, `draft.ts`, `narrative.ts`, `prompts.ts`, `render.ts`, `docx.ts`, `payload.ts`, `schema.ts`, `types.ts`, `details-input.ts`.

### 2.4 Tablolar (2 — ve olmayanlar)

| Tablo | Kolon sayısı | RLS | Yazma |
|---|---:|---|---|
| `yetkinhibe_grant_sources` | 5 | ✅ ENABLE + FORCE + deny | Yalnız Prisma (BYPASSRLS) |
| `yetkinhibe_grant_calls` | 19 | ✅ ENABLE + FORCE + deny | Yalnız Prisma (BYPASSRLS) |

**Olmayan tablolar (ve maliyeti):** `HibeCompanyProfile` (profil kalıcı değil → her analiz URL'e bağlı), `HibeApplication` (başvuru takibi yok), `HibeDossier` (tam dosya yeniden açılamıyor — yalnız `tezgah_outputs.output_content` metni), `HibeGrantCallRevision` (katalog değişiklik denetimi yok), `HibeNotificationPreference` (radar tercihi yok).

### 2.5 Testler

| Dosya | Test | Kapsam |
|---|---:|---|
| `grant-catalog-core.test.ts` | 19 | Satır doğrulama, durum hesabı, fail-closed |
| `grant-catalog-nov2026.test.ts` | 7 | Kasım ekleri, kapanmış/açık ayrımı, tutar sızmaması |
| `grant-match-api.test.ts` | 29 | İstek sözleşmesi, gövde sınırı, alan reddi |
| `grant-match-route.test.ts` | 14 | 400/413/503/500, oturum |
| `match-grants-for-profile.test.ts` | 16 | Ağırlık, bant, sıralama |
| `match-grant-programs-for-brief.test.ts` | 5 | AND kapısı, withheld notları |
| `master-plan.test.ts` | 10 | Puan, kapatılabilir eksik, DOCX |
| `grant-lifecycle.test.ts` | 5 | ⚠️ **ölü modülü test ediyor** |
| `analyze-grant-eligibility-gap.test.ts` | 10 | ⚠️ ölü modül |
| `calculate-grant-budget.test.ts` | 5 | ⚠️ ölü modül |
| `preview-idea-validator.test.ts` | 8 | Widget skoru (testler sabit 98'i **doğruluyor**) |
| `grant-fail-closed.test.ts` | 4 | ⚠️ ölü modül |
| `pure-core-imports.test.ts` | 14 | 14 saf dosyanın import sınırı |
| `room-registry.test.ts` | 3 | Oda sicili |
| `wizard-navigation.test.ts` | 7 | ⚠️ var olmayan yolu test ediyor |
| `format-amount`, `idea-detail` | 6 | Yardımcı |
| `tests/tezgah/grant-engine.test.ts` | 8 | Kota iadesi, tutar sızmaması, dossier |
| `tests/tezgah/grant-dossier.test.ts` | 3 | Bütçe toplamı, ekip satırı |

> **Test kusuru:** 178 testin **~30'u** canlı yüzeyi olmayan modülleri doğruluyor. Yeşil test sayısı, ürün hazırlığını **olduğundan yüksek** gösteriyor.

---

## 3. Derinlemesine Bulgular

### 3.1 `[KRİTİK]` — Katalog yazma yolu yok; katalog 3 gün sonra tamamen kapanıyor

**Kanıt — yazma yolu yok:**
```
$ rg "yetkinhibeGrantCall\.(create|update|upsert|delete|createMany|updateMany)"  → 0 sonuç
$ rg -l "yetkinhibeGrantCall"  → 3 dosya: grant-catalog-live.ts (findMany),
   market-demand/platform-demand-port.ts (findMany), jobs/weekly-radar.ts (findMany)
```
Katalogun tek besleme kanalı **migration SQL'i**: `prisma/migrations/20261109120000_yetkinhibe_grant_catalog_v2/migration.sql:63-124` (5 çağrı) ve `20261115120000_yetkinhibe_grant_calls_2026_11/migration.sql:12-70` (4 çağrı, `ON CONFLICT DO NOTHING`).

**Kanıt — tazelik:**
```5:10:lib/yetkinhibe/grant-catalog-live.ts
  const rows = await getPrisma()
    .yetkinhibeGrantCall.findMany({
      where: { isPublished: true },
```
Filtre yalnız `isPublished`; **süresi geçmiş satır filtrelenmiyor**, durum okuma anında hesaplanıyor (`grant-catalog-core.ts:95-105`) — bu doğru tasarım. Ama satırların **ömrü** bitiyor:

| Çağrı | Son başvuru (TR) | 23 Kasım 2026 durumu |
|---|---|---|
| `kosgeb-is-gelistirme-2026-3` | 31 Ekim 2026 | CLOSED |
| `kosgeb-kapasite-gelistirme-2026-3` | 15 Eylül 2026 | CLOSED |
| `tubitak-1501-2026-2` | 26 Ekim 2026 | CLOSED |
| **`tubitak-1507-2026-2`** | **25 Kasım 2026** | **CLOSING_SOON (3 gün)** |
| `kosgeb-arge-inovasyon-2026` | 30 Eylül 2026 | CLOSED |
| `tubitak-1501-sanayi-arge` | 15 Ağustos 2026 | CLOSED |
| `ticaret-bakanligi-turquality-2026` | 31 Ekim 2026 | CLOSED |
| `kalkinma-ajansi-mali-destek-2026` | 1 Ağustos 2026 | CLOSED |
| `kosgeb-kobigel-2026` | 31 Ağustos 2026 | CLOSED |

**Etki:** 26 Kasım 2026'da `matchGrantProgramsForBrief` hiçbir satırı `eligible`'a almaz (`match-grant-programs-for-brief.ts:269-302`), `os-load.ts:297-320` `analysis` listesini "kapalı" notlarıyla doldurur, kamu widget'ı `"Bu fikir için katalogda açık çağrı eşleşmedi."` döner (`public-eligibility.ts:29-35`), haftalık radar `"Bu hafta doğrulanmış açık hibe çağrısı yok."` yazar (`weekly-radar.ts:63-65`). **Ürün dört yüzeyde birden "boş" görünür.**

**Kök neden:** `dataVersion` kolonu (`yetkinhibe.prisma:39`) ve `sourceVerifiedAt` alanı var ama **hiçbir yazma akışı yok** — şema, olmayan bir operasyonu bekliyor.

**Düzeltme:** Faz 1 / Adım 1 — Super Admin katalog rotası + `ops:grant-call` script'i + `GrantCallRevision` append-only tablosu; ekleme/güncelleme **deploy gerektirmemeli**.

---

### 3.2 `[KRİTİK]` — Kamu uygunluk widget'ı fikirden bağımsız sabit skor üretiyor

**Kanıt — skor zinciri:**
```14:27:lib/yetkinhibe/preview-match-score.ts
export const DEFAULT_PREVIEW_GRANT_PROFILE: CompanyGrantProfile = {
  companyId: PREVIEW_GRANT_COMPANY_ID,
  sectorCode: "uretim",
  employeeCount: 25,
  companyAgeYears: 3,
  annualRevenueMinor: toAmountMinor(5_000_000 * 100),
  rdMaturityLevel: "EARLY",
  exportActive: false,
  isKobi: true,
  hasPatentOrUtilityModel: false,
  region: "TR",
};
```
`tubitak-1507-2026-2` kısıtları yalnız `requiresRdActivity: true` + `audiences` + `investmentFocus` + `nacePrefixes: null`. Ağırlıklı motorda `requiresRdActivity` dışındaki her kriter "kısıtsız → geçti" sayılıyor (`match-grants-for-profile.ts:43-107`), `EARLY ≠ NONE` olduğu için Ar-Ge de geçiyor → **taban skor 100**.

```125:138:lib/yetkinhibe/preview-idea-validator.ts
function scoreForCall(call, normalizedIdea, previewScores): number {
  const baseScore = previewScores[call.id] ?? 0;
  const boost = keywordBoostForGrant(normalizedIdea, call.id);
  const lengthBonus = normalizedIdea.length >= 40 ? 4 : normalizedIdea.length >= 20 ? 2 : 0;
  return Math.min(baseScore + boost + lengthBonus, 98);
}
```
Taban 100 olduğu için üst sınır **her zaman 98**. Fikir metni yalnız `keywordBoost` (+0…24) ve `lengthBonus` (+0/2/4) katkısı veriyor; **98 tavanına çarptığı için katkı görünmüyor**.

**Test bunu doğruluyor:** `tests/yetkinhibe-core/preview-idea-validator.test.ts:82-92`
```
// Taban 80 + eşleşme yok + uzunluk (2) = 82.
expect(validatePreviewIdea("genel bir plan metni hazirlandi", [kobigel])?.matchScorePct).toBe(82);
```
Bu testte taban 80 çünkü fixture'da ihracat şartı var. Gerçek 1507 verisinde taban 100 → tavan 98.

**Sektör/il kapı değil, metin:** `public-eligibility.ts:24-27`
```24:27:lib/yetkinhibe/public-eligibility.ts
  const text = [input.idea.trim(), grantNaceLabel(input.sectorCode), grantProvinceLabel(input.provinceCode)]
    .filter(...)
    .join(" ");
  const preview = validatePreviewIdea(text, input.calls);
```
`provinceCode`/`sectorCode` **uygunluk filtresi olarak kullanılmıyor**; yalnız anahtar kelime metnine ekleniyor. NACE 47 (perakende) + İstanbul seçen "kafe açacağım" fikri, NACE kısıtı olmayan **Ar-Ge** çağrısında %98 alır.

**Ek kanıt — tutar iddiası:** `estimateSupportMinor` = `maxSupport × (0,45 + skor×0,55)` (`preview-idea-validator.ts:135-141`). 1507 için `2.625.000 TL × 0,989 ≈ 2.596.125 TL` → **"₺2.596.125 TL'ye kadar"**. Bu **uydurulmuş bir destek tutarıdır** — katalogda `maxSupportMinor = 262.500.000` (2.625.000 TL) tavanı var, ama kullanıcının alacağı tutar hakkında hiçbir veri yok. Üstelik çarpan (0,45/0,55) **hiçbir mevzuata dayanmıyor**.

**Çelişki:** Widget metni "Skor katalogdaki açık çağrılardan hesaplanır" diyor (`grant-eligibility-widget.tsx:93`); pratikte sabit profil + anahtar kelime.

**Düzeltme:** Widget `matchGrantProgramsForBrief` AND kapısını kullansın; sektör/il **kısıt olarak** uygulansın; tutar iddiası kaldırılsın veya "Katalog tavanı: ₺2.625.000" olarak dürüstçe basılsın.

---

### 3.3 `[KRİTİK]` — Ödeme hunisi kopuk: fiyat görünüyor, satın alma yolu yok, bakiye LLM'den sonra kontrol ediliyor

**Kanıt — fiyat var, buton yok:**
```103:118:components/hibe/os-cockpit.tsx
          <div>
            <p ...>Tam Proje Dosyası</p>
            <p className="mt-1 text-sm leading-6">
              {price.priceLabel ? <strong>{price.priceLabel}</strong> : "Katalog satırı açık değil. Tutar uydurulmaz."}
              {price.proActive ? " ... Tam dosya yine katalog tutarıyla tahsil edilir." : ""}
```
Bölümde `<a>`/`<Link>`/`<Button>` **yok**. `components/hibe` içinde `href="/cuzdan"` **0 sonuç**; `workbench.tsx`'te `cuzdan` **0 sonuç**.

**Kanıt — bakiye kontrolü LLM'den sonra:**
```137:160:lib/tezgah/grant/paid-dossier.ts
  const generated = await generateGrantProject({          // ← LLM burada çalışır
    actorId: input.userId, guest: false, request: input.request, quotaMode: "prepaid",
  });
  if (!generated.ok) { ... }
  const markdown = renderGrantProjectText(report);
  try {
    await appendLedgerEntry(createPrismaLedgerStore(), {   // ← bakiye burada kontrol edilir
      ...
    });
  } catch (error) {
    if (isInsufficientBalanceError(message)) {
      return { ok: false, error: "Cüzdan bakiyesi bu dosya için yetmiyor.", status: 402 };
```
Bakiye okuması (`wallet.amountMinor >= amount`) **hiç yapılmıyor**. Sonuç: bakiye yetersizse **token yakılır, dosya üretilir, sonra 402 döner**.

**Kanıt — rezervasyon sızıntısı:** 402 sonrası `paidCommandReservation.status` `RESERVED` kalır (`:74-88` yazıyor, `:161-168` yalnız başarıda `SETTLED` yapıyor). Aynı `Idempotency-Key` ile tekrar denemede `classifyExistingPaidCommand` `"retry"` döner (`lib/kernel/ai/paid-command.ts:195`) → **LLM yeniden çalışır, yeniden ücret denenir**. `RESERVED` satırları için TTL/süpürücü yok.

**Kanıt — cüzdan adımı zorunlu, satın alma yolu yok:**
```34:52:lib/tezgah/checkout.ts
export type TezgahCheckoutKind = "pro" | "credit-pack";
function unitFor(kind: TezgahCheckoutKind): string {
  return kind === "pro" ? TEZGAH_PRO_UNIT : TEZGAH_CREDIT_UNIT;
```
`grant-dossier` için **doğrudan PayTR checkout yok**. Kullanıcı önce `/cuzdan`'a gidip bakiye yüklemeli (`wallet/top-up`, min ₺10 – max ₺20.000, `wallet-top-up.ts:4-5`), sonra dosyayı üretmeli. Hibe ekranı bu iki adımı **hiç anlatmıyor**.

`PAYMENT_ORDER_PURPOSE` enum'unda da `GRANT_DOSSIER` yok (`lib/kernel/payments/order-purpose.ts:4-9`) — grant dosyası **hiçbir zaman kendi ödeme emrini** oluşturmuyor; yalnız cüzdan yüklemesi oluyor ve defterden düşülüyor.

**Etki:** Ürünün tek gelir kalemi (`1.490 TL`) pratikte **satın alınamıyor**. Fiyat kartta, para akışında yok.

---

### 3.4 `[YÜKSEK]` — Üç ayrı "uyum" tanımı; aynı kullanıcıya üç farklı yüzde

| Motor | Dosya | Tanım | Yüzey |
|---|---|---|---|
| **A. Ağırlıklı profil skoru** | `match-grants-for-profile.ts:26-34` | 7 kriter ağırlıklı (sektör 15, çalışan 15, yaş 10, Ar-Ge 25, ihracat 20, KOBİ 10, patent 5). **Bölge, kitle, NACE öneki, yatırım odağı yok.** | `POST /api/yetkinhibe/grant/match`, önizleme tabanı |
| **B. Kriter AND kapısı** | `match-grant-programs-for-brief.ts:124-217` | 11 kriter; **hepsi geçmeli**. Bölge/kitle/NACE/odak dahil. | `/hibe?sekme=analiz` `fitPct`, proje dosyası, e-ticaret kokpiti |
| **C. Önizleme skoru** | `preview-idea-validator.ts:122-137` | B tabanı + anahtar kelime + uzunluk, 98 tavan | Ana sayfa widget'ı |

**Somut tutarsızlık:** `GrantMatchProfile` alanları `sectorCode | employeeCount | companyAgeYears | rdMaturityLevel | exportActive | isKobi | hasPatentOrUtilityModel` (`types.ts:100-109`) — `region` **kasıtlı olarak dışarıda** ("gelir ve bölge eşleşme kuralında kullanılmadığı için"). Yani A motoru, il kısıtı olan bir Kalkınma Ajansı çağrısına İstanbul'daki kullanıcı için **%100** verebilir. B motoru aynı kullanıcıyı **uygun değil** sayar.

A motoru `auth = "session"` ile **canlı API**: `POST /api/yetkinhibe/grant/match` (`route.ts:27`). Yanıt `criteria[]` ile birlikte `matchScorePct` döner (`grant-match-api.ts:87-101`) — **resmî görünen ama eksik kriterli** bir skor.

**Düzeltme:** Tek motor (B). A motoru ya silinir ya da bölge/kitle/NACE/odak eklenerek B ile **birebir** hizalanır. `band` yalnız B'den türetilir.

---

### 3.5 `[YÜKSEK]` — Kapsam boşluğu: TKDK/IPARD yok, KOSGEB'de açık çağrı yok, ajanslar tek satır

**Kanıt — kaynak listesi:**
```26:34:lib/yetkinhibe/grant-catalog-core.ts
const PROGRAM_SOURCES: readonly GrantProgramSource[] = [
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "RESMI_GAZETE",
  "BOLGESEL_AJANS",
];
```
- **TKDK / IPARD yok.** Tarım ve kırsal kalkınma (IPARD III, ~₺40 milyar program) tamamen kapsam dışı.
- `KALKINMA_AJANSI` ve `BOLGESEL_AJANS` **aynı kurum tipi için iki anahtar** — model kokusu; 26 ajansın hiçbiri ayrı satır değil.
- **Tarım ve Orman Bakanlığı, Sanayi Bakanlığı (KOSGEB dışı), İŞKUR, Kalkınma Bankası, Eximbank, AB Fonları** yok.
- **TÜBİTAK 1512 BiGG, 1812, 2204, 1707** yok — yalnız 1501 ve 1507.
- KOSGEB'de **açık çağrı yok**; İş Geliştirme 2026/3 kapandı, 2026/4 dönemi katalogda **yok**.

**Etki:** Ürün adı "hibe bulucu"; kullanıcı "benim işime uygun hibe yok" diyor. Gerçekte var, üründe yok.

---

### 3.6 `[YÜKSEK]` — Proje dosyası kuruma göre şablonlanmıyor; DOCX tablosuz düz metin

**Kanıt — tek iskelet, üç kurum:**
```42:58:lib/tezgah/grant/details.ts
export function grantDetailWorkPackages(duration: GrantDetailDuration) {
  const windows = WINDOWS[duration];
  return GRANT_SCHEDULE_STEPS.map((step, index) => ({ id: step.id, name: step.name, windowLabel: windows[index] }));
}
```
Dört iş paketi **her kurum için aynı**: Hazırlık / Uygulama / Doğrulama / Teslim (`grant-investment-skeleton.ts:19-24`). Bütçe **üç kalem**: Personel / Makine-Teçhizat / Yazılım-Hizmet (`details-input.ts:8-14`). KOSGEB İş Planı'nın istediği **pazar analizi, SWOT, rekabet, sürdürülebilirlik, istihdam taahhüdü**; TÜBİTAK PRODİS'in istediği **özgün değer, teknoloji düzeyi (TRL), iş paketi–adam-ay matrisi, başarı ölçütleri** — hiçbiri yapısal olarak üretilmiyor.

**Kanıt — DOCX tablosuz:**
```13:22:lib/tezgah/grant/docx.ts
export function buildGrantDossierDocx(markdown: string): Uint8Array {
  const paragraphs = markdown
    .split(/\r?\n/)
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`)
    .join("");
```
Her satır **tek paragraf**. Bütçe tablosu, Gantt, ekip matrisi Word'de **hizasız metin** olarak çıkar. Stil, başlık düzeyi, sayfa numarası, kenar boşluğu yok. `master-plan.ts:555-573` aynı desen.

**Ek:** PDF yalnız `window.print()` (tarayıcı) — `grant-project-report.tsx:281-283`. Sunucu-taraflı PDF yok, Google Docs entegrasyonu yok, Markdown indirme yok (yalnız panoya kopyalama, `:284-286`).

**Etki:** Çıktı "kullanılabilir başvuru dosyası" değil, **taslak metin**. Danışman bunu müşteriye veremez; elle yeniden biçimlendirmek zorunda.

---

### 3.7 `[YÜKSEK]` — Başvuru sonrası yaşam döngüsü ölü kod; canlı şemada başvuru tablosu yok

**Kanıt — model var, tüketici yok:**
```
$ rg -l "grant-lifecycle" app components lib --glob '!lib/yetkinhibe/*'   → 0
$ rg -l "analyze-grant-eligibility-gap" ...                               → 0
$ rg -l "build-preview-gap-from-criteria" ...                             → 0
$ rg -l "grant-profile-mode" ...                                          → 0
$ rg -l "calculate-grant-budget" ...                                      → 0
```
`grant-lifecycle.ts` beş fazı (`APPLICATION_APPROVAL`, `INTERIM_REPORT`, `INVOICE_SGK`, `AUDITOR_VISIT`, `PAYOUT`), evrak durumlarını (`approved/pending/missing/rejected`), gecikme uyarısını (`daysUntilDeadline`) ve `nextCriticalDeadlineIso`'yu **eksiksiz modellemiş** (`:8-66`). Hiçbir sayfa, rota veya job bunu okumuyor.

**Kanıt — şema boşluğu:** `prisma/schema/yetkinhibe.prisma` yalnız iki model içeriyor (`:8`, `:21`). Arşivdeki `archived/prisma/schema/hibe.prisma:47-63` `GrantApplication` modeline sahipti; canlıda **karşılığı yok**.

**Etki:** Kullanıcı hibeyi kazandıktan sonra ürün **bitiyor**. Danışmanlık firmalarının gelirinin büyük kısmı buradadır (ara rapor, SGK bildirimi, hakediş takibi, denetim hazırlığı). Ürün bu katmanı **hiç sunmuyor**.

---

### 3.8 `[YÜKSEK]` — Arşiv yeniden açılamıyor; profil kalıcı değil

**Kanıt — bağlantı kimliksiz:**
```354:363:components/hibe/os-cockpit.tsx
                <p className="text-xs uppercase ...">{row.toolKey === "grant" ? "Proje dosyası" : "Uygunluk analizi"}</p>
                <h3 className="mt-1 font-semibold">{row.title}</h3>
                ...
                <pre ...>{row.preview}</pre>
                <Link href={"/hibe?sekme=proje" as Route} ...>
                  Proje istasyonunda aç
                </Link>
```
`href` **`row.id` taşımıyor**. Tam dosya `tezgah_outputs.output_content`'te düz metin olarak duruyor (`os-load.ts:180-200`, önizleme 1.200 karakter), ama **detay sayfası/rotası yok** → kullanıcı çıktısını **kaybediyor**.

**Kanıt — profil URL'de:** `app/(kernel)/hibe/page.tsx:17-30` on alanı `searchParams`'tan okuyor; kalıcı profil yok. Sayfa yenilenince/tarayıcı kapanınca profil uçar. `parseHibeAnalysis` yalnız `hesap === "1"` ve tam kapalı liste eşleşmesinde çalışıyor (`os-brief.ts:75-113`) — kısmi profil **tamamen reddedilir**.

**Ek — GET ile yazma:** `loadHibeCockpit` bir **RSC render'ında** `rememberAnalysis` çağırıp `tezgah_outputs`'a satır yazıyor (`os-load.ts:207-240`, çağrı `:320`). Sayfa görüntüleme = DB yazma; idempotency yok, yalnız "son satırın parmak izi" karşılaştırması var (`:221-226`).

---

### 3.9 `[YÜKSEK]` — "Toplam potansiyel destek kapsamı" KPI'sı yanıltıcı toplam

**Kanıt:**
```101:112:lib/yetkinhibe/program-fit.ts
export function sumEligibleCeilingMinor(rows: readonly GrantProgramFit[]): number | null {
  let total = 0;
  for (const row of rows) {
    if (!row.eligible || row.maxSupportMinor === null) continue;
    ...
    total += row.maxSupportMinor;
  }
```
`os-load.ts:324-330` bu toplamı `kpis.scopeLabel` olarak basıyor; kokpitte **"Toplam potansiyel destek kapsamı"** etiketiyle (`os-cockpit.tsx:123`).

**Neden yanıltıcı:** KOSGEB İş Geliştirme tavanı (2.250.000 TL) + TÜBİTAK 1507 tavanı (2.625.000 TL) + Ticaret Bakanlığı tavanı **aynı proje için birikmez**. Çağrılar birbirini dışlar (aynı gider kalemi iki kez desteklenmez — mevzuat gereği). Toplam, **var olmayan bir rakam**.

**Etki:** KOBİ "%5,3 milyon destek alabilirim" sanıyor. Danışman karşısında savunulamaz; A5 (dürüstlük) ihlaline yakın.

---

### 3.10 `[YÜKSEK]` — Halüsinasyon kalkanı delikli: kelimeyle yazılmış oran/tutar geçiyor

**Kanıt — yasak deseni:**
```10:12:lib/tezgah/grant/narrative.ts
const BANNED =
  /₺|\b(?:tl|try|usd|eur)\b|%|\b(?:onay|destek|uygunluk)\s+oran\w*|\bpazar\s+pay\w*|\b(?:milyon|milyar)\b|\d{4,}|resm[iî]\s+onay|hibe\s+tutar/iu;
```
```69:70:lib/tezgah/grant/narrative.ts
const DOSSIER_PROMISE =
  /onaylan(?:ır|ir|acak|mıştır|mistir)|garanti\s+edilir|kesin\s+(?:destek|hibe)|çağrı\s+kod\w*|cagri\s+kod\w*|destek\s+tavan\w*|\b20\d{2}\s*\/\s*\d\b/iu;
```

**Ölçülen davranış (regex doğrudan çalıştırıldı):**

| Metin | Yakalanıyor mu |
|---|---|
| "Bu proje yüzde 75 destek oranıyla uygulanacaktır." | ✅ (`%` yok, `destek oran\w*` var) |
| "Toplam 1.490.000 TL." | ✅ (`₺` yok ama `\d{4,}` var) |
| "**Yüzde 60 oranla desteklenir.**" | ❌ **geçer** — `\boran\w*` "destek"ten **sonra** gelmiyor |
| "**Bütçe iki yüz bin lira.**" | ❌ **geçer** — kelimeyle yazılmış tutar |
| "**150 bin lira ile tamamlanır.**" | ❌ **geçer** — `\d{4,}` değil |
| "Bu proje onaylanacaktır." | ✅ (`DOSSIER_PROMISE`) |
| "Destek almanız garanti edilir." | ✅ |

**Etki:** Model "Yüzde 60 oranla desteklenir" yazarsa **mühür açılır** ve metin dosyaya girer. Üstelik "%60" TÜBİTAK 1507'nin **gerçek oranı değil** (%75) — mevzuat hatası olarak müşteriye gider. Türkçe sayı yazımı (`yüzde altmış`, `iki yüz bin`) tamamen korumasız.

**Ek risk:** `\d{4,}` filtresi **meşru** içeriği de öldürüyor — "2026 yılında", "1000 adet üretim", "2500 birim kapasite" satırları düşer (`cleanSection` satırı atar, `:34-41`). Yani kalkan hem delik hem aşırı geniş; **bölüm bazında satır kaybı** üretiyor.

---

### 3.11 `[YÜKSEK]` — `/yetkinhibe/olustur` sihirbaz yolu diskte yok (404 üreten bağlantı üreteci)

**Kanıt:**
```8:8:lib/yetkinhibe/wizard-navigation.ts
const WIZARD_PATH = "/yetkinhibe/olustur";
```
```
$ Test-Path app/yetkinhibe          → MISSING
$ Test-Path app/(kernel)/yetkinhibe → MISSING
```
`buildGrantWizardHref` yalnız testlerde çağrılıyor (`tests/yetkinhibe-core/wizard-navigation.test.ts`, `room-registry.test.ts:53`), ama **yol üreteci canlı kodda duruyor** ve `tests/yetkinhibe-core/room-registry.test.ts:52-54` bu yolu **doğru** kabul ediyor:
```52:54:tests/yetkinhibe-core/room-registry.test.ts
    const wizardPath = new URL(buildGrantWizardHref({ grantId: "g-1" }), "https://yetkin.ai").pathname;
    expect(wizardPath).toBe("/yetkinhibe/olustur");
```
Yani test, **var olmayan bir sayfayı** yeşil tutuyor. Aynı sorun `grant-profile-mode.ts` (ajans/freelancer modu) ve `home-offer-state.ts` (ana sayfa teklif durumu) için de geçerli: modeller var, yüzey yok.

---

### 3.12 `[ORTA]` — `KALKINMA_AJANSI` / `BOLGESEL_AJANS` çift anahtar; `RESMI_GAZETE` kaynak olarak anlamsız

`grant-catalog-core.ts:26-34`. `RESMI_GAZETE` bir **kaynak kurum değil, yayım aracıdır**; `sourceLabel` olarak kullanıcıya "Resmî Gazete" göstermek uygunluk bilgisi taşımaz. `BOLGESEL_AJANS` ile `KALKINMA_AJANSI` aynı kurum tipini iki `@id` ile modelliyor → raporlama ve filtreleme ikiye bölünür. `os-load.ts:71-78` `AGENCY_ORDER` listesinde dördü de ayrı sıralanıyor.

---

### 3.13 `[ORTA]` — RLS mührü doğru; ancak katalog tek bozuk satırda **tüm yüzeyleri** düşürüyor

**Doğru taraf:** `ENABLE` + `FORCE ROW LEVEL SECURITY`, `rls_deny_unscoped` `SELECT USING (false)`, yazma politikası yok (`20261109120000:128-137`), sicil kaydı (`rls-policy-registry.ts:112-113`), `verify:rls-status` ✅.

**Zayıf taraf:** `grant-catalog-live.ts:36-56` — **tek satır** `mapGrantCallRow` hatası fırlatırsa döngü tümünü `invalid_row` ile reddeder:
```52:56:lib/yetkinhibe/grant-catalog-live.ts
  } catch {
    throw new GrantCatalogUnavailableError("invalid_row");
  }
}
```
Bu tasarım **fail-closed** açısından doğru (uydurma yok), ama **availability** açısından kırılgan: bir migration'daki tek yazım hatası (`officialInfoUrl` https değil, `supportRatioBps` 10001) aynı anda `/hibe`, `/tezgah` hibe aracı, `/panel/e-ticaret` hibe şeridi, B2B outbound hazırlığı ve haftalık radarı **düşürür**. Katalog yazma aracı olmadığı için düzeltme **deploy** gerektirir.

---

### 3.14 `[ORTA]` — Marka dili (`sen` aksı) hibe yüzeylerinde karışık; kapı bunu görmüyor

**Kapı yeşil** (`verify:sen-axis`: 549 dosya, 0 ihlal) — çünkü `SIZ_LEAKS` listesi (`scripts/verify-sen-axis.ts:50-75`) şu kalıpları **içermiyor**: `seçiniz`, `yazın`, `dönersiniz`, `fikrinizi`.

Gerçek yüzey (10 kaçak):

| Dosya:satır | Metin |
|---|---|
| `components/hibe/grant-eligibility-widget.tsx:24` | "Lütfen iş fikrinizi yazın, sektör ve il seçin." |
| `:93` | "İş fikrinizi, sektörünüzü ve ilinizi yazın." |
| `:135` | "Sektör seçiniz..." |
| `:158` | "İl seçiniz..." |
| `:194` | "Kayıttan sonra doğrudan proje dosyası ekranına **dönersiniz**." |
| `components/hibe/os-cockpit.tsx:178` | "Sektör seçiniz..." |
| `:191` | "İl seçiniz..." |
| `components/hibe/project-desk.tsx:22` | "Lütfen iş fikrinizi yazın..." |
| `:252` | "İl seçiniz..." |
| `:268` | "Sektör seçiniz..." |

Aynı dosyada `sen` aksı da var (`project-desk.tsx:186` "Tam dosya katalogdaki tam proje tutarını cüzdandan düşer"). **Karışık aks**, tek ekranda.

---

### 3.15 `[ORTA]` — Kamuya açık katalog rotası sınırsız; `closed-room` sicili yanlış

**Rate limit yok:** `POST /api/tezgah/grant/match` `llmIp` uyguluyor (`:34`), ama `GET /api/yetkinhibe/grant/catalog` **hiçbir sınır uygulamıyor** (`route.ts:17-33`). Anonim çağrı tüm kataloğu (25 kolon × 9 satır) döndürüyor. Veri gizli değil, ama DB yükü sınırsız.

**Sicil yanlışı:** `web-only-write-routes.ts:1162-1176` iki rotayı `"closed-room"` olarak işaretliyor, notu "Oda kapalıyken kenar 410 basar". Oysa oda **açık**: `lib/dronlar/kayit.ts:135-144` `kapali: false`, `edge-api-auth.ts` 410 dalı yalnız `FROZEN_SHELL_ROOM_IDS` ve `DRON_KAYIT.isKapali` üzerinden çalışıyor; `yetkinhibe` açık olduğu için `/api/yetkinhibe/*` **410 almıyor**. `closed-room` etiketi, gerçek davranışla çelişiyor — sicil okuyan bir denetçi yanılır.

---

### 3.16 `[ORTA]` — Kernel, dikeyin tablosunu doğrudan okuyor (sınır mührü Prisma düzeyinde delik)

```120:130:lib/kernel/market-demand/platform-demand-port.ts
export async function readPlatformGrantCalls(now: Date = new Date()): Promise<PlatformGrantCall[]> {
  const rows = await getPrisma().yetkinhibeGrantCall.findMany({
    where: {
      isPublished: true,
      applicationOpensAt: { lte: now },
      applicationDeadline: { gte: now },
    },
```
Dosyanın kendi yorumu "Çekirdek, Tezgâh ve YetkinHibe motorunu import etmez" diyor — **import etmiyor, tabloyu okuyor**. `verify:boundaries` bunu yakalayamıyor çünkü kural **import** üzerine kurulu (`scripts/verify-boundaries.ts:6`, `:318`), Prisma delegate kullanımı üzerine değil.

Aynı desen `lib/commerce/os-load.ts:69-72` (`loadYetkinhibeGrantCatalog` çağrısı) — dikey↔dikey canlı okuma; mühür `engine/runtime/prisma-store` sonekine baktığı için geçiyor.

**Etki:** `yetkinhibe_grant_calls` şeması değişirse **kernel** kırılır. Sahiplik tablosu (hangi modül hangi tabloya sahip) fiilen uygulanmıyor.

---

### 3.17 `[ORTA]` — E-ticaret `GRANT_CALL` sinyali var; `sourceVerifiedAt` kapısı **yok**

**Doğru taraf:** `lib/commerce/radar-signals.ts:371-415` hibe çağrısını radar sinyaline çeviriyor; `supportRatioBps ≤ 0` elenıyor (KOSGEB Kapasite kredisi doğru şekilde dışarıda); tutar "satış fiyatı" olarak sunulmuyor (yorum `:369`).

**Eksik:** `lib/commerce/os-load.ts:69-92` doğrulanmamış çağrıyı da "Açık"/"Son günler" olarak gösteriyor:
```73:78:lib/commerce/os-load.ts
    for (const row of catalog) {
      if (row.status !== "ACTIVE" && row.status !== "CLOSING_SOON") continue;
      lines.push({ title: row.title, source: row.sourceLabel, remainingDays: row.remainingDays,
        statusLabel: row.status === "CLOSING_SOON" ? "Son günler" : "Açık" });
```
`sourceVerifiedAt` **kontrol edilmiyor**. Hibe motoru aynı satırı `unverified` kovasına atıp **tutarını gizliyor** (`match-grant-programs-for-brief.ts:270-297`). İki yüzey aynı çağrı için **farklı dürüstlük** sergiliyor.

---

### 3.18 `[ORTA]` — Haftalık radar kişiselleştirilmemiş; hibe bağlantısı hibe ekranına gitmiyor

```55:72:lib/jobs/weekly-radar.ts
  const grants = await prisma.yetkinhibeGrantCall.findMany({
    where: { isPublished: true, sourceVerifiedAt: { not: null }, applicationDeadline: { gt: now } },
    orderBy: { sourceVerifiedAt: "desc" }, take: 3, ...
  });
```
- Doğrulama ve süre filtresi **doğru** (bu, katalog okumasından daha disiplinli).
- Ama **profil yok**: 200 üyeye aynı 3 çağrı gidiyor; `audiences`/`nacePrefixes`/`il` eşleşmesi yapılmıyor.
- Bağlantı `"/tezgah?tool=..."` (`:54`) — **`/hibe`'ye gitmiyor**; kullanıcı hibeyi görüp tıklayınca hibe modülüne değil, Tezgâh'a düşüyor.
- Cron: `inngest.ts:557-569`, Pazartesi 09:00 TR. ✅

---

### 3.19 `[ORTA]` — Kamu vitrini ve SEO yok; `/hibe` oturum duvarının arkasında, noindex de değil

- `/hibe` ∈ `PROTECTED_KERNEL_PATHS` (`lib/kernel/security/edge-guard.ts:52`) → anonim ziyaretçi **307 /login**.
- `/hibe` **sitemap'te yok** (`app/sitemap.ts:41-51`, `SITEMAP_STATIC_PATHS` içinde hibe yok).
- `/hibe` **`ROBOTS_DISALLOW_PATHS`'ta da yok** (`lib/copy/seo.ts:310-332`) → robots.txt'te açık, ama sayfa 307 döndüğü için taranamıyor.
- Sayfada `metadata` / `robots: noindex` **tanımlı değil** (`app/(kernel)/hibe/page.tsx` yalnız `PageHeader` basıyor).
- Kamuya açık tek hibe yüzeyi **ana sayfa widget'ı** (`app/(public)/page.tsx:155`) — ve o da yukarıdaki 3.2 nedeniyle sabit skor üretiyor.
- `lib/copy/seo.ts:88` anahtar kelimesi "kosgeb hibe başvuru adımları" — **hedef sayfa yok**. `lib/copy/guides.ts:483` `hibe-proje-dosyasi` rehberi var, o da `/hibe`'ye yönlendiriyor.

---

### 3.20 `[ORTA]` — Puanlama: "kısıtsız" kriter "geçti" sayılıyor → %100 yanılsaması

`match-grant-programs-for-brief.ts:147-215` her kriteri `unconstrained` bayrağıyla üretiyor; `program-fit.ts:63-68` yüzdeyi **tüm kriterler** üzerinden hesaplıyor:
```63:68:lib/yetkinhibe/program-fit.ts
    const criteria = grantBriefCriteria(brief, call.eligibility);
    if (criteria.length === 0) continue;
    const passed = criteria.filter((row) => row.passed).length;
    const fitPct = Math.round((passed / criteria.length) * 100);
```
Kısıt yazmayan bir çağrı (ör. TÜBİTAK 1507: yalnız Ar-Ge + kitle + odak kısıtlı, 11 kriterden 8'i kısıtsız) **%100 "kriter uyumu"** gösterir. Oysa "%100" = "bu çağrı seni hiç kısıtlamıyor" demek, "sen bu hibeyi alırsın" demek değil. UI bunu **büyük puntoyla** basıyor (`os-cockpit.tsx:273` `%{row.fitPct}`), uyarı ise küçük (`:274`).

`master-plan.ts:411-425` aynı oranı `currentScore` yapıyor; `+puan` vaadi (`:430-455`) da bu tabana dayanıyor → **kapatılabilir eksik** puanları şişiyor.

---

### 3.21 `[ORTA]` — `Idempotency-Key` ücretsiz üretimde opsiyonel: çift tıklama çift hak

`lib/tezgah/command-key.ts:8-10` başlık yoksa `{ ok: true, key: null }` döner. `engine.ts:215-221` `commandKey` null ise **replay koruması olmadan** `consumeTezgahQuota` çağırır. Kullanıcı çift tıklarsa **iki hak** düşer, iki LLM çağrısı olur. Ücretli yolda bu koruma **var** (`dossier/route.ts:21` zorunlu, `paid-dossier.ts:68-96` rezervasyon) — ücretsiz yolda yok. Tutarsız.

---

### 3.22 `[ORTA]` — Ölü kod oranı yüksek; bakım yükü ve yanlış yeşil test

`lib/yetkinhibe` 28 dosyadan **6'sı** sıfır canlı tüketiciye sahip (bkz. 3.7). Buna karşılık bunları doğrulayan **~30 test** yeşil. `types.ts:174-230` (`GrantWorkPackage`, `GrantBudgetLine`, `GrantProjectPlan`, `aiContextPrompt`, `budgetOutputKind`) hiçbir yerde kullanılmıyor:
```
$ rg "GrantProjectPlanInput|GrantWorkPackage" lib app  → yalnız types.ts
```
`specificationText` / `rulesJson` (`types.ts:72-74`) — **document RAG sözleşmesi yazılmış, altyapı yok**. Prisma şemasında bu kolonlar da yok.

---

### 3.23 `[ORTA]` — Şema notu ile gerçek çelişiyor: "Oda kapalıdır (D-9)"

```1:3:prisma/schema/yetkinhibe.prisma
/// YetkinHibe F2 — hibe çağrı kataloğu ve kaynak sicili. Oda kapalıdır (D-9).
/// Okuma yalnız sunucuda Prisma ile yapılır. Sahiplik kolonu yoktur: RLS_FORCE_TABLES'ta kayıtlıdır,
```
Oda **açık** (`lib/dronlar/kayit.ts:135-144`, `kapali: false`; `room-registry.test.ts:50` bunu doğruluyor: `DronBayrakları.isKapali("yetkinhibe") === false`). Aynı çelişki `app/api/yetkinhibe/grant/match/route.ts:24`, `web-only-write-routes.ts:45-49` ve `scripts/room-ceiling-lib.ts:32-35` (`CLOSED_PILOT_LIB_DIRS` içinde `"yetkinhibe"`) içinde tekrarlanıyor. Yorumlar kanonik değil; yeni geliştiriciyi **yanlış yöne** çekiyor.

---

### 3.24 `[ORTA]` — B2B hibe okuması varsayım üretiyor (dürüst ama kör)

`lib/yetkinhibe/b2b-sector-match.ts:150-161` sabit bir brief kuruyor:
```150:161:lib/yetkinhibe/b2b-sector-match.ts
  const brief: GrantProgramBrief = {
    provinceCode: axes.provinceCode,
    audience: "mevcut_kobi",
    naceGroup: axes.naceGroup,
    investmentFocus: "arge",
    employeeCount: 0,
    companyAgeYears: 0,
    rdMaturityLevel: "EARLY",
    ...
```
`employeeCount: 0` → `minEmployeeCount: 10` olan KOSGEB Kapasite **hiç eşleşmez**; her lead'e "Ar-Ge" varsayımı giydirilir. Varsayım metne yazılıyor (`B2B_GRANT_ASSUMPTION:8-10`) — dürüstlük ✅, ama **satış isabet oranı** düşük.

---

## 4. 85+ / 100 İçin Önerilen Faz 1 & Faz 2 Yol Haritası

### 4.1 Hedef skor dağılımı

| Eksen | Bugün | Faz 1 sonu | Faz 2 sonu | Hedef |
|---|---:|---:|---:|---:|
| Mimari Hazırlık | 58 | 78 | **88** | %25 |
| Mevcut İşlevsellik | 47 | 72 | **90** | %30 |
| Ticari Farklılaşma | 38 | 62 | **85** | %25 |
| UX / Vitrin | 42 | 74 | **86** | %20 |
| **Toplam** | **46** | **71** | **87** | **85+** |

### 4.2 Ortak kural seti (her iki fazda geçerli, mevcut mimariye uyum)

- Motor `lib/yetkinhibe/*` içinde yaşar; `app/api/*` yalnız kompozisyon (kernel↛dikey mührü korunur).
- Her yeni rota `export const auth` beyan eder; `verify:api-auth --check` kırılmaz.
- Her yeni tablo: `@@map` snake_case + `RLS_FORCE_TABLES` kaydı + `ENABLE`/`FORCE ROW LEVEL SECURITY` + `rls_deny_unscoped` + (sahiplik varsa `RLS_OWNERSHIP_COLUMNS`).
- Para **her zaman** `amountMinor` tam sayı kuruş; `Number`/float yasak. Havuz `BIGINT`.
- Her yazma: `Idempotency-Key` + `requireRailV1IdempotencyKey` + `settleHttpIdempotency` veya `PaidCommandReservation`.
- Her LLM çağrısı: `invokeLlm` + `resolveProductModel` + `recordUsage: true` + kullanıcı rate-limit + **`AI_TOKEN_SOURCES.GRANT`** (bugün `TEZGAH` yazıyor, `sources.ts:12`).
- Katalog verisi **asla** belgeden/LLM'den gelmez; yalnız doğrulanmış satırdan.

---

### 4.3 Faz 1 — "Katalog + Huni + Tek Doğru" (4–6 hafta, P0)

**Amaç:** Ürün 26 Kasım'da boş kalmasın; kullanıcı ödeme yapabilsin; tek bir doğru skor olsun.

| # | İş | Kapsam | Kabul ölçütü |
|---|---|---|---|
| **F1.1** | **Katalog yazma yolu** | `POST/PATCH /api/admin/grant-calls` (`auth="admin"`), `scripts/ops-grant-call.ts` (ekle/güncelle/doğrula/yayından al), `HibeGrantCallRevision` append-only tablo (RLS'li), `dataVersion` her yazmada +1 | Yeni çağrı **deploy olmadan** eklenir; her satırın `sourceVerifiedAt` + `dataVersion` geçmişi okunur |
| **F1.2** | **Katalog tazeleme ritmi** | Inngest `grant-catalog-verify` (haftalık): süresi geçmiş `isPublished` satırları `CLOSING_SOON→CLOSED` geçişinde **uyarı olayı** üretir; "doğrulama 30 günden eski" satır admin paneline düşer | Hiçbir yüzeyde 30 günden eski doğrulanmamış satır "Açık" görünmez |
| **F1.3** | **Kapsam genişletme** | `PROGRAM_SOURCES`'a `TKDK_IPARD`, `TARIM_BAKANLIGI`, `SANAYI_BAKANLIGI`, `ISKUR`, `AB_FONLARI` ekle; `KALKINMA_AJANSI`+`BOLGESEL_AJANS` birleştir (migration + geriye uyum eşlemesi); `RESMI_GAZETE` yalnız `publicationUrl` alanı olur | **≥ 30 açık çağrı**, ≥ 8 kurum, TKDK/IPARD dahil |
| **F1.4** | **Tek skor motoru** | `match-grants-for-profile.ts` + `grant-match-api.ts` kaldırılır; `POST /api/yetkinhibe/grant/match` → `matchGrantProgramsForBrief` üzerine kurulur; `GrantMatchProfile`'a `provinceCode`, `audience`, `investmentFocus`, `naceGroup` eklenir | Aynı profil için **tüm yüzeyler aynı yüzdeyi** verir; `criteria[]` 11 kriteri taşır |
| **F1.5** | **Kamu widget'ı düzeltmesi** | `public-eligibility.ts` gerçek brief kurar (sektör→NACE, il→plaka, ölçek sorusu eklenir); `estimateSupportMinor` çarpanı **kaldırılır**; yerine "Katalog tavanı: ₺X" (yalnız `maxSupportMinor`) | Kafe fikri + NACE 47 + Ar-Ge yok → **TÜBİTAK 1507 listelenmez**; tutar yalnız katalog tavanı |
| **F1.6** | **Ödeme yolu** | `PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER` ekle; `POST /api/tezgah/checkout` `kind="grant-dossier"` destekler (doğrudan PayTR, cüzdan sıçraması yok); `paid-dossier.ts` **önce bakiye/kredi kontrolü** yapar | `402` **LLM'den önce** döner; `/hibe` fiyat şeridinde "Satın al" düğmesi; 402'de `/cuzdan` bağlantısı |
| **F1.7** | **Rezervasyon TTL** | `paidCommandReservation` `RESERVED` satırları için 15 dk TTL + `inngest` süpürücü; `FAILED` durumu | Aynı anahtarla ikinci deneme **ücretsiz replay** veya temiz retry; yetim satır kalmaz |
| **F1.8** | **Kalıcılık** | `HibeCompanyProfile` (sahiplik: `owner_user_id`, RLS sicilli) + `HibeDossier` (dosya JSON + DOCX referansı); `/hibe` profil query yerine **kayıtlı profili** okur (query yalnız ön-doldurma) | Arşiv kartı **kendi dosyasını yeniden açar**; `/hibe` boş açıldığında son profil gelir |
| **F1.9** | **Halüsinasyon kalkanı sertleştirme** | `BANNED`'a Türkçe sayı sözlüğü (`yüzde\s+\w+`, `\b(bin|milyon|milyar)\b`, sayı sözcükleri) + `oran\w*` konum bağımsız; `\d{4,}` yalnız **para/yıl bağlamında** (lookbehind: `tl|₺|yıl|bütçe`) | "Yüzde 60 oranla desteklenir" ve "iki yüz bin lira" **reddedilir**; "2026 yılında" **geçer** |
| **F1.10** | **Katalog dayanıklılığı** | `invalid_row` → ilgili satırı **karantinaya** al (`isPublished=false` + revision kaydı + admin uyarısı), kalan katalog servis edilir | Tek bozuk satır tüm yüzeyleri düşürmez; karantina görünür |
| **F1.11** | **Marka aksı** | 10 `siz` kaçağı `sen` aksına çevrilir; `verify:sen-axis` `SIZ_LEAKS`'a `seçiniz`, `yazın`, `dönersiniz`, `fikrinizi` eklenir | Kapı **gerçekten** yakalar; hibe yüzeyi tek aks |
| **F1.12** | **Vitrin** | `/hibe` için `app/(public)/hibe/page.tsx` (SSR, `index:true`, sitemap + JSON-LD + FAQ); oturumlu kokpit `/panel/hibe`'ye taşınır; `ROBOTS_DISALLOW_PATHS`'a `/panel/hibe` | Organik giriş mümkün; "kosgeb hibe başvuru adımları" sorgusu **karşılanır** |
| **F1.13** | **Ölü kod temizliği** | 6 modül ya **yüzeye bağlanır** (lifecycle → Faz 2) ya **silinir**; `wizard-navigation` gerçek `/panel/hibe/olustur` yoluna bağlanır; yeşil-test yanılsaması kırılır | `rg` ile "0 tüketici" modül kalmaz; test sayısı **düşer** (dürüst) |

**Faz 1 çıkış kapısı:** 30+ açık çağrı; tek skor; `/hibe` satın alınabilir; arşiv yeniden açılır; `tsc`, `vitest`, `verify:api-auth --check`, `verify:boundaries`, `verify:rls-status`, `verify:sen-axis` yeşil; **katalog yazma deploy'suz**.

---

### 4.4 Faz 2 — "Kurum Formatları + Başvuru Sonrası + Ajans Modu" (6–10 hafta, P1)

**Amaç:** Danışmanlık firmalarını ve rakip platformları **işlevsel olarak** geçmek.

| # | İş | Kapsam | Kabul ölçütü |
|---|---|---|---|
| **F2.1** | **Kuruma özel dosya şablonları** | `lib/yetkinhibe/templates/` — `kosgeb-is-plani`, `tubitak-prodis-1501`, `tubitak-prodis-1507`, `ticaret-ihracat`, `kays-kalkinma`, `tkdk-ipard`. Her şablon: bölüm ağacı, zorunlu alan matrisi, iş paketi/adan-ay şeması, başarı ölçütü alanı | Seçilen `grantId` **şablonu belirler**; KOSGEB ile TÜBİTAK çıktısı yapısal olarak farklı |
| **F2.2** | **Gerçek DOCX (tablo + stil)** | `docxgen` katmanı: `w:tbl` (bütçe, Gantt, ekip matrisi), başlık stilleri, kapak, sayfa numarası, içindekiler; sunucu-taraflı **PDF** üretimi; Markdown indirme | Word'de **tablo hizalı** açılır; PDF tek tık; Google Docs'a aktarılabilir |
| **F2.3** | **Mevzuat izi** | Her sayı/iddia için `{ kaynak: officialInfoUrl, dogrulamaTarihi, dataVersion, madde }`; dokümanda dipnot; "Bu oran katalog satırı 2026-11-15 tarihli doğrulamadır" | Her tutar/oran **kaynağa bağlı**; kaynaksız sayı **basılmaz** |
| **F2.4** | **Başvuru sonrası yaşam döngüsü** | `HibeApplication` tablosu (RLS + sahiplik) + `grant-lifecycle.ts` yüzeye bağlanır: faz takibi, evrak kasası, gecikme uyarısı, `nextCriticalDeadline`, inngest hatırlatıcıları (7/3/1 gün) | Başvuru **hayat döngüsü ekranında** yaşar; ara rapor/SGK/denetim/ödeme adımları görünür |
| **F2.5** | **Evrak kasası** | `HibeDocument` (RLS + sahiplik + `ccred1:` benzeri mühür), yükleme/indirme, `approved/pending/missing/rejected` durumu, denetim izi | Danışman evrakı **müşteri adına** takip eder; her değişiklik izlenir |
| **F2.6** | **Ajans / çoklu müşteri modu** | `grant-profile-mode.ts` canlanır: `individual | agency | freelancer`; ajans için `HibeClient` tablosu, toplu eşleştirme, müşteri portföyü, beyaz etiketli DOCX | Tek hesapta **20+ müşteri** profili; toplu "hangi müşteri hangi çağrıya uygun" tablosu |
| **F2.7** | **Document RAG (şartname)** | `specificationText` + `rulesJson` kolonları (sözleşme zaten var, `types.ts:72-74`), chunk + indeks, atıf zorunlu (`madde no + sayfa`) | Dosya, şartname maddesine **atıf** yapar; atıfsız cümle üretilmez |
| **F2.8** | **Fiyatlandırma modeli** | Dosya kredisi + ajans aboneliği + opsiyonel başarı primi; `AI_TOKEN_SOURCES.GRANT` ile maliyet atfı; `PriceCatalogEntry` üzerinden Super Admin fiyat | Her ürün **katalog satırından** fiyatlanır; kâr/maliyet ölçülür |
| **F2.9** | **Radar kişiselleştirme** | Haftalık radar kullanıcı profiliyle filtreler (il/NACE/kitle/ölçek); bağlantı **`/panel/hibe`**'ye gider; e-posta tercihleri (`HibeNotificationPreference`) | Aynı üye, kendi profiline uyan çağrıları alır; tıklama hibe ekranına iner |
| **F2.10** | **Çapraz sinerji** | E-ticaret `GRANT_CALL` sinyali `sourceVerifiedAt` kapısına bağlanır; e-ticaret mağazası → "ihracat çağrısı" köprüsü (`os-growth.ts:28-35` zaten var) `/panel/hibe?store=...` ile **gerçek profille** açılır | Aynı çağrı tüm yüzeylerde **aynı dürüstlükte**; mağaza verisi hibe profiline taşınır |
| **F2.11** | **Skor şeffaflığı** | `fitPct` yalnız **kısıtlı** kriterler üzerinden hesaplanır; `unconstrained` kriter ayrı satırda "kısıt yok" olarak gösterilir; "Toplam potansiyel kapsam" KPI'sı **kaldırılır**, yerine "En yüksek tek tavan" | "%100" yalnız gerçekten tüm kısıtlar geçtiğinde; toplama KPI'sı yok |

**Faz 2 çıkış kapısı:** 6 kurum şablonu; tablolu DOCX + PDF; başvuru sonrası 5 faz canlı; ajans modu; mevzuat izli çıktı; **≥ 85 / 100**.

---

### 4.5 Rakip karşılaştırması — 85+ neden yeterli

| Yetenek | Türkiye'de tipik danışmanlık | Rakip hibe platformları | YetkinHibe bugün | YetkinHibe Faz 2 |
|---|---|---|---|---|
| Katalog genişliği | Elle, müşteriye özel | 50–200 çağrı, güncel | **9 çağrı, 1 açık** | 30+ açık, 8 kurum, TKDK dahil |
| Eşleştirme | Uzman sezgisi | Basit filtre (sektör/il) | ✅ deterministik AND kapısı | ✅ + tek skor + mevzuat izi |
| Proje dosyası | ✅ (ücretli, 1–3 hafta) | ❌ veya şablon | 🟡 genel taslak | ✅ kuruma özel, tablolu, PDF |
| Halüsinasyon riski | Uzman hatası | Yüksek (LLM) | 🟡 delikli kalkan | ✅ kelime-sayı + atıf zorunlu |
| Başvuru sonrası takip | ✅ (asıl gelir) | ❌ | ❌ | ✅ 5 faz + evrak kasası |
| Fiyat | ₺15.000–₺100.000 | ₺500–₺5.000/yıl | ₺1.490 (satın alınamıyor) | ₺1.490 + ajans aboneliği |
| Ajans/çoklu müşteri | ✅ | 🟡 | ❌ | ✅ 20+ müşteri |
| Denetlenebilirlik | ❌ | ❌ | ✅ (RLS + defter + revision) | ✅ + kaynak izi |

**Tek cümle:** Rakipler ya **pahalı ve yavaş** (danışman) ya **geniş ama yüzeysel** (platform). YetkinHibe'nin kazanma yeri: **deterministik uygunluk + kuruma özel üretim + başvuru sonrası izleme** üçlüsünü **tek hesapta** ve **denetlenebilir** biçimde sunmak — Faz 2 bunu tamamlıyor.

---

## 5. Bulgu Özet Tablosu (önem sırasına göre)

| # | Önem | Bulgu | Kanıt |
|---|---|---|---|
| 1 | `[KRİTİK]` | Katalog yazma yolu yok; 26 Kasım'da tüm yüzeyler boş | `rg yetkinhibeGrantCall.create` → 0; migration `20261115120000:12-70` |
| 2 | `[KRİTİK]` | Kamu widget'ı fikirden bağımsız %98 üretiyor; sektör/il kapı değil | `preview-match-score.ts:14-27`, `preview-idea-validator.ts:125-138`, `public-eligibility.ts:24-27` |
| 3 | `[KRİTİK]` | Ödeme hunisi kopuk; bakiye LLM sonrası kontrol, cüzdan CTA yok | `paid-dossier.ts:137-160`, `os-cockpit.tsx:103-118`, `checkout.ts:34,51-52` |
| 4 | `[YÜKSEK]` | Üç ayrı uyum tanımı; API skoru bölge/kitle/NACE/odak yok sayıyor | `match-grants-for-profile.ts:26-34`, `types.ts:100-109` |
| 5 | `[YÜKSEK]` | Kapsam: TKDK/IPARD yok, KOSGEB açık çağrı yok, ajanslar tek satır | `grant-catalog-core.ts:26-34` |
| 6 | `[YÜKSEK]` | Kuruma özel şablon yok; DOCX tablosuz düz metin; PDF yalnız print | `details.ts:42-58`, `docx.ts:13-22`, `grant-project-report.tsx:281-283` |
| 7 | `[YÜKSEK]` | Başvuru sonrası yaşam döngüsü ölü kod; `HibeApplication` tablosu yok | `grant-lifecycle.ts:8-66`, `yetkinhibe.prisma:8-45` |
| 8 | `[YÜKSEK]` | Arşiv yeniden açılamıyor; profil yalnız URL'de; GET render'ı DB yazıyor | `os-cockpit.tsx:354-363`, `os-load.ts:207-240,320` |
| 9 | `[YÜKSEK]` | "Toplam potansiyel destek kapsamı" birikmeyen tavanları topluyor | `program-fit.ts:101-112`, `os-load.ts:324-330` |
| 10 | `[YÜKSEK]` | Halüsinasyon kalkanı: "yüzde 60 oranla", "iki yüz bin lira" geçiyor | `narrative.ts:10-12,69-70` (regex ölçüldü) |
| 11 | `[YÜKSEK]` | `/yetkinhibe/olustur` yolu diskte yok; testi yeşil tutuyor | `wizard-navigation.ts:8`, `room-registry.test.ts:52-54` |
| 12 | `[ORTA]` | Ödeme emri enum'unda `GRANT_DOSSIER` yok; rezervasyon TTL yok | `order-purpose.ts:4-9`, `paid-dossier.ts:68-96,161-168` |
| 13 | `[ORTA]` | `KALKINMA_AJANSI`/`BOLGESEL_AJANS` çift anahtar; `RESMI_GAZETE` kaynak değil | `grant-catalog-core.ts:26-34` |
| 14 | `[ORTA]` | Tek bozuk satır tüm katalogu düşürüyor (availability) | `grant-catalog-live.ts:52-56` |
| 15 | `[ORTA]` | `sen` aksı 10 yerde ihlal; kapı kalıpları eksik | `sen-axis.ts:50-75`, widget/desk satırları |
| 16 | `[ORTA]` | Katalog rotası rate-limitsiz; `closed-room` sicili yanlış | `catalog/route.ts:17-33`, `web-only-write-routes.ts:1162-1176` |
| 17 | `[ORTA]` | Kernel dikeyin tablosunu Prisma ile okuyor (mühür import düzeyinde) | `platform-demand-port.ts:120-130` |
| 18 | `[ORTA]` | E-ticaret hibe şeridi `sourceVerifiedAt` kontrol etmiyor | `os-load.ts:69-92` |
| 19 | `[ORTA]` | Haftalık radar kişiselleştirilmemiş; bağlantı `/tezgah`'a gidiyor | `weekly-radar.ts:55-72` |
| 20 | `[ORTA]` | Kamu vitrini/SEO yok; `/hibe` ne indexli ne noindex | `edge-guard.ts:52`, `seo.ts:310-332`, `sitemap.ts:41-51` |
| 21 | `[ORTA]` | "Kısıtsız = geçti" → %100 yanılsaması | `program-fit.ts:63-68`, `os-cockpit.tsx:273` |
| 22 | `[ORTA]` | Ücretsiz üretimde `Idempotency-Key` opsiyonel → çift hak | `command-key.ts:8-10`, `engine.ts:215-221` |
| 23 | `[ORTA]` | 6 ölü modül + ~30 yanlış yeşil test; `specificationText/rulesJson` altyapısız | `rg` kanıtları, `types.ts:72-74,174-230` |
| 24 | `[ORTA]` | Şema/rota/sicil yorumları "oda kapalı" diyor, oda açık | `yetkinhibe.prisma:1`, `kayit.ts:135-144` |
| 25 | `[ORTA]` | B2B hibe okuması sabit brief (`employeeCount: 0`, `arge`) | `b2b-sector-match.ts:150-161` |

---

## 6. Ek — Doğrulanabilir komut defteri

```bash
# Rapor sonrası tekrar üretilebilir kanıt
npx tsc --noEmit
npx vitest run tests/yetkinhibe-core tests/tezgah/grant-engine.test.ts tests/tezgah/grant-dossier.test.ts
npx tsx scripts/verify-api-auth.ts --check
npx tsx scripts/verify-boundaries.ts
npx tsx scripts/verify-rls-status.ts
npx tsx scripts/verify-sen-axis.ts

# Katalog yazma yolu yok kanıtı
rg "yetkinhibeGrantCall\.(create|update|upsert|delete|createMany|updateMany)"   # → 0

# Ölü modül kanıtı
rg -l "grant-lifecycle|analyze-grant-eligibility-gap|build-preview-gap-from-criteria|grant-profile-mode|calculate-grant-budget" app components lib --glob '!lib/yetkinhibe/*'   # → 0

# Var olmayan sihirbaz yolu
Test-Path app/yetkinhibe          # → False
Test-Path app/(kernel)/yetkinhibe # → False
```

**Rapor sonu.** Bu belge dışında hiçbir dosya oluşturulmadı, değiştirilmedi veya silinmedi.
