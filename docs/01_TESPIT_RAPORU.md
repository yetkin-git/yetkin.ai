# Tespit Raporu — `yetkin.ai` × `yetkin_rail`

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Prototip (müze) | `d:\yetkin_rail\yetkin.ai` — ayrı Next uygulaması, ayrı `.git`; Rail git’ine **girmez** (`.gitignore`, S9-B) |
| Gövde | `d:\yetkin_rail` (Rail) |
| Yöntem | Disk sayımı + `package.json` / Prisma / App Router / `lib/` / kenar / mühür betikleri / Anayasa / git HEAD. Müze `.env.local` okunmadı. |
| Anayasa | `docs/ANAYASA.md` |
| Teslimat | Yalnız bu dosya. Ürün kodu, şema, env **değiştirilmedi.** |

Önceki envanterler: git HEAD’teki `docs/tespit_raporu_v1.md` (16 Ağustos, T0), çalışma ağacındaki `docs/01_tespit_raporu_karsilastirma.md` (16 Ağustos ~22:20). Bu belge **17 Ağustos taze taramasıdır**; sayıların çoğu önceki envanterle örtüşür, belge kalkanı ve katalog sicili **düzeltilir**.

---

## Mevcut Durum Özeti

`yetkin_rail`, `yetkin.ai` monolitinın düzenlenmiş kopyası **değildir.** Müze ilham ve **yasak listesidir**: TypeScript import grafı, Next tracing ve HTTP yolu `/yetkin.ai` dışındadır. Kör kopya anayasaya aykırıdır.

Ölçek farkı kasıtlıdır. Müze ~130 düğümlük evrensel bina; Rail **12 dikey oda + 4 çekirdek sığınak.** Yüzey kabaca müzenin **%11–%25**’i. Bu bir gecikme değil, tavan kararıdır.

**Yeniden yazma “başlanmamış” değildir.** Omurga kodda durur: kimlik, tek cüzdan, append-only defter, emanet, fiyat kilidi, PayTR, LLM gümrüğü, RLS, oda duvarı, kenar JWKS/CSP, HTTP idempotency, Studio imzalı depo, dashboard BFF. On iki odanın her birinde mutlu yol motoru + API + sayfa vardır. Beş dikey (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) anayasada canlıya-çıkış mührü olarak işaretlenmiştir.

Kritik teşhis bugün şudur: **motor mühürlü, belge kalkanı çalışma ağacında kırık, omurga üretime henüz dürüst bağlanmamış.** Git’te tek commit var (`1d9e9b7` — T0 belge kalkanı). T0’da yazılan seremoni dosyaları HEAD’te durur; çalışma ağacından **silinmiş** durumdadır. İnce CI diskte vardır, git takibinde yoktur.

### Ne yapılmış — omurga

| Yetenek | Kanıt | Not |
|---------|-------|-----|
| Kimlik | e-posta/şifre, PKCE `/auth/callback`, cookie/Bearer `getUser` | Turnstile / OAuth şişmesi yok |
| Kenar | `proxy.ts`: müze 404, `/kayit` 308, JWKS/HS256, nonce CSP, bellek hız tavanı | Çerez varlığı yetmez. Kök `middleware.ts` yok; `middleware/api-auth.ts` ince re-export |
| Para | `Wallet` + `LedgerEntry`; birim `amountMinor` | User’da bakiye kolonu yok |
| Emanet | `EscrowHold` + TTL + dikey iade kancası | Kilit; ikinci bakiye değil |
| Ödeme | PayTR iframe; webhook tutar eşitliği; valör Inngest 30 dk | `/api/wallet/withdraw` **yok** (S43) |
| Fiyat | Super Admin katalog SSOT; 15 dk `CheckoutPriceLock` | 7 `REQUIRED_CATALOG_DEFINITIONS` — DevLabs `generation:code` **sicilde yok** |
| LLM | `invokeLlm` / `generateImage`; 8 kanonik rol; bütçe kalkanı | Factory yalnız metin + görsel |
| RLS | FORCE RLS + sahip yalnız SELECT; yazma Prisma postgres rolü | `service_role` JS/env’de yok |
| İşler | 6 Inngest: PayTR scan/single, emanet TTL/notify, Arena tur scan/tick | id `yetkin-rail`, serve `/api/jobs/inngest` |
| Idempotency | defter anahtarı + HTTP `Idempotency-Key` + `HttpIdempotencyRecord` | unique `(user_id, route, key)` |
| Studio depo | imzalı PUT (`studio-assets`); Prisma hash/mime/path | `ops:migrate` bucket SQL taşımaz |
| Kokpit | tek BFF `/api/dashboard/pulse` | kernel dikey tablo sorgulamaz |
| Prebuild | `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck` | `build` = `prisma generate && verify:prebuild && next build` |

