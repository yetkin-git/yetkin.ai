import type { Section } from "../types";
import {
  ACADEMY_CHAT_MODEL_LIST,
  renderAcademyModelTendencyCardMarkdown,
} from "@/lib/academy/model-tendency-card";

export const section1: Section = {
  sectionNumber: 1,
  lessonKey: "01_office_ai-1",
  isPreviewAllowed: false,
  isLocked: true,
  title: "A1 Düzeni ve Temiz Veri: Düzensiz Excel → Düzenli Tablo",
  targetDurationMinutes: 11.5,
  estimatedWordCount: 1640,
  pedagogicalObjective:
    `Düzensiz Excel tablosunu A1 hücresinden başlayarak düzenli tabloya çevirmeyi göstermek. Neden A1? Çünkü model tablonun nereden başladığını oradan okur. Yükleme kimliği gizlenmiş örnek tablo üzerinden yapılır; maskeleme kuralı 2. derste kilitlenir. ${ACADEMY_CHAT_MODEL_LIST} ve şirket paneli (kurumsal model) farkını eğilim diliyle oturtmak.`,
  contentMarkdown: `
Her gün masanın üstünde biriken dosyalar, e-postalarla gelen karmakarışık listeler ve saatlerce içinden çıkamadığın Excel sayfaları... Bu dersin sonunda düzensiz Excel'i düzenli tabloya çevirmeyi tek başına yapacaksın. Sebebi şu: yapay zekâ, sen ona neyi nasıl vereceğini bilmeden o karmaşayı tek başına çözmez. Karmaşık bir veri yığını gördüğünde paniklemek yerine doğru istemi kurarsan, dakikalarca süren el işçiliği düşer. Şimdi arkana yaslan. Bu derste yapay zekâyı soru sorulan bir kutu gibi değil, masadaki asistanın gibi kullanmayı adım adım göstereceğiz.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ yolculuğunun ilk dersine hoş geldin! Bu seride seninle birlikte teorik ezberleri bir kenara bırakacak, ofiste her gün karşına çıkan gerçek problemleri yapay zekâ desteğiyle adım adım çözeceğiz. Bugün masandaki en büyük zaman tuzaklarından birini hedef alıyoruz: Açtığında gözünü korkutan, biçimleri birbirine girmiş o karmaşık tablolar. Hazırsan başlayalım; çünkü bu dersin sonunda o tabloyu A1 hücresinden başlayarak düzenlemeyi öğreneceksin ve kontrol sende kalacak.

Ofiste saatlerini alan o rutin işleri düşün. Bir rapordan kopyalanıp sana iletilen bir liste gelir ve senden acil bir analiz istenir. Ancak sayfayı açtığında hiçbir şey yerli yerinde değildir; sayılar sola yaslanmış, tarihler birbirine karışmıştır. Bu dersteki yükleme, kişi adı ve IBAN taşımayan kimliği gizlenmiş örnek tablo üzerinden yapılır. Bu örnek tabloyu ${ACADEMY_CHAT_MODEL_LIST} sohbetine ataş ile yüklersin; Copilot lisansın varsa Copilot düğmesinden doğrudan okutursun ya da şirket paneline verirsin. Şirket paneli, şirketinin kurumsal yapay zekâ modelidir: evdeki format ve gizlilik kuralı o panele yazılır. Bu araçlar büyük dil modelleridir (sohbet yapay zekâları); eğilimleri sürümden sürüme değişir. 2026 itibarıyla ChatGPT çoğu zaman hızlı taslak üretmeye, Claude uzun satırları dikkatle okumaya, Gemini adımları net sıralamaya yatkındır. Grok, Kimi, Muse Spark vb. de aynı kapıdandır. Hiçbiri sabit karakter değildir. Bu eğilim kartı Eylül 2026 tarihlidir; 6 ayda bir gözden geçirilir. Kod ezberlemen gerekmez. Neden? Çünkü bu işi çözen şey program yazmak değil; tabloyu doğru kapıdan, doğru sırayla vermektir. Hadi gel, bu dönüşümü adım adım başlatalım.

## DÜZENSİZ TABLO

Öncelikle karşılaştığımız sorunu netleştirelim. Çoğu zaman önümüze gelen dosya, üzerinde işlem yapmaya uygun olmayan bir ham veri yığınıdır. Birkaç satır boş bırakılmış, bazı başlıklar birleştirme alışkanlığı yüzünden kaymış ve metinler karmakarışık hale gelmiştir. Bu tür bir dağınık yapı gördüğünde genellikle tek tek hücreleri düzeltmeye çalışırsın, değil mi? Oysa bu yaklaşım saatleri yer. Peki neden tek tek hücre düzeltmek yetmez? Çünkü yapay zekâ hücre hücre değil, başlık ve sütun düzenini arar. Tablonun dilini biraz sadeleştirirsen, o karmaşayı bir çırpıda okur.

Peki, yapay zekâ bu dağınık sayfaya baktığında aslında ne görür? Sen orada bir müşteri listesi veya bütçe özeti görürken, o önce başlık ve sütun düzenini arar. 2026 modelleri dağınık ızgarayı da okuyabilir; A1 düzeni işi hızlandırır, hata riskini düşürür. Birbirine girmiş hücreler işi yavaşlatır, boş satırlar satır bütünlüğünü keser. Bu yüzden düzensiz tabloyu vermeden önce her verinin ait olduğu yer belli olmalı. Şimdi bu karmaşayı kökünden çözecek hamleye, A1 hücresine, odaklanalım.

## A1 HÜCRESİ

Şimdi mantığı oturtalım. Neden A1 hücresinden başlıyoruz? Çünkü bir tablonun okunması her zaman en sol üst köşeden kurulur. A1 hücresi boşsa ya da alakasız bir genel başlıkla birleştirilmişse, yapay zekâ tablonun nereden başladığını çözemez. Yapman gereken ilk şey, bu noktayı netleştirmektir. Sayfanın en tepesindeki birleştirilmiş başlıkları kaldırıp, A1 hücresine ilk gerçek sütun adını yazmalısın. Örneğin oraya 'Müşteri Adı' ya da 'Sipariş No' gibi net bir sütun başlığı yerleştirdiğinde, yapay zekâ tüm tabloyu doğru okumaya başlar.

Unutma, A1 hücresi doğru kurgulanmamış bir yapıya ne kadar gelişmiş bir istem yazarsan yaz, alacağın sonuç eksik kalacaktır. Çünkü yapay zekâ veriyi satır ve sütun düzenine göre okur. A1 hücresi doğru bir sütun adı taşıdığında, yanındaki diğer hücreler de otomatik olarak bir anlama kavuşur. 'Ürün', 'Tarih', 'Tutar' gibi başlıkların hepsi birinci satırda yan yana dizilmelidir. Böylece dakikalarca sürecek kafa karışıklığı baştan düşer ve veri isteme hazır hale gelir.

## TEMİZLE ŞİMDİ

Şimdi ikinci adıma geçiyoruz. Peki neden A1 kuralını kurmadan temizleme istemi yazmıyoruz? Çünkü hangi kapıya gidersen git, model önce tablonun nereden başladığını arar. ChatGPT taslağı çabuk gösterme eğilimindedir, Claude uzun dökümü tartmaya yatkındır, Gemini adımları sıraya dizme eğilimindedir; Grok, Kimi, Muse Spark vb. de aynı sohbet kapısındandır. Şirket paneli — kurumsal model — evdeki formatı kilitlemeye yatkındır. Karmaşık teknik ifadelere hiç girmeden, günlük konuşma diliyle durumu anlatacağız. Modele şunu söyleyebilirsin: 'Sana sunduğum bu ham veri içinde yer alan birleştirilmiş hücreleri tek tek ayır, aralardaki gereksiz boş satırları sil ve sayıları standart sayı formatına getir.' Gördüğün gibi istem günlük dille yazılıyor; model neyi ayıracağını, neyi sileceğini ve sayıyı nasıl standartlaştıracağını net duyuyor. Veri bir kez temizlenir; sonra hangi araca gideceğine sen karar verirsin. Şüpheli hücreye tıkla, klavyenin üstündeki F2 tuşuna bas (Mac'te Fn+F2) — hücre düzenleme açılır; kesme işaretini kontrol et. Her zaman orijinal dosyayı koruyup yan sayfada temiz kopyanı oluştur.

Peki bu veriyi yapay zekâya nasıl vereceksin? Önce üç adım vardır. Şirketinin onayladığı araç hangisi? Satırda kişisel veri veya şirket sırrı var mı? Ancak ondan sonra aktarım yolunu seçersin. Onaylı araçtaysa sıra şöyledir. 1) Copilot lisansın varsa Copilot düğmesinden doğrudan okutursun. 2) Yoksa dosyayı ataş simgesinden ${ACADEMY_CHAT_MODEL_LIST} sohbetine yüklersin. Copilot düğmesi varsa Excel dosyanın içindeki hücreleri doğrudan düzenler. Copilot'ın yoksa dosyayı ataşla sohbete yüklersin; yapay zekâ orijinal dosyanı değiştiremez, ancak sana verileri temizlenmiş yepyeni bir tablo verir. Sen de o tabloyu kopyalar, Excel'ine yapıştırırsın. Bu dersteki örnek kişi adı taşımayan temiz bir tahsilat tablosudur. Copilot varsa Copilot düğmesinden doğrudan okut; yoksa dosyayı ataş ile yükle. (Kişisel verileri maskeleme kuralını 2. derste kilitleyeceğiz.) 3) Son çare: isim ve telefonu maskeleyip kısa bir özeti yapıştırırsın. Ham tabloyu ekran görüntüsüyle taşımak öğretilen yol değildir; çünkü ekran görüntüsü hücreleri bozar ve A1 kuralını kaybettirir.

Bu aşamada tür karmaşasını ortadan kaldırmak da hayati bir adımdır. Neden? Çünkü aynı sütunun içinde hem '1.200 TL' yazar, hem sadece '1200', hem de metin şeklinde girilmiş 'bin iki yüz' durursa model hangisinin tutar olduğunu karıştırır. Yapay zekâya 'Tutar sütunundaki tüm değerleri yalnızca sayı olacak şekilde tek tip yap' dediğinde, tüm bu farklılıklar tek bir standarda oturur. Fazladan boşlukları temizler, tarihleri gün-ay-yıl düzenine sokar. Aynı sütun tek tipe inince dağınık yapı düzenli tabloya döner.

## FARK ORTADA

Ekranın ikiye bölünmüş haline dikkatle bak. Sol tarafta düzenlemesiz ham veri duruyor: Birleştirilmiş başlıklar, arada sırıtan boş satırlar ve birbirini tutmayan yazı tipleri. Sağ tarafta ise yapay zekâ ile temizlenmiş düzenli tablo yer alıyor. Fark bu kadar belirgin. Sol taraf karmaşadır ve yanlışa açıktır; sağ taraf hemen bir özet çıkarmaya veya analize girmeye hazırdır. Doğru yönlendirilen yapay zekâ masanda tam olarak bunu yapar: dağınığı okunur hale getirir.

Gördüğün gibi sağ tablo, soldaki dağınık tabloya A1 kuralını ve tek tip sütunu uygulayınca çıkar. Sol taraftaki görüntü sana daha önce saatler kaybettirmiş olabilir; formüllerin hata vermesine, grafiklerin yanlış çıkmasına yol açmış olabilir. Sağdaki düzenli tablo ise şirketinde herkesin tek bakışta anlayacağı düzenli bir çalışma sunar. Dağınık dosya geldiğinde önce A1 kuralını kurarsın. Şimdi üç adımı cebine koyalım.

## CEBİNE KOY

Bugünkü bölümden cebine koyup hemen ofisinde uygulayacağın üç adımımız var. 1. A1 hücresine sütun adı koy; sayfanın en üst sol köşesindeki birleşikleri çözerek ilk sütunun adını net biçimde buraya yaz. Çünkü model tablonun nereden başladığını A1 hücresinden okur. 2. Birleşikleri çöz, boş satırları sil; aradaki anlamsız boşlukları kaldırarak verinin akışını ve satır bütünlüğünü kesintisiz hale getir. Böylece satırlar kopmaz, özet bozulmaz. 3. Yapay zekâya yalın dille türleri tek tip yap; isteminde günlük konuşma diliyle tarihleri, metinleri ve sayıları tek bir format standardına toplamasını iste. Bu üç adımı uyguladığında veri gözünü korkutamaz; çünkü tablo artık düzenli okunur.

## SIRA SENDE

Şimdi sıra sende! Hemen bugün bu dersteki kimliği gizlenmiş örnek tablolardan birini seç. Gerçek müşteri adı veya IBAN taşıyan dosyayı henüz yükleme. Copilot varsa Copilot düğmesinden doğrudan okut; yoksa dosyayı ataş ile yükle. (Kişisel verileri maskeleme kuralını 2. derste kilitleyeceğiz.) Az önce öğrendiğimiz üç adımı aynen dene. A1 hücresinden başlayarak başlıkları hizala, gereksiz boşlukları ayıklat ve formatları tek bir düzene oturt. Kendi gözlerinle dönüşümün hızını gördüğünde, bu yöntemin ne kadar kalıcı bir alışkanlığa dönüştüğünü fark edeceksin.

Yapay zekâ senin yerine karar vermez. Sen A1 kuralını kurar, istemi yazarsın. Temiz tablo durunca özet ve rapora vaktin kalır. Bu pratiği gün içinde tekrarla; tabloyu temizleme refleksi artık cebinde. Bir sonraki derste bu tabloyu yüklemeden önce neyin sohbete gitmeyeceğini kilitleyeceğiz: KVKK ve maskeleme. Hazırsan 2. derste buluşalım.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Excel Copilot düğmesi yoksa bu dersteki kimliği gizlenmiş örnek tabloyu ${ACADEMY_CHAT_MODEL_LIST} sohbetine ataşla. Copilot düğmesi varsa Excel dosyanın içindeki hücreleri doğrudan düzenler. Copilot'ın yoksa dosyayı ataşla sohbete yüklersin; yapay zekâ orijinal dosyanı değiştiremez, ancak sana verileri temizlenmiş yepyeni bir tablo verir. Sen de o tabloyu kopyalar, Excel'ine yapıştırırsın. Gerçek müşteri satırını henüz yükleme; kişisel verileri maskeleme kuralını 2. derste kilitleyeceğiz. Neden? Çünkü Copilot düğmesi zorunlu değildir; bu sohbet yapay zekâları da A1 kuralını ister. Şirket paneli varsa evdeki kuralı oraya taşı.

### Kenar durum / dikkat edilecek hata
A1’de logo, genel başlık veya birleşik hücre varsa model tabloyu başlıksız ızgara sanır. 2026 modelleri dağınık ızgarayı okuyabilir; yine de birleşik başlığı çözmeden formül isteme, çünkü A1 kuralı kurulmadan özet kayar. F2 ile metin kesme işaretini kontrol et. Orijinali silme; temiz kopyayı yan sayfada al.

### Yapılmaması gereken tuzak
Tüm sayfanın ekran görüntüsünü sohbete yapıştırmak 3. Kapı değildir; çünkü ekran görüntüsü hücreleri bozar ve ham müşteri adı ile telefonu aynı karede götürür. 3. Kapı yalnız maskeli kısa özettir. Bir sonraki derste bu sınırı kilitleyeceğiz.

### Model eğilim kartı (canlı kutu)
Sesli dersteki eğilim cümleleri Eylül 2026 anlık görüntüsüdür; yaşayan kaynak aşağıdaki kutudur. Kutu makalede güncellenir; sesi yeniden kaydetmeye gerek yoktur.

${renderAcademyModelTendencyCardMarkdown()}
`,
};
