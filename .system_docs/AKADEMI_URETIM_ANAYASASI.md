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

---

# ÜRETİM REJİMİ — PEDAGOJİDEN TAŞINAN STÜDYO

Yetişkin Akademi stüdyo sırası, görsel dürüstlük ve altın şablon bu bölümün evidir. Dil felsefesi ve Ek-J `.system_docs/PEDAGOJI.md` içindedir. Akademi kamu vitrini askıdadır; bu bölüm satış vaadi değildir. Kod ve mühür durur.

## Akademi TTS bağları

Pedagoji ilkedir. Bake kapısı: `lib/academy/production-standard.ts`. Yayın listesi `lib/academy/pilot-sku.ts` içindeki `ACADEMY_MEDIA_SEALED_AUDIO` nesnesindedir. `01_office_ai-4` sınav yolunda yoktur. İzlemede canlı TTS yoktur.

## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI

Üretken yapay zekâ müfredat senaryosunu, fırınlamayı ve montajı meşru olarak yürütür. Vatandaş yüzeyi mühürlü eğitim videosunu oynatır. İzlemede model çağrılmaz. Taslak ses ve taslak görüntü yüzeye basılmaz.

### Zorunlu üretim sırası — yetişkin Akademi, 5 medya katmanı

Bu alt başlık, yetişkin Akademi videosunun beş medya katmanının bu belgedeki tek tanımıdır. Anayasa B4 karar tablosu aynı kurala işaret eder. Diğer bölümler katman listesini yeniden yazmaz; buraya döner. Junior okul dersi bu sıraya girmez. Junior mührü Ek-J ve `assertJuniorProductionSeal` (`lib/junior/production-seal.ts`) dir.

Hiçbir yetişkin eğitim videosu Metin, Ses, Video, Görsel ve Müzik katmanlarından biri eksikken fırınlanamaz ve mühürlenemez. Sıra sabittir:

1. **Metin** — vatandaş dili, tek iş tek cümle.
2. **Ses** — Fırın ve gümrük `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. Ev `lib/kernel/ai/model-roles.ts`. Tempo `lib/academy/tts-loudnorm.ts` (`ACADEMY_BAKE_ATEMPO`). Seviye EBU R128 `loudnorm`.
3. **Video** — Yerel `-warmup.mp4`, ilk 6–8 sn ısınma klibi. Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir. Tüm ısınma videoları Gemini yönergesiyle arayüzden manuel üretilir, ilgili slug adıyla `public/media/academy/micro/` dizinine yerleştirilir ve yerel olarak kullanılır.
4. **Görsel** — `ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN`. Ev `lib/kernel/ai/model-roles.ts`.
5. **Müzik** — `ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN`. Vokalsiz fon müziği yatağı. Ducking `lib/academy/lesson-bed-duck.ts` (`ACADEMY_BED_BREATH_DB`).

Cue ve karaoke rozeti konuşmayla akar. Beş katmanın yerine geçmez. Görsel katman `IMAGE_GEN`, video katmanı yerel `-warmup.mp4` kasetidir; mühürde ayrı katmandır.

### 3 aşamalı kontrol kapısı

Bu alt başlık, üç kapının bu belgedeki tek tanımıdır.

1. **Taslak metin** — operatör ve süreç kontrolüdür. Senaryo ve chunking burada biter. Kod bu kapıyı fail-closed zorlamaz. Atlanırsa metin kalitesi düşer; derleme durmaz.
2. **Gözden geçirme** — operatör ve süreç kontrolüdür. Pedagoji, jargon ve aforizma taraması burada biter. Kod bu kapıyı fail-closed zorlamaz. Atlanırsa dil sapar; derleme durmaz.
3. **Son kontrol** — kod seviyesinde fail-closed zorunluluktur. `assertAcademyProductionSeal` (`lib/academy/production-standard.ts`) §B üretim sırasındaki beş katmanı diskte arar; katman eksikse stüdyo tam mührü (`--seal` / `academyCourseProductionDiskSealed`) basılmaz. Canlı satış kapısı (`readAcademyVitrineSaleGates` — `lib/academy/sale-gate-board.ts`; saf karar `lib/kernel/admin/sale-gate.ts`) ise Anayasa B3 gereği yayın, aktif fiyat ve sınav yolundaki her derste konuşma metni ile mühürlü sesi arar. Video yerel `-warmup.mp4`, görsel ve müzik yatağı (`MUSIC_GEN`) tam stüdyo mührünün parçasıdır. Bu kapı atlanamaz.

**Model sicili.** Fırın ve gümrük medya kimliği `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` nesnesindedir. Bu belgede model kimliği, tempo ve desibel dondurulmaz. Rol kimliği değişince felsefe metni yeniden yazılmaz. Üretim sırası §B’de durur; pedagoji durur. Canlı sohbet `FAST_STREAM` okur. Senaryo `TEXT_GEN` okur. Ses mührü `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. `academyBakeVoiceModelId()` aynı kimliği döner. Kota bitince alt model açılmaz. Konuşma temposu `ACADEMY_BAKE_ATEMPO`, seviye EBU R128 `loudnorm`. Bake sırası `lib/academy/production-standard.ts` ve fırın betiklerindedir.

