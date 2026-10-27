# YETKİN.Aİ AKADEMİ EĞİTİM ÜRETİM VE MEDYA ANAYASASI (SOP)

**Statü:** Akademi eğitim hazırlama prosedürünün, bütçe güvenlik kalkanının ve model mühürlerinin tek yetkili kanonik kılavuzudur.

**Kapsam:** `yetkin.ai` platformundaki tüm eğitimlerin mimari kod yapısı, metin, ses, görsel, video, müzik üretimi, API bütçe güvenliği ve satış onay mekanizması.

**Sorumlu:** SUPER_ADMIN (SUPER_ADMIN_USER_ID)

**Mimari Ad:** Anayasa B1 — Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci.

---

## BÖLÜM 1 — BÜTÇE KORUMALI MİMARİ ÖN ŞART (SAYFA SIFIR GÜVENLİK KAPISI)

Bir eğitim klasörü açıldığında veya revizyona girildiğinde, **HERHANGİ BİR API İSTEĞİ (TTS, Görsel, LLM) ATILMADAN ÖNCE** aşağıdaki mimari şartların ücretsiz (zero-cost) olarak kodlanması ZORUNLUDUR:

### 1.1 Konuşma metninin fırın yolu

Konuşma metninin tek yazarlık evi `lib/academy/spoken-scripts/<ders>.md` dosyasıdır. Fırın
(`scripts/generate-academy-lesson-audio.ts`) bu markdown'ı `loadAcademySpokenScriptMarkdownParagraphs`
ile okur; markdown yoksa `lib/academy/lesson-cues/<ders>.json` paragraflarına düşer. İki yol da
`lib/academy/spoken-scripts/index.ts` içindedir.

Dersin katalog/oynatıcı kimliği `lib/academy/curricula/lesson-index.ts`, sahne ve slayt verisi
`lib/academy/curricula/<kurs>/cinema-slides.ts` içindedir. `lib/academy/curricula/<kurs>/` altındaki
`section_N.ts` dosyaları **sınav yolu ve ders gövdesi** içindir (compact makale + mühürlü `spokenScript`);
bunlar konuşma fırınının kaynağı değildir.

> **Ölçülmüş gerçek (26 Ekim 2026):** `lib/academy/curricula/**` altındaki 77 dosyanın 77'si
> canlı kod yolundan erişilebilir. 10 dosya yalnız test ağacından erişilir; bunlar bilinçli olarak
> ayrı duran `phase2-drafts/parent_teacher_ai` ada dosyalarıdır (ürün yolu değildir, test bekçisi vardır).
> Bu dizin **ölü değildir**; "44 ölü dosya" iddiası ölçümle çürütülmüştür.

**Zorunlu sıra:**

