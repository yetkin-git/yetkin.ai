import type { Section } from "../types";

export const sectionW1: Section = {
  sectionNumber: 8,
  lessonKey: "01_office_ai-w1",
  title: "Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor",
  targetDurationMinutes: 9.5,
  estimatedWordCount: 667,
  pedagogicalObjective:
    "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Neden uzun dokümanı satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza, fesih ve gizlilik ayrı sayfalarda kalır. Resmî belgede neden öğretmen SEN, belge SIZ? Çünkü kulağa SEN gider, kâğıda SIZ yazılır. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın. Sınav bu derste açılmaz.",
  contentMarkdown: `
Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız? Çünkü satır satır okutunca yığın çıkar; ceza oranı sayfa dörtte, fesih sayfa on birde kalır. Bugün dosyayı olduğu gibi yüklüyorsun. Word Copilot varsa şeritten okutursun. Yoksa Word belgesini doğrudan Gemini sohbetine yüklersin. Yapay zekâ imzalamaz. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın.

Selamlar, ben Gözde. Word ve uzun doküman analizi dersine hoş geldin. Peki neden tüm dokümanı kopyalamak varsayılan yol değildir? Çünkü kopyalanan sayfa dosyadan kopar. Yöntem doğrudan dosya yüklemedir. Tüm dokümanı kopyalamakla uğraşmazsın; dosyayı doğrudan yüklersin. İncelemek istediğin spesifik bir paragraf varsa, onu istemine ekleyip doğrudan o bölümü sorabilirsin. Bugün üç iş: tedarik sözleşmesi, resmî dilekçe, kısa rapor. Hepsi aynı yöntemle yapılır: ataş ile yükleme.

Önünde bir tedarik sözleşmesi durur. Cezai şart, fesih ve gizlilik üç ayrı yerde gizlenir. Peki neden otuz sayfayı satır satır okutmak yerine bu üç maddeyi aratırız? Çünkü şirket aleyhine olan yer orasıdır. Asıl yöntem ataş ile yüklemektir. Word Copilot varsa şeritten okut. Yoksa Gemini sohbetine Word belgesi yüklersin.

## PARÇA PARÇA

Tek tek kopyalama şudur: sayfa dördü kopyala, yapıştır, sayfa on biri kopyala, yine yapıştır. Peki neden bu atlanmış kapıdır, yasak listesi değil? Çünkü model yarım cümle görür; ceza oranını kaçırır. Otuz sayfayı parça parça taşımak üçüncü kapı değildir. Bu yolu satmıyoruz.

## ATAŞ YÜKLE

Şimdi sözleşmeyi yükle. Dosya adı pratikte yanar. İstemi prompt terminaline yazıyoruz:

Yüklediğim sözleşme dosyasını (Word belgesi) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.

Komut dosyanın bütününe gider. Peki neden tüm metni taşımazsın? Çünkü komut ataşa gider; satır satır kopya dosyayı koparır.

## TEK DOSYAYLA ANALİZ

İkinci iş dilekçedir. Hitap, konu, üç cümlelik gerekçe, açık talep, ek listesi. Model taslak yazar. Tarih, sayı, unvan ve imza senindir. Kanun maddesi uydurursa silersin. Peki resmî belge yazılırken neden öğretmen SEN, belge SIZ çift sicili durur? Çünkü kulağına SEN derim; kâğıda SIZ yazılır. Öğretmen SEN, belge SIZ. Hitap örneği: «Sayın Yetkili, 12 Mart 2026 tarihli başvurumuzun sonucunun yazılı olarak tarafımıza iletilmesini arz ederiz.» Unvan, tarih, sayı ve imza boş kalır. Model sen diye dilekçe yazarsa o taslağı resmî SIZ’a çevirirsin. Öğretmen sıcak konuşur; belge resmî durur.

Üçüncü iş rapordur. Dağınık saha notundan bir sayfalık durum raporu: başlık, üç madde, bir sonraki adım. Peki neden gözlem ile karar notunu karıştırmazsın? Çünkü gözlem tabloyu özetler; karar notu onay ister. Çıkarılan özeti raporunda kullanabilirsin, ancak son kontrolü ve kararı her zaman sen vermelisin. Üç iş, üç istem, tek yöntem: ataş.

## FARK ORTADA

Sol ekran kopuk parçadır. Sağ ekran tam dosyadır. Peki neden fark bu kadar belirgin? Çünkü ataş dosyayı senden koparmaz; satır satır kopya koparır. Üç kart: cezai şart, dilekçe hitabı, rapor maddesi. Outlook Copilot ister, Gmail Gemini ister, Word ve Excel ataş ister. Bu eşleşme sabittir.

## CEBİNE KOY

Cebine üç adım koy. Birincisi: dosyayı yükle. Çünkü satır satır okutmak riskli maddeyi kaçırır. İkincisi: sözleşme, dilekçe veya raporu ayrı istemle sor. Çünkü tek istem üç işi yığar. Üçüncüsü: tarih, sayı ve imzayı sen yazarsın. Çünkü model taslak yazar, mühür basmaz.

## SIRA SENDE

Sıra sende. Kendi Word sözleşmeni veya dilekçe taslağını yükle. Üç maddeyi çıkar. Tüm dosyayı sayfa sayfa kopyalama. Öğretmen sen konuşur; belge siz durur. Bu 8. derstir. Sınav henüz kapalıdır. Sınav, kapanış dersi olan Haftalık Sistem (9. ders) tamamlandığında açılır. Baraj 70.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Word Copilot yoksa Word belgesini doğrudan Gemini sohbetine yükle. ChatGPT veya Claude da aynı yöntemi taşır. Sayfa sayfa kopya, lisanssızın çaresi değildir; tek tek kopyalamadır. Spesifik paragrafı soracaksan o paragrafı istemine ekle, tüm dosyayı satır satır taşıma.

### Kenar durum / dikkat edilecek hata
Model kanun maddesi uydurur. Kaynağı sen kontrol et. İkinci kenar: dilekçede hitap kopması. Taslak gider, unvan boş kalır. Model sen diye yazarsa resmî SIZ’a çevir. Tarih, sayı, imza satırını boş bırak; kalemi sen tut.

### Yapılmaması gereken tuzak
«Sekiz ders bitti, sınava gir.» Yalan. Sınav bu derste açılmaz. Kapanış Cuma 30’dadır. İkinci tuzak: yapay zekâya imza attırmak. Unvanı, tarihi, sayıyı ve hitabı sen yazarsın.
`,
};