Yığın: Next.js 16 App Router, React 19, Prisma 7 (çok dosyalı şema), Zod 4, Inngest, jose, `@prisma/adapter-pg`. `src/` yok. Oda kalıbı: `lib/<oda>/{index,types,schemas,engine,runtime,load,prisma-store}`. ESLint §2.8 oda duvarını kilitler.

### Ne yapılmış — on iki oda

| Oda | Vatandaş yolu | Mutlu yol (kodda) | Derinlik |
|-----|----------------|-------------------|----------|
| Dashboard | `/dashboard` | 12 nabız + cüzdan şeridi; tek BFF | müze fırsat / PropTech kokpiti yok |
| Studio | `/studio` | taslak → LLM debit; IMAGE_GEN; imzalı depo | 15+ müze peronu yok |
| Akademi | `/academy` | katalog → kilit → settlement → müfredat → sınav ≥70 → SHA256 sertifika | 2 tohum kurs; `/oyna` **var** |
| Kariyer | `/career` | akademi sertifikası veya freelancer RELEASE → vize + portföy | SWOT / CV builder yok (kasıtlı dar); `schemas.ts` yok |
| Freelancer | `/freelancer` | ilan → teklif → emanet → mesaj → teslim/iade; 2 turlu tahkim; squad | en derin nakit oda |
| DevLabs | `/devlabs` | proje → üret → anayasal linter → artifact; HMAC kasa `yrk_` | exec yok; katalog tohumu eksik (aşağı) |
| Kurumsal | `/kurumsal` | şirket + mühürlü ilan + teklif + ödül/serbest/iade | CRM / fatura yok |
| Hibe | `/hibe` | tohum katalog + etiket eşleştirme + rehber kayıt | canlı KOSGEB yok |
| Arena | `/arena` | ihale emaneti + HTTP/Inngest tur tiki | Socket yok (`http+inngest`) |
| Pazaryeri | `/yetkinilan` (disk `pazaryeri/`) | dijital anında settlement vs hizmet/emlak/vasıta emanet; teklif; doping | TKGM/sigorta canlı değil |
| Junior | `/junior` | yaş 10–17, ebeveyn, harçlık **Wallet satırı değil** | LMS / mentor yok |
| Social | `/social` (YetkinX) | mühürlü kanıt akışı + ACK/SHARE | boost / X-YouTube yok |

Çekirdek sığınaklar (oda sayılmaz): `/profil`, `/cuzdan`, `/pasaport`, `/admin`.

Prisma **46 model / 39 enum / 13 şema dosyası / 13 migrasyon**. Vatandaş **40** `page.tsx`, API **87** `route.ts`, `lib/` **261** TS/TSX, `components/` **127**, Vitest **117**, Playwright **12** spec. `hooks/` yok.

### Ne yapılmış — belge ve git

Diskte duran insan SSOT: `docs/ANAYASA.md`, `docs/07_OPS_RUNBOOK.md`, `docs/08_STORAGE_CONTRACT.md`, `docs/01_tespit_raporu_karsilastirma.md` (takipsiz).

Git HEAD’te olup çalışma ağacından **silinenler:** `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`, `docs/07_tedavi_raporu_d3_nihai_muhur.md`, `docs/tespit_raporu_v1.md`, `docs/Tespit_Raporu.md`, `docs/tedavi_raporu_v2_t0_t1.md`. `tests/kernel/ops-migrate-surface.test.ts` seremoni dosyasını `readSrc` ile açmak zorundadır — yoksa surface / `verify:prebuild` kırmızı.

`.github/workflows/ci.yml` diskte vardır (Node 20.19 + `verify:prebuild`); **git takibinde yoktur.** `verify:prebuild` zaten typecheck içerir; CI job’ı typecheck’i bir kez daha koşar.

---

## Fark ve Eksik Analizi

“Eksik” tek kova değildir. Üç kova vardır.

### Ölçek (bugünkü disk)

