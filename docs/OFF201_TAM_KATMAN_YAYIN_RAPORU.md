# OFF-201 tam katman yayın raporu

| Alan | Değer |
|------|-------|
| Tarih | 28 Eylül 2026 |
| Kurs | OFF-201 (`01_office_ai_ileri`) |
| Ses | Kore (Aylin), dünkü mühür |
| Bu turda TTS API | 0 |
| Bu turda Lyria API | 0 |
| Bu turda Veo API | 0 |
| Ham dalga | 71 dosya `media-bake/academy/raw-cache/01_office_ai_ileri/` |
| Konuşma | 48 kHz / 320 kbps CBR MP3, mono, EBU R128 `loudnorm` (I=−16, TP=−1.5, LRA=11) |
| Dip müzik | Ayrı `*.bed.mp3`, oynatıcıda döngü, konuşurken −25 dB, nefes payında −22 dB |
| Isınma klibi | Yerel `public/media/academy/micro/01_office_ai-1-warmup.mp4`, 8,00 sn, sessiz |

`generate-academy-lesson-audio.ts` çağrılmadı. Ham Gemini dalgaları ve dünkü konuşma kasetleri yerinde duruyor. `VOICE_TTS_FALLBACK_TO_2_5` kapalı. Yeni `--seal` düdüğü açılmadı.

## Beş katman

| Katman | Durum |
|--------|--------|
| Metin | Sözlü senaryo `lib/academy/spoken-scripts/01_office_ai_ileri-1.md` … `-6.md` |
| Ses | 6 yayın MP3, raw-cache üstünden dün mühürlendi |
| Video | `cue-01` ilk 8 sn, yerel Veo 3.1 Lite kaseti reuse |
| Görsel | 8. saniyede canlı uygulama kartı; karşılaştırma `cue-06` |
| Müzik | 6 Lyria yatağı diskte; oynatıcı ducking |

`assertAcademyProductionSeal` beş katman `true` iken geçti (`tests/academy/off201-beat-visual.test.ts`).

## Video

Yerel kaset 8,00 saniye, 1280×720, H.264, Google kodlayıcı. Süre bandı 6–8 sn. Oynatıcıda `muted`. Yeni Veo çağrısı yok.

Bağ: `academyLessonWarmupVeoAssetKey` altı dersi `01_office_ai-1-warmup` anahtarına verir. `cue-01` `visualMode: "veo"`. 0–8 sn klip, sonra canlı tablo (`includeVeoTable`).

## Müzik

Yataklar diskteydi: 44,1 kHz stereo, yaklaşık 88–98 sn, döngüye uygun. `generate-academy-lesson-bed.ts --seal` açılmadı; Lyria kotası harcanmadı.

Oynatıcı konuşma MP3 ile yatağı ayrı çalar. Konuşma dosyasına müzik gömülmedi; gömmek EBU R128 konuşma mührünü bozar ve yatağı iki kez duyurur.

Ducking kilidi `lib/academy/lesson-bed-duck.ts`:

| An | Seviye |
|----|--------|
| Konuşma | −25 dB (`ACADEMY_BED_SPEECH_DB`) |
| Nefes payı, `cue-07`, son 3 sn | −22 dB (`ACADEMY_BED_BREATH_DB`) |

Atmosfer: 1 ve 4 ambient, 2 ve 5 lo-fi, 3 ve 6 upbeat. Ambient istemi kurumsal hava, yumuşak piyano ve pad taşır.

## Dersler

| Ders | Konuşma | Yatak | Mood | Yayın |
|------|--------:|------:|------|------|
| 1 | 485,2 sn | 88,4 sn | ambient | `01_office_ai_ileri-1.mp3` |
| 2 | 605,7 sn | 88,1 sn | lo-fi | `01_office_ai_ileri-2.mp3` |
| 3 | 658,4 sn | 88,0 sn | upbeat | `01_office_ai_ileri-3.mp3` |
| 4 | 751,9 sn | 89,7 sn | ambient | `01_office_ai_ileri-4.mp3` |
| 5 | 843,7 sn | 98,1 sn | lo-fi | `01_office_ai_ileri-5.mp3` |
| 6 | 714,4 sn | 88,6 sn | upbeat | `01_office_ai_ileri-6.mp3` |

Ham önbellek: ders 1–2 ve 4–6 için 12, ders 3 için 11. Toplam 71. Bu turda yeni dalga yok.
