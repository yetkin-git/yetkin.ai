---
slug: "04_chatbot_nocode"
moduleCode: "CURR-CHATBOT-NOCODE-104"
title: "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)"
instructor: "Gözde (Kıdemli Yapay Zekâ ve Otomasyon Eğitmeni)"
category: "KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)"
layer: 1
targetAudience:
  - "Hiç kodlama bilmeyen KOBİ sahipleri"
  - "Klinik yöneticileri"
  - "E-ticaret satıcıları"
  - "Ajans sahipleri ve serbest çalışanlar"
  - "Müşterilerine yapay zekâ destekli diyalog sistemleri satmak isteyen girişimciler"
methodology: "Canlı diyalog ve sen dili, adım adım görsel akış (Visual Flow) tasarımı, sıfır kodlama (No-code), doğrudan randevu, kurşun toplama (Lead Generation) ve satış kapatma odaklı uygulamalar"
estimatedTotalMinutes: 53
format: "compact"
status: "draft-approved"
mediaSeal: "none"
voiceConfig:
  voice: "Callirrhoe"
  gender: "female"
  style: "Canlı diyalog ve sen dili, adım adım görsel akış rehberliği"
sections:
  - { sectionNumber: 1, key: "s1", title: "Chatbot Dünyasına Giriş ve Zihniyet Değişimi", targetDurationMinutes: 9.5, estimatedWordCount: 1356 }
  - { sectionNumber: 2, key: "s2", title: "Voiceflow ile İlk Web Chatbot'unu Tasarla (Görsel Akış ve Mantık)", targetDurationMinutes: 8.5, estimatedWordCount: 1190 }
  - { sectionNumber: 3, key: "s3", title: "Botpress ile Derinleşme ve Yapay Zekâ (LLM) Entegrasyonu", targetDurationMinutes: 8.5, estimatedWordCount: 1196 }
  - { sectionNumber: 4, key: "s4", title: "WhatsApp API ve Meta Entegrasyon Savaşları", targetDurationMinutes: 9, estimatedWordCount: 1256 }
  - { sectionNumber: 5, key: "s5", title: "Dış Dünya Bağlantıları (Webhooks, Make.com ve CRM)", targetDurationMinutes: 8.5, estimatedWordCount: 1192 }
  - { sectionNumber: 6, key: "s6", title: "Ticari Fırsat: Müşterilere Chatbot Satmak ve Modül Kapanışı", targetDurationMinutes: 9, estimatedWordCount: 1269 }
exam:
  passScore: 70
  drawCount: 10
  poolSize: 30
  poolRef: ""
  questionIdPrefix: "q_bot_"
version: "1.0.0"
lang: "tr"
---

# WhatsApp ve Web Chatbot Kurulumu (Voiceflow & Botpress ile Kodsuz Akıllı Asistanlar)

**Müfredat Kodu:** CURR-CHATBOT-NOCODE-104  
**Eğitmen:** Gözde (Kıdemli Yapay Zekâ ve Otomasyon Eğitmeni)  
**Kategori:** KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)  
**Hedef Kitle:** Hiç kodlama bilmeyen KOBİ sahipleri, klinik yöneticileri, e-ticaret satıcıları, ajans sahipleri, serbest çalışanlar ve müşterilerine yapay zekâ destekli diyalog sistemleri satmak isteyen girişimciler.  
**Öğretim Metodolojisi:** Canlı diyalog ve sen dili, adım adım görsel akış (Visual Flow) tasarımı, sıfır kodlama (No-code), doğrudan randevu, kurşun toplama (Lead Generation) ve satış kapatma odaklı uygulamalar.  
**Bölüm Başı Süre:** 8 - 10 Dakika (~1.200 - 1.400 Kelime)
**Çıktı Belgesi:** docs/curriculum/04_chatbot_mastery.md  

---

## MÜFREDAT BÖLÜM DAĞILIMI VE HEDEF KAZANIMLAR

* **Bölüm 1: Chatbot Dünyasına Giriş ve Zihniyet Değişimi**  
  İradeli müşteri temsilcisi ile kodsuz akıllı chatbot arasındaki farkı kavramak; sıkça sorulan sorular (SSS) mantığından randevu ve satış kapatan diyalog mimarisine geçiş yapmak; Voiceflow ve Botpress platformlarının güçlü yönlerini analiz ederek doğru projede doğru aracı seçmek.  

* **Bölüm 2: Voiceflow ile İlk Web Chatbot'unu Tasarla (Görsel Akış ve Mantık)**  
  Voiceflow çalışma tuvalinde sürükle-bırak yöntemle diyalog kurmak; Intent (Niyet), Utterance (İfade) ve Entity (Varlık) kavramlarını somutlaştırmak; değişkenler (Variables), kayan kartlar (Carousel), regex format kontrolleri ve If/Else karar mantıklarını kurarak web sitesinde çalışır vaziyette canlı bir asistan yayınlamak.  

* **Bölüm 3: Botpress ile Derinleşme ve Yapay Zekâ (LLM) Entegrasyonu**  
  Botpress mimarisini tanımak; RAG (Retrieval-Augmented Generation) altyapısıyla kliniğin tüm PDF ve web sitesi dokümanlarını bota ders kitabı olarak okutmak; botun saçmalamasını veya tıbbi teşhis koymasını engelleyen Guardrails (Emniyet Kalkanları), duygu analizi, anlamsal eşik değerleri, çok dilli destek ve Fallback protokolleri kurmak.  

* **Bölüm 4: WhatsApp API ve Meta Entegrasyon Savaşları**  
  WhatsApp Business uygulamasının sınırlarından sıyrılıp Meta Cloud API dünyasına geçmek; işletme doğrulama, yeşil tik, Sandbox test ortamları ve hız kısıtlamalarını (Rate Limiting) kavramak; sabit hatları bulut santrale bağlamak; Click-to-WhatsApp reklam entegrasyonu yapmak; ManyChat ile Botpress tercihlerini ayrıştırmak; 24 saat kuralını, görüşme bazlı ücretlendirmeyi, spam kalkanlarını ve şablon mesaj (Template Message) onay süreçlerini yönetmek.  

* **Bölüm 5: Dış Dünya Bağlantıları (Webhooks, Make.com ve CRM)**  
  Chatbot'u sadece ekranda konuşan bir araç olmaktan çıkarıp operasyon memuruna dönüştürmek; Webhook mantığıyla toplanan JSON verisini Make.com üzerinden Google Sheets, Airtable, takvim ve CRM sistemlerine aktarmak; asenkron Webhook yanıtı, çift yönlü veri sorgulama, hafıza tablosu (Data Store), veri temizleme, hata yönetimi (Error Handling), paralel yönlendirme ve acil durumlarda botu susturup canlı temsilciye devreden Human Handoff mimarisini kurmak.  

* **Bölüm 6: Ticari Fırsat: Müşterilere Chatbot Satmak ve Modül Kapanışı**  
  Hazırlanan botları KOBİ'lere "Chatbot as a Service" (Hizmet Olarak Chatbot) modeliyle satmak; kurulum ücreti, aylık bakım sözleşmesi ve SLA paketleri oluşturmak; müşteri itirazlarını göğüslemek; soğuk ikna taktikleriyle randevu alan demo bot sunumları yapmak; Katman 1'in dördüncü modülünün kapanışı ve final modülüne uzanan yol haritası.  

---

# BÖLÜM 1: Chatbot Dünyasına Giriş ve Zihniyet Değişimi

