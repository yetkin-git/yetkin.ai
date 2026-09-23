# 01_office_ai — 8. ders slogan temizliği

| Alan | Değer |
|------|--------|
| Tarih | 23 Eylül 2026 |
| Ders | `01_office_ai-6` (vatandaş sırası 8, Haftalık Sistem) |
| Kapsam | İmza cümlesi, Cuma takvimi, rutin uyarısı, özet sırası |
| Ses | Fırınlanmadı. `01_office_ai-6.mp3` yerinde duruyor. |

Brief’teki ekran numaraları (013033, 013228, 013354, 013759) depoda kayıtlı değil. Cümleler konuşma metnindeki birebir eşleşmeyle bulundu. Brief’te «talvimine» yazıyordu; kaynakta karşılığı `Cuma 30'u takvimine` idi. Aşağıdaki saatler mühürlü karaoke pencereleridir.

---

## 1. Cümleler

| Ekran | Saat | Eski | Yeni |
|-------|------|------|------|
| İmza | 2.00–38.16 | İmza insanda kaldı. | İmza sende kaldı. |
| Takvim | 2.00–38.16 | Bu dersin sonunda Cuma 30'u takvimine yazıp üç bloğu kapatmayı tek başına yapacaksın. | Bu dersin sonunda Cuma günkü 30 dakikalık takvime yazıp üç bloğu kapatmayı tek başına yapacaksın. |
| Rutin | 2.00–38.16 | Alışkanlık takvime bağlı değilse kriz masayı sıfırlar. | Bu 30 dakikalık rutini takvimine işlemezsen, haftalık işler birikir ve kriz kaçınılmaz olur. |
| Özet | 153.72–189.28 | Çünkü temizlik bitmeden özet uydurur; özet bitmeden kutu sıfırlanmaz. | Çünkü veriyi temizlemeden özet istersen yapay zekâ uydurur; özetini alıp işini bitirmeden de ekranı kapatmamalısın. |

İmza, takvim ve rutin aynı nefes parçasındadır (`cue-01`, parça 0). Özet cümlesi `cue-04` parça 0’dadır (mühür indeksi 5). Saatler değişmedi.

Kelime sayacı 1087 → 1101. Paragraf sayısı 18 = 18.

Üç blokta duran «Slayt kutudan önce gelir: özet bitmeden kutu sıfırlanmaz.» ayrı bir sıra cümlesidir; brief’teki özet sloganı değildi, yerinde bırakıldı. El kitabı kenarında «temizlik bitmeden özet istemek» duruyor. Bu cümle sese gitmiyor; A1 kurulmadan slayt uyarısı. Yeni özet cümlesi o kenarın anlamını bozardı, o yüzden yerinde bırakıldı.

---

## 2. Dosyalar

| Dosya | Ne güncellendi |
|-------|----------------|
| `lib/academy/curricula/office_ai/section_6.ts` | Dört cümle. `estimatedWordCount` 1101. |
| `lib/academy/spoken-scripts/01_office_ai-6.md` | Aynı dört cümle. |
| `lib/academy/lesson-cues/01_office_ai-6.json` | `cue-01` paragrafı ve `cue-04` ilk paragraf. Saatler aynı. |
| `lib/academy/lesson-audio-timings/01_office_ai-6.json` | Parça 0 ve parça 5 metni. `start` / `end` / `durationSec` (487.12) değişmedi. |

Karaoke altyazısı cue paragrafını basar. Yeni cümleler şeritte vatandaş yazımıyla duruyor; `Vörd`, `Kavekaka` ve `Kopilot` ekrana çıkmıyor. Cuma tuvali, punchcard etiketleri ve «Cuma 30'u takvime yaz» cebine koy adımı bu dört cümleyi taşımıyor.

Dokunulmayanlar: sınav JSON, el kitabı kenar cümlesi, «özet bitmeden kutu sıfırlanmaz» sıra cümlesi, MP3.

---

## 3. Ses

Kaset yeniden sentezlenmedi. Mühürlü MP3 hâlâ eski dört cümleyi söyler. Altyazı yeni metni basar. Bir sonraki fırın, konuşma metnini kasete hizalar.

Kelime sayacı, makale–konuşma hizası ve 8. ders senaryo testleri geçti. Oynatıcı oturum duvarının arkasında; tarayıcıda tıklama doğrulaması yapılmadı. Karaoke şeridi yeni cümleleri basıyor.
