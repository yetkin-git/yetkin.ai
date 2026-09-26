# PEDAGOJI.md — Eğitim felsefesi

Bu belge platformun **kalıcı eğitim felsefesini**, Google AI Studio medya fabrikası rol dağılımını ve görsel-işitsel reji standartlarını tanımlar. Canlı uç kimliği kod SSOT’tadır (`lib/kernel/ai/model-roles.ts`). Bake SOP ve CLI `docs/ops/akademi-bake-elkitabi.md` içindedir. Canlı kaset ve sınav sayıları `docs/ops/DURUM.md` ve koddadır. `docs/DURUM.md` yalnız oraya yönlendirir. Ders adedi `lib/academy/curricula/lesson-index.ts` içindedir.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Yayın formatı Anayasa B4 ile aynıdır: 4 katmanlı eğitim videosu. Son hiza **24 Eylül 2026 (REFORM-03)**.

Mimari ad Anayasa B1’dir: **Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci**. Bu belge öğretme kuralını ve yayın formatını tutar. İkinci bir ürün mimarisi, sürü veya ayrı servis hikâyesi açmaz.

---

## A. TEMEL EĞİTİM FELSEFESİ

### 1. Somut ve Uygulamalı Anlatım ("Garsonu Göster") & Nedensellik Reformu

Soyut tanımlar, brifing tebliğleri ve altı boş sloganlar ("saniyeler içinde etkileyici", "muazzam dönüşüm", "vazgeçilmez ekip üyesi", "büyü burada başlıyor") KESİNLİKLE YASAKTIR. Kulakta duyulan işlem, gözde o somut uygulamadır.

* **Sebep → Eylem → Sonuç Zinciri:** Öğrenciye verilen her kuralın arkasındaki **"Neden?"** sorusu net cevaplanır.
* Anlatılan işlem ile görünen kare örtüşür; ses ile görsel ayrışmaz.
* Her yayın SKU kendi iş dilini kullanır. Tek şablon her alana zorla dayatılmaz.

### 2. Günlük Dil, Tek İş, Tek Cümle & SEN Dili (Vatandaş Dili)

Sıfır jargon, insani, sıcak ve çözüme giden bir dil kullanılır.

* **Öğretmen SEN, Belge SIZ:** Eğitmen öğrenciye «sen» der. Dilekçe, resmî yazı veya sözleşme çıktısında belgenin dili «siz» kalır.
* Cümle kısa, konuşulabilir ve günlüktür. Bir cümlede tek iş durur.
* Jargon kaçınılmazsa önce günlük karşılık, sonra terim gelir. Ham dosya uzantıları vatandaş yüzeyinde Excel tablosu / Word belgesi / PowerPoint sunusu diye anılır.
* **Günlük Dil, Tek İş, Tek Cümle:** Her cümle tek eyleme odaklanır. Cümle kısa, duru ve konuşma dilindedir. Kural söylenince hemen somut örnek gelir.
* **Aforizma / Ajans Sloganı Yasağı:** Eğitim dili aforizma, ajans sloganı veya tekerleme olamaz. «Karar notu insanındır», «Sunum fabrikası» gibi edebi laflar yasaktır. «Muazzam dönüşüm», «saniyeler içinde», «mucizevi yöntem», «prompt mühendisliği» ve «devrim niteliğinde» de yasaktır. Bu dil, konuyu anlamayan öğrencide «bende bir eksiklik var» hissi yaratır. Dil; bir öğretmenin öğrencisine doğrudan, sade ve eylem odaklı anlattığı duru Türkçe olmak zorundadır.
* **Tereddüt anlatıcıdadır:** Karmaşık adımda «Şimdi 'burada ne oldu böyle?' demiş olabilirsin. Çok haklısın, adım adım bakalım...» denir. Konu mucize değil, gündelik işin sakin parçasıdır.
* **Stüdyo dili öğrenci yüzeyine girmez:** bake, kaset, compact, punchcard, kapı ve taşıma su yalnız üretim kılavuzundadır. Vatandaş metninde günlük karşılık kullanılır: sesli ders, tam ders metni, sahnedeki kısa rozet.

### 3. Bilişsel Yük

Karaoke sahnesinde uzun paragraf gösterilmez. Sahnede yalnız o saniyeye ait kısa **Punchcard Rozetleri** durur. Rozet işin adını taşır («Tek Tek Kopyalama», «Tek Dosyayla Analiz»). Altyazı titremez; alt uzantılı harf kesilmez; tuval oranı korunur. Piksel, gain ve süre ölçüsü bake el kitabındadır.

