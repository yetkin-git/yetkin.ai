# Tespit Raporu — 3. dalga: Sosyal Bilgiler kabları ve Türkçe beceri satırı

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Gündem | Sosyal Bilgiler'in saatli altı kabı ve Türkçe tema satırının beceri çıktısına bağlanması |
| Ölçüm | `packages/junior-content/src/plan.ts`, takvim ve konu JSON'u, `JUNIOR_SEALED_ROSTER`, `lib/junior/content`, `lib/junior/quiz`, ses manifesti |
| Kapsam dışı | Maarif PDF'sinin yeniden indirilmesi, ses fırını, kasa, canlı Vercel |

2. dalganın tedavi kaydı `docs/TEDAVI_RAPORU.md` 8. bölümündedir. Fen kabı kapanmıştır. İngilizce'nin yedi teması uydudadır. Yazarlık **105**, kab sayısı **19**, yayın rafı **68** dir. Bu dosya 3. dalganın tespitidir.

## Hüküm

Sosyal Bilgiler'de boş olan şey altı dosya değildir. `jr_06_sosyal-21` … `jr_06_sosyal-26` altı kab, altı kazanımı ve **34 saati** taşır: `SB.6.1.3`, `SB.6.2.3`, `SB.6.3.2`, `SB.6.4.3`, `SB.6.5.3`, `SB.6.6.2`. Altısının `processOpen` değeri açıktır. `hoursBasis` altısında `unit-split` dir. Fen'deki `FB.6.2.2` gibi `unverified` satır yoktur.

Kapanış, Fen'in kapandığı kalıptır. Her anahtar kendi numarasıyla kadroya girer, `shell` bayrağı kalkar, senaryo ve quiz kabın üstüne yazılır. `jr_06_sosyal-2`, `-3`, `-6` ve `-13` saat 0 ile park edilmiş yazılı derslerdir. Dördü de kadrodadır, sesi fırınlanmıştır ve ders yüzündedir. Bu dalga onları diriltmez.

Türkçe'de saat taşınacak kab yoktur. `jr_06_turkce-21` … `26` tema sandığıdır, saati 0'dır. 204 saat `jr_06_turkce-1` … `20` uydularındadır ve bu yirmi dersin sesi fırınlanmıştır. Paket, `T.6.1`–`T.6.6` dışında dinleme, okuma, konuşma veya yazma kodu tutmaz. Yirmi uydunun işi dört beceriye eşit bölünmüş bir ders dizisi değildir: söz varlığı, paragraf, yorum, cümle ve ek, yazım, noktalama. Dinleme ve konuşma için taşıyıcı ders yoktur.

Beceri bağlama, İngilizce'deki `G1` kalıbıdır. Tema satırı 34 saatini korur. Beceri kodunun saati 0 olur ve işi o olan uydunun çıktı listesine biner. Sandığa ikinci bir anlatı yazmak saati ikiye böler. `export:junior-content` bu bağa uyar; 21–26 numaraları kadroya girmez.

---

## 1. Sosyal Bilgiler

### 1.1 Sayım

Tanımın evi `packages/junior-content/src/plan.ts` içindeki `SOSYAL_OUTCOMES`, `SOSYAL_SHELLS` ve `SOSYAL_ORDER` dır. Export bunları üç JSON yüzeyine basar:

| Yüzey | Dosya |
|---|---|
| Kazanım satırı | `packages/junior-content/meb/2026-2027/sosyal.json` |
| Hafta ve saat | `packages/junior-content/calendar/jr_06_sosyal.json` |
| Kab gövdesi | `packages/junior-content/topics/jr_06_sosyal-21.json` … `jr_06_sosyal-26.json` |

Kurs notu alan saatini «onaylı rapordaki ikincil derleme (16+18+22+18+18+11)» diye yazar ve çerçeve PDF'sinden yeniden ölçülmediğini söyler. Alan toplamı 103 saattir. Program tavanı 108'dir. 5 saat okul temelli planlamadır. Kablar bu 103'ün 34'ünü tutar.

On sekiz kazanımın on ikisinde `processOpen` kapalıdır ve saatli yazılı ders vardır. Kalan altı kazanım kabdadır.

| Kod | Saat | `processOpen` | Taşıyıcı | Yazarlık |
|---|---:|---|---|---|
| SB.6.1.1 Grup ve rol | 6 | kapalı | `jr_06_sosyal-1` (SB.6.1.2 ile, 11 saat) | `lib/junior/content/sosyal/1.ts` |
| SB.6.1.2 Kültürel bağ | 5 | kapalı | `jr_06_sosyal-1` | aynı dosya |
| SB.6.2.1 Ülke, kıta, okyanus | 6 | kapalı | `jr_06_sosyal-9` | `sosyal/9.ts` |
| SB.6.2.2 Doğal ve beşerî çevre | 6 | kapalı | `jr_06_sosyal-10` (3) + `-11` (3) | `10.ts`, `11.ts` |
| SB.6.3.1 İlk Türk devletleri | 6 | kapalı | `jr_06_sosyal-5` | `5.ts` |
| SB.6.3.3 İslamiyet'in kabulü | 5 | kapalı | `jr_06_sosyal-7` (SB.6.3.4 ile, 10 saat) | `7.ts` |
| SB.6.3.4 Anadolu'nun Türkleşmesi | 5 | kapalı | `jr_06_sosyal-7` | aynı dosya |
| SB.6.4.1 Karar alma | 6 | kapalı | `jr_06_sosyal-16` (3) + `-18` (3) | `16.ts`, `18.ts` |
| SB.6.4.2 Hak ve sorumluluk | 6 | kapalı | `jr_06_sosyal-4` (3) + `-17` (3) | `4.ts`, `17.ts` |
| SB.6.5.1 Kaynak ve ekonomik faaliyet | 6 | kapalı | `jr_06_sosyal-12` | `12.ts` |
| SB.6.5.2 Meslek | 6 | kapalı | `jr_06_sosyal-15` | `15.ts` |
| SB.6.6.1 Ulaşım ve iletişim | 6 | kapalı | `jr_06_sosyal-8` (3) + `-20` (3) | `8.ts`, `20.ts` |

`JUNIOR_SEALED_ROSTER` sosyal numaraları bugün `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20]` dur. 14, 19 ve 21–26 bu listede yoktur. `lib/junior/content/sosyal/` ve `lib/junior/quiz/sosyal/` altında 21–26 için TypeScript yoktur. 14 ve 19 için de yoktur. `lib/junior/scene-media.ts` içinde `jr_06_sosyal-19` için «Komşularımız» levhası durur. Bu dalga 14 ve 19'u açmaz.

### 1.2 Altı kab

Saat, takvimdeki ders saatidir. Hafta aralığı `placeTopics` çıktısıdır. Uçlar öğretim haftasıdır. Ortak uç, haftalık 3 saatlik şeridin iki ders arasında bölünmesidir; saat iki kez sayılmaz.

| Kab | Kazanım | Başlık | Saat | Hafta | `processOpen` |
|---|---|---|---:|---|---|
| `jr_06_sosyal-21` | SB.6.1.3 | Toplumsal sorunu müzakere | 5 | 4–6 | açık |
| `jr_06_sosyal-22` | SB.6.2.3 | Türk dünyasıyla kültürel iş birliği | 6 | 11–13 | açık |
| `jr_06_sosyal-23` | SB.6.3.2 | VII–XIII. yüzyıl İslam medeniyetinin ortak mirası | 6 | 15–17 | açık |
| `jr_06_sosyal-24` | SB.6.4.3 | Dijitalleşmenin vatandaşlık haklarına etkisi | 6 | 28–30 | açık |
| `jr_06_sosyal-25` | SB.6.5.3 | Yatırım ve pazarlama proje önerisi | 6 | 34–36 | açık |
| `jr_06_sosyal-26` | SB.6.6.2 | Telif ve patent | 5 | 38–40 | açık |

Toplam 34 saat. Alan payı şöyle kapanır: 16, 18, 22, 18, 18, 11.

`jr_06_sosyal-21` hafta 4'te `jr_06_sosyal-1` ile, hafta 6'da `-9` ile aynı rozeti paylaşır. `-22` hafta 11'de `-11` ile, hafta 13'te `-5` ile paylaşır. `-23` hafta 15'te `-5` ile, hafta 17'de `-7` ile paylaşır. `-24` hafta 28'de `-17` ile, hafta 30'da `-12` ile paylaşır. `-25` hafta 34'te `-15` ile, hafta 36'da `-8` ile paylaşır. `-26` hafta 38'de `-20` ile paylaşır.

`jr_06_sosyal-26` aralığının içinde 39. hafta durur. Bu hafta 8 Haziran 2027 Türkçe ortak yazılısıdır, `kind` değeri `exam` dir. Uçlar 38 ve 40 öğretim haftasıdır. `activeLessonKeys` öğretim dışı haftada boş dizi döndürdüğü için `verify:junior-content` bu aralığı kırmaz. Aynı desen Fen'de `jr_06_fen-32` için yazılı ve yarıyıl tatilidir.

Kab JSON'u `shell: true` taşır. Teaser, anlatımın yazılmadığını söyler. Örnek: `packages/junior-content/topics/jr_06_sosyal-21.json`.

