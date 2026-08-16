# Tedavi raporu v2 — T0 belge kalkanı ve T1 git altyapısı

| Alan | Değer |
|------|--------|
| Faz | Tedavi T0 + T1 |
| Tarih | 16 Ağustos 2026 |
| Gövde | `d:\yetkin_rail` |
| Dayanak | `docs/tespit_raporu_v1.md` (envanter SSOT) |
| Ürün kodu | Değiştirilmedi (`app/`, `lib/`, `prisma/` dokunulmadı) |
| Doğrulama | `npm run verify:prebuild` — **YEŞİL** |

---

## 0. Yönetici özeti

Tespit v1’in P0 belge deliği kapatıldı. Linux CI’nin okuduğu `docs/ANAYASA.md` kanonik ada kilitlendi; iki seremoni dosyası yazıldı; tarihsel `Tespit_Raporu.md` arşive alındı; Rail kökünde git deposu açıldı; müze `yetkin.ai/` ve sır dosyaları `.gitignore` ile dışarıda bırakıldı.

**Tek cümle:** Motor zaten mühürlüydü; kırılan yer insan SSOT yolu ve sürümsüz diskti — ikisi T0/T1 ile kapanır. T2 omurga bağlama (Supabase Direct, Studio bucket, PayTR, Inngest) henüz yapılmadı.

---

## 1. T0 — yapılan işlemler

### 1.1 Dosya adı hijyeni (Linux CI)

Windows NTFS `Anayasa.md` ile `ANAYASA.md`’yi aynı dosya sayar; `constitution-surfaces.test.ts` yolu `docs/ANAYASA.md` ister. Linux runner’da bu bir `ENOENT` kırığıdır.

Uygulama: iki adımlı yeniden adlandırma (`Anayasa.md` → geçici → `ANAYASA.md`). Disk teyidi (`dir /b docs`): **`ANAYASA.md`**.

Kod/test referansı zaten kanonik yolu okuyordu (`tests/kernel/constitution-surfaces.test.ts`). Ürün kodu Anayasa’yı import etmez.

### 1.2 Seremoni belgeleri (P0 test kalkanı)

| Dosya | İçerik sözleşmesi |
|-------|-------------------|
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | Seremoni; JSON `phase` yazılmaz; `npm run ops:migrate` **yedi SQL** taşır, `supabase/storage/studio-assets.sql` **taşımaz**; bucket = Dashboard SQL Editor; CORS origin = `NEXT_PUBLIC_APP_URL`, metod yalnız PUT |
| `docs/07_tedavi_raporu_d3_nihai_muhur.md` | Üç halka + fail-closed; tek süreç hız tavanı; Redis yok; Direct `:5432`; Inngest çift anahtar (`EVENT` + `SIGNING`) |

### 1.3 Envanter SSOT

- `docs/ANAYASA.md` envanter satırı: `docs/01_tespit_raporu.md` → **`docs/tespit_raporu_v1.md`**
- `docs/Tespit_Raporu.md` en üstüne **Arşiv / Tarihsel Sapmalı Rapor** notu (sayılar, “Anayasa/07/08 diskte yok”, müfredat oynatıcısı sapması)

`docs/07_OPS_RUNBOOK.md` ve `docs/08_STORAGE_CONTRACT.md` şişirilmedi.

---

## 2. T1 — git hijyeni

- Kökte `.git` yoktu → `git init`
- `.gitignore` teyidi / yama:
  - zaten: `.env`, `.env.local`, `.env.*.local`, `node_modules/`, `generated/`, `.next/`
  - eklendi: `.env.museum-backup.local`, **`yetkin.ai/`** (müze; S9-B)
- İlk commit: `feat(infra): T0 belge kalkanı ve git altyapısı kuruldu`
- Müze kendi `.git`’ini taşır; Rail geçmişine **girmez**. PAT’li müze remote bu commit’te yoktur.

İnce CI (GitHub Actions) T1 kapsamına alınmadı — Tespit T1.7 isteğe bağlı; T0/T1 kalkanı yerelde `verify:prebuild` ile kapanır. Müze workflow kör kopyalanmaz.

---

## 3. Doğrulama

Komut: `npm run verify:prebuild` (16 Ağustos 2026, Rail kökü).

| Mühür | Sonuç |
|-------|--------|
| `verify:no-secrets` | OK — PEM / service_role JWT / yasaklı `.env.example` / git `.env` yok |
| `verify:amount-minor` | OK |
| `verify:ai-gateway` | OK |
| `verify:rls-status` | OK — FORCE RLS + sahip SELECT (46 tablo) |
| `verify:api-auth` | OK — 85 route |
| `verify:boundaries` | OK |
| `verify:sen-axis` | OK — 324 dosya |
| `verify:atomic-seals` | OK |
| `test:surface` | **52 dosya, 157 test, hepsi geçti** (`constitution-surfaces`, `ops-migrate-surface`, `three-ring-e2e-surface` dahil) |
| `typecheck` | OK (`prisma generate` + `tsc --noEmit`) |

Belge/surface kalkanı **yeşil**. Bu, canlı Postgres / PayTR / Inngest Cloud bağlı demek **değildir**.

---

## 4. SEN OLSAYDIN NE YAPARDIN?

T2’ye (omurgayı Supabase / Inngest / PayTR’a dürüst bağlama) geçerken en kritik **üç** teknik detay:

### 4.1 Direct `:5432` — havuzla yeşil boyama

