# Akademi & Junior Eğitim Ekosistemi — TESPİT RAPORU

**Kapsam:** `/academy`, `/junior`, `app/api/academy`, `app/api/junior`, `app/api/junior-pilot`, `components/academy`, `components/junior`, `lib/academy`, `lib/junior`, `prisma/schema/*`, ilgili migration'lar ve testler.
**Yöntem:** Her iddia `dosya:satır` kanıtıyla doğrulandı. Hiçbir kaynak kod dosyası değiştirilmedi. Bu oturumda üretilen tek dosya bu rapordur.
**Tarih:** 24 Kasım 2026
**Rol:** Baş Denetçi (Principal Auditor) + Baş Teknoloji Sorumlusu (CTO)

> **Raporun en pahalı tek cümlesi:** Akademi'nin 234 dosyalık `lib/academy` motoru gerçek, ciddi ve iyi mühendislik taşıyor; ama **ürün yüzeyi yok.** `/academy` diskte yok, bu odanın bayrağı `kapali: true` ve kenar `410 Gone` basıyor (`lib/dronlar/kayit.ts:47-61`, `proxy.ts:176-184`). Yani aşağıda kanıtlanan tüm sınav, sertifika ve iş kanıtı zinciri **çağrılamayan bir API'ye** bağlı. Motor değil, kapı yok.

---

## 0. Doğrulama Kapıları Sonuçları

Aşağıdaki tablo bu oturumda **birebir çalıştırılmış** gerçek çıktılardır. Hiçbiri tahmin değildir.

| # | Komut | Sonuç | Kanıt |
|---|---|---|---|
| 1 | `npx tsc --noEmit` | ✅ **PASS** — 0 hata (`TSC_EXIT=0`) | 66 sn, çıktı temiz |
| 2 | `npm run verify:sen-axis` | ✅ **PASS** — 725 dosya, 46 "siz" kaçağı tarandı; 410 sen-voice hariç | `verify:sen-axis OK` |
| 3 | `npm run verify:boundaries` | ✅ **PASS** — kernel↛dikey, UI↛prisma, kariyer/freelancer↛academy, Junior tablo sahibi `lib/junior` | `verify:boundaries OK` |
| 4 | `npm run verify:api-auth -- --check` | ✅ **PASS** — 175 rota: `{session:110, public:28, closed:11, cron:2, admin:16, webhook:8}` | sapma yok |
| 5 | `npm run verify:rls-status` | ⚠️ **PASS (statik)** — 92 tablo FORCE RLS sicilinde; **`--live` SKIP**: `DATABASE_URL` boş | `verify:rls-status SKIP (canlı DB bağlantısı yok)` |
| 6 | `npm run verify:no-secrets` | ✅ **PASS** — PEM / service_role JWT / yasaklı env ataması / git `.env` yok | `verify:no-secrets OK` |
| 7 | `npx vitest run tests/junior` | ✅ **PASS** — 4 dosya, **25 test** | `content-quality`, `quiz-export-guard`, `live-tutor-access`, `live-tutor` |
| 7b | `npx vitest run tests/academy` | ❌ **DİZİN YOK** — `tests/academy` diskte mevcut değil | `No test files found` |
| 8 | `npx vitest run` (tam paket) | ✅ **PASS** — **415 dosya / 2393 test** | 126 sn |
| 9 | `npm run verify:idor-seals` | ⚠️ **PASS ama eksik** — `tests/academy/idor-exam-purchase.test.ts` **yok**; vitest filtresi sessizce atlıyor | `5 passed` (academy testi hiç koşmadı) |
| 10 | `npm run verify:academy-pedagogy-seals` | ❌ **FAIL** — `tests/academy/pedagogy-seals-retired.test.ts` **yok**, `EXIT=1` | `No test files found` |
| 11 | `npm run verify:junior-pilot-seals` | ✅ **PASS** — liste açık, kasa onay tikinden sonra, anlatış paket ister | `OK` |
| 12 | `npm run verify:junior-guardianship-seals` | ✅ **PASS** — aynı mühür (alias) | `OK` |
| 13 | `npm run verify:academy-curriculum` | ✅ **PASS** — 5 SKU × 6 ders, ders başı ≥600 kelime | `OK: yazılmış eğitimler en az 6 ders ve ders başı 600 kelime` |
| 14 | `npm run verify:junior-content` | ✅ **PASS** — müfredat/kazanım listesi açık | `EXIT=0` |

### 0.1 Kapıların dürüstlük denetimi (asıl bulgu)

İki npm script'i **var olmayan test dosyalarına** işaret ediyor:

```
verify:idor-seals           -> tests/academy/idor-exam-purchase.test.ts        (YOK)
verify:academy-pedagogy-seals -> tests/academy/pedagogy-seals-retired.test.ts (YOK)
```

Tekrarlanabilir kanıt (§5, K-04): `package.json` içindeki tüm `tests/*.test.ts` referanslarını `existsSync` ile taradığımızda yalnız bu iki yol eksik çıkıyor. Sonuç:

- `verify:idor-seals` **yeşil görünüyor** ama Akademi IDOR testi hiç çalışmıyor (vitest "no test files" için yalnız o dosyayı atlar, kalan 5 dosya geçer, `EXIT=0`).
- `verify:academy-pedagogy-seals` **kırık** — bu, `verify:all`/CI'ya bağlanmadığı için görünmüyor.

Yani Akademi tarafında **"yeşil" olan güvenlik kapısı sahte yeşil.**

---

## 1. Yönetici Özeti & Genel Puan Kartı

### 1.1 Genel puan: **58 / 100**

| Boyut | Ağırlık | Puan | Gerekçe (kanıtlı) |
|---|---|---|---|
| **Mimari** | %25 | **19 / 25** | Motor katmanı olağanüstü disiplinli: saf karar fonksiyonları, port/adapter, HMAC mühür, `server-only`, kernel↔dikey duvarı `verify:boundaries` ile yeşil. Düşüş: **ürün yüzeyi yok** (`/academy` 410), 234 dosya `lib/academy`'nin büyük kısmı çağrılmıyor, `components/academy` yalnız 3 dosya vs `archived/academy/components` 53 dosya. |
| **İşlevsellik** | %30 | **14 / 30** | Sınav zinciri (HMAC oturum, tek kullanımlık JTI, permütasyon) **kusursuza yakın**. Ama: 5 SKU'dan **4'ü hiç sertifika üretemez** (ders kapanmıyor → müfredat tamamlanmıyor → sınav kapısı açılmıyor). Junior **yalnız 2 e-posta** ile erişilebilir. Kasa varsayılan **kapalı**. |
| **Ticari Farklılaşma** | %25 | **11 / 25** | Sertifika + iş kanıtı + Pathway mastery + `ACADEMY_CERTIFICATE` → Kariyer vizesi → ilan teklifi kapısı zinciri **gerçekten uçtan uca bağlı** ve iptal filtresi çalışıyor. Ama satılabilir tek ürün **satışa kapalı** (`academyCourseSaleOpen` = `false`); Akademi ve Junior siparişleri defterde **"Cüzdan yükleme"** etiketiyle yazılıyor. |
| **UX / Vitrin** | %20 | **14 / 20** | Junior vitrini gerçek ve dürüst (pilot çizgisi, "Yakında" etiketleri, yanıltıcı raf yok, dış bağlantı/reklam yok, `robots: noindex`). Akademi vitrini **yok** — `/academy` 410, sitemap'te yok, robots disallow. |

### 1.2 Üç cümlelik yönetici özeti

1. **Motor var, ürün yok.** Akademi'nin sınav/sertifika/iş kanıtı zinciri gerçekten iyi mühendislik; ama `/academy` rotası diskte bulunmadığı ve oda bayrağı `kapali: true` olduğu için sayfa ve tüm API kenarda `410` dönüyor.
2. **Junior gerçek, ama iki kişilik.** Veli onayı, çocuk profili, AI koç kalkanları ve kota zinciri çalışıyor; ancak `canAccessJunior` yalnız iki sabit e-postaya izin veriyor ve kasa varsayılan kapalı.
3. **Para etiketi yanlış.** Akademi ve Junior PayTR siparişleri `classifyPaymentOrderPurpose`'tan `null` dönüyor; defterde "Cüzdan yükleme" olarak yazılıyor ve karta iade kapısı açık kalıyor.

---

## 2. Alt Sistemlerin Teknik Röntgeni (`dosya:satır`)

### 2.1 Müfredat, Ders İlerlemesi & Veri Modeli

**Soru: Veritabanında mı, statik dizi mi, `localStorage` mı?**

**Cevap: Üç katmanlı ve doğru kurulmuş — ama üçüncü katman (ders kapanışı) yalnız 1 SKU'da çalışıyor.**

