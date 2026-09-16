# PEDAGOJI.md — Eğitim felsefesi

Bu belge platformun **kalıcı eğitim felsefesini** tanımlar. Stüdyo milisaniyesi, gain, Veo süresi ve canlı model kimliği burada dogma değildir.

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Canlı model kimliği kod SSOT’tadır (`lib/kernel/ai/model-roles.ts`). Bake SOP, gain, saniye ve CLI `docs/ops/akademi-bake-elkitabi.md` içindedir. Canlı kaset / sınav sayıları `docs/DURUM.md` ve kod içindedir.

---

## A. TEMEL EĞİTİM FELSEFESİ

### 1. Somut ve Uygulamalı Anlatım ("Garsonu Göster")

Soyut tanımlar yığılmaz. Kulakta duyulan işlem, gözde o somut uygulamadır. Ekranın ağırlığı canlı iştir; kalanı bağlam plakasıdır.

* Anlatılan işlem ile görünen kare örtüşür; ses ile görsel ayrışmaz.
* «Ajan otonom bir döngüdür» demek yerine sipariş, araç, bellek ve teslim adımı masada çalışır.
* Her yayın SKU kendi iş dilini kullanır. Tek şablon her alana zorla dayatılmaz.

### 2. Aptala Anlatır Gibi Netlik & SEN Dili

Sıfır jargon, insani, sıcak, arkadaşça ve çözüme giden bir dil kullanılır.

* Anlatıcı öğrenciye «sen» diye hitap eder.
* Cümle TTS ritmine uyar: kısa, konuşulabilir, günlük.
* Jargon kaçınılmazsa önce günlük karşılığı, sonra terim gelir.

### 3. Bilişsel Yük Yönetimi (Sıfır Paragraf)

**Karaoke overlay / oynatıcı sahnesinde** uzun metin blokları veya okuma paragrafı gösterilmesi **KESİNLİKLE YASAKTIR.** Sahnede yalnız o saniyeye ait kısa **Punchcard Rozetleri** parlar (en fazla üç kelime).

* Rozet slogan niteliğindedir; görseli destekler, teleprompter olmaz.
* Görsel odak sık değişir; konuşma aralarında nefes payı bırakılır. Saniye ve gain bake el kitabındadır.

**Kapsam:** Bu yasak karaoke overlay ve punchcard sahnesinedir. Çalışma sekmesindeki **Compact Makale** (Tam Ders Metni) paragraf taşır; Anayasa B4 (konunun hakkı) bunu ister. Compact makale A.3 ihlali değildir. Nasıl-yapılır adım bandı (§E.7) da A.3’ün dışında durur: bant «Adım 1 / Adım 2 / Adım 3» taşır, overlay paragrafı değildir.

**Junior oda ≠ başlangıç seviyesi.** 18 yaş altı ürün yoktur (`JUNIOR_PRODUCTION_LOCKED`; Anayasa B2). Başlangıç seviyesi Akademi içi **Temel Paketler** ile karşılanır.

---

## B. FIRIN ROLLERİ VE 4-BEAT REJİ

İçerik üretiminde vatandaş yüzeyine Cursor uydurması basılmaz. Senaryo, ses, görsel ve dip müzik bake fırınlarından gelir. Cursor **montaj operatörüdür**: dönen parçaları `docs/curriculum/` ve `public/media/` altına kaydeder; oynatıcı senkronunu bağlar.

Rol dağılımı yetenek sınıfıdır; ürün sürüm adı Pedagoji’de donmaz. Canlı kimlik `lib/kernel/ai/model-roles.ts` içindedir.

| Rol | Yetenek sınıfı | Görev |
|-----|----------------|-------|
| Metin & Senaryo | Hızlı metin modeli (`FAST_STREAM`) | 4-beat rejiye uygun ders senaryosu |
| Seslendirme | TTS (`VOICE_TTS`) | Metni Gözde (**Callirrhoe**) ses karakteriyle mühürler |
| Görsel & Video | Görsel üretim + bütçe korumalı B-roll | %80 canlı uygulama / %20 sinematik. Pahalı video API her ders fırınında yasaktır (§E.4) |
| Ducking Müzik | Dip müzik fırını | Konuşurken dipte; nefes ve outro bake el kitabındaki eğriye uyar |
| Montaj Operatörü | Cursor | Cue, timings, görsel ve müzik montajı |

**4-beat reji (Warm-up → Command → Comparison → Task)** tek eğitmen, SEN dili; **Pekiştirme ve Tekrar** iki durak ekler:

