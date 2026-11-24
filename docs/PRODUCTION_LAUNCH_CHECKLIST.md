# yetkin.ai — Production Launch Checklist

**Tarih (UTC):** 2026-11-24  
**Operatör rolü:** CTO / DevOps-SRE launch run  
**Hat:** Supabase → GitHub → Vercel → Cloudflare  
**Güvenlik:** Bu belgede hiçbir sır, bağlantı dizgisi, API anahtarı, JWT veya PayTR sırrı yok.

---

## Özet karar

| Alan | Durum | Not |
|---|---|---|
| Pre-flight kapıları | **PASS** | tsc, sen-axis, boundaries, api-auth, no-secrets, idor-seals |
| Supabase göçleri (6 bekleyen) | **APPLIED** | `migrate deploy` sonrası şema up-to-date |
| Canlı FORCE RLS | **PASS** | `verify:rls-status --live` |
| GitHub `main` push | **DONE** | `07742426` (+ lint düzeltme commit’i) |
| GitHub Actions CI | **FAIL → lint düzeltildi** | amiral lint kırmıştı; kaynak düzeltildi, yeniden push |
| Vercel Production deploy | **KISMİ / BEKLEMEDE** | CLI oturumu yok; canlı hâlâ eski yüzeyi servis ediyor |
| Cloudflare DNS/SSL/WAF (dışarıdan) | **PASS (çıkarım)** | Proxy açık; origin Vercel; `/api/*` cache DYNAMIC |
| Canlı duman testleri | **PASS** (mevcut prod yüzeyi) | `/academy` 410; SEO uçları OK |
| Blokajlar | **AÇIK** | `CRON_SECRET` Production’da yok; Vercel CLI auth yok; yeni commit henüz edge’de değil |

---

## AŞAMA 1 — Pre-Flight & ortam anahtar denetimi

### 1.1 Kritik anahtarlar (değer yazdırılmadı)

Kaynak: yalnızca `.env.local` anahtar **varlığı** (değer yok).

| Anahtar | Durum |
|---|---|
| `DATABASE_URL` | DEFINED_NONEMPTY |
| `DIRECT_URL` | DEFINED_NONEMPTY |
| `CAREER_SEAL_HMAC_SECRET` | **MISSING (lokal)** — kod `SUPABASE_JWT_SECRET` derive edebilir; Production secret store’da ayrı anahtar önerilir |
| `PAYTR_MERCHANT_ID` | DEFINED_NONEMPTY |
| `PAYTR_MERCHANT_KEY` | DEFINED_NONEMPTY |
| `PAYTR_MERCHANT_SALT` | DEFINED_NONEMPTY |
| `CRON_SECRET` | ABSENT lokal — **Production’da da eksik** (Aşama 6 kanıtı) |
| `NEXT_PUBLIC_SITE_URL` | ALIAS_OK via `NEXT_PUBLIC_APP_URL` |
| `NEXT_PUBLIC_APP_URL` | DEFINED |
| `DRON_ACADEMY_OPEN` | ABSENT (kapalı OK) |