| Katman | Nerede | Kanıt |
|---|---|---|
| Müfredat iskeleti (ders listesi/başlık/gövde) | Kod tohumu — bilinçli tercih, CMS yok | `prisma/schema/academy.prisma:182-199` — "İçerik kod tohumudur (CMS yok)" |
| Öğrenci ilerlemesi (ders tamamlama) | **Gerçek tablo** `academy_lesson_completions`, `(purchaseId, lessonKey)` unique | `prisma/schema/academy.prisma:196` |
| Sınav denemesi | **Gerçek tablo** `academy_exam_attempts` | `prisma/schema/academy.prisma:89-109` |
| Sertifika | **Gerçek tablo** `academy_certificates`, `certificateHash @unique`, `revokedAt` | `prisma/schema/academy.prisma:133-157` |
| Junior ilerlemesi | **Gerçek tablo** `junior_progress` (speak/write/practice/quiz) | `prisma/schema/junior.prisma:56-75` |
| Junior XP | **Gerçek tablo** `junior_xp`, `points` ≤ 20000 CHECK | `prisma/schema/junior.prisma:80-93` |

`localStorage` Akademi ilerlemesi için **kullanılmıyor**. Tek `localStorage` kullanımı kenar çubuğu genişliği (`lib/ui/sidebar-layout.ts:1`) ve çerez tercihi (`lib/kernel/telemetry/cookie-consent.ts:3`) — eğitim verisi değil.

#### 2.1.1 Hız sınırı / Idempotency / Sıçrama koruması

| Koruma | Akademi | Junior |
|---|---|---|
| **Idempotency-Key** | ✅ Zorunlu: `requireRailV1IdempotencyKey` + `settleHttpIdempotency` — `exam`, `curriculum`, `purchase`, `lock` rotalarında | ✅ `lessons/[key]/progress`, `junior-pilot/checkout` |
| **Sıçrama (skip) koruması** | ✅ **Gerçek**: sıradaki ders dışındaki ders tamamlanamaz — `curriculum-engine.ts:394-400` (`nextKey !== lesson.key` → `ForbiddenError`) | ✅ Pekiştirme `gateLesson` üzerinden; quiz `juniorTellPassed` şartı — `service.ts:851-857` |
| **Hız sınırı (edge)** | ⚠️ **YOK** — `matchEdgeRateLimit` Akademi sınav/müfredat POST'ları için `null` döner (§5 kanıt `probe-examrl`) | ✅ `llmIp` + `llmUser` burst (`junior/live-tutor/route.ts:93-100`) |
| **1 saniyede müfredatı bitirme** | ⚠️ **Kısmen açık**: sıçrama koruması var, ama **hız sınırı yok** → 8 ders × 8 POST saniyeler içinde atılabilir. İş kanıtı bunu kısmen frenler (bkz. §2.2.2) | ✅ `JUNIOR_TELLS_PER_DAY = 8`, `JUNIOR_DAILY_XP_CAP = 40` (`limits.ts:221-225`) + `xpUsedSince` |

**Kritik ayrıntı — Idempotency kapsamı:** `curriculum` POST'ta `requestHash` yalnız `{courseId, lessonKey}` içeriyor (`app/api/academy/courses/[id]/curriculum/route.ts:129-132`). İş kanıtı (`proof`) hash'e **girmiyor**; aynı `lessonKey` farklı `proof` ile aynı Idempotency-Key altında gönderilirse ikinci istek **ilk yanıtı replay eder**, iş kanıtı değerlendirilmez. Fail-closed davranış bozulmuyor (ilk istek zaten doğrulanmıştı) ama sözleşme yanıltıcı: istemci "kanıtım kabul edildi" sanabilir.

#### 2.1.2 **En ağır bulgu: 5 SKU'dan 4'ü hiç kapatılamıyor**

`completeAcademyLesson` → `sealLessonProof` üç dalda çalışır (`curriculum-engine.ts:325-361`):

1. **Compact makale + etkileşimli görev yok** → `compact-read` mührü basılır, ders kapanır (`:329-341`).
2. **Etkileşimli görev var** → `evaluateAcademyProofSubmission` doğrular (`:345-350`).
3. **Compact değil ve görev yok** → `academyCanonicalProofSubmission` `null` → `throw ForbiddenError("İş kanıtı olmadan ders kapanmaz.")` (`:342-344`).

Ölçüm (§5 kanıt `probe-closable`):

```
### 01_office_ai (8 ders)      → hepsi compact-read, KAPANIR
### 02_ecommerce_ai (6 ders)   → hepsi "KAPANMAZ (tohum yok)"
### 03_social_media_ai (6)     → hepsi "KAPANMAZ (tohum yok)"
### 04_chatbot_nocode (6)      → hepsi "KAPANMAZ (tohum yok)"
### 05_prompt_practice (6)     → hepsi "KAPANMAZ (tohum yok)"
```

Ve `listAcademyInteractiveTaskKeys()` = **0** (`lib/academy/proof-of-work.ts:208`) — çünkü `LESSON_PRACTICE` haritasında (`lesson-practice.ts:30`) yalnız `01_office_ai-*` anahtarları var ve o SKU `isAcademyCompactArticleSku` = `true` olduğu için `academyInteractiveTaskByKey` erken `null` döner (`proof-of-work.ts:192-196`).

**Sonuç zinciri:**
`ders kapanmaz` → `isAcademyCurriculumComplete` = `false` → `assertAcademyCurriculumComplete` `ForbiddenError("Sınav kapısı müfredat tamamlanınca açılır.")` (`curriculum-engine.ts:488-491`) → **`submitAcademyExam` hiç çalışmaz** → **sertifika üretilemez** → `ACADEMY_CERTIFICATE` vizesi doğmaz → Kariyer ilan teklifi kapısı açılmaz.

Yani **5 satılabilir SKU'nun 4'ü ticari olarak ölü.** Bu, raporun en yüksek öncelikli işlevsellik bulgusudur (K-02).

### 2.2 Sınav, Değerlendirme & Sertifika Zinciri

#### 2.2.1 Cevap anahtarı sızıntısı — **temiz**

Bu, kod tabanının en iyi yazılmış parçası. Kanıtlar:

| Koruma | Kanıt |
|---|---|
| Sunucu soru havuzu rastgele 10 soru çeker | `exam-sitting.ts:254-265` `drawAcademyExamQuestions`, `ACADEMY_EXAM_DRAW_COUNT = 10` |
| Şıklar karıştırılır, permütasyon **imzalı jetonda** taşınır | `exam-sitting.ts:205-219` + `:336-352` (`sealAcademyExamSitting`) |
| HMAC-SHA256, `timingSafeEqual` | `exam-sitting.ts:324-330`, `:358-367` |
| Jeton **sunucu sicilinde** (DB) tutulur, JTI tek kullanımlık | `academy_exam_sittings` (`academy.prisma:112-130`), `consumeExamSitting` `:490-504` |
| Kamu sorusunda `correctIndex` **yok** | `publicQuestionsFromSitting` `exam-sitting.ts:449-457` → yalnız `{id, prompt, choices}` |
| Sır yoksa **fail-closed 503** | `exam-sitting.ts:69` `throw new ServiceUnavailableError` |
| Junior quiz: deterministik şık karıştırma, cevap anahtarı istemciye gitmez | `junior/quiz/index.ts:64-72` `publicJuniorTopicEndQuiz`; `answer-shuffle.ts:80-94` |
| Junior dağılım kapısı: hiçbir şık >%40 doğru | `answer-shuffle.ts:10,117-127` |

**Ölçüm (§5 `probe-pool`)** — havuz boyutları ve doğru şık dağılımı:

| SKU | Havuz | Ünik | `correctIndex` dağılımı |
|---|---|---|---|
| `01_office_ai` | 42 | 42 | `[3, 32, 7, 0]` → **%76'sı indeks 1** |
| `02_ecommerce_ai` | 30 | 30 | `[6, 11, 8, 5]` → dengeli |
| `03_social_media_ai` | 30 | 30 | `[1, 29, 0, 0]` → **%97'si indeks 1** |
| `04_chatbot_nocode` | 30 | 30 | `[1, 29, 0, 0]` → **%97'si indeks 1** |
| `05_prompt_practice` | 30 | 30 | `[1, 29, 0, 0]` → **%97'si indeks 1** |

**Bu bir açık değil, çünkü:** her soru **sunucuda** rastgele permütasyona sokuluyor (`shuffleAcademyExamChoices`, `exam-sitting.ts:205`) ve doğru cevabın yeni konumu sunucuda hesaplanıyor. İstemci `correctIndex` görmüyor. Yani kaynak havuzdaki "hep B" örüntüsü **sızmıyor**.

**Ama** sorun şu: `01_office_ai` havuzundaki 42 sorunun 32'si (üretilen `q_pow_*` blokları) `seed.ts:70-107`'de **sabit `correctIndex: 1`** ile elle yazılmış. Junior'ın aksine Akademi'de **dağılım kapısı yok** — `answer-shuffle.ts`'deki `juniorAnswerDistributionOk` eşdeğeri Akademi tarafında **mevcut değil**. Yani şık dağılımı rastgeleleştirme ile maskeleniyor; ileride biri "sunucu karıştırmasını kaldıralım, performans" dediği gün açık **tek satırlık** bir değişiklikle doğar. Bu O-02 olarak kaydedildi.

