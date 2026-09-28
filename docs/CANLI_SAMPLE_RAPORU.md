# CANLI SAMPLE RAPORU

| Alan | Değer |
|------|-------|
| Tarih | 27 Eylül 2026 |
| Ders | OFF-201 Ders 1 (`01_office_ai_ileri` / `01_office_ai_ileri-1`) |
| Ses | Kore (Aylin) |
| Model | `gemini-3.8-flash-tts` |
| Düdük | 1 (tavan 100) |
| Ders mührü | Yazılmadı |

Canlı çağrı `gemini-3.8-flash-tts` modeline ulaştı. Ham Gemini WAV `media-bake/academy/raw-cache/` altına yazıldı. Parça EBU R128 `loudnorm` (I=−16, TP=−1.5, LRA=11, 48 kHz) hattından geçti. `assertAcademySpeechQuality` kapıyı geçti.

Mevcut ders WAV’ı ilk taramada çağrıyı atladı (0 düdük). Canlı düdük `--force` ile açıldı. Sample-only ders kasetinin üzerine yazmadı.

## A/B dosyaları

| Rol | Yol | Boyut |
|-----|-----|------:|
| Ham Gemini | `media-bake/academy/raw-cache/01_office_ai_ileri/01_office_ai_ileri-1/00-9d6845e11daf37127770.wav` | 1 135 024 bayt |
| Ham döküm | `media-bake/academy/raw-dump/01_office_ai_ileri-1/raw_dump.wav` | 24 kHz, 23,52 sn, LINEAR16 |
| İşlenmiş WAV | `media-bake/academy/piece-cache/01_office_ai_ileri/01_office_ai_ileri-1/00-5ff1f42af9829514d90a.wav` | 2 257 998 bayt |
| İşlenmiş MP3 | `media-bake/academy/piece-cache/01_office_ai_ileri/01_office_ai_ileri-1/00-5ff1f42af9829514d90a.mp3` | 942 765 bayt |

Ham döküm meta: model `gemini-3.8-flash-tts`, ses `Kore`, `sola: false`, `lanczos: false`.

## Kalite kapısı

Kaynak: `lib/academy/tts-quality-gate.ts` (`measureAcademySpeechQuality` / `assertAcademySpeechQuality`).

| Ölçüm | Ham | İşlenmiş | Kapı | Sonuç |
|-------|----:|---------:|------|-------|
| 300 Hz–1 kHz gövde payı | %52,4 | %53,2 | > %30 | Geçti |
| Bütünleşik LUFS | — | −16,8 | −16 ± 2,5 | Geçti |
| Tarak filtresi (595 / 1785 / 2975 Hz çukur) | −3,3 / −2,1 / +9,4 dB | −3,1 / −1,3 / +9,5 dB | 0 bozulma | Geçti |

Tarak filtresi bozulması: **0**. Eski 1190 Hz tarak çukurları (−33 / −24 / −19 dB) bu parçada yok. Gövde payı hamdan işlenmişe korunmuş.

## Dinleme

Dinleme hazır. İşlenmiş parçayı şu dosyadan aç:

`media-bake/academy/piece-cache/01_office_ai_ileri/01_office_ai_ileri-1/00-5ff1f42af9829514d90a.wav`