| Ölçüt | `yetkin.ai` | `yetkin_rail` | Oran |
|--------|-------------|---------------|------|
| Anayasal yüzey | 18 domain + 130 düğüm (`lib/bina/domain-registry.ts`) | 12 oda + 4 sığınak | düğümde çok daha dar |
| `page.tsx` | 158 | **40** | ~%25 |
| `app/**/route.ts` | 559 | **87** | ~%16 |
| `loading.tsx` | 151 | **34** | — |
| `error.tsx` | 148 | **1** (yalnız kök) | kasıtlı ince |
| `layout.tsx` | 30 | **14** | — |
| Prisma model | **248** (tek 334 KB `schema.prisma`) | **46** (13 dosya) | ~%19 |
| Prisma enum | **181** | **39** | — |
| Prisma migrasyon | 210 | 13 uygulama + 7 kilitli SQL + 1 storage SQL | — |
| `lib/` TS/TSX | 2291 | **261** | ~%11 |
| `lib/` üst klasör | **90** | **16** | — |
| `components/` TS/TSX | 1111 | **127** | ~%11 |
| React `hooks/` | 37 | 0 | kasıtlı |
| Vitest | 603 | **117** | ~%19 |
| Playwright | 11 | **12** | sayı yakın, kapsam dar |
| Inngest | 25 dosya | 6 işlev | — |
| CI | `ci.yml` + `staging-deploy.yml` | ince `ci.yml` (takipsiz) | müze kopyası değil |
| Docker | `docker-compose.dev.yml` var | yok | şart değil |
| `.env.example` atanan anahtar | ~29 (şablon); canlı yığında Redis/GİB/Socket/ads) | ~24, kısa ve yasaklı | müze `.env` kopyalanmaz |

Müze `app/` üstünde Rail’de **olmayan** (ve çoğunlukla **açılmaması gereken**) kökler: `agency`, `anket`, `bina`, `chess`, `destek`, `fatura`, `fiyatlandirma`, `liyakat-arz`, `loncalar`, `maintenance`, `meydan`, `onboarding`, `senior`, `seref-kursusu`, `talent`, `tarim`, `u`, `verify`, `verify-email`, `yardim`, `yetkin-ilan` (Rail rewrite `/yetkinilan` → `/pazaryeri`), `yetkinx`.

Müze API ormanı Rail’de yok: `ads`, `agency`, `anket`, `bina`, `bridges`, `chess`, `chronos`, `crm`, `cron`, `forge`, `loncalar`, `meclis`, `merit`, `notifications`, `opportunities`, `support`, `talent`, `tarim`, `wallet/withdraw`, …

### Kova 1 — bilinçli kesim (geri açılmaz)

Anayasa kırmızı çizgisi. Backlog’a “sonra yaparız” diye yazılmaz.

| Modül / yapı | Müze | Rail gerekçesi |
|--------------|------|----------------|
| Chess + `chess.js` + socket:3001 | `app/chess`, `server/chess-socket-server.ts` | 13. oda değil |
| Anket / kamuoyu + socket:3002 | `app/anket`, `lib/kamuoyu/` | k-anonimlik yığını |
| Lonca / meclis / talent / tarım | ilgili `app/` + `lib/` | 12 oda tavanı; AI rol patlaması |
| Redis / Socket.IO | `lib/redis/`, `server/*`, 3 socket sunucusu | Arena = HTTP + Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | müze env | RLS + Prisma yazma çizgisi |
| GİB / e-arşiv / çekim | `app/admin/withdrawals`, `app/api/wallet/withdraw` | S43 kapalı döngü |
| Reklam / Turnstile / OAuth şişmesi | `lib/ads/`, `studio/yetkin-ads` | env yasağı |
| DevLabs exec / SaaS / Builder / Codex / Commerce / sandbox | `app/devlabs/{saas,builder,codex,…}` (16 sayfa) | linter’dır, runner değildir |
| Studio 15+ peron | ads, 3D, talk, canvas, photo, avatar, convert, invoice, flow, brand, dijital twin, CAD… | tek tezgâh: metin + IMAGE_GEN |
| Social boost / X-YouTube | müze social ormanı | DTO yasağı |
| VIDEO_GEN / VOICE_TTS factory | müze `forge/media-engine` | rol adı var, `generateImage` yalnız IMAGE_GEN |
| 130 BINA + onlarca alias | `lib/bina/domain-registry.ts` | ince alias tavanı `next.config.ts` |
| `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` | müze env / `app/maintenance` | dürüst kapalı yüzey |
| Liyakat takası / holding / `merit-swap:` | `lib/merit/`, modül kasaları | ikinci nakit yazıcı yasağı |
| `User.balanceKurus` / `amountKurus` | müze şema (~43 eşleşme) | `amountMinor` SSOT |
| 37 `hooks/` + lucide/geist/dnd-kit | müze UI yığını | sunucu-ağır gövde, yerel SVG |