#### 2.2.2 Sınav oturumu ve hile koruması — **sağlam**

| Koruma | Kanıt |
|---|---|
| Oturum jetonu **zorunlu**, boşsa puanlama yok | `exam-engine.ts:127-129` `throw new Error("Sınav oturumu geçersiz.")` |
| Jeton ↔ kullanıcı/kurs/sınav üçlüsü eşleşmeli | `exam-engine.ts:130-137` |
| DB sicili tüketimi atomik (`updateMany where consumedAt: null`) | `prisma-store.ts:500-503` |
| Süre dolunca **skor 0** | `exam-engine.ts:151-153` |
| Müfredat tamamlanmadan sınav yok | `exam-engine.ts:190-196` `assertAcademyCurriculumComplete` |
| SETTLED satın alma zorunlu | `exam-engine.ts:186-189` |
| Baraj ≥70, SHA256 sertifika | `exam.ts:9`, `exam-engine.ts:211` |
| Sertifika hash'i `userId+courseId+attemptId+score+issuedAt+curriculumSeal` kapsar | `exam.ts:151-160` |

**Eksik: sınav denemesi tavanı yok.** `listAttemptsForUserExam` (`prisma-store.ts:523`) yalnız **test yardımcısı** ve hiçbir üretim kodunda çağrılmıyor (§5 kanıt). Karşılaştırma: YetkinCV'de `YETKINCV_MAX_ATTEMPTS = 3` (`lib/career/yetkincv.ts:39`) + 30 gün penceresi (`yetkincv-store.ts:142-144`) **var**. Akademi'de eşdeğeri **yok** → öğrenci 30 dakikalık oturumu sınırsız tekrarlayabilir. Sertifika zaten bir kez basılıyor (`getCertificateByUserAndCourse` kısa devresi, `exam-engine.ts:225-233`), yani "sonsuz deneme ile geçme" mümkün. Sınavın **ölçüm değeri** sıfırlanıyor. Bu Y-01.

#### 2.2.3 Sertifika üretim / iptal zinciri — **uçtan uca bağlı**

`ACADEMY_CERTIFICATE` / `ProofReadPort` / `revokedAt` üçlüsü **gerçekten konuşuyor**:

| Halka | Kanıt |
|---|---|
| Sertifika üretimi | `exam-engine.ts:250-276` `computeAcademyCertificateHash` + `insertCertificate` |
| Kariyer vizesi basımı (sınav sonrası, aynı istek) | `app/api/academy/courses/[id]/exam/route.ts:126-134` `tryIssueCareerVisaStamp(... "ACADEMY_CERTIFICATE" ...)` |
| Kanıt okuma — **iptal filtresi** | `lib/kernel/proof/prisma-read.ts:41` `if (row.revokedAt) return null;` |
| Liste okuma — **iptal filtresi** | `prisma-read.ts:73` `where: { userId, revokedAt: null }` |
| Damga ↔ kanıt bağı (kanıt yoksa damga projeksiyona **girmez**) | `lib/kernel/passport/live.ts:29-31` `if (!proof) continue;` |
| İlan teklifi kapısı canlı kanıtı okur | `lib/career/visa-gate.ts:71-93` `liveAcademyListingStamps` → `proofs.getSealedProof` |
| İptal HTTP'si yalnız Super Admin + audit mührü | `app/api/(kernel)/admin/ops/certificate-revoke/route.ts:11-38` |
| İptal append-only değil, gerekçe zorunlu (8–500) | `certificate-lifecycle.ts:33-37`, `:44-46` |
| Kamu doğrulama hash'i **yeniden hesaplar**, uydurma "geçerli" basmaz | `certificate-verify.ts:62-73` |
| Kamu doğrulama `userId/attemptId/purchaseId` **sızdırmaz** | `certificate-verify.ts:5-15,138-152` |

**Kusursuz mu?** Neredeyse. İki nüans:

1. **`sealStatus: "revoked"` üretiliyor ama route bunu hata olarak döndürmüyor** — `certificates/[hash]/route.ts:43-50` yalnız `mismatch` ve `incomplete` için 400 basıyor; `revoked` **200 OK** olarak gövdeyle dönüyor. Dürüst ("iptal" yazıyor) ama makine tüketicisi için `valid` gibi görünen bir 200. Bir üçüncü taraf `status===200` kontrolü yaparsa iptal edilmiş sertifikayı geçerli sayar. Bu O-01.
2. **`/vize/[id]` sayfası iptal edilmiş sertifikayı badge "İptal" + rose tonuyla gösteriyor** (`app/(public)/vize/[id]/page.tsx:36-40`) — doğru. Ama `generateMetadata` (`:112-122`) `sealStatus`'a bakmadan `index` bırakıyor; iptal edilmiş sertifika Google'da **"geçerli mühür" başlığıyla** indekslenebilir. O-03.

#### 2.2.4 Sertifika PDF / görsel / üçüncü taraf doğrulama

| Yüzey | Durum | Kanıt |
|---|---|---|
| PDF indirme | ❌ **410 Gone** — stüdyo arşivde | `app/api/academy/courses/[id]/pdf/route.ts:7` `auth = "closed"` |
| Kamu hash doğrulama JSON | ✅ Var | `app/api/academy/certificates/[hash]/route.ts:19` `auth = "public"` |
| Kamu HTML doğrulama | ✅ `/vize/[hash]` | `app/(public)/vize/[id]/page.tsx:224-228` |
| QR kod | ✅ Bileşen var ve **canlı kullanımda** | `components/academy/certificate-verify-qr.tsx`, `components/career/public-talent-board.tsx:51` |
| Paylaşım butonları | ✅ Canlı | `components/academy/certificate-share-actions.tsx` (3 yerde import) |
| Doğrulama JSON'u **erişilebilir mi?** | ❌ **HAYIR** — `/api/academy/*` kenarda 410 (§2.6) | `probe-edge2`: `frozen: true` → `410 "Bu oda üretimde kapalı."` |

**Yani üçüncü taraf doğrulama ucu yazılmış, test edilmiş, sözleşmesi var — ama çağrılamıyor.** Bu, raporun ikinci en pahalı bulgusu.

### 2.3 Junior Çocuk Güvenliği, Veli Onayı & AI Öğretmen Kalkanları

#### 2.3.1 Veli onayı (`guardian_user_id`) — **sağlam ve kanıta dayalı**

| Koruma | Kanıt |
|---|---|
| Ayrı append-only kanıt tablosu `junior_guardian_consents` | `prisma/schema/junior.prisma:33-53` |
| `guardian_user_id` → `users(id)` FK `ON DELETE RESTRICT` | `prisma/schema/junior.prisma:47` |
| UPDATE/DELETE trigger ile **imkânsız** (`append-only`) | `prisma/migrations/20261005160000_junior_guardian_consent/migration.sql:79-116` |
| `guardian_declared_adult = true` CHECK | aynı dosya `:70-77` |
| `guardian_birth_year` 18 yaş üstü zorunlu (yıl-18 sınırı) | `guardian-notice.ts:52-57` (`year - 18`) |
| Aydınlatma metni **sürümlü + SHA-256 mühürlü** | `guardian-notice.ts:11-24`; sürüm değişirse ders kapısı kapanır (`:65-86`) |
| Veli onayı yokken **ders açılmaz** | `junior/service.ts:904-911` `juniorLessonConsentBlock` |
| Profil kapatma: takma ad → `"Kapalı"`, `birthYear = NULL`, aktif rıza kopar | `junior/load.ts:310-320` |
| Kapanan profilde ders/ilerleme imkânsız | `service.ts:486-488`, `:912-914` |

**Tek nüans:** `guardian_user_id` ile veli ve çocuk **aynı `users` satırıdır**. `bindGuardianConsent` `guardianUserId: userId` yazar (`junior/load.ts:279`). Yani "veli onayı", veli hesabının kendi kendine "ben 18 yaşından büyüğüm" beyanıdır — **kimlik doğrulaması değil**. Bu, kodun kendi yorumunda dürüstçe yazılı (`guardian-notice.ts:52` "Beyan. Kimlik doğrulaması değildir."). KVKK/GDPR açısından **yeterli değildir** (çocuk verisi için "veli tarafından verildiği makul ölçüde doğrulanmış" aranır). Y-03.

#### 2.3.2 PII / KVKK sınırları — **çok iyi, tek açık**

| Koruma | Kanıt |
|---|---|
| Formda e-posta alanı **reddedilir** | `junior/profile-rules.ts:94-98` `/mail\|eposta\|e-posta\|email/i` → hata |
| Takma adda `@` **yasak** | `profile-rules.ts:61-67` + SQL CHECK `nickname !~ '@'` |
| Ses kaydı **saklanmaz** — bellek taşıyıcısı sıfırlanır | `jr` `service.ts:719-723` `wipeAudioCarrier`; şemada ses kolonu **yok** (`junior.prisma:55-56`) |
| Fatura PII'si AES-256-GCM `jinv1:` mührüyle | `junior/invoice-seal.ts:1-45`; üretimde anahtar yoksa **throw** (`:23-25`) |
| Panoya düz TCKN/telefon/adres yazılmaz | `prisma/schema/junior.prisma:103-117` |
| AI'ya giden bağlam **müfredatla sınırlı** (kimlik değil) | `live-tutor.ts:154-163` `corpusFromContext` |
| Analitik `robots: noindex, follow: false` | `app/junior/page.tsx:34`, `app/junior/layout.tsx:52` |
| GA4 **çerez rızasına bağlı** | `layout.tsx:86-97` + `Ga4Bootstrap initialChoice`; rıza yoksa etiket basılmaz |

