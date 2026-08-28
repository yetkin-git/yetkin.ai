# PEDAGOJI.md — Eğitim ve Anlatım Anayasası

Bu doküman platformun eğitim ilkelerini, pedagojik mühendislik kurallarını ve müfredat mühür standartlarını tanımlar. Platform bünyesinde iki ayrı pedagoji katmanı bulunur:
1. **Pedagoji Academy** (Yetişkin / Profesyonel — AKTİF)
2. **Pedagoji Junior** (10-18 Yaş Grubu — ŞİMDİLİK DONMUŞ / GELECEK FAZ)

---

# BÖLÜM A: PEDAGOJİ ACADEMY (AKTİF)

## 1. TEMEL İLKELER VE SÖZLÜK
* **Konunun hakkı:** Konunun hakkı neyse o kadar ders/bölüm yazılır. Sabit ders adedi ve «her kurs N ders» kalıbı yoktur. İlan edilen öğrenme çıktılarının tamamı öğretilir, uygulanır ve ölçülür; vatandaş aynı konuyu öğrenmek için ikinci bir eğitime muhtaç bırakılmaz.
* **Esnek eğitim yapısı:** Eğitim ihtiyaca göre tekil Masterclass veya çoklu modül olabilir. Her dikeyin zorunlu üç seviyesi yoktur; seviye etiketi (Temel / Orta / İleri / Masterclass / Modül-N …) serbesttir.
* **Dinamik fiyat:** Fiyatlandırma eğitimin gerçek piyasa değerine göre dinamik belirlenir. Maktu fiyat bantları anayasal kilit değildir; canlı tutar katalog SSOT’tur (`amountMinor` kuruş tamsayısı).
* **Tek Celsede Tamlık:** Yukarıdaki esneklik içinde öğrenme vaadi tek celsede kapanır — eksik bırakılan çıktı yoktur.
* **SEN Dili & Quiet Luxury:** Anlatım doğrudan vatandaşa hitap eder ("sen"). Süslü laf kalabalığı, yapay gürültü ve yapay açılış dolguları ("Şey...", "Eeee...", "Bakın...", "Aslında...") hem görsel hem de sesli gövdeden tamamen temizlenir.
* **Brief:** İş Siparişi / İş Tarifi. Müşteri veya patronun ne istediğini netleştiren belgedir.
* **Fail-Closed (Hata Anında Kapalı):** Çelişki veya eksik kısıt varsa masada dur; yapay zekanın düğmesine basıp o jetonu yakma.
* **Uydurma Orta Değer Yok:** "Ortaya karışık iş yapmak" yasaktır. Zıt istekler aynı karede/işte yaşamaz; net karar alınmadan üretime geçilmez.

## 2. ANLATIM FORMATI, SES MÜHRÜ VE 3 KATMANLI DİNLEME AKIŞI
Eğitimler monolog ders sunumu değil, iki karakter arasındaki canlı saha sohbetidir:
* **Koray (Moderatör / Saha):** Vatandaşın ve masadaki müşterinin sesidir. Tıkanıklıkları ve akla gelen samimi soruları sorar.
* **Maya (Eğitmen / Usta):** Sahada pişmiş ustadır. Lafı dolandırmadan kuralı koyar, raconu keser ve eksiksiz çözümü verir.

**3 Katmanlı Ses ve Tempo Mimarisi:**
1. **Eğitim Anonsu (Sistem / Sentetik Voice):** Bilinçli olarak insan sesi değildir. İki konuşmacı öncesinde bilişsel kontrast (Cognitive Contrast) ve ortam algısı yaratır.
2. **Moderatör Selamlaması (Koray / Human Voice):** Doğal, dinamik, %100 normal anlatım temposu.
3. **Eğitmen Anlatımı (Maya / Human Voice):** Kendinden emin usta tonu, kavramların zihinde pürüzsüz işlenmesi için **%6 yavaşlatılmış (%94 hız / micro-pacing)** anlatım temposu.

**Ses-Karakter Mühür Kuralı (TTS/AI Voice & Provider Isolation):**
* **Cast Registry Tekelliği:** Moderatör, Eğitmen ve Anons sesleri tek bir merkezi `CastRegistry` içinde mühürlenir. Aynı ses modeli (voice fingerprint) iki farklı karaktere atanamaz (`Puck` veya `Fenrir` çakışması yasaktır).
* **Fail-Closed Voice Fallback:** Ses sağlayıcısında hata veya eksik binding durumunda sistem sessizce `Kore` veya başka bir varsayılan sese düşmez. Hata anında ses kabiliyeti fail-closed kapanır (`VOICE_BINDING_UNAVAILABLE`), metin yolu açık kalır, yanlış ses sunulmaz.
* **Yapısal Speaker Ayrımı:** Konuşmacı sınırları birleşik metinden regex ile tahmin edilemez; her diyalog `DialogueTurn[]` veri yapısıyla JSON seviyesinde mühürlenir.

## 3. DERS AKIŞ ŞABLONU (5 PERDELİ MONTAJ)

Çoklu modül yollarında önerilen şablon budur. **Derleme kırıcısı değildir.** Tekil Masterclass veya tek kavramlık SKU bu beşliye sığmak zorunda değildir; konunun hakkı tek perde veya kompakt gövde ise o yeter.

Önerilen 5 aşama (tuple):
1. **Isınma / Genel Kültür (Warmup):** Hayatın içinden somut bir kanca/analoji (Örn: Otobüs gişesinde iki pencere kenarı bilet istemek).
2. **Giriş / Problem (Problem):** Masadaki gerçek insan çatışması ve bütçe/zaman riski.
3. **Gelişme / Uygulama (Application):** Koray ve Maya'nın diyalog halinde sorunu Fail-Closed ile çözmesi.
4. **Sonuç / Toparlama (Summary):** Dersin özeti ve bir sonraki adıma geçiş.
5. **İş Kanıtı (Proof-of-Work):** Dersin tamamlanması için zorunlu interaktif görev ve sunucu tarafı SHA-256 iş kanıtı mühürü. *(İsteğe bağlı metinsel alıştırmalar "Alıştırma / Challenge" adıyla ayrı tutulur).*

## 4. PEDAGOJİK MÜHÜRLER VE VERİ SÖZLEŞMESİ
* **Semantic Content Seal (`semanticContentSeal`):** Şema sürümü, öğrenme çıktıları, kavram kayıtları, 5 perde turn'leri ve kabul ölçütleri üzerindeki kanonik JSON SHA-256 hash'idir. Sertifika doğrudan bu mührü bağlar.
* **Media Release Seal (`mediaReleaseSeal`):** Ses dosyaları, telaffuz anahtarları ve medya sürümünü bağlayan yayın mührüdür. Medya değişimi sertifikayı bozmaz.

---

# BÖLÜM B: PEDAGOJİ JUNIOR (10-18 YAŞ) — [DONMUŞ / GELECEK FAZ]
* Bu bölüm 10-18 yaş grubu genç yetkinler için tasarlanacak eğitim standartlarını içerecektir.
* Şimdilik donmuş durumdadır. Üretim, route veya kod yazımı yapılmaz.
