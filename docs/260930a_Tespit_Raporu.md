# TESPİT RAPORU — Aşama 1 (Tespit ve Mimari Analiz)

| Alan | Değer |
|------|--------|
| Tarih | 30 Eylül 2026 |
| Kapsam | Super Admin yetkisi, eğitim kapıları (freemium), dosya/SSOT hijyeni, doküman–kod örtüşmesi, stratejik sorgulama |
| Yöntem | Kod okuma + salt-okunur doğrulama (tsc, hedefli vitest, `verify:api-auth`, `verify:boundaries`, import-grafı taraması) |
| Değişiklik | **Hiçbir kaynak, doküman veya konfigürasyon dosyası değiştirilmedi.** Tek yeni dosya bu rapordur. |
| Dal / HEAD | `main` / `db10963 feat(academy): open the EC-102 storefront sale` |

---

## 0. YÖNETİCİ ÖZETİ

| # | Bulgu | Önem |
|---|-------|------|
| 1 | `yapinet360@gmail.com` **kod düzeyinde** tek kanonik Super Admin'dir. Kapı 3 katmanda (kenar `proxy.ts`, API handler, sayfa/loader) aynı SSOT'u (`isSuperAdminActor`) okur. Testler yeşil. **Canlı Supabase/Vercel durumu repodan doğrulanamaz** (Bölüm 1.1.4). | Bilgi / Doğrulama gerekli |
| 2 | Yetki **DB rolü değil, env + Auth JWT** tabanlıdır (`CANONICAL_SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_USER_ID`). Üretimde ikisi birden dolu olmazsa **kimse admin olamaz** (fail-closed). İkinci admin / break-glass / yönetim denetim izi yok. | Orta |
| 3 | "Her eğitimin ilk dersi açık" kuralı **DB bayrağı ile değil, kodda türetilmiş** olarak çalışır (`exam-path.ts` ilk anahtar). OFF-101, OFF-201 ve EC-102 için üçü de doğru çalışıyor. **Kural hiçbir anayasa/manifesto/pedagoji belgesinde yazılı değil.** OFF-101'de ek olarak hazırlık şeridi (`01_office_ai-0`) de açık → "ilk ders" tek değil iki birim. | Orta |
| 4 | Çalışma ağacında **~108 yolluk commit edilmemiş iş** var (EC-102 `02_ecommerce_ai/` dizini dahil **untracked**). `.cursorrules`'un koruduğu **3 ekran görüntüsü working tree'de silinmiş (D)** durumda. | **Yüksek** |
| 5 | `public/` = **866 MB** (Vercel Pro statik tavanı ~1 GB). Git paketi **2.94 GiB + 433 MiB gevşek**. Her yeniden fırın ~30–40 MB × 6 mp3 git geçmişine ekleniyor. | **Yüksek** (ölçek) |
| 6 | Mimari **düzenli modüler monolittir** (import duvarları `verify:boundaries` ile yeşil; `lib/kernel` → dikey import sayısı **0**). "Sürü Dron / Micro-Apps" bir **etiket**tir; Anayasa B1 bunu açıkça reddeder. Spagetti değil, ama `lib/academy` (287 dosya) şişiyor. | Bilgi |
| 7 | Erişim kapısı dağınık: `lib/academy/access.ts` içinde ~10 benzer kapı fonksiyonu, serbest önizleme mantığı 5+ dosyada. | Orta |
| 8 | Doküman–doküman çelişkileri: model SSOT'u (doküman mı kod mu), Deniz/Selin kişiliği, olmayan `docs/specs/...` referansı, "sayı tekrarlanmaz" kuralının ihlali. | Düşük–Orta |

Doğrulama özeti: `tsc --noEmit` **temiz (exit 0)**; hedefli 9 test dosyası **54/54 geçti**; `verify:api-auth` **OK (60 route: session 36, public 18, admin 2, webhook 4)**; `verify:boundaries` **OK**.

---

## 1. İNCELEME VE TESPİT

### 1.1 Super Admin Yetkilendirmesi (`yapinet360@gmail.com`)

#### 1.1.1 Mimari: kimlik nerede yaşıyor?