| Sıra | Beat | Karşılık | İçerik |
|------|------|----------|--------|
| — | GİRİŞ KÖPRÜSÜ | Warm-up öncesi ısınma | Yapay zekâ ile çalışma refleksini hatırlatan köprü |
| 1 | Warm-up | Isınma / İş Problemi | Gerçek iş hayatı karşılığı |
| 2 | Command | Birinci Senaryo / Temel Yöntem | İlk istem ve çözüm — ekranda çalışan işlem |
| 3 | Comparison | İkinci Senaryo / İstisna | Edge-case, yanlış vs doğru, kritik durum |
| — | CEBİNE KOY | Task öncesi kapanış özeti | Üç somut adımı tane tane tekrarlar |
| 4 | Task | Özet & Saha Görevi | Cebine koyacakların |

Üretim sırası **senaryo → mühürlü ses → cue → görsel/video → ducking müzik → montaj**’dır; tersine değil. Senaryo, cue ve visual zoom senkronu tam oturmadan ücretli TTS/Video çağrılmaz. Geliştirme `--dry-run` ile yürür. Taslak ses vatandaş yüzeyine basılmaz. İnsan onayı olmadan harici TTS yok. Ayrıntı bake el kitabındadır.

**İzleme anında harici üretici API çağrılmaz.** Fırın bake’de çalışır; oynatıcı mühürlü medyayı senkronize eder. Cue orijinal terimi korur; ses fonetik okur. Placeholder test-pattern vatandaşa basılmaz.

Kod SSOT: `lib/academy/production-standard.ts`. Görsel reji SSOT: `lib/academy/lesson-beat-visual.ts`.

---

## C. SÜRE, SEVİYE VE MÜHÜR BARAJI

Karaoke ders / kurs süre bantları ve bölüm sayısı **kod SSOT’tadır** (`lib/academy/production-standard.ts`). Pedagoji sabit dakika veya «en az N bölüm» anayasası taşımaz. Ders sindirilebilir kısa tutulur; compact makale gövdesi bu bantla kesilmez (Anayasa B4 — konunun hakkı).

* **Başarı ve Mühür Barajı:** Kurs sonu sınavından **70+** alma zorunluluğu vardır. Sertifika satın alınamaz, hak edilir. Puan **sunucu** tarafındadır (Anayasa A4).

Çok teknik konularda müfredat **Temel / Orta / İleri** bağımsız paket olarak ayrılabilir; her SKU’ya zorunlu basamak değildir. Ses seçimi fırınlama aşamasında **kadın veya erkek** TTS yuvasıdır; ofis amiralinde Gözde (Callirrhoe) mühürdür. Model kimliği Pedagoji’de durmaz.

---

## D. VİTRİN KABUK KARMASI VE DÜRÜST YÜZEY (A5)

Vitrin otoritesini ve güvenini korumak için platformda 5'li Vitrin Karması listelenir:

1. `01_office_ai` (İş Hayatında ve Ofiste Yapay Zekâ) → **YAYINDA / AMİRAL LOKOMOTİF**
2. `05_prompt_practice` (Pratik Prompt Mühendisliği) → **ÇOK YAKINDA / KAPI ÜRÜNÜ**
3. `04_chatbot_nocode` (Kodsuz WhatsApp & Chatbot) → **ÇOK YAKINDA / PRESTİJ**
4. `02_ecommerce_ai` (E-Ticaret ve Pazaryeri AI) → **ÇOK YAKINDA / SEPET DOLDURUCU**
5. `03_social_media_ai` (Sosyal Medya Video Fabrikası) → **ÇOK YAKINDA / GÖRSEL MAGNET**

**Dürüst Yüzey (Anayasa A5):** `01_office_ai` dışındaki 4 ürünün üzerinde "Çok Yakında / Hazırlanıyor" rozeti durur. Tıklandığında ön sipariş/bilgilendirme gösterilir. Bağlı olmayan medya, eksik bake veya mühürsüz ders için hayali oynatıcı basılmaz; vatandaşa dürüstçe henüz hazır olmadığı söylenir.

Amiral SKU `01_office_ai` yayın makalesi + mühürlü karaoke taşır. **Ders adedi Pedagoji kotası değildir.** Anayasa B4 (konunun hakkı) ne gerektiriyorsa o kadar doygun ders basılır: tek pakette 9–10 ders veya 101/102 ayrımı serbesttir. Canlı kaset / sınav sayıları `docs/DURUM.md` ve koddadır. Sessiz okuma metni yoktur.

---

## E. ÖĞRETİM TERCİHLERİ (ALTIN ŞABLON FELSEFESİ)

