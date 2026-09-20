# PEDAGOJI.md — Eğitim felsefesi

Bu belge platformun **kalıcı eğitim felsefesini** tanımlar. Stüdyo milisaniyesi, gain, Veo süresi ve canlı model kimliği burada dogma değildir.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Canlı model kimliği kod SSOT’tadır (`lib/kernel/ai/model-roles.ts`). Bake SOP, gain, saniye ve CLI `docs/ops/akademi-bake-elkitabi.md` içindedir. Canlı kaset / sınav sayıları `docs/ops/DURUM.md` (uyumluluk aynası `docs/DURUM.md`) ve kod içindedir.

---

## A. TEMEL EĞİTİM FELSEFESİ

### 1. Somut ve Uygulamalı Anlatım ("Garsonu Göster") & Nedensellik Reformu

Soyut tanımlar, brifing tebliğleri ve altı boş sloganlar ("saniyeler içinde etkileyici", "muazzam dönüşüm", "vazgeçilmez ekip üyesi", "büyü burada başlıyor") KESİNLİKLE YASAKTIR. Kulakta duyulan işlem, gözde o somut uygulamadır.

* **Sebep → Eylem → Sonuç Zinciri:** Öğrenciye verilen her kuralın arkasındaki **"Neden?"** sorusu net bir şekilde cevaplanır (Örn: Neden A1 hücresi? Neden slayta düz metin doldurulmaz? Neden 3 maddelik yönetim özeti istenir? Neden dil modeli uydurur?).
* Anlatılan işlem ile görünen kare örtüşür; ses ile görsel ayrışmaz.
* «Ajan otonom bir döngüdür» demek yerine sipariş, araç, bellek ve teslim adımı masada çalışır.
* Her yayın SKU kendi iş dilini kullanır. Tek şablon her alana zorla dayatılmaz.

### 2. Aptala Anlatır Gibi Netlik & SEN Dili (Vatandaş Dili)

Sıfır jargon, insani, sıcak, arkadaşça, yapmacıksız ve çözüme giden bir dil kullanılır.

* **Öğretmen SEN, Belge SIZ:** Eğitmen anlatırken öğrenciye doğrudan ve sıcak bir dille «sen» diye hitap eder. Ancak dilekçe, resmi yazı veya sözleşme çıktısı üretilirken belgenin kendi dili «siz» ve resmi formatta kalır.
* Cümle TTS ritmine uyar: kısa, konuşulabilir, günlük.
* Jargon kaçınılmazsa önce günlük vatandaş karşılığı, sonra terim gelir. Ham dosya uzantıları (`xlsx`, `docx`, `pptx`) Vatandaş Lisanı ile Türkçe karşılığına çevrilir: Excel tablosu / Word belgesi / PowerPoint sunusu (yüzey listesi §E.2).
* **Aforizma / Ajans Sloganı Yasağı:** Eğitim dili aforizma, ajans sloganı veya tekerleme olamaz. «Karar notu insanındır», «Sunum fabrikası» gibi edebi laflar yasaktır. Dil; bir öğretmenin öğrencisine doğrudan, sade ve eylem odaklı anlattığı duru Türkçe olmak zorundadır.

### 3. Bilişsel Yük Yönetimi & "Quiet Luxury" UX Standartları

**Karaoke overlay / oynatıcı sahnesinde** uzun metin blokları veya okuma paragrafı gösterilmesi **KESİNLİKLE YASAKTIR.** Sahnede yalnız o saniyeye ait kısa **Punchcard Rozetleri** parlar (en fazla üç kelime).

