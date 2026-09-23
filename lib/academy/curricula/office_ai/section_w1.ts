import type { Section } from "../types";

export const sectionW1: Section = {
  sectionNumber: 7,
  lessonKey: "01_office_ai-w1",
  title: "Word ve Uzun Belge İncelemesi: Sözleşme, Dilekçe, Rapor",
  targetDurationMinutes: 9.4,
  estimatedWordCount: 1168,
  pedagogicalObjective:
    "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Neden uzun belgeyi satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza, fesih ve gizlilik ayrı sayfalarda kalır. Resmî belgede neden öğretmen SEN, belge SIZ? Çünkü kulağa SEN gider, kâğıda SIZ yazılır. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın.",
  contentMarkdown: `
Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza oranı sayfa dörtte, fesih sayfa on birde kalır. Gizlilik sayfa on sekizdedir. Bu dersin sonunda sözleşmeyi ataş ile yükleyip riskli maddeyi çıkarmayı tek başına yapacaksın. Bugün dosyayı olduğu gibi yüklüyorsun. Word Copilot varsa şeritten okutursun. Yoksa Word belgesini doğrudan Gemini sohbetine yüklersin. Yapay zekâ imzalamaz. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın.

Selamlar, ben Gözde. Word ve uzun belge incelemesi dersine hoş geldin. Dün e-postada aksiyon listesi aldın; bugün üç işi dosya yükleyerek çözüyorsun. Peki Word dosyasını parça parça kopyalamak neden doğru bir yöntem değildir? Çünkü metni parça parça kopyaladığında belgenin bütünlüğü bozulur; en doğrusu Word dosyasını doğrudan yüklemektir. Tüm belgeyi kopyalamakla uğraşmazsın; dosyayı doğrudan yüklersin. İncelemek istediğin belirli bir paragraf varsa, onu istemine ekleyip doğrudan o bölümü sorabilirsin. Bugün üç iş: tedarik sözleşmesi, resmî dilekçe, kısa rapor. Hepsi aynı yöntemle yapılır: ataş ile yükleme.

Üç işi baştan haritala. Birinci iş sözleşmedir: riskli madde avı. İkinci iş dilekçedir: hitap ve talep düzeni. Üçüncü iş rapordur: saha notundan durum raporu. Üç iş tek yöntemle açılır: dosya bütün hâliyle modele gidince yöntem değişmez; yalnızca istem değişir. Üç iş, üç istem, tek ataş yöntemi.

Önünde bir tedarik sözleşmesi durur. Cezai şart, fesih ve gizlilik üç ayrı yerde gizlenir. Peki neden otuz sayfayı satır satır okutmak yerine bu üç maddeyi aratırız? Çünkü şirket aleyhine olan yer orasıdır. Asıl yöntem ataş ile yüklemektir. Word Copilot varsa şeritten okut. Yoksa Gemini sohbetine Word belgesi yüklersin.

## PARÇA PARÇA

Tek tek kopyalama şudur: sayfa dördü kopyala, yapıştır, sayfa on biri kopyala, yine yapıştır. Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü model yarım cümle görür; ceza oranını kaçırır. Otuz sayfayı parça parça taşımak üçüncü kapı değildir. Üçüncü kapı son çaredir: tek paragraf, maskeli kısa yapıştırma. Bu yolu önermiyoruz.

Parça parça kopyalarsan önemli maddeleri atlarsın. Örneğin 4. sayfadaki ceza şartını alıp 11. sayfadaki süreyi unuttuğunda analiz eksik kalır. Dilekçeden sadece bir paragraf kopyalarsan, resmi kurum adı ve talep kısmı dışarıda kaldığı için yapay zekâ dilekçeyi tam yorumlayamaz. Raporda kayıp ayrımdır: gözlem ile karar notu karışır. Parça parça taşımak üçüncü kapı sayılmaz. Üçüncü kapı tek paragraftır: isim yok, hesap yok. Dosya bütün hâliyle yüklenir.

Sayfa dördü alıp sayfa on biri unutmak işi bitirmez. Model yarım görür, sen tam sanırsın. Ataş bu kopukluğu kapatır: dosya bütün gider, madde listesi sayfa numarasıyla döner.

## ATAŞ YÜKLE

Şimdi sözleşmeyi yükle. Dosya adını pratikte kendi dosyanla değiştir. İstemi istem kutusuna yazıyorsun:

Yüklediğim sözleşme dosyasını (Word belgesi) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.

İstem dosyanın bütününe gider. Tüm metni taşımazsın: istem ataşa gider; satır satır kopya dosyayı koparır.

Adım adım ilerle. Birinci adım dosyadır: Word belgesini ataş simgesinden yükle. İkinci adım istemdir: cezai şart, fesih ve gizliliği sor; sayfa numarası iste. Sayfa numarası istersin: numarasız madde denetlenemez. Üçüncü adım kontroldür: listeyi dosyada aç, madde gerçekten orada mı bak. Uydurma madde görürsen sil.

## TEK DOSYAYLA ANALİZ

İkinci iş dilekçedir. Hitap, konu, üç cümlelik gerekçe, açık talep, ek listesi. Model taslak yazar. Tarih, sayı, unvan ve imza senindir. Kanun maddesi uydurursa silersin. Peki resmî belge yazılırken neden öğretmen SEN, belge SIZ çift sicili durur? Çünkü kulağına SEN derim; kâğıda SIZ yazılır. Öğretmen SEN, belge SIZ. Hitap örneği: «Sayın Yetkili, 12 Mart 2026 tarihli başvurumuzun sonucunun yazılı olarak tarafımıza iletilmesini arz ederiz.» Unvan, tarih, sayı ve imza boş kalır. Model sen diye dilekçe yazarsa o taslağı resmî SIZ’a çevirirsin. Öğretmen sıcak konuşur; belge resmî durur.

Dilekçenin beş satırını ayrı ayrı kur. Hitap makama seslenir, konu işi özetler, gerekçe üç cümledir, talep açık yazar, ek listesi dosyayı kapatır. Beş satır ayrı durur. Hitap yoksa evrak makamsız kalır; gerekçe uzun olursa talep kaybolur. Tarih, sayı ve imza satırını boş bırak; kalemi sen tut.

Üçüncü iş rapordur. Dağınık saha notundan bir sayfalık durum raporu: başlık, üç madde, bir sonraki adım. Peki neden gözlem ile karar notunu karıştırmazsın? Çünkü gözlem tabloyu özetler; karar notu onay ister. Çıkarılan özeti raporunda kullanırsın; son kontrolü ve kararı sen verirsin. Üç iş, üç istem, tek yöntem: ataş.

Raporun anatomisini bil: başlık, üç madde, sonraki adım. Gözlem ile karar notu aynı cümlede durmaz. Dosyanın tamamını yüklediğinde yapay zekâ ceza şartını, uzatım süresini ve rapor maddelerini tek seferde eksiksiz analiz eder. Hata yapmamak için kural basittir: Önce Word dosyanı yükle, altına da ne istediğini açıkça yaz.

## FARK ORTADA

Sol ekran kopuk parçadır. Sağ ekran tam dosyadır. Peki neden fark bu kadar belirgin? Çünkü ataş dosyayı senden koparmaz; satır satır kopya koparır. Üç kart: cezai şart, dilekçe hitabı, rapor maddesi. Outlook Copilot ister, Gmail Gemini ister, Word ve Excel ataş ister. Bu eşleşme sabittir. Karttaki %15 örnektir; kendi oranını dosyandan oku.

Parça parça yapıştırmak zaman kaybettirir ve detayları kaçırır; dosyayı tek parçada yüklemek ise sana saniyeler içinde tam analiz verir. Sağ ekranı kart kart oku: cezai şart sayfa numarasıyla durur, dilekçe hitabı SIZ durur, rapor üç maddeye iner. Sağ ekran güven verir: dosya bütün gitmiştir; madde listesi denetlenebilir.

## CEBİNE KOY

Cebine üç adım koy. Birincisi: dosyayı yükle. Çünkü satır satır okutmak riskli maddeyi kaçırır. Sözleşme, dilekçe veya rapor fark etmez; yöntem ataştır. İkincisi: sözleşme, dilekçe veya raporu ayrı istemle sor. Çünkü tek istem üç işi yığar. Madde, hitap ve rapor düzeni birbirine karışmaz. Üçüncüsü: tarih, sayı ve imzayı sen yazarsın. Çünkü model taslak yazar, mühür basmaz. Şu paragrafı soracaksan istemine ekle; liste halinde al, uydurma kanun maddesini sil, imzayı kendin at.

## SIRA SENDE

Sıra sende. Kendi Word belgeni veya dilekçe taslağını yükle. Kişi adı, IBAN veya ticari sır varsa önce maskele; ham Word belgesini sohbete yükleme. Gemini yoksa aynı dosyayı sohbet yapay zekâsına (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) yüklersin; yöntem değişmez. Üç maddeyi çıkar. Tüm dosyayı sayfa sayfa kopyalama. Sözleşmede cezai şart, fesih ve gizlilik; dilekçede hitap, konu ve talep; raporda başlık, üç madde ve sonraki adım. Öğretmen SEN konuşur; belge SIZ durur.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Word Copilot yoksa Word belgesini doğrudan Gemini sohbetine yükle. Sohbet yapay zekâları (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) da aynı yöntemi taşır. Sayfa sayfa kopya, lisanssızın çaresi değildir; tek tek kopyalamadır. Şu paragrafı soracaksan o paragrafı istemine ekle, tüm dosyayı satır satır taşıma. Lisans yoksa hız düşer; yöntem düşmez. Dosya bütün gider, istem ayrı yazılır, imza sende kalır.

### Kenar durum / dikkat edilecek hata
Model kanun maddesi uydurur. Kaynağı sen kontrol et. İkinci kenar: dilekçede hitap kopması. Taslak gider, unvan boş kalır. Model sen diye yazarsa resmî SIZ’a çevir. Tarih, sayı, imza satırını boş bırak; kalemi sen tut. Üçüncü kenar: raporda gözlem-karar karışması. Gözlem «satır toplamı düştü» der; karar notu «onay ister» der. İkisini aynı maddeye yazma. Dördüncü kenar: sayfa numarasız liste. Numara yoksa madde denetlenemez; tekrar sor.

### Yapılmaması gereken tuzak
Yapay zekâya imza attırmak. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın. İkinci tuzak: üç işi tek istemde yığmak. Sözleşme maddesi dilekçeye bulaşır; rapor düzeni bozulur. Üç iş, üç istem. Üçüncü tuzak: ham Word belgesini maskesiz yüklemek. Kişi adı ve IBAN varsa önce maskele.
`,
};
