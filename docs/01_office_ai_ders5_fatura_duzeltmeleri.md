# 01_office_ai — 5. ders fatura ve değer düzeltmeleri

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Ders | `01_office_ai-5` (vatandaş sırası 5, İstisnalar ve Hata Avı) |
| Kapsam | Çapraz kontrol ve fark ekranındaki üç altyazı cümlesi |
| Ses | Fırınlanmadı. `01_office_ai-5.mp3` yerinde duruyor. |

İş hayatındaki gerçeklik «olmayan fatura» değil, kaynak evrakı olan bir faturanın yanlış işlenmiş tutarıdır. Üç cümle bu ayrıma çekildi. Dersin geri kalanındaki halüsinasyon anlatımı (uydurma sayı, uydurma satır) duruyor.

---

## 1. Üç cümle

| Ekran | Eski | Yeni |
|-------|------|------|
| Çapraz kontrol, sol panel | Yapay zekâ olmayan bir faturayı gerçek gibi listeye eklemiş. | Yapay zekâ gerçek bir faturanın tutarını yanlış işledi. |
| Çapraz kontrol, sağ panel | …kaynak evrakta böyle bir sipariş yok. | …kaynak evrakta böyle bir değer yok. |
| Fark ortada | …biri uydurma fatura, diğeri kilitli sayı. | …biri hatalı fatura, diğeri kilitli sayı. |

Kelime sayacı 1144 → 1143. Birinci cümle bir kelime kısaldı; diğer ikisi birebir uzunlukta.

---

## 2. Dosyalar

| Dosya | Ne güncellendi |
|-------|----------------|
| `lib/academy/curricula/office_ai/section_5.ts` | Compact makale, ÇAPRAZ KONTROL ve FARK ORTADA paragrafları. `estimatedWordCount` 1143. |
| `lib/academy/spoken-scripts/01_office_ai-5.md` | Aynı üç cümle. Paragraf sayısı 14 = 14. |
| `lib/academy/lesson-cues/01_office_ai-5.json` | `cue-05` iki paragraf, `cue-06` ilk paragraf. Saatler aynı. |
| `lib/academy/lesson-audio-timings/01_office_ai-5.json` | Parça 7, 8 ve 9 metni. `start` / `end` / `durationSec` (552.6) değişmedi. |

Karaoke altyazısı mühürlü parça saatinde cue paragrafını basar. Bu dört yüzey aynı cümleyi taşır; ekrandaki şerit cue metnini okur.

Dokunulmayanlar: sınav JSON, sahne tablosu (21.500 / 12.500 / 50.450), punchcard etiketleri, el kitabı, diğer dersler.

---

## 3. Ses

Kaset yeniden sentezlenmedi. Mühürlü MP3 hâlâ eski üç cümleyi söyler. Altyazı yeni metni basar. Bir sonraki fırın, konuşma metnini kasete hizalar.

Altyazı pencereleri (saniye, mühürlü saat):

| Pencere | Ekranda duran cümle |
|---------|---------------------|
| 295.31–313.13 | Yapay zekâ gerçek bir faturanın tutarını yanlış işledi. |
| 333.34–349.56 | …kaynak evrakta böyle bir değer yok. |
| 379.21–390.44 | …biri hatalı fatura, diğeri kilitli sayı. |

Kelime sayacı, 5. ders senaryosu ve makale–konuşma hizası testleri geçti. Oynatıcı oturum duvarının arkasında; bu turda giriş yapılmadı.