* **Altyazı Titreme Yasağı (0 Layout Shift):** Karaoke altyazısında aktif kelime kalınlaşırken cümle sağa sola titremez. Koyuluk hissi yerleşimi itmeyen bir vurgu ile sağlanır; piksel ve CSS SOP bake el kitabı / oynatıcı kodundadır.
* **Descender Harf Koruması:** `g, y, ş, p` gibi alt uzantılı harfler altyazı şeridinde kesilmez.
* **16:9 Tuval ve Contain Sözleşmesi:** Slayt tuvalleri ve uygulama pencereleri (`PowerPoint`, `Outlook`, `Excel`, `Word`, `Gmail`) dikeyde basılamaz/ezilemez; tuval oranı korunur.
* **Dikey Nefes ve Kabuk Dengesi:** Oynatıcı sahnesi tavan çizgisine yapışmaz. Sağ oynatma listesi çekirdek derslerin tamamını kaydırma çubuğu olmadan tek bakışta sığdıracak esnekliktedir.

**Kapsam:** Paragraf yasağı overlay ve punchcard sahnesinedir. Çalışma sekmesindeki **Compact Makale** (Tam Ders Metni) paragraf taşır; Anayasa B4 (konunun hakkı) bunu ister. Compact makale A.3 ihlali değildir. Nasıl-yapılır adım bandı (§E.7) da A.3’ün dışında durur: bant «Adım 1 / Adım 2 / Adım 3» taşır, overlay paragrafı değildir.

**Junior oda ≠ başlangıç seviyesi.** 18 yaş altı ürün yoktur (`JUNIOR_PRODUCTION_LOCKED`; Anayasa B2). Başlangıç seviyesi Akademi içi **Temel Paketler** ile karşılanır.

---

## B. FIRIN ROLLERİ VE 4-BEAT REJİ

İçerik üretiminde vatandaş yüzeyine Cursor uydurması basılmaz. Senaryo, ses, görsel ve dip müzik bake fırınlarından gelir. Cursor **montaj operatörüdür**: dönen parçaları `lib/academy/` (cue, timings, spoken-scripts, lesson-exams) ve `public/media/` altına kaydeder; oynatıcı senkronunu bağlar.

Rol dağılımı yetenek sınıfıdır; ürün sürüm adı Pedagoji’de donmaz. Canlı kimlik `lib/kernel/ai/model-roles.ts` içindedir.

| Rol | Yetenek sınıfı | Görev |
|-----|----------------|-------|
| Metin & Senaryo | Hızlı metin modeli (`FAST_STREAM`) | 4-beat rejiye uygun ders senaryosu (Sebep → Eylem → Sonuç) |
| Seslendirme | TTS (`VOICE_TTS`) | Metni Gözde (**Callirrhoe**) ses karakteriyle mühürler |
| Görsel & Video | Görsel üretim + bütçe korumalı B-roll | %80 canlı uygulama / %20 sinematik. Pahalı video API her ders fırınında yasaktır (§E.4) |
| Ducking Müzik | Dip müzik fırını | Konuşurken dipte; nefes ve outro bake el kitabındaki eğriye uyar |
| Montaj Operatörü | Cursor | Cue, timings, görsel ve müzik montajı |

**4-beat reji (Warm-up → Command → Comparison → Task)** tek eğitmen, SEN dili; **Pekiştirme ve Tekrar** iki durak ekler:

| Sıra | Beat | Karşılık | İçerik |
|------|------|----------|--------|
| — | GİRİŞ KÖPRÜSÜ | Warm-up öncesi ısınma | Yapay zekâ ile çalışma refleksini hatırlatan köprü |
| 1 | Warm-up | Isınma / İş Problemi | Gerçek iş hayatı karşılığı ve problemin **nedeni** |
| 2 | Command | Birinci Senaryo / Temel Yöntem | İlk istem ve çözüm — ekranda çalışan işlem |
| 3 | Comparison | İkinci Senaryo / İstisna | Edge-case, yanlış vs doğru, kritik durum (ÖNCE / SONRA split) |
| — | CEBİNE KOY | Task öncesi kapanış özeti | Üç somut adımı ve nedenlerini tane tane tekrarlar |
| 4 | Task | Özet & Saha Görevi | Cebine koyacakların ve aksiyon görevi |

Üretim sırası **senaryo → mühürlü ses → cue → görsel/video → ducking müzik → montaj**’dır; tersine değil.

