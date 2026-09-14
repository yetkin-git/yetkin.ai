# MUSE SPARK — Tarafsız Dış Denetim Raporu: `01_office_ai-1` Golden Model

> **Denetçi:** Muse Spark (Baş Denetçi, dış göz)
> **Tarih:** 14 Eylül 2026
> **Kapsam:** `http://localhost:3000/academy/01_office_ai/oyna` → 1. ders (`01_office_ai-1` / "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo")
> **Yöntem:** Sıfır tolerans. Prodüksiyon kasetleri + görsel sahne kodları + mühür testleri çapraz okundu. Ses dosyaları binary olarak dinlenmedi; zaman damgaları, fonetik haritalar, ducking matematiği ve sahne kodu üzerinden denetlendi.
> **Denetlenen kasetler:**
>
> | Kaset | Yol | Durum |
> |---|---|---|
> | Senaryo | `docs/curriculum/01_office_ai_01_script.md` (14 paragraf, rozetli) | ✅ okundu |
> | Cue + parça saatleri | `docs/curriculum/01_office_ai_01_cue.json` (`durationSec: 517.16`, `seal: 0980cfe5f309`) | ✅ okundu |
> | Oynatıcı cue SSOT | `lib/academy/lesson-cues/01_office_ai-1.json` (8 cue) | ✅ okundu |
> | Mühürlü parça saatleri | `lib/academy/lesson-audio-timings/01_office_ai-1.json` (`durationSec: 517.16`, `cacheV: 517160`, 14 parça) | ✅ okundu |
> | Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-1.md` (14 paragraf) | ✅ okundu |
> | Yayın sesi | `public/media/academy/audio/01_office_ai/01_office_ai-1.mp3` (12.413.421 bayt) | ✅ varlık doğrulandı |
> | Dip müziği | `public/media/academy/audio/01_office_ai/01_office_ai-1.bed.mp3` (4.343.864 bayt) | ✅ varlık doğrulandı |
> | Warm-up B-roll | `public/media/academy/micro/01_office_ai-1-warmup.mp4` (5.016.900 bayt) | ✅ varlık doğrulandı |
> | Sinema çerçevesi | `public/media/01_office_ai_01_frame_01.png` (790.675 bayt) | ✅ varlık doğrulandı |
> | Cue slaytları | `public/academy/cinema/01_office_ai-1-cue-{2..8}.jpg` (7 dosya) | ✅ varlık doğrulandı (test + disk) |
> | Sınav | `docs/curriculum/01_office_ai_01_exam.json` (3 soru, baraj 70) | ✅ okundu |
> | Görsel sahne | `components/academy/lesson-visual-stage.tsx`, `components/academy/lesson-excel-workspace.tsx`, `lib/academy/excel-workspace.ts`, `lib/academy/cinema-cue-catalog.ts`, `lib/academy/lesson-visual-stage.ts`, `lib/academy/lesson-beat-visual.ts` | ✅ okundu |
> | Ses/orkestrasyon | `components/academy/lesson-media-player.tsx`, `components/academy/curriculum-player.tsx`, `components/academy/lesson-karaoke-strip.tsx`, `lib/academy/lesson-teleprompter-flow.ts`, `lib/academy/lesson-bed-duck.ts`, `lib/academy/lesson-intro.ts`, `lib/academy/lesson-audio.ts`, `lib/academy/spoken-scripts/phonetics.ts` | ✅ okundu |

---

## 0. YÖNETİCİ ÖZETİ VE HÜKÜM

**Hüküm: ŞARTLI GEÇER — mühür BASKIDA BEKLETİLMELİ (SEAL ON HOLD).**

Dersin pedagojik iskeleti, SEN dili, A1 refleksi ve punchcard disiplini Golden Model iddiasını taşıyor. Ancak **sıfır tolerans kapısından geçemeyen 1 adet P0 mühür kayması** var: güncel kaset `517.16 sn` iken test/dron/süre tablosu hâlâ eski `497.72 sn` üretimini bekliyor. Bu, "mühürlendi" beyanı ile kodun kilitlediği değerlerin çelişmesi demektir. Ayrıca prompt'taki iki zaman damgası (`Beat 3: 319.92 sn`, `CEBİNE KOY: 393.32 sn`) güncel mühürle uyuşmuyor (gerçek: `346.36` / `417.20`); inceleme bu kaymayı düzelterek yaptı.

| # | Bulgu | Şiddet | Durum |
|---|---|---|---|
| P0-1 | Mühür kayması: `timings 517.16` ≠ `sealed-audio-pilot.test.ts 497.72` ≠ `ACADEMY_SEALED_AUDIO_DURATION_SEC 498` ≠ `dron punchcards 497.72` | **P0 — mühür bloklayıcı** | ❌ düzeltilmeli |
| P0-2 | Prompt zaman damgaları güncel değil (319.92/393.32 → gerçek 346.36/417.20) | **P0 — dokümantasyon** | ❌ düzeltilmeli |
| P1-1 | Sınav, anlatıda geçmeyen iki detayı ölçüyor (F2 apostrof hilesi, "orijinali koru + yeni sayfa" iş akışı) | **P1 — ölçme geçerliliği** | ⚠️ düzeltilmeli |
| P1-2 | Uzun cue'lar (84 sn, 80 sn) tek statik Excel karesi; PEDAGOJI "5–8 sn'de görsel odak değişir" kuralı canlı Excel kipinde tutmuyor | **P1 — bilişsel ritim** | ⚠️ iyileştirilmeli |
| P1-3 | `CEBİNE KOY` üç altın kuralı canlı Excel sahnesinde görsel checklist olarak yok (sadece ses + karaoke) | **P1 — pekiştirme** | ⚠️ iyileştirilmeli |
| P2 | Bed müziği `cue-07` altında 0.46'ya çıkıyor (konuşma üstünde 3.8×); 0.4 sn'lik nefes aralarında yükselme matematiği işlemiyor | **P2 — miksaj** | ⚠️ gözden geçirilmeli |
| P2 | Çıplak `A1` (cue-05 "önce A1 eşiğini kur") fonetik tabloda yok; TTS okunuşu belirsiz | **P2 — fonetik** | ⚠️ netleştirilmeli |
| P3 | Birleştirilmiş hücrede meta-not basılıyor; `table.note` alanlarının çoğu sahnede hiç render edilmiyor | **P3 — mikro** | ℹ️ temizlik |

**Olumlu mühürler (korunmalı):** 2 sn giriş nefesi + punchcard yokluğu kusursuz. 8 rozetin tamamı ≤3 kelime. `kirli` kelimesi vatandaş yüzeyinde sıfır. Karaoke satır saati mühürlü parça saatiyle 1:1. Split-screen Before/After etiketleri ve renk dili (turuncu/green-neon) pedagojik olarak doğru.

---

## 1. GÖRSEL VE REJİ UYUMU (VISUAL & AUDIO MISALIGNMENT)

### 1.1. 2 saniyelik giriş nefesi ve Lyria geçişi — DOĞAL, ONAYLANDI ✅

Zincir üç katmanda kilitli ve tutarlı:

- `ACADEMY_INTRO_GENERIC_SEC = 2` (`lib/academy/lesson-intro.ts`); `academyLessonIntroIsActive(KEY, t)` yalnızca `0 ≤ t < 2` aralığında logo + `01_OFFICE_AI` jeneriğini basıyor.
- İlk cue/parça `start: 2` (`cue-01`, `pieces[0]`). `academyActivePunchcard(cues, 0)` ve `(…, 1.5)` → `null`; `(…, 2)` → `GİRİŞ KÖPRÜSÜ`. Yani 0–2 sn'de rozet ve TTS yok — testle mühürlü (`office-ai-lesson-1-golden.test.ts`).
- Bed kazancı: `academyBedDuckGain(0.5) = 0.46` (nefes), `academyBedDuckGain(2) = 0.46` (eşik), `academyBedDuckGain(8) = 0.12` (dip). Konuşma başlayınca 3 sn'lik `smoothstep` ile 0.46 → 0.12'ye tatlı iniş. Matematik doğal bir "jenerik çekilir, hoca girer" hissi veriyor.

**Mikro not:** Prompt'taki "2 saniyelik giriş nefesi" ifadesi doğru; ancak Veo'nun "0–8 sn" olarak anılması hatalı (bkz. 1.2).

### 1.2. Veo 3.1 → %80 Excel geçişi — KAVRAMSAL DÜZELTME GEREKİYOR ⚠️

**Gerçek zaman çizelgesi (kod + mühür):**

| Pencere | Olan |
|---|---|
| `0–2 sn` | Logo jeneriği + Lyria (Veo yok) |
| `2–10 sn` | Veo `punch` (8 sn, `ACADEMY_VEO_SCENE_DURATION_SEC = 8`, `cue-01` kartı `kind: "veo"`) |
| `10–40.6 sn` | Veo `hold`: video duraklatılıp punch son karesinde donduruluyor (`lesson-visual-stage.tsx`: `video.pause()` + `currentTime = punch`) |
| `40.6/41.0 sn` | `cue-02` ile ilk canlı Excel (`visualMode: "live"`, `waiterRatio: 80`) |

Yani **Excel'e geçiş 8. sn'de değil, ~41. sn'de** oluyor. `10–40.6` arası ~30 sn'lik donmuş Veo karesi var. Bu üç soruyu doğuruyor:

1. **Bilişsel yük yaratıyor mu?** Hayır — tam tersi, yük *düşük* ama *ritim* riski var. Donmuş sinematik kare + 38.6 sn'lik tek warm-up paragrafı, "statik plaka" hissine yaklaşıyor. PEDAGOJI §B "Warm-up: 8 sn Veo B-roll, sonra canlı Excel" diyor; kod bunu cue sınırına kadar uzatıyor. İzleyici 30 sn boyunca aynı karea bakarken anlatı "dijital ofis asistanı" kavramını kuruyor — işitsel olarak zengin, görsel olarak durgun.
2. **%80 Excel iddiası cue-02'den itibaren doğru.** `academyVisualWaiterKind(KEY, cue)` Veo kartında `cinema`, diğer 7 kartta `excel` dönüyor. `lesson-excel-workspace.tsx` gerçek Excel kromu (şerit, `fx` çubuğu, isim kutusu, sekmeler) basıyor — soyut kart yok. Bu, "Garsonu Göster" felsefesine sadık.
3. **Öneri:** `cue-01` hold fazına hafif Ken Burns / slow-zoom veya 10. sn'de Excel'e erken crossfade ekleyin; ya da warm-up paragrafını iki görsel vuruşa bölün (2–10 Veo, 10–40 Excel boş kitap + A1 seçili). Mevcut haliyle geçiş bilişsel yük *değil*, *görsel durgunluk* riski taşıyor.

Ek uyumsuzluk: `cue-02` Excel'i tamamen boş 5×6 ızgara gösterirken anlatı ChatGPT/Claude/Gemini/API ekosistemini anlatıyor (84 sn). Kulak "çoklu AI kapısı" duyarken göz boş tablo görüyor — **işitsel-görsel örtüşme zayıf**. `cue-02`'ye AI masası (`copilot` paneli, bkz. cue-05) veya mini marka şeridi eklenmesi önerilir.

### 1.3. Beat 3 Split-Screen (prompt: 319.92 sn → gerçek: 346.36 sn) — PEDAGOJİK OLARAK GÜÇLÜ, ZAMAN DAMGASI YANLIŞ ⚠️✅

**Zaman düzeltmesi:** `cue-06 FARK ORTADA` mühürlü aralığı `346.36–416.80` (`lib/academy/lesson-cues/01_office_ai-1.json`, `lesson-audio-timings`). Prompt'taki `319.92` güncel değil; eski 497.72'lik üretime (dron `cue-06 start: 321.92` − 2 sn intro) ait. Denetim `346.36` üzerinden yapıldı.

**Pedagojik değerlendirme — "Fark" net hissediliyor:**

- `academyVisualCompareStage(KEY, "cue-06")` → `before: cue-03` (birleşik afişli, boş satırlı, üç dilli tarihli ham tablo) + `after: cue-06` (tek tip tarih, `12.450,00` formatlı tutar, `Toplam 54.650,00` satırı). `beforeCueIndex: 3` doğru bağlanmış; diğer cue'larda `null` (testle kilitli).
- Etiketler `ÖNCE (DÜZENLEMESİZ)` turuncu çerçeve / `SONRA (AI İLE)` yeşil-mavi neon + A1 ışıması (`academy-excel-cell--a1`). Renk dili "hata → güven" çağrışımını destekliyor.
- Anlatı ("Sol tarafta… Sağ tarafta…") ile sahne birebir örtüşüyor — ses-görsel ayrışması yok.

**Tespitler:**

- **P3 — Birleştirilmiş hücrede yanlış metin:** `LessonExcelWorkspace` merged satırda `table.note` basıyor. `cue-03` notu `"A1:F1 birleşik afiş — tablo değil."` olduğu için Excel hücresinin içinde meta-açıklama görünüyor; gerçekçi afiş başlığı (`formulaBar: "Mart 2026 Tahsilat Dökümü"`) hücreye değil, fx çubuğuna düşüyor. Öneri: merged hücreye `formulaBar`/afiş metnini basın, notu dip nota taşıyın.
- **P3 — Ölü not alanları:** `cue-06/07/08` notları (`"Aynı dosya, farklı eşik."`, `"Üç adım: A1, birleşik, yalın istem."` vb.) `LessonExcelWorkspace`'te hiç render edilmiyor (merged dışı `note` okunmuyor). Ya sahneye dip-not şeridi ekleyin ya da kataloğu sadeleştirin.
- **Mobil:** 62% genişlikte iki Excel ızgarası daralacak; `globals.css` mobil sıkıştırması mevcut ama split metin boyutu (`0.5rem` etiket) küçük ekranlarda okunabilirlik testine tabi tutulmalı.

---

## 2. PEDAGOJİ VE İÇERİK DERİNLİĞİ

### 2.1. "Kirli" → "Düzensiz Tablo / Ham Veri / Dağınık Yapı" — ÜSLUP KAZANMIŞ ✅

- Konuşma metni (`spoken-scripts/01_office_ai-1.md`), cue paragrafları, slayt başlıkları ve sınavda `/kirli/iu` **sıfır eşleşme** (arşiv `archived/` hariç — aktif ürün dışı). Testler bunu kilitliyor (`office-ai-lesson-1.test.ts`: `prose not toMatch /kirli/`).
- Üçlü terminoloji tutarlı kullanılmış: **Düzensiz Tablo** (görsel/sorun adı), **Ham Veri** (işlenmemiş girdi), **Dağınık Yapı** (nitelik). Örn. cue-03: "üzerinde işlem yapmaya uygun olmayan bir ham veri yığınıdır… Bu tür bir dağınık yapı…"; cue-06: "düzenlemesiz ham veri… düzenli tablo". Dil yargılayıcı değil, onarıcı — ofis çalışanını suçlamıyor, araca davet ediyor.
- **Stil notu:** "hücre birleştirme sevdası" gibi tek esprili iğne korunmuş; geri kalan dil sıcak-SEN. Terminoloji değişimi metni soğutmamış, aksine kurumsallaştırmış.

### 2.2. ChatGPT / Claude / Gemini / API ekosistemi — VARLIK GÜÇLÜ, DERİNLİK SLOGAN SEVİYESİNDE ⚠️

**Varlık (olumlu):** Ekosistem üç katmanda tekrarlanıyor — anlatı (cue-02 + cue-05), Excel AI masası (`"ChatGPT · Claude · Gemini · API"`), slayt `tools` alanları. "Tek kapıya bağımlı olma, önce A1 eşiğini kur, sonra kapıyı seç" omurgası L1 için doğru soyutlama.

**Derinlik (sınırlı):** Farklılaştırıcılar iki kısa dizeden ibaret:

- cue-02: *"ChatGPT hızlı taslak üretir, Claude uzun satırları dikkatle okur, Gemini adımları net sıralar, özel API ise evdeki kuralları unutmaz."*
- cue-05: *"ChatGPT taslağı çabuk gösterir, Claude uzun dökümü tartar, Gemini adımları sıraya dizer, özel API şirket formatını kilitle[r]."*

Bunlar akılda kalıcı ama **eyleme dönüşmeyen** sıfatlar: hangi dosyayı nereye yüklerim, uzun dökümde limit ne, "evdeki kurallar" ne demek (şablon? KVKK? format kilidi?) anlatılmıyor. Copilot paneli (`cinema-cue-catalog.ts` cue-05) tek cümlelik evrensel istem veriyor — iyi, ama kapılara göre dallanmıyor.

**Hüküm:** L1'in "önce tabloyu konuştur" hedefi için yeterli; "ekosistemi öğretme" iddiası için yüzeysel. Öneri: mevcut dersi şişirmeden, cue-05 AI masasına 4 satırlık mini-rehber ekleyin (örn. "ChatGPT: hızlı taslak → yapıştır-çalıştır; Claude: 50+ satır döküm; Gemini: adımlı liste; API: şirket format şablonu"). Derin kapı eğitimini 2–6. derslere dağıtın ve müfredat haritasında işaretleyin.

**Dilbilgisi mikro-tespiti:** cue-05 display metni *"özel API şirket formatını kilitle"* — emir kipi öznesiz kalıyor ("kilitler" olmalı). TTS'de de aynı. Düzeltme önerilir.

### 2.3. `CEBİNE KOY` (prompt: 393.32 sn → gerçek: 417.20 sn) — İŞİTSEL OLARAK GÜÇLÜ, GÖRSEL DESTEK EKSİK ⚠️

- **Zaman düzeltmesi:** `cue-07` mühürlü aralığı `417.20–457.00` (39.80 sn, tek parça). Prompt'taki `393.32` eski üretime ait.
- **İçerik:** Üç kural numaralı ve eylem cümleli: (1) A1'e sütun adı koy, (2) birleşikleri çöz + boş satırları sil, (3) yalın dille türleri tek tip yap. Kelime hızı ~121 wpm (80 kelime / 39.8 sn) — tane tane, sindirilebilir. Beat haritasında `task` öncesi pekiştirme durağı olarak doğru konumlanmış.
- **Pekiştirme sorunu:** Canlı sahne cue-07'de yine tam-boy Excel ızgarası gösteriyor; slayt `bullets` (`"A1 sütun adı"`, `"Birleşik ve boş satır"`, `"Yalın dille söyle"`) ve `subhead` yalnızca bake JPG'de yaşıyor, vatandaş sahnesine basılmıyor. Öğrenci üç kuralı **sadece kulak + karaoke şeridinden** alıyor; gözde kalıcı checklist yok. 40 sn'lik özetin akılda kalıcılığı için sahneye numaralı 1-2-3 rozet şeridi (veya Excel üstü mini-overlay) eklenmesi önerilir.
- **Miksaj notu:** `cue-07` bed kazancı 0.46 (konuşma altında). Pekiştirme durağında müziğin "yükselmesi" niyeti anlaşılır, ancak 40 sn'lik yoğun kural anlatımında 3.8× bed, berraklığı zorlayabilir. 0.18–0.22 bandı veya yalnızca cümle aralarında yükselme önerilir (bkz. §4 P2).

**Beat matematiği ek notu:** Ders toplamı `517.16 sn = 8.62 dk` — `production-standard.ts` (7–12 dk) ve PEDAGOJI ideal bandı (5–9 dk) içinde. Ancak beat dağılımı hedeflerden sapıyor: warmup (cue-01..03) ~3.19 dk (hedef 1.5), command ~2.52 dk (hedef 3.5), comparison ~1.17 dk (hedef 3.5), task ~1.66 dk (hedef 1.5). Warm-up şişkin, comparison ince. Sonraki derslerde comparison'a daha fazla süre ayrılmalı.

---

## 3. KARAOKE VE SES AKIŞI

### 3.1. 8 Punchcard rozet zamanlaması — DOĞRU, KURALA UYGUN ✅

| Cue | Rozet | Mühürlü aralık | Süre | Kelime |
|---|---|---|---|---|
| cue-01 | GİRİŞ KÖPRÜSÜ | 2.00–40.60 | 38.60 sn | 2 ✅ |
| cue-02 | HOŞ GELDİN | 41.00–125.04 | 84.04 sn | 2 ✅ |
| cue-03 | DÜZENSIZ TABLO | 125.44–194.12 | 68.68 sn | 2 ✅ |
| cue-04 | A1 HÜCRESİ | 194.52–265.64 | 71.12 sn | 2 ✅ |
| cue-05 | TEMİZLE ŞİMDİ | 266.04–345.96 | 79.92 sn | 2 ✅ |
| cue-06 | FARK ORTADA | 346.36–416.80 | 70.44 sn | 2 ✅ |
| cue-07 | CEBİNE KOY | 417.20–457.00 | 39.80 sn | 2 ✅ |
| cue-08 | SIRA SENDE | 457.40–517.16 | 59.76 sn | 2 ✅ |

- Tüm rozetler `ACADEMY_PUNCHCARD_MAX_WORDS = 3` kuralının altında (hepsi 2 kelime). `academyPunchcardLabel` kesmesi tetiklenmiyor.
- Parça dağılımı `[1,2,2,2,2,2,1,2]` = 14 parça; parça araları tekdüze `0.40 sn` (`pauseSec`). Rozet geçişlerinde 0.4 sn'lik sessizlikte eski rozet korunuyor (`academyActivePunchcard` `lastHit`) — yanıp sönme yok, süreklilik iyi.
- Hizalama: `loadAcademyLessonPlaybackCues` timings'i cue'lara bindiriyor; `academyVisualStageCardsMatchCues` kart/cue kilidini doğruluyor. Görsel kart + rozet + karaoke aynı `currentTime` saatini okuyor (`data-academy-clock="currentTime"`).

**Uyarı:** Bu tablo `517.16` mührüne göre doğru. Dron katmanı (`apps/rail-is/src/ui/academy-punchcards.ts`) hâlâ `497.72` dizisini taşıyor (örn. cue-06 `321.92`, cue-07 `395.32`) — web/mobil arası ~20–24 sn kayma var. P0-1'in parçası olarak düzeltilmeli.

### 3.2. Callirrhoe fonetiği + karaoke senkronu — AKICI, İKİ ŞERHLE ✅⚠️

**Fonetik harita (doğru çalışıyor):**

- Ekran metni orijinal terimi koruyor (`ChatGPT`, `Claude`, `Gemini`, `API`, `A1 hücresi`, `pivot`); TTS metni fonetik okuyor (`Çetcipiti`, `Klod`, `Cemini`, `Uygulama Programlama Arayüzü (API)`, `A bir hücresi`, `Özet Tablo (Pivot)`). Örn. parça #2 ve #7'de dört kapı da fonetik; parça #9'da `pivot tablo` → `Özet Tablo (Pivot) tablo` (hafif tekrarlı ama pedagojik).
- Karaoke/teleprompter `overlayCueDisplayText` ile ekran terimini geri basıyor — öğrenci `Çetcipiti` değil `ChatGPT` okuyor. `applyAcademySpokenPhoneticsToDisplay` ters haritası mevcut.
- Hız: ~113–123 wpm aralığı, gagalama yok; parça başına ~5–8 cümle, cümle başına ~6.6 sn — karaoke satır ritmi okunabilir.

**Şerh 1 — Çıplak `A1`:** Fonetik tabloda `A1 hücresi/hücresine/hücresinden…` varyantları var, ancak cue-05'teki *"önce A1 eşiğini kur"* ifadesindeki çekimsiz+yapım ekli `A1 eşiğini` kapsanmıyor. Parça metni `A1`'i ham bırakıyor. Callirrhoe'nun bunu "A bir" mi "ey van" mı okuduğu belirsiz — bake öncesi fonetik test cümlesiyle doğrulanmalı veya tabloya `A1 → A bir` genel kuralı (kelime sınırı korumalı) eklenmeli.

**Şerh 2 — Kelime vurgusu tahmini:** Satır saati mühürlü (1:1), ancak kelime-içi vurgu `academyKaraokeWords` ile karakter-oranlı paylaştırılıyor (gerçek forced-alignment yok). Uzun cümlelerde (±1–2 sn) kayma olabilir. Mevcut L1 temposunda kabul edilebilir; "gerçek karaoke" iddiası için ileride kelime-seviyesi hizalama (whisper-timestamp veya TTS word-boundary) bake'e eklenmeli. Ayrıca çift `aria-live` (rozet + şerit) ekran okuyucuda gevezelik yapabilir — canlı bölge tekilleştirilmeli.

---

## 4. SOMUT TESPİTLER, HATA/KUSUR VE GELİŞTİRME ÖNERİLERİ

### 4.1. P0 — Mühür bloklayıcılar (ders "mühürlendi" denmeden önce kapanmalı)

**P0-1. Süre/mühür kayması (517.16 ≠ 497.72 ≠ 498).**

- Kanıt:
  - `lib/academy/lesson-audio-timings/01_office_ai-1.json`: `durationSec 517.16`, `cacheV 517160`.
  - `docs/curriculum/01_office_ai_01_cue.json`: `durationSec 517.16`.
  - `tests/academy/sealed-audio-pilot.test.ts` (worktree): `toBe(497.72)` + `toEqual({"01_office_ai-1": 498, …})` → **bu test güncel kasette kırmızı.**
  - `lib/academy/lesson-audio.ts`: `ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-1"] = 498` (yuvarlanmış eski değer; `Math.round(517.16) = 517` olmalı — ancak kod timings'i tercih ettiği için oynatıcı bugün doğru çalışıyor, tablo yalan söylüyor).
  - `apps/rail-is/src/ui/academy-punchcards.ts`: `DRON_OFFICE_AI_1_PUNCHCARDS` sonu `497.72`.
