# Vercel Canlı Yayın Raporu

| Alan | Değer |
|------|--------|
| Tarih | 31 Ağustos 2026 |
| Rol | Baş Mimar / Teknik Lider |
| Hedef | `https://yetkin.ai` production + PayTR üye işyeri denetçi tarayıcı yüzeyi |
| Yöntem | Vercel CLI (`yetkin-git/yetkin-ai`), canlı HTTP probe, env listesi (sır değeri yazılmaz) |
| Bağlayıcı anayasa | `.system_docs/ANAYASA.md` |
| Önceki sicil | `docs/TESPIT_RAPORU.md` / `docs/TEDAVI_RAPORU.md` (aynı gün, kod P0) |

**Tek cümlelik hüküm:** Production freeze kaldırıldı; nihai build `yetkin.ai` alias’ına bağlandı; kamu/yasal yüzey ve akademi vitrini 200; `GET /api/health` readiness `ok` (db + Auth + Inngest + payments + examSitting). PayTR denetçisi tarayıcıyla yasal metinleri ve ürünleri görebilir. Git `origin/main` bu CLI dağıtımını henüz taşımaz.

---

## Kritik sorular

### `https://yetkin.ai` şu an PayTR denetçisinin tarayıcıyla girip tüm yasal metinleri ve ürünleri görebileceği %100 canlı durumda mı?

**Evet — denetçi tarayıcı yüzeyi canlıdır.** `SITE_MAINTENANCE_FREEZE` production’dan silindi. Ana sayfa bakım 503’ü basmaz. `/legal`, alt sayfalar, `/iletisim` ve `/academy` 200 HTML döner. Yasal metinde «ebeveyn» vaadi yoktur; «18 yaş ve üzerindeki kullanıcılar» ve 31 Ağustos 2026 yürürlük cümlesi canlıdır.

Bu, nakit yolunun (canlı `PaymentOrder.CLEARED` tanığı, webhook IP listesinin *değer* teyidi) bu oturumda yeniden kanıtlandığı anlamına gelmez. Denetçinin görmesi gereken yüzey yasal HTML + ürün vitrinidir.

### Vercel ortam değişkenlerinde veya veritabanı bağlantısında (Pooler :6543) canlıya çıkışı engelleyen herhangi bir açık kaldı mı?

**Denetçi tarayıcı + readiness ping için hayır.** Freeze yok. `NEXT_PUBLIC_APP_URL=https://yetkin.ai`. `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` production listesinde yok (boş/unset). `GET /api/health` `checks.db=ok`.

**Kalan ops açıklıkları (canlı 503 değil, sicil dürüstlüğü):**

1. `DATABASE_URL` secret’tır; Vercel CLI production pull değeri `[SENSITIVE]` basar. Bu oturumda host:port *metni* çözülmedi. Canlı ping yeşil. Dashboard’da transaction pooler `postgres.<ref>@…pooler.supabase.com:6543` teyidi operatör gözüyle kilitlenmeli (runbook tercihi). Session pooler `:5432` aynı hostta IPv4 yedektir; Direct `db.<ref>:5432` Vercel runtime’da yasaktır.
2. Vercel–Supabase entegrasyonu `POSTGRES_HOST=db.<ref>.supabase.co` (Direct) enjekte eder. Rail runtime `DATABASE_URL` okur; entegrasyon Direct host’u uygulama URL’si değildir.
3. Git `origin/main` (`820cc7e`) bu CLI gövdesinin gerisindedir. GitHub’dan «Redeploy» eski yasal metni geri getirir.

### Platform «Canlı Yayında» mührünü aldı mı?

**PayTR denetçi tarayıcı mührü: evet.** Freeze kapalı, alias `https://yetkin.ai`, yasal + akademi 200, health 200.

**Git pin mührü: hayır.** Dağıtım CLI çalışma ağacındandır; `main` push’u bekler. Bu rapor «git SHA = production» iddiası taşımaz.

---

## 1. Freeze kaldırma

| Adım | Sonuç |
|------|--------|
| Önce | Production `SITE_MAINTENANCE_FREEZE="true"` (Config). Canlı kod (29 Ağustos) kenar freeze intercept’i taşımıyordu; ana sayfa zaten 200 idi. Yeni kenar (`proxy.ts`) freeze açıkken ürünü 503’e çeker — dağıtımdan önce silmek zorunluydu. |
| İşlem | `vercel env rm SITE_MAINTENANCE_FREEZE production --yes` |
| Sonra | Production / Preview listesinde anahtar yok. Preview’da da freeze yok. Development env boş. |

