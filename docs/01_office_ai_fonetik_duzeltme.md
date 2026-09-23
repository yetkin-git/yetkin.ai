# 01_office_ai — IBAN fonetik düzeltme

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Bayraklar | `--seal --confirm-gemini-spend --force --no-db --no-fallback` |

Stüdyo testinde `IBAN` İngilizce «ay-ben» okunuyordu. Vatandaş dilinde okunuş «iban»dır. Ekranda yazım `IBAN` kaldı. Sese giden katman `İban` oldu.

---

## 1. Ses katmanı

Fonetik harita (`lib/academy/spoken-scripts/phonetics.ts`):

| Ekran | TTS girdisi |
|-------|-------------|
| `IBAN` | `İban` |
| `MASKELİ_IBAN` | `MASKELİ İban` |

Konuşma metinlerinde bağımsız `IBAN` `İban` oldu. `MASKELİ_IBAN` kaynakta durur; fırın anında `MASKELİ İban` olur. Böylece altyazı ile konuşma metni aynı sese iner.

Dokunulmayan yüzeyler: makale, kart, sınav, maske ızgarası, altyazı (`lesson-cues`). Bu yüzeylerde yazım `IBAN` ve `MASKELİ_IBAN` olarak kaldı. Karaoke, altyazı paragrafını ekrana basar; zaman JSON’daki `İban` vatandaşa yazılmaz.

1. ders altyazısında Copilot cümlesi konuşma metninden eksikti. Fırın kapısı paragraf 9’da duruyordu. Eksik cümle altyazıya alındı. Bu cümlede `IBAN` yoktur.

---

## 2. Fırın

İçinde `IBAN` geçen kasetler. `g1` ve `4` bu kelimeyi taşımadığı için kuyruğa girmedi.

| Anahtar | İstek | Sonuç | `durationSec` | `cacheV` |
|---------|-------|--------|---------------|----------|
| `01_office_ai-0` | 8 | bitti | 244.2 | 244200 |
| `01_office_ai-1` | 15 | bitti | 668.88 | 668880 |
| `01_office_ai-k1` | 15 | bitti | 627.6 | 627600 |
| `01_office_ai-2` | 14 | bitti | 524.76 | 524760 |
| `01_office_ai-3` | 14 | bitti | 541.88 | 541880 |
| `01_office_ai-5` | 14 | bitti | 552.6 | 552600 |
| `01_office_ai-6` | 18 | bitti | 487.12 | 487120 |
| `01_office_ai-w1` | 2. istekte kesildi | **basılmadı** | 532.84 (eski) | 532840 (eski) |

Yedi kasetin zaman JSON’unda `IBAN` kalmadı; TTS metni `İban`. Cue saatleri ve `docs/curriculum/` kopyaları yeni süreye kilitlendi. Numaralı dersler 420–720 sn bandında. Kurs toplamı **4507.4 sn ≈ 75.12 dk**. Hazırlık şeridi ve `-4` toplama girmez.

Word kaseti (`01_office_ai-w1`) günlük kotaya çarptı. Ölçü: `generate_requests_per_model_per_day`, tavan **100**, model `gemini-3.1-flash-tts`. Yarım WAV diske inmedi. Eski kaset duruyor; zaman JSON’unda `IBAN` hâlâ var, yani yayındaki ses eski «ay-ben» okuyuşudur. Konuşma metni ve fonetik harita hazır. Kota **23 Eylül 2026, 03:00 TSİ** civarında açılır. Aynı bayraklarla yalnız bu anahtar yeniden fırınlanır:

`gemini-3.1-flash-tts-preview`, `--no-fallback`, `--force`, `--no-db`.