`DATABASE_URL` ve `DIRECT_URL` aynı Direct URI olmalıdır: `db.<ref>.supabase.co:5432`. `*.pooler.supabase.com:6543` transaction-mode `FOR UPDATE` / `$transaction` kilidini düşürür; `ops:migrate` bunu reddeder. Direct host çoğu projede yalnız AAAA (IPv6) yayınlar; Windows’ta IPv6 yoksa `P1001` / `ENOENT` **fail-closed** durur. Çözüm IPv4 add-on veya makine IPv6 rotasıdır — URI’yi havuza çevirmek değildir. T2’nin ilk kırmızı çizgisi budur.

### 4.2 Studio bucket `ops:migrate` dışında

Yedi kilitli SQL + Prisma deploy yeşil olsa bile `studio-assets` bucket’ı ve `storage.objects` RLS **yoktur**. Dashboard SQL Editor’da `supabase/storage/studio-assets.sql` ayrı adımdır. CORS kodla yazılmaz: origin yalnız `NEXT_PUBLIC_APP_URL`, metod yalnız PUT, `*` yasak. Atlanırsa görsel üretim dürüst 4xx/503 verir; “Studio motoru bozuk” teşhisi yanlıştır. Debit, depo bağlanmadan durmalıdır.

### 4.3 Inngest çift anahtar + tek süreç tavanı (Redis yok)

Üretimde `INNGEST_EVENT_KEY` **ve** `INNGEST_SIGNING_KEY` dolu değilse `/api/jobs/inngest` GET/POST/PUT 503’tür; `INNGEST_DEV` bypass etmez. Boş imzada PayTR valör / emanet TTL / Arena tur çalışmaz; PENDING birikir. Aynı anda hız tavanı süreç-içi `Map`’tir: ikinci replica sessiz deliktir. T2’de Redis/Socket **eklenmez**; tek `next start` sözleşmesi korunur. PayTR webhook HMAC + `total_amount === amountMinor` üçüncü omurga ayağıdır — imza yoksa CREDIT yok.

Bu üçü atlanırsa T3 “üç halka canlı dumanı” yalan yeşil boyar.

---

## 5. Bir sonraki aşama — T2 adım adım

T2 yeni oda veya müze peronu taşımaz. Omurgayı gerçek Postgres / Auth / Storage / PayTR / Inngest’e bağlar. Sıra (`docs/tespit_raporu_v1.md` Adım T2 + `docs/07_OPS_RUNBOOK.md` §13):

1. `.env.example` → `.env.local`. Credential icat edilmez. `SUPABASE_SERVICE_ROLE_KEY` / Redis / GİB yazılmaz.
2. `DATABASE_URL` + `DIRECT_URL` = `db.<ref>.supabase.co:5432`. Host `pooler.supabase.com` ve port `6543` yok. DNS: A/AAAA. IPv6 yoksa Dashboard **IPv4 add-on**. `Test-NetConnection db.<ref>.supabase.co -Port 5432`.
3. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/publishable). `NEXT_PUBLIC_APP_URL` Site URL ile birebir.
4. `npm run ops:migrate` — Prisma 13 migrasyon + yedi SQL + D2 post-apply mühürleri (CHECK 2097152, `http_idempotency_records`, `academy_lesson_completions`, `curriculum_seal`, `corporate_job_offers`). Yeşil olmadan “şema bağlı” denmez.
5. Dashboard SQL Editor: `supabase/storage/studio-assets.sql`.
6. Storage CORS: Allowed Origins = `NEXT_PUBLIC_APP_URL` origin; Allowed Methods = PUT; joker yok. `npm run ops:storage-cors`.
7. İlk vatandaş `/register` → Auth UUID → `.env.local` `SUPER_ADMIN_USER_ID` → süreç yeniden. Hazine sentinel `00000000-0000-4000-8000-000000000001` Super Admin yazılmaz.
8. Supabase Redirect URLs: `{NEXT_PUBLIC_APP_URL}/auth/callback` ve `/sifre-yenile`.
9. PayTR: webhook `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr`. Üretimde `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` yasak.
10. Inngest Cloud: `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`. Boşsa serve 503.
11. Duman (bağlı sayılmazsa T2 bitmez):
    - `GET /api/health` 200; JSON `phase` taşımaz; `checks.inngest = configured`
    - Studio görsel: katalog `studio:generation:image`, debit, imzalı PUT/GET
    - Akademi `rail-temel`: kilit → satın al → müfredat → sınav ≥70 → sertifika `/academy/dogrula/[hash]`
12. Tek süreç: ikinci instance / Redis **yok**. S43 çekim açılmaz.

T2 bitmeden T3 (canlı üç halka e2e) ve oda derinliği (SWOT, üçüncü Studio peronu, CRM) açılmaz.

---

## 6. Bu dilimde yapılmayanlar

- Ürün kodu, Prisma şema, kenar `proxy.ts`
- Canlı `ops:migrate` / bucket SQL uygulaması (T2)
- GitHub Actions / Docker (T1.7 isteğe bağlı; müze workflow yok)
- 13. oda, Redis, Socket, GİB, çekim, Turnstile
- `docs/` wiki şişirme

---

## 7. Dosya envanteri (T0/T1 teslimatı)

| Yol | İşlem |
|-----|--------|
| `docs/ANAYASA.md` | Kanonik ad + envanter SSOT yaması |
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | Yeni seremoni |
| `docs/07_tedavi_raporu_d3_nihai_muhur.md` | Yeni D3 mühür |
| `docs/Tespit_Raporu.md` | Arşiv bandı |
| `docs/tedavi_raporu_v2_t0_t1.md` | Bu rapor |
| `.gitignore` | `yetkin.ai/` + müze yedek env |
| `.git/` | İlk Rail deposu |

Karar: Tespit v1 **A** yolu (kalkan → git → omurga). T0/T1 bitti. Sıradaki iş **T2**.