- Etki: Web oynatıcı doğru (timings SSOT), ancak mühür testleri, süre tablosu ve mobil rozetler eski üretimde. "Golden Model mühürlendi" beyanı bu haliyle doğrulanamaz.
- Aksiyon: Tek bake numarasıyla (a) MP3'ü ve timings'i dondurun, (b) testi `517.16` + parça saatlerine güncelleyin, (c) `ACADEMY_SEALED_AUDIO_DURATION_SEC` → `517`, (d) dron dizisini web timings'ten üretin (elle değil, scriptle), (e) `cacheV`'yi bump edin.

**P0-2. Prompt/doküman zaman damgaları güncel değil.**

- `Beat 3: 319.92` → gerçek `346.36` (+26.44 sn). `CEBİNE KOY: 393.32` → gerçek `417.20` (+23.88 sn). `Veo 0–8` → gerçek `2–10` punch.
- Aksiyon: Bu raporun §1/§3 tablolarını esas alın; bake el kitabına "zaman damgaları docs/curriculum'dan kopyalanır, el yazılmaz" kuralı ekleyin.

### 4.2. P1 — Ölçme ve pedagoji

**P1-1. Sınav, anlatılmayanı ölçüyor.**

- `q_off_l1_2` (F2 apostrof hilesi): `F2` anlatıda **hiç geçmiyor**; yalnızca slayt `copilot.replyLines` ("F2 ile bir hücreye bak") ve `bullets` içinde. Öğrenci sesi dinleyip Excel'e bakmadan geçtiyse soru haksızlaşıyor.
- `q_off_l1_3` ("orijinali koru, yeni sayfada kur, yan yana doğrula"): Anlatı "birleşikleri çöz, boş satırları sil" diyor; **orijinali koruma / yeni sayfa / yan yana doğrulama** iş akışı ne seste ne sahnede öğretilmiyor (yalnızca `Döküm` → `Temiz` sekme adında ima var).
- Aksiyon (iki yoldan biri): (a) cue-05'e 1–2 cümle ekleyin ("Önce dosyayı kopyala, 'Temiz' sayfası aç; şüpheli hücrede F2'ye basıp kesme işareti var mı bak") + sahnede F2 anı ve sekme kopyalama vuruşu; (b) ya da soruları anlatılan davranışa çekin (F2 → "türleri tek tip yap" komutu; Q3 → "A1 + birleşik + boş satır" sırası). (a) önerilir — denetim kültürü L1'e değer katar.

