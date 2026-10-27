# Dağıtım raporu — 27 Ekim 2026

Canlı site bu turda **güncellenmedi**. `main` GitHub'a gitti. Üç üretim dağıtımı derleme başlamadan başarısız kapandı. Şu an https://yetkin.ai önceki sürümü sunuyor.

## 1. GitHub

Dal: `main` → `origin/main` (`https://github.com/yetkin-git/yetkin.ai.git`).

Önceki canlı uç: `1445f1a`. Bu turda gönderilen uç: `89e7f8e`.

| Commit | Mesaj |
|---|---|
| `8836cb0` | refactor(junior/api): unify junior lesson engine shell and consolidate closed bff surface |
| `b7c291d` | refactor(analytics/academy): expand 1st-party conversion funnel and refine focus course pitches |
| `1969fa2` | fix(academy/junior): seal curriculum, sale gates, and public metadata |
| `f9b676b` | fix(deploy): accept a daily PayTR cron and the junior player read model |
| `89e7f8e` | fix(deploy): remove the cron that rejected production before build |

`1969fa2` çalışma ağacındaki mühür, müfredat, satış kapısı ve SEO düzeltmelerini taşır (717 dosya). Gizli dosya, `node_modules` ve `/generated/` stage edilmedi.

Yerel kapılar, push öncesi:

- `npx tsc --noEmit` — çıkış 0
- `npx vitest run` — 393 dosya, 1911 test geçti
- `npm run verify:api-auth -- --check` — 77 rota, sapma yok

Bu yerel testler diskteki medyayla koştu. CI'daki sonuç aşağıda; ikisi aynı kapı değil.

## 2. Supabase

Bağlantı bu makinedeki `.env.local` üzerinden okundu. Değerler rapora yazılmadı.

| Kontrol | Sonuç |
|---|---|
| Proje host | `mflgqedoocqpxmtryvca.supabase.co` |
| `DIRECT_URL` | `aws-0-eu-central-1.pooler.supabase.com:5432` |
| `DATABASE_URL` | aynı havuz, port `6543` |
| Diskteki Prisma migrasyonu | 44 |
| Uygulanmış | 43, sonra 44 |
| Bekleyen | `20261024170000_junior_mat_meb_lesson_key` uygulandı |

`npx prisma migrate deploy` çıktısı: `All migrations have been successfully applied.`

`junior_progress` satır sayısı 0 olduğu için MEB ders anahtarı güncellemesi 0 satır yazdı. İkinci kez çalıştırılmaz; Prisma kaydı bunu kilitler.

`academy_purchases_guard_ledger` fonksiyonu ve `recon-ledger-19011370-ac01officeai` satırı bu turdan önce de vardı. `supabase/migrations/20261026220000_academy_purchase_ledger_guard.sql` depoya girdi. `ops:migrate` çalıştırılmadı: o komut `supabase/migrations` altındaki bütün SQL dosyalarını her seferinde yeniden uygular.

## 3. Ortam değişkenleri

Vercel Production kasası okunamadı. CLI oturumu yok (`vercel whoami` → logged out). `VERCEL_TOKEN` boş.

Bu makinedeki `.env.local` (yalnız varlık):

| Anahtar | Durum |
|---|---|
| `SUPER_ADMIN_USER_ID` | dolu, UUID biçimi |
| `CANONICAL_SUPER_ADMIN_EMAIL` | dolu |
| `NEXT_PUBLIC_SUPABASE_URL` | dolu, host yukarıda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dolu |
| `SUPABASE_SERVICE_ROLE_KEY` | dolu |
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | dolu |
| `PAYTR_SANDBOX` | dolu (yerel laboratuvar) |
| `PAYTR_ALLOW_MOCK_CHECKOUT` | boş |
| `NEXT_PUBLIC_APP_URL` | `localhost:3000` |
| `CRON_SECRET` | boş |
| `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` | boş |

Yerel `PAYTR_SANDBOX` ve `localhost` üretim kopyası değildir. Üretimde `NEXT_PUBLIC_APP_URL` `https://yetkin.ai` olmalı; PayTR canlı üçlüsü durmalı; `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` boş olmalı. Bu üçü Vercel panelinden teyit edilmedi.

## 4. Vercel

Üretim derlemesi üç kez tetiklendi. Üçü de derleme günlüğü oluşmadan `failure` kaldı. Canlı trafik önceki dağıtımda.

| Uç | Dağıtım | Sonuç |
|---|---|---|
| `1969fa2` | `dpl_D5hHCaCP8vvjsZJTiiUbPfYpjeyD` | failure, 27 Ekim 2026 11:59 TR |
| `f9b676b` | `dpl_AmZuFVTpkee6vQvRKhP2CDCDY6hd` | failure, 27 Ekim 2026 12:11 TR |
| `89e7f8e` | `dpl_3owytZvXsXiFeAe9tJDLt8CwoR8k` | failure, 27 Ekim 2026 12:49 TR |

GitHub kaydı her seferinde aynı cümle: `Deployment has failed`. Ayrıntı için Vercel'in verdiği komut:

