# DEPLOYMENT RAPORU 001 — Dağıtım öncesi kontrol

Tarih: 28 Ekim 2026, 00:10 TSİ  
Kapsam: Phase 1 pre-flight. Push, migrate, R2 yazma, Cloudflare purge ve Vercel deploy çalıştırılmadı.  
Canlı uç: `origin/main` = `e7c00eb` (`docs: record the live deploy after the media-less prebuild fix`). Bu uç repoda duruyor. Çalışma ağacındaki Junior kapak ve oynatıcı farkı bu uçta yok.

Hüküm: kapak CDN katmanı hazır (111/111). Ses katmanı dağıtım kapısını geçiyor, tam senkron değil. Veritabanında bu fark için uygulanacak migrasyon yok. Canlıya gidecek ağaç henüz commit değil.

---

## 1. Dağıtım öncesi mühür durumu

Komutlar bu makinede, çalışma ağacı üzerinde, sırayla koştu.

| Komut | Çıkış | Sonuç |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 | Tip hatası yok |
| `npx vitest run` (ilk, tek başına) | 1 | 394 dosya, 1917 test geçti. Bitişte Vitest işçisi `onTaskUpdate` zaman aşımı verdi. İddia kırılması yok |
| `npx vitest run` (ikinci, makine yüklüyken) | 1 | 8 test 5 sn / 30 sn zaman aşımı. 1909 geçti |
| Aynı 8 dosya, yük kalkınca | 0 | 56/56 geçti. Zaman aşımı yük kaynaklı |
| `npm run verify:junior-audio-cdn` | 0 | Açılış kapısı yeşil. 11 uyarı (aşağıda) |
| `npm run verify:api-auth -- --check` | 0 | 77 rota. oturum 49, kamu 21, yönetici 3, webhook 4, cron 0 |

İkinci tam turda zaman aşan dosyalar: `tests/academy/tts-quality-gate.test.ts`, `tests/dron/junior-mat5-play-hop.test.ts`, `tests/kernel/junior-checkout.test.ts`, `tests/kernel/junior-faz37-policy.test.ts`, `tests/kernel/junior-meb-calendar.test.ts`, `tests/kernel/junior-question-bank.test.ts`, `tests/kernel/junior-theme-trial.test.ts`, `tests/kernel/v1-hop-gate-surface.test.ts`. Yük kalkınca hepsi geçti. CI (`ubuntu-latest`, `npm run test`) bu yerel yükü taşımaz.

`verify:junior-audio-cdn` artık `--cdn-openers`. Çalışma ağacındaki `package.json` ve `.github/workflows/ci.yml` bu kapıyı `npm run build` ile CI'ya bağlar. Tam denetim ayrı komuttur: `npm run verify:junior-audio-cdn-full` (`--cdn`). Tam denetim bu turda koşulmadı. Açılış kapısının yazdığı kilitli-ders uyarısı, tam denetimde çıkış kodunu 1 yapar.

Açılış kapısı ölçümü (`NEXT_PUBLIC_MEDIA_BASE_URL` = `https://cdn.yetkin.ai`, yol yok):

| Katman | Sonuç |
| --- | --- |
| Dört açılış (`jr_06_mat-1`, `jr_06_fen-1`, `jr_06_turkce-1`, `jr_06_sosyal-1`) | HTTP 200 |
| `jr_06_mat-1` baytı | Manifest ile aynı |
| Kapak `media/junior/covers/{ders}.jpg` | 111/111. HTTP 200, `Content-Length` gövdeyle aynı, SHA-256 manifest ile aynı |
| Fon `media/junior/audio/bgm-light-learning.mp3` | HTTP 200 (değilse kapı çıkış 1 verir) |

11 uyarı. Çıkış kodunu bozmaz:

