# Tespit Raporu — `yetkin.ai` × `yetkin_rail`

> **Arşiv / Tarihsel Sapmalı Rapor.** Bu dosya 16 Ağustos 2026 ~05:05 envanteridir; güncel envanter SSOT değildir. Sayılar, belge yolları (Anayasa / `07_OPS_RUNBOOK` / `08_STORAGE_CONTRACT` “diskte yok”), akademi müfredat oynatıcısı ve `docs/01_tespit_raporu.md` adı sapmalıdır. Güncel envanter: `docs/tespit_raporu_v1.md`. Tedavi T0/T1: `docs/tedavi_raporu_v2_t0_t1.md`.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor Grok 4.6) |
| Kapsam | Müze `yetkin.ai/` (prototip monolit) ile kök `yetkin_rail` gövdesi |
| Yöntem | Disk envanteri, `package.json`, Prisma şemaları, App Router, `lib/`, kenar mühürleri, test yüzeyi, ops referansları |
| Önceki envanter | `docs/000_TESPIT_RAPORU.md` (15 Ağustos). **Sayılar, SEN/CLS, katalog, storage, Supabase sürümü ve `docs/` SSOT bu rapora göre eskidir.** |
| Bilinçli sınır | Bu adımda ürün kodu değiştirilmedi. Teslimat yalnız bu dosyadır. |

---

## 0. Yönetici özeti

`yetkin_rail`, `yetkin.ai` monolitinın kopyası değildir. Müze **ilham ve yasak listesi** olarak durur (`S9-B`: TypeScript, Next tracing ve ESLint import grafının dışında). Rail, **on iki dikey oda + dört çekirdek sığınak** üzerine kurulmuş, nakit ve LLM’i tek gümrükten geçiren bir yeniden yazımdır.

Ölçek farkı kasıtlıdır:

| Ölçüt | `yetkin.ai` (müze) | `yetkin_rail` (gövde) | Oran |
|--------|---------------------|------------------------|------|
| Anayasal yüzey | 18 BINA domain + 130 düğüm | 12 oda + 4 çekirdek yüzey | ~1/3 |
| `page.tsx` | 158 | 39 | ~%25 |
| `app/**/route.ts` | 559 | 84 (83 API + `/auth/callback`) | ~%15 |
| Prisma modelleri | 248 (tek `schema.prisma`) | 44 (çok dosyalı `prisma/schema/`) | ~%18 |
| Prisma migrasyon | 210 | 10 uygulama + 7 Supabase SQL + 1 storage SQL | — |
| `loading.tsx` | 151 | 33 | — |
| `error.tsx` | ~148 (oda-oda) | 1 (kök) | — |
| `lib/` üst klasör | 90 | 16 | — |
| `lib/` TS/TSX | ~2291 | 256 | ~%11 |
| `components/` TS/TSX | ~1111 | 123 | ~%11 |
| Vitest `*.test.ts` | ~603 | 104 | ~%17 |
| Playwright spec | 11 | 12 | — |
| Inngest işçisi | 22 | PayTR valör + emanet TTL + Arena tur | — |
| SEN kopya dosyası | ~33 | 16 oda/çekirdek + hukuk + durum etiketleri | — |
| React `hooks/` | 37 | 0 | kasıtlı |

**Asıl tespit:** Rail omurgası (kimlik, defter, emanet, fiyat kilidi, PayTR, LLM gümrüğü, RLS, oda duvarları, kenar JWKS/CSP, HTTP idempotency, Studio imzalı nesne depo, dashboard BFF nabız) **yazılmış ve mühürlenmiş** durumdadır. Beş dikey mutlu yol (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) kodda durur. Müzenin çoğunluğu — satranç, anket, lonca, tarım, Socket.IO, Redis, GİB, reklam, 15 Studio peronu, 130 BINA düğümü — **bilinçli olarak kesilmiştir**, unutulmuş değildir.

**15 Ağustos raporunun P0’ları büyük ölçüde kapanmıştır.** `generation:image` tohumu, SEN tavanı + `verify:sen-axis`, oda `loading.tsx`, `/api/dashboard/pulse`, Supabase `ssr ^0.12` / `js ^2.11x`, Studio imzalı PUT, nakit e2e yüzeyi kodda vardır.

**Bugünkü asıl boşluk üç kovadır; “eksik” demek tek başına yanıltır:**

1. **Bilinçli kesim** — anayasa / şema başlığı / `.env.example` yasağı. Geri açılmaz.
2. **Rail kapsamına giren ürün derinliği** — kariyer alt istasyonları, akademi müfredat oynatıcısı, kurumsal CRM, yasal alt sayfalar, VIDEO/TTS factory.
3. **Doküman SSOT çöküşü (yeni P0)** — test ve README `docs/ANAYASA.md`, `docs/07_OPS_RUNBOOK.md`, `docs/08_STORAGE_CONTRACT.md`, `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` ister. Diskte yalnız `docs/000_OPS_RUNBOOK.md` ve `docs/000_TESPIT_RAPORU.md` durur. Prebuild `constitution-surfaces` ve ops yüzey testleri bu yüzden fail-closed kırılır.

**Tek cümlelik strateji:** *12 odayı şişirme; doküman SSOT’u kanonik yola geri oturt; öğrenme–kanıt–kazanç döngüsünün içeriğini üretimde kanıtla.*

---

## Mevcut Durum Özeti

