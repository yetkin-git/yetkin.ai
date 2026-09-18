import type { Section } from "../types";

export const sectionK1: Section = {
  sectionNumber: 2,
  lessonKey: "01_office_ai-k1",
  title: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?",
  targetDurationMinutes: 9,
  estimatedWordCount: 1248,
  pedagogicalObjective:
    "Müşteri listesi, IBAN, T.C. Kimlik No, maaş ve şirket sırrını açık yapay zekâ ekranına yüklememeyi göstermek. Neden üç sahte satırın yettiğini anlat; yüklemeden önce maskele; 3. Kapı yalnız maskeli kısa özettir.",
  contentMarkdown: `
İlk derste tabloyu A1 eşiğinden konuşturdun. Şimdi mantığı oturtalım. O tabloyu temizlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. Neden? Çünkü hücreler düzgün dizilmiş olsa bile satırların içinde hâlâ gerçek insanların adı, telefonu, IBAN’ı ve maaşı duruyor olabilir. ChatGPT, Gemini ve benzeri açık, ücretsiz yapay zekâ ekranlarına müşteri listesi, IBAN, T.C. Kimlik No, maaş tablosu ve şirket içi ticari sır bu yüzden doğrudan yüklenmez. Bu ders, rapor ve ataş derslerinden önce neyin yüklenmeyeceğini ve neden yüklenmeyeceğini adım adım öğretir.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin KVKK ve veri güvenliği dersine hoş geldin. Bugün birlikte şu soruyu çözeceğiz: yapay zekâya her dosya neden gitmez? Çünkü sohbet kutusuna yazdığın metin, o ekranı kapatınca yok olmaz. Kişisel veri, şirket sırrı ve açık kimlik bu yüzden sohbetin işi değildir. Yapay zekâya veri vermeden önce ham verideki kişisel bilgileri maskelemek zorunludur; böylece hem işini yaptırırsın hem de insanı açıkta bırakmazsın. Sınav bu derste açılmaz; önce bu alışkanlığı oturtacağız.

Masada müşteri Excel’i açık durur. Ad, telefon, T.C. Kimlik No, IBAN ve maaş aynı ızgaradadır. Saha tuzağı şudur: model hızlı cevap versin diye ham tabloyu ChatGPT veya Gemini ekranına atarsın. Peki neden bu refleks tehlikelidir? Çünkü sohbet kutusu senin arşivin değildir. Sil düğmesine basmak, o satırları bir kez yüklemiş olmanı geri almaz; model o kimlikleri görmüştür. Bu yüzden önce yasak listeyi masada net yazacağız: hangi satırların hiç gitmeyeceğini, hangilerinin maskelenerek gidebileceğini.

## YASAK LİSTE

Şimdi yasak listeyi tane tane yazalım. Neden bir liste tutuyoruz? Çünkü ofiste her dosya aynı sınıfta değildir; bazı satırlar bir insanın kimliğini tek bakışta ele verir. Yüklenmez olanlar şunlardır. Müşteri adı ve telefonu birlikte. Açık IBAN. Maaş tablosu ve prim. T.C. Kimlik No. Hasta veya öğrenci kaydı. Sözleşmedeki ceza maddesiyle birlikte kişi adı. CRM ekran görüntüsü. Bu dosyalar yerleşik panelde de, ataşla da, dış sohbete de aynı kuralı taşır. Kapı yalnız aktarım yoludur; içeri giren ham satır hâlâ ham satırdır. Bu yüzden ham hali gitmez. Kapı değişir; kişisel veri, şirket sırrı ve kamu cümlesi sınıfı değişmez.

Şirket sırrını da aynı masaya koyalım. Fiyat listesi, maliyet, henüz açıklanmamış kampanya, rakip notu kişisel veri değildir; ama rakipten ve piyasadan sakladığın bilgidir. Bu yüzden aynı güvenlik sınıfından geçmez: ham haliyle açık sohbete gitmez. Peki ne gidebilir? Kamu kataloğu (ürün adı, genel stok cümlesi) gidebilir. Kaya Gıda kamu örneğinde kişi adı yoktur; o yüzden kamu cümlesi durur. Senin gerçek listen varsa kişiye bağlı satır gitmez. Önce maskele. Böylece hem kamu bilgisini kullanırsın hem de gerçek insanı sohbetin dışına alırsın.

## MASKELE

Şimdi maskelemenin ne olduğunu netleştirelim. Maskelemek silmek değildir. Peki neden silmek yetmez? Çünkü satırı tamamen silersen yapay zekâ tablonun mantığını da kaybeder; sütunların ne işe yaradığını göremez. Yapay zekâya veri vermeden önce ham verideki kişisel bilgileri takma değerle değiştirirsin. Ayşe Kaya yerine Müşteri A yaz. IBAN yerine MASKELİ_IBAN yaz. Telefonu kırp. Soruyu bırak. Modele şunu söyleyebilirsin: ‘Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.’ Gördüğün gibi komut günlük dille yazılıyor; sınır da komutun içinde duruyor: ad yok, telefon yok.

Şimdi masada duran somut bir satırı birlikte maskeleyelim. Ham satır şöyle durur: Ayşe Kaya, telefon, açık IBAN, maaş 42.000, T.C. Kimlik No görünür. Bu satır sohbet kutusuna yapıştırılmaz. Maskeli karşılığı: Müşteri A, MASKELİ_TELEFON, MASKELİ_IBAN, MASKELİ_MAAŞ, kimlik yok. Soruyu bırakırsın: bölge bazında üç madde, ad yok. Peki neden üç satır yeter de otuz satırlık müşteri dökümü yetmez? Yapay zekâya tablonun mantığını kavratmak için bin kişilik müşteri listesinin tamamını yüklemene gerek yok. Sadece sütun başlıklarını ve mantığı gösterecek üç tane örnek, sahte satır yüklersen, yapay zekâ mantığı anlar. Böylece hem bin kişinin gerçek ad, soyad ve IBAN verisini riske atmamış olursun, hem de aynı özeti alırsın. Model hâlâ işini yapar. Sen insanı açıkta bırakmazsın. Silmek yetmez, çünkü silinen satır mantığı da götürür. Değiştirmek zorunludur, çünkü takma değer hem korur hem öğretir.

F2 ile kestiğin kesme işareti veri hijyenidir: hücredeki gizli karakteri görürsün, modelin şaşırmamasını sağlarsın. Maske ise yükleme öncesi zorunlu adımdır: kimliği takma değerle değiştirirsin. Peki neden ikisini karıştırmayalım? Çünkü biri tablonun okunmasını düzeltir, diğeri insanın sohbete girmesini engeller. İkisi ayrı reflekstir. A1 eşiği düzgün olsa bile açık isim sohbete girmez. Hijyen, yükleme izni değildir.

## ÜÇÜNCÜ KAPI

Üç Kapı kuralını şimdi doğru yere koyalım. Bu kural aktarım yöntemidir, güvenlik sınıfı değildir. 1. Kapı yerleşik panel: Copilot veya Gemini şeridi. 2. Kapı ataş: \`.xlsx\`, \`.docx\`, \`.pptx\`. 3. Kapı sohbet ve tüketici modelinde maskeli kısa özet. Ham kutu yapıştırmak 3. Kapı değildir. Ekran görüntüsü zinciri 3. Kapı değildir. Bunlar atlanmış kapıdır: birinci ve ikinci kapıyı denemeden, maske de koymadan ham kimliği dışarı taşımaktır.

Kişisel veri, şirket sırrı ve kamu cümlesi ayrı bir sınıflamadır. Hangi kapıyı seçersen seç, ham kimlik ve sır gitmez. Peki birinci ve ikinci kapı duruyorsa neden üçüncü kapıyı açmayalım? Çünkü şirketinin kendi şeridi veya ataş yolu varken, ham listeyi dış sohbete taşımana gerek yoktur. Durmuyorsa, yani lisans yoksa ve ataş da uygun değilse, o zaman üçüncü kapıyı açarsın; ama yine bütün listeyi değil. Yapay zekâya tablonun mantığını kavratmak için üç satır yeter: sütun başlıkları ve üç örnek, sahte satır. Otuz satırlık müşteri dökümü yetmez, çünkü model fazladan gerçek isimle daha iyi özet yazmaz; sen ise daha fazla insanı riske atmış olursun.

## FARK ORTADA

Sol tarafta ham yapıştırma durur: Ayşe Kaya, telefon, IBAN açık. Sağ tarafta maskeli kısa özet durur: Müşteri A, MASKELİ_IBAN, üç satır soru. Sol taraf hızlı görünür; çünkü kopyala-yapıştır bir saniye sürer. Ama şirketi ve insanı açıkta bırakır. Sağ taraf yavaş görünür; çünkü önce takma değer yazarsın. Peki neden sağ tarafı seçiyoruz? Çünkü kapıyı doğru kullanırsın ve aynı özeti, kimliği ifşa etmeden alırsın.

Peki iki taraf arasındaki fark nerede durur? Fark, hangi aracı açtığında değil, o araca neyin girdiğindedir. Copilot, Gemini, ChatGPT aynı kuralı taşır. Hangi sohbeti kullanırsan kullan, içeri giren ham ad hâlâ ham addır. Listen değişir; modelin adı değişmez.

## CEBİNE KOY

Cebine üç kural koy. 1. Müşteri listesi, IBAN, T.C. Kimlik No, maaş tablosu ve şirket sırrı ham haliyle açık yapay zekâ ekranına yüklenmez; çünkü bir kez giren satır silmekle geri gelmez. 2. Veri vermeden önce maskele: Ayşe Kaya yerine Müşteri A, IBAN yerine MASKELİ_IBAN. Böylece model sütun mantığını görür, gerçek kimliği görmez. 3. 3. Kapı yalnız maskeli kısa özettir; sohbet ve tüketici modelinde ekran görüntüsü zinciri yoktur. Çünkü ekran görüntüsü, maske koymadan ham tabloyu dışarı taşır.

## SIRA SENDE

Sıra sende. Masandaki bir gerçek listeyi aç. Ad, telefon, IBAN, T.C. Kimlik No varsa maskele. Üç satırlık soru yaz. Ham dosyayı ChatGPT veya Gemini sohbetine bırakma. Üç sahte satırın, bin gerçek satır kadar iş gördüğünü masada fark edeceksin. Bu 2. derstir. Sınav henüz kapalıdır. Sıradaki kapı rapordur: temiz ve maskeli tablodan üç maddelik yönetim özeti.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Copilot kiracısı veya şirket DPA’sı kişisel veriyi yasal kılmaz. Neden? Çünkü lisans, sohbet kutusuna giren satırın sınıfını değiştirmez. Lisans yoksa da, varsa da kural aynıdır: ad + telefon + IBAN ham haliyle gitmez. Yapay zekâya tablonun mantığını kavratmak için maskeli üç satır yeter; bin kişilik gerçek liste gerekmez. Yurt dışı model, sohbeti senin çöp kutusundan silmez; silmek, yüklemiş olmanı geri almaz.

### Kenar durum / dikkat edilecek hata
Kamu kataloğu (ürün adı, genel stok cümlesi) gidebilir; aynı satırda kişi adı belirdiği anda dur. Hasta veya öğrenci kaydı, maaş cetveli, açık T.C. Kimlik No — bunlar «iç kullanım» diye sohbete girmez. İç kullanım, kişisel veriyi kamuya açmaz.

### Yapılmaması gereken tuzak
«Sohbeti sonra silerim.» Silmek, yüklemiş olmanı geri almaz; model o satırları bir kez görmüştür. İkinci tuzak: bu dersi sona bırakıp önce ataş alışkanlığı kazanmak. Yüklemeden önce maske kuralını 2. derste kilitle; aksi halde ataş refleksi ham kimliği de götürür.
`,
};
