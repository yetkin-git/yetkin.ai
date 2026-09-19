# Office AI Eğitim Müfredatı ve Dokümantasyon Tespit Raporu

| Alan | Değer |
|------|-------|
| Tarih | 20 Eylül 2026 |
| Kapsam | `https://yetkin.ai/academy/01_office_ai` — "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)" |
| Yöntem | Kod taraması (rota + içerik SSOT + oynatıcı + sınav + bake), kılavuz çapraz okuma, müfredat nitelik analizi |
| Çıktı | `/docs/office_ai_tespit_raporu.md` (bu dosya) |
| Durum | Tespit — tedavi önerisi içermez, yalnızca bulgu + CEO sorularına görüş |

> Not: Bu rapor ham veriye ve dosya yollarına dayanır. Süre sayıları `lib/academy/lesson-audio-timings/*.json` içindeki `durationSec` alanından, müfredat sırası `lib/academy/curricula/lesson-index.ts` içinden, sınav barajı `lib/academy/exam.ts` içinden alınmıştır. `public/media/` toplu medya taraması yapılmamış, yalnızca kod üzerinden referanslar doğrulanmıştır.

---

## ADIM 1 — Kod ve İçerik Tespiti

### 1.1 Rota ve sayfa haritası (`/academy/01_office_ai`)

| Katman | Dosya | Görev |
|--------|-------|-------|
| Vitrin | `app/academy/page.tsx` | 5'li Vitrin Karması: amiral `01_office_ai` satın alınır kart + 4 kardeş "Çok Yakında" kabuğu. `loadAcademyVitrineCourses()` okur |
| Antre (kurs detayı) | `app/academy/[slug]/page.tsx` | `generateStaticParams()` → `academyStorefrontStaticParams()` (yalnız büyüme SKU). `dynamicParams = false` — vitrinde olmayan slug HTTP 404. Satın alma / sınav kapısı / müfredat özeti bu sayfada |
| Oynatıcı | `app/academy/[slug]/oyna/page.tsx` | `requirePageSession()` + satın alma kapısı; erişim yoksa antreye `redirect`. `CurriculumPlayer` mount eder |
| Oynatıcı bileşeni | `components/academy/curriculum-player.tsx` | Ders listesi (playlist), karaoke sahnesi, `LessonMediaPlayer`, `LessonStudyTabs`, tamamlama POST, otomatik geçiş |
| Müfredat özeti | `components/academy/curriculum-outline.tsx` + `lib/academy/curriculum-syllabus.ts` | Tohum müfredattan başlık + süre + tür basar; gövde açmaz |
| Sınav kapısı | `components/academy/exam-start-gate.tsx`, `components/academy/exam-panel.tsx` | 9 ders bitmeden sınav UI açılmaz |
| Sertifika | `app/academy/dogrula/[hash]/page.tsx` | Kamuya açık, oturumsuz doğrulama (Anayasa A4) |
| Sertifika listesi | `app/academy/certificates/page.tsx` | Kullanıcı sertifikaları |

**Erişim zinciri:** `getSession()` → `loadPurchaseForUserCourse()` → `hasCommercialAcademyEnrolment()` (`lib/academy/enrolment.ts`) veya `hasAcademyPlayerAccess()` (`lib/academy/access.ts`) → yoksa satın alma kartı, varsa oynatıcı. Ders gövdesi yalnız SETTLED satın alma sonrası API/sayfada açılır (`lib/academy/curriculum.ts` başlık yorumu).

### 1.2 Backend ve veri haritası

| Katman | Dosya | Görev |
|--------|-------|-------|
| API (14 route) | `app/api/academy/courses/[id]/route.ts`, `.../curriculum/route.ts`, `.../exam/route.ts`, `.../purchase/route.ts`, `.../lock/route.ts`, `.../listen/route.ts`, `.../pdf/route.ts`, `app/api/academy/certificates/...`, `.../reviews`, `.../discussion`, `.../pulse`, `.../generateSpeech` | Kurs CRUD, müfredat tamamlama, sınav oturumu, satın alma, kilit, dinle, PDF, sertifika |
| v1 hop sicili | `packages/kernel/src/http/v1-hops-meta.ts` (`RAIL_V1_HOPS_META`, 16 kayıt) | Dron/native sözleşme. `app/api/v1/**` dizini yoktur — tasarım gereği kenar (edge) kanonik `/api/...` yoluna rewrite eder (`proxy.ts` + `.system_docs/DRON_CLIENT_SPEC.md` §1). Dosya yokluğu hata değildir |
| Shared Kernel | `packages/kernel` (`@yetkin/kernel`, v1.0.0) | Para, katalog kimliği, v1 hop meta, JSON zarf. Prisma/Supabase taşımaz (pure) |
| Katalog kimliği | `packages/kernel/src/catalog-ids/course-slugs.ts` | 13 SKU kanon (`ACADEMY_CANON_SKU_SLUGS`), başlıklar (`ACADEMY_COURSE_TITLES`), katman eşlemesi |
| DB şeması | `prisma/schema/academy.prisma` | `AcademyCourse`, `AcademyPurchase` (yalnız SETTLED), `AcademyExam` (kurs başına 1:1, `questionsJson` 30–50 soru), `AcademyExamAttempt` (yalnız GRADED), `AcademyExamSitting` (HMAC jeton sicili, JTI tek tüketim), `AcademyCertificate` (hash + müfredat mührü), `AcademyLessonCompletion` (purchase başına lessonKey unique), `AcademyAudioCache` |
| Katalog tohumu | `lib/academy/catalog-seed.ts`, `lib/academy/published-catalog.ts` | `ac_01_office_ai` / `exam_01_office_ai`, fiyat `PriceCatalogEntry` verisi (course satırında tutar yok) |
| Sınav motoru | `lib/academy/exam.ts`, `lib/academy/exam-engine.ts`, `lib/academy/exam-sitting.ts`, `lib/academy/exam-duration.ts` | Sunucu puanlama (`gradeAcademyExam`, floor yüzde), baraj 70, havuzdan 10 çekim, 30 dk duvar saati + 15 sn lütuf |
| Sınav havuzu | `lib/academy/exam-pools.ts` (`OFFICE_AI_EXAM_QUESTIONS`, 42 soru) | 4 şık zorunlu, ID unique, 30–50 aralığı `assertAcademyExamPool` ile kilitli |

### 1.3 İçerik SSOT zinciri (tek gerçek kaynaklar)

