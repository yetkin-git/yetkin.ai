# 01_office_ai — Tespit ve Analiz Raporu

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | Cursor Ajanı → SUPER ADMIN |
| Kapsam | Amiral SKU `01_office_ai` müfredat, medya, sınav, kılavuzlar, Shared Kernel / Dron entegrasyonu |
| Yöntem | Kod + kaset + kılavuz karşılaştırması. Dokümanlar kutsal sayılmadı. Üretim veritabanına bağlanılmadı. |
| Statü | Tespit. Tedavi bu raporda uygulanmaz. |

Çelişkide Anayasa **A Katmanı** bağlayıcıdır. Bu rapor ürün kodunu import etmez; `docs/DURUM.md` ile aynı sınıftadır (build fixture değil).

---

## 0. Yönetici özeti

`01_office_ai` yayınlanmış bir iskelettir, dünya çapında bir ofis-AI müfredatı değildir.

**Ne çalışıyor.** 9 derslik sınav yolu kodda kilitli. 9/9 mühürlü kaset ve karaoke var. Üç Kapı (yerleşik → ataş → maskeli kısa özet), KVKK bekçisi, insan-onayı ve Cuma 30 rutini doğru pedagojik çekirdektir. Nakit, mühür ve hop omurgası amiral SKU’yu taşıyacak kadar ayaktadır.

**Ne kırık.** Kaset (kulak) ile compact makale (göz) aynı omurgayı anlatmıyor. KVKK ve “hata avı → e-posta” sırası makaleye ve `lesson-index.ts`’e yazılmış; mühürlü ses hâlâ eski 6’lı sırayı (Excel → rapor → slayt → kutu → hata avı → Cuma) ezberletiyor. Öğrenci karaoke dinlerse bir müfredat, Tam Ders Metni okursa başka müfredat öğrenir. Sertifika ikisini de aynı mühürle basar.

**Ne eksik.** Pivot / Power Query, Google Sheets, Teams / toplantı notu, takvim, PDF-OCR, kurumsal veri sınırı (ticari Copilot vs tüketici ChatGPT), değerlendirme laboratuvarı ve iş kanıtı laboratuvarı yok. `LESSON_PRACTICE` boştur; ders kapanışı `compact-read` hash’idir. Kanıt, izlemedir.

**Ne kısıtlıyor.** Pedagoji’nin 7–12 dk karaoke bandı, Excel Altın Şablon’un her masaya dayatılması, Dron’un sinemayı klonlamaması ve ders anahtarlarının (`1, k1, 2, 3, 5, 4, g1, w1, 6`) pedagojik sırayla çatışması. Bunlar Anayasa A maddesi değildir; ürün tercihinin faturasıdır.

**Tedavi önceliği.** (1) Tek omurga SSOT. (2) Kaset–makale sapmasını re-bake ile kapat. (3) Anahtarları pedagojik sıraya hizala veya vatandaşa sıra numarasını anahtardan ayır. (4) Gerçek iş kanıtı ekle. (5) 101/102 ayrımı veya doygun ek derslerle evrensel ofis-AI’ye çık.

---

## ADIM 1 — Mevcut durum analizi

### 1.1 Yayın tablosu (kod gerçeği)

Canlı sınav yolu `lib/academy/curricula/lesson-index.ts` SSOT’tur. Pedagojik sıra `planned.ts` ile aynıdır. Ders **anahtarları** tarihsel numarayı korur.

| Sıra | Anahtar | Başlık | Hedef dk (section) | Mühürlü ses | Karaoke |
|------|---------|--------|--------------------|-------------|---------|
| 1 | `01_office_ai-1` | Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo | 9.0 | 571.84 sn (~9.5 dk) | var |
| 2 | `01_office_ai-k1` | KVKK, Şirket Sırları ve Maskeleme | 8.5 | **309.713 sn (~5.2 dk)** | var |
| 3 | `01_office_ai-2` | Rapor Otomasyonu: Tablodan Yönetim Özetine | 9.3 | 500.12 sn (~8.3 dk) | var |
| 4 | `01_office_ai-3` | Sunum Fabrikası: Metinden Slayta | 9.5 | 533.76 sn (~8.9 dk) | var |
| 5 | `01_office_ai-5` | İstisnalar & Hata Avı: AI Yanılınca | 8.9 | 481.96 sn (~8.0 dk) | var |
| 6 | `01_office_ai-4` | E-Posta Akışı: Gelen Kutusu Sıfırlama | 9.6 | 544.52 sn (~9.1 dk) | var |
| 7 | `01_office_ai-g1` | Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi | 8.7 | 523.6 sn (~8.7 dk) | var |
| 8 | `01_office_ai-w1` | Word: Sözleşme, Dilekçe, Rapor | 8.8 | 521.44 sn (~8.7 dk) | var |
| 9 | `01_office_ai-6` | Haftalık Sistem: 30 Dakikalık Rutin | 8.0 | 412.04 sn (~6.9 dk) | var |

Toplam mühürlü konuşma ≈ **4400 sn / 73.3 dk**. Modül `estimatedTotalMinutes: 73.32` bunu yansıtır. Kurs 45–90 dk bandına sığar.

**Üretim standardı ihlali:** `ACADEMY_AI_LESSON_DURATION_MIN_MINUTES = 7`. `k1` ~5.2 dk, `6` ~6.9 dk. Testler fonksiyonu kilitler; canlı kasetlere uygulamaz. `k1` yedek TTS (`gemini-2.5-flash-preview-tts`) ile mühürlenmiş kısa bekçi dersidir — omurgada 2. ders olduğu halde spot kaset gibi durur.

Modül kimliği: `CURR-OFFICE-AI-101`. Vitrin fiyat tohumu ₺890 (`89000` kuruş). Kategori: Katman 1.1 “Ekmek Teknesi”. Hedef kitle: beyaz yaka, muhasebe, İK, asistan, kamu, KOBİ, öğrenci. Metodoloji: sıfır kod, SEN dili, Gözde / Callirrhoe.

Öğrenim çıktıları (`learning-outcomes.ts`) 9 madde ile omurgayı doğru listeler. Vitrin özeti de doğru. **Kulak bu tabloyu dinlemez.**

### 1.2 Dosya envanteri (tek ürün, çok SSOT)