`01_office_ai-1` Excel sineması gelecek müfredatın **görsel sözleşmesidir**, Anayasa A maddesi değildir. Cue-görsel kod SSOT: `lib/academy/lesson-beat-visual.ts`, `lib/academy/lesson-veo.ts`, `lib/academy/excel-workspace.ts`. PowerPoint, Gmail, Word aynı Excel imlecine sığmak zorunda değildir; her masa kendi layout’unu taşır. Milisaniye, zoom yüzdesi ve gain bake el kitabındadır.

### E.1 Görsel dürüstlük

* **Spoiler Yasağı:** Command beat boyunca temiz/nihai sonuç gösterilmez. Temiz tablo ilk kez Comparison split-screen sağ panelinde açılır.
* Vatandaş etiketinde «Kirli» yok. Yerine «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı». Split: **ÖNCE (DÜZENLEMESİZ)** / **SONRA (AI İLE)**.

### E.2 Üç Kapı Hiyerarşisi (aktarım)

Yapay zekâya veri verme adımı seste ve ekranda **Üç Kapı** ile öğretilir (§E.10). Sıra sabittir; öğrenci önce 1. kapıyı dener.

1. **Yerleşik araçlar** — Gmail Gemini, Excel / Word / Outlook Copilot (lisans varsa).
2. **Ataş / dosya yükleme** — `docx`, `xlsx`, `pptx` (seste noktasız; ekranda uzantı görülebilir).
3. **Son çare:** KVKK’ya uygun, maskelenmiş kısa kopyala-yapıştır. Bütün gelen kutusunu veya ham tabloyu ekran görüntüsüyle dış sohbete taşımak öğretilen varsayılan yol değildir.

* **Yerleşik araç eşleşmesi (SSOT):** Outlook → Copilot, Gmail → Gemini, Word/Excel → Doğrudan Dosya Yükleme, PowerPoint → Copilot. Kilit: `lib/academy/ai-desk.ts` → `ACADEMY_INFRA_TOOL_MATCH`.
* **Araç dayatması yok.** Pedagoji VBA, Gamma veya Marp zorunlu kılmaz. Fırın script’indeki checkbox doktrin değildir. 1. Kapı yerleşik Copilot; yoksa ataş.
* **Nereye Yazılacak:** Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**. Öğrenci gerçek kapıyı görür: Gmail Gemini paneli, Copilot şeridi veya ataş. Rehber ok: «Nereye Yükleyeceksin?» / «Gemini veya ataş». Masaüstü Outlook’ta Copilot yoksa 2. veya 3. kapı dürüstçe gösterilir; «senin aracın yasak» denmez.
* **Çoklu AI ekosistemi:** Yalnız Copilot değil; ChatGPT, Claude, Gemini ve özel API farkı sade dille işlenir.

### E.3 İşitsel reji (ilke)

Konuşma jenerikten sonra başlar; outro’da müzik yükselir. Saniye ve gain **bake el kitabındadır** — Pedagoji anayasası değildir.

### E.4 Bütçe Korumalı B-roll Mimarisi

Google AI Studio bütçesi her ders fırınında korunur. Pahalı video API her ders fırınında **KESİNLİKLE YAPILMAZ.** Varsayılan: yerel MP4 reuse veya bütçe korumalı Lite B-roll; yedek durağan plaka + CSS Ken Burns. Oynatıcı izlemede VIDEO_GEN çağırmaz. Endpoint kimliği ve süre bake el kitabı + `lib/academy/lesson-veo.ts` içindedir.

### E.5 Fırınlama (Bake) Disiplini

Ücretli TTS ve video mühürü, reji oturmadan açılmaz. `--seal` insan onayı ister; deneme `--dry-run`. Operatör SOP: `docs/ops/akademi-bake-elkitabi.md`.

### E.6 Dinamik Vektörel Şema ve Mantık Katmanı

Mantık ağaçları ve süreç diyagramları statik afiş olarak basılmaz; `components/academy/` altında senkron React/SVG durur. **Sıfır Ekstra API Maliyeti.** Hücre çerçevesi DOM’a kilitlenir (`getBoundingClientRect`); sıkışık ekranda metin üç noktaya düşmez (`font-size: clamp(...)`, `min-width: content`).

### E.7 Nasıl Yapılır? — Prompt Terminali ve Adım Bantı

Öğrenci ekranda **nasıl yapılacağını** görür; kulağında duyduğu komut kopyalanabilir gerçek istem olarak yazılır. Punchcard yalnız durum rozetidir; canlı bant «Adım 1: E-Postaları Seç», «Adım 2: Copilot Paneli», «Adım 3: Taslak Yanıt Üret» taşır.

