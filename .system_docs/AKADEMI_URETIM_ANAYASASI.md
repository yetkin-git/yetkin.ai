# YETKİN.Aİ AKADEMİ EĞİTİM ÜRETİM VE MEDYA ANAYASASI

**Statü:** Pedagoji kapısının kısa yüzü. Üçüncü anayasa değildir. Model kimliği, tempo ve desibel burada yoktur; ev `lib/kernel/ai/model-roles.ts`, `lib/academy/production-standard.ts`, `lib/academy/tts-loudnorm.ts` ve `lib/academy/lesson-bed-duck.ts`.

**Kapsam:** `yetkin.ai` platformundaki tüm eğitimlerin metin, ses, görsel, video, müzik üretimi ve satış onay mekanizması.

**Sorumlu:** Super Admin

**Mimari ad:** Anayasa B1 — Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci.

---

## BÖLÜM 1 — MODEL KİMLİĞİ TEK KAYNAK

Platform üzerindeki model kimlikleri tek bir merkezden okunur: `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` ve rol haritası (`TEXT_GEN`, `VOICE_TTS`, `IMAGE_GEN`, `MUSIC_GEN`, `FAST_STREAM`).

Bu belgede model kimliği tablosu yoktur. Ajan, betik veya Cursor kendi bilgi sınırına dayanarak model adını düzeltmez, değiştirmez ve alt modele düşmez. Alt modele düşüş `assertAcademySealedMediaModel` ile durur. Kimlik değişince bu felsefe metni yeniden yazılmaz; beş medya katmanı ve pedagoji durur.

Isınma videosu otomatik video API ile üretilmez. Super Admin kaseti elle koyar. Dosya adı ve yol `lib/academy/lesson-veo.ts` içindedir.

---

## BÖLÜM 2 — AŞAMA KAPILI (STAGE-GATED) ÜRETİM SIRASI

Beş medya katmanının tanımı `.system_docs/PEDAGOJI.md` §B «Zorunlu üretim sırası» ve Anayasa B4 karar tablosudur. Bu kart o listeyi yeniden yazmaz. Hiçbir eğitim katmanı bir öncekini atlayarak fırınlanamaz. "Hepsini tek seferde fırınla" talimatı verilemez.

```
[FAZ 1: METİN] ──> [FAZ 2: SES] ──> [FAZ 3: ISINMA VİDEO] ──> [FAZ 4: GÖRSEL & MÜZİK] ──> [FAZ 5: FİZİKİ MÜHÜR]

```

1. **FAZ 1: METİN (Usta-Çırak Personası):** Anlatıcı üstenci veya akademik bir dil kullanmaz. Dükkânı, depoyu, kargo iadesini ve akşam bilgisayar karşısındaki satıcıyı bilen "Deniz Usta / Tezgâh" dilidir. Ajans sloganı ("muazzam dönüşüm", "büyü burada başlıyor") yasaktır.
2. **FAZ 2: SES:** Fırın `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` kimliğini okur. Eğitime özel seçilen ses karakteri (`courseMasterVoice`) kurs boyunca kilitlidir; dersler arası değiştirilemez. Ev `lib/academy/instructors.ts`.
3. **FAZ 3: ISINMA VİDEOSU:** B-roll ısınma kaseti `public/media/academy/micro/*-warmup.mp4` olarak yerel dizine koyulur. Otomatik video API çağrısı yapılmaz.
4. **FAZ 4: GÖRSEL VE MÜZİK:** Görsel rolü `IMAGE_GEN`, müzik rolü `MUSIC_GEN` okur. Sayı ve ducking `lib/academy/production-standard.ts` ile `lib/academy/lesson-bed-duck.ts` içindedir.
5. **FAZ 5: FİZİKİ DISK MÜHRÜ VE SATIŞ MANDALI:** `assertAcademyProductionSeal` fonksiyonu devreye girer.

---

## BÖLÜM 3 — HARD FAIL-CLOSED (SIRTINI DİSKE DAYAYAN KAPI)

1. ve 2. kontrol kapısı operatör disiplinidir (PEDAGOJI §B). 3. kapı koddur. Sistem kâğıt üstündeki beyanlara veya "hallettim" raporlarına inanmaz. Satış kapısı (`academyCourseSaleOpen`) ve üretim mührü (`assertAcademyProductionSeal`) ancak ve ancak **PEDAGOJI §B’deki 5 MEDYA KATMANI DISKTE FİZİKSEL OLARAK MEVCUTSA** açılır:

1. Konuşma Metni (`.md` / `.json`)
2. Mühürlü Ses Dosyası (`.mp3` / `.wav`)
3. Isınma Video Kaseti (`.mp4`)
4. Uygulama Görselleri (`.jpg` - `public/academy/cinema/` altında)
5. Fon Müziği Yatağı (`.bed.mp3`)

**Sıfır Fallback Kuralı:** Modellerden biri API'de yanıt vermezse veya dosyalardan biri diskte eksikse, sistem sessizce alt modele geçemez, sahte mühür basamaz. **Sistem HATA VERİR VE DURUR (Fail-Closed).**

---