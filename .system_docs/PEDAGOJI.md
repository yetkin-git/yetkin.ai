# PEDAGOJI.md — Eğitim felsefesi

Bu belge platformun kalıcı eğitim dilini ve Junior ekini tutar. Stüdyo üretim sırası, beş medya katmanı, görsel reji ve fırın disiplini `.system_docs/AKADEMI_URETIM_ANAYASASI.md` altındadır. Bu dosya o fabrikayı ikinci kez yazmaz.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Dil, SEN aksı, aforizma yasağı ve vatandaşın üç adımı burada durur. Model kimliğinin çalışma zamanı evi `lib/kernel/ai/model-roles.ts` dir. Satış kademesi Anayasa B3, mimari Anayasa B1, Junior kapısı Anayasa B6'dadır.

Mimari ad Anayasa B1'dir. Bu belge öğretme kuralını tutar. İkinci bir ürün mimarisi açmaz.

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
* **Kapanış duası ve bağlama uygun veda (Tek Açık Dil İlkesi):** Kapanış cümlesi kursun sahasına göre seçilir; ezbere slogan gibi her konuya yapıştırılmaz. Tezgâh ve mağaza senaryosu isteminde (`ACADEMY_LESSON_TEXT_SYSTEM_PROMPT` / `ACADEMY_LESSON_BENCH_CLOSING`) kapanış duası «Tezgâhın bereketli olsun. Satışın hayırlı gelsin.» dir. Genel ve ofis eğitimlerinde ise doğal insani veda («Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak.») kullanılır; bağlam dışı derse zorlama tezgâh sloganı taşınmaz.
* **Persona (dil ve üslup):** Tezgâh / Anlatıcı yapısı geneldir. Beş aşama, SEN dili ve bağlama uygun kapanış her kursun metin iskeletidir. Bu iskelet bir ses adı değildir. Deniz, bu iskeletin sicil adıdır (Zephyr). EC-102 anlatıcısı Deniz değildir.
* **Anlatıcı adı (ses):** Kursun `courseMasterVoice` değeridir. 1 Eğitim Kodu = 1 Ses. Ev `lib/academy/instructors.ts`. OFF-101 anlatıcısı Gözde (Callirrhoe), OFF-201 anlatıcısı Aylin (Kore), EC-102 anlatıcısı Kaan (Puck) dir. EC-102 selamı «Merhaba, ben Kaan», kart hitabı «Kaan Bey» dır. Cinsiyet erkektir. Bu kursta usta unvanı yoktur. Fırın modeli `lib/kernel/ai/model-roles.ts` içindeki `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` dir. Bu madde o modeli ve mührü değiştirmez.
* **Fonetik yazım:** Kaynak cümle sayıyı ve ölçüyü kelimeyle yazar (`iki adet`, `elliye yetmiş santimetre`). Ses bu kelimeyi okur. Ekran ve altyazı aynı ölçüyü rakamla basar (`2 adet`, `50x70 cm`). Kısaltmanın ses okunuşu `lib/academy/spoken-scripts/phonetics.ts` içindedir (`SEO` → `Seo`, `N11` → `En on bir`).

Her yeni ders metni şu beş aşamayla yazılır. Bu beşli, üretim anayasasındaki altı adımın (0–5) ve beş medya katmanının adı değildir. İstem `ACADEMY_LESSON_TEXT_SYSTEM_PROMPT` (`lib/academy/lesson-text-standard.ts`) içindedir. Bu paragraf o istemin ikinci kopyası değildir.

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

---

## Ek-J: Junior Pedagojisi ve Veli Modeli

Bu ek, yetişkin ofis dersinin kurallarını değiştirmez. Deniz usta, tezgâh duası ve ofis rejisi (§A.2.2, §A.4) yetişkin eğitimde durur. Junior okul dersidir. Başlangıç seviyesi değildir. Yetişkin başlangıcı Temel Paketlerdir (§A.3).

### Dinle ve Anlat

Çocuk dersi önce dinler. Sonra aynı konuyu kendi sözüyle anlatır. Anlatış seslidir. Mikrofon kapalıysa aynı anlatış yazıyla yapılır. Yazılı yol, sesli yolun yedeğidir. İkisi de aynı işi görür: çocuk konuyu kendi cümlesiyle söyler.