**İzleme anında harici üretici API çağrılmaz.** Fırın bake’de çalışır; oynatıcı mühürlü medyayı senkronize eder. Cue orijinal terimi korur; ses fonetik okur. Placeholder test-pattern vatandaşa basılmaz.

Kod SSOT: `lib/academy/production-standard.ts`. Görsel reji SSOT: `lib/academy/lesson-beat-visual.ts`.

---

## C. SÜRE, SEVİYE VE MÜHÜR BARAJI

Karaoke ders / kurs süre bantları ve bölüm sayısı **kod SSOT’tadır** (`lib/academy/production-standard.ts`). Compact makale gövdesi bu bantla kesilmez (Anayasa B4 — konunun hakkı).

* **Kalite ve Süre Bandı:** Her ders mühürlü kasetiyle kod SSOT’taki yeşil bantta kalır (`lib/academy/production-standard.ts`). Bant, dikkat aralığı ve TTS ekonomisi içindir; sayı Pedagoji’de dogma değildir.
* **Başarı ve Mühür Barajı:** Kurs sonu sınav barajı kod SSOT’tadır (`ACADEMY_EXAM_PASS_SCORE` / `lib/academy/exam.ts`). Sertifika satın alınamaz; çekirdek derslerin tamamı izlenip sınav geçilince hak edilir. Puan sunucu tarafında doğrulanır.
* **Sözlük (sınav kapısı):** Sınav geçidi yalnız «sınav kapısı» diye anılır; «sınav köprüsü» yasaktır — kapı açılır, köprü kurulmaz. Dersler arası giriş/kapanış köprüleri bu yasağın dışındadır.
* **Tazelik:** Tarih damgalı bilgi (model eğilimleri, sürüm adları) tazelik ister; gözden geçirme aralığı bake el kitabındadır (`docs/ops/akademi-bake-elkitabi.md`).

Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır; ofis amiralinde Gözde (Callirrhoe) mühürdür. Öğretmen hitabı SEN kalır. Dilekçe ve sözleşme gibi resmî belgede üretilen örnek SIZ’dır (öğretmen SEN, belge SIZ). Erkek TTS yuvası (Fenrir) köprü dersinde pilotlanabilir. Model kimliği Pedagoji’de durmaz.

---

## D. EĞİTİM YAPISI VE KAPILAR (ÜÇ KAPI FELSEFESİ)

Yapay zekâya veri verme adımı seste ve ekranda **Üç Kapı Hiyerarşisi** ile öğretilir. Sıra sabittir; öğrenci önce 1. kapıyı dener. **Üç Kapı yalnız aktarım yöntemidir.** Kişisel veri / şirket sırrı / kamu cümlesi güvenlik sınıfıdır; kapı adı değildir. Masaüstü ve araç ayrıntısı §E.2 / §E.10.

1. **1. Kapı — Yerleşik araçlar:** Yerleşik Panel (Copilot / Gemini Şeridi). Gmail Gemini, Excel / Word / Outlook Copilot (lisans varsa). İstem panele yazılır; kutu/dosya yerinde kalır.
2. **2. Kapı — Ataş / dosya yükleme:** Excel tablosu, Word belgesi veya PowerPoint sunusu sohbet veya Copilot paneline doğrudan yüklenir. Ham uzantı adları (`xlsx`, `docx`, `pptx`) seste, altyazıda ve makalede okunmaz/yazılmaz. Sayfa sayfa kopyalamak zahmetli yoldur.
3. **3. Kapı — Son çare:** Maskeli Kısa Özet (Sohbet / Tüketici Modeli). KVKK’ya uygun, maskelenmiş kısa kopyala-yapıştır (Müşteri A, MASKELİ_IBAN).

* **Taşıma su** yasak listesi değil, **atlanmış kapı**dır: 1. ve 2. kapı dururken kutuyu / dosyayı dış sohbete hamal gibi taşımaktır.
* **Soyut AI Masası Yasağı:** Soyut "AI Masası" gösterilemez. Öğrenci ekranda gerçek kapıyı görür: Gmail Gemini paneli, Copilot şeridi veya ataş.

