# PEDAGOJI.md — Eğitim felsefesi

Bu belge platformun **kalıcı eğitim felsefesini**, Google AI Studio medya fabrikası rol dağılımını ve görsel-işitsel reji standartlarını tanımlar. Model ve rol kimliğinin çalışma zamanı tek evi koddur (`lib/kernel/ai/model-roles.ts`); bu belge o kodla hizalıdır ve kimliği tekrarlamaz. Super Admin’in kilitli model haritası `.system_docs/AKADEMI_URETIM_ANAYASASI.md` dosyasındadır; uyumsuzlukta kod haritaya eşitlenir. Bake kapısı `lib/academy/production-standard.ts` içindedir. CLI `scripts/generate-academy-lesson-audio.ts`, `scripts/generate-academy-lesson-veo.ts` ve `scripts/generate-academy-lesson-bed.ts` içindedir. Canlı kaset `lib/academy/pilot-sku.ts` içindedir. Ders adedi `lib/academy/curricula/lesson-index.ts` içindedir.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Hedef yayın Anayasa B4 karar tablosudur. Beş medya katmanının bu belgedeki tek tanımı §B «Zorunlu üretim sırası» altındadır. Üç kontrol kapısının tek tanımı aynı bölümdeki «3 aşamalı kontrol kapısı» altındadır. Süre ve sayısal sınırın tek evi koddur.

Mimari ad Anayasa B1’dir: **Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci**. «Amiral Gemi + Sürü Dron» eski anlatım dilidir; karşılığı bu yapıdır (Amiral Gemi Pragmatik Monolit, Sürü Dron monolit içindeki kayıtlı yetenek ve oda, Shared Kernel `@yetkin/kernel`). Bu belge öğretme kuralını ve yayın formatını tutar. İkinci bir ürün mimarisi, sürü veya ayrı servis hikâyesi açmaz.

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
* **Stüdyo dili öğrenci yüzeyine girmez:** bake, kaset, compact, punchcard ve taşıma su yalnız üretim kılavuzundadır. «Kapı» slogan ve stüdyo kısaltmasıdır; yeni vatandaş cümlesine girmez. Vatandaş sırasının adı «üç adım»dır (§C). Kaynak metin ve sınav bu adı kullanır. Yayınlanmış WAV dökümü eski adı bir sonraki `--seal` kadar taşır. Vatandaş metninde günlük karşılık kullanılır: sesli ders, tam ders metni, sahnedeki kısa rozet.

### 2.1 Evrensel Metin Standardı

Fırın, bitmiş mutfak metnini seslendirir. Taslak cümle mühürlenmez.

* **Mutfak hazırlığı:** Senaryo, cue ve görsel senkron %100 oturmadan fırınlama açılmaz. Çiğ metin fırına atılamaz. Ücretli `--seal` bu kapıdan önce çağrılmaz (§E.5).
* **Evrensel vatandaş dili:** Dil duru ve sadedir. Jargon, slogan ve pankart yoktur. Cümle tek iş taşır. Aynı metin İngilizce ve başka dillere uyarlanabilir; küresel karşılığı olmayan bir deyime yaslanmaz.
* **Diksiyon temposu:** Konuşma parçası `ACADEMY_BAKE_ATEMPO` ve EBU R128 `loudnorm` görür. Ölçülen doğal hedef `ACADEMY_INSTRUCTOR_SPEECH_RATE` dir. Birleşik zaman çizelgesi atempo almaz; es payı pedagoji süresinde kalır. Tempo, kodun yazdığı katsayının üzerine yükseltilmez. Sabitler `lib/academy/tts-loudnorm.ts` ve `lib/academy/instructors.ts` içindedir. Metin, sakin stüdyo okumasına göre yazılır. Katsayı bu belgede tekrarlanmaz.

### 2.2 Deniz Usta ve dersin beş aşaması