### 1.3 `processOpen` kapısı

Kapı bir oynatıcı adımı değildir. `packages/junior-content/schema/meb-outcome.ts` bunu «süreç bileşeni veya gövde açık; saat dolsa da kapsama listesinde kalır» diye tanımlar.

Skor, `packages/junior-content/src/content-quality.ts` içindeki `PROCESS_VERB` ile bakar:

`deney | gözlem | model | ölç | tartış | müzakere | yorumla | araştır | hipotez | değişken | grafik | sıklık tablosu | çetele`

Kazanımın saati sıfırdan büyük, `processOpen` açık ve bu kök anlatımda yoksa skor «Deney, model, ölçme veya tartışma adımı yok» der. `scripts/verify-junior-content.ts` saati sıfırdan büyük ve bayrağı açık olan her satırı «kapsama bilgisi» diye basar ve derlemeyi kırmaz.

Altı kabın anlatımı olmadığı için kapı altısında boştur. `SB.6.1.3` başlığında kök `müzakere` zaten durur. Diğer beş başlıkta bu köklerden biri yoktur; kök, örneğin ve günlük kullanımın içindeki işte durur. Kelime serpmek kapıyı geçirir, kazanımı anlatmış sayılmaz.

`lib/junior/catalog.ts` içindeki `outcomeProgress`, `processOpen` açıkken kazanımı «yazılmış» saymaz. Senaryo yazılsa da bu bayrak `false` yapılmadan sayaç ilerlemez. Bayrak bu dalgada kapanmaz. Metin süreci gerçekten yaptıktan sonra kapanır.

`lib/junior/scenario.ts` on iki satırı karşılama, günlük kullanım, kavram, çizim çağrısı, örnek, uyarı ve üç özetten seçer. `JUNIOR_VECTOR_STEP_COUNT` 12'dir. Müzakere, araştırma ve tartışma bu gövdenin `example` ve `life` alanına bir iş cümlesi olarak girer. Ayrı bir 13. adım açılmaz.

Sahne kimliği katalogda yoksa `content-source` yüklemede durur. Sosyal için duran kimlikler `place`, `culture`, `globe`, `grid`, `history`, `caravan`, `assembly`, `ballot`, `fair`, `shelf`, `book` arasındadır. Müzakere `assembly`, Türk dünyası `globe` veya `culture`, ortak miras `history`, dijital vatandaşlık `ballot`, proje `fair`, telif `book` veya `shelf` ile kapanabilir. Yeni bir kimlik gerekirse ekleme yeri `JUNIOR_VECTOR_SCENES` dizisidir. Adım sayısı aynı kalır.

### 1.4 Saat 0 ile park edilmiş dört ders

Dördü `SOSYAL_ORDER` sonunda `parked(...)` dir. Saat 0, hafta 0. Kab listesinde değiller. Kadroda duruyorlar. `lib/junior/audio-manifest.generated.ts` içinde MP3 kayıtları var. `lib/junior/lesson-face.ts` başlıklarını basıyor. Yayın rafının 68 anahtarının içindedirler.

| Anahtar | Başlık | Çıktı kodu | Saatli asıl taşıyıcı | Bu dalga |
|---|---|---|---|---|
| `jr_06_sosyal-2` | Toplumsal uyum ve yardımlaşma | SB.6.1.1 | `jr_06_sosyal-1` (11 saat) | dosyaya dokunulmaz |
| `jr_06_sosyal-3` | Önyargıları kırıyoruz | SB.6.1.1 | `jr_06_sosyal-1` | dosyaya dokunulmaz |
| `jr_06_sosyal-6` | İslamiyet'in doğuşu ve yayılışı | SB.6.3.2 | kab `jr_06_sosyal-23` (6 saat) | dosyaya dokunulmaz |
| `jr_06_sosyal-13` | Doğal kaynaklarımız ve sürdürülebilirlik | SB.6.5.1 | `jr_06_sosyal-12` (6 saat) | dosyaya dokunulmaz |

`outcomeProgress` ve skor, saati 0 olan konuyu kapanış saymaz. `-2` ve `-3`, `SB.6.1.1` saatini `-1` den almaz. `-13`, `SB.6.5.1` saatini `-12` den almaz.

`-6` ile `-23` aynı kodu taşır. `-6` doğuş yılı, hicret ve yayılışı anlatır. `-23` kabının başlığı «VII–XIII. yüzyıl İslam medeniyetinin ortak mirası» dır. Saati `-6` üzerine almak, kabın 6 saatini başka bir anlatıya verir ve ortak miras kazanımını yazılmamış bırakır. `-6` yerinde kalır. Ortak miras `jr_06_sosyal-23` üzerine yazılır.

### 1.5 Yazılacak dosyalar ve kadro

Fen kapanışı üç işi birlikte yaptı: `FEN_SHELLS` boşaldı, şeritteki `shell: true` kalktı, numara kadroya girdi, TypeScript yazıldı, export çalıştı. Sosyal kapanışı aynı üç iştir. `SOSYAL_SHELLS` boşalır. Altı şerit saatini ve kodunu korur, `shell` olmaktan çıkar.

Mevcut on sekiz numara yerinde kalır. 2, 3, 6 ve 13 listeden çıkmaz.

| Eklenecek numara | Anahtar | Kazanım | TypeScript | Quiz | Topic JSON |
|---|---|---|---|---|---|
| 21 | `jr_06_sosyal-21` | SB.6.1.3 | `lib/junior/content/sosyal/21.ts` | `lib/junior/quiz/sosyal/21.ts` | kabın üstüne senaryo |
| 22 | `jr_06_sosyal-22` | SB.6.2.3 | `sosyal/22.ts` | `quiz/sosyal/22.ts` | aynı |
| 23 | `jr_06_sosyal-23` | SB.6.3.2 | `sosyal/23.ts` | `quiz/sosyal/23.ts` | aynı |
| 24 | `jr_06_sosyal-24` | SB.6.4.3 | `sosyal/24.ts` | `quiz/sosyal/24.ts` | aynı |
| 25 | `jr_06_sosyal-25` | SB.6.5.3 | `sosyal/25.ts` | `quiz/sosyal/25.ts` | aynı |
| 26 | `jr_06_sosyal-26` | SB.6.6.2 | `sosyal/26.ts` | `quiz/sosyal/26.ts` | aynı |

Quiz gövdesi `lib/junior/quiz/sosyal/1.ts` kalıbındadır: üç soru, düzeyler `concept`, `apply`, `skill`. `scripts/verify-junior-content.ts` bu şekli `canonicalQuiz` ile kilitler.

`lib/junior/content/sosyal/index.ts` dosya listesi tutmaz. `juniorSealedCourseLessons` kapısından okur. Yeni dersin içeri girmesi index satırı eklemekle olmaz. Giriş, kadro numarası ve export ile olur.

Export sırası `scripts/export-junior-content.ts` içindedir. Kab önce `shell: true` yazılır. Aynı anahtar kadrodaysa senaryo üstüne yazar. Diskteki kab sayısı `plannedShellCount()` ile karşılaştırılır. Kab listesinde kalıp JSON'u senaryoya dönen anahtar bu eşitliği bozar. Bu yüzden `SOSYAL_SHELLS` boşalması ile kadroya giriş aynı değişikliktedir.

Altı numara girince sosyal kab sayısı 0 olur. Yazarlık 105'ten 111'e çıkar. Kurs kab sayısı 19'dan 13'e iner.

---

## 2. Türkçe — tema satırı ve yirmi uydu

### 2.1 Pakette duran yapı

`TURKCE_THEMES` altı satırdır. Her satırın kodu temanın kendisidir. Saat `TEACH_WEEKS` dir ve bu sabit 34'tür. `hoursBasis` değeri `plan` dır. `processOpen` altısında açıktır. Kurs notu, tema saatinin çerçeve planından yeniden ölçülmediğini yazar.

| Kod | Tema | Saat | Kab | Kabın saati | Kabın haftası |
|---|---|---:|---|---:|---|
| T.6.1 | Dilimizin Zenginliği | 34 | `jr_06_turkce-21` | 0 | 0 |
| T.6.2 | Bağımsızlık Yolu | 34 | `jr_06_turkce-22` | 0 | 0 |
| T.6.3 | Farklı Dünyalar | 34 | `jr_06_turkce-23` | 0 | 0 |
| T.6.4 | İletişim ve Sosyal İlişkiler | 34 | `jr_06_turkce-24` | 0 | 0 |
| T.6.5 | Bilim ve Teknoloji | 34 | `jr_06_turkce-25` | 0 | 0 |
| T.6.6 | Lider Ruhlar | 34 | `jr_06_turkce-26` | 0 | 0 |

`packages/junior-content/meb/2026-2027/turkce.json` içinde başka kazanım satırı yoktur. Dinleme, okuma, konuşma ve yazma için `T.6.1.D` gibi bir kod, şema ve takvim kaydı yoktur. Resmî fiil cümlesi bu turda PDF'den okunmadı. Aşağıdaki bağ, paketteki yirmi dersin işidir.