`yetkin_rail`’de tamamlanmış olan kısımlar. Aşağıdakiler “iskelet sayfa” değildir: motor + API + (çoğunda) sayfa + test vardır.

### Kimlik

Rail, müzenin 18 asil domain / 130 düğümlük BINA sicilini **çekirdek / dikey oda** ayrımına çevirmiştir. Bu, en önemli yapısal kazançtır.

```
app/            (auth) (kernel) (public) + 12 oda + api
components/     oda UI + shell + theme + ui primitives (~123)
lib/            kernel (106) + 12 oda + copy + dashboard + showcase + ui
prisma/schema/  kernel + 12 oda (.prisma)  |  prisma/migrations/ (10)
supabase/       auth sync + RLS + katalog + seed (7) + storage SQL (1)
scripts/        ops:migrate + 8 verify mühürü
tests/          kernel + oda + e2e + memory portları
proxy.ts        Next 16 tek edge girişi (kök middleware.ts YOK)
yetkin.ai/      müze (build dışı)
docs/           000_OPS_RUNBOOK.md, 000_TESPIT_RAPORU.md, bu rapor
public/         yalnızca favicon.ico
```

Font paketi (`geist`), PWA, `.well-known` provenance mührü yok — kasıtlı sadeleştirme.

### Veri akışı (Rail)

```
Vatandaş
  → proxy.ts (müze 404, /kayit 308, JWKS/HS256 JWT, nonce CSP, bellek hız tavanı)
  → App Router sayfa / API
  → requireSession | requirePageSession | requireSuperAdmin
  → dikey engine (Zod girdi)
  → kernel: katalog kilidi / EscrowHold / LedgerEntry / invokeLlm|generateImage
  → Prisma (postgres rolü yazar) + RLS (anon yalnız SELECT)
  → Inngest (PayTR valör 30 dk, emanet TTL, Arena tur)
  → PayTR webhook (HMAC; total_amount === amountMinor)
```

Çapraz oda konuşması HTTP veya kernel sözleşmesidir. Emanet iade kancaları composition root’ta `registerEscrowRefundHook` ile bağlanır; çekirdek dikey tablo adı bilmez.

### Çekirdek omurga

| Yetenek | Rail kanıtı | Müze’den farkı |
|---------|-------------|----------------|
| Kimlik | Supabase Auth, PKCE `/auth/callback`, cookie/Bearer `getUser`, fail-closed | Turnstile, OAuth şişmesi, `LOCAL_MOCK_AUTH` yok |
| Kenar | Tek `proxy.ts`: müze 404, `/kayit` 308, JWKS/HS256 JWT, nonce CSP, K6 `auth` kind, cookie yenileme (ssr 0.12) | Müze 400 satırlık yığın kopyalanmadı |
| Para | `Wallet` + append-only `LedgerEntry`; User’da bakiye kolonu yok; birim `amountMinor` | Müze üçlü ayna (`User.balanceKurus` + Wallet + ModuleWallet) sadeleştirildi |
| Emanet | `EscrowHold` kilit (bakiye türü değil), 14 gün TTL, dikey iade kancası | Hold payı bps %10–%15 bandı korundu |
| Ödeme | PayTR iframe yükleme ₺10–₺20.000; webhook tutar eşitliği; valör Inngest 30 dk | Çekim **yok** (S43); GİB / holding havuzu yok |
| Fiyat | Super Admin katalog SSOT; 15 dk `CheckoutPriceLock`; kod sabiti satış fiyatı yok | Müze `ModulePricingSettings` + TCMB FX + taslak yayın kuyruğu taşınmadı |
| LLM | Tek kapı `invokeLlm` / `generateImage`; 8 kanonik rol; bütçe kalkanı | Ham SDK dikeyde yasak (`verify:ai-gateway`) |
| RLS | FORCE RLS + sahip yalnız SELECT; yazma Prisma postgres rolü | `SUPABASE_SERVICE_ROLE_KEY` JS/env’de yok |
| İşler | Inngest `yetkin-rail`: PayTR clearing, emanet TTL, Arena tur | Socket/Redis yok |
| Idempotency | Defter `idempotencyKey` @unique + HTTP `Idempotency-Key` + `HttpIdempotencyRecord` | Müze kadar evrensel tarama yok; çekirdek yazmalar mühürlü |
| Hız tavanı | Süreç-içi bellek: cüzdan yükleme + auth IP | Redis yok; çok instance güvenli değil |
| Sağlık | `GET /api/health` DB ping; down = 503; JSON `phase` **taşımaz** | Müze `detailed` + faz sayacı yok |
| Admin | Katalog PATCH (amount + BPS); kenar `auth = "admin"` + env UUID | Üye / moderasyon / çekim paneli yok |
| Pasaport | Vize projeksiyonu (`/pasaport`) | Rozet / liyakat arzı / doğrula çocukları yok |
| Profil | Kimlik kartı + görünen ad yazma | KYC / MFA / siparişlerim / ayarlar yok |
| Studio depo | İmzalI PUT (`studio-assets`), Prisma hash/mime/path; eski satır `inline-base64` okunur | Müze Base64 + çok peron |
| Kokpit | Tek BFF `/api/dashboard/pulse` (12 nabız parçası) | Müze fırsat motoru / PropTech kokpiti yok |

### On iki oda — mutlu yol (taşınmış iskelet)

Kaynak: `lib/kernel/modules.ts`.

