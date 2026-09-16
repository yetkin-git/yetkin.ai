import type { Section } from "../types";

export const sectionK1: Section = {
  sectionNumber: 2,
  lessonKey: "01_office_ai-k1",
  title: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?",
  targetDurationMinutes: 8.5,
  estimatedWordCount: 1280,
  pedagogicalObjective:
    "Müşteri listesi, IBAN, maaş ve şirket sırrını yapay zekâya yüklememeyi göstermek. Yükleme alışkanlığından önce 3. Kapı yalnız maskeli kısa özettir.",
  contentMarkdown: `
İlk derste tabloyu A1 eşiğinden konuşturdun. Temiz tablo, yüklenir tablo demek değildir. Aynı alışkanlık, yanlış dosyada insanı da ifşa eder. Müşteri listesini, maaş tablosunu veya açık IBAN’ı sohbete bırakmak 2. Kapı değildir. Bu ders, rapor ve ataş derslerinden önce neyin yüklenmeyeceğini öğretir.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin KVKK ve veri güvenliği dersine hoş geldin. Bugün ahlaki omurga oturur. Yapay zekâya her dosya gitmez. Kişisel veri, şirket sırrı ve açık kimlik sohbetin işi değildir. Maskelemeden yapıştırma, öğretilen yol değildir. Sınav bu derste açılmaz.

Ofiste Cuma paniği gelir. Müşteri Excel’i açık durur. Ad, telefon, T.C. kimlik, IBAN aynı ızgaradadır. Model hızlı cevap verir diye ham tabloyu sohbete atarsın. Bu refleks KVKK’yı ve şirket sırrını deler. Sohbet kutusu arşiv değildir. Silmek, yüklemiş olmanı geri almaz.

## YASAK LİSTE

Yüklenmez listesi nettir. Müşteri adı ve telefonu birlikte. Açık IBAN. Maaş ve prim. T.C. kimlik. Hasta veya öğrenci kaydı. Sözleşmedeki ceza maddesiyle birlikte kişi adı. CRM ekran görüntüsü. Bu dosyalar 1. Kapı Copilot’ta da, 2. Kapı ataşta da, dış sohbete de aynı kuralı taşır: ham hali gitmez.

Şirket sırrı kişisel veri değildir ama aynı kapıdan geçmez. Fiyat listesi, maliyet, henüz açıklanmamış kampanya, rakip notu. Kamu kataloğu (ürün adı, genel stok cümlesi) gidebilir. Kişiye bağlı satır gitmez.

## MASKELE

Maskelemek silmek değildir. Adı baş harfe indir. Telefonu kırp. IBAN’ı son dört haneye indir. Soruyu bırak. Modele şunu söyleyebilirsin: ‘Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.’ Kaya Gıda kamu örneğinde kişi adı yoktur; senin gerçek listen varsa önce maskele.

F2 ile kestiğin kesme işareti veri hijyenidir. Maske ise ahlak hijyenidir. İkisi ayrı reflekstir. Temiz tablo, yüklenir tablo demek değildir.

## ÜÇÜNCÜ KAPI

Üç Kapı sırası durur. 1. Kapı yerleşik panel. 2. Kapı ataş. 3. Kapı son çaredir: isim, telefon, IBAN ve ticari sır maskelenmiş kısa özet. Ham kutu yapıştırmak 3. Kapı değildir. Ekran görüntüsü zinciri 3. Kapı değildir. Atlanmış kapıdır.

Birinci ve ikinci kapı duruyorsa üçüncü kapıyı açma. Durmuyorsa üç satır yeter. Otuz satırlık müşteri dökümü yetmez.

## FARK ORTADA

Sol tarafta ham yapıştırma durur: ad, telefon, IBAN açık. Sağ tarafta maskeli kısa özet durur: baş harf, kırpılmış hesap, üç satır soru. Sol taraf hızlı görünür, şirketi ve insanı açıkta bırakır. Sağ taraf yavaş görünür, kapıyı doğru kullanır.

Fark araç değildir. Fark, neyin içeri girdiğidir. Copilot, Gemini, ChatGPT aynı kuralı taşır. Model değişmez; senin listen değişir.

## CEBİNE KOY

Cebine üç kural koy. 1. Kişisel veri ve şirket sırrı ham haliyle yüklenmez. 2. Soruyu maskeleyip kısa tut. 3. 3. Kapı yalnız maskeli kısa özettir; ekran görüntüsü zinciri yoktur.

## SIRA SENDE

Sıra sende. Masandaki bir gerçek listeyi aç. Ad, telefon, IBAN varsa maskele. Üç satırlık soru yaz. Ham dosyayı sohbete bırakma. Bu 2. derstir. Sınav henüz kapalıdır. Sıradaki kapı rapordur: temiz ve maskeli tablodan üç maddelik yönetim özeti.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Copilot kiracısı veya şirket DPA’sı kişisel veriyi yasal kılmaz. Lisans yoksa da, varsa da kural aynıdır: ad + telefon + IBAN ham haliyle gitmez. Maskeli üç satır yeter. Yurt dışı model, sohbeti senin çöp kutusundan silmez.

### Kenar durum / dikkat edilecek hata
Kamu kataloğu (ürün adı, genel stok cümlesi) gidebilir; aynı satırda kişi adı belirdiği anda dur. Hasta veya öğrenci kaydı, maaş cetveli, açık T.C. kimlik — bunlar «iç kullanım» diye sohbete girmez.

### Yapılmaması gereken tuzak
«Sohbeti sonra silerim.» Silmek, yüklemiş olmanı geri almaz. İkinci tuzak: bu dersi sona bırakıp önce ataş alışkanlığı kazanmak. Omurga bunu 2. derse aldı; yüklemeden önce bekçi ol.
`,
};