`buildCourse` konu şeridinin saatini toplar. Beklenen toplam `6 × 34 = 204` tür. Tema satırının 34 saati ile uydunun saati bu toplamda iki kez durmaz. Toplamı şerit yapar. Kab şeridi 0 yazar. Uydu `pinned` olduğu için ardışık öğretim bütçesini yemez, kendi haftasına yapışır.

### 2.2 Yirmi uydunun işi

`plan.ts` içindeki yorum, temaların işini şöyle ayırır: söz varlığı Dilimizin Zenginliği'nde, paragraf ve metin türü Bağımsızlık Yolu'nda, yorum ve anlatım Farklı Dünyalar'da, cümle ilişkisi ile kök-ek İletişim'de, yazım Bilim ve Teknoloji'de, noktalama Lider Ruhlar'da. Başlıklar bu yoruma uyar.

| Tema | Uydu | Başlık | Saat | Hafta | İş |
|---|---|---|---:|---|---|
| T.6.1 | `jr_06_turkce-1` | Gerçek, mecaz ve terim anlam | 7 | 1–3 | söz varlığı |
| T.6.1 | `jr_06_turkce-2` | Eş anlam, zıt anlam, yakın anlam | 7 | 1–3 | söz varlığı |
| T.6.1 | `jr_06_turkce-3` | Çok anlamlılık ve söz varlığı | 7 | 4–6 | söz varlığı |
| T.6.1 | `jr_06_turkce-4` | Söz sanatları | 7 | 4–6 | söz varlığı |
| T.6.1 | `jr_06_turkce-13` | Deyimler ve atasözleri | 6 | 4–6 | söz varlığı |
| T.6.2 | `jr_06_turkce-8` | Paragrafta ana fikir ve konu | 9 | 7–8 | okuma |
| T.6.2 | `jr_06_turkce-9` | Paragrafta yardımcı fikirler | 9 | 8–9 | okuma |
| T.6.2 | `jr_06_turkce-10` | Paragrafın yapısı | 8 | 11–12 | okuma |
| T.6.2 | `jr_06_turkce-12` | Metin türleri | 8 | 12–13 | okuma |
| T.6.3 | `jr_06_turkce-5` | Öznel ve nesnel anlatım | 12 | 13–14 | okuma |
| T.6.3 | `jr_06_turkce-7` | Örtülü anlam ve cümle yorumu | 11 | 15–16 | okuma |
| T.6.3 | `jr_06_turkce-11` | Anlatım biçimleri | 11 | 17–18 | okuma |
| T.6.4 | `jr_06_turkce-6` | Neden, amaç ve koşul cümleleri | 9 | 22–24 | cümle |
| T.6.4 | `jr_06_turkce-14` | İsim ve fiil kökü | 9 | 23–25 | ek |
| T.6.4 | `jr_06_turkce-15` | Yapım ekleri | 8 | 24–25 | ek |
| T.6.4 | `jr_06_turkce-16` | İsim çekim ekleri | 8 | 25–27 | ek |
| T.6.5 | `jr_06_turkce-17` | Büyük harf ve sayıların yazımı | 17 | 28–30 | yazım |
| T.6.5 | `jr_06_turkce-18` | de, da, ki ve mi | 17 | 31–33 | yazım |
| T.6.6 | `jr_06_turkce-19` | Nokta, virgül, noktalı virgül, iki nokta | 17 | 34–36 | noktalama |
| T.6.6 | `jr_06_turkce-20` | Üç nokta, soru, ünlem, kesme, tırnak | 17 | 37–40 | noktalama |

Tema saatleri 34+34+34+34+34+34 = 204 eder. `jr_06_turkce-16` aralığının içinde 26. hafta ara tatili durur. Uçlar 25 ve 27 öğretim haftasıdır. `jr_06_turkce-20` aralığının içinde 39. hafta yazılısı durur. Uçlar 37 ve 40 öğretim haftasıdır.

Aynı rozeti paylaşan uydular saati iki kez yazmaz. `pinned` şerit, verilen haftayı yerleştirir. Saat toplamı `sumHours` ile bir kez kapanır. Örnek kümeler: 1 ile 2 hafta 1–3'te, 3 ile 4 ile 13 hafta 4–6'da, 8 ile 9 hafta 8'de, 10 ile 12 hafta 12'de, 12 ile 5 hafta 13'te, 6 ile 14 ile 15 ile 16 hafta 22–27 kuşağında.

Yirmi dosya `lib/junior/content/turkce/1.ts` … `20.ts` ve `lib/junior/quiz/turkce/` altındadır. Kadro `Array.from({ length: 20 })` dir. Yirmisinin ses kaydı manifesttedir ve ders yüzündedir.

### 2.3 Saat bölüşümü ve beceri bağı

Dört beceriye eşit saat vermek, söz varlığı dersini dinleme diye etiketler. Pakette dinleme dersi yoktur. Konuşma dersi yoktur. `jr_06_turkce-11` anlatım biçimini okuma işi olarak taşır; sözlü üretim dersi değildir. Yazma mekaniği `jr_06_turkce-17` … `20` içindedir: yazım ve noktalama. Kompozisyon dersi ayrıca yoktur.

Saat mimarisi şudur.

1. Uydu saatleri yerinde kalır. 204 bozulmaz.
2. Tema satırı `T.6.1` … `T.6.6` 34 saatini korur. `processOpen` açık kalır.
3. Beceri satırı İngilizce `G1` gibi saati 0 olan binicidir. Pozitif saat almaz. Tema saatiyle toplanmaz.
4. Binici, işi o beceri olan uydunun `outcomeCodes` alanına eklenir. Takvim kodu `plan.ts` içindeki `TURKCE_SATELLITES` satırından gelir. Senaryo dosyasındaki `outcomes` dizisi öğrenci cümlesidir; MEB kodu orada durmaz. Bu yüzden bağ, yirmi TypeScript dosyasını yeniden yazmadan plan satırında kurulur.
5. Dinleme ve konuşma için binici açılmaz. Taşıyıcı ders yazılmadan kod, kapsama listesine saatli açık çıktı olarak düşer. `verify:junior-content` saati 0 olan satırı kapsama listesine basmaz. Saatli ve `processOpen` açık bir dinleme satırı, anlatımı olmadığı için listede kalır.

Ürün kodu önerisi, resmî fiil cümlesinin yerine geçmez. PDF okunmadan `T.6.1.1` gibi numara üretilmez. Binici soneki `G1` ile aynı cinstedir:

| Sonek | Beceri | Bağlanan uydular | Saat |
|---|---|---|---:|
| `.O` | Okuma ve söz varlığı | `1`, `2`, `3`, `4`, `13`, `8`, `9`, `10`, `12`, `5`, `7`, `11` | 0 |
| `.Y` | Yazım ve noktalama | `17`, `18`, `19`, `20` | 0 |
| `.C` | Cümle ve ek | `6`, `14`, `15`, `16` | 0 |

`.O` temasına göre `T.6.1.O`, `T.6.2.O`, `T.6.3.O` olur. `.Y` için `T.6.5.Y` ve `T.6.6.Y`. `.C` için `T.6.4.C`. Her kodun `themeCode` alanı kendi temasıdır. `hours` 0, `hoursBasis` `plan`, `processOpen` `false` olur. Açık süreç, saati duran tema satırında kalır.

`T.6.4` dersleri cümle çözümlemesi ve ek tanımıdır. Onları konuşma veya serbest yazma diye etiketlemek dersin işini değiştirir. `.C` bu dördü için ayrı binicidir.

Yeni uydu açılmaz. 21–26 kab numarası bu bağ için kullanılmaz. Boş numara da açılmaz. Dinleme veya konuşma dersi ileride yazılacaksa saati, fırınlanmış bir uydunun saatinden kesilerek alınmaz. O iş ayrı bir plan değişikliğidir ve bu dalganın dışındadır.

### 2.4 Kablar ve `export:junior-content`

`jr_06_turkce-21` … `26` saat 0 ve hafta 0 olarak kalır. `shell: true` kalır. Kadroya girmezler. Sandığa senaryo yazılmaz.

Export uyumu şu koşullarda bozulmaz:

- `TURKCE_SHELLS` listede kalır. `plannedShellCount()` Türkçe için 6 saymaya devam eder.
- 21–26, `JUNIOR_SEALED_ROSTER` türkçe numaralarına eklenmez. Export bu anahtarlar için `lib/junior/content/turkce/21.ts` aramaz. Dosya olmadığı için boru hattı kırılmaz.
- Yeni beceri kodu, aynı değişikliktte hem `TURKCE_THEMES` yanındaki taslak dizisine hem uydunun `outcomeCodes` listesine girer. `verify:junior-content` takvimdeki her kodun MEB dosyasında durmasını ister. Kod yalnız bir tarafta kalırsa «bilinmeyen çıktı» der.
- Uydu saati ve yapışık hafta değişmez. `sumHours` 204 kalır. Uç haftalar öğretim haftası kalır.
- Kab JSON'u export sırasında yeniden `shell: true` ve 0 saat olarak basılır.

Tema satırı saati 34 ve `processOpen` açık olduğu için `T.6.1`–`T.6.6` kapsama listesinde durmaya devam eder. Sayaç, bayrak kapanmadan ilerlemez. Yirmi uydunun metni bu dalgada yeniden yazılmaz.