Uyum yüzeyi (`/legal`, `/iletisim`, robots, sitemap, health) freeze açıkken bile 503 basmaz; canlı yayın için bayrak yine **boş** olmalıdır. Bu koşul sağlandı.

---

## 2. Ortam değişkenleri checklist (sır basılmaz)

| Anahtar | Production teyidi | Kanıt |
|---------|-------------------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://yetkin.ai` | Config pull (düz metin) |
| `PAYTR_SANDBOX` | unset | `vercel env ls production` listesinde yok |
| `PAYTR_ALLOW_MOCK_CHECKOUT` | unset | listede yok |
| `ACADEMY_EXAM_SITTING_SECRET` | tanımlı, **≥16 karakter** | Secret listede var; canlı `checks.examSitting=configured` |
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | üçlü dolu | `checks.payments=configured` |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | çift dolu | `checks.inngest=configured` |
| `NEXT_PUBLIC_SUPABASE_URL` + `_ANON_KEY` | dolu | `checks.supabaseAuth=configured` |
| `DATABASE_URL` | tanımlı, ping ok | Secret; `checks.db=ok`. Host:port CLI’da redakte. |
| `DIRECT_URL` | tanımlı (migrate) | Secret; runtime ping bunu kullanmaz |
| `PAYTR_WEBHOOK_IP_ALLOWLIST` | anahtar var | Secret; *değer* bu oturumda okunmadı |
| `RAIL_DRON_ORIGINS` | anahtar var | Closed Testing / üretim reçetesi boş; değer redakte |
| `TRUSTED_PROXY_HOPS` | tanımlı | Secret |
| `SITE_MAINTENANCE_FREEZE` | **yok** | `env rm` + sonraki `env ls` |

Entegre ama Rail kodunun okumadığı yüzey (canlı 503 nedeni değil): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTGRES_*`. Anayasa: `service_role` Rail’de kullanılmaz.

---

## 3. Canlı HTTP probe (dağıtım sonrası)

Tarih: 31 Ağustos 2026, dağıtım `dpl_GF5LLrmYhG8uqAUWNZo4A9WCNRoo` alias’ından sonra.

| URL | HTTP | Not |
|-----|------|-----|
| `https://yetkin.ai/` | 200 | Başlık `yetkin.ai`. Freeze HTML yok. |
| `/legal` | 200 | «ebeveyn» yok. 18+ cümlesi var. Yürürlük 31 Ağustos 2026. |
| `/legal/gizlilik` | 200 | |
| `/legal/iade` | 200 | |
| `/legal/mesafeli-satis` | 200 | |
| `/legal/kullanim-sartlari` | 200 | |
| `/iletisim` | 200 | |
| `/sitemap.xml` | 200 | `lastmod` 2026-08-31. `<loc>` göreli (`/` …) — denetçi tarayıcıyı etkilemez. |
| `/robots.txt` | 200 | Cloudflare managed preamble + Next `Allow: /legal…` / `/iletisim`. |
| `/academy` | 200 | Ürün vitrini (Python / AI Agent slugs; kart/href sayısı > 0). |
| `GET /api/health` | 200 | aşağıda |
| `GET /api/health/live` | 200 | liveness; `db=unconfigured` beklenen (ping yok) |

### `GET /api/health` (readiness)

```json
{
  "ok": true,
  "data": {
    "service": "yetkin-rail",
    "probe": "readiness",
    "status": "ok",
    "checks": {
      "db": "ok",
      "supabaseAuth": "configured",
      "inngest": "configured",
      "payments": "configured",
      "examSitting": "configured"
    }
  }
}
```

Readiness bağımlılıkları (db + Auth + Inngest) canlıya uygun. `examSitting` ve `payments` bilgi alanıdır; ikisi de `configured`.

Vercel runtime error log (`--environment production --level error --since 30m`): kayıt yok.

---

## 4. Vercel production build