```bash
npx vercel inspect dpl_3owytZvXsXiFeAe9tJDLt8CwoR8k --logs
```

Bu komut bu makinede oturum olmadığı için çalışmadı. Dağıtım sayfası giriş duvarına düşüyor: https://vercel.com/yetkin-git/yetkin-ai/3owytZvXsXiFeAe9tJDLt8CwoR8k

`89e7f8e` içindeki `vercel.json`, son başarılı uç `1445f1a` ile aynı (yalnız `regions: ["fra1"]`). Cron ifadesini günlük yapmak ve sonra tamamen kaldırmak bu anında kapanmayı değiştirmedi. Cron, tek başına kanıtlanmış neden değil.

`app/api/(kernel)/cron/paytr-reconcile/route.ts` duruyor. `CRON_SECRET` boşsa rota 503 döner. `vercel.json` içinde cron kaydı yok; panelden eklenene kadar Vercel bu rotayı kendisi çağırmaz.

### CI (aynı uç `89e7f8e`)

| İş | Sonuç |
|---|---|
| `rail-is` | success |
| `amiral` | failure — https://github.com/yetkin-git/yetkin.ai/actions/runs/40483653977/job/122119927600 |
| `pg-lab` | failure — günlük kamuya kapalı, kayıt yalnız `exit code 1` |

`amiral` lint'i geçtikten sonra `tests/academy/idor-exam-purchase.test.ts` içinde kırıldı. `lockAcademyCoursePrice` → `requirePublishedCourse` → `academyCourseSaleOpen` false → `GoneError: Kurs satışa kapalı.` (`lib/academy/engine.ts`). Yerelde aynı test, diskteki mühürlü ses olduğu için geçti. CI ve Vercel derlemesi o medyayı taşımaz. Derleme bir kez gerçekten başlarsa `verify:prebuild` içindeki `verify:idor-seals` aynı hatayla çıkış 1 verir. `npx tsc` bu hatayı görmez.

## 5. Cloudflare

| Kayıt | Değer |
|---|---|
| NS | `bruce.ns.cloudflare.com`, `galilea.ns.cloudflare.com` |
| `yetkin.ai` A | `104.21.53.219`, `172.67.219.42` |
| `www.yetkin.ai` A | aynı iki adres; AAAA Cloudflare |
| Apex CNAME | yok (Cloudflare A düzleştirmesi) |

HTTPS el sıkışması hatasız. `Server: cloudflare`. `x-vercel-id` bölgesi `fra1`. HSTS: `max-age=63072000; includeSubDomains; preload`.

SSL/TLS modunun panelde **Full (strict)** olduğu okunamadı; API anahtarı yok. Dışarıdan görülen şey: geçerli HTTPS, Cloudflare kenarı, Vercel kökeni.

Önbellek temizliği **çalıştırılmadı**. Anahtar yok. Yeni bir dağıtım Ready olduktan sonra: Cloudflare → Caching → Purge Everything. HTML bu turda `cf-cache-status: DYNAMIC` / `MISS`. `https://yetkin.ai/robots.txt` ise Vercel kenarında `x-vercel-cache: HIT`, `last-modified: Wed, 21 Oct 2026`, `Age: 499227`. Bunu Cloudflare temizliği değil, yeni bir başarılı Vercel dağıtımı tazeler.

## 6. Canlı sağlık — hâlâ önceki sürüm

Ölçüm: 27 Ekim 2026, yaklaşık 12:25 TR. Yeni uçta beklenen `/academy/ileri` sitemap kaydı yok. `/academy/ileri` 200 dönüyor ama `x-matched-path: /academy/[slug]`; yeni statik sayfa devrede değil.

| Adres | Durum |
|---|---|
| `https://yetkin.ai/robots.txt` | 200 |
| `https://yetkin.ai/sitemap.xml` | 200 |
| `https://yetkin.ai/` | 308 → `/academy` |
| `https://www.yetkin.ai/` | 308 → `https://yetkin.ai/academy` |
| `https://yetkin.ai/academy` | 200 |
| `https://yetkin.ai/junior` | 200 |

## 7. SUPER_ADMIN — sıradaki iş

1. `npx vercel login`, sonra `npx vercel inspect dpl_3owytZvXsXiFeAe9tJDLt8CwoR8k --logs`. Günlük satırı bu raporun eksik parçası.
2. Üretimi bu turla güncellenmiş sayma. Canlı hâlâ `1445f1a` kuşağı.
3. Günlük bulunduktan sonra derlemeyi yeniden başlat. Derleme `verify:idor-seals` adımında `Kurs satışa kapalı` ile düşerse, satış kapısı testi medyasız CI'da da geçmeli.
4. Vercel Production kasasında şunların adlarını doğrula: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, PayTR canlı üçlüsü, boş `PAYTR_SANDBOX`, `SUPER_ADMIN_USER_ID`. Değerleri bu dosyaya yazma.
5. Yeşil dağıtımdan sonra Cloudflare Purge Everything. SSL modunu panelden Full (strict) diye kontrol et.
