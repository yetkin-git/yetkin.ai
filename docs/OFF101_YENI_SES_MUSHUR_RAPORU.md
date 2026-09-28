# OFF-101 yeni metinlerle Gözde sesi mühürü

Tarih: 28 Eylül 2026.

Kurs: `01_office_ai` (OFF-101). Ses: Gözde / Callirrhoe. Model: `gemini-3.8-flash-tts`. `VOICE_TTS_FALLBACK_TO_2_5` kapalı. 80 istek, tavan 100. Tempo `atempo=0.93`, EBU R128.

Eski parça önbelleği ve sekiz mühürlü konuşma MP3’ü silindi. Ders 0, ders 4 ve mevcut yatak dosyaları durdu. Fırın `--seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai` ile tamamlandı.

## Konuşma süreleri

Sekiz ders de 5 dakikanın üstünde. Kurs toplamı **4880.862 sn** (yaklaşık 81.35 dk).

| Ders | Konuşma sn | cacheV |
| --- | ---: | ---: |
| 01_office_ai-1 | 707.016 | 710016 |
| 01_office_ai-2 | 536.659 | 539659 |
| 01_office_ai-3 | 567.761 | 570761 |
| 01_office_ai-5 | 589.22 | 592220 |
| 01_office_ai-6 | 526.723 | 529723 |
| 01_office_ai-g1 | 637.634 | 640634 |
| 01_office_ai-w1 | 580.984 | 583984 |
| 01_office_ai-k1 | 734.865 | 737865 |

## Video

Kaynak: `public/media/academy/micro/01_office_ai-1-warmup.mp4`.

- Süre: **8.00 saniye** (1280×720, H.264, `+faststart`)
- Ses kanalı yok; anlatım ders MP3’ündedir
- Oynatıcı adresi: `/media/academy/micro/01_office_ai-1-warmup.mp4?v=8000`

Otomatik Veo çağrısı yok. Isınma penceresi 8.00 saniyedir.

## Hard-mix

Konuşma kaynağı `media-bake/academy/audio/01_office_ai/*.wav`. Yatak `*.bed.mp3`. Yayın MP3’ü konuşma dosyasının üstüne ikinci kez sıkılmadı.

Her derste ilk **3.00 sn** yalnız müzik. Konuşma 3.00 sn’de girer. Karaoke saati medya saatinden 3.00 sn geri okunur. `cacheV` konuşma süresi artı 3.00 sn damgasıdır.

Lyria 3.5 yatakları ders atmosferine göre döner: 1 ambient, 2 lo-fi, 3 upbeat, 5 ambient, 6 lo-fi, g1 upbeat, w1 ambient, k1 lo-fi. Ders 6 yatak istemi interactions kapısında takıldı; `generateContent` yedeği ayrı bir dosya yazdı.

| Ders | Bayt | LUFS | cacheV |
| --- | ---: | ---: | ---: |
| 01_office_ai-1 | 28402605 | −15.99 | 710016 |
| 01_office_ai-2 | 21588525 | −15.97 | 539659 |
| 01_office_ai-3 | 22832685 | −15.93 | 570761 |
| 01_office_ai-5 | 23690925 | −15.90 | 592220 |
| 01_office_ai-6 | 21191085 | −15.91 | 529723 |
| 01_office_ai-g1 | 25628205 | −15.91 | 640634 |
| 01_office_ai-w1 | 23361645 | −15.87 | 583984 |
| 01_office_ai-k1 | 29517165 | −15.94 | 737865 |

## Doğrulama

`assertAcademyProductionSeal` `tests/academy/production-standard.test.ts` içinde geçti. Beş katman (metin, ses, video, görsel, müzik) kapısı yeşil.
