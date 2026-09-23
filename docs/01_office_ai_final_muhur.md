# 01_office_ai — Son mühür

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026, 09:29 TSİ |
| Dayanak | Kota kalktıktan sonraki birincil model fırını. Sabahki kota notu (`docs/01_office_ai_final_mühür.md`) bu turla kapanır. |
| Model | `gemini-3.1-flash-tts-preview` (Callirrhoe) |
| Yedek | Kapalı. `--no-fallback`. `gemini-2.5-flash-preview-tts` çağrılmadı. |
| Sonuç | **Üç kaset birincil modelle mühürlendi.** Word, Cuma ve hazırlık şeridi. |

Allowlist’e `01_office_ai-4` yazılmadı. Kapalı altı kaset (`1`, `k1`, `2`, `3`, `5`, `g1`) yeniden sentezlenmedi.

---

## 1. Copilot / ataş ayrımı (1. ders)

Stüdyo metnine işlenen cümle:

> Copilot düğmesi varsa Excel dosyanın içindeki hücreleri doğrudan düzenler. Copilot'ın yoksa dosyayı ataşla sohbete yüklersin; yapay zekâ orijinal dosyanı değiştiremez, ancak sana verileri temizlenmiş yepyeni bir tablo verir. Sen de o tabloyu kopyalar, Excel'ine yapıştırırsın.

Operatör cümlesindeki «düğmen» yazımı, müfredattaki «düğmesi» biçimine çekildi.

| Yüzey | Yer |
|-------|-----|
| Ders gövdesi | `section_1.ts` — Üç Kapı paragrafı ve el kitabı «Lisans yoksa» |
| Konuşma metni | `spoken-scripts/01_office_ai-1.md` — 9. paragraf |
| Önizleme | `office-ai-guide-preview.tsx` — üç kapı |
| Sahne kartı | `cinema-cue-catalog.ts` — TEMİZLE ŞİMDİ alt yazı ve 7. yanıt satırı |
| Pratik adım | `lesson-practice.ts` — 1. ders 3. adım |

Kelime sayacı 1529 → 1599. Paragraf sayısı 15 = 15 kaldı.

---

## 2. 1. ders ses kontrolü

Kaset yeniden fırınlanmadı. Süre **653.88 sn (10.90 dk)**; cue ve zaman JSON bu WAV’a kilitli duruyor.

Konuşma metninin 9. paragrafı yeni ayrımı taşıyor. Cue’nun 9. paragrafı eski Üç Kapı cümlesinde. Diğer 14 paragraf hâlâ birebir. Karaoke mühürlü sesi izler; yeni cümle henüz sesli kasetin içinde değildir.

`k1`, `2`, `3`, `5`, `g1` metnine ve sesine dokunulmadı.

---

## 3. Fırın

Kuru tarama, sonra `--seal --confirm-gemini-spend --force --no-db --no-fallback`. Çıkış kodu 0. Yedek modele düşülmedi.

| Anahtar | Paragraf | İstek | Saniye | Dakika | Cue sonu | Model |
|---------|----------|-------|--------|--------|----------|--------|
| `01_office_ai-w1` | 19 | 19 | 532.84 | 8.88 | 532.84 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-6` | 18 | 18 | 494.88 | 8.25 | 494.88 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-0` | 8 | 8 | 249.52 | 4.16 | 249.52 | `gemini-3.1-flash-tts-preview` |

Cue `start`/`end` ve `lesson-audio-timings` son perde, WAV süresiyle kilitlendi. Hazırlık şeridi 8 ders sayısına alınmadı.

Önceki yedek-model süreleri: Word 495.168 sn, Cuma 462.837 sn, şerit 233.368 sn.

---

## 4. Sekiz ders bandı

Alt sınır 420 sn, üst sınır 720 sn.

| Sıra | Anahtar | Saniye | Dakika | Bant |
|------|---------|--------|--------|------|
| 1 | `01_office_ai-1` | 653.88 | 10.90 | içinde |
| 2 | `01_office_ai-k1` | 623.04 | 10.38 | içinde |
| 3 | `01_office_ai-2` | 530.16 | 8.84 | içinde |
| 4 | `01_office_ai-3` | 540.52 | 9.01 | içinde |
| 5 | `01_office_ai-5` | 551.92 | 9.20 | içinde |
| 6 | `01_office_ai-g1` | 571.72 | 9.53 | içinde |
| 7 | `01_office_ai-w1` | 532.84 | 8.88 | içinde |
| 8 | `01_office_ai-6` | 494.88 | 8.25 | içinde |

Toplam **4498.96 sn ≈ 74.98 dk**. Hazırlık şeridi (249.52 sn) toplama girmez. `01_office_ai-4` allowlist’te yok.

`targetDurationMinutes`: Word 8.3 → 8.9, Cuma 7.7 → 8.2. Yuvarlak süre tablosu: Word 533, Cuma 495.

---

## 5. Mühür hükmü

Word, Cuma kapanış ve hazırlık şeridi birincil modelde. Sekiz ders 7–12 dakika bandında.

1. dersin yeni Copilot/ataş cümlesi makalede, konuşma metninde ve önizlemede durur. Sesli kaseti bu cümleyi henüz söylemez; bir sonraki 1. ders fırını cue paragraf 9’u hizalar.
