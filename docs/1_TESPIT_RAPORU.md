# 1 — Tespit Raporu (FAZ 1)

## `yetkin.ai` × `yetkin_rail` — Mimari ve Durum Tespit Analizi

| Alan | Değer |
|------|--------|
| Tarih | 19 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Rol | Lead Architect — CEO (Gemini) + Kullanıcı + Cursor üçlüsü |
| Gövde | `d:\yetkin_rail` (Rail) |
| Müze (prototip) | `d:\yetkin_rail\yetkin.ai` — ayrı Next uygulaması, ayrı `.git`; Rail git'ine girmez (`.gitignore`, S9-B) |
| Anayasa | `.system_docs/ANAYASA.md` (kalıcı, bağlayıcı) |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Yöntem | Disk sayımı + `package.json` / Prisma / App Router / `lib/` / kenar / mühür betikleri / Anayasa / Manifesto / git HEAD + çalışma ağacı karşılaştırması. Müze `.env.local` okunmadı. |
| Teslimat | Yalnız bu dosya. Ürün kodu, şema, env değiştirilmedi. |

Bu belge, eski `/docs` serisinin (`01_TESPIT_RAPORU.md` … `21_PRISMA_ONARIM_VE_STAGING_RAPORU.md`) yerini alacak **yeni tespit serisinin ilk dosyasıdır**. Eski seri çalışma ağacından silinmiş, kalıcı belgeler `/.system_docs` altına taşınmıştır. Bu rapor mevcut durumu **bugünün gözüyle** yeniden röntgenler; geçmiş raporları tekrar etmez.

---

## 1. Mevcut Durum Özeti

### 1.1 Tek cümle

`yetkin_rail`'in omurgası mühürlüdür, 12 oda mutlu-yol iskeleti kodlanmıştır, kalıcı belgeler `/.system_docs` altında bağlayıcıdır — ancak **çalışma ağacında çok büyük ve işlenmemiş bir değişiklik kütlesi** durmakta ve Faz 1'ın kapanış ölçütü (tek vatandaşın defterinde okunan dört basamak) hâlâ kanıtlanmış değildir.

### 1.2 Git ve çalışma ağacı gerçeği

Git geçmişi 5 commit'ten ibaret:

```
c959ba6 chore(kernel): complete Faz 4 Studio and DevLabs gateway verification
c3cd33e fix(paytr): align iframe payload and merchant_oid spec
80383f1 chore(kernel): fix T3/T4 loop scripts and verify T2 backbone
d07aa68 chore(kernel): restore T0 seals, track CI and seed devlabs catalog
1d9e9b7 feat(infra): T0 belge kalkanı ve git altyapısı kuruldu
```

Fakat `git status` çok daha fazlasını söyler:

- **~170 dosya değiştirilmiş (M)** — çekirdek, dikey odalar, testler, config, şema.
- **~70 yeni dosya/dizin işlenmemiş (??)** — içlerinde `apps/`, `.system_docs/`, `lib/kernel/notice/`, `lib/kernel/http/v1-*`, `tests/dron/`.
- **13 eski `/docs` dosyası silinmiş (D)** — eski tespit/tedavi/canlıya-çıkış serisi.

Yani **HEAD ile çalışma ağacı arasındaki makas, projenin kendi ölçeğinin yarısı kadardır.** Bu, küçük bir yama değil; işlenmemiş bir faz çalışmasıdır. Manifesto'nun "sözlü mutabakat müzenin ölüm biçimidir" cümlesi uncommitted kitle için de geçerlidir: **mühürlenmemiş kod, kanıtlanmamış koddur.**

### 1.3 Ne yapılmış — omurga (kodda mühürlü)

| Yetenek | Kanıt | Durum |
|---------|-------|------|
| Kimlik | Supabase Auth, e-posta/şifre, PKCE, cookie/Bearer `getUser` | mühürlü |
| Kenar | `proxy.ts`: müze 404, JWKS/HS256 fail-closed, nonce CSP, bellek hız tavanı | mühürlü |
| Para | `Wallet.amountMinor` + append-only `LedgerEntry`; User'da bakiye kolonu yok | mühürlü |
| Emanet | `EscrowHold` kilit + TTL + dikey iade kancası | mühürlü |
| Ödeme | PayTR iframe + webhook HMAC + valör Inngest | mühürlü (panel onayı idari) |
| Fiyat | Super Admin katalog SSOT + 15 dk `CheckoutPriceLock` | mühürlü |
| LLM gümrüğü | `invokeLlm` / `generateImage`; 8 kanonik rol; bütçe kalkanı | mühürlü |
| RLS | FORCE RLS + sahip SELECT; yazma Prisma postgres; `service_role` JS/env'de yok | mühürlü |
| İşler | Inngest serve fail-closed (boş anahtar = 503) | mühürlü |
| Idempotency | `Idempotency-Key` + `HttpIdempotencyRecord` unique `(user,route,key)` | mühürlü |
| Studio depo | imzalı PUT `studio-assets`; `data_base64` tavan 2097152 | mühürlü |
| Kokpit | tek BFF `/api/dashboard/pulse`; kernel dikey tablo sorgulamaz | mühürlü |
| Prebuild | `no-secrets → amount-minor → ai-gateway → rls-status → api-auth → boundaries → sen-axis → atomic-seals → test:surface → typecheck` | mühürlü |

