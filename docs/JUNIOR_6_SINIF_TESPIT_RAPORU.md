# Junior 6. Sınıf — Altyapı, Temizlik ve Pedagojik Mimari Tespiti

Tarih: 9 Ekim 2026  
Kapsam: Depodaki kod ve kılavuz belgeler. Canlı veritabanı, Vercel ortam değişkenleri, PayTR ve tarayıcıda ders oynatma bu turda denenmedi.

Bu rapor üç şeyi ayırır: modelin **tanımlı** olması, fırın betiğinin onu **çağırabilmesi**, dinleme anında o çağrının **açık olması**. Junior’da üçüncüsü kapalıdır. Çocuk dersi dinlerken dış ses, görsel ve müzik servisi çağrılmaz.

---

## 1. Mevcut Durum Özeti (6. Sınıf ve Super Admin Yetkileri)

### Ders verisi nerede?

6. sınıf metni veritabanında ve JSON dosyasında durmuyor. Tek ev TypeScript senaryosudur.

| Ne | Nerede | Durum |
| --- | --- | --- |
| Senaryo şekli | `lib/junior/scenario.ts` (`JuniorLessonScenario`) | Karşılama, kavram, örnek, uyarı, günlük kullanım, üç maddelik özet, veli notu |
| Çekirdek dersler | `lib/junior/content/{mat,fen,turkce,ing,sosyal}/` | Dosya başına bir konu. Katalog `lib/junior/catalog.ts` |
| Seçmeli taslak | `lib/junior/elective-catalog.ts` | Altı ders, her birinde iki konu. `band: "draft"` |
| Konu testi | `lib/junior/quiz/{mat,fen,turkce,ing,sosyal}/` | Çekirdek konularda paket var. Seçmelide yok |
| Raf ve kilit | `lib/junior/limits.ts`, `lib/junior/catalog.ts` | Pilot sınıf yalnız 6. Başka sınıfın metni yok |
| Çocuk kaydı | `prisma/schema/junior.prisma` | Profil, veli rızası, ilerleme notu, oyun puanı, yıllık paket |
| Yayın sesi | `public/media/junior/audio/` ve `lib/junior/voice.ts` | Çekirdek anahtarlar listede. Dinleme yerel MP3 |
| Isınma kaseti | `lib/junior/warmup.ts` | Beş çekirdek ders için birer kısa MP4. Seçmelide kaset yok |
| Sahne | `lib/junior/types.ts` içindeki `JUNIOR_VECTOR_SCENES` | Ders içi görsel SVG kimliği |

Çekirdek raf:

| Kod | Slug | Konu sayısı |
| --- | --- | --- |
| JR-06-MAT | `jr_06_mat` | 25 |
| JR-06-FEN | `jr_06_fen` | 20 |
| JR-06-TUR | `jr_06_turkce` | 20 |
| JR-06-ING-ANA | `jr_06_ing_main` | 20 |
| JR-06-SOS | `jr_06_sosyal` | 20 |

Toplam 105 çekirdek konu. Her kartın ilk konusu ücretsizdir. Sonrakiler kilitlidir.

Seçmeli raf (`jr_06_ing`, `jr_06_alm`, `jr_06_fra`, `jr_06_siyer`, `jr_06_kod`, `jr_06_arp`) çekirdek ders değildir. Mühür (`lib/junior/production-seal.ts`) metin bandı, fırınlanmış ses, ısınma kaseti, en az üç doğrulanmış soru ve atanmış SVG sahnesi ister. Seçmeli konular bu kapıdan geçmez; kartta hazırlık rozeti düşer.

Veritabanı ders cümlesini tutmaz. `JuniorProgress` övgü, eksik ve öğüt yazar. Ses kolonu yoktur. Şema başlığı bunu açık söyler: anlatış bitince yalnız yazı kalır.

Konu testinde örnek paketler üç soru taşır (`q1`, `q2`, `q3`). Mühür alt sınırı da üçtür (`JUNIOR_QUIZ_MIN_ITEMS`). On soruluk bir arşiv kodda yoktur.