Yapay zeka fırınlarının görev dağılımı şöyledir:

| Rol | Fırın | Görev |
|-----|-------|--------|
| Metin & Senaryo | **`ACADEMY_SEALED_MEDIA_MODEL.TEXT_GEN`** | 4-beat reji yapısına (Warm-up → Command → Comparison → Task) uygun ders senaryolarını hazırlar. Canlı sohbet ayrıdır: `FAST_STREAM`. |
| Seslendirme | `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` | **1 Eğitim Kodu = 1 Ses.** Kurs `courseMasterVoice` tek stringdir. Ders bazlı ses haritası yoktur. Persona (Tezgâh dili, §2.2) ile anlatıcı adı ayrıdır. Ofis kartı `01_office_ai` metnini Gözde (**Callirrhoe**) ile mühürler. OFF-201 (`01_office_ai_ileri`) metnini Aylin (**Kore**) ile mühürler. EC-102 (`02_ecommerce_ai`) metnini Kaan (**Puck**) ile mühürler; bu kursta usta unvanı yoktur. OFF-201 eğitmeni Gözde olamaz. Tempo `ACADEMY_BAKE_ATEMPO`, seviye EBU R128. İstek tavanı ve süre tabanı bu hücrede tekrarlanmaz; tek ev `lib/academy/production-standard.ts` içindedir. Kilit testi `tests/academy/production-standard.test.ts`. Model kimliği `lib/kernel/ai/model-roles.ts`. |
| Görsel | `ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN` | Canlı uygulama kartları. %80 canlı uygulama / %20 sinematik veya kılavuz kartı. Yedek: `IMAGE_GEN` plakası + CSS Ken Burns. |
| Video | Yerel `-warmup.mp4` | İlk 6–8 sn ısınma klibi. Otomatik Veo 3.1 Lite ve pahalı Veo 3.1 API çağrıları iptaldir. Kaset `public/media/academy/micro/` altından okunur. Canlı `VIDEO_GEN` mühürlü-ölüdür. |
| Ducking Müzik | `ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN` | Vokalsiz fon müziği yatağı. Konuşurken dipte kalır; nefes payında ducking `ACADEMY_BED_BREATH_DB` (`lib/academy/lesson-bed-duck.ts`). |
| Müfredat, fırın ve montaj | **Üretken yapay zekâ (Cursor)** | Senaryoyu, cue zamanlamasını ve görsel rejiyi §B üretim sırasına göre üretir. Dönen ses, görüntü ve müziği mühürler; oynatıcıda senkronize eder. Ücretli çağrı insan onayı ve §B 3. kapı (`assertAcademyProductionSeal`) ile açılır. |

Sayısal fırın tavanı ve süre tabanı bu tabloda tekrarlanmaz. Tek ev `lib/academy/production-standard.ts` içindedir. Metin modelinin adı bu belgede dondurulmaz; fırın `TEXT_GEN`, canlı sohbet `FAST_STREAM` okur.

**4-beat reji (Warm-up → Command → Comparison → Task)** tek eğitmen, SEN dili; **Pekiştirme ve Tekrar** iki durak ekler:

