---
slug: "05_prompt_practice"
moduleCode: "CURR-PROMPT-PRACTICE-105"
title: "Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)"
instructor: "Gözde (Kıdemli Yapay Zekâ ve İstem Mimarisi Eğitmeni)"
category: "KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)"
layer: 1
targetAudience:
  - "Günlük işlerinde yapay zekâyı en yüksek verimle kullanmak isteyen beyaz yakalılar"
  - "Girişimciler"
  - "Öğrenciler"
  - "Profesyoneller"
methodology: "Canlı diyalog ve doğrudan sen hitabı, uygulamalı prompt şablonları, rol tanımlama, bağlam kurma, Few-Shot yönlendirme, Chain-of-Thought (düşünce zinciri) mantığı, sıfır kodlama, TTS dostu akıcı anlatım"
estimatedTotalMinutes: 44
format: "compact"
status: "draft-approved"
mediaSeal: "none"
voiceConfig:
  voice: "Callirrhoe"
  gender: "female"
  style: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım"
sections:
  - { sectionNumber: 1, key: "s1", title: "Yapay Zekâ ile Doğru İletişim & Prompt Zihniyeti", targetDurationMinutes: 9, estimatedWordCount: 1272 }
  - { sectionNumber: 2, key: "s2", title: "İleri Seviye Prompt Teknikleri (Few-Shot & Chain-of-Thought)", targetDurationMinutes: 8, estimatedWordCount: 1136 }
  - { sectionNumber: 3, key: "s3", title: "İş Hayatında ve Metin Üretiminde Prompt Mühendisliği", targetDurationMinutes: 7, estimatedWordCount: 952 }
  - { sectionNumber: 4, key: "s4", title: "Veri Analizi, Problem Çözme ve Karar Destek Promptları", targetDurationMinutes: 6, estimatedWordCount: 823 }
  - { sectionNumber: 5, key: "s5", title: "Görsel ve Multimodal Yapay Zekâ için Prompt Mühendisliği", targetDurationMinutes: 6.5, estimatedWordCount: 878 }
  - { sectionNumber: 6, key: "s6", title: "Kendi Prompt Kütüphaneni Oluşturmak ve Modül Kapanışı", targetDurationMinutes: 7.5, estimatedWordCount: 1050 }
exam:
  passScore: 70
  drawCount: 10
  poolSize: 30
  poolRef: ""
  questionIdPrefix: "q_pr_"
version: "1.0.0"
lang: "tr"
---

# Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity ile Sıfır Hata ve Yüksek Verim)

**Müfredat Kodu:** `CURR-PROMPT-PRACTICE-105`  
**Eğitmen:** Gözde (Kıdemli Yapay Zekâ ve İstem Mimarisi Eğitmeni)  
**Kategori:** KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)  
**Hedef Kitle:** Günlük işlerinde, ofis ortamında, araştırmalarında ve iş süreçlerinde yapay zekâyı en yüksek verimle, sıfır halüsinasyonla kullanmak isteyen tüm beyaz yakalılar, girişimciler, öğrenciler ve profesyoneller.  
**Öğretim Metodolojisi:** Canlı diyalog ve doğrudan "sen" hitabı, uygulamalı prompt şablonları, rol tanımlama, bağlam kurma, Few-Shot yönlendirme, Chain-of-Thought (düşünce zinciri) mantığı, sıfır kodlama, TTS dostu akıcı anlatım.  
**Bölüm Başı Süre:** 6 - 9 Dakika (~825 - 1.270 Kelime, ~140 kelime/dakika TTS standardı)  
**Çıktı Belgesi:** `docs/curriculum/06_prompt_engineering_mastery.md`  

---

## MÜFREDAT VE BÖLÜM DAĞILIM MATRİSİ

| Bölüm No | Bölüm Başlığı | Hedef Kazanım & Beceri | Hedef Süre | Durum |
|---|---|---|---|---|
| **Bölüm 1** | **Yapay Zekâ ile Doğru İletişim & Prompt Zihniyeti** | Arama motoru mantığından bilişsel asistan talimatına geçiş, halüsinasyon nedenlerini teşhis etme ve bir promptun 5 temel yapı taşını (Rol, Görev, Bağlam, Kısıtlar, Çıktı Formatı) uygulama. | 9 Dk | **TAM METİN HAZIR** |
| **Bölüm 2** | **İleri Seviye Prompt Teknikleri (Few-Shot & Chain-of-Thought)** | Zero-Shot, One-Shot ve Few-Shot örnekleme farkını yönetme, "Adım Adım Düşün" mantığıyla mantık ve matematik hatalarını sıfırlama, Uzman Paneli simülasyonu kurma. | 8 Dk | **TAM METİN HAZIR** |
| **Bölüm 3** | **İş Hayatında ve Metin Üretiminde Prompt Mühendisliği** | İkna edici e-postalar, teklif mektupları ve rapor özetleri hazırlama, kurumsal veya samimi üslup uyarlama ve uzun dokümanları nokta atışı sadeleştirme. | 7 Dk | **TAM METİN HAZIR** |
| **Bölüm 4** | **Veri Analizi, Problem Çözme ve Karar Destek Promptları** | Dağınık verilerden SWOT analizi çıkarma, kriz senaryosu ve stres testi simülasyonları yapma, Critique & Refine döngüsüyle stratejik mantık denetimi yaptırma. | 6 Dk | **TAM METİN HAZIR** |
| **Bölüm 5** | **Görsel ve Multimodal Yapay Zekâ için Prompt Mühendisliği** | Midjourney ve DALL-E 3 için ışık, açı ve doku parametreleriyle görsel yönlendirme, Vision yapay zekâsıyla fotoğraftan içgörü ve hata tespiti çıkarma, ses ve video komut standartları. | 6,5 Dk | **TAM METİN HAZIR** |
| **Bölüm 6** | **Kendi Prompt Kütüphaneni Oluşturmak ve Modül Kapanışı** | Parametreli tekrar kullanılabilir istem kütüphanesi mimarisi kurma, Katman 1 genel modül özeti, büyük mezuniyet kapanışı ve resmi yetkinlik sertifikası yönlendirmesi. | 7,5 Dk | **TAM METİN HAZIR** |

---

# BÖLÜM 1: Yapay Zekâ ile Doğru İletişim & Prompt Zihniyeti

