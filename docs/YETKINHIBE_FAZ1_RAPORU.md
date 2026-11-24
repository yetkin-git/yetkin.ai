# YetkinHibe Faz 1 — Mühür Raporu

**Tarih:** 23 Kasım 2026
**Kapsam:** Tespit raporu §4.3 (F1.1–F1.13). Bu belge ikinci ve son parçayı kapatır: yüzey, kalkan, kalıcılık, test ve kapı kanıtı.
**Kaynak teşhis:** `docs/YETKINHIBE_TESPIT_RAPORU.md`

---

## 1. Bu parçada kapanan iş

Analiz formu (`hesap=1`) artık firmayı `hibe_company_profiles` satırına yazar. Yazma `upsertHibeCompanyProfile` üzerinden gider; `POST /api/yetkinhibe/profile` aynı fonksiyonu kullanır. Kokpit boş açıldığında son profil okunur. Sorgu yalnız o isteğin hesabını ve formu doldurur.

Arşiv kartı `HibeDossier.markdown` gövdesini «Tam dosyayı aç» ile yeniden basar ve indirir.

Kamu `/hibe` ile oturumlu `/panel/hibe` ayrımı, Türkçe sayı kalkanı, `AI_TOKEN_SOURCES.GRANT` ve ölü dosya temizliği testlerle kilitlendi.

---

## 2. Yeni tablolar

Migration: `prisma/migrations/20261123180000_yetkinhibe_faz1_catalog_write`

| Tablo | Sahip | RLS |
|---|---|---|
| `hibe_grant_call_revisions` | Yok (append-only) | ENABLE + FORCE + `rls_deny_unscoped` |
| `hibe_company_profiles` | `user_id` | ENABLE + FORCE + deny + owner SELECT |
| `hibe_dossiers` | `user_id` | ENABLE + FORCE + deny + owner SELECT |

Mevcut katalog tabloları durur: `yetkinhibe_grant_sources`, `yetkinhibe_grant_calls`. Üç yeni tablo `RLS_FORCE_TABLES` içindedir. `verify:rls-status` bu adları sicille eşleştirdi.

`HibeDossier` dosya metnini, `report_json` gövdesini ve `command_key` tekilliğini taşır. Tutar kolonu yoktur; fiyat katalogdadır.

---

## 3. Rotalar

| Yol | Yetki | İş |
|---|---|---|
| `POST /api/admin/grant-calls` | `admin` | Çağrı ekler, `dataVersion` artar, revision yazar |
| `PATCH /api/admin/grant-calls/[id]` | `admin` | Günceller |
| `POST /api/admin/ops/grant` | `admin` | Operasyon kompozisyonu |
| `POST /api/yetkinhibe/profile` | `session` | Profil upsert, `Idempotency-Key` zorunlu |
| `POST /api/yetkinhibe/grant/match` | `session` | Tek motor: `matchGrantProgramsForBrief`, `criteria` 11 satır |
| `GET /api/yetkinhibe/grant/catalog` | `public` | Yayımlı katalog |
| `POST /api/tezgah/grant/match` | `public` | Kamu widget |
| `POST /api/tezgah/grant/dossier` | `session` | Bakiye LLM'den önce; 402 |
| `POST /api/tezgah/checkout` | `session` | `kind=grant-dossier` → `PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER` |

Sayfalar:

| Yol | Dosya | Erişim |
|---|---|---|
| `/hibe` | `app/(public)/hibe/page.tsx` | Kamu. `index: true`, sitemap, FAQ JSON-LD |
| `/panel/hibe` | `app/(kernel)/panel/hibe/page.tsx` | `requirePageSession` |

`PROTECTED_KERNEL_PATHS` ve `ROBOTS_DISALLOW_PATHS` içinde `/panel/hibe` vardır. `/hibe` ikisinde de yoktur. Sitemap `PAGE_SEO.hibe` (`/hibe`) satırını taşır. Anahtar sözcük: `kosgeb hibe başvuru adımları`.

`scripts/ops-grant-call.ts` (`npm run ops:grant-call`): `seed | add | update | verify | unpublish`. Yeni çağrı deploy beklemez.

Sihirbaz href'i `/panel/hibe?sekme=proje` üretir. `/yetkinhibe/olustur` üretilmez ve diskte yoktur.

---

## 4. Kabul ölçütleri (F1.8, F1.9, F1.12, F1.13)

