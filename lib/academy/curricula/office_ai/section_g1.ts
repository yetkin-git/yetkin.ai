import type { Section } from "../types";

export const sectionG1: Section = {
  sectionNumber: 6,
  lessonKey: "01_office_ai-g1",
  isPreviewAllowed: false,
  isLocked: true,
  title: "E-Posta Akışı: Gmail / Outlook ve Aksiyon Listesi",
  targetDurationMinutes: 10.1,
  estimatedWordCount: 1301,
  pedagogicalObjective:
    "İlk iki dakika etiket, taslak, insan onayı ve arşiv. Ardından gelen kutuyu şirketin onayladığı panelde yerinde aksiyon listesine dökmek. Onaylı araç yoksa kutuyu kişisel Gmail'e taşıma; maskeli kısa özet yaz. Kopyalanan metin tarihi, göndereni ve bağlamı kaybeder. Aksiyon listesinde kim, ne, ne zaman kilitlenir.",
  contentMarkdown: `
Hata avında rapordaki uydurma sayıyı yakaladın. Bu dersin sonunda gelen kutunu etiket, taslak, insan onayı ve arşivle sıfırlayıp aynı işi Gmail veya Outlook yerleşik panelinde aksiyon listesine dökmeyi tek başına yapacaksın. Peki neden ritüel ayrı ders değil de bu dersin ilk iki dakikası? Çünkü panel, ritüel yoksa aynı yığını daha hızlı açar. Peki e-postayı kopyalayıp harici sohbet ekranına yapıştırmak neden yanlıştır? Çünkü metni kopyaladığında e-postanın tarihi, göndereni ve bağlamı kopar; yapay zekâ konuyu tam anlayamaz. Önce dört adım, sonra canlı kutu. Çıktın aksiyon listesidir: kim, ne, ne zaman.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin altıncı dersine hoş geldin. Bugün E-Posta Akışı: Gmail, Outlook ve aksiyon listesi. İlk iki dakika ritüeldir; ardından panel açılır. Peki neden gelen kutusu şişer? Çünkü her yeni satır aynı yığında durur; ödeme, bülten ve davet birbirine girer. Peki neden kopyala-yapıştır varsayılan yol değildir? Çünkü ileti gövdesi dış sohbete gidince kutu senden kopar. Gelen kutusu yerinde kalır. İnsan onayından önce taslak gitmez.

Peki e-posta triyajı nedir? İletiyi açmadan önce acil, aksiyon veya arşivlik diye ayırmaktır. Acil, bugün para veya imza isteyen satırdır. Aksiyon, bu hafta cevap bekleyen satırdır. Arşivlik, okuyup kapatacağın satırdır: dekont, bülten, bilgi. Üç etiket yeter. Peki yapay zekâya neden taslak yanıt yazdırılır? Çünkü model nezaket üretir, taahhüt üretemez. Tarihi, teslimat sözünü ve fiyatı sen belirlersin. Peki taslak insan onayı verilmeden neden gönderilmez? Çünkü yanlış tarih veya yanlış vaat şirketi bağlar. Taslak onaylanmadan gönderilmez. İş biten satır arşive iner. Arşiv silmek değildir; eski yazışma durur. Ritüel bu kadar. Şimdi aynı dört adımı canlı kutuda basıyoruz.

Bu derste iki kutu vardır. Gmail kolunda Gemini paneli, Outlook kolunda Copilot şeridi durur. Sebebi şu: kutu değişir, iş değişmez: ödeme, onay ve acil aksiyon her iki kutuda da aynı üç soruyu ister. Kim gönderdi, iş nedir, son tarih ne zaman. Panelin adı değişir; tablonun sütunları değişmez. Bugün Gmail kolunu göreceksin; Outlook kolu aynı cümleyle çalışır. Şirketin onayladığı panel yoksa rutin değişmez: maskeli kısa özet yazarsın. İş postasını kişisel hesaba taşımazsın.

Sabah gelen kutusunu açtığında acil olanla rutin olanı nasıl ayırırsın? Ödeme, onay, acil aksiyon, banka dekontu ve bülten aynı yığında durur. Tek tek açmak günü yer. Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir? Çünkü gönderen yoksa tahsilat kime bağlanır; iş yoksa bülten ödeme gibi durur; son tarih yoksa Kaya Gıda’nın bugünü kaybolur. Kaya Gıda 54.650 TL ödeme onayı istiyor; yanıtı hemen yazıp konuyu kapat. Asıl kapı Gmail’in yanındaki Gemini paneli ve Outlook’taki Copilot şerididir. Çıktı aksiyon tablosudur: Gönderen | İş | Son tarih | Taslak yanıt notu.

Tablonun dört sütunu işi ayırır. Gönderen işin sahibini yazar, iş talebi yazar, son tarih günü kilitler, taslak yanıt notu ilk cümleyi yazar. Dördüncü sütun nottur, metin değildir: not kontrol ister; metin gönder ister. Kaya Gıda satırında tahsilat kırmızı durur; bülten satırında arşivlik yeşil durur.

## KUTUYU DIŞARI TAŞIMAK

Kutuyu dışarı taşımak, şirketin onayladığı panel dururken iletiyi seçip dış sohbete yapıştırmaktır. Peki neden bu atlanmış yoldur, yasak listesi değil? Çünkü gelen kutusu kopuk kalır. Etiket oluşmaz. Bütün kutuyu ekran görüntüsüyle taşımak maskeli kısa özet değildir. Son çare maskeli, kısa özettir. İş postasını kişisel Gmail'e taşımak da bu yol değildir.

Üç kopukluğu ayrı ayrı gör. Etiket dış sohbette basılmaz; kutuya dönünce yığın aynıdır. Arşiv dışarıda oluşmaz; ileti kutuda okunmamış durur. Taslak kutudaki iletiye bağlanmaz; zincir kırılır. Bu, maskeli kısa özet sayılmaz. Son çare maskeli, dört-altı satırlık kısa özettir. Bütün gelen kutusu bu özet değildir.

## GEMİNİ AÇ

Peki Gemini yan paneli neden bir tıklama adımı değil de kutunun içindeki araçtır? Çünkü yerleşik yapay zekâ kutunun içinde durur. Gmail açıkken model gelen kutunu okur ve eylem çıkarır; iletiyi dışarı taşımana gerek kalmaz. ChatGPT penceresine yapıştırınca etiket, arşiv ve taslak dışarıda kalır. İstemi oraya yazıyorsun çünkü kutu yerinde kalsın. İstem kutusunda duran istem tam olarak bu:

Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme.

İstemi Gemini paneline yazarsın veya ekrandaki istemi aynı panele taşırsın. ChatGPT’ye kopyalamazsın: model kutunun içinde tararsa tablo orada çıkar; kopyalarsan kutu yerinde kalmaz. Aynı cümleyi Outlook Copilot’a da verebilirsin. Şirketinin onayladığı araç yoksa kutuyu dışarı taşıma. Maskeli kısa özet yaz: gönderen yerine Kod A, konu ve tek cümle talep, IBAN yok.

Peki neden kapsam son 24 saattir? Çünkü eski ileti bugünün işi değildir; dünün bülteni bugünün tahsilatını örter. Tabloyu okuduğunda tarihi sen kilitlersin: model sıralar, sen karar verirsin. Hiçbir taslağı gönderme cümlesi istemin sigortasıdır. Arşivlik satır Gmail’de kalır; kutu dışarı çıkmadan iş biter. Outlook kolunda aynı gerekçe Copilot şeridinde durur.

## YERLEŞİK YOL

Şimdi ekranı ikiye böldüğünde fark, iş postasının gelen kutusunda kalıp kalmamasındadır. Sol tarafta gelen kutusundan kopuk yapıştırma vardır: kopyalanmış iletiler, Ctrl+C, dış sohbet. Sağ tarafta gelen kutusu içi, yerleşik Gemini paneli var. Ödeme ve onay ayrı, arşivlik ayrı. Gelen kutusu yerinde kalır. Lisans yoksa sağ rozet dürüstçe yazar: canlı kutu okunmaz.

Sol ekranı satır satır oku: kopyalanmış gövde durur, etiket doğmaz, arşiv doğmaz. Sağ ekranı sütun sütun oku: ödeme kırmızı, onay sarı, arşivlik yeşil durur. Sağ ekran sakin durur, çünkü yerleşik panel kutuyu tarar; kopyala-yapıştır kutuyu terk eder. Onaylı panel yoksa rozet yalan yazmaz. İş postasını kişisel Gmail’e taşımazsın.

## FARK ORTADA

Sol ekran seni yorar. Sağ ekran kutunun içinde kalır. Peki neden fark bu kadar belirgin? Çünkü yerleşik panel kutuyu senden koparmaz; kopyala-yapıştır koparır. Fark bir yazılım tıklaması değildir. Fark, şirketin onayladığı araçta kutuyu yerinde okumaktır. Outlook’ta Copilot, Gmail’de Gemini, ikisi de yoksa maskeli kısa özet. Hiçbir taslak, sen onaylamadan gitmez.

Farkı üç renkte ölç. Kırmızı bugün ödeme bekleyen satırdır. Sarı bugün imza bekleyen satırdır. Yeşil arşivlik satırdır. Renk yoksa her satır acil gibi durur. Renk varsa göz önce kırmızıya gider. Fark, kutuyu dışarı taşıyıp taşımamandır.

## CEBİNE KOY

Bu dersten cebine üç kural koy. Bir: kutuyu yerinde oku. Çünkü şirketin onayladığı panel kutunun içindedir; Gmail’de Gemini, Outlook’ta Copilot. Onaylı panel dururken kopyala-yapıştır atlanmış yoldur. İki: kim, ne, ne zaman kilitlensin. Çünkü gönderen, iş ve son tarih yoksa tahsilat bültenin altında kaybolur. Dördüncü sütun taslak notudur; gönder tuşu değildir. Üç: insan onayından önce gönderme. Çünkü model nezaket üretir, taahhüt üretemez. Taslak notu «şu cümleyi kontrol et» demektir; «onayla ve gönder» demek değildir.

## SIRA SENDE

Sıra sende. Sabah kutunu açtığında acil olanla rutini ayır: Gemini paneli kutunun içinde dursun, ileti dışarı çıkmasın. Son 24 saatten üç satırlık aksiyon listesi yeter: gönderen, iş, son tarih. Ödeme, onay ve acil aksiyonu tabloya çek; dekont ve bülteni Arşivlik yaz. Outlook’un varsa aynı istemi Copilot şeridine ver. Şirket içi onaylı araç yoksa kutuyu kişisel Gmail’e taşıma; maskeli kısa özet yaz. Hiçbir taslağı gönderme; taslak notunu oku ve tarihi kilitle. Sonra Word tarafında uzun belgeyi ataş ile yüklemeyi göreceksin.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Outlook Copilot yoksa iş postasını kişisel Gmail’e taşıma. Şirket içi onaylı araç yoksa maskeli kısa özet yaz. Gönderen adı maskeli, konu + tek cümle talep, IBAN yok. Canlı kutu okunmuyorsa rozet yalan yazmaz. Kapsamı dar tut: son 24 saat, üç-beş satırlık tablo, dört-altı satırlık özet. Otuz iletiyi parça parça taşımak maskeli kısa özet değildir. Ctrl+C ile bütün gövdeyi dışarı dökmek de değildir.

### Kenar durum / dikkat edilecek hata
Son 24 saat filtresi toplantı davetini «acil ödeme» sanabilir. Taslak yanıt notu, gönder tuşu değildir. İkinci kenar: kişisel veri içeren ileti gövdesini panele olduğu gibi bırakmak. KVKK kuralı kutuda da durur. IBAN, kimlik ve maaş satırı maskelenir; konu ve talep açık yazılır. Üçüncü kenar: bülteni ödeme boyamak. Model her «fatura» kelimesini kırmızıya boyar; sen tutar ve vade tarihini kilitle.

### Yapılmaması gereken tuzak
Ritüeli atlayıp doğrudan panele yazmak. Etiket, taslak, insan onayı ve arşiv bu dersin ilk iki dakikasıdır; panel ondan sonra açılır. İkinci tuzak: kopyalanmış satırları ChatGPT’ye yapıştırıp «sıfır kutu» sanmak. İletiyi dış sohbete yapıştırırsan etiket, arşiv ve taslak kutuda oluşmaz. Üçüncü tuzak: taslak notunu gönderilmiş saymak. Not taslaktır; gönder tuşu sendedir. Dördüncü tuzak: arşivlik satırı silmek. Dekont arşivlenir; denetimde aranır.
`,
};