Konuşma metninin kişiliği tezgâhın yanındaki ustadır. Anlatıcı akademisyen veya ajans yazarı değildir. Sahayı, dükkânı, depoyu ve akşam bilgisayar karşısındaki öğrenciyi bilir. Bu kişilik bir ses kaydı değildir. Persona dil ve üsluptur. Anlatıcı adı kursun sesidir.

* **Eylem öğrencidedir.** Yapay zekâ işi yapan değil, asistandır. «Sen okursun. Sen karar verirsin. Vitrine de sen koyarsın.»
* **Kapanış duası:** «Tezgâhın bereketli olsun. Satışın hayırlı gelsin.»
* **Persona (dil ve üslup):** Tezgâh / Anlatıcı yapısı geneldir. Beş aşama, SEN dili ve kapanış duası her kursun metin iskeletidir. Bu iskelet bir ses adı değildir. Deniz, bu iskeletin sicil adıdır (Zephyr). EC-102 anlatıcısı Deniz değildir.
* **Anlatıcı adı (ses):** Kursun `courseMasterVoice` değeridir. 1 Eğitim Kodu = 1 Ses. Ev `lib/academy/instructors.ts`. OFF-101 anlatıcısı Gözde (Callirrhoe), OFF-201 anlatıcısı Aylin (Kore), EC-102 anlatıcısı Kaan (Puck) dir. EC-102 selamı «Merhaba, ben Kaan», kart hitabı «Kaan Bey» dır. Cinsiyet erkektir. Bu kursta usta unvanı yoktur. Fırın modeli `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` dir. Bu madde o modeli ve mührü değiştirmez.
* **Fonetik yazım:** Kaynak cümle sayıyı ve ölçüyü kelimeyle yazar (`iki adet`, `elliye yetmiş santimetre`). Ses bu kelimeyi okur. Ekran ve altyazı aynı ölçüyü rakamla basar (`2 adet`, `50x70 cm`). Kısaltmanın ses okunuşu `lib/academy/spoken-scripts/phonetics.ts` içindedir (`SEO` → `Seo`, `N11` → `En on bir`).

Her yeni ders metni şu beş aşamayla yazılır. İstem `ACADEMY_LESSON_TEXT_SYSTEM_PROMPT` (`lib/academy/lesson-text-standard.ts`) içindedir. Bu paragraf o istemin ikinci kopyası değildir.

1. **Giriş (Tezgâh Başı).** Karşılama ve konu sınırı.
2. **Saha gerçeği.** Alıcının veya kullanıcının gerçekte düştüğü hata.
3. **Yanlış ve doğru.** Somut nesne. Yanlışta övgü vardır, bilgi yoktur. Doğruda tür, renk, ölçü ve adet durur.
4. **Prompt şablonu.** Beş girdi: rol, ürün adı, ölçü, malzeme, özellik listesi. Masa değişince nesne değişir; beş yuva durur.
5. **Özet, köprü ve tezgâh duası.** Ders özeti, sıradaki ders ve kapanış duası.

Ekran reji sözleşmesi dört beat olarak durur (Warm-up → Command → Comparison → Task, `lib/academy/lesson-beat-visual.ts`). Beş aşama konuşma sırasıdır. Mühürlü kaset, yeniden mühürlenene kadar kendi sırasını taşır.

### 3. Bilişsel Yük

Karaoke sahnesinde uzun paragraf gösterilmez. Sahnede yalnız o saniyeye ait kısa **Punchcard Rozetleri** durur. Rozet işin adını taşır («Tek Tek Kopyalama», «Tek Dosyayla Analiz»). Altyazı titremez; alt uzantılı harf kesilmez; tuval oranı korunur. Piksel, gain ve süre ölçüsü bake el kitabındadır.

**Altyazı Titreme Yasağı** ilkesidir: aktif kelime cümleyi sağa sola itmez. Ayrıntı oynatıcı kodu ve bake el kitabındadır.