1. Konuşma metni `lib/academy/spoken-scripts/<ders>.md` içine yazılır (UTF-8, BOM'suz).
2. Ders gövdesi ve slaytlar `lib/academy/curricula/<kurs>/` altında tamamlanır.
3. `npx tsc --noEmit` ve `npm run verify:prebuild` **sıfır hatayla** geçer.

Bu üç adım bitmeden **HİÇBİR API FIRINLAMA SCRIPT'İ ÇALIŞTIRILAMAZ**.

### 1.2 Master-Admin bütçe mandalı

- Agent, dry-run (simülasyon) modunda mimariyi doğrulamadan ve Super Admin'den açıkça **"API Harcama Onayı"** almadan tek bir cent'lik API isteği başlatamaz.
- `402 RESOURCE_EXHAUSTED` veya kota hatası alındığında agent duracaktır. "Sistemi test edeyim" veya "Önbellek bypass edeyim" bahanesiyle dairesel API çağrısı yapılması KESİNLİKLE YASAKTIR.

---

## BÖLÜM 2 — SUPER ADMIN MODEL HAKİMİYETİ VE SSOT MÜHÜRLERİ

Google AI Studio üzerindeki canlı model adları Super Admin mühürüdür. Yapay zekâ ajanının bilgi kesim tarihi (knowledge cutoff) bu adları bilmeyebilir; bilgi sınırı gerekçe gösterilerek model değiştirilemez.

**Bilgi Kesim Kilidi:** Ajan, aşağıdaki kimlikleri "böyle bir model yok" diyerek silemez, `gemini-2.5` ve daha eski sürümlere düşüremez (fallback). Kota, 404 veya "model bulunamadı" yanıtı alt model açmaz; işlem **fail-closed** olarak durur.

### 2.1 Kilitli Model Haritası ve Görev Dağılımı

| Aşama / Katman | Yetkili Model ID | Kod Rolü | Görev ve Yetki Sınırı |
| --- | --- | --- | --- |
| **Aşama 0: Kod Mimarisi** | `Sıfır API / TypeScript` | - | Modüler dosya yapısı, UTF-8 kontrolü ve prebuild doğrulaması. |
| **Aşama 1-A: Metin Senaryo** | `gemini-3.8-flash` | `TEXT_GEN` | Ders akışı, örnek iş senaryoları ve fonetik metin hazırlığı. Yetkili üretim modeli yalnız bu kimliktir. |
| **Aşama 1-B: Metin Denetim** | `Cursor / Grok 4.7` | - | Pedagoji, jargon, aforizma, slogan temizliği ve UTF-8 süzgeci. Denetim ajanıdır. `TEXT_GEN` değildir. |
| **Aşama 2: Ses Mührü (TTS)** | `gemini-3.8-flash-tts` | `VOICE_TTS` | Eğitim seslendirmesi. Fırın her zaman bu kilitli ses karakterini okur. |
| **Aşama 3: Isınma Videosu** | `Super Admin (Manuel)` | `VIDEO_GEN` | Manuel üretilir, `.mp4` olarak konur. Otomatik API çağrısı yapılmaz. |
| **Aşama 4-A: Görsel Katmanı**| `gemini-3.1-flash-image` / Nano Banana 2 | `IMAGE_GEN` | 16:9 4K uygulama ve rehber sinema kartları. Yetişkin ders görseli. |
| **Junior kapak** | `gemini-3.1-flash-lite-image` / Nano Banana 2 Lite | `JUNIOR_COVER_GEN` | 6. sınıf çekirdek 105 konu kapağı. Yetişkin `IMAGE_GEN` bunun yerine yazılmaz. Çıkış `public/media/junior/covers/`. |
| **Aşama 4-B: Fon Müziği** | `lyria-3.5` | `MUSIC_GEN` | Vokalsiz, 44.1 kHz stereo ambient müzik yatağı (-22 dB ducking). |
| **Platform Canlı Sohbet** | `gemini-3.8-live` | `FAST_STREAM` | Platform içi düşük gecikmeli canlı sohbet asistanı. |

Kod karşılığı `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` nesnesidir.

---

## BÖLÜM 3 — AŞAMA KAPILI (STAGE-GATED) ÜRETİM PROSEDÜRÜ

Eğitim hazırlama süreci 6 sıralı aşamadan oluşur. Bir aşama bitmeden, testten geçmeden ve doğrulama vermeden sonraki aşamaya geçilemez. "Hepsini tek seferde fırınla" talimatı KESİNLİKLE UYGULANAMAZ.

┌───────────────────────────────────────────────────────────────────────────┐
│ AŞAMA 0: MİMARİ KOD & SIFIR API (TypeScript, UTF-8, Dosya Yapısı)         │
├───────────────────────────────────────────────────────────────────────────┤
│ AŞAMA 1: METİN SÜRECİ (1-A: gemini-3.8-flash / 1-B Denetim: Cursor)     │
├───────────────────────────────────────────────────────────────────────────┤
│ AŞAMA 2: SES FIRINLAMA (Model: gemini-3.8-flash-tts)                      │
├───────────────────────────────────────────────────────────────────────────┤
│ AŞAMA 3: ISINMA VİDEOSU (Sözsüz Kaset - Manuel MP4)                       │
├───────────────────────────────────────────────────────────────────────────┤
│ AŞAMA 4: GÖRSEL VE MÜZİK (Görsel: gemini-3.1-flash-image / lyria-3.5)    │
├───────────────────────────────────────────────────────────────────────────┤
│ AŞAMA 5: FİZİKİ DİSK MÜHRÜ VE SATIŞ MANDALI (5 Katman Doğrulaması)        │
└───────────────────────────────────────────────────────────────────────────┘

### 1. AŞAMA 0: MİMARİ KOD KONTROLÜ (Sıfır API / Zero-Cost)
- Konuşma metni `lib/academy/spoken-scripts/<ders>.md` içine yazılır (Bölüm 1.1).
- Ders gövdesi, sahne ve slaytlar `lib/academy/curricula/<kurs>/` altında tamamlanır.
- Tüm dosyalar kesin olarak **UTF-8 (BOM'suz)** biçiminde kaydedilir.
- `npx tsc --noEmit` ve `npm run verify:prebuild` komutları çalıştırılır. SIFIR HATA alınmadan API çağrılamaz.

### 2. AŞAMA 1: METİN VE PEDAGOJİK SÜREÇ
- **Aşama 1-A (Metin Senaryo Üretimi - TEXT_GEN):** Yalnız `gemini-3.8-flash` kullanılarak ders senaryoları kaleme alınır. Denetim ajanı (Cursor / Grok) bu rolün yerine geçmez.
  - **Sert Tabanlar (Fail-Closed):** Eğitimin toplam ders sayısı **EN AZ 6 BÖLÜM** (`ACADEMY_AI_LESSON_COUNT_MIN = 6`), her dersin konuşma metni (`spokenScript`) **EN AZ 600 KELİME** (`ACADEMY_AI_LESSON_SPOKEN_WORD_MIN = 600`) olmak zorundadır (Ders başı minimum 5 dakikalık anlatım).
  - **1. Ders Oryantasyon Standardı:** 1. dersin açılışı selamlamanın ardından 3 soruyla yapılır: *1. Neredeyiz? 2. Bu Seride Ne Yapacağız? 3. Bugün Elimize Ne Geçecek?*
  - **Ders Bağlantı Köprüleri:** 2. dersten itibaren robotik özetler ("Geçen derste...") yasaktır. Önceki dersin pratik kazanımı insani bir cümleyle hatırlatılarak doğrudan konuya girilir.
- **Aşama 1-B (Metin Denetimi & İnceleme - Cursor / Grok 4.7 — Tek Açık Dil İlkesi):**
  - **Ajans Sloganı / Aforizma Yasağı (`ACADEMY_LESSON_HYPERBOLE_PHRASES`):** Yapay pazarlama şovları ("muazzam dönüşüm", "saniyeler içinde", "mucizevi yöntem", "devrim niteliğinde", "büyü burada başlıyor"), robotik açılışlar ve ders metni içindeki "Masterclass / mühürlü" gibi vitrin etiketleri taranıp temizlenir.
  - **Bağlama Uygun Kapanış Standardı (`PEDAGOJI.md` §A.2.2 ile Hizalı):** Kapanış cümlesi kursun sahasına bağlanır; tek kalıp her derse zorla dayatılmaz. Genel ve ofis eğitimlerinde insani veda (*"Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak."*) kullanılır; usta-çırak tezgâh kapanışı (*"Tezgâhın bereketli olsun. Satışın hayırlı gelsin."* — `ACADEMY_LESSON_BENCH_CLOSING`) yalnızca `ACADEMY_LESSON_TEXT_SYSTEM_PROMPT` kapsamındaki tezgâh/satış senaryolarında kullanılır, bağlam dışı ofis derslerine slogan gibi yapıştırılmaz.
  - Ekran metinlerinde sayılar rakamla, sese gidecek metinlerde fonetik okunuşla (`SEO` -> `Seo`, `KVKK` -> `Ka Ve Ka Ka`) yazılır.

### 3. AŞAMA 2: SES FIRINLAMA (VOICE_TTS)
- Yalnızca Aşama 1 doğrulama testleri (`verify:prebuild`) yeşil yandığında ve Super Admin'den **"API Harcama Onayı"** alındığında başlatılır.
- `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` (`gemini-3.8-flash-tts`) çalıştırılır.
- Eğitimin ses karakteri (`courseMasterVoice`: Puck, Callirrhoe vb.) kurs boyunca sabittir. Üretilen `.mp3` dosyaları `public/media/academy/audio/` altına indirilir.

### 4. AŞAMA 3: ISINMA VİDEOSU (VIDEO_GEN)
- Yalnızca mühürlü ses dosyaları diskte mevcutken açılır.
- `public/media/academy/micro/*-warmup.mp4` kaseti manuel olarak yerleştirilir.

### 5. AŞAMA 4: GÖRSEL VE FON MÜZİĞİ (IMAGE_GEN & MUSIC_GEN)
- **Görsel Katmanı:** `gemini-3.1-flash-image` ile 16:9 formatında uygulama kartları fırınlanır ve `public/academy/cinema/` altına yerleştirilir.
- **Junior kapak:** Çekirdek 105 konu kapağı `JUNIOR_COVER_GEN` (`gemini-3.1-flash-lite-image`, Nano Banana 2 Lite) ile fırınlanır. Dosya `public/media/junior/covers/{ders}.jpg` olur. Yetişkin `IMAGE_GEN` bu kapağın yedeği değildir. Diskte jpg yoksa kart SVG yedeğini gösterir. Harcama onayı olmadan fırın açılmaz.
- **Fon Müziği:** `lyria-3.5` ile vokalsiz, 44.1 kHz stereo ambient müzik yatağı (`.bed.mp3`) eklenir.

### 6. AŞAMA 5: FİZİKİ DİSK MÜHRÜ VE SATIŞ MANDALI
- Tam stüdyo mührü (`--seal` / `assertAcademyProductionSeal`) 5 medya katmanı diskte fiziken durmadan basılmaz; canlı satış kapısı (`readAcademyVitrineSaleGates` — `lib/academy/sale-gate-board.ts`; saf karar `lib/kernel/admin/sale-gate.ts`, `ANAYASA.md` B3) ise yayın, aktif fiyat ve sınav yolundaki her derste konuşma metni + mühürlü ses (`academyCourseSaleOpen` → `academyCourseVoiceTextSealed`) doğrulandığında açılır.

---

## BÖLÜM 4 — HARD FAIL-CLOSED (SIRTINI DİSKE DAYAYAN KAPI)

Sistem kâğıt üstündeki beyanlara veya agent'ın "hallettim" raporlarına inanmaz. Canlı satış kapısı (`readAcademyVitrineSaleGates` — `lib/academy/sale-gate-board.ts`; saf karar `lib/kernel/admin/sale-gate.ts` ve `academyCourseSaleOpen` → `academyCourseVoiceTextSealed`) Anayasa B3 gereği yayın, aktif fiyat ve **Konuşma Metni + Mühürlü Ses Dosyası** katmanlarını zorunlu tutar; tam stüdyo üretim mührü (`assertAcademyProductionSeal` / `academyCourseProductionDiskSealed` — "Tam mühür") ise ancak ve ancak aşağıdaki **5 MEDYA KATMANI DİSKTE FİZİKSEL OLARAK MEVCUTSA** basılır:

1. **Konuşma Metni** (`.ts` / `spokenScript`)
2. **Mühürlü Ses Dosyası** (`.mp3`)
3. **Isınma Video Kaseti** (`.mp4`)
4. **Uygulama Görselleri** (`.jpg` — `public/academy/cinema/` altında)
5. **Fon Müziği Yatağı** (`.bed.mp3`)

**Sıfır Fallback Kuralı:** Modellerden biri API'de yanıt vermezse veya dosyalardan biri diskte eksikse, sistem sessizce alt modele geçemez, sahte mühür basamaz. Sistem HATA VERİR VE DURUR (Fail-Closed).