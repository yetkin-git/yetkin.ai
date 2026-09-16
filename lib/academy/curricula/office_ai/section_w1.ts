import type { Section } from "../types";

export const sectionW1: Section = {
  sectionNumber: 8,
  lessonKey: "01_office_ai-w1",
  title: "Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor",
  targetDurationMinutes: 8.8,
  estimatedWordCount: 1020,
  pedagogicalObjective:
    "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Tüm dosyayı sayfa sayfa kopyalamak zahmetli yoldur. Unvan, tarih, sayı, hitap insandadır. Sınav bu derste açılmaz.",
  contentMarkdown: `
Uzun sözleşmeyi sayfa sayfa kopyalamak zahmetli yoldur. Bir cümle sayfa dörtte, diğeri on birde kalır. Bağlam kopar. Bugün dosyayı olduğu gibi yüklüyorsun. Yapay zekâ imzalamaz. Unvan, tarih, sayı, hitap insandadır.

Selamlar, ben Gözde. Word ve uzun doküman analizi dersine hoş geldin. Yöntem doğrudan dosya yüklemedir. Tüm dokümanı kopyalamakla uğraşmazsın; dosyayı ataşla yüklersin. İncelemek istediğin spesifik bir paragraf varsa, onu istemine ekleyip doğrudan o bölümü sorabilirsin. Bugün üç iş: tedarik sözleşmesi, resmî dilekçe, kısa rapor. Hepsi aynı kapı: ataş.

Önünde bir tedarik sözleşmesi durur. Cezai şart, fesih ve gizlilik üç ayrı yerde gizlenir. Asıl kapı ataştır. Word Copilot varsa şeritten okut. Yoksa Gemini sohbetine .docx yüklersin.

## PARÇA PARÇA

Zahmetli yol şudur: sayfa dördü kopyala, yapıştır, sayfa on biri kopyala, yine yapıştır. Model yarım cümle görür. Ceza oranını kaçırır. Otuz sayfayı parça parça taşımak üçüncü kapı değildir. Bu yolu satmıyoruz.

## ATAŞ YÜKLE

Şimdi sözleşmeyi ataşla. Dosya adı pratikte yanar. İstemi prompt terminaline yazıyoruz:

Yüklediğim sözleşme dosyasını (.docx) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.

Komut dosyanın bütününe gider. Tüm metni taşımazsın.

## YERİNDE ANALİZ

İkinci iş dilekçedir. Hitap, konu, üç cümlelik gerekçe, açık talep, ek listesi. Model taslak yazar. Tarih, sayı, unvan, imza senin. Kanun maddesi uydurursa silersin.

Üçüncü iş rapordur. Dağınık saha notundan bir sayfalık durum raporu: başlık, üç madde, bir sonraki adım. Gözlem ile karar notunu karıştırma. Üç iş, üç istem, tek kapı: ataş.

## FARK ORTADA

Sol ekran kopuk parçadır. Sağ ekran tam dosyadır. Üç kart: cezai şart, dilekçe hitabı, rapor maddesi. Outlook Copilot ister, Gmail Gemini ister, Word ve Excel ataş ister. Eşleşme kilitlidir.

## CEBİNE KOY

Cebine üç adım koy. Bir: dosyayı ataşla. İki: sözleşme, dilekçe veya raporu ayrı istemle sor. Üç: tarih, sayı, imza insanda kalır.

## SIRA SENDE

Sıra sende. Kendi .docx sözleşmeni veya dilekçe taslağını yükle. Üç maddeyi çıkar. Tüm dosyayı sayfa sayfa kopyalama. Bu 8. derstir. Sınav henüz kapalıdır. Sınav, kapanış dersi olan Haftalık Sistem (9. ders) tamamlandığında açılır. Baraj 70.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Word Copilot yoksa \`.docx\` dosyasını Gemini sohbetine ataşla. ChatGPT veya Claude da aynı kapıyı taşır. Sayfa sayfa kopya, lisanssızın çaresi değildir; zahmetli yoldur. Spesifik paragrafı soracaksan o paragrafı istemine ekle, tüm dosyayı hamal gibi taşıma.

### Kenar durum / dikkat edilecek hata
Model kanun maddesi uydurur. Kaynağı sen kilitle. İkinci kenar: dilekçede hitap kopması. Taslak gider, unvan boş kalır. Tarih, sayı, imza satırını boş bırak; kalemi sen tut.

### Yapılmaması gereken tuzak
«Sekiz ders bitti, sınava gir.» Yalan. Sınav bu derste açılmaz. Kapanış Cuma 30’dadır. İkinci tuzak: yapay zekâya imza attırmak. Unvan, tarih, sayı, hitap insandadır.
`,
};
