# PEDAGOJI.md — Bütünleşik Medya ve Eğitim Rejisi Standartları

Bu belge platformun canlı eğitim felsefesini, Google AI Studio medya fabrikası rol dağılımını ve görsel-işitsel reji standartlarını tanımlar.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Canlı model kimliği kod SSOT’tadır (`lib/kernel/ai/model-roles.ts`). Bake SOP, RPM ve CLI sayıları `docs/ops/akademi-bake-elkitabi.md` içindedir.

---

## A. TEMEL EĞİTİM FELSEFESİ

### 1. Somut ve Uygulamalı Anlatım ("Garsonu Göster")

Soyut tanımlar yığılmaz. Ekranda kulakta duyulan ne ise (örneğin A1 hücresi), göz ekranda **%80** oranında o somut uygulamayı ve ekran kaydını görür. Kalan **%20** sinematik arayüz, şema ve bağlam plakasıdır.

* Anlatılan işlem ile görünen kare milisaniyesine kadar örtüşür; ses ile görsel ayrışmaz.
* «Ajan otonom bir döngüdür» demek yerine sipariş, araç, bellek ve teslim adımı masada çalışır.
* Her yayın SKU kendi iş dilini kullanır. Tek şablon her alana zorla dayatılmaz.

### 2. Aptala Anlatır Gibi Netlik & SEN Dili

Sıfır jargon, insani, sıcak, arkadaşça ve çözüme giden bir dil kullanılır.

* Anlatıcı öğrenciye «sen» diye hitap eder.
* Cümle TTS ritmine uyar: kısa, konuşulabilir, günlük.
* Jargon kaçınılmazsa önce günlük karşılığı, sonra terim gelir.

### 3. Bilişsel Yük Yönetimi (Sıfır Paragraf)

Ekranda uzun metin blokları veya okuma paragrafı gösterilmesi **KESİNLİKLE YASAKTIR**. Ekranda sadece ilgili saniyede beliren en fazla **3 kelimelik** esnek **Punchcard Rozetleri** parlar.

* Rozet slogan niteliğindedir; görseli destekler, teleprompter olmaz.
* Görsel odak 5–8 saniyede bir değişir (canlı uygulama, Veo B-roll, Nano Banana şeması).
* Konuşma aralarında 3–5 saniyelik nefes payı bırakılır.

**Junior oda ≠ başlangıç seviyesi.** 18 yaş altı ürün yoktur (`JUNIOR_PRODUCTION_LOCKED`; Anayasa B2). Başlangıç seviyesi Akademi içi **Temel Paketler** ile karşılanır.

---

## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI

İçerik üretiminde kendi iç dil modelinin (Cursor) metin veya görsel uydurması tamamen yasaktır. Yapay zeka fırınlarının görev dağılımı şöyledir:

| Rol | Fırın | Görev |
|-----|-------|--------|
| Metin & Senaryo | **Gemini 3.8 Flash** | 4-beat reji yapısına (Warm-up → Command → Comparison → Task) uygun ders senaryolarını hazırlar. |
| Seslendirme | **Gemini 3.1 Flash TTS** | Metni Gözde (**Callirrhoe**) ses karakteriyle mühürler. |
| Görsel & Video | **Nano Banana 2 / Veo 3.1 Lite** | %80 canlı uygulama / %20 sinematik. Varsayılan B-roll: **Veo 3.1 Lite** veya `/public/media/academy/micro/` yerel MP4 reuse. Pahalı Veo 3.1 API her ders fırınında **KESİNLİKLE YASAKTIR**. Yedek: Nano Banana 2 (Gemini 3.1 Flash Image) + CSS Ken Burns. |
| Ducking Müzik | **Lyria 3.5** | Konuşmanın arkasına ritmik dip müziği basar. Eğitmen konuşurken müzik dipte kalır; konuşma aralarındaki 3–5 saniyelik nefes paylarında hafifçe yükselir. |
| Montaj Operatörü | **Cursor** | API'lerden dönen metin, ses, cue zamanlaması, görsel ve müzik verilerini `docs/curriculum/` ve `public/media/` altına kaydeder; `citizen-player` bileşeninde senkronize eder. |

**4-beat reji (Warm-up → Command → Comparison → Task)** tek eğitmen, SEN dili; **Pekiştirme ve Tekrar** iki durak ekler:

| Sıra | Beat | Karşılık | İçerik |
|------|------|----------|--------|
| — | GİRİŞ KÖPRÜSÜ | Warm-up öncesi ~30 sn | Yapay zekâ ile çalışma refleksini hatırlatan ısınma |
| 1 | Warm-up | Isınma / İş Problemi | Gerçek iş hayatı karşılığı |
| 2 | Command | Birinci Senaryo / Temel Yöntem | İlk istem ve çözüm — ekranda çalışan işlem |
| 3 | Comparison | İkinci Senaryo / İstisna | Edge-case, yanlış vs doğru, kritik durum |
| — | CEBİNE KOY | Task öncesi ~45 sn | Üç somut adımı tane tane tekrarlayan kapanış özeti |
| 4 | Task | Özet & Saha Görevi | Cebine koyacakların |

Ducking: 0–2 sn giriş jeneriğinde Lyria 0.46 (konuşma yok); Gözde 2.0 saniyede başlayınca müzik tatlıca 0.12’ye iner. Nefes payı ile **CEBİNE KOY** pekiştirme durağında 0.46. Gelecek Ders Köprüsü’nün son 3 saniyesinde müzik yeniden 0.46’ya yükselir. Konuşma bittiği an Lyria **0.70** zirveye tırmanır; logo + 1-2-3 özet checklist üstünde 3 sn coşkulu jenerik, ardından 1.5 sn fade-out. Intro nefesi, outro crescendo ve dinamik görsel reji **§E Altın Şablon Standartları** anayasa maddesidir.

**Altın Şablon görsel reji** (`01_office_ai-1` — gelecek müfredatın cue-görsel sözleşmesi):

| Beat | Ekran | Not |
|------|-------|-----|
| — Giriş jeneriği | 0–2 sn logo + `01_OFFICE_AI` | Yalnız Lyria 3.5 (0.46); konuşma yok |
| — Bitiş jeneriği | Konuşma sonrası 3 sn logo + 1-2-3 özet, 1.5 sn fade-out | Lyria 0.70 zirve → fade-out |
| 1 Warm-up | 8 sn Veo 3.1 Lite ofis/veri-akışı B-roll (yerel MP4 reuse veya Ken Burns), sonra canlı Excel | Statik plaka yok; pahalı Veo 3.1 API yok |
| 2 Command | %80 tek ekran canlı uygulama | İlk istem ve çözüm; ChatGPT / Claude / Gemini / API masası; **Spoiler Yasağı** — temiz/nihai tablo yok |
| 3 Comparison | Dikey split-screen | Sol: ÖNCE (DÜZENLEMESİZ) ham/düzensiz tablo, turuncu çerçeve. Sağ: SONRA (AI İLE) düzenli tablo, yeşil-mavi neon, A1 ışıldar. Temiz tablo **ilk kez** sağ panelde açılır |
| 4 Task | Düzenli nihai tablo | Saha görevi; karşılaştırmadan yumuşak dönüş |

Vatandaş etiketinde «Kirli» yok. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı». Görsel SSOT: `lib/academy/lesson-beat-visual.ts`.

Üretim sırası **senaryo → mühürlü ses → cue → görsel/video → ducking müzik → montaj**’dır; tersine değil. Senaryo, cue ve visual zoom senkronu tam oturmadan `--seal` (ücretli TTS/Video) **KESİNLİKLE** çağrılmaz. Geliştirme ve deneme `--dry-run` ile yürür. Taslak ses vatandaş yüzeyine basılmaz. İnsan onayı olmadan harici TTS yok. Ayrıntı bake el kitabındadır (`skip preventer`, `--seal` kapısı, §E.4–E.5).

**İzleme anında harici üretici API çağrılmaz.** Fırın bake’de çalışır; oynatıcı mühürlü medyayı senkronize eder. Cue orijinal terimi korur; ses fonetik okur. Placeholder test-pattern vatandaşa basılmaz.

Kod SSOT: `lib/academy/production-standard.ts`. Görsel reji SSOT: `lib/academy/lesson-beat-visual.ts`.

---

## C. SÜRE VE MODÜL MATEMATİĞİ

- **Ders Başı Taban Süre:** En az 5 dakika. İdeal sindirme süresi: **5–9 dakika**.
- **Kurs / SKU Başına Bölüm Sayısı:** En az 6 bölüm.
- **Başarı ve Mühür Barajı:** Kurs sonu sınavından **70+** alma zorunluluğu vardır. Sertifika satın alınamaz, hak edilir. Puan **sunucu** tarafındadır (Anayasa A4).