---

## 3. Stratejik görüş

### 3.1 Sıra

Önce Sosyal Bilgiler'in altı kabını kapatırım. Sonra Türkçe beceri binicisini, tek plan değişikliğinde, yeni ders açmadan bağlarım.

Sosyal öndedir çünkü iş, Fen'de çalışan kapanışın altı derslik hâlidir. Kazanım kodu, saat, hafta ve kapı kökü pakettedir. `unverified` satır yoktur. Yazım, takvim toplamını 103'te bırakır. Türkçe bağı ise yirmi fırınlanmış dersin takvim koduna etiket ekler. Saatli boşluk kapanmadan bu etikete girmek, canlı rafın kodunu, yazılmamış 34 saatin önüne alır.

Sosyal pilotu `jr_06_sosyal-21` olur. Kazanım doğrudandır, kapı kökü `müzakere` başlığın içindedir, komşu ders `jr_06_sosyal-1` yazılmıştır, sahne `assembly` katalogdadır, saat 5'tir. Pilot export, `verify:junior-content` ve mühür bandından geçmeden 22–26 açılmaz. Ardından ünite sırası `-22`, `-23`, `-24`, `-25`, `-26` dur. `-23` yazılırken `-6` dosyası açılmaz.

Türkçe bağı pilot ders istemez. Altı tema ve üç sonek aynı değişiklikte girer. Parça parça sonek, takvim kodunu yarım bırakır ve verify bilinmeyen çıktı der.

### 3.2 Kab sayısı

Bugün 19 kab vardır: Sosyal 6 saatli kab, Türkçe 6 sandık, İngilizce 7 sandık. Fen kabı 0'dır.

Sosyal kapanınca kab sayısı **13** olur. Kalanların hepsi saat 0 ve hafta 0 sandığıdır.

| Sandık | Adet | Saat | İş |
|---|---:|---:|---|
| `jr_06_turkce-21` … `26` | 6 | 0 | Tema kodunu tutar. 204 saat yirmi uydudadır |
| `jr_06_ing_main-21` … `27` | 7 | 0 | Tema kodunu tutar. 102 saat on dört uydudadır. `G1` uydudadır |

Bu on üç sandık mimariye uyar. Saat, yapışık uydudadır. Sandık temanın kutusudur. Üzerine ikinci anlatı yazılmaz, kadroya alınmaz, saati geri verilmez. 6. sınıf çekirdeğinde saat tutan kab kalmaz.

Din Kültürü, Müzik, Görsel Sanatlar, Beden Eğitimi ve Bilişim, bu on üç sandık dururken çekirdek kart yapılmaz. 7. sınıf, 6. sınıfın dosya ağacı kopyalanarak açılmaz.

### 3.3 Ses fırını ve yayın rafı

Raf, sesi fırınlanmış anahtardır. `juniorLessonHasBakedAudio` listeyi `lib/junior/audio-manifest.generated.ts` anahtarlarından okur. Manifestte 68 anahtar vardır. Yazarlık 105'tir. Fırınsız 37 ders rafta yoktur: matematik `jr_06_mat-26` … `38` (13), fen `jr_06_fen-21` … `38` (18), İngilizce `jr_06_ing_main-2`, `-4`, `-6`, `-9`, `-10`, `-11` (6). Sosyal'in bugünkü 18 kadro numarası manifesttedir. Altı kab manifestte yoktur.

Türkçe beceri bağı yeni ders açmaz. Yeni ses isteği doğurmaz. Yirmi Türkçe kaset yerinde kalır.

Sosyal kapanışı yazarlığı 111 yapar ve fırın kuyruğuna 6 anahtar ekler. Kuyruk o anda 43 ders olur. Raf, bu 43 fırınlanmadan 68'de kalır.

Fırın komutunun kurs havuzu `JUNIOR_SOSYAL_LESSONS` ve kardeşleridir. Bu diziler `juniorSealedCourseLessons` ile kuruludur ve yalnız manifestteki anahtarı döndürür. `scripts/bake-junior-pilot-tts.ts` içindeki `--key=` seçici de aynı havuza bakar. Havuzda olmayan `jr_06_sosyal-21` bu komutla seçilemez. `--course=jr_06_sosyal` ise raftaki 18 dersi yeniden sentezler. `bakeLesson` mevcut MP3'ü atlamaz. Yayınlanmış kaseti yeniden yazmak hem harcamadır hem rafın hash'ini değiştirir.

Raf dalgası, yazarlık dalgasından sonra ve şu sırayla yürür:

1. Fırın havuzu, manifestteki anahtarlar olur. Havuz, kadrodaki senaryo ile manifestin farkı olur: fırını olmayan 43 anahtar. Kurs geneli komut bu 43'ü toplu çağırmaz.
2. Her anahtar önce `--dry-run` fişi alır, sonra tek anahtar ve `--confirm-gemini-spend` ile yazılır. Ders başına bir konuşma isteği. Süre bandı 5–12 dakikadır.
3. Yazılan MP3, `npm run generate:junior-audio-manifest` ile manifeste girer.
4. Manifestten sonra `scripts/sync-junior-lesson-face.ts` çalışır. Yüz listesi `juniorSealedCourseLessons` okur. Fırından önce çalıştırılırsa yeni anahtarı eklemez. Fırından sonra çalıştırılırsa başlığı senaryodan basar.
5. `processOpen` bu fırında `false` yapılmaz. Sayaç, bayrak kapanınca ilerler. Bayrak, metin süreci yaptıktan sonra kapanır.
6. Kasa bu dalgada açılmaz.

43 dersin fırın sırası, rafta boşluğu en eski olan dersten başlar: önce matematik 26–38, sonra fen 21–38, sonra altı İngilizce uydu, en sonda sosyal 21–26. Sosyal'in pilotu `-21` fırında da ilk sosyal anahtardır. Yayınlanmış 68 kasete dokunulmaz.

---

## Ölçüm sınırı

- Maarif PDF'si bu turda yeniden indirilmedi. Sosyal alan saati paketin kendi notudur (16+18+22+18+18+11). Türkçe beceri sonekleri ürün bağıdır; resmî fiil cümlesi değildir.
- Ses dosyasının gövdesi taranmadı. Raf hükmü, manifest anahtarı ve `sealedKeys` süzgecindendir. Manifestte 68 kayıt vardır.
- Canlı site bu turda açılmadı. 2. dalga tedavi kaydı `docs/TEDAVI_RAPORU.md` 8. bölümündedir.
- `export:junior-content` bu turda çalıştırılmadı. Boru hattı hükmü, betiğin yazma sırası ve `verify:junior-content` kab sayımıdır.

---

# Tespit Raporu — 4. dalga: 43 ders `--dry-run` provası

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Gündem | 43 bekleyen dersin ses fırını öncesi `--dry-run` provası: matematik 26–38, fen 21–38, İngilizce 2, 4, 6, 9, 10, 11, sosyal 21–26 |
| Ölçüm | `scripts/bake-junior-pilot-tts.ts` gerçek `--dry-run` çağrıları; `lib/junior/` senaryo, ses, süre ve ses tasarımı modülleri; `lib/junior/audio-manifest.generated.ts`; `media-bake/junior/dry-run-receipts/`; `npm run verify:junior-content` |
| Harcama | Sıfır. Gemini isteği, düdük, MP3, manifest ve fiş yazımı yok |
| Kapsam dışı | Sentez, ses dosyası çözümlemesi, kod ve kadro değişikliği, `public/media/` |

## Hüküm

Prova **yeşil değil**. İki katman ayrı değerlendirildi:

1. **Fırın betiği 43/43 anahtarı reddetti.** Prova anında kurs havuzu yalnızca fırınlanmış dersleri içeriyordu (`sealedKeys`). Fırınlanmamış dersler havuza girmediği için `--key=` seçici onları kabul etmiyor. Ders fırınlanamıyor, çünkü havuzda değil; havuzda değil, çünkü fırınlanmamış.
2. **Metin 43/43 yapısal ve süre kapısını geçti.** Her derste 12 adım ve zorunlu bloklar var; gerçek süre tahmini 6,7–7,0 dakika, 5–12 dakika bandının içinde. Üç derste TTS okuma riski var: `jr_06_sosyal-23` (Romen rakamları), `jr_06_mat-26` ve `jr_06_mat-38` (eğik çizgili kesirler). Tüm derslerde iki sistemik bulgu var: öğretmen tanıtımı küçük `ben` ile başlıyor; omurga çerçeveleri doğal olmayan Türkçe üretiyor ve kazanım cümlelerini tekrarlıyor.

`verify:junior-content` yeşil (çıkış kodu 0): 111 senaryo, 13 kab, takvim planla aynı.

**Acil uyarı (prova sırasında tespit edildi, sonradan düzeltildi).** Prova anında kurs komutları (`--course=`) ve varsayılan pilot yolu fırınlı dersleri de havuzdan okuyordu; mevcut MP3'ü kontrol eden bir koruma yoktu. Kod akışına göre `--dry-run --course=jr_06_mat` fişleri yeniler, ardından `--confirm-gemini-spend --course=jr_06_mat` yayındaki 13 matematik dersini yeniden sentezler. Bu prova bu komutları çalıştırmadı. Havuz düzeltmesi aşağıdaki Değişiklik notu ile uygulandı.