### Super Admin neyi açar, neyi açmaz?

`yapinet360@gmail.com` kodda yerleşik süper yönetici kutusudur (`lib/kernel/auth/super-admin.ts`, `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT`).

Açılan kapı:

- E-posta doğrulanmışsa bu kutu admin sayılır. Üretimde `SUPER_ADMIN_USER_ID` bu kutuyu kapatmaz.
- Başka bir adres üretimde iki kilit ister: `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID`, artı doğrulanmış oturum. Biri boşsa o adres admin değildir.
- `yetkin.vision@gmail.com` listeye yazılsa da admin olamaz.
- Junior’da `isJuniorAuditActor` (`lib/kernel/security/junior-gate.ts`) bu kutuyu tanır. Kilitli konu, anlatış ve konu testi denetim yoluyla açılır. Abonelik satırı yazılmaz.
- Yetişkin Akademi’de doğrulanmış süper yönetici, satın alma satırı olmadan ders izleyebilir (`lib/academy/access.ts`). Katalog yazma ve yayın kapısı da aynı aktörü okur.

Açılmayan kapı:

- Kasa. `JUNIOR_CHECKOUT_OPEN` dolu ve açık değilse ödeme `503` kalır. Süper yönetici de kasayı açmaz.
- Ders metnini panelden düzenlemek. 6. sınıf cümlesi git dosyasıdır. Yönetici arayüzü bu dosyaları yazmaz.
- Postgres süper kullanıcısı veya rol tablosu. Yetki ortam değişkeni ve doğrulanmış oturumdur.
- İkinci yönetici. Kırılma anında yedek hesap kodda yoktur.
- Canlı hesabın gerçekten doğrulanmış olduğu. Bu depodan okunamaz.

Kısa hüküm: tam yetki tanımlı değildir. Denetim yolu tanımlıdır. Para ve içerik yazarlığı ayrıdır.

---

## 2. CEO Mühür Haritası Uyum ve Eksik Listesi

İstenen harita ile koddaki kilitli harita (`lib/kernel/ai/model-roles.ts`, `ACADEMY_SEALED_MEDIA_MODEL`) yan yana:

| Katman | İstenen | Kodda tanımlı mı? | Junior bunu kullanıyor mu? |
| --- | --- | --- | --- |
| Metin senaryo | `gemini-3.8-flash` | Evet. Rol `TEXT_GEN` | Hayır. 105 konu elde yazılmış TypeScript. `lib/junior` bu modeli çağırmaz |
| Ses | `gemini-3.8-flash-tts` | Evet. Rol `VOICE_TTS` | Fırın betiği çağırır (`scripts/bake-junior-pilot-tts.ts`). Dinleme anında çağrı yoktur. Liste dışı konuda tarayıcı konuşması yedek kalır |
| Fon müziği | `lyria-3.5` | Evet. Rol `MUSIC_GEN` | Fırın betiği çağırır (`scripts/bake-junior-bgm-light-learning.ts`). Dinleme `bgm-light-learning.mp3` dosyasını çalar. Harcama onayı olmadan Lyria açılmaz |
| Ders içi görsel | Dinamik React / SVG | Ayrı model kimliği yok. Bu bir kod sahnesidir | Evet. `JUNIOR_VECTOR_SCENES` ve vektör oynatıcı |
| Kapak | Nano Banana 2 Lite | Hayır. Bu ad haritada yok | Hayır. Kapak `components/junior/lesson-covers.tsx` içinde SVG |

Görsel kimliği kodda `gemini-3.1-flash-image` dir. Yorum satırı bunu Nano Banana 2 diye anar. Lite eki yoktur. Bu kimlik yetişkin sinema kartı içindir. Junior sahnesine ve kapağına bağlanmamıştır.

Hazır olan altyapı:

- Kimlik tek nesnede. Yanlış kimlik `assertAcademySealedMediaModel` ile durur. Alt model seçilmez.
- Ses fırını Google istemcisini, branş öğretmenini ve `JUNIOR_BAKE_ATEMPO` (0,94) katsayısını okur. Ders başına bir istek.
- Müzik fırını aynı `MUSIC_GEN` kimliğini okur. `--seal` ve `--confirm-gemini-spend` olmadan dış çağrı açılmaz.
- Dinleme bayrağı `JUNIOR_MEDIA_CALLS_EXTERNAL_API = false`.