**Altyazı Titreme Yasağı** ilkesidir: aktif kelime cümleyi sağa sola itmez. Ayrıntı oynatıcı kodu ve bake el kitabındadır.

Çalışma sekmesindeki tam metin, eğitim videosunun konuşma katmanıdır; ayrı bir makale yayını değildir (Anayasa B4). Nasıl-yapılır adım bandı overlay paragrafı değildir.

**Junior oda ≠ başlangıç seviyesi.** 18 yaş altı ürün yoktur (`JUNIOR_PRODUCTION_LOCKED`; Anayasa B2). Başlangıç seviyesi Akademi içi **Temel Paketler** ile karşılanır.

**Quiet Luxury:** sahne sakin durur. Dikkat süsle değil, o anki işle kalır.

### 4. Reji dağılımı

Sahne süresi **%80 canlı uygulama ekranı**, **%20 sinematik veya kılavuz kartı**dır. Sabit, işlevsiz logo veya boş plaka sahnenin gövdesi olamaz. Isınma klibi biter; iş beat’i canlı ekranda yürür. Ayrıntı `lib/academy/lesson-beat-visual.ts` içindedir.

---

## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI

Üretken yapay zekâ müfredat senaryosunu, fırınlamayı ve montajı meşru olarak yürütür. Vatandaş yüzeyi mühürlü eğitim videosunu oynatır. İzlemede model çağrılmaz. Taslak ses ve taslak görüntü yüzeye basılmaz.

**Model sicili.** Canlı uç kimliği `lib/kernel/ai/model-roles.ts` dosyasındadır. Bu belgede metin, görsel ve montaj modeli isimle dondurulmaz ve «tablodaki ad silinmez» kuralı yoktur. Rol kimliği değişince felsefe metni yeniden yazılmaz; dört katman ve pedagoji durur. Metin ve ders asistanı `FAST_STREAM` rolünden okunur. Ses mührü istisnadır: `VOICE_TTS` yalnız **Gemini 3.1 Flash TTS** (`gemini-3.1-flash-tts-preview`). Kota bitince Gemini 2.5 açılmaz (`VOICE_TTS_FALLBACK_TO_2_5` kapalı). Bake sırası ve CLI `docs/ops/akademi-bake-elkitabi.md` içindedir.

Yapay zeka fırınlarının görev dağılımı şöyledir:

| Rol | Fırın | Görev |
|-----|-------|--------|
| Metin & Senaryo | **`FAST_STREAM`** (`model-roles.ts`) | 4-beat reji yapısına (Warm-up → Command → Comparison → Task) uygun ders senaryolarını hazırlar. |
| Seslendirme | **Gemini 3.1 Flash TTS** | Amiral SKU `01_office_ai` metnini Gözde (**Callirrhoe**) ile mühürler. Diğer eğitimlerde, OFF-201 dahil, ders sesi fırın haritasındadır (`ACADEMY_OFF201_LESSON_TTS_VOICE`). |
| Görsel & Video | **Nano Banana 2 / Veo 3.1 Lite** | %80 canlı uygulama / %20 sinematik. Varsayılan B-roll: **Veo 3.1 Lite** veya `/public/media/academy/micro/` yerel MP4 reuse. Pahalı Veo 3.1 API her ders fırınında **KESİNLİKLE YASAKTIR**. Yedek: Nano Banana 2 (Gemini 3.1 Flash Image) + CSS Ken Burns. |
| Ducking Müzik | **Lyria 3.5** | Konuşmanın arkasına ritmik dip müziği basar. Eğitmen konuşurken müzik dipte kalır; konuşma aralarındaki 3–5 saniyelik nefes paylarında hafifçe yükselir. |
| Müfredat, fırın ve montaj | **Üretken yapay zekâ (Cursor)** | Senaryoyu, cue zamanlamasını ve görsel rejiyi dört katman standardına göre üretir. Dönen ses, görüntü ve müziği mühürler; oynatıcıda senkronize eder. Ücretli çağrı insan onayı ve `--seal` kapısıyla açılır. |

**4-beat reji (Warm-up → Command → Comparison → Task)** tek eğitmen, SEN dili; **Pekiştirme ve Tekrar** iki durak ekler:

| Sıra | Beat | Karşılık | İçerik |
|------|------|----------|--------|
| — | GİRİŞ KÖPRÜSÜ | Warm-up öncesi ~30 sn | Yapay zekâ ile çalışma refleksini hatırlatan ısınma |
| 1 | Warm-up | Isınma / İş Problemi | Gerçek iş hayatı karşılığı |
| 2 | Command | Birinci Senaryo / Temel Yöntem | İlk istem ve çözüm — ekranda çalışan işlem |
| 3 | Comparison | İkinci Senaryo / İstisna | Edge-case, yanlış vs doğru, kritik durum |
| — | Pekiştirme durağı | Task öncesi ~45 sn | Üç somut adımı tane tane tekrarlayan kapanış özeti. Stüdyo anahtarı vatandaş rozeti değildir |
| 4 | Task | Özet & Saha Görevi | Üç somut adım ve saha görevi |

