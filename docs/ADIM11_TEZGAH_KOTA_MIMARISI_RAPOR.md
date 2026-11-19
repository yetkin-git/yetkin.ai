# Adım 11 — Tezgâh Kota Mimarisinin Ayrıştırılması ve Tetkik Çift Kilit

**Tarih:** 20 Kasım 2026  
**Girdi:** `docs/ADIM10_TEZGAH_KOTA_TESPIT.md`  
**Kapsam:** `prisma/schema/tezgah.prisma`, `lib/tezgah/quota.ts`, `lib/tezgah/catalog.ts`, tetkik/dukkan motorları, `/api/tezgah/quota`, `components/tezgah/workbench.tsx`

---

## Yönetici özeti

Ortak günlük 3/3 havuzu maliyet sınıflarına bölündü:

| Havuz (`poolKey`) | Araçlar | Ücretsiz limit | Yenilenme |
|---|---|---|---|
| `tetkik` | Web Site Analizi | **Ömür boyu 1** | Yenilenmez (`dateKey = "lifetime"`) |
| `lite` | proposal, reklam, pazaryeri, grant, ecommerce | **Günlük 3** | Europe/Istanbul gece yarısı |
| `free_template` | dukkan | Kota dışı | — |
| `local` | studio-photo, technical-drawing, saas-builder | Kota dışı (zaten istemci) | — |

Web Site Analizi için **çift kilit** eklendi: (1) aktör ömür boyu 1 ücretsiz hak, (2) global domain kilidi (`TetkikDomainClaim`). Pro abonelik ve ücretli kredi her iki kilidi aşar.

Sağ üst kota rozeti (`#tezgah-header-quota`) aktif sekmeye göre dinamik metin gösterir.

---

## 1. Veritabanı

### 1.1 `TezgahDailyQuota`

- Yeni kolon: `pool_key` (varsayılan `"lite"`, `VARCHAR(32)`)
- `date_key` genişliği `VARCHAR(16)` (ömür boyu `"lifetime"` için)
- Composite PK: `@@id([dateKey, subjectKey, poolKey])` → `date_key + subject_key + pool_key`
- Migration: `prisma/migrations/20261120140000_tezgah_quota_pools/migration.sql`
- Mevcut satırlar `pool_key = 'lite'` ile korunur

### 1.2 `TetkikDomainClaim`

```text
host                  PK  — www. temizlenmiş, küçük harf hostname
claimed_by_subject_key    — guest:<ip> | userId
created_at
@@map("tetkik_domain_claims")
```

PostgREST: `ENABLE` + `FORCE RLS` + `rls_deny_unscoped` (SELECT false).  
Sicil: `lib/kernel/security/rls-policy-registry.ts` → `tetkik_domain_claims`.

---

## 2. Katalog ve kota çekirdeği

### 2.1 `lib/tezgah/catalog.ts`

- `TEZGAH_TOOL_POOL` — araç → havuz haritası
- `TEZGAH_TETKIK_LIFETIME_LIMIT = 1`, `TEZGAH_TETKIK_DATE_KEY = "lifetime"`
- Mesajlar:
  - `TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE`
  - `TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE`
  - `TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE` (metin Adım 10/11 ürün kararındaki birebir uyarı)
- Rozet yardımcıları: `tezgahPoolQuotaLine`, `tezgahToolQuotaLine`

### 2.2 `lib/tezgah/quota.ts`

- `peek` / `consume` / `refund` 5. argüman (veya peek 4.): `poolKey` (varsayılan `"lite"`)
- Snapshot’a `poolKey` + `unlimited` eklendi
- `free_template`: sayaç yazılmaz; `unlimited: true`, `remaining/limit = 1`
- `tetkik`: `tezgahQuotaDateKey` → `"lifetime"`; limit 1
- Bellek store anahtarı: `dateKey\tsubjectKey\tpoolKey` (Vitest)

---

## 3. Çift kilit (tetkik)

Dosyalar:

- `lib/tezgah/tetkik/site-address.ts` → `tetkikHostKey()`
- `lib/tezgah/tetkik/domain-claim.ts` → `isTetkikDomainClaimed` / `claimTetkikDomain` (+ test bellek store)
- `lib/tezgah/tetkik/engine.ts` akış:

```text
validate URL
peek(tetkik)                     → Kilit 1: ömür boyu hak yoksa Pro/kredi duvarı
lane === free && domain claimed  → Kilit 2: domain mesajı (402), hak düşmez
consume(tetkik)
LLM…
başarısız → refund
lane === free → claim domain; yarışta claimed → refund + domain mesajı
settle (kredi)
```

Pro (`lane === "pro"`) ve kredi (`lane === "credit"`) hem hesap hem domain kilidini aşar; claim yazılmaz.

---

## 4. Motor güncellemeleri

| Motor | Değişiklik |
|---|---|
| `tetkik/engine.ts` | `poolKey: "tetkik"` + çift kilit |
| `engine.ts` (proposal/ecommerce) | `poolKey: "lite"` |
| `reklam` / `pazaryeri` / `grant` | `poolKey: "lite"` |
| `dukkan/engine.ts` | `consume` / `refund` kaldırıldı; sınırsız şablon |

---

## 5. API ve UI

### 5.1 `GET /api/tezgah/quota?tool=<id>`

- `tool` (veya `pool`) ile havuz seçilir; varsayılan `lite`
- Yanıt: `remaining`, `limit`, `used`, `guest`, `lane`, `paywall`, `poolKey`, `unlimited`, `tool`, `line`
- Auth: `public` (değişmedi)

### 5.2 Workbench rozeti

Aktif sekme değişince kota yeniden okunur.

| Sekme | Rozet metni |
|---|---|
| tetkik (hak var) | `Kalan ücretsiz analiz hakkınız: 1 / 1` |
| tetkik (bitti) | `0 / 1 — Pro veya Kredi gerekli` |
| lite araçlar | `Günlük ücretsiz hakkınız: X / 3` |
| dukkan / Pro Studio | `Ücretsiz kullanım (Kota düşmez)` |

`quotaBlocked`: `free_template` ve `local` havuzları muaf. Domain / tetkik kota mesajları üye/misafir upgrade kartlarına bağlandı.

Dashboard `readMemberTezgahQuota` varsayılan `lite` peek kullanmaya devam eder (komuta merkezi günlük 3/3).

---

## 6. Doğrulama

| Komut | Sonuç |
|---|---|
| `npx prisma generate` | OK |
| `npx tsc --noEmit` | OK |
| `npx vitest run tests/tezgah` | **78/78** geçti |
| `npm run verify:api-auth -- --check` | OK (131 rota) |

Güncellenen testler: `quota.test.ts`, `tetkik-engine.test.ts`, `dukkan-engine.test.ts`, `dukkan-xss.test.ts`, `surface.test.ts`, `tetkik-site-address.test.ts`.

---

## 7. Dosya listesi

```text
prisma/schema/tezgah.prisma
prisma/migrations/20261120140000_tezgah_quota_pools/migration.sql
lib/kernel/security/rls-policy-registry.ts
lib/tezgah/catalog.ts
lib/tezgah/quota.ts
lib/tezgah/engine.ts
lib/tezgah/dukkan/engine.ts
lib/tezgah/reklam/engine.ts
lib/tezgah/pazaryeri/engine.ts
lib/tezgah/grant/engine.ts
lib/tezgah/tetkik/engine.ts
lib/tezgah/tetkik/domain-claim.ts          (yeni)
lib/tezgah/tetkik/site-address.ts
app/api/tezgah/quota/route.ts
components/tezgah/workbench.tsx
tests/tezgah/*.test.ts
docs/ADIM11_TEZGAH_KOTA_MIMARISI_RAPOR.md  (bu dosya)
```

---

## 8. Operasyon notu

Canlıya çıkmadan önce migration uygulanmalı:

```bash
npx prisma migrate deploy
```

Eski `tezgah_daily_quotas` satırları otomatik `pool_key = 'lite'` alır. Tetkik ömür boyu sayaçları ve domain claim’leri sıfırdan başlar (geçmiş ücretsiz tetkikler geriye dönük kilitlenmez).

---

## 9. Sonuç

Adım 10’daki maliyet asimetresi kapatıldı: pahalı Hydrogen tetkik artık ortak 3’lük havuzu yakmaz; AI’sız dükkan da hak tüketmez. Ücretsiz katmanda aynı domain platform genelinde bir kez analiz edilir; Pro/kredi sınırsızdır.