| Uyarı | Ayrıntı |
| --- | --- |
| Boyut sapması | `jr_06_fen-1.mp3` CDN 16497645, manifest 16152045 |
| Boyut sapması | `jr_06_turkce-1.mp3` CDN 16325805, manifest 16128045 |
| Boyut sapması | `jr_06_sosyal-1.mp3` CDN 15555885, manifest 15394605 |
| Boyut sapması | `jr_06_ing_main-20.mp3` CDN 17467245, manifest 17220525 |
| Ön izleme 404 | `jr_06_ing-1`, `jr_06_alm-1`, `jr_06_fra-1`, `jr_06_siyer-1`, `jr_06_kod-1`, `jr_06_arp-1` |
| Kilitli ders kamu yolunda 200 | `jr_06_mat-5`, `jr_06_mat-14` |

Manifest sayımı: ses 123 anahtar, kapak 111 anahtar. Kapak gövdesi bu turda yeniden yazılmadı. Doğrulama salt okunur GET.

`npm run ops:runtime-readiness` yerel çıkış 0. Bu süreç `NODE_ENV=production` değil. Tablo üretim kasası değildir; `.env.local` sınıflamasıdır. Sır basılmaz.

---

## 2. Git ve branch durumu

| Alan | Değer |
| --- | --- |
| Dal | `main` |
| İzleme | `origin/main` ile aynı uç. Ahead/behind yok |
| Uzak | `https://github.com/yetkin-git/yetkin.ai.git` |
| Uç | `e7c00eb96cd421e74efc9ada74c5e9c01eb74811` |
| Canlıya gidecek yeni commit | Yok. Fark çalışma ağacında |

`git diff --stat HEAD`: 41 izlenen dosya, +825 / −678. Üç izlenen doküman silinmiş (`docs/DEPLOYMENT_RAPORU.md`, `docs/TEDAVI_RAPORU.md`, `docs/TESPIT_RAPORU.md`). Prisma, `supabase/migrations` ve `vercel.json` bu farkta yok.

İzlenen ürün farkı:

- Junior yüz: `app/junior/page.tsx`, `app/junior/checkout/page.tsx`, `components/junior/lesson-covers.tsx`, `visual-course-cards.tsx`, `course-shelf.tsx`, `junior-room.tsx`, `pilot-player/JuniorPilotPlayer.tsx`, checkout ve kota pencereleri
- Medya sözleşmesi: `lib/junior/covers.ts`, `lib/junior/audio-manifest.ts`, `lib/junior/limits.ts`, `scripts/sync-media-to-r2.ts`, `scripts/verify-junior-audio-manifest.ts`
- Derleme kapısı: `package.json` `build` zincirine `verify:junior-audio-cdn`; `.github/workflows/ci.yml` aynı adımı `NEXT_PUBLIC_MEDIA_BASE_URL=https://cdn.yetkin.ai` ile ekler
- Kopya ve kenar testleri: `lib/copy/**`, `lib/ui/breadcrumbs.ts`, `lib/dronlar/kayit.ts`, `app/academy/dogrula/page.tsx`, `app/dashboard/error.tsx`, ilgili `tests/**`

İzlenmeyen, commit adayı:

- `lib/junior/pilot-play-error.ts`
- `lib/junior/storefront-price.ts`
- `tests/kernel/junior-pilot-play-error.test.ts`
- `docs/TESPIT_RAPORU_001.md` … `003`, `docs/TEDAVI_RAPORU_001.md` … `003`
- `docs/001. YetkinAI_Değerlendirme_1.md`, `docs/002. YetkinAI_Değerlendirme_2.md`
- bu dosya

Push şimdi yapılırsa GitHub `e7c00eb` alır. Çalışma ağacı gitmez. Vercel de aynı ucu yeniden basar.

---

## 3. Platform ENV ve entegrasyon kontrol listesi

Değerler yazılmadı. Yerel sınıflama `ops:runtime-readiness` ve ad-varlığı okumasından. Vercel Production kasası, Supabase Dashboard ve Cloudflare zone bu turda açılmadı. `VERCEL_TOKEN`, `CLOUDFLARE_API_TOKEN` ve `CF_API_TOKEN` bu süreçte boş.