Çalışma sekmesindeki tam metin, eğitim videosunun konuşma katmanıdır; ayrı bir makale yayını değildir (Anayasa B4). Nasıl-yapılır adım bandı overlay paragrafı değildir.

**Junior oda ≠ başlangıç seviyesi.** Başlangıç seviyesi Akademi içi **Temel Paketler** ile karşılanır. 10-18 yaş okul dersi Yetkin Junior müstakil odasıdır. Kapı ve erişim Anayasa B6 ve `lib/kernel/security/junior-gate.ts` (`canEnterJunior`) içindedir. Bu madde o kapıyı ikinci kez yazmaz. Öğretme, yaş üslubu ve veli esasları **Ek-J** bölümündedir.

**Quiet Luxury:** sahne sakin durur. Dikkat süsle değil, o anki işle kalır.

### 4. Reji dağılımı

Sahne süresi **%80 canlı uygulama ekranı**, **%20 sinematik veya kılavuz kartı**dır. Sabit, işlevsiz logo veya boş plaka sahnenin gövdesi olamaz. Isınma klibi biter; iş beat’i canlı ekranda yürür. Ayrıntı `lib/academy/lesson-beat-visual.ts` içindedir.

### 5. Ücretsiz önizleme (Freemium)

Her eğitimin ilk dersi, varsa hazırlık şeridiyle birlikte, herkese açık ve ücretsiz önizlemedir. Öğrenci karar vermeden önce eğitimin dilini, sesini ve temposunu bedelsiz görür. Bu, pedagojinin parçasıdır: ilk ders tam ders kalitesinde yazılır ve seslendirilir, kırpılmış tanıtım olmaz. Sonraki dersler lisans ister. Önizleme sertifika, sınav mührü veya fiyat kaydı yerine geçmez; resmî ilke Anayasa B4 «Freemium ilkesi» maddesidir. Açık dersin kararı kodda sınav yolunun ilk anahtarıdır (`lib/kernel/catalog-ids/exam-path.ts`). Yeni kurs eklenirken sınav yolunun ilk dersi bu kuralı taşıyacak şekilde seçilir.

---

## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI

Üretken yapay zekâ müfredat senaryosunu, fırınlamayı ve montajı meşru olarak yürütür. Vatandaş yüzeyi mühürlü eğitim videosunu oynatır. İzlemede model çağrılmaz. Taslak ses ve taslak görüntü yüzeye basılmaz.

### Zorunlu üretim sırası — 5 medya katmanı

Bu alt başlık, beş medya katmanının bu belgedeki tek tanımıdır. Anayasa B4 karar tablosu aynı kurala işaret eder. Diğer bölümler katman listesini yeniden yazmaz; buraya döner.

Hiçbir eğitim videosu Metin, Ses, Video, Görsel ve Müzik katmanlarından biri eksikken fırınlanamaz ve mühürlenemez. Sıra sabittir:

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
3. **Son kontrol** — kod seviyesinde fail-closed zorunluluktur. `assertAcademyProductionSeal` (`lib/academy/production-standard.ts`) §B üretim sırasındaki beş katmanı diskte arar. Katman eksikse `--seal` basılmaz ve satış kapısı açılmaz. Video yerel `-warmup.mp4` ve müzik yatağı (`MUSIC_GEN`) bu kapının parçasıdır. Bu kapı atlanamaz.

