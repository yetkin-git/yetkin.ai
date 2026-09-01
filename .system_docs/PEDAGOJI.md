# PEDAGOJI.md — Eğitim ve Anlatım Anayasası

Bu doküman platformun eğitim ilkelerini, pedagojik mühendislik kurallarını, üretim boru hattını ve müfredat mühür standartlarını tanımlar.

---

# BÖLÜM A: PEDAGOJİ ACADEMY (AKTİF)

## 1. TEMEL İLKELER VE SEVİYE MİMARİSİ
* **Konunun Hakkı:** Konunun hakkı neyse o kadar ders/bölüm yazılır. Sabit ders adedi veya bölüm kısıtlaması yoktur. İlan edilen öğrenme çıktılarının tamamı öğretilir ve ölçülür.
* **Ana Dikey / Esnek Seviye Mantığı:**
  - Ana uzmanlık hatlarında (Python, AI Agent, Web Dev vb.) hedef koymayı kolaylaştıran **Temel, Orta ve İleri Seviye** basamakları kullanılır.
  - Spesifik/dar kapsamlı konularda (Git/GitHub, Docker temelleri vb.) yapay 3 seviye zorlaması yapılmaz; tekil Masterclass veya modül yapısı korunur.
* **Dinamik Fiyat & Tek Celsede Tamlık:** Öğrenme vaadi tek celsede eksiksiz kapanır. Fiyatlandırma piyasa değerine göre katalogda (`amountMinor`) mühürlenir.
* **SEN Dili & Yalınlık:** Anlatım doğrudan kullanıcıya ("sen") hitap eder. Süslü laf kalabalığı, yapay açılış dolguları ("Şey...", "Eeee...") hem metinden hem sesten temizlenir.

## 2. TEK EĞİTMEN FORMATI VE SES/TEMPO STANDARTLARI
Eğitimler çift-AI tiyatrosu (Koray/Maya sohbeti) değildir. Tek sorumlu rol **Eğitmen**dir; öğrenciye doğrudan hitap eder.
* **Eğitmen (Master Voice):** Gemini TTS `Erinome` — yüksek frekanslı, net, berrak, yakın mikrofon. Konuşma hızı **%100**; boğuk/derinden gelen tempo yavaşlatması yoktur.
* **Katalog isimleri:** Vitrin biyografisi Maya / Ece / Gözde olarak kalabilir; ders gövdesinde konuşmacı etiketi yalnız **Eğitmen**dir. Moderatör (Koray/Can/Tarık) ders kopyasına ve mühürlü WAV’a girmez.
* **Siber Güvenlik kadrosu:** Vitrin eğitmeni **Ece** (Leda). Ders metni tek eğitmen formatındadır.
* **Dijital Beceriler / İş Dünyası kadrosu:** Vitrin eğitmeni **Gözde** (Callirrhoe). Ders metni tek eğitmen formatındadır.

**Ses-Karakter Mühür Kuralı:**
* Eğitmen sesi merkezi `CastRegistry` içinde `ACADEMY_MASTER_VOICE` (Erinome) ve dikey sesleriyle mühürlenir.
* Yapısal tur ayrımı `DialogueTurn[]` JSON veri yapısıyla mühürlenir; her tur eğitmen rolündedir.

## 3. ÜRETİM NOTU VE MEDYA MÜHRÜ (SÜREÇ; DERLEME ŞARTI DEĞİL)
* Müfredat taslağı ve `DialogueTurn[]` ajan oturumunda üretilir. İkinci model ile otomatik «AI-Checking-AI» CI kapısı **yoktur**; bu bir süreç notudur, derleme şartı değildir.
* **Diyalog mührü:** 18 SKU dört perdeli tek eğitmen `DialogueTurn[]` taşır. `ai-temel` ve `ux-temel` 12 bölüm düz taslaktır; WAV iddiası yoktur.
* **WAV mührü (disk):** `ACADEMY_MEDIA_SEALED_AUDIO` yalnız `public/media/academy/audio` altındaki gerçek dosyalarladır. Bu an: **16 WAV** — `ai-agent-temel` 6, `ai-agent-orta` 6, `ai-agent-ileri` 1–4. Python / fullstack / security / masterclass WAV **yoktur**. `ai-agent-ileri-5` ve `ai-agent-ileri-6` yoktur. Olmayan ses için sahte beyan yapılmaz.
* **Sıfır Maliyetli Medya (Zero-Cost Streaming):** Mühürlü derslerde izleme anında canlı TTS tetiklenmez; dondurulmuş WAV oynatılır. Mühürsüz derste eğitmen metni okunur; oynatıcı sahte «ses hazırlanıyor» iddiasında bulunmaz.

## 4. DERS AKIŞ ŞABLONU (4 PERDELİ TEK EĞİTMEN)
1. **Giriş & Bağlam:** "Hoş geldiniz. Bu bölümde [Konu Adı] konusunu ve neden ihtiyaç duyduğunuzu ele alacağız."
2. **Problem:** "Geleneksel yapılarda [X Yanlışı/Eksiği] yaşanır. Bu yüzden bu mimariyi kullanırız."
3. **Kod & Uygulama Mantığı:** "Ekrandaki kod bloğunda gördüğünüz üzere..." — kodun mantığı doğrudan öğrenciye anlatılır.
4. **Özet & Kazanım:** "Bu dersle [Y Becerisi] kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz."
5. **İş Kanıtı / Değerlendirme:** Ders sonu quiz ve kurs sınavı (baraj 70); SHA-256 yetkinlik mührü. Bu perde konuşma tiyatrosu değildir.

18 diyalog SKU bu dört perdeyi taşır. İki düz taslak (`ai-temel`, `ux-temel`) istisnadır; aynı dört başlıkla öğrenciye hitap eder.

---

# BÖLÜM B: PEDAGOJİ JUNIOR (10-18 YAŞ) — [DONMUŞ / GELECEK FAZ]
* Şimdilik donmuş durumdadır. Üretim, route veya kod yazımı yapılmaz.