### Kova 2 — oda var, içerik ince (ürün kararı; kör taşıma değil)

Müze’den “eksik arayüz / API” listesi. Varsayılan **hayır.** Ayrı onay olmadan açılmaz.

| Oda | Rail’de olan | Müze’den gelmeyen |
|-----|----------------|-------------------|
| Career | `/career` + `/api/career/{visas,portfolio,pulse}` | `/career/{cv-builder,swot,prova,roadmap,cv-analiz,zihinsel-prova}`, `/senior` |
| Academy | satın al + `/oyna` + sınav + `/dogrula/[hash]` (2 kurs) | `vision`, `corporate-qualification`, `suspended-education`, onlarca ders |
| Studio | `/studio` + drafts/generate/images/storage | 19 müze Studio sayfası |
| DevLabs | `/devlabs` + `/projeler/[id]` + generate/keys | 14 ekstra peron (saas/builder/codex/…) |
| Kurumsal | şirket + ilan + teklif | `/kurumsal/{crm,fatura,gorevler,hibe,assets,prestij}` |
| Hibe | katalog + eşleştirme | `/hibe/olustur` wizard, scraper, Success-Fee |
| Pazaryeri | dijital/hizmet/RE/araç + teklif + doping | dashboard içi Yetkin İlan ormanı, sigorta, 5 aşamalı PropTech |
| Junior | yaş + veli + harçlık | `meydan`, mentor, MEB üretim LMS |
| Dashboard | 12 nabız BFF | `firsat`, `yetkin-panel`, kokpit içi ilan |
| Admin | katalog PATCH | üyeler, moderation, support, withdrawals, ads-config, suspensions |
| Pasaport | vize projeksiyonu | `/pasaport/{rozetler,liyakat,dogrula}` çocukları |
| Auth UX | login/register/şifre | `verify-email`, `onboarding`, Turnstile |
| Profil | kimlik + görünen ad | `siparislerim`, `ayarlar`, KYC |
| Legal | tek `/legal` | ayrı mesafeli satış / iade URL’leri |

Akademi müfredat oynatıcısı **eksik değildir.** İnce olan **içerik hacmi**dir (2 tohum), motor değil.

Rail API yüzeyi (87) çekirdek + her oda için pulse + mutlu yol yazmalarıdır. Müze 559 route’unun çoğu Kova 1’dir, “tamamlanacak iş” değildir.

### Kova 3 — platform boşlukları (oda değil; asıl iş burada)

| Boşluk | Durum | Etki |
|--------|--------|------|
| Seremoni markdown çalışma ağacında yok | HEAD’te var, `git status` **D** | `ops-migrate-surface.test.ts` `readSrc` ile patlar; prebuild kırmızı |
| Envanter SSOT dağınıklığı | Anayasa `01_tespit_raporu_karsilastirma.md` gösterir; v1 silinmiş; bu dosya yeni | ajan / Linux CI kafa karışıklığı |
| İnce CI takipsiz | `.github/workflows/ci.yml` diskte | `main` push’unda mühür koşmaz |
| DevLabs katalog tohumu | motor `devlabs` / `generation:code` okur; `REQUIRED_CATALOG_DEFINITIONS` ve `price_catalog_definitions.sql` **7 anahtarda durur** | canlı generate fail-closed “katalog yok”; mühürlü oda nakit satırı eksik |
| VIDEO/TTS factory | 8 rol vaadi, kapı yok | kopya “üretir” derse yalan |
| `FAST_STREAM` / `LITE_STREAM` | rol adı “akış”; çağrı senkron | stream UI yok |
| İşlem e-postası | Auth SMTP Supabase; nakit yalnız `txn.notice.*` log | anlaşmazlık/sertifika vatandaşa kör |
| Gözlem SDK | `requestId` + yapılandırılmış log | Sentry/OTel yok |
| Hız tavanı | süreç-içi bellek | ikinci replica sessiz delik; Redis eklenmemeli |
| PayTR tarama | `take: 50` / 30 dk | hacimde backlog; metrik yok |
| Defter sayfalama | tavan var; cursor yok | “tüm hareketler” yalanı söylenmemeli |
| Tek `error.tsx` | kök | oda izolasyonu ince (148 kopya istenmez) |
| Studio bucket SQL | `ops:migrate` listesinde yok | Dashboard adımı atlanırsa görsel 4xx/503 |
| Kariyer `schemas.ts` | oda kalıbında yok | Zod girişi diğer odalara göre ince; yeni peron değil |
| Omurga bağlama | T2 henüz yok | boş env = dürüst kapalı; sahte bakiye yok — doğru, ama canlı duman yok |