Eksik veya çelişen noktalar:

1. Junior senaryosu `TEXT_GEN` borusuna bağlı değil. Model tanımlı, 6. sınıf metin hattı değil.
2. Kilitli üretim belgesi metin için iki ad söyler: `gemini-3.8-flash` veya Claude Sonnet 5.5 (`.system_docs/AKADEMI_URETIM_ANAYASASI.md`). Kod yalnız Gemini kimliğini kilitler. Belgedeki “veya” fail-closed kuralıyla çelişir.
3. Aynı belgenin şema kutusunda görsel `gemini-3.1-flash` yazıyor. Kod kimliği `gemini-3.1-flash-image`. Kısa ad kayması var.
4. Nano Banana 2 Lite diye ikinci bir görsel kimliği açmak haritayı böler. Kapak politikası ürün kararıdır: SVG kalsın, ya da mevcut `IMAGE_GEN` ile ayrıca fırınlansın.
5. Çekirdek ses listesi 105 anahtarı sayar. Dosyanın diskte bozuk veya eksik olup olmadığı bu turda dinlenmedi. Liste, dosyanın kendisi değildir.
6. Seçmeli derslerde fırınlanmış ses, ısınma kaseti ve soru arşivi yoktur. Oynatıcı orada tarayıcı konuşmasına düşer.

Branş sesleri (`lib/junior/voice.ts`): Matematik Selim (Charon), Fen Deniz (Leda), Türkçe Elif (Aoede), İngilizce Selin (Kore), Sosyal Murat (Achird). Seçmeli öğretmen Ada (Enceladus). Yetişkin kuralı “bir eğitim kodu bir ses” bu haritanın yerine yazılmaz. Bu ayrım Pedagoji Ek-J’de doğrudur.

---

## 3. Temizlenecek / Atıl Dosya ve Kod Listesi

Silme emri değildir. Çift ev ve ölü kopya listesidir. `archived/` kasıtlı müzedir; canlı davranış için okunmaz. Yine de aynı isimli ikinci Junior orada durduğu için karışıklık üretir.

### Müze kopyası (canlı değil)

`archived/` altında eski Junior yüzeyi duruyor: `archived/app/junior/`, `archived/lib/junior/` (`runtime.ts`, `prisma-store.ts`, `meb-catalog.ts`, `age-gate.ts`), `archived/components/junior/`, `archived/prisma/schema/junior.prisma`, `archived/lib/copy/sen-voice/junior.ts`. Canlı ev `app/junior/`, `lib/junior/`, `prisma/schema/junior.prisma` dir. İki şema yan yana durunca yanlış dosya düzenlenir.

### Belge yığını

Aynı tespitin eski kopyaları:

- `docs/junior_6_sinif_tespit_raporu.md`
- `docs/3.junior_6_sinif_tespit_raporu.md`
- `docs/junior_6_sinif_tedavi_raporu.md`
- `docs/4.junior_6_sinif_tedavi_raporu.md`
- `docs/1.TESPIT_RAPORU.md`, `docs/2.TEDAVI_RAPORU.md` ve tarihli `docs/26*.md` raporları

Windows’ta büyük-küçük harf aynı dosyadır. Bu raporun yolu (`JUNIOR_6_SINIF_TESPIT_RAPORU.md`) eski `junior_6_sinif_tespit_raporu.md` ile aynı kayıttır. İkinci bir dosya açılmaz.

### Kodda çift yol