Konuşma 2.0 saniyede başlar. Bu aralıkta ekranda iş kartı durur. Jenerik logo plakası opsiyoneldir; sahnenin gövdesi olamaz (§A.4). Amiral SKU `01_office_ai` anlatıcısı Gözde (Callirrhoe)’dir. Konuşma bitince 1-2-3 iş özeti ekranda kalır. Logo plakası bu özete eklenmek zorunda değildir. Gain, nefes ve kapanış süreleri `lib/academy/lesson-bed-duck.ts` içindedir; bu paragraf o sayıları ikinci kez dondurmaz. Intro, outro ve dinamik görsel reji **§E Altın Şablon Standartları** içindedir.

**Altın Şablon görsel reji** (`01_office_ai-1` — gelecek müfredatın cue-görsel sözleşmesi):

| Beat | Ekran | Not |
|------|-------|-----|
| — Giriş | Konuşmadan önce iş kartı. Logo plakası opsiyonel | Konuşma yok. Gain kodda |
| — Bitiş | 1-2-3 iş özeti zorunlu. Logo plakası opsiyonel | Gain ve fade kodda |
| 1 Warm-up | 8 sn Veo 3.1 Lite ofis/veri-akışı B-roll (yerel MP4 reuse veya Ken Burns), sonra canlı Excel | Statik plaka yok; pahalı Veo 3.1 API yok |
| 2 Command | %80 tek ekran canlı uygulama | İlk istem ve çözüm; ChatGPT / Claude / Gemini / API masası; **Spoiler Yasağı** — temiz/nihai tablo yok |
| 3 Comparison | Dikey split-screen | Sol: ÖNCE (DÜZENLEMESİZ) ham/düzensiz tablo, turuncu çerçeve. Sağ: SONRA (AI İLE) düzenli tablo, yeşil-mavi neon, A1 ışıldar. Temiz tablo **ilk kez** sağ panelde açılır |
| 4 Task | Düzenli nihai tablo | Saha görevi; karşılaştırmadan yumuşak dönüş |

Vatandaş etiketinde «Kirli» yok. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı». Görsel SSOT: `lib/academy/lesson-beat-visual.ts`.

Üretim sırası **senaryo → mühürlü ses → cue → görsel/video → ducking müzik → montaj**’dır; tersine değil. Senaryo, cue ve visual zoom senkronu tam oturmadan `--seal` (ücretli TTS/Video) **KESİNLİKLE** çağrılmaz. Geliştirme ve deneme `--dry-run` ile yürür. Taslak ses vatandaş yüzeyine basılmaz. İnsan onayı olmadan harici TTS yok. Ayrıntı bake el kitabındadır (`skip preventer`, `--seal` kapısı, §E.4–E.5).

**İzleme anında harici üretici API çağrılmaz.** Fırın bake’de çalışır; oynatıcı mühürlü medyayı senkronize eder. Cue orijinal terimi korur; ses fonetik okur. Placeholder test-pattern vatandaşa basılmaz.

Kod SSOT: `lib/academy/production-standard.ts`. Görsel reji SSOT: `lib/academy/lesson-beat-visual.ts`.

Süre bandı ve sınav barajı kod SSOT’tadır (`lib/academy/production-standard.ts`, `ACADEMY_EXAM_PASS_SCORE`). Mühür tabanı 5 dakika ve 6 derstir; üst dakika tavanı yoktur. Vitrin kartındaki dakika yuvarlaması ayrıdır (`lib/academy/lesson-meta.ts`). Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır. Gözde (Callirrhoe) yalnız amiral SKU `01_office_ai` mühürüdür. OFF-201 ve diğer eğitimler `lib/academy/instructors.ts` içindeki `ACADEMY_OFF201_LESSON_TTS_VOICE` haritasını kullanır.

---

## C. VERİYİ VERMEDEN ÖNCE — ÜÇ ADIM

Sıra sabittir. Eski «üç kapı» sırası önce aktarım yolunu soruyordu. Ofiste ilk soru şirketin hangi aracı onayladığıdır.