```
lib/academy/curricula/office_ai/section_{1,k1,2,3,5,4,g1,w1,6}.ts  (compact makale gövdesi)
  → lib/academy/curricula/office_ai/index.ts                      (officeAiSections dizisi)
  → lib/academy/curricula/index.ts                                (CURRICULUM_DRAFTS_BY_SLUG)
  → lib/academy/curriculum.ts                                     (sealCurriculumLessons → AcademyLessonSeed)
  → lib/academy/curriculum-syllabus.ts                            (vitrin özeti; gövde yok)

Sıra SSOT:        lib/academy/curricula/lesson-index.ts           (vatandaş 1–9)
Harita:           lib/academy/curricula/office_ai/planned.ts      (OFFICE_AI_PLANNED_LESSONS: 9 main sealed + 3 satellite planned)
Konuşma (karaoke):lib/academy/spoken-scripts/01_office_ai-*.md    (9 dosya, Gözde/Callirrhoe SEN dili)
Cue:              lib/academy/lesson-cues/01_office_ai-*.json      (9 dosya, ders başına 8 cue)
Zaman:            lib/academy/lesson-audio-timings/01_office_ai-*.json (9 dosya, durationSec + pieces)
Görsel reji:      lib/academy/cinema-cue-catalog.ts               (~2000 satır, cue başına slide)
                  lib/academy/lesson-visual-stage.ts
                  lib/academy/lesson-beat-visual.ts
Pratik:           lib/academy/lesson-practice.ts                  (LESSON_PRACTICE: 9 derslik params/steps/prompt)
Prompt terminali: lib/academy/prompt-console.ts
                  lib/academy/gmail-workspace.ts (ACADEMY_GMAIL_GEMINI_PROMPT)
                  lib/academy/word-workspace.ts (ACADEMY_WORD_UPLOAD_PROMPT)
```

Çalışma alanları (lib + component eşleşmesi):

| Ders | lib | component |
|------|-----|-----------|
| Excel (1, 2, 5) | `lib/academy/excel-workspace.ts`, `lib/academy/office-ai-2-workspace.ts` | `components/academy/lesson-excel-workspace.tsx` |
| KVKK (k1) | `lib/academy/kvkk-workspace.ts` | (stage içinde, ayrı workspace bileşeni yok — görsel `cinema-cue-catalog` + `lesson-visual-stage` üzerinden) |
| Slayt (3) | `lib/academy/pptx-workspace.ts` | `components/academy/lesson-pptx-workspace.tsx`, `components/academy/lesson-slide-workspace.tsx` |
| Hata avı (5) | `lib/academy/error-hunt-workspace.ts` | (Excel workspace + stage üzerinden) |
| E-posta ritüel (4) | `lib/academy/outlook-workspace.ts` | `components/academy/lesson-outlook-workspace.tsx` |
| Gmail kapısı (g1) | `lib/academy/gmail-workspace.ts` | `components/academy/lesson-gmail-workspace.tsx` |
| Word (w1) | `lib/academy/word-workspace.ts` | `components/academy/lesson-word-workspace.tsx` |
| Haftalık rutin (6) | `lib/academy/weekly-routine-workspace.ts` | (stage + Excel/Outlook workspace reuse) |