Ders 1 ataş adımları erken KVKK/maskeleme uyarısı ve temiz örnek dosya vurgusu taşır; yükleme refleksinden önce maske refleksi hizalanır.

### D.1 Vitrin Kabuk Karması ve Dürüst Yüzey (A5)

Vitrin otoritesini ve güvenini korumak için platformda 5'li Vitrin Karması listelenir:

1. `01_office_ai` / OFF-101 (İş Hayatında ve Ofiste Yapay Zekâ) → **YAYINDA / AMİRAL LOKOMOTİF**
2. `02_ecommerce_ai` / EC-102 (E-Ticaret Yapay Zekâ Asistanlığı) → **ÇOK YAKINDA**
3. `03_social_media_ai` / SM-103 (Yapay Zekâ ile Sosyal Medya İçerik Üretimi) → **ÇOK YAKINDA**
4. `04_chatbot_nocode` / BOT-104 (Müşteri Hizmetleri ve Satış İçin Kodsuz Chatbot) → **ÇOK YAKINDA**
5. `05_prompt_practice` / PR-105 (Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi) → **ÇOK YAKINDA**

**Dürüst Yüzey (Anayasa A5):** `01_office_ai` dışındaki 4 ürünün üzerinde "Çok Yakında / Hazırlanıyor" rozeti durur. Tıklandığında ön sipariş/bilgilendirme gösterilir. Bağlı olmayan medya, eksik bake veya mühürsüz ders için hayali oynatıcı basılmaz; vatandaşa dürüstçe henüz hazır olmadığı söylenir.

Amiral SKU `01_office_ai` yayın makalesi + mühürlü karaoke taşır. **Ders adedi Pedagoji kotası değildir.** Anayasa B4 (konunun hakkı) ne gerektiriyorsa o kadar doygun ders basılır: tek pakette 9–10 ders veya 101/102 ayrımı serbesttir. **Ayrım tetik koşulu:** çekirdek toplam 90 dk tavanını aşarsa veya çekirdek ders adedi 11’e ulaşırsa SKU `OFF-101` / `OFF-102` diye ikiye ayrılır (bant SSOT `lib/academy/production-standard.ts`). **Çekirdek 9 ders kilitlidir**; ileriki fırında 3 köprü dersi (takvim/toplantı, Excel formül/grafik, PDF) ayrı uydu şeridinde eklenir, çekirdek sınav yolu şişmez. Canlı kaset / sınav sayıları `docs/ops/DURUM.md` (ayna `docs/DURUM.md`) ve koddadır. Sessiz okuma metni yoktur.

---

## E. ÖĞRETİM TERCİHLERİ (ALTIN ŞABLON FELSEFESİ)

`01_office_ai-1` Excel sineması yalnız Excel derslerinin **görsel sözleşmesidir**, Anayasa A maddesi değildir. Her ders kendi masasında durur: KVKK belge/maske masası, g1 çift-hat posta masası, w1 Word masası. Cue-görsel kod SSOT: `lib/academy/lesson-beat-visual.ts`, `lib/academy/lesson-veo.ts`, `lib/academy/excel-workspace.ts`. PowerPoint, Gmail, Word aynı Excel imlecine sığmak zorunda değildir; her masa kendi layout’unu taşır. Milisaniye, zoom yüzdesi ve gain bake el kitabındadır.

### E.1 Görsel dürüstlük

* **Spoiler Yasağı:** Command beat boyunca temiz/nihai sonuç gösterilmez. Temiz tablo ilk kez Comparison split-screen sağ panelinde açılır.
* Vatandaş etiketinde «Kirli» yok. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı». Split: **ÖNCE (DÜZENLEMESİZ)** / **SONRA (AI İLE)**.

### E.2 Üç Kapı Hiyerarşisi (aktarım)

Üç Kapı tanımı, sıra ve vatandaş özeti **§D** üzerindedir. Bu madde yalnız araç eşleşmesini ve masaüstü gerçeğini taşır.