---

## 1. Gerçek `--dry-run` sonucu (ADIM 1)

| Kapsam | Anahtar | Sonuç | Fiş yazıldı mı |
|---|---:|---|---|
| Matematik | 13 (26–38) | Havuz hatası | Hayır |
| Fen | 18 (21–38) | Havuz hatası | Hayır |
| İngilizce | 6 (2, 4, 6, 9, 10, 11) | Havuz hatası | Hayır |
| Sosyal | 6 (21–26) | Havuz hatası | Hayır |

Hata metni: `--key= havuzdaki anahtarları bekler`. Bu hata `planLesson` ve fiş yazımından önce çıkıyor; bu yüzden hiçbir fiş yazılmadı ve Gemini istemcisi kurulmadı.

Fiş durumu (`media-bake/junior/dry-run-receipts/`, son yazım 11 Ekim 00:47, bu oturumdan önce):

- Güncel fiş: **0/43**.
- Fişi olmayan: 37 (matematik 26–38, fen 21–38, sosyal 21–26).
- Eski fiş: 6 İngilizce (2, 4, 6, 9, 10, 11). `v`, `voiceMode`, `voicePromptSent` ve `textHash` alanları bugünkü kurala uymuyor.
- Fırınlı 68 dersin fişi de var. Hepsi 10 Ekim 16:44'ten (yerel saat) ve hepsi eski: 68/68 fişte sürüm, ses ve metin karması uymuyor. Gerçek koşu bugün fiş kapısında duruyor; kapıyı açan şey, bu fişlerin yenilenmesi.

Düzeltme: Ara bir sayımda fiş sayısı 124 çıkmıştı; ilk taramamda `media-bake/` dizininin olmadığını yazmıştım. İkisi de yanlıştı. Doğrudan sayım klasörde 105 dosya verdi. Dizin 7 Ekim'den beri var.

---

## 2. Kontrol ve kronometre (ADIM 2)

### 2.1 Süre

Süre iki kaynaktan okundu:

- **Saat tahmini:** kurucu (`juniorNarrationDurationMs`) 12 karakter/sn varsayımıyla hesaplar.
- **Gerçek süre:** 68 fırınlı dersin MP3 bayt boyutundan türetildi (320 kbps sabit hız, yani bayt / 40 000 sn). Ses çözümlemesi değildir.

Kalibrasyon (68 fırınlı ders):

| Ölçü | En düşük | Ortalama | En yüksek |
|---|---:|---:|---:|
| Gerçek süre (dk) | 6,11 | — | 7,78 |
| Gerçek / saat oranı | 1,218 | 1,338 | 1,549 |
| Karakter/sn (gerçek) | 7,8 | 9,1 | 9,9 |

68/68 fırınlı ders gerçekte 5–12 dk aralığında. Saat tahmini gerçek süreden yaklaşık %25 kısa kalıyor: kod 12 karakter/sn varsayıyor, gerçek ortalama 9,1.

Süre kapıları. Hangisinin sert, hangisinin yumuşak olduğu önemli:

| Kapı | Nerede | Tür | Eşik | Davranış |
|---|---|---|---|---|
| Saat alt sınır | `lib/junior/scenario.ts` | Sert | 300 sn | Kurucu hata verir |
| Saat üst sınır | `lib/junior/scenario.ts` | Sert | 720 sn | Kurucu hata verir |
| Gerçek üst sınır | `bakeLesson` | Sert | 720 sn | Dosya yazılmaz |
| Gerçek tamlık | `bakeLesson` | Sert | kelime × 0,4 sn | 492–607 kelimede 197–243 sn; dosya yazılmaz |
| Gerçek alt sınır | `bakeLesson` | Yumuşak | 300 sn | Uyarı basılır, dosya yazılır |

Gerçek alt sınır bakede yumuşak. Dolayısıyla 5 dakika, fiilen kurucunun saat tahminine bağlı.

43 dersin sonucu: gerçek süre tahmini 6,69–6,97 dk (ortalama oran), makul hata payıyla 6,1–8,1 dk. Hepsi 5–12 dk bandında.

Kurs özeti:

| Kurs | Ders | Saat (dk) | Gerçek tahmini (dk) | Kelime | Omurga kalıbı |
|---|---:|---|---|---|---|
| Matematik 26–38 | 13 | 5,01–5,21 | 6,70–6,97 | 509–568 | 11–14 |
| Fen 21–38 | 18 | 5,01–5,17 | 6,70–6,92 | 500–544 | 6–10 |
| İngilizce 2–11 | 6 | 5,05–5,12 | 6,76–6,86 | 557–607 | 5–8 |
| Sosyal 21–26 | 6 | 5,00–5,16 | 6,69–6,91 | 492–553 | 8–10 |

### 2.2 Pedagojik yapı

| Kontrol | Sonuç |
|---|---|
| 12 adım | 43/43 tam 12. En kısa adım 56 karakter |
| Her adım kapanış cümlesiyle bitiyor | 43/43 |
| Zorunlu bloklar: karşılama, öğretmen tanıtımı, hitap, 200+ karakter, yönerge sızıntısı yok, çizim çağrısı, özet başlığı, "Kavramsal Anlayış" ve "İfade Gücü" mühürleri, kapanış, "Şimdi bunu kendi cümlenle…" istemi, quiz dosyası | 43/43 geçti |
| Eksik bölüm | Yok. En kısa bölüm 139 karakter (`jr_06_mat-35`, yaşam) |
| Eksik karakter veya kelime | Yok. En kısa metin 3627 karakter (`jr_06_sosyal-24`) |
| Ses adları | Geçerli: `Puck`, `Leda`, `Kore`, `Achird` |
| Öğretmen eşleşmesi | Matematik Selim/Puck, fen Deniz/Leda, İngilizce Selin/Kore, sosyal Murat/Achird |

Yapısal ihlal yok. Asıl sorun dil kalitesinde (2.6).

### 2.3 Ders bazlı tablo

Öğretmen tanıtımındaki küçük `ben` sorunu (2.5) 43 dersin tamamında var; tabloda tekrarlanmıyor. Tabloda yalnızca derse özgü bulgular yazıldı. "Tahmini MP3" sütunu, saat × 1,338 ile hesaplandı. "En kısa bölüm" ise en kısa yapı parçası.