| Çift | Ne yapıyor | Risk |
| --- | --- | --- |
| Fırınlanmış MP3 ve tarayıcı konuşması | `components/junior/player/use-junior-playback.ts` listede MP3 çalar, yoksa `speechSynthesis` | Seçmeli ve liste dışı konuda ses, öğretmen karakteri değildir |
| Seçmeli kaynak dili ve çalışma dili | `elective-catalog.ts` hâlâ “Sevgili çocuklar” ve “siz” taşır. `toJuniorSen` sonradan eker | Kaynak ile çocuğun duyduğu cümle farklıdır. Ek, “Deniz” dışında `eniz` hecesini keser |
| Ders dizini | `lib/junior/content/*/index.ts` her dersi hem dışa aktarır hem yeniden içeri alır | İkinci bağ. Derleyici için zararsız, okuyan için şişirme |
| Junior hop listesi | `lib/dronlar/kayit.ts` Junior satırında `hops: []` | Oda kayıtlı, sözleşme boş. Mobil istemci bu odayı konuşamaz |
| Metin modeli | Üretim belgesi Gemini veya Claude der. Kod yalnız `gemini-3.8-flash` | İki yetkili ad, bir kilit |

`public/media/junior/audio/` atıl değildir. Ürün sesidir. Boyutu bağlam şişirir; silinmez. Okuma, fırın betiği ve `JUNIOR_BAKED_AUDIO_KEYS` üzerinden yapılır.

---

## 4. Pedagojik Dil ve Ton Analizi

### Sıcak öğretmen var mı?

Çekirdek çerçeve sıcak ve tek kişiye konuşur. Kuru robot dili çekirdek kural değildir.

Kanıt:

- Hitap `sen` dir (`JUNIOR_TEACHER_ADDRESS`). “Siz” ders gövdesine girmez. Veli notu ve sözleşme bu kuralın dışındadır.
- Soğuk “Selam!” girişi yasaktır. Açılış listesi `JUNIOR_WARM_OPENINGS` içindedir.
- Öğretmen kendini tanıtır: “ben Matematik öğretmenin Selim” gibi (`sealJuniorTeacherIntro`).
- Yönlendirme iki kalıptır: “Bak burası senin için çok önemli” ve “Şurası aklında kalsın tamam mı”. Ardında cümle varsa iki nokta ile bağlanır.
- Uyarı korkutmaz. Kutu ya “Tuzaklara Düşme!” ya “Altın İpucu!” dur. “Sınavda vururlar”, “şok olursun”, “sakın unutma” gövdeye giremez.
- Kapanış cesaret verir: “Aferin sana! Şimdi sıra sende.”
- Örnek konu (`lib/junior/content/mat/1.ts`) Lego kulesiyle başlar. Taban ve üs, ev işine bağlanır. Veli notu ayrı cümledir, çocuğun metninin kopyası değildir.
- Değerlendirme üslubu üç yaş bandına ayrılır (`lib/junior/persona.ts`). 6. sınıf 10-12 bandındadır: önce doğru parça, sonra küçük adım. Üç üslup aynı anlatışa yazılmaz.

Bu, özel öğretmen sıcaklığına yakındır. Diyalog değildir. Çocuk konuşunca sistem serbest sohbet açmaz. Yanıt o dersin kazanımına bağlıdır.

### Kalıptan çıkmış hitap var mı?

Tanımlı mekanizma var. Doğal çeşitlilik yok.

- Açılış, ders anahtarının harf toplamına göre kapalı bir listeden seçilir (`juniorWarmOpening`). Çocuk bunu “bugün bana özel” diye duymaz. Aynı kalıp ailesi döner: “Merhaba güzel arkadaşım”, “Hoş geldin”, “Günün güzel geçiyordur umarım”.
- Profildeki rumuz ders cümlesine girmez. Rumuz yalnız profil düğmesinde ve haftalık raporda durur (`components/junior/profile-switcher.tsx`, `weekly-report.tsx`). Öğretmen çocuğun adını söylemez.
- Seçmeli kaynak hâlâ sınıf hitabıdır: “Sevgili çocuklar merhaba! Bugünkü dersimizde…”. Çalışma anında bu cümle makineyle “sen”e çevrilir. Çeviri sıcaklık üretmez. Kaynak soğuk kalır.
- İki yönlendirme kalıbı bütün konulara yeter denmiş. Az ve net olması iyidir. Her konuda aynı iki cümle, ev sıcaklığını taklit eder.

