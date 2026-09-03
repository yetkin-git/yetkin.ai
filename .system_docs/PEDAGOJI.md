# PEDAGOJI.md — Eğitim ve Anlatım Anayasası

Bu doküman platformun eğitim ilkelerini, pedagojik mühendislik kurallarını, üretim boru hattını ve müfredat mühür standartlarını tanımlar.

---

# BÖLÜM A: PEDAGOJİ ACADEMY (AKTİF)

## 0. ANA KURAL — ŞİİR OKUMA, GARSONU GÖSTER

Akademi teorik ders anlatmaz. Kavramı tarif etmek yetmez; masadaki işi göstermek zorunludur.

* **Şiir okumak yasaktır.** Şefin tarifini hoparlörden dinletmek, akademik tanım yığmak, «ajan otonom bir döngüdür» diye konuşmak şiir okumaktır. Öğrenci tabak görmeden restorandan çıkmış olur.
* **Garsonu göstermek zorunludur.** Her kavram bir sahnede, bir markada, bir kapıda durur. Garson siparişi alır, mutfağa gider, araç çantasına uzanır, not defterine bakar, tabağı koyar ya da durur. Sen bu sahneyi anlatırsın; soyut cümleyi değil.

**Kavram kanonu (benzeme zorunlu; akademik çeviri yasak):**

| Kavram | Benzetme | Konuşan örnek | Çalışan örnek |
| --- | --- | --- | --- |
| Büyük Dil Modeli (LLM) | Mutfaktaki **şef** | ChatGPT, Gemini, Claude | — |
| AI Agent | Masadaki **garson / çalışan** | — | Cursor, Devin, AutoGPT |
| Tool | **Araç çantası** (tepsi, termometre, kasa) | — | Dosya yazma, tarayıcı, API çağrısı |
| Memory | **Not defteri** | — | Kısa pencere / uzun raf |

Vizyon cümlesi: **Konuşan AI değil, Çalışan AI.** ChatGPT tarif okur. Cursor tabağı getirir. İkisini aynı iş sanmak, şefi garson sanmaktır.

## 1. TEMEL İLKELER VE SEVİYE MİMARİSİ
* **Konunun Hakkı:** Konunun hakkı neyse o kadar ders/bölüm yazılır. Sabit ders adedi veya bölüm kısıtlaması yoktur. İlan edilen öğrenme çıktılarının tamamı öğretilir ve ölçülür.
* **Ana Dikey / Esnek Seviye Mantığı:**
  - Ana uzmanlık hatlarında (Python, AI Agent, Web Dev vb.) hedef koymayı kolaylaştıran **Temel, Orta ve İleri Seviye** basamakları kullanılır.
  - Spesifik/dar kapsamlı konularda (Git/GitHub, Docker temelleri vb.) yapay 3 seviye zorlaması yapılmaz; tekil Masterclass veya modül yapısı korunur.
* **Dinamik Fiyat & Tek Celsede Tamlık:** Öğrenme vaadi tek celsede eksiksiz kapanır. Fiyatlandırma piyasa değerine göre katalogda (`amountMinor`) mühürlenir.
* **SEN Dili & Yalınlık:** Anlatım doğrudan kullanıcıya ("sen") hitap eder. Süslü laf kalabalığı, yapay açılış dolguları ("Şey...", "Eeee...") hem metinden hem sesten temizlenir. Sözlük maddesi gibi «yani bu şu demek» yığınları yerine sahne konur.

## 2. YEDİ ALTIN KURAL (SES VE PEDAGOJİ MÜHRÜ)
Eğitimler çift-AI tiyatrosu (Koray/Maya sohbeti) değildir. Tek sorumlu rol **Eğitmen**dir; öğrenciye doğrudan hitap eder. Aşağıdaki yedi kural hem ekran kopyasını hem mühürlü WAV’ı bağlar.

1. **Eğitmen kimliği = sabit ses.** Katalog profili (ör. Maya — Kıdemli Yapay Zeka Mimarı) tek TTS voice ID ile mühürlenir. Maya = Gemini `Erinome`. Ece = `Leda`. Gözde = `Callirrhoe`. İkinci isim, ikinci ses yasaktır.
2. **Tanışma selamı ve özgeçmiş.** İlk dersin girişi eğitmeni adlandırır: «Merhaba, ben Maya. Yapay Zeka Sistemleri Uzmanıyım…» Konuşmacı etiketi ekranda yine **Eğitmen**dir; selam gövde düzyazısındadır. Moderatör (Koray/Can/Tarık) ders kopyasına ve mühürlü WAV’a girmez.
3. **Bölüm kapanışı.** Özet perdesi «Bir sonraki bölümde görüşmek üzere.» ile biter (son ders / sınav kapısı hariç).
4. **Bölüm tekrarı (spaced repetition).** 2. dersten itibaren giriş, önceki dersin 1–2 dakikalık «Ne Öğrenmiştik?» özeti ve üç maddelik kontrol listesiyle açılır.
5. **Ham TTS mühür hattı.** Eğitmen sesi Gemini TTS ana modelinin (`gemini-3.1-flash-tts-preview`) **ham** çıktısıdır. Metinler ana perdeler halinde modele girer. WAV mühründe yalnız **48 kHz resample** ve **+8 dB limiter** uygulanır.
   * **Yasak:** %93 hız bükme, SOLA, `tempoStretchPcmWav`, konuşma hızı çarpanı ile PCM uzatma.
   * **Yasak:** 300 karakterlik mikro parçalama ve dikiş. Perde (ana paragraf) modele bütün girer. Gemini tavanı aşılırsa yalnız cümle sınırından paketlemeye izin vardır; karakter kotasıyla dilim yok.