### 1.2 Statik / derleme kapıları

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run verify:sen-axis` | PASS — 725 dosya |
| `npm run verify:boundaries` | PASS |
| `npm run verify:api-auth -- --check` | PASS — 175 route |
| `npm run verify:no-secrets` | PASS |
| `npm run verify:idor-seals` | PASS — 5 test dosyası / 17 test |

---

## AŞAMA 2 — Supabase göçleri & canlı RLS

### 2.1 `prisma migrate status` (deploy öncesi)

86 migration; **henüz uygulanmamış 6:**

1. `20261124013000_tezgah_quota_commands`
2. `20261124120000_career_faz1_integrity`
3. `20261124140000_career_faz2_ecosystem`
4. `20261124180000_career_kurumsal_payment_purpose`
5. `20261124190000_super_admin_audit_employer_verify`
6. `20261124220000_academy_junior_payment_purpose`

### 2.2 `prisma migrate deploy`

**All migrations have been successfully applied.** (6/6)

### 2.3 `prisma migrate status` (deploy sonrası)

**Database schema is up to date!**

### 2.4 `npm run verify:rls-status -- --live`

**PASS** — Auth sync + e-posta senkronu + **FORCE RLS** + owner SELECT + kapsamsız deny.  
Prisma tabloları (örnek set): `academy_*`, `career_*`, `commerce_*`, `escrow_holds`, `freelancer_*`, `junior_*`, `kurumsal_*`, `ledger_entries`, `payment_*`, `super_admin_audit_logs`, `tezgah_*`, `users`, `wallets`, `yetkin_cv_*`, `yetkinhibe_*`, …

---

## AŞAMA 3 — GitHub commit & push

| Madde | Değer |
|---|---|
| Dal | `main` |
| Push (ürün) | `46f033f4..07742426` → `origin/main` |
| Commit (ürün) | `07742426ffe0dde1a220521baea1d7f286d511b1` |
| Mesaj (ürün) | `feat(prod): tezgah/career/commerce/hibe mühürleri ve 6 bekleyen göçü canlıya hazırla` |
| Push (lint+checklist) | `07742426..fded9df9` → `origin/main` |
| Commit (lint+checklist) | `fded9df9ccb85b55ed51b0a8e90f50cc58c94704` |
| Gizli dosya | `.env` / `.env.local` / `.tmp` gitignore; stage taramasında sızma yok |
| CI (`gh` yok) | İlk ürün commit’inde run `45478644846` — **amiral lint FAIL**, rail-is PASS, pg-lab FAIL; lint fix sonrası yeniden koşuluyor |

**CI notu:** `amiral` job’ında `npm run lint` düşmüştü (22 hata). Kaynak düzeltildi. `pg-lab` ayrı lab job’ı; canlı migrate zaten uygulandı.

---

## AŞAMA 4 — Vercel Production & env senkron

| Madde | Sonuç |
|---|---|
| `vercel` CLI | Kurulu değil / `npx vercel` → **Logged out** (cihaz OAuth akışı; oturum açılamadı) |
| `VERCEL_TOKEN` | Ortamda **yok** |
| Proje bağı (yerel) | `.vercel/project.json` → `projectName=yetkin-ai`, region reçetesi `fra1` (`vercel.json`) |
| Canlı kenar | `x-vercel-id: fra1::…` — Production Vercel FRA1 cevap veriyor |
| Yeni commit yüzeyi | `/api/career/verify/[hash]` ve `/api/career/contact` hâlâ genel **404 “API yolu bulunamadı”** → **07742426 henüz Production’da servis edilmiyor** |
| Cron env | `GET /api/cron/license-gap` → `503` + `"CRON_SECRET tanımlı değil. Mutabakat kapalı."` |

### Operatör aksiyonu (Vercel Dashboard — değer bu dosyaya yazılmaz)

1. Production env’e **`CRON_SECRET`** ekle (≥16 karakter rastgele).
2. **`CAREER_SEAL_HMAC_SECRET`** ekle (≥16; JWT derive yerine ayrı mühür).
3. PayTR üçlüsü + Supabase URL/anon + `DATABASE_URL` (pooler :6543) + `DIRECT_URL` (yalnız ops) doğrula.
4. `vercel login` veya `VERCEL_TOKEN` ile `npx vercel --prod` / Git entegrasyonundan **07742426+** redeploy tetikle.
5. Redeploy sonrası `/api/career/verify/<64hex>` yanıtının `"Mühür bulunamadı."` (route hit) olduğunu doğrula.

`vercel.json` cron:

- `/api/cron/paytr-reconcile` — `0 3 * * *`
- `/api/cron/license-gap` — `15 3 * * *`

---

## AŞAMA 5 — Cloudflare DNS, SSL, WAF, cache

**API token yok** (`CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` false). Doğrulama dış HTTP + DNS ile yapıldı.

### 5.1 DNS & proxy

| Kayıt | Gözlem | Yorum |
|---|---|---|
| NS | `bruce.ns.cloudflare.com`, `galilea.ns.cloudflare.com` | Cloudflare DNS |
| `yetkin.ai` A | `104.21.53.219`, `172.67.219.42` | Cloudflare anycast (proxy ON) — çıplak `76.76.21.21` beklenmez |
| `www.yetkin.ai` A | Aynı CF anycast | Proxy ON |
| Origin kanıtı | Yanıtlarda `x-vercel-id` + `server: cloudflare` | CF → Vercel zinciri çalışıyor |
| `www` | `308` → `https://yetkin.ai/` | Kanonik yönlendirme OK |