Yanıt, o dersin kazanımına bağlıdır. Serbest sohbet yoktur. Konu dışındaki söz geri çevrilir. Sistem emin değilse «emin değilim» der. Uydurma puan basılmaz.

Dinle ve Anlat öğretir. Sertifika, mühür ve kariyer vizesi vermez. Resmî sınav sunucuda puanlanır. Sesli anlatış bu kapının yerine geçmez.

### Oynatıcı

Web ders yüzeyi `resolveJuniorPlayback` (`lib/junior/pilot-engine/playback.ts`) kapısından açılır. Altyazı saati kilitli karaoke JSON'dur: oynatılan her ders `packages/junior-content/timelines/` altında `production: locked/ready` bir zaman çizelgesi taşır (çekirdek ve seçmeli ayrımı yoktur). Sayı burada yazılmaz; envanter `npm run verify:junior-content` ve `tsx scripts/verify-junior-visual-ops.ts` çıktısındadır. `JuniorPilotPlayer` kilitli zaman çizelgesi olan her dersi açar. Eski grafik tahta dosyaları (`mat-27.graph.ts`, `mat-30`–`mat-36`) oynatıcı yolu değildir; mühür betiğinin arşiv kaynağıdır. Aynı ders iki motorla açılmaz. Pilot konuşmasının yazarı `lib/junior/pilot-engine/mat-1.choreography.ts` (ve `mat-6.choreography.ts`) dir. Zaman damgası `packages/junior-content/timelines/jr_06_mat-1.timeline.json` bu yazardan türetilir; konuşma sapması `verify:junior-content` kapısında reddedilir. Taslak hece saati oynatıcı kaynağı değildir. Ders kartı, kazanım ve dışa aktarım `lib/junior/content` borusunda kalır. Süre bandı ve dört bölüm bu ekteki sözleşmedir. Pilot sahnesi o bandın yerine ikinci bir pedagoji yazmaz. Native istemci aynı dersi bu sahne grafiğiyle çizmez; hop sözleşmesi bu ekte ikinci kez yazılmaz.

Değerlendirme üslubu çocuğun yaş grubuna göre değişir. Sistem istemi, profildeki doğum yılından grubu okur. Üç üslup vardır. Biri seçilir. Üçü birden aynı anlatışa yazılmaz.

### Yaş grupları ve üslup

**10-12 yaş (5, 6 ve 7. sınıf).** Üslup merak uyandıran, sıcak, oyunlaştırması yüksek ve cesaretlendiricidir. Cümle kısa durur. Önce doğru söylenen parça görülür. Eksik nokta azar gibi gelmez. Küçük bir sonraki adım verilir.

**13-14 yaş (8. sınıf / LGS).** Üslup hedef odaklı, sınav stresini yöneten, stratejik ve ritmiktir. Adım sırayla söylenir. Acele ettirilmez. Sınav kaygısı, bilgi cümlesinin yerine geçmez. Eksik nokta bir strateji olarak söylenir.

**15-18 yaş (9, 10, 11 ve 12. sınıf).** Üslup analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudandır. Süslü övgü kurulmaz. Doğru, eksik ve sonraki adım ayrı cümlelerdir. Çocuk yerine konuşulmaz.

Pilot sınıf 6’dır. Sınıf seçici yalnız bu pilotu gösterir. 10-12 üslubu bu sınıfın değerlendirme sesidir. 13-14 ve 15-18 üslupları kodda persona bandı olarak durur; ikinci bir sınıfın dersi yazılmadan vitrin vaadi değildir. Dersin kazanımı değişmez. Değişen, değerlendirme cümlesinin sesidir.

### Veli modeli ve çocuk güvenliği

Hesap velinindir. Çocuk, veli hesabının altında bir profildir. Bu fazda çocuğa ayrı e-posta ve ayrı giriş açılmaz.

Kilitli konu, anlatış kaydı ve konu testi veli oturumu olmadan açılmaz. Çekirdek kartın tanımlı ilk konusu ve `/junior` listesi kamuya açıktır. İngilizce açılışı dosya sırasındaki 1. ders değil, `JUNIOR_FREE_OPENER_OVERRIDE` ile yazılan derstir. Kapı Anayasa B6 ve `canEnterJunior` içindedir.

Platform çocuk adına bakiye, harçlık veya kredi tutmaz. Oyun puanı para değildir. Parayla alınamaz. Paraya çevrilemez.