**P1-2. 84/80 sn'lik statik Excel kareleri.**

- cue-02 (84.04 sn), cue-05 (79.92 sn), cue-04 (71.12 sn) boyunca sahne aynı ızgara; punchcard da değişmiyor. PEDAGOJI "5–8 sn'de görsel odak değişir" kuralı canlı Excel kipinde işlemiyor.
- Aksiyon: Cue-içi mikro-vuruşlar ekleyin — satır-satır reveal, A1 zoom-in/out, formül çubuğu değişimi, AI masası belirme/kaybolma. En azından cue-02'ye AI masası, cue-04'e A1 zoom sekansı şart.

**P1-3. CEBİNE KOY görsel checklist yok.**

- Aksiyon: cue-07'de Excel üstü/yanı mini-overlay: `1. A1'e sütun adı · 2. Birleşikleri çöz + boşlukları sil · 3. Yalın dille tek tip yap`. Sesle senkron 3 adımda tik animasyonu.

### 4.3. P2 — Miksaj ve fonetik

**P2-1. Bed lift mantığı.**

- `ACADEMY_BED_LIFT_CUE_IDS = ["cue-07"]` tüm 39.8 sn'lik kural anlatımını 0.46'da tutuyor. Ayrıca tüm parça araları 0.4 sn olduğundan `smoothstep(0→4 sn)` yükselmesi hiç tamamlanamıyor (0.4 sn'de kazanç ~0.129). Yani "nefes payında yükselir" tasarımı bu kasette fiilen çalışmıyor; bed neredeyse sabit 0.12 + cue-07'de 0.46.
- Aksiyon: (a) cue-07'yi cümle aralarında 0.46 / cümle içinde 0.12–0.18 yapın (parça-içi ducking), (b) ya `pauseSec`'i 0.8–1.2 sn'ye çıkarın ya da rise sabitini (`ACADEMY_BED_DUCK_TAU_SEC = 4`) 0.6–1.0 sn'ye indirin.

**P2-2. Çıplak `A1` + `kilitle` kipi.**

- `"önce A1 eşiğini kur"` → fonetik kapsama alınmalı. `"şirket formatını kilitle"` → `"kilitler"` olmalı (ekran + TTS + slayt).

### 4.4. P3 — Mikro temizlik listesi

1. Merged hücreye `table.note` yerine afiş başlığı basın (§1.3).
2. Render edilmeyen `table.note` alanlarını ya sahneye dip-not olarak ekleyin ya da katalogdan düşürün.
3. `Özet Tablo (Pivot) tablo` tekrarını TTS metninde `"Özet Tablo (Pivot)"` olarak sadeleştirin (ekran `pivot tablo` kalabilir).
4. Çift `aria-live` (punchcard + karaoke) → tek canlı bölge; diğeri `aria-hidden` + görsel.
5. `section_1.ts` içinde `targetDurationMinutes: 9.3` yazıyor; gerçek `8.62`. Makale üstbilgisini mühürle eşitleyin.
6. `docs/curriculum/*` dosyaları untracked (henüz commitlenmemiş) — mühür commit'iyle birlikte `seal` + `cacheV` + MP3 hash'i tek işlemde dondurulmalı.
7. Split-screen mobil okunabilirlik testi (gerçek cihaz, 360px) — etiket ve hücre fontları için görsel QA.

### 4.5. Müfredat geneli için öneriler (L2–L30)

1. **Zaman SSOT boru hattı:** `bake → timings.json → cue.json → dron.ts → test beklentileri` tek scriptten üretilsin; elle kopya yasaklansın. CI'da `timings.durationSec == cue.durationSec == dron sonu == MP3 header süresi (±0.75 sn)` kapısı eklensin.
2. **MP3 süre kapısı:** Mevcut `pcmWavDurationSec` WAV'a bakıyor; yayın MP3'ünün header süresi timings ile karşılaştırılmıyor. Transcode sonrası MP3 probe ekleyin.
3. **Cue-içi görsel dil:** Her cue'ya 2–4 mikro-vuruş şeması (`highlightCell` sekansı, zoom, AI masası aç/kapa) standart olsun; 60 sn+ cue yasaklansın veya bölünsün.
4. **Sınav-öğretim hizası:** Her sınav sorusu, anlatıdaki cümle numarasına (`cue-05/p2/c3` gibi) referansla yazılsın; "görselde var, seste yok" soru otomatik bayraklansın.
5. **Ekosistem derinliği:** L2'de "kapı seçimi" mini-karar ağacı (satır sayısı → Claude, hız → ChatGPT, adımlı plan → Gemini, şablon → API) + her kapıda 1 ekran görüntüsü/dakika.
6. **Karaoke 2.0:** Kelime-seviyesi hizalama bake'e eklensin; cümle-oranlı sistem yedek olarak kalsın.

---

## EK A — Mühür zaman çizelgesi (güncel, 517.16)

```
0.00 ── 2.00  │ JENERİK (logo + 01_OFFICE_AI, Lyria 0.46, rozet yok)
2.00 ──10.00  │ cue-01 GİRİŞ KÖPRÜSÜ · Veo punch (8 sn video)
10.00 ─40.60  │ cue-01 hold (donmuş Veo karesi)
41.00 ─125.04 │ cue-02 HOŞ GELDİN · canlı Excel (boş kitap) ⚠️ ses AI ekosistemi anlatıyor
125.44─194.12 │ cue-03 DÜZENSIZ TABLO · canlı Excel (birleşik afiş + boş satır + tür karmaşası)
194.52─265.64 │ cue-04 A1 HÜCRESİ · canlı Excel (A1 zoom)
266.04─345.96 │ cue-05 TEMİZLE ŞİMDİ · canlı Excel + AI masası (ChatGPT/Claude/Gemini/API)
346.36─416.80 │ cue-06 FARK ORTADA · SPLIT-SCREEN (sol: cue-03 ham · sağ: düzenli + Toplam)
417.20─457.00 │ cue-07 CEBİNE KOY · canlı Excel (3 kural — görsel checklist eksik)
457.40─517.16 │ cue-08 SIRA SENDE · canlı Excel (saha görevi)
```

Toplam sözcük ~1005, genel hız ~117 wpm. Parça araları 0.40 sn × 13.

## EK B — Test matrisi (worktree)

| Test | Beklenti | Güncel kaset | Sonuç |
|---|---|---|---|
| `sealed-audio-pilot.test.ts` `durationSec` | 497.72 | 517.16 | ❌ kırmızı (P0-1) |
| `sealed-audio-pilot.test.ts` `ACADEMY_SEALED_AUDIO_DURATION_SEC` | `{1: 498, 2: 483}` | timings 517.16 / 483.48 | ❌ kısmi (L2 doğru, L1 eski) |
| `office-ai-lesson-1.test.ts` (8 slayt, rozetler, split, kirli yok) | cue/slayt yapısı | uyumlu | ✅ yeşil (beklenir) |
| `office-ai-lesson-1-golden.test.ts` (2 sn nefes, Veo bake) | intro + Veo | uyumlu | ✅ yeşil (beklenir) |
| `office-ai-lesson-1-seal.test.ts` (ducking, sınav pin) | ducking + sınav | uyumlu | ✅ yeşil (beklenir) |
| `lesson-karaoke-strip.test.ts` (14 parça, cümle şeridi) | 14 flow | 14 parça | ✅ yeşil (beklenir) |

Not: Bu raporda testler çalıştırılmadı; beklentiler kod okumasıyla karşılaştırıldı. Mühür commit'i öncesi `vitest run tests/academy/office-ai-lesson-1*.test.ts tests/academy/sealed-audio-pilot.test.ts tests/academy/lesson-karaoke-strip.test.ts` koşulmalı.

---

*— Muse Spark, Baş Denetçi. Bu rapor tarafsız dış gözle yazıldı; bulgular dosya ve satır kanıtına dayanır. P0 kapanmadan "Golden Model mühürlendi" beyanı verilmemelidir.*
