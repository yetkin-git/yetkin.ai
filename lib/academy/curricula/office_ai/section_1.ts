import type { Section } from "../types";

export const section1: Section = {
  sectionNumber: 1,
  lessonKey: "01_office_ai-1",
  title: "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo",
  targetDurationMinutes: 10.1,
  estimatedWordCount: 1377,
  pedagogicalObjective:
    "Düzensiz Excel tablosunu A1 hücresinden başlayarak düzenli tabloya çevirmeyi göstermek. Neden A1? Çünkü model tablonun nereden başladığını oradan okur. ChatGPT, Claude, Gemini ve özel API (şirketinin kurumsal yapay zekâ modeli) farkını eğilim diliyle oturtmak.",
  contentMarkdown: `
Her gün masanın üstünde biriken dosyalar, e-postalarla gelen karmakarışık listeler ve saatlerce içinden çıkamadığın Excel sayfaları... Peki neden bu yığın seni yavaşlatır? Çünkü yapay zekâ, sen ona neyi nasıl vereceğini bilmeden o karmaşayı tek başına çözmez. Karmaşık bir veri yığını gördüğünde paniklemek yerine doğru komutu kurarsan, dakikalarca süren el işçiliği düşer. Şimdi arkana yaslan. Bu derste yapay zekâyı soru sorulan bir kutu gibi değil, masadaki asistanın gibi kullanmayı adım adım göstereceğiz.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ yolculuğunun ilk dersine hoş geldin! Bu seride seninle birlikte teorik ezberleri bir kenara bırakacak, ofiste her gün karşına çıkan gerçek problemleri yapay zekâ desteğiyle adım adım çözeceğiz. Bugün masandaki en büyük zaman tuzaklarından birini hedef alıyoruz: Açtığında gözünü korkutan, biçimleri birbirine girmiş o karmaşık tablolar. Hazırsan masaya oturalım; çünkü bu dersin sonunda o tabloyu A1 hücresinden başlayarak konuşturmayı öğreneceksin ve kontrol sende kalacak.

Ofiste saatlerini alan o rutin işleri düşün. Bir rapordan kopyalanıp sana iletilen bir liste gelir ve senden acil bir analiz istenir. Ancak sayfayı açtığında hiçbir şey yerli yerinde değildir; sayılar sola yaslanmış, tarihler birbirine karışmıştır. Bu tabloyu ChatGPT, Claude veya Gemini sohbetine ataş ile yüklersin; Copilot lisansın varsa şeritten doğrudan okutursun ya da şirketinin özel API'sine verirsin. Özel API, şirketinin kurumsal yapay zekâ modelidir: evdeki format ve gizlilik kuralı o kiracıya yazılır. Bu araçların eğilimleri sürümden sürüme değişir; 2026 itibarıyla ChatGPT çoğu zaman hızlı taslak üretmeye, Claude uzun satırları dikkatle okumaya, Gemini adımları net sıralamaya yatkındır. Hiçbiri sabit karakter değildir. Kod ezberlemen gerekmez. Neden? Çünkü bu işi çözen şey program yazmak değil; tabloyu doğru kapıdan, doğru sırayla vermektir. Hadi gel, bu dönüşümü adım adım başlatalım.

## DÜZENSİZ TABLO

Öncelikle karşılaştığımız sorunu netleştirelim. Çoğu zaman önümüze gelen dosya, üzerinde işlem yapmaya uygun olmayan bir ham veri yığınıdır. Birkaç satır boş bırakılmış, bazı başlıklar hücre birleştirme sevdası yüzünden kaymış ve metinler karmakarışık hale gelmiştir. Bu tür bir dağınık yapı gördüğünde genellikle tek tek hücreleri düzeltmeye çalışırsın, değil mi? Oysa bu yaklaşım saatleri yer. Peki neden tek tek hücre düzeltmek yetmez? Çünkü yapay zekâ hücre hücre değil, başlık ve sütun düzenini arar. Tablonun dilini biraz sadeleştirirsen, o karmaşayı bir çırpıda okur.

Peki, yapay zekâ bu dağınık sayfaya baktığında aslında ne görür? Sen orada bir müşteri listesi veya bütçe özeti görürken, o önce başlık ve sütun düzenini arar. 2026 modelleri dağınık ızgarayı da okuyabilir; A1 hijyeni işi hızlandırır, hata riskini düşürür. Bu bir sihir değil. Birbirine girmiş hücreler sistemin mantığını bozar, boş satırlar ise satırların devamlılığını keser. Bu yüzden düzensiz tabloyu yapay zekâya doğrudan aktarmadan önce her verinin ait olduğu yer belli olmalı. Şimdi bu karmaşayı kökünden çözecek hamleye, A1 hücresine, odaklanalım.

## A1 HÜCRESİ

Şimdi mantığı oturtalım. Neden A1 hücresinden başlıyoruz? Çünkü bir tablonun okunması her zaman en sol üst köşeden kurulur. A1 hücresi boşsa ya da alakasız bir genel başlıkla birleştirilmişse, yapay zekâ tablonun nereden başladığını çözemez. Yapman gereken ilk şey, bu noktayı netleştirmektir. Sayfanın en tepesindeki birleştirilmiş başlıkları kaldırıp, A1 hücresine ilk gerçek sütun adını yazmalısın. Örneğin oraya 'Müşteri Adı' ya da 'Sipariş No' gibi net bir sütun başlığı yerleştirdiğinde, yapay zekâ tüm tabloyu doğru okumaya başlar.

Unutma, A1 hücresi doğru kurgulanmamış bir yapıya ne kadar gelişmiş bir komut verirsen ver, alacağın sonuç eksik kalacaktır. Çünkü yapay zekâ veriyi satır ve sütun hiyerarşisiyle tartar. A1 hücresi doğru bir sütun adı taşıdığında, yanındaki diğer hücreler de otomatik olarak bir anlama kavuşur. 'Ürün', 'Tarih', 'Tutar' gibi başlıkların hepsi birinci satırda yan yana dizilmelidir. Böylece dakikalarca sürecek kafa karışıklığı baştan düşer ve veri komuta hazır hale gelir.

## TEMİZLE ŞİMDİ

Şimdi ikinci adıma geçiyoruz. Peki neden A1 eşiğini kurmadan temizleme komutu vermiyoruz? Çünkü hangi kapıya gidersen git, model önce tablonun nereden başladığını arar. ChatGPT taslağı çabuk gösterme eğilimindedir, Claude uzun dökümü tartmaya yatkındır, Gemini adımları sıraya dizme eğilimindedir; özel API — şirketinin kurumsal modeli — evdeki formatı kilitlemeye yatkındır. Karmaşık teknik ifadelere hiç girmeden, günlük konuşma diliyle durumu anlatacağız. Modele şunu söyleyebilirsin: 'Sana sunduğum bu ham veri içinde yer alan birleştirilmiş hücreleri tek tek ayır, aralardaki gereksiz boş satırları sil ve sayıları standart sayı formatına getir.' Gördüğün gibi komut günlük dille yazılıyor; model neyi ayıracağını, neyi sileceğini ve sayıyı nasıl standartlaştıracağını net duyuyor. Veri bir kez temizlenir; sonra hangi araca gideceğine sen karar verirsin. Şüpheli hücreye gelip F2'ye basarak kesme işaretini kontrol et ve her zaman orijinal dosyayı koruyup yan sekmede temiz kopyanı oluştur.

Peki bu veriyi yapay zekâya nasıl vereceksin? Üç Kapı sırası sabittir, çünkü önce en yerinde yolu denersin. 1) Copilot lisansın varsa şeritten doğrudan okutursun — bu birinci kapıdır. 2) Yoksa dosyayı ataş simgesinden Gemini, ChatGPT veya Claude sohbetine yüklersin — ataş ikinci kapıdır. 3) Son çare: isim ve telefonu maskeleyip kısa bir özeti yapıştırırsın. Ham tabloyu ekran görüntüsüyle taşımak öğretilen yol değildir; çünkü ekran görüntüsü hücreleri bozar ve A1 eşiğini kaybettirir.

Bu aşamada tür karmaşasını ortadan kaldırmak da hayati bir adımdır. Neden? Çünkü aynı sütunun içinde hem '1.200 TL' yazar, hem sadece '1200', hem de metin şeklinde girilmiş 'bin iki yüz' durursa model hangisinin tutar olduğunu karıştırır. Yapay zekâya 'Tutar sütunundaki tüm değerleri yalnızca sayı olacak şekilde tek tip yap' dediğinde, tüm bu farklılıklar tek bir standarda oturur. Fazladan boşlukları temizler, tarihleri gün-ay-yıl düzenine sokar. Sen kahvenden bir yudum alırken, o karmaşık dağınık yapı pürüzsüz bir veri tabanına dönüşür.

## FARK ORTADA

Ekrandaki dikey bölünmüş görüntüye dikkatle bakmanı istiyorum. Sol tarafta düzenlemesiz ham veri duruyor: Birleştirilmiş başlıklar, arada sırıtan boş satırlar ve birbirini tutmayan yazı tipleri. Sağ tarafta ise yapay zekâ ile temizlenmiş düzenli tablo yer alıyor. Peki neden fark bu kadar belirgin? Çünkü sol taraf karmaşa ve potansiyel hata kaynağıdır; sağ taraf hemen bir özet tabloya, bir yönetici özetine veya analize girmeye hazırdır. Doğru yönlendirilen yapay zekâ masanda tam olarak bunu yapar: dağınığı okunur hale getirir.

Gördüğün gibi iki tablo arasındaki tek fark, araya doğru kurallarla yerleştirdiğimiz yapay zekâ filtresi. Sol taraftaki görüntü sana daha önce saatler kaybettirmiş olabilir; formüllerin hata vermesine, grafiklerin yanlış çıkmasına yol açmış olabilir. Sağdaki düzenli tablo ise şirketinde herkesin tek bakışta anlayabileceği, kurumsal ve kusursuz bir çalışma sunar. Artık karmaşık dosyalar geldiğinde endişelenmek yerine, bu dönüşümü başlatacak adımları tam olarak biliyorsun. Şimdi o üç adımı cebine koyalım.

## CEBİNE KOY

Bugünkü bölümden cebine koyup hemen ofisinde uygulayacağın üç altın kuralımız var. 1. A1 hücresine sütun adı koy; sayfanın en üst sol köşesindeki birleşikleri çözerek ilk sütunun adını net biçimde buraya yaz. Çünkü model tablonun nereden başladığını A1 hücresinden okur. 2. Birleşikleri çöz, boş satırları sil; aradaki anlamsız boşlukları kaldırarak verinin akışını ve satır bütünlüğünü kesintisiz hale getir. Böylece satırlar kopmaz, özet bozulmaz. 3. Yapay zekâya yalın dille türleri tek tip yap; komutunda günlük konuşma diliyle tarihleri, metinleri ve sayıları tek bir format standardına toplamasını iste. Bu üç adımı uyguladığında veri gözünü korkutamaz; çünkü tablo artık konuşur.

## SIRA SENDE

Şimdi sıra sende! Hemen bugün bilgisayarını açtığında, masaüstünde duran ya da sana yakın zamanda gönderilmiş olan en düzensiz tablolardan birini seç. Copilot varsa şeritten doğrudan okut; yoksa dosyayı ataş ile yükle. Az önce öğrendiğimiz üç aşamalı yöntemi kelimesi kelimesine dene. A1 hücresinden başlayarak başlıkları hizala, gereksiz boşlukları ayıklat ve formatları tek bir düzene oturt. Kendi gözlerinle dönüşümün hızını gördüğünde, bu yöntemin ne kadar kalıcı bir alışkanlığa dönüştüğünü fark edeceksin.

Unutma, yapay zekâ senin yerine düşünmez ama senin yönlendirmelerinle ofisteki en güvenilir yardımcın olur. Veriyi düzenlemeyi öğrendiğin an, analiz yapmaya, rapor hazırlamaya ve stratejik kararlar almaya çok daha fazla vaktin kalacak. Bu pratiği gün içinde tekrarla; tablonun konuşmasına izin ver. Harika bir iş çıkardın, tabloyu temizleme refleksi artık cebinde. Bir sonraki derste bu tabloyu yüklemeden önce neyin sohbete gitmeyeceğini kilitleyeceğiz: KVKK ve maskeleme. Hazırsan 2. derste buluşalım.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Excel Copilot şeridi yoksa dosyayı olduğu gibi Gemini, ChatGPT veya Claude sohbetine ataşla. Neden? Çünkü lisanslı şerit zorunlu değildir; üç araç da A1 eşiğini ister. Şirket API’si varsa evdeki kuralı oraya taşı.

### Kenar durum / dikkat edilecek hata
A1’de logo, genel başlık veya birleşik hücre varsa model tabloyu başlıksız ızgara sanır. 2026 modelleri dağınık ızgarayı okuyabilir; yine de birleşik başlığı çözmeden formül isteme, çünkü A1 eşiği kurulmadan özet kayar. F2 ile metin kesme işaretini kontrol et. Orijinali silme; temiz kopyayı yan sayfada al.

### Yapılmaması gereken tuzak
Tüm sayfanın ekran görüntüsünü sohbete yapıştırmak 3. Kapı değildir; çünkü ekran görüntüsü hücreleri bozar ve ham müşteri adı ile telefonu aynı karede götürür. 3. Kapı yalnız maskeli kısa özettir. Bir sonraki derste bu sınırı kilitleyeceğiz.
`,
};
