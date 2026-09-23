# 01_office_ai — Son mühür turu (sabah; kota)

Bu not 22 Eylül 2026 sabahındaki kota duruşudur. Güncel mühür `docs/01_office_ai_final_muhur.md` dosyasındadır.

# 01_office_ai — Son mühür turu (basılmadı)

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026, 08:20 TSİ |
| Dayanak | Onaylı Aşama 3 (`docs/01_office_ai_tedavi_raporu_asama3.md`) |
| İstenen model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Sonuç | **Mühür basılmadı.** Günlük kota penceresi yenilenmemiş. |

Senaryo, müfredat, 8 derslik yapı ve vatandaş dili Aşama 3’te kilitli durur. Bu tur yalnız ses tınısını birincil modele çekecekti. Metin açılmadı. Allowlist’e `01_office_ai-4` yazılmadı.

---

## 1. Kuyruk

Kuru tarama, harici çağrıdan önce:

| Anahtar | Paragraf | İstek | Ses | Model |
|---------|----------|-------|-----|--------|
| `01_office_ai-w1` | 19 | 19 | Callirrhoe | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-6` | 18 | 18 | Callirrhoe | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-0` | 8 | 8 | Callirrhoe | `gemini-3.1-flash-tts-preview` |

Kapalı kasetler kuyruğa girmedi: `01_office_ai-1`, `k1`, `2`, `3`, `5`, `g1`. Eski `-4` kaseti de girmedi.

---

## 2. Fırın

Word kaseti birincil modelde 3 nefes dilimini bellekte üretti. 4. istek kotaya çarptı. Dosya yazımı dersin tamamı bitince olur; yarım WAV diske inmedi. Cuma ve hazırlık şeridine sıra gelmedi.

API ölçüsü: `generate_requests_per_model_per_day`, tavan **100**, model `gemini-3.1-flash-tts`. Yanıt, **18 saat 38 dakika** sonra yeniden denemeyi söyledi. Pencere **23 Eylül 2026, 03:00 TSİ** civarında açılır.

Gece fırını (21 Eylül 2026, 23:33–00:45 TSİ) aynı 100’lük pencerenin içindeydi. Altı kapalı kaset o pencerede birincil modelle bitti. Word’ün ilk birincil denemesi kotayı orada doldurdu. Sabah 08:20 TSİ yeni gün sayılmadı; kovada kalan son istekler bu turda tükendi ve atıldı.

---

## 3. Disk

Üç yedek-model kaseti gece fırınının halinde durur. Süre bandı Aşama 3 ölçümüdür; bu turda yeniden ölçülmedi çünkü yeni ses yok.

| Anahtar | Diskteki model | Saniye | Dakika | WAV yazımı |
|---------|----------------|--------|--------|------------|
| `01_office_ai-w1` | `gemini-2.5-flash-preview-tts` | 495.168 | 8.25 | 22 Eylül 00:34 TSİ |
| `01_office_ai-6` | `gemini-2.5-flash-preview-tts` | 462.837 | 7.71 | 22 Eylül 00:41 TSİ |
| `01_office_ai-0` | `gemini-2.5-flash-preview-tts` | 233.368 | 3.89 | 22 Eylül 00:44 TSİ |

Kapalı altı kasetin WAV, MP3, cue ve zaman JSON damgaları 21 Eylül 23:49–22 Eylül 00:24 TSİ aralığında kaldı. `-4` WAV damgası 20 Eylül. Cue saatleri ve `lesson-audio-timings` bu turda değişmedi. `targetDurationMinutes` ve `docs/DURUM.md` yerinde durur.

8 ders toplamı hâlâ **4429.245 sn ≈ 73.82 dk**. Numaralı dersler 7–12 bandında. Hazırlık şeridi toplama girmez.

---

## 4. Kalan mühür

Tını homojen değil. Word, Cuma ve hazırlık şeridi yedek modelde. Amiral gemisi bu haliyle birincil-model mührü taşımaz.

Kota penceresi açılınca aynı üç anahtar, aynı bayraklarla, metin açılmadan yeniden fırınlanır:

`gemini-3.1-flash-tts-preview`, `--no-fallback`, `--force`, `--no-db`.

Sonra cue ve zaman JSON yeni süreye kilitlenir. Word ve Cuma 420–720 sn içindeyse, şerit ders sayısına çekilmeden, ses mühürü basılır. 1, KVKK, 2, 3, 5, birleşik e-posta ve `-4` yine kuyruk dışıdır.