| Madde | Kanıt |
|---|---|
| F1.8 profil | `saveHibeCompanyProfile` analiz gönderiminde yazar. Boş kokpit `savedProfile` okur. Test: `faz1-profile-archive.test.ts` |
| F1.8 arşiv | Arşiv satırı markdown taşır; kokpit «Tam dosyayı aç» basar |
| F1.9 kalkan | `yüzde altmış`, `iki yüz bin lira`, `Yüzde 60 oranla` reddedilir. `2026 yılında` kalır. `lib/tezgah/grant/narrative.ts` |
| F1.9 kaynak | `AI_TOKEN_SOURCES.GRANT === "grant"`. Hibe motoru `source: AI_TOKEN_SOURCES.GRANT` |
| F1.12 vitrin | `/hibe` indeksli kamu sayfası. `/panel/hibe` korumalı ve robots dışı |
| F1.13 ölü kod | `analyze-grant-eligibility-gap.ts`, `build-preview-gap-from-criteria.ts`, `calculate-grant-budget.ts`, `grant-fail-closed.ts` yok. `match-grants-for-profile.ts` ve `grant-match-api.ts` yok |

Faz 1'in önceki parçası bu mühürde durur ve aynı test paketinde kilitlidir:

- 32 çağrı tohumu, 9 kurum, TKDK dahil; bozuk satır `QUARANTINE` ile `isPublished=false`, kalan katalog servis edilir.
- Tek skor: kısıtlı kriter oranı. Kısıtsız çağrı yüzde 100 yazmaz (`fitPct: null`).
- Kafe + NACE 47 + Ar-Ge yok → TÜBİTAK 1507 listelenmez. İl 34, yalnız Ankara (06) çağrısıyla eşleşmez. Tutar `Program üst limiti`.
- Cüzdan yetersizse `402`, `generateGrantProject` çağrılmaz, rezerv yazılmaz.
- Checkout `GRANT_DOSSIER` siparişi açar, dönüş `masa=hibe`, merchant oid `TZG` ile başlar.

`grant-lifecycle.ts` yüzeye bağlanmadı. Başvuru sonrası izleme Faz 2 (F2.4) işidir.

---

## 5. Testler

Yeni veya güncellenen dosyalar:

- `tests/yetkinhibe-core/faz1-catalog.test.ts`
- `tests/yetkinhibe-core/faz1-score-widget.test.ts`
- `tests/yetkinhibe-core/faz1-profile-archive.test.ts`
- `tests/yetkinhibe-core/faz1-surface.test.ts`
- `tests/tezgah/grant-narrative-shield.test.ts`
- `tests/tezgah/grant-paid-before-llm.test.ts`
- `tests/tezgah/grant-dossier-checkout.test.ts`
- `tests/yetkinhibe-core/wizard-navigation.test.ts` — `/panel/hibe`
- `tests/yetkinhibe-core/room-registry.test.ts`
- `tests/yetkinhibe-core/pure-core-imports.test.ts` — silinen dosyalar listeden çıktı
- `tests/yetkinhibe-core/grant-match-route.test.ts` — brif sözleşmesi ve `fitPct`
- `tests/yetkinhibe-core/master-plan.test.ts` — kısıtlı kriter puanı
- `tests/yetkinhibe-core/preview-idea-validator.test.ts` — katalog tavanı
- `tests/tezgah/grant-engine.test.ts` — kaynak `grant`
- `tests/tezgah/tool-query.test.ts`, `tests/tezgah/surface.test.ts` — kokpit href

---

## 6. Kapı kanıtı (23 Kasım 2026, bu çalışma)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run verify:sen-axis` | OK — 555 dosya, 41 `siz` kaçağı tarandı |
| `npm run verify:boundaries` | OK |
| `npm run verify:api-auth -- --check` | OK — 159 rota (`session:96, public:27, closed:11, cron:2, admin:15, webhook:8`) |
| `npm run verify:rls-status` | OK — `hibe_company_profiles`, `hibe_dossiers`, `hibe_grant_call_revisions` dahil |
| `npm run verify:no-secrets` | OK |
| `npx vitest run tests/yetkinhibe-core tests/tezgah tests/commerce` | **67 dosya / 485 test** geçti |
| `npx next build` | exit 0. Derlenen rotalar arasında `/hibe` ve `/panel/hibe` var |

---

## 7. Faz 1 çıkış

Katalog yazma deploy'suzdur. Tek skor motoru üç yüzeyi (eşleştirme rotası, sıralama, kamu widget) aynı yüzdeye bağlar. Tam dosya satın alma `GRANT_DOSSIER` ile PayTR'ye iner; yetersiz bakiye LLM'den önce 402 döner ve cüzdan bağlantısı kokpitte durur. Arşiv kendi dosyasını açar. Kamu vitrin indekslenir, kokpit taranmaz.