Bake hattı: `scripts/bake-office-ai-0{1,2,3,4,5}-sealed-pack.ts` + `scripts/generate-academy-lesson-audio.ts` (`--dry-run` keşif, `--seal --confirm-gemini-spend` insan onaylı mühür). Operatör SOP: `docs/ops/akademi-bake-elkitabi.md`. TTS: `VOICE_TTS` (`gemini-3.1-flash-tts-preview`), senaryo `FAST_STREAM`, görsel `IMAGE_GEN`, dip müzik Lyria bed reuse (2–9. dersler 1. ders bed'ini reuse eder — `lib/academy/lesson-audio.ts` `academyLessonBedAssetKey`).

### 1.4 Mevcut müfredat — başlık, sıra, uzunluk

Vatandaş sırası `lesson-index.ts` içindeki dizin sırasıdır (1 tabanlı). **Teknik sonek ders numarası değildir.**

| Vatandaş | Anahtar | Başlık | `sectionNumber` (teknik) | Makale kelime* | Hedef dk | Mühürlü sn (`timings`) | Konuşma kelime** | Cue | Pieces |
|----------|---------|--------|--------------------------|----------------|----------|------------------------|------------------|-----|--------|
| 1 | `01_office_ai-1` | Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo | 1 | 1454 | 10.8 | 649.36 | ~1344 | 8 | 15 |
| 2 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez? | 2 | 1260 | 10.3 | 619.484 | ~1357 | 8 | 15 |
| 3 | `01_office_ai-2` | Rapor Otomasyonu: Tablodan Yönetim Özetine | 3 | 1218 | 9.2 | 553.84 | ~1138 | 8 | 14 |
| 4 | `01_office_ai-3` | Metinden Slayta: Sunum Hazırlama | 4 | 1240 | 8.9 | 531.913 | ~1168 | 8 | 14 |
| 5 | `01_office_ai-5` | İstisnalar & Hata Avı: AI Yanılınca | 5 | 1087 | 8.7 | 522.52 | ~1025 | 8 | 14 |
| 6 | `01_office_ai-4` | E-Posta Akışı: Gelen Kutusu Sıfırlama | 6 | 685 | 7.4 | 443.56 | ~876 | 8 | 14 |
| 7 | `01_office_ai-g1` | Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi | 7 | 587 | 9.5 | 567.2 | ~1106 | 8 | 14 |
| 8 | `01_office_ai-w1` | Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor | 8 | 690 | 9.9 | 593.64 | ~1159 | 8 | 14 |
| 9 | `01_office_ai-6` | Haftalık Sistem: 30 Dakikalık Rutin | 9 | 628 | 9.0 | 541.36 | ~1124 | 8 | 14 |
| **Toplam** | 9 ders | | | **~8849** | **~83.7** | **5022.877 sn ≈ 83.71 dk** | **~10297** | **72** | **128** |

\* `section_*.ts` içindeki `estimatedWordCount` (compact makale + El kitabı).
\** `lib/academy/spoken-scripts/*.md` kaba kelime sayımı (HTML yorum hariç tutulmamış ham sayım; mertebe doğrudur).

Üretim bandı kontrolü (`lib/academy/production-standard.ts`):

| Kural | Bant | Gerçek | Sonuç |
|-------|------|--------|-------|
| Ders süresi | 7–12 dk (420–720 sn) | En kısa 443.56 sn (ders 6), en uzun 649.36 sn (ders 1) | ✅ 9/9 yeşil |
| Ders adedi | 6–12 | 9 | ✅ |
| Kurs süresi | 45–90 dk | 83.71 dk | ✅ (tavana 6.3 dk) |
| Sınav barajı | 70 (`ACADEMY_EXAM_PASS_SCORE`) | 70 | ✅ |
| Sınav havuzu | 30–50 soru, ders başına çekim 10, 4 şık | 42 soru, 10 çekim, 4 şık | ✅ |
| Mühürlü kaset | `ACADEMY_MEDIA_SEALED_AUDIO` | 9/9 | ✅ |
| Karaoke | `article+karaoke` | 9/9 | ✅ |
| Bake kuyruğu | `ACADEMY_MEDIA_PRODUCTION_QUEUE` | boş `{}` | ✅ |

Pedagojik yapı (ders başına): GİRİŞ KÖPRÜSÜ → Warm-up → Command → Comparison (ÖNCE/SONRA split) → CEBİNE KOY → Task/SIRA SENDE + El kitabı (Lisans yoksa / Kenar durum / Tuzak). 4-beat reji + 2 durak (`PEDAGOJI.md` §B). Tek eğitmen (Gözde), SEN dili, sebep → eylem → sonuç zinciri.

Uydu şerit (çekirdeğe girmez, sınav yolunu şişirmez — `planned.ts` `lane: satellite`, `status: planned`):

| Anahtar | Başlık | Yöntem |
|---------|--------|--------|
| `01_office_ai-10` | Takvim ve Toplantı AI: Outlook, Teams, Meet | `copilot-live` |
| `01_office_ai-11` | Excel Formül ve Grafik AI: XLOOKUP, Özet Tablo, Grafik | `direct-file-upload` |
| `01_office_ai-12` | PDF ve Uzun Belge AI: OCR, Birleştirme, Karşılaştırma | `doc-upload-gemini` |

### 1.5 Kod seviyesi bulgular (hatalı link / eksik yapı / çalışmayan bileşen)

**B1 — KRİTİK: `lib/academy/office-ai-2-workspace.ts` git'te izlenmiyor (`??`), ama 2 dosya ona bağımlı.**
`lib/academy/cinema-cue-catalog.ts:65` ve `lib/academy/excel-workspace.ts:33` bu dosyadan import eder (ders 3'ün dense-dump ızgarası + KPI kilidi `ACADEMY_OFFICE_AI_2_SEED_ROWS`, tutar toplamı 54.650). Dosya diskte var, çalışıyor; ancak commit edilmediği için yeni klon/CI/stash kaybında build kırılır. İlk iş `git add` + commit olmalıdır. (20 Eylül 2026 `git status` ile doğrulandı.)

**B2 — ORTA: `sectionNumber` ile vatandaş sırası farklı eksenler; fallback hayalet anahtar üretir.**
`section_5.ts` vatandaş 5. ders, `section_4.ts` vatandaş 6. ders, `section_6.ts` vatandaş 9. derstir. Dosya başı yorumlar ("teknik sonektir") durumu belgeler, testler (`office-ai-lesson-*.test.ts`) sırayı kilitler — canlıda yanlışlık yok. Ancak `lib/academy/curriculum.ts:149` içindeki fallback (`${slug}-${i+1}`) office_ai için `01_office_ai-7/8/9` gibi var olmayan anahtarlar üretir. Pratikte `CURRICULUM_DRAFTS_BY_SLUG` dolu olduğu için fallback hiç çalışmaz; yine de ölü ve yanıltıcı koddur.

**B3 — DÜŞÜK: Ölü pilot mirası kafa karıştırır.**
`lib/academy/pilot-sku.ts` içinde `ACADEMY_PILOT_SKU_SLUG = null`, `ACADEMY_PILOT_SKU_LESSON_COUNT = 0`, `isAcademyPilotSkuSlug()` her zaman `false`, `filterAcademyPilotCatalog()` deprecated. Canlıya etkisi yok; okunabilirliği düşürür.

**B4 — DÜŞÜK: `ACADEMY_MEDIA_PRODUCTION_QUEUE` boş obje olarak durur.**
Tip + okuyucu fonksiyonlar (`academyMediaProductionLessonKeys`, `isAcademyLessonAudioInProduction`) canlı; içerik `{}`. Kuyruk mekanizması ölü değil, boş — "bake kuyruğu boş" cümlesi doğru. Temizlik değil, gözlem notudur.

**B5 — ÖLÜ LİNK YOK (doğrulandı).**
`docs/CANLI_TEST_PROSEDURU.md` silinmiş (`D`); repo genelinde bu dosyaya referans veren metin/kod bulunamadı (ripgrep 0 eşleşme). `app/api/v1/**` dizininin yokluğu tasarım kararıdır (edge rewrite); hata değildir. Vitrinde olmayan slug'lar 404 döner (`dynamicParams = false`), satın alma bekletmesi yoktur.

**B6 — BİLGİ: İlk anlık görüntüdeki `docs\...` / `lib\...` ters bölü çizgili girdiler gerçek dosya değildir.**
Görev başındaki `git status` anlık görüntüsünde görünen `docs\DURUM.md` benzeri girdiler, güncel `git status` (20 Eylül 2026) çıktısında yoktur; `Get-ChildItem -Recurse` ile de doğrulanamadı. Glob önbelleğindeki Windows ayırıcı artığıdır. Gerçek ağaç temizdir.

---

## ADIM 2 — Kılavuz Dokümanlar ile Çapraz Analiz

İncelenen belgeler: `.system_docs/ANAYASA.md` (16 Ağustos 2026 + 17 Eylül 2026 reformu), `.system_docs/MANIFESTO.md` (17 Ağustos 2026 + 17 Eylül 2026 reformu), `.system_docs/PEDAGOJI.md` (kalıcı eğitim felsefesi).

### 2.1 Anayasa uyumu

| Madde | Kural (özet) | `01_office_ai` gerçeği | Hüküm |
|-------|--------------|------------------------|-------|
| A1 | `amountMinor` tamsayı para, tek defter (`Wallet` + append-only `LedgerEntry`), dinamik katalog fiyatı | Fiyat `PriceCatalogEntry` verisi; course satırında tutar yok (`prisma/schema/academy.prisma` yorumu + `catalog-seed.ts`). Sınav/mühür yükünde ödeme tutarı yok | ✅ Uyumlu |
| A2 | Ödeme kuruluşu değiliz; tahsilat lisanslı PayTR Merchant; Split bağlı değilse fail-closed 503 | Merchant HMAC + tutar eşleşmesi; `MARKETPLACE_SPLIT_LIVE = false` → `beginHold`/`settle` `not_configured`; 18 Eylül 2026 ₺15,00 CLEARED canlı tanığı (`docs/ops/DURUM.md`, `.system_docs/ops/ops-paytr.md`) | ✅ Uyumlu |
| A3 | `service_role` istemciye sızmaz; RLS + IDOR; idempotency | v1 Bearer JWT (`DRON_CLIENT_SPEC.md` §2); yazma hop'larında UUID `Idempotency-Key` zorunlu (§3); oynatıcı `useIdempotencyKey()` ile tamamlar | ✅ Uyumlu |
| A4 | Sunucu puanlama, baraj ≥70, mühür `userId·courseId·attemptId·score·issuedAt·curriculumSeal`, açık doğrulama | `gradeAcademyExam` sunucuda; `ACADEMY_EXAM_PASS_SCORE = 70`; `computeAcademyCertificateHash`; `/academy/dogrula/[hash]` oturumsuz | ✅ Uyumlu |
| A5 | Dürüst kapalı yüzey; sahte bakiye/veri yok | 4 kardeş SKU "Çok Yakında" rozetli, satın alma ve hayali oynatıcı yok (`published-catalog.ts` `comingSoonAcademyCourseFromSeed`); lisans yoksa rozet "canlı kutu okunmaz" der (ders 7) | ✅ Uyumlu |
| B1 | Modüler monolit, API-First, `RAIL_V1_HOPS_META` sicili, `@yetkin/kernel` | 16 hop kayıtlı; dron Bearer + zarf `{ok, error, requestId, apiVersion, data}`; kernel pure paket | ✅ Uyumlu |
| B2 | Faz 1 vitrin 3 oda; Freelancer 410; 18 yaş altı yok | Akademi yayında; Freelancer kamu 410; Junior kilitli | ✅ Uyumlu |
| B3 | `verify:prebuild` yalnız A katmanı; stil taramaları nightly | Kapsam dışı (CI konfigürasyonu bu raporda koşulmadı) | ➖ Nötr |
| B4 | Müfredat: konunun hakkı, `SEALED_AUDIO_LIMITS`, süre bandı kodda | 83.71 dk / 9 ders, bantlar `production-standard.ts` içinde; Pedagoji'de sayı dogması yok | ✅ Uyumlu |
| B5 | Merchant ≠ Split; B2B keşif; Redis/Inngest ihtiyaca göre | Split kilitli; kurumsal oda arşivde; SMTP boşsa "skipped", nakit durmaz | ✅ Uyumlu |

### 2.2 Manifesto uyumu

| Kural | Gerçek | Hüküm |
|-------|--------|-------|
| 3 oda vitrin (Panel, Akademi, Kariyer); 4. oda kilitli motor; Faz 1'de yeni oda çift imzasız açılmaz | Akademi vitrini 5'li karma (1 yayında + 4 kabuk); yeni oda açılmamış | ✅ |
| Vize Kapısı (`docs/specs/freelancer-vize-kapisi.md`) | Spec dosyası mevcut (788 bayt); kilitli yüzeyde canlı kapı diye okunmuyor | ✅ |
| Tek Defter + S43 | A1/A2 ile aynı | ✅ |
| Dürüst Yüzey | A5 ile aynı | ✅ |
| Motor 1 B2C Akademi (Gün 0 kahramanı) | Amiral yayında, PayTR tahsilat bağlı | ✅ |
| Motor 2 B2B keşif / Motor 3 Split sonrası | Keşif/kilitli; vitrinde nakit vaadi yok | ✅ |
| Mimari: modüler monolit + ince kernel + API-First; canlı oynatıcı compact makale + mühürlü karaoke; izlemede canlı TTS yok | Birebir uygulanıyor | ✅ |

### 2.3 Pedagoji uyumu

| İlke | Gerçek | Hüküm |
|------|--------|-------|
| A.1 Sebep → Eylem → Sonuç; slogan/aforizma yasağı | Her ders "Peki neden …?" zinciri taşır; `aphorism-cleanup.test.ts` + ders testleri yasaklı kalıpları (`Karar notu insanındır`, `Sunum fabrikası`, `kahraman gibi` vb.) regex ile kilitler | ✅ |
| A.2 SEN dili; öğretmen SEN / belge SIZ; Vatandaş Lisanı (`xlsx`→Excel tablosu vb.) | Ders 8'de "öğretmen SEN, belge SIZ çift sicili" cümlesi hem makalede hem konuşmada; `expandAcademySpokenAbbreviations` + `academyCitizenOfficeFileLabel` ham uzantıyı yüzeye bastırmaz; testler `\.docx` arar | ✅ |
| A.3 Karaoke overlay'de paragraf yasağı; punchcard ≤3 kelime; 0 layout shift; descender koruması; 16:9 contain | CSS kilitleri testlerde (`academy-player-karaoke-word`, `aspect-ratio: 16/9`, `overflow: visible`, `font-weight: inherit`); Comparison split ÖNCE/SONRA | ✅ |
| B. Fırın rolleri + 4-beat reji; üretim sırası senaryo→ses→cue→görsel→müzik→montaj; izlemede üretici API yok | Bake el kitabı + `model-roles.ts` (`FAST_STREAM`/`VOICE_TTS`/`IMAGE_GEN`); oynatıcı mühürlü MP3 + timings okur | ✅ |
| C. Süre/seviye/baraj kod SSOT; tazelik 6 ay | Bantlar yeşil (§1.4); eğilim kartı "Eylül 2026 tarihli, 6 ayda bir gözden geçirilir" | ✅ (tazelik takvimi risk taşır — §3.2) |
| D. Üç Kapı (yerleşik → ataş → maskeli kısa); güvenlik sınıfı ayrı eksen | 9 dersin tamamında sıra sabit; `ACADEMY_INFRA_TOOL_MATCH` (Outlook→Copilot, Gmail→Gemini, Word/Excel→ataş, PowerPoint→Copilot); "taşıma su = atlanmış kapı" | ✅ |
| D.1 Vitrin karması + dürüst yüzey | OFF-101 yayında; EC-102/SM-103/BOT-104/PR-105 kabuk | ✅ |
| E. Altın şablon, görsel dürüstlük (spoiler yasağı), prompt terminali, adım bandı | `cinema-cue-catalog` + workspace'ler; Command beat'te temiz sonuç gösterilmez (`slides[3].table.note` "Spoiler"); `LessonPromptConsole` daktilo | ✅ |

**Özet:** Müfredat, üç kılavuza da yüksek uyum gösterir. Uyum beyan değil; ~20 akademi test dosyası cümle, CSS, süre ve cue seviyesinde kilitler (`tests/academy/office-ai-lesson-*.test.ts`, `sealed-audio-pilot.test.ts`, `word-workspace.test.ts`, `prompt-console.test.ts` vb.).

### 2.4 Doküman özeleştirisi — çağdaş Office AI eğitimini engelleyebilecek katı noktalar

A Katmanı (A1–A5) tartışmaya kapalıdır ve haklı olarak değişmez. Aşağıdaki eleştiriler **yalnız B katmanı yaşayan ilkeler + Pedagoji + Manifesto** içindir:

1. **Test kilitleri yeniliği dondurma riski (Pedagoji §A–E + testler).** Her dersin cümleleri, rozet metinleri, CSS değerleri ve `durationSec` ondalıkları testlerde birebir kilitli. Avantaj: regresyon yok. Bedel: tek cümlelik güncelleme bile re-bake + 3–5 test dosyası değişimi ister. Model sürümleri 6 ayda bir değişirken bu sürtünme, "tazelik" ilkesini (C) fiilen yavaşlatır. **Öneri:** kilitleri üç seviyeye ayırmak — (a) kırmızı: Üç Kapı sırası, maske kuralı, baraj, mühür (asla kırılmaz); (b) sarı: SEN dili, punchcard uzunluğu (PR'da gerekçeyle esneyebilir); (c) yeşil: örnek şirket adları, eğilim cümleleri (bakım penceresinde serbest).
2. **9 ders kilidi + 90 dk tavanı, amirali genişlemeye kapatır (Pedagoji §D.1 + `production-standard.ts`).** Kurs 83.71 dk ile tavana 6.3 dk uzakta. Excel formül/grafik, takvim/toplantı, PDF gibi çekirdek ofis ihtiyaçları "uydu şerit"e itilmiş; uydu şeridin oynatıcı/SKU karşılığı bugün yok (yalnız `planned.ts` satırı + 1 test). **Öneri:** OFF-101/102 ayrım tetiğini (§D.1'de zaten yazılı: 90 dk aşımı veya 11 ders) takvime bağlamak yerine içerik eşiğine bağlamak — örn. "uydu 3 ders hazır olunca 102 açılır".
3. **"İzlemede canlı üretici API yok" ilkesi, etkileşimli lab'i yasaklar (Pedagoji §B + §E.4).** İlke maliyet/bütçe için doğru; ama öğrencinin kendi dosyasını yükleyip denediği gerçek laboratuvarı da kapatır. Mevcut "workspace"ler senkron React/SVG tiyatrodur (sıfır API maliyetiyle doğru tercih), fakat öğrenci girdisi işlemez. **Öneri:** ilkeyi "izleme akışında zorunlu canlı çağrı yok; isteğe bağlı lab denemesi kotalı ve B2B'de" diye inceltmek.
4. **Tek ses + tek hitap dayatması, B2B varyantı zorlaştırır (Pedagoji §A.2 + §C).** Gözde/Callirrhoe + SEN, B2C amiral için doğru. Ama kurumsal pilot (şirket içi eğitim) SIZ hitap ve erkek/kurumsal ses isteyebilir. Erkek TTS yuvası (Fenrir) "köprü dersinde pilotlanabilir" diye geçiyor ama takvim yok. **Öneri:** ses/hitap matrisini SKU varyantı olarak tanımlamak (OFF-101-B2B), Pedagoji'yi tekil yerine matris yazmak.
5. **4-beat her derse zorunlu kalıp (Pedagoji §B).** KVKK gibi hukuk/uyarı dersi de Warm-up→Command→Comparison→Task giyer. Bugün çalışıyor; ama 102'deki ileri konular (otomasyon, ajan) aynı kalıba zorlanırsa yapay durur. **Öneri:** beat'leri "varsayılan reji" saymak, ders tipine (uyarı/kavram/lab) göre 2–3 reji şablonu tanımlamak.
6. **Manifesto "Faz 1'de yeni oda açılmaz" (çift imza) akademi alt-odalarını da kapsar mı?** Metin oda/dron açılışını kilitler; akademi içi 102/SKU bölünmesi "oda" değil "SKU" sayılırsa sorun yok. Yorum belirsizliği ileride yavaşlatır. **Öneri:** bir cümlelik açıklama — "SKU bölünmesi oda açılışı değildir".

---

## ADIM 3 — Müfredat ve İçerik Niteliği Analizi

### 3.1 Eksik konular (çağdaş Evrensel Ofis AI eğitiminde olması beklenenler)

| # | Eksik / sığ alan | Mevcut durum | Değerlendirme |
|---|------------------|--------------|---------------|
| E1 | Prompt Mimarisi (sistematik) | Rol + görev + format + kısıt kalıbı her pratikte var (`lesson-practice.ts`), ama "neden bu 4 parça" teorisi hiçbir derste toplu öğretilmiyor | Orta eksik. 05_prompt_practice SKU'suna havale edilmiş; amiral öğrencisi çerçeveyi sezgisel kapar, iskeleti öğrenemez |
| E2 | Model/araç derinliği (Copilot / ChatGPT / Claude / Gemini) | Ders 1'de 3 eğilim cümlesi + "özel API" tanımı; ders 7'de Gmail/Outlook eşleşmesi. Sürüm/plan/limit farkları yok | Orta eksik. 6 aylık tazelik penceresi model dünyası için uzun; eğilim kartı Eylül 2026 damgalı ve şimdiden eskimeye aday |
| E3 | Tablo/Veri Analizi (formül, özet tablo, grafik) | A1 hijyeni + temizlik + yönetim özeti var; XLOOKUP, TOPLA ötesi formül, özet tablo, grafik türü seçimi yok — hepsi uydu 11'de (`planned`) | **Büyük eksik.** "Excel" vaat eden amiralde grafik/formül yok; ders 3 "Grafik vaadi bu derste yoktur" diye dürüstçe söyler ama vaat hiçbir derste tutulmaz |
| E4 | Takvim ve toplantı AI | Yok — uydu 10'da (`planned`). Ders 9 "Cuma 30'u takvime yaz" der ama takvim bloğu pratikte gösterilmez | Orta eksik. Ofis haftasının %20'si toplantıdır |
| E5 | PDF ve taranmış belge | Yok — uydu 12'de (`planned`). Ders 8 yalnız Word belgesi işler | Orta eksik. Kamu/KOBİ gerçeği PDF'dir; "Word belgesini yükle" kamu ihale dosyasını çözmez |
| E6 | Teams / Meet transkriptten aksiyon | Yok (uydu 10'un içinde cümle olarak) | Küçük eksik (Faz 2'ye bırakılabilir) |
| E7 | Power Automate / n8n / Sheets / Docs ekosistemi | Bilinçli dışlanmış: "Sheets/Docs yasak değil, bu SKU'da yol Excel/Word'dür" (§E.2); VBA/Gamma/Marp "zorunlu değildir" | Tasarım kararı — doğru, ama KOBİ'de Sheets kullanan öğrenciye köprü cümlesi bile yok |
| E8 | Güvenlik tekniği (prompt injection, veri sızıntısı senaryosu) | KVKK/maskeleme (ders 2) güçlü; ama "model çıktısına gizli talimat gömülmesi", "ataşın üçüncü taraf saklanması" gibi teknik tehditler yok | Küçük-orta eksik. Hukuk var, tehdit modeli yok |
| E9 | Mobil Office + Outlook mobil Copilot | Yok | Küçük eksik |
| E10 | İngilizce prompt / çok dilli yazışma | Yok | Küçük eksik (Türkçe SEN odağı doğru; yine de ihracatçı KOBİ notu eksik) |

### 3.2 Hatalı / demode / yetersiz bilgiler

| # | Konum | Bulgu | Şiddet |
|---|-------|-------|--------|
| H1 | Ders 1 makale + konuşma (eğilim kartı) | "2026 itibarıyla ChatGPT çoğu zaman hızlı taslak üretmeye, Claude uzun satırları dikkatle okumaya, Gemini adımları net sıralamaya yatkındır." Model davranışları haftalık değişir; Eylül 2026 damgası + 6 ay review, yanlışlanabilir genellemeyi 6 ay vitrinde tutar | Orta — takvim riski. "Eğilimdir, sürümde değişir" şerhi var ama öğrenci yine de ezberler |
| H2 | Ders 1 "özel API" tanımı | "Şirketinin kurumsal yapay zekâ modeli: evdeki format ve gizlilik kuralı o kiracıya yazılır." Azure OpenAI / Vertex / şirket içi LLM ayrımı yok; kiracı (tenant) kavramı tek cümleyle geçilir | Düşük-orta — muğlaklık |
| H3 | Ders 5 senaryo sayıları (59.450 / 50.450 / 21.500) | Ekran + karaoke + TTS'te tutarlı (bake el kitabı kilitli). Ancak TOPLA kilidi "formüle yazdır" diye söylenir, formül çubuğu sahnede gösterilmez; öğrenci formülü duyar, görmez | Düşük — sahne eksiği |
| H4 | Ders 6 "142 okunmamış" + ders 7 Gmail sahnesi | Senaryo gerçekçi; ama Gmail kategori/checkbox ve Outlook kural (rule) detayı sığ. "Arşiv silmek değildir" doğru öğretilir | Düşük — yeterli, derinleşebilir |
| H5 | Ders 9 takvim bloğu | "Outlook veya Google Takvim fark etmez; başlık Cuma 30, süre 30 dk, tekrar her hafta" — yinelenen etkinlik oluşturma adımı sahnede yok, sözlü tarif var | Düşük — pratik eksiği |
| H6 | `estimatedWordCount` alanları (ders 7/8/9) | Ders 7: 587 (makale) vs ~1106 (konuşma); ders 8: 690 vs ~1159; ders 9: 628 vs ~1124. Sayılar makaleyi doğru sayar ama "ders uzunluğu" diye okunursa yanıltır; konuşma neredeyse 2 katıdır | Düşük — etiketleme sorunu (bkz. §3.3 U1) |
| — | Güncelliğini yitirmiş bilgi | Taranan 9 makale + 9 konuşma metninde factually yanlış bilgi bulunamadı. Riskler (H1/H2) eskime ve muğlaklık sınıfındadır, hata sınıfında değil | — |

### 3.3 Bölüm uyumsuzlukları (akış kopukluğu / pedagojik eşitsizlik / mantık hatası)

**U1 — Makale/karaoke makası (pedagojik eşitsizlik, ÖNEMLİ).**
İlk 5 derste makale konuşmadan uzundur (makale = konuşma + El kitabı, doğru). Son 4 derste tablo tersine döner:

| Ders | Makale | Konuşma | Oran |
|------|--------|---------|------|
| 6 (E-posta ritüel) | 685 | ~876 | 0.78 |
| 7 (Gmail kapısı) | 587 | ~1106 | 0.53 |
| 8 (Word) | 690 | ~1159 | 0.60 |
| 9 (Cuma 30) | 628 | ~1124 | 0.56 |

Ders 7'nin makalesi konuşmanın yarısıdır. Öğrenci makaleyi okuyup kaseti dinlediğinde iki farklı doygunlukla karşılaşır: kaset öğretir, makale özetler. İlk 5 derste ise makale kasetten zengindir. Yön birliği yok. Kök neden: son derslerin makaleleri kısa yazılmış, konuşmaları tam yazılmış. "Compact makale" tanımı dersler arasında aynı yoğunlukta uygulanmamış.

**U2 — Ders 1→2 sıra riski (akış, HAFİF — kısmen tedavi edilmiş).**
Ders 1 ataş öğretir, "maskeyi 2. derste kilitleyeceğiz" der. Öğrenci 1. dersi bitirip 2. derse geçmeden gerçek dosya yüklerse 1 derslik risk penceresi açılır. Tedavi olarak ders 1'e erken KVKK uyarısı + "temiz örnek dosya" vurgusu eklenmiş (19 Eylül 2026 kilidi, `docs/ops/DURUM.md`). Yeterli sayılabilir; ama ideal sıra "maske → ataş"tır ve mevcut sıra "ataş (temiz örnekle) → maske"dir. Temiz örnek disiplini bozulursa risk geri gelir.

**U3 — E-posta ve Word'ün geç gelmesi (akış, GÖZLEM).**
En sık kullanılan iki araç (e-posta, Word) 6–8. derstedir; Excel ilk 5 dersin omurgasıdır. Gerekçe sağlamdır (A1 → maske → rapor → slayt → hata avı zinciri bozulmamalı). Bedel: "e-posta için aldım" öğrencisi 6 ders bekler. Devam paneli (resume) ve oynatma listesi bu bekleyişi yumuşatır; yine de katalog sayfasında "e-posta 6. derste" beklentisi yazmaz.

**U4 — Ders 5→6 köprüsü (mantık, SAĞLAM).**
Hata avı (5) slayttan (4. vatandaş) sonra, e-postadan önce gelir. Gerekçe metinde açık: "sayı kilitlenmeden slayt yayınlanmaz, e-postaya geçilmez". Akış doğru; kopukluk yok. Tespit olarak kaydedildi (olumlu).

**U5 — Uydu derslerin çekirdekle bağı (yapı, RİSK).**
Uydu 11 (Excel formül/grafik) çekirdek Excel zincirinin doğal devamıdır; ayrı şeritte kalırsa öğrenci "Excel bitti mi?" sorusuna cevap bulamaz. Çekirdek 9 "kilitli" sayıldığı için bu soru bugün cevapsızdır. §2.4 madde 2'deki OFF-102 önerisi bu düğümü çözer.

**U6 — Sınav kapısı cümle birliği (DÜŞÜK).**
9. ders bitmeden sınav açılmaz kuralı tüm derslerde tekrarlanır; ancak ders 8 konuşmasında "9. ders bitince sınav kapısı açılır" cümlesi testle kilitli (`office-ai-lesson-w1.test.ts:125`), ders 6'da "sınav kapısı yalnız bu kapanış dersinden sonra açılır". İki cümle aynı kapıyı anlatır, çelişki yok; yine de tek cümle standardı ("Sınav, 9. ders bitince açılır. Baraj 70.") 9 derse de aynen konulabilir.

---

## ADIM 4 — Cursor Önerileri ve Mimar Değerlendirmesi

### 4.1 SEN OLSAYDIN NE YAPARDIN? (Amiral Gemisi kurgusu)

**İçerik kurgusu — "9 + 3 + Lab" modeli:**

1. **Çekirdek 9'a dokunma, makale makasını kapat (U1).** Ders 6–9'un compact makalelerini konuşma metinleriyle aynı doygunluğa çıkar (hedef: makale/konuşma oranı 0.9–1.1). Re-bake gerekmez; makale metin işidir. Tahmini iş: 4 makale × ~400 kelime ek + test güncellemesi. Bu, en ucuz ve en görünür kalite sıçramasıdır.
2. **Uydu 3'ü OFF-102 olarak aç, amirali ikiye bölme korkusunu bırak.** 83.71 dk tavana dayanmışken yeni konuyu 101'e sıkıştırmak her dersi inceltir. 102 = "Ofiste Yapay Zekâ — İleri Ofis (Takvim/Toplantı, Formül/Grafik, PDF)". Sınav yolu bağımsız, vize kartı "OFF-101 + OFF-102" rozeti taşır. Tetik koşulu zaten Pedagoji §D.1'de yazılı; işletmek gerekir.
3. **Prompt Mimarisi'ni amirale 15 dakikalık "kilit ders" olarak ekle — ama 101'e değil, 101+102 arasına köprü yap.** Rol/görev/format/kısıt dörtlüsünü tek derste iskeletle; 05_prompt_practice derin dalış olarak kalır. Köprü dersleri çekirdek sınav yolunu şişirmez (uydu şeridi kuralı korunur).
4. **Eğilim kartını "canlı kutu" yap.** Model eğilim cümlelerini mühürlü kasetten çıkar, makaledeki tarih damgalı kutuya taşı + katalog sayfasında "son gözden geçirme" tarihi bas. Kaset 6 ayda bir re-bake görmez; kutu aylık güncellenir. TTS ekonomisi korunur, tazelik artar.
5. **E-posta/Word bekleyişini "hızlı kulvar" ile çöz.** Müfredat sırasını bozma; bunun yerine antre sayfasına "Ben e-posta için geldim → 6. dersten başla (önerilmez ama serbest)" dürüst yönlendirmesi koy. Mikro-ödev kanıtı (`proofOfWorkHash`) zaten ders bazında; sıra dayatması yerine öneri + uyarı yeter.

**Teknik altyapı kurgusu:**

1. **`office-ai-2-workspace.ts`'i hemen commit et (B1), sonra yaprak-workspace kuralını belgele.** Kural: "yaprak dosya = tek dersin ızgara SSOT'u; `excel-workspace.ts` yalnız re-export eder". Yeni ders eklendiğinde aynı kalıp izlenir.
2. **Test kilitlerini 3 seviyeye ayır (§2.4-1).** Kırmızı kilitler CI'da `verify:prebuild` benzeri kapıda; sarı/yeşil kilitler PR review'da. Böylece içerik ekibi cümle düzeltmesi için mühendis beklemez.
3. **Karaoke/makale üretim hattını tek kaynaktan çift çıktıya çevir.** Bugün makale (`section_*.ts`) ve konuşma (`spoken-scripts/*.md`) iki ayrı el yazımı metindir; makasın kök nedeni budur. Hedef: senaryo tek markdown → makale derleyici (El kitabı + başlıklar) ve konuşma derleyici (TTS fonetiği + cue bölme) ayrı üretir. Kısa vadede derleyici yazmadan "makale-konuşma fark raporu" script'i bile makası kapatır (`scripts/diff-article-spoken.ts`).
4. **Lab katmanını "kotalı deneme" olarak aç (§2.4-3).** İzleme akışına dokunma; ders sonuna "Kendi dosyanla dene (aylık N deneme)" butonu koy. Kota bitince dürüst mesaj (A5). Bu, "workspace tiyatrosu" eleştirisini bitirir ve B2B satış argümanı olur.

### 4.2 Platform kurgusu doğru kurgulanmış mı? (Core + Micro-Apps / Sürü Dron / Shared Kernel)

**Kısa cevap: Evet — ölçek ve modüler eğitim için doğru; iki inceltme ister.**

| Mimari karar | Değerlendirme |
|--------------|---------------|
| Modüler monolit (Next.js App Router + `lib/` odaları) | ✅ Doğru. 3 odalı Faz 1 için mikroservis cinayettir. Oda sınırları (`lib/academy`, `lib/kernel`, `lib/dronlar/kayit.ts`) + `DronBayrakları` kilidi, monolit içinde disiplin sağlar |
| Shared Kernel `@yetkin/kernel` (pure: para, katalog, hop meta, zarf) | ✅ Doğru ve nadir bulunan bir olgunluk. Prisma/Supabase'i dışarıda tutması, dron'un web'e göbekten bağlanmasını önler. Kırıcı değişimde major + 426 penceresi sözleşmesi gerçekçidir |
| API-First v1 hop sicili (16 hop) + edge rewrite | ✅ Doğru. `app/api/v1` kopya ağacı olmaması (tek handler, edge'de soy) bakımı yarıya indirir. T3 Akademi halkası (oynatıcı/sınav/mühür/kasa) bağlı; simülasyonun web'de kalması (native'e Excel klonu yazmamak) bütçe açısından bilgece |
| Sürü Dron (native istemci, Bearer JWT, secure storage refresh) | ✅ Doğru. Supabase Auth'u yeniden icat etmemek, IAP'a bulaşmamak, cüzdanı hop'ta tutmak — hepsi isabetli. Tezgâh izolasyonu (`tezgahStoreIsolated`) Faz 2'yi bugünden kilitler |
| Akademi ölçeklenmesi (SKU ekleme maliyeti) | ⚠️ Yarı doğru. Yeni SKU = `course-slugs` + `planned` + `section_*` + bake + test kilitleri. İçerik hattı oturmuş; ama test kilit yoğunluğu marjinal ders maliyetini yükseltir (§2.4-1). 13 SKU kanonuna bu hızla ulaşmak 12–18 ay sürer |
| Modüler eğitim (paket/derinlik varyantı) | ⚠️ Eksik. Temel/Orta/İleri paket ayrımı Pedagoji §C'de "isteğe bağlı" diye geçer ama kodda karşılığı yok; OFF-101/102 ayrımı kural olarak var, mekanizma (bağımlı sınav, rozet birleşimi) yok. Modül sistemi 102 ile birlikte tasarlanmalı |

**Net hüküm:** Taşıyıcı kolonlar (para, mühür, hop, kernel) sağlam. Akademi içerik hattı tek SKU'da mükemmeliyetçi, çok SKU'da yavaş. Hız, test kilit kademelendirmesi + makale/konuşma tek-kaynak hattı ile gelir; mimari değişimi gerekmez.

### 4.3 Bir Sonraki Adım (Tedavi/Geliştirme aşamasında ilk adım)

**İlk adım tek cümle: `office-ai-2-workspace.ts`'i commit et + ders 6–9 makale makasını kapat.**

Sıralı ilk 3 iş (tümü düşük riskli, hepsi geri alınabilir):

1. **P0 — Kayıp riski:** `git add lib/academy/office-ai-2-workspace.ts tests/academy/aphorism-cleanup.test.ts` + commit + push. Süre: 10 dakika. Neden ilk: build'in dayandığı dosya izlenmiyor (B1).
2. **P1 — En görünür kalite:** Ders 6/7/8/9 compact makalelerini konuşma doygunluğuna çıkar (U1). Re-bake yok, kaset yok, yalnız metin + ilgili test güncellemesi. Süre: 1–2 gün. Neden ikinci: öğrenci ilk bunu hisseder.
3. **P2 — En büyük yapısal karar:** OFF-102 açma kararını CEO + Super Admin imzasına sun (kapsam: uydu 10/11/12 + prompt köprüsü). Karar çıkmadan kod yazma; karar metni Pedagoji §D.1'e bir paragraf olarak girer. Süre: 1 toplantı. Neden üçüncü: sonraki 3 ayın iş sırasını belirler.

Bunların dışında kalan her şey (eğilim kutusu, hızlı kulvar, lab kotası, kilit kademesi) ikinci dalgadır.

---

## Ek A — Dosya envanteri (taranan kaynaklar)

**Kılavuz:** `.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, `.system_docs/PEDAGOJI.md`, `.system_docs/OPS_RUNBOOK.md`, `.system_docs/DRON_CLIENT_SPEC.md`, `docs/ops/DURUM.md`, `docs/DURUM.md`, `docs/ops/akademi-bake-elkitabi.md`

**Rota:** `app/academy/page.tsx`, `app/academy/[slug]/page.tsx`, `app/academy/[slug]/oyna/page.tsx`, `app/academy/layout.tsx`

**Müfredat:** `lib/academy/curricula/office_ai/{index,planned,section_1,section_k1,section_2,section_3,section_5,section_4,section_g1,section_w1,section_6}.ts`, `lib/academy/curricula/{index,lesson-index}.ts`, `lib/academy/curriculum.ts`, `lib/academy/curriculum-syllabus.ts`

**Ses/zaman/görsel:** `lib/academy/lesson-audio.ts`, `lib/academy/lesson-audio-timings/01_office_ai-*.json` (9), `lib/academy/lesson-cues/01_office_ai-*.json` (9), `lib/academy/spoken-scripts/01_office_ai-*.md` (9), `lib/academy/cinema-cue-catalog.ts`, `lib/academy/lesson-visual-stage.ts`, `lib/academy/lesson-beat-visual.ts`, `lib/academy/lesson-body.ts`, `lib/academy/lesson-practice.ts`, `lib/academy/lesson-advance.ts`, `lib/academy/production-standard.ts`

**Workspace:** `lib/academy/{excel,word,pptx,gmail,outlook,kvkk,weekly-routine-workspace,error-hunt-workspace,office-ai-2-workspace,prompt-console}.ts`, `components/academy/lesson-{excel,gmail,outlook,pptx,slide,word}-workspace.tsx`, `components/academy/{curriculum-player,curriculum-outline,lesson-media-player,lesson-prompt-console,lesson-visual-stage,lesson-study-tabs}.tsx`

**Sınav/katalog:** `lib/academy/{exam,exam-engine,exam-sitting,exam-duration,exam-pools,exam-pools-prompt,exam-pools-growth}.ts`, `lib/academy/{catalog-seed,published-catalog,course-titles,course-cover,course-level,catalog-summaries}.ts`, `prisma/schema/academy.prisma`, `packages/kernel/src/{catalog-ids/course-slugs,http/v1-hops-meta}.ts`

**Bake:** `scripts/bake-office-ai-0{1,2,3,4,5}-sealed-pack.ts`, `scripts/generate-academy-lesson-audio.ts`, `scripts/render-academy-cinema-html.ts`

**Test (örnek):** `tests/academy/{sealed-audio-pilot,office-ai-lesson-w1,office-ai-lesson-k1,office-ai-lesson-2,word-workspace,prompt-console,dron-punchcards-from-timings,curriculum-syllabus}.test.ts`

## Ek B — Sayısal özet (tek bakış)

- Ders: 9 çekirdek (mühürlü) + 3 uydu (planlı) · Sınav yolu: 9 ders · Baraj: 70
- Süre: 5022.877 sn ≈ 83.71 dk (bant 45–90) · Ders bandı: 443.56–649.36 sn (bant 420–720) ✅
- Kelime: makale ~8849 · konuşma ~10297 · cue 72 (8×9) · timings parçası 128
- Sınav: havuz 42 (bant 30–50) · çekim 10 · süre 30 dk + 15 sn lütuf · şık 4/4
- Mühür: kaset 9/9 · karaoke 9/9 · bake kuyruğu 0 · v1 hop 16 · SKU kanon 13 (vitrin 1+4)
- Kod bulgusu: 1 kritik (B1) · 1 orta (B2) · 2 düşük (B3/B4) · ölü link 0
- İçerik bulgusu: 10 eksik (1 büyük E3) · 6 eskime/muğlaklık (0 factually yanlış) · 6 uyumsuzluk (1 önemli U1)
