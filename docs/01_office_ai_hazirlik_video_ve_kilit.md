# 01_office_ai — Hazırlık şeridi video dersi ve kilit

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026, 13:26 TSİ |
| İstenen model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Fırın | **Tamamlanmadı.** Günlük kota, 4. istekte kesildi. |
| Kilit | **Tamam.** Satın almamış oturumda yalnız `01_office_ai-0` açılır. |

---

## 1. Fırın

Kuru tarama geçti: 8 paragraf, 8 istek, Callirrhoe, mühür `596ae0d6e44e`.

Canlı çağrı: `--seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-0`.

İstek 1–3 döndü (cue-01, cue-02, cue-03). İstek 4 `429 RESOURCE_EXHAUSTED`: `gemini-3.1-flash-tts` günlük tavan 100. Sunucu yeniden denemeyi yaklaşık 13 saat 39 dakika sonraya yazdı. Yedek modele düşülmedi. Parça WAV diske yazılmadı.

Diskteki kaset yerinde durur:

| Dosya | Bayt | Damga |
|-------|------|--------|
| `media-bake/academy/audio/01_office_ai/01_office_ai-0.wav` | 23 443 244 | 22 Eylül 2026, 10:46 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-0.mp3` | 5 861 997 | 22 Eylül 2026, 10:46 TSİ |

Süre 244,2 sn. Cue ve `lesson-audio-timings` bu süreye kilitli. Konuşma metninin 2. paragrafı (Grok, Kimi, Muse Spark ve «büyük dil modelleri») bu kasetin metni değildir. Bu yüzden `ACADEMY_PREP_STRIP_AUDIO_SEALED["01_office_ai"]` `false` kaldı. Oynatıcı, metinle uyuşmayan sesi sinema katmanına almaz; şerit makale katmanında durur. Kota kalkınca aynı komut cue saatini ve zaman JSON’unu yeni WAV’a kilitler, ardından ses mührü açılır.

---

## 2. Ödeme duvarı

Oturum duvarı durur. `/academy/01_office_ai/oyna` hâlâ giriş ister.

Satın almamış oturum:

| Kapı | Durum |
|------|--------|
| `01_office_ai-0` | Açık. Ücretsiz önizleme. |
| `01_office_ai-1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6` | Kilitli. Gövde istemciye gitmez. Tıklanınca ödeme duvarı. |

Diğer kurslarda satın alma yoksa oynatıcı kurs sayfasına döner. Satın alan ve süper yönetici tam müfredatı görür.

Antre kartı «Ücretsiz önizlemeyi aç» ile oynatıcıya gider.

---

## 3. Hüküm

Kilit tamam. Birincil model fırını kota yüzünden yarım kaldı. Hazırlık şeridi, konuşma metniyle birebir yeni kaset gelene kadar sinema dersi sayılmaz.