| Oda | Vatandaş yolu | Rail’de duran mutlu yol | `lib/` dosya |
|-----|----------------|-------------------------|--------------|
| Dashboard | `/dashboard` | 12 nabız + cüzdan şeridi + oda şeridi; tek BFF | 15 |
| Studio | `/studio` | Metin + IMAGE_GEN; jeton debit; taslak/üretim; imzalı nesne depo; Base64 tavan 2 097 152 | 12 |
| Akademi | `/academy` | Katalog → fiyat kilidi → settlement → sınav ≥70 → SHA256 sertifika → `/academy/dogrula/[hash]` (2 tohum kurs) | 11 |
| Kariyer | `/career` | Akademi sertifikası veya freelancer RELEASE ile **atomik** vize + portföy | 7 |
| Freelancer | `/freelancer` | İlan → teklif → emanet kabul → mesaj → teslim/iade; 2 turlu tahkim; squad `shareBps` | 14 |
| DevLabs | `/devlabs` | Proje → üret → anayasal linter (`eval`/`child_process` yasak) → artifact; HMAC kasa (`yrk_`, bir kez gösterilir) | 10 |
| Kurumsal | `/kurumsal` | Şirket + mühürlü ilan + ödül/serbest/iade | 9 |
| Hibe | `/hibe` | Tohum katalog + etiket eşleştirme + rehber kayıt; `catalog-not-live-government-api` | 9 |
| Arena | `/arena` | İhale emaneti + HTTP/Inngest tur tiki; Socket yok | 10 |
| Pazaryeri | `/yetkinilan` (disk `pazaryeri`) | Dijital anında settlement vs hizmet/emlak/vasıta emanet; teklif; doping | 12 |
| Junior | `/junior` | Yaş kapısı 10–17, ebeveyn, harçlık **Wallet satırı değil**; 2 statik MEB izi | 9 |
| Social | `/social` (YetkinX) | Mühürlü kanıt akışı + ACK/SHARE; tıklama tuzağı/siyaset denylist; boost yok | 11 |

### Çekirdek sığınaklar (oda sayılmaz)

`/profil`, `/cuzdan`, `/pasaport`, `/admin` — sağ hub; sol ray değil.

### İnce alias tavanı (kilitli)

`next.config.ts`: `/kariyer`→`/career`, `/ogren`→`/academy`, `/yetkinx`→`/social`, `/corporate`→`/kurumsal`, `/profile`→`/profil`, `/passport`→`/pasaport`, `/market`→`/yetkinilan`, `/giris`→`/login`, `/kayit`→`/register` (kenarda ayrıca 308). Rewrite: `/yetkinilan` → `/pazaryeri`. KAPAT-oda yönlendirmesi yazılmaz. `/yetkin.ai` 404.

### Mühürler (prebuild)

