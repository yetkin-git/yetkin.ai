# Genç erkek sesi raporu — `jr_06_mat-5`

SUPER_ADMIN, Kore (kadın) ve Puck (tok erkek) numuneleri kapanmıştır. 6. sınıf Matematik ve Fen katalog sesi genç, dinamik ve enerjik erkek sesidir. Bu turda yalnız `jr_06_mat-5` yeniden sentezlendi.

## Sonuç

`jr_06_mat-5` (`Çarpanlar, katlar ve bölünebilme`) `gemini-3.8-flash-tts` üzerinden **Fenrir** sesiyle yeniden yazıldı. Dosya `public/media/junior/audio/jr_06_mat-5.mp3` üzerine geçti. Süre **5:20.02** (320.02 saniye): 5:00–5:30 bandının içinde, hedef 5:20.

Hazır Gemini kataloğunda Orpheus yoktur. Katalog listesi `GEMINI_TTS_PREBUILT_VOICES` içindedir. SUPER_ADMIN’in adını verdiği ve listede duran genç erkek yuvası Fenrir’dir. Matematik (Selim) ve fen (Deniz) bu kimliği taşır. Öğretmen adları değişmedi.

| | Kore kaseti | Fenrir kaseti |
|---|---|---|
| Süre | 5:20.04 (320.04 s) | 5:20.02 (320.02 s) |
| Bayt | 12.802.605 | 12.801.645 |
| SHA-256 | `4d8d729b72f7145bdc7c441eafe2a72f41041790fda2958e58c9cfbcdb613f24` | `8e9b002d8f04209b6daa38613d1220b2e7706d83f99e03ed0dd39618018b0f57` |

## Ses ve tempo

- Model: `gemini-3.8-flash-tts` (`ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS`)
- Anlatıcı: Selim / Fenrir. `voicePrompt` senteze gitmedi. İstek sayısı: 1.
- Katalog atempo: `0.94`. Fenrir konuşması bu katsayıda 5:20 hedefinin altında kaldığı için bant katsayısı `0.9220` uygulandı. Seviye: hedef LUFS −16.0, ölçülen −16.5 (kapı ±2.5).
- Cümle aralarındaki nefes etiketleri (`<break>`) aynı transkriptte duruyor. Tempo düzeltmesi konuşmayı ve durakları birlikte 5:20’ye oturttu.

`JUNIOR_AUDIO_MANIFEST` içindeki `jr_06_mat-5` kaydı yeni özet ve bayt ile güncellendi. Manifest 68 anahtarın tamamı diskten yeniden yazıldı; bu turda üzerine yazılan MP3 yalnız `jr_06_mat-5`.

## Beat hizası

Oynatıcı kasetin gerçek süresine `scaleJuniorPlayerTimeline` ile kilitlenir. 12 adımın sırası durdu. Bölünebilme cümlesi («kalansız») ölçeklenen saatte yerinde kaldı. Kaset 320.020 ms.

| Adım | Başlangıç | Cümle |
|---|---|---|
| 1 | 0:00.000 | Merhaba sevgili çocuklar! |
| 2 | 0:28.647 | Bunu sıra olurken de kullanırsın. |
| 3 | 0:47.715 | Kavramın cümlesi burada durur: Bir doğal sayının çarpanı, onu kalansız bölen doğal sayıdır |
| 4 | 0:55.653 | Kat ise o sayının 1, 2, 3 gibi sayılarla çarpılmış katlarıdır. |
| 5 | 1:26.024 | Hadi şimdi ekrandaki çizime birlikte bakalım! |
| 6 | 1:29.993 | 24 sayısını ele alalım. |
| 7 | 2:09.166 | Altın İpucu! |
| 8 | 2:13.825 | Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. |
| 9 | 2:46.266 | Bugün Neler Öğrendik? |
| 10 | 2:48.165 | 1. Özet kartında bunu yanında tut: Çarpan, sayıyı kalansız böler. |
| 11 | 2:57.656 | 2. 2, 5 ve 10 için son rakama bakılır. |
| 12 | 3:03.696 | 3. 24, 2'ye ve 3'e bölünür. |

## Katalog

Matematik (Selim) ve fen (Deniz) ağzı kodda Fenrir. Ton: «Erkek / Genç, dinamik ve enerjik». Kore, Puck ve Charon bu iki branşa gitmez. İngilizce (Selin) Kore’de kaldı. Türkçe Aoede, sosyal Achird, seçmeli Enceladus yerinde.

Bu turda fen MP3’leri ve `jr_06_mat-5` dışındaki matematik kasetleri yeniden yazılmadı; diskteki eski sesler duruyor. Sıradaki fen veya matematik fırını Fenrir ile açılır.

## Doğrulama

- `npm run verify:junior-content` — çıkış 0. `111 senaryo eşit, 13 kab, takvim planla aynı.` 59 açık çıktı bilgi satırıdır; derlemeyi kırmaz.
- `npm run verify:prebuild` — çıkış 0. İçinde `verify:junior-audio-manifest OK — 68 anahtar; yerel ses dosyaları SHA-256 ve bayt ile manifeste eşleşti.`
- `npm run verify:junior-speech` — çıkış 0. Katalog sesi Fenrir; kaset 5:00–5:30 bandında ve adım çapaları süreyle orantılı.