| Ders | Öğretmen / ses | Kelime | Karakter | Saat (dk) | Tahmini MP3 (dk) | Omurga | En kısa bölüm | Ders bulgusu |
|---|---|---:|---:|---:|---:|---:|---|---|
| `jr_06_mat-26` | Selim / Puck | 568 | 3767 | 5,19 | 6,95 | 12 | yaşam 172 | Eğik çizgi ×5 (`1/2`, `1/3`); aynı metinde `1 bölü 4` de var; `0,333` ondalığı |
| `jr_06_mat-27` | Selim / Puck | 509 | 3640 | 5,02 | 6,71 | 12 | yaşam 154 | — |
| `jr_06_mat-28` | Selim / Puck | 550 | 3668 | 5,06 | 6,77 | 13 | karşılama 170 | `adım adım` (deyim) |
| `jr_06_mat-29` | Selim / Puck | 544 | 3692 | 5,09 | 6,81 | 13 | yaşam 162 | `adım adım` (deyim) |
| `jr_06_mat-30` | Selim / Puck | 558 | 3743 | 5,16 | 6,90 | 12 | karşılama 180 | — |
| `jr_06_mat-31` | Selim / Puck | 513 | 3635 | 5,01 | 6,70 | 11 | karşılama 181 | — |
| `jr_06_mat-32` | Selim / Puck | 511 | 3777 | 5,21 | 6,97 | 11 | yaşam 188 | En yüksek saat tahmini |
| `jr_06_mat-33` | Selim / Puck | 542 | 3712 | 5,12 | 6,85 | 12 | yaşam 142 | — |
| `jr_06_mat-34` | Selim / Puck | 540 | 3677 | 5,07 | 6,78 | 13 | yaşam 164 | — |
| `jr_06_mat-35` | Selim / Puck | 545 | 3737 | 5,15 | 6,89 | 14 | yaşam 139 | En kısa bölüm (43 dersin en kısası); en çok çerçeve |
| `jr_06_mat-36` | Selim / Puck | 548 | 3702 | 5,11 | 6,83 | 13 | karşılama 170 | — |
| `jr_06_mat-37` | Selim / Puck | 514 | 3732 | 5,14 | 6,88 | 12 | yaşam 161 | — |
| `jr_06_mat-38` | Selim / Puck | 528 | 3659 | 5,04 | 6,75 | 12 | yaşam 198 | Eğik çizgi ×8 (`5/20`, `1/4`, `15/20`) |
| `jr_06_fen-21` | Deniz / Leda | 544 | 3756 | 5,17 | 6,92 | 6 | karşılama 309 | — |
| `jr_06_fen-22` | Deniz / Leda | 544 | 3727 | 5,13 | 6,87 | 10 | yaşam 259 | — |
| `jr_06_fen-23` | Deniz / Leda | 515 | 3639 | 5,01 | 6,71 | 9 | yaşam 274 | — |
| `jr_06_fen-24` | Deniz / Leda | 517 | 3714 | 5,12 | 6,85 | 9 | yaşam 235 | `tek tek` (deyim) |
| `jr_06_fen-25` | Deniz / Leda | 500 | 3715 | 5,12 | 6,85 | 9 | yaşam 268 | — |
| `jr_06_fen-26` | Deniz / Leda | 517 | 3738 | 5,15 | 6,89 | 8 | yaşam 257 | — |
| `jr_06_fen-27` | Deniz / Leda | 525 | 3668 | 5,06 | 6,77 | 8 | yaşam 266 | — |
| `jr_06_fen-28` | Deniz / Leda | 511 | 3721 | 5,13 | 6,86 | 7 | yaşam 298 | — |
| `jr_06_fen-29` | Deniz / Leda | 528 | 3655 | 5,04 | 6,74 | 9 | yaşam 233 | — |
| `jr_06_fen-30` | Deniz / Leda | 541 | 3714 | 5,12 | 6,85 | 9 | yaşam 258 | — |
| `jr_06_fen-31` | Deniz / Leda | 529 | 3666 | 5,05 | 6,76 | 8 | yaşam 246 | — |
| `jr_06_fen-32` | Deniz / Leda | 534 | 3719 | 5,12 | 6,86 | 8 | yaşam 268 | — |
| `jr_06_fen-33` | Deniz / Leda | 510 | 3696 | 5,09 | 6,82 | 10 | yaşam 226 | — |
| `jr_06_fen-34` | Deniz / Leda | 511 | 3641 | 5,02 | 6,71 | 6 | yaşam 245 | — |
| `jr_06_fen-35` | Deniz / Leda | 524 | 3721 | 5,13 | 6,86 | 8 | yaşam 241 | — |
| `jr_06_fen-36` | Deniz / Leda | 500 | 3635 | 5,01 | 6,70 | 6 | yaşam 269 | `tek tek` (deyim) |
| `jr_06_fen-37` | Deniz / Leda | 506 | 3721 | 5,13 | 6,86 | 7 | yaşam 234 | — |
| `jr_06_fen-38` | Deniz / Leda | 513 | 3632 | 5,01 | 6,70 | 6 | yaşam 222 | — |
| `jr_06_ing_main-2` | Selin / Kore | 607 | 3719 | 5,12 | 6,86 | 5 | yaşam 343 | En çok kelime; `tek tek` (deyim) |
| `jr_06_ing_main-4` | Selin / Kore | 573 | 3670 | 5,06 | 6,77 | 6 | yaşam 322 | `sık sık` (deyim) |
| `jr_06_ing_main-6` | Selin / Kore | 569 | 3676 | 5,07 | 6,78 | 7 | yaşam 340 | — |
| `jr_06_ing_main-9` | Selin / Kore | 577 | 3711 | 5,12 | 6,85 | 8 | karşılama 313 | `will not not` bilinçli gramer karşı örneği |
| `jr_06_ing_main-10` | Selin / Kore | 557 | 3676 | 5,07 | 6,78 | 8 | karşılama 300 | — |
| `jr_06_ing_main-11` | Selin / Kore | 558 | 3667 | 5,05 | 6,76 | 5 | yaşam 307 | — |
| `jr_06_sosyal-21` | Murat / Achird | 506 | 3638 | 5,02 | 6,71 | 9 | karşılama 261 | Pilot aday; derse özgü TTS riski yok |
| `jr_06_sosyal-22` | Murat / Achird | 518 | 3630 | 5,00 | 6,69 | 8 | karşılama 242 | — |
| `jr_06_sosyal-23` | Murat / Achird | 531 | 3744 | 5,16 | 6,91 | 9 | karşılama 236 | Romen rakamı ×6 (`VII.` ×3, `XIII.` ×3); `VII–XIII` aralığında en dash ×1 |
| `jr_06_sosyal-24` | Murat / Achird | 492 | 3627 | 5,00 | 6,69 | 10 | karşılama 212 | En az kelime ve en kısa metin |
| `jr_06_sosyal-25` | Murat / Achird | 528 | 3678 | 5,07 | 6,78 | 9 | karşılama 227 | — |
| `jr_06_sosyal-26` | Murat / Achird | 553 | 3709 | 5,11 | 6,84 | 10 | karşılama 198 | — |

### 2.4 TTS'te sorun çıkarabilecek karakterler

TTS'e giden metin `listenText` ile aynıdır; yalnızca nefes etiketi (`<break>`) eklenir. Rakam ve sembol normalizasyonu yoktur. Emoji, markdown işaretleri, `%`, `=`, `+`, düz tırnak, dengesiz `«»` ya da parantez, karışık büyük-küçük harf: hiçbir derste yok.

Eğik çizgi ve Romen rakamı, fırınlı 68 derste hiç geçmiyor. Yani bunlar yeni bir desen; 43 dersi fırına sokmadan önce düzeltilmeli.

| Ders | Bulgu | Risk | Öneri |
|---|---|---|---|
| `jr_06_sosyal-23` | Romen rakamı 6 kez: `VII.` ×3, `XIII.` ×3 | Yüksek | Konuşma metninde "yedinci yüzyıl", "on üçüncü yüzyıl" |
| `jr_06_sosyal-23` | `VII–XIII` aralığında en dash ×1 | Orta | "yedinci ile on üçüncü yüzyıl" |
| `jr_06_mat-26` | Eğik çizgi ×5: `1/2`, `1/3`. Aynı metinde `1 bölü 4` de geçiyor | Orta | "bir bölü iki", "bir bölü üç" |
| `jr_06_mat-38` | Eğik çizgi ×8: `5/20`, `1/4`, `15/20` | Orta | "yirmide beş", "dörtte bir" |

Notlar:

- Ondalık virgül (`0,333`, `0,25`, `3,14`) TTS'te "virgül" olarak okunmalı; bu sayı okumasının olağan biçimi. Değişiklik zorunlu değil.
- Çerçeve numaraları ve sayılar: 68/68 fırınlı derste var. Değişiklik zorunlu değil.
- İngilizce cümleler: fırınlı 8 İngilizce derste de aynı biçimde var. Değişiklik zorunlu değil.

### 2.5 Yazım

Sözlük tabanlı imla denetimi yapılmadı; repoda Türkçe sözlük yok. Biçimsel tarama:

- Yaygın yanlış ASCII yazım kalıpları (`cocuk`, `simdi`, `ogretmen`, `dogru` gibi 30 kalıp): 0 eşleşme.
- Tekrar eden kelimeler: `adım adım` (`mat-28`, `mat-29`), `tek tek` (`fen-24`, `fen-36`, `ing-2`), `sık sık` (`ing-4`). Deyimsel kullanım; değişiklik gerekmez. `will not not` (`ing-9`) bilinçli bir gramer karşı örneği.
- `«ben de benzerini düşündüm»` (`sosyal-26`) tırnak içinde doğru kullanım.
- **Sistemik bulgu (43/43).** Öğretmen tanıtımı cümle başında küçük harfle yazılıyor: «…çocuklar! ben Sosyal Bilgiler öğretmenin Murat.» Üretici `juniorTeacherSelfIntro` (`lib/junior/voice.ts`) büyük `Ben` yerine küçük `ben` döndürüyor. Altyazı bu metinden okunduğu için hata ekranda görünür. Aynı üretici fırınlı 68 dersi de üretti; onların altyazıları bu raporda ayrıca denetlenmedi.

### 2.6 Dil kalitesi: omurga çerçeveleri

Kurucu (`storySpine`, `lib/junior/scenario.ts`) süreyi 5 dakikaya tamamlamak için çerçeve cümleleri ekliyor. 43 yeni derste 5–12 çerçeve var. Fırınlı 68 dersin 60'ında da var ve bunlar ses dosyasında. Örnek (`jr_06_sosyal-21`, kısaltılmış):

> Hikâyenin 1. odasında Toplumsal sorunu müzakere konusu şu cümleyle durur: Toplumsal sorun birden fazla kişiyi etkiler. Bir an orada kal, sonra kapıyı arala. 2. odanın duvarında aynı konunun yeni bir parçası var. … Hikâye 7. kapıda durur. … Pencereden 9. kez bakmak zorunda değilsin.

Üç sorun:

1. **Başlık çekimi bozuk.** "Toplumsal sorunu müzakere konusu" gibi kalıplar, başlığı çekimli bir ad öbeği olarak cümleye koyuyor. Türkçede doğal değil.
2. **Yapay köprü cümleleri.** "Hikâye 7. kapıda durur", "Pencereden 9. kez bakmak zorunda değilsin", "8. adımda sesini yavaşlat" çocuk dinleyicisi için yapay duyuluyor. Bu cümleler yalnızca süreyi tamamlamak için var.
3. **Kazanım tekrarı.** Kod, gelişme bölümünü "sıfır papağan tekrar" diye tanımlıyor (`scenario.ts`). Çerçeveler ise kazanım cümlelerini iki kez tekrar ediyor. `jr_06_sosyal-21` içinde "Toplumsal sorun birden fazla kişiyi etkiler." ve "Ortak karar, dayatmanın yerine geçer." ikişer kez geçiyor. Tanım ile çıktı çelişiyor.