**Model sicili.** Fırın ve gümrük medya kimliği `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL` nesnesindedir. Bu belgede model kimliği, tempo ve desibel dondurulmaz. Rol kimliği değişince felsefe metni yeniden yazılmaz. Üretim sırası §B’de durur; pedagoji durur. Canlı sohbet `FAST_STREAM` okur. Senaryo `TEXT_GEN` okur. Ses mührü `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. `academyBakeVoiceModelId()` aynı kimliği döner. Kota bitince alt model açılmaz. Konuşma temposu `ACADEMY_BAKE_ATEMPO`, seviye EBU R128 `loudnorm`. Bake sırası `lib/academy/production-standard.ts` ve fırın betiklerindedir.

Yapay zeka fırınlarının görev dağılımı şöyledir:

| Rol | Fırın | Görev |
|-----|-------|--------|
| Metin & Senaryo | **`ACADEMY_SEALED_MEDIA_MODEL.TEXT_GEN`** | 4-beat reji yapısına (Warm-up → Command → Comparison → Task) uygun ders senaryolarını hazırlar. Canlı sohbet ayrıdır: `FAST_STREAM`. |
| Seslendirme | `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` | **1 Eğitim Kodu = 1 Ses.** Kurs `courseMasterVoice` tek stringdir. Ders bazlı ses haritası yoktur. Persona (Tezgâh dili, §2.2) ile anlatıcı adı ayrıdır. Amiral SKU `01_office_ai` metnini Gözde (**Callirrhoe**) ile mühürler. OFF-201 (`01_office_ai_ileri`) metnini Aylin (**Kore**) ile mühürler. EC-102 (`02_ecommerce_ai`) metnini Kaan (**Puck**) ile mühürler; bu kursta usta unvanı yoktur. OFF-201 eğitmeni Gözde olamaz. Tempo `ACADEMY_BAKE_ATEMPO`, seviye EBU R128. İstek tavanı ve süre tabanı bu hücrede tekrarlanmaz; tek ev `lib/academy/production-standard.ts` içindedir. Kilit testi `tests/academy/production-standard.test.ts`. Model kimliği `lib/kernel/ai/model-roles.ts`. |
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

Konuşma 2.0 saniyede başlar. Bu aralıkta ekranda iş kartı durur. Jenerik logo plakası opsiyoneldir; sahnenin gövdesi olamaz (§A.4). Amiral SKU `01_office_ai` anlatıcısı Gözde (Callirrhoe)’dir. Konuşma bitince 1-2-3 iş özeti ekranda kalır. Logo plakası bu özete eklenmek zorunda değildir. Gain, nefes ve kapanış süreleri `lib/academy/lesson-bed-duck.ts` içindedir; bu paragraf o sayıları ikinci kez dondurmaz. Intro, outro ve dinamik görsel reji **§E Altın Şablon Standartları** içindedir.

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

Süre bandı ve sınav barajı kod SSOT’tadır (`lib/academy/production-standard.ts`, `ACADEMY_EXAM_PASS_SCORE`). TTS bütçe tavanı D.1’dedir. Vitrin kartındaki dakika yuvarlaması ayrıdır (`lib/academy/lesson-meta.ts`). Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır. **1 Eğitim Kodu = 1 Ses:** `courseMasterVoice` tek stringdir; dersler ayrı sese bölünmez ve ders bazlı ses haritası yoktur. Gözde (Callirrhoe) amiral SKU `01_office_ai` mühürüdür. OFF-201 mührü Aylin (Kore) dir. EC-102 mührü Kaan (Puck) dir; usta unvanı bu kursta yoktur. OFF-201 kilidi `lib/academy/instructors.ts` içindeki `ACADEMY_OFF201_COURSE_MASTER_VOICE` sabitidir. OFF-201 eğitmeni Gözde olamaz. Süre tabanı, ders tabanı ve TTS istek tavanı `lib/academy/production-standard.ts` içindedir. Ders istek bandının sabit adları `lib/academy/tts-breath-chunks.ts` içindedir. Sayıların kilitlendiği test `tests/academy/production-standard.test.ts` dir. Model kimliği `lib/kernel/ai/model-roles.ts` içindedir; bu paragraf o sayıları ikinci kez yazmaz.

---

## C. VERİYİ VERMEDEN ÖNCE — ÜÇ ADIM

Sıra sabittir ve vatandaş dilinde **üç adım**dır. Stüdyo kısaltması «kapı» bu sıranın adı değildir (§A.2). Ofiste ilk soru şirketin hangi aracı onayladığıdır.

1. **Şirket politikası.** Şirketin onayladığı araç hangisi? Onaylı olmayan araca iş postası, sözleşme ve müşteri listesi gitmez. Onaylı araç yoksa kutuyu veya dosyayı kişisel hesaba taşımazsın.
2. **Veri sınıfı.** Kişisel veri, şirket sırrı ve herkese açık katalog ayrıdır. Ham kimlik, IBAN, maaş ve sır hiçbir araca açık hâliyle girmez. Ürüne ait, kişiye bağlı olmayan satır (ürün adı, tutarı olmayan genel stok) gidebilir.
3. **Aktarım yolu.** Onaylı araçta sırayla bakılır: **Yerleşik araçlar** (panel), yoksa **Ataş / dosya yükleme**, ikisi de yoksa **Son çare** maskeli kısa özettir. Maskeleme, gerçek satırda kimliği takma değerle değiştirmektir. Örnek satır yalnız tablo şeklini gösterir; bin satırın özetini vermez.

Ham kutu veya ham sözleşmeyi dış sohbete taşımak öğretilen yol değildir. Kopyala-yapıştır, onaylı panel dururken varsayılan yol değildir.

Öğrenci metninde bu sıra «üç adım» diye anılır. Yeni öğrenci cümlesine «Kapı» girmez. Yayınlanmış WAV dökümü eski adı `--seal` yenilenene kadar taşır. «Taşıma su» stüdyo kısaltmasıdır (§A.2).

Araç eşleşmesi ve masaüstü kısıtı kod SSOT’tadır (`lib/academy/ai-desk.ts`). Pedagoji tek bir aracı dayatmaz. Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**. Öğrenci gerçek paneli veya ataşı görür.

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

## Ek-J: Junior Pedagojisi ve Veli Modeli

Bu ek, yetişkin ofis dersinin kurallarını değiştirmez. Deniz usta, tezgâh duası ve ofis rejisi (§A.2.2, §A.4) yetişkin eğitimde durur. Junior okul dersidir. Başlangıç seviyesi değildir. Yetişkin başlangıcı Temel Paketlerdir (§A.3).

### Dinle ve Anlat

Çocuk dersi önce dinler. Sonra aynı konuyu kendi sözüyle anlatır. Anlatış seslidir. Mikrofon kapalıysa aynı anlatış yazıyla yapılır. Yazılı yol, sesli yolun yedeğidir. İkisi de aynı işi görür: çocuk konuyu kendi cümlesiyle söyler.

Yanıt, o dersin kazanımına bağlıdır. Serbest sohbet yoktur. Konu dışındaki söz geri çevrilir. Sistem emin değilse «emin değilim» der. Uydurma puan basılmaz.

Dinle ve Anlat öğretir. Sertifika, mühür ve kariyer vizesi vermez. Resmî sınav sunucuda puanlanır. Sesli anlatış bu kapının yerine geçmez.

Değerlendirme üslubu çocuğun yaş grubuna göre değişir. Sistem istemi, profildeki doğum yılından grubu okur. Üç üslup vardır. Biri seçilir. Üçü birden aynı anlatışa yazılmaz.

### Yaş grupları ve üslup

**10-12 yaş (5, 6 ve 7. sınıf).** Üslup merak uyandıran, sıcak, oyunlaştırması yüksek ve cesaretlendiricidir. Cümle kısa durur. Önce doğru söylenen parça görülür. Eksik nokta azar gibi gelmez. Küçük bir sonraki adım verilir.

**13-14 yaş (8. sınıf / LGS).** Üslup hedef odaklı, sınav stresini yöneten, stratejik ve ritmiktir. Adım sırayla söylenir. Acele ettirilmez. Sınav kaygısı, bilgi cümlesinin yerine geçmez. Eksik nokta bir strateji olarak söylenir.

**15-18 yaş (9, 10, 11 ve 12. sınıf).** Üslup analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudandır. Süslü övgü kurulmaz. Doğru, eksik ve sonraki adım ayrı cümlelerdir. Çocuk yerine konuşulmaz.

Pilot sınıf 6’dır. Bu sınıf 10-12 üslubuna girer. Aynı dersi dinleyen 8. sınıf öğrencisi 13-14 üslubunu, lise öğrencisi 15-18 üslubunu duyar. Dersin kazanımı değişmez. Değişen, değerlendirme cümlesinin sesidir.

### Veli modeli ve çocuk güvenliği

Hesap velinindir. Çocuk, veli hesabının altında bir profildir. Bu fazda çocuğa ayrı e-posta ve ayrı giriş açılmaz.

Ders, veli rızası olmadan açılmaz. Rıza yoksa kanal kapalıdır.

Platform çocuk adına bakiye, harçlık veya kredi tutmaz. Oyun puanı para değildir. Parayla alınamaz. Paraya çevrilemez.

Çocuğun sesi saklanmaz. Değerlendirme bitince ses silinir. Kalan, yazıya dökülmüş metin ve öğretici nottur.

Çocuk başka kullanıcıya mesaj atamaz. Reklam yoktur. Parayla açılan ödül kutusu yoktur. Seri kaçırmak ceza doğurmaz.

Çocuğun adı ve okulu, herkese açık doğrulama sayfasında görünmez.

Çekirdek dersin ilk konusu ücretsizdir ve tam ders kalitesindedir. Kırpılmış tanıtım değildir. Seçmeli hazırlık rafı bu cümlenin dışındadır. Kapı ve erişim Anayasa B6 ve `canEnterJunior` içindedir. Bu ek o kapıyı yazmaz.

Okul kitabı metni kopyalanmaz. Kazanım anlatılır. Cümle özgün yazılır.

### Öğretmen hitabı

Öğretmen gövde cümlesinde samimi ve rehberlik eden **sen** dilini kullanır. Cümle çocuğa tek kişi olarak söylenir. «Siz» hitabı ders gövdesine girmez. Belge, sözleşme ve veli yazısı bu kuralın dışındadır; orada dil «siz» kalır (§A.2). Çerçeve `lib/junior/content-rules.ts` içindeki `JUNIOR_TEACHER_ADDRESS` ve `JUNIOR_TELL_CLOSE` dur. Yeni konu sen ile yazılır.

Soğuk «Selam!» girişi yasaktır. Ders sıcak ve tek kişiye söylenen bir açılışla başlar: «Merhaba güzel arkadaşım!», «Merhaba sevgili arkadaşım!», «Selam harika arkadaşım!». Profilde rumuz varsa açılış bir kez «Merhaba {rumuz}, bugün seninle…» der. Rumuz yoksa bu liste kalır. Rumuz ders dosyasına yazılmaz. Anlatım boyunca öğretmen çocuğu odağında tutar. «Bak burası senin için çok önemli» ve «Şurası aklında kalsın tamam mı» kalıpları, hemen ardından açıklama geliyorsa cümlenin başına iki nokta ile bağlanır. Yalnız başlarına bırakılmaz. Çoğul «sevgili çocuklar» kalıbı gövdeye girmez. Mühür `JUNIOR_WARM_OPENINGS`, `JUNIOR_TEACHER_CUES`, `bindJuniorTeacherCue` ve `sealJuniorWarmWelcome` dir.

### Doyurucu konu

Ders kısa özet değildir. Her konu dört bölüm taşır: Kavram, Örnek, Kritik Uyarı ve Günlük Kullanım. Aynı paragraf üç alana kopyalanmaz. Ev `lib/junior/scenario.ts` ve `lib/junior/content-rules.ts` (`JUNIOR_LESSON_SECTIONS`). Ücretsiz ilk konu da bu dört bölümü tam taşır. Üçüncü bölümün çocuk yüzü aşağıdaki ipucu kutusudur.

Anlatım üç aşamada yürür: Giriş (Oryantasyon), Gelişme (Tam Anlatım), Sonuç (Özetleme). Günlük sahne Giriş’te merak uyandırır; Gelişme tanımı papağan gibi tekrar etmez; Sonuç «Bugün Neler Öğrendik?» kartıyla biter ve üç nokta taşır. Ev `JUNIOR_SCENARIO_STAGES` (`lib/junior/content-rules.ts`). Konuşma süresi 5 ile 12 dakika arasındadır. Hedef 7 ile 8 dakikadır. Süre, oynatıcı saatinin karakter hesabıdır. Bant, konunun kendi cümlelerinden ve ileri adımından dolar. Aynı örnek kalıp çerçevede ikinci kez okunmaz. Son adımda öğrenci iki yoldan birini seçer: mikrofona kendi cümlesiyle anlatmak ya da anlatımı 0:00 anından yeniden dinlemek. Ev `lib/junior/player-clock.ts` içindeki `JUNIOR_NARRATION_MIN_MS`, `JUNIOR_NARRATION_AIM_MS`, `JUNIOR_NARRATION_MAX_MS` ve oynatıcı karar kartı.

### Gelişimsel İpucu Kutusu

**Gelişimsel İpucu Kutusu İlkesi:** Sınav ve test uyarıları asla baskıcı, korkutucu veya stres yaratıcı dille («sınavda vururlar», «şok olursun» vb.) yazılamaz. Tüm kritik uyarılar «Tuzaklara Düşme! 🕵️‍♂️» veya «Altın İpucu! 💡» başlıklarıyla sunulur. Çocuk uyarılırken cesaretlendirilir ve merakı tetiklenir.

«Sakın unutma» ve «barajın altında kaldın» ders gövdesine ve konu testi cümlesine girmez. Eksik nokta bir sonraki küçük adım olarak söylenir. Başlık ya tuzak kutusudur ya altın ipucudur. İkisi birden aynı uyarıya yazılmaz. Çerçeve `JUNIOR_HINT_BOX` ve `JUNIOR_HINT_BOX_PRINCIPLE` (`lib/junior/content-rules.ts`). Anlatım köprüsü `juniorHintCue` dir.

### Ses ve fon müziği

Anlatışın arka planında pedagojik fon müziği katmanı vardır. Katman vokalsizdir ve stereo kanaldadır. Kimlik `ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN` dir. Ev `lib/kernel/ai/model-roles.ts`. Bu ek o dizeyi tekrarlamaz. Örnekleme, kanal ve fırın yolu `lib/junior/voice.ts` içindeki `JUNIOR_BED_LAYER` dir. Sinüs üreticisi bu yatağı yazmaz.

Öğretmen sesi ders branşına göre ayrı karakterdir. Çağrı `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. Karakter haritası `JUNIOR_BRANCH_TEACHERS` içindedir. Yetişkin «1 Eğitim Kodu = 1 Ses» kuralı bu haritanın yerine yazılmaz. Dinleme anında dış TTS ve müzik çağrısı yoktur. Katman kimliği mühürler. Fırın, bu ek ve harcama onayı olmadan açılmaz.

İpucu kutusu açılınca yerel bir chime çalar. Çocuk kritik noktayı kavrayınca yerel bir alkış çalar. İkisi de dış API çağırmaz. Harita `JUNIOR_HINT_EFFECTS` (`lib/junior/voice.ts`). Oynatıcı bu haritayı okur. Efekt, öğretmen sesinin ve fon müziğinin yerine geçmez.

Yetişkin üretim kapısı bu ekte gevşetilmez. Beş katman, süre tabanı ve «1 Eğitim Kodu = 1 Ses» yetişkin dersinde durur. Junior dersinin kendi süresi ve kendi sesi ayrı karardır. O karar yetişkin standardın yerine yazılmaz. Sesin evi `lib/junior/voice.ts` dir.
