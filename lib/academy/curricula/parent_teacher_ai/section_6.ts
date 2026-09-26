import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 6 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz. Modülün kapanış dersidir.
 */
export const parentTeacherAiSection6: Section = {
  sectionNumber: 6,
  lessonKey: "parent_teacher_ai-6",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Veli–Öğretmen Konuşması: Ev Kuralı, Okul Kuralı",
  targetDurationMinutes: 10,
  estimatedWordCount: 1327,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye, evdeki sohbet kuralı ile okulun yazılı kuralı çatışınca okul kuralının esas alındığını göstermek. Konuşma sen dilindedir. Üç kısa cümle dilekçenin yerini tutar. Sayın ve siz bu konuşmada yazılmaz. Çocuğun adı, fotoğrafı, notu ve adresi kutuya girmez.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. Geçen derste taslak listesini üçüncü satırda bitirdin. Çocuğun cümlesi defterde kaldı. Bu dersin sonunda ev kuralını ve okul kuralını sen diye söyleyeceksin. İki kural çatışırsa okulun yazılı kuralını esas alacaksın. Çocuğun adına hesap açmazsın.

Saat 18:50. Yarın ödev gidecek. Masanın üzerinde iki kâğıt duruyor. İkisi de ders için uydurulmuştur.

Birinci kâğıt ev notudur. Notu sen yazmışsın. «Ev kuralı: Taslak listesi için kutu açılabilir. Liste üçüncü satırda biter. Teslim cümlesi çocuğun cümlesidir.»

İkinci kâğıt okulun ödev kâğıdıdır. «Okul kuralı: Bu ödevde sohbet aracı kullanılmaz. Metni öğrenci kendi eliyle yazar.»

Bu iki kural çatışır. Ev notu kutuyu açar. Okul kâğıdı bu ödevde kutuyu kapatır.

Telefonunda sohbet kutusu açık. Ekranın altında bir yazı satırı durur. Gönder düğmesine basınca o satır, modelin olduğu yere gider.

Elinde şöyle bir satır duruyor. «Evde taslak serbest. Okul kâğıdı sohbet aracını kapatmış. Okul kuralını yumuşat. Öğretmene, ev kuralımızın yeterli olduğunu söyleyen bir yazı yaz. Sayın öğretmenim diye başla.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme.

Neden? Okul kâğıdı bu ödevde sohbet aracını kapatmıştır. Ev notu o kâğıdın önüne geçmez. «Yumuşat» dersen model, okul cümlesini değiştiren bir mektup kurar. Mektup akıcı durur. Mektubu öğretmene iletirsen ev kuralını, okulun yazılı kuralının üstüne koymuş olursun. Öğretmen kâğıdı açar. Kâğıtta hâlâ «sohbet aracı kullanılmaz» yazar.

Eylem şudur. Parmağını gönderden çekersin. Bu ödevde kutuyu açmazsın. Ev kuralını ve okul kuralını sen diye, üç kısa cümleyle söylersin. Mektup istemezsin. Sonuç şudur. Çocuk metni kendi eliyle yazar. Defterde «34 ile 27'yi alt alta yazdım. Toplam 61.» durur. Dünün taslak listesi bu kâğıda geçmez.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Bu ödevin yazılı kuralı nedir? Kuralı, kutuyu açmadan önce okursun. Kâğıt sohbet aracını kapatıyorsa kişisel sohbet açılmaz. Okul bir panel yazmışsa ve bu kâğıt paneli açıyorsa iş orada kalır. Bu kâğıt paneli de kapatıyorsa panel de açılmaz. Onaylı araç yoksa çocuk dosyası kişisel sohbete gitmez.

İkinci soru veri sınıfıdır. Ad, fotoğraf, not ve adres kişisel veridir. Dördü açık hâliyle kutuya girmez. İki kural, kaydı kutuya koymak için bir sebep değildir. Ev notunda ad yoktur. Okul kâğıdındaki örnekte ad yoktur. «Ayşe Demir» bir kayıttır. Kayıt bu konuşmaya girmez.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. Bu ödevin kâğıdı sohbet aracını kapatıyorsa ikisi de durur. Kısa örnek de durur. Çocuk kalemi eline alır. Kısa örnek, kapanmış kâğıdın yerini tutmaz.

## DÖRT PARÇA

Konuşmayı şimdi dört parçayla kur. Rol, işin sahibidir. Görev, tek iştir. Biçim, çıktının şeklidir. Kısıt, modelin taşmayacağı çizgidir.

İstemi şöyle yaz.

Rol: evde çalışan bir veli. Görev: ev kuralı ile okulun yazılı kuralını üç kısa konuşma cümlesine çevir. Çatışırlarsa okulun yazılı kuralı esas olsun. Biçim: üç cümle. Konuşma dili sen olsun. Mektup olmasın. Kısıt: Sayın diye başlama. Siz diye yazma. Çocuğun adını, notunu, fotoğrafını ve adresini yazma. Okul kuralının cümlesini değiştirme. Ev kuralını okul kuralının üstüne koyma. Ev kuralı: Taslak listesi için kutu açılabilir. Liste üçüncü satırda biter. Teslim cümlesi çocuğun cümlesidir. Okul kuralı: Bu ödevde sohbet aracı kullanılmaz. Metni öğrenci kendi eliyle yazar.

Rolü başa koyarsın. Görev tek başına «öğretmene yazı yaz» diye kalırsa model mektup üretir. Bu işin sahibi velidir. Çocuğun adını role yazma.

Görev tek kalır. «Cümle kur, kuralı yumuşat, mektup yaz» üç iştir. Üç iş tek kutuda birbirine bulaşır. Bu istemde tek görev vardır. Görev, üç konuşma cümlesi kurmaktır. Mektup bu görev değildir.

Biçim, şekli söyler. Üç cümle, söyleyeceğin konuşmadır. «Resmî bir dilekçe olsun» dersen model siz seçer. Bu iş bir konuşmadır. Dilekçe bu dersin işi değildir. Konuşurken sen dersin. Biçimi sen yazarsın.

Kısıt, okul kâğıdını yerinde tutma kuralıdır. Sayın yok. Siz yok. Ad yok. Okul cümlesi değişmez. Ev notu, kâğıdın üstüne yazılmaz.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. «Kızım Ayşe Demir. Evde taslak serbest. Okul kâğıdı sohbet aracını kapatmış. Okul kuralını yumuşat. Öğretmene mektup yaz. Sayın öğretmenim diye başla.» Model akıcı bir mektup yazar. Mektup şöyle durabilir. «Sayın öğretmenim, evde belirlediğimiz kural bu ödev için yeterlidir. Sohbet aracını kullanmamızda bir sakınca görmemenizi rica ederiz.»

Bu bir mektuptur. Mektup siz der. «Görmemenizi» sizdir. Konuşma sen der. Mektup, ev kuralını okul kâğıdının üstüne koyar. Bu mektubu öğretmene iletme. İletirsen öğretmen kâğıdı açar. Kâğıtta «sohbet aracı kullanılmaz» durur. Akıcı mektup o cümleyi silmez. Ekrandan silmek, iletilmiş mektubu geri çağırmaz.

Doğru işi de ekranda gör. Adı, fotoğrafı, notu ve adresi kâğıtta bırakırsın. Bu ödevde kutuyu, okul kâğıdını okuduktan sonra kapalı tutarsın. Üç cümleyi sen söylersin. Birinci cümle: evde taslak listesi üçüncü satırda biter ve teslim cümlesi çocuğun cümlesidir. İkinci cümle: bu ödevin kâğıdında sohbet aracı kullanılmaz yazıyor. Üçüncü cümle: iki kural çatışıyor, bu ödevde okulun kâğıdı durur, kutu açılmaz.

Bu üç cümle mektup değildir. Sayın yoktur. Siz yoktur. Ad yoktur. Okul cümlesi değişmemiştir. Çocuk kalemi alır. «34 ile 27'yi alt alta yazdım. Toplam 61.» cümlesini kendi eliyle yazar. Dünün listesi deftere geçmez.

Öğretmen bu üç cümleyi sen diye duyar. Öğretmen de sen der. Birinci cümle: bu ödevin kâğıdında sohbet aracı kullanılmaz. İkinci cümle: evdeki taslak kuralı bu kâğıdı değiştirmez. Üçüncü cümle: öğrenci metni kendi eliyle yazar. Model bu üç cümleyi senin yerine öğretmene iletmez. Kâğıdı sen okursun.

Öğretmen masasında aynı iki kural durur. Saat 08:20. Veli notunu kişisel sohbete yapıştırmazsın. Öğrencinin adını yazmazsın. Role sınıf öğretmeni yazarsın. Göreve şunu yazarsın. Ev kuralı ile okulun yazılı kuralını üç kısa konuşma cümlesine çevir. Biçime üç cümle yazarsın. Konuşma dili sen olsun. Kısıta şunu yazarsın. Sayın diye başlama. Siz yazma. Okul kuralının cümlesini değiştirme. Öğrenci adı, not ve fotoğraf yazma. Cevabı şöyle okursun. Birinci cümle, kâğıtta sohbet aracının kullanılmayacağını söyler. İkinci cümle, ev notunun kâğıdı değiştirmediğini söyler. Üçüncü cümle, öğrencinin kendi eliyle yazacağını söyler. Üçünden biri mektuba dönerse o cümleyi söylemezsin. Model veli toplantısını senin yerine yapmaz.

İki kural aynı şeyi söylüyorsa çatışma yoktur. Başka bir ödev kâğıdı şöyle durabilir. «Öğrenci kendi cümlesini yazar. Taslak listesi evde kalabilir. Bitmiş paragraf kopyalanmaz.» Ev notun da bunu söyler. O zaman ikisini birden uygularsın. Kutu, taslak listesi için açılabilir. Liste yine üçüncü satırda biter. Teslim cümlesi yine çocuğun cümlesidir. Bu kâğıt, kapalı olan ödev kâğıdının yerini tutmaz. Kapalı kâğıt dururken kutu açılmaz.

Hesabı açan e-posta yetişkinindir. Çocuğun adına veya okul postasıyla hesap açılmaz.

## CEBİNE KOY

Üç adımı cebine koy.

1. Ödev kâğıdındaki yazılı kuralı, kutuyu açmadan önce oku. Kâğıt sohbet aracını kapatıyorsa bu ödevde kutuyu açma.
2. Ev kuralını ve okul kuralını sen diye, üç kısa cümleyle söyle. Mektup isteme. Sayın ve siz yazma.
3. İki kural çatışırsa okulun yazılı kuralını esas al. Evdeki taslak alışkanlığını bu kâğıdın önüne geçirme. Çocuk cümleyi kendi eliyle yazsın.

## SIRA SENDE

Bugün iki kısa notu masaya koy. Biri ev notun olsun. Biri bu dersteki okul kâğıdı olsun. Elinde gerçek bir ödev kâğıdı varsa önce onu oku. Okul kuralını sen uydurma. Gerçek çocuk adı yazma. Gerçek not yazma. Gerçek fotoğraf ekleme. Gerçek ödev kâğıdı sohbet aracını kapatıyorsa o ödev için kutuyu açma. Bu alıştırma, dersteki uydurma kâğıtla yapılır.

Şunu gönder. «Rol: evde çalışan bir veli. Görev: ev kuralı ile okulun yazılı kuralını üç kısa konuşma cümlesine çevir. Çatışırlarsa okulun yazılı kuralı esas olsun. Biçim: üç cümle. Konuşma dili sen olsun. Mektup olmasın. Kısıt: Sayın diye başlama. Siz diye yazma. Çocuğun adını, notunu, fotoğrafını ve adresini yazma. Okul kuralının cümlesini değiştirme. Ev kuralını okul kuralının üstüne koyma. Ev kuralı: Taslak listesi için kutu açılabilir. Liste üçüncü satırda biter. Teslim cümlesi çocuğun cümlesidir. Okul kuralı: Bu ödevde sohbet aracı kullanılmaz. Metni öğrenci kendi eliyle yazar.»

Cevabı oku. Sayın varsa sil. Siz varsa sil. Ev kuralı okul kâğıdının üstüne yazılmışsa o cümleyi sil. Üç cümleyi ancak ondan sonra sesli söyle. Öğretmenle görüşmen varsa aynı üç cümleyi sen diye söyle. Çocuk, kâğıt kutuyu kapattıysa metni kendi eliyle yazsın. Bu alıştırmanın notu yok. Amaç, çatışınca hangi kâğıdın durduğunu kendi kulağınla duymandır.

Bu modülün altı dersi burada biter. Sohbet kutusu okul dosyası değildir. İstem dört parçadır. Sayfada olmayan cümle silinir. Ad, fotoğraf, not ve adres kutuya girmez. Taslak listesi üçüncü satırda biter. Teslim cümlesi çocuğun cümlesidir. Ev kuralı ile okul kuralı çatışırsa okulun yazılı kuralı durur. Çocuğun adına hesap açılmaz.
`,
};
