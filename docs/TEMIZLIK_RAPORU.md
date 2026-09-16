# TEMİZLİK RAPORU — atıl / geçici / boş dosya hijyeni

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | SUPER ADMIN hijyen operasyonu. Canlı müfredat, mühürlü kaset ve fırın SSOT’una dokunulmadı. |
| Dal | `main` |
| İlkeler | Sıfır Risk · Kör silme yok · `archived/` ve `yetkin_muze/` müze; `docs/curriculum/` bake SSOT |

**Tek cümle:** Kökteki kaset word-count dökümü, `.tmp` sinema-masa probe HTML/JS artıkları, boş Supabase CLI kalıntısı ve yayına girmemiş beş academy deneme bileşeni silindi; build/test kırığı yok.

---

## Yönetici özeti

| Ölçüt | Sonuç |
|-------|--------|
| Silinen dosya | **13** (5 git izli bileşen + 1 boş izli kalıntı + 7 yerel/izsiz geçici) |
| Kurtarılan alan | **314.032 bayt** (~307 KB) |
| Korunan | `docs/curriculum/` cue/script/iskelet · `media-bake/` WAV önbelleği · freelancer dondurulmuş stub’lar · test helper’ları |
| Doğrulama | `vitest` academy yüzey + `npm run build` |

---

## ADIM 1 — Geçici ve fırın artığı

### Silinen

| Dosya | Boyut | Neden |
|-------|------:|-------|
| `.tmp-l6-wc.txt` | 6.252 | 6. ders konuşma metninin word-count dökümü. Canlı SSOT: `lib/academy/spoken-scripts/01_office_ai-6.md`. İzsiz. |
| `.tmp/office-win-fit-check.mjs` | 11.533 | Sinema masası 16:9 uyum probe’si. Canlı kod: `lib/academy/office-win-fit.ts`. |
| `.tmp/office-win-fit.html` | 144.079 | Aynı probe’un HTML çıktısı. |
| `.tmp/word-overflow-check.mjs` | 5.520 | Word masası taşma probe’si (Playwright). |
| `.tmp/word-overflow.html` | 122.897 | Aynı probe’un HTML çıktısı. |
| `.tmp/write-word-overflow-html.mjs` | 3.662 | Probe HTML yazıcı. |
| `.tmp/write-word-overflow-public.mjs` | 3.940 | Probe’u `public/` altına basma denemesi; yayında kopya yok. |

`.tmp/` zaten gitignore. Kök `.tmp-*.txt` / `tmp-*.txt` bu operasyonda gitignore’a eklendi (saha probe kalkanı).

### Korunan (fırın SSOT / maliyet)

| Yol | Neden korunur |
|-----|----------------|
| `docs/curriculum/01_office_ai_*_cue.json` | Bake zaman SSOT (el kitabı + generate script). |
| `docs/curriculum/01_office_ai_*_script.md` | Mühür paketi konuşma taslağı. |
| `docs/curriculum/01_office_ai_*_exam.json` | Mini sınav fırın paketi. |
| `docs/curriculum/01_office_ai_g1_doygun_iskelet.md` | G1 konuşma kaynağı (spoken-script başlığı). |
| `docs/curriculum/01_office_ai_w1_doygun_iskelet.md` | W1 konuşma kaynağı. |
| `docs/curriculum/01_office_ai_k1_script.md` | K1 bake SOP. |
| `media-bake/` | Gitignore WAV önbelleği. TTS maliyeti; mühürlü MP3 `public/media/academy/audio/`. |

Eksik fırın taslakları (`06_script.md`, `06_exam.json`, g1/w1 tam script, `k1_exam.json`) bu raporda **üretilmedi**. Tespit belgesi T13 hâlâ geçerli; bu operasyon yalnız artığı siler.

---

## ADIM 2 — Boş ve yetim

### Boş

| Dosya | Boyut | Neden |
|-------|------:|-------|
| `supabase/.temp/cli-latest` | 0 | Supabase CLI kalıntısı. `supabase/.temp/` gitignore’da; yine de izleniyordu. |

Başka 0 baytlık izli dosya yok.

### Yetim academy deneme bileşenleri (hiçbir canlı `import` yok)

| Dosya | Boyut | Kanıt |
|-------|------:|-------|
| `components/academy/academy-practice-panel.tsx` | 7.506 | Kendi yorumu: «Canlı oynatıcıya bağlı değil». `LESSON_PRACTICE` boş. Arşiv stüdyo göreli kopya arıyordu. |
| `components/academy/pilot-path.tsx` | 1.110 | Vitrinden sökülmüş. Surface testleri `AcademyPilotPath` **bulunmasın** der. |
| `components/academy/lesson-syntax-code.tsx` | 1.592 | Kod lab arşivde. `tokenizeAcademySyntax` lib + test durur. |
| `components/academy/lesson-teleprompter.tsx` | 3.931 | Karaoke şeridi ile değiştirildi. Oynatıcı testleri `<LessonTeleprompter` **yok** der. |
| `components/academy/lesson-dialogue-transcript.tsx` | 2.010 | Aynı. Oynatıcı `LessonDialogueTranscript` **yok** der. |

### Bilinçli olarak silinmeyen yetimler

Freelancer dondurulmuş stub’lar (`squad-create-button`, `direct-job-offer-modal`, `direct-offer-inbox` vb.) surface testlerinin `readSrc` listesinde durur; ürün dondurma sicilidir, geçici deneme değildir.

`tests/helpers/memory-*` arşiv oda testleri tarafından import edilir; mock atıl değildir.

`archived/` taranmadı ve silinmedi.

---

## ADIM 3 — Doğrulama

| Komut | Sonuç |
|-------|--------|
| Academy yüzey / karaoke / sözdizimi vitest (8 dosya) | **6 geçti.** Silinen bileşenlere bağlı iddialar (`AcademyPilotPath` yok, `<LessonTeleprompter` yok, `LessonDialogueTranscript` yok) duruyor. |
| `npm run build` | **Geçti.** `verify:prebuild` (no-secrets, amount-minor, RLS, v1, IDOR) + Next 16.3.1 compile 35.3s + TypeScript 28.1s + 71 sayfa. |

Bu temizlikle **ilgisiz** (önceden kırık) iki surface iddiası: `course-seed-surface` hâlâ `ac_02_ecommerce_ai` INSERT bekler; `curriculum-player-surface` hâlâ `academy-player-widescreen` class’ı bekler. Oynatıcı ve tohum SQL’i bu PR’da değişmedi.

---

## Git

| Alan | Değer |
|------|--------|
| Dal | `main` |
| Mesaj | `chore(repo): drop leftover cassette dumps and unpublished academy trial components` |