### Rail’de duran, müzede “fazla” olan (korunacak kazanç)

1. Çekirdek ↛ dikey; dikey ↛ dikey motor (ESLint §2.8 + EARNINGS_WALL).
2. Tek nakit SSOT. Escrow kilit, ikinci bakiye değil.
3. String FK; kernel oda tablosu bilmez.
4. Dürüst kapalı ürün (boş env / boş DB yalan bakiye basmaz).
5. Marka ≠ disk (`pazaryeri/` vs `/yetkinilan`).
6. 12 oda tavanı; 13. yasak.
7. Kenar ince, fail-closed JWT + nonce CSP.
8. DevLabs linter’dır, runner değildir.
9. Kapalı döngü cüzdan (S43).
10. Müze build/trace/import dışı.

---

## Mimari Sağlık ve Riskler

Yapı sağlıklıdır. Risk, “yanlış monolit” değil; **mühürlü iskeletin belge ve üretim bağlarının gevşemesi**dir. “Hata” ile “bilinçli kesim” karıştırılmamalı.

### Sağlam olan

- 12 oda tavanı kod + ESLint + Anayasa ile aynı kapıyı kilitler.
- Para tipi tek: `amountMinor` + `currencyCode`. Float / `amountKurus` / User bakiyesi yok.
- Kenar fail-closed: JWKS, boş sırda HS256 düşer, müze yolu 404, üretim CSP nonce, `unsafe-eval` yok.
- Prebuild zinciri gerçek kapıdır; “yeşil boyanmış 130 düğüm” hastalığına karşı bilinçli daraltmadır.
- Prisma çok dosyalı şema müzenin 334 KB tek dosyasından üstündür.
- Oda kalıbı tekrarlanır; yeni oda açmak (yasak olsa da) teknik olarak ucuz, anayasal olarak kapalıdır.

### P0 — kalkan ve bağlama

1. **Seremoni dosyaları çalışma ağacından silinmiş.** Bu “hiç yazılmadı” değildir. T0 commit’i dosyaları içerir; `git status` `D` gösterir. `ops-migrate-surface.test.ts` içeriği (`npm run ops:migrate`, bucket SQL, `phase` yasağı) ister. Runbook D3 yolunu ister. Silinmiş SSOT üzerine özellik yığmak müzenin küçük ölçeklisidir.
2. **Anayasa / envanter yolları çoğalmış.** HEAD v1, disk karsilastirma, bu `01_TESPIT_RAPORU.md`. Linux CI ve ajan hangi dosyanın kanonik olduğunu kaybeder.
3. **Studio bucket `ops:migrate` dışında.** Doğru (yedi SQL şişmez). Yanlış teşhis: Dashboard SQL Editor + CORS atlanırsa “Studio bozuk” sanılır.
4. **Inngest imza.** Üretimde boş `INNGEST_SIGNING_KEY` veya `INNGEST_EVENT_KEY` → serve **503** (doğru). Cloud bağlanmadan valör/TTL/Arena tur çalışmaz; `PENDING` birikir.
5. **Hız tavanı tek süreç.** İkinci instance sessiz delik. Redis eklenmemeli.
6. **Postgres oturum kipi.** `DATABASE_URL` / `DIRECT_URL` = `db.<ref>.supabase.co:5432`. Transaction pooler `:6543` `FOR UPDATE` / `$transaction` kilidini düşürür. Müze host’u yasak.

### P1 — nakit, katalog, gözlem

