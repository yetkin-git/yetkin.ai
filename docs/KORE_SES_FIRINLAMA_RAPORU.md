# Kore ses fırınlama raporu — `jr_06_mat-5`

SUPER_ADMIN, Sadachbia numunesi kapanmıştır. Matematik ve fen katalog sesi Kore'dir. Bu turda yalnız `jr_06_mat-5` yeniden sentezlendi.

## Sonuç

`jr_06_mat-5` (`Çarpanlar, katlar ve bölünebilme`) `gemini-3.8-flash-tts` üzerinden **Kore** sesiyle yeniden yazıldı. Dosya `public/media/junior/audio/jr_06_mat-5.mp3` üzerine geçti. Süre **5:20.04** (320.04 saniye): 300 saniyenin üstünde, hedef bant 5:10–5:30 içinde.

| | Sadachbia numunesi | Kore kaseti |
|---|---|---|
| Süre | 4:56.18 (296.18 s) | 5:20.04 (320.04 s) |
| Bayt | 11.848.365 | 12.802.605 |
| SHA-256 | `6dc185fd80b8fd973ae6f8a76ec048a45b56300c88d7660d7f921e7313f1b6fa` | `4d8d729b72f7145bdc7c441eafe2a72f41041790fda2958e58c9cfbcdb613f24` |

## Ses ve tempo

- Model: `gemini-3.8-flash-tts` (`ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS`)
- Anlatıcı: Selim / Kore. `voicePrompt` senteze gitmedi. İstek sayısı: 1.
- Katalog atempo: `0.94`. Kore konuşması bu katsayıda 5:30 tavanının üstüne çıktığı için bant katsayısı `1.0616` uygulandı. Birleşik tempo yaklaşık `0.998`. Seviye: LUFS −16.3.
- Cümle aralarındaki nefes etiketleri (`<break>`) aynı transkriptte duruyor. Tempo düzeltmesi konuşmayı ve durakları birlikte 5:20'ye oturttu.

`JUNIOR_AUDIO_MANIFEST` içindeki `jr_06_mat-5` kaydı yeni özet ve bayt ile güncellendi. Diğer 67 dersin kaydı değişmedi.

## Beat hizası

Oynatıcı kasetin gerçek süresine `scaleJuniorPlayerTimeline` ile kilitlenir. 12 adımın sırası durdu. Bölünebilme cümlesi («kalansız») ölçeklenen saatte yerinde kaldı. Kaset 320.040 ms.

| Adım | Başlangıç | Cümle |
|---|---|---|
| 1 | 0:00.000 | Merhaba sevgili çocuklar! |
| 2 | 0:28.648 | Bunu sıra olurken de kullanırsın. |
| 3 | 0:47.718 | Kavramın cümlesi burada durur: Bir doğal sayının çarpanı, onu kalansız bölen doğal sayıdır |
| 4 | 0:55.657 | Kat ise o sayının 1, 2, 3 gibi sayılarla çarpılmış katlarıdır. |
| 5 | 1:26.029 | Hadi şimdi ekrandaki çizime birlikte bakalım! |
| 6 | 1:29.999 | 24 sayısını ele alalım. |
| 7 | 2:09.174 | Altın İpucu! |
| 8 | 2:13.833 | Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. |
| 9 | 2:46.277 | Bugün Neler Öğrendik? |
| 10 | 2:48.176 | 1. Özet kartında bunu yanında tut: Çarpan, sayıyı kalansız böler. |
| 11 | 2:57.667 | 2. 2, 5 ve 10 için son rakama bakılır. |
| 12 | 3:03.708 | 3. 24, 2'ye ve 3'e bölünür. |

## Katalog

Matematik (Selim) ve fen (Deniz) ağızı kodda Kore. İngilizce (Selin) zaten Kore kullanıyor. Bu turda fen MP3'leri ve `jr_06_mat-5` dışındaki matematik kasetleri yeniden yazılmadı; diskteki eski sesler duruyor. Sıradaki fen veya matematik fırını Kore ile açılır.

## Doğrulama

- `npm run verify:junior-content` — çıkış 0. `111 senaryo eşit, 13 kab, takvim planla aynı.` 59 açık çıktı bilgi satırıdır; derlemeyi kırmaz.
- `npm run verify:prebuild` — çıkış 0. İçinde `verify:junior-audio-manifest OK — 68 anahtar; yerel ses dosyaları SHA-256 ve bayt ile manifeste eşleşti.`
- `npm run verify:junior-speech` — çıkış 0. Katalog sesi Kore; kaset 5:10–5:30 bandında ve adım çapaları süreyle orantılı.
