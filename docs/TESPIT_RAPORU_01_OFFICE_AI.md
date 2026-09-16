# TESPİT RAPORU — `01_office_ai` Amiral Akademi Eğitimi

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | Teknik uygulayıcı ajan tespiti. Tedavi / kod değişikliği **yoktur**. |
| Kapsam | `01_office_ai` müfredat + oynatıcı + sınav + kılavuz dokümanlar (`ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`) |
| Yöntem | Kör savunma yok. Kılavuzlar da sorguya alınır. Vatandaşın eline geçen ürün, niyet belgesinden üstündür. |
| Kod kesiti | `docs/DURUM.md` (16 Eylül 2026) + canlı SSOT: `lib/academy/curricula/lesson-index.ts`, `lib/academy/pilot-sku.ts` |

**Tek cümle:** Amiral SKU teknik olarak ayakta (8 mühürlü kaset + 9 derslik sınav yolu), fakat müfredat **arka arkaya eklenen doygun derslerle bozulmuş bir 6’lı iskelettir**; evrensel ofis-AI standardına göre sığdır, kanıt MCQ’dur, Compact makale konuşma metninin kopyasıdır.

---

## 0. Yönetici özeti (SUPER ADMIN)

### Ne çalışıyor

- Yayın omurgası dürüst: 8 ders `article+karaoke`, 9. ders (`k1`) makale; hayali kaset yok (A5).
- Pedagojik çekirdek doğru yönde: A1 hijyeni, üç madde + karar notu, slayt başına tek fikir, insan onayı, hata avı, maskeleme.
- Sınav motoru Anayasa A4’e uygun: sunucu puanı, baraj 70, ders mini sınavı kurs havuzuna sızmıyor.
- Üç Kapı hiyerarşisi (yerleşik → ataş → maskeli kısa özet) ofis gerçeğine yakın ve Türkiye KOBİ’sine uygun.

### Ne kırık (öncelik)

| Öncelik | Bulgu | Vatandaş etkisi |
|---------|--------|-----------------|
| **P0** | `01_office_ai-w1` mühürlü ses + makale: «Sekiz ders bitti. Sınav köprüsü açılır.» — **yanlış**. Sınav 9. ders (`k1`) bitince açılır. | Öğrenci Word sonrası sınava koşar; kapı kapalıdır. Mühürlü kaset yalan söyler. |
| **P0** | Ders 6 başlığı hâlâ «Sınav Köprüsü»; sınav orada açılmaz. G1/W1/K1 **sonradan vidalanmış** uydu. | Akış «bitti» hissi verir, sonra üç ders daha gelir. |
| **P1** | E-posta **iki kez** öğretilir (ders 4 soyut ritim, G1 asıl kapı). Haftalık rutin, Gmail/Word öğretilmeden Cuma 30 ister. KVKK **en sonda**. | Öğrenci dosya yüklemeyi 7 ders boyunca alışkanlık yapar, yasak listeyi en sonda duyar. |
| **P1** | Compact makale ≈ konuşma metni. `LESSON_PRACTICE` boş. Etkileşimli iş kanıtı compact SKU’da yok. Sertifika 10 soruluk MCQ. | Manifesto «öğrendiğini mühürle» iddiası, izleme + test ile karşılanıyor; dosya teslimi yok. |
| **P1** | Dron T3 nakit + metin + rozet + sınav taşır; **sinema masası (Excel/Gmail/Word klonu) web’dedir**. | Amiral deneyim iki kademelidir. |
| **P2** | Evrensel ofis-AI müfredatına göre büyük boşluklar: toplantı/takvim, Sheets/Docs, formül, grafik, kurumsal vs tüketici hesap, gölge AI, istem enjeksiyonu. | ₺890’lık «amiral» bir refleks paketi; ofis işletim sistemi değil. |

### Tedaviye ilk adım (önizleme; ADIM 4.3)

**K1 kasetini mevcut sırada mühürleme.** Önce hedef müfredat sırasını ve kapanış vaatlerini kilitle; W1’deki sınav yalanını mühürlü sesden çıkar. Yeni TTS harcaması bozuk iskelete basılmamalı.

---

## ADIM 1 — Doküman ve kod tabanı taraması

### 1.1 Kılavuz dokümanlar (ne söylüyorlar)

**ANAYASA.md (15 Eylül 2026 tedavi)**

- A Katmanı (A1–A5) bu eğitimin *içerik derinliğini* değil nakit, kimlik, mühür ve dürüst yüzeyini bağlar. Akademi için bağlayıcı olanlar: A4 (sınav satın alınamaz, sunucu puanı, baraj ≥70), A5 (hayali oynatıcı yok).
- B4: «Konunun hakkı» — compact makale kelime tavanı veya sabit ders adediyle kesilmez. Sayılar kod + `docs/DURUM.md`.
- B1: API-First + `@yetkin/kernel` ince sözleşme; müfredat gövdesi kernel’de değildir.

**MANIFESTO.md**

- Gün 0 kahramanı B2C Akademi. Cümle: «Öğrendiğini mühürle. Mührün kapıyı açsın.»
- Canlı oynatıcı compact makale + mühürlü derste karaoke. İzlemede canlı TTS yok.
- Hedef kitle: alaylı / kariyer değiştiren / uzaktan çalışan yetişkin. İşveren Faz 2 alıcısıdır.

**PEDAGOJI.md**

- «Garsonu göster», SEN dili, karaoke’de paragraf yasağı, 4-beat reji (Warm-up → Command → Comparison → Task).
- Vitrin karması: `01_office_ai` amiral; `02`–`05` dürüst «Çok Yakında».
- Üç Kapı (§E.2 / §E.10). Araç eşleşmesi: Outlook→Copilot, Gmail→Gemini, Word/Excel→doğrudan dosya yükleme, PowerPoint→Copilot.
- Excel 1. ders görsel sözleşmedir, Anayasa A maddesi değildir; her masa kendi layout’unu taşıyabilir.
- Ders adedi Pedagoji kotası değildir; 9–10 veya 101/102 serbesttir.