* **Yerleşik araç eşleşmesi (SSOT):** Outlook → Copilot, Gmail → Gemini, Word/Excel → Doğrudan Dosya Yükleme, PowerPoint → Copilot. Kilit: `lib/academy/ai-desk.ts` → `ACADEMY_INFRA_TOOL_MATCH`.
* **Araç dayatması yok.** Pedagoji VBA, Gamma veya Marp zorunlu kılmaz. Sheets/Docs yasak değil, bu SKU’da yol Excel/Word’dür; Sheets köprüsü ayrı derste. Fırın script’indeki checkbox doktrin değildir. 1. Kapı yerleşik Copilot; yoksa ataş.
* **Nereye Yazılacak:** Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**. Öğrenci gerçek kapıyı görür: Gmail Gemini paneli, Copilot şeridi veya ataş. Rehber ok: «Nereye Yükleyeceksin?» / «Gemini veya ataş». Masaüstü Outlook’ta Copilot yoksa 2. veya 3. kapı dürüstçe gösterilir; «senin aracın yasak» denmez.
* **Çoklu AI ekosistemi:** Yalnız Copilot değil; ChatGPT, Claude, Gemini ve şirket paneli / kurumsal model farkı sade dille işlenir.
* **Yasak yüzeyleri:** ses fonetiği, cue, konuşma metni, makale ve görsel stage düğümlerini tarayan testler bake el kitabındadır (`docs/ops/akademi-bake-elkitabi.md`).
* **Aforizma / Ajans Sloganı:** İlke §A.2’dedir. Görsel stage rozeti işin net tanımını taşır («Tek Tek Kopyalama», «Tek Dosyayla Analiz»); «ZAHMETLİ YOL», «YERİNDE ANALİZ» gibi jenerik laflar basılmaz.

### E.3 İşitsel reji (ilke)

Konuşma jenerikten sonra başlar; outro’da müzik yükselir. Saniye ve gain **bake el kitabındadır** — Pedagoji anayasası değildir.

### E.4 Bütçe Korumalı B-roll Mimarisi

Google AI Studio bütçesi her ders fırınında korunur. Pahalı video API her ders fırınında **KESİNLİKLE YAPILMAZ.** Varsayılan: yerel MP4 reuse veya bütçe korumalı Lite B-roll; yedek durağan plaka + CSS Ken Burns. Oynatıcı izlemede VIDEO_GEN çağırmaz. Endpoint kimliği ve süre bake el kitabı + `lib/academy/lesson-veo.ts` içindedir.

### E.5 Fırınlama (Bake) Disiplini

Ücretli TTS ve video mühürü, reji oturmadan açılmaz. `--seal` insan onayı ister; deneme `--dry-run`. Operatör SOP: `docs/ops/akademi-bake-elkitabi.md`.

### E.6 Dinamik Vektörel Şema ve Mantık Katmanı

Mantık ağaçları ve süreç diyagramları statik afiş olarak basılmaz; `components/academy/` altında senkron React/SVG durur. **Sıfır Ekstra API Maliyeti.** Hücre çerçevesi görünen sahneye kilitlenir; sıkışık ekranda metin üç noktaya düşmez. Piksel ve clamp SOP kod + bake el kitabındadır.

### E.7 Nasıl Yapılır? — Prompt Terminali ve Adım Bantı

Öğrenci ekranda **nasıl yapılacağını** görür; kulağında duyduğu komut kopyalanabilir gerçek istem olarak yazılır. Punchcard yalnız durum rozetidir; canlı bant «Adım 1: İletileri Seç», «Adım 2: Etiketle», «Adım 3: Taslak İste» taşır.

* **İstem paneli:** Yerleşik panele (Gmail Gemini, Copilot) istem yazılır. Öğrenci istemi ekrandan alıp aynı panele yapıştırabilir. Bu, taşıma su değildir. Taşıma su, **kutuyu / dosyayı** dış sohbete taşımaktır.
* **Harf harf yazma dayatması yoktur.** Daktilo animasyonu «garsonu göster» içindir; vatandaşa pratik yol öğretilir.
* Ana akış e-posta adımları `01_office_ai-g1` (Gmail + Outlook çift hat) haritasındadır.