7. **DevLabs fiyat satırı katalog sicilinde yok.** `lib/devlabs/bench.ts` `findActiveEntry("devlabs", "generation:code")` ister. `REQUIRED_CATALOG_DEFINITIONS` ve ops SQL bu anahtarı basmaz. Motor var, tohum yok — mühürlü odanın nakit kapısı üretimde kapanır. Bu Kova 1 kesimi değil, **unutulmuş tohumdur.**
8. Nesne depo fail-closed: bağlı değilse “nesne depo bağlı değil”. Dürüst, ama ops atlanırsa yanlış teşhis.
9. Eski `inline-base64` satırlar kör DROP edilmez; yedek şişebilir.
10. Nakit bildirimi yalnız log. Vatandaş e-posta kör.
11. HTTP idempotency evrensel tarama değil. Yeni nakit ucu sicili unutabilir.
12. Admin = tek env UUID. Boş env = kimse admin değil (doğru). UUID sızıntısı hâlâ tek sır.
13. PayTR: üretimde sandbox/mock fail-closed. Webhook HMAC + `total_amount === amountMinor`.
14. CI typecheck çift koşar; asıl sorun takipsizliktir.
15. VIDEO/TTS rol meta’sı “gümrük factory” der; factory yoktur. Dürüst kopya şartı.

### P2 — ajan ve süreç tuzağı

16. Müze klasörü workspace’i şişirir (2291 lib dosyası). Import yasak mühürlü; ajan “şuradan kopyala” tuzağı sürekli. Nested `.git` ikinci kafa karışıklığıdır.
17. Belge testleri insan SSOT’u CI fixture yapar. Dosya silinince mühür yalan söyler — bugün olan budur.
18. Çekirdek döngü iskeleti var; **içerik ince** (2 kurs). Motoru şişirmek içeriği çoğaltmaz.
19. Müze GİB + çekim + holding modelleri Rail şemasına **taşınamaz.**

### Bağımlılık haritası (omurga sırası)

```
Supabase Auth (anon + JWT/JWKS)
  → Postgres Direct :5432 (Prisma yazma + RLS okuma)
    → ops:migrate (13 migrasyon + 7 SQL)
      → Studio bucket SQL (Dashboard, ops listesi dışı)
        → PayTR webhook HMAC
          → Inngest Cloud (çift anahtar)
            → DevLabs katalog tohumu (sicile eklenmeden generate kapanır)
              → öğrenme–kanıt–kazanç dumanı
```

Bu zincirde bir halka boşsa ürün “oda eksik” değil, **dürüst kapalı** kalmalıdır. Sahte bakiye, sahte sertifika, sahte `phase` yazılmaz.

Teknik borç özeti: oda ormanı değil; (a) silinmiş T0 SSOT, (b) takipsiz CI, (c) DevLabs katalog tohumu, (d) bağlanmamış omurga, (e) iç içe müze.

---

## Cursor’ın Görüşü (“Sen Olsaydın Ne Yapardın?”)

Tarafsız okuma: 12 oda + tek nakit gümrüğü + fail-closed dürüstlük **doğru mimari seçimdir.** Müze’yi “daha düzenli kopyala”mazdım. 130 düğümü geri doldurmak üç kişilik ekibi tekrar `yetkin.ai` karmaşasına götürür.

Bunu söyledikten sonra, **sıfırdan kursaydım farklı yapacağım yerler** şunlardır. Önceki tespitlerin “her şey doğru, yalnız belge yaz” çizgisini tekrar etmiyorum.

### 1. Müze workspace’in dışında dururdu

`yetkin.ai/`’yi Rail köküne gitignore’lu nested repo olarak koymazdım. Ayrı kardeş dizin (`../yetkin.ai-museum`) veya salt-okunur arşiv yeter. Bugünkü düzen ajanın her oturumda 2291 dosyalık ormanı “eksik özellik” sanmasına davetiye çıkarır. S9-B mühürü doğru; fiziksel komşuluk mühürü zayıflatır.

### 2. Genişlik değil, bir dikey dilim üretime giderdi

Anayasa tavanını (12 oda) **kağıtta** erken kilitlerdim — bu kazançtır. Kodda ise 12 odanın hepsini mutlu-yol iskeleti olarak şişirmeden önce şunu canlıya bağlardım:

**Auth + Wallet + Ledger + Escrow + Akademi (`rail-temel` satın al → oyna → sınav → doğrula).**

Bugün 12 oda + 87 API + 46 model duruyor; omurga T2’de. Bu, anayasal olarak temiz, operasyonel olarak **genişlik-önce** bir yeniden yazmadır. İskelet ucuzdur; her oda bir “dürüst kapalı” vitrin daha üretir ve ajanı yeni peron açmaya teşvik eder. Freelancer derinliği haklıdır (nakit çiçeği). Arena / Hibe / Junior / Social’ı katalog + bir yazma ucu ile bekletirdim.