**Tahmini Okuma ve Anlatım Süresi:** 9 Dakika (~1.270 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** İzleyiciyle sıcak ve samimi bir bağ kurmak; internet arama motoru alışkanlıkları ile üretici yapay zekâ mantığı arasındaki derin uçurumu somutlaştırmak; yapay zekânın neden yalan söylediğini (halüsinasyon gördüğünü) matematiğe boğmadan anlatmak; her türlü yapay zekâ aracında çalışan 5 temel yapı taşını (Rol, Görev, Bağlam, Kısıtlar, Çıktı Formatı) canlı bir öncesi-sonrası vaka çalışmasıyla öğretmek.

---

### 1. TANIŞMA: MERHABA, BEN GÖZDE!

Merhaba! Ben Gözde.

No-Code Chatbot atölyemizde ayrılırken sana *"Prompt atölyesinde görüşmek üzere!"* diye söz vermiştim. İşte o atölyedeyiz; ben sözümü tuttum, sen de geldin!

Burası Katman 1'in beşinci ve son modülü; yani beş derslik büyük yolculuğumuzun **taçlandırma finali**. Ofiste, e-ticarette, sosyal medyada ve chatbot kurulumunda öğrendiğin her aracın arkasındaki ortak dili; yani seni teknolojinin sadece bir tüketicisi olmaktan çıkarıp yapay zekânın gerçek bir orkestra şefine dönüştürecek eğitime, Pratik Prompt Mühendisliği Masterclass'ına hoş geldin!

Şimdi arkana rahatça yaslanmanı, elindeki kahveden küçük bir yudum almanı ve zihnindeki bütün önyargıları bir kenara bırakmanı istiyorum. 

Muhtemelen son bir iki yıldır etrafında sürekli şu kelimeleri duyuyorsun: *"Prompt mühendisliği geleceğin mesleği! Prompt yazmayı bilmeyen işsiz kalacak! Yapay zekâya doğru komutu veren dünyayı fetheder!"*

Sonra bir gün ChatGPT'yi, Claude'u veya Perplexity'yi açıyorsun. Karşına boş, bembeyaz bir kutu çıkıyor. İçine bir şeyler yazıyorsun: *"Bana şirketim için bir pazarlama planı yaz."* 

Enter tuşuna basıyorsun. Model saniyeler içinde sana beş paragraflık bir metin döküyor. Okuyorsun ve yüzünde ekşi bir gülümseme beliriyor:  
*"Sosyal medyayı aktif kullanın, hedef kitlenizi tanıyın, kaliteli içerik üretin..."*

Kendi kendine diyorsun ki: *"E ben bunu zaten biliyorum! Herkesin bildiği basmakalıp laflar bunlar. Bu yapay zekâ dedikleri şey sahiden bu kadar mıydı?"*

Sana çok açık bir gerçeği söyleyeyim: Sorun yapay zekâda değil. Sorun, senin o devasa zekâya nasıl yaklaşacağını henüz bilmemende!

Bu eğitimde seninle birlikte hiçbir ezbere formüle, karmaşık yazılım kodlarına veya havalı görünen ama hiçbir işe yaramayan şablon yığınlarına girmeyeceğiz. Biz, yapay zekânın zihnine bir pencere açacağız. Onun dili nasıl işlediğini, nasıl düşündüğünü ve ona verdiğin tek bir doğru talimatla nasıl harikalar yarattığını adım adım göreceğiz. Hazırsan, ilk adımı birlikte atalım!

---

### 2. "GOOGLE'DA ARAMAK" İLE "BİLİŞSEL ASİSTANA TALİMAT VERMEK" ARASINDAKİ FARK

Yapay zekâ kullanan insanların yüzde sekseninin yaptığı en ölümcül hata nedir biliyor musun?

Yapay zekâ kutusunu, yirmi yıldır alıştığımız **Google arama çubuğu** gibi kullanmaya çalışmak!

Gel bu iki mantığı birbirine kıyaslayalım:

* **Google Mantığı (Arama Motoru):** Google devasa bir kütüphane fihristidir. Sen arama kutusuna *"İstanbul en iyi diş klinikleri"* veya *"2026 e-ticaret trendleri"* yazarsın. Google cümleni analiz etmez; yazdığın anahtar kelimeleri dünyadaki milyarlarca web sayfasıyla eşleştirir ve sana o kelimelerin geçtiği linkleri listeler. Google'da ne kadar az kelime yazarsan, sonuç o kadar geniş olur.
* **Yapay Zekâ Mantığı (Bilişsel Akıl Yürütme):** Büyük dil modelleri bir link arşivi değildir! Karşındaki sistem, milyarlarca kitap, makale, araştırma ve diyalogla eğitilmiş; diller arasındaki mantık örgüsünü kavramış **bilişsel bir asistandır**. O, bir sonraki kelimenin ne olması gerektiğini senin sunduğun bağlama göre hesaplayan dev bir düşünce ortağıdır.

Sen Google'a *"Sözleşme feshi"* yazarsan sana kanun maddelerini bulur. 

Ama yapay zekâya sadece *"Sözleşme feshi"* yazarsan; sistem senin kim olduğunu, sözleşmenin konusunu, kiracı mısın yoksa ev sahibi misin, çalışan mısın yoksa işveren misin, neyi amaçladığını bilmediği için genel bir hukuk makalesi yazıp geçer.

Unutma: **Google bilgi arar; yapay zekâ problem çözer ve içerik üretir.** 

Ona bir arama motoru gibi anahtar kelimeler fırlatmayı bıraktığın gün, hayatının en verimli çalışma arkadaşını kazanmış olacaksın.

---

### 3. YAPAY ZEKÂ NEDEN "HALÜSİNASYON" GÖRÜR?

Kullanıcıların en çok dert yandığı ikinci konu şudur:  
*"Gözde, yapay zekâ bana öyle kendinden emin bir şekilde yalan söyledi ki, neredeyse inanacaktım! Olmayan bir mahkeme kararı uydurdu, var olmayan bir kitap referansı verdi. Neden saçmalıyor bu sistem?"*

Bu duruma yapay zekâ literatüründe **Halüsinasyon (Hallucination)** diyoruz. 

Peki yapay zekâ neden yalan söyler? Kötü niyetli olduğu için mi? Elbette hayır!

Büyük dil modellerinin temel çalışma prensibini bilmen gerekiyor: Model, senin yazdığın cümlenin devamına gelebilecek en olası ve istatistiksel olarak en uyumlu kelimeleri üretmeye programlanmıştır. 

Modelin zihninde *"Ben bu sorunun cevabını bilmiyorum, susayım"* gibi insani bir refleks varsayılan olarak açık değildir! Sen ona bir boşluk bıraktığında, model o boşluğu doldurmak için elindeki en şık, en ikna edici kelimeleri bir araya getirir. Ve ortaya trajikomik bir halüsinasyon çıkar.

Örnek verelim:  
Kullanıcı sorar: *"Ahmet Yılmaz'ın 2024 yılında yazdığı Yapay Zekâ ve Etik kitabının ana fikri nedir?"*  
Gerçekte böyle bir yazar ve böyle bir kitap yoktur!  
Ama model ne yapar? *"Ahmet Yılmaz bu eserinde yapay zekânın toplumsal adalet üzerindeki etkilerini üç ana başlıkta incelemiştir..."* diyerek tamamen kusursuz bir masal uydurur! Çünkü sen ona bir kitap olduğunu varsayarak soru sordun, o da seni memnun etmek için hikayeyi tamamladı.

İşte tam bu yüzden prompt mühendisliği sadece süslü cümleler kurma sanatı değildir; **yapay zekânın önüne raylar döşeme ve onun yoldan çıkmasını engelleyen emniyet kalkanları koyma sanatıdır.**

---

### 4. BİR PROMPTUN 5 TEMEL YAPI TAŞI: FORMÜLÜMÜZ

Artık amatörce istem yazma devrini kapatıyoruz. Bugünden itibaren yazacağın her ciddi promptta aklına şu 5 altın bileşen gelecek:

* **1. Rol (Role):** Yapay zekâya hangi şapkayı takıyorsun? Dünyanın en iyi vergi uzmanı mı, acımasız bir yatırımcı mı, sevecen bir ilkokul öğretmeni mi, yoksa deneyimli bir e-ticaret metin yazarı mı? Rol tanımlamak, modelin milyarlarca parametre arasından tam olarak o uzmanlığa ait kelime dağarcığını ve düşünce kalıbını öne çekmesini sağlar.
* **2. Görev (Task):** Yapay zekânın tam olarak ne yapmasını istiyorsun? Eylem fiili net olmalıdır: *"Özetle"*, *"Karşılaştır"*, *"Hataları listele"*, *"3 alternatif başlık üret"*. Asla muğlak bırakma.
* **3. Bağlam (Context):** Arka plan hikayesi nedir? Şirketin ne iş yapıyor? Müşteri kim? Hedef kitle kaç yaşında? Bu metin nerede kullanılacak? Ne kadar çok somut arka plan verirsen, sonuç o kadar senin hayatına özel olur.
* **4. Kısıtlar (Constraints):** Neleri KESİNLİKLE YAPMAYACAK? İşte halüsinasyonu sıfırlayan sihirli kalkan burasıdır! *"Maksimum 150 kelime kullan"*, *"Asla teknik jargon kullanma"*, *"Eğer metinde cevabı bulamıyorsan uydurma, 'elimdeki veride bu bilgi yer almıyor' de"*, *"Satış odaklı abartılı sıfatlar kullanma"*.
* **5. Çıktı Formatı (Output Format):** Bilgiyi sana nasıl teslim etsin? Düz paragraf mı, maddeler halinde mi, e-posta taslağı olarak mı, yoksa adım adım bir kontrol listesi şeklinde mi?

Bu 5 bileşeni bir araya getirdiğinde, ortaya çıkan sonuca sen bile inanamayacaksın.

---

### 5. CANLI VAKA: KÖTÜ PROMPT VS. MÜKEMMEL PROMPT

Gel seninle masada canlı bir karşılaştırma yapalım. Sen bir kahve dükkanı sahibisin ve yeni bir soğuk kahve menüsü hazırlıyorsun.

* **Kötü Prompt (Dünyanın %90'ının yazdığı):**  
  *"Bana soğuk kahve menüm için bir tanıtım yazısı yaz."*  
  Model ne üretir?  
  *"Sıcak yaz günlerinde ferahlamanın en lezzetli yolu! Taze çekilmiş kahve çekirdeklerimizle hazırlanan eşsiz soğuk kahvelerimiz damağınızda unutulmaz bir tat bırakacak. Hemen gelin, serinleyin!"*  
  Klişe, ruhsuz ve sokaktaki 50 bin kafenin herhangi birinin kullanabileceği bomboş bir metin!

* **Mükemmel Prompt (Bizim 5 Yapı Taşlı İstemimiz):**  
  *"Sen yeni nesil üçüncü dalga kahvecilik sektöründe 10 yıllık deneyime sahip yaratıcı bir marka metin yazarısın.*  
  *Görevin: Kadıköy Moda'da genç üniversite öğrencileri ve uzaktan çalışan yazılımcılara hitap eden butik kafemiz için 3 adet soğuk kahve tanıtım metni hazırlamak.*  
  *Bağlam: Çekirdeklerimiz Etiyopya Yirgacheffe, soğuk demleme tekniğimiz 18 saat sürüyor ve içeceklerimizin içinde narenciye ve yasemin notaları var. Dükkanımız sakin, loş ve çalışma dostu bir mekan.*  
  *Kısıtlar: Asla 'ferahlığın adresi', 'eşsiz lezzet', 'damak çatlatan' gibi klişe reklam tabirlerini kullanma. Samimi, hafif esprili ve kahvenin asidite dengesini vurgulayan bir dil kullan. Her metin en fazla 3 cümle olsun. Bilmediğin bir malzeme ekleme.*  
  *Çıktı Formatı: Her seçenek için önce vurucu bir başlık, altında 2 cümlelik açıklama ve sonunda Instagram için 1 eylem çağrısı olacak şekilde madde imleriyle listele."*

Görüyor musun aradaki farkı? 

Model bu promptu okuduğu anda artık Moda'da oturan, üçüncü dalga kahveyi bilen, gençlerin dilinden anlayan bir uzmana dönüşür. Ürettiği metin de sokaktaki reklam kokan broşürler gibi değil; doğrudan hedef kitlenin ruhuna dokunan sanatsal bir davete dönüşür.

İşte prompt mühendisliği budur: **Modeli doğru çerçevelemek, ona ne istediğini tam tarif etmek ve sınırlarını net çizmek.**

---

> **🎯 2 Dakikalık Saha Görevi:** Bu dersi kapatmadan önce: Bugün veya bu hafta yapay zekâya yazdığın tek cümlelik sıradan bir istemi (örneğin *"bana bir mail yaz"* ya da *"şu konuyu özetle"*) al; altına Rol, Görev, Bağlam, Kısıtlar ve Çıktı Formatı satırlarını ekleyerek yeniden yaz ve iki sonucu yan yana karşılaştır. **Aradaki uçurumu kendi ekranında görmeden 2. bölüme geçme.**

---

Şimdi derin bir nefes al. Çünkü Bölüm 2'de bu temelin üzerine, yapay zekâyı en zorlu matematik ve mantık problemlerinde bile sıfır hatayla çalıştıran ileri seviye teknikleri; yani Few-Shot ve Chain-of-Thought yöntemlerini inşa edeceğiz!

---

# BÖLÜM 2: İleri Seviye Prompt Teknikleri (Few-Shot & Chain-of-Thought)

**Tahmini Okuma ve Anlatım Süresi:** 8 Dakika (~1.135 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Öğreniciyi temel seviyeden profesyonel seviyeye taşımak; yapay zekâya örnek vererek öğretme sanatı olan Few-Shot yöntemini pratikleştirmek; yapay zekânın acele edip saçmalamasını engelleyen "Chain-of-Thought" (Düşünce Zinciri) metodolojisini matematiğe ve iş mantığına uygulamak; birden fazla uzmanı aynı masada konuşturan Uzman Paneli Simülasyonu ile stratejik kararlar almayı öğretmek.

---

### 1. HOŞ GELDİN! ARTIK ÇIRAĞI USTA YAPIYORUZ

Harika gidiyorsun! 

İlk bölümde temel zihniyeti oturttuk ve yapay zekânın masandaki akıllı ama rehberliğe muhtaç bir asistan olduğunu kabul ettik. 

Şimdi bir adım daha ileri gidiyoruz. Bazen iş hayatında öyle durumlarla karşılaşırsın ki, sadece rol vermek veya kısıt koymak yetmez. 

Örneğin şirketin kendine has bir raporlama dili vardır. Ya da gelen müşteri mesajlarını belirli kategorilere ayırman gerekir: *"Bu şikayet kargoyla mı ilgili, ürün kalitesiyle mi ilgili, yoksa iade talebi mi?"* 

Ya da elinde karmaşık bir kâr-zarar hesabı vardır ve yapay zekâ ilk denemede basit bir toplama hatası yapıp seni rezil edebilir.

İşte bu bölümde, yapay zekâ araştırmacılarının dünyada en çok kullandığı ve modellerin başarı oranını yüzde ellilerden yüzde doksan beşlere çıkaran iki devasa tekniği öğreneceğiz: **Few-Shot Örnekleme** ve **Chain-of-Thought (Düşünce Zinciri)** mantığı.

---

### 2. ZERO-SHOT, ONE-SHOT VE FEW-SHOT ÖRNEKLEME NEDİR?

Gözünü korkutmasın bu İngilizce terimler. Mantığı çocuk oyuncağı kadar basittir!

* **Zero-Shot (Sıfır Örnekli İstem):** Modele hiçbir örnek vermeden doğrudan soruyu sormaktır.  
  Örnek: *"Bu müşteri yorumunun duygusunu analiz et: 'Ürün güzel ama kargo 8 günde geldi'."*  
  Model kendi genel kültürüne dayanarak *"Karışık / Nötr"* diyebilir. Basit işlerde iyi çalışır ama karmaşık işlerde formatı tutturamaz.
* **One-Shot (Tek Örnekli İstem):** Modele ne istediğini tam olarak göstermek için tek bir tamamlanmış örnek vermektir.  
  Modele dersin ki: *"Bak arkadaşım, ben senden şöyle bir girdi aldığımda tam olarak şöyle bir çıktı istiyorum."*
* **Few-Shot (Birkaç Örnekli İstem):** Modele 2, 3 veya 4 tane tamamlanmış örnek sunmaktır. 

Neden birkaç örnek veririz biliyor musun? Çünkü yapay zekâ kalıpları taklit etme konusunda bir dünya şampiyonudur! 

Sen ona 3 tane örnek verdiğinde; kelime uzunluğunu, noktalama işaretlerini, ciddiyet seviyesini ve yanıt şablonunu milimetrik olarak kopyalar.

Gel canlı bir vaka üzerinden görelim:  
Bir e-ticaret siten var ve her gün gelen yüzlerce WhatsApp mesajını operasyon ekibine dağıtmak istiyorsun.

Modele şu Few-Shot promptunu veriyorsun:

*"Sen bir e-ticaret operasyon sınıflandırma uzmanısın. Sana verilen müşteri mesajını analiz edecek ve aşağıdaki örneklerdeki gibi tek satırlık bir çıktı üreteceksin.*

*Örnek 1:*  
*Müşteri Mesajı: 'Ayakkabının 42 numarası ne zaman stoğa girecek?'*  
*Kategori: Stok Sorgusu | Aciliyet: Düşük | Yönlendirme Departmanı: Satış*

*Örnek 2:*  
*Müşteri Mesajı: 'Siparişim dün gelecekti gelmedi, kurye telefonunu açmıyor!'*  
*Kategori: Kargo Gecikmesi | Aciliyet: Yüksek | Yönlendirme Departmanı: Lojistik*

*Örnek 3:*  
*Müşteri Mesajı: 'Kutuyu açtım içinden kırık vazo çıktı, paramı geri verin.'*  
*Kategori: Hasarlı Ürün / İade | Aciliyet: Kritik | Yönlendirme Departmanı: Müşteri Deneyimi*

*Şimdi aşağıdaki yeni mesajı sadece yukarıdaki kalıbı kullanarak sınıflandır:*  
*Müşteri Mesajı: 'Siparişimdeki gömleğin rengi fotoğraftakinden farklı geldi, değişim yapabilir miyim?'"*

Model bu promptu gördüğünde asla gereksiz bir laf kalabalığı yapmaz. Doğrudan şunu yazar:  
*"Kategori: Değişim Talebi | Aciliyet: Orta | Yönlendirme Departmanı: İade ve Değişim Ekibi"*

Görüyor musun gücü? Sıfır kodlamayla, saniyeler içinde şirketine özel bir yapay zekâ sınıflandırma motoru inşa ettin!

---

### 3. "ADIM ADIM DÜŞÜN" (CHAIN-OF-THOUGHT) MUCİZESİ

Şimdi sana yapay zekâ dünyasının en büyük sırlarından birini vereceğim. 

Yapay zekâ modelleri neden mantık ve matematik sorularında çuvallar biliyor musun? 

Çünkü insan gibi derin derin düşünüp soluklanmazlar! Bir cümlenin sonunu getirmek için kelimeleri peş peşe dizmeye hemen başlarlar. Önceden plan yapmadıkları için de cümlenin ortasında mantık hatasına düşerler.

2022 yılında Google'daki yapay zekâ araştırmacıları tarihi bir makale yayınladılar. Modele verilen komutun sonuna sadece şu sihirli ifadeyi eklediklerinde, modellerin matematiksel ve mantıksal problem çözme başarılarının iki katına çıktığını kanıtladılar:

**"Cevabı vermeden önce adım adım düşün."** (Think step by step).

Peki neden bu kadar etkilidir? 

Çünkü modele *"Adım adım düşün"* dediğinde; model hemen nihai sonuca atlamaz. Önce birinci adımı yazar, birinci adımın çıktısını okur, ikinci adımı hesaplar, üçüncü adımı tartar ve en sonunda doğru sonuca ulaşır. Yani model kendine bir **düşünce izi (scratchpad)** yaratmış olur.

Gel somut bir iş vakasında bunu deneyelim:

Senaryomuz şu olsun:  
*"Depomuzda 120 adet akıllı saat var. Tanesini 500 TL'den aldık. İlk hafta saatlerin üçte birini yüzde kırk kârla sattık. İkinci hafta kalan saatlerin yarısını yüzde yirmi kârla sattık. Kalan saatleri ise maliyetine elden çıkardık. Toplam kârımız kaç TL'dir?"*

Eğer bu soruyu doğrudan sorarsan, pek çok model aceleyle kafadan yanlış bir rakam atabilir.

Ama sorunun başına şu talimatı eklersen:  
*"Sen kıdemli bir mali müşavirsin. Bu kâr analizini yaparken doğrudan sonuca atlama. Her adımı tane tane, hesaplama aşamalarını tek tek göstererek yaz ve nihai toplam kârı en sonda belirt."*

Model harika bir disiplinle çalışır:  
* Adım 1: Toplam 120 saat, tanesi 500 TL'den toplam alış maliyeti 60.000 TL.  
* Adım 2: İlk hafta satılan miktar 120'nin üçte biri, yani 40 saat. Satış fiyatı 500 TL artı yüzde kırk kâr, yani 700 TL. Elde edilen gelir 28.000 TL. Bu satıştan kâr 8.000 TL.  
* Adım 3: Kalan saat sayısı 80. İkinci hafta satılan miktar 80'in yarısı, yani 40 saat. Satış fiyatı 500 TL artı yüzde yirmi kâr, yani 600 TL. Gelir 24.000 TL. Bu satıştan kâr 4.000 TL.  
* Adım 4: Kalan son 40 saat maliyetine, yani 500 TL'den satıldı. Kâr 0 TL.  
* Sonuç: Toplam kâr 8.000 TL artı 4.000 TL eşittir 12.000 TL.

Gördüğün gibi sıfır hata! Model adımları yazarken kendi yazdığı ara basamakları hafızasına aldı ve doğru sonuca ulaştı.

İş hayatında sözleşme analizi yaparken, maliyet hesaplarken veya strateji kurarken modelden her zaman **"Adım adım gerekçelendirerek ilerlemesini"** talep et.

---

### 4. PERSONA PROMPTING VE UZMAN PANELİ SİMÜLASYONU

Şimdi sana karar verirken ufkunu açacak muazzam bir yönetim tekniği öğreteceğim: **Uzman Paneli Simülasyonu.**

Büyük kararlar alırken tek bir kişinin fikri yetmez, değil mi? Şirketlerde yönetim kurulları veya danışma konseyleri toplanır. Finansçı maliyeti düşünür, pazarlamacı müşteri çekmeyi hedefler, hukukçu riskleri uyarır.

Peki senin masanda böyle bir kurul yoksa ne yapacaksın? Yapay zekâya sanal bir danışma kurulu kurduracaksın!

Şu promptun zarafetine ve derinliğine bak:

*"Ben yeni bir abonelik tabanlı e-ticaret işi kurmak üzere olan bir girişimciyim. Sana birazdan iş fikrimi anlatacağım.*  
*Senden ricam, tek bir kişi gibi konuşmak yerine masada oturan üç farklı uzmanın yer aldığı sanal bir yönetim paneli simüle etmendir:*  
*1. Uzman: Finans Direktörü (CFO) — Nakit akışına, kârlılığa, batık maliyetlere ve finansal risklere odaklanır. Şüphecidir.*  
*2. Uzman: Büyüme ve Pazarlama Direktörü (CMO) — Müşteri edinme maliyetine (CAC), viral etkiye ve marka konumlandırmasına odaklanır. Heveslidir.*  
*3. Uzman: Operasyon ve Lojistik Direktörü (COO) — Tedarik zinciri aksamalarına, iade oranlarına ve ölçeklenme zorluklarına odaklanır. Gerçekçidir.*  

*Her uzman benim fikrimi kendi uzmanlık gözlüğüyle sırayla eleştirsin, birbirlerinin tezlerine cevap versin ve en sonda bir moderatör olarak bana 'Başlamadan önce çözmen gereken 3 kritik risk' başlığıyla ortak bir karar sun."*

Bu promptu çalıştırdığında karşına çıkan tartışma, sana 50 bin liralık yönetim danışmanlığı seanslarının sağlayamayacağı berraklıkta bir vizyon kazandırır. Kör noktalarını görürsün, finansal tuzakları önceden fark edersin ve işini sağlam temellere oturtursun.

İşte ileri seviye prompt mühendisliği budur: **Yapay zekâyı tek bir cevap kutusu değil, çok sesli bir düşünce laboratuvarı haline getirmek.**

---

> **🎯 2 Dakikalık Saha Görevi:** Hemen şimdi iki mikro deney yap: (1) İşindeki gerçek bir hesabı (bir bütçe, kargo maliyeti veya indirim hesabı) modele ver ve başına *"adım adım düşün, her basamağı göster"* kuralını ekle. (2) Son gelen 3 müşteri mesajını, dersteki 2 örnekli Few-Shot kalıbını kopyalayarak sınıflandır. **Chain-of-Thought'un ilk denemede hatayı nasıl kestiğini kendi ekranında görmeden 3. bölüme geçme.**

---

Bölüm 3'te bu zihinsel kaslarımızı doğrudan ofisin kalbine, resmi yazışmalara, e-postalara ve ikna edici metin üretimine sokacağız!

---

# BÖLÜM 3: İş Hayatında ve Metin Üretiminde Prompt Mühendisliği

**Tahmini Okuma ve Anlatım Süresi:** 7 Dakika (~950 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Profesyonel hayatta en çok vakit alan metin yazımı ve doküman inceleme süreçlerini otomatize etmek; ikna edici e-postalar ve resmi teklif mektupları için kusursuz istem şablonları geliştirmek; kurumsal tonlama ve marka sesini (Tone & Voice) yapay zekâya birebir klonlatmak; yüzlerce sayfalık sıkıcı raporları ve toplantı notlarını karar vericilerin önüne nokta atışı özetler halinde koymayı öğretmek.

---

### 1. OFİSTE YAZAR TIKANMASINA SON!

Tekrar merhaba! 

Gününün kaç saatini ekran karşısında imlecin yanıp sönmesini izleyerek geçiriyorsun?

Önemli bir kurumsal müşteriye geciken faturayı hatırlatacaksın. Ama öyle bir dil kullanmalısın ki; hem paranı tahsil etmelisin hem de adamları küstürüp başka şirkete kaçırmamalısın. Yazıyorsun, siliyorsun, tekrar yazıyorsun... 

Veya genel müdüre sunulacak 40 sayfalık bir denetim raporu masana bırakılıyor: *"Bunu akşama kadar oku, kritik noktaları özetle."* O an insanın içinden gelen o derin iç çekişi çok iyi bilirim.

İşte bu bölümde yapay zekâyı elinin altındaki en keskin, en diplomatik ve en üretken kalem haline getireceğiz. Kelimelerle boğuşmayı bırakacaksın; stratejiyi sen belirleyeceksin, metni yapay zekâ ilmek ilmek dokuyacak.

---

### 2. İKNA EDİCİ E-POSTALAR VE TEKLİF MEKTUPLARI İSTEM MİMARİSİ

E-posta yazarken amatörler ne yapar? *"Bana geciken ödeme için kibar bir mail yaz"* der. Model de içinde yirmi tane *"saygılarımızla"*, *"müteşekkiriz"* geçen tuhaf bir metin üretir.

Profesyonel bir e-posta isteminde üç altın unsur bulunmalıdır: **Amaç**, **İlişkinin Doğası** ve **İstenen Eylem (Call to Action)**.

Gel seninle iş hayatında en çok ihtiyaç duyulan üç kritik senaryo için hazır şablonlar üretelim:

* **Senaryo 1: Geciken Ödemeyi Tahsil Eden Diplomatik E-Posta İstem Şablonu:**  
  *"Sen 15 yıllık B2B kurumsal ilişkiler ve finans direktörüsün.*  
  *Görevin: Vadesi 21 gün geçmiş olan 85.000 TL'lik yazılım bakım faturamız için müşteri şirket genel müdür yardımcısına nazik ama son derece kararlı bir hatırlatma e-postası yazmak.*  
  *Bağlam: Müşteriyle 3 yıldır çok iyi bir ticari ortaklığımız var, ilişkileri zedelemek istemiyoruz. Ancak muhasebe departmanımız nakit akışı nedeniyle artık yeni destek taleplerini dondurma aşamasına geldi.*  
  *Kısıtlar: Tehditkar veya suçlayıcı bir ton kullanma. Ancak durumun ciddiyetini ve bu cuma mesai bitimine kadar ödeme yapılmazsa otomatik sistem desteğinin durdurulacağını net bir dille belirt.*  
  *Çıktı Formatı: Çarpıcı ama kurumsal bir e-posta konu başlığı, 3 kısa paragraftan oluşan gövde metni ve muhasebe IBAN bilgilerinin yerleştirileceği temiz bir kapanış alanı hazırla."*

Bu e-postayı alan bir yöneticinin sana kızması mümkün değildir; ama ciddiyeti anlar ve ödemeyi anında ilk sıraya alır!

* **Senaryo 2: Soğuk Satış (Cold Email) ile Randevu Koparma Şablonu:**  
  *"Sen B2B satışında uzmanlaşmış bir büyüme danışmanısın.*  
  *Görevin: Lojistik sektöründeki bir şirketin operasyon direktörüne, manuel rota planlama maliyetlerini yüzde otuz düşüren yapay zekâ yazılımımız için 10 dakikalık bir çevrimiçi demo görüşmesi randevusu talep eden bir soğuk e-posta yazmak.*  
  *Kısıtlar: Klasik 'Umarım bu e-posta sizi iyi bulur' gibi bayat girişleri asla kullanma. Doğrudan sektörün yakıt ve zaman israfı acısına değin. Metin toplam 120 kelimeyi geçmesin. Satış yapmaya çalışma, sadece 10 dakikalık kahve molasında ekran paylaşımı teklif et."*

---

### 3. TON VE ÜSLUP AYARLAMA (TONE & VOICE CUSTOMIZATION)

Yapay zekânın en harika yeteneklerinden biri, istediğin her türlü ses rengine bürünebilmesidir. 

Aynı haberi, aynı bilgiyi beş farklı insana beş farklı üslupla anlattırabilirsin. 

İş hayatında en sık kullandığımız 4 temel üslup ekseni şunlardır:
* **1. Resmi ve Kurumsal (Formal Corporate):** Ciddiyet, mesafe ve profesyonel saygı gerektiren durumlar (Denetim raporları, resmi ihtarname, yönetim kurulu sunumları).
* **2. Sıcak ve Empatik (Warm & Empathetic):** Müşteri şikayetleri, insan kaynakları görüşmeleri, teşekkür ve tebrik mesajları.
* **3. İkna Edici ve Eylem Odaklı (Persuasive):** Satış sayfaları, teklif mektupları, yatırımcı sunumları (Pitch deck).
* **4. Yalın ve Eğitici (Plain & Educational):** Karmaşık teknik konuları yeni başlayan stajyerlere veya müşterilere basitçe anlatan rehberler.

**Kendi Üslubunu Klonlatma Tekniği:**  
Peki yapay zekânın senin gibi yazmasını nasıl sağlarsın? Çok basit! 

Şu promptu kullanacaksın:  
*"Aşağıda benim geçmişte farklı müşterilere bizzat yazdığım 3 adet e-posta örneği yer alıyor.*  
*Bu metinleri analiz et: Cümle uzunluklarımı, hitap şekillerimi, bağlaç kullanımlarımı ve samimiyet dozajımı çıkararak benim 'Yazı Üslubu Profilimi' oluştur.*  
*Daha sonra sana vereceğim yeni konuyu, sanki doğrudan benim klavyemden çıkmış gibi bu profille yaz."*

Bunu bir kez yaptığında, artık yapay zekâ senin şirket içindeki sanatsal ikizin haline gelir. Kimse o e-postayı senin mi yoksa yapay zekânın mı yazdığını ayırt edemez!

---

### 4. METİN DÖNÜŞTÜRME, SADELEŞTİRME VE UZUN DOKÜMAN ANALİZİ

Ofisteki en büyük kabuslardan biri de önümüze atılan onlarca sayfalık bürokratik metinlerdir.

İşte burada **"Çerçeveli Özetleme"** promptları devreye girer.

Modele sadece *"Bunu özetle"* dersen; metnin içindeki ilk üç paragrafı kısaltıp verir ve en önemli detayları kaçırır.

Bunun yerine şu profesyonel şablonu kullanacaksın:

*"Sen bir genel müdür danışmanısın. Aşağıda sana 25 sayfalık bir tedarikçi sözleşmesi metni veriyorum.*  
*Bu metni oku ve şirket yönetim kurulumuz için şu 4 başlık altında bir 'Karar Özeti' hazırla:*  
*1. Finansal Yükümlülüklerimiz ve Gizli Maliyetler (Ceza maddeleri, kur farkı riskleri).*  
*2. Teslimat Süreleri ve Gecikme Yaptırımları.*  
*3. Sözleşmeden Tek Taraflı Çıkış Haklarımız.*  
*4. Hukukçularımızın Kırmızı Çizgi Olarak İtiraz Etmesi Gereken 3 Kritik Madde.*  
*Kural: Yorum yapma, sadece metinde açıkça yazan maddeleri referans göstererek madde imleriyle yaz."*

Bu komut sayesinde 3 saatlik sıkıcı okuma süreci, 45 saniyelik stratejik bir zaferle sonuçlanır!

Ama burada sana iki altın kural vermeden geçemem:

* **Altın Kural 1 — Veri Güvenliği (KVKK):** Sözleşme, müşteri listesi veya finans tablosu gibi hassas bir belgeyi modele verirken kişisel verileri ve ticari sırları asla ham haliyle yapıştırma! Gerçek isimleri, TC numaralarını, IBAN'ları ve gizli rakamları `[MÜŞTERİ_ADI]`, `[TUTAR]` gibi maskelerle değiştir; analizi her zaman anonimleştirilmiş kopya üzerinden yaptır.
* **Altın Kural 2 — Son Sorumluluk İnsandadır:** Yapay zekânın ürettiği hiçbir resmi metni, teklifi veya özeti denetlemeden imzalayıp gönderme! Tarihleri, rakamları ve hukuki iddiaları mutlaka kendi gözünle doğrula. Unutma: Metni model yazar ama imzayı sen atarsın; sorumluluk da, itibar da senindir.

Toplantı notlarında da aynı yöntemi uygularsın:  
Toplantı bittiğinde tuttuğun dağınık notları kopyala ve de ki:  
*"Bu ham notları analiz et; kimin hangi görevi ne zamana kadar teslim edeceğini gösteren bir 'Sorumluluk ve Aksiyon Listesi' çıkar."*

Günün sonunda işini bitirip eve zamanında gitmenin sırrı işte bu pratiklikte saklıdır!

---

> **🎯 2 Dakikalık Saha Görevi:** Bu hafta atman gereken en zor e-postayı (bir tahsilat hatırlatması, nazik bir ret veya fiyat teklifi) dersteki üç altın unsurla — Amaç, İlişkinin Doğası ve İstenen Eylem — yapay zekâya yazdır. Göndermeden önce tarih, rakam ve isimleri kendi gözünle denetle. **Kutudan çıkan ilk taslağı denetlemeden göndermek bu derste yasak; insan denetimi refleksini kazanmadan 4. bölüme geçme.**

---

Bölüm 4'te ise metinlerin ötesine geçip verilerin, krizlerin ve stratejik problemlerin kalbine ineceğiz. Hazırsan devam edelim!

---

# BÖLÜM 4: Veri Analizi, Problem Çözme ve Karar Destek Promptları

**Tahmini Okuma ve Anlatım Süresi:** 6 Dakika (~825 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Yapay zekâyı metin yazma aracından çıkarıp üst düzey bir analitik düşünce ve karar destek sistemine dönüştürmek; dağınık pazar ve müşteri verilerinden stratejik SWOT analizleri türetmek; kriz durumlarında senaryo analizleri ve stres testleri (Pre-Mortem) kurgulamak; "Critique & Refine" döngüsüyle kendi kararlarımızın ve metinlerimizin kör noktalarını denetletmek.

---

### 1. BİLİŞSEL BİR STRATEJİ ORTAĞIYLA TANIŞIN

Tekrar hoş geldin!

Bugüne kadar yapay zekâya belki hep kelimeler yazdırdın. Şiir yazdırdın, mail taslağı çıkardın, ödev yaptırdın. 

Ama yapay zekânın asıl devrim yaratan gücü nerede biliyor musun? **Karmaşık sistemler arasında örüntüleri yakalamakta ve kriz anlarında zihnin göremediği kör noktaları aydınlatmakta!**

Bir şirketin batmasıyla zirveye çıkması arasındaki fark, yöneticilerin kritik anlarda doğru soruları sorup soramadığıyla belirlenir. 

Eğer tek başına bir işletme yönetiyorsan, serbest çalışıyorsan veya bir departmanın başındaysan; çoğu zaman yalnızsındır. Fikirlerini tartışacak, seni acımasızca eleştirecek ve *"Peki ya işler ters giderse ne yapacağız?"* diyecek tecrübeli bir akıl hocasına ihtiyaç duyarsın.

İşte bu bölümde yapay zekâyı senin masandaki en kıdemli, en tarafsız ve en zeki strateji ortağın haline getireceğiz.

---

### 2. DAĞINIK VERİLERDEN STRATEJİK SWOT ANALİZİ TÜRETMEK

Çoğu insan SWOT analizini içi boş, basmakalıp maddelerden ibaret zanneder: *"Güçlü yönümüz: Kaliteli ürün. Zayıf yönümüz: Az bütçe."* Bu tür analizler hiçbir karara ışık tutmaz.

Gerçek bir SWOT analizi, ham verilerin derinlemesine taranmasıyla ortaya çıkar.

Diyelim ki elinde son 6 ayda web sitene gelen 200 adet olumsuz müşteri yorumu, 3 rakibin fiyat politikası ve sektörün genel büyüme verileri var. Bunlar darmadağınık notlar halinde duruyor.

Modele şu promptu veriyorsun:

*"Sen Fortune 500 şirketlerine hizmet veren kıdemli bir kurumsal strateji danışmanısın.*  
*Görevin: Sana aşağıda ham metin olarak sunduğum 200 müşteri şikayetini ve pazar verisini analiz ederek derinlemesine bir SWOT analizi üretmek.*  
*Yöntem:*  
*1. Müşteri şikayetlerinde en az 10 kez tekrarlanan kronik problemleri 'Zayıf Yönlerimiz' olarak grupla.*  
*2. Rakiplerin henüz sunmadığı ama müşterilerin ısrarla talep ettiği eksiklikleri 'Fırsatlar' olarak belirle.*  
*3. Tedarik zincirindeki aksamaları ve artan maliyet baskılarını 'Tehditler' başlığı altına al.*  
*Kural: Genel geçer ve soyut ifadeler kullanma. Her tespitin yanına müşteri verisinden somut bir kanıt ekle.*  
*Çıktı Formatı: Her çeyrek için en kritik 3 maddeyi listele ve analizin sonunda 'Yönetimin Pazartesi Sabahı Atması Gereken İlk 3 Somut Adım' başlığıyla bir eylem planı sun."*

Bu analizi önüne aldığında, müşterilerin gerçekte neden kaçtığını ve rakiplerin hangi açığından içeri sızabileceğini bir cerrah hassasiyetiyle görmüş olursun.

---

### 3. KRİZ YÖNETİMİ VE SENARYO ANALİZLERİ (STRESS TESTING)

İş hayatında en büyük yanılgı, her şeyin her zaman bugünkü gibi yolunda gideceğini varsaymaktır. 

Peki ya yarın sabah pazar yüzde yirmi daralırsa? Ya ana tedarikçin aniden iflas ederse? Ya döviz kuru bir gecede fırlarsa?

İşte bu durumlara hazırlıksız yakalanmamak için yapay zekâ ile **Senaryo Analizi (Scenario Planning)** ve **Pre-Mortem (Ölüm Öncesi İnceleme)** yaparız.

**Pre-Mortem Tekniği Nedir?**  
Bir proje başlamadan önce ekiple toplanıp şu hayal kurulur:  
*"Arkadaşlar, şu an tarihlerden 1 yıl sonrası. Başlattığımız bu proje feci şekilde çöktü, battık ve şirket kapatıldı. Şimdi herkes düşünsün: Bizi tam olarak ne batırdı?"*

Bu egzersiz, insanların aşırı iyimserlik yanılgısını (optimism bias) yıkar.

Hadi bunu yapay zekâya yaptıralım:

*"Sen bir risk yönetim uzmanı ve acımasız bir kriz denetçisisin.*  
*Biz önümüzdeki ay Türkiye genelinde organik soğuk sıkım zeytinyağı satan yeni bir e-ticaret markası lansmanı yapıyoruz.*  
*Şimdi zihninde 12 ay sonrasına git. Bu proje tamamen başarısız oldu, paramız bitti ve operasyonu durdurmak zorunda kaldık.*  
*Bize bu projenin batmasına yol açan en olası 5 ölümcül kör noktayı yaz:*  
*Lojistikte neyi yanlış hesaplamış olabiliriz?*  
*Müşteri edinme maliyetinde (CAC) hangi gizli tuzağa düştük?*  
*Ambalaj ve şişeleme süreçlerinde hangi operasyonel hata bizi bitirdi?*  
*Ve her felaket senaryosunun karşısına, bugünden alabileceğimiz tek cümlelik bir 'Emniyet Tedbiri' yaz."*

İşte bu prompt, bir girişimcinin hayatını kurtarabilir! 

Yapay zekâ sana cam şişelerin kargoda kırılma maliyetlerini, zeytinyağının sıcak yaz aylarında asidite bozulması riskini veya reklam maliyetlerinin kâr marjını nasıl yutacağını tek tek hatırlatır. Sen daha sahaya çıkmadan zırhını kuşanmış olursun.

---

### 4. HATA ARAMA VE MANTIK DENETİMİ (CRITIQUE & REFINE DÖNGÜSÜ)

Kendi yazdığın bir metne veya hazırladığın bir stratejiye aşık olmak çok kolaydır. İnsan kendi hatasını göremez.

Bu yüzden her zaman bir **"Şeytanın Avukatı" (Devil's Advocate)** promptu kullanırız.

Diyelim ki bir yatırımcı sunumu veya yönetim kuruluna teklif hazırladın. Metni yapay zekâya kopyala ve ona şu emri ver:

*"Sen bizim şirketimizin en büyük rakibinin acımasız ve son derece zeki genel müdürüsün.*  
*Aşağıda bizim yeni büyüme stratejisi metnimiz yer alıyor.*  
*Bu metni oku ve bir rakip gözüyle bu stratejideki en zayıf, temelsiz ve abartılı iddiaları yüzüme vur.*  
*Bize acıma! Nerede mantık hatası var? Hangi rakam inandırıcı değil? Hangi varsayım havada kalmış?*  
*Eleştirilerini sıraladıktan sonra, bu metni kurşun geçirmez hale getirmek için yapmamız gereken 3 büyük düzeltmeyi öner."*

Bunu yaptığında karşına çıkacak eleştiriler ilk başta canını yakabilir; ama o eleştirileri masada yapay zekâdan duymak, yarın gerçek bir yatırımcının veya müşterinin karşısında ter dökmekten bin kat daha iyidir!

Eleştiriyi alırsın, zayıf tarafları güçlendirirsin ve pazara yenilmez bir teklifle çıkarsın.

İşte analitik prompt mühendisliği budur: **Yapay zekâyı senin egonu okşayan bir dalkavuk değil, seni geliştiren tarafsız bir akıl terazisi yapmak.**

---

> **🎯 2 Dakikalık Saha Görevi:** Şu an üzerinde çalıştığın gerçek bir projeyi, iş fikrini veya teklifi al ve dersteki Pre-Mortem promptuna yapıştır: *"12 ay sonrasına git, bu iş battı; en olası 5 ölümcül kör noktayı ve her birine karşılık bugünden alınacak tek cümlelik emniyet tedbirini yaz."* Çıkan listedeki ilk tedbiri hemen takvimine işle. **Kendi projende tek bir kör noktayı bile görmeden 5. bölüme geçme.**

---

Bölüm 5'te ise sözcüklerin ötesine, görsel ve multimodal dünyaya geçiş yapıyoruz!

---

# BÖLÜM 5: Görsel ve Multimodal Yapay Zekâ için Prompt Mühendisliği

**Tahmini Okuma ve Anlatım Süresi:** 6,5 Dakika (~880 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Yapay zekâ kullanımını sadece metin kutusu olmaktan çıkarıp çok modlu (Multimodal) evrene taşımak; Midjourney ve DALL-E 3 gibi görsel üretim araçlarında ışık, açı, lens ve stil parametreleriyle fotoğraf stüdyosu kalitesinde çıktılar almayı öğretmek; Vision (Görsel Algılama) yetenekleriyle bir fotoğraftan, grafikten veya el çiziminden anında stratejik içgörü türetmek; ses ve video modelleri için doğru komut yapılarını kavramak.

---

### 1. KELİMELERDEN GÖRSELLERE, GÖRSELLERDEN KARARLARA

Hoş geldin! 

Bugüne kadar yapay zekâ ile hep yazıştık. Ama insan beyni sadece yazıyla düşünmez; görüntülerle, seslerle ve mekânlarla düşünür.

Teknolojide son dönemin en büyük devrimi **Multimodal (Çok Modlu)** yapay zekâ sistemleridir. Artık modeller sadece metin okuyup yazmıyor. Bir resmi görüp anlayabiliyor, bir fotoğraftaki bozukluğu teşhis edebiliyor, ses tonunu hissedebiliyor ve senin yazdığın birkaç satır tariften sinematik bir film sahnesi veya stüdyo fotoğrafı yaratabiliyor.

Peki görsel üretirken neden çoğu insanın aldığı çıktılar yapay, plastik ve tuhaf görünür? 

Çünkü görsel modellere de tıpkı metin modellerinde olduğu gibi muğlak komutlar veriyorlar: *"Bana bir kahve bardağı resmi çiz."* Sonuç ne? Renkleri birbirine girmiş, gerçeklikten uzak yapay bir çizim!

Bu bölümde hem kelimelerle stüdyo kalitesinde görseller üretmeyi, hem de yüklediğin bir fotoğraftan saniyeler içinde iş zekâsı çıkarmayı öğreneceğiz.

---

### 2. METİNDEN GÖRSELE (TEXT-TO-IMAGE) PROMPT KURALLARI: MİDJOURNEY & DALL-E 3

Görsel yapay zekâ modellerine komut yazarken aklında tutman gereken altın kural şudur: **Sen bir bilgisayara değil, bir film yönetmenine ve set fotoğrafçısına talimat veriyorsun.**

Başarılı bir görsel promptu 5 temel katmandan oluşur:

* **1. Ana Konu (Subject):** Karede tam olarak ne var? Yaş, cinsiyet, kıyafet, duruş veya ürünün kendisi. *"30'lu yaşlarında, keten gömlek giymiş, hafif gülümseyen bir kadın girişimci."*
* **2. Çevre ve Mekân (Environment / Setting):** Sahne nerede geçiyor? *"Arka planda modern, ahşap detaylara sahip, loş ve bol yeşil bitkili bir İskandinav ofisi."*
* **3. Işıklandırma (Lighting):** Görselin ruhunu ışık belirler! Plastik görünümü engelleyen en büyük sihir ışıktır. *"Yumuşak sabah güneşi, pencereden süzülen doğal altın saat ışığı (golden hour lighting), hafif gölgeler."* Asla sert stüdyo flaşı isteme.
* **4. Kamera Açısı ve Lens Detayı (Camera & Lens):** Görsele profesyonellik katan yer burasıdır. *"85mm portre lensi, f/1.8 diyafram açıklığı, arka planı hafif bulanıklaştıran derinlik etkisi (cinematic depth of field, bokeh)."*
* **5. Sanat Tarzı ve Doku (Style & Texture):** *"Gerçekçi editoryal dergi fotoğrafı, doğal cilt dokusu, gözenekler görünür, sıfır plastik parlama, analog film hissi."*

Gel bunu somut bir e-ticaret örneğine dökelim:  
Diyelim ki lüks bir el yapımı deri cüzdan satıyorsun ve web siten için bir vitrin fotoğrafına ihtiyacın var.

Promptumuz şöyle olmalı:

*"Editoryal ürün fotoğrafı: Rustik masif meşe ağacından bir çalışma masası üzerinde duran taba rengi, el dikimi vintage deri erkek cüzdanı.*  
*Yanında antika bir pirinç dolma kalem ve yarı dolu bir espresso fincanı.*  
*Işık: Sol taraftaki pencereden gelen yumuşak, doğal öğleden sonra ışığı.*  
*Çekim: 45 derece üst açıdan makro çekim, 50mm lens, f/2.8 diyafram ile arka plan hafif flulaştırılmış.*  
*Doku: Derinin doğal damarları ve dikiş ipliklerinin mikro detayları net görünür, hiper-gerçekçi, ticari katalog kalitesinde."*

Böyle bir promptu Midjourney'e veya DALL-E 3'e verdiğinde; stüdyoya, mankene veya pahalı ışık setlerine tek bir kuruş harcamadan binlerce liralık bir katalog çekimini masanda üretmiş olursun!

---

### 3. GÖRSELDEN METNE (VISION AI) İLE ANLIK İŞ ANALİZİ

Peki tersi nasıl çalışır? Yani bilgisayara bir resim yükleyip ondan akıl almak!

İşte burası iş hayatında sana günde onlarca saat kazandıracak gizli bir silahtır.

Gel gerçek hayattan 3 pratik kullanım senaryosuna bakalım:

* **Kullanım 1: El Çizimi Taslaktan Web Sitesi veya Menü Çıkarmak:**  
  Bir toplantıdasın, bir peçetenin veya not defterinin üzerine alelacele bir açılış sayfası (landing page) taslağı çizdin. Buton buraya gelsin, başlık şurada dursun dedin.  
  Telefonunla fotoğrafını çek, Claude veya ChatGPT'ye yükle ve de ki:  
  *"Bu el çizimi web sitesi taslağımı analiz et. Bölümleri sırasıyla listele, kullanıcı deneyimi (UX) açısından eksik gördüğün 2 noktayı belirt ve bu sayfanın metin yazarı için gerekli başlık ve buton kopyalarını hazırla."* Saniyeler içinde o karalama, profesyonel bir ürün dokümanına dönüşür!

* **Kullanım 2: Karmaşık Grafik ve Finansal Tablo Okuma:**  
  Yabancı dilde hazırlanmış, karmaşık renkli çubuklardan ve pasta grafiklerden oluşan bir pazar araştırma raporunun ekran görüntüsünü alıp yüklüyorsun:  
  *"Bu grafikteki verileri oku. 2023 ile 2026 yılları arasında pazar payını en çok artıran iki oyuncuyu bul ve aralarındaki büyüme farkını 3 maddede özetle."* Tek tek rakamları okumakla gözlerini bozmana gerek kalmaz.

* **Kullanım 3: Fiziksel Mağaza ve Raf Düzeni Denetimi:**  
  Bir perakende mağazan var. Mağaza personelinin düzenlediği rafın fotoğrafını sisteme yüklüyorsun:  
  *"Bu perakende raf fotoğrafını kurumsal görsel düzenleme kurallarımız açısından denetle: Fiyat etiketleri ürünlerle hizalı mı? Boşluk kalan veya öne çekilmesi gereken ürün var mı? Mağaza müdürüne iletilecek 3 maddelik düzeltme listesi çıkar."*

---

### 4. SES VE VİDEO YÖNLENDİRMELERİNDE DOĞRU PARAMETRELER

Multimodal devrim ses ve videoda da aynı hızla ilerliyor.

* **ElevenLabs ve Ses İstemleri:** Yapay zekâya seslendirme yaptırırken sadece metni yapıştırmak yetmez. Metnin içine koyacağın parantez içi yönlendirmelerle sesin duygusunu yönetebilirsin: `[fısıltıyla]`, `[heyecanlı ve hızlı]`, `[derin bir nefes alır ve duraklar]`. Bu sayede robotik bir okuma yerine, nefes alan canlı bir anlatıcı elde edersin.
* **Video Modelleri (Runway, Kling, Sora vb.):** Video komutlarında en kritik unsur kamera hareketidir. *"Bir araba gidiyor"* demek yerine; *"Kamera alçak açıdan yola paralel takip ediyor (low angle tracking shot), gün batımına doğru hızlanan kırmızı klasik araba, sinematik hareket bulanıklığı (motion blur)"* demelisin.

Gördüğün gibi yapay zekâ artık senin sadece metin editörün değil; gözün, kulağın ve tasarım stüdyon!

---

> **🎯 2 Dakikalık Saha Görevi:** İki denemeden birini seç ve hemen yap: (1) Elindeki bir ürünü veya hizmeti dersteki 5 katmanlı formülle (konu, çevre, ışık, lens, doku) Midjourney ya da DALL-E 3'e tarif et ve plastik görünümlü eski denemenle karşılaştır. (2) Telefonundaki karmaşık bir grafiğin veya el çizimi bir taslağın fotoğrafını Vision'a yükle ve 3 maddelik içgörü çıkart. **Işık ve lens parametresinin farkını kendi gözünle görmeden final bölümüne geçme.**

---

Şimdi Katman 1'in büyük finaline, yani Bölüm 6'ya geçiyoruz. Burada tüm bu bilgileri kalıcı bir entelektüel servete dönüştürecek kendi Prompt Kütüphaneni inşa edecek ve büyük mezuniyet kapanışımızı yapacağız!

---

# BÖLÜM 6: Kendi Prompt Kütüphaneni Oluşturmak ve Modül Kapanışı

**Tahmini Okuma ve Anlatım Süresi:** 7,5 Dakika (~1.050 Kelime)  
**Eğitmen:** Gözde  
**Pedagojik Amaç:** Öğrenilen tüm prompt tekniklerini dağınık birer bilgi olmaktan çıkarıp sürdürülebilir, kurumsal ve tekrar kullanılabilir bir "Prompt Kütüphanesi" sistemine dönüştürmek; dinamik parametre kullanımını (`[DEĞİŞKEN]`) kurumsallaştırmak; Katman 1 genelindeki 5 modülün devasa dönüşüm hikayesini özetlemek; öğrenciyi resmi yetkinlik sertifikasına ve Katman 2 profesyonel otomasyon ufkuna taşımak.

---

### 1. TEK SEFERLİK İSTEMLERDEN KALICI BİR ENTELEKTÜEL SERMAYEYE

Tebrik ederim! Gerçekten seninle gurur duyuyorum.

Bu noktaya kadar geldiysen, artık dünyadaki bilgisayar kullanıcılarının yüzde doksan dokuzunun fersah fersah ötesine geçtin. 

Artık yapay zekâya boş gözlerle bakan, *"Bana bir şeyler yaz"* deyip gelen saçma sapan sonuçlara kızan o kalabalığın bir parçası değilsin. 

Sen artık; sistemin zihnini okuyan, rolünü biçen, sınırlarını çizen, düşünce zincirleriyle mantığını kilitleyen ve hem yazıda hem görselde orkestrayı yöneten bir **İstem Mimarı**sın.

Peki şimdi kritik soru şu:  
Her sabah bilgisayarını açtığında bu muazzam promptları sıfırdan mı yazacaksın? Her seferinde tekerleği yeniden mi icat edeceksin?

Kesinlikle hayır! 

İşte bu final bölümünde, profesyonellerin en büyük gücü olan **Tekrar Kullanılabilir Prompt Kütüphanesi (Reusable Prompt Library)** mimarisini kuracağız ve ardından Katman 1'in o görkemli mezuniyet perdesini birlikte aralayacağız.

---

### 2. REUSABLE PROMPT LIBRARY (İSTEM KÜTÜPHANESİ) MİMARİSİ

Bir aşçı düşün. Her yemek yapışında tuzu nereden alacağını, soğanı nasıl doğrayacağını baştan düşünmez. Baharatlığı bellidir, bıçakları sıradadır, sos tarifleri defterinde kayıtlıdır.

Senin de yapay zekâ ile çalışırken masanda her an elini uzatabileceğin bir **Prompt Alet Çantan** olmalıdır.

Bu kütüphaneyi Notion'da, Obsidian'da, Google Docs'ta veya basit bir metin belgesinde tutabilirsin. Önemli olan nerede tuttuğun değil, nasıl organize ettiğindir.

Kusursuz bir Prompt Kütüphanesi 5 temel departman klasörüne ayrılır:

* **Klasör 1: İletişim ve E-Posta Şablonları:** Geciken ödeme hatırlatması, soğuk satış teklifi, iş reddetme mektubu, tebrik ve teşekkür mesajları.
* **Klasör 2: Metin ve İçerik Üretimi:** SEO blog yazarı, LinkedIn düşünce lideri gönderisi, bülten (newsletter) kurgusu, basın bülteni şablonu.
* **Klasör 3: Yönetim ve Strateji:** Uzman paneli simülasyonu, Pre-Mortem kriz testi, SWOT analizi, toplantı aksiyon maddesi çıkarıcı.
* **Klasör 4: Pazarlama ve Satış:** AIDA ve PAS formüllü reklam kancaları, ürün lansman e-postaları, müşteri itiraz göğüsleme rehberi.
* **Klasör 5: Multimodal ve Tasarım:** Midjourney editoryal ürün fotoğrafı formülü, Vision UX denetçisi, infografik metin çıkarıcı.

Bu klasörleme sayesinde masana bir iş geldiğinde; paniklemek veya dakikalarca düşünmek yerine kütüphaneni açar, ilgili şablonu kopyalar, değişkenleri doldurur ve 30 saniyede mükemmel sonuca ulaşırsın!

---

### 3. ŞABLON PARAMETRELENDİRME STANDARDI (`[DEĞİŞKEN]` MANTIĞI)

Bir promptu gerçekten "ölçeklenebilir" ve "ekip içinde paylaşılabilir" kılan şey, içindeki **dinamik parametrelerdir**.

Parametreleri her zaman köşeli parantez içinde büyük harflerle belirtiriz: `[ŞİRKET_ADI]`, `[HEDEF_KİTLE]`, `[ANA_ÜRÜN]`, `[FİYAT]`, `[ÖZEL_ŞARTLAR]`.

Gel kütüphanene eklemen için altın değerinde evrensel bir satış sayfası şablonunu birlikte parametrelendirelim:

*"Sen yüksek dönüşümlü satış metinleri yazma konusunda uzmanlaşmış kıdemli bir doğrudan pazarlama (Direct-Response Copywriter) yazarısın.*  
*Görevin: `[ŞİRKET_ADI]` markamızın yeni piyasaya süreceği `[ÜRÜN_VEYA_HİZMET]` için ikna edici bir satış sayfası metni hazırlamak.*  
*Bağlam:*  
*Hedef Kitlemiz: `[HEDEF_KİTLE_TANIMI]`*  
*Bu kitlenin en büyük acı noktası ve kabusu: `[MÜŞTERİNİN_EN_BÜYÜK_ACISI]`*  
*Ürünümüzün sağladığı nihai rahatlama ve fayda: `[ÜRÜNÜN_SUNACAĞI_ÇÖZÜM]`*  
*Fiyat ve Teklif Detayı: `[FİYAT_VE_KAMPANYA_ŞARTLARI]`*  
*Kısıtlar:*  
*Asla soyut ve içi boş övgü sıfatları kullanma. Metni PAS (Problem - Ajitasyon - Çözüm) formülüne göre kurgula. Toplam uzunluk 300 kelimeyi geçmesin.*  
*Çıktı Formatı: Çarpıcı bir ana başlık, dikkat çekici bir alt başlık, 3 maddelik acı ajitasyonu, ürünün çözümü ve sonunda `[EYLEM_ÇAĞRISI_BUTONU]` metni."*

Düşünsene: Bu tek bir şablonu alıp; diş kliniğine de uyarlayabilirsin, yazılım kursuna da, organik sabun satan butiğe de! Tek yapman gereken köşeli parantezlerin içini doldurmak.

İşte kurumsal verimlilik böyle inşa edilir: Bir kere inşa et, bin kere verim al!

---

### 4. KATMAN 1 GENEL ÖZETİ: NEREDEN NEREYE GELDİK?

Şimdi derin bir nefes al, arkana yaslan ve seninle çıktığımız bu devasa yolculuğun panoramasına bir bak.

Biz bu Katman 1 serisine başladığımızda, belki yapay zekâyı sadece arada sırada eğlenmek için açtığın bir sohbet kutusu sanıyordun. 

Ama bugün geldiğin noktaya bir bakar mısın?

* **Modül 1'de (Ofiste Yapay Zekâ):** Ofisteki rutin zaman hırsızlarını tespit ettik. Excel'de formül ezberleme çilesini tarihe gömdük. Darmadağınık tabloları saniyeler içinde temizledik, profesyonel yönetim raporları ve sunumlar hazırlayarak günlük 2 saatimizi cebimize koyduk.
* **Modül 2'de (E-Ticaret):** Pazaryerlerinde Trendyol, Hepsiburada ve Amazon algoritmalarını dize getirdik. SEO uyumlu vitrin listelemeleri yaptık, AIDA ve PAS formülleriyle ikna eden ürün açıklamaları yazdık, müşteri yorumlarını tarayarak iadeleri önledik ve Buybox kalkanımızı diktik.
* **Modül 3'te (Sosyal Medya ve İçerik Fabrikası):** İlham perisi beklemeyi bıraktık; Midjourney, ElevenLabs ve CapCut ile tek bir fikirden 30 günlük otonom video ve içerik üreten montaj hatları kurduk, ROAS canavarı reklam kreatifleri tasarladık.
* **Modül 4'te (No-Code Chatbot Kurulumu):** Voiceflow ve Botpress ile tek satır kod yazmadan 7/24 randevu alan, sipariş toplayan, verileri Make.com üzerinden CRM'e işleyen akıllı dijital çalışanlar inşa ettik ve bunu CaaS modeliyle bir gelir kapısına dönüştürdük.
* **Ve Modül 5'te (Bugün):** Bütün bu araçların arkasındaki anahtar gücü; yani bilişsel istem mühendisliğini, Few-Shot yönlendirmeyi, Chain-of-Thought mantığını ve kriz senaryosu analizlerini zihnimize bir refleks olarak kazıdık!

Farkında mısın? Sen artık sadece bir bilgisayar kullanıcısı değilsin. Sen; teknolojinin hızla dönüştürdüğü yeni iş dünyasında **ne yaptığını çok iyi bilen, aranan, üretken ve özgüvenli bir Yapay Zekâ Uygulayıcısı**sın.

---

> **🎯 2 Dakikalık Saha Görevi:** Mezuniyet sınavına girmeden önce son bir pratik: Kendi Prompt Kütüphanenin iskeletini bugün kur. Beş klasörü (İletişim, İçerik, Yönetim/Strateji, Pazarlama, Multimodal) aç ve bu derste en çok işine yarayan 3 şablonu `[DEĞİŞKEN]` parametreleriyle içine kaydet. **Kütüphanenin ilk 3 şablonu cebinde olmadan kendini Katman 1 mezunu sayma.**

---

---

### 5. BÜYÜK MEZUNİYET KAPANIŞI VE RESMİ SERTİFİKA YÖNLENDİRMESİ

Ben Gözde. 

Katman 1'in bu beş modüllük destansı yolculuğu boyunca seninle birlikte çalışmaktan, ekranımın karşısında senin günden güne güçlenişine şahit olmaktan tarifsiz bir gurur ve mutluluk duydum.

Sana son bir hayat tavsiyesi vermek istiyorum:  
Gelecekten korkma. *"Yapay zekâ işimizi elimizden alacak mı?"* diyen o kaygılı kalabalıktan olma. 

Çünkü yapay zekâ senin işini elinden almayacak; **yapay zekâyı ustalıkla kullanan bir profesyonel, onu kullanmayı reddedenlerin işini devralacak!** Ve sen artık masanın kazanan tarafındasın.

Şimdi senin için son ve en gurur verici adım başlıyor:

Hemen bu bölümün altındaki **Katman 1 Kapsamlı Değerlendirme Sınavı**na gir. Sınavda 30 soruluk havuzdan rastgele çekilen 10 soru seni bekliyor ve geçme barajı **70 puan**. Bu sınavda beş modül boyunca öğrendiğin tüm teknikleri, şablonları ve mantık adımlarını sergile. 

Cevapların sunucu tarafında puanlanır; yetmiş ve üzeri puan aldığın an sistem senin için kriptografik olarak imzalanmış, SHA-256 yetkinlik mührüne sahip **Resmi Katman 1 Başarı Sertifikanı** üretecek. Yani bu belge satın alınca değil, yalnızca kanıtlayınca indirilir! O sertifikayı gururla LinkedIn profiline ekle, özgeçmişine koy ve duvarına as; çünkü o belge, senin artık tam yetkin bir **Yapay Zekâ Uygulayıcısı** olduğunun resmi mührüdür.

Ve unutma, bu bir son değil; sadece sağlam bir başlangıç! 

Katman 2'de bizi çok daha heyecan verici bir dünya bekliyor: Kendi sunucumuzda çalışan n8n otomasyonları, LangGraph ile otonom kod yazıp araç çağıran yapay zekâ ajanları ve şirketlerin binlerce dokümanını konuşturan kurumsal RAG sistemleri...

O güne kadar elindeki bu gücü her gün kullan, cesur ol, hata yapmaktan korkma ve üretmeye devam et!

Yolun açık, zihnin berrak ve başarıların daim olsun. Kendine çok iyi bak, hoşça kal!