**SSL/TLS Full (Strict):** Dashboard modu API’siz okunamadı. Çalışan CF kenar sertifikası + origin’den `x-vercel-id` dönmesi, origin TLS’in ayakta olduğunu gösterir. Dashboard’da **SSL/TLS → Full (Strict)** operatör onayı gerekir.

### 5.2 Kritik uçlar — Bot/WAF engeli yok (HTTP kanıtı)

| Uç | HTTP | CF-Cache | Yorum |
|---|---|---|---|
| `GET /api/paytr/callback` | **200** | DYNAMIC | WAF engellemiyor (boş gövde yoklama) |
| `GET /api/cron/license-gap` | **503** (uygulama) | DYNAMIC | CF challenge yok; app `CRON_SECRET` eksik |
| `GET /api/cron/paytr-reconcile` | **503** (uygulama) | DYNAMIC | Aynı |
| `GET /api/tezgah/quota` | **200** | DYNAMIC | Kamu API erişilebilir |
| `GET /api/career/verify/…` | **404** JSON | DYNAMIC | 500 değil; CF engeli yok |

### 5.3 Cache kuralı `/api/*`

Tüm ölçülen `/api/*` yanıtlarında `cf-cache-status: DYNAMIC` (HIT yok). Uygulama `Cache-Control` çoğunlukla `no-store` / `max-age=0`. **Edge cache bypass görünümü OK.**

---

## AŞAMA 6 — Canlı duman testleri

Hedef: `https://yetkin.ai` (aktif Production URL)

| İstek | Beklenen | Gerçek | Sonuç |
|---|---|---|---|
| `GET /` | 200 | 200 OK | PASS |
| `GET /tezgah` | 200 / yönlendirme | 200 OK | PASS |
| `GET /career` | 200 | 200 OK | PASS |
| `GET /uzmanlar` | 200 | 200 OK | PASS |
| `GET /kurumsal` | 200 | 200 OK | PASS |
| `GET /academy` | **410 Gone** | **410 Gone** | PASS |
| `GET /api/career/verify/nonexistent-hash-check` | 404 JSON, 500 değil | 404 `{"ok":false,"error":"API yolu bulunamadı.",…}` | PASS (temiz JSON; yeni `[hash]` rotası henüz deploy edilmediği için genel 404) |
| `GET /sitemap.xml` | 200; `/academy` yok; `/uzmanlar`+`/kurumsal` var | 200; `career`,`tezgah`,`kurumsal`,`uzmanlar` loc var; `academy` loc yok | PASS |
| `GET /robots.txt` | 200; `/uzmanlar`+`/kurumsal` allow; academy disallow | 200; Allow satırlarında `/uzmanlar`,`/kurumsal`; `Disallow: /academy` | PASS |
| `GET https://www.yetkin.ai/` | kanonik | 308 → `https://yetkin.ai/` | PASS |

### robots / sitemap notu

`robots.txt` başında Cloudflare Managed Content-Signal bloğu + uygulama Allow/Disallow listesi birleşik dönüyor. Sitemap’te `/academy` yok.

---

## Go-Live kapısı (kalan iş)

1. **Vercel Production:** `CRON_SECRET` + `CAREER_SEAL_HMAC_SECRET` set → redeploy (`07742426` veya sonraki lint-fix commit).
2. Redeploy sonrası doğrula: `/api/career/verify/<64hex>` → `"Mühür bulunamadı."` (route hit); cron 503’ü `401`/authorized path’e düşer.
3. Cloudflare Dashboard: SSL **Full (Strict)**; Bot Fight / WAF’da PayTR + cron allowlist teyidi.
4. GitHub CI yeşil olana kadar `amiral` lint + gerekirse `pg-lab` lab job’ını izle.
5. Son kapı: `npm run verify:no-secrets` → **PASS** (bu run’da PASS).

---

## Çalıştırılan komut envanteri (sırlar yazdırılmadan)

```text
node .tmp/env-key-audit.mjs          # yalnızca anahtar varlığı
npx tsc --noEmit
npm run verify:sen-axis
npm run verify:boundaries
npm run verify:api-auth -- --check
npm run verify:no-secrets
npm run verify:idor-seals
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
npm run verify:rls-status -- --live
git status / git diff --stat / git add -A / git commit / git push origin main
npm run lint                         # FAIL → düzeltildi → PASS
curl.exe duman + DNS Resolve-DnsName
```

**verify:no-secrets (kapanış):** PASS — PEM / service_role JWT / yasaklı `.env.example` ataması / git `.env` yok.
