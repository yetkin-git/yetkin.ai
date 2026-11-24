# CAREER_TEDAVI_RAPORU — Faz 1 + Faz 2

**Tarih:** 24 Kasım 2026  
**Kapsam:** `/docs/CAREER_TESPIT_RAPORU.md` Faz 1 + Faz 2 (`F2.1`–`F2.10`) bulgularının uçtan uca kapatılması.  
**Dal / çalışma ağacı:** yerel tedavi oturumu (migration + kariyer/kurumsal yüzey).

---

## 0. Doğrulama Kapıları (Faz 2 oturumu)

| # | Kapı | Komut | Sonuç |
|---|---|---|---|
| 1 | Tip | `npx tsc --noEmit` | **PASS** (`TSC_DONE=0`) |
| 2 | Sen aksi | `npm run verify:sen-axis` | **PASS** — 723 dosya |
| 3 | Sınırlar | `npm run verify:boundaries` | **PASS** |
| 4 | API yetki | `npm run verify:api-auth -- --check` | **PASS** — 173 route (`public:28`, `session:109`) |
| 5 | RLS (statik) | `npm run verify:rls-status` | **PASS** |
| 5b | RLS (canlı) | `npm run verify:rls-status -- --live` | **SKIP** — `DATABASE_URL` boş; bilinçli log |
| 6 | Sır | `npm run verify:no-secrets` | **PASS** |
| 7 | IDOR | `npm run verify:idor-seals` | **PASS** — 5 dosya / 17 test |
| 8 | Test (canlı) | `npx vitest run tests/career tests/sales/kurumsal-screening.test.ts tests/sales/employer-verify-and-bands.test.ts` | **PASS** — 27 dosya / 131 test |
| 8b | Test (donmuş kurumsal) | `npx vitest run --config vitest.frozen.config.ts tests/kurumsal/employer-verify-and-bands.test.ts tests/kurumsal/screening-entitlement.test.ts` | **PASS** — 2 dosya / 7 test |
| 9 | Build | `npx next build` | **PASS** |

---

## Faz 2 — B2B İK & Doğrulanmış Kanıt Ekosistemi

### F2.1 / Y1 — İşveren kimlik doğrulama
- `KurumsalJobPosting.taxNumber` + `verifiedEmployerAt`
- Doğrulanmamış ilan: `robots: { index: false, follow: false }` + «Kurumsal kimlik doğrulaması beklemede»
- Doğrulanmış: «Doğrulanmış İşveren ✓» + index açık
- Kokpit vergi/MERSİS alanı; otomatik doğrulama yok (dürüstlük)

### F2.2 / Y4 — HMAC mühür + üçüncü taraf doğrulama
- `lib/career/seal-hmac.ts` — `HMAC-SHA256` kanonik yük; `CAREER_SEAL_HMAC_SECRET` veya JWT derive / lab fallback
- `YetkinCvSeal.hmacSignature` (eski satırlar `null` — geriye dönük uyumlu)
- `GET /api/career/verify/[hash]` — `public`, rate-limitli → `{ valid, issuedAt, roleKey, verticalKey, score, hmacValid, signature }`
- `/vize/[id]` HMAC durumu + doğrulama ucu
- `scripts/verify-career-seal.ts` — sunucuya sormadan imza doğrulama

### F2.3 / Y8 — JSON-LD
- `buildJobPostingJsonLd` → `/ilan/[slug]`
- `buildTalentDirectoryJsonLd` (`ItemList` + `Person` / `hasCredential`) → `/uzmanlar`
- `buildCredentialJsonLd` (`EducationalOccupationalCredential`) → `/vize/[id]`

### F2.4 / O9 — Aday bandı & durum kartı
- `QUALIFIED_NOT_SHORTLISTED` («Barajı geçti — yedek liste»); baraj altı `BELOW_THRESHOLD`
- `/career` `ApplicationStatusCards`
- Prisma enum `QUALIFIED_NOT_SHORTLISTED`; DB’de baraj altı `REJECTED`

### F2.5 / Y6 — YetkinHibe kanıt damgası
- `PassportStampSourceKind` / Prisma `CareerVisaSourceKind`: `YETKINHIBE_PROJECT`
- `ProofReadPort` + `POST /api/career/hibe-proof` (IDOR: `userId`, idempotent)

### F2.6 / Y9 — Görüşme daveti hunisi
- `CareerContactRequestStatus`: `PENDING` / `ACCEPTED` / `DECLINED`
- `GET/POST /api/career/interview`; panel Kabul Et / Reddet; aday e-postası basılmaz