**Açık:** `junior_subscriptions` tablosunda `invoiceName/invoiceTckn/invoicePhone/invoiceAddress` **kolon olarak** duruyor (`junior.prisma:113-116`) ve şifreli de olsa çözülebilir halde. Profil silindiğinde (`eraseChildData`, `load.ts:294-328`) **abonelik PII'si silinmiyor** — yalnız profil/progress/xp/consent temizleniyor. Çocuk verisi değil (veli faturası) ama "silme hakkı" akışında **fatura PII'si kalıcı**. Y-04.

#### 2.3.3 Dış bağlantı / reklam izolasyonu — **temiz**

§5 taraması (`components/junior/**/*.tsx`, `app/junior/**/*.tsx`): `target="_blank"`, `window.open`, harici `href="http…"` → **0 eşleşme**. Tek dış köken PayTR iframe'i (`EDGE_CSP_FRAME_SRC_DIRECTIVE`, `edge-guard.ts:88`) ve GA4 (rıza bağlı). Reklam ağı yok.

#### 2.3.4 AI öğretmen kalkanları — **gerçek ve çok katmanlı**

| Kalkan | Akademi (`lesson-assistant`) | Junior (`live-tutor` / `tell`) |
|---|---|---|
| Gerçek `llm-gateway` | ✅ `invokeLlm`, `lib/kernel/ai/llm-gateway.ts` | ✅ aynı |
| Model kimliği merkezî | ✅ `lesson-assistant-policy.ts` | ✅ `LITE_STREAM` rolü + `getDefaultModelId` (`live-tutor-policy.ts:8-9`) |
| Günlük/oturum kotası | ✅ 5 soru / 30 gün / ders (`lesson-assistant.ts:97-108`) | ✅ 12 soru / 24 sa (`live-tutor.ts:82-86`) |
| Misafir kotası (IP) | ✅ 3 soru / 24 sa + `llmIp` burst (`route.ts:41-45`) | ✅ `llmIp` (`route.ts:93-97`) |
| **Prompt injection kalkanı** | ✅ Ders dışı konu reddi + yanıtın ders sözlüğüyle kesişmesi şartı (`isAcademyLessonAssistantOffTopic`, `academyLessonAssistantReplyStaysOnLesson`) | ✅ `isJuniorLiveTutorOffTopic` + `juniorLiveTutorReplyStaysOnLesson` (`live-tutor-policy.ts:100-124`) |
| **Halüsinasyon kalkanı** | ✅ Fail-safe yanıt (`ACADEMY_LESSON_ASSISTANT_FAIL`) | ✅ `JUNIOR_LIVE_TUTOR_FAIL` + yerel Sokratik cevap (`resolveJuniorLiveTutorLocalReply`) |
| Yaş grubuna uygunluk | — | ✅ Sistem promptu: "6. sınıf öğrencisine… Doğrudan cevabı verme" (`live-tutor-policy.ts:140-158`) |
| **Bütçe tavanı** | ✅ `assertGatewayBudgetAllows` (platform günlük tavan + kullanıcı günlük token) | ✅ aynı |

**Junior'ın en güzel detayı:** misafir (oturumsuz) kullanıcı **hiç model çağırmıyor** — `localOnly: true` (`live-tutor.ts:190-196` fail-closed, `route.ts:214` `access.mode === "guest-local"`). Yani 6. sınıf öğrencisi veli girişi yapmadan LLM'e **ulaşamıyor**. Bu pedagojik ve mali açıdan doğru bir tasarım.

#### 2.3.5 **Junior erişim kapısı: iki kişilik ürün**

```
lib/access.ts:7-10
export const JUNIOR_ALLOWED_EMAILS = [
  "yapinet360@gmail.com",
  "ustaders.proje@gmail.com",
] as const;
```

`redirectUnlessJuniorVisible` (`lib/junior/require-visibility.ts:12-16`) bu listede olmayan herkesi `/` adresine atar; API'de `404 "Bu alan kapalı."` (`:30`). Yani Junior **satılamaz** — yeni bir veli hesabı `/junior` adresini hiç göremez, kasa (`checkout`) varsayılan **kapalı** (`isJuniorCheckoutLocked`, `junior-gate.ts:66-69`). Bu bulgu ürün stratejisi kararıdır (pilot), ama "Junior ticari hazır" demek **yanlış** olur. K-03.

### 2.4 Ticari Model, Ücretli Kurslar & Defter Entegrasyonu

#### 2.4.1 Ücretsiz/ücretli ayrımı sunucuda mı? — **Evet, tek saf karar**

`resolveAcademyEntitlement` (`lib/academy/entitlement.ts:127-165`) tek karar noktası; sıra:

```
foreign-lesson → locked
admin-bypass   → unlocked
active-licence → unlocked
prep-strip     → unlocked
opening-lesson → unlocked (anonymous-preview)
licence-expired→ locked
diğer          → locked (unlicensed)
```

Kritik doğruluk: **yalnız sınav yolunun İLK dersi** ücretsiz (`isOpeningLesson`, `:91-94`); `foreign-lesson` kalkanı başka kursun anahtarını bu slug'da açmaz (`:49-57`). Ve dosyanın sonunda **derleme zamanı sözleşmesi** var: sonda kilitli ders önizleme/ilk ders olamaz (`:167-176` `throw new Error`). Bu, "yanlışlıkla her şeyi ücretsiz yapma" regresyonunu **build'de** kesiyor. Mükemmel.

#### 2.4.2 Ama satılabilir ürün **kapalı**

```
academyCourseSaleOpen("01_office_ai") → false
academyCourseSaleOpen("02_ecommerce_ai") → false
… (5 SKU'nun tamamı false)
```

(§5 `probe-sale`) Sebep: `academyCourseVoiceTextSealed` her dersin ses + metin katmanını diskte arıyor (`production-standard.ts:363-369`), `public/media/academy/` altında **8 dosya** var (`micro/` + `.gitkeep`), 5 SKU × 6-8 ders = 34 ders için ses yok. Yani `purchasable: false`, `wallet/top-up` `courseSlug` ile **400 "Kurs satışa kapalı."** dönüyor (`app/api/(kernel)/wallet/top-up/route.ts:158-160`).

Bu bir **fail-closed doğru davranış** — sahte ürün satmıyor. Ama ticari olarak "Akademi gelir üretiyor" iddiası **yanlış**.

#### 2.4.3 **Defter etiketi hatası — para sızıntısı**

Bu, `docs/CAREER_FINAL_DENETIM_RAPORU.md`'de **aynı hata sınıfının** Akademi ve Junior'da tekrar ettiğini gösteriyor.

`classifyPaymentOrderPurpose` (`lib/kernel/payments/order-purpose.ts:47-66`) yalnız şu önekleri tanır: `wallet-top-up`, `tezgah-license:pro`, `tezgah-credit:pack`, `commerce-license:monthly`, `grant-dossier`, `hibe-agency`, `career-license:yetkincv-publication`, `kurumsal-license:job-screening-pack`.

**Akademi ve Junior önekleri listede yok.** Ölçüm (§5 `probe-purpose`):

```
academy-license:01_office_ai => class: null | ledger: {"purpose":"wallet-top-up","label":"Cüzdan yükleme"} | refundBlocked: false
junior-license:yearly        => class: null | ledger: {"purpose":"wallet-top-up","label":"Cüzdan yükleme"} | refundBlocked: false
career-license:yetkincv-publication => class: CAREER_PUBLICATION | ledger: {"purpose":"career-publication",…} | refundBlocked: true
```

Üç sonuç:

1. **Defter etiketi yanlış**: `clearing.ts:152-161` `ledgerCreditLineForOrder` `null` sınıflamada `"wallet-top-up" / "Cüzdan yükleme"` döner. Akademi/Junior geliri defterde **cüzdan yüklemesi** olarak görünür → ürün bazlı gelir ölçümü imkânsız, `ops:audit-academy-ledger` yalnız `academy-purchase` DEBIT'ini sayabildiği için bu siparişleri **hiç görmez** (`scripts/ops-audit-academy-ledger.ts:47`).
2. **Karta iade kapısı açık**: `isCardRefundBlockedForOrder` (`order-purpose.ts:116-122`) `false` döner. `prisma-wallet-card-refund.ts:57-84`'teki SQL `purpose NOT IN (…)` listesinde `academy-license:%` ve `junior-license:yearly` **yok**. Yani veli/öğrenci **satın aldığı lisansın parasını karta iade talebine** konu edebilir; lisans/abonelik ise **açık kalır**. Bu, doğrudan para kaybıdır.
3. **`order_purpose` enum'u boş kalır** — `PaymentOrderPurpose` enum'unda Akademi/Junior değeri yok (`prisma/schema/kernel.prisma:21-33`, yorum satırı `:19` "Akademi ve Junior kendi `purpose` dizgisini taşır; bu enum onlar için boş kalır"). Tasarım bilinçli, ama `clearing`'in legacy etiket yolu bu bilinci **kaybetmiş**.