### 3. İnsan SSOT’u prebuild fixture yapmazdım — yapacaksam kilitle

`tests/kernel/ops-migrate-surface.test.ts`’in markdown `readSrc` etmesi kırılgandır. Bugün kanıt: T0 dosyaları silindi, mühür kırmızıya döner. İki dürüst seçenek vardır:

- **A:** Seremoni dosyalarını kod gibi kilitle (silinmez, yeniden adlandırılmaz).
- **B:** Test kod/SQL/env sabitlerini okur; markdown yalnız insana anlatır.

Karışık model (markdown hem hikâye hem CI) üçüncü kez envanter raporu yazdırmıştır. Sıfırdan **B**’yi seçer, T0’da seçilmiş **A** ise dosyaları geri yüklerdim — silmezdim.

### 4. Katalog sicili motorun okuduğu her anahtarı içerirdi

`REQUIRED_CATALOG_DEFINITIONS` tek SSOT olurdu. DevLabs `generation:code` motorun istediği anda sicile ve SQL tohumuna girerdi. “Mühürlü oda, tohumu unutulmuş satır” müze hastalığının küçük halidir.

### 5. Rol tavanı yeteneğe eşit olurdu

8 kanonik rol doğru fikir. `VIDEO_GEN` / `VOICE_TTS` factory yokken sicile yazılmazdı — ya dürüst kopya (“kapı yok”) ya da tavan 6. `FAST_STREAM` adında stream UI vaat etmezdim.

### 6. Hız tavanı bellek implementasyon, port arayüz

Redis eklemezdim (Anayasa doğru). Ama `RateLimitPort`’u ilk günden ayırırdım: bellek `Map` varsayılan, ikinci replica kararı gelince implementasyon değişir, çağıran değişmez. Bugün `http-rate-limit.ts` süreç-içi gerçeği doğru söylüyor; port yokluğu ileride ya Redis kaçak kopyası ya da sessiz delik üretir.

### 7. CI ilk commit’te takip edilir, typecheck bir kez koşar

`verify:prebuild` yeter. Müze `staging-deploy.yml` / k6 chess / Redis compose kopyalanmaz. Docker şart değil. `.github/workflows/ci.yml` takipsiz bırakılmazdı.

### 8. Tutacağım kararlar (farklı yapmam)

- Tek süreç, tek nakit gümrüğü, 12 oda tavanı, `amountMinor`, Prisma postgres yazma + FORCE RLS okuma.
- `SUPABASE_SERVICE_ROLE_KEY` yok. Storage vatandaş JWT + anon.
- DevLabs linter’dır, runner değildir. Arena HTTP + Inngest. S43 kapalı döngü.
- `app/` + `lib/<oda>/` + `lib/kernel/` kalıbı. `src/` açılmaz. Mikroservis şimdi yok.
- Yığın (Next 16, React 19, Prisma 7, Zod 4, Inngest, jose) tutulur. TypeScript 6, lucide, geist zorunlu değil.
- Kariyer’e SWOT ormanı açılmaz.

### Dört cümlelik yol (sıfırdan)

Anayasayı ve yasak listesini ilk gün kilitle. Müze’yi fiziksel olarak ayır. Omurgayı **bir** öğrenme döngüsüyle üretime bağla. Sonra oda derinliğini nakit döngüsüne göre aç — iskeleti on ikiye çoğaltarak değil.

Neden bu sıra? Çünkü yeşil `verify:prebuild` + 12 kapalı vitrin, vatandaşın sertifika gördüğü bir Akademi dumanından daha az kanıttır. Müze’nin dersi yüzey sayısı değil, **bağlanmamış yüzeyin yalan söylemesidir.**

---

## Bir Sonraki Aşama Önerisi

**Yeni oda değil. Yeni Studio peronu değil. Müze dosyası taşımak değil. Kariyer SWOT değil.**

Omurga ve 12 oda mutlu yolu zaten kodlanmış. Kırılacak yer motor değil: **silinmiş insan SSOT, takipsiz CI, unutulmuş DevLabs katalog satırı, bağlanmamış üretim.**

### 1 — bu hafta, kod yok: T0 kalkanını geri al

Çalışma ağacından silinen dosyalar HEAD’te duruyor. Yeniden icat edilmez.

```
git checkout HEAD -- docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md docs/07_tedavi_raporu_d3_nihai_muhur.md
```