- Kimlik: **Supabase Auth** (`auth.users`). `public.users` satırı `handle_new_user()` tetikleyicisiyle oluşur (`supabase/migrations/20260814010000_handle_new_user_auth_sync.sql`). 18+ ve KVKK rızası yoksa kayıt düşer (fail-closed).
- Veri: **Prisma** (`prisma/schema/*.prisma`). **`role` / `is_admin` kolonu yoktur** (`roleKey` yalnızca kernel.prisma:315'te, yetki değil). Supabase migrasyonlarında admin'e özel RLS politikası yok; admin işlemleri sunucuda Prisma rolüyle yürür.
- Yani **RBAC tablosu yok**; yetki **"kanonik e-posta + UUID env" SSOT**'udur: `lib/kernel/auth/super-admin.ts`.

#### 1.1.2 Karar mantığı (`isSuperAdminActor`)

1. `email_confirmed_at` boşsa → **admin değil**.
2. `yetkin.vision@gmail.com` (vatandaş test hesabı) → **asla admin** (env'e yazılsa bile).
3. `NODE_ENV=production`:
   - `CANONICAL_SUPER_ADMIN_EMAIL` **ve** `SUPER_ADMIN_USER_ID` ikisi de dolu olmalı, aksi hâlde **kimse admin değil**.
   - Ve oturumdaki `email` kanonik adres **ve** `id` = `SUPER_ADMIN_USER_ID` olmalı (çift kilit).
4. Geliştirme: doğrulanmış kanonik e-posta **veya** UUID yeter. Env boşsa varsayılan `yapinet360@gmail.com` (`CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT`).

Sonuç: `yapinet360@gmail.com` kodda **tam yetkili** (geliştirmede e-posta tek başına; üretimde e-posta + UUID + doğrulanmış e-posta).

#### 1.1.3 Yetkinin uygulandığı yerler (derinlemesine savunma)

| Katman | Mekanizma | Dosya |
|--------|-----------|-------|
| Kenar | JWT (JWKS/HS256) doğrulanır; `email` + `email_confirmed_at` **imzalı claim**'den okunur. `auth = "admin"` route'ları `isSuperAdminActor` ile 403 | `proxy.ts`, `lib/kernel/security/edge-jwt.ts`, `lib/kernel/security/edge-api-auth.ts` |
| Route haritası | `/api/admin/catalog`, `/api/admin/funnel` → `admin` (yalnız 2 adet) | `lib/kernel/security/route-auth-map.ts` |
| Handler | `requireSuperAdmin(request)` | `app/api/(kernel)/admin/{catalog,funnel}/route.ts` |
| Sayfa / loader | `resolveSuperAdminAccess()`; loader `isSuperAdminActor` eşleşmezse Prisma'ya gitmez | `app/(kernel)/admin/page.tsx`, `lib/kernel/admin/load.ts`, `funnel-load.ts` |
| Akademi duvarı | `hasAcademyAdminBypass` → tüm oynatıcı/ders/PDF/asistan kapıları | `lib/academy/access.ts` |
| Ops | `ops-super-admin-academy-grant` (lab grant) | `scripts/ops-super-admin-academy-grant.ts` |

Ek güvenceler:
- Üretimde **sıfır harçlı bağış kapalı** (`isZeroFeeAcademyGrantOpen()` → `NODE_ENV !== "production"`). Admin üretimde satın alma satırı olmadan **bellek içi** izleme yetkisi alır, DB'ye yazılmaz.
- Vatandaş test hesabı (`yetkin.vision@gmail.com`) hiçbir kapıda admin muafiyeti almaz; ticari lisans ister.

#### 1.1.4 Doğrulanamayanlar (dürüst sınır)

- **Canlı `auth.users` satırı**, e-postanın onaylı olup olmadığı, Vercel **Production** env'inde iki değişkenin dolu olup olmadığı repodan görülemez.
- Yalnızca yerel `.env.local` için şu kadarı teyit edildi (değer okunmadı): `CANONICAL_SUPER_ADMIN_EMAIL` **dolu**, `SUPER_ADMIN_USER_ID` **dolu**. Bu üretimi kanıtlamaz.
- Önerilen salt-okunur doğrulama: `npm run ops:runtime-readiness` (çıktıda `superAdmin=configured` beklenir) ve canlıda kanonik hesapla `/admin` açılışı.

#### 1.1.5 Bulgular ve riskler

| Kod | Bulgu | Önem |
|-----|-------|------|
| A-1 | Tek kişi / tek hesap: yetki devri env değişikliği + yeniden dağıtım ister. İkinci admin, break-glass ve **yönetim eylemi denetim tablosu** yok (katalog yazımında audit var; rol yönetiminde yok çünkü rol yok). | Orta |
| A-2 | Üretimde env eksikse "admin yoktur ve akademi duvarı da açılmaz" — güvenli ama **kilitlenme riski** (operasyonel). `ops-runtime-readiness` bunu raporluyor; dağıtım öncesi zorunlu kapı olmalı. | Düşük |
| A-3 | `/api/admin/curriculum-revisions` route'u `auth = "public"` ama **410 saplama** (motor arşivde). Güvenli; fakat adı "admin" olup kaydı "public" olması okuyan biri için yanıltıcı. Sayfa karşılığı: `app/(kernel)/admin/curriculum-revisions/page.tsx`. | Düşük |
| A-4 | Geliştirme/lab modunda doğrulanmış e-posta tek başına admin yeter. Lab ortamı Supabase projesi **üretimle paylaşılıyorsa** (aynı `auth.users`) bu zayıflar. Ayrı proje olduğu teyit edilmeli. | Düşük (teyit) |

---

### 1.2 Eğitim Modülleri ve Freemium (İlk Ders Açık) Mantığı

#### 1.2.1 Eğitim durumları

| Kod | Slug | Ders (sınav yolu) | Ses mührü (master voice) | Satış / yayın | Diskte medya (mp3 / bed / warmup / cinema jpg / spoken md) |
|-----|------|-------------------|--------------------------|---------------|------------------------------------------------------------|
| OFF-101 | `01_office_ai` | 8 (`-1,-k1,-2,-3,-5,-g1,-w1,-6`) + hazırlık şeridi `-0` (sınav yolu dışı) | Gözde / Callirrhoe | Amiral SKU; satın alınır | 18 / 8 / 2 / 73 / 9 |
| OFF-201 | `01_office_ai_ileri` | 6 | Aylin / Kore | `ACADEMY_OFF201_LAUNCH_SALE_OPEN = true` | 12 / 6 / 1 / **6** / 6 |
| EC-102 | `02_ecommerce_ai` | 6 | Selin / Aoede | `ACADEMY_EC102_PUBLIC_RELEASE_OPEN = true` + `academyCourseNarrationPublished` | 12 / 6 / 2 / 31 / 6 |
| — | `03_social_media_ai`, `04_chatbot_nocode`, `05_prompt_practice` | 0 (boş kabuk) | — | "Çok Yakında"; vitrinde kart, satış yok | — |

Gözlem: OFF-201 yalnız **6 cinema karesi** taşıyor (ders başına ~1), OFF-101 73, EC-102 31. "Görsel" katmanının yoğunluğu kurslar arasında tutarsız; mühür kapısı yalnızca varlığı arıyorsa bu sessizce geçer (kapının eşiği bu çalışmada okunmadı).

Satış kapısı (tek kapı): `academyCatalogPurchasable` = DB `is_published` **ve** aktif `PriceCatalogEntry` **ve** `academyCourseSaleOpen` → `academyCourseProductionDiskSealed` (beş katman diskte).

#### 1.2.2 "Her eğitimin ilk dersi herkese açık" kuralı — kod haritası

**Tanım yeri (tek kaynak):** `lib/kernel/catalog-ids/exam-path.ts` → `CURRICULUM_LESSON_KEYS_BY_SLUG[slug][0]`. Bu anahtar `free-preview.ts` (kenar-güvenli) üzerinden okunur: `academyCourseOffersFreePreview(slug)` = "ilk ders var mı". Boş kabuk (03–05) kapalı.

| Kurs | Herkese açık ders(ler) |
|------|------------------------|
| OFF-101 | `01_office_ai-1` **ve** `01_office_ai-0` (hazırlık şeridi; `ACADEMY_FREE_PREVIEW_LESSON_KEY` sabiti **elle yazılmış**) |
| OFF-201 | `01_office_ai_ileri-1` |
| EC-102 | `02_ecommerce_ai-1` |

**DB bayrağı var mı?** **Hayır.** Prisma şemasında `is_preview`/`is_locked` yok. `isPreviewAllowed` ve `isLocked` yalnızca müfredat `Section` tipinde çalışma anında **türetilen** alanlar (`applyAcademySectionPreviewGate`, `lib/academy/preview-lock.ts`). Yani serbest önizleme **kod sabiti**dir; Super Admin DB'den açıp kapatamaz.

**Uygulama katmanları (kim neyi zorluyor):**

| Katman | Davranış | Dosya |
|--------|----------|-------|
| Kenar | `/academy/<slug>/oyna` yolu, sınav yolu ilk dersi olan slug için **oturumsuz açık** (`isAcademyFreePreviewPlayerPath`). Diğer oynatıcı yolları 307 ile girişe | `lib/kernel/security/edge-guard.ts` |
| Sayfa | Oturumsuz veya lisanssız: `paywallLocked`, `academyPaywallLockedLessonShells` (ders 1 gövdesi dolu, diğerlerinin `body: ""`) | `app/academy/[slug]/oyna/page.tsx`, `lib/academy/paywall-shells.ts` |
| Medya | Ödeme duvarında yalnız açık derslerin cue/timings anahtarı RSC'ye gider | `lib/academy/preview-lock.ts` (`academyPlayerMediaLessonKeys`) |
| Ses | Anonim kullanıcıya yalnız **ders 1** için HMAC'li kısa ömürlü (4 sa) ses adresi. Diğer mp3'ler kenarda 403 | `lib/academy/free-preview-audio.ts`, `lib/academy/lesson-audio-grant.ts`, `proxy.ts` |
| API | `lesson-assistant`: ücretsiz ders anahtarı **veya** ticari kayıt | `app/api/academy/lesson-assistant/route.ts` |
| İçerik motoru | Üretimde gövde yalnız ticari lisans/admin ile (`requireSettledPurchase` + `hasAcademyLockedLessonContentAccess`) | `lib/academy/curriculum-engine.ts` |

#### 1.2.3 Expiration, paywall ve middleware sınırları

- **Ücretli lisans 365 gündür** (`lib/academy/license.ts`): `settledAt + 365 gün`. Kolon yok; süre `settledAt`'ten hesaplanır. Süre dolunca oynatıcı yine **kabuk + ders 1** görünümüne döner; sertifika/iş kanıtı PDF'i `SETTLED` kayıtla açık kalır (`hasAcademyArtifactAccess`).
- **Serbest önizlemenin süresi yoktur**; herkese, her zaman açık.
- Alıcı için ders sırası kilidi: `open = catalogOpen || lesson.key === nextKey || completed` (sıralı açılım). Admin/ticari katalogda tüm dersler açık.
- Kenar (proxy) kuralları: çerezli yazmalarda Origin/Sec-Fetch-Site fail-closed; LLM ve cüzdan yollarında hız sınırı (`aiChatUser: 5/gün`, `llmIp: 20/10dk`, vb.). Hız sınırı **Redis REST doluysa paylaşılan, değilse bellek içi** (`rate-limit-runtime.ts`) — serverless'ta bellek içi, örnekler arası paylaşılmaz.
- Bakım modu (`SITE_MAINTENANCE_FREEZE`/`LIVE_BROADCAST_SHUTDOWN`) önizlemeyi de 503 yapar; PayTR bildirim uçları ayrı geçer.

#### 1.2.4 Bulgular

| Kod | Bulgu | Önem |
|-----|-------|------|
| F-1 | Kural **yalnızca kod yorumlarında** var; `ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md` "ilk ders ücretsiz" demiyor. Ürün kararı ile kod arasında yazılı sözleşme yok. | Orta |
| F-2 | "İlk ders" iki mekanizmayla tanımlı: (a) exam-path[0] (dinamik), (b) `ACADEMY_FREE_PREVIEW_LESSON_KEY = "01_office_ai-0"` (sabit). OFF-101 için ücretsiz birim sayısı **2** — diğer iki kurstan farklı. | Orta |
| F-3 | `isAcademyFreePreviewLessonKey(lessonKey)` **slug'a bağlı değil**: herhangi bir kursun ilk anahtarı, herhangi bir bağlamda "açık" sayılır. Şu an sızıntı yaratmıyor (anahtarlar benzersiz) ama `lesson-assistant` istemciden gelen `lessonKey`'i slug ile eşleştirmeden kabul ediyor. | Düşük |
| F-4 | Erişim kapısı fonksiyonları çoğaldı: `hasAcademyPlayerAccess`, `hasAcademyOynaAccess`, `hasAcademyLockedLessonContentAccess`, `hasPurchased`, `hasAcademyArtifactAccess`, `hasUnlimitedAcademyAccess`, `hasAcademyAdminBypass`, `academyPlayerCatalogFullyOpen`, `resolveSettledAcademyPurchase`, `resolveAcademyArtifactPurchase`. Üretim/lab ve vatandaş-test dalları iç içe. Kırılgan. | Orta |
| F-5 | Anonim ders 1 sesi ~30–38 MB'lık mp3 (+ bed). Anonim trafikte bant genişliği maliyeti ve kötüye kullanım yüzeyi; kenar imza doğruluyor ama sayfa her render'da yeni grant üretiyor. | Düşük–Orta |
| F-6 | Serbest önizleme testleri dağınık (`lesson-audio-grant.test.ts`, `prep-strip.test.ts`, `access.test.ts`); "üç kursta ders 1 açık, ders 2 kapalı" için tek sözleşme testi bulunamadı. | Düşük |

---

### 1.3 Dosya Temizliği ve Tek Doğru Kaynak (SSOT)

> Yöntem notu: Yetim listesi, `app/ components/ lib/ scripts/ tests/` üzerinde import grafı taramasıyla üretildi (alias `@/…` + göreli import). Dinamik `import()` ve string tabanlı kayıtlar yanlış pozitif verebilir. **Silme kararı öncesi manuel teyit gerekir.**

#### 1.3.1 Yetim / atıl modüller (hiçbir yerde import edilmiyor)

| Dosya | Not |
|-------|-----|
| `lib/academy/curricula/ecommerce_ai/sections.ts` | Shim (yeniden dışa aktarım); kimse import etmiyor |
| `lib/academy/curricula/ecommerce_ai/spoken-body.ts` | Shim; kimse import etmiyor |
| `lib/kernel/env.ts` | Zod env şeması; import eden yok (yanlış pozitif olasılığı: düşük) |
| `lib/showcase/catalog.ts` | Import eden yok |
| `lib/freelancer/released-proofs.ts` | Import eden yok |
| `components/academy/level-pathway.tsx` | Import eden yok |
| `components/freelancer/{direct-job-offer-modal,direct-offer-inbox,squad-create-button,squad-panel,squad-teaser,standalone-squad-modal,usta-expertise-list}.tsx` | Freelancer yüzeyi kilitli (410) olduğu için atıl |
| `components/legal/{legal-back-to-home,legal-section-articles,legal-site-footer}.tsx` | Import edilmiyor; yalnızca metin olarak anılıyor olabilir — **teyit gerekli** |
| `components/shell/frozen-room-gone-page.tsx` | Import edilmiyor; `lib/kernel/http/frozen-410-html.ts` ayrıca var |

#### 1.3.2 Yalnızca testlerin kullandığı modüller (üretim ağacında referanssız)

`components/kernel/kasa-return-panel.tsx`, `lib/academy/{article-spoken-diff,catalog-favorites,config,issued-certificates,lesson-description,lesson-listen,syntax-highlight,web-speech}.ts`, `lib/academy/curricula/phase2-exam-readiness.ts`, `lib/freelancer/standalone-squad-store.ts`, `lib/kernel/ai/paid-command.ts`, `lib/kernel/http/memory-idempotency-store.ts`, `lib/kernel/rooms.ssot.ts`.

#### 1.3.3 Ölü HTTP yüzeyi (route var, cevap 410)

11 route dosyası / sayfa 410 saplaması: `api/academy/{discussion,reviews,generateSpeech}`, `api/academy/courses/[id]/{listen,pdf}`, `api/(kernel)/admin/curriculum-revisions` (+ sayfası), `api/freelancer/{squad,direct-offers,direct-offers/[id]/accept,…/decline}`. Bunlar `ROUTE_AUTH_MAP`'te `public` görünür (18 public'in büyük kısmı bu). Sicil gürültüsü ve yanlış "açık yüzey" algısı yaratır.

#### 1.3.4 Tekrarlı / ikilem yaratan yapılar

| Konu | Tekrar | Risk |
|------|--------|------|
| EC-102 müfredat dizini | `curricula/02_ecommerce_ai/` (gerçek, **untracked**) + `curricula/ecommerce_ai/` (4 dosyalık shim, git'te **modified**). `cinema-cue-catalog.ts`, `scripts/bake-ec102-nano-slides.ts`, `tests/academy/ecommerce-ai-lesson-3.test.ts` hâlâ **eski** yoldan import ediyor | Yarım kalmış taşıma; iki ev |
| Dizin adlandırma | Slug `01_office_ai` ↔ dizin `office_ai`; `01_office_ai_ileri` ↔ `office_ai_2`; `03_social_media_ai` ↔ `social_media_ai`; yalnız EC-102 `02_` önekini aldı | Tutarsız kanon |
| Sinema slaytları | `lib/academy/off201-cinema-slides.ts` (820 satır, lib kökünde) vs `curricula/02_ecommerce_ai/cinema-slides.ts` vs `cinema-cue-catalog.ts` (1950 satır, merkezde) | Üç farklı konum/kalıp |
| Serbest önizleme | `purchase-path.ts`, `kernel/catalog-ids/{free-preview,exam-path}.ts`, `preview-lock.ts`, `paywall-shells.ts`, `edge-guard.ts` | Bkz. F-2/F-4 |
| Hop sicili | `packages/kernel/src/http/v1-hops-meta.ts` ↔ `apps/rail-is/src/api/hops.ts` ("hizalı" yorumuyla elle) | Sapma riski |
| Route auth | Her route'ta `export const auth` + üretilmiş `route-auth-map.ts` + `generated/route-auth-map.json` | Üretilmiş çıktı 3 yerde |
| Yönetici e-postası | `super-admin.ts`, `lib/copy/legal-launch.ts` (`adminEmail`), `.env.example`, test/doküman | Aynı e-posta farklı amaçla 3 yerde sabit |
| Kernel paketi | `lib/kernel/money/*`, `lib/kernel/catalog-ids/course-slugs.ts` → `@yetkin/kernel`'e **re-export** | İyi örnek (tek ev) |
| Test konfigleri | `vitest.config.ts`, `vitest.frozen.config.ts`, `vitest.pg.config.ts` | Kasıtlı, belgeli |

#### 1.3.5 Geçici / atıl dosya ve disk durumu

| Yol | Boyut | Durum |
|-----|-------|-------|
| `.tmp/ec102-puck-mp3/` | ~194 MB | `.gitignore`'da; yerelde atıl saha kalıntısı |
| `media-bake/` | ~2.2 GB (245 dosya) | `.gitignore`'da; yerel fırın çıktısı (WAV) |
| `archived/` | 139 MB, **268 dosya git'te** | Tasarım gereği (donmuş oda tarihi); derleme dışı |
| `public/media/` | 608 MB, 48 dosya git'te | mp3/mp4 (en büyük tek dosya ~38.6 MB) |
| `public/academy/` | 258 MB | cinema jpg/avif/webp |
| **`public/` toplam** | **866 MB** | `.gitignore` yorumu "Vercel Pro statik tavanı 1 GB" diyor → **~%85 dolu** |
| `.git` | 2.94 GiB paket + 433 MiB gevşek | `git gc` / geçmiş ağırlığı |
| `tsconfig.tsbuildinfo` | 0.5 MB | ignore'da; sorun yok |

`.bak / .orig / .old / .rej / .swp` türü dosya **bulunmadı**.

#### 1.3.6 Çalışma ağacı hijyeni (kritik)

- **~108 yol** değişmiş/untracked (`git status --short`; rapor dosyası hariç): `lib/academy/curricula/02_ecommerce_ai/*` (**untracked**), `scripts/lock-ec102-cue-clock.ts`, `scripts/verify-ec102-live-media.ts`, `lib/academy/spoken-scripts/measure-display.ts` (**untracked**), 6 EC-102 mp3, ~30 cinema jpg, 12 cue/timings JSON vb.
- **Silinmiş (D) ve korunması gereken:** `.system_docs/Ekran görüntüsü 2026-09-30 005227.png`, `…005251.png`, `…005309.png`. `.cursorrules` "bağlı görseller silinmez" der. (Bu çalışmada ben silmedim; başlangıç `git status`'ta zaten `D`.) **Geri yükleme kararı kullanıcıya aittir.**
- **Silinmiş (D):** `docs/FAZ1_MASTER_RAPORU.md`, `HOTFIX_EC102_RAPORU.md`, `TEDAVI_RAPORU_01.md`, `TESPIT_RAPORU_01_GLM.md`. `.system_docs/README.md` `/docs`'un silinebilir olduğunu söylüyor; sorun değil, ama geçmiş rapor zinciri git geçmişinde kaldı.
- Commit edilmemiş iş (özellikle `02_ecommerce_ai/`) **tek makine / tek disk** riski taşıyor.

---

### 1.4 Doküman ve Anayasa Sorgulaması

Okunanlar: `ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `AKADEMI_URETIM_ANAYASASI.md`, `.system_docs/README.md`, `.cursorrules`, `AGENTS.md`/`CLAUDE.md`.

#### 1.4.1 Canlı mimariyle örtüşme

| Belge maddesi | Canlı kod | Örtüşme |
|---------------|-----------|---------|
| B1 Pragmatik Monolit + ince `@yetkin/kernel` + tek native istemci | Next.js monolit; `packages/kernel` (money, catalog-ids, http zarf, hop meta); `apps/rail-is` tek istemci; `DRON_KAYIT` sicili | **Tam** |
| B1 `lib/kernel` dikey import etmez | `lib/kernel` → academy/freelancer/career/showcase/dashboard import sayısı **0**; `verify:boundaries` OK | **Tam** |
| B2 Faz 1 kamu vitrini: Panel+Akademi+Kariyer; Freelancer kilitli | `VERTICAL_ROOMS`, `FROZEN_DISK_ROOMS` (8), `DronBayrakları`, 410 kenarı | **Tam** |
| A1 `amountMinor` tamsayı, tek defter, fiyat DB'de | `PriceCatalogEntry`, tohum Super Admin tutarını ezmez (`prisma/seed.ts`); `verify:amount-minor` prebuild'de | **Tam** (bu çalışmada yeniden çalıştırılmadı) |
| A3 RLS/IDOR/servis anahtarı | `enforce_rls_all_tables`, `rls_user_scoped_policies`, `verify:rls-status`, `verify:idor-seals` | Tasarım olarak tam; canlı RLS durumu doğrulanmadı |
| A4 Sunucu puanlama, SHA-256 mühür | Sunucu tarafı exam/certificate motoru; `/academy/dogrula` kamu | Kod yapısı uyumlu |
| B4 Beş medya katmanı + `assertAcademyProductionSeal` + `academyCourseSaleOpen` | `production-standard.ts`, `pilot-sku.ts`; testler yeşil | **Tam** |
| AKADEMİ SOP Model Haritası ↔ `model-roles.ts` | `TEXT_GEN=gemini-3.8-flash`, `VOICE_TTS=gemini-3.8-flash-tts`, `IMAGE_GEN=gemini-3.1-flash-image`, `MUSIC_GEN=lyria-3.5`, `FAST_STREAM=gemini-3.8-live`, `VIDEO_GEN` mühürlü-ölü | **Tam** (değişmedi; dokunulmadı) |

#### 1.4.2 Doküman–doküman / doküman–kod sürtünmeleri

| Kod | Bulgu |
|-----|-------|
| D-1 | **Model SSOT'u iki yönde yazılı:** `PEDAGOJI.md` ve `ANAYASA.md` B4 "kimlik kod SSOT'tadır (`model-roles.ts`)" der; `.cursorrules` + AKADEMİ SOP "SUPER_ADMIN dokümanı yönetir, kod dokümana eşitlenir" der. Uygulamada ikincisi geçerli (haritalar eşleşiyor), ama birinci metin yanıltıcı. |
| D-2 | **Kurs kimliği:** `PEDAGOJI.md` §2.2 "Tezgâh kursunun anlatıcısı Deniz'dir… kapanış duası", AKADEMİ SOP "Deniz Usta dili". `pilot-sku.ts`: "EC-102 konuşan ad Selin… **Usta unvanı bu kursta yoktur**". Persona (dil) ile anlatıcı adı (ses) ayrımı bir cümleyle netleştirilmemiş. |
| D-3 | **Olmayan referans:** `MANIFESTO.md` Kural 2 → `docs/specs/freelancer-vize-kapisi.md`. `docs/specs/` yok. |
| D-4 | **"Sayı burada tekrarlanmaz" kuralı kendi içinde çiğneniyor:** `MANIFESTO.md` §4.1 ve `PEDAGOJI.md` D.1, TTS tavanı "kurs başına 100 / ders başına 10–12" sayılarını yazıyor. |
| D-5 | **Yasa metnine değişiklik günlüğü karışmış:** `ANAYASA.md` ve `MANIFESTO.md` başlık tablosunda "Son Reform" paragrafları. Kalıcı ilke ile tarihçe aynı sayfada. |
| D-6 | **Ücretsiz önizleme kuralı hiçbir belgede yok** (F-1). |
| D-7 | **`.cursorrules` korunan görselleri** anıyor; `AKADEMI_URETIM_ANAYASASI.md`'nin HEAD sürümünde **hiçbir görsel bağlantısı yok** ve üç png şu an working tree'de silinmiş. Kural ile dosya ilişkisi belirsiz. |
| D-8 | `.cursorrules` / `CLAUDE.md` → `@AGENTS.md`; `AGENTS.md` Next.js "kırıcı değişiklik" notu ve "Akademi üretim standardı" bölümü. Model ID "tekrarlanmaz" deniyor ama AKADEMİ SOP tabloyu tutuyor — pratikte SOP üçüncü ev oldu. |

---

## 2. STRATEJİK / TARAFSIZ SORGULAMA

### 2.1 SEN OLSAYDIN NE YAPARDIN? — İlk 3 kritik nokta

**1) Erişim/entitlement'ı tek fonksiyona indir.**
Bugün "kim neyi görebilir?" sorusu `access.ts` (≈10 fonksiyon), `preview-lock.ts`, `paywall-shells.ts`, `purchase-path.ts`, `edge-guard.ts`, `curriculum-engine.ts` ve `lesson-assistant` içinde parça parça cevaplanıyor; üretim/lab ve vatandaş-test dalları iç içe. Önerim: tek saf fonksiyon `resolveAcademyEntitlement({ actor, purchase, courseSlug, lessonKey, now }) → { tier: "admin" | "licensed" | "preview" | "none", reason }` ve tüm yüzeylerin onu çağırması; serbest önizleme kümesi `exam-path[0]` (+ açıkça adlandırılmış istisna: OFF-101 hazırlık şeridi) tek tabloda; "3 kursta ders 1 açık, ders 2 kapalı, lisans dolunca geri kapanır" için tek sözleşme testi. Hem güvenlik (sızıntı yüzeyi) hem bakım maliyeti düşer.

**2) Medya ağırlığını repodan ve `public/` tavanından çıkar.**
`public/` 866 MB / ~1 GB tavan, git 3.4 GiB, her yeniden fırın 6×~33 MB. EC-102'nin yeniden fırınlanmış 6 mp3'ü bile henüz commit edilmedi. Önerim: mühürlü mp3/mp4/bed dosyalarını nesne depolamaya (Supabase Storage / S3-uyumlu) taşımak; zaten var olan HMAC grant mekanizmasını imzalı URL üretimine bağlamak; repoda yalnızca **içerik-hash manifesti** tutmak (mühür kapısı manifest + depo HEAD kontrolü okusun). Fiziksel disk şartını (SOP Bölüm 4) "depoda fiziksel olarak var" olarak yeniden tanımlamak mühürün ruhunu bozmaz. Bu, yeni kurs eklemenin (03–05) ön şartı.

**3) İçerik ile çalışma zamanı kodunu ayır; müfredatı tembel yükle.**
`lib/academy` 287 dosya; `curricula/index.ts` **tüm kursların** gövdelerini (`CURRICULUM_MODULES_BY_SLUG`) eager import ediyor ve modül yüklenirken `assertAcademyCourseVoiceConfig` çalışıyor; `cinema-cue-catalog.ts` 1950 satır. Ders gövdeleri ve sinema cue'ları veri olarak (JSON/MD + şema doğrulama) ya da slug başına dinamik `import()` ile yüklenmeli; dizin adları slug'la 1:1 olmalı (`01_office_ai`, `01_office_ai_ileri`, `02_ecommerce_ai`…), `ecommerce_ai` shim'i ve yetim dosyalar kaldırılmalı. Hedef: üretim hattı (bake/TTS/cue) ile oynatıcı çalışma zamanı ayrı paketler gibi davransın.

*(Bonus, 4.)* Yetki modeli: tek env'e bağlı Super Admin'e ek olarak, kanonik yolu koruyarak (A-1) DB'de denetlenebilir bir platform rol tablosu + yönetim eylemi audit'i. Bu, Anayasa'nın "Prisma `role` kolonu yok" notuyla çelişebilir; bilinçli karar istenir.

### 2.2 PLATFORM KURGUSU DOĞRU MU? (Amiral Gemi + Sürü Dron)

**Kısa cevap:** Kod, "Amiral Gemi + Sürü Dron" olarak değil, **disiplinli modüler monolit** olarak doğru kurulmuş. Spagettiye kayma riski şu an **düşük**, şişme riski **orta**.

Kanıtlar:
- `lib/kernel` → dikey oda import'u: **0**. `lib/academy` ↔ `lib/career`/`lib/freelancer` çapraz import'u: **0** (kimlik `catalog-ids` üzerinden).
- ESLint `no-restricted-imports` duvarları + `verify:boundaries` CI kapısı.
- Tek edge girişi (`proxy.ts`); route kinds (`session|admin|public|webhook`) bir harita ile doğrulanıyor (`verify:api-auth`).
- Ortak sözleşme `packages/kernel` ve tek native istemci `apps/rail-is` (46 dosya) `/api/v1` hop siciliyle bağlı.

Dikkat edilmesi gerekenler:
- **Terminoloji çatışması:** Anayasa B1 açıkça "«Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez; ayrı deploy, ayrı DB, ayrı kimlik yoktur" der. Bu istemdeki "Core + Micro-Apps / Shared Kernel" dili kodun gerçeğini değil, **eski adı** yansıtıyor. Gerçek ad: *Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci*. Yanlış isim, yanlış beklenti (ör. bağımsız dağıtım) üretir.
- "Dron" bugün fiilen **yetenek bayrağı + route öneki** (`DRON_KAYIT`: dashboard, academy, career, freelancer). Gerçek mikro-uygulama sınırı (ayrı paket/dağıtım) yok; olmaması da B1'e uygun.
- **Akademi dikeyi şişiyor:** 287 dosya; üretim hattı (TTS, cue, bake, mühür) ile runtime (oynatıcı, erişim, sınav) aynı `lib/academy` içinde. Bu, bir sonraki kursta ve ikinci native istemcide sürtünme yaratır.
- **Donmuş yüzey ağırlığı:** Freelancer motoru (lib 27 dosya + 25 bileşen + ~14 route) canlı derleme ağacında; 7 bileşen fiilen yetim. `archived/` kopya tarihçesi 268 dosya olarak git'te.
- Gürültü: 61 route dosyasının 11'i 410 saplaması.

### 2.3 KUTSAL DOKÜMANLARIN SORGULANMASI

Dokunulmazlar (A1–A5, model tablosu, beş aşama kapısı) **yerinde ve kodla uyumlu**; bunları gevşetme önerim yok. Sorgulanması gerekenler:

| Madde | Değerlendirme |
|-------|---------------|
| "Bu belge sayıyı tekrarlamaz, koda bak" deseni (PEDAGOJI, ANAYASA B4) | Niyet doğru (drift'i önler) ama okumayı 4–5 sıçramaya çevirdi; yeni katılan biri tek sayfada "bir ders ne kadar sürer / kaç istek" öğrenemiyor. Belge kendi kuralını da çiğniyor (D-4). **Uygulamada pratiksiz.** |
| Model SSOT yönü (D-1) | Hangi dosyanın hakem olduğu tek cümleyle ve tek yerde yazılmalı. |
| "Yasa" içinde "Son Reform" günlükleri (D-5) | Tarihçe `CHANGELOG`'a; anayasa sade kalsın. |
| Deniz/Selin persona (D-2) | Persona ile anlatıcı adını ayıran bir not gerek. |
| 3 aşamalı kontrol kapısının ilk ikisi (taslak, gözden geçirme) | Kodda zorlanmıyor; "operatör disiplini" olarak dürüstçe yazılmış. Pratik: bir kontrol listesi/arayüz yoksa uygulanabilirlik operatöre kalıyor. Kaldırmak değil, bir ops checklist'ine bağlamak önerilir. |
| Sıfır fallback / kota gelince dur | Bilinçli politika (Super Admin kararı); **değiştirme önerilmiyor.** Yalnızca bir "kota/404'te operatör prosedürü" paragrafı eksik. |
| MANIFESTO Kural 2 (`docs/specs/…`) | Olmayan dosyaya referans (D-3). |
| Serbest önizleme | Belgelerde yok (D-6); eklenmeli. |
| `.cursorrules` dışlama listesi | `public/media/` ve `archived/`'ı tarama dışı bırakması bağlam için makul. Ancak "görsel dokunulmaz" maddesi fiilî dosya durumuyla uyuşmuyor (D-7). |

### 2.4 GELECEK MASTER PLANI

**Faz 0 — Güvene al (gün 0–2)**
1. Çalışma ağacını (~108 yol) bölerek commit et (EC-102 müfredat/`02_ecommerce_ai`, medya, betikler, doküman). Silinen 3 korunan png için geri yükleme kararı.
2. `npm run typecheck` + `npm test` + `npm run verify:prebuild` tam koşu.
3. Üretimde Super Admin teyidi: Vercel Production env'de iki değişken, `ops:runtime-readiness`, canlıda `/admin` açılışı, e-posta onayı.

**Faz 1 — EC-102 lansmanı (hafta 1)**
1. DB: `is_published` + aktif fiyat satırı (A1 — fiyat Super Admin'den).
2. `scripts/verify-ec102-live-media.ts` canlı medya doğrulaması (untracked betik; commit sonrası koşulacak).
3. Duman testi: anonim ders 1 (ses dahil), ders 2 kabuk; lisans satın alma (PayTR), 365 gün süresi, sertifika.
4. İzleme: anonim ses bant genişliği, hız sınırı (Redis REST bağlı mı?), hata oranı.
5. Kurs başına mühür eşiği: cinema kare yoğunluğu tutarlılığı (OFF-201 = 6).

**Faz 2 — SSOT ve hijyen (hafta 2–3)**
1. `resolveAcademyEntitlement` + sözleşme testi (2.1 #1).
2. `ecommerce_ai` shim'inin kaldırılması, import'ların `02_ecommerce_ai`'ye çekilmesi; dizin adlarının slug'la hizalanması.
3. Yetim/yalnızca-test modüllerinin onaylı kaldırılması (1.3.1–1.3.2); 410 saplamalarının `_gone` yakalayıcıya toplanması.
4. Belge onarımı: D-1…D-8 (ve serbest önizleme maddesi).

**Faz 3 — Performans / ölçek (ay 1)**
1. Medyanın nesne depolamaya taşınması; manifest tabanlı mühür (2.1 #2). `public/` tavan uyarısı CI'da.
2. Müfredat tembel yükleme; kurs başına paket; `cinema-cue-catalog` bölünmesi.
3. `next/image` ve CDN cache başlıkları cinema kareleri için; bundle analizi.
4. Rate limit için üretimde Redis zorunluluğu (readiness'te hata).

**Faz 4 — Güvenlik (ay 1–2)**
1. Yönetici modeli: ikinci admin/break-glass, yönetim audit'i (A-1) — Anayasa kararıyla.
2. Lab/üretim Supabase projelerinin ayrılığı teyidi (A-4).
3. RLS ve IDOR testlerinin CI'da zorunlu koşulması; bağımlılık güncelleme turu.
4. Anonim medya için ek kötüye kullanım koruması (grant TTL, IP oranı).

**Faz 5 — Mikro uygulama genişlemesi (çeyrek)**
1. Yeni yetenek = `DRON_KAYIT` kaydı + `RAIL_V1_HOPS_META` + `@yetkin/kernel` sözleşmesi (B1 checklist); ikinci istemci yalnızca aynı paket/hop ile.
2. 03–05 kursları aynı SOP (Bölüm 1 mimari → API) ile; her biri için önce sıfır-API kod tamlığı.
3. Freelancer Faz 2 yalnız lisanslı Split + B5 kriterleri; donmuş kod ayrı pakete ya da `archived`'a.
4. Terminoloji kararı: "Sürü Dron / Micro-Apps" etiketi ya resmen emekliye ya da B1 ile yeniden tanımlanır.

### 2.5 SONRAKİ AŞAMA ÖNERİSİ (Tedavi / Uygulama)

Öncelik sırası:

1. **Tedavi-01: Güvene alma** — çalışma ağacının mantıksal commit'lere bölünmesi (özellikle `02_ecommerce_ai/` ve medya), korunan 3 png için karar, tam test/prebuild koşusu. Bu, sonraki tüm temizliklerin güvenlik ağıdır.
2. **Tedavi-02: Canlı yetki teyidi (salt-okunur)** — üretim env'inde Super Admin ikilisi, `ops:runtime-readiness`, `/admin` açılış kontrolü.
3. **Tedavi-03: Serbest önizleme + erişim kapısı tekleştirme** — belgeye kural maddesi, `resolveAcademyEntitlement`, tek sözleşme testi. Lansman öncesi en yüksek fayda/risk oranı.
4. **Tedavi-04: Shim ve yetim temizliği** — onayınızla, küçük ve geri alınabilir PR'lar.
5. Medya depolama kararı (Faz 3) — mimari karar gerektirir; lansmandan sonra ama yeni kurstan önce.

---

## 3. EK: DOĞRULAMA KAYDI

| Kontrol | Sonuç |
|---------|-------|
| `tsc --noEmit --incremental false -p tsconfig.json` | exit 0 |
| `vitest run` (require-super-admin, access, edge-guard, edge-api-auth, sealed-audio-pilot, production-standard, curriculum-content, ecommerce-ai-lesson-1, ecommerce-ai-lesson-3) | 9 dosya / 54 test geçti |
| `verify:api-auth` | OK — 60 route; `admin:2` |
| `verify:boundaries` | OK |
| Tam `npm test`, `verify:prebuild`, Playwright E2E, canlı DB/Vercel sorgusu | **Bu çalışmada koşulmadı** |
| Yetim modül taraması | Geçici betik sistem geçici dizininde çalıştırıldı (repo dışı); repoya dosya yazılmadı |

## 4. SINIRLAR

- Canlı Supabase/Auth, Vercel env ve üretim DB'sine erişim yok; Bölüm 1.1 ve 1.2'nin canlı doğrulaması yukarıdaki salt-okunur adımlara bağlıdır.
- `.env.local` yalnızca iki anahtarın **doluluğu** için kontrol edildi; değer okunmadı/yazılmadı.
- Yetim dosya listesi sezgiseldir; silme öncesi manuel teyit gerekir.
- Bu rapor yalnızca tespit ve öneridir; hiçbir uygulama değişikliği yapılmamıştır.