Yığın: Next.js 16 App Router, React 19, Prisma 7 (çok dosyalı şema), Zod 4, Inngest, jose, `@prisma/adapter-pg`. `src/` yok. Oda kalıbı: `lib/<oda>/{index,types,schemas,engine,runtime,load,prisma-store}`.

### 1.4 Ne yapılmış — 12 oda

Sicil `lib/kernel/modules.ts` içinde mühürlü, sıralı ve faz etiketli:

| Oda | Yol | Faz | Mutlu yol (kodda) |
|-----|-----|-----|-------------------|
| Dashboard | `/dashboard` | 2 | 12 nabız + cüzdan şeridi; tek BFF; salt okuma |
| Studio | `/studio` | 4 | taslak → LLM debit; IMAGE_GEN; imzalı depo |
| Akademi | `/academy` | 3 | katalog → kilit → settlement → müfredat → sınav ≥70 → SHA-256 sertifika; `/dogrula/[hash]` |
| Kariyer | `/career` | 3 | akademi sertifikası veya freelancer RELEASE → vize + portföy |
| Freelancer | `/freelancer` | 2 | ilan → teklif → emanet → mesaj → teslim/iade; 2 turlu tahkim; squad |
| DevLabs | `/devlabs` | 4 | proje → `yrk_` HMAC kasa → generate → anayasal linter → artifact; **exec yok** |
| Kurumsal | `/kurumsal` | 5 | şirket + mühürlü ilan + teklif + ödül/serbest/iade |
| Hibe | `/hibe` | 6 | tohum katalog + etiket eşleştirme; canlı kamu API yok |
| Arena | `/arena` | 5 | ihale emaneti + HTTP/Inngest tur tiki; Socket yok |
| Pazaryeri | `/yetkinilan` (disk `pazaryeri/`) | 6 | dijital anında settlement vs hizmet/emlak/vasıta emanet; doping |
| Junior | `/junior` | 7 | yaş 10–17, ebeveyn, harçlık Wallet satırı değil |
| Social | `/social` (YetkinX) | 7 | mühürlü kanıt akışı + ACK/SHARE |

Çekirdek sığınaklar (oda sayılmaz): `/profil`, `/cuzdan`, `/pasaport`, `/admin`.

Prisma **13 şema dosyası** (academy, arena, base, career, devlabs, freelancer, hibe, junior, kernel, kurumsal, pazaryeri, social, studio). Çekirdek `lib/kernel/` **17 alt dizin**: admin, ai, auth, crypto, escrow, health, http, identity, jobs, ledger, money, notice, observability, passport, payments, pricing, security.

### 1.5 Çalışma ağacındaki YENİ iş (işlenmemiş)

Bu kitle HEAD'de yok, diskte var. Manifesto'da **Faz 2** olarak tarif edilen işin büyük kısmı:

| Yeni yüzey | Dosya | Anlam |
|-----------|-------|-------|
| **Dron istemcisi** | `apps/rail-is/` (Expo/React Native) | "Rail İş" — Diyar B freelancer dronu. Login, JobList, JobDetail, OwnerBids, Bench (Tezgâh), UpdateRequired ekranları; cüzdan şeridi; teslim/hak ediş akışı |
| **v1 zarfı** | `lib/kernel/http/{v1-envelope,v1-contract,v1-hop-gate,v1-runtime-shield,api-v1,openapi-v1.json}` | Çift zarf teknik borcu: web versiyonsuz `{ok,...data}`, dron `/api/v1` `{ok,error,requestId,apiVersion,data}`. Tip düzeyinde sızdırmazlık mühürlü |
| **Vatandaş bildirimi** | `lib/kernel/notice/` | E-posta bildirim altyapısı (Manifesto T-02'de boş anahtar olarak işaretlenmişti) |
| **Hızlı yükleme** | `lib/kernel/payments/quick-top-up.ts`, `components/kernel/quick-top-up-modal.tsx` | Cüzdan UX pürüzsüzleştirme |
| **Teslim kahramanı** | `lib/freelancer/{delivery-hero,contract-view,ttl-notice}.ts` | Freelancer teslim yüzeyi derinleştirme |
| **Emanet TTL uyarısı** | `lib/kernel/jobs/escrow-ttl-warn.ts` | Manifesto'da boş Inngest anahtarı olarak işaretli iş |
| **Runtime hazırlık** | `lib/kernel/jobs/runtime-readiness.ts`, `scripts/ops-runtime-readiness.ts` | Üretim bağlama denetimi |
| **PayTR callback kalkanı** | `lib/kernel/payments/paytr/callback-guard.ts` | Ödeme hilesi yüzeyi |
| **DNS IPv6-first** | `lib/kernel/dns-ipv6-first.ts` | Ağ katmanı |
| **Dron testleri** | `tests/dron/`, `tests/kernel/rail-is-dron-lab-surface.test.ts` | Dron sözleşme testleri |
| **v1 testleri** | `tests/kernel/{api-v1,v1-hop-gate,v1-runtime-shield,verify-v1-contract}-*.test.ts` | Çift zarf mührü |

**Kalıcı belge taşıması:** `.system_docs/` (ANAYASA, MANIFESTO, OPS_RUNBOOK, STORAGE_CONTRACT, DRON_CLIENT_SPEC, README) işlenmemiş; eski `/docs/ANAYASA.md` ve `/docs/07_OPS_RUNBOOK.md` silinmiş. Bu, belge kalkanını yeni yere taşır — doğru hamle, ama henüz mühürlenmemiş.

### 1.6 Tek cümlelik teşhis

**Motor mühürlü, dron inşa edilmiş, belgeler kalıcı yere taşınmış — ama hiçbiri commit'lenmemiş ve Faz 1'ın kapanış ölçütü (defterde dört basamak) kanıtlanmamış.** Kırmızı `verify:prebuild` HEAD'de yeşildir; çalışma ağacının yeşilliği bilinmez çünkü mühür commit'i bekler.

---

## 2. Prototip Karşılaştırması (`yetkin.ai` → `yetkin_rail`)

Müze ilham ve **yasak listesidir** (S9-B). TypeScript import grafı, Next tracing, ESLint, Vitest, `verify-*` ve HTTP `/yetkin.ai` dışındadır. Kör kopya anayasaya aykırıdır.

### 2.1 Ölçek (disk)

| Ölçüt | `yetkin.ai` (müze) | `yetkin_rail` | Oran |
|--------|---------------------|---------------|------|
| Anayasal yüzey | 18 domain + 130 düğüm | 12 oda + 4 sığınak | kasıtlı dar |
| `page.tsx` | 158 | ~40 | ~%25 |
| `app/**/route.ts` | 559 | ~87 | ~%16 |
| Prisma model | 248 (tek 334 KB) | 46 (13 dosya) | ~%19 |
| Prisma enum | 181 | 39 | — |
| `lib/` TS/TSX | 2291 | ~261 | ~%11 |
| `components/` TS/TSX | 1111 | ~127 | ~%11 |
| React `hooks/` | 37 | 0 | kasıtlı |
| Vitest | 603 | ~117 | ~%19 |

Ölçek farkı bir gecikme değil, **tavan kararıdır**. Müze on iki cilalı vitrin, sıfır dönmüş halka olarak öldü; Rail o hatayı tekrarlamamak için bilinçli dardır.

### 2.2 Aktarılmış yetenekler (müze → rail)

Bunlar Rail'in omurgasıdır; müzeden **mimari fikir** aktarılmış, kod kör kopya edilmemiş:

1. Tek çekirdek + dikey oda ayrımı (ESLint §2.8 oda duvarı).
2. Tek nakit SSOT (`amountMinor` + append-only defter; emanet kilit).
3. String FK (odalar kernel tablosu sorgulamaz).
4. LLM gümrüğü tek kapı (`invokeLlm`/`generateImage`).
5. Kenar fail-closed JWT (JWKS + HS256 yedek) + nonce CSP.
6. PayTR iframe + webhook HMAC.
7. Idempotency (`Idempotency-Key`).
8. Studio imzalı PUT + `data_base64` tavan.
9. Dashboard tek BFF (kernel dikey tablo sorgulamaz).
10. Prebuild mühür zinciri.

### 2.3 Aktarılmamış yetenekler — üç kova

"Eksik" tek kova değildir. Aşağıdaki tasnif eski tespitle aynıdır; bugün de geçerlidir.

#### Kova 1 — bilinçli kesim (geri açılmaz, backlog'a yazılmaz)

| Modül / yapı | Müze | Rail gerekçesi (Anayasa kırmızı çizgisi) |
|--------------|------|------------------------------------------|
| Chess + socket:3001 | `app/chess`, `server/chess-socket-server.ts` | 13. oda değil |
| Anket / kamuoyu + socket:3002 | `app/anket`, `lib/kamuoyu/` | k-anonimlik yığını |
| Lonca / meclis / talent / tarım | ilgili `app/` + `lib/` | 12 oda tavanı; AI rol patlaması |
| Redis / Socket.IO | `lib/redis/`, 3 socket sunucusu | Arena = HTTP + Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | müze env | RLS + Prisma yazma çizgisi |
| GİB / e-arşiv / çekim | `app/admin/withdrawals`, `wallet/withdraw` | S43 kapalı döngü |
| Reklam / Turnstile / OAuth şişmesi | `lib/ads/`, `studio/yetkin-ads` | env yasağı (reklam doktrini açıldı, inşası Faz 1'e girmez) |
| DevLabs exec / SaaS / Builder / Codex / sandbox | `app/devlabs/{saas,builder,...}` (16 sayfa) | linter'dır, runner değildir |
| Studio 15+ peron | ads, 3D, talk, canvas, photo, avatar, CAD... | tek tezgâh: metin + IMAGE_GEN |
| Social boost / X-YouTube | müze social ormanı | DTO yasağı (Kırmızı çizgi 5) |
| VIDEO_GEN / VOICE_TTS factory | müze `forge/media-engine` | rol adı var, factory yok — dürüst kopya |
| 130 BINA + onlarca alias | `lib/bina/domain-registry.ts` | ince alias tavanı `next.config.ts` |
| `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` | müze env / `app/maintenance` | dürüst kapalı yüzey |
| Liyakat takası / holding / `merit-swap:` | `lib/merit/` | ikinci nakit yazıcı yasağı |
| `User.balanceKurus` / `amountKurus` | müze şema (~43 eşleşme) | `amountMinor` SSOT |
| 37 `hooks/` + lucide/geist/dnd-kit | müze UI yığını | sunucu-ağır gövde, yerel SVG |

#### Kova 2 — oda var, içerik ince (ürün kararı; kör taşıma değil)

Varsayılan **hayır.** Ayrı onay olmadan açılmaz.

| Oda | Rail'de olan | Müze'den gelmeyen |
|-----|----------------|-------------------|
| Career | `/career` + vize + portföy | cv-builder, swot, prova, roadmap, `/senior` |
| Academy | satın al + `/oyna` + sınav + `/dogrula` (2 kurs) | vision, corporate-qualification, onlarca ders |
| Studio | `/studio` + drafts/generate/images/storage | 19 müze Studio sayfası |
| DevLabs | `/devlabs` + `/projeler/[id]` + generate/keys | 14 ekstra peron (saas/builder/codex/…) |
| Kurumsal | şirket + ilan + teklif | crm, fatura, görevler, hibe, prestij |
| Hibe | katalog + eşleştirme | `/olustur` wizard, scraper, Success-Fee |
| Pazaryeri | dijital/hizmet/RE/araç + teklif + doping | dashboard içi ilan ormanı, sigorta, 5 aşamalı PropTech |
| Junior | yaş + veli + harçlık | meydan, mentor, MEB LMS |
| Dashboard | 12 nabız BFF | fırsat, yetkin-panel, kokpit içi ilan |
| Admin | katalog PATCH | üyeler, moderation, withdrawals, ads-config |
| Pasaport | vize projeksiyonu | rozetler, liyakat, doğrula çocukları |
| Profil | kimlik + görünen ad | siparişlerim, ayarlar, KYC |

Akademi müfredat oynatıcısı **eksik değildir.** İnce olan içerik hacmidir (2 tohum), motor değil.

#### Kova 3 — platform boşlukları (oda değil; asıl iş)

| Boşluk | Durum | Etki |
|--------|--------|------|
| Faz 1 kapanış ölçütü | Defterde dört basamak kanıtlanmamış | Halka dönmedi; lansman ≠ dönmüş halka |
| Çalışma ağacı işlenmemiş | ~240 dosya değişikliği commit bekler | Mühür çalışma ağacını doğrulayamaz; geri alma/çakışma riski |
| İnce CI takipsizliği | `.github/workflows/ci.yml` durumu | `main` push'unda mühür koşmaz (eski tespit) |
| VIDEO/TTS factory | 8 rol vaadi, kapı yok | kopya "üretir" derse yalan |
| `FAST_STREAM` / `LITE_STREAM` | rol adı "akış"; çağrı senkron | stream UI yok |
| İşlem e-postası | Auth SMTP Supabase; nakit yalız log (çalışma ağacında `notice/` inşa ediliyor) | anlaşmazlık/sertifika vatandaşa kör |
| Gözlem SDK | `requestId` + yapılandırılmış log | Sentry/OTel yok |
| Hız tavanı | süreç-içi bellek | ikinci replica sessiz delik; Redis eklenmemeli |
| PayTR tarama | `take: 50` / 30 dk | hacimde backlog; metrik yok |
| Defter sayfalama | tavan var; cursor yok | "tüm hareketler" yalanı söylenmemeli |
| Studio bucket SQL | `ops:migrate` listesinde değil | Dashboard adımı atlanırsa görsel 4xx/503 |

### 2.4 Rail'de duran, müzede "fazla" olan (korunacak kazanç)

1. Çekirdek ↛ dikey; dikey ↛ dikey motor (ESLint §2.8).
2. Tek nakit SSOT. Escrow kilit, ikinci bakiye değil.
3. String FK; kernel oda tablosu bilmez.
4. Dürüst kapalı ürün (boş env / boş DB yalan bakiye basmaz).
5. Marka ≠ disk (`pazaryeri/` vs `/yetkinilan`).
6. 12 oda tavanı; 13. yasak.
7. Kenar ince, fail-closed JWT + nonce CSP.
8. DevLabs linter'dır, runner değildir.
9. Kapalı döngü cüzdan (S43).
10. Müze build/trace/import dışı.

---

## 3. Shared Kernel / Core Mimarisi Uyumu

### 3.1 "Amiral Gemisi + Sürü Dron" modeli

Manifesto ve Anayasa'nın "Çekirdek + dron: mobil sınırlar" maddesi şu mimariyi çizer: gövde **JSON omurgalı çekirdektir**, monolitik web sitesi değildir; dronlar ayrı istemcilerdir, tek bundle, yalnız Diyar B.

**Diskteki uyum — güçlü:**

| Anayasal ilke | Kodda karşılığı | Uyum |
|---------------|------------------|------|
| Çekirdek ayrı | `lib/kernel/` (17 alt dizin) — auth, ai, escrow, ledger, money, payments, pricing, security, jobs, notice, observability... | ✅ |
| Dikey oda ayrı | `lib/<oda>/` (12 oda) — her biri `{index,types,schemas,engine,runtime,load,prisma-store}` kalıbı | ✅ |
| Oda duvarı §2.8 | `eslint.config.mjs` + `scripts/verify-boundaries.ts` — çekirdek ↛ dikey, dikey ↛ dikey | ✅ |
| String FK | Odalar `EscrowHold`/`CheckoutPriceLock`/`AiTokenUsage` id'sini string tutar; kernel oda tablosu sorgulamaz | ✅ |
| Çapraz konuşma | HTTP veya kernel sözleşmesi | ✅ |
| Dron ayrı istemci | `apps/rail-is/` (Expo/React Native) — `app/` değil; mutlu yol + İşlerim/Tezgâh `src/screens` | ✅ (yeni) |
| API sürüm kapısı | `/api/v1` ön eki + asgari sürüm kapısı (`v1-hop-gate`, `v1-runtime-shield`, `UpdateRequiredScreen`) | ✅ (yeni) |
| Çift zarf | web `{ok,...data}` vs dron `{ok,error,requestId,apiVersion,data}` — tip düzeyinde sızdırmazlık | ✅ (yeni) |
| Dron Diyar sınırı | Rail İş yalnız Diyar B (freelancer); Akademi/Studio/DevLabs dron yayınlanmaz | ✅ |
| Bearer zorunlu değil | Kenar `Authorization: Bearer` kabul eder, çerez zorunlu değil | ✅ |

### 3.2 Klasör ve modül yapısı

```
yetkin_rail/
├── app/                    # Next.js App Router (gövde — amiral web)
│   ├── (kernel)/           # çekirdek sığınak rotaları
│   ├── api/                # API rotaları (versiyonsuz + v1)
│   │   ├── (kernel)/       # çekirdek API
│   │   └── <oda>/          # dikey oda API'leri
│   └── <oda>/             # 12 oda sayfası
├── apps/
│   └── rail-is/           # DRON (Rail İş — Diyar B, Expo)
│       └── src/{api,auth,contract,runtime,screens,storage,ui}
├── lib/
│   ├── kernel/            # SHARED KERNEL (çekirdek — 17 modül)
│   └── <oda>/             # 12 dikey oda (duvarlı)
├── prisma/schema/         # 13 çok-dosyalı şema
├── components/             # React bileşenleri
├── tests/                  # vitest + playwright + dron
├── scripts/                # ops + verify mühürleri
├── supabase/migrations/    # migrasyon + tohum SQL
└── .system_docs/           # kalıcı anayasa (bağlayıcı)
```

**Yapı mimariye yüksek uyumludur.** Üç net katman vardır: çekirdek (`lib/kernel/`), dikey odalar (`lib/<oda>/`), dron (`apps/rail-is/`). Dron `app/` içine değil `apps/` altına konmuş — bu, "amiral `app/` değildir" kuralının doğru uygulanmasıdır.

### 3.3 Uyum pürüzleri

1. **Dron işi Faz 1'de.** Manifesto açık: "mobil dron inşası Faz 1'e girmez" ve "Faz 2'ye kod yazarak değil, döndürerek girilir." Dron ve v1 zarfı çalışma ağacında duruyor — bu, Faz 1 kapanmadan Faz 2 işine başlanmış görünümü verir. Mimari olarak temiz, **faz disiplini olarak soru işaretidir.**
2. **Hız tavanı port eksikliği.** `http-rate-limit.ts` süreç-içi bellek gerçeğini dürüst söyler; ama `RateLimitPort` ayrılmamış. İkinci replica kararı gelince ya Redis kaçak kopyası ya sessiz delik üretir. Çekirdek arayüz disiplini burada yarım.
3. **Çekirdek ↛ dikey** mühürlü; **dikey → çekirdek** yönü serbest. Bu doğrudur; ama çekirdeğin dikeye sunduğu sözleşme yüzeyi (`lib/kernel/modules.ts` sicili) ile dronun tükettiği v1 sözleşmesi (`v1-contract.ts`) arasındaki tek kaynaklık (SSOT) net yazılı değil.

## 4. Anayasa & Manifesto Uyumu

### 4.1 Kırmızı çizgiler — kodda mühürlü olanlar

| Kırmızı çizgi | Mühür | Uyum |
|---------------|-------|------|
| 1 — 12 oda tavanı | `lib/kernel/modules.ts` (12 oda), ESLint §2.8, `verify:boundaries`, `room-ceiling-lib.ts` | ✅ |
| 2 — Tek bakiye / `amountMinor` | `verify:amount-minor`, şema başlıkları, `amountKurus` yasak | ✅ |
| 3 — Güvenlik ve sır | `verify:no-secrets`, `verify:rls-status`, `verify:api-auth`, JWKS kenar, `service_role` JS/env yok | ✅ |
| 4 — Mimari sınırlar (DevLabs linter, idempotency, Inngest imza, Studio tavanı, oda duvarı, LLM gümrüğü, dürüst yüzey, hız tavanı, çift zarf) | `verify:ai-gateway`, `verify:atomic-seals`, `inngest-guard`, `studio_digital_assets_data_base64_max_chars`, `v1-envelope` tip mührü | ✅ |
| 5 — Mühür duvarı (para görünürlük alır, kanıt alamaz) | DTO mührü, `PROOF_FEED_FORBIDDEN_KEYS`, `/academy/dogrula/[hash]` temiz (uygulama donuk) | ✅ (doktrin) |
| S43 — kapalı döngü | `/api/wallet/withdraw` yok, admin çekim paneli yok | ✅ |
| Beş oda canlıya-çıkış mührü | Akademi, Freelancer, Yetkinİlan, Studio, DevLabs + kenar JWKS/CSP kodda | ✅ (kodda) |

### 4.2 Manifesto disiplini — soru işaretleri

Manifesto'nun en sert cümleleri faz disiplini üzerinedir:

> "Bir faz atlanamaz. Faz 2'ye kod yazarak değil, döndürerek girilir."

> "Faz 1 boyunca yasak: ... **mobil dron** ... Son iki kalem 17 Ağustos 2026 kararlarıyla *doktrin olarak* açıldı ama **inşası Faz 1'e girmez.**"

Bugünün çalışma ağacı bu iki cümleyle gerilimdedir:

1. **Dron inşası (`apps/rail-is/`) Faz 1 yüzeyinde duruyor.** Mimari olarak temiz, anayasal sınırlara (Diyar B, v1 kapısı, çift zarf) uygun — ama Faz 1 kapanış ölçütü (tek vatandaşın defterinde dört basamak) kanıtlanmadan inşa edildi. Bu, Manifesto'nun "iskeleti on ikiye çoğaltarak değil, bir döngü üretime bağla" dersinin ikinci kez tekrarlanmasıdır.
2. **Faz 1 kapanış kanıtı yok.** Manifesto 4.3 "Vitrin dolu, nakit halkası boş" tablosu bugün de geçerli görünmektedir: akademi vitrini canlı, freelancer tahtası açık, sertifika mührü doğrulanıyor, vize kapısı 403 veriyor, emanet defteri **boş**, çekim kapalı. Halka dönmüş değildir.
3. **"Eli boşsa içerik yazsın, kod yazmasın" kuralı.** Dron kodu, bu kuralın ihlalidir — eğer Faz 1 henüz kapanmadıysa.

### 4.3 Belge kalkanı uyumu

| Beklenti | Durum | Uyum |
|----------|------|------|
| Kalıcı belgeler `/.system_docs` | Taşınmış, 5 zorunlu dosya yerinde (ANAYASA, MANIFESTO, OPS_RUNBOOK, STORAGE_CONTRACT, README) + DRON_CLIENT_SPEC | ✅ (işlenmemiş) |
| `/docs` günlük rapor, build fixture değil | Eski seri silinmiş, bu yeni dosya yazılıyor | ✅ |
| Çelişkide Anayasa bağlayıcı | Manifesto "çelişkide Anayasa kazanır" der | ✅ |
| Belge testleri (surface) | `tests/kernel/ops-migrate-surface.test.ts`, `system-docs-contract-surface.test.ts` | ✅ (yeni) |

Belge kalkanı doğru taşınmıştır. Tek risk: **işlenmemiş** olması. `.system_docs/` commit'lenmezse ve eski `/docs/ANAYASA.md` silinmiş olarak kalırsa, belge testleri HEAD ile çalışma ağacı arasındaki makasta kırmızı dönebilir.

### 4.4 Uyum özeti

- **Kırmızı çizgiler (kod mührü): %100 uyumlu.** Hiçbir kesilen modül geri açılmamış; hiçbir yasa (amountMinor, service_role, S43, LLM gümrüğü) çiğnenmemiş.
- **Faz disiplini: soru işareti.** Dron inşası Faz 1'de başlamış görünüyor; Manifesto bunu yasaklar.
- **Mühür disiplini: risk.** Çalışma ağacındaki kitle commit'lenmemiş; mühür commit'i bekler.

---

## 5. Görüş — "Sen Olsaydın Ne Yapardın?"

Tarafsız ve dürüst okuma: **omurga ve kırmızı çizgi mühürleri doğru mimari seçimdir.** 12 oda + tek nakit gümrüğü + fail-closed dürüstlük + oda duvarı + çift zarf, hepsi kazançtır. Müzeyi "daha düzenli kopyala"mazdım; 130 düğümü geri doldurmak ekibi tekrar `yetkin.ai` karmaşasına götürür.

Bunu söyledikten sonra, **bugün üç adımda değiştireceğim şeyler** şunlardır — önceki tespitlerin "her şey doğru, yalnız belge yaz" çizgisini tekrar etmiyorum.

### Adım 1 — Çalışma ağacını hemen commit'le (mühür öncesi)

Bugünün en büyük riski yeni oda değil, **işlenmemiş kütledir.** ~240 dosya değişikliği commit bekliyor. Bu kitlede:
- Dron, v1 zarfı, notice, quick-top-up, delivery-hero — hepsi mühürsüz.
- Bir `git checkout` veya disk sorunu bu çalışmayı silebilir.
- `verify:prebuild` HEAD'de yeşildir; çalışma ağacında koşulmadan yeşilliği **bilinmez**.

**Ne yapardım:** Önce `npm run verify:prebuild`'i çalışma ağacında koş, yeşilse **mantıklı commit'lere böl** (örn. `feat(dron): rail-is Diyar B dron ve v1 zarfı`, `feat(kernel): citizen notice ve quick-top-up`, `chore(docs): kalıcı belgeleri .system_docs'a taşı`). Mühür ancak commit'lenmiş kodu doğrular. Mühürlenmemiş dron, mühürlenmiş dron değildir.

### Adım 2 — Faz 1 kapanışını dürüstçe sorgula, dronu askıya al

Manifesto'nun tek ölçütü nettir: **bir gerçek insanın defterinde dört basamak.** Bugün emanet defteri boşsa halka dönmemiştir. Dronu inşa etmek, dönmemiş halkanın üstüne cila çekmektir — Manifesto'nun tam olarak yasakladığı şey.

**Ne yapardım:** Dron ve v1 zarfı kodunu commit'le (kaybolmasın) ama **yayın hattından askıya al** — `apps/rail-is` bağımsız bundle'dır, gövde derlemesini kırmaz. Sonra tek soruyu sor: "Faz 1 döndü mü?" Cevap hayır ise, dron **Faz 1 kapanana kadar donuk** kalır. Bu, Manifesto'nun "Faz 2'ye kod yazarak değil, döndürerek girilir" kuralının kod karşılığıdır. Dron kodu hazır olmak zarardır; **yayınlanmak** Faz 1'i ihlal eder.

### Adım 3 — Hız tavanına port arayüzü ekle (küçük, bugün)

`http-rate-limit.ts` süreç-içi bellek gerçeğini dürüst söyler — bu doğru. Ama `RateLimitPort` ayrılmamış. Anayasa Redis eklenmemesini söyler (doğru); ama port arayüzü eklemek Redis eklemek değildir. Bellek `Map` varsayılan, çağıran değişmez.

**Ne yapardım:** `lib/kernel/security/rate-limit-port.ts` arayüzünü ekle, mevcut bellek implementasyonu bunun altına geçsin. Bugün davranış değişmez; ama ikinci replica kararı gelince implementasyon değişir, çağıran değişmez. Bu, "port arayüzü, bellek implementasyon" disiplininin ilk günden yazılmasıdır — çekirdek olgunluğunun işaretidir.

### Tutacağım kararlar (farklı yapmam)

- Tek süreç, tek nakit gümrüğü, 12 oda tavanı, `amountMinor`, Prisma postgres yazma + FORCE RLS okuma.
- `SUPABASE_SERVICE_ROLE_KEY` yok. Storage vatandaş JWT + anon.
- DevLabs linter'dır. Arena HTTP + Inngest. S43 kapalı döngü.
- `app/` + `lib/<oda>/` + `lib/kernel/` + `apps/<dron>` kalıbı. `src/` açılmaz.
- Çift zarf (üçüncü zarf yasağı). Dron yalnız Diyar B.
- Yığın (Next 16, React 19, Prisma 7, Zod 4, Inngest, jose) tutulur.

### Üç cümlelik özet

Müzeyi kör kopyalama. Omurgayı mühürle ve commit'le. Halkayı bir kez döndür — sonra dronu yayınla.

Neden bu sıra? Çünkü yeşil `verify:prebuild` + 12 kapalı vitrin + hazır dron, vatandaşın sertifika gördüğü bir Akademi dumanından daha az kanıttır. Müzenin dersi yüzey sayısı değil, **bağlanmamış yüzeyin yalan söylemesidir.** Bugün dron hazır ama halka dönmedi — bu, müze hastalığının yeni bir kılıfıdır.

## 6. Bir Sonraki Aşamada Ne Yapılmalı?

**Yeni oda değil. Yeni Studio peronu değil. Müze dosyası taşımak değil. Kariyer SWOT değil. Dron yayını değil.**

Omurga ve 12 oda mutlu yolu zaten kodlanmış. Dron inşa edilmiş. Tek kırılma noktası motor değil: **işlenmemiş kitle, Faz 1 kapanış ölçütü ve üretim bağlamadır.**

### 1 — bugün, kod yok: çalışma ağacını mühürle

```
npm run verify:prebuild
# yeşilse:
git add .system_docs/ apps/ lib/kernel/notice lib/kernel/http/v1-* ...
git commit -m "feat(dron): rail-is Diyar B dron, v1 zarfı ve citizen notice"
git commit -m "chore(docs): kalıcı belgeler .system_docs'a taşındı"
```

Mühür ancak commit'lenmiş kodu doğrular. Çalışma ağacındaki ~240 dosya değişikliği **kayıp riski** taşır. Bu adım bitmeden yeni yüzey açılmaz.

### 2 — bu hafta, Faz 1 kapanışını dürüstçe sorgula

Manifesto'nun tek ölçütü: **bir gerçek insanın defterinde dört basamak.**

```
CREDIT  cüzdan yükleme
DEBIT   kurs satın alma        (ticari dikey kurs)
DEBIT   emanet kilidi          (beş gerçek ilandan biri)
CREDIT  emanet çözüldü, net kazanç
```

Buna eşlik eden sertifika mührü `/academy/dogrula/[hash]`'te **geçerli** dönmelidir. Ekran görüntüsü değil, **sorgunun kendisi**. Hiçbir kayıt elle düzeltilmez.

- Eğer bu dört basamak okunamıyorsa: **Faz 1 kapalı değildir.** Dron yayın hattı donuk kalır. Tek iş: PayTR panel onayı + e-posta/Inngest anahtarları + o tek insanı bulmak.
- Eğer okunuyorsa: Faz 1 kapanmıştır, Faz 2'ye **döndürerek** girilir.

### 3 — ilk kod yüzeyi (hâlâ yeni oda değil)

`.github/workflows/ci.yml` git'e alınır (eski tespit). Müze workflow kopyası değildir; `npm run verify:prebuild` yeter. Playwright / Docker / tam `npm test` eklenmez. CI içindeki ikinci `typecheck` isteğe bağlı sadeleştirilir (`verify:prebuild` zaten içerir).

### 4 — T2 omurga (az kod, ops)

`.env.local` (müze `.env` kopyalanmaz) → `npm run ops:migrate` → Dashboard `studio-assets.sql` → Storage CORS → PayTR webhook HMAC → Inngest Cloud çift anahtar → ilk Super Admin UUID. Boş halka sahte bakiye ile doldurulmaz.

### 5 — ilk dikey duman (yeni modül yazılmaz)

Omurga bağlandıktan sonra kanıtlanacak **tek** döngü: **Akademi** — `lib/academy/` + `app/academy/[slug]/oyna` + `app/api/academy/courses/[id]/purchase`. Bağlı ortamda satın al → oyna → sınav → `/academy/dogrula/[hash]`.

Neden akademi, neden freelancer değil? Öğrenme–kanıt–kazanç halkasının ilk halkasıdır. Mutlu yol en tam kodlanmış dikeylerden biridir. Tohum `ac_rail_temel` SQL'de durur. Kariyer vizesi akademi belgesine dayanır. Freelancer ikinci halkadır (kazanç); önce öğrenme kapanır.

### 6 — Faz 1 kapandıktan sonra: dronu yayınla

Dron kodu hazır (commit'lenmiş). Faz 1 kapandığında: `/api/v1` sürüm kapısı canlıda doğrulanır, **tek** bundle yayınlanır, kapsam yalnız Diyar B. İkinci dron sorusu sorulmaz — Rail dışı emanet payı anlamlı değilse.

### Yapılmayacaklar

- 13. oda, Socket, Redis, GİB, çekim, Turnstile, OAuth şişmesi.
- Studio 15 peron, DevLabs SaaS/Builder/sandbox exec.
- Hibe canlı kamu API'si, TKGM/sigorta "canlı" yalanı.
- Müze `amountKurus` / triple-balance / holding.
- Dronu Faz 1 kapanmadan yayınlamak.
- Silinen T0 dosyalarını boş şablonla yeniden yazma (HEAD'ten geri al veya yeni seride bırak).
- Reklam envanteri inşası (Faz 1'e girmez, Kırmızı çizgi 5 donuk).

### Karar özeti

| Sıra | Somut iş | Tür |
|------|----------|-----|
| 1 | `verify:prebuild` çalışma ağacında + commit'le | mühür |
| 2 | Faz 1 kapanışını sorgula (defterde dört basamak) | ölçüt |
| 3 | `.github/workflows/ci.yml` git takibi | ince CI |
| 4 | `.env.local` + `ops:migrate` + bucket + PayTR + Inngest | ops, az kod |
| 5 | Akademi dumanı | ilk dikey, yeni kod değil |
| 6 | Faz 1 kapandıysa: dronu yayınla | Faz 2 girişi |

Ben **1 ve 2** derim. 12 oda mutlu-yol motoru + API + sayfa taşıyor; dron inşa edilmiş. Bugün eksik olan yeni oda değil; **işlenmemiş mührün commit'i, Faz 1 halkasının canlı kanıtı ve omurganın üretime dürüst bağlanmasıdır.**

---

## Kapanış mührü

Rail'in kaybetme biçimi bellidir ve bir kere prova edilmiştir: **on iki cilalı vitrin, sıfır dönmüş halka.** Bugün vitrine dron da eklendi — ama halka hâlâ dönmedi.

Kazanma biçimi de aynı ölçüde bellidir ve daha zordur, çünkü heyecan vermez:

> Bir vatandaş öğrendi. Kanıtı mühürlendi. Mühür kapıyı açtı. İş emanete girdi. Para ustanın oldu. **Bir kere.** Sonra tekrar. Sonra bin kere.

Bu rapor yeni oda açmaz, yeni vaat üretmez ve ürün kodunu değiştirmez. Anayasa kırmızı çizgileri çizer; bu belge o çizgilerin **bugün nerede durduğunu** söyler.

Çelişki hâlinde `.system_docs/ANAYASA.md` bağlayıcıdır.

---

*Ürün kodu bu tespitte değiştirilmedi. Müze `yetkin.ai/` Rail git'ine girmez; kör kopya yasaktır. 13. oda yoktur. Vize kapısı dönüşüm için gevşetilmez. Bankaya çekim kapalıdır. Dron inşası Faz 1 kapanana kadar donuktur.*
