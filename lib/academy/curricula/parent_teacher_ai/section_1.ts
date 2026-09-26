import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 1 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz.
 */
export const parentTeacherAiSection1: Section = {
  sectionNumber: 1,
  lessonKey: "parent_teacher_ai-1",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Sohbet Kutusu Nedir, Ne Değildir?",
  targetDurationMinutes: 8,
  estimatedWordCount: 803,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye sohbet kutusunun okul dosyası olmadığını somut bir akşam sahnesiyle göstermek. Çocuğun adı, okulu ve notu kutuya yapışmaz. Sıra: okul politikası, veri sınıfı, aktarım yolu. Hesap yetişkinin adınadır.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. Bu dersin sonunda sohbet kutusunun ne iş gördüğünü kendi cümlenle söyleyeceksin. Çocuğun adını, okulunu ve notunu neden kutuya yazmayacağını da söyleyeceksin. Hesabı çocuğun adına açmazsın.

Akşam saat 20:10. Telefonunda bir sohbet kutusu açık. Öğretmene matematik hakkında kısa bir mesaj yazmak istiyorsun. Ekranın altında bir yazı satırı durur. Oraya cümleyi sen yazarsın. Gönder düğmesine basınca o satır, modelin olduğu yere gider. Cevap metin olarak geri gelir.

Bu kutu bir yazı satırıdır. Okulun not defterini açmaz. Sınıf listesini getirmez. Veli toplantısında söylenen sözü saklamaz. Gönder düğmesi, yazdığın satırı evin dışındaki modele iletir. Model o satırdan cevap üretir. Cevap yine metindir. Kutu, notu okul kayıtlarından kendisi bulmaz. Sen yazmazsan notu bilmez.

## EV VE OKUL

Elinde şöyle bir satır duruyor. Bu satır ders için uydurulmuştur. «Ayşe Demir, 5-B, Çınar İlkokulu, matematik 45. Öğretmene nazik bir mesaj yaz.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme.

Neden? Ad, okul ve not birlikte durunca satır tek bir çocuğu işaret eder. Bu üçü kişisel veridir. 45, o çocuğun matematik sonucudur. Okul adı, kaydın hangi kuruma ait olduğunu söyler. Modelin mesaj yazması için bu üçüne ihtiyacı yoktur. Öğretmen notu zaten okulda görür.

Eylem şudur. Parmağını gönderden çekersin. Gerçek adı, okul adını ve notu kutunun dışında bırakırsın. Sonuç şudur. Çocuğun kaydı evdeki sohbette kopya bırakmaz. İşi kaybetmezsin. İşi, kimliği çıkarılmış kısa bir örnekle görürsün.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Okulun onayladığı araç hangisi? Okul bir panel yazmışsa sınıf listesi ve not orada kalır. Okulun yazılı kuralı varsa o kural okulda durur. Onaylı araç yoksa çocuğun dosyasını kişisel sohbet hesabına taşıma.

İkinci soru veri sınıfıdır. Çocuğun adı, okulu, notu, fotoğrafı, adresi ve sağlık notu kişisel veridir. Bunlar açık hâliyle kutuya girmez. Uydurulmuş kısa örnekte kişi yoktur. «Bir öğrenci matematikte zorlanıyor» bir örnektir. «Ayşe Demir, 5-B, notu 45» bir kayıttır. Kayıt kutuda durmaz.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. İkisi de yoksa son çare, kimliği çıkarılmış kısa örnektir. Gerçek öğrenci satırı bu kısa örneğin içine gizlenmez. Örnek, işin şeklini gösterir. Sınıf listesinin yerini tutmaz.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. «Kızım Ayşe Demir, 5-B, Çınar İlkokulu, matematik notu 45. Öğretmene nazik bir mesaj yaz.» Ad, sınıf, okul ve not evden çıkar. Model akıcı bir mesaj yazar. Mesajın içinde çocuğun adı ve notu durur. Veri bir kez kutuya girmiştir. Düzgün cümle, adı ve notu kutudan çıkarmaz. Sohbeti ekrandan silmen, gönderilmiş satırı geri çağırmaz.

Doğru işi de ekranda gör. Gerçek adı, okulu ve notu kâğıtta bırakırsın. Okulun kendi mesaj kutusunda da bırakabilirsin. Sohbete şunu yazarsın. «Matematikte zorlanan bir öğrenci için öğretmene dört cümlelik bir mesaj taslağı yaz. Öğrenci adı, okul adı ve not yazma.»

Model taslak verir. Taslak dört cümledir. «Matematikte zorlanan öğrenciniz için evde kısa tekrar önerebilirim. Hangi konuda durmamı yazarsanız o konuya bakarım. Tekrarı kısa parçalara bölebilirim. Uygun günü siz yazarsanız ona göre ayarlarım.» Taslakta ad yoktur. Not yoktur. Sen taslağı okursun. Öğretmene giden cümlede hitap siz durur. Cümle uygunsa okulun kendi mesajına adı sen eklersin. «Sayın öğretmenim, Ayşe Demir'in matematik çalışması için evde kısa tekrar yapmak istiyorum. Hangi konuda durmamı yazarsanız o konuya bakarım.» Bu cümle okulun mesajında durur. Bu cümleyi sohbet kutusuna geri yapıştırmazsın. Notu da kutuya yazmazsın. Notu sen biliyorsun. Modelin notu bilmesine bu iş için gerek yoktur.

Öğretmen masasında aynı sıra durur. Sabah bir sınav kâğıdı çekersin. Kâğıdın üstünde öğrencinin adı yazar. O kâğıdın fotoğrafını kişisel sohbete yapıştırmazsın. Sınıf listesini yapıştırmazsın. Not dökümünü yapıştırmazsın. Okulun onayladığı panel varsa soru çeşidini orada istersin. Panel yoksa uydurulmuş kısa bir soru metni yeter. «Üçüncü sınıf için iki basamaklı toplama sorusu yaz. Öğrenci adı yazma.» Öğrencinin adı o metinde durmaz. Ödevi çocuğun yerine bu kutuya yazdırıp teslim ettirmezsin. Bu ders o işi açmaz.

Hesap da bu sınırdadır. Kutuyu açan e-posta senindir. Çocuğun adına hesap açılmaz. Çocuğun okul postasıyla hesap açılmaz. Çocuğun fotoğrafıyla hesap açılmaz. Bu dersin alıcısı yetişkin öğretmendir. Alıcı, yetişkin velidir.

## CEBİNE KOY

Üç adımı cebine koy.

1. Yazmadan önce okulun onayladığı araca bak. Onaylı araç yoksa çocuk dosyasını kişisel sohbete taşıma.
2. Addan, okul adından ve nottan boş bir örnek yaz. Gerçek kaydı kutunun dışında bırak.
3. Gelen taslağı oku. Gerçek adı ve notu yalnız okulun kendi mesajına, kontrol ettikten sonra sen yaz.

## SIRA SENDE

Bugün sohbet kutusunu aç. Gerçek çocuk adı yazma. Okul adı yazma. Not yazma. Şunu gönder. «Matematikte zorlanan bir öğrenci için öğretmene dört cümlelik nazik bir mesaj taslağı yaz. Öğrenci adı, okul adı ve not yazma.»

Cevabı oku. Cevapta bir ad veya not belirdiyse o cümleyi sil. Taslağı okul mesajına ancak ondan sonra taşı. Bu alıştırmanın notu yok. Amaç, kutunun ne taşıdığını kendi gözünle görmendir.

Sıradaki derste aynı işi dört parçayla kuracaksın. Parçalar rol, görev, biçim ve kısıttır. Bu derste sınır durur. İstem, o sınırın içinde yazılır.
`,
};