| Sıra | Beat | Karşılık | İçerik |
|------|------|----------|--------|
| — | GİRİŞ KÖPRÜSÜ | Warm-up öncesi ~30 sn | Yapay zekâ ile çalışma refleksini hatırlatan ısınma |
| 1 | Warm-up | Isınma / İş Problemi | Gerçek iş hayatı karşılığı |
| 2 | Command | Birinci Senaryo / Temel Yöntem | İlk istem ve çözüm — ekranda çalışan işlem |
| 3 | Comparison | İkinci Senaryo / İstisna | Edge-case, yanlış vs doğru, kritik durum |
| — | Pekiştirme durağı | Task öncesi ~45 sn | Üç somut adımı tane tane tekrarlayan kapanış özeti. Stüdyo anahtarı vatandaş rozeti değildir |
| 4 | Task | Özet & Saha Görevi | Üç somut adım ve saha görevi |

Konuşma 2.0 saniyede başlar. Bu aralıkta ekranda iş kartı durur. Jenerik logo plakası opsiyoneldir; sahnenin gövdesi olamaz (§A.4). Ofis kartı `01_office_ai` anlatıcısı Gözde (Callirrhoe)’dir. Konuşma bitince 1-2-3 iş özeti ekranda kalır. Logo plakası bu özete eklenmek zorunda değildir. Gain, nefes ve kapanış süreleri `lib/academy/lesson-bed-duck.ts` içindedir; bu paragraf o sayıları ikinci kez dondurmaz. Intro, outro ve dinamik görsel reji **§E Altın Şablon Standartları** içindedir.

**Altın Şablon görsel reji** (`01_office_ai-1` — gelecek müfredatın cue-görsel sözleşmesi):

| Beat | Ekran | Not |
|------|-------|-----|
| — Giriş | Konuşmadan önce iş kartı. Logo plakası opsiyonel | Konuşma yok. Gain kodda |
| — Bitiş | 1-2-3 iş özeti zorunlu. Logo plakası opsiyonel | Gain ve fade kodda |
| 1 Warm-up | 8 sn ofis/veri-akışı B-roll (`public/media/academy/micro/*-warmup.mp4` reuse veya Ken Burns), sonra canlı Excel | Statik plaka yok; otomatik Veo 3.1 API yok |
| 2 Command | %80 tek ekran canlı uygulama | İlk istem ve çözüm; ChatGPT / Claude / Gemini / API masası; **Spoiler Yasağı** — temiz/nihai tablo yok |
| 3 Comparison | Dikey split-screen | Sol: ÖNCE (DÜZENLEMESİZ) ham/düzensiz tablo, turuncu çerçeve. Sağ: SONRA (AI İLE) düzenli tablo, yeşil-mavi neon, A1 ışıldar. Temiz tablo **ilk kez** sağ panelde açılır |
| 4 Task | Düzenli nihai tablo | Saha görevi; karşılaştırmadan yumuşak dönüş |

Vatandaş etiketinde «Kirli» yok. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı». Görsel SSOT: `lib/academy/lesson-beat-visual.ts`.

Üretim sırası §B «Zorunlu üretim sırası»dır; tersine yürünmez. Cue konuşmayla akar. Senaryo, cue ve visual zoom senkronu tam oturmadan ücretli çağrı **KESİNLİKLE** açılmaz. Son `--seal` §B 3. kapıdadır. Geliştirme ve deneme `--dry-run` ile yürür. Taslak ses vatandaş yüzeyine basılmaz. İnsan onayı olmadan harici TTS yok. Ayrıntı bake el kitabındadır (`skip preventer`, `--seal` kapısı, §E.4–E.5).

**İzleme anında harici üretici API çağrılmaz.** Fırın bake’de çalışır; oynatıcı mühürlü medyayı senkronize eder. Cue orijinal terimi korur; ses fonetik okur. Placeholder test-pattern vatandaşa basılmaz.

Kod SSOT: `lib/academy/production-standard.ts`. Görsel reji SSOT: `lib/academy/lesson-beat-visual.ts`.