**Not:** Junior `juniorLicenseDebit` (`paytr-license-bridge.ts:93-101`) cüzdandan DEBIT düşüyor — yani para cüzdanda kalmıyor. Ama defterde CREDIT `wallet-top-up` etiketiyle yazıldığı için muhasebe eşleşmesi yanlış; ayrıca iade `wallet-top-up` satırını **hedef alabilir**. K-01.

#### 2.4.4 Ödeme → lisans köprüsü — **doğru kurulmuş**

| Halka | Kanıt |
|---|---|
| Niyet üretimi ödeme **öncesi** satış kapısını sorar | `academy/paytr-license-bridge.ts:20-29` |
| CLEARED sonrası köprü ikinci kez sormaz (K1) | `paytr-license-bridge.ts:80-85` |
| Fiyat mührü: katalog tutarı ≠ tahsilat → ret | `engine.ts:262-268` `sealAcademyLicenseAmount` |
| DEBIT + hazine CREDIT + purchase + lock **tek atomik birim** | `engine.ts:193-199`, `:271-288` |
| Junior aynı desen + `appliedMerchantOids` ile **replay koruması** | `junior/paytr-license-bridge.ts:90-92`, `load.ts:388-392` |
| Misafir siparişi lisans doğuramaz | `paytr-license-bridge.ts:99-102` `isOwnedPaymentOrder` |
| Webhook + cron + ops CLI **aynı** kancayı kaydeder | `verify:junior-pilot-seals` kontrolü (`scripts/verify-junior-pilot-seals.ts:55-58`) |

Bu zincir **örnek kalitede**. Tek eksik 2.4.3'teki etiket.

### 2.5 Veritabanı, RLS ve IDOR Mühürleri

| Koruma | Kanıt |
|---|---|
| Tüm Prisma tabloları FORCE RLS sicilinde | `RLS_FORCE_TABLES` 92 tablo (`rls-policy-registry.ts:28-124`), `verify:rls-status` Prisma ile **birebir** karşılaştırıyor (`verify-rls-status.ts:170-179`) |
| Sahiplik kolonları sicili (7 kolon, `guardian_user_id` dahil) | `rls-policy-registry.ts:6-14` = SQL `yetkin_rls_ownership_columns()` (`rls_user_scoped_policies.sql:39-54`) |
| PostgREST **yazma politikası yok** (yalnız SELECT) | `rls_user_scoped_policies.sql:99-100`; gate `FOR INSERT/UPDATE/DELETE` görürse kırılır (`verify-rls-status.ts:151-153`) |
| Kapsamsız tablolar fail-closed `USING (false)` | `rls_user_scoped_policies.sql:156-162` |
| Yeni tablo **otomatik** FORCE + policy | event trigger (`20260814020000_enforce_rls_all_tables.sql` + `rls_user_scoped_policies.sql:257-262`) |
| Akademi tabloları listede | `academy_audio_cache`, `academy_certificates`, `academy_courses`, `academy_exam_attempts`, `academy_exam_sittings`, `academy_exams`, `academy_exemption_seals`, `academy_lesson_completions`, `academy_purchases` |
| Junior tabloları listede | `junior_guardian_consents`, `junior_profiles`, `junior_progress`, `junior_subscriptions`, `junior_xp` |