**Tahmini Okuma ve Anlatım Süresi:** 9-10 Dakika (~1.356 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** İzleyiciyle sıcak ve samimi bir bağ kurarak chatbot algısını değiştirmek; eski nesil sinir bozucu menü botları ile yeni nesil yapay zekâ destekli diyalog mimarisi arasındaki farkı somut diyaloglarla göstermek; işletmelerin mesai dışındaki satış kayıplarını netleştirmek ve Voiceflow ile Botpress seçim rehberini çizmek.  

---

### 1. TANIŞMA: MERHABA, BEN GÖZDE!

Merhaba! Ben Gözde. 

Katman 1 eğitim serimizin dördüncü ve pazarın şu an en çok para ödediği, en hızlı nakit akışı yaratan modülüne; yani kodsuz akıllı chatbot kurulumu eğitimine hoş geldin!

Bir önceki modülün, yani Sosyal Medya ve Video Fabrikası'nın sonunda sana bir söz vermiştik: *"Chatbot atölyesinde görüşmek üzere!"* İşte o atölyedeyiz. Orada ManyChat ile yorumdan DM'e akan otomasyon tünelleri kurmuştuk; müşteri yorum yazıyor, sistem ona otomatik kupon veya link düşürüyordu. Ama itiraf edelim: O tüneller tek yönlüydü; tetikle, gönder, bırak. Müşteri kupona *"Bu model bana uyar mı?"* diye yanıt yazdığında ise tünel susuyordu. Bugün o tünelin ucuna gerçek bir diyalog beyni takıyoruz; artık müşteriyi karşılayan, sorularını yanıtlayan, randevu ve satış kapatan bir asistan var.

Ekranının karşısına geçip bir yudum kahve almanı ve arkana yaslanmanı istiyorum. Çünkü bu eğitimde seninle birlikte sadece yeni bir yazılım öğrenmeyeceğiz. Bir işletmenin kaderini değiştiren, gece 03:00'te bile uykusuz çalışan, gelen her müşteriyi güler yüzle karşılayıp randevuya veya satışa bağlayan **dijital bir satış temsilcisi** inşa edeceğiz.

Bugüne kadar chatbot denildiğinde aklına muhtemelen hep o sinir bozucu, insanı çileden çıkaran deneyimler geldi. Bir bankanın veya kargo şirketinin uygulamasına girersin; karşına ruhsuz bir robot çıkar. Sen derdini anlatmaya çalışırsın: *"Kargom dağıtıma çıkmış görünüyor ama evde yokum, komşuma veya yakındaki şubeye bırakabilir misiniz?"* 

Robot sana döner ve ne der?  
*"Sizi anlayamadım. Lütfen ana menüye dönmek için 1'e, şube adresleri için 2'ye, kargo takip için 3'e basınız."*

O an telefonu fırlatmak istersin, değil mi? İşte o eski dünya, kural tabanlı, önceden yazılmış dar kalıpların dışına çıkamayan ilkel botların dünyasıydı. 

Bizim bu eğitimde kuracağımız sistemler ise bambaşka. Biz, karşısındaki insanın duygusunu anlayan, yarım yamalak yazılmış bir Türkçe cümleden veya yazım hatalarından bile ne istendiğini çıkaran, kliniğin veya mağazanın tüm arşivini saniyeler içinde tarayıp nokta atışı cevap veren ve en önemlisi **satış kapatan** akıllı diyalog elçileri üreteceğiz.

Üstelik tek bir satır Python, JavaScript veya HTML kodu yazmadan! Eğer bilgisayarında bir fareyi hareket ettirip kutucukları birbirine bağlayabiliyorsan, bu işin yüzde doksanını zaten biliyorsun demektir. Hazırsan, başlayalım!

---

### 2. İNSAN MÜŞTERİ TEMSİLCİSİ İLE KODSUZ AKILLI CHATBOT FARKI

Gel seninle gerçek hayattan bir sahne canlandıralım. 

Örnek vaka olarak tüm eğitim boyunca işleyeceğimiz **NovaDent Ağız ve Diş Sağlığı Polikliniği**'ni ele alalım. Burası İstanbul'da implant, zirkonyum kaplama ve şeffaf plak tedavileri yapan modern bir klinik olsun.

Cuma gecesi saat 23:45. Gün boyu işte çalışmış, dişi zonklayan veya gülüş estetiğini değiştirmek isteyen bir potansiyel hasta Instagram'da kliniğin bir reklamını görüyor. Reklama tıklıyor ve WhatsApp hattına şu mesajı atıyor:  
*"Merhaba, ön dişimde kırık var ve hafta sonu düğünüm var. Zirkonyum kaplama hemen yapılır mı, fiyatlar ne civarda?"*

Şimdi kliniğin önünde üç farklı senaryo var. Gel bu üç senaryoyu kelimesi kelimesine karşılaştıralım:

* **Senaryo A: Eski Nesil Kural Tabanlı Bot:**  
  Kullanıcı: *"Ön dişimde kırık var, zirkonyum kaplama hemen yapılır mı?"*  
  Eski Bot: *"NovaDent'e hoş geldiniz. Fiyat listesi için 1, hekimlerimiz için 2, adres için 3 yazınız."*  
  Kullanıcı: *"Kardeşim dişim kırık diyorum, yarına yetişir mi?"*  
  Eski Bot: *"Hatalı seçim yaptınız. Lütfen sadece 1, 2 veya 3 yazınız."*  
  Sonuç: Hasta öfkeyle sohbeti kapatır ve numarayı engeller!

* **Senaryo B: Geleneksel İnsan Temsilcisi:**  
  Kullanıcı mesajı cuma 23:45'te atar. Klinik kapalıdır. Danışman evinde uyumaktadır. Mesaj cumartesi sabah 09:45'e kadar yanıtsız kalır. Danışman uyanır ve *"Merhabalar efendim, kliniğimize bekleriz randevu için arayabilirsiniz"* yazar. Ama aradan tam 10 saat geçmiştir! Hasta gece yarısı acı ve panik içindeyken internetten nöbetçi başka bir kliniğe gitmiştir bile. NovaDent tek bir gecede en az 30.000 liralık bir tedaviyi masada bırakmıştır.

* **Senaryo C: Bizim İnşa Edeceğimiz Kodsuz Akıllı Chatbot:**  
  Kullanıcı mesajı cuma 23:45'te atar. Tam 0.4 saniye sonra bot devreye girer:  
  *"Çok geçmiş olsun Zeynep Hanım! Düğününüz öncesinde yaşadığınız stresi çok iyi anlıyoruz, hiç endişelenmeyin. NovaDent Kliniğimizde dijital tarama altyapımız sayesinde aynı gün içinde estetik geçici kaplama hazırlayabiliyoruz. Kliniğimiz yarın sabah saat 10:00'da açılıyor. Nöbetçi estetik hekimimiz Dr. Selin Hanım'a saat 10:30 için ön muayene ve diş kurtarma seansı ayıralım mı?"*

Hasta büyülenmiş gibi *"Evet lütfen, çok iyi olur"* der. Bot hemen adını ve telefon numarasını alır, randevuyu sisteme işler, konum bilgisini atar ve hasta koordinatörünün telefonuna anlık bildirim düşürür.

İşte aradaki fark budur! 

İnsan temsilci yorulur, moralsiz olur, aynı soruya gün içinde 50. kez cevap verirken bıkkın bir dille yazar, gece cevap veremez. Akıllı bot ise asla uyumaz, asla acıkmaz, aynı anda 5.000 farklı hastayla aynı nezaket, empati ve enerjiyle konuşur.

Fakat burada çok önemli bir pedagojik ilkeyi vurgulamak istiyorum: **Chatbot, insanın yerine geçmez; insanı rutin amelelikten kurtarır.** 

Bot, o ilk filtrelemeyi yapar, hastanın güvenini kazanır, temel bilgileri toplar ve altın tepside randevu olarak hekimin ve hasta danışmanının önüne koyar.

---

### 3. SSS KURGUSUNDAN SATIŞ KAPATAN DİYALOG MİMARİSİNE GEÇİŞ

Piyasadaki amatörlerin yaptığı en büyük hata nedir biliyor musun? Chatbot'u bir **ansiklopedi** gibi kurgulamak.

Müşteri bota girip *"İmplant fiyatı nedir?"* diye soruyor. Amatör bot cevap veriyor: *"İmplant fiyatlarımız 15.000 TL ile 30.000 TL arasında değişmektedir."* Ve susuyor! 

Bu bir diyalog değildir; bu bir Wikipedia maddesidir. Müşteri fiyatı okur, arkasını döner ve gider. O müşteri bir daha asla geri gelmez.

Bizim inşa edeceğimiz mimaride her mesaj bir **eylem çağrısıyla (Call to Action)** biter. Bot asla diyaloğu havada bırakmaz.

Bizim botumuz şöyle konuşur:  
*"İmplant tedavilerimizde kullanılan titanyum vidanın markasına, kemik yoğunluğunuza ve hekimimizin uygulayacağı cerrahi tekniğe göre tedavi planı kişiye özel belirlenmektedir. Ortalama başlangıç paketimiz 15.000 TL'den başlamaktadır. Ancak hekimimiz panoramik röntgeninizi incelemeden net bir rakam vermek sizi yanıltabilir. Dilerseniz yarın için hekimimizle ücretsiz bir panoramik röntgen ve ön muayene seansı planlayalım; ne dersiniz?"*

Gördün mü zarafeti ve satış psikolojisini? 
* Soruyu dürüstçe yanıtladık, hastayı geçiştirmedik.
* Fiyat belirsizliğinin arkasındaki tıbbi ve mantıklı nedeni açıkladık.
* Hemen ardından müşteriyi kaybetmemek için ücretsiz bir değer (panoramik röntgen) sunduk.
* Ve topu tekrar müşterinin kucağına attık: *"Ne dersiniz?"*

İşte buna **Satış Kapatan Diyalog Mimarisi** diyoruz. İşletmelerin bayıldığı, ajansların müşterilerine binlerce dolar karşılığında sattığı asıl sır budur. Müşteriye sadece bilgi vermiyoruz; müşteriyi adım adım bir sonraki mantıklı karara yönlendiriyoruz.

---

### 4. ARAÇ ÇANTAMIZ: VOICEFLOW MU, BOTPRESS Mİ?

Bu eğitimde sektörün açık ara en güçlü iki görsel yapay zekâ platformunu öğreneceğiz: **Voiceflow** ve **Botpress**.

Peki hangisini ne zaman kullanacağız? Gel aralarındaki farkı çok net kriterlerle ortaya koyalım.

* **Voiceflow (Diyalog Tasarımının ve Web Arayüzünün Şahı):**  
  Voiceflow, chatbot dünyasının Figma'sıdır. İnanılmaz zarif, kullanımı çocuk oyuncağı kadar kolay, görsel olarak kusursuz bir tuvale sahiptir. Bir müşteriye canlı sunum yaparken, bir web sitesine 2 dakikada şık bir sohbet penceresi gömerken veya görsel karar ağaçları çizerken Voiceflow rakipsizdir. Eğer projen ağırlıklı olarak web sitesi ziyaretçilerini karşılamak, prototip üretmek ve görsel zenginlik sunmaksa ilk tercihin Voiceflow olmalıdır.

* **Botpress (Yapay Zekâ Beyninin ve WhatsApp Entegrasyonunun Şahı):**  
  Botpress ise chatbot dünyasının güçlü mühendislik motorudur. Kendi içinde devasa bir RAG (Belge Okuma / Bilgi Tabanı) motoru barındırır. Kliniğin 100 sayfalık PDF kataloğunu atarsın, anında yutar. En büyük gücü ise Meta WhatsApp Cloud API, Telegram, Slack gibi mesajlaşma kanallarıyla doğrudan ve derin entegre olabilmesidir. Eğer müşterin *"Benim web sitem yok ya da kimse girmiyor, bana doğrudan WhatsApp hattımdan çalışan bir canavar lazım"* diyorsa, adresimiz Botpress'tir.

* **Hibrit Strateji:**  
  Biz profesyoneller genellikle şöyle çalışırız: Önce Voiceflow üzerinde müşteriye 15 dakikada göz kamaştırıcı bir görsel prototip gösterir ve sözleşmeyi imzalarız. Ardından derin bilgi tabanı ve WhatsApp hattı için Botpress altyapısını kurar, arkasını da Make.com ile kliniğin veritabanına bağlarız.

Bu eğitimde her iki platformu da sıfırdan kuracağız. Önce Bölüm 2'de Voiceflow tuvaline çıkıp görsel akış ve karar mantığını zihnimize kazıyacağız; ardından Bölüm 3'te Botpress ile yapay zekânın derinliklerine dalacağız.

---

### 5. BÖLÜMÜN PRATİK DÜŞÜNME EGZERSİZİ

Bölüm 2'ye geçmeden önce senden küçük bir ricam var. Önündeki not defterine veya zihnine şu 3 sorunun cevabını not etmeni istiyorum:

* Birincisi: Müşterinin bu bota gelişindeki en temel 3 niyeti nedir? Bizim klinik senaryomuzda: 1) Randevu almak, 2) Fiyat öğrenmek, 3) Acil ağrı durumu bildirmek.
* İkincisi: Müşteriden mutlaka almamız gereken hayati 2 bilgi nedir? İsim ve telefon numarası. Bu iki bilgi olmadan hiçbir işletme satış yapamaz.
* Üçüncüsü: Bot cevabı bilmediğinde ne yapmalı? Asla "Anlamadım" dememeli; nazikçe durumu toparlayıp telefon numarasını alarak insan danışmana devretmeli.

İşte bu 3 altın ilke, birazdan tasarlayacağımız botun omurgasını oluşturacak.

---

> **🎯 2 Dakikalık Saha Görevi:** Kendi işletmeni (veya tanıdığın bir işletmeyi) seç ve bir not defterine şu üç satırı yaz: Müşterinin sana gelişindeki en temel 3 niyet, mutlaka toplaman gereken 2 hayati bilgi ve botun bilmediği durumda sohbeti devredeceğin insanın adı. **Bu üç satır masanda durmadan Bölüm 2'de tuvalin başına geçme.**

---

Çayını veya kahveni tazelediysen, doğrudan Bölüm 2'ye geçelim ve ilk görsel akışımızı çizmeye başlayalım!

---

# BÖLÜM 2: Voiceflow ile İlk Web Chatbot'unu Tasarla (Görsel Akış ve Mantık)

