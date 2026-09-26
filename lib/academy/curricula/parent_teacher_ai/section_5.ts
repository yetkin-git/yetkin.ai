import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 5 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz.
 */
export const parentTeacherAiSection5: Section = {
  sectionNumber: 5,
  lessonKey: "parent_teacher_ai-5",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Ödev ve Proje: Öğrenci Yazar, Model Taslak Önerir",
  targetDurationMinutes: 10,
  estimatedWordCount: 1360,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye, bitmiş teslim paragrafının modelden kopyalanmadığını göstermek. Model yalnız fikir ve üç satırlık taslak listesi kurar. Liste üçüncü satırda biter. Çocuğun kendi cümlesi kâğıtta kalır. Kâğıtta olmayan sayı silinir. Sıra: okul politikası, veri sınıfı, aktarım yolu.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. Geçen derste adı, fotoğrafı, notu ve adresi kutunun dışında bıraktın. Bu dersin sonunda çocuğun kendi cümlesini kâğıtta tutacaksın. Modelden bitmiş teslim paragrafı kopyalamayacaksın. Model yalnız fikir ve taslak listesi kuracak. Çocuğun adına hesap açmazsın.

Saat 19:15. Yarın ödev gidecek. Defter açık. Çocuk cümleyi kendi eliyle yazmış. Cümle şudur. «34 ile 27'yi alt alta yazdım. Toplam 61.» 34 ile 27'nin toplamı 61'dir. Bu sayıları sen de toplarsın. 61, bir not değildir. 61, çocuğun kâğıdındaki toplamdır.

Telefonunda sohbet kutusu açık. Ekranın altında bir yazı satırı durur. Gönder düğmesine basınca o satır, modelin olduğu yere gider.

Elinde şöyle bir satır duruyor. Bu satır ders için uydurulmuştur. «Ayşe Demir, 5-B. Defterinde şu cümle var: 34 ile 27'yi alt alta yazdım. Toplam 61. Bunu teslim metnine çevir. Uzun ve düzgün bir ödev paragrafı yaz.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme.

Neden? Ad ve sınıf birlikte durunca satır tek bir çocuğu işaret eder. «Uzun ve düzgün bir ödev paragrafı yaz» dersen model, çocuğun cümlesinin yerine kendi paragrafını kurar. Paragraf akıcı durur. Çocuk o paragrafı deftere geçirirse öğretmene giden metin çocuğun cümlesi olmaz. Öğretmen, kimin yazdığını ayıramaz.

Eylem şudur. Parmağını gönderden çekersin. Adı kâğıtta bırakırsın. Bitmiş paragraf istemezsin. İstemi, fikir ve üç satırlık bir taslak listesi olarak yazarsın. Çocuğun cümlesi defterde durur. Sonuç şudur. Teslim metni, «34 ile 27'yi alt alta yazdım. Toplam 61.» cümlesi olarak gider. Modelin paragrafı okula gitmez.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Okulun onayladığı araç hangisi? Okul bir panel yazmışsa taslak listesi orada kalır. Okulun yazılı kuralı varsa o kural okulda durur. Onaylı araç yoksa çocuğun defterinin fotoğrafını kişisel sohbet hesabına taşıma.

İkinci soru veri sınıfıdır. Ad, fotoğraf, not ve adres kişisel veridir. Dördü açık hâliyle kutuya girmez. Defterin fotoğrafında ad varsa o kare de gitmez. «34 ile 27'yi alt alta yazdım. Toplam 61.» kimliği çıkarılmış bir örnektir. 45 bu örnekte yoktur. 45, geçen dersteki nottur. Not kutuda durmaz.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. İkisi de yoksa son çare, kimliği çıkarılmış kısa örnektir. Fotoğraf bu kısa örneğin içine gizlenmez. Örnek, çocuğun cümlesinin şeklini gösterir. Defterin yerini tutmaz.

## DÖRT PARÇA

İstemi şimdi dört parçayla yaz. Rol, işin sahibidir. Görev, tek iştir. Biçim, çıktının şeklidir. Kısıt, modelin taşmayacağı çizgidir.

İstemi şöyle yaz.

Rol: evde çalışan bir veli. Görev: çocuğun kendi cümlesi dururken, onun yeniden yazacağı üç satırlık bir taslak listesi kur. Listeye bir fikir de ekle. Fikir, yapılacak bir iş olsun. Biçim: üç kısa satır ve satırların altında tek bir fikir. Her satır, çocuğun kendi cümlesiyle yazacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf, not, fotoğraf ve adres yazma. Bitmiş teslim paragrafı yazma. Çocuğun cümlesini değiştirme. Yeni sayı yazma. Cümle: 34 ile 27'yi alt alta yazdım. Toplam 61.

Rolü başa koyarsın. Görev tek başına «ödevi yaz» diye kalırsa model teslim paragrafını üretir. Bu işin sahibi velidir. Çocuğun adını role yazma.

Görev tek kalır. «Taslak kur, paragrafı yaz, öğretmene mesaj yaz» üç iştir. Üç iş tek kutuda birbirine bulaşır. Bu istemde tek görev vardır. Görev, taslak listesi kurmaktır. Bitmiş paragraf bu görev değildir.

Biçim, şekli söyler. Üç kısa satır, yapılacak işlerin listesidir. Listenin altındaki fikir de bir iştir. «Güzel bir ödev olsun» dersen model paragraf seçer. Biçimi sen yazarsın.

Kısıt, teslimi kutunun dışında tutma kuralıdır. Ad yok. Not yok. Bitmiş paragraf yok. Çocuğun cümlesi değişmez. 34, 27 ve 61 kâğıtta durur. Başka sayı yazılmaz.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. «Kızım Ayşe Demir, 5-B. Cümlesi şu: 34 ile 27'yi alt alta yazdım. Toplam 61. Bunu teslim metnine çevir. Uzun ve düzgün bir ödev paragrafı yaz.» Model akıcı bir paragraf yazar. Paragraf şöyle durabilir. «Öğrenci iki basamaklı sayıları düzenli biçimde alt alta yazmıştır. 34 ile 27 toplandığında sonuç 61 olur. Bu çalışma toplama becerisinin geliştiğini gösterir.»

«Geliştiğini gösterir» çocuğun cümlesi değildir. Modelin cümlesidir. Çocuk bu paragrafı deftere geçirirse «34 ile 27'yi alt alta yazdım» okula kendi satırı olarak gitmez. Öğretmen «geliştiğini gösterir» diye bir cümle okur. Çocuk o cümleyi yazmamıştır. Model 71 yazarsa o da kâğıtta yoktur. 34 ile 27'yi sen toplarsın. Toplam 61'dir. 71'i silersin. Düzgün paragraf, deftere geçirilmiş cümleyi geri çağırmaz. Paragrafı baştan kopyalamazsın.

Doğru işi de ekranda gör. Adı, fotoğrafı, notu ve adresi kâğıtta bırakırsın. Defterin fotoğrafını eklemezsin. Sohbete şunu yazarsın. «Rol: evde çalışan bir veli. Görev: çocuğun kendi cümlesi dururken, onun yeniden yazacağı üç satırlık bir taslak listesi kur. Listeye bir fikir de ekle. Fikir, yapılacak bir iş olsun. Biçim: üç kısa satır ve satırların altında tek bir fikir. Her satır, çocuğun kendi cümlesiyle yazacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf, not, fotoğraf ve adres yazma. Bitmiş teslim paragrafı yazma. Çocuğun cümlesini değiştirme. Yeni sayı yazma. Cümle: 34 ile 27'yi alt alta yazdım. Toplam 61.»

Model bir liste verir. Birinci satır: hangi iki sayıyı seçtiğini kendi cümlenle yaz. İkinci satır: sayıları alt alta nasıl yazdığını kendi cümlenle yaz. Üçüncü satır: toplamı kendi cümlenle yaz. Fikir: toplamı bir de elinle yeniden say. Listenin altında bir çizgi çekersin. Taslak bu çizgide biter.

Çizginin altında defter durur. Defterde şu cümle durur. «34 ile 27'yi alt alta yazdım. Toplam 61.» Bu cümle listenin yerine geçmez. Liste bir iş listesidir. Liste teslim metni değildir. Üç satırı deftere ödev diye geçirmezsin.

Model çizginin altına bir paragraf daha eklerse o paragraf çizgiyi aşmıştır. Paragrafı silersin. Çocuğa ödev diye okumazsın. Model cümleyi şöyle değiştirirse onu da silersin. «İki basamaklı 34 ve 27 sayılarını alt alta yazarak topladım ve 61 sonucuna ulaştım.» Bu, çocuğun cümlesi değildir. Defterdeki cümle yerinde kalır.

Fikir, yapılacak bir iştir. Çocuk toplamı eliyle yeniden sayarsa kendi cümlesini kendisi yazar. «Toplamı parmaklarımla yeniden saydım. Yine 61.» Bu cümle çocuğundur. Model bu cümleyi vermez. Çocuk saymazsa fikir kâğıda cümle olmaz. Yapılmamış işi yapılmış gibi yazmazsın.

Çizgiyi şöyle ayırırsın. Solda defter durur. Defterde çocuğun paragrafı vardır. Sağda ayrı bir kâğıt durur. O kâğıtta üç satır ve bir fikir vardır. Taslak, üçüncü satırın altındaki çizgide biter. Defterde olmayan cümle okula gitmez.

Öğretmen masasında aynı çizgi durur. Saat 08:20. Önünde bir öğrenci kâğıdı vardır. Kâğıtta öğrencinin cümlesi durur. Kâğıdı kişisel sohbete yapıştırmazsın. Öğrencinin adını yazmazsın. Role sınıf öğretmeni yazarsın. Göreve şunu yazarsın. Bu cümle dururken üç satırlık bir kontrol listesi kur. Biçime üç kısa satır yazarsın. Kısıta şunu yazarsın. Öğrencinin teslim cümlesini yeniden yazma. Yeni paragraf yazma. Öğrenci adı, not ve fotoğraf yazma. Cevabı şöyle okursun. Birinci satır: liste üçüncü satırda biter. İkinci satır: kâğıttaki cümle öğrencinin cümlesidir. Üçüncü satır: sayılar kâğıttaki sayılardır. Sonra kâğıda sen bakarsın. 34 ve 27 duruyorsa toplamı sen yaparsın. Toplam 61'dir. Model başka toplam yazmışsa o satırı silersin. Model cümlesini öğrencinin kâğıdına geçirmezsin. Öğrencinin yerine teslim ettirmezsin.

Hesabı açan e-posta yetişkinindir. Çocuğun adına veya okul postasıyla hesap açılmaz.

## CEBİNE KOY

Üç adımı cebine koy.

1. Yazmadan önce okulun onayladığı araca bak. Onaylı araç yoksa çocuğun defterini ve fotoğrafını kişisel sohbete taşıma.
2. Çocuğun cümlesini ad, not ve adres eklemeden olduğu gibi bırak. Bitmiş paragraf isteme. Üç satırlık taslak listesi ve tek bir fikir iste.
3. Üçüncü satırın altına çizgi çek. Çizginin altındaki paragrafı sil. Kâğıtta olmayan sayıyı sil. Teslim cümlesini çocuk kendi eliyle yazsın.

## SIRA SENDE

Bugün sohbet kutusunu aç. Gerçek çocuk adı yazma. Gerçek fotoğraf ekleme. Gerçek not yazma. Gerçek adres yazma. Şunu gönder. «Rol: evde çalışan bir veli. Görev: çocuğun kendi cümlesi dururken, onun yeniden yazacağı üç satırlık bir taslak listesi kur. Listeye bir fikir de ekle. Fikir, yapılacak bir iş olsun. Biçim: üç kısa satır ve satırların altında tek bir fikir. Her satır, çocuğun kendi cümlesiyle yazacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf, not, fotoğraf ve adres yazma. Bitmiş teslim paragrafı yazma. Çocuğun cümlesini değiştirme. Yeni sayı yazma. Cümle: 34 ile 27'yi alt alta yazdım. Toplam 61.»

Cevabı oku. Üçüncü satırın altına çizgi çek. Çizginin altında paragraf varsa sil. Çocuğun cümlesi değişmişse o satırı sil. 61 yerine başka bir toplam varsa sil. Listeyi çocuğa ancak ondan sonra oku. Çocuk teslim cümlesini kendisi yazsın. Bu alıştırmanın notu yok. Amaç, çocuğun paragrafı dururken taslağın nerede bittiğini kendi gözünle görmendir.

Sıradaki derste evdeki kural ile okulun yazılı kuralı yan yana durur. İkisi çatışırsa okulun kâğıdı esas alınır. Bu derste sınır durur. Model, teslim metninin yerini tutmaz.
`,
};