Çocuğun sesi saklanmaz. Değerlendirme bitince ses silinir. Kalan, yazıya dökülmüş metin ve öğretici nottur.

Çocuk başka kullanıcıya mesaj atamaz. Reklam yoktur. Parayla açılan ödül kutusu yoktur. Seri kaçırmak ceza doğurmaz.

Çocuğun adı ve okulu, herkese açık doğrulama sayfasında görünmez.

Çekirdek dersin ilk konusu ücretsizdir ve tam ders kalitesindedir. Kırpılmış tanıtım değildir. Seçmeli hazırlık rafı bu cümlenin dışındadır. Kapı ve erişim Anayasa B6 ve `canEnterJunior` içindedir. Bu ek o kapıyı yazmaz.

Okul kitabı metni kopyalanmaz. Kazanım anlatılır. Cümle özgün yazılır.

### Öğretmen hitabı

Öğretmen hibrit hitap kullanır. Kaset açılışı topluluğa söylenir: «Merhaba sevgili çocuklar!» veya «Merhaba çocuklar, hepiniz hoş geldiniz!». Konunun ayrıntısı, ipucu ve kilit nokta tek çocuğa söylenir: «Şimdi sevgili arkadaşım...», «İşte tam bu noktada dikkat etmen gereken kilit nokta...». Adım sonu birlikte kapanır: «Tebrikler çocuklar! Harika bir iş çıkardık.» Gövde ve mikrofon cümlesi sen dilinde kalır. Belge, sözleşme ve veli yazısı bu kuralın dışındadır; orada dil «siz» kalır (§A.2). Çerçeve `lib/junior/content-rules.ts` içindeki `JUNIOR_HYBRID_OPENINGS`, `JUNIOR_HYBRID_HINT_LEAD`, `JUNIOR_HYBRID_STEP_CLOSE`, `JUNIOR_TEACHER_ADDRESS` ve `JUNIOR_TELL_CLOSE` dur.

Soğuk «Selam!» girişi yasaktır. Profilde rumuz varsa açılış bir kez «Merhaba {rumuz}, bu konuya birlikte bakacağız.» der. Rumuz ders dosyasına yazılmaz. Çalışma zamanı yasağı `JUNIOR_CLICHE_PHRASES` listesidir (`lib/junior/content-rules.ts`): «bak burası çok önemli», «bak burası senin için çok önemli», «aferin sana», «şurası aklında kalsın». «Bugün seninle» mühürlü pilot açılışında durur ve bu listeye girmez. Yazılıda kullanılacak cümle «Pratik kural:» ile bağlanır. Mühür `JUNIOR_WARM_OPENINGS`, `JUNIOR_TEACHER_CUES`, `bindJuniorTeacherCue` ve `sealJuniorWarmWelcome` dir.

### Doyurucu konu

Ders kısa özet değildir. Her konu dört bölüm taşır: Kavram, Örnek, Kritik Uyarı ve Günlük Kullanım. Aynı paragraf üç alana kopyalanmaz. Ev `lib/junior/scenario.ts` ve `lib/junior/content-rules.ts` (`JUNIOR_LESSON_SECTIONS`). Ücretsiz ilk konu da bu dört bölümü tam taşır. Üçüncü bölümün çocuk yüzü aşağıdaki ipucu kutusudur.

Anlatım üç aşamada yürür: Giriş (Oryantasyon), Gelişme (Tam Anlatım), Sonuç (Özetleme). Günlük sahne Giriş’te merak uyandırır; Gelişme tanımı papağan gibi tekrar etmez; Sonuç «Bugün Neler Öğrendik?» kartıyla biter ve üç nokta taşır. Ev `JUNIOR_SCENARIO_STAGES` (`lib/junior/content-rules.ts`). Konuşma tabanı 3 dakikadır. Hedef ve tavan `lib/junior/player-clock.ts` içindeki `JUNIOR_NARRATION_AIM_MS` ve `JUNIOR_NARRATION_MAX_MS` değerleridir. Taban aynı dosyadaki `JUNIOR_NARRATION_MIN_MS` dir. Bu paragraf ikinci bir dakika bandı yazmaz. Mühür süresi ölçülmüş MP3 veya kilitli PCM'dir (`measuredJuniorNarrationMs`). Karakter saati yeşil mühür bırakmaz. 180 saniyenin altındaki ölçülmüş kaset süre açığıdır; kart «Kısa anlatım» der, oynatıcı kapanmaz. Bant, konunun kendi cümlelerinden ve ileri adımından dolar. Aynı örnek kalıp çerçevede ikinci kez okunmaz. Son adımda öğrenci iki yoldan birini seçer: mikrofona kendi cümlesiyle anlatmak ya da anlatımı 0:00 anından yeniden dinlemek. Oynatıcı karar kartı aynı saatin yanındadır.