| Katman | Yol | Rol |
|--------|-----|-----|
| Sınav sırası | `lib/academy/curricula/lesson-index.ts` | Anahtar dizisi |
| Plan haritası | `lib/academy/curricula/office_ai/planned.ts` | Pedagojik vaat + yöntem |
| Compact makale | `lib/academy/curricula/office_ai/section_*.ts` | Vatandaş Tam Ders Metni |
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-*.md` | TTS kaynağı |
| Cue | `lib/academy/lesson-cues/` **ve** `docs/curriculum/*_cue.json` | Karaoke + bake |
| Timings | `lib/academy/lesson-audio-timings/` | Saat SSOT |
| Mini sınav | `lib/academy/lesson-exams/` (9/9) | Ders sonu 3 soru |
| Kurs havuzu | `lib/academy/exam-pools.ts` (42 soru) | 10 soruluk çekim, 30 dk, baraj 70 |
| Sinema sahnesi | `lib/academy/cinema-cue-catalog.ts` + workspace TS | Excel / Outlook / Gmail / Word / KVKK / Cuma masaları |
| Bake senaryo | `docs/curriculum/*_script.md`, `*_doygun_iskelet.md` | Operatör; kısmen eski |
| Medya | `public/media/academy/audio/01_office_ai/` (9 mp3 + 1 reused bed) | İzlemede generate yok |
| B-roll | `01_office_ai-1-warmup` **9 derste reuse** | Bütçe kalkanı; görsel tekdüzelik |
| İş kanıtı | `lib/academy/lesson-practice.ts` = `{}` | Compact-read |
| Dron | `apps/rail-is` punchcard JSON import | Sinema yok; metin + rozet + tamamlama |
| Kardeş SKU | `02`–`05` vitrinde “Çok Yakında”; ders sayısı 0 | Dürüst kabuk |

`docs/curriculum` eksikleri: `06` / `g1` / `w1` tam script yok (iskelet var); `k1`/`g1`/`w1`/`06` exam JSON yok (canlı kopya `lib/academy/lesson-exams`). Bake el kitabı hâlâ “tek kaynak `docs/curriculum/01_office_ai_01_cue.json` + timings” der; pratikte canlı cue `lib/academy/lesson-cues`’tadır. **İki cue ağacı drift üretir.**

Müfredat fihristi `curriculum-syllabus.ts` dersleri 4’lü gruplara ayırır (`Modül 1/2/3`). 9 ders için anlamsız dilimdir (4+4+1). Vatandaşa “modül” satılmaz; iç borçtur.

### 1.3 Yanlış bilgiler ve kaset–makale sapması (P0)

Bu bölümün iddiası spekülasyon değildir. Compact makale `section_*.ts`; kaset `spoken-scripts` + timings JSON + (çoğu yerde) cue JSON’dur. Karaoke kaseti okur.

#### P0-1 — 1. ders kapanış köprüsü iki farklı “2. bölüm” satar

- **Makale** (`section_1.ts`): sonraki ders KVKK ve maskelemedir.
- **Kaset** (`spoken-scripts/01_office_ai-1.md`, timings, cue, `docs/curriculum/01_office_ai_01_script.md`): “Bir sonraki derste bu temiz veriyi alıp tek tıkla üç maddelik yönetim özetine dönüştüreceğiz. Hazırsan 2. bölümde buluşalım.”

KVKK omurgaya 2. ders olarak sokulmuş; 1. kaset re-bake edilmemiştir. Öğrenci kulaktan “sırada rapor var” öğrenir, UI’da KVKK görür.

#### P0-2 — 5. ders kaseti hâlâ eski 6’lı sıradadır

Makale (`section_5.ts`): “Dördüncü dersimizde Sunum Fabrikası… Sıradaki ders e-posta ritüelidir.”

Kaset (`spoken-scripts/01_office_ai-5.md`):

- Açılış: “Dördüncü dersimizde **gelen kutusu krizini** çözmüşüz.”
- Kapanış: sıradaki ders **6. bölüm / Haftalık Sistem / Sınav Köprüsü**. E-posta, Gmail, Word atlanır.

Pedagojik sırada 5. dersin dünü slayt, yarını e-posta ritüelidir. Kaset bunun tersini söyler.

#### P0-3 — 4. ders (e-posta) kaseti hem sıra hem vaat olarak eskidir

Makale (`section_4.ts`): dün hata avı; bugün **ritüel**; panel G1’dedir; “gönder” insan onayına bağlıdır.

Kaset (`spoken-scripts/01_office_ai-4.md`):

- Kendini **dördüncü ders** ilan eder.
- Dünü **Sunum Fabrikası** sanır (hata avını atlar).
- Copilot / Gemini panelini bu derste öğretir (G1 ile çakışır).
- Saha görevinde taslağı “düzenleyerek **gönderimini yap**” der.
- Yarını **Hata Avı (5. bölüm)** sanır. Canlı sırada yarın G1’dir.

#### P0-4 — 2. ve 3. ders “kaçıncı bölümüz?” yalanı

- Rapor kaseti (`01_office_ai-2`): “bu **ikinci** bölümünde”; KVKK’yı unutur; slaytı “**3. bölüm**” diye satar. Makale slaytı “**4. bölüm**” der (KVKK’yı sayar) ama recap hâlâ yalnız Excel’dir.
- Slayt kaseti (`01_office_ai-3`): “serüvenimizin **üçüncü** dersine hoş geldin.” Pedagojik olarak 4. derstir.

`academyPreviousLessonBridge` (“Ne Öğrenmiştik?” + üç madde kontrol) kodda vardır; ofis amiralinde kullanılmaz. Köprüler serbest düzyazıdır ve sürümler çatışır.

#### P0-5 — Sinema kartları eski sırayı reklam eder

`cinema-cue-catalog.ts`:

- `01_office_ai-5` SIRA SENDE: “Sonra haftalık rutin” / “L6 rutin köprüsü” — e-posta/G1/W1 yok.
- `01_office_ai-6` SIRA SENDE: “Sonra Gmail yerinde, Word ataş” / “L7 Gmail köprüsü” — oysa 6 artık **son** derstir; G1/W1 geridedir.

Cue-8 punchcard, kapanış kasetiyle çelişir.

#### P0-6 — `docs/DURUM.md` 1. dersi yanlış özetler

“1. ders | Üç Kapı + A1 hijyeni + **yönetim özeti** (`01_office_ai-1`)” — yönetim özeti `01_office_ai-2`’dir. “3. ders | PowerPoint” anahtar sırasına göre doğru, pedagojik 3. derse (rapor) göre yanlış. Haftalık kesit, omurga kargaşasını çoğaltır.

#### P0-7 — İçerik hataları / abartılar

- “**2026 modelleri dağınık ızgarayı da okuyabilir**” — kısmen doğru, A1’i “kör fizik yasası değil” diye yumuşatır; sonra kaset hâlâ A1’i sihirli başlangıç gibi satar. Mesaj tutarlı ama sınav hâlâ A1’i mutlak kapı gibi sorar.
- “Dil modelleri matematiksel işlemci değildir” (hata avı) doğrudur. Excel Copilot / Python in Excel / TOPLA motoru ayrımı öğretilmez; öğrenci “modele hesaplattır, sonra yine modele denetlettir” döngüsünde kalır. Asıl kilit tablo motorudur (`q_off_15` bunu bilir; kaset zayıf bağlar).
- E-posta kaseti “otomatik taslak”, “güvenle gönder”, “hiçbir fırsatı kaçırma korkusu yok” der. Makale ve G1: taslak ≠ gönder. **Gönder refleksi kasetle zehirlenir.**
- “Sıfır hata standardı” (hata avı cebine koy) amatör vaattir. Profesyonel dil: risk düşer, sıfırlanmaz.
- `q_off_17` çeldiricisi “Sınavı 6. derste açmak” — anahtar `01_office_ai-6` artık 9. derstir. Eski numaradan kalma tuzak, yeni numarada kafa karıştırır.
- Havuzda tekrar: `q_off_28`≈`q_off_35`, `q_off_34`≈`q_off_39`, KVKK soruları mini sınavla örtüşür. 42 kök iddiası şişkindir.
- G1 sinema rozeti hâlâ “Taşıma su **yasak**”; Pedagoji E.10 bunu “atlanmış kapı” yaptı. Eski dogma sahnede durur.

### 1.4 Eksik konular (amiral iddiasına göre)

Kurs, **Microsoft Excel + slayt iskeleti + Gmail/Outlook ritüeli + Word ataş + KVKK uyarısı + Cuma takvimi** öğretir. “İş hayatında ve ofiste yapay zekâ” başlığı bundan geniştir.

**Ofis omurgasında yok veya bir cümle:**

1. **Tablo düşüncesi:** Excel Tablo (Ctrl+T), yapılandırılmış başvuru, Power Query / Get Data, pivot, grafik, koşullu biçim, veri doğrulama. A1 hijyeni var; analist refleksi yok. `planned.ts` açıkça “grafik vaadi bu derste yoktur” der — vaat sonraki derse de konmamış.
2. **Google Workspace:** Sheets, Docs, Slides, Drive. Rapor el kitabı “Google Sheets kapsam dışı, CSV indir” der. TR KOBİ + öğrenci + kamu hibritinde Sheets fiilen ana araçtır.
3. **Toplantı yığını:** Teams / Meet / Zoom AI notu, aksiyon maddesi, transkript → görev. Ofis zamanının büyük kısmı kutuda değil toplantıdadır.
4. **Takvim ve görev:** Outlook/Google Calendar, Copilot “hazırlan”, çakışma, Cuma 30’u gerçek takvim olayına bağlama (şimdi sözlü ödev).
5. **PDF, tarama, fatura, dekont OCR.** “PDF’e basma” sınavda yanlış şık; PDF’yi **okutmak** öğretilmez.
6. **Kurumsal vs tüketici modeli:** Microsoft 365 Copilot (kiracı, commercial data protection), Copilot Chat, ChatGPT Business/Enterprise, Gemini for Workspace, tüketici ChatGPT. 2. Kapı “Gemini/ChatGPT’ye ataşla” birçok şirkette KVKK dersini fiilen deler — k1 “ham kişisel veri gitmez” der, **şirket sırrının ABD tüketici modeline gitmesi** zayıf işlenir.
7. **İstem ustalığı:** alıcı / amaç / biçim / kısıt (rapor dersinde bir kez). Çok turlu düzeltme, karşı-örnek, değerlendirme rubriği, “uydurma sayı yok” kilidi sistematik değil. `05_prompt_practice` “kapı ürünü / çok yakında” olduğu için amiral bu yükü taşımak zorundadır; taşımaz.
8. **Word derinliği:** stil, değişiklik izi, başlık stilleri, karşılaştır, dilekçe dışında resmî yazışma (teklif, tutanak, icra, EBYS). Üç iş kartı (sözleşme / dilekçe / rapor) iyidir, sığdır.
9. **Slayt gerçekliği:** şirket teması, erişilebilir kontrast, konuşmacı notu vs slayt gövdesi (sınavda var, pratikte zayıf), Designer vs Copilot vs ataş.
10. **E-posta gerçekliği:** kural / etiket otomasyonu, paylaşılan kutu, CC/BCC, yanlış kişiye gönder riski, “undo send”, imza bloğu, thread vs yeni mail.
11. **İnsan + araç iş akışı:** taslak → insan → kayıt → paylaşım (OneDrive/Drive izinleri). Cuma 30 üç blok söyler; teslim kanalını (Teams kanalı, EBYS, e-posta eki) öğretmez.
12. **Ölçme:** iş kanıtı laboratuvarı yok. Mini sınav 3 MCQ. Kurs sonu 10 MCQ / 42 havuz. Sertifika “ofiste yapay zekâ kullanır” iddiasını **izleme + şık** ile basar.

**Kasıtlı dışarıda bırakılanlar (doğru, ama vitrin cümlesini daraltmalı):** VBA, Gamma, Marp, ajan çerçeveleri, n8n, RAG. Pedagoji bunları zorunlu kılmaz — iyi. Vitrin başlığı hâlâ evrensel ofis-AI vaadeder.

### 1.5 Güncelliğini yitirmiş yaklaşımlar

- **Excel’i “ Copilot şeridi veya sohbete ataş” ikilisine indirgemek.** 2025–2026 ofisinde üçüncü yol vardır: dosyayı kiracı içi Copilot Chat’e vermek, Python in Excel, analist ajanları. Müfredat 2024 “chatbot’a tablo yapıştır” dünyasından bir adım ötededir, iki adım geridedir.
- **PowerPoint = metinden slayt iskeleti.** Copilot’un yerinde slayt üretimi, Designer, şirket şablonu kilidi, “slayt başına tek fikir” ile çatışan otomatik 8-slayt şablonları işlenmez.
- **Outlook 142 okunmamış → sıfır kutu** sahne vaadi. Gerçek kutu sıfırlanmaz; **triage** edilir. “Sıfır kutu sihir değildir” makalede var, kaset hâlâ dönüşüm mucizesi satar.
- **Tek B-roll, tek bed, tek Excel imleci.** 9 kaset aynı warmup MP4 ve (2–k1) aynı Lyria bed. “Garsonu göster” ilkesi, görsel olarak aynı lokantanın aynı masasıdır.
- **Compact-read = iş kanıtı.** Manifesto “iddianın bedava olduğu dünyada kanıt” der. Amiral SKU’da pratik haritası boştur. Bu, 2023’ün “videoyu izledin, sertifika bas” modelidir.
- **Anahtar şeması `1…6` + sonradan `k1/g1/w1`.** Omurga genişletildikçe numara yalanı büyür. 2026’da hâlâ “5. ders 4. dersten sonra, 6. ders 9. sırada” anlatılır.

### 1.6 Pedagojik ve mantıksal akış

**Tasarlanan omurga (doğru iskelet):**

```
Excel hijyeni → KVKK bekçisi → yönetim özeti → slayt
    → hata avı (sayı kilidi) → e-posta ritüeli → Gmail/Outlook kapısı
    → Word ataş → Cuma 30 capstone → sınav
```

Bu sıra pedagojik olarak savunulur: yüklemeden önce bekçi; slayttan önce özet; e-postadan önce sayı kilidi; panelden önce ritüel; kapanışta birleştir.

**Gerçek öğrenci deneyimi:**

1. Karaoke eski omurgayı anlatır (P0).
2. 4. ve G1 **aynı e-posta işini iki kaset** yapar; biri “ritüel”, kaseti “panel + gönder”; G1 “panel + gönderme”. Çiftleme + çelişki.
3. KVKK 5.2 dakikalık dipnot gibi durur; ardından rapor kaseti onu yok sayar. Bekçi, alışkanlık oluşmadan unutulur.
4. Hata avı slayttan hemen sonra (makale) veya kutudan sonra (kaset) gelir. İkinci senaryoda öğrenci uydurma sayıyı slayta taşımış olarak kutuya geçer.
5. Cuma 30 üç bloğu (Excel / slayt / kutu) Word’ü ve KVKK’yı takvime yazmaz. W1 “Word’ü Cuma’ya bağlar” der; capstone 10+10+10’da Word yok.
6. “Sıra sende” ödevleri platform dışı (“kendi Excel’ini aç”). İçeride laboratuvar yok. Transfer ölçülmez.
7. 4-beat + GİRİŞ KÖPRÜSÜ + CEBİNE KOY = 8 punchcard. İyi ritim. İçerik drift’i ritimden bağımsız çürür.

**Kopukluk haritası (tek bakış):**

| Geçiş | Makale | Kaset | Kopukluk |
|-------|--------|-------|----------|
| 1 → 2 | KVKK | Rapor | P0-1 |
| k1 → rapor | var | k1 kaseti doğru; rapor kaseti k1’i unutur | Recap kopuk |
| rapor → slayt | 4. bölüm | 3. bölüm | Numara yalanı |
| slayt → hata avı | var | hata avı kaseti dünü kutu sanır | P0-2 |
| hata avı → kutu | var | kutu kaseti dünü slayt, yarını hata avı sanır | P0-3 |
| kutu → G1 | ritüel / panel ayrımı | kutu kaseti paneli de öğretir | Çiftleme |
| G1 → W1 | var | büyük ölçüde hizalı | Zayıf |
| W1 → Cuma | var | var | Sinema “sonra G1” der |
| Cuma → sınav | kapı açık | kapı açık | Tutarlı |

---

## ADIM 2 — Kılavuz dokümanların sorgulanması

Üç belge 15 Eylül 2026 “tedavi” reformundan geçmiş: sayılar Anayasa/Manifesto’dan `docs/DURUM.md` + koda alınmış. Bu doğru yöndür. Aşağıdaki eleştiri A Katmanı’nı inkâr etmez; B Katmanı ve felsefe belgelerinin **amiral müfredatı nasıl boğduğunu** söyler.

### 2.1 ANAYASA.md — ne durmalı, ne pratikten uzak

**Durmalı (A).** `amountMinor`, S43, RLS/IDOR, sınavın sunucuda puanlanması, sertifikanın satın alınamaması, dürüst kapalı yüzey. Ofis SKU bunlara yaslanır. Taviz istenmez.

**B1 API-First.** İlke doğrudur. Uygulama yarım: Akademi hop’ları (satın alma, kilit, müfredat yaz/oku, sınav, sertifika) sicildedir. **Sinema sahnesi, karaoke senkronu, Excel waiter DOM’u hop değildir.** Dron T3 “bağlı”dır ama garsonu göstermez. Anayasa “yazma web-only bırakılmaz” der; **öğretim yüzeyi zaten web-only’dir** ve B1 bunu görmez.

**B4 Müfredat.** “Compact yayın makalesi kelime tavanı veya sabit ders adediyle kesilmez” — makale için iyi. Karaoke 7–12 dk bandı `production-standard.ts`’te durur. Sonuç: makale doyar, kaset kesilir (`k1` 5.2 dk). B4 ile C bandı fiilen savaşır. Anayasa “sayı taşımaz” deyip sayıyı koda sürmüştür; kod hâlâ kota gibi davranır, test canlı kaseti yok sayar. **En kötü iki dünya:** kota var, kota uygulanmıyor, kota omurgayı yine kesiyor.

**B4’ün sessiz varsayımı:** “yayın = makale + mühürlü karaoke.” İş kanıtı, laboratuvar, dosya teslimi yok. A4 “kanıt satın alınamaz” der; kanıtın **neliği** Anayasa’da sınav puanıdır. İzleme-hash’i yasal olarak yeter, pedagojik olarak yetersizdir. Bu boşluk Anayasa’yı ihlal etmez; ürünü zayıf bırakır.

**Eleştiri cümlesi:** A Katmanı platformu ayakta tutar. B Katmanı amiral içeriği yönetmez; “sayıları koda at, dürüst ol” der. İçerik kalitesi için Anayasa’ya sığınmak kaçıştır.

### 2.2 MANIFESTO.md — kitle ve kanıt sapması

**Güçlü yan.** Tek cümle (“öğrendiğini mühürle”) net. Motor 1 = Akademi kahramanı, doğru. Dürüst yüzey, S43, “Faz 2’de kernel çıkacak” yalanının silinmesi doğru.

**Kitle çatışması.** Manifesto birincil öğreneni “alaylı yazılımcı, kariyer değiştiren, uzaktan profesyonel” diye çizer. Amiral SKU’nun `targetAudience` listesi beyaz yaka ofis, muhasebe, İK, kamu, KOBİ. **Satılan ürün ile anlatılan kahraman aynı kişi değildir.** Yazılımcıya Excel A1 satılmaz; ofis çalışanına LangGraph vitrini “çok yakında” diye asılır. 5’li vitrin karması (Pedagoji D) bu sapmayı pazarlama kararı olarak dondurur.

**Kanıt enflasyonu.** “Her sertifika iş kanıtıdır.” Teknik olarak SHA-256 mühür + sunucu puanı vardır. Pedagojik olarak 10 çoktan seçmeli, izleme hash’i, boş `LESSON_PRACTICE`. İşveren Faz 2’de bu mührü “kalitesiz teslimat riskini sıfırlar” diye okuyamaz. Manifesto Faz 2 alıcısını bugünün amiraline borç yazar.

**İcracı kılavuz** (“güven + kazanım + gelir?”) B4 doygunluk ile çatışabilir: 9 kaseti mühürleyip satmak gelir; kaset–makale sapmasını re-bake etmek maliyet. Manifesto, “mühürlü 9/9”i zafer saymaya izin verir. Bu rapor o zaferi kabul etmez.

**Quiet Luxury.** Karaoke punchcard, neon hücre, 142→0 mucize sahnesi “sakin lüks” değil, eğitim reklamıdır. Tasarım duruşu ile Altın Şablon ayrı tarikatlardır; ikisi de dokümanda barış içinde durur, üründe çarpışır.

### 2.3 PEDAGOJI.md — en bağlayıcı ve en pahalı belge

Bu belge Anayasa A’sı değildir ama fırın, test ve ajan davranışı onu A gibi okur. Amiralin şekli buradan gelir.

**Korunacak çekirdek.**

- Garsonu göster (ses = ekran).
- SEN dili, jargonun günlük karşılığı.
- Karaoke sahnesine paragraf yasağı (A.3) — compact makale istisnası doğru.
- Üç Kapı (E.10) — 2026 ofis-AI öğretiminin en değerli fikri.
- İzlemede generate yok; bake ayrı.
- Araç dayatmama (VBA/Gamma/Marp zorunlu değil).
- Masaüstü Outlook dürüstlüğü (Copilot yoksa canlı kutu okunmaz).

**Pratikten uzak veya amirali boğan maddeler.**

1. **“Aptala anlatır gibi.”** A.2 başlığı küçümser. Hedef kitle kamu personeli ve finans uzmanıdır. Dil sade olabilir; çerçeve aşağılayıcıdır. Bu başlık ajanlara “daha da çocuklaştır” sinyali verir. Kasetlerin “sihir / büyü / canavar evcilleştir” dili buradan beslenir.

2. **7–12 dk + 4-beat dogma.** Doygun ofis konusu (KVKK+DPA+kiracı sınırı, veya Power Query+pivot) bu banda sığmaz. Sığdırılınca `k1` 5 dakikaya ezilir veya konu “el kitabı (kasetin sığdırmadığı)” dipnota kaçar. Dipnot karaoke dinleyen vatandaşa gitmez. **En önemli cümleler sahneye çıkmaz.**

3. **Altın Şablon = Excel sineması.** E başlığı “görsel sözleşmedir, Anayasa değildir” der; kod ve ajan davranışı onu şablon yapar. Word/Gmail “Excel imlecine sığmak zorunda değil” yazılır; workspace bileşenleri hâlâ Excel zoom/mouse paylaşır. Sonuç: Outlook masası Excel’den türeme hissi.

4. **Word/Excel → Doğrudan Dosya Yükleme kilidi vs 1. Kapı Copilot.** `ACADEMY_INFRA_TOOL_MATCH` Excel/Word’ü ataşa kilitler; `planned.ts` 1. ders yöntemi `copilot-live`; 1. kaset “Copilot varsa şerit 1. kapı”. Üç belge üç kapı sırası satar. Öğrenci hangisini sınavda işaretleyeceğini ezberler, masada kaybolur.

5. **E.4 Bütçe B-roll.** Maliyet disiplini doğrudur. 9 derste aynı warmup, “her masa kendi işi” vaadini görsel olarak yalanlar. Pedagoji maliyet kalkanını öğretim kalitesinin üstüne koyar.

6. **“Çoklu AI ekosistemi” (E.2).** Bir paragrafta ChatGPT hızlı, Claude dikkatli, Gemini sıralı, API ev kuralı. Bu, ekosistem öğretimi değil marka adı geçirmektir. Araç seçim kararı (kiracı, DPA, fiyat, bağlam penceresi, dosya limiti) yok.

7. **A.3 punchcard ≤ 3 kelime.** Sahnede doğrudur. Ajanlar bunu içerik sığlığına çevirir: karmaşık KVKK “YASAK LİSTE” rozetine iner.

8. **5’li vitrin karması (D).** Pedagoji belgesi pazarlama SKU sırası taşır. Eğitim felsefesi dosyasında “sepet doldurucu / görsel magnet” olmamalı. Bu madde `pilot-sku.ts` + DURUM’a aittir. Pedagoji’yi şişirir, güncellenmesini korkutur.

9. **Diyalog tiyatrosu artığı.** `types.ts` hâlâ Koray/Maya/cast temizleyici, five-act çökertme, yasaklı analoji regex’i taşır. Pedagoji “tek eğitmen” der; kod eski tiyatronun yasını tutar. Amiral compact makaledir. Ölü katman, ajanı “acaba diyalog mu?” diye şaşırtır.

10. **Testlerin Pedagoji’yi string-kilit etmesi.** `production-standard.test.ts` madde başlığı geçerse yeşil. Felsefe belgesi refactor’u CI’yı kırar; bu da belgeyi fiilen Anayasa yapar. Yaşayan ilke böyle yaşamaz.

**Eleştiri cümlesi:** Pedagoji, yetkin.ai’nin en özgün öğretim fikrini (Üç Kapı + garsonu göster) içerir ve aynı anda amirali kısa, Excel-merkezli, bütçe-korkulu bir kaset fabrikasına kilitler. Kutsal sayılmamalı; E.10 korunup süre/şablon/vitrin ayrılmalıdır.

---

## ADIM 3 — Amiral gemisi müfredat stratejisi

### 3.1 Derin ve evrensel ofis-AI için eklenmesi gereken ana konular

Amaç “ChatGPT’ye Excel yapıştır” kursu değil; **her ofis çalışanının 2026’da masada duran işi, doğru kapıdan, doğru veri sınırıyla, insan kilidiyle bitirmesi.**

Önerilen konu katmanları (isimler taslak; kota değil):

**A. Veri hijyeni ve tablo zekâsı (mevcut 1’in doygun hali)**  
A1 eşiği + Tablo nesnesi + tür birliği + F2. Power Query ile “kirli dışa aktarım → yenilenebilir sorgu”. Pivot ve tek grafik. Model tabloyu tarif eder; Excel hesaplar.

**B. Veri sınırı (mevcut k1’in doygun hali, ≥8 dk kaset)**  
KVKK + şirket sırrı + maske. **Kiracı içi vs tüketici modeli.** DPA, “silmek geri almaz”, ekran görüntüsü, müşteri adı+telefon. Kamu kataloğu vs kişi satırı. Copilot lisansı yasal ruhsat değildir (makalede var, kaset zayıf).

**C. Karar metni**  
Üç madde + eylem cümlesi (mevcut 2). Ek: gözlem ≠ karar, alıcı rolü, “uydurma sayı yok” kısıtı, kaynak hücre atfı.

**D. Sayı kilidi (mevcut 5, öne alınmış olarak kalmalı)**  
Halüsinasyon. TOPLA / tablo motoru asıl yargıç. Modele “kendini denetle” yardımcı, yeterli değil. İnsan gözü yüksek riskli hücrede.

**E. Anlatı**  
Slayt başına tek fikir + şirket teması + konuşmacı notu. Copilot 1. kapı, pptx ataş 2. kapı. “Taslağı aktar, temayı sen kilitle.”

**F. Yazılı iş**  
Sözleşme risk listesi, dilekçe, tutanak, teklif. Ataş. Değişiklik izi. İmza / unvan / tarih / sayı insanda. Uydurma kanun maddesi.

**G. Gelen iş**  
Ritüel (etiket → taslak → insan → arşiv) **tek ders.** Panel (Gmail Gemini / Outlook Copilot) aynı dersin ikinci senaryosu, ayrı SKU değil. Gönder tuşu yok. Aksiyon tablosu (kim, ne, ne zaman).

**H. Toplantı ve takvim (yeni)**  
Transkript → 5 maddelik tutanak + görev. Cuma 30’u takvime gerçek olay olarak yaz. Çakışma, hazırlık notu.

**I. Belge ve PDF (yeni)**  
Fatura/dekont OCR, uzun PDF ataş, “sayfa numarası yaz, uydurma madde ekleme.”

**J. Workspace gerçekliği (yeni, kısa dürüst ders)**  
Sheets/Docs kullanıcıya “CSV indir, Excel’e geç” demek evrensel değildir. Aynı Üç Kapı Google tarafında: Gemini for Workspace 1. kapı, Drive ataş 2. kapı.

**K. Sistem (mevcut 6’nın doygun hali)**  
Cuma 30: Excel + yazı/slayt + kutu. Word ve maske blokta yazılı. Dağınık hafta vs takvim. Sınav kapısı.

**L. Laboratuvar (platform, kaset değil)**  
Her derste sahte ama gerçekçi dosya (Kaya Gıda). Öğrenci istemi yapıştırır / maskeler / TOPLA kilitler. Sunucu değerlendirir. Compact-read kalkmaz, **yanına** iş kanıtı gelir.

101/102 ayrımı Pedagoji D’de serbesttir ve burada anlamlıdır: **101 = kapı+etik+ritüel+Cuma** (mevcut 9’un onarılmış hali). **102 = Query/pivot, toplantı, PDF, Sheets, kurumsal sınır.** Tek 73 dakikalık kaset evrensel amiral olamaz; iddia 101+102 ile taşınır.

### 3.2 Shared Kernel / API-First / Amiral+Dron — teknik engel var mı?

**Müfredatı Dron’a “satın al, bitir, sınav, mühür” olarak taşımakta engel yok.** Hop sicili 16 kayıt; Akademi yazma/okuma hop’ları durur (`academy-purchase`, `lock`, `curriculum`, `curriculum-read`, `exam`, `exam-read`, `certificate`, `pulse`). `@yetkin/kernel` ince sözleşmedir (para, katalog kimliği, zarf, hop meta). Prisma taşımaz — doğru.

**Müfredatı Dron’a “garsonu göster” olarak taşımada engel var; bu bir Anayasa ihlali değil, ürün kesiti.**

| Yüzey | Amiral (web) | Dron (`apps/rail-is`) | Engel türü |
|-------|----------------|------------------------|------------|
| Satın alma / kasa | PayTR iFrame + DEBIT | Aynı hop; IAP yok | Yok (nakit tanığı ayrı konu) |
| Müfredat gövdesi | Compact makale | `player.lessons[].body` sınırsız string | Payload şişmesi (9 uzun makale tek GET) |
| Karaoke + timings | MP3 + cue | Punchcard timings’ten türetilir; native TTS yok | Ses/sahne yok |
| Excel/Gmail/Word waiter | React DOM sineması | Yok; DURUM açıkça “klon taşımaz” der | Pedagoji E.1 web-only |
| Punchcard | Oynatıcı overlay | Cue JSON **monorepo `lib/academy` import** | Kernel kaçışı: native paket web lib’e bağlı |
| İş kanıtı | compact-read | aynı | Pedagojik, teknik değil |
| Sınav / mühür | sunucu | hop | Yok |

**Darboğazlar (ileride patlar):**

1. **Sinema web’e kilitli.** Kardeş SKU’lar aynı waiter’ı çoğaltırsa Dron her seferinde “metin+rozet” kalır. Amiral iddiası görsel öğretimse, ikinci istemci sakat doğar.
2. **Dron → `lib/academy` JSON import.** API-First ilkesinin tersi: punchcard derleme anında gömülür. Cue değişince native binary yenilenmeden saatler sapabilir (veya tersi: web re-bake, mağaza eski). Hop’a `punchcard[]` + `audioUrl` eklenmeden sürü ölçeklenmez.
3. **Tek GET’te 9 gövde.** `body: z.string()` tavanı yok. 101/102 doyunca payload ve bellek mobil istemciyi vurur. Ders bazlı hop (lesson-read) yoktur.
4. **Medya bütçesi.** 9 MP3 + cinema JPG `public/` altında; Vercel tavanı kodda 400 MB ile hatırlatılır. 13 SKU × 9 kaset bu modeli kırar. CDN/object storage Anayasa konusu değil, ops konusu — henüz yok.
5. **Bake fabrikası tek yoldan.** Senaryo → TTS → cue → görsel → bed → montaj. İnsan `--seal`. RPM 6500 ms. Kardeş SKU’ları aynı kaliteyle basmak operatör maliyeti; ajan “9/9 yeşil”i tekrar etmek ister.
6. **Anahtar regex.** `academyCourseSlugFromLessonKey` sonek `g1|w1|k1|\d+` kabul eder. `t1` (Teams) veya `s1` (Sheets) eklemek kod kapısı ister. Şema eğitim tasarımını kısıtlar.
7. **Boş pratik haritası.** Etkileşimli kanıt eklemek teknik olarak hazır (`proof-of-work.ts` üç kind tanır). Engel ürün kararıdır: compact SKU “etkileşimli tohum yoktur” diye kilitlenmiş.

**Sonuç:** Mimari, amiral SKU’nun **ticaret ve mühür** dilimini Dron’a taşır. **Öğretim** dilimini taşımaz. Bu, “entegrasyon engeli” değil “bilinçli sakatlık”tır; Pedagoji E ile Manifesto T3 “bağlı” cümlesi yan yana durunca müşteriye yalan gibi okunur. Dürüst cümle DURUM’da var; vitrin cümlesinde yok.

---

## ADIM 4 — Tarafsız görüş ve tedavi

### 4.1 Sen olsaydın ne yapardın? (sıfırdan amiral)

Önyargı: yetkin.ai’nin farklılaşması karaoke efekti değil, **doğrulanabilir ofis refleksi** olmalı. Kaset onun hizmetkârı.

**1. Tek omurga belgesi.** Vatandaş sırası 1…n. Teknik anahtar `office.excel.hygiene` gibi semantik. `01_office_ai-5`’in 4. dersten sonra gelmesi yasak. Eski anahtarlar alias.

**2. İki paket.**  
- **101 Ofis Kapıları** (satın alınan amiral, ~8–10 ders, 90 dk üstü serbest): Üç Kapı, KVKK/kiracı, Excel hijyeni+Tablo, özet, sayı kilidi, slayt, kutu+panel (tek ders), Word ataş, Cuma sistem, laboratuvar.  
- **102 Ofis Analisti** (aynı vitrin ailesi, ayrı SKU): Query/pivot/grafik, Sheets, toplantı/takvim, PDF, paylaşım izinleri.  
Tek 73 dk’lık “her şey” kursu dünya çapında olmaz; dürüst paket olur.

**3. SSOT tek yön.** `spoken-script` ← `section` türetilmez; **tersi:** senaryo SSOT’tur, makale senaryonun el kitabı + uzun formudur, kaset senaryonun kesimidir. Cue yalnız senaryodan. `docs/curriculum` operatör kopyası değil, generate çıktısı. İki cue ağacı yok.

**4. Köprü şablonu zorunlu.** 2. dersten itibaren `academyPreviousLessonBridge`. Recap üç madde, dünün gerçek dersi. “Dördüncü dersimizde gelen kutusu” gibi serbest yalan derlemede kırılır: beklenen önceki anahtar ≠ söylenen başlık.

**5. Laboratuvar olmadan mühür yok.** Her ders: sahte xlsx/docx/eml. Öğrenci maskeler, TOPLA kilitler, aksiyon tablosu sütunlarını doldurur, “gönder”i basamaz. Sunucu değerlendirir. Compact-read tek başına `curriculumComplete` yapmaz.

**6. Kaset, makaleden kısa olabilir; çelişemez.** 7–12 dk bandı hedef ritimdir, giyotin değil. KVKK 9 dk konuşur. El kitabı kasetle çelişen kapanış köprüsü taşıyamaz.

**7. Garsonu göster, ama masa başına bir masa.** Excel imleci Excel’de kalır. Gmail’de Excel zoom yok. B-roll reuse varsayılan olabilir; Comparison sahnesi derse özgü olmak zorunda.

**8. Dron 101’i hop ile tüketir.** `GET curriculum` özet; `GET lesson` gövde+audioUrl+punchcards. Native `lib/academy` import etmez. Sinema Faz 2; Faz 1 dürüstçe “ses + metin + sınav”. Vitrin bunu söyler.

**9. Sınav, ezber şık değil refleks.** Havuz 42 “aynı KVKK sorusunun üç kopyası” olmaz. Her 101 dersinden pin + senaryo sorusu (A1’de logo, IBAN açık, 59.450 vs TOPLA, taslak gönderilmez). Çeldirici güncel anahtar dilini kullanır.

**10. Vitrin cümlesi dar.** “A1, maske, üç madde, slayt, kutu, Word, Cuma.” “Evrensel yapay zekâ ofis ustalığı” 102+laboratuvar gelince söylenir.

### 4.2 Platform kurgusu doğru mu?

**Omurga evet, öğretim fabrikası hayır.**

Doğru olanlar: modüler monolit, ince kernel, v1 zarf, fail-closed nakit, sunucu sınavı, 3 kamu odası, freelancer’ın kilitli oluşu, izlemede generate yasağı, 5’li vitrinde dürüst “yakında”.

Yanlış veya erken kilitlenenler:

- Amiral = compact makale + karaoke + boş pratik. Manifesto’nun kanıt vaadiyle orantısız.
- Pedagoji’nin Excel şablonu + süre bandı, içeriği yönetiyor; Anayasa B4 “konunun hakkı” bunu yasaklamış gibi yazar, kod yasaklamaz, pratik keser.
- Dron T3 “bağlı” pazarlama cümlesi, öğretim yüzeyinin kopyası sanılır. DURUM dürüst, ürün dili değil.
- 13 kanon SKU fiyatı donmuş, 12’si boş. Katalog hayali derinlik satar (dürüst rozet olsa da zihinsel stoktur).
- Anahtar ve bölüm numarası borçları birikecek. `k1` eklendi; `t1` eklendiğinde aynı P0 tekrarlanır.

**Operasyonel darboğazlar:** bake insan onayı + ücretli TTS; re-bake maliyeti sapmayı “bilinen borç” yapar; medya `public/` ölçeği; cue dual-write; DURUM’un elle güncellenmesi; kardeş SKU’ların aynı fabrikadan geçmeden vitrine asılı kalması.

### 4.3 Tedavi / düzeltme aşaması — somut sıra

Öncelik: **öğrencinin kulağı ile gözü aynı omurgayı görsün.** Yeni ders eklemek, sapmayı büyütür.

#### Faz T0 — dondur ve tek tablo (yarım gün, kod)

1. Bu raporu `docs/DURUM.md` “amiral” satırına bağla: kaset–makale sapması açık cümle. “9/9 mühürlü” ≠ “9/9 hizalı”.
2. Vatandaş sıra numarası SSOT: `lesson-index.ts` sırası. UI’da “Ders 5” = hata avı, “Ders 6” = e-posta. Anahtar `01_office_ai-5` vatandaşa gösterilmez.
3. `cinema-cue-catalog` L6/L7 köprü cümlelerini **re-bake beklemeden** düzelt (punchcard yalanı ucuz; kaset pahalı).
4. Sınav çeldiricisi `q_off_17` ve tekrarlayan KVKK/dilekçe sorularını sadeleştir.

#### Faz T1 — senaryo hizası (içerik, re-bake öncesi)

5. Her ders için tek sayfa “dün / bugün / yarın / cebine üç / gönderme yasağı”. `planned.ts` + index ile birebir.
6. Makaleyi kasetin üstüne yazma; **kaseti makaledeki omurgaya çek.** Öncelik sırası: ders 1 kapanış, ders 2 recap (KVKK), ders 4 (ritüel, yarın G1, gönder yok), ders 5 (dün slayt, yarın kutu).
7. `docs/curriculum/01_office_ai_01_script.md` ve spoken header “2. bölüm / Rapor” satırlarını öldür.
8. G1 iskeleti “taşıma su yasak” → E.10 dili.

#### Faz T2 — re-bake (para ve onay)

9. En az dört kaset: `1`, `2`, `4`, `5`. İdeal: `3` (kaçıncı dersiz), `6` (Word’ü Cuma’ya yaz; sinema zaten kısmen doğru).
10. `k1`’i 7–9 dk doyur: kiracı vs tüketici, DPA, “Copilot ≠ ruhsat”. Yedek TTS dipnotunu kapat.
11. `--dry-run` → insan `--seal`. Cue tek ağaca yaz (`lib/academy/lesson-cues`); `docs/curriculum` generate.

#### Faz T3 — kanıt (ürün, Anayasa A4 ile uyumlu)

12. `LESSON_PRACTICE`’e 9 tohum: maske, A1, üç madde kısıtı, TOPLA kilidi, slayt tek fikir, etiket sırası, aksiyon tablosu, ataş vs parça kopya, Cuma üç blok. Compact-read tek başına yetmesin.
13. Mini sınav 3 MCQ kalsın; kurs havuzu tekrarsız 36–42 kök.

#### Faz T4 — amiral derinliği (101 onarımı bittikten sonra)

14. 4 + G1’i tek e-posta dersinde birleştir **veya** kasetleri çelişkisiz çift hat yap. Çiftleme bilinçli olsun.
15. Cuma 30’a Word + maske satırı.
16. 102 tasarımı: Query/pivot, Sheets, toplantı, PDF. Vitrin “çok yakında” ancak senaryo yazılınca.
17. Dron: lesson-read hop + audioUrl; `lib/academy` importunu kes. Sinema vaadini vitrinden çıkar veya “web’de izle” de.

#### Yapılmayacaklar (bu tedavide)

- Yeni SKU mühürleyerek sapmayı gizlemek.
- Pedagoji’ye milisaniye geri yazmak.
- Anayasa A’yı “kolaylaştırmak”.
- Compact makaleyi kasetle aynı kelimeye zorlamak (B4). **Anlam** aynı olacak; **süre** farklı olabilir.
- Dron’a Excel DOM klonu (T4’ten önce).

---

## Ek A — Kanıt dizini (okuma listesi)

- Sıra: `lib/academy/curricula/lesson-index.ts`, `lib/academy/curricula/office_ai/planned.ts`, `lib/academy/curricula/office_ai/index.ts`
- Makale: `lib/academy/curricula/office_ai/section_{1,k1,2,3,5,4,g1,w1,6}.ts`
- Kaset: `lib/academy/spoken-scripts/01_office_ai-{1,k1,2,3,5,4,g1,w1,6}.md`
- Saat: `lib/academy/lesson-audio.ts`, `lib/academy/lesson-audio-timings/`
- Sinema sapması: `lib/academy/cinema-cue-catalog.ts` (`01_office_ai-5` cue-8, `01_office_ai-6` cue-8)
- Kanıt boş: `lib/academy/lesson-practice.ts`, `lib/academy/curriculum-engine.ts` (`compact-read`)
- Kapı eşleşmesi: `lib/academy/ai-desk.ts` (`ACADEMY_INFRA_TOOL_MATCH`)
- Kılavuz: `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`
- Kesit: `docs/DURUM.md` (1. ders özeti hatalı)
- Dron: `apps/rail-is/src/ui/academy-punchcards.ts`, `.system_docs/DRON_CLIENT_SPEC.md`, `docs/DURUM.md` “Sinema masası web’dedir”

---

## Ek B — SUPER ADMIN’e bildirim

Amiral SKU **satılabilir iskelet** aşamasındadır: hop, kasa, 9 kaset, 9 karaoke, 70 barajı, KVKK bekçisi ve Üç Kapı fikir olarak durur.

Amiral SKU **öğretim olarak hizasızdır:** mühürlü ses eski 6’lı omurgayı, makale yeni 9’lu omurgayı anlatır. Bu, A5 “dürüst yüzey” ruhuna aykırıdır — yalan API değil, yalan müfredattır. Vatandaş aynı SKU içinde iki ders sırası yaşar.

Tedavi T0–T2 (hizalama + re-bake) olmadan yeni ders, yeni SKU veya “dünya çapında amiral” iddiası önerilmez. T3 (iş kanıtı) olmadan mühür, Manifesto’daki “kanıt” kelimesini taşımaz.

Rapor yolu: `docs/01_OFFICE_AI_TESPIT_RAPORU.md`. Tedavi ayrı görevdir.