### GitHub

| Kapı | Durum |
| --- | --- |
| `main` = `origin/main` | Evet, `e7c00eb` |
| Commit edilmemiş ürün farkı | Var. Bölüm 2 |
| CI (`amiral`) | Commitli iş akışı: `npm ci`, `lint`, `verify:prebuild`, `typecheck`, `test`. CDN adımı yalnız çalışma ağacında |
| `rail-is` | Ayrı iş. Vercel kökü değil |
| `pg-lab` | Loopback Postgres 16. Hosted apply yok |

### Supabase

| Kapı | Durum |
| --- | --- |
| `npx prisma migrate status` | Çıkış 0. `prisma/migrations` içinde 44 klasör. `Database schema is up to date` |
| Bağlantı sınıfı | Havuz ucu `aws-0-eu-central-1.pooler.supabase.com:5432`, veritabanı `postgres`, şema `public`. Şifre yok |
| Bu farkta yeni Prisma / SQL dosyası | Yok. `npm run ops:migrate` bu sürümün adımı değil |
| Yerel `DATABASE_URL` | Dolu. Sınıf: transaction pooler `:6543`, `runtime-ok` |
| Yerel `DIRECT_URL` | Dolu. Sınıf: `pooler.supabase.com:5432`, mühür `direct-fail`. Windows'ta Direct IPv6 düşünce `ops:migrate` havuza düşer. Şema güncel olduğu için bu turda apply yok |
| Auth | `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` yerelde dolu. `ops:runtime-readiness` `supabaseAuth=configured` |
| Yön allowlist (kod) | `lib/kernel/auth/redirects.ts`: `/auth/callback`, `/sifre-yenile`. Üretim kökeni `https://yetkin.ai` olmalı. Dashboard bu turda okunmadı |
| JWT | Yerelde HS256 yedek boş. Doğrulama JWKS |

Kilitli SQL sırası repoda 17 dosya (`supabase/migrations`). Prisma status bu dosyaları ölçmez. Yeniden apply yazmadır; çalıştırılmadı.

### Cloudflare R2 / CDN

| Kapı | Durum |
| --- | --- |
| Yerel R2 yazma anahtarları | `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` dolu. `R2_ACCOUNT_ID` boş (uç dolu olduğu için şart değil) |
| Kamu kök | `https://cdn.yetkin.ai` |
| `media/junior/covers` | 111/111 SHA-256 eşleşti |
| `media/junior/audio` | Açılış dörtlüsü ve fon 200. Dört dosyada bayt sapması, altı ön izleme 404, iki kilitli ders kamu 200. Tam senkron değil |
| Purge | Zone belirteci yok. Eski `?v={sha12}` kayıtları duruyor. Yeni kart `?v=v2-{sha12}` ister; o anahtar bu doğrulamada kökenle eşleşti |
| Akademi mühür sesi | Bu kova değil. `academy-sealed` imzası ayrı |

### Vercel

| Kapı | Repo | Bu turda panel |
| --- | --- | --- |
| Kök dizin | `vercel.json` içinde `rootDirectory` yok. Ürün kökü depo kökü. `apps/rail-is` ayrı deploy değil (`next.config.ts`) | Okunmadı |
| Bölge | `regions: ["fra1"]` | — |
| Build | Çalışma ağacı: `npm run build` = `prisma generate` → `generate:v1-client` → `verify:prebuild` → `verify:junior-audio-cdn` → `generate:production-seal-manifest` → `next build`. `vercel.json` `buildCommand` yazmıyor | Proje ayarındaki Build Command okunmadı. CLI oturumu yok |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Üretimde (`VERCEL_ENV=production`) `https` kök şart. Boş veya yollu değer hazırlık kapısını düşürür. Sözleşme: `https://cdn.yetkin.ai` | Production kasasında değer okunmadı |
| Install | `postinstall` = `prisma generate` | — |
| Yerel `.env.local` | `NEXT_PUBLIC_APP_URL` localhost. `PAYTR_SANDBOX` dolu. `TRUSTED_PROXY_HOPS=1`. Hız tavanı süreç içi | Bu üçü üretime kopyalanmaz. Canlı reçete: `https://yetkin.ai`, sandbox boş, `TRUSTED_PROXY_HOPS=2` |

