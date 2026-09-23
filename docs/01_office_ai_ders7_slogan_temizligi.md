# 01_office_ai — 7. ders slogan temizliği

| Alan | Değer |
|------|--------|
| Tarih | 23 Eylül 2026 |
| Ders | `01_office_ai-w1` (vatandaş sırası 7, Word ve uzun belge) |
| Kapsam | Giriş soru-cevap, parça parça örnekleri, karşılaştırma cümleleri, Muse Spark okunuşu |
| Ses | Fırınlanmadı. `01_office_ai-w1.mp3` yerinde duruyor. |

Brief’teki ekran numaraları (235048, 235212, 235536, 003024, 003149, 003740, 003932, 004101, 004347) depoda kayıtlı değil. Cümleler konuşma metnindeki birebir eşleşmeyle bulundu. Aşağıdaki saatler mühürlü karaoke pencereleridir.

---

## 1. Cümleler

| Ekran | Saat | Eski | Yeni |
|-------|------|------|------|
| Soru | 41.56–85.68 | Peki neden tüm belgeyi kopyalamak varsayılan yol değildir? | Peki Word dosyasını parça parça kopyalamak neden doğru bir yöntem değildir? |
| Cevap | 41.56–85.68 | Çünkü kopyalanan sayfa dosyadan kopar. Yöntem doğrudan dosya yüklemedir. | Çünkü metni parça parça kopyaladığında belgenin bütünlüğü bozulur; en doğrusu Word dosyasını doğrudan yüklemektir. |
| Sözleşme örneği | 164.24–192.44 | Üç kaybı ayrı ayrı gör. Sözleşmede kayıp ceza oranıdır: sayfa dördü aldın, sayfa on biri unuttun. | Parça parça kopyalarsan önemli maddeleri atlarsın. Örneğin 4. sayfadaki ceza şartını alıp 11. sayfadaki süreyi unuttuğunda analiz eksik kalır. |
| Dilekçe örneği | 164.24–192.44 | Dilekçede kayıp hitaptır: ek listesini bıraktın, talep yarım kalır. | Dilekçeden sadece bir paragraf kopyalarsan, resmi kurum adı ve talep kısmı dışarıda kaldığı için yapay zekâ dilekçeyi tam yorumlayamaz. |
| Analiz | 377.96–401.64 | Gözlem «satır toplamı düştü» der; karar notu «onay ister» der. | Dosyanın tamamını yüklediğinde yapay zekâ ceza şartını, uzatım süresini ve rapor maddelerini tek seferde eksiksiz analiz eder. |
| Kural | 377.96–401.64 | Karıştırırsan imza riski kaybolur. Not dosyanı yükle, istemi ayrı yaz. | Hata yapmamak için kural basittir: Önce Word dosyanı yükle, altına da ne istediğini açıkça yaz. |
| Karşılaştırma | 433.52–455.72 | Sol ekranı satır satır oku: ceza oranı kaçar, hitap kopar, karar notu gözleme karışır. | Parça parça yapıştırmak zaman kaybettirir ve detayları kaçırır; dosyayı tek parçada yüklemek ise sana saniyeler içinde tam analiz verir. |

Soru ile cevap aynı nefes parçasındadır (`cue-02`, parça 1). Sözleşme ve dilekçe örnekleri `cue-03` parça 5’tedir. Analiz ve kural `cue-05` parça 14’tedir. Karşılaştırma `cue-06` parça 16’dadır. Saatler değişmedi.

Kelime sayacı 1130 → 1168. Paragraf sayısı 19 = 19.

El kitabı kenarında «Gözlem «satır toplamı düştü» der; karar notu «onay ister» der.» duruyor. Bu cümle sese gitmiyor; gözlem ile karar notunu ayırma uyarısı. Yeni analiz cümlesi o kenarın anlamını bozardı, o yüzden yerinde bırakıldı.

---

## 2. Muse Spark

Ekranda, altyazıda ve makalede yazım **`Muse Spark`** kaldı.

Sese giden konuşma metni zaten `Myuz Spark` idi. Fonetik harita (`lib/academy/spoken-scripts/phonetics.ts`) `Muse Spark` → `Myuz Spark` kilidini taşıyor. Kısaltma gümrüğü `Myuz Spark` içindeki `Spark` sözcüğünü «Kıvılcım» diye açmıyor.

Mühürlü zaman JSON’unda eski açılım duruyordu: `Muse Kıvılcım Veri İşleme Motoru (Spark)`. Parça 18 (`cue-08`, 497.96–546.04) metni `Myuz Spark` oldu. `start` / `end` / `durationSec` (546.04) değişmedi.

---

## 3. Dosyalar

| Dosya | Ne güncellendi |
|-------|----------------|
| `lib/academy/curricula/office_ai/section_w1.ts` | Yedi cümle. `estimatedWordCount` 1168. |
| `lib/academy/spoken-scripts/01_office_ai-w1.md` | Aynı yedi cümle. Marka okunuşu `Myuz Spark`. |
| `lib/academy/lesson-cues/01_office_ai-w1.json` | `cue-02`, `cue-03`, `cue-05`, `cue-06`. Saatler aynı. Altyazıda `Muse Spark`. |
| `lib/academy/lesson-audio-timings/01_office_ai-w1.json` | Parça 1, 5, 14, 16 metni (Word → Vörd). Parça 18’de kıvılcım açılımı `Myuz Spark`. |

Karaoke altyazısı cue paragrafını basar. Yeni cümleler şeritte `Word` yazımıyla duruyor; `Myuz Spark` ve `Kıvılcım` ekrana çıkmıyor. Word tuvali ve punchcard etiketleri bu cümleleri taşımıyor.

Dokunulmayanlar: sınav JSON, el kitabı kenar cümlesi, diğer derslerdeki Muse Spark yazımı, MP3.

---

## 4. Ses

Kaset yeniden sentezlenmedi. Mühürlü MP3 hâlâ eski cümleleri ve kıvılcım açılımını söyler. Altyazı yeni metni basar. Bir sonraki fırın, konuşma metnini kasete hizalar ve sese `Myuz Spark` verir.

Kelime sayacı, makale–konuşma hizası ve 7. ders senaryo testleri geçti. Oynatıcı oturum duvarının arkasında; tarayıcıda tıklama doğrulaması yapılmadı. Karaoke şeridi yeni cümleleri ve ekran yazımı `Muse Spark`ı basıyor.
