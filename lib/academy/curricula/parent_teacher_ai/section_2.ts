import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 2 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz.
 */
export const parentTeacherAiSection2: Section = {
  sectionNumber: 2,
  lessonKey: "parent_teacher_ai-2",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Dört Parça: Rol, Görev, Biçim, Kısıt",
  targetDurationMinutes: 8,
  estimatedWordCount: 1012,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye ödev veya ders kurgusunu dört parçalı isteme dökmesini göstermek. Parçalar: rol, görev, biçim, kısıt. Çocuğun adı, okulu, sınıfı ve notu isteme girmez. Model teslim metnini çocuğun yerine yazmaz.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. İlk derste sohbet kutusunun sınırını gördün. Bu dersin sonunda o sınırın içinde bir çalışma iskeletini dört parçayla yazacaksın. Dört parça şunlar: rol, görev, biçim, kısıt. Çocuğun adını bu isteme yazmayacaksın. Ödevi çocuğun yerine bu kutuya yazdırmayacaksın.

Saat 19:40. Yarın okula bir matematik çalışması gidecek. Evde on dakikalık bir tekrar kurmak istiyorsun. Telefonunda sohbet kutusu açık. Ekranın altında bir yazı satırı durur. Gönder düğmesine basınca o satır, modelin olduğu yere gider.

Elinde şöyle bir satır duruyor. Bu satır ders için uydurulmuştur. «Ayşe Demir, 5-B, Çınar İlkokulu. İki basamaklı toplamada zorlanıyor. Ödevi onun yerine yaz. Teslim metnini ver.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme.

Neden? Ad, sınıf ve okul birlikte durunca satır tek bir çocuğu işaret eder. Bu üçü kişisel veridir. «Onun yerine yaz» dersen model teslim paragrafını üretir. Çocuk o paragrafı okula taşırsa çalışmayı kendisi yapmamış olur. Öğretmen o satırdan kimin yazdığını ayıramaz.

Eylem şudur. Parmağını gönderden çekersin. Gerçek adı, sınıfı ve okulu kutunun dışında bırakırsın. İstemi, çocuğun kendi eliyle yapacağı bir çalışma iskeleti olarak yazarsın. Sonuç şudur. Çocuğun kaydı evdeki sohbette kopya bırakmaz. Teslim metni çocuğun kâğıdında kalır. Model yalnız iskeleti görür.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Okulun onayladığı araç hangisi? Okul bir panel yazmışsa ödev ve ders notu orada kalır. Okulun yazılı kuralı varsa o kural okulda durur. Onaylı araç yoksa çocuğun dosyasını kişisel sohbet hesabına taşıma.

İkinci soru veri sınıfıdır. Çocuğun adı, okulu, sınıfı, notu, fotoğrafı, adresi ve sağlık notu kişisel veridir. Bunlar açık hâliyle kutuya girmez. «İki basamaklı toplamada zorlanan bir öğrenci» bir örnektir. «Ayşe Demir, 5-B, Çınar İlkokulu» bir kayıttır. Kayıt kutuda durmaz.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. İkisi de yoksa son çare, kimliği çıkarılmış kısa örnektir. Gerçek öğrenci satırı bu kısa örneğin içine gizlenmez. Örnek, işin şeklini gösterir. Sınıf listesinin yerini tutmaz.

## DÖRT PARÇA

İskeleti şimdi dört parçayla yaz. Rol, işin sahibidir. Görev, tek iştir. Biçim, çıktının şeklidir. Kısıt, modelin taşmayacağı çizgidir.

İstemi şöyle yaz.

Rol: evde çalışan bir veli. Görev: iki basamaklı toplama için on dakikalık bir çalışma iskeleti kur. Biçim: dört kısa yönerge. Her yönerge çocuğun kendi eliyle yapacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf ve not yazma. Teslim edilecek paragrafı yazma. Çocuğun yerine cevap üretme.

Rolü başa koyarsın. Görev tek başına «ödev yaz» diye kalırsa model teslim metnini üretir. Bu işin sahibi velidir. Çocuğun adını role yazma. «Ayşe'nin velisi» yazarsan satır yine tek çocuğu işaret eder.

Görev tek kalır. «İskelet kur, ödevi yaz, öğretmene mesaj yaz» üç iştir. Üç iş tek kutuda birbirine bulaşır. Bu istemde tek görev vardır. Görev, çalışma iskeleti kurmaktır. Teslim metni bu görev değildir. Öğretmene giden mesaj ayrı istemdir.

Biçim, şekli söyler. Dört kısa yönerge, çocuğun okuyacağı listedir. «Güzel bir ödev olsun» dersen model paragraf seçer. Biçimi sen yazarsın.

Kısıt, kaydı ve teslimi kutunun dışında tutma kuralıdır. İsim yok. Okul yok. Sınıf yok. Not yok. Bitmiş paragraf yok. Çocuk her yönergeyi kendi kâğıdında yapar.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. «Kızım Ayşe Demir, 5-B, Çınar İlkokulu. İki basamaklı toplamada zorlanıyor. Ödevi onun yerine yaz. Yarın teslim edeceği paragrafı ver.» Ad, sınıf ve okul evden çıkar. Model akıcı bir paragraf yazar. Paragrafın içinde çocuğun adı durabilir. Çocuk o metni aynen deftere geçirirse çalışma onun cümlesi olmaz. Düzgün cümle, gönderilmiş adı kutudan çıkarmaz. Sohbeti ekrandan silmen, gönderilmiş satırı geri çağırmaz.

Doğru işi de ekranda gör. Gerçek adı, sınıfı ve okulu kâğıtta bırakırsın. Sohbete şunu yazarsın. «Rol: evde çalışan bir veli. Görev: iki basamaklı toplama için on dakikalık bir çalışma iskeleti kur. Biçim: dört kısa yönerge. Her yönerge çocuğun kendi eliyle yapacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf ve not yazma. Teslim edilecek paragrafı yazma.»

Model dört yönerge verir. Birinci yönerge: iki basamaklı iki sayı seç. İkinci yönerge: toplamı kendi kâğıdına yaz. Üçüncü yönerge: sonucu bir de elinle yeniden topla. Dördüncü yönerge: kâğıdı kendin okula götür. Yönergede ad yoktur. Okul adı yoktur. Not yoktur. Bitmiş bir teslim paragrafı yoktur. Sen yönergeleri okursun. Uygunsa çocuğa sen okursun. Çocuk sayıları kendisi seçer. Çocuk toplamı kendisi yazar. Bu yönergeleri, içine gerçek adı koyarak sohbete geri yapıştırmazsın. Notu da kutuya yazmazsın.

Öğretmen masasında aynı dört parça durur. Saat 08:20. Dersten önce bir açılış kurmak istiyorsun. Sınıf listesini yapıştırmazsın. Sınav kâğıdının fotoğrafını yapıştırmazsın. Role sınıf öğretmeni yazarsın. Göreve şunu yazarsın. İki basamaklı toplama için on dakikalık bir ders açılışı kur. Biçime dört kısa adım yazarsın. Kısıta şunu yazarsın. Öğrenci adı, okul adı, sınıf ve not yazma. Öğrencinin yerine cevap yazma. Cevabı şöyle okursun. Birinci adım: tahtaya iki basamaklı iki sayı yaz. İkinci adım: toplamı bir öğrenci kendi eliyle yapsın. Üçüncü adım: sonucu sınıf birlikte kontrol etsin. Dördüncü adım: öğrenci işlemi kendi defterine geçirsin. Adımda ad yoktur. Model dersi senin yerine anlatmaz. Sınıfı sen görürsün. Ödevi öğrencinin yerine yazdırıp teslim ettirmezsin.

Hesap yine senindir. Kutuyu açan e-posta yetişkinindir. Çocuğun adına hesap açılmaz. Çocuğun okul postasıyla hesap açılmaz. Bu dersin alıcısı yetişkin öğretmendir. Alıcı, yetişkin velidir.

## CEBİNE KOY

Üç adımı cebine koy.

1. Yazmadan önce okulun onayladığı araca bak. Onaylı araç yoksa çocuk dosyasını kişisel sohbete taşıma.
2. Addan, okul adından, sınıftan ve nottan boş bir örnek yaz. Role çocuğun adını koyma.
3. Dört parçayı aynı kutuya yaz. Gelen yönergeyi oku. Teslim paragrafı veya bir ad belirdiyse o satırı sil. Çalışmayı çocuk kendi kâğıdında yapsın.

## SIRA SENDE

Bugün sohbet kutusunu aç. Gerçek çocuk adı yazma. Okul adı yazma. Not yazma. Şunu gönder. «Rol: evde çalışan bir veli. Görev: iki basamaklı toplama için on dakikalık bir çalışma iskeleti kur. Biçim: dört kısa yönerge. Her yönerge çocuğun kendi eliyle yapacağı bir iş olsun. Kısıt: öğrenci adı, okul adı, sınıf ve not yazma. Teslim edilecek paragrafı yazma.»

Cevabı oku. Cevapta bir ad, bir okul veya bitmiş bir paragraf belirdiyse o satırı sil. İskeleti çocuğa ancak ondan sonra oku. Çocuk toplamı kendisi yazsın. Bu alıştırmanın notu yok. Amaç, dört parçanın çalışmayı çocuğun elinde bıraktığını kendi gözünle görmendir.

Sıradaki derste modelin eklediği uydurma cümleyi kaynağa soracaksın. Bu derste sınır durur. İstem, o sınırın içinde yazılır.
`,
};
