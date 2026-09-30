# FAZ1-MASTER raporu

Tarih: 30 Eylül 2026. Paket: dokunulmazlık, mühür imzası, OpenAPI, WAV yedeği, E2E müşteri ayrıştırması. Push yok.

## 1. Dokunulmaz kart

`.system_docs/AKADEMI_URETIM_ANAYASASI.md` bu turda okundu ve **düzenlenmedi**. Bağlı ekran görüntülerinin baytı değiştirilmedi.

`.cursorrules` içine şu cümle işlendi: `.system_docs/AKADEMI_URETIM_ANAYASASI.md ve bağlı görseller dokunulmazdır, ajan tarafından düzenlenemez.` Kod tarafındaki model kimliği SSOT `lib/kernel/ai/model-roles.ts` olarak duruyor.

## 2. Mühür imzası

`assertAcademyProductionSeal` imzası `{ courseSlug, lessonKey }`. Çağıranlar ve kilitli testler bu nesneyi geçiriyor. Disk okuyucu `lib/academy/production-seal-disk.ts`; Vitest kurulumu ve `instrumentation.ts` kaydediyor. Eski `{ text, voice, video, visual, music }` çağrısı çalışma ağacında yok.

Yeşil süit için hizalanan kilitler:

| Konu | Ne değişti |
|------|------------|
| Super Admin | Katalog PATCH, müfredat onayı ve kenar JWT, doğrulanmış e-posta (`email_confirmed_at`) olmadan 403 alır. Test oturumları bu alanı taşıyor. Kapı gevşetilmedi. |
| OFF-201 süre | Yuvarlanmış tablo ve karaoke kilidi `lesson-audio-timings` JSON’una çekildi. |
| Satış kapısı | JPG yokken satış kapalı kalır; sonda disk okuyucu geri konur. Beş katman diskteyken kilit açılır, eksik kilit para kesmez. |
| PayTR lisans | Sipariş niyeti slug taşır. Fulfillment kursu `getCourseBySlug` ile bulup kiliti kurs kimliğine basar. |
| OpenAPI | `lib/kernel/http/openapi-v1.json` açıklaması Zod sicilindeki «Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci» cümlesiyle örtüşüyor. Üretim `npm run generate:openapi-v1`. |
| SQL / Prisma kilit | `20260930133000_hotfix_ec102_unpublish.sql` plana girdi (12 SQL). Diskteki iki Prisma klasörü kilide alındı: `20260924100000_academy_exemption_seal`, `20260925120000_wallet_card_refund` (35 klasör). |

## 3. WAV yedeği ve E2E müşteri

Mastering WAV reçetesi `.system_docs/OPS_RUNBOOK.md` bölümü «Akademi mastering WAV — yedek ve kurtarma». `media-bake/` git dışıdır. Yayın MP3 WAV’ın yerine geçmez. Ayrı bir `docs/ops/RUNBOOK.md` açılmadı; yaşayan ops indeksi bu dosyadır. `docs/ops/DURUM.md` yok ve kilit bunu istiyor.

`.env.example` içinde `E2E_T4_CLIENT_EMAIL` zaten ayrı test kutusu olarak yazılı. Süper admin adresi bu değişkene yazılmaz. Kanunik admin `CANONICAL_SUPER_ADMIN_EMAIL` ve `lib/kernel/auth/super-admin.ts`. Şifre örnek dosyada yok.

## 4. Doğrulama

| Kapı | Sonuç |
|------|--------|
| `npm run verify:prebuild` | Çıkış 0. `verify:openapi-v1 OK`, `verify:v1-client OK`, `verify:kernel-package OK`. IDOR 19/19. |
| `npm test` | 239 dosya, 1175 test, çıkış 0. Betik `*surface.test.ts` dosyalarını çalıştırmaz. |
| `npm run typecheck` | Çıkış 0. `prisma generate` + `tsc --noEmit`. |
| Dokunulan yüzey kilitleri | `saha-pilotu-surface`, `cash-loop-catalog-migrate-surface`, `ops-migrate-logic`: 22/22. |

`ops:runtime-readiness` çıkış 0. Lab uyarısı duruyor: `TRUSTED_PROXY_HOPS=1` (Cloudflare+Vercel reçetesi 2), `examSitting=unconfigured`, PayTR `sandboxSet=evet`. Bu uyarılar çıkış kodunu kırmıyor.

Tüm `*surface.test.ts` ağacı bu turda baştan koşulmadı. `npm test` onları dışlar.