Üretimde hazırlık kapısının kestiği adlar (değer yok): `DATABASE_URL` (Vercel'de pooler `:6543`, kullanıcı `postgres.<ref>`), `SUPER_ADMIN_USER_ID`, PayTR üçlüsü doluyken `NEXT_PUBLIC_APP_URL` `https` genel köken, `PAYTR_ALLOW_MOCK_CHECKOUT` boş, `NEXT_PUBLIC_MEDIA_BASE_URL` `https` kök. Inngest çifti boşsa çalışma zamanı `/api/jobs/inngest` 503 verir; derleme kapısı üretimde bunu da keser. Önceki canlı derleme bu kapıdan geçmişti. O kasayı bu tur yeniden okumadık.

Yerel PayTR üçlüsü dolu ve sandbox açık. Bu makinenin `.env.local` dosyası Vercel Production şablonu değildir.

---

## 4. Adım adım deployment master planı

Sıra yazmadır. Bu turda hiçbiri uygulanmadı.

1. **Ürün commit'i.** Bölüm 2'deki ürün dosyaları ve bu rapor. `.env*` yok. Değerlendirme notları ayrı commit olabilir; derlemeye girmezler. Commit istenmeden yazılmaz.
2. **Push yalnız `main` → `origin/main`.** Force yok. Uç `e7c00eb` üzerine tek ileri commit (veya ürün + rapor iki commit).
3. **GitHub `amiral`.** Yeni iş akışı CDN kapısını `https://cdn.yetkin.ai` ile koşar. Kırmızıysa Vercel'e bırakılmaz. `rail-is` ve `pg-lab` aynı push'ta koşar; hosted migrate koşmaz.
4. **Veritabanı adımı yok.** 44 Prisma migrasyonu güncel. Bu farkta SQL yok. `npm run ops:migrate` çalıştırılmaz.
5. **R2 yazma yok.** Kapak 111/111 duruyor. Ses uyarıları ayrı iş: boyut sapması için yeniden yükleme, 404 ön izlemeler için eksik nesne, `jr_06_mat-5` ve `jr_06_mat-14` kamu 200'ü için erişim kararı. `--apply` ve `--delete-retired --apply` bu planın parçası değil.
6. **Vercel Production.** GitHub `main` entegrasyonu. Önce panelde üç satır: Root Directory = depo kökü, Build Command = `npm run build` (düz `next build` CDN kapısını ve `verify:prebuild` zincirini atlar), `NEXT_PUBLIC_MEDIA_BASE_URL` = `https://cdn.yetkin.ai`. Bölge `fra1`. Yerel sandbox, localhost ve `TRUSTED_PROXY_HOPS=1` kasaya yapışmaz.
7. **Kenar.** Yeni kapak sorgusu `?v=v2-` ilk istekte kökeni okur. Eski `?v=` zehirli kayıtları yeni HTML tarafından istenmez. Zone purge belirteci hâlâ yok; panelden Purge Everything ayrı bir onaydır.
8. **Dağıtım sonrası ölçüm.** `https://yetkin.ai/junior` kart adresi `?v=v2-` olmalı. `npm run verify:junior-audio-cdn` yeniden 0. Kilitli iki ders için tam kapı (`verify:junior-audio-cdn-full`) ancak o nesnelerin kamu yolu kapanınca 0 beklenir.

Durdurma çizgisi: commit yokken push yok. Build Command panelde `next build` ise push yine bekler. Ses tam senkronu bu uygulama sürümünün kapısı değil; açılış kapısı 0 verdi. Kilitli derslerin kamu 200'ü bugün kovada duruyor ve uygulama push'u onu kapatmaz.