Bu üç belge **ürünü satılabilir ve yasal** tutar. **Derin ofis yetkinliği** üretmek için yazılmamışlardır. ADIM 3 bu gerilimi açar.

### 1.2 Canlı ürün envanteri (`01_office_ai`)

**Kimlik**

| Alan | Kod gerçeği |
|------|-------------|
| Slug | `01_office_ai` |
| Modül | `CURR-OFFICE-AI-101` |
| Vitrin başlığı | İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu) |
| Kategori (modül) | «KATMAN 1.1 — Ekmek Teknesi / Kitlesel Eğitim / Temel & Başlangıç» |
| Seviye etiketi | `Temel` |
| Tohum fiyat | ₺890 KDV dahil (`89_000` kuruş) |
| Sınav yolu | **9 ders** (`1`…`6`, `g1`, `w1`, `k1`) |
| Mühürlü kaset | **8/9** — `k1` bake kuyruğunda |
| Toplam süre iddiası | `estimatedTotalMinutes: 77.09` (8 kaset ~68,6 dk + `k1` hedef ~8,5 dk) |
| Ses | Gözde / Callirrhoe |
| Karaoke katmanı | `article+karaoke` (mühürlü); `k1` = `article` |
| Pratik haritası | `LESSON_PRACTICE = {}` (boş) |
| Etkileşimli iş kanıtı | Compact SKU’da yok; okuma mührü + MCQ |

**Ders haritası (canlı sıra — `lesson-index.ts`)**

| Sıra | Anahtar | Başlık | Durum | Yöntem (planned.ts) | Ses (sn) |
|------|---------|--------|--------|---------------------|----------|
| 1 | `01_office_ai-1` | Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo | sealed | `copilot-live` | 572 |
| 2 | `01_office_ai-2` | Rapor Otomasyonu: Tablodan Yönetim Özetine | sealed | `direct-file-upload` | 500 |
| 3 | `01_office_ai-3` | Sunum Fabrikası: Metinden Slayta | sealed | `copilot-live` | 534 |
| 4 | `01_office_ai-4` | E-Posta Akışı: Gelen Kutusu Sıfırlama | sealed | `copilot-live` | 545 |
| 5 | `01_office_ai-5` | İstisnalar & Hata Avı: AI Yanılınca | sealed | `direct-file-upload` | 482 |
| 6 | `01_office_ai-6` | Haftalık Sistem: 30 Dakikalık Rutin + **Sınav Köprüsü** | sealed | `copilot-live` | 432 |
| 7 | `01_office_ai-g1` | Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi | sealed | `gmail-gemini` | 524 |
| 8 | `01_office_ai-w1` | Word ve Uzun Doküman Analizi | sealed | `doc-upload-gemini` | 528 |
| 9 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme | baking | `direct-file-upload` | — |

Bu tablo tek başına teşhistir: **6’lı kapanış (rutin + sınav) 7–9. derslerden önce durur.** G1/W1/K1 «doygun uydu» olarak sona eklenmiş; ana omurga yeniden dizilmemiş.

**Dosya haritası (SSOT / kopya / boşluk)**