`verify:prebuild` = `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

Build: `prisma generate && verify:prebuild && next build`.

### Katalog sicili

`REQUIRED_CATALOG_DEFINITIONS` (7 anahtar): `studio:generation:text`, `studio:generation:image`, kurumsal ilan tabanı, arena havuz tabanı, pazaryeri listing/asset/doping.

Akademi kurs fiyatları SQL seed’de (`academy_course_seed.sql`), bu dizide değil. `studio:generation:image` hem dizi hem SQL tohumdadır (15 Ağustos boşluğu kapanmıştır).

### Bağımlılık (güncel)

| Paket | Müze | Rail | Durum |
|--------|------|------|--------|
| `next` / `react` | 16.2 / 19.2 | aynı | hizalı |
| Prisma 7 + adapter-pg | aynı | aynı | hizalı |
| `@supabase/ssr` | ^0.12.0 | **^0.12.4** | hizalı (15 Ağu sapması kapanmış) |
| `@supabase/supabase-js` | ^2.108.2 | **^2.112.3** | Rail güncel |
| `typescript` | ^6.0.3 | ^5.9.2 | acil değil |
| `jose` | — | ^6.2.9 | kenar JWT; Rail kazancı |
| `inngest` / `zod` | 4.11 / 4.4 | aynı | hizalı |

Redis, Socket.IO, lucide, chess.js, Sentry, Resend, dnd-kit, geist Rail’de yok — çoğu kasıtlı.

### 15 Ağustos’tan beri kapanan işler (Tedavi 02 fiilen kodda)

- `generation:image` katalog tanımı + SQL + Prisma migrasyon
- SEN paketinin kalan odalara yayılması + `verify:sen-axis` prebuild
- Dashboard “Bakiyeniz” kaçağı (grep boş)
- Eksik oda `loading.tsx` (33 kabuk; geometri `RoomSkeleton`)
- `/api/dashboard/pulse` BFF
- Studio imzalı yükleme API (`sign-upload` / `confirm`) + object-store şema
- Supabase SSR/js bump + kenar cookie yenileme
- `E2E_BASE_URL` `.env.example`
- Katalog PATCH `auth = "admin"`
- Nakit döngü e2e yüzeyi (`tests/e2e/cash-loop.spec.ts`)
- Ops runbook içeriği yazılmış — **ama kanonik yol adı diskte yok** (aşağıda)

---

## Eksik ve Fark Analizi

`yetkin.ai` ile karşılaştırmalı olarak eksik modüller ve kod blokları.

### Bilinçli kesim — tekrar açılmamalı

| Modül / kod bloğu | Müze konumu | Gerekçe |
|-------------------|-------------|---------|
| Chess + `chess.js` + socket:3001 | `app/chess`, `server/chess-socket-server.ts`, `lib/chess/` | Frozen; ayrı işletim yüzeyi |
| Anket / kamuoyu + socket:3002 | `app/anket`, `lib/kamuoyu/`, `lib/anket/` | Frozen; k-anonimlik yığını |
| Loncalar / meclis | `app/loncalar`, `lib/loncalar/`, `lib/meclis/` | Frozen; 13. oda yasağı |
| Tarım | `app/tarim`, `lib/tarim/` | Frozen; AI rol patlaması gümrüğü kirletmişti |
| Talent | `app/talent`, `lib/talent/` | Oda sicilinde yok; 13. oda |
| Redis / Upstash / Socket.IO | `lib/redis/`, `server/*`, Arena socket | Arena = HTTP + Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | müze env | RLS + Prisma yazma çizgisi |
| GİB / e-arşiv / banka çekimi | `lib/inngest/functions/gib-invoice-queue.ts`, `app/admin/withdrawals` | Hukuk dürüstlüğü; S43 |
| Reklam / Turnstile / OAuth şişmesi | `lib/ads/`, `app/studio/yetkin-ads` | Müze env yasağı |
| DevLabs exec / sandbox runner / Codex deploy | `app/devlabs/{sandbox,codex,saas,builder,commerce}` | Şema: “Exec asla” |
| Social boost / jüri / X-YouTube-LinkedIn | `lib/social/youtube-client.ts`, `linkedin-client.ts`, `XPost` modelleri | DTO yasağı |
| VIDEO_GEN / VOICE_TTS factory | rol anahtarı her iki gövdede | Rail’de factory yok; müze peron ormanı |
| 130 BINA registry + onlarca alias | `lib/bina/domain-registry.ts` | İnce alias tavanı |
| `amountKurus` kolon adı | tüm müze şema | S5-A |
| `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` | müze env | Dürüst kapalı yüzey |
| Liyakat puanı takası (`merit-swap:`) | `lib/merit/` | İkinci nakit yazıcı yasağı |
| Holding havuzu / triple-balance | `wallet-triple-balance-reconcile.ts`, `ModuleWallet*` | Tek Wallet SSOT |
| `hooks/` (37 dosya) | `yetkin.ai/hooks/` | Rail sunucu-ağır; istemci kancası yok |

### Rail odası var, derinlik müze’nin gerisinde (ürün kararı)

Bu tablo “hepsini taşı” listesi **değildir**. Her satır ayrı onay ister.

| Oda | Rail’de olan | Müze’den gelmeyen derinlik / kod bloğu |
|-----|----------------|------------------------------------------|
| Career | Kanıt → vize → portföy (atomik); tek `/career` | `app/career/{cv-builder,swot,prova,zihinsel-prova,roadmap,cv-analiz}`; `CareerSwotReport`, `CareerProvaSession`, `CareerRoadmap` |
| Academy | Satın al + sınav + sertifika (2 tohum kurs) | `app/academy/[slug]/{curriculum,vision}`, `corporate-qualification`, `AcademyLesson`, `UserCourseProgress`, müzayede/telif, AI kürsüsü |
| Studio | Metin + IMAGE_GEN + imzalı depo | 15+ peron: `yetkin-ads`, `yetkin-3d`, `yetkin-talk`, `canvas`, `photo`, `avatar`, `invoice`, `dijital-twin`, `convert`, `brand`, `flow`, `connect` |
| DevLabs | Kasa + generate + linter | `saas`, `builder`, `blueprint`, `commerce`, `codex`, `forge`, `native`, `engine`, `webhooks`, `sandbox` — **anayasa NARROW; varsayılan hayır** |
| Kurumsal | Şirket + mühürlü ilan | `app/kurumsal/{crm,hibe,fatura,gorevler,assets}`; `CrmDeal`, `TwinIkAgent`, `CorporateBrainContext` |
| Hibe | Katalog eşleştirme + rehber kayıt | `app/hibe/olustur`, canlı KOSGEB scraper (`lib/hibe/scrapers/`), Success-Fee, KDV kredi — **dürüstçe kapalı tutulmalı** |
| Pazaryeri / Yetkinİlan | Dijital/hizmet + RE/araç, teklif, doping | PropTech 5 aşamalı CRM (`MarketLead`), müzayede, sigorta, FX pasaportu, TKGM canlı API |
| Junior | Yaş + veli + harçlık tavanı | `app/junior/meydan`, mentor, MEB içerik üretimi, `JuniorMentorSession` |
| Dashboard | 12 nabız BFF + cüzdan şeridi | `app/dashboard/{firsat,yetkin-ilan,yetkin-panel}` |
| Admin | Katalog | `app/admin/{uyeler,moderation,support,withdrawals,ads-config,errors}` |
| Pasaport | Vize projeksiyonu | `app/pasaport/{rozetler,liyakat,dogrula,vize}` |
| Legal | Tek `/legal`, dürüst “mükellefiyet henüz açık değil” | `app/legal/{mesafeli-satis,iade-sartlari,on-bilgilendirme}` ayrı sayfalar |
| Auth UX | login/register/şifre; ayrı verify-email yok | `app/verify-email`, `app/onboarding`, Turnstile |
| Profil | Kimlik + görünen ad | `app/profil/{siparislerim,ayarlar}`, KYC (`UserKycIdentity`) |

### Çapraz kesen eksikler (oda değil, platform)

| Boşluk | Durum | Risk |
|--------|--------|------|
| `docs/ANAYASA.md` | Test SSOT; **diskte yok** | `constitution-surfaces.test.ts` fail; ajan anayasayı grep’ten uydurur |
| `docs/07_OPS_RUNBOOK.md` | README / `.env.example` / hukuk / test bu yolu ister; içerik `docs/000_OPS_RUNBOOK.md`’de | Ops ve prebuild kırığı |
| `docs/08_STORAGE_CONTRACT.md` | `lib/studio/storage.ts` + şema + test referansı; **dosya yok** | Storage sözleşmesi kodda, belgede değil |
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | Runbook ve ops test ister; **dosya yok** | Seremoni SSOT yok; sahte `phase` yazma yasağı belgesiz |
| VIDEO_GEN / VOICE_TTS factory | Rol anahtarı var, `generateImage` dışında factory yok | Rol vaadi ile yüzey çelişir |
| `FAST_STREAM` / `LITE_STREAM` UI stream | Rol adı “akış”; Studio/DevLabs senkron `invokeLlm` | Kopya “iskelet rol” vaadiyle çelişebilir |
| İşlem e-postası | Auth SMTP Supabase’e bırakılmış; nakit `txn.notice.*` log | Emanet/anlaşmazlık/sertifika kör uçabilir |
| Gözlem SDK | `requestId` + yapılandırılmış log var; Sentry/OTel yok | Nakit kör uçmaz ama alarm yok |
| Hız sınırı | Bellek içi; çok instance paylaşılmaz | Üretimde yetersiz; runbook dürüstçe “tek süreç” der |
| Inngest PayTR taraması | `take: 50` / 30 dk | Hacimde backlog |
| Defter sayfalama | `WALLET_LEDGER_TAKE` üst sınırı; cursor yok | Üretimde sessiz kesme kopyası kalmalı |
| `error.tsx` | Yalnız kök | Oda-içi hata izolasyonu müze kadar ince değil (kopya 148 dosya istenmez) |
| i18n | Fiilen `tr`; müze `en_US` SEO kapalı | Taşınmasın |
| Font / PWA / provenance | yok | Quiet Luxury için zorunlu değil |

### Müze yüzey örnekleri (Rail’de yok)

Bilinçli kesim: `/chess/*`, `/anket/*`, `/loncalar/*`, `/tarim`, `/talent`, `/meydan` ayrı domain, Socket sunucuları.

Ürün derinliği (oda var, çocuk yok): kariyer alt istasyonları; akademi müfredat/vizyon; Studio peron ormanı; DevLabs SaaS/Builder/Codex/Commerce; kurumsal CRM/fatura/hibe kokpiti; dashboard fırsat/yetkin-ilan; admin üye/moderasyon/çekim; yasal alt sayfalar; pasaport çocukları; destek/yardım/fiyatlandırma/onboarding/verify-email/seref-kursusu.

---

## Kritik Hatalar / Riskler

Teknik borç, çakışma ve üretim kapısı. “Hata” ile “bilinçli kesim” karıştırılmamalı.

### P0 — doküman SSOT çöküşü (bugün kırık)

Kod, test ve README **kanonik yolları** mühürler. Disk bu yolları taşımaz:

| Beklenen yol | Diskte olan | Kırılan mühür |
|--------------|-------------|----------------|
| `docs/ANAYASA.md` | yok | `tests/kernel/constitution-surfaces.test.ts` (`12 oda`, `amountMinor`, `S43`, `service_role`, JWKS…) |
| `docs/07_OPS_RUNBOOK.md` | içerik `docs/000_OPS_RUNBOOK.md` | `tests/kernel/ops-migrate-surface.test.ts`, README, `.env.example`, hukuk kopyası |
| `docs/08_STORAGE_CONTRACT.md` | yok | `tests/studio/storage-contract-surface.test.ts`, `lib/studio/storage.ts` yorumu |
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | yok | ops-migrate yüzey testi; runbook §14 |

Bu bir isimlendirme kazasıdır, ürün motoru kazası değil. Ama `npm run verify:prebuild` / `test:surface` bu dosyaları **okur**. Üç ajanlı ekipte (Cursor / insan / Gemini) anayasa markdown olmayınca 13. oda ve `amountKurus` talepleri grep’e düşer.

`docs/000_OPS_RUNBOOK.md` içeriği doludur ve doğru kuralları anlatır. Sorun **yol adı**. `000_TESPIT_RAPORU.md` dünkü envanterdir; SEN/CLS/katalog/storage sapmaları bu raporla düzeltilir.

### P0 — üretim operasyonu (omurga kör uçmasın)

1. **Kanonik runbook yolu yok.** Operatör README’deki `docs/07_OPS_RUNBOOK.md`’yi açamaz. `ops:migrate` host kuralı (`db.<ref>.supabase.co:5432`, havuz 6543 yasak) içeriği 000 dosyasında durur; ajanlar ölü linkte kaybolur.
2. **Studio bucket SQL `ops:migrate` dışında.** Doğru (kilitli yedi SQL şişmez). Yanlış: Dashboard SQL Editor adımı belgesiz kalırsa görsel üretim 4xx / “nesne depo bağlı değil”.
3. **Hız tavanı tek süreç.** İkinci replica aynı IP kotasını görmez — sessiz delik. Redis eklenmemeli diye runbook yazar; ikinci instance da açılmamalı.
4. **Inngest imza.** Üretimde boş `INNGEST_SIGNING_KEY` → 503 (doğru). Cloud bağlanmadan valör/TTL çalışmaz; PENDING sipariş birikir.

### P1 — nakit / depo / gözlem

5. **Nesne depo fail-closed.** `createObjectStoreStudioAssetStorage().put` “nesne depo bağlı değil” fırlatır. İmzalI PUT yolu ayrıdır; bucket + RLS + CORS kurulmadan görsel üretim debit’ten önce kırılır — bu dürüst, ama ops adımı atlanırsa “Studio bozuk” sanılır.
6. **Eski `inline-base64` satırlar.** Kör DROP yok (doğru). Yedek hâlâ şişebilir; migrasyon planı belgesiz.
7. **İşlem bildirimi yalnız log.** `txn.notice.wallet_cleared` / `escrow_refunded`. Anlaşmazlık / sertifika / tahkim e-postası yok. Vatandaş kör, ops log’a bağlı.
8. **PayTR `take: 50`.** Yoğun günde valör kuyruğu uzar; metrik yok.
9. **HTTP idempotency** kritik yazmalarda var (top-up, akademi satın al, freelancer kabul). Evrensel müze taraması yok — bilinçli. Yeni nakit ucu ekleyen ajan sicili unutabilir.

### P1 — yüzey / güvenlik

10. **Tek kök `error.tsx`.** Müze oda-oda error presleri CLS’i korur. Rail’de oda patlaması kök karta düşer; Quiet Luxury için kabul edilebilir ama digest log’u `console.error` — üretimde Sentry yok.
11. **Kenarda açık dikey okuma.** `/academy`, `/freelancer`, `/career` SEO vitrini; yazma kabukları `PROTECTED_WRITE_PATHS`. Layout `requirePageSession` çift kilit. Sicil dürüst tutulmalı; yeni path ekleyen ajan kenarı unutmasın (`write-path-edge-surface` duruyor).
12. **Admin = env UUID.** Boş env = kimse admin değil (doğru). UUID sızıntısı modelini `auth = "admin"` daraltır; hâlâ tek sır.

### P2 — ürün derinliği (onaylı, teker teker)

13. Akademi satın alıyor, kariyer vize basıyor, freelancer emaneti serbest bırakınca yine vize. **Çekirdek döngünün iskeleti var; içerik ince.** 2 tohum kurs, müfredat oynatıcı yok, Kanıt Portföyü (`cv-builder`) yok.
14. Kurumsal ↔ freelancer aynı emanet motoru; uçtan uca e2e ince.
15. `User` üzerindeki onlarca `@relation` kolon şişmesi değil; okunurluk borcu. Mikroservise şimdi bölmek nakit gümrüğünü çoğaltır.

### Mimari kazançlar (kopyalanmamalı, korunmalı)

1. **Çekirdek ↛ dikey; dikey ↛ dikey motor.** ESLint §2.8.
2. **Tek nakit SSOT.** Wallet satırı + defter. Escrow kilit, ikinci bakiye değil.
3. **String FK.** Odalar `EscrowHold` / `CheckoutPriceLock` / `AiTokenUsage` id’sini string tutar (`verify:atomic-seals`).
4. **Dürüst kapalı ürün.** Boş env → “Giriş henüz bağlanmadı”; boş DB → “Liste henüz yüklenemedi”.
5. **Marka ≠ disk.** `pazaryeri/` disk, vatandaş `/yetkinilan`.
6. **12 oda tavanı.** 13. oda yasak.
7. **Kenar ince, fail-closed JWT.** Cookie varlığı yetmez.
8. **CSP nonce.** Üretimde `unsafe-eval` yok.
9. **DevLabs linter’dır, runner değildir.**
10. **Kapalı döngü cüzdan (S43).** PayTR ile girer, uygulama içinde harcanır, bankaya çıkmaz.

### Müze’den bilinçli sadeleştirmeler

| Müze | Rail |
|------|------|
| Triple-balance + holding havuzu | Tek Wallet |
| 22 Inngest işçisi | 3 tarama + Arena + iade kancası |
| 3 Socket süreci + Redis | HTTP + Inngest |
| 42 dosyalık `lib/auth` | İnce session/password/super-admin |
| lucide + geist + dnd-kit | Yerel SVG + sistem font |
| `amountKurus` | `amountMinor` (UI “kuruş”) |
| Super Admin e-posta + IP allowlist | Env UUID eşitliği |
| Resend işlem maili | Yapılandırılmış log (`txn.notice.*`) |

---

## SEN OLSAYDIN NE YAPARDIN?

Müze’yi “daha düzenli kopyala”mazdım. 12 oda + çekirdek kararı doğru. 130 düğümü geri doldurmak, üç kişilik ekibi tekrar `yetkin.ai` karmaşasına götürür.

Yapacağım iş üç cümle: **doküman SSOT’u kanonik yola kilitle, omurgayı üretime dürüst bağla, oda derinliğini nakit döngüsüne göre sıraya diz.**

### 1. Anayasayı koda hapsetmeyi bırakmam — ama `docs/`’u şişirmem, **yolunu da kaybettirmem**

Bugün kod mühürleri (`verify:*`, ESLint §2.8, Prisma başlıkları) duruyor; insan SSOT dosyaları yok veya 000_ önekine kaçmış. Gemini bir oturumda “talent’ı da ekle” veya `amountKurus` geri getir derse, itiraz dayanağı markdown + `verify:*` olmalı, yalnız grep değil.

Minimum set (bundan fazlasını yazmam):

- `docs/ANAYASA.md` — 12 oda tavanı, `amountMinor`, S43, kesilen domainler, `service_role` yasağı
- `docs/07_OPS_RUNBOOK.md` — zaten referans edilen; 000 dosyasının **kanonik ada taşınması veya kopyası**
- `docs/08_STORAGE_CONTRACT.md` — imzalı PUT, tavan, `auth.uid()`, `service_role` yok
- `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` — seremoni; `phase` yazılmaz
- Oda başına tek sayfa **ancak** o oda üretimde nakit taşıyınca

Bunu yazmadan yeni peron açmazdım. `docs/01_tespit_raporu.md` (bu dosya) envanter SSOT’sudur; `000_TESPIT_RAPORU.md` arşivdir.

### 2. Nakit omurgasını “iskelet tamam” sanmam — ama dünkü P0’ları yeniden açmam

Defter motoru iyi. Katalog görseli, SEN, CLS kabukları, pulse BFF, storage imzası **kodda bitti**. Eksiğim üretim kalkanının **belgesi ve bağlanması**:

- Bucket + CORS + `studio-assets.sql` gerçekten uygulandı mı? Uygulanmadıysa Studio “çalışıyor” yalanı.
- Gözlem: para mutasyonunda `requestId` var; Inngest başarısızlığında alarm yok. Escrow/PayTR kör uçmaz diye varsaymam.
- Hız tavanı: tek VM’de dürüstüm; ikinci instance’ta yalan olur. Runbook kanonik yolda “tek süreç” durmalı.
- Dashboard nabzı: 11 paralel fetch kalkmış; BFF duruyor. Kernel’e dikey tablo sokmam.

### 3. Kenarı ince tutmaya devam, ama sicili dürüst tutarım

JWT kenarda doğrulanıyor. SEO vitrini (Yetkinİlan detay, akademi katalog, sertifika doğrula) kamu kalır. Yazma kabukları listede. `/freelancer` liste açık; `/freelancer/new` kapalı. CSP’de üretim `unsafe-eval` kapalı. Bunu geri açmam.

### 4. Quiet Luxury ve SEN’i “sonra UI” diye ertelemezdim — ince mühür bitti, kopyalamam

33 `loading.tsx` yeterli; 151 kopya istemem. `verify:sen-axis` duruyor. `@bprogress/next` ve `geist` **istersem** eklerim; zorunlu görmem. Lucide eklemem. Oda-oda `error.tsx` ormanı açmam — kök kart + SEN kopyası yeter; gerekirse oda layout’una birer tane.

### 5. Öğrenme–kanıt–kazanç döngüsünü oda enflasyonu olmadan derinleştirirdim

Müzenin vaadi bu döngü. Rail’de akademi satın alıyor, kariyer vize basıyor, freelancer emaneti serbest bırakınca yine vize. Sıram:

1. **İçerik** — akademi ders oynatıcı *veya* kariyer Kanıt Portföyü. Hepsini değil. Aksi halde Studio peronları gibi dağılır.
2. **Kurumsal + freelancer köprüsü** — aynı emanet motoru zaten var; CRM’den önce uçtan uca e2e.
3. **Yetkinİlan** — ilan + teklif var; 5 aşamalı PropTech ve sigorta API’si sonra. TKGM kancası sahte canlılık üretmesin.
4. Studio 15 peron, DevLabs SaaS/Builder, talent, lonca — **açmazdım** ta ki 1–3 üretimde bir ay nakit taşıyana kadar.

Hibe canlı devlet API’si açmazdım. Katalog dürüstlüğü korunmalı.

### 6. Bağımlılık ve sürüm

- Supabase hizası bitti; tekrar “müze seviyesine çek” demem.
- Redis, Socket.IO, chess.js **eklemezdim**.
- TypeScript 6 zorunlu değil; 5.9 + `strict` yeter.
- VIDEO/TTS factory açmadan rol kopyasını “yakında” diye yalanlamam — ya factory ya kopya.

### 7. `User` şişmesi ve sınır

Prisma 7 çok dosyalı şema iyi. Mikroservise **şimdi** bölmezdim — tek deploy + oda duvarı yeterli. Servis kesimi, nakit gümrüğü çoğalınca felaket olur.

### 8. Performans (şimdi ucuz, sonra pahalı)

- Kokpit N+1 fetch kapanmış.
- `LedgerEntry` indeks doğru; “tüm tarih” isteği gelince cursor sayfalama, sessiz kesme kopyası kalsın.
- Inngest 30 dk PayTR taraması `take: 50` — kuyruk derinliği metriği.
- AI timeout + 2 deneme iyi. Stream yoksa `FAST_STREAM` adını ürün vaadi yapmam.

### 9. Güvenlik sırası (özellikten önce)

1. Doküman SSOT (anayasa + runbook + storage sözleşmesi) — testlerin okuduğu yollar
2. Studio bucket gerçek bağlama (Dashboard SQL, CORS, imzalı PUT dumanı)
3. Ops runbook kanonik ada
4. Paylaşılan hız tavanı **ancak** ikinci instance kararıyla
5. PII sicili ince; müze `verify:pii-registry` kör kopyalanmaz
6. Admin kind zaten bağlı; UUID’yi log’a yazmam

### 10. Ekip protokolü

Müze klasörü **ilham ve yasak listesi** olarak kalır, kaynak olarak import edilmez. Her “şunu da müze’den alalım” talebi bu raporun bilinçli kesim tablosundan geçer. Aksi halde Rail, 18 domainli ikinci bir monolit olur.

`docs/000_TESPIT_RAPORU.md` erken/dünkü envanterdir; **sayı, SEN, `loading.tsx`, katalog, storage, docs SSOT** için bu dosya (`01_tespit_raporu.md`) geçerlidir.

---

## Bir Sonraki Aşama Önerisi

**Bir sonraki adımı yeni oda veya müze peronu taşımak olarak görmüyorum.**

Önerdiğim sıra (CEO onayıyla, tek PR’lık dilimler):

### Adım D0 — doküman kalkanı (kod yok / az kod) — **şimdi**

1. `docs/ANAYASA.md` yaz: 12 oda tavanı, `amountMinor` / `amountKurus` yasağı, `SUPABASE_SERVICE_ROLE_KEY` yasağı, S43, kesilen domainler (chess/anket/lonca/tarım/talent), JWKS, `unsafe-eval`, Idempotency-Key, Inngest imza, `http_idempotency_records`, `data_base64`, “exec yoktur”. `constitution-surfaces.test.ts` yeşil olsun.
2. `docs/07_OPS_RUNBOOK.md`: `000_OPS_RUNBOOK.md` içeriğini kanonik ada taşı veya kopyala; README / `.env.example` ölü olmasın. `ops-migrate-surface` yeşil olsun.
3. `docs/08_STORAGE_CONTRACT.md`: imzalı PUT, tavan 2097152 / 1572864, `studio-assets`, `auth.uid()`, `service_role` yok, `ops:migrate` bucket SQL taşımaz. Storage sözleşme testi yeşil olsun.
4. `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`: seremoni; `phase` yazılmaz; bucket SQL Dashboard adımı dürüst.
5. `000_TESPIT_RAPORU.md` üstüne bir satır: “güncel envanter `01_tespit_raporu.md`.”

Bu D0 bitmeden Studio’ya üçüncü peron veya kariyer SWOT eklemem.

### Adım D1 — omurgayı gerçekten bağla (ops, az kod)

6. `npm run ops:migrate` host kuralı ile (session-mode 5432).
7. Dashboard SQL Editor: `supabase/storage/studio-assets.sql` + Storage CORS (yalnız Rail origin PUT).
8. İlk vatandaş → `SUPER_ADMIN_USER_ID` → süreç yeniden.
9. PayTR webhook + Inngest imza + Redirect URLs sicili (`/auth/callback`, `/sifre-yenile`).
10. Duman: `GET /api/health` 200; Studio görsel (katalog var, debit, imzalı GET); akademi `rail-temel` satın al + sınav.

### Adım D2 — döngü kanıtı (tek yüzey, tek sprint)

11. Canlı (veya sandbox) e2e: kayıt → yükleme → freelancer emanet → serbest → kariyer vizesi. Spec iskeleti `cash-loop` duruyor; canlı DB ince.
12. CEO seçimi: akademi müfredat oynatıcı **veya** kariyer Kanıt Portföyü (`/career` altına tek çocuk, müze `cv-builder` ormanını kör kopyalama) — **tek yüzey**.
13. Kurumsal ilan → freelancer accept köprüsü (yeni tablo yok; mevcut emanet).

### Adım D3 — üretim sertleşmesi (operatör mührü)

Tedavi: `docs/07_tedavi_raporu_d3_nihai_muhur.md`. Yeni oda yok.

14. Direct `:5432` + `ops:migrate` (D2.1–D2.3 Prisma halkası post-apply). Havuz `:6543` yasak.
15. Storage CORS yalnız app origin PUT; Inngest çift anahtar yoksa 503.
16. Üç halka tek vatandaş bellek e2e (öğrenme → kanıt → kazanç). Canlı duman Direct/Auth ister.
17. İkinci instance yoksa hız tavanına Redis **eklenmez**. Resend şart değil.

### Açıkça yapmayacaklarım (bu aşamada)

- 13. oda, Socket, Redis, GİB, çekim, Turnstile, OAuth şişmesi
- Studio 15 peron, DevLabs SaaS/Builder/Commerce, VIDEO/TTS factory
- Hibe canlı kamu API’si
- Müze `amountKurus` / triple-balance / holding geri getirme
- `docs/`’a 20 oda raporu yazıp uygulamayı erteleme
- Müze `hooks/` ve lucide/geist/dnd-kit yığını

### CEO’ya net soru

Tedavi sırası hangisi olsun?

**A (önerim):** D0 doküman SSOT + D1 omurga bağlama. Kod motoru hazır; kırılacak yer kanonik belge yolları ve gerçek bucket/PayTR/Inngest bağıdır.

**B:** Oda-oda derinlik (academy curriculum, career SWOT, Studio üçüncü peron) — anayasa dosyası yokken ve bucket bağlanmamışken müzenin hatasının küçük ölçeklisidir.

Ben **A** derim. 12 oda zaten mutlu-yol motoru + API + sayfa taşıyor. 15 Ağustos’un katalog/SEN/CLS/storage P0’ları kodda kapandı. Bugün eksik olan, testlerin okuduğu anayasa ve ops yolları ile öğrenme–kanıt–kazanç döngüsünün **içeriğidir** — yeni oda değil.