### Gelişimsel İpucu Kutusu

**Gelişimsel İpucu Kutusu İlkesi:** Sınav ve test uyarıları asla baskıcı, korkutucu veya stres yaratıcı dille («sınavda vururlar», «şok olursun» vb.) yazılamaz. Tüm kritik uyarılar «💡 Dikkat Noktası» veya «⭐ Altın İpucu» başlıklarıyla sunulur. Yıldız ve ipucu zaman çubuğunda işaret olarak kalır; kaset bu işaretlerde kendiliğinden durmaz. Kart, çocuk işarete dokununca veya anlatımı kendisi durdurunca açılır. Kart «Anladım!» ile kapanır. Çocuk uyarılırken cesaretlendirilir ve merakı tetiklenir.

«Sakın unutma» ve «barajın altında kaldın» ders gövdesine ve konu testi cümlesine girmez. Eksik nokta bir sonraki küçük adım olarak söylenir. Başlık ya dikkat noktasıdır ya altın ipucudur. İkisi birden aynı uyarıya yazılmaz. Çerçeve `JUNIOR_HINT_BOX` ve `JUNIOR_HINT_BOX_PRINCIPLE` (`lib/junior/content-rules.ts`). Anlatım köprüsü `juniorHintCue` dir.

### Ses ve fon müziği

Anlatışın arka planında pedagojik fon müziği katmanı vardır. Katman vokalsizdir ve stereo kanaldadır. Kimlik `ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN` dir. Ev `lib/kernel/ai/model-roles.ts`. Bu ek o dizeyi tekrarlamaz. Örnekleme, kanal ve fırın yolu `lib/junior/voice.ts` içindeki `JUNIOR_BED_LAYER` dir. Sinüs üreticisi bu yatağı yazmaz.

Öğretmen sesi ders branşına göre ayrı karakterdir. Çağrı `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. Karakter haritası `JUNIOR_BRANCH_TEACHERS` içindedir. Yetişkin «1 Eğitim Kodu = 1 Ses» kuralı bu haritanın yerine yazılmaz. Dinleme anında dış TTS ve müzik çağrısı yoktur. Katman kimliği mühürler. Fırın, bu ek ve harcama onayı olmadan açılmaz.

İpucu kutusu açılınca yerel bir chime çalar. Çocuk kritik noktayı kavrayınca yerel bir alkış çalar. İkisi de dış API çağırmaz. Harita `JUNIOR_HINT_EFFECTS` (`lib/junior/voice.ts`). Oynatıcı bu haritayı okur. Efekt, öğretmen sesinin ve fon müziğinin yerine geçmez.

### Junior mühür

Yetişkin beş katman bu ekte gevşetilmez ve Junior’a taşınmaz. İki kapı aynı cümlede erimez.

| Kapı | Oda | Ne aranır |
|------|-----|-----------|
| `assertAcademyProductionSeal` | Yetişkin Akademi videosu | Metin, ses, yerel ısınma videosu, `IMAGE_GEN` görseli, dersin müzik yatağı |
| `assertJuniorProductionSeal` | Junior okul dersi | Metin bandı, fırınlanmış ses, kart başına ısınma, en az üç doğrulanmış soru, atanmış SVG sahne |

Junior görseli vektör sahnedir. `IMAGE_GEN` karesi bu mührün parçası değildir. Müzik tek paylaşılan yataktır; ders başına müzik dosyası aranmaz. Ses anahtarı listede durup ses klasörü makinede varken MP3 yoksa veya boşsa konu taze sayılmaz. Klasör dağıtımda yoksa (CDN) yokluk uydurulmaz. Süre tabanı ve «1 Eğitim Kodu = 1 Ses» yetişkin dersinde durur. Junior öğretmeni branş haritasındadır. O harita yetişkin standardın yerine yazılmaz. Sesin evi `lib/junior/voice.ts` dir. Mührün evi `lib/junior/production-seal.ts` dir.
