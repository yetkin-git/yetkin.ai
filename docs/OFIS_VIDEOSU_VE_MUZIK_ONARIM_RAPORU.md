# OFF-201 ofis videosu ve hard-mix müzik onarımı

Tarih: 28 Eylül 2026.

## Video

Kaynak: `public/media/academy/micro/01_office_ai_ileri-warmup.mp4`.

Dosya 10.01 saniyelik, ses kanallı bir dışa aktarımdı. Oynatıcı aynı immutable URL’den eski kaseti tutabiliyor ve kısa `video.duration` değerine zıplayabiliyordu. Klip yeniden basıldı:

- Süre: **8.00 saniye** (24 kare/sn, 1280×720, H.264, `+faststart`)
- Ses kanalı yok; anlatım ve yatak ders MP3’ündedir
- Oynatıcı adresi: `/media/academy/micro/01_office_ai_ileri-warmup.mp4?v=8000`

OFF-201 ders 1–6 bu dosyayı ana kaynak sayar (`ACADEMY_OFF201_WARMUP_SOURCE`). Zaman çizelgesinin ilk 8.00 saniyesi klibe kilitlidir. Süre, dosyanın bildirdiği kısa uzunluktan okunmaz.

## Hard-mix

Konuşma kaynağı `media-bake/academy/audio/01_office_ai_ileri/*.wav`. Yatak `*.bed.mp3`. Yayın MP3’ü ikinci kez sıkılmadı.

Her derste:

- İlk **4.00 sn** yalnız müzik. Crescendo −20 dB’den −8 dB’ye çıkar.
- Konuşma 4.00 sn’de girer. Yatak 0.40 sn’de **−18 dB**’ye iner. Sidechain tepeyi −20 dB bandına çeker.
- Karaoke saati medya saatinden 4.00 sn geri okunur; parça süreleri kaydırılmadı.
- `cacheV` giriş damgasına çekildi. Tarayıcı eski miksi tutmaz.

| Ders | Bayt | LUFS | cacheV |
| --- | ---: | ---: | ---: |
| 01_office_ai_ileri-1 | 19567725 | −15.91 | 489144 |
| 01_office_ai_ileri-2 | 24386925 | −16.02 | 609618 |
| 01_office_ai_ileri-3 | 26495085 | −16.01 | 662323 |
| 01_office_ai_ileri-4 | 30238125 | −15.96 | 755895 |
| 01_office_ai_ileri-5 | 33908205 | −16.05 | 847653 |
| 01_office_ai_ileri-6 | 28737645 | −15.95 | 718382 |

Ders 1 yayın süresi 8:09.17. Konuşma WAV’ı 8:05.14 idi. Fark giriş müziğidir.

## Doğrulama

`tests/academy/off201-beat-visual.test.ts` ve `tests/academy/lesson-visual-stage.test.ts`: 12 test geçti.