1. **Şirket politikası.** Şirketin onayladığı araç hangisi? Onaylı olmayan araca iş postası, sözleşme ve müşteri listesi gitmez. Onaylı araç yoksa kutuyu veya dosyayı kişisel hesaba taşımazsın.
2. **Veri sınıfı.** Kişisel veri, şirket sırrı ve herkese açık katalog ayrıdır. Ham kimlik, IBAN, maaş ve sır hiçbir araca açık hâliyle girmez. Ürüne ait, kişiye bağlı olmayan satır (ürün adı, tutarı olmayan genel stok) gidebilir.
3. **Aktarım yolu.** Onaylı araçta sırayla bakılır: **Yerleşik araçlar** (panel), yoksa **Ataş / dosya yükleme**, ikisi de yoksa **Son çare** maskeli kısa özettir. Maskeleme, gerçek satırda kimliği takma değerle değiştirmektir. Örnek satır yalnız tablo şeklini gösterir; bin satırın özetini vermez.

Ham kutu veya ham sözleşmeyi dış sohbete taşımak öğretilen yol değildir. Kopyala-yapıştır, onaylı panel dururken varsayılan yol değildir.

«Kapı» ve «taşıma su» stüdyo kısaltmasıdır. Öğrenci metninde günlük karşılık kullanılır.

Araç eşleşmesi ve masaüstü kısıtı kod SSOT’tadır (`lib/academy/ai-desk.ts`). Pedagoji tek bir aracı dayatmaz. Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**. Öğrenci gerçek paneli veya ataşı görür.

---

## D. GÖRSEL DÜRÜSTLÜK

* **Spoiler Yasağı:** Temiz sonuç, karşılaştırmadan önce gösterilmez. Split etiketi **ÖNCE (DÜZENLEMESİZ)** / **SONRA (AI İLE)** durur. Vatandaş etiketinde «Kirli» yoktur. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı».
* Masaüstü gerçek dışı vaat etmez. Onaylı panel yoksa bu dürüstçe söylenir. «Senin aracın yasak» denmez.

### D.1 Vitrin

Vitrin dürüsttür. Mühürü olmayan eğitim «yayında» diye satılmaz. Bağlı olmayan medya için oynatıcı basılmaz. Üretim bandındaki kardeş eğitim «Çok Yakında / Hazırlanıyor» rozetiyle durur. Satış tutarı `PriceCatalogEntry` satırındadır. Satır yokken kart fiyat basmaz. Tohum tutarı satış fiyatı değildir (Anayasa A1).

Hangi eğitimin yayında olduğu, kaset süreleri, gain sayıları ve yeniden fırın kuyruğu bu maddenin envanteri değildir. Yaşayan kesit `docs/ops/DURUM.md` içindedir. `docs/DURUM.md` yalnız oraya yönlendirir.

**Ders adedi Pedagoji kotası değildir.** Üst süre tavanı yoktur. Taban süre ve taban bölüm Anayasa B4’tür; sayılar `lib/academy/production-standard.ts` içindedir. Konuşma hızı, nefes ve gain `lib/academy/instructors.ts`, `lib/academy/human-rhythm.ts` ve `lib/academy/lesson-bed-duck.ts` içindedir. Bu sayılar felsefe paragrafına ikinci kez yazılmaz.

İleri ofis adresi `01_office_ai_ileri` durur. Ayrım örneği SKU `OFF-101` / `OFF-201`. Kart kodu `OFF-102` EC-102 ile çakışır, kullanılmaz. `02_business_ai` kullanılmaz. Görsel reji kodu: `lib/academy/lesson-beat-visual.ts`.

---

## E. ALTIN ŞABLON STANDARTLARI

### E.2 Rozet dili

**Aforizma / Ajans Sloganı** rozete de girmez. Rozet işin net adıdır. Jenerik övgü basılmaz. Jenerik tabela da basılmaz: sahnedeki rozet `CEBİNE KOY` veya `SIRA SENDE` olamaz. Rozet somut işi söyler («Tek Tek Kopyalama», «Tek Dosyayla Analiz», «KAYNAĞI KARŞILAŞTIR», «UYUŞMAYANI YAZMA»). Stüdyo bölüm anahtarı ile vatandaşın gördüğü rozet metni ayrıdır.

### E.3 İşitsel Reji ve Outro Crescendo

* **Intro:** 2.0 sn’ye kadar konuşma olmaz. Zorunlu olan iş kartıdır. Jenerik logo plakası opsiyoneldir ve sahnenin gövdesi olamaz (§A.4). Konuşma 2.0. sn’de başlar.
* **Outro:** Konuşma bitince ekranda 1-2-3 iş özeti durur. Logo plakası bu özete eklenmek zorunda değildir. Gain, zirve ve fade `lib/academy/lesson-bed-duck.ts` içindedir. Bu madde o sayıları ikinci kez dondurmaz.

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