6. **Ses-metin %100 birebir.** Ekranda görünen paragraf düzyazısı ile sentezlenen kopya aynı kaynaktır. Kısaltma açılımı, gümrük ve boşluk hem ekrana hem sese aynı uygulanır.
7. **SEN dili ve Fail-closed.** Anlatım «sen»e hitap eder. Yapay açılış dolgusu yoktur. Kapı kapalıysa işlem durur; orta değer uydurulmaz. Garson mutfak kapalıyken tabak uydurmaz.

* **Eğitmen (Master Voice):** Gemini TTS `Erinome` — yüksek frekanslı, net, berrak, yakın mikrofon.
* **Siber Güvenlik kadrosu:** Vitrin eğitmeni **Ece** (Leda). Ders metni tek eğitmen formatındadır.
* **Dijital Beceriler / İş Dünyası kadrosu:** Vitrin eğitmeni **Gözde** (Callirrhoe). Ders metni tek eğitmen formatındadır.

**Ses-Karakter Mühür Kuralı:**
* Eğitmen sesi merkezi `CastRegistry` içinde `ACADEMY_MASTER_VOICE` (Erinome) ve dikey sesleriyle mühürlenir.
* Yapısal tur ayrımı `DialogueTurn[]` JSON veri yapısıyla mühürlenir; her tur eğitmen rolündedir.
* Oynatıcı kelime saati (420 ms) PCM’e hız bükme olarak basılmaz.

## 3. ÜRETİM NOTU VE MEDYA MÜHRÜ (SÜREÇ; DERLEME ŞARTI DEĞİL)
* Müfredat taslağı ve `DialogueTurn[]` ajan oturumunda üretilir. İkinci model ile otomatik «AI-Checking-AI» CI kapısı **yoktur**; bu bir süreç notudur, derleme şartı değildir.
* **Diyalog mührü:** 18 SKU dört perdeli tek eğitmen `DialogueTurn[]` taşır. `ai-temel` ve `ux-temel` 12 bölüm düz taslaktır; WAV iddiası yoktur.
* **WAV mührü (disk):** `ACADEMY_MEDIA_SEALED_AUDIO` yalnız `public/media/academy/audio` altındaki gerçek dosyalarladır. Bu an: **13 WAV** — `ai-agent-temel` 6, `ai-agent-orta` 3, `ai-agent-ileri` 1–4. Python / fullstack / security / masterclass WAV **yoktur**. `ai-agent-orta-4`..`6` ve `ai-agent-ileri-5` / `ai-agent-ileri-6` yoktur. Olmayan ses için sahte beyan yapılmaz.
* **Sıfır Maliyetli Medya (Zero-Cost Streaming):** Mühürlü derslerde izleme anında canlı TTS tetiklenmez; dondurulmuş WAV oynatılır. Mühürsüz derste eğitmen metni okunur; oynatıcı sahte «ses hazırlanıyor» iddiasında bulunmaz.

## 4. DERS AKIŞ ŞABLONU (4 PERDELİ TEK EĞİTMEN)
1. **Giriş & Bağlam:** İlk derste tanışma («Merhaba, ben [Eğitmen]. …») + "Hoş geldiniz. Bu bölümde [Konu Adı] konusunu ve neden ihtiyaç duyduğunuzu ele alacağız." 2. dersten «Ne Öğrenmiştik?» özeti. Kavram şef, garson, araç çantası, not defteri ve gerçek marka ile sahneye konur; tanım maddesiyle açılmaz.
2. **Problem:** "Geleneksel yapılarda [X Yanlışı/Eksiği] yaşanır. Bu yüzden bu mimariyi kullanırız." Yanlış, şefi garson sanmaktır: ChatGPT güzel konuşur, tabak gelmez.
3. **Kod & Uygulama Mantığı:** "Ekrandaki kod bloğunda gördüğünüz üzere..." — kodun her satırı masadaki bir harekettir. Garson deftere bakar ya da durur. Şef parametreyi yok sayıp cümle basar.
4. **Özet & Kazanım:** "Bu dersle [Y Becerisi] kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz." Kazanım «Konuşan AI değil, Çalışan AI» ayrımıdır.
5. **İş Kanıtı / Değerlendirme:** Ders sonu quiz ve kurs sınavı (baraj 70); SHA-256 yetkinlik mührü. Bu perde konuşma tiyatrosu değildir.

18 diyalog SKU bu dört perdeyi taşır. İki düz taslak (`ai-temel`, `ux-temel`) istisnadır; aynı dört başlıkla öğrenciye hitap eder.

---

# BÖLÜM B: PEDAGOJİ JUNIOR (10-18 YAŞ) — [DONMUŞ / GELECEK FAZ]
* Şimdilik donmuş durumdadır. Üretim, route veya kod yazımı yapılmaz.