* **İstem paneli:** Yerleşik panele (Gmail Gemini, Copilot) istem yazılır. Öğrenci istemi ekrandan alıp aynı panele yapıştırabilir. Bu, taşıma su değildir. Taşıma su, **kutuyu / dosyayı** dış sohbete taşımaktır.
* **Harf harf yazma dayatması yoktur.** Daktilo animasyonu «garsonu göster» içindir; vatandaşa pratik yol öğretilir.
* Ana akış e-posta adımları `01_office_ai-g1` (Gmail + Outlook çift hat) haritasındadır.

### E.8 Nereye Yazılacak — Gmail + Gemini, Copilot ve Ataş

Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**.

* **Sekme 1 — Gmail + Gemini (1. Kapı):** Gmail yan panelindeki Gemini eklentisi işaretlenir. İstem oraya yazılır veya panodan *istem* yapıştırılır; mail gövdesi dış sohbete taşınmaz.
* **Sekme 2 — Copilot (1. Kapı):** Lisans varsa şerit menüsündeki Copilot işaretlenir.
* **ChatGPT / Claude:** 1. ve 2. kapı yoksa 3. kapıdır. Kısa, maskelenmiş yapıştırma öğretilir; ham kutu / ham sözleşme taşıması öğretilmez (§E.10).

### E.9 Altyapı Şeffaflığı & Dosya Yükleme Gerçekliği

Üç kapı (§E.2 / §E.10) her uygulamada aynı sırayla durur; ekran ve ses aracın gerçek kapısını gösterir.

* Word ve Excel: `docx` / `xlsx` sohbete ataş ile yüklenir (2. Kapı). Parça parça sayfa kopyası tercih edilen yol değildir.
* Outlook: Copilot lisansı varsa 1. Kapı. Lisans yoksa gelen kutusunun tamamını harici sohbete taşımak öğretilen varsayılan değildir; Gmail Gemini (1. Kapı) veya maskeli kısa 3. Kapı dürüstçe gösterilir.
* Ana akış e-posta dersi: `01_office_ai-g1` — Gmail + Outlook çift hat. Yöntem `gmail-gemini` (Outlook ayağı Copilot / 3. Kapı).
* Ana akış Word dersi: `01_office_ai-w1`. Yöntem `doc-upload-gemini` (sözleşme + dilekçe + rapor).
* Sınav köprüsü ve kaset sayıları koddadır; Pedagoji «N ders» yazmaz.

### E.10 Üç Kapı Hiyerarşisi (eski «taşıma su yasağı» yerine)

**MASAÜSTÜ DÜRÜSTLÜĞÜ:** Masaüstü Outlook, Copilot lisansı olmadan gelen kutusunun canlı akışını harici araçlara okutamaz. Bu kısıt öğrenciye dürüstçe anlatılır; «senin aracın yasak» denmez. Ana odak hâlâ modern yerleşik panel ve ataştır; yoksa 3. kapı açılır.

**ÜÇ KAPI HİYERARŞİSİ** — kopyala-yapıştır mutlak yasak değildir. Sıra öğretilir:

1. **1. Kapı — Yerleşik araçlar.** Gmail Gemini, Office Copilot. İstem panele yazılır; kutu yerinde kalır.
2. **2. Kapı — Ataş / dosya yükleme.** Sözleşme, tablo, slayt `docx` / `xlsx` / `pptx` olarak yüklenir. Sayfa sayfa kopya zahmetli yoldur.
3. **3. Kapı — Son çare.** Maskelenmiş, KVKK’ya uygun kısa kopyala-yapıştır (isim, TC, IBAN, ticari sır takma değer). Bütün gelen kutusu, ham bilanço veya ekran görüntüsü zinciri 3. kapı değildir.

**Taşıma su** artık yasak listesi değil, **atlanmış kapı**dır: 1. ve 2. kapı dururken kutuyu dış sohbete hamal gibi taşımaktır. Öğrenciye önce yerleşik, yoksa ataş, son çare maskeli kısa yapıştırma öğretilir.

* Kod SSOT: `lib/academy/ai-desk.ts`, `lib/academy/curricula/office_ai/planned.ts`.

---

## F. DOYGUNLUK AKIŞI (KOD BAĞI)

4-beat reji ve tek eğitmen hitabı §B’dedir. Ders/kurs süre bantları, bölüm sayısı ve TTS cinsiyeti `lib/academy/production-standard.ts` içindedir. İsteğe bağlı Temel / Orta / İleri paket ayrımı §C’dedir.

Bu madde ölü referans değildir. Kod yorumlarındaki «PEDAGOJI.md §F» buraya ve §B/§C’ye bağlanır. Bake milisaniyesi burada durmaz.
