import type { Section } from "../types";

export const section3: Section = {
      sectionNumber: 3,
      title: "Dağınık ve Bozuk Verileri Saniyeler İçinde Temizleme, Ayrıştırma ve Birleştirme",
      targetDurationMinutes: 15,
      estimatedWordCount: 2072,
      pedagogicalObjective: "Farklı kurumsal sistemlerden (ERP, CRM, muhasebe programları, web formları) dışa aktarılan formatı bozuk, yapışık ve karmaşık verileri tek hamlede temizleme yetkinliği kazandırmak; tek bir hücreye sıkışmış ad-soyad-unvan-iletişim bilgilerini mantıksal sütunlara ayrıştırmak; çok formatlı tarih ve telefon numaralarını kurumsal standartlara kavuşturmak; kodlama gerektirmeyen desen yakalama (regex / pattern matching) mantığıyla serbest metinlerden yapılandırılmış Excel tabloları üretmeyi öğretmek.",
      contentMarkdown: `
### 1. HOŞ GELDİN: FORMÜL DOKTORUNDAN VERİ CERRAHİSİNE (KÖPRÜ VE PEKİŞTİRME)

Tekrar merhaba! Masanın başına, üçüncü dersimize çok hoş geldin.

Şöyle bir derin nefes al ve arkana yaslan. Neden biliyor musun? Çünkü bir önceki dersimizde seninle birlikte ofis hayatının en büyük canavarlarından birini dize getirdik: **Excel formülleri.**

Hatırla; artık hiçbir formülü kafanda ezberlemeye çalışmıyorsun. Ne istediğini doğal Türkçenle masandaki o akıllı stajyere söylüyorsun; o da sana \`ÇOKETOPLA\` mı lazım, \`ÇAPRAZARA\` mı lazım saniyesinde hazırlayıp veriyor. Üstelik bir hata aldığında —o meşhur \`#BAŞV!\` ya da \`#DEĞER!\` uyarılarıyla karşılaştığında— paniklemiyoruz; "Hata Doktoru" istemimizle formülü anında teşhis edip onarıyoruz. Veri güvenliği kalkanımızı da unutmuyoruz: Gerçek müşteri isimleri yerine \`[Müşteri A]\`, şirket cirosu yerine sembolik rakamlar yazarak gizliliğimizi daima koruyoruz.

Fakat tam bu noktada çok can alıcı bir gerçekle yüzleşmek zorundayız:  
**Dünyanın en kusursuz formülünü de yazsan, eğer o formülün beslendiği veri bozuksa, alacağın sonuç koca bir hiçtir!**

Amerikalıların veri dünyasında meşhur bir sözü vardır: *"Garbage in, garbage out"* — yani **"Çöp girerse, çöp çıkar!"**

İşte bugün seninle birlikte ofiste saatlerimizi çalan o meşhur "çöp verileri" saniyeler içinde pırıl pırıl, kurumsal bir veri tabanına dönüştüren bir veri cerrahına dönüşeceğiz.

---

### 2. OFİSİN GİZLİ KABUSU: ÇÖP VERİLER VE SAATLER SÜREN VERİ AMELELİĞİ (PROBLEM VE BAĞ KURMA)

Gözlerini kapat ve tipik bir iş gününü hatırla:  
Şirketin ERP sisteminden (SAP, Logo vb.), CRM yazılımından ya da bir Google Form anketinden dışa aktarılmış 1.500 satırlık bir müşteri ya da personel listesi masana geliyor.

Dosyayı açıyorsun ve o an ekranın karşısında içinden derin bir "off" çekiyorsun. Çünkü liste tam anlamıyla bir felaket:

* **Büyük-Küçük Harf Kaosu:** Biri adını tamamen BÜYÜK HARFLE (\`AHMET YILMAZ\`), biri tamamen küçük harfle (\`mehmet kaya\`), bir diğeri ise harfleri karıştırarak (\`zEynEp çELİK\`) yazmış.
* **Yapışık Hücreler:** Ad, soyad, unvan ve şehir tek bir hücreye tıkışmış: \`dr. ALİ rıza ÖZTÜRK - Başhekim (İzmir) [ali.ozturk@hastane.com]\`.
* **Telefon Numarası Çorbası:** Aynı sütunda kimi numara \`05321234567\` şeklinde, kimi \`+90 532 123 45 67\`, kimi \`(0532) 123-45-67\`, kimi de boşluksuz \`5321234567\` olarak girilmiş.
* **Tarih Formatı Curcunası:** Biri \`14.05.2024\` yazmış, diğeri \`2024/05/14\`, öbürü \`14-May-24\`, bazısı da metin olarak biçimlendirildiği için Excel tarafından tarih bile algılanmıyor.

Peki eski usulde ne yapıyordun?

Excel'in "Metni Sütunlara Dönüştür" (Text to Columns) sihirbazını açıyordun. Ayraç olarak boşluk seçsen iki isimli personelin soyadı sağa kayıyor; virgül seçsen unvanlar şehre karışıyor; sütunlar darmadağın oluyordu.  
"Hızlı Doldurma" (Flash Fill / Ctrl+E) deniyordun; ilk 3 satırda güzel çalışırken 4. satırda düzensiz bir karakter görünce saçma sapan sonuçlar üretiyordu.

Sonuç ne oluyordu?  
Akşam saat 19:30, ofiste ışıklar sönmüş; sen klavyede \`F2\` tuşuna basıp tek tek hücrelerin içine giriyor, fazlalıkları siliyor, kelimeleri kesip yan sütuna yapıştırıyordun. Gözlerin yanıyor, bileğin ağrıyor, sinirlerin harap oluyordu.

Buna iş dünyasında kibarca **"veri temizleme"**, gerçeğinde ise **"veri ameleliği"** denir!

Şimdi arkana rahatça yaslan. Çünkü yapay zekâ, insan zihninin sahip olduğu en büyük yeteneğe sahiptir: **Desenleri ve bağlamı anlama kabiliyeti!**  
Yapay zekâ; nerenin isim, nerenin unvan, nerenin telefon olduğunu anlar. Virgülün unutulduğu yerde bile bağlamı kaçırmaz. Şimdi gel, bu ameleliği tarihe gömelim.

---

### 3. VERİ TEMİZLEMEDE 2 STRATEJİK YOL: DOĞRUDAN TEMİZLEME Mİ, EXCEL'E FORMÜL YAZDIRMAK MI?

Uygulamalara geçmeden önce cebine şu pratik stratejiyi koymanı istiyorum. Karşına bozuk bir veri geldiğinde önündeki veri hacmine göre 2 farklı yoldan birini seçeceksin:

* **Strateji A: Doğrudan Yapay Zekâya Temizletme (Küçük & Orta Ölçekli Veriler — 50 ila 300 Satır):**  
  Bozuk veriyi Excel'den kopyalarsın, yapay zekâ sohbetine yapıştırırsın, kurallarını söylersin. Yapay zekâ sana saniyeler içinde temizlenmiş bir tablo verir. Tabloyu kopyalar, Excel'e yapıştırırsın. İşin biter.
* **Strateji B: Yapay Zekâya Şablon / Formül / Regex Yazdırma (Büyük Veriler — Binlerce Satır):**  
  Eğer elinde 20.000 satırlık devasa bir dosya varsa, bütün veriyi kopyala-yapıştır yapamazsın. Bunun yerine yapay zekâya tablodan sadece **3 satırlık bozuk örnek** gösterirsin. "Bana bunu Excel içinde tek hamlede çözecek formülü (\`METNEBÖL\`, \`YAZIM.DÜZENİ\` veya Power Query adımı) ver" dersin. Formülü ana tablona uygularsın.

Bugün bu iki stratejiyi de ekran başında canlı olarak yapacağız.

---

### 4. CANLI UYGULAMA 1: YAPIŞIK VE BÜYÜK-KÜÇÜK HARFİ KARIŞMIŞ METİNLERİ AYRIŞTIRMA

Klavyeni önüne çek, ChatGPT, Copilot veya Claude pencereni aç.

#### Gerçek Ofis Senaryomuz:
İnsan Kaynakları departmanına başvuran adayların bilgileri bir formdan Excel'in A sütununa şu şekilde darmadağınık gelmiş:

\`\`\`text
dr. ALİ rıza ÖZTÜRK - Başhekim (İzmir) [ali.ozturk@hastane.com]
AYŞE DEMİR - İK Kıdemli Uzmanı (İstanbul) [ayse.demir@sirket.com]
mehmet can YILMAZ - Operasyon Direktörü (Ankara) [mcan@lojistik.com]
AV. selin kARA - Hukuk Müşaviri (Bursa) [selin.kara@hukuk.av.tr]
\`\`\`

Tek bir hücrede unvan, karmaşık harfli ad-soyad, meslek, parantezli şehir ve köşeli parantezli e-posta var. Yöneticin bu listeyi ayrı sütunlarda, kurumsal ve pırıl pırıl istiyor.

Yapay zekâ ekranına şu yapılandırılmış istemi birlikte yazalım:

\`\`\`text
Rol: Sen kıdemli bir Veri Temizleme ve Ofis Otomasyon Uzmanısın.
Görev: Aşağıda verilen karmaşık ve biçimi bozuk personel metinlerini analiz et, 
temizle ve düzenli bir tablo haline getir.

Kurallar ve Format:
1. Çıktıyı doğrudan Excel'e yapıştırabileceğim bir Markdown Tablosu olarak üret.
2. Tablo şu sütunlardan oluşsun: 
   [Hitap / Unvan] | [Ad] | [Soyad] | [Pozisyon] | [Şehir] | [E-Posta]
3. Harf Standartları:
   - Hitap/Unvan varsa ilk harfi büyük olsun (Dr., Av. gibi). Yoksa boş bırak.
   - [Ad] sütununda birden fazla isim varsa her ismin sadece ilk harfi büyük olsun (Örn: Ali Rıza).
   - [Soyad] sütunu TAMAMI BÜYÜK HARF olsun (Örn: ÖZTÜRK).
   - [Pozisyon] başlık düzeninde olsun (Örn: Başhekim, İK Kıdemli Uzmanı).
   - [Şehir] parantezlerden arındırılsın, ilk harfi büyük olsun.
   - [E-Posta] köşeli parantezlerden arındırılsın, tamamı küçük harf olsun.

Ham Veri:
dr. ALİ rıza ÖZTÜRK - Başhekim (İzmir) [ali.ozturk@hastane.com]
AYŞE DEMİR - İK Kıdemli Uzmanı (İstanbul) [ayse.demir@sirket.com]
mehmet can YILMAZ - Operasyon Direktörü (Ankara) [mcan@lojistik.com]
AV. selin kARA - Hukuk Müşaviri (Bursa) [selin.kara@hukuk.av.tr]
\`\`\`

Gönder butonuna bas. Saniyeler içinde ekranda beliren sonuca bakar mısın:

| Hitap / Unvan | Ad | Soyad | Pozisyon | Şehir | E-Posta |
|---|---|---|---|---|---|
| Dr. | Ali Rıza | ÖZTÜRK | Başhekim | İzmir | ali.ozturk@hastane.com |
| - | Ayşe | DEMİR | İK Kıdemli Uzmanı | İstanbul | ayse.demir@sirket.com |
| - | Mehmet Can | YILMAZ | Operasyon Direktörü | Ankara | mcan@lojistik.com |
| Av. | Selin | KARA | Hukuk Müşaviri | Bursa | selin.kara@hukuk.av.tr |

İşte bu kadar! Tabloyu sağ üst köşesinden "Kopyala" diyorsun, Excel'deki A1 hücresine yapıştırıyorsun. 

Excel'in metin bölme fonksiyonlarıyla saatlerce uğraşsaydın \`Ali Rıza\` ile \`Mehmet Can\` iki isimli olduğu için soyadları sağa kayacaktı, \`Dr.\` ve \`Av.\` unvanları isim hanesine girecekti. Ama yapay zekâ cümlenin anlamını okuduğu için sıfır hatayla ayrıştırdı.

#### 🔄 Ters İşlem: Ayrık Sütunları Tek Hücrede Birleştirme (Ad + Soyad)

Ayrıştırmanın bir de tam tersi var: Elinde \`Ad\` ve \`Soyad\` bilgisi iki ayrı sütunda duruyor; yöneticin ise toplu e-posta ya da etiket baskısı için tek sütunda \`Ad Soyad\` istiyor. Bunun da iki yolu var:

* **Yol 1 — Klasik Formül:** C2 hücresine \`=A2&" "&B2\` yazarsın (istersen \`=BİRLEŞTİR(A2;" ";B2)\`; İngilizce Excel'de \`=CONCAT(A2," ",B2)\`). Formülü aşağı doğru çektiğinde binlerce satır tek hamlede birleşir.
* **Yol 2 — Yapay Zekâya Yazdırma:** İstemi net kur: *"A sütununda Ad, B sütununda Soyad var; aralarına bir boşluk koyarak C sütununda 'Ad Soyad' üretecek formülü yaz."* Kaynak sütunları, ayırıcıyı (boşluk) ve hedef sütun adını açıkça belirttiğinde, stajyerin sana tek seferde hatasız formülü verir.

Unutma: Ayrıştırırken de birleştirirken de sihir aynı — neyin nerede durduğunu ve ne istediğini net tarif etmek.

---

### 5. CANLI UYGULAMA 2: ÇOK FORMATLI TARİH VE TELEFON NUMARALARINI STANDARTLAŞTIRMA

Gelelim ofis çalışanlarının saç baş yolduğu ikinci büyük derde: **Farklı formatlardaki tarihler ve telefon numaraları.**

Müşterilerden gelen sipariş listesinde telefonlar ve tarihler öyle bir girilmiş ki, filtreleme yapamıyorsun, SMS sistemine yükleyemiyorsun.

#### Gerçek Senaryo:
Elimizdeki ham veri şöyle:

\`\`\`text
Müşteri: Bay A | Tel: 05321112233 | Kayıt: 14/05/2023
Müşteri: Bayan B | Tel: +90 (542) 222-33-44 | Kayıt: 2023.05.14
Müşteri: Bay C | Tel: 555 333 44 55 | Kayıt: 14 May 2023
Müşteri: Bay D | Tel: 0 (505) 444 55 66 | Kayıt: 2023-05-14 09:30:00
\`\`\`

Hemen yapay zekâya dönüyoruz:

\`\`\`text
Rol: Sen bir Kurumsal Veri Standardizasyon Uzmanısın.
Görev: Aşağıda yer alan dağınık müşteri iletişim ve kayıt verilerini şirket standardımıza 
göre tek bir formata dönüştür.

Standart Kurallarımız:
1. Telefon Formatı: Tüm telefon numaralarını uluslararası Türkiye formatı olan 
   "+90 (5XX) XXX XX XX" düzenine getir. Başındaki 0 veya ülke kodlarını buna göre eşitle.
2. Tarih Formatı: Tüm tarihleri saat bilgisinden arındırarak Türk standartı olan 
   "GG.AA.YYYY" (Örn: 14.05.2023) formatına çevir.
3. Çıktı: 3 sütunlu temiz bir tablo ver ([Müşteri Kodu] - [Standart Telefon] - [Standart Tarih]).

Ham Veri:
Müşteri: Bay A | Tel: 05321112233 | Kayıt: 14/05/2023
Müşteri: Bayan B | Tel: +90 (542) 222-33-44 | Kayıt: 2023.05.14
Müşteri: Bay C | Tel: 555 333 44 55 | Kayıt: 14 May 2023
Müşteri: Bay D | Tel: 0 (505) 444 55 66 | Kayıt: 2023-05-14 09:30:00
\`\`\`

Yapay zekânın cevabına bak:

| Müşteri Kodu | Standart Telefon | Standart Tarih |
|---|---|---|
| Bay A | +90 (532) 111 22 33 | 14.05.2023 |
| Bayan B | +90 (542) 222 33 44 | 14.05.2023 |
| Bay C | +90 (555) 333 44 55 | 14.05.2023 |
| Bay D | +90 (505) 444 55 66 | 14.05.2023 |

Telefon numaralarındaki parantezler, tireler, fazladan sıfırlar tek hamlede hizalandı; tarihler ister eğik çizgiyle gelsin ister saat bilgisiyle, tek tip \`GG.AA.YYYY\` standardına kavuştu!

---

### 6. CANLI UYGULAMA 3: İLERİ SEVİYE DESEN YAKALAMA (KODSUZ REGEX İLE METİNDEN TABLO ÇIKARMA)

Şimdi seni veri temizlemenin en üst ligine çıkarıyorum. 

Ofiste bazen eline bir Excel tablosu bile gelmez. WhatsApp grubundan kopyalanmış mesajlar, çağrı merkezi notları ya da Outlook e-postalarından oluşan bir "metin çorbası" gelir.

Yazılımcılar bu tür metinlerin içinden belirli kurallara uyan parçaları cımbızla çekmek için **"Regex" (Düzenli İfadeler / Regular Expressions)** adında karmaşık bir kodlama mantığı kullanırlar. Ama senin regex kodu yazmana hiç gerek yok. Yapay zekâ, senin yerine o desenleri bir mıknatıs gibi yakalar!

#### Gerçek Senaryo:
Şirketinin saha destek ekibinden gün boyu şöyle dağınık e-posta ve mesaj notları gelmiş:

> *"Bugün 10:15 sularında Kadıköy bayisinden Selin Hanım aradı. İade edilen Fatura No: FTR-2024-8842. İade tutarı 14.500 TL. Gerekçe: Hatalı ürün sevkiyatı yapılmış."*  
> *"Çankaya merkez şubesinden Ahmet Bey bildirdi. FTR-2024-9103 numaralı fatura için 3.200 TL iskonto talebi iletildi. Müşteri bekletilmek istemiyor acil onay rica etti."*  
> *"Acil bildirim: Bornova deposundan Dr. Burak Bey ulaştı. FTR-2024-7320 nolu işlemde 28.750 TL tutarında mükerrer tahsilat tespit edilmiş, muhasebe iadesi bekleniyor."*

Yöneticin diyor ki: *"Bu mesajları oku, kimden ne fatura gelmiş, tutarı neymiş acil bir Excel tablosu yap!"*

Eski usulde metinleri tek tek okuyup faturayı bulur, kopyalar, hücreye yapıştırırdın. Şimdi yapay zekâya dönüp şu desen yakalama komutunu ver:

\`\`\`text
Rol: Sen uzman bir Veri Analisti ve Desen Yakalama (Regex / Pattern Extraction) Uzmanısın.
Görev: Aşağıdaki serbest saha bildirim metinlerini tara. Belirli kurallara uyan bilgileri 
otomatik olarak ayıkla ve Excel'e uygun bir tabloya dönüştür.

Yakalanacak Desenler ve Sütunlar:
1. [Şube / Lokasyon]: Metindeki bayi, şube veya depo ismi.
2. [Yetkili Kişi]: Bildirimi yapan kişinin adı ve unvanı.
3. [Fatura No]: "FTR-YYYY-XXXX" desenine uyan fatura numarası.
4. [Tutar (TL)]: Tutar bilgisini sadece sayı ve TL olarak standartlaştır.
5. [İşlem / Konu]: Talebin özeti (İade, İskonto, Mükerrer Tahsilat vb.).

Serbest Metinler:
"""
Bugün 10:15 sularında Kadıköy bayisinden Selin Hanım aradı. İade edilen Fatura No: FTR-2024-8842. 
İade tutarı 14.500 TL. Gerekçe: Hatalı ürün sevkiyatı yapılmış.

Çankaya merkez şubesinden Ahmet Bey bildirdi. FTR-2024-9103 numaralı fatura için 3.200 TL iskonto 
talebi iletildi. Müşteri bekletilmek istemiyor acil onay rica etti.

Acil bildirim: Bornova deposundan Dr. Burak Bey ulaştı. FTR-2024-7320 nolu işlemde 28.750 TL 
tutarında mükerrer tahsilat tespit edilmiş, muhasebe iadesi bekleniyor.
"""
\`\`\`

Gelen sonuca bakar mısın?

| Şube / Lokasyon | Yetkili Kişi | Fatura No | Tutar | İşlem / Konu |
|---|---|---|---|---|
| Kadıköy Bayisi | Selin Hanım | FTR-2024-8842 | 14.500 TL | Hatalı ürün iadesi |
| Çankaya Merkez | Ahmet Bey | FTR-2024-9103 | 3.200 TL | İskonto talebi |
| Bornova Deposu | Dr. Burak Bey | FTR-2024-7320 | 28.750 TL | Mükerrer tahsilat iadesi |

Paragraf yığınının içinden faturalar cımbızlandı, şubeler ayrıldı, tutarlar hizalandı ve 10 saniye içinde toplantıya sunulacak bir operasyon tablosu oluştu. İşte yapay zekânın ofisteki gerçek gücü budur!

> **💡 Profesyonel İpucu (Excel 365 Kullanıcıları İçin):**  
> Eğer Microsoft 365'in en güncel sürümünü kullanıyorsan, Excel'e eklenen \`REGEXTEST\`, \`REGEXEXTRACT\` ve \`REGEXREPLACE\` fonksiyonları sayesinde bu desenleri formülle de yakalayabilirsin. Önemli detay: Bu üç fonksiyon Türkçe Excel'de de İngilizce adlarıyla çalışır; yerelleştirilmiş Türkçe karşılıkları yoktur. Yapay zekâya *"Bana metin içindeki 'FTR-XXXX' kalıbını çekecek Excel REGEXEXTRACT formülünü yaz"* dediğinde, formülü anında alabilirsin!

---

### 7. BÖLÜM ÖZETİ: CEBİNE KOYMAN GEREKEN 3 ALTIN VERİ TEMİZLEME KURALI

Bu dersi tamamlarken masandan şu 3 altın prensiple ayrılmanı istiyorum:

1. **Temiz veri olmadan analiz olmaz (Çöp girerse çöp çıkar):** Formülün patlıyorsa sorun formülde değil, hücredeki gizli boşluklarda, bozuk tarihlerde ya da kaymış metinlerdedir. Önce veriyi standartlaştır, sonra formülü kur.
2. **Hacme göre strateji seç (Doğrudan Temizleme vs. Şablon Üretme):** Birkaç yüz satırlık listeleri doğrudan yapay zekâya yapıştırıp saniyeler içinde temizlet. On binlerce satırlık listelerde ise yapay zekâdan 3 örnek üzerinden formül veya Power Query temizleme adımı iste.
3. **Yapay zekâya deseni (Pattern) örnekle göster:** İstem yazarken *"Girdim şöyle, istediğim çıktı formatı harfi harfine böyle olsun"* diyerek 1 adet örnek (Few-shot prompting) verdiğinde, yapay zekâ karmaşık kuralları asla şaşırmaz.

---

> **🎯 2 Dakikalık Saha Görevi:** Bu dersi kapatmadan önce: Masandaki gerçek bir listeden 5 satırlık bozuk veri kopyala (ismi, telefonu ya da tarihi karışık olanı seç), ayrıştırma istemiyle yapay zekâya temizlet; ardından iki sütunu \`&\` veya \`BİRLEŞTİR\` ile tek hücrede birleştir. **Kendi verini pırıl pırıl görmeden 4. bölüme geçme.**

---

### 8. BİR SONRAKİ BÖLÜMÜN MÜJDESİ (MERAK KANCASI)

Gönülden tebrikler!  
Excel dünyasında artık hiç kimse eline su dökemez. Formül ezberleme kabusunu bitirdin, bozuk ve çöp verileri saniyeler içinde hizaya soktun. Masandaki Excel tabloları artık bir sanat eseri gibi tertemiz!

Peki şimdi sana şunu sorayım:  
Bu pırıl pırıl verileri, harika analizleri ve kritik kararları yöneticine, yönetim kuruluna ya da resmi kurumlara nasıl sunacaksın?

Boş bir **Word** sayfası açıp, o beyaz ekranda yanıp sönen imlece bakarak *"Sayın İlgili..."* diye başlayıp dakikalarca cümle kurmaya mı çalışacaksın?  
Ya da masana 30 sayfalık resmi bir ihale şartnamesi, şirket içi disiplin yönetmeliği veya karmaşık bir sözleşme geldiğinde gece yarılarına kadar satır satır okuyup özet çıkarmakla mı boğuşacaksın?

Bir sonraki dersimiz olan **Bölüm 4: Word ve Resmi Yazışmalarda Profesyonel Raporlama ve Şablon Üretimi** bölümünde; resmi kurumsal dili saniyeler içinde konuşturan, diplomatik ve hatasız yazışma şablonları üreten ve devasa sözleşmeleri tek tıkla özetleyen harika bir yönetim mimarisi kuracağız.

Word'de saatler süren belge yazma çilesini bitirmeye hazırsan, kahveni tazele; 4. Bölümde resmi belgelerin efendisi olmak için buluşalım!
`,
};
