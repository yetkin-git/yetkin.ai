import type { Section } from "../types";

export const sectionW1: Section = {
  sectionNumber: 8,
  lessonKey: "01_office_ai-w1",
  title: "Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor",
  targetDurationMinutes: 9.9,
  estimatedWordCount: 1135,
  pedagogicalObjective:
    "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Neden uzun dokümanı satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza, fesih ve gizlilik ayrı sayfalarda kalır. Resmî belgede neden öğretmen SEN, belge SIZ? Çünkü kulağa SEN gider, kâğıda SIZ yazılır. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın. Sınav bu derste açılmaz.",
  contentMarkdown: `
Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza oranı sayfa dörtte, fesih sayfa on birde kalır. Bugün dosyayı olduğu gibi yüklüyorsun. Word Copilot varsa şeritten okutursun. Yoksa Word belgesini doğrudan Gemini sohbetine yüklersin. Yapay zekâ imzalamaz. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın.

Selamlar, ben Gözde. Word ve uzun doküman analizi dersine hoş geldin. Peki neden tüm dokümanı kopyalamak varsayılan yol değildir? Çünkü kopyalanan sayfa dosyadan kopar. Yöntem doğrudan dosya yüklemedir. Tüm dokümanı kopyalamakla uğraşmazsın; dosyayı doğrudan yüklersin. İncelemek istediğin spesifik bir paragraf varsa, onu istemine ekleyip doğrudan o bölümü sorabilirsin. Bugün üç iş: tedarik sözleşmesi, resmî dilekçe, kısa rapor. Hepsi aynı yöntemle yapılır: ataş ile yükleme.

Üç işi baştan haritala. Birinci iş sözleşmedir: riskli madde avı. İkinci iş dilekçedir: hitap ve talep düzeni. Üçüncü iş rapordur: saha notundan durum raporu. Peki neden üç iş tek yöntemle açılır? Çünkü dosya bütün hâliyle modele gidince yöntem değişmez; yalnızca istem değişir. Üç iş, üç istem, tek ataş yöntemi.

Önünde bir tedarik sözleşmesi durur. Cezai şart, fesih ve gizlilik üç ayrı yerde gizlenir. Peki neden otuz sayfayı satır satır okutmak yerine bu üç maddeyi aratırız? Çünkü şirket aleyhine olan yer orasıdır. Asıl yöntem ataş ile yüklemektir. Word Copilot varsa şeritten okut. Yoksa Gemini sohbetine Word belgesi yüklersin.

## PARÇA PARÇA

Tek tek kopyalama şudur: sayfa dördü kopyala, yapıştır, sayfa on biri kopyala, yine yapıştır. Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü model yarım cümle görür; ceza oranını kaçırır. Otuz sayfayı parça parça taşımak üçüncü kapı değildir. Üçüncü kapı son çaredir: tek paragraf, maskeli kısa yapıştırma. Bu yolu satmıyoruz.

Üç kaybı ayrı ayrı gör. Sözleşmede kayıp ceza oranıdır: sayfa dördü aldın, sayfa on biri unuttun. Dilekçede kayıp hitaptır: ek listesini bıraktın, talep yarım kalır. Raporda kayıp ayrımdır: gözlem ile karar notu karışır. Peki neden parça parça taşımak üçüncü kapı sayılmaz? Çünkü üçüncü kapı tek paragraftır: isim yok, hesap yok. Dosya bütün hâliyle yüklenir.

Peki neden sayfa dördü alıp sayfa on biri unutmak işi bitirmez? Çünkü model yarım görür, sen tam sanırsın. Ataş bu kopukluğu kapatır: dosya bütün gider, madde listesi sayfa numarasıyla döner.

## ATAŞ YÜKLE

Şimdi sözleşmeyi yükle. Dosya adı pratikte yanar. İstemi prompt terminaline yazıyoruz:

Yüklediğim sözleşme dosyasını (Word belgesi) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.

Komut dosyanın bütününe gider. Peki neden tüm metni taşımazsın? Çünkü komut ataşa gider; satır satır kopya dosyayı koparır.

Adım adım ilerle. Birinci adım dosyadır: Word belgesini ataş simgesinden yükle. İkinci adım istemdir: cezai şart, fesih ve gizliliği sor; sayfa numarası iste. Peki neden sayfa numarası istersin? Çünkü numarasız madde denetlenemez. Üçüncü adım kontroldür: listeyi dosyada aç, madde gerçekten orada mı bak. Uydurma madde görürsen sil.

## TEK DOSYAYLA ANALİZ

İkinci iş dilekçedir. Hitap, konu, üç cümlelik gerekçe, açık talep, ek listesi. Model taslak yazar. Tarih, sayı, unvan ve imza senindir. Kanun maddesi uydurursa silersin. Peki resmî belge yazılırken neden öğretmen SEN, belge SIZ çift sicili durur? Çünkü kulağına SEN derim; kâğıda SIZ yazılır. Öğretmen SEN, belge SIZ. Hitap örneği: «Sayın Yetkili, 12 Mart 2026 tarihli başvurumuzun sonucunun yazılı olarak tarafımıza iletilmesini arz ederiz.» Unvan, tarih, sayı ve imza boş kalır. Model sen diye dilekçe yazarsa o taslağı resmî SIZ’a çevirirsin. Öğretmen sıcak konuşur; belge resmî durur.

Dilekçenin beş satırını ayrı ayrı kur. Hitap makama seslenir, konu işi özetler, gerekçe üç cümledir, talep açık yazar, ek listesi dosyayı kapatır. Peki neden beş satır ayrı durur? Çünkü hitap yoksa evrak makamsız kalır; gerekçe uzun olursa talep kaybolur. Tarih, sayı ve imza satırını boş bırak; kalemi sen tut.

Üçüncü iş rapordur. Dağınık saha notundan bir sayfalık durum raporu: başlık, üç madde, bir sonraki adım. Peki neden gözlem ile karar notunu karıştırmazsın? Çünkü gözlem tabloyu özetler; karar notu onay ister. Çıkarılan özeti raporunda kullanabilirsin, ancak son kontrolü ve kararı her zaman sen vermelisin. Üç iş, üç istem, tek yöntem: ataş.

Raporun anatomisini bil: başlık, üç madde, sonraki adım. Peki neden gözlem ile karar notu aynı cümlede durmaz? Çünkü gözlem «satır toplamı düştü» der; karar notu «onay ister» der. Karıştırırsan imza riski kaybolur. Not dosyanı yükle, istemi ayrı yaz.

## FARK ORTADA

Sol ekran kopuk parçadır. Sağ ekran tam dosyadır. Peki neden fark bu kadar belirgin? Çünkü ataş dosyayı senden koparmaz; satır satır kopya koparır. Üç kart: cezai şart, dilekçe hitabı, rapor maddesi. Outlook Copilot ister, Gmail Gemini ister, Word ve Excel ataş ister. Bu eşleşme sabittir.

Sol ekranı satır satır oku: ceza oranı kaçar, hitap kopar, karar notu gözleme karışır. Sağ ekranı kart kart oku: cezai şart sayfa numarasıyla durur, dilekçe hitabı SIZ durur, rapor üç maddeye iner. Peki neden sağ ekran güven verir? Çünkü dosya bütün gitmiştir; madde listesi denetlenebilir.

## CEBİNE KOY

Cebine üç adım koy. Birincisi: dosyayı yükle. Çünkü satır satır okutmak riskli maddeyi kaçırır. Sözleşme, dilekçe veya rapor fark etmez; yöntem ataştır. İkincisi: sözleşme, dilekçe veya raporu ayrı istemle sor. Çünkü tek istem üç işi yığar. Madde, hitap ve rapor düzeni birbirine karışmaz. Üçüncüsü: tarih, sayı ve imzayı sen yazarsın. Çünkü model taslak yazar, mühür basmaz. Spesifik paragrafı soracaksan istemine ekle; liste halinde al, uydurma kanun maddesini sil, imzayı kendin at.

## SIRA SENDE

Sıra sende. Kendi Word sözleşmeni veya dilekçe taslağını yükle. Kişi adı, IBAN veya ticari sır varsa önce maskele; ham Word belgesini sohbete yükleme. Üç maddeyi çıkar. Tüm dosyayı sayfa sayfa kopyalama. Sözleşmede cezai şart, fesih ve gizlilik; dilekçede hitap, konu ve talep; raporda başlık, üç madde ve sonraki adım. Öğretmen sen konuşur; belge siz durur. Bu 8. derstir. Sınav henüz kapalıdır. Sınav, kapanış dersi olan Haftalık Sistem (9. ders) tamamlandığında açılır. Baraj 70. Sınav, 9. ders bitince açılır. Baraj score %70'tir.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Word Copilot yoksa Word belgesini doğrudan Gemini sohbetine yükle. ChatGPT veya Claude da aynı yöntemi taşır. Sayfa sayfa kopya, lisanssızın çaresi değildir; tek tek kopyalamadır. Spesifik paragrafı soracaksan o paragrafı istemine ekle, tüm dosyayı satır satır taşıma. Lisans yoksa hız düşer; yöntem düşmez. Dosya bütün gider, istem ayrı yazılır, imza sende kalır.

### Kenar durum / dikkat edilecek hata
Model kanun maddesi uydurur. Kaynağı sen kontrol et. İkinci kenar: dilekçede hitap kopması. Taslak gider, unvan boş kalır. Model sen diye yazarsa resmî SIZ’a çevir. Tarih, sayı, imza satırını boş bırak; kalemi sen tut. Üçüncü kenar: raporda gözlem-karar karışması. Gözlem «satır toplamı düştü» der; karar notu «onay ister» der. İkisini aynı maddeye yazma. Dördüncü kenar: sayfa numarasız liste. Numara yoksa madde denetlenemez; tekrar sor.

### Yapılmaması gereken tuzak
«Sekiz ders bitti, sınava gir.» Yalan. Sınav bu derste açılmaz. Kapanış Cuma 30’dadır. İkinci tuzak: yapay zekâya imza attırmak. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın. Üçüncü tuzak: üç işi tek istemde yığmak. Sözleşme maddesi dilekçeye bulaşır; rapor düzeni bozulur. Üç iş, üç istem. Dördüncü tuzak: ham Word belgesini maskesiz yüklemek. Kişi adı ve IBAN varsa önce maskele.
`,
};
