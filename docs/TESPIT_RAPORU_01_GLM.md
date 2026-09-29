# TESPAS-01 — SİSTEM TESPİTİ VE MİMARİ ANALİZ RAPORU

| Alan | Değer |
|------|--------|
| Rapor kimliği | TESPAS-01 |
| Tarihi | 30 Eylül 2026 |
| Hazırlayan | Cursor Ajanı (GLM 5.3) |
| Mod | **Salt-okunur tespit.** Kod, şema, medya ve veritabanı üzerinde hiçbir değişiklik yapılmadı. DB doğrulaması yalnızca `SELECT` sorgularıyla yapıldı. |
| Kapsam | Kod tabanı (app/components/lib/prisma/middleware/tests/scripts), `.system_docs`, `.cursorrules`, git durumu, Supabase Postgres canlı veri, akademi medya diski |
| Tarama dışı | `node_modules/`, `.next/`, `archived/`, `public/media/` toplu içerik (yalnızca var/yok düzeyinde hedefli `Test-Path` yapıldı), sır değerler (bu raporda hiçbir anahtar/şifre tekrarlanmaz) |

---

## 0. YÖNETİCİ ÖZETİ — EN KRİTİK 5 BULGU

1. **EC-102 lansmanı tamamen commit edilmemiş durumda.** Son commit 28 Eylül (`aebbe92`). Sonrasında üretilen ~270 yeni dosya (ders metinleri, sinema kareleri, ısınma MP4'leri, **206 MB ses paketi**, `20260929180000_ec102_publish.sql` migration'ı) ve 45 silme işlemi git'e işlenmemiş. Disk arızası tek felaket noktasıdır.
2. **Kritik SSOT dosyası `lib/kernel/catalog-ids/exam-path.ts` bile untracked.** Birçok commit edilmiş dosya bu modülü import ediyor; dosya kaybolursa derleme kırılır.
3. **EC-102 fiilen YAYINDA.** "Geliştirme sürecinde" varsayımı güncel değil: 6/6 dersin beş medya katmanı diskte tam, DB'de `is_published=true`, aktif fiyat satırı 990,00 TRY var ve 2 satın alma mevcut. Kalan iş üretim değil, **git hijyenidir**.
4. **Süper Admin zinciri teknik olarak sağlam ve fail-closed** (dev'de `yapinet360@gmail.com` kanonik admin olarak doğrulandı; üretimde çift env + doğrulanmış e-posta + UUID eşleşmesi isteniyor). Ancak üretim (Vercel) env değerleri bu istasyondan doğrulanamaz — ayrı teyit gerekir.
5. **Doküman katmanı kendi "tek ev" ilkesini aşırıyor:** beş medya katmanı kuralı beş ayrı dokümanda ve PEDAGOJI içinde altı kez tekrarlanıyor. Sayılar koda taşınmış (doğru), ama düz anlatım hâlâ çoğaltılıyor — sürüklenme (drift) riski `.cursorrules`'un commit edilmemiş yeni sürümünde zaten görünür durumda.

---

## BÖLÜM 1 — SAHA İNCELEMESİ VE MEVCUT DURUM ANALİZİ

### 1.1 Atıl / Gereksiz / Yinelenen Dosya Tespiti

#### 1.1.1 Git çalışma ağacı — en büyük risk burada

`main` dalı `origin/main` ile senkron; ancak çalışma ağacında **son commit'ten (28 Eylül) beri işlenmemiş büyük bir değişiklik yığını** duruyor:

| Durum | Adet | İçerik |
|-------|------|--------|
| Untracked (yeni) | ~270 | EC-102 üretim varlıkları + yeni lib dosyaları + migration |
| Silinmiş (commit edilmemiş) | 45 | `docs/*.md` (18 dosya), `curricula/parent_teacher_ai/*` (taşınma), `lesson-cues/03-04-05*.json`, `scripts/ingest-ecommerce-ai-sections.ts` |
| Değiştirilmiş | 1 | `.cursorrules` (SSOT bloğu işaretçi tablosuna indirildi — iyileştirme, commit edilmemiş) |

**Kritik untracked dosyalar (tekil bilgi, yedeği yok):**

- `lib/kernel/catalog-ids/exam-path.ts` — sınav yolu SSOT'u; kenar ve akademi bunu okuyor
- `lib/academy/free-preview-audio.ts` — ücretsiz ön izleme ses yetki (grant) altyapısı
- `lib/academy/production-seal-disk.ts` — disk mühür okuyucusu
- `lib/academy/lesson-text-standard.ts` — ders metni yazım istemi SSOT'u
- `lib/academy/curricula/phase2-drafts/` — faz 2 taslak adası (parent_teacher_ai buraya taşındı)
- `lib/academy/curricula/ecommerce_ai/*`, `lib/academy/spoken-scripts/02_ecommerce_ai-*.md` (6 ders metni)
- `supabase/migrations/20260929180000_ec102_publish.sql` — **DB'ye uygulanmış ama git'te olmayan migration**
- `scripts/bake-ec102-nano-slides.ts`, `scripts/ingest-ec102-spoken-bodies.ts`
- `public/media/academy/audio/02_ecommerce_ai/` — **206 MB** (12 MP3: 6 ders + 6 müzik yatağı)
- `public/media/academy/micro/02_ecommerce_ai-*-warmup.mp4` (2 kaset)
- `public/academy/cinema/02_ecommerce_ai-*cue*.jpg` (36 kare) + `01_office_ai_ileri-*-cue-1.jpg` (6 kare — OFF-201 görsel katmanı da commit edilmemiş)
- `.system_docs/AKADEMI_URETIM_ANAYASASI.md` — yeni doküman, git dışı
- `tests/academy/lesson-text-standard.test.ts`

**Değerlendirme:** OFF-101 ve OFF-201 ses dosyaları git'te izleniyor (ör. `public/media/academy/audio/01_office_ai/*.mp3` tracked). Yani repo politikası "MP3 git'te, WAV (`media-bake/`) dışarıda". EC-102 paketi bu politikanın henüz işlenmemiş hâli. Bu bir "atıl dosya" sorunu değil, **tamamlanmamış iş akışı** sorunudur ve raporun 1 numaralı bulgusudur.

#### 1.1.2 `docs/` dizini — diskte boş, git'te dolu

Diskte `docs/` boş; 18 tracked rapor dosyası silinmiş ama silinmeler commit edilmemiş. ANAYASA "/docs — günlük rapor" derken bu rapor bile geçici bir boşlukta duruyor. Ya temizlik bilinçliyse commit edilmeli, ya değilse dosyalar `git checkout` ile geri gelmelidir. **Karar Super Admin'e aittir; bu tespit davranışı değiştirmez.**

#### 1.1.3 Yerel disk kalıntıları

- `media-bake/` (~1.5 GB WAV mastering, `.gitignore`'da) — yerel tek kopya. Yedekleme stratejisi yok (OPS_RUNBOOK'da DR maddesi görülmedi).
- `tsconfig.tsbuildinfo`, `.next/` — doğru şekilde ignore edilmiş; sorun yok.

#### 1.1.4 Veritabanı uykuda verisi

`price_catalog_entries` tablosunda **donmuş odaların fiyat satırları hâlâ aktif**: `studio` (generation:text/image), `devlabs`, `pazaryeri` (3 satır), `arena`, `kurumsal`, `freelancer` (escrow:hold, job-posting:floor). Bu odalar kamu yüzeyinde 410 döner ve satış yoluna girmez; satırlar zararsız ama "aktif" bayraklı tohum kalıntısıdır. Kapatma,PriceCatalogDecisionLedger (zam defteri) üzerinden gerekçeli yapılmalıdır.

#### 1.1.5 Yinelenen bilgi / tek-ev ihlalleri

| Bulgu | Açıklama |
|-------|----------|
| Beş kural, beş doküman | 5 medya katmanı kuralı şuralarda tekrarlanıyor: ANAYASA B4, PEDAGOJI (içinde 6 kez), AKADEMI_URETIM_ANAYASASI §2-3, `.cursorrules`, AGENTS.md. |
| `.cursorrules` çift sürüm | Commit'teki sürüm model adlarını (Gemini 3.8 Flash TTS, Nano Banana 2, Lyria 3.5) dondurmuş — `model-roles.ts` SSOT'unu ihlal ediyor. Çalışma ağacındaki yeni sürüm (işaretçi tablosu) doğru; **commit edilmeli**. |
| CLAUDE.md → AGENTS.md → `.cursorrules` | İki ayrı ajan bağlam dosyası kısmen aynı bilgiyi taşıyor; tek dosyada birleştirme değerlendirilmeli. |
| `retired-storefront.ts` adı yanıltıcı | "Emekli" adına rağmen canlı koruma kodudur (`engine.ts` emekli slug'ları dürüst 410 yapar). Çalışır ama isim "atıl kod" sanılmasına yol açar. |
| Bayat yorumlar | `app/academy/page.tsx:28` "Kardeş SKU'lar Çok Yakında" (EC-102 artık canlı); `pilot-sku.ts` başlığı EC-102'yi hâlâ üretim bandı diliyle anlatıyor. |
| Süper admin = E2E müşteri hesabı | `.env.local` içinde `E2E_T4_CLIENT_EMAIL="yapinet360@gmail.com"` — süper admin adresi test müşterisi olarak kullanılıyor ve düz metin şifre env'de duruyor. Ayrı bir E2E hesabı daha güvenlidir. |

#### 1.1.6 Gizli dosya hijyeni notu

`.env.local` git dışında (doğru) ve `verify:no-secrets` kapısı var (doğru). Ancak bu dosyada **canlı PayTR mağaza üçlüsü (`PAYTR_SANDBOX=0`)**, SMTP uygulama şifresi ve Inngest anahtarları düz metin duruyor. Tek istasyon geliştirme için kabul edilebilir; makine paylaşımı/temizlik senaryolarında rotasyon planı olmalı. Rapor sır değerleri bilinçli olarak içermiyor.

---

### 1.2 SUPER_ADMIN Yetkilendirmesi — `yapinet360@gmail.com`

**Sonuç: EVET, teknik zincir eksiksiz kurulu; dev ortamında doğrulandı, üretimde tasarım gereği fail-closed.**

#### Kanıt zinciri (kod)

`lib/kernel/auth/super-admin.ts`:

- `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT = "yapinet360@gmail.com"` — geliştirmede env boşsa kanonik admin.
- Üretimde: `CANONICAL_SUPER_ADMIN_EMAIL` **ve** `SUPER_ADMIN_USER_ID` env'leri birlikte dolu olmalı, e-posta `email_confirmed_at` ile doğrulanmış olmalı, UUID birebir eşleşmeli. Biri eksikse admin yoktur (fail-closed).
- Vatandaş test hesabı `yetkin.vision@gmail.com` env'e yazılsa bile asla admin olamaz (çift kilitleme).

`lib/kernel/auth/require-super-admin.ts` → `requireSession` + `assertSuperAdminActor`; admin API'leri (`app/api/(kernel)/admin/catalog`, `funnel`, `curriculum-revisions`) ve `app/(kernel)/admin` sayfası bu zinciri kullanıyor.

`lib/academy/access.ts` — süper admin ayrıca akademi oynatıcı/sınav muafiyetine sahip; **üretimde sıfır harçlı kalıcı bağış kapalıdır** (muafiyet bellek içi satırdır, deftere nakit yazmaz).

#### Kanıt zinciri (veri — salt-okunur sorgu)

`auth.users` tablosunda `yapinet360@gmail.com` kaydı: UUID `905afe38-…-68e3` (`.env.local` `SUPER_ADMIN_USER_ID` ile birebir aynı), e-posta doğrulanmış (26 Eylül), son oturum 27 Eylül.

#### Yetki kapsamı

| Yüzey | Durum |
|-------|-------|
| Fiyat kataloğu yazma (`PriceCatalogEntry` PATCH) | Super Admin kapısı |
| Akademi vitrin/funnel yönetimi, müfredat revizyonları | Super Admin kapısı |
| Admin panel sayfası (`/admin`) | Super Admin kapısı |
| Tüm eğitimleri satın almadan izleme | Evet (bypass satırı, üretimde kalıcı bağış yazılmaz) |
| Sınav puanlama manipülasyonu | **Hayır** — A4 gereği puan sunucu motorunda; mühür yükü ödeme/vanity içermez |
| Doğrudan DB/service_role | Sunucu tarafı Prisma rolüyle sınırlı; istemciye sızma A3 ile yasak |

#### Uyarılar

1. **Üretim (Vercel) env'i bu istasyondan doğrulanamaz.** `CANONICAL_SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_USER_ID` çiftinin Vercel Production secret store'da dolu olduğunun canlıda teyidi gerekir. Boşsa üretimde admin kapalıdır (tasarım gereği).
2. **Tek kişilik admin (bus factor).** İkinci bir yönetici mekanizması yok; bu bilinçli bir tercihtir ama kırılma camı (break-glass) prosedürü dokümante edilmelidir.
3. Süper admin e-postasının E2E test müşterisi olarak çift kullanımı (bkz. 1.1.5) ayrıştırılmalıdır.

---

### 1.3 Eğitim / Uygulama Durumları

Disk doğrulaması `production-standard.ts` + `lesson-veo.ts` yol şablonuna göre her ders için 5 katman `Test-Path` ile yapıldı (Metin `.md`, Ses `.mp3`, Isınma `.mp4`, Görsel `-cue-1.jpg`, Müzik `.bed.mp3`).

#### OFF-101 — `01_office_ai` — **CANLI VE SATIŞTA**

| Kanıt | Sonuç |
|-------|-------|
| Sınav yolu | 8 ders: `1, k1, 2, 3, 5, g1, w1, 6` (eski ritüel `01_office_ai-4` yolda değil — PEDAGOJI ile uyumlu) |
| 5 katman × 8 ders | **8/8 TAM** |
| DB `is_published` | `true` (trend_score 1) |
| Fiyat satırı | 890,00 TRY — aktif |
| Satın alma | 5 kayıt (SETTLED) |
| Ses mührü | Gözde (Callirrhoe); 1 Eğitim Kodu = 1 Ses |

#### OFF-201 — `01_office_ai_ileri` — **CANLI VE SATIŞTA**

| Kanıt | Sonuç |
|-------|-------|
| Sınav yolu | 6 ders (`1..6`) |
| 5 katman × 6 ders | **6/6 TAM** |
| DB `is_published` | `true` |
| Fiyat satırı | 1.290,00 TRY — aktif (soğuk okuma tohumu değil; katalog satırı basıyor) |
| Satın alma | 2 kayıt |
| Lansman mandalı | `ACADEMY_OFF201_LAUNCH_SALE_OPEN = true` |
| Ses mührü | Aylin (Kore); Gözde yasağı `instructors.ts` + `assertAcademyCourseVoiceConfig` döngüsüyle kodda zorlanıyor |

#### EC-102 — `02_ecommerce_ai` — **FİLEN LANSMAN TAMAMLANMIŞ** (kullanıcının "geliştirme süreci" varsayımından ileride)

| Kanıt | Sonuç |
|-------|-------|
| Sınav yolu | 6 ders (`1..6`) — `exam-path.ts`'te dolu satır |
| 5 katman × 6 ders | **6/6 TAM** (metin, MP3, 2 yerel ısınma kaseti: `listing`/`ops`, 36 sinema karesi, müzik yatakları) |
| DB `is_published` | `true` — **`20260929180000_ec102_publish.sql` ile açılmış; migration git'te yok** |
| Fiyat satırı | 990,00 TRY — aktif |
| Satın alma | 2 kayıt |
| Satış kapısı | `academyCourseSaleOpen` → üç şart da dolu (katalog satırı + yayın + disk mührü) |
| Ses mührü | Puck (konuşan ad Deniz) |
| Kalan iş | Üretim değil: **git'e işleme + yorum/doküman senkronu** |

#### 03 / 04 / 05 — `social_media_ai`, `chatbot_nocode`, `prompt_practice` — **DÜRÜST BOŞ KABUK**

DB'de `is_published=false`, fiyat satırları `is_active=false`, sınav yolu boş dizi (ücretsiz kapı açılmaz), cue JSON'ları dizinden kaldırılmış. Vitrin "Çok Yakında/Hazırlanıyor" kabuğu dürüst (PEDAGOJI §D.1 uyumlu).

---

### 1.4 Kullanıcı Deneyimi: İlk Ders Ücretsiz Ön İzleme Altyapısı

**Sonuç: Mimari genel, dinamik ve dürüst kurulmuş; üç canlı kursun ilk dersi oturumsuz erişilebilir.**

Zincir:

1. `lib/kernel/catalog-ids/exam-path.ts` — her kursun sınav yolunun **ilk anahtarı** ön izleme adayıdır. Slug listesi yoktur; yeni kurs otomatik katılır. Boş kabuk (0 ders) kapalı kalır.
2. `lib/kernel/catalog-ids/free-preview.ts` — `academyCourseOffersFreePreview(slug)` tek hüküm.
3. `lib/academy/purchase-path.ts` — `isAcademyLessonPaywalled`: satın alma yoksa **1. ders + hazırlık şeridi (`01_office_ai-0`) açık**, ders 2+ kilitli.
4. `app/academy/[slug]/oyna/page.tsx` — ön izlemesi olan kursta oturum zorunlu değildir; oturumsuz ziyaretçiye `paywallLocked` ders kabukları + yalnızca ilk dersin imzalı ses yetkileri (`loadAcademyFreePreviewAudioGrants`) verilir.
5. Ses güvenliği: `withAcademyAudioGrant` kısa ömürlü imzalı adres basar; imzasız dosya kenarda 403 kalır. Ön izleme MP3'ü kilitli ders 2+ için üretilmez.
6. Ödeme duvarı kurgusu iki dürüst kapı (eğitim / sınav) ve mühre göre değişen vaat metni taşıyor (`ACADEMY_TRAINING_OFFER_SUMMARY_SEALED` / `_WRITTEN`).

**Eleştirel not:** Ön izleme yalnızca `/oyna` rotasında. Vitrin kartından ilk derse doğrudan bir "ön izle" düğmesi akışının dönüşüm (conversion) açısından ölçülmesi faydalı olur; `funnel` API'si bu ölçümü zaten destekliyor görünmektedir.

---

### 1.5 Kılavuz Dokümanlar Uyumu Denetimi

#### Anayasa ilkelerine kod uyumu (matris)

| İlke | Kod karşılığı | Durum |
|------|---------------|-------|
| A1 — `amountMinor`, tek defter, dinamik fiyat | `toAmountMinor`, `Wallet` + `LedgerEntry`, `PriceCatalogEntry`; DB'de tutarlar tamsayı | UYUMLU |
| A2 — lisanslı PSP, split yoksa fail-closed | PayTR Merchant; `not_configured` dürüst yüzeyi | UYUMLU |
| A3 — sır istemciye sızmaz, RLS/IDOR | `verify:prebuild` içinde `verify:no-secrets`, `verify:rls-status`, `verify:idor-seals` | UYUMLU (kapı CI'da) |
| A4 — kanıt satın alınamaz | Sınav sunucu tarafında, baraj 70, mühür yükü `userId·courseId·attemptId·score·issuedAt·curriculumSeal`; `/academy/dogrula/[hash]` kamu doğrulama | UYUMLU |
| A5 — sahte veri yasağı | Boş kabuklar "Çok Yakında"; mühürsüz satış yok | UYUMLU |
| B1 — monolit + ince sözleşme + tek istemci | `@yetkin/kernel` (para, katalog kimliği, v1 zarf/hop); `apps/rail-is` tek native istemci | UYUMLU |
| B2 — 4 oda, freelancer kilitli | `lib/dronlar/kayit.ts`: freelancer `kapali: true`; donmuş 8 oda 410 | UYUMLU |
| B3 — mühürsüz satış kapalı | `academyCatalogPurchasable` üç şart: DB yayın + aktif fiyat + disk mührü | UYUMLU |
| B4 — 5 katman, 1 kod = 1 ses | `assertAcademyProductionSeal` (disk, fail-closed), `assertAcademyCourseVoiceConfig` (çalışma zamanı) | UYUMLU — ama bkz. 2.3 (ilk iki kalite kapısı kodda değil) |
| Usta-Çırak / vatandaş dili | `lesson-text-standard.ts` istemi, fonetik modül, `verify:sen-axis`, pedagoji mühür testi | UYUMLU |
| Kontrolün kullanıcıda olması | AI "asistan"; eylem öğrencide; puanlama sunucuda | UYUMLU |
| Somut ekonomik sorumluluk | Tamsayı para, append-only defter, gerekçeli zam defteri | UYUMLU |

#### Uyum sapmaları (küçük ama gerçek)

1. `app/academy/page.tsx:28` yorumu ve `pilot-sku.ts` başlık yorumları EC-102'nin canlı durumunu yansıtmıyor (yalnızca yorum; çalışma zamanı DB okuduğu için davranış dürüst).
2. `docs/` silinmesi ANAYASA'daki "/docs günlük rapor" cümlesiyle geçici çelişkiyor (commit kararı bekliyor).
3. `.cursorrules` commit'teki sürümü model kimliklerini dondurarak B4'ün "kimlik tek ev" ilkesini ihlal ediyor; çalışma ağacındaki sürüm düzeltiyor — **commit edilmeli**.

---

## BÖLÜM 2 — ELEŞTİREL SORGULAMA VE DEĞERLENDİRME

### 2.1 Sen Olsaydın Ne Yapardım? — Aksayan ve Zayıf Yönler

**P0 — Bugün yapılacaklar:**

1. **Commit serisini işle.** Önerilen atomik kesimler: (a) `exam-path.ts` + `production-seal-disk.ts` + `free-preview-audio.ts` + ilgili testler (altyapı), (b) EC-102 müfredat + metinler, (c) EC-102 medya (206 MB — LFS gerekliliğini değerlendir; OFF-101 MP3'leri zaten düz git'te), (d) migration SQL'i, (e) `.cursorrules` işaretçi tablosu, (f) `docs/` temizliği + `parent_teacher_ai` taşınması, (g) bu rapor. Push et; CI (`ci.yml`) + `nightly.yml` yeşilini gör.
2. **`ops:runtime-readiness`'i Vercel Production'da çalıştır** ve süper admin çift env'in üretimde dolu olduğunu teyit et.

**P1 — Bu hafta:**

3. `media-bake/` (~1.5 GB WAV) için yedekleme reçetesi OPS_RUNBOOK'a eklenmeli (harici disk veya şifreli bulut). Bu dosyalar yeniden üretilemez; TTS kotası ve para karşılığı var.
4. E2E müşteri hesabını süper admin adresinden ayır; `.env.local`'daki test şifresi rotasyon planına girsin.
5. Vercel statik tavana dikkat: 206 MB'lık kurs paketi politikası (repo'da MP3) 4. kurs öncesi yeniden kararlaştırılmalı (Supabase Storage + imzalı URL alternatifi). `production-seal-disk.ts` yolları buna göre tasarlanmalı.

**P2 — İki-dört hafta:**

6. Donmuş modüllerin aktif fiyat satırları `PriceCatalogDecisionLedger` üzerinden gerekçeli devre dışı bırakılsın (sessiz silme yok; defter disiplini korunur).
7. Yorum/başlık süpürmesi: `pilot-sku.ts`, `app/academy/page.tsx`, `docs` referansları.
8. Satış kapısı disk sorgusu (`academyCourseProductionDiskSealed`) her vitrin isteğinde dosya sistemi tıklatıyor; modül düzeyinde kısa TTL'li memoize edilirse Vercel soğuk başlangıçlarında gecikme düşer. Kapı fail-closed kalmalı — yalnızca okuma memoize.

**P3 — Kalıcılık:**

9. `retired-storefront.ts` gibi yanıltıcı adlar (işlevi koruyarak) netleştirilsin; ajan bağlam dosyaları (AGENTS.md ↔ .cursorrules) tekilleştirilsin.

**Aksayan yönler (objektif liste):** git disiplini eksikliği (P0), tek istasyon varlık riski, manuel medya hattının operatör boynu olması (mimari değil operasyonel darboğaz), doküman tekrarı, DB tohum kalıntıları. Kod kalitesi yüksek: `noUncheckedIndexedAccess` disiplini, 410 test dosyası, tür seviyesinde vitrin alt küme kanıtları (`_vitrineSubsetOfCanon`), fail-closed default'lar.

### 2.2 Platform Kurgusu Doğru mu?

**Evet — bu ölçek ve hedefler için doğru kurulmuş. Gerekçeler:**

1. **Pragmatik Monolit doğru tercih.** Tek ekip, tek veritabanı, tek deploy. Mikro servis bu ölçekte maliyet değil yüktür. B1'in "ikinci istemci ancak aynı paket ve aynı hop'u tüketerek doğar" kuralı sözleşme disiplinini koruyor.
2. **İnce sözleşme paketi gerçekten ince.** `packages/kernel` yalnızca katalog kimliği, para, SHA-256, v1 zarf/hop sicili taşıyor; Prisma/Supabase taşımıyor. Bu, native istemcinin sunucu bağımlılığına sürüklenmesini engelliyor.
3. **Kayıt + bayrak modeli ölçekliyor.** Yeni oda = `kayit.ts` satırı + hop sicili + `DronBayrakları` — yasak listesi değil checklist. Donmuş 8 oda dürüst 410; kamu vitrin 3 oda + kanıt URL'leri.
4. **"Amiral Gemi + Sürü Dron / Micro-Apps" adı dokümanlarda zaten terk edilmiş** durumda (B1: «Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez). Bu istemdeki eski adlandırma, doküman gerçeğinin gerisindedir — bu bir belirsizlik değil, tamamlanmış bir isim reformudur.

**Nüanslar / riskler:**

- **Gerçek darboğaz mimari değil, medya üretim hattıdır.** Beş katman + elle üretilen ısınma kaseti + `--seal` insan onayı, kurs başına operatör süresi belirliyor. 03/04/05 için bu hattın endekslenmesi (EC-102 SOP'sunun şablonlaştırılması) ölçek planının kritik yoludur.
- **Varlık stratejisi kararı ertelenmemeli.** Repo-içi MP3 politikası 206 MB/kurs büyüme eğrisiyle 4-5 kursta yönetilemez hâle gelebilir (git klon süresi, Vercel paket boyutu). Karar noktası: repo-içi (basitlik) vs Supabase Storage + imzalı URL (ölçek). Mevcut imzalı grant altyapısı (`withAcademyAudioGrant`) ikinciye geçişi zaten kolaylaştırıyor.
- **Tek yönetici + tek geliştirici** bus factor'ı 1'dir. Dokümanlar bunu kabul ediyor gibi görünüyor; DR/rotasyon maddesi eklenmeli.

### 2.3 Kutsal Doküman Sorgulaması

Hiçbir doküman dokunulmaz değildir denildiğine göre hepsi sorgulanır:

**ANAYASA.md — güçlü, iki katmanlı yapı doğru karar.**
- A/B katmanı ayrımı (yasal-finansal sert çekirdek vs yaşayan ilkeler) örnek alınası.
- Zayıf nokta: B katmanı 3 günde 3 reform geçirmiş (28-29 Eylül kilitlemeleri). "Yaşayan" katman bu kadar hızlı çalkalanırsa hangi sürümün bağlayıcı olduğu belirsizleşir. Öneri: B katmanı reformları haftalık toplu sürümlerde işlensin; her maddeye son-değişim izi eklenmeye devam edilsin.
- B4 karar tablosu ("tek bakış, sıfır atlama") iyi bir anti-drift aracı; bu desen diğer maddelere de taşınabilir.

**MANIFESTO.md — çelişkisiz ama bir iç tutarsızlığı var.**
- Bölüm 4, Yol Haritası 1. madde: "TTS bütçe tavanı kurs başına 100 istek, ders başına 10–12 istektir" — bir üstteki cümle "sayıların evi koddur" derken sayılar yine yazılmış. Kendi ilkesinin ihlali küçük ama semptomatik: doküman yazarken sayı çekiciliği sürüyor.
- "Sürü Dron" kalıntısı istemdeki soruda var, dokümanda yok — reform tamamlanmış; kullanıcı iletişiminde yeni adın kullanılması önerilir.

**PEDAGOJI.md — ruh doğru, organizasyon şişkin.**
- Beş medya katmanı kuralı tek dosyada en az altı kez tekrarlanıyor (başlık, §A alt başlık, §B giriş, §B sıra listesi, §B kapı, §D.1, §E.5). "Tek ev" ilkesi sayılara uygulanmış, düz anlatıma uygulanmamış. Öneri: kural bir kez tanımlansın; diğer yerler yalnızca madde numarasına atıf yapsın (B4 karar tablosu deseni).
- **Mantık boşluğu bulgusu:** "3 aşamalı kontrol kapısı"nın yalnızca 3. kapısı (`assertAcademyProductionSeal`) kodda zorunludur. 1. (taslak metin) ve 2. (pedagoji gözden geçirme) kapıları süreçsel kalıyor — atlanmaları sisteme zarar vermez. Bu dürüstçe kabul edilip "1-2 kapı operatör disiplinidir, 3. kapı koddur" diye yazılabilir; şimdiki metin üçünün de zorunlu izlenimi veriyor.
- 18 yaş altı yasağı, Junior ≠ başlangıç ayrımı, Temel Paket yönlendirmesi net ve iyi.

**AKADEMI_URETIM_ANAYASASI.md — "üçüncü anayasa değildir" diyor ama işlevi tam olarak o.**
- Beş katman kuralının dördüncü kopyası. Kısa işaretçi kartı olarak faydalı (Super Admin'e tek sayfalık özet), ama PEDAGOJI §E ile birleştirilirse tek-ev ilkesine geri dönülmüş olur. Ayrıca git dışı duruyor — kutsal sayılan bir metnin versiyonlanmaması kendi başına bulgu.

**.cursorrules — en yeni reformu taşıyan dosya, ama commit edilmemiş.**
- Yeni işaretçi tablosu ("bu dosya ikinci ev değildir") doğru mimari; commit edilen eski sürüm model adlarını dondurarak SSOT'yu ihlal ediyor. Bu, doküman-drift riskinin **yaşayan kanıtıdır**: iki sürüm şu an farklı "gerçekler" içeriyor.
- Dışlama listesi iyi; ama `public/media/` tam dışlaması, ajanın medya var/yok doğrulaması yapmasını engelliyor (bu tespitte hedefli `Test-Path` istisnası gerekti). "Toplu tarama yasak, hedefli var/yok kontrolü serbest" şeklinde bir istisna cümlesi eklemek pratiktir.

**AGENTS.md / CLAUDE.md** — `next dev`'in otomatik bloğu + akademi özeti. CLAUDE.md yalnızca `@AGENTS.md` forwarding. Makul; içerik .cursorrules ile kısmen çakışıyor (bkz. 1.1.5).

**Genel doküman hükmü:** A katmanı ve SSOT-yönlendirmesi sınıf işi; dar boğaz **tekrarlayan düz anlatım** ve **commit edilmemiş reformlar**. Dokümanlar yanlış karar vermiyor — henüz karar verilememiş değişiklikleri taşıyorlar.

### 2.4 GELECEK MASTER PLANI

**Hedef:** sürdürülebilir, ölçeklenebilir ve dürüst-hata (fail-closed) rejimi. "Sıfır hata" mühendislikte yoktur; hedeflenebilir rejim: **CI yeşil + gece mühürleri + dürüst 503/410 + hızlı geri alma.**

**FAZ 0 — Kilitleme (0-2 gün)**
1. Atomik commit serisi (2.1'deki kesimler) + push + CI yeşili.
2. Üretim env teyidi: `SUPER_ADMIN_USER_ID` + `CANONICAL_SUPER_ADMIN_EMAIL` (Vercel), `ops:runtime-readiness` çıkışının "inngest/configured" dahil yeşil olması.
3. Süper adminin canlıda admin paneline girebildiğinin tek seferlik elle doğrulaması.
4. EC-102 migration'ının git geçmişinde DB uygulamasıyla birebir olduğunun teyidi (`prisma migrate diff`).

**FAZ 1 — Varlık ve sır güvenliği (bu hafta)**
5. `media-bake/` yedekleme reçetesi → OPS_RUNBOOK DR bölümü.
6. E2E müşteri hesabı ayrıştırma + `.env.local` şifre rotasyon takvimi.
7. Karar: EC-102 ses paketi repo'ya düz git mi LFS mi (bit boyutu analiziyle) — FAZ 0/1'de verilir, geriye dönük göç 4. kursa kadar ertelenebilir ama **karar** şimdi verilir.

**FAZ 2 — Veri ve anlatı hijyeni (2-4 hafta)**
8. Donmuş modül fiyat satırlarının defter üzerinden devre dışı bırakılması.
9. Yorum süpürmesi (`pilot-sku.ts`, vitrin sayfası) ve doküman tekilleştirme: PEDAGOJI içi tekelleştirme + AKADEMI_URETIM_ANAYASASI'nın işaretçi karta indirilmesi + `.cursorrules`/AGENTS birleşimi.
10. Satış kapısı disk sorgusunun memoize edilmesi (fail-closed korunarak).
11. Vitrin "ön izle" dönüşüm hunisinin funnel API üzerinden ölçülmesi (veri varsa karar: ilk ders önizlemesinin kart düzeyinde öne çıkarılması).

**FAZ 3 — Üretim hattı endeksleme (1-2 ay)**
12. EC-102 fırın SOP'sunun `docs/ops/akademi-bake-elkitabi.md` (geri gelirse) veya production-standard referanslı tek kontrol listesine dönüştürülmesi; 03/04/05 için kurs başına süre/kota kestirimi.
13. 03 kursunun (social_media_ai) üretime alınması — sınav yolu + beş katman + katalog satırı sırasıyla.
14. Gece mühürleri (`verify:nightly`) CI'da zorunlu kılınmalı; `nightly.yml` içeriğinin bu script'i çağırdığının teyidi.

**FAZ 4 — Ölçek ve Faz 2 (3+ ay)**
15. 04/05 kursları; varlık stratejisinin (Storage + imzalı URL) 4. kursa kadar uygulanması.
16. Freelancer Faz 2 açılış checklist'i (ANAYASA B5): lisanslı split sözleşmesi → alt satıcı onboard → hop geri yazımı → kapalı test halkası → bayrak. Sıra dışına çıkmaz.
17. Üç aylık doküman revizyon ritüeli: B katmanı reformlarının toplu işlendiği, karar tablolarının tazelendiği bakım penceresi.

---

## EK A — DOĞRULAMA YÖNTEMİ VE DELİTLER

| Doğrulama | Yöntem | Sonuç |
|-----------|--------|-------|
| Süper admin hesabı | Salt-okunur `SELECT` (auth.users) + kod zinciri | UUID ve e-posta eşleşiyor; e-posta doğrulanmış |
| Kurs yayın + fiyat + satın alma | Salt-okunur `SELECT` (academy_courses, price_catalog_entries, academy_purchases) | 1.1.3 / 1.3 tablolarında |
| 5 medya katmanı | `Test-Path` (yalnızca var/yok; içerik okunmadı) — 20 ders × 5 katman | 20/20 TAM |
| Oda kilidi | `lib/dronlar/kayit.ts` okuması | 3 oda açık, freelancer env-kapalı, 8 donmuş oda 410 |
| Git durumu | `git status --porcelain`, `git log -1`, `git ls-files`, `git check-ignore` | ~270 untracked, 45 silme, son commit 28 Eylül, remote senkron |
| CI varlığı | `.github/workflows/` | `ci.yml` + `nightly.yml` mevcut |

**Bu tespit sırasında yazılan tek yeni dosya** istenen bu rapordur (`docs/TESPIT_RAPORU_01_GLM.md`). Salt-okunur DB sorgu betiği repo dışında geçici klasörde kullanıldı ve repo'ya bir şey yazılmadı. Hiçbir migration, seed, PATCH veya dosya değişikliği yapılmadı.

## EK B — AÇIK KALAN SORULAR (SUPER Admin kararı gerekir)

1. `docs/` temizliği bilinçli mi — commit mi geri yükleme mi?
2. EC-102 ses paketi için varlık politikası: düz git / Git LFS / Storage+imzalı URL?
3. Üretim (Vercel) env çifti teyidi ve olası ikinci yönetici ihtiyacı?
4. `media-bake/` yedekleme hedefi neresi olacak?

— Rapor sonu. TESPAS-01.