Süre bandı ve sınav barajı kod SSOT’tadır (`lib/academy/production-standard.ts`, `ACADEMY_EXAM_PASS_SCORE`). TTS bütçe tavanı D.1’dedir. Vitrin kartındaki dakika yuvarlaması ayrıdır (`lib/academy/lesson-meta.ts`). Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır. **1 Eğitim Kodu = 1 Ses:** `courseMasterVoice` tek stringdir; dersler ayrı sese bölünmez ve ders bazlı ses haritası yoktur. Gözde (Callirrhoe) ofis kartı `01_office_ai` mühürüdür. OFF-201 mührü Aylin (Kore) dir. EC-102 mührü Kaan (Puck) dir; usta unvanı bu kursta yoktur. OFF-201 kilidi `lib/academy/instructors.ts` içindeki `ACADEMY_OFF201_COURSE_MASTER_VOICE` sabitidir. OFF-201 eğitmeni Gözde olamaz. Süre tabanı, ders tabanı ve TTS istek tavanı `lib/academy/production-standard.ts` içindedir. Ders istek bandının sabit adları `lib/academy/tts-breath-chunks.ts` içindedir. Sayıların kilitlendiği test `tests/academy/production-standard.test.ts` dir. Model kimliği `lib/kernel/ai/model-roles.ts` içindedir; bu paragraf o sayıları ikinci kez yazmaz.

---

## D. GÖRSEL DÜRÜSTLÜK

* **Spoiler Yasağı:** Temiz sonuç, karşılaştırmadan önce gösterilmez. Split etiketi **ÖNCE (DÜZENLEMESİZ)** / **SONRA (AI İLE)** durur. Vatandaş etiketinde «Kirli» yoktur. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı».
* Masaüstü gerçek dışı vaat etmez. Onaylı panel yoksa bu dürüstçe söylenir. «Senin aracın yasak» denmez.

### D.1 Vitrin

Vitrin dürüsttür. Mühürü olmayan eğitim «yayında» diye satılmaz. Bağlı olmayan medya için oynatıcı basılmaz. Üretim bandındaki kardeş eğitim «Çok Yakında / Hazırlanıyor» rozetiyle durur. Satış tutarı `PriceCatalogEntry` satırındadır. Satır yokken kart fiyat basmaz. Tohum tutarı satış fiyatı değildir (Anayasa A1).

Hangi eğitimin yayında olduğu, kaset süreleri, gain sayıları ve yeniden fırın kuyruğu bu maddenin envanteri değildir. Yaşayan kesit `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` içindedir.

**Ders adedi Pedagoji kotası değildir.** Süre için üst dakika dayatması yoktur; metin kırpılmaz ve tempo yükseltilmez. TTS bütçe tavanı vardır. Kurs tavanının adı `ACADEMY_MATCH_WHISTLE_MAX` (`lib/academy/production-standard.ts`). Ders istek bandının adı `ACADEMY_TTS_LESSON_REQUEST_MIN` ve `ACADEMY_TTS_LESSON_REQUEST_MAX` (`lib/academy/tts-breath-chunks.ts`). Bu sabitlerin kilitlendiği test `tests/academy/production-standard.test.ts` dir. Ses modeli kimliği `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` dir. Taban süre ve taban ders sayısının tek evi aynı üretim dosyasındadır. Anayasa B4 o tabanları ikinci kez yazmaz. Nefes ve gain `lib/academy/human-rhythm.ts` ve `lib/academy/lesson-bed-duck.ts` içindedir; bu sayılar felsefe paragrafına ikinci kez yazılmaz. Diksiyon temposu Evrensel Metin Standardı’nda bir kez anılır.

İleri ofis adresi `01_office_ai_ileri` durur. Ayrım örneği SKU `OFF-101` / `OFF-201`. Kart kodu `OFF-102` EC-102 ile çakışır, kullanılmaz. `02_business_ai` kullanılmaz. Görsel reji kodu: `lib/academy/lesson-beat-visual.ts`.

---

## E. ALTIN ŞABLON STANDARTLARI

### E.2 Rozet dili

**Aforizma / Ajans Sloganı** rozete de girmez. Rozet işin net adıdır. Jenerik övgü basılmaz. Jenerik tabela da basılmaz: sahnedeki rozet `CEBİNE KOY` olamaz. Sıra rozeti SEN aksındadır: `SIRA SENDE`. `SIRA SİZDE` bu rozette durmaz; «siz» yalnız dilekçe, resmî yazı ve sözleşme çıktısındadır (§A.2). Ağız ve rozet aynı kelimeyi taşır. Rozet somut işi söyler («Tek Tek Kopyalama», «Tek Dosyayla Analiz», «KAYNAĞI KARŞILAŞTIR», «UYUŞMAYANI YAZMA»). Stüdyo bölüm anahtarı ile vatandaşın gördüğü rozet metni ayrıdır.

