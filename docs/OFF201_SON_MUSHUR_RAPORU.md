# OFF-201 son mühür raporu

Tarih: 28 Eylül 2026  
Kurs: OFF-201 (`01_office_ai_ileri`)  
Dış çağrı: 0. Veo ve Lyria bu adımda yeniden üretilmedi.

## Fon müziği — FFmpeg hard-mix

Altı dersin konuşması `media-bake/academy/audio/01_office_ai_ileri/*.wav` kaynağından, diskteki Lyria yatağı (`*.bed.mp3`) ile tek yayın MP3’üne basıldı. Betik: `scripts/hard-mix-academy-bed.ts`.

Yatak kazancı `-18 dB`. Konuşma sidechain ile yatağı ezer (`sidechaincompress`, ratio 2.5, attack 20 ms, release 450 ms). Çıkış EBU R128 `loudnorm` ile sabitlenir: I = −16 LUFS, TP = −1.5 dBTP, LRA = 11. Yayın 48 kHz stereo, 320 kbps.

| Ders | Bayt | Ölçülen LUFS |
| --- | ---: | ---: |
| `01_office_ai_ileri-1` | 19 408 365 | −15.96 |
| `01_office_ai_ileri-2` | 24 227 565 | −16.04 |
| `01_office_ai_ileri-3` | 26 335 725 | −16.09 |
| `01_office_ai_ileri-4` | 30 077 805 | −16.03 |
| `01_office_ai_ileri-5` | 33 748 845 | −16.05 |
| `01_office_ai_ileri-6` | 28 577 325 | −15.98 |

Oynatıcı bu altı derste ikinci yatak etiketini açmaz. Müzik konuşma dosyasının içindedir.

## Video — yerel ısınma kaseti

Dosya: `public/media/academy/micro/01_office_ai_ileri-warmup.mp4` (1 280×720, H.264, kaynak süre 10.01 sn).  
Varlık anahtarı: `01_office_ai_ileri-warmup`.  
`ACADEMY_BAKED_MICRO_VIDEO_KEYS` içindedir. Oynatıcı HTML5 MP4 açar; izlemede video API’si çağrılmaz.

Ders 1–6 ısınma kartı (`cue-01`):

- `startSec` = 0
- `durationSec` = 8 (`ACADEMY_VEO_BAKE_DURATION_SEC`)
- 8.00 sn’de kaset biter, sahne canlı uygulamaya döner

OFF-101 kaseti `01_office_ai-1-warmup` yerinde durur. OFF-201 o dosyayı kullanmaz.

## Beş katman

`assertAcademyProductionSeal` metin, ses, video, görsel ve müzik katmanlarıyla çağrıldı. Eksik katman yok, `--seal` reddi yok.

`tests/academy/off201-beat-visual.test.ts` geçti. Üretim standardı dosyasındaki mühür çağrısı da geçti.

Sonuç: OFF-201 video ve hard-mix müzik katmanları bağlandı ve mühürlendi.
