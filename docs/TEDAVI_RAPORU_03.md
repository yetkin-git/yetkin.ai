# Tedavi Raporu 03 — OFF-201 tek eğitmen sesi

Tarih: 26 Eylül 2026  
Dal: `off-201-stage`  
Commit: `fix(academy): unify OFF-201 under single instructor voice`

## Karar

Bir kurs baştan sona tek eğitmen sesiyle anlatılır. OFF-201 (`01_office_ai_ileri`) altı dersi aynı Gemini 3.1 Flash TTS karakterine kilitlendi: **Callirrhoe / Gözde**.

`ACADEMY_OFF201_LESSON_TTS_VOICE` ders 1–6 için `Callirrhoe` döner. Konuşma hızı `0.93`. Model `gemini-3.1-flash-tts-preview`. `VOICE_TTS_FALLBACK_TO_2_5` kapalı. Tanışma cümlesi «Selamlar, ben Gözde.» Müşteri adı Selin Korkmaz durur.

## Dry-run

`npm run generate:academy-audio -- --dry-run --slug=01_office_ai_ileri`

Harici API yok. Altı ders de Callirrhoe, istek bandı 10–12, tempo 0.93.

## Arşiv

Eski çoklu ses MP3’leri `archived/academy-audio-revoked/01_office_ai_ileri/multi-voice/` altına kopyalandı. Üst klasördeki eski Gemini 2.5 kasetleri (ders 1 ve 2) ezilmedi.

## Mühür

Komut: `npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai_ileri`

`--force` şarttı. WAV diskte varken komut aksi halde dersi atlar.

| Ders | Ses | Süre | Yayın |
| --- | --- | --- | --- |
| `01_office_ai_ileri-1` | Callirrhoe | 514.261 sn | `public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3` |
| `01_office_ai_ileri-2` | Callirrhoe | 615.508 sn | `.../01_office_ai_ileri-2.mp3` |
| `01_office_ai_ileri-3` | Callirrhoe | 688.064 sn | `.../01_office_ai_ileri-3.mp3` |
| `01_office_ai_ileri-4` | Callirrhoe | 765.066 sn | `.../01_office_ai_ileri-4.mp3` |
| `01_office_ai_ileri-5` | Callirrhoe | 864.722 sn | `.../01_office_ai_ileri-5.mp3` |
| `01_office_ai_ileri-6` | mühürlenmedi | eski timings 754.906 sn | oynatıcı açmaz |

Beş ders de 5 dakikanın üstünde. Ders 6, 4. istekte durdu. Günlük kota `generate_requests_per_model_per_day` limiti 100, model `gemini-3.1-flash-tts`. API yaklaşık 8 saat 53 dakika sonra yeniden deneneceğini söyledi. Gemini 2.5 açılmadı. Ders 6 için WAV ve yeni MP3 yazılmadı.

`ACADEMY_TTS_REVOKED_CASSETTES` ders 6’yı `gemini-3.1-daily-quota` ile tutar. `ACADEMY_TTS_REBAKE_QUEUE` yalnız `01_office_ai_ileri-6` taşır. Kota açılınca aynı model ve Callirrhoe ile fırınlanır.

## Satış kapısı

`academyCourseSaleOpen("01_office_ai_ileri")` **false** döner. Altı ders aynı sesle mühürlenmeden satış açılmaz. Ders 6 kuyrukta olduğu için vitrin kartı satın alınamaz. Amiral SKU `01_office_ai` satışı açık kalır.

## Test

Komut: `npm test` (`vitest run`)

- Test dosyası: 236 geçti
- Test: 1152 geçti
- Süre: 61.86 sn
- Çıkış kodu: 0