| Katman | Yol | Not |
|--------|-----|-----|
| Compact makale (canlı) | `lib/academy/curricula/office_ai/section_*.ts` | Vatandaş Tam Ders Metni buradan derlenir |
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-*.md` | TTS kaynağı; makale ile neredeyse birebir |
| Cue / punchcard | `lib/academy/lesson-cues/` | 9 ders, 8 rozet/ders |
| Timings | `lib/academy/lesson-audio-timings/` | `k1` timings yok (kaset yok) |
| Mini sınav | `lib/academy/lesson-exams/` | 9 × 3 soru, baraj 70 |
| Kurs havuzu | `lib/academy/exam-pools.ts` | 42 soru; çekim 10; süre 30 dk |
| Sinema masası | `components/academy/lesson-*-workspace.tsx` + `lib/academy/*-workspace.ts` | Excel, Outlook, Gmail, Word, PPTX, KVKK, haftalık rutin — **simülasyon** |
| Fırın taslağı | `docs/curriculum/` | **Eksik:** `06_script.md`, `06_exam.json`, `g1`/`w1` script (iskelet var), `k1_cue.json`, `k1_exam.json` |
| Dron | `apps/rail-is/src/screens/AcademyPlayerScreen.tsx` | Punchcard timings’den; sinema masası yok |

**Veritabanı**

- CMS yok. Müfredat TypeScript tohumudur (`lib/academy/curriculum.ts`: «CMS yok. Gövde SETTLED satın alma sonrası açılır.»).
- Katalog / sınav kimlikleri `lib/academy/catalog-seed.ts` (`ac_01_office_ai`, `exam_01_office_ai`). Canlı fiyat `PriceCatalogEntry`; tohum ₺890.
- Bu kesitte üretim DB’sine bağlanılmadı (`docs/DURUM.md`). İçerik gerçeği koddur.

**Oynatıcı sözleşmesi**

- Web: compact makale + karaoke overlay + tam boy canlı sahne + punchcard (en fazla üç kelime).
- İzlemede TTS / VIDEO_GEN yok. Bake ayrı.
- Ders bitimi ses `ended` + isteğe bağlı 5 sn otomatik geçiş.
- Kurs sınavı `isAcademyCurriculumComplete` → 9 anahtar.

---

## ADIM 2 — İçerik kalitesi ve bütünlük

### 2.1 Yanlış / hatalı / yanıltıcı bilgi

Vatandaşa giden metin esas alınır (compact makale = konuşma metni).

#### P0 — Mühürlü yalan: sınav kapısı

`01_office_ai-w1` konuşma metni, cue JSON ve compact makale:

> «Sekiz ders bitti. Sınav köprüsü açılır. Baraj 70. […] Sınav kapısı şimdi açılır.»

Kod: sınav 9. ders (`k1`) tamamlanınca açılır. `k1` metni doğru söyler («dokuz dersin alışkanlığı»). **W1 kaseti 9’lu müfredat kararına göre güncellenmeden mühürlenmiş.** Bu A5 ruhuna aykırıdır: hayali başarı değil ama **hayali kapı**.

Ders 6 başlığı ve pedagojik hedef hâlâ «Sınav Köprüsü» taşır; ses düzeltilmiş («bu dersin sonunda açılmaz») ama **başlık ve vitrin öğrenme çıktısı geride kalmış**. Öğrenci izlenceye bakınca 6. derste sınav bekler.

#### P0 / P1 — Üç Kapı SSOT çatışması (Excel)

| Kaynak | Excel 1. Kapı |
|--------|----------------|
| `PEDAGOJI.md` §E.2 ve `ACADEMY_INFRA_TOOL_MATCH` | Word/Excel → **doğrudan dosya yükleme** (2. Kapı asıl yol) |
| `planned.ts` ders 1 | `method: "copilot-live"` |
| Ders 1 konuşma metni | «1) Copilot şeridi, 2) ataş, 3) maskeli özet» |

Öğrenciye «eşleşme kilitlidir» denir, sonra kilit iki yerde ayrıdır. Copilot lisansı olmayan TR KOBİ’sinde 1. kapı çoğu zaman **yoktur**; ders 1 bunu sonradan söyler ama yöntem sicili Copilot’u birincil basar.

#### P1 — Model karikatürü (2026’da eskimiş)

Ders 1, mühürlü:

> «ChatGPT hızlı taslak üretir, Claude uzun satırları dikkatle okur, Gemini adımları net sıralar, özel API evdeki kuralları unutmaz.»

Bu 2023–24 pazarlama ayrımıdır. 2026 modelleri bu işlerde örtüşür. «Özel API» nasıl kurulur öğretilmez; cümle sihirli üçüncü araçtır. A1 hijyeni «kör fizik yasası değil» diye düzeltilmiş — bu iyi — ama model stereotipi duruyor.

#### P1 — Abartılı süre vaadi

- Ders 1–4: ofis işleri «saniyeler içinde» çözülür (mühürlü tekrar).
- Ders 4: gelen kutusu sıfırı «en az bir buçuk saatlik net odak» kazandırır. Ölçülmemiş iddia.
- Ders 5 köprüsü: e-posta sınıflandırması «her gün en az bir saat» kazandırır. Ders 4’te 1,5 saat denmişti; **iç tutarsızlık**.
- Inbox Zero pedagojik hedef olarak sunulur. Modern e-posta hijyeni sıklıkla «tek dokunuş / aksiyon listesi»dir; G1 bunu kısmen düzeltir (çıktı = kim, ne, ne zaman) ama ders 4 hâlâ sıfır kutuyu zafer diye satar.

#### P1 — Stüdyo jargonu sızıntısı

Ders 3 konuşma metni (mühürlü):

> «yetkin.ai akademisinin **yazar fırınına** […] hoş geldin.»

PEDAGOJI «sıfır jargon / stüdyo vatandaşa basılmaz» der. «Yazar fırını» fırın operatörü dilidir; öğrencinin işi değildir.

#### P2 — Teknik sığlaştırma / yarım doğru

- «Dil modelleri matematiksel işlemci değildir» (ders 5): sohbet modeli için doğru; **Excel içi Copilot / Python in Excel formül çalıştırabilir.** Kurs bu ayrımı yapmaz. Öğrenci ChatGPT özetine TOPLA kilidi koyar (iyi) ama Copilot’un gerçek formül yazabileceğini öğrenmez.
- Gmail Gemini’ye «son 24 saati tara, tablo yap, taslak üret, gönderme»: Workspace sürümü, eklenti durumu ve kota yok. Bir kısım öğrencide panel yoktur.
- Outlook Copilot «canlı kutu okur»: M365 Copilot lisansı ister. Dürüst rozet G1’de var; ders 4’te «sağ üstteki Copilot butonu» varsayılan yol gibi durur.
- `.pptx` ataşı sohbete yüklemek, Copilot’un slayt basmasıyla **aynı kapı değildir**. Ders 3 «taslağı PowerPoint’e taşı» diyerek biraz dürüst; karaoke «saniyeler içinde etkileyici görsel anlatı» diye şişirir.
- KVKK dersi yön olarak doğru (ham PII yükleme, silmek geri almaz, şirket sırrı ≠ kişisel veri). Eksik ve yarım: yurt dışı aktarım (tüketici ChatGPT/Gemini), veri sorumlusu / işleyen, DPA, kurumsal kiracı vs kişisel hesap, özel nitelikli veri (sağlık) derinliği, prompt injection (e-postadan gelen zararlı talimat). «Hasta veya öğrenci kaydı» bir cümlede geçip gider.

#### P2 — Sınav havuzu tekrarları

42 soruluk havuz yasal aralıkta (30–50). Aynı refleks birden fazla kez neredeyse aynı şıkla basılır: 3. Kapı (`q_off_34` / `q_off_39`), dilekçe imza (`q_off_28` / `q_off_35`), Cuma 30 (`q_off_12` / `q_off_17` / `q_off_24`). Çekim 10 soru olduğu için öğrenci aynı kalıbı iki kez görebilir. Bu «öğretildiğini ölçmek» değil «şablonu ezberletmek»tir.

Mini sınavlar dersle hizalı ve sızdırmaz (iyi). Kurs havuzu platform-meta taşımaz (iyi).

### 2.2 Eksik konu analizi (evrensel Yapay Zekâ Ofis Eğitimi standardı)

Karşılaştırma çubuğu: Microsoft 365 Copilot senaryo kataloğu, Google Workspace Gemini, LinkedIn/Coursera «AI for Business», IAPP / KVKK ofis pratiği, ve 2026 masabaşı gerçek iş günü (tablo + yazı + slayt + kutu + **toplantı + arama + sürücü**).

`01_office_ai` bir **refleks seti**dir, ofis işletim sistemi değildir. Aşağıdaki boşluklar «her şeyi tıkıştıralım» listesi değil; amiral iddiasını taşıyan bir pakette beklenen omurgadır.

#### Temel (101) — yok veya cılız

| Konu | Durum | Neden kritik |
|------|--------|----------------|
| Tüketici sohbet vs Workspace vs M365 Copilot lisansı | Bir cümle / rozet | TR’de lisans dağılımı asimetrik; yanlış kapı öğrenciye «bu eğitim yalan» dedirtir |
| Gölge AI (şahsi ChatGPT’ye şirket dosyası) | KVKK’da ima; ders adı değil | Asıl risk burada |
| Google Sheets / Docs / Slides | Yok (yalnız Gmail) | Gmail öğretilip Sheets yok; ekosistem yarım |
| Toplantı: transkript, aksiyon, Copilot in Teams / Meet Gemini | Yok | Ofis süresinin büyük kısmı toplantıdır |
| Takvim / planlama | Yok | E-posta dersinin doğal devamı |
| Drive / SharePoint / OneDrive’da «soru sor» | Yok | Ataş tek dosyadır; iş bilgisi klasördedir |
| Excel formül üretimi, Pivot, grafik | Grafik ders 2’de **bilinçli yok** | «Tablonu konuştur» analiz değil temizlik |
| Word’de üslup, düzeltme, sürüm karşılaştırma, erişilebilirlik | Yok | W1 yalnız sözleşme / dilekçe / rapor iskeleti |
| Prompt iskeleti (alıcı, amaç, biçim, kısıt) | Sınavda var, derste ince | Derinlik `05_prompt_practice` SKU’suna ertelenmiş; amiral yalnız bırakılmış |
| Çıktı telifi, «model uydurdu ama sen imzaladın» hukuku | W1’de ima | Kamu personeli hedef kitlededir |
| Mobil ofis (telefonda Gemini / Copilot) | Yok | Hedef kitle uzaktan / sahada |
| Çok dilli (TR rapor, EN müşteri) | Yok | İhracat KOBİ’si |

#### İleri (102) — yok; Pedagoji «isteğe bağlı paket» der, amiral tek SKU Temel

- Custom GPT / Copilot agent / Gemini Gem ile tekrarlayan ofis işi
- Power Automate / n8n ofis köprüsü (ayrı SKU `06_n8n_automation` vitrinde yok)
- Excel Python / Analyst agent
- RAG «şirket klasörümü sor»
- Değerlendirme: altın tablo, skor kartı, insan örneklemesi
- Prompt injection ve e-posta ile gelen talimat tuzağı
- Kayıt / denetim izi (bu sohbeti iş dosyasına nasıl alırım)

**Sonuç:** Eğitim, pazarın %80’ine «üç kapı + dört uygulama» satmak için tasarlanmış. Amiral gemisi kalitesi (derinlik + transfer + kanıt) için **101 omurgası eksik, 102 yok, seviye etiketi bunu gizlemiyor — açıkça Temel diyor.** İddia ile etiket çatışır: vitrin «amiral lokomotif», modül «ekmek teknesi başlangıç».

### 2.3 Akış, uyum, yüzeysellik

#### Kopukluk 1 — 6’lı iskelet + 3 uydu

Orijinal anlatı:

`Excel temizle → özet → slayt → kutu → hata avı → Cuma 30 + sınav`

Sonra eklenen:

`Gmail asıl kapı → Word ataş → KVKK`

Bu ekleme doğru içeriktir, **yanlış yerdedir.**

- Ders 4 e-postayı öğretir; G1 aynı işi «nerede yazılır» diye tekrarlar. Öğrenci 20+ dakika tekrar dinler.
- Ders 6, Gmail ve Word’ü Cuma bloğuna koyar; «asıl kapıyı sonraki derslerde göreceksin» diye özür diler. **Capstone, beceriden önce gelir.**
- Ders 6 «önceki beş dersin alışkanlığı» der; 7–9 yok sayılır.
- W1 «sekiz ders bitti, sınav açılır» der; K1 hâlâ durur.
- KVKK en sonda: A1’den W1’e kadar yükleme alışkanlığı yerleşir, yasak liste finaldir. Etik omurga **giriş** olmalıdır.

#### Kopukluk 2 — Compact makale «konunun hakkını» vermiyor

Anayasa B4: makale karaoke dakikasıyla kesilmez. Pratikte `section_*.ts` içeriği spoken script’in neredeyse aynısıdır. Çalışma sekmesi **transkript**tir, el kitabı değildir.

- İstisna, kenar durum, ekran yolu, lisans yoksa ne olur, örnek istem varyantları makalede yok.
- Ders 6 ve G1/W1/K1 zaten kısa (hedef 8–9 dk, makale 900–1180 kelime). 4-beat doldurma: ısınma hikâyesi + split ekran methiyesi + üç cep kuralı. Yeni bilgi az.

#### Kopukluk 3 — «Sıra sende» ödevi ölçülmez

Her ders «kendi dosyanı aç» der. `AcademyPracticePanel` «Bağlı değil». `LESSON_PRACTICE` boş. Altın `xlsx` / `docx` yok. Sunucu, öğrencinin tabloyu temizleyip temizlemediğini görmez. Mühür, kaseti bitirme + MCQ’dur.

Bu, Manifesto’daki «iş kanıtı» ile **kategori hatasıdır:** kriptografik mühür var, mesleki kanıt yok.

#### Kopukluk 4 — Simülasyon vs transfer

Web sinema masası (Excel ızgarası, Gmail paneli, Word ataş) «garsonu göster» için güçlüdür. Öğrenci gerçek Copilot’a, gerçek Gmail’e, gerçek `xlsx` indirmesine geçmez. Dron’da bu masa hiç yoktur. Transfer «SIRA SENDE + kendi bilgisayarın» cümlesine bırakılmış.

#### Yüzeysel kalan yerler (ders ders)

| Ders | Güçlü | Yüzeysel / kopuk |
|------|--------|-------------------|
| 1 | A1, birleşik hücre, F2, orijinali koru | Model stereotipi; Copilot vs ataş çatışması; formül yok |
| 2 | Üç madde + karar notu; grafik vaadi yok (dürüst) | İstem iskeleti ince; alıcı rolü sınavda, derste zayıf |
| 3 | Slayt başına tek fikir | «Yazar fırını»; Designer/görsel üretim yok; konuşmacı notu sınavda, sahnede ince |
| 4 | Etiket → taslak → insan → arşiv | G1’in spoileri; Inbox Zero abartısı; «nerede yazılır» G1’e erteli |
| 5 | Halüsinasyon + TOPLA + 59.450 tutarlı örnek | Yalnız Excel aritmetiği; e-posta/sözleşme halüsinasyonu yok |
| 6 | Cuma 10+10+10 fikri sağlam | Çok erken; 7,2 dk alt banda yapışık; sınav köprüsü adlı sahte kapanış |
| G1 | Yerleşik kapı, aksiyon tablosu, göndermeme | Ders 4 tekrarı; lisans matrisi tek rozet |
| W1 | Ataş, üç iş, imza insanda | Sınav yalanı; hukuki kaynak nasıl kilitlenir yok |
| K1 | Yasak liste, maske ≠ silmek, 3. Kapı tanımı | Çok geç; kaset yok; DPA / yurt dışı yok |

**Pedagojik geçiş notu:** 1→2→3 iç tutarlı (tablo→metin→slayt). 3→4 konu atlama olarak kabul edilebilir. 4→5 (kutu sonrası Excel hata avı) gerekçesiz geri dönüş. 5→6 kapanış. 6→G1 «epilog» gibi durur. Bu bir spiral değil, **ek lise yılıdır.**

---

## ADIM 3 — Doküman sorgulaması (kendi ipimizde boğulmama)

Kılavuzlar A Katmanı’nda haklıdır. B Katmanı ve Pedagoji, amiral içeriği **derin ve evrensel** yapmayı birkaç yerde aktif olarak zorlaştırır. Körü körüne savunulmaz.

### 3.1 Savunulması gerekenler (ip değil, omurga)

- A4 / A5: satın alınamayan mühür, hayali kaset yok. Amiral güveni budur.
- İzlemede canlı TTS yok: maliyet ve kalite kontrolü. Doğru.
- SEN dili ve somut sahne: B2C kitle için doğru varsayılan.
- Üç Kapı’nın *yönü* (önce yerleşik, hamal taşıma varsayılan değil): ofis gerçeği.
- «Konunun hakkı» (B4): karaoke dakikasıyla makaleyi kesmeme — **ilke doğru, icra yok.**

### 3.2 Pratiği kısıtlayan veya derinliği engelleyen maddeler

**1) 7–12 dakika karaoke bandı fiilen müfredat anayasası olmuş**

Pedagoji «sayı Anayasa değildir» der; `production-standard.ts` hâlâ 7–12 dk ve 6–12 ders taşır. Bake ve test bu banda kilitler. Sonuç: her ders aynı 4-beat şişirme + üç cep kuralı. Sözleşme hukuku, KVKK yurt dışı aktarım, Copilot lisans matrisi bu banda **sığmaz.** B4 «makalede genişle» der; makale transkript olduğu için kaçış kapanır.

Kısıt: süre bandını ilke (sindirilebilir kaset) olarak tut, **el kitabı makaleyi kasetten bağımsız doyur.** Bugün ikinci cümle kâğıtta var, üründe yok.

**2) 4-beat şablon her derse aynı kalıbı zorlar**

Warm-up hikâyesi + Command + split Comparison + Task, Excel temizliği için parlak. KVKK ve haftalık rutin için tekrarlayan tiyatrodur («Cuma paniği», «kahraman gibi hissettirir»). Pedagoji «tek şablon her alana dayatılmaz» der (§A.1) ve hemen 4-beat’i evrensel reji yapar (§B). Bu iç çelişkidir.

Kısıt: KVKK bir prosedür dersidir (liste, örnek, karşı örnek). 8 punchcard + split ekran onu peri masalına çevirir.

**3) «Aptala anlatır gibi» + sıfır jargon, orta/ileri gerçeği sansürler**

Hedef kitle beyaz yaka ve kamu personelidir, çocuk değildir. Junior kilitli (doğru). Ama «Temel Paket» dili Copilot E3 vs tüketici Gemini, veri yerleşimi, token penceresi, «model eğitiminde kullanılır mı» sorusunu **aşağılar.** Jargon önce günlük karşılık, sonra terim — bu yeterliydi. «Sıfır jargon» fiilen sıfır hassasiyet olmuş.

**4) Üç Kapı dogması diğer kapıları yok sayar**

Sıra faydalı. Kapalı liste zararlı. Teams Copilot, Drive’da soru, NotebookLM, Claude Projects, e-posta ekini yerinde özetleyen araçlar 1–2–3’e sığmaz. «Eşleşme kilitlidir» cümlesi (G1/W1) öğrenciyi yeni araç çıktığında **eğitimin yalan söylediğini** düşünmeye iter. Kilit, 2026 Eylül’ünde Microsoft/Google pazarlama hizasıdır, fizik yasası değil.

Excel’in Pedagoji’de «ataş», derste «Copilot 1. Kapı» olması aynı dogmanın çatlamasıdır: kilit hem çok sert hem tutarsız.

**5) «Soyut AI Masası yasak» doğru; simüle beş masa onun yerine geçemez**

Yasak, sahte evrensel sohbet kutusu satmayalım diye konmuş. İcra: Outlook/Gmail/Word/Excel/PPTX **kopya pencereleri**. Garsonu gösterir, ustayı yetiştirmez. Yasağın ruhu «gerçek kapıyı göster» idi; ürün «gerçek kapının tiyatrosunu göster»e kaymış. Transfer cümleye bırakılmış.

**6) Vitrin karması (`05_prompt_practice` kapı ürünü) amirali sığ bırakıyor**

Prompt iskeleti ayrı SKU’ya ertelenince ofis amirali «şunu yaz» demekle yetiniyor. Öğrenci ₺890 ödeyip istem disiplinini «çok yakında»da bekliyor. Manifesto Motor 1’i amiral gelir diye kurar; Pedagoji kardeş SKU’ları dürüst kabuk yapar — doğru. Ama o kabuk, **amiralin eksik omurgasını gizleme** aracı olmamalı. Ya 101’e asgari prompt iskeleti girer, ya fiyat «refleks paketi» olarak konuşulur.

**7) Compact = diyalog yok = etkileşimli iş kanıtı yok**

`isAcademyCompactLessonKey` → pratik tohumu yok. Bu mimari kısayol, amiral SKU’yu «okuma mührü yeter» sınıfına sokar. Manifesto SHA-256 iş kanıtı der; kod okuma hash’i basar. Kriptografi var, yetkinlik yok. Anayasa A4 sınavı korur; **sınavın neyi ölçtüğünü** Pedagoji boş bırakır. MCQ barajı 70, dosya teslimi 0.

**8) Excel 1. ders «görsel sözleşme» fiilen 8×8 punchcard anayasası**

Pedagoji «PowerPoint Excel imlecine sığmak zorunda değil» der. Bütün dersler 8 cue, aynı rozet ritmi, aynı split beat. Gmail ve Word masaları var ama **reji Excel’dir.** Bu, üretim hızı için rasyonel; içerik çeşitliliği için tavan.

**9) Dron’a sinema masası taşımama, «API-First Core»nun yanlış katmana uygulanması**

B1 hop sicili nakit, sınav, mühür için doğru. Müfredat sahnesi hop değildir; React simülasyonudur. Native’e «T3 Akademi bağlı» denir, sahne web’de kalır. Öğrenci telefonda amiralin asıl vaadini (garsonu göster) alamaz. Manifesto «dron native istemci» der; DURUM dürüstçe «sinema web’dedir» der. Ürün vaadi ile istemci vaadi ayrışır.

**10) «Canlı kaset sayısı Pedagoji’de durmaz» kaçışı, yarım ürünü gizler**

9. ders sınav yolunda, kaset yok. Dürüst. Ama W1 kaseti sınavın açıldığını söylediği için dürüstlük **katmanlar arasında çöker.** Sayıları koda itmek doğru; kaset metnini kodla senkron etmemek A5’i deler.

### 3.3 Dokümanların amirale etkisi — net hüküm

| Belge | Amiral derinliğine etkisi | Tavsiye (tedavi değil, yön) |
|-------|---------------------------|------------------------------|
| ANAYASA A | Engellemez; güven tavanı koyar | Dokunma |
| ANAYASA B4 | Derinliği *ister*; icra transkript | Makaleyi kasetten ayır |
| ANAYASA B1 | Nakit/API için doğru; sahneyi hop sanmak zarar | Sahne = web yeteneği, hop = ilerleme/sınav |
| MANIFESTO «kanıt» | MCQ mühürle karşılanmış | Kanıt tanımını dosyaya genişlet veya iddiayı küçült |
| PEDAGOJI 4-beat + 7–12 dk | Tekrar ve sığlık üretir | Reji varsayılan, zorunlu kalıp değil |
| PEDAGOJI Üç Kapı kilidi | Yararlı sıra, zararlı kapalı liste | Sıra öğret, eşleşmeyi «bugünün varsayılanı» de |
| PEDAGOJI vitrin karması | Odak iyi; amiral omurgasını dışarı atmasın | Prompt iskeleti 101’e geri |

**Hüküm:** Kılavuzlar amirali «güvenli ve satılabilir kısa kaset» olarak optimize eder. «Evrensel ve derin ofis-AI» ayrı bir ürün hedefidir. İkisini aynı 8×9 dakikalık 4-beat’e sıkıştırmak, kendi ipimizdir.

---

## ADIM 4 — Beyin fırtınası ve danışmanlık

### 4.1 SEN OLSAYDIN NE YAPARDIN?

Sıfırdan amiral: **refleks kaseti + el kitabı + ölçülen iş**, tek SKU’da. Süre 90 dakikalık karaoke tavanına tapılmaz; 101 ~10–12 kaset × 8–12 dk + her kasetin **kasetten uzun** makalesi + 3 altın dosya.

#### Hedef bilgi mimarisi (önerilen 101)

```
0. HARİTA          Tüketici / Workspace / Copilot lisans — 1. Kapı yoksa ne olur
1. GÜVEN           KVKK, gölge AI, maske, yurt dışı, «silmek geri almaz»     ← ŞİMDİ 9. ders
2. TABLO           A1 + Üç Kapı (ataş asıl, Copilot varsa şerit)
3. SAYI            Tür birliği, F2, formül vs sohbet özeti
4. ÖZET            Üç madde + karar notu + istem iskeleti (alıcı/amaç/biçim/kısıt)
5. HATA AVI        TOPLA kilidi + «akıcı metne güvenme»
6. YAZI            Sözleşme ataş (imza insanda)
7. YAZI            Dilekçe + rapor (aynı kapı, ayrı istem)
8. SLAYT           Tek fikir + konuşmacı notu + taslağı taşı
9. KUTU            Gmail Gemini + Outlook Copilot TEK ders (4+G1 birleşir)
10. TOPLANTI       Transkript → aksiyon (şimdi yok; 101’e asgari bir kaset)
11. SİSTEM         Cuma 30 — gerçek capstone, sınav köprüsü burada
12. PORTFÖY        Üç dosya teslimi (xlsx temiz + özet + maskeli soru) — mühür buna bağlanır
```

**Bilerek dışarıda (102 / kardeş SKU):** ajan, n8n, RAG, custom GPT, red-team. Vitrin karması burada meşru.

**Bilerek içeride (şimdi yok):** KVKK başta; e-posta tek hat; capstone sonda; prompt iskeleti 4. derste; toplantı en az bir kaset; makale transkript değil.

#### Her dersin üç katmanı (şimdi tek katman)

1. **Kaset (7–12 dk):** tek refleks, garsonu göster, 4-beat *isteğe bağlı*.
2. **El kitabı (makale):** lisans yoksa, kenar durum, 3 istem varyantı, «bunu yapma» listesi. B4’ün gerçek yeri.
3. **İş:** altın dosya veya prompt-pack. Sunucu kontrol eder. Compact kaçışı kapanır.

Sınav: 10 MCQ **artı** en az bir dosya/prompt görevi. A4 sunucu puanını korur; ölçülen şey değişir.

İki paket ( Pedagoji’nin izin verdiği Temel/İleri ayrımı ):

- **101 Tüketici / KOBİ** — ataş + Gmail Gemini + maske (lisans varsaymaz).
- **102 Lisanslı Copilot** — şerit, toplantı, kiracı, DPA. Aynı amiral markası, ayrı SKU.

Bugünkü tek SKU ikisini karıştırdığı için ne lisanslıyı doyurur ne lisanssızı dürüstçe kucaklar.

### 4.2 PLATFORM KURGUSU DOĞRU MU?

**Kısa cevap:** Nakit, kimlik, mühür ve Dron hop’ları için **evet**. Öğretim formatı için **kısmen**. «Core + micro-apps» cümlesi bu eğitimin asıl sorununu çözmez.

#### Doğru olan

- Müfredat gövdesinin `@yetkin/kernel`’e girmemesi. Kernel para, katalog kimliği, zarf, hop. İçerik dikeydir. Bu ayrım doğru.
- API-First yazma (satın alma, tamamlama, sınav, mühür) web-only sessiz yazmaya tercih. Dron’un sınav/kasa taşıması A4/A2 ile uyumlu.
- Bake / izleme ayrımı (mühürlü MP3, izlemede üretici API yok): maliyet, A5, tekrarlanabilir kalite.
- CMS olmayışı mühür bütünlüğü için rasyonel (curriculumSeal). Amiral 9 ders için idare eder; 13 SKU × 10 ders CMS’siz kırılır — o sonraki ölçek sorunu.

#### Yanlış veya erken olan

1. **Öğretim runtime’ı «shared kernel yeteneği» değil, tek bir web sinema motorudur.** Excel/Gmail/Word klonları micro-app değil, `components/academy/*` içinde şişen dikey UI. Bunu kernel’e taşımak yanlış; Dron’a hop ile «masa» göndermek de yanlış (ağır, native klon pahalı). Dürüst ürün: **sahne web’de kanon, Dron’da karaoke+metin+sınav ve «tam sahne tarayıcıda» cümlesi.** Bugün DURUM bunu söylüyor; vitrin «Sesli Anlatım + Karaoke» ile iki istemciyi eşitliyormuş gibi duruyor.

2. **Compact makale formatı öğretim boru hattını kısırlaştırıyor.** Diyalog tiyatrosundan kaçmak doğruydu. Compact’ın yan etkisi — pratik yok, makale=script — yanlış. Format «düz yazı» olmalı, «kanıt yok» olmamalı.

3. **Simülasyon, laboratuvar yerine geçiyor.** Micro-app olsaydı her masa: (a) altın dosya, (b) öğrenci çıktısı, (c) sunucu farkı. Bugün masa animasyondur.

4. **Kardeş SKU’lar (`02`–`05`) ayrı micro-app değil, aynı oynatıcı kabuğunun boş gövdeleri.** Mimari kopyalanabilir; içerik yok. Amiralin «platform doğru mu?» sorusu bu kabuklarla cevaplanmaz. Platform, **tek dolu SKU’yu** taşıyor.

5. **«Core + micro-apps» eğitim formatını doğrulamaz.** Core (cüzdan, kimlik, mühür) sağlam olmasa amiral satılamaz — o önkoşul. Eğitim kalitesi core’dan gelmez; müfredat sırası, el kitabı, ölçülen işten gelir. Mimarlık borusu temiz, musluk sığ.

**Hüküm:** Platform kurgusu *satış ve kanıt URL’si* için doğru hizada. *Amiral öğretim deneyimi* için web sinema + transkript + MCQ bir MVP’dir; gemisi değildir. Dron’u eşdeğer öğretim istemcisi ilan etmek şu an yanlış olur.

### 4.3 BİR SONRAKI AŞAMA — ilk tedavi adımı

Sıra: **yeni kaset basma.**

`k1` bake kuyruğunda duruyor. Mevcut sırada mühürlemek «KVKK en sonda» + «W1 sınavı açtı» yalanını **sesle çimentolar.** TTS maliyeti geri alınamaz.

**Tedavi-0 (bu rapordan sonra ilk iş): Müfredat kilit belgesi — sıra, vaat, tek e-posta hattı.**

Tek sayfalık, Super Admin imzalı karar. Kod ve kaset bu karara bağlanır. Önerilen kilitler:

1. **Sınav vaadi tek yerde:** Yalnız son ders. W1 konuşma metninden «sekiz ders bitti / sınav açılır» çıkar (re-bake zorunlu). Ders 6 başlığından «Sınav Köprüsü» çıkar.
2. **KVKK başa veya 2. sıraya** (yükleme alışkanlığından önce). `k1` kaseti **yeni sırada** mühürlenir.
3. **E-posta tek ders:** 4 ile G1 birleşir veya 4 «köprü / 3 dk» olur, asıl kapı G1’dir. İki tam kaset bırakılmaz.
4. **Cuma 30 sona** (Word + kutu + KVKK’dan sonra capstone).
5. **Makale ≠ transkript kararı:** her ders için makalede kasetin taşımadığı en az: lisans yok yolu, bir kenar durum, bir «yapma».
6. **Kanıt kararı:** ya compact kaçışı kırılarak altın dosya/prompt-pack bağlanır, ya vitrin cümlesi «izle + test» diye küçülür. İkisi birden iddia edilemez.

Bu kilit olmadan yapılacak her bake, her punchcard, her Dron türevi **yanlış omurgayı çoğaltır.**

Hemen sonra (Tedavi-1, hâlâ içerik): W1 re-bake (P0 yalan). Sonra sıra kaydırma + G1/L4 birleştirme senaryosu. K1 TTS en son, doğru yerde.

Yapılmayacak ilk işler: yeni kardeş SKU içerik üretimi, Veo bütçesi, 4-beat’i daha sıkı test etme, `05_prompt_practice` fırını. Amiral omurgası eğri iken yatay genişleme israftır.

---

## Ek A — Öncelik kuyruğu (tedavi ekibine)

| ID | Öncelik | Tür | Madde |
|----|---------|-----|--------|
| T0 | P0 | Karar | Hedef sıra + sınav vaadi kilidi (bu rapor §4.3) |
| T1 | P0 | İçerik + bake | W1 «sekiz ders / sınav açılır» mühürlü yalanı |
| T2 | P0 | İçerik | Ders 6 başlık/hedef: Sınav Köprüsü değil Haftalık Sistem |
| T3 | P1 | Mimari | KVKK’yı yükleme derslerinden önceye al; `k1`’i yeni yerde mühürle |
| T4 | P1 | Mimari | L4 + G1 tek e-posta hattı |
| T5 | P1 | Mimari | Cuma 30’u capstone yap |
| T6 | P1 | Pedagoji | Compact makaleyi el kitabına çıkar (B4 icrası) |
| T7 | P1 | Kanıt | Altın dosya veya vitrin iddiasını küçült |
| T8 | P1 | SSOT | Excel 1. Kapı: Pedagoji ataş vs ders Copilot — tek cümle |
| T9 | P2 | İçerik | «Yazar fırını» ve model stereotipi (ders 1/3) re-bake |
| T10 | P2 | İçerik | Toplantı/takvim 101 kaseti; Sheets dürüstçe kapsam dışı veya mini ders |
| T11 | P2 | Sınav | Havuz tekrarlarını budama; dosya tipi soru |
| T12 | P2 | İstemci | Dron: sahne yok cümlesi ürün UI’sında (DURUM’daki dürüstlük vatandaşa) |
| T13 | P3 | Ops | `docs/curriculum/` eksik 06/g1/w1/k1 artefaktları — fırın SSOT’su dağınık |

---

## Ek B — Kaynak dizin (taranan SSOT)

Kılavuz: `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `DRON_CLIENT_SPEC.md`; `docs/DURUM.md`; `docs/ops/akademi-bake-elkitabi.md`.

Müfredat: `lib/academy/curricula/office_ai/` (`index.ts`, `planned.ts`, `section_1`…`6`, `section_g1`, `section_w1`, `section_k1`); `lib/academy/curricula/lesson-index.ts`; `lib/academy/curriculum.ts`.

Yayın: `lib/academy/pilot-sku.ts`, `production-standard.ts`, `citizen-player-layer.ts`, `lesson-audio.ts`, `learning-outcomes.ts`, `catalog-summaries.ts`, `catalog-pricing.ts`.

Sınav: `lib/academy/exam-pools.ts`, `lesson-exams/`, `exam-duration.ts`, `exam.ts`.

Sahne: `lib/academy/ai-desk.ts`, `excel-workspace.ts`, `gmail-workspace.ts`, `outlook-workspace.ts`, `word-workspace.ts`, `pptx-workspace.ts`, `kvkk-workspace.ts`, `weekly-routine-workspace.ts`; `components/academy/lesson-*-workspace.tsx`, `curriculum-player.tsx`.

Kanıt boşluğu: `lib/academy/lesson-practice.ts` (boş), `proof-of-work.ts` (compact kaçışı).

Dron: `apps/rail-is/src/screens/AcademyPlayerScreen.tsx`; DURUM «sinema web’dedir».

---

## Kapanış bildirimi

SUPER ADMIN: `01_office_ai` tespit raporu `docs/TESPIT_RAPORU_01_OFFICE_AI.md` yoluna yazıldı. Tedavi uygulanmadı. Ürün satılabilir ve A5’e büyük ölçüde uygun bir **Temel refleks paketidir**; amiral gemisi derinliği için omurga sırası, mühürlü W1 vaadi, KVKK’nın yeri ve ölçülen iş kanıtı kilitlenmeden yeni kaset basılmamalıdır.
