# AKADEMİ MODÜLÜ TEDAVİ RAPORU

| Alan | Değer |
|------|--------|
| Tarih | 9 Eylül 2026 |
| Kaynak sicil | `docs/Academy_Tespit_Raporu.md` |
| Tedavi kapsamı | Vitrin dürüstlük kilidi · sınav MAC üretim yedek · SMTP skip kilidi · Faz 0 runbook |
| Kod zemini | `lib/academy/purchase-path.ts` · `lib/copy/sen-voice/academy.ts` · `lib/academy/exam-sitting.ts` · `lib/kernel/notice/academy-receipt-mail.ts` · `.system_docs/OPS_RUNBOOK.md` |
| Üslup | Tarafsız. Yeşil boyama yok. |

---

## 1. YAPILAN KONTROLLER

### 1.1 Vitrin ve pazarlama dürüstlüğü

Tespit raporu §4.1 ve §5.5: dört compact SKU’yu “sesli akademi” diye satmak yalan; kanon 13’ü vitrine “yayında” yazmak yalan.

| Yüzey | Önce | Tedavi |
|-------|------|--------|
| Amiral `01_office_ai` kasa özeti / antre hero / kart ipucu | “Sesli anlatım + kayan metin; Prompt Box…” | **Sesli Anlatım + Kayan Metin (Karaoke) + Sınav + Mühürlü Sertifika** |
| `02`–`05` kasa özeti / antre hero / kart ipucu | “Yazılı compact dersler. Sertifika test barajından…” | **Yazılı Compact Dersler + Uygulamalı Senaryolar + Sınav + Mühürlü Sertifika** |
| Kısa kart rozeti | Amiral: “Sesli anlatım”. Diğer: “Makale / Pratik” | Amiral aynı kısa rozet (layout). Diğer: **Yazılı compact**. Tam vaad `title` / `aria` / hero’da. |
| Katalog açıklaması | Amiral sesli; diğer SKU yazılı. 13 sayısı yoktu. | “Vitrin beş yayında eğitimdir.” kilidi eklendi. |
| SEO (`PAGE_SEO.academy`) | “Akademi kataloğu canlı müfredat taşır.” | “yalnız yayın müfredatını satar.” 13 eğitim cümlesi yok. |
| Varsayılan kasa özeti (slug yok) | Mühürlü ses cümlesi (yanlış zemin) | Yazılı compact — fail-closed dürüstlük. Ses yalnız `academyCourseHasSealedAudio`. |

Kanon 13 SKU kimlik sicilinde durur; vitrin `ACADEMY_GROWTH_SKU_SLUGS` (5) ile kilitli kalır. Test: `tests/academy/storefront-vitrine.test.ts` — “13 eğitim” / “Sesli Akademi” yok.

Canlı izlemede TTS oluşturma kapalı durur (`generateSpeech` / `listen` → 410). Mühürsüz ses bake edilmez. Bu tedavi TTS fırını açmaz.

### 1.2 Sınav MAC — `ACADEMY_EXAM_SITTING_SECRET`

Tespit A2: üretimde dedicated secret <16 → sınav **503**, site ayakta, mühür doğmaz.

Tedavi — anahtar sırası (`resolveAcademyExamSittingMacKey`):

1. Dedicated `ACADEMY_EXAM_SITTING_SECRET` ≥16 karakter → olduğu gibi.
2. Dedicated yok/kısa **ve** `SUPABASE_JWT_SECRET` ≥16 → domain-ayrılmış HMAC derive (`mac.derive.v1`). Public lab dizesi üretimde kullanılmaz. Sınav 503’e düşmez.
3. Lab / Vitest (`NODE_ENV≠production` veya `VITEST=true`) → eski kod yedek sırrı.
4. Canlı süreçte ikisi de yoksa → `ServiceUnavailableError` (503). Son kapı.

Health `checks.examSitting` hâlâ dedicated secret varlığını raporlar (dürüst ops sinyali). Production boot uyarısı JWT fallback’i anlatır; health 503 değildir. `ops:runtime-readiness` Gün 0 uyarısı basar, süreç bloğu değildir.

### 1.3 Makbuz SMTP — `academy-receipt-mail.ts`

Tespit A3 / E5: SMTP boşken satın alma kırılmamalıydı. Kod zaten `readNoticeMailConfig() === null` iken skip ediyordu.

Kilit sıkılaştırıldı:

- Log `reason: "SMTP skipped"` (`ACADEMY_RECEIPT_SMTP_SKIPPED_REASON`).
- Satın alma rotası kuyruk/doğrudan gönderim hatalarını yakalar; SETTLED durur.
- `sendNoticeSmtp` boş host/from ile soket açmaz (`smtp_unconfigured` throw; çağıran bu yola inmez).

SMTP taşıma hatası (timeout) hâlâ throw eder → Inngest retry. Boş env ≠ taşıma hatası.

### 1.4 Runbook

`.system_docs/OPS_RUNBOOK.md` §13.1: **Faz 0: Akademi Canlı T3 Testi Prosedürü** — PayTR canlı callback → CLEARED yükleme → `01_office_ai` SETTLED → 6 mühür + sınav ≥70 → anonim `/academy/dogrula/[hash]`.

Env tablosuna `ACADEMY_EXAM_SITTING_SECRET` eklendi. İlk bağlama sırasına madde 9 (sınav secret) girdi.

---

## 2. GÜNCELLENEN DOSYALAR

| Dosya | Ne değişti |
|-------|------------|
| `lib/academy/purchase-path.ts` | Dürüstlük SSOT; 01 mühürlü, 02–05 yazılı; varsayılan yazılı |
| `lib/copy/sen-voice/academy.ts` | Hero / hint / açıklama / infoBand |
| `lib/copy/seo.ts` | Vitrin SEO — yayın müfredatı, 13 yok |
| `lib/academy/exam-sitting.ts` | JWT derive fallback; lab yedek; son kapı 503 |
| `lib/kernel/notice/academy-receipt-mail.ts` | `SMTP skipped` |
| `lib/kernel/notice/smtp.ts` | Boş host soket açmaz |
| `lib/kernel/jobs/runtime-readiness.ts` | Gün 0 exam + SMTP metni |
| `instrumentation.ts` | Exam sitting boot uyarısı |
| `.env.example` | Dedicated + JWT derive notu |
| `.system_docs/OPS_RUNBOOK.md` | Env satırı, bağlama 9–10, §13.1 Faz 0 |
| Testler | citizen-surface, enrolment-cta, exam-sitting, academy-receipt, storefront-vitrine, course-seed-surface, faz1-operating-picture |

---

## 3. SEN OLSAYDIN NE YAPARDIN?

### 3.1 Bu tedaviden sonra Akademi ilk müşteriyi ve reklamı karşılamaya hazır mı?

**Teknik/içerik yüzeyi (Katman 1, dürüst vaad):** Evet, vitrin yalanı kilitlendi. Amiral ses + karaoke; diğer dört SKU yazılı compact + senaryo + sınav + mühür. 13 eğitim yayında denmez. SMTP boşken kasa çökmez. Sınav, JWT veya dedicated secret varken 503’e düşmez.

**Satışa / reklama %100 hazır:** Hayır. Tespit raporu hükmü durur: kod boru hattı laboratuvarda uçtan uca kuruludur; canlı nakit tanığı (PayTR CLEARED → SETTLED → GRADED → HASH) yeşil olmadan performans reklamı açılmaz. Bu bir içerik eksiği değil, **ops kilididir**. SMTP hâlâ Gün 0 tavsiyesidir (makbuz chargeback dosyasıdır) ama satın almayı durdurmaz.

Dürüst cümle: **vitrin ve kasa dili satışa hazır; canlı kasa tanığı olmadan reklam hazır değildir.**

### 3.2 SUPER ADMIN’in canlının tuşuna basmadan önce atması gereken TEK adım

**PayTR canlı merchant’ı bağlayıp Faz 0 T3 nakit halkasını bir kez yeşile boyamak.**

Somut sıra (runbook §13.1, atlanamaz):

1. Canlı merchant üçlüsü + Bildirim URL `https://yetkin.ai/api/paytr/callback`
2. Gerçek kartla küçük tutar → `PaymentOrder=CLEARED`
3. Aynı hesapla `01_office_ai` → `SETTLED`
4. 6 okuma mührü + sınav ≥70
5. Anonim sekmede `/academy/dogrula/[hash]` → `sealStatus=valid`

Bu beşlinin ilki ve taşıyıcısı nakit halkasıdır. Dedicated `ACADEMY_EXAM_SITTING_SECRET` (≥16) ve SMTP çifti aynı pencerede yazılmalıdır; JWT fallback ve `SMTP skipped` onları **erteleme bahanesi** yapmaz, çöküş kalkanıdır.

Faz 0 yeşil değilse site vitrindir. Tuş basılmaz.
