# Tedavi Raporu 06 — Junior sahne tabanı ve kilit uyarısı

Tarih: 2026-11-01
Kapsam: Dar ekranda sahne tuvalinin 0px'e inmesi; kilitli 2. ve sonraki konuda belirsiz geçiş.

> Bu turda tarayıcı açılmadı, cihaz ölçülmedi. Düzeltme kaynak, `tsc`, eslint, vitest ve dört `verify` kapısıyla doğrulandı. Piksel değerleri CSS aritmetiğidir: `11.25rem` = 180px, `13.75rem` = 220px.

---

## Özet

| Soru | Cevap |
|---|---|
| Sahne neden kayboluyordu? | `data-junior-stage-canvas` `min-height: 0` idi. Kabuğun `max-height` bütçesi daralınca flex çocuk 0px'e iniyor, `overflow: hidden` yalnız altyazıyı bırakıyordu. |
| Ne değişti? | Tuval tabanı `clamp(11.25rem, 28dvh, 13.75rem)`. Kabuk bu tabanın altına ezilmez; bütçe yetmezse sayfa kayar. |
| Kilit uyarısı nerede? | Ders sayfasında `data-junior-lock-notice`. Metin `juniorLessonLockNotice` → `juniorLessonGate` → `juniorPlanCoversLesson` + `canEnterJunior`. |
| `ustaders.proje@gmail.com` | E-posta özel dal değil. Aktif paket çekirdek 2. konuyu açar. Paket açık ve seçmeli kota boşsa mühürlü seçmelinin 2. konusu «Sonraki dersler için paketinize seçmeli ders olarak ekleyin.» der. |

---

## ADIM 1 — Sahne tuvali tabanı

`app/globals.css`

| Değişken | Önce | Sonra |
|---|---|---|
| `--player-chrome-min` | `9.5rem` | `14rem` (başlık, altyazı, kontrol) |
| `--player-stage-min` | `7.5rem` | `clamp(11.25rem, 28dvh, 13.75rem)` |
| Kabuk `min-height` | `min(taban, bütçe)` — bütçe 0 olunca taban da 0 | `max(taban, min(52dvh, bütçe))` |
| Kabuk `max-height` | bütçe (tuvali eziyordu) | `none` |
| `[data-junior-stage-canvas]` | `min-height: 0` | `min-height: var(--player-stage-min)` ve `flex-shrink: 0` |
| `[data-junior-cinema-board]` | yoktu | `min-height: calc(var(--player-stage-min) + 1.75rem)` |

`JuniorPilotPlayer` tuval sınıfı `min-h-[180px]`. Asıl taban CSS değişkenidir; sınıf, kural düşerse 180px yedektir. `sm` ve üstünde kabuk tabanı `min(48rem, bütçe)` ile aynı `max()` sarmalındadır.

Dar yükseklikte kabuk en az krom + sahne kadar durur. `listen-and-tell` dış kutusu `overflow-visible` oldu; taşan sahne kesilmez, kabuk kaydırıcısı (`overflow-y-auto`) devreye girer. Tuvalin kendi `overflow: hidden` ve `container-type: size` sözleşmesi durur. Mutlak sahne katmanları (`min-height: 0`, `inset-0`) ebeveyne oturmaya devam eder.

---

## ADIM 2 — Kilit / paket uyarısı

`juniorLessonLockNotice` (`lib/junior/enter.ts`) kapıdan okur:

| Kim | Ders | Sonuç |
|---|---|---|
| Misafir | ücretsiz 1. konu | uyarı yok |
| Misafir | kilitli 2. konu | `login` — veli girişi + yıllık paket |
| Aktif paket | çekirdek 2. konu (`jr_06_mat-2` dahil) | `planCovers` doğru, uyarı yok, ders açılır |
| Aktif paket, kota boş | mühürlü seçmeli 2. konu | `elective` — «Sonraki dersler için paketinize seçmeli ders olarak ekleyin.» |
| Aktif paket, ders seçili | aynı seçmeli 2. konu | uyarı yok |
| Aktif paket | henüz mühürsüz seçmeli | «Paketinde açılmaz; hazır olunca açılır.» |
| Aktif paket | fiyat dışı `jr_06_ing-2` | paket vaadine girmez |
| Denetim aktörü | kilitli konu | `canEnterJunior` `audit` ile açar, uyarı yok |

Ders sayfası bu sonucu `role="status"` ve `data-junior-lock-notice` ile basar. Deneme yüzü (`jr_06_mat-2/3`) açıkken de uyarı durur; önceki kod `trialFace` varken kilit bölümünü gizliyordu. Seçmeli uyarı `/junior#secmeli` ile seçmeli rafa gider.

Raf kartındaki paket penceresinin başlığı «Bu konu kilitli» oldu. İlk cümle: ikinci ve sonraki dersler yıllık paketle açılır.

---

## ADIM 3 — Kapılar

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | temiz |
| eslint (değişen dosyalar) | temiz |
| `npx vitest run` | 1967 geçti, 11 kaldı. 10 tanesi akademi süre mührü (`01_office_ai` timings); bu görevden önce de kırıktı. `tests/junior/quiz-export-guard.test.ts` tam süitte 5 sn zaman aşımına düştü; tek başına 921 ms'de geçti. |
| `verify:junior-content` | OK |
| `verify:junior-sync` | OK |
| `verify:junior-visual-ops` | OK |
| `verify:boundaries` | OK |

Kapı testleri: `tests/kernel/junior-stage-containment.test.ts`, `tests/kernel/junior-elective-seal-gate.test.ts` (kilit uyarısı), `tests/kernel/junior-player-clock.test.ts`.
