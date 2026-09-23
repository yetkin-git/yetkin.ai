# 01_office_ai — Genel ses fırın raporu

| Alan | Değer |
|------|--------|
| Tarih | 23 Eylül 2026, 09:30–10:32 TSİ |
| Anahtar | `.env.local` `GEMINI_API_KEY` |
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Bayraklar | `--seal --confirm-gemini-spend --force --no-db --no-fallback` |
| Sonuç | **Dokuz kaset birincil modelle mühürlendi.** Çıkış kodu 0. |

Kuru tarama geçti. Allowlist’teki sekiz ders ve hazırlık şeridi baştan sentezlendi. Eski ritüel kaseti `01_office_ai-4` allowlist’te yok; bu turda sentezlenmedi (493.8 sn yerinde kaldı).

Fırın kapısı üç derste konuşma metni ile altyazıyı ayrışmış buldu. Altyazı, güncel konuşma metninin ekran yazımına çekildi; sonra ses basıldı.

| Anahtar | Hizalanan paragraflar |
|---------|------------------------|
| `01_office_ai-1` | 3, 8, 9 |
| `01_office_ai-k1` | 3, 12, 13, 14 |
| `01_office_ai-5` | 13 |

---

## 1. Fırın

| Anahtar | Paragraf | İstek | Saniye | Dakika | Yuvarlak sn | Cue sonu | cacheV | Model |
|---------|----------|-------|--------|--------|-------------|----------|--------|--------|
| `01_office_ai-0` | 8 | 8 | 255.8 | 4.26 | — | 255.8 | 255800 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-1` | 15 | 16 | 688.68 | 11.5 | 689 | 688.68 | 688680 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-k1` | 14 | 15 | 642.16 | 10.7 | 642 | 642.16 | 642160 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-2` | 14 | 14 | 517.24 | 8.6 | 517 | 517.24 | 517240 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-3` | 14 | 14 | 541.92 | 9.0 | 542 | 541.92 | 541920 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-5` | 14 | 14 | 553 | 9.2 | 553 | 553 | 553000 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-g1` | 18 | 18 | 568.16 | 9.5 | 568 | 568.16 | 568160 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-w1` | 19 | 19 | 563.36 | 9.4 | 563 | 563.36 | 563360 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-6` | 18 | 18 | 505.6 | 8.4 | 506 | 505.6 | 505600 | `gemini-3.1-flash-tts-preview` |

Cue `start`/`end` ve `lesson-audio-timings` son perde, WAV süresiyle kilitlendi. Numaralı sekiz ders 420–720 sn bandının içinde. Hazırlık şeridi bu banda girmez.

Sekiz ders toplamı **4580.12 sn ≈ 76.34 dk**. Hazırlık şeridi (255.8 sn) ve `01_office_ai-4` (493.8 sn) toplama girmez.

`ACADEMY_SEALED_AUDIO_DURATION_SEC` ve `targetDurationMinutes` bu tabloya çekildi.

---

## 2. Dosyalar

| Dosya | Bayt | Damga |
|-------|------|--------|
| `media-bake/academy/audio/01_office_ai/01_office_ai-0.wav` | 24 556 844 | 23 Eylül 2026, 10:32 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-0.mp3` | 6 140 781 | 23 Eylül 2026, 10:32 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-1.wav` | 66 113 324 | 23 Eylül 2026, 09:38 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-1.mp3` | 16 529 517 | 23 Eylül 2026, 09:39 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-k1.wav` | 61 647 404 | 23 Eylül 2026, 09:46 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3` | 15 413 229 | 23 Eylül 2026, 09:46 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-2.wav` | 49 655 084 | 23 Eylül 2026, 09:53 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-2.mp3` | 12 415 149 | 23 Eylül 2026, 09:53 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-3.wav` | 52 024 364 | 23 Eylül 2026, 09:59 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-3.mp3` | 13 007 277 | 23 Eylül 2026, 09:59 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-5.wav` | 53 088 044 | 23 Eylül 2026, 10:06 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-5.mp3` | 13 273 389 | 23 Eylül 2026, 10:06 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-g1.wav` | 54 543 404 | 23 Eylül 2026, 10:14 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-g1.mp3` | 13 637 421 | 23 Eylül 2026, 10:14 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-w1.wav` | 54 082 604 | 23 Eylül 2026, 10:21 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3` | 13 522 221 | 23 Eylül 2026, 10:21 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-6.wav` | 48 537 644 | 23 Eylül 2026, 10:28 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-6.mp3` | 12 135 789 | 23 Eylül 2026, 10:28 TSİ |

Zaman JSON: `lib/academy/lesson-audio-timings/01_office_ai-{0,1,k1,2,3,5,g1,w1,6}.json`

Cue JSON: `lib/academy/lesson-cues/01_office_ai-{0,1,k1,2,3,5,g1,w1,6}.json`

Curriculum kopyası: `docs/curriculum/01_office_ai_{00,01,k1,02,03,05,g1,w1,06}_cue.json`

---

## 3. Hüküm

Fırın tamam. Dokuz kaset birincil modelde. Cue ve zaman JSON yeni WAV’a kilitli. Sekiz ders toplamı 4580.12 saniye. `01_office_ai-4` allowlist dışında.
