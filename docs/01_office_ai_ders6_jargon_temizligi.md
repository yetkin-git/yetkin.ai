# 01_office_ai — 6. ders tekerleme ve jargon temizliği

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Ders | `01_office_ai-g1` (vatandaş sırası 6, E-Posta Akışı) |
| Kapsam | Giriş soru-cevap ikilisi, teslimat sözü cümlesi, Kaya Gıda kapanış cümlesi |
| Ses | Fırınlanmadı. `01_office_ai-g1.mp3` yerinde duruyor. |

Vatandaş 6. dersin teknik anahtarı `01_office_ai-g1` / `section_g1.ts` dosyasıdır. `section_6.ts` ve `01_office_ai-6` kapanış dersidir (vatandaş sırası 8, Haftalık Sistem); bu üç cümle orada yoktu.

Brief’teki ekran numaraları (224837, 225038, 225313, 225632) depoda kayıtlı değil. Cümleler konuşma metnindeki birebir eşleşmeyle bulundu. Aşağıdaki saatler mühürlü karaoke pencereleridir.

---

## 1. Üç cümle

| Ekran | Saat | Eski | Yeni |
|-------|------|------|------|
| Soru | 26.72–31.00 | Peki neden hâlâ iletiyi ChatGPT'ye kopyalıyorsun? | Peki e-postayı kopyalayıp harici sohbet ekranına yapıştırmak neden yanlıştır? |
| Cevap | 31.00–37.66 | Çünkü kopyalanan gövde kutudan kopar; etiket orada basılmaz. | Çünkü metni kopyaladığında e-postanın tarihi, göndereni ve bağlamı kopar; yapay zekâ konuyu tam anlayamaz. |
| Teslimat sözü | 109.30–113.29 | Tarihi, vaadi ve fiyatı sen kilitlersin. | Tarihi, teslimat sözünü ve fiyatı sen belirlersin. |
| Kaya Gıda | 194.51–200.48 | Kaya Gıda 54.650 ister; bugün kapat. | Kaya Gıda 54.650 TL ödeme onayı istiyor; yanıtı hemen yazıp konuyu kapat. |

Aynı tekerleme, amaç satırında da duruyordu. Orası da vatandaş cümlesine çekildi: «Kopyalanan metin tarihi, göndereni ve bağlamı kaybeder.»

Kelime sayacı 1227 → 1243. Üç cümle uzadı; paragraf sayısı 18 = 18.

---

## 2. Dosyalar

| Dosya | Ne güncellendi |
|-------|----------------|
| `lib/academy/curricula/office_ai/section_g1.ts` | Üç cümle, amaç satırı. `estimatedWordCount` 1243. |
| `lib/academy/spoken-scripts/01_office_ai-g1.md` | Aynı üç cümle. |
| `lib/academy/lesson-cues/01_office_ai-g1.json` | `cue-01` ilk paragraf, `cue-02` ikinci ve dördüncü paragraf. Saatler aynı. |
| `lib/academy/lesson-audio-timings/01_office_ai-g1.json` | Parça 0, 2 ve 4 metni. `start` / `end` / `durationSec` (571.72) değişmedi. |
| `lib/academy/curricula/office_ai/planned.ts` | Müfredat amaç satırındaki «kopyalanan gövde kutudan kopar» cümlesi. |

Karaoke altyazısı cue paragrafını basar. Ayrı bir arayüz dizesi yoktu; Gmail tuvali ve punchcard etiketleri bu cümleleri taşımıyor.

Dokunulmayanlar: `section_6.ts`, `01_office_ai-6.md`, sınav JSON, Gmail sahne tablosu (54.650 TL tahsilat kartı), diğer derslerdeki «kilitlersin» cümleleri.

---

## 3. Ses

Kaset yeniden sentezlenmedi. Mühürlü MP3 hâlâ eski üç cümleyi söyler. Altyazı yeni metni basar. Bir sonraki fırın, konuşma metnini kasete hizalar.

Kelime sayacı, 6. ders senaryosu, makale–konuşma hizası ve karaoke şeridi testleri geçti.
