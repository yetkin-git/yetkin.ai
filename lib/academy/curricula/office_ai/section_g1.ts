import type { Section } from "../types";

export const sectionG1: Section = {
  sectionNumber: 7,
  lessonKey: "01_office_ai-g1",
  title: "Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi",
  targetDurationMinutes: 7.5,
  estimatedWordCount: 1048,
  pedagogicalObjective:
    "Gelen kutusunu Gmail Gemini (1. Kapı) ve Outlook Copilot ile aynı rutinle yönetmeyi göstermek. Neden ChatGPT’ye kopyalamak yerine yerleşik panel? Çünkü kopyalanan gövde kutudan kopar; etiket, arşiv ve taslak orada oluşmaz. Aksiyon listesinde kim, ne, ne zaman neden kilitlenir? Gönderen, iş ve son tarih yoksa tahsilat bültenin altında kaybolur. İleti gövdesini dış sohbete taşımak varsayılan yol değildir.",
  contentMarkdown: `
6. derste Outlook masasında etiket, taslak, insan onayı ve arşivi gördün. Ders 6'da etiketi öğrendin; bugün aynı işi tabloya döküyorsun. Bu dersin sonunda Gmail veya Outlook'ta yerleşik panelle aksiyon listesini tek başına yapacaksın. Peki neden hâlâ iletiyi ChatGPT’ye kopyalıyorsun? Çünkü kopyalanan gövde kutudan kopar; etiket orada basılmaz. Asıl kapı Gmail’de Gemini, Outlook’ta Copilot. Çıktın aksiyon listesidir: kim, ne, ne zaman.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin e-posta kapısı dersine hoş geldin. Bugün e-postanı Gmail’in içinden Gemini ile, Outlook’ta Copilot ile yöneteceksin. Peki neden kopyala-yapıştır varsayılan yol değildir? Çünkü ileti gövdesi dış sohbete gidince kutu senden kopar. Gelen kutusu yerinde kalır. İnsan onayından önce taslak gitmez.

Bu ders çift kapılıdır. Gmail kolunda Gemini paneli, Outlook kolunda Copilot şeridi durur. Sebebi şu: kutu değişir, iş değişmez: ödeme, onay ve acil aksiyon her iki kutuda da aynı üç soruyu ister. Kim gönderdi, iş nedir, son tarih ne zaman. Panelin adı değişir; tablonun sütunları değişmez. Bugün Gmail kolunu açacaksın; Outlook kolu aynı cümleyle çalışır. Lisans yoksa kapı değişir, rutin değişmez.

Sabah kutun şişer. Ödeme, onay, acil aksiyon, banka dekontu ve bülten aynı yığında durur. Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir? Çünkü gönderen yoksa tahsilat kime bağlanır; iş yoksa bülten ödeme gibi durur; son tarih yoksa Kaya Gıda’nın bugünü kaybolur. Kaya Gıda 54.650 ister; bugün kapat. Asıl kapı Gmail’in yanındaki Gemini paneli ve Outlook’taki Copilot şerididir. Çıktı aksiyon tablosudur: Gönderen | İş | Son tarih | Taslak yanıt notu.

Tablonun dört sütununu ezberle. Gönderen işin sahibini yazar, iş talebi yazar, son tarih günü kilitler, taslak yanıt notu ilk cümleyi yazar. Dördüncü sütun nottur, metin değildir: not kontrol ister; metin gönder ister. Kaya Gıda satırında tahsilat kırmızı durur; bülten satırında arşivlik yeşil durur.

## TAŞIMA SU

Taşıma su, birinci ve ikinci kapı dururken iletiyi seçip dış sohbete yapıştırmaktır. Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü gelen kutusu kopuk kalır. Etiket oluşmaz. Bütün kutuyu ekran görüntüsüyle taşımak üçüncü kapı değildir. Üçüncü kapı maskeli, kısa özettir.

Üç kopukluğu ayrı ayrı gör. Etiket dış sohbette basılmaz; kutuya dönünce yığın aynıdır. Arşiv dışarıda oluşmaz; ileti kutuda okunmamış durur. Taslak kutudaki iletiye bağlanmaz; zincir kırılır. Üçüncü kapı bu sayılmaz. Üçüncü kapı son çaredir: maskeli, dört-altı satırlık kısa özet. Bütün gelen kutusu üçüncü kapı değildir.

## GEMİNİ AÇ

Şimdi Gmail’i aç. Sağdaki Gemini panelini aç. Peki neden ChatGPT penceresi değil de bu yerleşik panel? Çünkü paneli açık tutunca kutu yerinde kalır; ChatGPT’ye yapıştırınca etiket, arşiv ve taslak dışarıda kalır. İstemi oraya yazıyorsun. İstem kutusunda duran istem tam olarak bu:

Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme.

İstemi Gemini paneline yazarsın veya ekrandaki istemi aynı panele taşırsın. ChatGPT’ye kopyalamazsın: model kutunun içinde tararsa tablo orada çıkar; kopyalarsan kutu yerinde kalmaz. Aynı cümleyi Outlook Copilot’a da verebilirsin. Copilot yoksa Gmail’e geçersin.

Adım adım ilerle. Paneli aç, kapsamı son 24 saat yaz, tabloyu oku, tarihi kilitle, Arşivlikleri Gmail'de etiketle. 24 saat yeter. Eski ileti bugünün işi değildir. Hiçbir taslağı gönderme cümlesi istemin sigortasıdır; model sıralar, sen kilitlersin. Outlook kolunda aynı adımlar Copilot şeridinde yürür.

## YERLEŞİK YOL

Şimdi ekranı ikiye böl. Sol tarafta gelen kutusundan kopuk taşıma su yöntemi var: kopyalanmış iletiler, Ctrl+C, dış sohbet. Sağ tarafta gelen kutusu içi, yerleşik Gemini paneli var. Ödeme ve onay ayrı, arşivlik ayrı. Kutu yerinde. Lisans yoksa sağ rozet dürüstçe yazar: canlı kutu okunmaz.

Sol ekranı satır satır oku: kopyalanmış gövde durur, etiket doğmaz, arşiv doğmaz. Sağ ekranı sütun sütun oku: ödeme kırmızı, onay sarı, arşivlik yeşil durur. Sağ ekran sakin durur, çünkü yerleşik panel kutuyu tarar; kopyala-yapıştır kutuyu terk eder. Lisans yoksa rozet yalan yazmaz; Gmail kolunda kalırsın.

## FARK ORTADA

Sol ekran seni yorar. Sağ ekran Gmail’de kalır. Peki neden fark bu kadar belirgin? Çünkü yerleşik panel kutuyu senden koparmaz; kopyala-yapıştır koparır. Outlook’ta Copilot, Gmail’de Gemini, Word ve Excel’de doğrudan dosya yükleme. Eşleşme kilitlidir. Hiçbir taslak, sen onaylamadan gitmez.

Farkı üç renkte ölç. Kırmızı bugünün parasıdır, sarı bugünün imzasıdır, yeşil gürültüdür. Renk karar aracıdır: renk yoksa her satır acil gibi durur; renk varsa göz önce kırmızıya gider. Fark süre değildir; fark kapıdır.

## CEBİNE KOY

Bu dersten cebine üç adım koy. Bir: yerleşik paneli aç. Çünkü birinci ve ikinci kapı dururken kopyala-yapıştır atlanmış kapıdır. Gmail’de Gemini, Outlook’ta Copilot; kutu değişir, rutin değişmez. İki: aksiyon tablosu iste. Kim, ne, ne zaman. Çünkü gönderen, iş ve son tarih kilitlenmezse tahsilat bültenin altında kaybolur. Dördüncü sütun taslak notudur; gönder tuşu değildir. Üç: insan onayından önce gönderme. Çünkü model nezaket üretir, taahhüt üretemez. Taslak notu «şu cümleyi kontrol et» demektir; «onayla ve gönder» demek değildir.

## SIRA SENDE

Sıra sende. Kendi Gmail’ini aç. Son 24 saati Gemini ile süz. Üç satırlık aksiyon listesi çıkar: gönderen, iş, son tarih. Ödeme, onay ve acil aksiyonu tabloya çek; dekont ve bülteni Arşivlik yaz. Outlook’un varsa aynı istemi Copilot şeridine ver; lisans yoksa Gmail’de kal. Hiçbir taslağı gönderme; taslak notunu oku ve tarihi kilitle. Sonra Word tarafında uzun belgeyi ataş ile yüklemeyi göreceksin. Sınav henüz kapalıdır. Kapanış dersi Haftalık Sistem’dir; o 9. ders bitince kapı açılır. Sınav, 9. ders bitince açılır. Baraj 70 puandır.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Outlook Copilot yoksa Gmail Gemini’ye geç. Gemini paneli de yoksa birinci ve ikinci kapı dururken dış sohbete düşme. Üçüncü kapı: gönderen adı maskeli, konu + tek cümle talep, IBAN yok. Canlı kutu okunmuyorsa rozet yalan yazmaz. Kapsamı dar tut: son 24 saat, üç-beş satırlık tablo, dört-altı satırlık özet. Otuz iletiyi parça parça taşımak üçüncü kapı değildir. Ctrl+C ile bütün gövdeyi dışarı dökmek de değildir.

### Kenar durum / dikkat edilecek hata
Son 24 saat filtresi toplantı davetini «acil ödeme» sanabilir. Taslak yanıt notu, gönder tuşu değildir. İkinci kenar: kişisel veri içeren ileti gövdesini panele olduğu gibi bırakmak. KVKK kuralı kutuda da durur. IBAN, kimlik ve maaş satırı maskelenir; konu ve talep açık yazılır. Üçüncü kenar: bülteni ödeme boyamak. Model her «fatura» kelimesini kırmızıya boyar; sen tutar ve vade tarihini kilitle.

### Yapılmaması gereken tuzak
Ritüel dersini (etiket-taslak-onay-arşiv) bu kapı dersiyle karıştırmak. Orası alışkanlık, burası panel. İkinci tuzak: kopyalanmış satırları ChatGPT’ye yapıştırıp «sıfır kutu» sanmak. Kutu yerinde kalmazsa iş yerinde kalmaz. Üçüncü tuzak: taslak notunu gönderilmiş saymak. Not taslaktır; gönder tuşu sendedir. Dördüncü tuzak: arşivlik satırı silmek. Dekont arşivlenir; denetimde aranır.
`,
};