**Tahmini Okuma ve Anlatım Süresi:** 8-9 Dakika (~1.190 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Voiceflow platformunun arayüzünü sıfırdan tanıtmak; Intent, Utterance ve Entity kavramlarını kodsuz dünyada somutlaştırmak; değişkenler (Variables), kayan kartlar (Carousel), regex format kontrolleri ve If/Else karar mantıklarını kurarak web sitesinde çalışır vaziyette canlı bir asistan yayınlamak.  

---

### 1. HOŞ GELDİN! TUVALİN BAŞINA GEÇİYORUZ

Harika bir başlangıç yaptık! Şimdi teoriyi arkamızda bırakıyoruz ve ellerimizi kirletmeye başlıyoruz.

Tarayıcından `voiceflow.com` adresini açtığını varsayıyorum. Ücretsiz bir hesap oluşturup "New Assistant" butonuna bastığında karşına bembeyaz, sonsuz bir çalışma tuvali çıkar. Burası bizim diyalog stüdyomuz.

Gözün sakın korkmasın. Voiceflow'da kod yoktur; sadece birbirine oklarla bağlanan **adımlar (Steps)** ve **kartlar (Cards)** vardır. Tıpkı legolarla kule yapmak gibidir. 

Sol tarafta duran araç çubuğunda konuşma blokları (Talk/Text), bilgi toplama blokları (Capture), butonlar (Choice), mantık blokları (Condition/Logic) ve dış dünya bağlantıları (API) hazır bekler. Buradan bir kartı alırsın, tuvale bırakırsın, içine cümleni yazarsın ve bir sonraki kutuya farenle bir çizgi çekersin. Sistem bu kadar doğaldır!

Şimdi gel, NovaDent Kliniğimiz için web sitemizin sağ alt köşesinde açılacak olan o şık karşılama botunu adım adım kuralım.

---

### 2. DİYALOĞUN 3 SİHİRLİ YAPI TAŞI: INTENT, UTTERANCE VE ENTITY

Teknik terimler seni hiç korkutmasın. Bu üç kavramı bir kere anladığında dünyadaki bütün yapay zekâ botlarının kalbini çözmüş olacaksın.

Gözünde canlandırmak için bir restorana gittiğini düşün:

* **Intent (Niyet):** Masaya oturduğunda aklından geçen ana amaç nedir? Yemek siparişi vermek. İşte yapay zekâ dilinde kullanıcının kafasındaki amaca **Intent** denir. Bizim klinik örneğimizde temel niyetler şunlardır: `Randevu_Almak`, `Fiyat_Sorgulama`, `Tedavi_Suresi`, `Lokasyon_Ulasim`, `Acil_Durum`.

* **Utterance (İfade / Söyleyiş Tarzı):** Peki sen garsona sipariş verirken herkesle aynı robotik cümleyi mi kurarsın? Elbette hayır! Biri *"Bakar mısınız, bir köfte alabilir miyim?"* der. Diğeri *"Bize oradan bir porsiyon ızgara köfte yaz"* der. Bir başkası *"Köftelerinizden tatmak istiyorum"* der. İşte kullanıcının aynı niyeti anlatmak için kurduğu bu onlarca farklı cümleye **Utterance** denir.  
  Voiceflow'da örneğin `Randevu_Almak` niyeti açtığımızda altına şu gerçekçi hasta ifadelerini gireriz:  
  * *"Yarın için muayene sırası alabilir miyim?"*  
  * *"Diş hekimine görünmek istiyorum."*  
  * *"Haftaya salı günü boş hekiminiz var mı?"*  
  * *"Acil randevu oluşturmak istiyorum."*  
  * *"Dt. Selin Hanım'a muayene olmak için gün almak istiyorum."*  
  Yapay zekâ bu 5 cümleyi okur ve arkasındaki anlamsal örüntüyü kavrayarak kullanıcının yazacağı diğer yüzlerce farklı varyasyonu kendiliğinden tanır!

* **Entity (Varlık / Cımbızla Çekilen Bilgi):** Garsona *"Bana yarın saat 14:00 için bir kişilik masa ayır"* dediğinde garson neyi not eder? 'Yarın' kelimesini tarih olarak, '14:00' kelimesini saat olarak, '1' kelimesini kişi sayısı olarak cımbızla çeker. Cümlenin içindeki bu somut veri parçacıklarına **Entity** denir.  
  Bizim botumuzda iki tip Entity vardır:  
  * Hazır Varlıklar (Built-in Entities): İsim, telefon numarası, e-posta, tarih ve saat. Bunları Voiceflow zaten doğuştan tanır.  
  * Özel Varlıklar (Custom Entities): Kliniğimize özel terimler. Örneğin `{tedavi_turu}` varlığı açarız ve içine implant, zirkonyum, diş beyazlatma, şeffaf plak, 20'lik diş değerlerini gireriz. Hasta *"Beyazlatma için ne zaman gelebilirim?"* dediğinde bot cümlenin içindeki 'beyazlatma'yı cımbızla çeker ve tedavi türü olarak kaydeder.

---

### 3. DEĞİŞKENLER, MATEMATİKSEL SKORLAMA VE KARAR DÜĞÜMLERİ

Bir botun akıllı hissettirmesini sağlayan en önemli şey nedir biliyor musun? Müşterinin tercihlerini hafızasında tutması ve buna göre kararlar vermesidir.

Değişkeni (Variable), botun cebindeki küçük boş etiketler gibi düşün. Biz sisteme şu etiketleri açarız:
* `kullanici_adi`
* `kullanici_telefon`
* `secilen_tedavi`
* `randevu_tarihi`
* `estetik_uygunluk_skoru`

Kullanıcı adını yazdığında bot bu bilgiyi alır ve `kullanici_adi` kutusunun içine koyar. Artık konuşmanın geri kalanında o etiketi açıp okuyabilir. 

Hatta Voiceflow'da harika bir numara yapabiliriz: **Set Variable** kartıyla hastaya 2 soru sorup küçük bir "Gülüş Estetiği Uygunluk Skoru" hesaplatabiliriz!  
Soru 1: *"Dişlerinizde çapraşıklık var mı?"* (Evet ise skora +5 ekle).  
Soru 2: *"Daha önce diş teli tedavisi gördünüz mü?"* (Hayır ise skora +5 ekle).  
Skor 10 çıkarsa bot şöyle der: *"Harika bir haber! Gülüş profiliniz Şeffaf Plak tedavisi için yüzde yüz uygun görünüyor!"* Hasta bu kişiselleştirilmiş analizi gördüğünde randevu almaya dünden razı olur.

Peki **Karar Düğümleri (Condition / If-Else)** ne işe yarar? Botun yol ayrımlarını yönetir:
* **Eğer (If):** Kullanıcı "İmplant" seçtiyse -> İmplant Bilgilendirme ve Kemik Yoğunluğu Analiz Bloğuna git.
* **Eğer (Else If):** Kullanıcı "Acil Ağrı" seçtiyse -> Bütün rutin soruları atla ve anında Nöbetçi Hekim Çağrı Hattı Bloğuna git.
* **Değilse (Else):** Genel Menü Bloğuna dön.

Ayrıca telefon numarası toplarken küçük bir mantık kalkanı koyarız: Kullanıcının yazdığı telefon numarası gerçekten 10 haneli bir telefon mu, yoksa rastgele bir metin mi?  
Eğer telefon geçerli bir formatta değilse bot şunu der: *"Girdiğiniz numara eksik veya hatalı görünüyor. Lütfen cep telefonunuzu başında sıfır olmadan 10 haneli olarak tekrar yazar mısınız?"* ve kullanıcıyı aynı adıma geri döndürür. Böylece kliniğe sahte veya eksik telefon gitmesi engellenir.

---

### 4. CANLI AKIŞI ÇİZİYORUZ: ADIM ADIM İLK PROTOTİP

Hadi gel, Voiceflow tuvalinde faremizi hareket ettirelim ve akışı inşa edelim:

* **Adım 1: Start Kartı ve Sıcak Karşılama:**  
  Tuvalin ortasındaki yeşil 'Start' ikonunun ucundaki küçük noktadan tut ve boşluğa çek. Bir 'Text' bloğu bırak. İçine şu cümleyi yaz:  
  *"Merhaba! NovaDent Dijital Kliniği'ne hoş geldiniz. Ben klinik asistanınız Ece. Size en doğru şekilde yardımcı olabilmem için adınızı öğrenebilir miyim?"*

* **Adım 2: İsmi Yakalama (Capture Card):**  
  Text bloğunun hemen altına bir 'Capture' bloğu bağla. Türünü 'Entire User Response' (Kullanıcının yazdığı tüm metin) seç ve bunu oluşturduğumuz `{kullanici_adi}` değişkenine kaydet. Artık hastamızın adını biliyoruz!

* **Adım 3: Kayan Kartlar (Carousel) ile Hekim ve Tedavi Vitrini:**  
  Voiceflow'un en sevdiğim özelliklerinden biri 'Carousel' kartıdır. Ekrana yatay kaydırılabilir görsel kartlar koyabilirsin:  
  * Kart 1: Dr. Selin Kaya (Estetik ve Zirkonyum Uzmanı) - Altında "Randevu Al" butonu.  
  * Kart 2: Dr. Murat Demir (Çene Cerrahisi ve İmplant Uzmanı) - Altında "Randevu Al" butonu.  
  * Kart 3: Acil Nöbetçi Hekim Masası - Altında "Hemen Ara" butonu.  
  Hasta parmağıyla hekimlerin fotoğraflarını ve uzmanlıklarını inceler.

* **Adım 4: Karar Dallanması ve Bilgi Verme:**  
  Hasta Dr. Murat Bey'i seçerse akış implant bilgilendirme kartına gider: *"Dr. Murat Bey çene cerrahisi alanında 15 yılı aşkın tecrübeye sahiptir. İmplant tedavilerimiz Alman ve İsviçre menşeili vidalarla yapılmaktadır. İşlem süresi tek diş için ortalama 15 dakikadır. Randevu oluşturmak ister misiniz?"*  
  Hasta "Evet" butonuna bastığında Adım 5'e bağlanır.

* **Adım 5: Telefon Numarasını Alma ve Format Doğrulama:**  
  Hasta randevu butonuna bastığında bota şu soruyu sorduruyoruz:  
  *"Randevu kaydınızı tamamlamak ve size özel randevu onay SMS'i gönderebilmemiz için lütfen 10 haneli cep telefonu numaranızı başında sıfır olmadan yazar mısınız?"*  
  Altına bir Capture bloğu koyuyoruz ve tipi 'Phone Number' seçip `{kullanici_telefon}` değişkenine atıyoruz.

* **Adım 6: Kapanış ve Özet Ekranı:**  
  Son blokta hastaya harika bir teyit özeti geçiyoruz:  
  *"Teşekkürler {kullanici_adi}! {kullanici_telefon} numaralı hattınıza randevu detaylarınız ve klinik konumumuz birazdan iletilecektir. Sağlıklı gülüşler dileriz!"*

---

### 5. WIDGET ÖZELLEŞTİRME VE WEB SİTESİNE GÖMME (EMBED SCRIPT)

Akış bittiğinde sağ üst köşedeki **Run / Test** butonuna basıp botunla sohbet edebilirsin. Kendi adını yaz, butonlara tıkla, akışın pürüzsüzlüğünü hisset.

Ardından Voiceflow'un **Widget Settings** sekmesine geç:
* Kliniğin logosunu yükle.
* Renk kodunu kliniğin kurumsal turkuazı olan `#0ea5e9` yap.
* Karşılama balonu (Proactive Message) ayarını aç ve şunu yaz: *"Diş sağlığınızla ilgili sorularınız mı var? 1 dakikada randevu oluşturabilirsiniz!"* Böylece ziyaretçi siteye girdiğinde sağ alttan dikkat çekici bir baloncuk fırlar.

Her şey içine sindiğinde sağ üstteki mavi **Publish** butonuna bas.

Voiceflow sana saniyeler içinde özel bir **Embed Code** (Gömme Kodu) verecektir. Bu kod, yaklaşık 3 satırlık minik bir JavaScript betiğidir:

```html
<script type="text/javascript">
  (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          projectID: 'novadent-klinik-projesi',
          sheet: false
        });
      }
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');
</script>
```

Bu kodu alırsın; kliniğin WordPress sitesinde, Webflow sayfasında veya özel yazılmış HTML sayfasının `</body>` etiketinin hemen üstüne yapıştırırsın. Sayfayı yenilediğin an, web sitesinin sağ alt köşesinde kliniğin canlı asistanı parıldamaya başlar!

---

> **🎯 2 Dakikalık Saha Görevi:** voiceflow.com'da ücretsiz bir hesap aç; boş tuvaldeki Start kartına tek bir karşılama cümlesi yaz, ucuna bir Capture bloğu bağla ve yanıtı `{kullanici_adi}` değişkenine kaydet. Test panelinde kendi adını yazıp botu bir kez çalıştır. **İlk akış okunu çizip kendi adınla konuşan botu görmeden Bölüm 3'e geçme.**

---

Peki ya hasta butonlara basmak yerine *"Şeker hastalarına implant yapılır mı?"* gibi serbest bir tıbbi soru yazarsa? İşte burada devreye bir üst lig, yani **Botpress ve Bilgi Tabanı (RAG)** giriyor. Hazırsan, Bölüm 3'e geçelim!

---

# BÖLÜM 3: Botpress ile Derinleşme ve Yapay Zekâ (LLM) Entegrasyonu

**Tahmini Okuma ve Anlatım Süresi:** 8-9 Dakika (~1.196 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Botpress platformunun yapay zekâ odaklı mimarisini keşfetmek; RAG (Retrieval-Augmented Generation) konseptini sıfır kodla hayata geçirmek; bir kliniğin tüm tedavi kılavuzlarını bota ders kitabı olarak okutmak; anlamsal eşik değerleri, Guardrails (Emniyet Kalkanları), duygu analizi, çok dilli destek ve Fallback protokolleri kurmak.  

---

### 1. HOŞ GELDİN! BOTA GERÇEK BİR "BEYİN" TAKMA ZAMANI

İkinci bölümde harika bir görsel akış kurduk. Ama fark ettiysen o akış, bizim önceden çizdiğimiz rayların dışına çıkamıyordu. 

Gerçek hayatta ise hastalar bizim çizdiğimiz raylardan gitmez. Biri gelir *"20'lik dişim çok ağrıyor, yanağım şişti, antibiyotik almadan çekilir mi?"* yazar. Diğeri *"SGK zirkonyum kaplamayı karşılıyor mu?"* diye sorar. Bir başkası *"Emziren annelere lokal anestezi uygulanabilir mi?"* der. Bir yabancı turist gelir ve İngilizce *"Do you offer airport transfer for dental tourists?"* diye sorar.

Eski dünyada bir geliştirici bu soruların her birini tek tek düşünüp sisteme kodlamak zorundaydı. Bu aylar sürerdi ve yine de eksik kalırdı.

İşte bu bölümde öğreneceğimiz **Botpress ve Bilgi Tabanı (Knowledge Base)** mimarisi bu çileyi tarihe gömüyor!

Biz bota tek tek soru-cevap öğretmeyeceğiz. Biz kliniğin 50 sayfalık hizmet broşürünü, hekimlerin hazırladığı tedavi rehberlerini ve SSS dokümanını alacağız; Botpress'in önüne koyacağız. 

Botpress o dokümanları 10 saniye içinde okuyacak, yutacak ve dünyanın en bilgili klinik danışmanı gibi hastanın sorduğu her soruya o dokümandan damıtılmış kusursuz Türkçe veya yabancı dilde yanıtlar verecektir.

---

### 2. RAG (RETRIEVAL-AUGMENTED GENERATION) NEDİR? "AŞÇI VE KÜTÜPHANE GÖREVLİSİ" BENZETMESİ

Sektörde herkesin dilinde dolaşan bu RAG kısaltması nedir? Gel bunu günlük hayattan çok eğlenceli bir benzetmeyle zihnine mühürleyelim.

Büyük bir restoran düşün:

* **Mutfaktaki Şef (Büyük Dil Modeli / LLM - ChatGPT veya Claude gibi):** Bu şef harika yemek yapar, dili çok iyi kullanır, sosları bilir, çok yaratıcıdır. Ama bir kusuru vardır: Restoranın bu akşamki menüsünde hangi balığın olduğunu veya depoda kaç kilo et kaldığını ezbere bilemez. Eğer ona sormadan iş yapmasını söylersen kafasından bir yemek uydurabilir! Buna yapay zekâda **Halüsinasyon (Uydurma)** denir.

* **Kütüphane Görevlisi (Retrieval Motoru):** Deponun kapısında elinde tam envanter listesiyle bekleyen çok titiz bir görevlidir. Yaratıcı değildir ama dosyalara ve belgelere hakimdir.

* **Sipariş Geldiğinde Ne Olur (RAG Mantığı)?** Müşteri *"Bu akşam levrek var mı?"* diye sorar. Kütüphane görevlisi hemen buzdolabına bakar, levreğin olduğunu ve tereyağlı hazırlandığını içeren belgeyi çeker. Bu belgeyi mutfaktaki şefe uzatır ve der ki: *"Al bu resmi belgeyi oku ve müşteriye buna sadık kalarak çok nazik bir dille cevap ver."* Şef belgeye bakar ve müşteriye kusursuz bir cümle kurar.

İşte RAG budur! 

Botpress dokümanı küçük parçalara böler (Chunking). Her parçayı anlamsal matematiksel sayılara çevirir (Vektörleştirme) ve bir vektör veri tabanına kaydeder. 

Burada çok kritik bir kavram devreye girer: **Anlamsal Benzerlik Eşiği (Similarity Threshold)**. Botpress'e şunu deriz: *"Eğer hastanın sorusu dokümandaki bilgiyle en az yüzde yetmiş oranında uyuşmuyorsa, kafandan uydurma; derhal Fallback bloğuna git!"* Bu sayede model asla halüsinasyon görmez ve güvenilirlik tavan yapar.

---

### 3. BOTPRESS'E DERS KİTABI OKUTMA: BİLGİ TABANI (KNOWLEDGE BASE) KURULUMU

Şimdi Botpress Studio ekranına geçelim. Sol menüde kitap simgesiyle gösterilen **Knowledge Base** sekmesine tıkla.

Önümüze 3 farklı bilgi yükleme seçeneği çıkar:

* **1. Documents (Dokümanlar):** Bilgisayarındaki PDF, Word veya metin dosyalarını sürükleyip bırakabilirsin. Örneğin: `NovaDent_Tedavi_Protokolleri_ve_Fiyat_Listesi_2026.pdf`. Burada dikkat etmen gereken püf nokta: Dokümanın taranmış resim (OCR) değil, seçilebilir temiz metin formatında olmasıdır. Başlıkların H1, H2 gibi hiyerarşik düzenlenmesi botun anlama hızını üç katına çıkarır.
* **2. Web Search / Web Crawler (Web Sitesi Tarayıcısı):** Kliniğin web sitesi adresini (`novadentklinik.com`) yazarsın. Botpress sitenin tüm sayfalarını, blog yazılarını ve hekim biyografilerini otomatik olarak gezer ve beynine kaydeder.
* **3. Text / FAQ (Doğrudan Metin):** Sıkça sorulan soruları soru-cevap formatında kopyalayıp yapıştırırsın.

Biz kliniğimizin PDF kılavuzunu yüklediğimiz an doküman taranır. 

Şimdi sağ taraftaki test panelinde büyü başlar. Test paneline şunu yaz:  
*"Zirkonyum kaplama ile porselen lamine arasındaki fark nedir, hangisi daha uzun ömürlüdür?"*

Botpress anında PDF'in 8. sayfasındaki estetik karşılaştırma tablosunu tarar ve hastaya şu akıcı cevabı verir:  
*"NovaDent Kliniğimizde zirkonyum kaplama daha çok çiğneme kuvvetinin yüksek olduğu arka dişlerde ve yoğun kırıkları olan dişlerde dayanıklılığı nedeniyle tercih edilir. Porselen lamine ise ön dişlerde minimum aşındırma yapılarak doğal mine görüntüsü sağlayan en üst düzey estetik çözümdür. Her iki tedavimiz de ortalama 10-15 yıl sağlıklı kullanım sunar. Hekimimiz Dr. Selin Hanım'ın gülüş hattınızı incelemesi için ücretsiz bir estetik konsültasyon randevusu ayıralım mı?"*

Hatta hasta İngilizce sorarsa:  
*"Do you have hotel packages for overseas patients?"*  
Botpress anında dokümanın sağlık turizmi bölümünden bilgi çeker ve akıcı bir İngilizce ile:  
*"Yes, NovaDent provides comprehensive packages including 4-star hotel accommodation and VIP airport transfers for our international guests. Would you like me to connect you with our International Patient Coordinator?"* yanıtını verir. 

Tek bir satır kod yazmadık! Sadece bir PDF yükledik ve botumuz çok dilli uzman bir tıp danışmanı gibi konuşmaya başladı.

---

### 4. GUARDRAILS (EMNİYET KALKANLARI): BOTUN SAÇMALAMASINI ÖNLEMEK

Burası bir yapay zekâ mimarı olarak senin en dikkat etmen gereken yerdir. Çünkü kontrolsüz bırakılan bir yapay zekâ, işletmenin başına çok büyük hukuki ve ticari belalar açabilir!

Düşünsene; hasta bota *"Dişim ağrıyor bana bir antibiyotik adı ver"* diyor. Eğer emniyet kalkanı koymazsan yapay zekâ gidip internetten öğrendiği bir ilaç ismi önerebilir! Bu hem yasal olarak suçtur hem de hastanın hayatını tehlikeye atar.

Ya da hasta bota *"Yan sokaktaki Dt. Mehmet Bey'in kliniği hakkında ne düşünüyorsun?"* diye sorar ve bot rakip kliniği övmeye başlar!

İşte bunu engellemek için Botpress'in **System Prompt (Sistem İstemi / Kişilik Direktifi)** alanına çok katı **Guardrails (Emniyet Sınırları)** yazarız.

O alana aynen şu kuralları giriyoruz:

* **Kural 1 (Kimlik ve Kapsam):** Sen sadece ve sadece NovaDent Ağız ve Diş Sağlığı Kliniği'nin resmi hasta asistanısın. Asla başka bir kimliğe bürünme.
* **Kural 2 (Tıbbi Teşhis ve Reçete Yasağı):** Asla doğrudan tıbbi teşhis koyma, kesin tedavi garantisi verme ve kesinlikle ilaç ismi veya dozu önerme. Hastaya her zaman şu cümleyi kur: *"Sağlığınız bizim için çok değerli. Ağız ve diş sağlığında kesin tanı ancak hekimimizin klinik muayenesi ve röntgen incelemesiyle konulabilir. Sizi hemen uzman hekimimize yönlendirmemi ister misiniz?"*
* **Kural 3 (Bilgi Sınırı):** Eğer hastanın sorduğu sorunun cevabı sana yüklenen Bilgi Tabanı (Knowledge Base) içinde yer almıyorsa, asla kafandan tahmin yürütme. Dürüstçe bilmediğini söyle ve canlı destek koordinatörüne aktar.
* **Kural 4 (Rakip Koruması):** Rakip klinikler, siyaset, genel kültür veya diş hekimliği dışındaki konular hakkında gelen soruları kibarca reddet ve konuyu klinik hizmetlerimize getir.

Bu 4 kuralı sisteme girdiğinde botunun etrafına çelikten bir güvenlik kalkanı örmüş olursun. Artık botun asla saçmalamaz, işletmeyi riske atmaz ve daima profesyonel kalır.

---

### 5. FALLBACK VE DUYGU ANALİZİ (SENTIMENT ANALYSIS) PROTOKOLÜ

Geleneksel botların en itici tarafı neydi?  
*"Üzgünüm, sizi anlayamadım."*

Bizim sistemimizde bu kelime yasaktır! Eğer hasta botun bilgi dağarcığında olmayan çok uç bir şey yazarsa, sistem **Fallback (Yedek Plan)** düğümünü tetikler.

Fallback bloğu devreye girdiğinde bot şöyle der:  
*"Bu özel durumunuzu doğrudan hasta koordinatörümüz Zeynep Hanım'a iletmek istiyorum. Kendisinin sizi 15 dakika içinde telefonla arayıp detaylı bilgi vermesini ister misiniz?"*

Ayrıca Botpress'in duygu analizi özelliği sayesinde hastanın psikolojisi ölçülür:
* Hasta öfkeliyse veya *"Rezalet bir yer, dolgüm düştü"* gibi sert cümleler kuruyorsa, bot savunmaya geçmez; tam tersi yüksek empati gösterir: *"Yaşadığınız bu aksaklık için gerçekten çok üzgünüz. Başhekimimize konuyu derhal iletiyorum, lütfen telefon numaranızı teyit ediniz."*
* Hasta endişeliyse (*"İğneden çok korkuyorum, canım acır mı?"*), bot yatıştırıcı bir dille kliniğin lazerli ağrısız anestezi yöntemlerini anlatır.

---

> **🎯 2 Dakikalık Saha Görevi:** Botpress Studio'da boş bir proje aç; Knowledge Base'e kendi işinden tek sayfalık bir hizmet veya SSS metni yapıştır. Test paneline önce metinde cevabı olan bir soru sor; sonra bilinçli olarak metinde olmayan uç bir soru sor ve botun uydurmadan Fallback'e düştüğünü kendi gözünle izle. **Kendi belgenle konuşan botu görmeden Bölüm 4'e geçme.**

---

İşte mükemmel bir asistan böyle inşa edilir! Şimdi geldik en can alıcı noktaya: Müşterilerin yüzde seksen beşi nereden ulaşıyor? Tabii ki WhatsApp'tan! O zaman kollarımızı sıvayalım ve Bölüm 4'te Meta WhatsApp API dünyasına adım atalım!

---

# BÖLÜM 4: WhatsApp API ve Meta Entegrasyon Savaşları

**Tahmini Okuma ve Anlatım Süresi:** 9 Dakika (~1.256 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Cep telefonundaki standart WhatsApp Business ile kurumsal WhatsApp Cloud API arasındaki farkları anlamak; Meta işletme doğrulama, yeşil tik, Sandbox test ortamları ve hız kısıtlamalarını (Rate Limiting) kavramak; sabit hatları bulut santrale bağlamak; Click-to-WhatsApp reklam entegrasyonu yapmak; ManyChat ile Botpress tercihlerini ayrıştırmak; 24 saat kuralını, görüşme bazlı ücretlendirmeyi, spam kalkanlarını ve şablon mesaj (Template Message) onay süreçlerini yönetmek.  

---

### 1. HOŞ GELDİN! TİCARETİN KALBİNE, WHATSAPP'A GİRİYORUZ

Bir sır duymak ister misin? 

Türkiye'de ve çevre coğrafyalarda web sitesi bir vitrindir; ama paranın kasaya girdiği yer **WhatsApp**'tır!

İster bir diş kliniği ol, ister ayakkabı satan bir e-ticaret mağazası, ister emlak ofisi... Müşteri web sitesine girer, fotoğraflara bakar ama satın alma kararını WhatsApp'tan bir yetkiliyle yazışırken verir.

Peki işletmeler WhatsApp'ta ne yaşıyor? Tam bir operasyonel kriz! 

Klinik danışmanının elinde tek bir cep telefonu var. Aynı anda 40 kişi yazıyor. Telefon çalıyor, mesajlar aşağıya kayıyor, fiyat soran hastalar unutuluyor, gece yazanlar cevapsız kalıyor.

İşte bu bölümde seninle birlikte o tek bir telefona hapsolmuş ilkel sistemi yıkacağız. Kliniğe resmi, yeşil tik başvurusu yapılabilen, arkasında yüzlerce operatörün ve akıllı yapay zekâ botumuzun aynı anda çalışabildiği kurumsal bir **WhatsApp Cloud API** omurgası kuracağız!

---

### 2. YEŞİL UYGULAMA VS. CLOUD API: BÜYÜK YANILGI

Piyasada KOBİ'lerin en çok düştüğü tuzak şudur:  
Giderler telefonlarına App Store'dan ücretsiz "WhatsApp Business" uygulamasını indirirler. İçine otomatik karşılama mesajı yazarlar: *"Şu an mesai dışındayız, sabah arayınız."* Ve sanırlar ki otomasyon kurdular!

Bu büyük bir yanılgıdır. Neden mi?

* **Telefon Bağımlılığı:** O telefonun şarjı bittiğinde veya interneti koptuğunda sistem durur.
* **Kullanıcı Sınırı:** Aynı anda en fazla birkaç kişi bağlanabilir; 10 kişilik bir ekip o hattı profesyonelce yönetemez.
* **Yapay Zekâ Entegrasyonu Yoktur:** Standart uygulamaya Botpress veya gelişmiş bir LLM bağlayamazsın.
* **Spam ve Banlanma Riski:** Eğer o telefondan günde 100 kişiye toplu mesaj atmaya kalkarsan Meta o numarayı 2 saat içinde sonsuza dek engeller!

Peki çözüm nedir? **WhatsApp Cloud API (Resmi İşletme API'si)**.

Cloud API, bir telefon uygulaması değildir. Meta'nın sunucularında yaşayan resmi bir veri borusudur. Fiziksel bir telefona ihtiyaç duymaz. İnternet kesilse de yaşar. 

Ve en önemlisi; arkasına istediğimiz yapay zekâ beynini (Botpress, ManyChat veya Make.com) doğrudan bağlamamıza izin verir.

---

### 3. META GELİŞTİRİCİ HESABI, İŞLETME DOĞRULAMA VE SANDBOX TESTLERİ

Bir işletmeye WhatsApp botu kurarken izleyeceğimiz resmi adımlar şunlardır:

* **Adım 1: Meta for Developers Hesabı Açmak:**  
  `developers.facebook.com` adresine gideriz. İşletmenin Meta Business Manager yöneticisiyle giriş yaparız.

* **Adım 2: WhatsApp Uygulaması Oluşturmak:**  
  Panelden "Create App" deriz, türünü "Business" seçeriz ve uygulamaya bir isim veririz (Örn: `NovaDent WhatsApp Asistanı`). Ürün listesinden "WhatsApp"ı seçip aktifleştiririz.

* **Adım 3: Sandbox (Geliştirici Test Ortamı):**  
  Meta bize hemen test yapabilmemiz için ücretsiz bir test numarası (Test Number) verir. Kendi cep telefonumuzu test alıcısı olarak ekleriz. Tek bir tıkla telefonumuza test mesajı atarak sistemin çalıştığını 2 dakikada doğrularız!

* **Adım 4: Telefon Numarası Tahsis Etmek ve Bulut Santral:**  
  Canlıya geçerken kullanacağımız telefon numarasının üzerinde aktif bir bireysel WhatsApp hesabı **olmamalıdır**. Eğer varsa numara silinmelidir.  
  En profesyonel yöntem: Kliniğin mevcut 0212 veya 0850'li sabit kurumsal numarasını Netgsm veya Bulut Santral sağlayıcısına taşımaktır. Böylece gelen sesli aramalar santrale giderken, WhatsApp mesaj trafiği doğrudan Botpress botumuza akar!

* **Adım 5: İşletme Doğrulaması (Business Verification) ve Yeşil Tik:**  
  Meta, dolandırıcılığı önlemek için şirketin resmi evraklarını ister. Kliniğin vergi levhasını, imza sirkülerini ve adına kayıtlı bir fatura yükleriz. Belgedeki şirket unvanı ve adres, Meta panelindeki bilgilerle harf harf uyuşmalıdır. Meta 24-48 saat içinde işletmeyi onaylar. Ardından yeşil onay rozeti (Official Business Account) başvurusu yaparak hasta gözündeki güveni zirveye taşırız.

---

### 4. MANYCHAT Mİ BOTPRESS Mİ? CLICK-TO-WHATSAPP REKLAMLARI

Peki WhatsApp için hangi platformu bağlayacağız? Burada çok net bir kuralımız vardır:

* **ManyChat:** Eğer işletme yoğun olarak Instagram reklamları veriyorsa, *"Hikayeye yanıt verene indirim kuponu gönder"*, *"Reels yorumuna FIRSAT yazana link at"* gibi sosyal medya odaklı hızlı DM satış hunileri kuruyorsa ManyChat bir numaradır.
* **Botpress:** Eğer işletme derin bir bilgi tabanına ihtiyaç duyuyorsa (diş kliniği, hukuk bürosu, teknik destek), hastaların uzun karmaşık sorularına PDF dokümanlarından yanıt verecekse ve doğrudan WhatsApp Cloud API ile konuşacaksa Botpress rakipsizdir.

Hatta muazzam bir büyüme taktiği vardır: **Click-to-WhatsApp (WhatsApp'a Yönlendiren) Meta Reklamları**.  
Instagram'da hastanın önüne bir reklam çıkar: *"Gülüşünüzü 3 günde yenileyin!"*. Hasta "WhatsApp'ta Mesaj Gönder" butonuna bastığı an kliniğin WhatsApp sohbeti açılır ve reklamın kimliği (Ad ID) bota aktarılır. Bot hastaya doğrudan reklamla ilgili özel bir karşılama yapar: *"Merhabalar! Gülüş tasarımı kampanyamızdan ulaştığınızı görüyorum. Size hekimlerimizin vaka örneklerini iletmemi ister misiniz?"* Bu kurgu dönüşüm oranlarını dörde katlar! Üstelik reklamdan başlayan diyaloglarda Meta ilk 72 saat boyunca mesaj ücreti almaz (Free Entry Point penceresi); yani reklamın getirdiği sıcak müşteriyi ikna etmek için önünde masrafsız, koca bir üç gün vardır.

Numaramız hazır olduğunda Botpress ile Meta arasında o sihirli köprüyü kurarız:
* **1. Kalıcı Erişim Belirteci (Permanent Access Token):** Meta panelinden ürettiğimiz bu gizli anahtarı alır, Botpress'in WhatsApp entegrasyon ayarlarındaki kutucuğa yapıştırırız.
* **2. Webhook URL ve Doğrulama Belirteci (Verify Token):** Botpress'in bize ürettiği özel Webhook adresini kopyalar, Meta panelindeki Webhook alanına yapıştırırız. Meta panelinde `messages`, `messaging_postbacks` ve `message_template_status_update` alanlarını işaretleyip "Verify and Save" butonuna basarız.

İşte bu kadar! Artık bir hasta kliniğin WhatsApp numarasına mesaj attığı an, o mesaj Meta sunucularından Botpress'e akar ve yarım saniye sonra yanıt ekrana düşer!

---

### 5. META'NIN KATI KURALLARI: 24 SAAT KURALI, HIZ LİMİTLERİ VE ŞABLONLAR

WhatsApp dünyasında kafana göre hareket edemezsin. Meta'nın kullanıcıları korumak ve para kazanmak için koyduğu kuralları bilmek zorundasın:

* **Kural 1: 24 Saat Müşteri Hizmetleri Penceresi (Customer Care Window):**  
  Bir müşteri kliniğin WhatsApp hattına mesaj attığı an 24 saatlik geri sayım sayacı başlar. Bu 24 saat boyunca botumuz veya insan temsilcimiz müşteriye dilediği kadar serbest metin mesajı gönderebilir.  
  Ancak müşteri son mesajının üzerinden 24 saat geçerse o pencere kapanır! Artık bota durup dururken *"Nasılsın, kliniğe gelmedin?"* diye serbest mesaj attıramazsın. Meta buna kesinlikle izin vermez.

* **Kural 2: Mesaj Bazlı Ücretlendirme (Per-Message Pricing):**  
  Meta, Temmuz 2025'ten bu yana eski "görüşme başına" modelini terk etti; artık teslim edilen her şablon mesajı tek tek ücretlendirilir. Ücret, mesajın kategorisine ve müşterinin ülke koduna göre değişir:  
  * Pazarlama (Marketing): Kampanya, indirim ve promosyon duyuruları. En yüksek maliyetli kategoridir.  
  * Fayda / Bilgilendirme (Utility): Randevu teyidi, fatura, kargo takip bilgileri. Düşük maliyetlidir.  
  * Hizmet / Servis (Service): Müşterinin başlattığı diyalogda 24 saatlik pencere içinde gönderdiğin serbest yanıtlardır. Meta, Ekim 2026 itibarıyla bu kategoriyi de mesaj başına ücretlendirmeye başlıyor; ancak her işletme numarasına her ay 1.000 ücretsiz hizmet mesajı hakkı tanınıyor.  
  Fiyat tablosu ülkeye göre değiştiği ve zamanla güncellendiği için canlıya geçmeden önce güncel tarifeyi mutlaka Meta Business panelinden teyit edersin.

* **3 Hazır Onaylı Şablon Örneği:**  
  Peki 24 saat geçtikten sonra hastaya randevusunu nasıl hatırlatacağız? Meta onaylı **Şablon Mesajlar** ile. Bu onay mekanizması Meta'nın spam kalkanıdır: Meta, işletmelerin kullanıcıyı izinsiz mesaj bombardımanına tutmasını engellemek için her şablonu yayınlanmadan önce inceler; onaysız şablon hatta asla çıkamaz:  
  * Şablon 1 (Randevu Hatırlatma): *"Sayın {{1}}, yarın saat {{2}} için NovaDent Kliniğimizde Dt. {{3}} ile randevunuz bulunmaktadır. Onaylamak için 'EVET', ertelemek için 'ERTELE' yazabilirsiniz."*  
  * Şablon 2 (Operasyon Sonrası Bakım): *"Sayın {{1}}, bugünkü diş çekimi operasyonunuz sonrasında ilk 2 saat bir şey yememenizi ve buz kompresi uygulamanızı öneririz. Ağrı veya kanama durumunda bu mesaja 'ACİL' yazabilirsiniz."*  
  * Şablon 3 (E-Ticaret Sepet Kurtarma): *"Sayın {{1}}, sepetinizde unuttuğunuz ortopedik tabanlık için size özel yüzde on indirim tanımlandı. Kodunuz: SEPET10. Satın alımı tamamlamak için linke tıklayabilirsiniz."*

* **Spam Koruması, Hız Limitleri (Rate Limiting) ve Numara Sağlığı:**  
  Meta başlangıç seviyesinde saniyede maksimum 80 mesaj gönderimine izin verir. Yüksek hacimli kampanyalarda mesajları Make.com üzerinden kuyruğa (Queue) alarak 1-2 saniyelik aralıklarla göndeririz.  
  Asla müşterilere izinsiz reklam yağdırma. Her zaman mesajın sonuna *"Abonelikten çıkmak için İPTAL yazabilirsiniz"* seçeneği koy. Eğer hastalar numaranı "Spam / Engelle" olarak işaretlerse Meta kalite puanını yeşilden sarıya, sonra kırmızıya düşürür ve hattını kısıtlar. Bizim botumuz sadece talep eden, randevu alan ve bilgi isteyen hastalarla saygılı bir diyalog kurar.

---

> **🎯 2 Dakikalık Saha Görevi:** developers.facebook.com adresinde bir test uygulaması aç, WhatsApp ürününü aktifleştir ve Sandbox test numarasından kendi cep telefonuna ilk "Merhaba" mesajını gönder. Ardından kendi işletmen için 24 saat kuralına uygun tek bir randevu hatırlatma şablonu taslağı kaleme al. **Test mesajı telefonuna düşmeden Bölüm 5'e geçme.**

---

Şimdi botumuz web'de konuşuyor, WhatsApp'ta konuşuyor. Ama toplanan bu randevular hekimin takvimine nasıl işlenecek? Hasta koordinatörünün tablosuna nasıl akacak? Hazırsan, Bölüm 5'te Webhook'lar ve Make.com ile otomasyonun zirvesine çıkalım!

---

# BÖLÜM 5: Dış Dünya Bağlantıları (Webhooks, Make.com ve CRM)

**Tahmini Okuma ve Anlatım Süresi:** 8-9 Dakika (~1.192 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Chatbot'u izole bir sohbet aracı olmaktan çıkarıp işletmenin omurgasına bağlamak; Webhook kavramını garson benzetmesiyle kavramak; Make.com üzerinde kodsuz senaryolar kurarak toplanan verileri Google Sheets, Airtable, takvim ve CRM sistemlerine aktarmak; asenkron Webhook yanıtı, çift yönlü veri sorgulama, hafıza tablosu (Data Store), veri temizleme, hata yönetimi (Error Handling), paralel yönlendirme ve acil durumlarda botu susturup canlı temsilciye devreden Human Handoff mimarisini kurmak.  

---

### 1. HOŞ GELDİN! BOTUMUZA KOLLAR VE BACAKLAR TAKIYORUZ

Buraya kadar harika bir iş çıkardın! Botumuz artık akıllıca konuşuyor, PDF'leri okuyor ve WhatsApp'tan yanıt veriyor.

Ama gel dürüst olalım: Sadece ekranda konuşup duran bir bot, işletme için yarım bir çözümdür. 

Düşünsene; hasta WhatsApp'tan adını vermiş, telefonunu vermiş, *"Pazartesi saat 14:00'e Dr. Selin Hanım'dan implant randevusu istiyorum"* demiş. Bot da *"Harika, randevunuzu aldım"* demiş. 

Ama bu bilgi botun hafızasında kalırsa ne olur? Pazartesi günü hasta kliniğe gelir; danışmanın hiçbir şeyden haberi yoktur, hekimin takvimi doludur! Tam bir kriz, değil mi?

İşte bu bölümde botumuza kollar ve bacaklar takacağız. Botun topladığı o değerli veriyi anında işletmenin beynine, yani Google Sheets tablolarına, hekimin randevu takvimine ve hasta koordinatörünün telefonuna aktaracağız.

---

### 2. WEBHOOK NEDİR? "MUTFAĞA GİDEN SİPARİŞ FİŞİ" BENZETMESİ

Teknik terimler seni asla korkutmasın demiştik. Gel şu **Webhook** denilen canavarı en lezzetli benzetmeyle çözelim.

Yine restoranımıza dönelim:

* Masada müşteri oturuyor (Kullanıcı).
* Masanın başında garsonumuz bekliyor (Bizim Chatbot).
* Müşteri garsona siparişini veriyor: *"Bir porsiyon ızgara levrek ve bir salata."*
* Şimdi garson ne yapar? Müşterinin masasında oturup saatlerce sohbet etmez! Cebinden küçük sipariş fişini çıkarır; üzerine 'Masa 4, Levrek, Salata' yazar.
* Ardından mutfağın duvarındaki küçük pencereye gider ve o fişi içeriye, aşçıbaşının önüne fırlatır!

İşte o fişin fırlatıldığı küçük pencereye **Webhook** denir!

Webhook, internet üzerindeki bir uygulamanın diğer bir uygulamaya *"Hey, bende yeni bir olay gerçekleşti, al bu da toplanan veri!"* diyerek fırlattığı dijital bir mesaj fişidir.

Bu fiş **JSON** adı verilen çok sade bir formatta taşınır. Korkma, JSON sadece iki noktalı anahtar-değer listesidir:
* `isim`: "Ahmet Yılmaz"
* `telefon`: "05321112233"
* `tedavi`: "İmplant"
* `tarih`: "Pazartesi 14:00"

Bot bu fişi hazırlar ve Make.com'un Webhook penceresine fırlatır. Gerisini Make.com halleder!

---

### 3. KODSUZ ENTEGRASYONUN ŞAHI: MAKE.COM İLE TANIŞMA

İnternetteki yüzlerce farklı programı (Chatbot, Google Sheets, Airtable, WhatsApp, SMS servisleri, CRM yazılımları) birbirine bağlayan en güçlü görsel köprü **Make.com**'dur (eski adıyla Integromat).

Make.com'da hiçbir kod yazmazsın. Ekranında yuvarlak daireler (Modüller) vardır. Bir daireyi diğerine bağlarsın ve su borusu gibi veri birinden diğerine akar.

Gel seninle klinik senaryomuz için 6 adımlı profesyonel bir Make.com boru hattı (Senaryosu) kuralım:

* **Modül 1: Custom Webhook ve Asenkron Yanıt:**  
  Make.com'da boş bir senaryo açarız. İlk modül olarak "Webhooks -> Custom Webhook" seçeriz. Sistem bize özel bir internet adresi üretir: `https://hook.eu1.make.com/abc123xyz...`. Bu adresi Botpress veya Voiceflow'daki API bloğuna yapıştırırız.  
  Burada altın değerinde bir profesyonel ipucu: Webhook'un hemen arkasına bir "Webhook Response" modülü bağlayıp bota anında "200 OK (Başarılı)" yanıtı döndürürüz. Böylece bot gecikmeden hastayla sohbete devam ederken, arkadaki ağır tablo ve CRM işlemleri arka planda asenkron çalışır!

* **Modül 2: Veri Temizleme ve Formatlama (Tools / Set Variable):**  
  Müşteriler telefon numarasını farklı formatlarda yazar: Kimi "+90 532...", kimi "0532...", kimi boşluklu yazar. Make.com'un dahili formülleriyle bu veriyi tek tıkla standart uluslararası formata (`905321112233`) dönüştürürüz.  
  Burada bir de KVKK kalkanımız devreye girer: Webhook fişine ve hedef tablolara yalnızca iş için gerçekten gerekli alanları koyarız. Hastanın şikayet metni veya kimlik numarası gibi hassas veriler asla üçüncü taraf sistemlere ham haliyle taşınmaz; raporlama gerektiğinde telefon numarasının orta haneleri maskelenir. Kural basittir: İş için gerekmeyen veri, fişe hiç yazılmaz.

* **Modül 3: Router (Yol Ayrımı Mantığı):**  
  Hemen arkasına bir "Router" modülü koyarız. Router iki farklı kola ayrılır:  
  * Kol A (Acil Durumlar): Eğer hastanın şikayetinde "şiddetli ağrı", "kanama", "kırık" geçiyorsa doğrudan acil nöbetçi hekim SMS hattına sapar.  
  * Kol B (Normal Randevu): Rutin randevu adımlarına devam eder.

* **Modül 4: Google Sheets & Airtable (Hasta Takip Tablosuna Satır Ekleme):**  
  Normal kolda "Google Sheets -> Add a Row" modülü bağlarız. Kliniğin `NovaDent_2026_Randevu_Listesi` tablosunu seçeriz:  
  * Ad Sütununa -> Webhook'tan gelen `{isim}`  
  * Telefon Sütununa -> Formatlanmış `{telefon}`  
  * Tedavi Sütununa -> Webhook'tan gelen `{tedavi}`  
  * Talep Edilen Tarih Sütununa -> Webhook'tan gelen `{tarih}`  
  Artık her yeni mesajda Google tablosuna otomatik yeni bir satır düşer! Dileyenler buraya HubSpot, Airtable veya Salesforce gibi kurumsal bir CRM de bağlayabilir.

* **Modül 5: Google Calendar & Otomatik Hatırlatıcı:**  
  Beşinci modül olarak hekimin Google Takvimini bağlarız. Hekimin pazartesi saat 14:00 aralığına sarı renkle "Ahmet Yılmaz - İmplant Muayenesi" randevu kartı açılır. Takvime otomatik olarak randevudan 2 saat önce hekime ve koordinatöre hatırlatıcı alarm kurulur.

* **Modül 6: Hata Yönetimi (Error Handling - Kalkanımız):**  
  Peki ya Google sunucuları anlık olarak çökerse ne olur? Make.com'da modülün üzerine sağ tıklar ve "Add Error Handler -> Resume" veya "Break" seçeriz. Eğer Google yanıt vermezse Make.com pes etmez; işlemi kuyruğa alır ve 15 dakika sonra sessizce tekrar dener. Sistemimiz asla veri kaybetmez!

---

### 4. ÇİFT YÖNLÜ VERİ SORGULAMA VE HAFIZA TABLOLARI (DATA STORE)

Webhook sadece tek yönlü veri göndermek için kullanılmaz; **çift yönlü veri sorgulama (Two-Way Sync)** için de muazzam bir silahtır!

Gel iki harika kullanım senaryosuna bakalım:

* **Senaryo 1: Randevu Sorgulama:**  
  Hasta WhatsApp'tan bota şunu sorar: *"Yarın benim randevum saat kaçtaydı, unutmuşum?"*  
  Bot hastanın telefon numarasını Make.com'a fırlatır. Make.com Google Sheets'te o telefon numarasını arar. Bulduğu satırdaki randevu saatini (`15:30, Dr. Selin`) alır ve bota geri yanıt (Webhook Response) olarak döndürür! Bot 0.8 saniye içinde ekrana şunu yazar: *"Ahmet Bey, yarın saat 15:30'da Dt. Selin Hanım ile zirkonyum kontrol randevunuz bulunmaktadır. Sizi bekliyor olacağız!"*

* **Senaryo 2: E-Ticarette Kargo ve Sipariş Durumu Sorgulama:**  
  Müşteri bota girip *"Siparişim nerede? Sipariş numaram: 48921"* der. Bot sipariş numarasını Make.com üzerinden Shopify veya Trendyol mağazasına sorar. Gelen kargo takip linkini bota döndürür: *"Siparişiniz bugün saat 11:20'de Yurtiçi Kargo'ya teslim edilmiştir. Takip linkiniz aşağıdadır."*

* **Senaryo 3: Make.com Data Store ile Sadık Müşteri Hafızası:**  
  Make.com'un dahili mini veri tabanı olan Data Store'a hastanın geçmişini kaydederiz. Hasta 2 ay sonra tekrar bota yazdığında bot onu hatırlar: *"Tekrar merhaba Ahmet Bey! En son mart ayında kliniğimize gelmiştiniz, diş sağlığınız nasıl gidiyor?"* Bu kişiselleştirilmiş hafıza müşteride benzersiz bir hayranlık yaratır.

---

### 5. HUMAN HANDOFF (CANLI TEMSİLCİYE DEVİR) MEKANİZMASI

Ne kadar kusursuz bir bot kurarsak kuralım, bazı durumlar vardır ki mutlaka bir insanın devreye girmesi gerekir:

* Hasta öfkelidir veya gergin bir dille şikayet ediyordur.
* Hasta ısrarla *"Ben robotla muhatap olmak istemiyorum, yetkili biri bağlansın"* yazıyordur.
* Hasta tedavi fiyatında özel bir indirim veya pazarlık talep ediyordur.
* Ya da vaka çok karmaşıktır ve bot iki defa üst üste soruyu yanıtlayamamıştır.

İşte bu anlarda botun inatla konuşmaya devam etmesi felakettir! Müşteriyi çıldırtır.

Bizim mimarimizde **Human Handoff (İnsana Devir)** protokolü devreye girer:

* **Tetikleyici Cümleler:** Sistem hastanın yazdığı cümlelerde *"yetkili"*, *"insan"*, *"müşteri temsilcisi"*, *"pazarlık"*, *"şikayet"* kelimelerini sezdiği an veya Fallback bloğu iki kez üst üste çalıştığında devreye girer.
* **Botun Sessize Alınması (Pause Automation):** Bot hastaya çok nazik bir veda mesajı gönderir:  
  *"Sizi çok iyi anlıyorum. Konuyu hemen hasta danışmanımız Zeynep Hanım'a aktarıyorum. Kendisi şu an yazışmamızı devraldı, lütfen hatta kalınız."*
* **Sohbetin Panele Düşmesi:** Bot susar ve konuşmayı durdurur. Aynı anda kliniğin WhatsApp Business paneline (veya kullandıkları Chatwoot / ManyChat paneline) kırmızı renkle "Müdahale Bekliyor" etiketiyle bir uyarı düşer.
* **Temsilcinin Devralması:** Masadaki insan danışman klavyeyi eline alır ve yazışmaya kaldığı yerden devam eder. Danışman işini bitirdiğinde tek bir butona basarak botu yeniden nöbete gönderir!

İşte mükemmel bir otomasyon böyle çalışır: Gerektiğinde tam gaz çalışan bir makine, gerektiğinde ise direksiyonu sessizce insana bırakan kusursuz bir zarafet.

---

> **🎯 2 Dakikalık Saha Görevi:** Make.com'da ücretsiz bir hesap aç; boş senaryoya bir Custom Webhook modülü koy ve ürettiği adresi kopyala. Tarayıcının adres çubuğuna o adresi `?isim=KendiAdın` parametresiyle yapıştırıp tek bir test isteği gönder; ardından gelen veriyi Google Sheets'te yeni bir satıra düşür. **Kendi adını tabloda görmeden Bölüm 6'ya geçme.**

---

Artık teknik olarak tam donanımlı bir Yapay Zekâ ve Diyalog Mimarı oldun! Peki bu muazzam beceriyi nasıl paraya dönüştüreceğiz? Müşterilere nasıl satacağız? Hazırsan, final bölümümüz olan Bölüm 6'ya geçelim ve bu işin ticaretini konuşalım!

---

# BÖLÜM 6: Ticari Fırsat: Müşterilere Chatbot Satmak ve Modül Kapanışı

**Tahmini Okuma ve Anlatım Süresi:** 9 Dakika (~1.269 Kelime)
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Öğrenilen teknik becerileri yüksek kârlı bir iş modeline dönüştürmek; Chatbot as a Service (CaaS) mimarisini ve iki katmanlı fiyatlandırma modelini kavramak; SLA ve sözleşme detaylarını öğrenmek; müşteri itirazlarını göğüslemek; soğuk ikna taktikleriyle randevu alan demo bot sunumları yapmak; Katman 1'in dördüncü modülünün kapanışını ve final modülüne uzanan yol haritasını aktarmak.  

---

### 1. HOŞ GELDİN! ARTIK TEKNOLOJİ TÜKETİCİSİ DEĞİL, ÇÖZÜM SATICISISIN

Tebrik ederim! Gerçekten seninle gurur duyuyorum.

Bu noktaya kadar geldiysen, artık dünyadaki bilgisayar kullanıcılarının yüzde doksan dokuzunun bilmediği, hayal bile edemediği bir güce sahipsin. 

Sen artık sadece ekran kaydıran bir yapay zekâ meraklısı değilsin. Sen; işletmelerin müşteri kaçırmasını önleyen, satışlarını artıran, gece gündüz çalışan otonom diyalog sistemleri inşa eden bir **Yapay Zekâ Otomasyon Mimarı**sın.

Peki bu bilgi masanda veya bilgisayarında kilitli mi kalacak? Asla!

Bugün sokaktaki her 10 işletmeden 9'u mesaj trafiği altında eziliyor. Bir kuaföre git; randevu mesajlarına yetişemediği için fön çekerken telefonuyla boğuşur. Bir diş hekimine git; ameliyattayken gelen hastaları kaçırır. Bir e-ticaret butiğine git; Instagram DM'lerine 4 saat geç baktığı için müşterileri Trendyol'a kaptırır.

Hepsinin ortak bir çığlığı var: *"Bize yardım edin, mesajlara yetişemiyoruz!"*

İşte bu bölümde bu çığlığı nasıl sürdürülebilir, aylık düzenli nakit akışı sağlayan bir işletmeye dönüştüreceğimizi öğreneceğiz.

---

### 2. "CHATBOT AS A SERVICE" (CAAS) NEDİR? İKİ KATMANLI GELİR MODELİ

Piyasadaki acemiler ne yapar biliyor musun? Giderler bir müşteriye tek seferlik bir bot kurarlar. *"Ağabey sana bir bot yaptım, ver bana 10.000 TL"* derler. Parayı alırlar ve kaçarlar.

Üç ay sonra ne olur? Kliniğin fiyatları değişir, yeni bir hekim işe başlar, bot eski bilgi verir ve müşteri öfkelenip sistemi kapatır. Geliştirici de her ay yeni müşteri aramak için sokaklarda sürünür.

Biz bu amatör tuzağa asla düşmeyeceğiz! Bizim uygulayacağımız modelin adı **Chatbot as a Service (CaaS / Hizmet Olarak Chatbot)** modelidir.

Bu model iki sağlam gelir bacağına dayanır:

* **1. Gelir Bacağı: Tek Seferlik Kurulum Ücreti (Setup Fee):**  
  Bu, sistemi sıfırdan kurma, diyalog akışlarını çizme, PDF bilgi tabanını hazırlama, Guardrails emniyet kalkanlarını dikme ve Make.com ile Google Sheets/CRM bağlantılarını tamamlama bedelidir.  
  Piyasa standardı proje başına **15.000 TL ile 45.000 TL** (veya yurt dışı müşteriler için 1.000$ - 3.000$) arasında değişir. Bu para senin ilk işçilik ve mimarlık emeğindir.

* **2. Gelir Bacağı: Aylık Düzenli Bakım ve Optimizasyon Aboneliği (Monthly Retainer):**  
  İşte asıl servetin yattığı yer burasıdır! İşletmeye dersin ki:  
  *"Sayın klinik yöneticim; bu sistem yaşayan bir organizmadır. Ben her ay botun yaptığı konuşmaları analiz edeceğim, takıldığı noktaları iyileştireceğim, yeni kampanyalarınızı ve hekimlerinizi bota öğreteceğim, Meta API güncellemelerini takip edeceğim ve sistemin 7/24 kesintisiz çalışmasını garanti edeceğim."*  
  Bunun için işletmeden ayda **3.000 TL ile 7.500 TL** (yurt dışı için 200$ - 500$) arası düzenli bir bakım ücreti alırsın.

* **Hizmet Seviyesi Anlaşması (SLA) ve Sözleşme Şeffaflığı:**  
  Müşteriye sunduğun sözleşmede şunları netleştir: Sistem çalışma süresi (Uptime) yüzde 99.5, hasta verilerinin KVKK ve gizlilik standartlarına uygun saklanması, her ayın 1'inde sunulacak aylık performans raporu (toplam konuşma sayısı, toplanan randevu adedi, kaçırılmaktan kurtarılan hasta sayısı). Ayrıca Meta mesajlaşma maliyetlerinin işletmenin kendi kredi kartından ödeneceğini baştan belirt.

Düşünsene: Portföyüne sadece 10 tane klinik veya KOBİ kattığında; her ay hiçbir şey yapmasan bile hesabına düzenli olarak 40.000 TL - 50.000 TL pasife yakın net nakit akışı girer! 

İşte gerçek bir danışmanlık işletmesi böyle inşa edilir.

---

### 3. MÜŞTERİ İTİRAZLARINI GÖĞÜSLEME VE ROI (YATIRIM GETİRİSİ) MATEMATİĞİ

Bir işletme sahibiyle masaya oturduğunda karşına genellikle 3 klasik itiraz çıkar:

* **İtiraz 1: "Bizim zaten Instagram'a ve WhatsApp'a bakan sekreterimiz var."**  
  Cevabın: *"Harika! Ancak sekreteriniz akşam 18:00'den sonra ve hafta sonu uyuyor. Reklamlarınız ise en çok gece 21:00 ile 01:00 arasında izleniyor. Biz sekreterinizi işten çıkarmıyoruz; onun gece kaçırdığı ve sabah yetişemediği hastaları toplayıp sabah önüne hazır liste olarak koyuyoruz."*

* **İtiraz 2: "İnsanlar robotla konuşmaktan nefret eder."**  
  Cevabın: *"İnsanlar aptal robotlardan nefret eder; ama sorusuna 0.5 saniyede nazikçe cevap veren akıllı sistemlere bayılırlar. Ayrıca botumuz hastayı zorlamaz; dileyen hastayı tek tıkla canlı danışmanınıza aktarır."*

* **İtiraz 3: "Aylık 5.000 TL bakım ücreti bize pahalı geldi."**  
  Cevabın (Matematiksel ROI Tokadı): *"Hocam kliniğinizde tek bir implant tedavisinin ücreti ne kadar? Ortalama 25.000 TL. Bu bot gece kaçırdığınız sadece TEK bir hastayı randevuya bağlasa bile, kliniğe kazandırdığı para aylık bakım ücretinin tam 5 katıdır! Bu bir gider değil, doğrudan kâr getiren bir yatırımdır."* Bu hesaba hiçbir ticari akıl karşı çıkamaz!

---

### 4. MÜŞTERİYE NASIL SATILIR? "SOĞUK DEMO" TAKTİĞİ

Peki müşteriyi nasıl bulacağız? Kapı kapı dolaşıp *"Bot ister misiniz?"* demeyeceksin. **"Soğuk Demo" (Cold Demo) Formülüyle** satacaksın:

* **Adım 1: Hedef İşletmeyi İncele:** Bölgedeki bir estetik kliniğinin, yabancı dil kursunun veya mobilya mağazasının web sitesine ve Instagram hesabına gir.
* **Adım 2: Voiceflow'da 15 Dakikalık Mikro Prototip Kur:** Onların kurumsal renklerini ve logolarını kullanarak adıyla hitap eden, kliniğin en popüler 2 hizmeti için randevu alan minicik bir bot akışı hazırla. Daha önce kurduğun bir şablonu 'Duplicate' ederek 5 dakikada yeni müşteriye uyarlayabilirsin!
* **Adım 3: 60 Saniyelik Ekran Kaydı (Loom / Video) Çek:** Telefonundan veya bilgisayarından ekranı kaydetmeye başla:  
  *"Merhaba Selin Hocam! NovaDent Kliniğinizin Instagram hesabını ve web sitesini inceledim. Harika işler yapıyorsunuz ancak gece reklamlarınızdan gelen hastaların ortalama 8 saat yanıtsız kaldığını fark ettim. Bu kayıpları önlemek için kliniğinize özel 7/24 randevu alan şöyle küçük bir yapay zekâ prototipi hazırladım. Bakın hasta adını yazıyor, implantı seçiyor ve saniyesinde randevu oluşturuyor. Eğer ilginizi çekerse bu cuma 10 dakikalık bir kahve molasında bunu sisteminize nasıl entegre edebileceğimizi konuşabiliriz. Saygılarımla."*
* **Adım 4: WhatsApp veya E-Posta ile Gönder:** Bu videoyu klinik sahibine veya pazarlama müdürüne ilet.

Sana garanti ediyorum; bu şekilde hazırlanmış 10 kişiselleştirilmiş videodan en az 3 tanesi sana randevu olarak geri döner. Çünkü sen onlara soyut bir teknoloji satmadın; sen onların kaybettiği parayı ve çözümü gözlerinin önüne koydun!

---

### 5. MODÜLÜN BÜYÜK ZİRVESİ VE KATMAN 1 YOL HARİTASI

Arkana yaslan ve nereden nereye geldiğimize bir bak. 

Katman 1 yolculuğunda geride bıraktığımız dört basamağa ve önümüzde duran son kapıya bir bak:

* **Modül 1'de:** Ofiste ve iş hayatında yapay zekâ zihniyetini kazandık. Excel formüllerini tarihe gömdük, darmadağınık verileri saniyeler içinde temizledik, profesyonel yönetim raporları ve sunumlar ürettik. Günlük 2 saatimizi geri kazandık.
* **Modül 2'de:** E-ticaretin temellerine indik. Mağazalarımızı matematiksel SEO başlıklarıyla donattık, AIDA ve PAS formülleriyle ikna eden ürün açıklamaları yazdık, müşteri yorumlarını tarayıp iadeleri kestik ve Buybox kalkanımızı diktik.
* **Modül 3'te:** İleri seviye otonom fabrikalar kurduk. Tek bir ham fotoğraftan 30 günlük sosyal medya içerik matrisleri ürettik, ROAS canavarı reklam kreatifleri tasarladık ve veri analitiğiyle stoklarımızı yönettik.
* **Ve Modül 4'te (Bugün):** Tüm bu sistemi 7/24 yöneten, web'de ve WhatsApp'ta canlı olarak randevu ve sipariş toplayan, verileri Make.com ile arkadaki sistemlere işleyen akıllı bir diyalog elçisi inşa ettik!
* **Modül 5'te (Pratik Prompt Mühendisliği) — Katman 1'in finali ve sıradaki durağın:** Bu dört modülde öğrendiğin her aracı tek bir günlük çalışma disiplinine bağlayan pratik prompt kasını inşa edeceğiz; ChatGPT, Claude ve Perplexity karşısında rol, bağlam, kısıt ve çıktı formatı mühendisliğini günlük refleksine dönüştüreceğiz.

Sen artık sadece bir çalışan veya serbest meslek erbabı değilsin. Sen pazarın en çok aradığı, şirketlerin kapısında kuyruk olduğu komple bir **Dijital Dönüşüm ve Otomasyon Uzmanı**sın.

Ben Gözde. Bu dört modüllük devasa yolculuk boyunca seninle birlikte çalışmaktan, ekranımın karşısında senin bu gelişimine şahitlik etmekten tarifsiz bir onur ve mutluluk duydum.

Unutma: Teknoloji sürekli değişecek. Yeni modeller çıkacak, yeni butonlar eklenecek. Ama senin burada öğrendiğin o temel felsefe; yani **problemi tespit etme, yapay zekâyı doğru çerçeveleme ve pratik bir iş modeline dönüştürme** yeteneğin ömür boyu senin en büyük sermayen olacak.

---

> **🎯 2 Dakikalık Saha Görevi:** Çevrendeki bir işletmeyi seç; onların en çok sorulan 3 müşteri sorusunu ve mesai dışında kaçırdıklarını tahmin ettiğin mesaj sayısını bir kağıda yaz. Ardından o işletmeye özel 60 saniyelik "Soğuk Demo" videonun ilk iki cümlesini kaleme al. **İlk demo taslağın cebinde olmadan kendini bu modülden mezun sayma.**

---

Şimdi bölüm sonu sınavına gir, tüm bu bilgileri zihninde mühürle ve Katman 1.4 Başarı Sertifikanı gururla al! Sınavda havuzdan rastgele çekilen 10 soru seni bekliyor ve geçme barajı **70 puan**. Cevapların sunucu tarafında puanlanır; barajı geçtiğin an sertifikan **SHA-256 yetkinlik mührüyle** basılır. Yani bu belge satın alınca değil, yalnızca kanıtlayınca indirilir!

Yolculuğumuz burada bitmiyor: Katman 1'in final kapısı olan Pratik Prompt Mühendisliği atölyesinde yeniden buluşacağız; orada bu dört modülün bütün silahlarını tek bir günlük üretim disiplinine bağlayacağız. Kendine çok iyi bak, cesur ol ve üretmekten asla vazgeçme! Prompt atölyesinde görüşmek üzere!