**IDOR — uygulama katmanı (RLS'ten bağımsız, asıl savunma):**

| Yüzey | Sahiplik kontrolü | Kanıt |
|---|---|---|
| Akademi sınavı | `sitting.userId !== input.userId` → red | `exam-engine.ts:130-137` |
| Akademi müfredatı | `purchaseId` üzerinden; `purchase` oturum sahibinden çözülür | `curriculum-engine.ts:228-241` |
| Sertifika listesi | `listCertificatesForUser(user.id)` | `app/api/academy/certificates/route.ts:11` |
| Junior profil seçme/onay/silme | her yolda `where: { id, userId }` | `load.ts:253-263`, `:275-277`, `:296-300` |
| Junior ilerleme | `listProgress(userId, profileId)` **userId de** filtre | `load.ts:420-425` |
| Junior profil listesi | `where: { userId, user: juniorOwnerEmailWhere() }` — **e-posta beyaz listesi ikinci katman** | `load.ts:212-218` |
| Junior XP | `findFirst({ userId, profileId, user: … })` | `load.ts:426-430` |
| Kamu sertifika | `userId/attemptId/purchaseId` gövdeye **konmuyor** | `certificate-verify.ts:138-152` |

**Bulgu:** `verify:idor-seals` içinde Akademi IDOR testi **yok** (2.6). Yani yukarıdaki Akademi satırları **test edilmiyor** — kod doğru, kanıt yok. O-04.

### 2.6 Ürün yüzeyi — `/academy` yok (raporun çekirdeği)

| Kanıt | Sonuç |
|---|---|
| `app/academy` dizini **yok** (`Get-ChildItem app -Directory`) | Sayfa rotası yok |
| `lib/dronlar/kayit.ts:47-62` — `id: "academy"`, `path: "/academy"`, **`kapali: true`** | Oda kayıtlı ve kapalı |
| `proxy.ts:176-184` — `frozen-410` | Kenar `410 Gone` basar |
| `edge-guard.ts:176-181` `decideEdgeAction` → `isFrozenShellPagePath` | `/academy/*` tamamı 410 |
| `next.config.ts:184-188` — "`/academy` diskte yok ve kenar onu `frozen-410` ile kesiyordu" | **Kod itiraf ediyor** |
| `lib/copy/seo.ts:130-132,277,343-345` — `/academy` sitemap'te yok, robots disallow | SEO'da ölü |
| `lib/academy/storefront-cta.ts:108-222` — `/academy/${slug}`, `/academy/${slug}/oyna` üretiyor | **Ölü bağ üreticileri canlı** |

Ölçüm (§5 `probe-edge`):

```
/academy                        -> {"kind":"frozen-410"}
/academy/01_office_ai           -> {"kind":"frozen-410"}
/academy/01_office_ai/oyna      -> {"kind":"frozen-410"}
/academy/certificates           -> {"kind":"frozen-410"}
/academy/dogrula/abc            -> {"kind":"frozen-410"}
/vize                           -> {"kind":"next"}     ✅
/junior                         -> {"kind":"next"}     ✅
```

Ve API tarafı (§5 `probe-edge2`):

```
/api/academy/lesson-assistant   frozen: true  → 410
/api/academy/certificates       frozen: true  → 410
/api/academy/courses/x/exam     frozen: true  → 410
/api/junior/lessons/…           frozen: false → canlı
/api/junior/shelves             frozen: false → canlı (401 anonim)
/api/junior-pilot/profiles      frozen: true  → 410  (kasıtlı: beta)
/api/junior-pilot/checkout      frozen: true  → 410  (kasıtlı: kasa kapalı)
```

**Ve 175 rotanın 14'ü `session` olarak haritalı** (`route-auth-map.ts:7-25`) — yani kenar onları **açık varsayıyor**, gerçekte 410. `verify:api-auth --check` bu çelişkiyi **görmüyor** çünkü sözleşme "kenar ne der" değil "dosyada `auth` ne yazar" sorusunu soruyor. O-05.

**Ve `/api/v1/academy/*` hop'ları da 410** (§5 `probe-v1`): `canonicalApiPathname("/api/v1/academy/certificates/abc")` → `/api/academy/certificates/abc` → `frozen: true`. Yani native istemci (`apps/rail-is`) için yazılmış `academy-*` hop'ları (`lib/dronlar/kayit.ts:52-58`) **tamamı ölü**.

**Ne çalışıyor?** `DRON_ACADEMY_OPEN=1` (§5 `probe-open`) → `/academy` `next` olur, API `frozen: false`. Ama bu env `.env.example`'da **yok** (yalnız `DRON_JUNIOR_OPEN`, `DRON_JUNIOR_ROOM_OPEN`, `DRON_YOUNG_OPEN`, `DRON_YETKINHIBE_OPEN` var). Yani bayrak **belgesiz**; açmak için kodu okuyup `DRON_ACADEMY_OPEN` adını keşfetmek gerekir. **Ve açılsa bile `app/academy` diskte olmadığı için 404 döner.**

### 2.7 Junior yüzeyi — çalışan tek eğitim ürünü

| Özellik | Durum | Kanıt |
|---|---|---|
| Landing + ders listesi | ✅ Misafire açık | `edge-guard.ts:306-308` `canEnterJunior(null, null, {intent:"vitrine"})` → `next` |
| Ders sayfası (ücretsiz açılış) | ✅ | `app/junior/ders/[lessonKey]/page.tsx:87-89` |
| Kilitli ders önizleme yüzü (1. tema, 1 kez anlatış+test) | ✅ | `service.ts:449-455` `readJuniorPilotTrialFace`, `evaluateJuniorGuestPilotTrialTell` (`:1059-1165`) |
| 6. sınıf pilot (tek sınıf) | ✅ DB CHECK + uygulama kontrolü | `migration 20261031193000` `grade = 6`; `profile-rules.ts:122-126` |
| MEB müfredatı (5 çekirdek + 6 seçmeli) | ✅ | `limits.ts:11-27`; `verify:junior-content` |
| Ses CDN mührü | ✅ | `verify:junior-audio-cdn`, `audio-manifest.generated.ts` |
| Veli haftalık raporu | ✅ | `junior/report.ts:66-126` |
| XP/rozet (paraya çevrilmez) | ✅ | `xp-rules.ts:14-23`; `junior_xp` CHECK ≤ 20000 |
| AI koç (Selim Öğretmen) | ✅ Plan + günlük kota + ders dışı reddi | `live-tutor.ts` |

**Eksikler:** (a) iki e-postalık beyaz liste (K-03), (b) kasa kapalı (varsayılan), (c) abonelik PII'si silme akışında kalmıyor (Y-04).

---

## 3. Bulgular Tablosu

### 3.1 Kritik (K)

| ID | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **K-01** | Akademi ve Junior PayTR siparişleri defterde **"Cüzdan yükleme"** etiketiyle yazılıyor; karta iade kapısı **açık** | `order-purpose.ts:47-66` (sınıflama `null`), `:186-191` (fallback etiket), `:116-122` (`false`); `prisma-wallet-card-refund.ts:57-84` (SQL'de önek yok); §5 `probe-purpose` | **Para kaybı**: lisans parası iade edilirken lisans/abonelik açık kalır. Gelir ölçümü imkânsız. |
| **K-02** | 5 SKU'dan **4'ünde ders kapanmıyor** → müfredat tamamlanmıyor → **sınav ve sertifika hiç üretilemiyor** | `curriculum-engine.ts:342-344`; `proof-of-work.ts:192-196,208`; §5 `probe-closable` | **Ticari ölüm**: satılan 4 ürün belge üretemez; `ACADEMY_CERTIFICATE` → Kariyer vizesi zinciri kopuk. |
| **K-03** | Junior **yalnız iki sabit e-posta** ile erişilebilir; kasa varsayılan kapalı | `access.ts:7-10`; `require-visibility.ts:14-16,30`; `junior-gate.ts:66-69` | **Satılamaz ürün**: yeni veli `/junior` göremez. |
| **K-04** | `/academy` sayfası **diskte yok**, oda `kapali: true`; tüm Akademi API + v1 hop'ları **410**; buna rağmen 14 rota `session` haritalı ve `/academy/*` bağ üreticileri canlı | `lib/dronlar/kayit.ts:47-62`; `proxy.ts:176-184`; `route-auth-map.ts:7-25`; `storefront-cta.ts:108-222`; §5 `probe-edge`, `probe-edge2`, `probe-v1` | **Motor çağrılamıyor.** Sertifika doğrulama API'si, sınav API'si, oynatıcı: hepsi ölü. |
| **K-05** | `verify:idor-seals` Akademi IDOR testine işaret ediyor ama **dosya yok** → kapı **sahte yeşil**; `verify:academy-pedagogy-seals` **kırık** | `package.json` (`verify:idor-seals`, `verify:academy-pedagogy-seals`); §5 `probe-phantom`; §0 satır 9-10 | **Güvenlik kanıtı yok**: Akademi IDOR mühürlerinin hiçbiri test edilmiyor. |

### 3.2 Yüksek (Y)

| ID | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **Y-01** | Akademi sınavında **deneme tavanı yok** (`listAttemptsForUserExam` hiçbir üretim kodunda çağrılmıyor) | `prisma-store.ts:523`; `exam-engine.ts` (tavan yok); karşılaştırma `yetkincv.ts:39` | Sınırsız deneme → sınav ölçüm değeri sıfır. |
| **Y-02** | Akademi sınav/müfredat POST'larında **edge hız sınırı yok** | `matchEdgeRateLimit` (`http-rate-limit.ts:147-174`); §5 `probe-examrl` (`null`) | Müfredat saniyeler içinde POST'lanabilir; LLM/kaynak sömürüsü. |
| **Y-03** | Veli onayı **beyan**dır; veli = çocukla aynı `users` satırı; kimlik doğrulaması yok | `junior/load.ts:279` (`guardianUserId: userId`); `guardian-notice.ts:52` ("Kimlik doğrulaması değildir") | KVKK/GDPR çocuk verisi rıza standardını karşılamaz. |
| **Y-04** | Çocuk profili silindiğinde **abonelik fatura PII'si kalıyor** | `load.ts:294-328` (abonelik dokunulmuyor); `junior.prisma:113-116` | "Silme hakkı" yarım; KVKK ihlali riski. |
| **Y-05** | Sertifika `sealStatus: "revoked"` **200 OK** dönüyor (400 değil) | `app/api/academy/certificates/[hash]/route.ts:43-50` | Makine tüketicisi iptal edilmiş sertifikayı geçerli sanabilir. |
| **Y-06** | Ürün satışa **kapalı**: `academyCourseSaleOpen` 5 SKU'da `false`; sadece 8 medya dosyası var | §5 `probe-sale`; `public/media/academy/` = 8 dosya; `production-standard.ts:363-369` | Akademi gelir üretmiyor. (Fail-closed doğru davranış, ama ticari gerçek.) |

### 3.3 Orta (O)

| ID | Bulgu | Kanıt |
|---|---|---|
| **O-01** | Akademi sınav havuzunda **dağılım kapısı yok** (Junior'da var) — `01_office_ai` %76, diğer 4 SKU %97 aynı indeks | §5 `probe-pool`; `answer-shuffle.ts:117-127` (yalnız Junior); `seed.ts:70-107` |
| **O-02** | `curriculum` POST Idempotency `requestHash`'i `proof`'u kapsamıyor | `app/api/academy/courses/[id]/curriculum/route.ts:129-132` |
| **O-03** | `/vize/[id]` `generateMetadata` iptal durumunu yok sayıp `index` bırakıyor | `app/(public)/vize/[id]/page.tsx:112-122` vs `:36-40` |
| **O-04** | Akademi IDOR mühürleri (sınav sahipliği, müfredat, sertifika) **test edilmiyor** | K-05 ile aynı kök |
| **O-05** | `verify:api-auth` kenarın gerçek 410 durumunu görmüyor; "session" haritası yanıltıcı | `route-auth-map.ts:7-25`; `verify-api-auth.ts` yalnız dosya tarar |
| **O-06** | `academyCourseSaleTier`/`academyMediaSealedWavCount` gibi teşhis fonksiyonlarının üretim çağıranı yok | `production-standard.ts:386-403`; `pilot-sku.ts:411-417` |
| **O-07** | `lib/academy` 234 `.ts` dosya; `components/academy` yalnız **3**; `archived/academy` **148 test + 53 bileşen** | §5 sayım |
| **O-08** | Junior `junior_guardian_invites` tablosu silinmiş ama `20260819020000_junior_guardian_invites` migration'ı duruyor; `docs`/`verify` bunu bilmiyor | `prisma/migrations/20260822010000_drop_frozen_room_tables/migration.sql:10-11` |
| **O-09** | Junior LLM `rateLimit` penceresi `JUNIOR_TELLS_PER_DAY` ile aynı sayıyı 1 saatlik pencereye koyuyor (24 saat değil) | `service.ts:684-689` (`windowMs: 60*60*1000`), `limits.ts:221` (8/gün) |

---

## 4. 85+ / 100 İçin Geliştirme Planı

### 4.1 Faz 1 — Güvenlik, Çocuk Koruması & Sertifika Bütünlüğü (58 → 76)

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| **F1.1** | **K-01**: `PaymentOrderPurpose`'a `ACADEMY_LICENSE` + `JUNIOR_LICENSE` ekle; `LEGACY_PURPOSE`'a `"academy-license:"` önek eşlemesi ve `"junior-license:yearly"`; `ledgerCreditLineForOrder` iki yeni dal; `isActivatedProductRefundBlocked` iki kodu **iade kapalı** işaretle; `prisma-wallet-card-refund.ts` SQL `NOT IN` listesine iki önek | `lib/kernel/payments/order-purpose.ts`, `prisma/schema/kernel.prisma`, `prisma/migrations/*`, `lib/kernel/payments/prisma-wallet-card-refund.ts`, `lib/kernel/ledger/credit-purposes.ts` | `classifyPaymentOrderPurpose("academy-license:01_office_ai") === "ACADEMY_LICENSE"`; defter etiketi "Akademi lisansı"; `isCardRefundBlockedForOrder` = `true`; iade SQL'i satırı **atlar**. Test: `tests/kernel/payment-order-purpose.test.ts` + yeni `tests/kernel/academy-refund-block.test.ts`. |
| **F1.2** | **K-04**: `/academy` ürün yüzeyini geri getir **veya** odayı `kapali: true` bırakıp `verify:api-auth`'ı 410-farkında yap. Tercih: `DRON_ACADEMY_OPEN` bayrağını `.env.example`'a belgele + `app/academy/[slug]/page.tsx` (katalog kartı) ve `app/academy/[slug]/oyna/page.tsx` (oynatıcı) diskte **olmalı** | `lib/dronlar/kayit.ts`, `app/academy/**`, `.env.example`, `next.config.ts`, `lib/copy/seo.ts` | `decideEdgeAction("/academy/01_office_ai", false)` **≠** `frozen-410`; sitemap'te `/academy/01_office_ai` var; `verify:api-auth --check` 410 çelişkisini **raporlar**. |
| **F1.3** | **K-02**: 02/03/04/05 SKU'larına `LESSON_PRACTICE` tohumu ekle **veya** `isAcademyCompactArticleSku`'yu bu 4 SKU'ya genişlet. İkincisi daha hızlı: `ACADEMY_GROWTH_SKU_SLUGS`'a ekle + `isAcademyDialogueSkuSlug`'dan çıkar | `lib/academy/pilot-sku.ts:27-29`, `lib/academy/lesson-practice.ts` | `probe-closable` çıktısı **her ders** için "KAPANIR"; `completeAcademyLesson` uçtan uca sertifika üretiyor. Test: `tests/academy/curriculum-closable.test.ts` (yeni). |
| **F1.4** | **K-05**: `tests/academy/idor-exam-purchase.test.ts` ve `tests/academy/pedagogy-seals-retired.test.ts` dosyalarını **yaz** (veya script'lerden çıkar). Tercih: yaz — sınav sahipliği, yabancı sertifika, yabancı purchase, `sessionToken` başkasının | `tests/academy/**` | `npm run verify:idor-seals` **≥7 test** koşar; `verify:academy-pedagogy-seals` `EXIT=0`. |
| **F1.5** | **Y-01**: `ACADEMY_MAX_ATTEMPTS_PER_WINDOW = 3` + 30 gün; `listAttemptsForUserExam` üretimde çağrılsın | `lib/academy/exam.ts`, `exam-engine.ts` | 4. deneme `403`; test `tests/academy/exam-attempt-cap.test.ts`. |
| **F1.6** | **Y-02**: `matchEdgeRateLimit`'e Akademi sınav/müfredat POST kovası (`academyExamUser: 10/10dk`, `academyCurriculumUser: 60/10dk`) | `lib/kernel/security/http-rate-limit.ts` | `probe-examrl` `null` **değil**; test `tests/kernel/http-rate-limit.test.ts`. |
| **F1.7** | **Y-03/Y-04**: Veli gerçek kimlik doğrulaması (ayrı veli hesabı + e-posta OTP veya `guardian_user_id ≠ child_user_id`) **veya** en az: aydınlatma metninde "beyan" sınırını KVKK ekranında açık yaz + `eraseChildData`'ya `junior_subscriptions` fatura alanlarını `jinv1:redacted` yap | `lib/junior/load.ts:294-328`, `lib/junior/service.ts`, `lib/copy/junior-guardian-notice.ts` | Profil silindiğinde `invoiceTckn === "jinv1:redacted"`; test `tests/kernel/junior-erase-pii.test.ts`. |
| **F1.8** | **Y-05**: `revoked` → `400` (veya `410`) ve `Cache-Control: no-store` | `app/api/academy/certificates/[hash]/route.ts` | İptal edilmiş hash **200 dönmez**; test. |
| **F1.9** | **O-01**: Akademi cevap dağılım kapısı (Junior'daki `juniorAnswerDistributionOk` eşdeğeri) | `lib/academy/exam-pools.ts`, `verify:academy-curriculum` | Hiçbir şık >%40; `01_office_ai` dağılımı dengeli. |
| **F1.10** | **O-09**: Junior LLM `rateLimit.windowMs` → 24 saat | `lib/junior/service.ts:684-689` | 9. anlatış 1 saat sonra **da** 429. |

### 4.2 Faz 2 — Zengin Öğrenme & Ekosistem Entegrasyonu (76 → 88)

| # | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| **F2.1** | **Y-06**: 5 SKU için ses + metin mührünü tamamla (`bake:junior-*` deseniyle Akademi TTS); `academyCourseSaleOpen` → `true` | `public/media/academy/audio/**`, `lib/academy/production-seal-manifest.ts` | `probe-sale` 5 SKU'da `true`; `purchasable: true`; uçtan uca satın alma testi. |
| **F2.2** | **F1.2 devamı**: Akademi vitrin + oynatıcı + sertifika sayfası (`/academy/certificates`) UI'sını canlıya al | `app/academy/**`, `components/academy/**` | `/academy` 200; `/academy/certificates` 200; `/academy/[slug]/oyna` 200 (kilitli/kilitli olmayan). |
| **F2.3** | **K-03**: Junior'ı beyaz listeden çıkar — paket satın alan **her veli** erişsin (`JUNIOR_BETA_ALLOWLIST` yalnız beta döneminde, `isJuniorPlanActive` ile plan kapısı) | `lib/access.ts`, `lib/junior/require-visibility.ts` | Planı aktif veli `/junior` görebilir; plansız `403`; test. |
| **F2.4** | Akademi sınavını **adaptif** yap: zorluk dağılımı + yanlış konu tekrarı | `lib/academy/exam-pools*.ts`, `exam-engine.ts` | Havuz `difficulty` alanı; sınav çekimi dengeli; test. |
| **F2.5** | Akademi ders içi **canlı asistanı** vitrine bağla (misafir 3 soru / üye 5 soru zaten hazır) | `app/api/academy/lesson-assistant/route.ts`, `components/academy/**` | Oynatıcıda soru kutusu; kota görünür; test. |
| **F2.6** | Junior **veli paneli**: haftalık rapor e-posta + KVKK veri indirme/silme self-servis | `lib/junior/report.ts`, yeni `app/junior/veli/**` | Veli raporu indirebilir, profili silebilir; test. |
| **F2.7** | **O-03**: `/vize/[id]` iptal edilmiş sertifikada `robots: noindex` | `app/(public)/vize/[id]/page.tsx:112-122` | İptalde `noindex`; test. |
| **F2.8** | **O-05**: `verify:api-auth` kenar kararını da okusun (410 ↔ `auth` haritası çelişkisi) | `scripts/verify-api-auth.ts` | K-04 kapalıyken **uyarır**; çelişki listesi raporda. |
| **F2.9** | **O-02**: `curriculum` POST `requestHash`'ine `proof` ekle | `app/api/academy/courses/[id]/curriculum/route.ts:129-132` | Aynı anahtar + farklı proof → `409`; test. |
| **F2.10** | **O-08**: Yetim `junior_guardian_invites` migration'ını netleştir (yeniden kullan veya `verify`'e "drop edildi" mühürü) | `scripts/verify-junior-pilot-seals.ts` | `verify` bunu **belgeler**; kafa karışıklığı kapanır. |

---

## 5. Tekrar Üretilebilir Kanıt Komutları

Aşağıdaki tüm komutlar bu oturumda **birebir çalıştırıldı**. Çıktılar §0 ve §2'de alıntılandı.

### 5.1 Doğrulama kapıları

```bash
npx tsc --noEmit
npm run verify:sen-axis
npm run verify:boundaries
npm run verify:api-auth -- --check
npm run verify:rls-status
npx tsx scripts/verify-rls-status.ts --live      # DATABASE_URL yoksa SKIP
npm run verify:no-secrets
npm run verify:idor-seals
npm run verify:junior-pilot-seals
npm run verify:junior-guardianship-seals
npm run verify:academy-curriculum
npm run verify:junior-content
npm run verify:academy-pedagogy-seals            # ❌ FAIL (dosya yok)
npx vitest run tests/junior                      # 25 test
npx vitest run tests/academy                     # ❌ dizin yok
npx vitest run                                   # 415 dosya / 2393 test
```

### 5.2 K-01 — Defter etiketi ve iade kapısı

```bash
npx tsx -e '
import { classifyPaymentOrderPurpose, ledgerCreditLineForOrder, isCardRefundBlockedForOrder } from "./lib/kernel/payments/order-purpose";
for (const p of ["academy-license:01_office_ai","junior-license:yearly","career-license:yetkincv-publication"]) {
  console.log(p, "=>", classifyPaymentOrderPurpose(p), JSON.stringify(ledgerCreditLineForOrder({purpose:p, merchantOid:"MO1"})), "refundBlocked:", isCardRefundBlockedForOrder({purpose:p}));
}'
```

**Beklenen çıktı (bu oturumda alındı):**
```
academy-license:01_office_ai => null {"purpose":"wallet-top-up","label":"Cüzdan yükleme",...} refundBlocked: false
junior-license:yearly        => null {"purpose":"wallet-top-up","label":"Cüzdan yükleme",...} refundBlocked: false
career-license:yetkincv-publication => CAREER_PUBLICATION {"purpose":"career-publication",...} refundBlocked: true
```

### 5.3 K-02 — Ders kapanabilirliği

```bash
npx tsx -e '
import { academyInteractiveTaskByKey, academyCanonicalProofSubmission, evaluateAcademyProofSubmission } from "./lib/academy/proof-of-work";
import { isAcademyCompactLessonKey } from "./lib/academy/pilot-sku";
import { curriculumExamPathKeys } from "./lib/kernel/catalog-ids/exam-path";
for (const slug of ["01_office_ai","02_ecommerce_ai","03_social_media_ai","04_chatbot_nocode","05_prompt_practice"]) {
  for (const k of curriculumExamPathKeys(slug)) {
    const compact = isAcademyCompactLessonKey(k);
    const canon = academyCanonicalProofSubmission(k);
    console.log(slug, k, compact ? "compact-read" : (canon ? "kanonik" : "KAPANMAZ"));
  }
}'
```

**Beklenen:** `02/03/04/05` SKU'larında **her ders** `KAPANMAZ`.

### 5.4 K-03 — Junior erişim beyaz listesi

```bash
rg -n 'JUNIOR_ALLOWED_EMAILS = \[' -A 3 lib/access.ts
rg -n 'redirect\("/"\)' -B 3 lib/junior/require-visibility.ts
rg -n 'JUNIOR_BETA_ALLOWLIST_ENV' lib/kernel/security/junior-gate.ts
```

### 5.5 K-04 — `/academy` 410 + API donması

```bash
npx tsx -e '
import { decideEdgeAction } from "./lib/kernel/security/edge-guard";
import { isFrozenRoomApi } from "./lib/kernel/security/edge-api-auth";
for (const p of ["/academy","/academy/01_office_ai","/academy/01_office_ai/oyna","/academy/certificates","/junior","/vize","/career"])
  console.log(p.padEnd(34), JSON.stringify(decideEdgeAction(p, false)));
for (const p of ["/api/academy/catalog","/api/academy/certificates","/api/academy/courses/x/exam","/api/junior/lessons/x"])
  console.log(p.padEnd(34), "frozen:", isFrozenRoomApi(p));'

rg -n 'id: "academy"' -A 16 lib/dronlar/kayit.ts
rg -n 'source: "/academy"' -B 6 next.config.ts
```

**Beklenen:** `/academy*` → `frozen-410`; `/api/academy/*` → `frozen: true`; `/vize`, `/junior`, `/career` → `next`.

### 5.6 K-05 — Hayalet test kapıları

```bash
npx tsx -e '
import { readFileSync, existsSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json","utf8"));
for (const [n,c] of Object.entries(pkg.scripts)) {
  const re = /\b(tests\/[\w./\[\]-]+\.(?:test\.ts|spec\.ts))/g; let m;
  while ((m = re.exec(c))) if (!existsSync(m[1])) console.log(n, "->", m[1], "(YOK)");
}'
```

**Beklenen:**
```
verify:idor-seals -> tests/academy/idor-exam-purchase.test.ts (YOK)
verify:academy-pedagogy-seals -> tests/academy/pedagogy-seals-retired.test.ts (YOK)
```

### 5.7 Y-01 / Y-06 / O-01 — Sınav tavanı, satış kapısı, cevap dağılımı

```bash
rg -n 'listAttemptsForUserExam' --glob '!node_modules' --glob '!archived'   # yalnız store + test

npx tsx -e '
import { academyCourseSaleOpen } from "./lib/academy/pilot-sku";
for (const s of ["01_office_ai","02_ecommerce_ai","03_social_media_ai","04_chatbot_nocode","05_prompt_practice"])
  console.log(s, academyCourseSaleOpen(s));'                       # hepsi false

npx tsx -e '
import { academyExamPoolForSlug } from "./lib/academy/exam-pools";
for (const s of ["01_office_ai","02_ecommerce_ai","03_social_media_ai","04_chatbot_nocode","05_prompt_practice"]) {
  const p = academyExamPoolForSlug(s); const d=[0,0,0,0];
  for (const q of p) d[q.correctIndex]=(d[q.correctIndex]??0)+1;
  console.log(s, p.length, JSON.stringify(d)); }'                  # [3,32,7,0] / [1,29,0,0] …

Get-ChildItem -Recurse public\media\academy -File | Measure-Object    # 8
```

### 5.8 Y-02 — Sınav hız sınırı

```bash
npx tsx -e '
import { matchEdgeRateLimit } from "./lib/kernel/security/http-rate-limit";
for (const m of ["GET","POST"]) console.log(m, "/api/academy/courses/c1/exam ->", JSON.stringify(matchEdgeRateLimit("/api/academy/courses/c1/exam", m)));'
```

**Beklenen:** her ikisi de `null`.

### 5.9 K-02 ticari sonuç zinciri (kod okuma)

```bash
rg -n 'Sınav kapısı müfredat tamamlanınca açılır' lib/academy/curriculum-engine.ts
rg -n 'İş kanıtı olmadan ders kapanmaz' lib/academy/curriculum-engine.ts
rg -n 'assertAcademyCurriculumComplete' lib/academy/exam-engine.ts
```

### 5.10 Sertifika iptal zinciri

```bash
rg -n 'if \(row.revokedAt\)|revokedAt: null' lib/kernel/proof/prisma-read.ts
rg -n 'if \(!proof\) continue|bindLivePassportStamps' lib/kernel/passport/live.ts
rg -n 'liveAcademyListingStamps|getSealedProof' lib/career/visa-gate.ts
rg -n 'certificate_revoke|writeSuperAdminAudit' 'app/api/(kernel)/admin/ops/certificate-revoke/route.ts'
```

---

## Ek A — Puan Kartı Gerekçe Tablosu

| Boyut | Ağırlık | Puan | En güçlü kanıt (+) | En ağır kanıt (−) |
|---|---|---|---|---|
| Mimari | 25 | **19** | `verify:boundaries` yeşil; saf `resolveAcademyEntitlement`; HMAC sınav jetonu; `server-only` disiplini; port/adapter (`AcademyStore`, `ProofReadPort`) | `/academy` diskte yok; `lib/academy` 234 dosya vs `components/academy` 3; `archived/academy` 148 test |
| İşlevsellik | 30 | **14** | Sınav oturumu + JTI + permütasyon + süre cezası kusursuz; sertifika hash'i yeniden hesaplanıyor; iptal filtresi çalışıyor | 4/5 SKU ders kapanmıyor → sınav yok; deneme tavanı yok; hız sınırı yok; AI asistanı 410 |
| Ticari | 25 | **11** | `ACADEMY_CERTIFICATE` → Kariyer vizesi → ilan teklifi zinciri **gerçekten** bağlı; PayTR köprüsü örnek kalitede; Pathway mastery | Defter etiketi "Cüzdan yükleme"; iade kapısı açık; satış kapalı; Junior 2 e-posta |
| UX/Vitrin | 20 | **14** | Junior vitrini dürüst (pilot çizgisi, "Yakında", yanıltıcı raf yok, dış bağlantı/reklam yok); `/vize` canlı ve temiz | Akademi vitrini yok; `/academy/*` üreten ölü bağlar canlı; `/vize` iptal metadata'sı `index` |

**Toplam: 58 / 100.**

---

## Ek B — Raporun tek paragraflık özü

Yetkin.ai'nin eğitim ekosistemi, **motoru ürününden büyük** bir sistem. `lib/academy` 234 dosyayla sınav, sertifika, iş kanıtı, seviye yolu ve medya mührünü gerçekten kurmuş; HMAC imzalı tek kullanımlık sınav oturumu, SHA-256 kapsamlı sertifika, append-only veli onayı ve üç katmanlı AI kalkanı **örnek nitelikte**. Junior tarafı ise hem pedagojik hem hukuki açıdan dikkatli: veli onayı sürümlü ve mühürlü, ses saklanmıyor, e-posta toplanmıyor, çıkış bağlantısı yok, AI misafire hiç açılmıyor. Buna karşılık ürün yüzeyi çökmüş durumda: `/academy` diskte yok ve kenar 410 basıyor, dolayısıyla 175 rotanın 14'ü, yedi v1 hop'u ve sertifika doğrulama API'si **çağrılamıyor**; beş SKU'dan dördünde ders kapanmadığı için sertifika hiç üretilemiyor; Akademi ve Junior ödemeleri defterde "cüzdan yükleme" olarak yazılıp karta iadeye açık kalıyor. Bu üç kusur (K-01, K-02, K-04) kapatıldığında sistem 76'ya, vitrin + medya mührü + Junior'ın beyaz listeden çıkarılması (Faz 2) tamamlandığında 88'e çıkar. Kalan 12 puan, ölçülemeyen tek şeyden geliyor: **gerçek öğrenci**. Bu kod tabanı o öğrenciyi henüz hiç görmedi.
