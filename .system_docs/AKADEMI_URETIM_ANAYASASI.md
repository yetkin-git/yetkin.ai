# YETKİN.Aİ AKADEMİ EĞİTİM ÜRETİM VE MEDYA ANAYASASI (SOP)

**Statü:** Akademi eğitim hazırlama prosedürünün, bütçe güvenlik kalkanının ve model mühürlerinin tek yetkili kanonik kılavuzudur.

**Kapsam:** `yetkin.ai` platformundaki tüm eğitimlerin mimari kod yapısı, metin, ses, görsel, video, müzik üretimi, API bütçe güvenliği ve satış onay mekanizması.

**Sorumlu:** SUPER_ADMIN (SUPER_ADMIN_USER_ID)

**Mimari Ad:** Anayasa B1 — Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci.

---

## BÖLÜM 1 — BÜTÇE KORUMALI MİMARİ ÖN ŞART (SAYFA SIFIR GÜVENLİK KAPISI)

Bir eğitim klasörü açıldığında veya revizyona girildiğinde, **HERHANGİ BİR API İSTEĞİ (TTS, Görsel, LLM) ATILMADAN ÖNCE** aşağıdaki mimari şartların ücretsiz (zero-cost) olarak kodlanması ZORUNLUDUR:

1. **Modüler Kod Tamlığı (Free-Tier Work):**
   * Eğitimin bulunduğu `lib/academy/curricula/[slug]/` dizini altında ders bazlı modüler kod yapısı (`section_1.ts`, `section_2.ts` ... `section_N.ts`), `index.ts`, `sections.ts`, `spoken-body.ts` ve `cinema-slides.ts` dosyaları **eksiksiz kodlanmalıdır**.
   * Kod mimarisi kurulmadan, `npm run verify:prebuild` ve TypeScript derlemesi geçmeden **HİÇBİR API FIRINLAMA SCRIPT'İ ÇALIŞTIRILAMAZ**.

2. **Master-Admin Bütçe Mandalı:**
   * Agent, dry-run (simülasyon) modunda mimariyi doğrulamadan ve Super Admin'den açıkça **"API Harcama Onayı"** almadan tek bir cent'lik API isteği başlatamaz.
   * `402 RESOURCE_EXHAUSTED` veya Kota Hatası alındığında agent duracaktır. "Sistemi test edeyim" veya "Önbellek bypass edeyim" bahanesiyle dairesel API çağrısı yapılması KESİNLİKLE YASAKTIR.

---

## BÖLÜM 2 — SUPER ADMIN MODEL HAKİMİYETİ VE SSOT MÜHÜRLERİ

Google AI Studio üzerindeki canlı model adları Super Admin mühürüdür. Yapay zekâ ajanının bilgi kesim tarihi (knowledge cutoff) bu adları bilmeyebilir; bilgi sınırı gerekçe gösterilerek model değiştirilemez.

**Bilgi Kesim Kilidi:** Ajan, aşağıdaki kimlikleri "böyle bir model yok" diyerek silemez, `gemini-2.5` ve daha eski sürümlere düşüremez (fallback). Kota, 404 veya "model bulunamadı" yanıtı alt model açmaz; işlem **fail-closed** olarak durur.

### 2.1 Kilitli Model Haritası

| Katman / Görev | Yetkili Model ID | Kod Rolü | Yetki Sınırı ve Kuralı |
| --- | --- | --- | --- |
| **Metin Senaryo Üretimi** | `gemini-3.8-flash` | `TEXT_GEN` | Ders akışı, prompt şablonları ve fonetik metin hazırlığı. |
| **Metin Denetimi & İnceleme** | `Cursor / Grok 4.7` | - | Pedagoji, jargon, aforizma ve slogan taraması. |
| **Ses Mührü (TTS)** | `gemini-3.8-flash-tts` | `VOICE_TTS` | Eğitim seslendirmesi. Fırın her zaman bu modeli okur. |
| **Görsel Katmanı** | `gemini-3.1-flash-image` / Nano Banana 2 | `IMAGE_GEN` | 16:9 4K uygulama ve rehber kartları. |
| **Fon Müziği** | `lyria-3.5` | `MUSIC_GEN` | Vokalsiz, 44.1 kHz stereo ambient müzik yatağı (-22 dB ducking). |
| **Canlı Sohbet Asistanı** | `gemini-3.8-live` | `FAST_STREAM` | Platform içi düşük gecikmeli canlı sohbet. |
| **Isınma Videosu** | `Super Admin (Manuel)` | `VIDEO_GEN` | Manuel üretilir, `.mp4` olarak konur. Otomatik API çağrısı yapılmaz (Ölü yuva). |

