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

## 2. ÇİFT-AI DİYALOG FORMATI VE SES/TEMPO STANDARTLARI
Eğitimler monolog sunum değil, iki AI persona arasındaki canlı saha sohbetidir:
* **Koray (Moderatör / Saha):** Kullanıcının sesidir. Seviyeye göre rolü ve ağırlığı değişir:
  - *Temel Seviye:* Meraklı, sorular soran, süreci canlı tutan profil (%100 konuşma hızı).
  - *Orta Seviye:* Uygulamacı uzman profil (%98 konuşma hızı).
  - *İleri Seviye:* Tecrübeli partner profil; az konuşur, sadece kilit mimari noktalarda araya girer (%96 konuşma hızı).
* **Maya (Eğitmen / Usta):** Sahada pişmiş uzmandır. Kavramların pürüzsüz anlaşılması için sabit **%95 anlatım temposu (%5 yavaşlatılmış micro-pacing)** ile konuşur.
* **Siber Güvenlik kadrosu:** Bu dikeyde moderatör **Can** (Google TTS erkek, %100), eğitmen **Ece** (Google TTS kadın, %95). Ses-karakter tekilliği `CastRegistry` mührüdür; Can Charon/Koray’ın, Ece Kore/Maya’nın sesini taşımaz.
* **Dijital Beceriler / İş Dünyası kadrosu:** Bu dikeyde moderatör **Tarık** (Google TTS erkek, %100; meraklı, pratik sorular soran saha profili), eğitmen **Gözde** (Google TTS kadın, %95; tane tane anlatan usta profili). Tarık Charon/Koray/Can sesini, Gözde Kore/Maya/Ece sesini taşımaz.

**Ses-Karakter Mühür Kuralı:**
* Moderatör ve Eğitmen sesleri merkezi `CastRegistry` içinde mühürlenir.
* Yapısal speaker ayrımı `DialogueTurn[]` JSON veri yapısıyla mühürlenir.

## 3. ÜRETİM NOTU VE MEDYA MÜHRÜ (SÜREÇ; DERLEME ŞARTI DEĞİL)
* Müfredat taslağı ve `DialogueTurn[]` ajan oturumunda üretilir. İkinci model ile otomatik «AI-Checking-AI» CI kapısı **yoktur**; bu bir süreç notudur, derleme şartı değildir.
* **Diyalog mührü:** 18 SKU beş perdeli `DialogueTurn[]` taşır. `ai-temel` ve `ux-temel` 12 bölüm düz taslaktır; diyalog ve WAV iddiası yoktur.
* **WAV mührü (disk):** `ACADEMY_MEDIA_SEALED_AUDIO` yalnız `public/media/academy/audio` altındaki gerçek dosyalarladır. Bu an: **16 WAV** — `ai-agent-temel` 6, `ai-agent-orta` 6, `ai-agent-ileri` 1–4. Python / fullstack / security / masterclass WAV **yoktur**. `ai-agent-ileri-5` ve `ai-agent-ileri-6` yoktur. Olmayan ses için sahte beyan yapılmaz.
* **Sıfır Maliyetli Medya (Zero-Cost Streaming):** Mühürlü derslerde izleme anında canlı TTS tetiklenmez; dondurulmuş WAV oynatılır. Mühürsüz derste diyalog metni okunur; oynatıcı sahte «ses hazırlanıyor» iddiasında bulunmaz.

## 4. DERS AKIŞ ŞABLONU (5 PERDELİ MONTAJ)
1. **Isınma (Warmup):** Hayatın içinden somut bir kanca/analoji.
2. **Giriş / Problem:** Gerçek saha problemi ve teknik risk.
3. **Gelişme / Uygulama:** Koray ve Maya'nın diyalog halinde Fail-Closed mantığıyla çözümü.
4. **Sonuç / Özet:** Dersin net özeti ve sonraki adıma geçiş.
5. **İş Kanıtı / Değerlendirme:** Ders/Modül sonu testler ve SHA-256 yetkinlik mühürü.

18 diyalog SKU bu beş perdeyi taşır. İki düz taslak (`ai-temel`, `ux-temel`) istisnadır.

---

# BÖLÜM B: PEDAGOJİ JUNIOR (10-18 YAŞ) — [DONMUŞ / GELECEK FAZ]
* Şimdilik donmuş durumdadır. Üretim, route veya kod yazımı yapılmaz.