Bu bir hata değil, tasarım tercihi. Ama düzeltmesi 43 yeni dersi ve 60 fırınlı dersi etkiler; fırınlı dersler için yeniden fırınlama gerekir. Bu nedenle karar fırından önce verilmeli (3.3).

---

## 3. Sen olsaydın ne yapardın? (ADIM 3)

### 3.1 Süre bandı dışına çıkan bir ders olursa

Bu provada bant dışı ders yok. Yine de sırayı şöyle kurardım:

1. **Gerçek süre 12 dk üstü.** Bake dosya yazmadan durur. Önce omurga çerçevesini kısaltırdım; çerçeve içerik değil kalıp olduğu için kazanımı etkilemez. Kazanım, örnek ve uyarı bölümlerine dokunmazdım. Atempo (`0,94`), ses adı ve DSP ayarlarına dokunmazdım; bunlar kursun ses kimliği ve fırınlanmış derslerle tutarlılık demek. Sonra yeni `--dry-run` fişi, tek ders fırın, manifest ve yüz senkronu.
   - Dikkat: Kurucunun 12 dk üst sınırı saat tahminine bakar. Gerçek süre saatin yaklaşık 1,34 katı; saat 9 dk olan bir ders gerçekte 12 dk'yı geçebilir ve bakede durur. Bu 43 derste olmaz (en yüksek saat 5,21 dk), ama uzun bir derste ilk sorun bu olur.
2. **Gerçek süre 5 dk altı.** Betik uyarı basıp dosyayı yazar. Davranış bilinçli görünüyor ("Metin tam. Dosya yazılır."). Bunu değiştirmezdim, ama dokümanda "5 dakika" saat tahminidir, gerçek alt sınır değildir diye yazardım. Dolguyla uzatmazdım; eksik içerik varsa (örnek ya da günlük bağlam) ekleyerek uzatırdım.
3. **Kalibrasyon sabitini (12 karakter/sn) değiştirmek.** Doğru olurdu, ama 111 metnin tamamını ve 68 fırınlı dersin altyazı hizasını bozar. Bunun yerine dry-run'a kalibre bir "gerçek süre tahmini" satırı eklerdim.

### 3.2 Sentez stratejisi: ders grubuna göre mi, tek seferde mi?

Öneri: **kurs kurs ve pilotla**. Tek seferde değil. Gerekçeler:

- **Politika.** Akademi üretim anayasası "Hepsini tek seferde fırınla" talimatını uygulanamaz sayıyor (`.system_docs/AKADEMI_URETIM_ANAYASASI.md`). Betik de `--matrix` ile `--confirm-gemini-spend` birlikteliğini reddediyor: "Mühürlü derslerin tamamı tek maça alınmaz. Kurs kurs çalıştır".
- **Bütçe.** Her koşu için düdük tavanı 100. Her TTS isteği bir düdük harcar; kalite yeniden denemesi en fazla 3 kez yapılır. 43 dersin tek koşuda en kötü hali 129 düdük eder ve koşu ortasında durur. Kurs başına en fazla 18 ders (fen) ile en kötü hal 54 düdük.
- **Hata alanı.** Bir kursun ses sorunu (Romen rakamı, eğik çizgi) diğer kursların harcamasını boşa çıkarmaz.
- **Doğrulama.** Manifest ve yüz senkronu her kurs sonunda çalışır. 43 dersi tek kapıdan geçirmek, hangi dersin hangi kontrolde takıldığını izlemeyi zorlaştırır.

### 3.3 Önerilen sıra

Önce karar, sonra fırın:

1. **Ön koşullar** (kod ve metin; onay gerekir):
   - **Havuz (uygulandı).** Fırın havuzu fırınsız, yazılmış dersleri içeriyor; raf (`juniorSealedCourseLessons`) aynı kaldı. Fırınlı dersleri atlayan koruma eklendi (Değişiklik notu).
   - **Metin (uygulandı, bkz. Dry-run sonucu).** `jr_06_sosyal-23` Romen rakamları ve en dash; `jr_06_mat-26` ve `jr_06_mat-38` eğik çizgileri; öğretmen tanıtımındaki küçük `ben`.
   - **Dil kararı (verildi: şimdilik değiştirme).** Omurga çerçevesi olduğu gibi kalır; 2.6'daki sorunlar 43 derse taşınır. Sonradan değişirse fırınlı 60 ders yeniden fırınlanmalı.
2. **Dry-run, dört kurs için ayrı (tamamlandı).** 43 taze fiş yazıldı, 43/43 güncel. Ayrıntı: Dry-run sonucu bölümü.
3. **Pilot: `jr_06_sosyal-21`.** Eğik çizgi, Romen rakamı ve İngilizce yok. Ses dinlenir, gerçek süre ölçülür.
4. **Kurs kurs:** fen 21–38 (18) → İngilizce 2–11 (6) → matematik 26–38 (13; eğik çizgi düzeltmesinden sonra) → sosyal 22–26 (23 düzeltmesinden sonra). Her kursun sonunda manifest, yüz senkronu ve `verify:junior-content`.

Sıra, 3. dalga raporunun öngördüğü "önce matematik" sırasından farklı. Sebep: fen ve İngilizcede derse özgü TTS riski tespit edilmedi; matematik ve sosyal ise metin düzeltmesi bekliyor.

---

## Ölçüm sınırı (4. dalga)

- Gerçek `--dry-run` dört kez çalıştı; dördünde de havuz hatasında durdu. Prova sırasında yeni fiş, MP3 ya da manifest yazılmadı. Kod değişikliği yalnızca kullanıcı onayından sonra yapıldı (Değişiklik notu).
- Süre tahmini MP3 bayt boyutuna dayanır; ses çözümlemesi yapılmadı. 43 dersin gerçek süresi yalnızca sentezden sonra kesinleşir.
- Yapısal kontroller ve süre hesabı geçici bir betikte, `planLesson` kurallarının yeniden üretimiyle yapıldı; `planLesson` çağrılmadı. Kelime ve karakter sayıları sonradan metinlerden yeniden hesaplandı; 43 satır eşleşti (bkz. Dry-run sonucu).
- Yazım denetimi sözlük tabanlı değil. Metinlerin tamamı insan ya da denetim ajanı tarafından okunmadı; yalnızca `jr_06_sosyal-21` tam okundu.
- Kelime sayımı boşlukla bölme yöntemiyle yapıldı. Omurga ve tekrar tespitleri kalıp taramasıdır.
- Üçüncü dalga bölümü "sosyal 21–26 yok" diyor. Bugünkü depoda bu dersler var: TypeScript, topic JSON, kadro girişi ve export. Üçüncü dalga bölümü tarihsel kayıt olarak kalır; güncel durum bu bölümdür.
- Geçici analiz betikleri repo dışında (`%TEMP%`) tutuldu ve işlem sonunda silindi.

---

## Değişiklik notu (prova sonrası, kullanıcı onayıyla)

Onaylanan kararlar: (1) fırın havuzu düzeltmesi uygulandı. (2) Omurga için ilk seçenek "yalnız yeni 43 ders" idi; ancak sürüm işaretçisi olmadan tutarlı uygulanamıyor. Kullanıcı "şimdilik değiştirme" seçti: 43 ders mevcut kalıpla fırınlanacak ve 2.6'daki dil sorunları bu derslere aynen taşınacak.

**Kod değişiklikleri**

- `lib/junior/content-source.ts`: yeni `juniorBakeCandidateLessons(slug)`. Yazılmış, kab olmayan ve sesi fırınlanmamış dersleri döndürür. Raf fonksiyonu `juniorSealedCourseLessons` değişmedi.
- `scripts/bake-junior-pilot-tts.ts`:
  - `COURSE_LESSONS` artık `juniorBakeCandidateLessons` kullanıyor.
  - Varsayılan pilot yolu (`--course` ve `--matrix` yoksa) yalnızca fırınlanmamış pilot derslerini alıyor. Bugün beş pilot dersinin hepsi fırınlı; bu yol boş dönüyor ve betik durur.
  - `--key=` ile fırınlı bir ders istenirse açık bir hata verilir.
  - Ana akışta, seçilen dersler arasında fırınlı bir ders varsa ya da kapsam boşsa betik durur.

**Doğrulama (salt okunur)**

- Aday havuz tam 43 dersi içeriyor: matematik 26–38, fen 21–38, İngilizce 2, 4, 6, 9, 10, 11, sosyal 21–26. Beklenen listeyle birebir eşleşiyor.
- Adayların içinde fırınlı ders yok. Raf toplamı 68, değişmedi.
- `npm run verify:junior-content`: çıkış kodu 0. 111 senaryo, 13 kab, takvim planla aynı.
- Lint: `lib/junior/content-source.ts` ve `scripts/bake-junior-pilot-tts.ts` için hata yok.

**Yapılmayanlar**