Hüküm: çekirdek metin şefkatli ve sen dilindedir. Hitap mekanizması bir liste ve bir harf toplamıdır. Çocuğun adını, o günkü halini veya önceki konuda takıldığı yeri açılışa taşımaz.

---

## 5. Kılavuz Dokümanların Eleştirisi ve Revize Önerileri

Okunan evler: `.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, `.system_docs/PEDAGOJI.md`, `.system_docs/AKADEMI_URETIM_ANAYASASI.md`, kök `.cursorrules`.

### Ne işe yarıyor?

- Anayasa A katmanı (para birimi, ödeme kuruluşu olmadığımız, satın alınamayan kanıt) kısa ve yerinde. Bunlar kodda da kilitli.
- B6, Junior’ı Akademi’nin iç kanalı olmaktan çıkarıyor. Kapıyı ikinci kez yazmıyor. Bu doğru.
- Pedagoji Ek-J, yetişkin ofis üslubunu (Deniz usta, tezgâh) çocuk dersine taşımayı yasaklıyor. Yaş bandı, veli hesabı, sesin saklanmaması ve sen hitabı burada net.
- Manifesto Ek-J kısa. Alıcı veli, kullanan öğrenci. Ayrıntıyı Pedagoji’ye bırakıyor.
- Model kimliğinin çalışma evi `model-roles.ts`. Ajanın haritayı eski modele çekmesi yasak. Bu kilit, kimlik kaymasını önler.

### Neresi hantallaşıyor veya çelişiyor?

1. **“Burada tekrarlanmaz” cümlesi ikinci ev oldu.** Anayasa, Pedagoji ve Manifesto aynı kapıyı “bu madde yazmaz” diyerek yeniden tarif ediyor. Okuyan üç dosyayı birden açmak zorunda. Tek cümlelik işaret yeterliydi. Paragraf işaret, işaretin kendisi kopya oldu.

2. **Metin modelinde iki yetkili ad var.** Üretim anayasası `TEXT_GEN` için Gemini 3.8 Flash veya Claude Sonnet 5.5 diyor. Kod birini kilitliyor. Şema kutusu da “Sonnet 5.5” diye kısaltıyor. Fail-closed ile “veya” aynı masada duramaz. Bir ad kalmalı. Denetim (Cursor / Grok) ayrı satır olarak kalsın. O satır üretim modeli değildir.

3. **Yetişkin beş katman, Junior’ın kendi mührü.** Yetişkin kapı metin, ses, yerel ısınma videosu, görsel model, müzik. Junior kapı metin, ses, ortak ısınma kaseti, üç soru, SVG sahne. İkisi de doğru olabilir. Belgeler bunu iki ürün gibi yazmıyor. Okuyan Junior kapağına Nano Banana, Junior metnine 600 kelime tabanı arıyor. 6. sınıf bu tabana bağlı değil ve bağlanmamalı.

4. **Görsel ad kayması.** Tablo `gemini-3.1-flash-image` / Nano Banana 2. Şema kutusu `gemini-3.1-flash`. CEO dilindeki Lite eki hiçbir belgede yok. Harita silinmeden kutu, tabloya çekilmeli.

5. **Yaş vaadi ile raf uyuşmuyor.** Pedagoji 5–12, 8 ve lise üslubunu tarif ediyor. Kod yalnız 6. sınıf metnini taşıyor. Sınıf seçici diğerlerini “yakında” diye kapatıyor. Üslup hazır, müfredat yok. Belge, pilotu “6. sınıf var, diğer üsluplar değerlendirme cümlesi içindir, ders metni yoktur” diye tek satırda kilitlemeli.

6. **Eski mimari ad hâlâ yaşıyor.** Anayasa B1 doğru adı yazıyor: Pragmatik Monolit, ince sözleşme paketi `@yetkin/kernel`, tek native istemci. “Amiral Gemi + Sürü Dron” eski takma ad diye dipnotta duruyor. Dipnot, insanların hâlâ o adla soru sormasını besliyor. Karşılık tablosu bir kez kalsın. Yeni cümle o adı kullanmasın.

7. **`.cursorrules` tarama yasağı ile belge hacmi çelişiyor.** Ajanın arşive, müzeye ve medyaya girmemesi doğru. Aynı dosya model haritasını da kilitliyor ve her uyumsuzlukta belgeyi değil kodu değiştirmeyi emrediyor. Belge ile kod çatışırsa (madde 2 ve 4) bu emir belgeyi düzeltmeyi engelliyor. Kural şöyle daralmalı: kimlik dizesi silinmez ve eski modele düşmez. Yazım kayması ve “veya” çelişkisi belgede düzelir. Kod, düzelmiş haritaya çekilir.

### Nasıl güncellerdim?

- Üretim anayasasının metin satırını tek kimliğe indirirdim: `gemini-3.8-flash`. Claude satırını “denetim ajanı”ndan ayırırdım.
- Şema kutusundaki görsel adını `gemini-3.1-flash-image` yapardım. Lite yazmazdım.
- Pedagoji Ek-J’ye bir cümle eklerdim: açılış listesi kalıptır. Çocuğun rumuzu ders sesine girmez. Bu bir eksiktir, kural değildir.
- Anayasa B6’ya bir cümle eklerdim: Junior içeriği kod dosyasıdır. Süper yönetici denetler, metni panelden yazmaz, kasayı açmaz.
- “Bu madde tekrarlamaz” paragraflarını dosya yoluna indirirdim. Yol kalsın, tarif gitsin.
- Model kimliği cümlelerini belgelerden silmezdim. Silmek, kilitli haritayı bozar.

---

## 6. Sen Olsaydın Ne Yapardın? Görüş, Öneriler ve Master Plan

### Mimari bugün ne kadar uygun?

Canlı ad Anayasa B1’dedir. Gövde bu Next.js uygulamasıdır (`app/`, `lib/`). İnce paket `@yetkin/kernel` para, katalog kimliği ve v1 zarfını taşır. Prisma ve ders metnini taşımaz. Tek native istemci `apps/rail-is` dir. Ayrı veritabanı ve ayrı kimlik yoktur.

“Sürü Dron” bugün ayrı uygulama değildir. `lib/dronlar/kayit.ts` içindeki bir oda kaydıdır. Junior orada müstakil odadır, yolu `/junior`, kamu vitrini dörtlüsüne yazılmaz. Akademi ders defteri Junior kartını reddeder (`packages/kernel` kurs kaydı). Bu ayrım doğrudur. Çocuk dersi yetişkin vizeye karışmaz.

Dikey mobil uygulamaya bölünürken tıkanacak yerler:

1. **Junior’ın v1 hop’u yok.** Kayıt satırında `hops: []`. Native istemci `/api/v1` zarfını konuşur. Junior API’si `/api/junior-pilot/*` altındadır ve o zarfın sicilinde değildir. `apps/rail-is` kaynak kodunda Junior geçmez. İlk mobil Junior istemcisi bugün bağlanacak bir sözleşme bulamaz.

2. **Ders gövdesi sunucuya gömülü.** 105 senaryo derleme anında içeri alınır. İstemci “6. sınıf matematik 12. konu” diye bir içerik adresinden okuyamaz. Her metin değişikliği web derlemesi ister. Dikey uygulama kendi içeriğini kopyalamak zorunda kalır. Kopya, tekilliği bozar.

3. **Ses dosyası kamuya açık statik yoldur.** `/media/junior/audio/{anahtar}.mp3`. İmza, süre ve cihaz kotası yoktur. Küçük pilotta bu sadedir. Ayrı uygulama mağazasına çıkınca aynı dosya ya herkese açık kalır ya da her istemci kendi kopyasını taşır.

4. **Kapı çekirdekte, içerik dikeyde.** `canEnterJunior` `lib/kernel/security` içindedir. Metin `lib/junior` içindedir. Çekirdek, ders cümlesini import etmemek için erişimi dışarıdan parametre alır. Bu disiplin iyidir. İçerik hâlâ monolith derlemesine bağlı olduğu için disiplin, mobil sözleşmeye dönüşmemiştir.

5. **Tek veritabanı hem güç hem tıkaktır.** Profil, rıza ve paket aynı kimliktedir. Bölünmüş uygulama ayrı hesap açarsa veli rızası iki yerde durur. Aynı veritabanında kalırsa “dikey uygulama” yalnız kabuk olur. Kabuk doğrudur. Ayrı şirket, ayrı kasa, ayrı çocuk hesabı bu yapıda erken ve zararlıdır.

Hüküm: bugünkü kurgu “tek gövde, kayıtlı odalar, ince sözleşme”ye uygundur. “Her ders kendi mağaza uygulaması” kurgusuna uygun değildir. Tıkanma, oda sayısında değil, Junior’ın hop’suz ve dosyaya gömülü olmasındadır.

### Şimdi

Şimdi mükemmelleştirmek, yeni sınıf veya yeni model eklemek değildir.

1. Kapak kararını kilitle. SVG kalsın. Nano Banana 2 Lite kimliği açılmasın. İleride kapak gerekirse mevcut `IMAGE_GEN` ile fırınlansın, ad uydurulmasın.
2. Seçmeli kaynağı sen dilinde yeniden yaz. `toJuniorSen` yama olarak kalsın, yazarlık aracı olmasın. Taslak rozeti kalkmadan seçmeliyi çekirdek ders gibi gösterme.
3. Açılışa rumuzu bir kez bağla. Listeyi büyütme. “Merhaba {rumuz}” yeter. Rumuz yoksa bugünkü sıcak açılış kalsın.
4. Mühürlü çekirdek konuda tarayıcı konuşmasını kapat. Yedek, sessiz bir “ses hazır değil” satırı olsun. Çocuk robot sesi öğretmen sanmasın.
5. Junior için tek okuma hop’u aç: konu kartı, kilit kararı, ses yolu, sahne kimliği. Yazma (anlatış, test, profil) aynı zarfta ikinci hop olsun. İçerik hâlâ bu depoda kalsın. Ayrı servis açma.
6. Süper yönetici cümlesini B6’ya işle: denetler, kasayı açmaz, metni panelden yazmaz.
7. Üretim belgesindeki “Gemini veya Claude” satırını tek kimliğe indir. Şema kutusundaki kısa görsel adını düzelt. Haritayı silme.
8. Eski tespit kopyalarını arşiv notuna çevir veya tek raporda bırak. İkinci Junior şemasını (`archived/prisma/schema/junior.prisma`) canlı şema sanma.

### Bir sonraki aşama

1. 6. sınıf çekirdeğini satılabilir hale getir: kasa hukuk ve PayTR üçlüsü tamamlanınca açılır, öncesinde yeşil gösterilmez. Seçmeli ya mühürlenir ya raftan iner.
2. Konu testini üç soruda bırakmak bir ürün kararıdır. On soru isteniyorsa bu metin işidir, model işi değildir. Mühür alt sınırı ile vitrin vaadi aynı sayıda olmalıdır.
3. İçerik adresini hop’un arkasına al. Mobil kabuk o adresi okusun. Metin hâlâ tek depoda üretilsin. İkinci müfredat deposu açma.
4. Öğretmen, önceki anlatış notunu açılışta bir cümleyle hatırlasın. Bu, kalıp listesinden daha sıcak bir hitaptır. Serbest sohbet açılmaz. Kazanım dışına çıkılmaz.
5. 7. sınıf ancak 6. sınıfın tamamlanma ve anlatış verisi görüldükten sonra yazılır. Üslup bandı hazır diye müfredat varmış gibi davranma.
6. Dikey uygulama ancak aynı paket, aynı hop, aynı veritabanı ile doğar. Ayrı kimlik ve ayrı kasa, çocuk güvenliğini böler.

Baş mimar olarak ilk işim yeni model eklemek olmazdı. İlk işim çocuğun duyduğu sesi tek öğretmene bağlamak, kapağı SVG’de bırakmak ve Junior’ı mobilin okuyabileceği tek hop’a çıkarmak olurdu.