### F2.7 / O2 — Dizin ölçekleme
- `talent-directory-load`: `take` / `page` / `pageSize` (üst sınır 200; varsayılan 40)
- Sınırsız `findMany` kaldırıldı

### F2.8 / O6 — RLS canlı kapı
- `verify:rls-status --live` → `pg_class` / `pg_policies`
- `DATABASE_URL` yoksa: `SKIP (canlı DB bağlantısı yok)`

### F2.9 / O4 — Aday beyanı etiketi
- Kokpit: «Aday beyanı (doğrulanmamış metin)» (`data-candidate-claim-label`)

### F2.10 / O5 — Idempotent mühür
- Faz 1’de kapatıldı (`P2002` → mevcut mühür); Faz 2’de bozulmadı

### O8 — Zod standardizasyonu
- `yetkinCvStartSchema` / `yetkinCvSubmitSchema` + `parseYetkinCvStart` / `parseYetkinCvSubmit`

---

## Faz 2 Test Paketleri

| Dosya | Kapsam |
|---|---|
| `tests/career/seal-hmac-and-verify.test.ts` | Y4 HMAC + verify rotası |
| `tests/career/hibe-and-interview.test.ts` | Y6 hibe damgası + Y9 davet |
| `tests/career/jsonld-and-directory-scale.test.ts` | Y8 JSON-LD + O2 sayfalama + O8 Zod |
| `tests/kurumsal/employer-verify-and-bands.test.ts` | Y1 / O9 / O4 (frozen config) |
| `tests/sales/employer-verify-and-bands.test.ts` | Aynı mühürler (canlı suite) |

---

## Migration

`prisma/migrations/20261124140000_career_faz2_ecosystem/migration.sql`:
- `yetkin_cv_seals.hmac_signature`
- `kurumsal_job_postings.tax_number` + `verified_employer_at`
- `KurumsalJobApplicationStatus.QUALIFIED_NOT_SHORTLISTED`
- `CareerVisaSourceKind.YETKINHIBE_PROJECT`
- `CareerContactRequestStatus` + `career_contact_requests.status` / `responded_at`

Yeni tablo yok; mevcut FORCE RLS tabloları sicilde kaldı.

---

## Nihai Puan Kartı — **62 → 89 / 100**

| Boyut | Faz 1 öncesi | Faz 2 sonrası | Gerekçe |
|---|---|---|---|
| **Mimari** | 17/25 | **22/25** | HMAC mühür, ProofReadPort hibe, dizin sayfalama, Zod, canlı RLS kapısı |
| **İşlevsellik** | 17/30 | **26/30** | İşveren doğrulama, yedek liste bandı, hibe kanıtı, görüşme daveti, başvuru durum kartı |
| **Ticari Farklılaşma** | 14/25 | **22/25** | Üçüncü taraf HMAC verify, hibe→vize köprüsü, doğrulanmış işveren sinyali |
| **UX / Vitrin** | 14/20 | **19/20** | JobPosting/Person/Credential JSON-LD, noindex disiplini, beyan etiketi, HMAC yüzeyi |
| **TOPLAM** | **62** | **89 / 100** | Faz 2 çıkış kapısı (88) aşıldı |

---

## Faz 1 Özeti (önceki oturum)

### 1. Sınav bütünlüğü (`K1`, `Y3`, `O3`, `O5`)
- 5 dikey × 12 soru; oturum 8 soru; şık karıştırma; 3 deneme / 30 gün; rate limit; P2002 idempotent.

### 2. CareerCv + PDF/DOCX (`K3`, `Y5`, `O1`)
- Yapılandırılmış CV, PDF/DOCX, dizin il filtresi.

### 3. Dizin kilidi + iletişim (`K4`, `Y9`)
- Yalnız `sealedPublication`; ücretsiz vize noindex; iletişim rızası.

### 4. B2B lisans (`K2`)
- `job-screening-pack` entitlement → 402.

### 5. Tezgâh dürüstlüğü + KVKK (`Y2`, `O7`, `Y7`)
- `outputHash`; tezgâh ≠ mühür; privacy silme.

---

## Kapanış

Faz 2 (`F2.1`–`F2.10`) kod + test + kapı düzeyinde kapatıldı. XSS (`escapeHtml` / sıfır `dangerouslySetInnerHTML` kariyer yüzeylerinde) ve `publicTalentCardHasIdentityLeak` gevşetilmedi. Sen aksi ve sınır kapıları yeşil. Canlı RLS bu oturumda `DATABASE_URL` olmadığı için bilinçli **SKIP**; `--live` yolu kodda hazır.