| Alan | Değer |
|------|--------|
| Proje | `yetkin-git/yetkin-ai` (`prj_z7GIu1zwSAg7Axne547bFBNsNU4q`) |
| Dağıtım | `dpl_GF5LLrmYhG8uqAUWNZo4A9WCNRoo` |
| URL | `https://yetkin-rczluwut7-yetkin-git.vercel.app` |
| Alias | `https://yetkin.ai` (ayrıca `www.yetkin.ai`) |
| Inspect | `https://vercel.com/yetkin-git/yetkin-ai/GF5LLrmYhG8uqAUWNZo4A9WCNRoo` |
| Hedef | production · `readyState: READY` |
| Bölge | iad1 |
| Komut | `vercel deploy --prod --yes --logs --force --archive=tgz` |
| Paket | 3286 dosya / ~64.6 MB arşiv (`.vercelignore`: `.next`, `node_modules`, müze) |

### Derleme sicili (Vercel log)

| Adım | Sonuç |
|------|--------|
| `verify:no-secrets` | OK |
| `verify:amount-minor` | OK |
| `verify:rls-status` | OK |
| `verify:v1-contract-artifacts` | OpenAPI + dron tipleri OK |
| `verify:idor-seals` | OK (6 dosya / 15 test) |
| Next compile | ✓ 24.2s |
| TypeScript | Finished 18.4s — hata yok |
| Static pages | 57/57 |
| `npm run build` | exit 0 |

**ESLint:** `package.json` `build` zinciri ESLint çalıştırmaz (`lint` ayrı script). Vercel production logunda lint adımı yoktur. Bu dağıtım TypeScript + `verify:prebuild` ile yeşil; ESLint bu build’in kapısı değildir.

### İlk deneme (başarısız) — düzeltildi

`archived` + `apps` `.vercelignore` ile düşürülünce `next build` typecheck, testlerin arşiv/dron import’larında TS2307 verdi. Ayrıca:

- `lib/kernel/db.ts` — `engineOk` daraltması TS2367; uçuş çözülünce `return true`
- `tests/kernel/postgres-url.test.ts` — `ProcessEnv` `NODE_ENV`
- `tests/freelancer/idor-direct-offers.test.ts` — 410 handler tek `Request`
- `tests/freelancer/job-visa-pathway.test.ts` — Prisma `code` ataması
- `archived/lib/academy-studio/studio-live.ts` — 5 perde başlığı 4 perdeye daraltıldı

İkinci production build yeşil. `archived` ve `apps` tekrar yüklendi (typecheck kökleri).

---

## 5. Bilinçli kapılar (mühür sapması değil)

Anayasa / tedavi sicili — denetçi bunları «eksik oda» sanmamalı:

- Freelancer `accept` split stub → 503 `"Ödeme henüz bağlanmadı"`
- `/api/wallet/withdraw` yok (S43)
- Dron mağaza yayını donuk
- GİB / e-Arşiv paneli yok (yasal metin bunu söyler)

---

## 6. Operatör kuyruğu (bu raporun dışı, dürüst borç)

1. Çalışma ağacını `main`’e commit/push — aksi halde GitHub Redeploy eski gövdeyi basar.
2. Dashboard: `DATABASE_URL` = transaction pooler `:6543` + `postgres.<ref>` kullanıcı.
3. `PAYTR_WEBHOOK_IP_ALLOWLIST` değerinin PayTR Destek IP listesi olduğunu doğrula (HMAC-only lab üretim reçetesi değildir).
4. Hosted `ops:migrate` — `user_billing_info.phone` migrasyonu canlı şemada yoksa checkout/billing yazımı düşer; kamu yasal sayfa bu kolona bağlı değildir.
5. `engines.node: >=20.19.0` Vercel uyarısı: major otomatik sıçrama. Sabit 20.x/22.x tercih edilir.

---

## 7. Hüküm

| Mühür | Durum |
|-------|--------|
| Freeze kapalı | Evet |
| Yasal + iletişim + robots/sitemap 200 | Evet |
| Ürün vitrini (`/academy`) 200 | Evet |
| `NEXT_PUBLIC_APP_URL` | `https://yetkin.ai` |
| Sandbox / mock production | Yok |
| Sınav sırrı ≥16 | Evet (`examSitting=configured`) |
| Readiness 200 | Evet |
| Production build / alias | READY · `yetkin.ai` |
| Git = production | Hayır |
| Pooler :6543 metin teyidi | CLI redakte; ping ok |

**PayTR üye işyeri denetçisi `https://yetkin.ai` adresine girebilir.** Platform bu raporun tarayıcı kapsamı için canlı yayındadır.