Compact makale gövdesi bu bantla kesilmez (Anayasa B4 — konunun hakkı). Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır; ofis amiralinde Gözde (Callirrhoe) mühürdür. Model kimliği Pedagoji’de durmaz.

---

## D. VİTRİN KABUK KARMASI VE DÜRÜST YÜZEY (A5)

Vitrin otoritesini ve güvenini korumak için platformda 5'li Vitrin Karması listelenir:

1. `01_office_ai` (İş Hayatında ve Ofiste Yapay Zekâ) → **YAYINDA / AMİRAL LOKOMOTİF**
2. `05_prompt_practice` (Pratik Prompt Mühendisliği) → **ÇOK YAKINDA / KAPI ÜRÜNÜ**
3. `04_chatbot_nocode` (Kodsuz WhatsApp & Chatbot) → **ÇOK YAKINDA / PRESTİJ**
4. `02_ecommerce_ai` (E-Ticaret ve Pazaryeri AI) → **ÇOK YAKINDA / SEPET DOLDURUCU**
5. `03_social_media_ai` (Sosyal Medya Video Fabrikası) → **ÇOK YAKINDA / GÖRSEL MAGNET**

**Dürüst Yüzey (Anayasa A5):** `01_office_ai` dışındaki 4 ürünün üzerinde "Çok Yakında / Hazırlanıyor" rozeti durur. Tıklandığında ön sipariş/bilgilendirme gösterilir. Bağlı olmayan medya, eksik bake veya mühürsüz ders için hayali oynatıcı basılmaz; vatandaşa dürüstçe henüz hazır olmadığı söylenir.

---

## E. ALTIN ŞABLON STANDARTLARI

`01_office_ai-1` finalinde kesinleşen görsel, işitsel ve pedagojik reji **gelecek müfredatın anayasa maddesidir**. Cue-görsel sözleşmesi bu maddeden sapmaz. Kod SSOT: `lib/academy/lesson-beat-visual.ts`, `lib/academy/lesson-veo.ts`, `lib/academy/excel-workspace.ts`, `lib/academy/excel-focus-zoom.ts`, `lib/academy/excel-mouse-pointer.ts`, `lib/academy/lesson-intro.ts`, `lib/academy/lesson-bed-duck.ts`.

### E.1 Görsel Reji ve İmleç Dinamiği (Dynamik Visuals)

* **Spoiler Yasağı:** Command beat boyunca temiz/nihai tablo veya sonuç **KESİNLİKLE** gösterilemez. Ekran dağınık/ham veride kalır. Temiz tablo ilk kez Beat 3 (Comparison) split-screen sağ panelinde açılır.
* **Dinamik Zoom-In (%120 Scale):** Seste odaklanılan hücre/alan (örneğin «A1 hücresi») anlatılırken ekran %120 oranında (`transform: scale(1.2)`) yumuşakça yakınlaşır; genel analize geçilince %100 geniş açıya döner.
* **Sanal Fare (Mouse Pointer) ve Hücre Gezintisi:** Seste anlatılan komut ve sütunlara göre sanal bir mouse imleci ekranda yumuşakça süzülür, hedef hücreye tıklar (click-ripple) ve aktif hücre odağını (activeCell A1 → B1 → C1) kaydırır.
* **Gerçekçi Merged Hücre Çerçevesi:** Birleştirilmiş bir hücre (örneğin A1:F1) seçildiğinde yeşil hücre çerçevesi parçalanmaz; birleştirilmiş alanın **tamamını** bütünsel olarak sarar.

### E.2 İçerik Netliği ve Pratik Aktarım

* **3 Somut Veri Aktarım Yolu:** Yapay zekâya veri verme adımı seste ve ekrandaki AI Masasında 3 somut etiketle öğretilir: 1) Kopyala-Yapıştır, 2) Ataş İle Yükle, 3) Copilot İle Okut.
* **Çoklu AI Ekosistemi:** Yalnız Copilot değil; ChatGPT, Claude, Gemini ve Özel API farkı sade bir dille işlenir. Jargon terimler («Uygulama Programlama Arayüzü») kısaltılarak netleştirilir.

### E.3 İşitsel Reji ve Outro Crescendo

* **Intro Nefesi:** 0–2.0 sn arası konuşma olmaz. Yalnızca Lyria müziği (0.46 gain) ve jenerik logosu gösterilir. Konuşma 2.0. sn’de başlar, müzik 0.12’ye iner.
* **Outro Zirvesi (Crescendo):** Konuşma bittiği an Lyria müziği `0.70` peak seviyesine tırmanır. Logo ve 1-2-3 özet checklist ekranında 3 saniye coşkulu jenerik çalar, ardından 1.5 saniyelik fade-out ile kapanır.