### E.3 İşitsel Reji ve Outro Crescendo

* **Intro:** 2.0 sn’ye kadar konuşma olmaz. Zorunlu olan iş kartıdır. Jenerik logo plakası opsiyoneldir ve sahnenin gövdesi olamaz (§A.4). Konuşma 2.0. sn’de başlar.
* **Outro:** Konuşma bitince ekranda 1-2-3 iş özeti durur. Logo plakası bu özete eklenmek zorunda değildir. Gain, zirve ve fade `lib/academy/lesson-bed-duck.ts` içindedir. Bu madde o sayıları ikinci kez dondurmaz.

### E.4 Bütçe Korumalı B-roll Mimarisi (yerel reuse)

Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir. Tüm ısınma videoları Gemini yönergesiyle arayüzden manuel üretilir, ilgili slug adıyla `public/media/academy/micro/` dizinine yerleştirilir ve yerel olarak kullanılır.

Ofis istemi `ACADEMY_WARMUP_OFFICE_PROMPT` (`lib/academy/lesson-veo.ts`) yalnız Gemini arayüzüne elle yazılır. Betik bu metni API'ye göndermez. Çıkan dosya `-warmup.mp4` adını taşır.

| Kaynak | Maliyet | Ne zaman |
|--------|---------|----------|
| Yerel `-warmup.mp4` reuse | Sıfır | Zorunlu. Kaset `public/media/academy/micro/` altında durur |
| Veo 3.1 Lite | **İptal** | `veo-3.1-lite-generate-preview` çağrılmaz |
| `IMAGE_GEN` + CSS Ken Burns | Sıfır video API | Yerel kaset yoksa ekran yedeği: `ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN` plakası üzerine Pan-Zoom |
| Pahalı Veo 3.1 | **İptal** | `veo-3.1-generate-preview` çağrılmaz |

* Warm-up B-roll 8 sn kalır; punch sonrası canlı Excel’e kesilir (donmuş kare yok).
* Oynatıcı izlemede VIDEO_GEN çağırmaz. Ken Burns CSS anahtarı: `academy-eye-kenburns` (`app/globals.css`); punch penceresinde `IMAGE_GEN` plakasına Pan-Zoom basar.
* Kod SSOT: `lib/academy/lesson-veo.ts`, `lib/academy/baked-micro-videos.ts`, `scripts/generate-academy-lesson-veo.ts`.

### E.5 Fırınlama (Bake) Disiplini

Ücretli TTS ve video mühürü, reji oturmadan açılmaz. Son mühür §B 3. kapıdadır: `assertAcademyProductionSeal` beş katman diskte yoksa `--seal` basmaz.

* **3 aşamalı kontrol kapısı** §B’de tanımlıdır. 1. ve 2. kapı operatör disiplinidir. 3. kapı kodda fail-closed zorunluluktur. Bu madde o listeyi ikinci kez yazmaz.
* Senaryo, cue ve visual zoom senkronizasyonu tam oturmadan ücretli çağrı **KESİNLİKLE YASAKTIR**. Mutfak hazırlığı %100 bitmeden çiğ metin fırına atılamaz.
* Geliştirme ve deneme aşamasında tüm testler `--dry-run` bayrağı ile yürütülür; harici Google AI Studio çağrısı doğmaz.
* `--seal` yalnız `--confirm-gemini-spend` ve insan onayı ile; vatandaş yüzeyine taslak WAV/MP4 basılmaz.
* B-roll yalnız yerel `-warmup.mp4` reuse. Otomatik Veo 3.1 Lite ve pahalı Veo 3.1 API çağrıları iptaldir.
* Kod SSOT: `scripts/generate-academy-lesson-audio.ts`, `scripts/generate-academy-lesson-veo.ts`, `scripts/generate-academy-lesson-bed.ts`. Kapı: `lib/academy/production-standard.ts`.

---
