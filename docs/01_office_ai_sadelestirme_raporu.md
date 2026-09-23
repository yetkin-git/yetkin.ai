# 01_office_ai — Hazırlık şeridi sadeleştirme

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026, 15:33 TSİ |
| Anahtar | `01_office_ai-0` |
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Bayraklar | `--seal --confirm-gemini-spend --force --no-db --no-fallback` |
| Mühür | `b189d534f41e` |
| Sonuç | **Tamamlandı.** Çıkış kodu 0. 8 paragraf, 8 istek. |

İki muğlak cümle vatandaş lisanına çekildi. Konuşma metni, makale ve altyazı aynı cümleyi taşır. Kaset bu metinle yeniden fırınlandı; zaman JSON’u yeni WAV’a kilitlendi.

---

## 1. Metin

| Ekran | Kart | Eski | Yeni |
|-------|------|------|------|
| 151927 | CEBİNE KOY | Üç kural. 1. Hesabı aç, kutuyu tanı, ataşı gör; lisans yoksa durma. | Üç kural. Hesabı aç, kutuyu tanı, ataşı gör; şirketinin paralı lisansı yoksa takılma, ücretsiz panelle devam et. |
| 151710 | ÜCRET FARKI | «Daha zeki model» satın almak, A1 hücresini boş bırakmanın yerine geçmez. | En pahalı yapay zekâyı da satın alsan, başlığı olmayan bozuk tabloyu düzeltemez. Zekâ modelde değil, temiz veridedir. |

2. ve 3. kural numarası duruyor. Kapanıştaki «1. dersin A1 hücresi» ekranda `A1` kaldı; seste «A bir hücresi» okunur.

Yüzeyler:

| Yüzey | Dosya |
|-------|--------|
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-0.md` |
| Makale | `lib/academy/curricula/office_ai/prep.ts` |
| Altyazı | `lib/academy/lesson-cues/01_office_ai-0.json` |

---

## 2. Fırın

| Alan | Eski | Yeni |
|------|------|------|
| Saniye | 260.16 | **260.52** |
| Dakika | 4.34 | 4.34 |
| cacheV | 260160 | **260520** |
| Cue sonu | 260.16 | 260.52 |

| Kart | Saat |
|------|------|
| ÜCRET FARKI | 72.04–105.6 |
| CEBİNE KOY | 205.56–231.32 |

| Dosya | Bayt | Damga |
|-------|------|--------|
| `media-bake/academy/audio/01_office_ai/01_office_ai-0.wav` | 25 009 964 | 22 Eylül 2026, 15:33 TSİ |
| `public/media/academy/audio/01_office_ai/01_office_ai-0.mp3` | 6 253 677 | 22 Eylül 2026, 15:33 TSİ |

Yayın adresi `?v=260520`. Yuvarlak süre 261 sn. Sekiz ders toplamı değişmedi; hazırlık şeridi toplama girmez.

Kasetin tamamı yeniden sentezlendi. Zaman JSON’unda marka okunuşu `Myuz Spark`. Altyazıda yazım `Muse Spark` ve `IBAN` duruyor.

---

## 3. Hüküm

`tests/academy/prep-strip-audio.test.ts` 11/11 geçti. Eski iki cümle altyazıda yok. Oynatıcı katmanı `article+karaoke`.
