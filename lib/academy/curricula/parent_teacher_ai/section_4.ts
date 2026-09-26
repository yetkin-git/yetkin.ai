import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 4 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz.
 */
export const parentTeacherAiSection4: Section = {
  sectionNumber: 4,
  lessonKey: "parent_teacher_ai-4",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Öğrenci Verisi: Ne Yapıştırılmaz",
  targetDurationMinutes: 9,
  estimatedWordCount: 1150,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye, ad, fotoğraf, not ve adresin sohbet kutusuna neden girmediğini ayrı ayrı göstermek. Ad çocuğu işaret eder. Fotoğraf yüzü ve köşedeki adı götürür. Not, okul defterinin dışında kopya olur. Adres, sokak ve daireyi sohbete yazar. Sıra: okul politikası, veri sınıfı, aktarım yolu. Onaylı araç yoksa çocuk dosyası kişisel sohbete gitmez.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. Geçen derste tarihi sayfaya sordun. Bu dersin sonunda dört kaydı kutunun dışında bırakacaksın. Ad. Fotoğraf. Not. Adres. Dördü de sohbete girmez. Çocuğun adına hesap açmazsın.

Saat 19:40. Yarın öğretmenle kısa bir görüşme var. Telefonunda sohbet kutusu açık. Ekranın altında bir yazı satırı durur. Gönder düğmesine basınca o satır, modelin olduğu yere gider.

Masanın üzerinde dört şey duruyor. Hepsi ders için uydurulmuştur.

Birincisi bir ad. Ayşe Demir.

İkincisi bir fotoğraf. Çocuğun yüzü görünüyor. Fotoğrafın köşesinde de aynı ad yazıyor.

Üçüncüsü bir not. Matematik 45.

Dördüncüsü bir adres. Çınar Sokak No 14, Daire 3.

Elinde şöyle bir satır duruyor. «Kızım Ayşe Demir. Adres: Çınar Sokak No 14, Daire 3. Yüzünün olduğu fotoğrafı ekledim. Matematik notu 45. Öğretmene nazik bir mesaj yaz.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme. Fotoğrafı da ekleme.

Ad kutuya gidince satır tek bir çocuğu işaret eder. Model, kitaptaki cümleyi adsız da kurar. Eylem şudur. Adı kâğıtta bırakırsın. Kutuya yazmazsın. Sonuç şudur. Sohbet, çocuğun adını taşımaz.

Fotoğraf bir resim gibi durur. Yüz, adı yazmasan da kişiyi gösterir. Köşede ad varsa o ad da gider. Model, iki basamaklı toplama için yüze bakmaz. Eylem şudur. Kareyi eklemezsin. Cümleyi sen yazarsın. Sonuç şudur. Yüz ve köşedeki ad evde kalır.

45, bu çocuğun matematik sonucudur. Çalışma satırı, kitaptaki cümleden kurulur. 45 olmadan da kurulur. Not kutuya gidince sonuç, okul defterinin dışında bir kopya olur. Öğretmen notu okulda görür. Eylem şudur. 45'i yazmazsın. Sonuç şudur. Not, okul defterinde kalır.

Sokak ve daire, çocuğun nerede kaldığını söyler. Model cümleyi sokaksız da yazar. Adres kutuya gidince sokak ve daire sohbette durur. Eylem şudur. Adresi yazmazsın. Sonuç şudur. Sokak ve daire evde kalır.

Dördünü birden gönderirsen model akıcı bir mesaj kurar. Mesaj adı, notu ve adresi tekrar eder. Fotoğraftaki yüzü de okumuş olur. O mesajı öğretmene iletirsen kayıt, evdeki sohbetten çıkmış olur. Ekrandan silmek, gönderilmiş satırı geri çağırmaz.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Okulun onayladığı araç hangisi? Okul bir panel yazmışsa dosya orada kalır. Okulun yazılı kuralı varsa o kural okulda durur. Onaylı araç yoksa çocuğun dosyasını kişisel sohbet hesabına taşıma. Fotoğrafı da taşıma. Adresi de taşıma.

İkinci soru veri sınıfıdır. Ad, fotoğraf, not ve adres kişisel veridir. Dördü açık hâliyle kutuya girmez. Açık olan sayfadaki cümle, kimliği çıkarılmış bir örnektir. «Ayşe Demir», kare, 45 ve Çınar Sokak bir kayıttır. Kayıt kutuda durmaz.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. İkisi de yoksa son çare, kimliği çıkarılmış kısa örnektir. Fotoğraf bu kısa örneğin içine gizlenmez. Ad, not ve adres de gizlenmez. Örnek, sayfadaki cümleyi gösterir. Çocuğun dosyasının yerini tutmaz.

## DÖRT PARÇA

İstemi şimdi dört parçayla yaz. Rol, işin sahibidir. Görev, tek iştir. Biçim, çıktının şeklidir. Kısıt, modelin taşmayacağı çizgidir.

İstemi şöyle yaz.

Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi kâğıdında yapacağı iki kısa satıra çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: ad yazma. Fotoğraf isteme. Fotoğrafı tarif etme. Not yazma. Adres yazma. Okul adı yazma. Cümle: İki basamaklı sayıları alt alta yazıp toplarsın.

Rolü başa koyarsın. Görev tek başına «mesaj yaz» diye kalırsa model, kutuya koyduğun adı ve adresi cümleye taşır. Bu işin sahibi velidir. Çocuğun adını role yazma.

Görev tek kalır. «Satır kur, notu ekle, adresi yaz, öğretmene mesaj yaz» dört iştir. Dört iş tek kutuda birbirine bulaşır. Bu istemde tek görev vardır. Görev, iki kısa satır kurmaktır. Notu sen okulda bırakırsın. Adresi sen kâğıtta bırakırsın.

Biçim, şekli söyler. İki kısa satır, çocuğun okuyacağı listedir. «Nazik bir mesaj olsun» dersen model adı ve notu cümleye seçer. Biçimi sen yazarsın.

Kısıt, dört kaydı kutunun dışında tutma kuralıdır. Ad yok. Fotoğraf yok. Not yok. Adres yok. Okul adı yok.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. Fotoğrafı da eklersin. «Kızım Ayşe Demir. Adres: Çınar Sokak No 14, Daire 3. Yüzünün olduğu fotoğrafı ekledim. Matematik notu 45. Öğretmene nazik bir mesaj yaz.» Model akıcı bir paragraf yazar. Paragrafın içinde Ayşe Demir durabilir. 45 durabilir. Çınar Sokak No 14 durabilir. «Fotoğraftaki öğrenci için» diye bir satır durabilir. Bu paragrafı öğretmene iletirsen ad, not ve sokak evden çıkmış olur. Düzgün cümle, gönderilmiş fotoğrafı geri çağırmaz.

Doğru işi de ekranda gör. Adı, fotoğrafı, notu ve adresi kâğıtta bırakırsın. Kitabı yanında tutarsın. Sohbete şunu yazarsın. «Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi kâğıdında yapacağı iki kısa satıra çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: ad yazma. Fotoğraf isteme. Fotoğrafı tarif etme. Not yazma. Adres yazma. Okul adı yazma. Cümle: İki basamaklı sayıları alt alta yazıp toplarsın.»

Model iki satır verir. Birinci satır: İki basamaklı sayıları alt alta yazıp toplarsın. İkinci satır: iki basamaklı iki sayı seç ve toplamı kendi kâğıdına yaz. Satırda ad yoktur. Fotoğraf tarifi yoktur. 45 yoktur. Sokak yoktur. Sen iki satırı okursun. Ad görürsen silersin. Fotoğraf görürsen silersin. Not görürsen silersin. Adres görürsen silersin. Dört türden biri duruyorsa o satırı çocuğa okumazsın.

Öğretmen masasında aynı dört kayıt durur. Saat 08:20. Masada sınıf listesi var. Sınıf fotoğrafı var. Not çizelgesi var. Gezi kâğıdında ev adresleri var. Dördünü de kişisel sohbete yapıştırmazsın. Fotoğrafı eklemezsin. Role sınıf öğretmeni yazarsın. Göreve şunu yazarsın. Verdiğim cümleyi iki kısa satıra çevir. Biçime iki satır yazarsın. Kısıta şunu yazarsın. Öğrenci adı yazma. Fotoğraf isteme. Not yazma. Adres yazma. Cevabı şöyle okursun. Birinci satır kitaptaki cümledir. İkinci satır: öğrenci iki sayı seçer ve toplamı kendi defterine yazar. Ad belirdiyse tahtaya yazmazsın. Not belirdiyse yazmazsın. Adres belirdiyse yazmazsın. Model sınıf listesini senin yerine okumaz.

Hesabı açan e-posta yetişkinindir. Çocuğun adına veya okul postasıyla hesap açılmaz.

## CEBİNE KOY

Üç adımı cebine koy.

1. Yazmadan önce okulun onayladığı araca bak. Onaylı araç yoksa çocuk dosyasını, fotoğrafı ve adresi kişisel sohbete taşıma.
2. Addan, fotoğraftan, nottan ve adresten boş bir cümle yaz. Cümleyi açık olan sayfadan sen seç.
3. Gelen satırda ad, fotoğraf tarifi, not veya adres varsa o satırı sil. Dört türden biri duruyorsa çocuğa okuma.

## SIRA SENDE

Bugün sohbet kutusunu aç. Gerçek çocuk adı yazma. Gerçek fotoğraf ekleme. Gerçek not yazma. Gerçek adres yazma. Elindeki kitaptan tek bir cümle seç. Şunu gönder. «Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi kâğıdında yapacağı iki kısa satıra çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: ad yazma. Fotoğraf isteme. Fotoğrafı tarif etme. Not yazma. Adres yazma. Okul adı yazma.» Cümlenin yerine, sayfada gördüğün cümleyi yaz.

Cevabı oku. Ad, fotoğraf tarifi, not veya adres belirdiyse o satırı sil. İki satırı çocuğa ancak ondan sonra oku. Çocuk cümleyi kendisi yazsın. Bu alıştırmanın notu yok. Amaç, dört kaydın kutuda durup durmadığını kendi gözünle görmendir.

Sıradaki derste çocuk kendi cümlesini yazar. Model, teslim metninin yerini tutmaz. Bu derste sınır durur. Ad, fotoğraf, not ve adres kutuya girmez.
`,
};