`tests/kernel/ops-migrate-surface.test.ts` yeşile döner. Anayasa “Canlıya geçiş” ve runbook §14 ölü linki kapanır.

Aynı dilimde Anayasa “Envanter SSOT” satırı **bu dosyaya** (`docs/01_TESPIT_RAPORU.md`) kilitlenir. `tespit_raporu_v1.md` / `Tespit_Raporu.md` tarihsel arşiv olarak HEAD’ten geri alınabilir veya açıkça “arşiv, okunmaz” denir — üçüncü “01” icat edilmez. `01_tespit_raporu_karsilastirma.md` bu belgenin 16 Ağustos kardeşidir; kanonik ad tekleşir.

Bu adım bitmeden `lib/career/engine.ts` veya `app/studio/...` açılmaz.

### 2 — ilk kod yüzeyi (hâlâ yeni oda değil)

`.github/workflows/ci.yml` git’e alınır. Müze workflow kopyası değildir; `npm run verify:prebuild` yeter. Playwright / Docker / tam `npm test` eklenmez. CI içindeki ikinci `typecheck` adımı isteğe bağlı sadeleştirilir (`verify:prebuild` zaten içerir).

### 3 — ilk ürün kodu yaması (omurga bağından önce bile meşru)

`REQUIRED_CATALOG_DEFINITIONS` + `supabase/migrations/20260814040000_price_catalog_definitions.sql` içine `devlabs` / `generation:code` tohumu. Motorun okuduğu anahtar sicilde yoksa “canlıya-çıkış mührü” nakit kapısında yalan söyler. Yeni peron değildir; unutulmuş satırdır.

### 4 — T2 omurga (az kod, ops)

`.env.local` (müze `.env` kopyalanmaz) → `npm run ops:migrate` → Dashboard `studio-assets.sql` → Storage CORS → PayTR webhook HMAC → Inngest Cloud çift anahtar → ilk Super Admin UUID.

Boş halka sahte bakiye ile doldurulmaz.

### 5 — ilk dikey duman (yeni modül yazılmaz)

Omurga bağlandıktan sonra kanıtlanacak **tek** döngü: **Akademi** — `lib/academy/` + `app/academy/[slug]/oyna` + `app/api/academy/courses/[id]/purchase`.

Neden akademi, neden freelancer değil?

- Öğrenme–kanıt–kazanç halkasının ilk halkasıdır.
- Mutlu yol en tam kodlanmış dikeylerden biridir.
- Tohum `ac_rail_temel` SQL’de durur; `ops:t3-academy-loop` tanımlıdır.
- Kariyer vizesi akademi belgesine dayanır; akademi yeşil değilse kariyer yalanı olur.
- Freelancer ikinci halkadır (kazanç). Önce öğrenme kapanır.

Yapılacak iş üçüncü kurs motoru yazmak değildir: bağlı ortamda satın al → oyna → sınav → `/academy/dogrula/[hash]`.

### Yapılmayacaklar

- 13. oda, Socket, Redis, GİB, çekim, Turnstile, OAuth şişmesi
- Studio 15 peron, DevLabs SaaS/Builder/sandbox exec
- Hibe canlı kamu API’si, TKGM/sigorta “canlı” yalanı
- Müze `amountKurus` / triple-balance / holding
- `docs/`’a 20 oda raporu yazıp uygulamayı erteleme
- Rail’i mikroservise bölme
- Silinen T0 dosyalarını boş şablonla yeniden yazma (HEAD’ten geri al)

### Karar özeti

| Sıra | Somut iş | Tür |
|------|----------|-----|
| 1 | `git checkout` seremoni dosyaları + Anayasa envanter yolu bu belge | **ilk düzeltme** |
| 2 | `.github/workflows/ci.yml` git takibi | ince CI |
| 3 | DevLabs `generation:code` katalog tohumu | küçük ürün yaması |
| 4 | `.env.local` + `ops:migrate` + bucket + PayTR + Inngest | ops, az kod |
| 5 | Akademi dumanı | **ilk dikey, yeni kod değil** |

Ben **1** derim. 12 oda mutlu-yol motoru + API + sayfa taşıyor. Bugün eksik olan yeni oda değil; **çalışma ağacından silinen T0 mühürleri, omurganın üretimde bağlanması ve öğrenme halkasının canlı kanıtıdır.**

---

*Ürün kodu bu tespitte değiştirilmedi. Müze `yetkin.ai/` Rail git’ine girmez; kör kopya yasaktır.*
