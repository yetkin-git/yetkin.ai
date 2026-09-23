# 01_office_ai — Telefon ekranı ifade düzeltmesi

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Kapsam | Hazırlık şeridi (`01_office_ai-0`) konuşma metni, makale, altyazı. |
| Fırın | Yok. Mühürlü ses yeniden üretilmedi. |

«Telefon numarası isteyen ekranda durabilirsin» durmayı mı, atlamayı mı söylediği belli değildi. Cümle, numaranın zorunlu olmadığını ve adımın atlanabileceğini açık söyler.

---

## 1. Metin

Eski: Telefon numarası isteyen ekranda durabilirsin; zorunlu adım bu şeridin işi değildir.

Yeni: Telefon numarası isteyen ekrana gelirsen numaranı girmek zorunda değilsin, o adımı atlayabilirsin; bu şerit için zorunlu bir adım değildir.

| Yüzey | Dosya |
|-------|--------|
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-0.md` |
| Makale | `lib/academy/curricula/office_ai/prep.ts` — HESAP |
| Altyazı | `lib/academy/lesson-cues/01_office_ai-0.json` — cue-02, HESAP AÇ |

Karaoke altyazısı cue paragrafını basar. Ekranda yeni cümle görünür.

---

## 2. Ses

Fırın yok. Parça saati ve fonetik TTS metni (`lib/academy/lesson-audio-timings/01_office_ai-0.json`) eski kayıttadır. Yayındaki ses hâlâ eski cümleyi okur. Sonraki fırın, stüdyo metnindeki yeni cümleyi sese verir.
