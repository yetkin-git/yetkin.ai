# OFF-201 kesin fırın raporu

| Alan | Değer |
|------|-------|
| Tarih | 27 Eylül 2026 |
| Kurs | OFF-201 (`01_office_ai_ileri`) |
| Ses | Kore (Aylin) |
| Model | `gemini-3.8-flash-tts` |
| Plan | 71 istek (bant 60–72, tavan 100, günlük kalan 93) |
| Kullanılan API | 70 |
| Ham önbellek | 1 (ders 1 parça 1; yeni düdük yok) |
| Ham dalga | 71 dosya `media-bake/academy/raw-cache/01_office_ai_ileri/` |
| Hat | ffmpeg WSOLA `atempo=0.93` + EBU R128 `loudnorm` (I=−16, TP=−1.5, LRA=11, 48 kHz) |
| Yayın | 48 kHz / 320 kbps CBR MP3, mono, `public/media/academy/audio/01_office_ai_ileri/` |

Alt model kapalı. `VOICE_TTS_FALLBACK_TO_2_5` false. Fırın `academyBakeVoiceModelId()` okudu. Her parça `assertAcademySpeechQuality` kapısını geçti (300 Hz–1 kHz > %30, LUFS −16 ± 2,5). Ders kapısı birleşik zaman çizelgesindedir; atempo yalnız konuşma parçasına uygulandı.

## Dersler

| Ders | İstek | Süre | 300 Hz–1 kHz | LUFS | Yayın |
|------|------:|-----:|-------------:|-----:|------|
| 1 | 12 | 485,1 sn | %51,1 | −15,9 | `01_office_ai_ileri-1.mp3` |
| 2 | 12 | 605,6 sn | %52,3 | −16,0 | `01_office_ai_ileri-2.mp3` |
| 3 | 11 | 658,3 sn | %48,0 | −16,0 | `01_office_ai_ileri-3.mp3` |
| 4 | 12 | 751,9 sn | %53,3 | −16,0 | `01_office_ai_ileri-4.mp3` |
| 5 | 12 | 843,7 sn | %49,4 | −16,0 | `01_office_ai_ileri-5.mp3` |
| 6 | 12 | 714,4 sn | %61,3 | −16,0 | `01_office_ai_ileri-6.mp3` |
| **Toplam** | **71** | | | | **API 70** |

Ham önbellek dağılımı: ders 1–2 ve 4–6 için 12, ders 3 için 11.