### E.4 Bütçe Korumalı B-roll Mimarisi (Veo Lite & Reuse)

Google AI Studio bütçesi her ders fırınında korunur. Pahalı **Veo 3.1** API çağrısı (`veo-3.1-generate-preview`) **KESİNLİKLE YAPILMAZ**.

| Kaynak | Maliyet | Ne zaman |
|--------|---------|----------|
| Yerel MP4 reuse | Sıfır | Kaset `/public/media/academy/micro/` altında duruyorsa varsayılan |
| **Veo 3.1 Lite** | Düşük | Yeni kaset gerektiğinde; endpoint `veo-3.1-lite-generate-preview` |
| Nano Banana 2 + CSS Ken Burns | Sıfır video API | Lite yoksa veya deneme: Gemini 3.1 Flash Image plakası üzerine Pan-Zoom |
| Pahalı Veo 3.1 | **Yasak** | Her ders fırınında çağrı açılmaz |

* Warm-up B-roll 8 sn kalır; punch sonrası canlı Excel’e kesilir (donmuş kare yok).
* Oynatıcı izlemede VIDEO_GEN çağırmaz. Ken Burns CSS anahtarı: `academy-eye-kenburns` (`app/globals.css`); punch penceresinde Nano Banana 2 plakasına Pan-Zoom basar.
* Kod SSOT: `lib/academy/lesson-veo.ts`, `lib/academy/baked-micro-videos.ts`, `scripts/generate-academy-lesson-veo.ts`.

### E.5 Fırınlama (Bake) Disiplini

Ücretli TTS ve video mühürü, reji oturmadan açılmaz.

* Senaryo, cue ve visual zoom senkronizasyonu tam oturmadan `--seal` (ücretli TTS/Video) çağrısı **KESİNLİKLE YASAKTIR**.
* Geliştirme ve deneme aşamasında tüm testler `--dry-run` bayrağı ile yürütülür; harici Google AI Studio çağrısı doğmaz.
* `--seal` yalnız `--confirm-gemini-spend` ve insan onayı ile; vatandaş yüzeyine taslak WAV/MP4 basılmaz.
* B-roll’da yerel kaset varsa API atlanır (reuse). Yeni kaset gerekirse yalnız Veo 3.1 Lite; pahalı Veo 3.1 yok.
* Kod SSOT: `scripts/generate-academy-lesson-audio.ts`, `scripts/generate-academy-lesson-veo.ts`, `scripts/generate-academy-lesson-bed.ts`. Operatör SOP: `docs/ops/akademi-bake-elkitabi.md`.

### E.6 Dinamik Vektörel Şema ve Mantık Katmanı (SVG / React Dynamic Logic)

İlerleyen derslerde (Otomasyon, Mantıksal Karar Ağaçları, No-Code Chatbot vs.) kullanılacak vektörel çizimler ve mantık akışları için aşağıdaki kurallar bağlayıcıdır:

* **İnteraktif SVG & React State Entegrasyonu:** Mantıksal karar ağaçları, lojik kapılar (AND/OR/NOT) veya süreç diyagramları statik resim olarak basılmaz. Doğrudan `components/academy/` altında interaktif React SVG bileşenleri olarak render edilir. Sesteki anlatıma senkronize biçimde çizgi renkleri (yeşil/kırmızı), veri akış noktaları ve ışıklar (active state) dinamik olarak parlar.
* **Dinamik Sütun ve Metin Hizalama (No-Truncate & DOM Bounds):** Tablo ve çalışma alanlarındaki `activeCell` yeşil seçim kutusu kesinlikle `getBoundingClientRect` ile ilgili `th/td` elementine milimetrik kilitlenir; hiçbir sapmaya izin verilmez. Sıkışık/Split ekranlarda metinlerin üç noktaya (`...`) düşmesi engellenir; esnek font ölçekleme (`font-size: clamp(...)`) veya dinamik sütun genişliği (`min-width: content`) zorunludur.
* **Sıfır Ekstra API Maliyeti:** Vektörel şemalar kod seviyesinde React/SVG bileşeni veya Lottie JSON olarak çizildiği için görseller için harici API üretimi yapılmaz, maliyet 0 TL olarak korunur.
* Kod SSOT: `components/academy/` (interaktif SVG / React state), `components/academy/lesson-excel-workspace.tsx` (`getBoundingClientRect` kilit).
