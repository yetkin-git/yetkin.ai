# 01_office_ai — Muse Spark telaffuz düzeltmesi

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Kapsam | Sese giden metin. Ekran yazımı `Muse Spark` kaldı. |
| Fırın | Yok. Mühürlü WAV yeniden üretilmedi. |

Hazırlık şeridi seslendirmesinde marka adı «kıvılcım» diye okunuyordu. Ses gümrüğü tek başına duran `Spark` sözcüğünü Apache Spark açılımına çeviriyordu: `Kıvılcım Veri İşleme Motoru (Spark)`. Zaman JSON’unda bu açılım `Muse Kıvılcım Veri İşleme Motoru (Spark)` olarak duruyor. Okuyuş oradan geliyor.

Ekranda, altyazıda ve makalede yazım **`Muse Spark`** olarak kaldı.

---

## 1. Ses katmanı

Konuşma metinlerinde (`spoken-scripts`) ifade `Myuz Spark` oldu. `Muz` Türkçede muz diye okunur; `Myuz` markanın /mjuːz/ okunuşunu kilitler.

| Ekran | TTS girdisi |
|-------|-------------|
| `Muse Spark` | `Myuz Spark` |

Fonetik harita (`lib/academy/spoken-scripts/phonetics.ts`) cue’daki `Muse Spark` yazımını fırın anında `Myuz Spark` yapar. Karaoke bu fonetiği geri çevirir; altyazıda `Muse Spark` kalır.

Aynı gümrük `Myuz Spark` içindeki `Spark` sözcüğünü de açmasın diye marka ikilisi kilitlendi (`lib/academy/acronym-normalizer.ts`). `Muse Spark`, `Myuz Spark` ve `Muz Spark` kıvılcım açılımına girmez. Tek başına `Spark` (Apache) açılımı durur.

Dokunulan konuşma metinleri: `01_office_ai-0`, `01_office_ai-1`, `01_office_ai-5`, `01_office_ai-w1`.

Dokunulmayan yüzeyler: makale, kart, sınav, altyazı (`lesson-cues`). Bu yüzeylerde yazım `Muse Spark` olarak kaldı.

---

## 2. Yayındaki ses

Kaset yeniden fırınlanmadı. Hazırlık şeridi (`01_office_ai-0`) ve Word (`01_office_ai-w1`) zaman JSON’unda eski açılım duruyor; yayındaki ses hâlâ o okuyuştur. Altyazı cue metnini basar, bu yüzden ekranda `Muse Spark` görünür.

1. ve 5. ders konuşma metni yeni okunuşu taşır. Bu iki kasetin zaman JSON’unda marka adı yoktur; mühürlü ses eski metinden gelir. Sonraki fırın, sese `Myuz Spark` verir.
