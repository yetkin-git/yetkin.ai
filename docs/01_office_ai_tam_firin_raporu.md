# 01_office_ai — Tam fırın raporu

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026, 14:25 TSİ |
| Anahtar | `.env.local` `GEMINI_API_KEY` — `yetkin-vision` (14:07 TSİ) |
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Bayraklar | `--seal --confirm-gemini-spend --force --no-db --no-fallback` |
| Sonuç | **Hazırlık şeridi ve Word kaseti birincil modelle mühürlendi.** Çıkış kodu 0. |

Kuru tarama her iki anahtarda geçti. Hazırlık şeridi 8 paragraf / 8 istek, mühür `596ae0d6e44e`. Word 19 paragraf / 19 istek, mühür `0455677425fa`. Word’ün 19. paragrafı konuşma metnine çekildi: ekranda `IBAN` durur; ses «İban» okur. Eski «ChatGPT veya Claude» cümlesi, stüdyo metnindeki sohbet yapay zekâ listesiyle değiştirildi. Allowlist’e `01_office_ai-4` yazılmadı. Diğer kasetler bu turda sentezlenmedi.

---

## 1. Fırın

| Anahtar | Paragraf | İstek | Saniye | Dakika | Cue sonu | cacheV | Model |
|---------|----------|-------|--------|--------|----------|--------|--------|
| `01_office_ai-0` | 8 | 8 | 260.16 | 4.34 | 260.16 | 260160 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-w1` | 19 | 19 | 546.04 | 9.10 | 546.04 | 546040 | `gemini-3.1-flash-tts-preview` |

Cue `start`/`end` ve `lesson-audio-timings` son perde, WAV süresiyle kilitlendi. Word 420–720 sn bandının içinde. `targetDurationMinutes` 8.9 → 9.1. Yuvarlak süre tablosu: Word 546.

Sekiz ders toplamı **4520.6 sn ≈ 75.34 dk**. Hazırlık şeridi (260.16 sn) ve `01_office_ai-4` toplama girmez. Bu turda yeniden fırınlanmayan kasetlerin süre etiketleri mevcut WAV’a çekildi: 1. ders 10.9 → 11.1, KVKK 10.4 → 10.5, 3. ders 8.8 → 8.7, Cuma 8.2 → 8.1.

| Dosya | Bayt | Damga |
|-------|------|--------|
| `media-bake/academy/audio/01_office_ai/01_office_ai-0.wav` | 24 975 404 | 22 Eylül 2026, 14:16 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-0.mp3` | 6 245 037 | 22 Eylül 2026, 14:16 TSİ |
| `media-bake/academy/audio/01_office_ai/01_office_ai-w1.wav` | 52 419 884 | 22 Eylül 2026, 14:24 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3` | 13 106 349 | 22 Eylül 2026, 14:24 TSİ |

---

## 2. Hazırlık şeridi ses mührü

`ACADEMY_PREP_STRIP_AUDIO_SEALED["01_office_ai"]` `true`. Konuşma metninin 2. paragrafı (Grok, Kimi, Muse Spark ve «büyük dil modelleri») bu kasetin içindedir.

Oynatıcı katmanı `article+karaoke`. `PrepStripPanel` sinema sahnesini, karaoke satırını ve yayın MP3’ünü (`?v=260160`) bu bayrakla açar. Şerit 8 ders sayısına ve sınav yoluna alınmadı.

---

## 3. Hüküm

Fırın tamam. İki kaset birincil modelde. Cue ve zaman JSON yeni WAV’a kilitli. Hazırlık şeridi sinema katmanında.