- Gerçek `--dry-run` kullanıcı onayıyla sonradan çalıştırıldı (bkz. Dry-run sonucu). Gemini çağrısı, MP3 ve manifest yazımı yok.
- Omurga kalıbı değişmedi. Neden: `storySpine` 111 dersin tamamında aynı fonksiyonla üretiliyor ve 60 fırınlı dersin MP3'ü bu eski metinden. "Yalnız yeni 43" için iki yol var: her dersin kaynağına bir sürüm işaretçisi konur ve fırınlı 60 ders eski kalıpta kalır; ya da 60 ders yeniden fırınlanır. Runtime'da `juniorLessonHasBakedAudio` ile seçim yapılırsa, 43 ders fırınlandığı anda metni değişir ve ses ile metin uyuşmaz.

---

## Dry-run sonucu (havuz düzeltmesinden sonra)

**Hüküm: dry-run yeşil.** 43 aday dersin fişi, metin düzeltmelerinden sonra yenilendi ve güncel. Fırınlı 68 derse dokunulmadı. Gemini çağrısı, MP3 veya manifest yazılmadı. Gerçek sentez için açık `API Harcama Onayı` beklenir.

Kullanıcı "Evet, çalıştır (yalnız 43 JSON fiş; önerilen)" onayını verdi. `--dry-run` dört kurs için ayrı çalıştırıldı. Yazılan tek şey `media-bake/junior/dry-run-receipts/` altındaki JSON fişleri. Metin düzeltmelerinden sonra aynı koşu tekrarlandı (kullanıcı kararı: düzelt, fişleri yenile, dry-run'ı tekrarla). Aşağıdaki tablo son koşuya aittir; iki koşu da çıkış kodu 0 verdi.

### Koşular

| Kurs | Ders | Çıkış kodu | Çıktı |
|---|---:|---:|---|
| `jr_06_mat` | 13 | 0 | Dry-run bitti. API yok. |
| `jr_06_fen` | 18 | 0 | Dry-run bitti. API yok. |
| `jr_06_ing_main` | 6 | 0 | Dry-run bitti. API yok. |
| `jr_06_sosyal` | 6 | 0 | Dry-run bitti. API yok. |

### Fiş sayımı

| Ölçüt | Sonuç |
|---|---|
| Aday fişleri, güncel | 43/43 |
| Kontrol edilen alanlar | şema sürümü 3, model, katalog ses modu ve sesi, ses istemi gönderilmedi, istem karması, metin karması (`textHash`), tek istek, verbatim transkript |
| Fırınlı 68 dersin fişi | Değişmedi. Hepsi güncel değil: 0/68 (sürüm, ses ve metin karması uymuyor) |
| Fiş toplamı | 142 = 68 fırınlı + 43 aday + 31 yazarlık dışı |
| Koşu öncesi fiş | 105 = 68 fırınlı + 6 eski İngilizce + 31 yazarlık dışı |
| Koşudaki değişim | 6 İngilizce fişi yenilendi; 37 yeni dosya (mat 13, fen 18, sosyal 6). 105 + 37 = 142 |

### Ses dosyası ve manifest

| Kalem | Sayı | Not |
|---|---:|---|
| MP3 (`public/media/junior/audio`) | 106 | 68 manifestte, 38 manifest dışı |
| Bu koşuda yazılan MP3 | 0 | |
| Manifest | Değişmedi | Son yazma 11 Ekim 15:02, koşudan önce |
| Manifest dışı: arka plan müziği | 1 | `bgm-light-learning`. Ders sesi değil |
| Manifest dışı: yazarlık dışı anahtarlar | 31 | mat 12, fen 11, ing 6, sosyal 2. Fişleri de var. Yazılma tarihleri 7–11 Ekim |
| Manifest dışı: aday anahtarlar | 6 | `jr_06_ing_main-2`, `-4`, `-6`, `-9`, `-10`, `-11`. Yetim |

**`jr_06_mat-1` ayrı bir kayıt.** Bu MP3, koşudan önce, 11 Ekim 00:49'da başka bir sohbette (`55a01b40-6d83-44c3-bf78-027b64213ff6`) kullanıcının açık isteğiyle gerçek sentezle üretildi: tek Gemini çağrısı, Puck sesi, 279,8 sn. WAV ara dosyası `media-bake/junior/audio/jr_06_mat-1.wav` (26,8 MB) duruyor. MP3 manifestte değil. Bu oturum bu dosyaya dokunmadı.

**Yetim İngilizce MP3'leri: yedeklendi.** `jr_06_ing_main-2`, `-4`, `-6`, `-9`, `-10`, `-11` için diskte MP3 var, manifestte yok. Kullanıcı kararıyla `media-bake/junior/yetim-yedek/` altına kopyalandı (6 dosya, SHA-256 eşleşti). Fırın mevcut MP3'ü atlamaz; gerçek sentez bu dosyaların üzerine yazacak. Bu dosyaların içeriği bu raporda denetlenmedi.

**Yazarlık dışı 31 anahtar.** Ne fırın adayı ne de rafta. Bu koşuda dokunulmadı. Silinip silinmeyeceği ayrı bir karar.

### Metin düzeltmeleri (kullanıcı kararı: düzelt)

Düzeltmeler kaynak dosyalarda yapıldı (`lib/junior/content/`), ardından `export:junior-content` ile paket JSON'una aktarıldı. Değişen paket dosyası üç tane: `topics/jr_06_mat-26.json`, `topics/jr_06_mat-38.json`, `topics/jr_06_sosyal-23.json`. Teaser ve veli notu seslendirilmediği için değiştirilmedi.

| Ders | Düzeltme | Kelime / karakter, önce | Kelime / karakter, sonra |
|---|---|---:|---:|
| `jr_06_mat-26` | `1/2`, `1/3`, `1/3'ten` → bir bölü iki, bir bölü üç, bir bölü üçten (kavram, uyarı, ses mührü) | 568 / 3767 | 560 / 3663 |
| `jr_06_mat-38` | `5/20`, `1/4`, `15/20` → yirmide beş, dörtte bir, yirmide on beş (kavram, örnek, uyarı, hayat, ses mührü) | 528 / 3659 | 537 / 3715 |
| `jr_06_sosyal-23` | `VII.`, `XIII.`, `VII–XIII` → yedinci, on üçüncü (karşılama, kavram, özet) | 531 / 3744 | 520 / 3647 |

Öğretmen tanıtımı: `juniorTeacherSelfIntro` (`lib/junior/voice.ts`) artık büyük harfli `Ben` ile başlıyor. 43 adayın tamamında bu tanıtım var. Ses dosyası değişmez: büyük harf seslendirmeyi değiştirmez, yalnızca fırınlı 68 dersin altyazısında `ben` yerine `Ben` görünür. Test beklentisi `tests/kernel/junior-lesson-chain.test.ts` içinde güncellendi.

Doğrulama:

- Seslendirilen metinde (`listenText`) eğik çizgi, Romen rakamı ve en dash kalmadı; üç dersin üçünde de sıfır riskli karakter.
- `npm run verify:junior-content` çıkış 0. `npm run verify:junior-speech` çıkış 0.
- Testler: `junior-lesson-chain`, `junior-lesson-route-audio` ve `junior-meb-calendar` geçti (20 test). `junior-player-clock` yüklenemedi: `scene-media.ts` A grubunda 20 plaka sayıyor, test 21 bekliyor. Bu hata metin değişikliklerinden bağımsız; `scene-media.ts` 11 Ekim 15:42'de değişmiş ve bu turda dokunulmamıştır. Düzeltilmedi.
- Dışa aktarımdan önce paket 258 dosya olarak kaydedildi; sonra yalnızca üç topics JSON'u değişti.
- Dışa aktarım, otomatik inceleme tarafından ilk denemede durduruldu; onay akışıyla çalıştırıldı.
- Fişler: yeniden koşudan sonra 43/43 güncel, 99 eski fiş değişmedi. MP3 sayısı 106 ve hiçbiri değişmedi; manifest aynı.

### Sınırlar

- 2.3 tablosundaki kelime ve karakter sayıları düzeltme öncesi metinle 43/43 eşleşti. Düzeltilen üç ders yukarıda yeni değerleriyle verildi. Yeni koşunun ekranda gösterdiği mat-38 satırı (537 kelime, 3715 karakter) aynı yöntemle hesaplanan değerle uyuştu.
- Gerçek süreler hâlâ tahmin: saat tahmini 12 karakter/sn varsayar; gerçek süre MP3 bayt boyutundan kalibre edildi. Yeni 43 dersin gerçek süresi yalnızca sentezden sonra kesinleşir.

### Sonraki kapı

- Gerçek sentez için açık `API Harcama Onayı` gerekir ve kurs kurs yapılır. Ders başına en fazla 3 düdük; kurs başına en kötü hal: fen 54, matematik 39, İngilizce 18, sosyal 18.
- Açık karar kalmadı. Yetim İngilizce MP3'leri yedekte; sentez bunların üzerine yazacak. Metin ve `ben` düzeltmeleri uygulandı. Bu derslerde yeni bir metin değişikliği olursa dry-run tekrarlanır.
- Kabul edilen risk: 43 ders mevcut omurga kalıbıyla fırınlanır (2.6). Sonradan değişirse fırınlı 60 ders ve 43 fiş etkilenir.
- Sentez sonrası: manifest, yüz senkronu ve `npm run verify:junior-content`.