### E.8 Nereye Yazılacak — Gmail + Gemini, Copilot ve Ataş

Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**.

* **Sekme 1 — Gmail + Gemini (1. Kapı):** Gmail yan panelindeki Gemini eklentisi işaretlenir. İstem oraya yazılır veya panodan *istem* yapıştırılır; mail gövdesi dış sohbete taşınmaz.
* **Sekme 2 — Copilot (1. Kapı):** Lisans varsa şerit menüsündeki Copilot işaretlenir.
* **ChatGPT / Claude:** Yerleşik panel yoksa 2. Kapı ataştır (Excel tablosu / Word belgesi / PowerPoint sunusu). 1. ve 2. kapı yoksa 3. Kapı maskeli kısa özettir. Ham kutu / ham sözleşme taşıması öğretilmez (§E.10). Sohbet ekranı tek başına kapı adı değildir.

### E.9 Altyapı Şeffaflığı & Dosya Yükleme Gerçekliği

Üç kapı (§D / §E.2 / §E.10) her uygulamada aynı sırayla durur; ekran ve ses aracın gerçek kapısını gösterir.

* Word ve Excel: Word belgesi / Excel tablosu sohbete ataş ile yüklenir (2. Kapı). Parça parça sayfa kopyası tercih edilen yol değildir.
* Outlook: Copilot lisansı varsa 1. Kapı. Lisans yoksa gelen kutusunun tamamını harici sohbete taşımak öğretilen varsayılan değildir; Gmail Gemini (1. Kapı) veya maskeli kısa 3. Kapı dürüstçe gösterilir.
* Ana akış e-posta dersi: `01_office_ai-g1` — Gmail + Outlook çift hat. Yöntem `gmail-gemini` (Outlook ayağı Copilot / 3. Kapı).
* Ana akış Word dersi: `01_office_ai-w1`. Yöntem `doc-upload-gemini` (sözleşme + dilekçe + rapor).
* Sınav kapısı ve kaset sayıları koddadır; Pedagoji «N ders» yazmaz.

### E.10 Üç Kapı Hiyerarşisi (eski «taşıma su yasağı» yerine)

**MASAÜSTÜ DÜRÜSTLÜĞÜ:** Masaüstü Outlook, Copilot lisansı olmadan gelen kutusunun canlı akışını harici araçlara okutamaz. Bu kısıt öğrenciye dürüstçe anlatılır; «senin aracın yasak» denmez. Ana odak hâlâ modern yerleşik panel ve ataştır; yoksa 3. kapı açılır.

Üç kapı sırası ve vatandaş tanımı **§D** üzerindedir. Bu madde masaüstü kısıtını ve güvenlik sınıfını taşır.

**Güvenlik sınıfı ayrı eksendir:** kişisel veri / şirket sırrı / kamu cümlesi. Hangi kapı seçilirse seçilsin ham kimlik ve sır gitmez. Kiracı Copilot, şirket paneli veya tüketici modeli kapı adı değildir.

**Taşıma su** (§D): 1. ve 2. kapı dururken kutuyu dış sohbete hamal gibi taşımaktır. Öğrenciye önce yerleşik, yoksa ataş, son çare maskeli kısa yapıştırma öğretilir.

* Kod SSOT: `lib/academy/ai-desk.ts`, `lib/academy/curricula/office_ai/planned.ts`.

---

## F. DOYGUNLUK AKIŞI (KOD BAĞI)

4-beat reji ve tek eğitmen hitabı §B’dedir. Ders/kurs süre bantları, bölüm sayısı ve TTS cinsiyeti `lib/academy/production-standard.ts` içindedir. İsteğe bağlı Temel / Orta / İleri paket ayrımı §C’dedir.

Bu madde ölü referans değildir. Kod yorumlarındaki «PEDAGOJI.md §F» buraya ve §B/§C’ye bağlanır. Bake milisaniyesi burada durmaz.
