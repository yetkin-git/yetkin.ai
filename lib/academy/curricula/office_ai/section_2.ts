import type { Section } from "../types";

export const section2: Section = {
      sectionNumber: 2,
      title: "Excel'de Formül Ezberlemeye Son: Doğal Dille Tablo ve Formül Sihirbazlığı",
      targetDurationMinutes: 10.5,
      estimatedWordCount: 1474,
      pedagogicalObjective: "Excel'de formül ezberleme baskısını ve parantez hataları stresini tamamen ortadan kaldırmak; kullanıcının günlük iş ihtiyaçlarını sade Türkçe tariflerle hatasız Excel formüllerine dönüştürmesini sağlamak; formül içi sözdizimi hatalarını yapay zekâ ile anında teşhis edip onarmayı öğretmek; başkalarının yazdığı karmaşık formülleri Türkçeye çeviren çift yönlü zihinsel köprüyü inşa etmek.",
      contentMarkdown: `
### 1. HOŞ GELDİN: MASADAKİ STAJYERİMİZ VE GÜVENLİK REFLEKSİMİZ (KÖPRÜ VE PEKİŞTİRME)

Tekrar merhaba! Masanın başına, ikinci dersimize çok hoş geldin.

Kahveni tazeledin mi? Harika, çünkü bugün ofis hayatında seni en çok yoran devasa bir canavarı evcilleştireceğiz: **Excel formülleri.**

Uygulamaya geçmeden önce, ilk dersimizde cebimize koyduğumuz o iki hayati prensibi çok kısa hatırlayalım:
1. **Yapay zekâ masandaki hevesli stajyerdir:** Dünyadaki bütün formülleri, fonksiyonları saniyesinde bilir ama senin niyetini tahmin edemez. Ona rolünü, verinin yapısını ve ne istediğini net söylediğin anda mucizeler yaratır.
2. **Altın güvenlik kuralı (KVKK ve Maskeleme):** Müşterilerin gerçek ad-soyadlarını, T.C. kimlik numaralarını ya da şirketin henüz gizli olan ciro rakamlarını doğrudan modele vermiyoruz. Her zaman takma isimler (\`[Müşteri A]\`, \`[Bay X]\`, \`[Şube 1]\`) kullanıyoruz. Mantık kurulduktan sonra formülü kendi orijinal dosyamıza uyguluyoruz.

Bu güvenlik kalkanımız hazırsa, gel şimdi ofis çalışanlarının en büyük krizine dalalım.

---

### 2. OFİSİN KORKULU RÜYASI: PARANTEZ CEHENNEMİ VE FORMÜL STRESİ (PROBLEM VE BAĞ KURMA)

Ekranına bakarken dürüstçe düşünelim: Kaç kere yöneticin senden acil bir hesaplama istediğinde kalbin hızlandı?

*"Şu 20 bin satırlık listeden İzmir şubesinin 5.000 TL üzeri satışlarını hemen toplayıp getirir misin?"*  
Ya da:  
*"A sütunundaki müşteri kodunu diğer sayfadaki cari listeyle eşleştirip yanına vergi dairesini çekelim."*

Tam o an elin klavyeye gider:  
Eşittir dersin, \`DÜŞEYARA\` (ya da İngilizce kullanıyorsan \`VLOOKUP\`) yazarsın.  
Parantezi açarsın...  
Ve zihninde o meşhur kaos başlar:  
*"Önce aranan değer miydi, tablo dizisi miydi? Noktalı virgül mü koyacaktım, iki nokta mı? Kaçıncı sütun olduğunu baştan mı sayıyordum? Sonuna sıfır mı yazıyorduk, YANLIŞ mı? Parantezi kaç kere kapatacaktım?"*

Formülü yazarsın, derin bir nefes alıp \`Enter\` tuşuna basarsın. Ve karşında o sevimsiz hata kodları:  
\`#DEĞER!\` (\`#VALUE!\`), \`#YOK\` (\`#N/A\`), \`#BAŞV!\` (\`#REF!\`) ya da \`#AD?\` (\`#NAME?\`).

İşte o an insan kendini çaresiz hisseder. "Ben Excel bilmiyorum", "Matematiğim yetmiyor" duygusu gelir. Hemen Google açılır, onlarca karmaşık forum taranır, YouTube videoları 2x hızda ileri sarılır, ofiste Excel'i iyi bilen o arkadaşın masasına mahcupça gidilir...

Bazen sadece iki sütunu eşleştirmek veya iki koşullu bir toplama yapmak için koca bir öğleden sonran heba olur!

Şimdi sana çok net bir müjde veriyorum: **Bugünden itibaren tek bir Excel formülü bile ezberlemek zorunda değilsin!**

Excel'de 500'den fazla fonksiyon var. Bunların sözdizimini (syntax), parantez dizilimini aklında tutmak zorunda olan kişi sen değilsin. Senin görevin veri ameleliği yapmak değil; ne istediğini Türkçe olarak tarif etmek. Formülü yazmak ve hatayı düzeltmek ise masanın karşısındaki yapay zekâ stajyerinin işi.

---

### 3. ÇİFT YÖNLÜ FORMÜL MANTIĞI: İKİ BÜYÜK SİHİR

Yapay zekâyı Excel'de kullanırken tek yönlü düşünmeyeceğiz. Çift yönlü bir köprü kuracağız:

1. **Metinden Formüle (İhtiyacı Formüle Çevirme):** Ne hesaplamak istediğini Türkçe günlük konuşma diliyle tarif edersin; yapay zekâ sana tam hücre adresleriyle çalışan formülü yazar.
2. **Formülden Metne (Tersine Mühendislik):** Eski bir çalışma arkadaşından kalan, devasa ve içi içe geçmiş karmaşık bir formülü kopyalayıp yapay zekâya yapıştırırsın; yapay zekâ sana o formülün satır satır ne yaptığını 10 yaşındaki birinin anlayacağı durulukta açıklar.

Gel, bu iki sihirli adımı ve en önemlisi "bozuk formülü onarma" sanatını canlı örneklerle adım adım uygulayalım.

---

### 4. CANLI UYGULAMA 1: METİNDEN FORMÜLE (ÇOKETOPLA VAKASI)

Klavyeni önüne çek, ister ChatGPT'yi, ister Microsoft Copilot'u, ister Claude'u aç.

#### Gerçek Ofis Senaryomuz:
Önünde 5 sütunluk bir satış tablosu olduğunu hayal et:
* **A Sütunu:** Sipariş No
* **B Sütunu:** Şube Adı (İstanbul, Ankara, İzmir...)
* **C Sütunu:** Satış Temsilcisi
* **D Sütunu:** Satış Tutarı (TL)
* **E Sütunu:** Sipariş Tarihi

Yöneticinin senden istediği şey şu:  
*"İzmir şubesinde yapılmış ve tutarı 5.000 TL'den büyük olan satışların toplamını F2 hücresine yazalım."*

Normalde burada \`ÇOKETOPLA\` (\`SUMIFS\`) fonksiyonu gerekir. Aralıkları ters yazarsan sonuç sıfır çıkar ya da hata verir.

Şimdi yapay zekâya dönüp aynen şu komutu verelim:

\`\`\`text
Rol: Sen kıdemli bir Veri Analisti ve Excel Uzmanısın.
Görev: Aşağıda yapısını belirttiğim Excel tablosu için ihtiyacım olan formülü yaz.

Tablo Yapısı:
- A Sütunu: Sipariş No
- B Sütunu: Şube Adı
- C Sütunu: Satış Temsilcisi
- D Sütunu: Satış Tutarı (TL)
- E Sütunu: Sipariş Tarihi

İhtiyaç:
"İzmir" şubesinde gerçekleşen ve Satış Tutarı 5.000 TL'den büyük olan siparişlerin 
toplam tutarını hesaplamak istiyorum.

Kurallar:
1. Formülü hem Türkçe Excel hem de İngilizce Excel için ayrı ayrı ver.
2. Formülün mantığını 2 cümlede açıkla; hangi aralığın ne işe yaradığını belirt.
3. Formülü doğrudan kopyalayıp F2 hücresine yapıştırabileceğim temiz kod bloğunda yaz.
\`\`\`

Gönder tuşuna bas. Yapay zekânın 3 saniye içinde verdiği cevaba bak:

\`\`\`markdown
### 🟢 Türkçe Excel İçin Formül:
=ÇOKETOPLA(D:D; B:B; "İzmir"; D:D; ">5000")

### 🔵 İngilizce Excel İçin Formül:
=SUMIFS(D:D, B:B, "İzmir", D:D, ">5000")

### 💡 Formülün Mantığı:
Bu formülde ilk parametre (\`D:D\`) toplanacak olan satış tutarlarını belirtir. 
Ardından gelen \`B:B; "İzmir"\` birinci koşulu (şubenin İzmir olması), 
\`D:D; ">5000"\` ise ikinci koşulu (tutarların 5.000'den büyük olması) filtreleyerek toplar.
\`\`\`

İşte bu kadar! Noktalı virgül nereye konur, büyüktür işareti tırnak içine mi alınır diye düşünmene gerek kalmadı. Kopyala, F2 hücresine yapıştır, işin bitti.

---

### 5. CANLI UYGULAMA 2: HATA DOKTORU (BOZUK FORMÜLÜ SANİYELER İÇİNDE DÜZELTME)

Peki ya formülü yazdın ya da bir arkadaşından aldın ama hücrede kocaman bir \`#BAŞV!\` (\`#REF!\`) veya \`#YOK\` (\`#N/A\`) görüyorsan?

Sakın panik yapma ve formülü baştan yazmaya çalışma. Yapay zekâyı **"Hata Doktoru"** olarak kullanacağız.

#### Gerçek Senaryo:
Diyelim ki bir ürünün fiyatını başka bir sayfadan çekmek için şu meşhur \`DÜŞEYARA\` formülünü yazdın:

\`=DÜŞEYARA(A2; 'Fiyat Listesi'!A1:C100; 4; 0)\`

Enter'a bastın ve ekranda kırmızı alarmlar çalıyor: \`#BAŞV!\` (\`#REF!\`) hatası!

Hemen yapay zekâ pencerene dön ve şu acil yardım istemini yapıştır:

\`\`\`text
Rol: Sen bir Excel Hata Teşhis Uzmanısın.
Sorun: Excel'de aşağıdaki formülü yazdım ve "#BAŞV!" (#REF!) hatası alıyorum.

Kullandığım Formül:
=DÜŞEYARA(A2; 'Fiyat Listesi'!A1:C100; 4; 0)

Tablo Bilgisi:
- 'Fiyat Listesi' sayfamda A1:C100 aralığında 3 sütun var:
  A Sütunu: Ürün Kodu
  B Sütunu: Ürün Adı
  C Sütunu: Fiyat
- Amacım: A2 hücresindeki ürün kodunun Fiyat bilgisini C sütunundan çekmek.

Görev:
1. Bu hatanın tam olarak neden kaynaklandığını tek bir net cümlede söyle.
2. Formülü hatasız şekilde düzelt ve kopyalanabilir olarak ver.
3. Varsa bu formülün yerine kullanabileceğim daha modern ve hataya dayanıklı bir alternatif öner (Örn: ÇAPRAZARA / XLOOKUP).
\`\`\`

Gelen yanıta bakar mısın?

\`\`\`markdown
### 🩺 Hatanın Teşhisi:
Tablo aralığınızı \`A1:C100\` (toplam 3 sütun) olarak seçmişsiniz ancak formülde 
4. sütunu (\`4\`) getirmesini istemişsiniz; aralıkta 4. sütun bulunmadığı için 
Excel başvuru hatası (\`#BAŞV!\`) üretmektedir.

### ✅ Düzeltilmiş Formül (Türkçe Excel):
=DÜŞEYARA(A2; 'Fiyat Listesi'!A1:C100; 3; YANLIŞ)

### 🚀 Modern ve Güvenli Alternatif (ÇAPRAZARA / XLOOKUP):
Eğer Microsoft 365 kullanıyorsanız, sütun sırasından etkilenmeyen bu formülü öneririm:
=ÇAPRAZARA(A2; 'Fiyat Listesi'!A:A; 'Fiyat Listesi'!C:C; "Fiyat Bulunamadı")
\`\`\`

Gördün mü? Hatayı aramak için dakikalarca ekran başında gözlerini kısmadın. Nerede hata yaptığını sana nazikçe açıkladı, formülün doğrusunu verdi ve hatta daha modern bir çözüm sundu.

---

### 6. CANLI UYGULAMA 3: FORMÜLDEN METNE (TERSİNE MÜHENDİSLİK)

Şimdi madalyonun diğer yüzünü çevirelim.

Şirketinde senden önce çalışan biri bir Excel dosyası bırakmış. Ya da Finans departmanı sana 50 sütunluk bir bütçe şablonu göndermiş. Bir hücreye tıklıyorsun ve formül çubuğunda şöyle yılan gibi uzayıp giden bir şey görüyorsun:

\`=EĞER(VE(B2="Tamamlandı"; C2>10000); D2*0,15; EĞER(VE(B2="Tamamlandı"; C2<=10000); D2*0,08; 0))\`

İç içe geçmiş \`EĞER\`ler, \`VE\`ler, parantezler... Bakarken insanın başı dönüyor. "Bu formül ne hesaplıyor, ben bu hücreyi değiştirirsem ne bozulur?" diye korkuyorsun.

Formülü kopyala ve yapay zekâya şöyle seslen:

\`\`\`text
Rol: Sen karmaşık formülleri iş insanlarının anlayacağı dile çeviren bir eğitmensin.
Görev: Aşağıdaki Excel formülünü analiz et. Kodlama veya matematik bilmeyen birine anlatır gibi 
adım adım hangi kurallara göre ne hesapladığını Türkçe olarak izah et.

Formül:
=EĞER(VE(B2="Tamamlandı"; C2>10000); D2*0,15; EĞER(VE(B2="Tamamlandı"; C2<=10000); D2*0,08; 0))
\`\`\`

Cevap anında gelir:

\`\`\`markdown
### 📌 Bu Formül Ne Yapıyor?
Bu formül bir çalışan veya bayi için **prim/komisyon hesaplaması** yapmaktadır. 
Mantığı 3 net kurala dayanır:

1. **Yüksek Prim (%15):** Eğer B2 hücresindeki durum "Tamamlandı" ise VE satış tutarı 
   10.000 TL'den büyükse, D2 hücresindeki tutarın %15'ini prim olarak hesaplar.
2. **Standart Prim (%8):** Eğer durum "Tamamlandı" ise fakat tutar 10.000 TL veya altındaysa, 
   D2 hücresindeki tutarın %8'ini hesaplar.
3. **Sıfır Prim (0):** Durum "Tamamlandı" değilse (örneğin 'İptal' veya 'Beklemede' ise), 
   tutara bakılmaksızın 0 değerini verir.
\`\`\`

Nasıl bir aydınlanma değil mi? Artık kimsenin hazırladığı karmaşık dosya senin için kapalı bir kutu değil. Kopyala, yapay zekâya sor ve formülün röntgenini saniyeler içinde çek.

---

### 7. BÖLÜM ÖZETİ: CEBİNE KOYMAN GEREKEN 3 ALTIN FORMÜL KURALI

Bu dersi tamamlarken masandan şu 3 altın prensiple ayrılmanı istiyorum:

1. **Formül isimlerini unut, sütunlarını ve niyetini doğru anlat:** Excel'e değil, stajyerine konuş. "A sütunumda isimler var, B'de tarihler var, şu koşula uyanları topla" demen yeterlidir.
2. **Hata kodundan korkma, hatayı stajyerine teşhis ettir:** \`#DEĞER!\` ya da \`#YOK\` gördüğünde kendini suçlama; formülü ve hatayı yapay zekâya ver, saniyeler içinde onarsın.
3. **Excel diline ve bölgesel ayarlara dikkat et:** Türkçe Excel'de formüller Türkçedir (\`DÜŞEYARA\`) ve parametreler noktalı virgülle (\`;\`) ayrılır. İngilizce Excel'de formüller İngilizcedir (\`VLOOKUP\`) ve virgülle (\`,\`) ayrılır. Yapay zekâya istem yazarken hangi sürümü kullandığını baştan söylersen tek seferde doğru sonucu alırsın.

---

> **🎯 2 Dakikalık Saha Görevi:** Bu dersi kapatmadan önce: Kendi Excel dosyandan gerçek bir ihtiyaç seç (örneğin bir şubenin belli tutar üstü satışlarını toplamak) ve "Metinden Formüle" istemiyle yapay zekâya yazdır; formülü kendi dosyana yapıştırıp çalıştığını kendi gözünle gör. Elinde hata veren eski bir formül varsa onu da "Hata Doktoru" istemine yapıştır. **Kendi hücrende çalışan formülü görmeden 3. bölüme geçme.**

---

### 8. BİR SONRAKİ BÖLÜMÜN MÜJDESİ (MERAK KANCASI)

Tebrikler! Artık Excel'in o korkutucu formül dünyasını tamamen dize getirdin. Kendine kocaman bir aferin de, çünkü artık ofiste formüller yüzünden mesaiye kalmayacaksın.

Ama dur... Excel'de formüllerden bile daha can sıkıcı, insanı çıldırtan başka bir dert daha var:  
**Dağınık, bozuk ve kirli veriler!**

Düşün: Muhasebeden veya sahadan bir dosya geliyor. İsimler küçük-büyük harf birbirine girmiş. Ad ve soyad tek sütuna yapışmış. Telefon numaralarının kiminde \`05...\`, kiminde \`+90...\`, kiminde parantez var. Tarihlerin yarısı nokta ile yarısı eğik çizgi ile yazılmış... 

Eski usulde bu verileri tek tek elle düzeltmek tam 2 saatini alırdı.

Bir sonraki dersimiz olan **Bölüm 3: Dağınık ve Bozuk Verileri Saniyeler İçinde Temizleme, Ayrıştırma ve Birleştirme** bölümünde; binlerce satırlık çöp veriyi tek bir komutla nasıl pırıl pırıl, standart bir veri tabanına dönüştüreceğimizi göreceğiz.

Ekranını kapatma, kahvenden bir yudum daha al; 3. Bölümde veri temizleme sihirbazlığı için buluşalım!
`,
};