Kod karşılığı `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` nesnesidir.

---

## BÖLÜM 3 — AŞAMA KAPILI (STAGE-GATED) ÜRETİM PROSEDÜRÜ

Eğitim hazırlama süreci 5 sıralı fazdan oluşur. Hiçbir aşama atlanamaz, "Hepsini tek seferde fırınla" talimatı uygulanamaz.


```

[AŞAMA 0: MİMARİ KOD & SIFIR API]
│
▼
[FAZ 1: METİN] ──> [FAZ 2: SES] ──> [FAZ 3: ISINMA VİDEO] ──> [FAZ 4: GÖRSEL & MÜZİK] ──> [FAZ 5: FİZİKİ MÜHÜR]

```

1. **AŞAMA 0: MİMARİ VE SIFIR API KONTROLÜ:** Eğitimin `section_1.ts` - `section_N.ts` modülleri kodlanır, `index.ts` ve `sections.ts` bağı kurulur. Derleme yeşil yanmadan API aşamasına geçilemez.
2. **FAZ 1: METİN & PEDAGOJİK VURGU (Usta-Çırak Personası):** 
   * "Deniz Usta / Tezgâh" dili kullanılır. Ajans sloganı yasaktır. Metin kırpılmaz.
   * **Vurgu ve Doğal Okunuş Standartları:** Metindeki kritiği yüksek uyarılar ("satış olmaz", "ürün kaybolur") düz ve monoton okunamaz; ses tonu ve enerjisi kararlı, usta vurgusuyla fırınlanır. Jargon içeren kelimeler harf kodlamasıyla değil, doğal okunuşla (`SEO` -> `Seo`) mühürlenir. Ekran/Altyazı metinlerinde ölçü ve sayılar rakamla (`50x70 cm`, `2 adet`), sese giden fonetik metinde ise okunuşuyla yazılır.
3. **FAZ 2: SES:** Yalnızca Faz 1 ve Aşama 0 kilitliyken açılır. `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` (`gemini-3.8-flash-tts`) okunur. Eğitimin ses karakteri (`courseMasterVoice`: Zephyr, Callirrhoe vb.) kurs boyunca kilitlidir.
4. **FAZ 3: ISINMA VİDEOSU:** Yalnızca mühürlü ses diskteyken açılır. `public/media/academy/micro/*-warmup.mp4` kaseti manuel koyulur.
5. **FAZ 4: GÖRSEL VE MÜZİK:** Yalnızca ısınma kaseti yerindeyken açılır. Görsel istemlerinde negatif İngilizce kelime listeleri kullanılmaz; tek parça temiz 16:9 görseller fırınlanır. Müzik yatağı (`lyria-3.5`) eklenir.
6. **FAZ 5: FİZİKİ DİSK MÜHRÜ VE SATIŞ MANDALI:** 5 katman diskte fiziken durmadan mühür basılmaz. `assertAcademyProductionSeal` ve `academyCourseSaleOpen` aynı fiziki diske bakar.

---

## BÖLÜM 4 — HARD FAIL-CLOSED (SIRTINI DİSKE DAYAYAN KAPI)

Sistem kâğıt üstündeki beyanlara veya agent'ın "hallettim" raporlarına inanmaz. Satış kapısı (`academyCourseSaleOpen`) ve üretim mührü (`assertAcademyProductionSeal`) ancak ve ancak **5 MEDYA KATMANI DİSKTE FİZİKSEL OLARAK MEVCUTSA** açılır:

1. **Konuşma Metni** (`.md` / `.json`)
2. **Mühürlü Ses Dosyası** (`.mp3` / `.wav`)
3. **Isınma Video Kaseti** (`.mp4`)
4. **Uygulama Görselleri** (`.jpg` — `public/academy/cinema/` altında)
5. **Fon Müziği Yatağı** (`.bed.mp3`)

**Sıfır Fallback Kuralı:** Modellerden biri API'de yanıt vermezse veya dosyalardan biri diskte eksikse, sistem sessizce alt modele geçemez, sahte mühür basamaz. Sistem HATA VERİR VE DURUR (Fail-Closed).

```
